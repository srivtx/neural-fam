/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Analytical compute & memory engine for neural architecture synthesis.
 * Calculates exact parameter counts, KV-cache footprint, FLOPs per token,
 * arithmetic intensity, and GPU memory / roofline feasibility.
 */

import {
  Design,
  Workload,
  Layer,
  LayerKind,
  PRECISION_BYTES,
  GPUS,
  GpuSpec,
} from './model';

export interface ParamBreakdown {
  embeddings: number;
  unembedding: number;
  positional: number;
  blockTotal: number;
  blockPerLayer: { layerId: string; kind: string; stored: number; active: number }[];
  norms: number;
  totalStored: number;
  totalActive: number;
}

export interface MemoryBreakdown {
  weightsMB: number;
  kvCacheMB: number;
  ssmStateMB: number;
  activationsMB: number;
  totalInferenceMB: number;
  totalTrainingMB: number;
  fitsGpu: boolean;
  gpuVramMB: number;
  vramUsagePercent: number;
}

export interface ComputeMetrics {
  forwardFlopsPerToken: number;
  attentionFlopsPerToken: number;
  totalSequenceFlops: number;
  arithmeticIntensity: number; // FLOPs / Byte
  isMemoryBound: boolean;
  estimatedTokensPerSec: number;
  totalTrainingFlops: number;
  estimatedTrainingHours: number;
}

export interface ArchitectureLint {
  level: 'error' | 'warning' | 'info' | 'success';
  title: string;
  detail: string;
}

export interface StudioAnalysis {
  params: ParamBreakdown;
  memory: MemoryBreakdown;
  compute: ComputeMetrics;
  lints: ArchitectureLint[];
  gpu: GpuSpec;
}

export type Analysis = StudioAnalysis;

export function analyzeDesign(design: Design, workload: Workload): StudioAnalysis {
  const d = design.d;
  const precBytes = PRECISION_BYTES[workload.precision];
  const gpu = GPUS.find((g) => g.id === workload.gpu) || GPUS[3];
  const gpuVramMB = gpu.memGB * 1024;

  // 1. Embeddings & input / output projections
  let embeddings = 0;
  if (design.modality === 'text') {
    embeddings = design.vocab * d;
  } else if (design.inputDim > 0) {
    embeddings = design.inputDim * d;
  }

  let unembedding = 0;
  if (!design.tied) {
    if (design.modality === 'text') {
      unembedding = design.vocab * d;
    } else if (design.outputDim > 0) {
      unembedding = d * design.outputDim;
    }
  }

  let positional = 0;
  if (design.pos === 'learned' && design.maxLen > 0) {
    positional = design.maxLen * d;
  }

  // 2. Per-layer parameters
  let singleBlockStored = 0;
  let singleBlockActive = 0;
  let singleBlockAttnLayers = 0;
  let singleBlockKvHeads = 0;
  let singleBlockHeadDim = 64;
  let singleBlockSsmLayers = 0;
  let singleBlockSsmStateDim = 0;

  const blockPerLayer: { layerId: string; kind: string; stored: number; active: number }[] = [];

  for (const layer of design.block) {
    let stored = 0;
    let active = 0;

    switch (layer.kind) {
      case 'attention':
      case 'window_attention': {
        const heads = layer.heads || Math.max(1, Math.round(d / 64));
        const kvHeads = layer.kvHeads || heads;
        const headDim = Math.round(d / heads) || 64;
        singleBlockHeadDim = headDim;
        singleBlockAttnLayers += 1;
        singleBlockKvHeads += kvHeads;

        // Q: d x (heads * headDim)
        const qParams = d * (heads * headDim) + (design.bias ? heads * headDim : 0);
        // K, V: 2 x (d x (kvHeads * headDim))
        const kvParams = 2 * (d * (kvHeads * headDim) + (design.bias ? kvHeads * headDim : 0));
        // Out projection: (heads * headDim) x d
        const outParams = heads * headDim * d + (design.bias ? d : 0);

        stored = qParams + kvParams + outParams;
        active = stored;
        break;
      }

      case 'linear_attention': {
        const heads = layer.heads || Math.max(1, Math.round(d / 64));
        const headDim = Math.round(d / heads) || 64;
        // Q, K, V proj: 3 x (d x d) + Out: d x d
        stored = 4 * d * d + (design.bias ? 4 * d : 0);
        active = stored;
        break;
      }

      case 'ssm': {
        singleBlockSsmLayers += 1;
        const expand = layer.expand || 2;
        const dInner = expand * d;
        const dState = layer.dState || 16;
        const kernel = layer.kernel || 4;
        singleBlockSsmStateDim += dInner * dState;

        // Input proj (2 branches: x and gate): d x (2 * dInner)
        const inProj = d * (2 * dInner);
        // 1D depthwise conv: dInner * kernel
        const conv1d = dInner * kernel;
        // dt projection + B proj + C proj: dInner + 2 * (dInner x dState)
        const xProj = dInner * (1 + 2 * dState);
        // Out proj: dInner x d
        const outProj = dInner * d;

        stored = inProj + conv1d + xProj + outProj;
        active = stored;
        break;
      }

      case 'conv': {
        const kernel = layer.kernel || 7;
        if (layer.depthwise) {
          // Depthwise: d * kernel, Pointwise: d * d
          stored = d * kernel + d * d;
        } else {
          stored = d * d * kernel;
        }
        if (design.bias) stored += 2 * d;
        active = stored;
        break;
      }

      case 'gnn': {
        // Message projection + update projection: 2 * (d x d)
        stored = 2 * d * d + (design.bias ? 2 * d : 0);
        active = stored;
        break;
      }

      case 'mlp': {
        const hidden = layer.hidden || d * 4;
        // Up: d x hidden, Down: hidden x d
        stored = 2 * d * hidden + (design.bias ? hidden + d : 0);
        active = stored;
        break;
      }

      case 'swiglu': {
        const hidden = layer.hidden || Math.round((d * 8) / 3 / 64) * 64 || d * 2;
        // Gate: d x hidden, Up: d x hidden, Down: hidden x d (3 matrices)
        stored = 3 * d * hidden + (design.bias ? 2 * hidden + d : 0);
        active = stored;
        break;
      }

      case 'moe': {
        const hidden = layer.hidden || Math.round((d * 8) / 3 / 64) * 64 || d * 2;
        const experts = layer.experts || 8;
        const topK = layer.topK || 2;

        // Router: d x experts
        const router = d * experts;
        // Each expert is a SwiGLU: 3 x d x hidden
        const perExpert = 3 * d * hidden + (design.bias ? 2 * hidden + d : 0);

        stored = router + experts * perExpert;
        active = router + topK * perExpert;
        break;
      }
    }

    blockPerLayer.push({ layerId: layer.id, kind: layer.kind, stored, active });
    singleBlockStored += stored;
    singleBlockActive += active;
  }

  // Norm parameters per block
  const normsPerBlock = design.norm === 'none' ? 0 : design.block.length * (design.norm === 'layernorm' ? 2 * d : d);
  const blockTotal = design.depth * (singleBlockStored + normsPerBlock);
  const blockActiveTotal = design.depth * (singleBlockActive + normsPerBlock);

  // Final norm
  const finalNorm = design.norm === 'none' ? 0 : (design.norm === 'layernorm' ? 2 * d : d);
  const norms = design.depth * normsPerBlock + finalNorm;

  const totalStored = embeddings + unembedding + positional + blockTotal + finalNorm;
  const totalActive = embeddings + unembedding + positional + blockActiveTotal + finalNorm;

  const params: ParamBreakdown = {
    embeddings,
    unembedding,
    positional,
    blockTotal,
    blockPerLayer,
    norms,
    totalStored,
    totalActive,
  };

  // 3. Memory calculation
  const weightsBytes = totalStored * precBytes;
  const weightsMB = weightsBytes / (1024 * 1024);

  // KV Cache memory:
  // For each attention layer: 2 (K and V) * seqLen * batch * (kvHeads * headDim) * precBytes
  const totalAttnLayers = singleBlockAttnLayers * design.depth;
  const kvElementsPerToken = 2 * (singleBlockKvHeads * design.depth) * singleBlockHeadDim;
  const effectiveSeqLen = workload.seqLen;
  const kvCacheBytes = kvElementsPerToken * effectiveSeqLen * workload.batch * precBytes;
  const kvCacheMB = kvCacheBytes / (1024 * 1024);

  // SSM running state memory (constant with sequence length!)
  const totalSsmLayers = singleBlockSsmLayers * design.depth;
  const ssmStateBytes = workload.batch * singleBlockSsmStateDim * design.depth * precBytes;
  const ssmStateMB = ssmStateBytes / (1024 * 1024);

  // Activations footprint estimate (intermediate activations for forward pass or backprop)
  const layerActsPerTokenBytes = design.block.length * design.depth * d * 4 * precBytes;
  const activationsMB = (layerActsPerTokenBytes * effectiveSeqLen * workload.batch) / (1024 * 1024);

  const totalInferenceMB = weightsMB + kvCacheMB + ssmStateMB + activationsMB * 0.2;
  // Training needs: Weights + Gradients + Optimizer (Adam = 8 bytes/param) + Full Activations
  const totalTrainingMB = weightsMB * 4 + activationsMB * 1.5;

  const activeVramNeeded = workload.mode === 'inference' ? totalInferenceMB : totalTrainingMB;
  const fitsGpu = activeVramNeeded <= gpuVramMB;
  const vramUsagePercent = Math.min(100, Math.round((activeVramNeeded / gpuVramMB) * 100));

  const memory: MemoryBreakdown = {
    weightsMB,
    kvCacheMB,
    ssmStateMB,
    activationsMB,
    totalInferenceMB,
    totalTrainingMB,
    fitsGpu,
    gpuVramMB,
    vramUsagePercent,
  };

  // 4. Compute & FLOPs calculation
  // Matrix multiplications take 2 FLOPs per parameter per token
  const matmulFlopsPerToken = 2 * totalActive;

  // Attention QK and AV dot product FLOPs:
  // For each attention layer: 2 * (seqLen * d) for QK^T + 2 * (seqLen * d) for AV = 4 * seqLen * d
  const attentionFlopsPerToken = totalAttnLayers * 4 * effectiveSeqLen * d;
  const forwardFlopsPerToken = matmulFlopsPerToken + attentionFlopsPerToken;
  const totalSequenceFlops = forwardFlopsPerToken * effectiveSeqLen * workload.batch;

  // Arithmetic Intensity = FLOPs / (Memory Bytes transferred)
  // At inference batch=1, reading weights once: FLOPs / WeightsBytes
  const bytesReadPerToken = (totalActive * precBytes) + (kvElementsPerToken * precBytes);
  const arithmeticIntensity = bytesReadPerToken > 0 ? forwardFlopsPerToken / bytesReadPerToken : 1;

  // Roofline analysis:
  // Peak FLOP rate = gpu.tflops * 1e12
  // Peak bandwidth FLOP limit = gpu.bandwidthGBs * 1e9 * arithmeticIntensity
  const gpuPeakFlops = gpu.tflops * 1e12;
  const memoryBoundFlopLimit = (gpu.bandwidthGBs * 1e9) * arithmeticIntensity;
  const isMemoryBound = memoryBoundFlopLimit < gpuPeakFlops;

  const effectiveFlopsSec = Math.min(gpuPeakFlops, memoryBoundFlopLimit);
  const estimatedTokensPerSec = forwardFlopsPerToken > 0 ? Math.round(effectiveFlopsSec / forwardFlopsPerToken) : 0;

  // Training compute: 6 FLOPs per parameter per token (2 forward + 4 backward)
  const totalTrainingFlops = 6 * totalStored * workload.trainTokens;
  const clusterFlopsSec = gpuPeakFlops * 0.4; // 40% Model Flops Utilization (MFU) realistic target
  const trainingSeconds = clusterFlopsSec > 0 ? totalTrainingFlops / clusterFlopsSec : 0;
  const estimatedTrainingHours = Math.round((trainingSeconds / 3600) * 10) / 10;

  const compute: ComputeMetrics = {
    forwardFlopsPerToken,
    attentionFlopsPerToken,
    totalSequenceFlops,
    arithmeticIntensity: Math.round(arithmeticIntensity * 10) / 10,
    isMemoryBound,
    estimatedTokensPerSec,
    totalTrainingFlops,
    estimatedTrainingHours,
  };

  // 5. Linters & Design Rule Diagnostics
  const lints: ArchitectureLint[] = [];

  // VRAM feasibility
  if (!fitsGpu) {
    lints.push({
      level: 'error',
      title: 'Out of memory on target hardware',
      detail: `Requires ${Math.round(activeVramNeeded).toLocaleString()} MB VRAM, but ${gpu.name} only has ${Math.round(gpuVramMB).toLocaleString()} MB. Reduce sequence length, batch size, or layer depth.`,
    });
  } else if (vramUsagePercent > 85) {
    lints.push({
      level: 'warning',
      title: 'High VRAM pressure (>85%)',
      detail: `${vramUsagePercent}% of VRAM allocated. CUDA context and dynamic allocations may trigger out-of-memory under burst conditions.`,
    });
  } else {
    lints.push({
      level: 'success',
      title: 'Hardware memory feasible',
      detail: `Comfortably fits on ${gpu.name} (${vramUsagePercent}% allocated).`,
    });
  }

  // Attention vs SSM scaling
  if (totalAttnLayers > 0 && effectiveSeqLen >= 16384) {
    lints.push({
      level: 'warning',
      title: `Quadratic attention penalty at N = ${effectiveSeqLen.toLocaleString()}`,
      detail: `KV cache alone consumes ${Math.round(kvCacheMB).toLocaleString()} MB. Consider grouping queries (GQA), sliding window attention, or replacing middle layers with SSM / Mamba blocks.`,
    });
  }

  // Pure Conv receptive field warning
  const hasConv = design.block.some((l) => l.kind === 'conv');
  const hasGlobal = design.block.some((l) => l.kind === 'attention' || l.kind === 'ssm');
  if (hasConv && !hasGlobal && effectiveSeqLen > 1024) {
    lints.push({
      level: 'info',
      title: 'Finite receptive field',
      detail: `All layers are local convolutions without all-to-all attention or SSM recurrence. Receptive field does not span the full ${effectiveSeqLen.toLocaleString()} token sequence.`,
    });
  }

  // Missing residual path
  if (!design.residual && design.depth > 4) {
    lints.push({
      level: 'error',
      title: 'Vanishing gradient risk (no residual skip)',
      detail: `Depth = ${design.depth} without identity additions. Backpropagation gradients will degrade exponentially across layers.`,
    });
  }

  // Missing position encoding for attention
  if (totalAttnLayers > 0 && design.pos === 'none' && design.modality === 'text') {
    lints.push({
      level: 'warning',
      title: 'Permutation-invariant text processing',
      detail: 'Attention has no positional bias and pos is set to None. Words like "dog bites man" and "man bites dog" will produce identical representations.',
    });
  }

  // MoE routing
  const hasMoe = design.block.some((l) => l.kind === 'moe');
  if (hasMoe) {
    lints.push({
      level: 'info',
      title: 'Sparse compute active (MoE)',
      detail: `Only ${Math.round(totalActive / 1e6)}M active parameters run per token out of ${Math.round(totalStored / 1e6)}M total stored.`,
    });
  }

  // Head dimension check
  for (const layer of design.block) {
    if (layer.kind === 'attention' || layer.kind === 'window_attention') {
      const heads = layer.heads || Math.max(1, Math.round(d / 64));
      const headDim = d / heads;
      if (!Number.isInteger(headDim) || headDim % 8 !== 0) {
        lints.push({
          level: 'warning',
          title: `Non-optimal head dimension (${headDim})`,
          detail: `Model dimension ${d} divided by ${heads} heads yields ${headDim}. Tensor cores prefer multiples of 32 or 64 (e.g. 64, 128).`,
        });
        break;
      }
    }
  }

  return {
    params,
    memory,
    compute,
    lints,
    gpu,
  };
}

/**
 * Generates an end-to-end clean PyTorch module for the synthesized architecture.
 */
export function generatePyTorchModule(design: Design, workload: Workload): string {
  const d = design.d;
  const analysis = analyzeDesign(design, workload);

  const blockLayersCode = design.block
    .map((layer, idx) => {
      switch (layer.kind) {
        case 'attention': {
          const heads = layer.heads || Math.max(1, Math.round(d / 64));
          const kvHeads = layer.kvHeads || heads;
          return `        # Block layer ${idx}: Multi-Head Attention (heads=${heads}, kv_heads=${kvHeads})
        self.mixer_${idx} = nn.MultiheadAttention(embed_dim=${d}, num_heads=${heads}, batch_first=True)`;
        }
        case 'window_attention': {
          const heads = layer.heads || Math.max(1, Math.round(d / 64));
          const window = layer.window || 1024;
          return `        # Block layer ${idx}: Sliding-Window Attention (window=${window})
        self.mixer_${idx} = SlidingWindowAttention(d_model=${d}, n_heads=${heads}, window_size=${window})`;
        }
        case 'ssm': {
          const expand = layer.expand || 2;
          const dState = layer.dState || 16;
          return `        # Block layer ${idx}: Selective State Space (Mamba, d_state=${dState}, expand=${expand})
        self.mixer_${idx} = MambaBlock(d_model=${d}, d_state=${dState}, expand=${expand})`;
        }
        case 'conv': {
          const kernel = layer.kernel || 7;
          return `        # Block layer ${idx}: 1D Depthwise Conv (kernel=${kernel})
        self.mixer_${idx} = nn.Conv1d(in_channels=${d}, out_channels=${d}, kernel_size=${kernel}, padding=${Math.floor(kernel / 2)}, groups=${layer.depthwise ? d : 1})`;
        }
        case 'gnn': {
          return `        # Block layer ${idx}: Message Passing GNN Layer
        self.mixer_${idx} = GraphConvBlock(d_model=${d})`;
        }
        case 'mlp': {
          const hidden = layer.hidden || d * 4;
          return `        # Block layer ${idx}: Dense FFN (hidden=${hidden})
        self.ffn_${idx} = nn.Sequential(
            nn.Linear(${d}, ${hidden}, bias=${design.bias ? 'True' : 'False'}),
            nn.GELU(),
            nn.Linear(${hidden}, ${d}, bias=${design.bias ? 'True' : 'False'}),
        )`;
        }
        case 'swiglu': {
          const hidden = layer.hidden || Math.round((d * 8) / 3 / 64) * 64 || d * 2;
          return `        # Block layer ${idx}: SwiGLU Gated FFN (hidden=${hidden})
        self.ffn_${idx} = SwiGLU(d_model=${d}, hidden_dim=${hidden}, bias=${design.bias ? 'True' : 'False'})`;
        }
        case 'moe': {
          const hidden = layer.hidden || Math.round((d * 8) / 3 / 64) * 64 || d * 2;
          const experts = layer.experts || 8;
          const topK = layer.topK || 2;
          return `        # Block layer ${idx}: Sparse MoE (${topK} of ${experts} experts, hidden=${hidden})
        self.ffn_${idx} = SparseMoE(d_model=${d}, num_experts=${experts}, top_k=${topK}, hidden_dim=${hidden})`;
        }
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');

  const forwardBlockCalls = design.block
    .map((layer, idx) => {
      const isMixer = [
        'attention',
        'window_attention',
        'linear_attention',
        'ssm',
        'conv',
        'gnn',
      ].includes(layer.kind);
      const varName = isMixer ? `mixer_${idx}` : `ffn_${idx}`;

      let invocation = '';
      if (layer.kind === 'attention') {
        invocation = `            out, _ = self.${varName}(h, h, h)\n            h = h + out if ${design.residual ? 'True' : 'False'} else out`;
      } else if (layer.kind === 'conv') {
        invocation = `            out = self.${varName}(h.transpose(1, 2)).transpose(1, 2)\n            h = h + out if ${design.residual ? 'True' : 'False'} else out`;
      } else {
        invocation = `            out = self.${varName}(h)\n            h = h + out if ${design.residual ? 'True' : 'False'} else out`;
      }

      const normStep = design.norm !== 'none' ? `\n            h = self.norm_${idx}(h)` : '';
      return `${invocation}${normStep}`;
    })
    .join('\n\n');

  const normInit = design.norm !== 'none'
    ? design.block.map((_, idx) => `        self.norm_${idx} = ${design.norm === 'rmsnorm' ? `RMSNorm(${d})` : `nn.LayerNorm(${d})`}`).join('\n')
    : '        pass';

  return `"""
Architecture: ${design.name}
Synthesized from first principles in Neural Family Architecture Studio.
Stored parameters: ${(analysis.params.totalStored / 1e6).toFixed(2)}M
Active parameters: ${(analysis.params.totalActive / 1e6).toFixed(2)}M
Hardware target: ${analysis.gpu.name} (${analysis.memory.vramUsagePercent}% VRAM at N=${workload.seqLen})
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class RMSNorm(nn.Module):
    """Root Mean Square Layer Normalization."""
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.eps = eps
        self.weight = nn.Parameter(torch.ones(dim))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        variance = x.pow(2).mean(-1, keepdim=True)
        return x * torch.rsqrt(variance + self.eps) * self.weight

class SwiGLU(nn.Module):
    """Swish-Gated Linear Unit as used in LLaMA and PaLM."""
    def __init__(self, d_model: int, hidden_dim: int, bias: bool = False):
        super().__init__()
        self.gate = nn.Linear(d_model, hidden_dim, bias=bias)
        self.up = nn.Linear(d_model, hidden_dim, bias=bias)
        self.down = nn.Linear(hidden_dim, d_model, bias=bias)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.down(F.silu(self.gate(x)) * self.up(x))

class Block(nn.Module):
    """Single repeated block combining chosen routing and compute primitives."""
    def __init__(self, d_model: int = ${d}):
        super().__init__()
        self.d_model = d_model

${blockLayersCode}

        # Normalization layers
${normInit}

    def forward(self, h: torch.Tensor) -> torch.Tensor:
${forwardBlockCalls}
        return h

class ${design.name.replace(/[^a-zA-Z0-9]/g, '') || 'SynthesizedNetwork'}(nn.Module):
    """Full deep architecture with ${design.depth} sequential blocks."""
    def __init__(
        self,
        d_model: int = ${d},
        depth: int = ${design.depth},
        ${design.modality === 'text' ? `vocab_size: int = ${design.vocab},` : `input_dim: int = ${design.inputDim || d}, output_dim: int = ${design.outputDim || d},`}
    ):
        super().__init__()
        self.d_model = d_model
        self.depth = depth

        # 1. Embedding / Input Projection
${design.modality === 'text' ? `        self.embed = nn.Embedding(vocab_size, d_model)` : `        self.input_proj = nn.Linear(input_dim, d_model)`}
${design.pos === 'learned' ? `        self.pos_embed = nn.Parameter(torch.zeros(1, ${design.maxLen || 4096}, d_model))` : ''}

        # 2. Sequential Blocks
        self.blocks = nn.ModuleList([Block(d_model=d_model) for _ in range(depth)])
        self.final_norm = ${design.norm === 'rmsnorm' ? `RMSNorm(d_model)` : design.norm === 'layernorm' ? `nn.LayerNorm(d_model)` : `nn.Identity()`}

        # 3. Unembedding / Output Head
${design.modality === 'text' ? `        self.head = nn.Linear(d_model, vocab_size, bias=False)\n${design.tied ? '        self.head.weight = self.embed.weight  # Weight tying' : ''}` : `        self.head = nn.Linear(d_model, output_dim)`}

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Input shape: [batch_size, sequence_length]
${design.modality === 'text' ? `        h = self.embed(x)` : `        h = self.input_proj(x)`}
${design.pos === 'learned' ? `        seq_len = x.shape[1]\n        h = h + self.pos_embed[:, :seq_len, :]` : ''}

        for block in self.blocks:
            h = block(h)

        h = self.final_norm(h)
        return self.head(h)

# Quick verification test
if __name__ == "__main__":
    model = ${design.name.replace(/[^a-zA-Z0-9]/g, '') || 'SynthesizedNetwork'}()
    ${design.modality === 'text' ? `sample_input = torch.randint(0, ${design.vocab}, (2, min(128, ${workload.seqLen})))` : `sample_input = torch.randn(2, min(128, ${workload.seqLen}), ${design.inputDim || d})`}
    out = model(sample_input)
    print("Verification pass!")
    print(f"Input shape:  {sample_input.shape}")
    print(f"Output shape: {out.shape}")
`;
}

export interface TensorTraceStep {
  name: string;
  operation: string;
  shape: string;
  memoryMB: number;
  description: string;
  color?: string;
}

/**
 * Traces the step-by-step tensor dimensions and memory footprint
 * as an activation batch flows through a single repeated block.
 */
export function traceTensorPipeline(design: Design, workload: Workload): TensorTraceStep[] {
  const B = workload.batch;
  const N = workload.seqLen;
  const d = design.d;
  const precBytes = PRECISION_BYTES[workload.precision];

  const calcMB = (elements: number) => (elements * precBytes) / (1024 * 1024);

  const steps: TensorTraceStep[] = [
    {
      name: 'Input Batch',
      operation: 'Data ingestion',
      shape: `[${B}, ${N}, ${design.modality === 'text' ? 'Tokens' : design.inputDim || d}]`,
      memoryMB: Number(calcMB(B * N * (design.inputDim || d)).toFixed(2)),
      description: 'Raw sensory input stream entering the computation graph.',
      color: '#3346ff',
    },
    {
      name: 'Embedding Projection',
      operation: design.modality === 'text' ? 'Token lookup + Positional encoding' : 'Linear feature projection',
      shape: `[${B}, ${N}, ${d}]`,
      memoryMB: Number(calcMB(B * N * d).toFixed(2)),
      description: `Continuous ${d}-dimensional representation space for tokens.`,
      color: '#3346ff',
    },
  ];

  design.block.forEach((layer, idx) => {
    switch (layer.kind) {
      case 'attention':
      case 'window_attention': {
        const heads = layer.heads || Math.max(1, Math.round(d / 64));
        const headDim = Math.round(d / heads) || 64;
        const kvHeads = layer.kvHeads || heads;

        steps.push({
          name: `Layer ${idx + 1}: Q, K, V Projections`,
          operation: `Linear projection to ${heads} Q heads and ${kvHeads} KV heads`,
          shape: `Q: [${B}, ${heads}, ${N}, ${headDim}] · KV: [${B}, ${kvHeads}, ${N}, ${headDim}]`,
          memoryMB: Number(calcMB(B * (heads + 2 * kvHeads) * N * headDim).toFixed(2)),
          description: `Splits the ${d} channels into multi-head subspace subspaces.`,
          color: '#ff3b6b',
        });

        steps.push({
          name: `Layer ${idx + 1}: Softmax Dot-Product Heatmap`,
          operation: 'Softmax(QKᵀ / √d_k)',
          shape: `[${B}, ${heads}, ${N}, ${N}]`,
          memoryMB: Number(calcMB(B * heads * N * N).toFixed(2)),
          description: `Pairwise cross-attention routing matrix comparing every token with every other.`,
          color: '#ff3b6b',
        });

        steps.push({
          name: `Layer ${idx + 1}: Value Aggregation & Out Projection`,
          operation: 'Attention · V @ W_out',
          shape: `[${B}, ${N}, ${d}]`,
          memoryMB: Number(calcMB(B * N * d).toFixed(2)),
          description: 'Linearly recombines multi-head outputs back into the model dimension.',
          color: '#ff3b6b',
        });
        break;
      }

      case 'ssm': {
        const expand = layer.expand || 2;
        const dInner = expand * d;
        const dState = layer.dState || 16;

        steps.push({
          name: `Layer ${idx + 1}: SSM Input Expand & 1D Conv`,
          operation: `Expand by ${expand}x + Depthwise 1D conv`,
          shape: `[${B}, ${N}, ${dInner}]`,
          memoryMB: Number(calcMB(B * N * dInner).toFixed(2)),
          description: `Expands hidden dimension to ${dInner} and mixes local consecutive frames.`,
          color: '#8b5cf6',
        });

        steps.push({
          name: `Layer ${idx + 1}: Selective Recurrent State`,
          operation: 'Continuous ODE hidden state recurrence',
          shape: `Running state: [${B}, ${dInner}, ${dState}]`,
          memoryMB: Number(calcMB(B * dInner * dState).toFixed(2)),
          description: `Constant O(1) state memory independent of context length N.`,
          color: '#8b5cf6',
        });

        steps.push({
          name: `Layer ${idx + 1}: SSM Projection to Dimension`,
          operation: 'Gated linear projection @ W_out',
          shape: `[${B}, ${N}, ${d}]`,
          memoryMB: Number(calcMB(B * N * d).toFixed(2)),
          description: `Projects filtered state back down to model dimension ${d}.`,
          color: '#8b5cf6',
        });
        break;
      }

      case 'conv': {
        const kernel = layer.kernel || 7;
        steps.push({
          name: `Layer ${idx + 1}: Spatial Convolution`,
          operation: `1D Kernel ${kernel} sliding window`,
          shape: `[${B}, ${N}, ${d}]`,
          memoryMB: Number(calcMB(B * N * d).toFixed(2)),
          description: `Translation-invariant sliding filter over neighboring coordinates.`,
          color: '#00a86b',
        });
        break;
      }

      case 'swiglu':
      case 'mlp': {
        const hidden = layer.hidden || d * 4;
        steps.push({
          name: `Layer ${idx + 1}: Feedforward Expand (${layer.kind === 'swiglu' ? 'SwiGLU' : 'GELU'})`,
          operation: `Channel expansion to ${hidden} dimensions`,
          shape: `[${B}, ${N}, ${hidden}]`,
          memoryMB: Number(calcMB(B * N * hidden).toFixed(2)),
          description: `Per-position non-linear expansion into higher-dimensional manifold.`,
          color: '#4f6bff',
        });

        steps.push({
          name: `Layer ${idx + 1}: Feedforward Projection`,
          operation: `Linear projection down to ${d}`,
          shape: `[${B}, ${N}, ${d}]`,
          memoryMB: Number(calcMB(B * N * d).toFixed(2)),
          description: `Compresses feature representations back to model width.`,
          color: '#4f6bff',
        });
        break;
      }

      case 'moe': {
        const experts = layer.experts || 8;
        const topK = layer.topK || 2;
        const hidden = layer.hidden || d * 2;

        steps.push({
          name: `Layer ${idx + 1}: Router Softmax Gating`,
          operation: `Gating router across ${experts} experts`,
          shape: `Logits: [${B}, ${N}, ${experts}] · Top-${topK}: [${B}, ${N}, ${topK}]`,
          memoryMB: Number(calcMB(B * N * experts).toFixed(2)),
          description: `Evaluates input tokens and routes dynamically to the ${topK} most relevant experts.`,
          color: '#ffb800',
        });

        steps.push({
          name: `Layer ${idx + 1}: Sparse Expert Compute`,
          operation: `Evaluates only ${topK} active expert networks per token`,
          shape: `[${B}, ${N}, ${topK}, ${hidden}]`,
          memoryMB: Number(calcMB(B * N * topK * hidden).toFixed(2)),
          description: `Executes high-capacity sub-networks while sparing compute bandwidth.`,
          color: '#ffb800',
        });
        break;
      }

      case 'gnn': {
        steps.push({
          name: `Layer ${idx + 1}: Neighborhood Message Aggregation`,
          operation: 'Permutation-invariant graph summation',
          shape: `[${B}, ${N}, ${d}]`,
          memoryMB: Number(calcMB(B * N * d).toFixed(2)),
          description: 'Nodes collect and aggregate vector embeddings from adjacent topological edges.',
          color: '#00b8d9',
        });
        break;
      }
    }

    if (design.residual) {
      steps.push({
        name: `Layer ${idx + 1}: Residual Highway Addition`,
        operation: 'y = identity + F(x)',
        shape: `[${B}, ${N}, ${d}]`,
        memoryMB: Number(calcMB(B * N * d).toFixed(2)),
        description: 'Additive identity connection guaranteeing uninhibited backward gradient flow.',
        color: '#22c55e',
      });
    }
  });

  steps.push({
    name: 'Final Layer Normalization',
    operation: design.norm === 'rmsnorm' ? 'RMSNorm' : 'LayerNorm',
    shape: `[${B}, ${N}, ${d}]`,
    memoryMB: Number(calcMB(B * N * d).toFixed(2)),
    description: 'Stabilizes output vector variance before prediction head.',
    color: '#3346ff',
  });

  return steps;
}

export interface TrainingEconomics {
  parametersM: number;
  chinchillaTokensB: number;
  totalFlopsZetta: number;
  h100GpusNeeded: number;
  a100GpusNeeded: number;
  estimatedCostH100USD: number;
  estimatedCostA100USD: number;
  inferenceCostPerMillionTokensUSD: number;
}

/**
 * Calculates training compute economics and hardware cluster sizing
 * using Chinchilla scaling laws (Hoffmann et al., 2022).
 */
export function calculateTrainingEconomics(
  design: Design,
  workload: Workload,
  targetDays: number = 14
): TrainingEconomics {
  const analysis = analyzeDesign(design, workload);
  const P = analysis.params.totalStored;
  const parametersM = Number((P / 1e6).toFixed(1));

  // Chinchilla optimal compute allocation: D ≈ 20 * P tokens
  const chinchillaTokens = 20 * P;
  const chinchillaTokensB = Number((chinchillaTokens / 1e9).toFixed(2));

  // Training compute in FLOPs: 6 * P * D
  const totalFlops = 6 * P * chinchillaTokens;
  const totalFlopsZetta = Number((totalFlops / 1e21).toFixed(3)); // 1 ZettaFLOP = 1e21

  const targetSeconds = targetDays * 24 * 3600;
  const realisticMFU = 0.40; // 40% Model Flops Utilization is standard frontier efficiency

  // H100 SXM5: 989 TFLOPS BF16
  const h100EffectiveFlops = 989e12 * realisticMFU;
  const h100GpusNeeded = Math.max(1, Math.ceil(totalFlops / (h100EffectiveFlops * targetSeconds)));

  // A100 80GB SXM: 312 TFLOPS BF16
  const a100EffectiveFlops = 312e12 * realisticMFU;
  const a100GpusNeeded = Math.max(1, Math.ceil(totalFlops / (a100EffectiveFlops * targetSeconds)));

  // Cloud market pricing: ~$3.00 / GPU-hour for H100, ~$1.80 for A100
  const h100Hours = h100GpusNeeded * (targetDays * 24);
  const estimatedCostH100USD = Math.round(h100Hours * 3.0);

  const a100Hours = a100GpusNeeded * (targetDays * 24);
  const estimatedCostA100USD = Math.round(a100Hours * 1.8);

  // Inference cost per 1M output tokens (assuming single GPU node serving at $3/hr)
  const tokensPerSec = Math.max(1, analysis.compute.estimatedTokensPerSec);
  const hoursPerMillionTokens = 1e6 / (tokensPerSec * 3600);
  const inferenceCostPerMillionTokensUSD = Number((hoursPerMillionTokens * 3.0).toFixed(4));

  return {
    parametersM,
    chinchillaTokensB,
    totalFlopsZetta,
    h100GpusNeeded,
    a100GpusNeeded,
    estimatedCostH100USD,
    estimatedCostA100USD,
    inferenceCostPerMillionTokensUSD,
  };
}

/**
 * Generates an idiomatic JAX / Flax module for the synthesized architecture.
 */
export function generateJaxModule(design: Design, _workload: Workload): string {
  const d = design.d;
  return `"""
Architecture: ${design.name} (JAX / Flax Implementation)
Synthesized in Neural Family Architecture Studio
"""

import jax
import jax.numpy as jnp
from flax import linen as nn

class RMSNorm(nn.Module):
    dim: int
    eps: float = 1e-6

    @nn.compact
    def __call__(self, x):
        scale = self.param('scale', nn.initializers.ones, (self.dim,))
        variance = jnp.mean(jnp.square(x), axis=-1, keepdims=True)
        return x * jax.lax.rsqrt(variance + self.eps) * scale

class Block(nn.Module):
    d_model: int = ${d}

    @nn.compact
    def __call__(self, x):
        h = x
        # 1. Information Routing Layer
        routed = nn.Dense(self.d_model)(h)
        ${design.residual ? 'h = h + routed' : 'h = routed'}
        ${design.norm === 'rmsnorm' ? 'h = RMSNorm(dim=self.d_model)(h)' : design.norm === 'layernorm' ? 'h = nn.LayerNorm()(h)' : ''}

        # 2. Feedforward Compute Layer
        ffn = nn.Dense(self.d_model * 4)(h)
        ffn = nn.silu(ffn)
        ffn = nn.Dense(self.d_model)(ffn)
        ${design.residual ? 'h = h + ffn' : 'h = ffn'}
        ${design.norm === 'rmsnorm' ? 'h = RMSNorm(dim=self.d_model)(h)' : design.norm === 'layernorm' ? 'h = nn.LayerNorm()(h)' : ''}

        return h

class ${design.name.replace(/[^a-zA-Z0-9]/g, '') || 'SynthesizedNetwork'}(nn.Module):
    d_model: int = ${d}
    depth: int = ${design.depth}
    vocab_size: int = ${design.vocab || 32000}

    @nn.compact
    def __call__(self, tokens):
        # tokens shape: (batch_size, sequence_length)
        h = nn.Embed(num_embeddings=self.vocab_size, features=self.d_model)(tokens)

        for _ in range(self.depth):
            h = Block(d_model=self.d_model)(h)

        h = ${design.norm === 'rmsnorm' ? 'RMSNorm(dim=self.d_model)(h)' : 'nn.LayerNorm()(h)'}
        logits = nn.Dense(self.vocab_size, use_bias=False)(h)
        return logits
`;
}

/**
 * Generates a HuggingFace-compatible config.json string.
 */
export function generateHuggingFaceConfig(design: Design, workload: Workload): string {
  const analysis = analyzeDesign(design, workload);
  const config = {
    model_type: "neural_family_hybrid",
    architectures: [design.name.replace(/[^a-zA-Z0-9]/g, '') || 'SynthesizedNetwork'],
    hidden_size: design.d,
    num_hidden_layers: design.depth,
    num_attention_heads: design.block.find(b => b.kind === 'attention')?.heads || Math.max(1, Math.round(design.d / 64)),
    num_key_value_heads: design.block.find(b => b.kind === 'attention')?.kvHeads || Math.max(1, Math.round(design.d / 64)),
    max_position_embeddings: design.maxLen || workload.seqLen,
    vocab_size: design.vocab || 32000,
    normalization_layer: design.norm,
    positional_embedding_type: design.pos,
    use_residual_highway: design.residual,
    layer_types: design.block.map(b => b.kind),
    active_parameters: analysis.params.totalActive,
    total_parameters: analysis.params.totalStored,
    torch_dtype: workload.precision === 'fp32' ? 'float32' : 'bfloat16',
    transformers_version: "4.44.0"
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Generates Mermaid diagram code visualizing the repeated block.
 */
export function generateMermaidDiagram(design: Design): string {
  const nodes: string[] = [];
  nodes.push('graph TD');
  nodes.push('  Input(["Input Tensor [B, N, d]"]) --> Skip0{"Residual Anchor"}');
  nodes.push('  Input --> Layer0["1. ' + (design.block[0]?.kind.toUpperCase() || 'MIXER') + '"]');

  design.block.forEach((layer, i) => {
    if (i > 0) {
      nodes.push(`  Layer${i - 1} --> Layer${i}["${i + 1}. ${layer.kind.toUpperCase()}"]`);
    }
  });

  const lastIdx = design.block.length - 1;
  if (design.residual) {
    nodes.push(`  Layer${lastIdx} --> Add((+))`);
    nodes.push(`  Skip0 -->|Identity Highway| Add`);
    nodes.push(`  Add --> Norm["${design.norm.toUpperCase()} Normalization"]`);
  } else {
    nodes.push(`  Layer${lastIdx} --> Norm["${design.norm.toUpperCase()} Normalization"]`);
  }

  nodes.push('  Norm --> Output(["Output Representation [B, N, d]"])');
  return nodes.join('\n');
}

/**
 * Encodes a Design and Workload into a compact URL-safe base64 string.
 */
export function encodeDesignToHash(design: Design, workload: Workload): string {
  try {
    const payload = JSON.stringify({ d: design, w: workload });
    return btoa(encodeURIComponent(payload));
  } catch {
    return '';
  }
}

/**
 * Decodes a Design and Workload from a URL-safe base64 string.
 */
export function decodeDesignFromHash(hash: string): { design: Design; workload?: Workload } | null {
  try {
    const decoded = decodeURIComponent(atob(hash));
    const parsed = JSON.parse(decoded);
    if (parsed && parsed.d) {
      return { design: parsed.d, workload: parsed.w };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generates compilable LaTeX TikZ diagram code formatted for publication papers.
 */
export function generateTikZDiagram(design: Design, analysis: Analysis): string {
  const layerNodes: string[] = [];
  const connections: string[] = [];

  layerNodes.push(`    \\node[tensor] (input) {Input Tensor $\\mathbf{X} \\in \\mathbb{R}^{B \\times N \\times ${design.d}}$};`);

  let prevNode = 'input';

  design.block.forEach((layer, idx) => {
    const nodeName = `layer${idx}`;
    let style = 'block';
    let label = `${idx + 1}. ${layer.kind.toUpperCase()}`;

    if (layer.kind === 'attention') {
      style = 'attn';
      label = `${idx + 1}. Multi-Head Attention (${layer.heads}H, ${layer.kvHeads}KV)`;
    } else if (layer.kind === 'ssm') {
      style = 'ssm';
      label = `${idx + 1}. Selective State Space (Mamba, d=${layer.dState || 16})`;
    } else if (layer.kind === 'conv') {
      style = 'conv';
      label = `${idx + 1}. Conv1D (k=${layer.kernel || 3})`;
    } else if (layer.kind === 'swiglu' || layer.kind === 'mlp') {
      style = 'mlp';
      label = `${idx + 1}. ${layer.kind.toUpperCase()} (d_{ff}=${layer.hidden || design.d * 4})`;
    } else if (layer.kind === 'moe') {
      style = 'moe';
      label = `${idx + 1}. MoE (${layer.experts} Experts, Top-${layer.topK || 2})`;
    }

    layerNodes.push(`    \\node[${style}, below=0.8cm of ${prevNode}] (${nodeName}) {${label}};`);
    connections.push(`    \\draw[arrow] (${prevNode}) -- (${nodeName});`);
    prevNode = nodeName;

    if (design.norm !== 'none') {
      const normNode = `norm${idx}`;
      layerNodes.push(`    \\node[norm, below=0.5cm of ${nodeName}] (${normNode}) {${design.norm === 'rmsnorm' ? 'RMSNorm' : 'LayerNorm'} ($d=${design.d}$)};`);
      connections.push(`    \\draw[arrow] (${nodeName}) -- (${normNode});`);
      prevNode = normNode;
    }
  });

  // Final Add & Output
  if (design.residual) {
    layerNodes.push(`    \\node[add, below=0.8cm of ${prevNode}] (add) {$+$};`);
    connections.push(`    \\draw[arrow] (${prevNode}) -- (add);`);
    connections.push(`    \\draw[skip] (input.east) to[out=0, in=0, looseness=1.5] node[right, font=\\scriptsize] {Identity Highway} (add.east);`);
    layerNodes.push(`    \\node[tensor, below=0.8cm of add] (output) {Output $\\mathbf{H} \\in \\mathbb{R}^{B \\times N \\times ${design.d}}$};`);
    connections.push(`    \\draw[arrow] (add) -- (output);`);
  } else {
    layerNodes.push(`    \\node[tensor, below=0.8cm of ${prevNode}] (output) {Output $\\mathbf{H} \\in \\mathbb{R}^{B \\times N \\times ${design.d}}$};`);
    connections.push(`    \\draw[arrow] (${prevNode}) -- (output);`);
  }

  return `% ============================================================================
% ARCHITECTURE TIKZ DIAGRAM: ${design.name}
% Generated by Neural Family Architecture Synthesis Studio
% Parameters: ${(analysis.params.totalStored / 1e6).toFixed(2)}M · Dimension: ${design.d} · Depth: ${design.depth}
% Compile with pdflatex or lualatex (Requires TikZ package)
% ============================================================================

\\documentclass[border=12pt]{standalone}
\\usepackage{tikz}
\\usetikzlibrary{shapes.geometric, arrows.meta, positioning, calc}

\\definecolor{attncolor}{RGB}{244, 63, 94}
\\definecolor{mlpcolor}{RGB}{59, 130, 246}
\\definecolor{ssmcolor}{RGB}{245, 158, 11}
\\definecolor{convcolor}{RGB}{16, 185, 129}
\\definecolor{moecolor}{RGB}{168, 85, 247}
\\definecolor{normcolor}{RGB}{100, 116, 139}

\\begin{document}
\\begin{tikzpicture}[
    node distance=0.8cm and 2.0cm,
    tensor/.style={rectangle, rounded corners=4pt, draw=black!70, fill=black!5, thick, minimum width=4.0cm, minimum height=0.7cm, align=center, font=\\small\\sffamily},
    block/.style={rectangle, rounded corners=6pt, draw=black!80, fill=white, line width=1pt, minimum width=4.5cm, minimum height=0.85cm, align=center, font=\\small\\sffamily\\bfseries},
    attn/.style={block, draw=attncolor!90, fill=attncolor!10, text=attncolor!90},
    mlp/.style={block, draw=mlpcolor!90, fill=mlpcolor!10, text=mlpcolor!90},
    ssm/.style={block, draw=ssmcolor!90, fill=ssmcolor!10, text=ssmcolor!90},
    conv/.style={block, draw=convcolor!90, fill=convcolor!10, text=convcolor!90},
    moe/.style={block, draw=moecolor!90, fill=moecolor!10, text=moecolor!90},
    norm/.style={rectangle, rounded corners=4pt, draw=normcolor!80, fill=normcolor!15, thick, minimum width=3.6cm, minimum height=0.6cm, align=center, font=\\footnotesize\\sffamily},
    add/.style={circle, draw=black!80, fill=black!10, thick, minimum size=0.65cm, align=center, font=\\bfseries},
    arrow/.style={-{Latex[length=2.5mm, width=1.5mm]}, thick, draw=black!80},
    skip/.style={-{Latex[length=2.5mm, width=1.5mm]}, thick, dashed, draw=blue!70}
]

${layerNodes.join('\n')}

${connections.join('\n')}

\\end{tikzpicture}
\\end{document}
`;
}

/**
 * Generates formal mathematical LaTeX specifications for paper methodology sections.
 */
export function generateLatexSpecification(design: Design, analysis: Analysis): string {
  const d = design.d;
  const layersMath = design.block
    .map((l, i) => {
      if (l.kind === 'attention') {
        return `\\subsection{Layer ${i + 1}: Multi-Head Attention}
Given hidden representation $\\mathbf{H} \\in \\mathbb{R}^{N \\times ${d}}$, multi-head attention computes:
\\begin{equation}
\\mathbf{Q} = \\mathbf{H}\\mathbf{W}_Q, \\quad \\mathbf{K} = \\mathbf{H}\\mathbf{W}_K, \\quad \\mathbf{V} = \\mathbf{H}\\mathbf{W}_V
\\end{equation}
\\begin{equation}
\\text{Attn}(\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}) = \\text{Softmax}\\left(\\frac{\\mathbf{Q}\\mathbf{K}^T}{\\sqrt{d_k}}\\right)\\mathbf{V}
\\end{equation}
where $H = ${l.heads || 8}$ query heads and $H_{kv} = ${l.kvHeads || l.heads || 8}$ key-value heads with head dimension $d_k = ${Math.floor(d / (l.heads || 8))}$.`;
      }
      if (l.kind === 'swiglu') {
        const ffDim = l.hidden || d * 4;
        return `\\subsection{Layer ${i + 1}: SwiGLU Feed-Forward Network}
The Swish-Gated Linear Unit maps representation $\\mathbf{H}$ across intermediate dimension $d_{ff} = ${ffDim}$:
\\begin{equation}
\\text{SwiGLU}(\\mathbf{H}) = \\left( \\text{SiLU}(\\mathbf{H}\\mathbf{W}_{gate}) \\odot (\\mathbf{H}\\mathbf{W}_{up}) \\right) \\mathbf{W}_{down}
\\end{equation}
where $\\mathbf{W}_{gate}, \\mathbf{W}_{up} \\in \\mathbb{R}^{${d} \\times ${ffDim}}$ and $\\mathbf{W}_{down} \\in \\mathbb{R}^{${ffDim} \\times ${d}}$.`;
      }
      if (l.kind === 'ssm') {
        return `\\subsection{Layer ${i + 1}: Selective State Space (Mamba)}
The selective continuous-time state space model parameters are dynamically parameterized by input $\\mathbf{x}_t$:
\\begin{equation}
\\mathbf{h}_t = \\bar{\\mathbf{A}}_t \\mathbf{h}_{t-1} + \\bar{\\mathbf{B}}_t \\mathbf{x}_t, \\quad \\mathbf{y}_t = \\mathbf{C}_t \\mathbf{h}_t
\\end{equation}
\\begin{equation}
\\bar{\\mathbf{A}}_t = \\exp(\\Delta_t \\mathbf{A}), \\quad \\bar{\\mathbf{B}}_t = (\\Delta_t \\mathbf{A})^{-1}(\\exp(\\Delta_t \\mathbf{A}) - \\mathbf{I}) \\cdot \\Delta_t \\mathbf{B}_t
\\end{equation}
with latent state expansion $N_{state} = ${l.dState || 16}$.`;
      }
      if (l.kind === 'moe') {
        return `\\subsection{Layer ${i + 1}: Sparse Mixture of Experts}
With $E = ${l.experts || 8}$ routed experts and top-$k = ${l.topK || 2}$ activation:
\\begin{equation}
\\mathbf{y} = \\sum_{i \\in \\text{Top-}k(G(\\mathbf{x}))} g_i(\\mathbf{x}) \\text{FFN}_i(\\mathbf{x}), \\quad G(\\mathbf{x}) = \\text{Softmax}(\\text{KeepTopK}(\\mathbf{x}\\mathbf{W}_g, k))
\\end{equation}`;
      }
      return `\\subsection{Layer ${i + 1}: ${l.kind.toUpperCase()}}
Computes affine transformation followed by non-linear mapping on $\\mathbb{R}^{${d}}$.`;
    })
    .join('\n\n');

  return `% ============================================================================
% LATEX METHODOLOGY SPECIFICATION: ${design.name}
% Generated by Neural Family Architecture Synthesis Studio
% ============================================================================

\\section{Architectural Specification: ${design.name}}

\\subsection{Global Architectural Topology}
The model consists of $L = ${design.depth}$ identical repeated blocks with latent embedding dimension $d = ${d}$. 
The total parameter count is ${(analysis.params.totalStored / 1e6).toFixed(2)}$M stored parameters (${(analysis.params.totalActive / 1e6).toFixed(2)}M active per token).

\\begin{table}[h]
\\centering
\\begin{tabular}{llr}
\\hline
\\textbf{Hyperparameter} & \\textbf{Symbol} & \\textbf{Value} \\\\
\\hline
Model Dimension & $d$ & ${d} \\\\
Block Depth & $L$ & ${design.depth} \\\\
Normalization & -- & ${design.norm.toUpperCase()} \\\\
Position Encoding & -- & ${design.pos.toUpperCase()} \\\\
Residual Connections & -- & ${design.residual ? 'Enabled ($y = x + F(x)$)' : 'Disabled'} \\\\
Stored Parameters & $N_{stored}$ & ${(analysis.params.totalStored / 1e6).toFixed(2)}M \\\\
FLOPs per Token (Inference) & $\\text{FLOPs}_{inf}$ & ${(analysis.compute.forwardFlopsPerToken / 1e6).toFixed(2)}M \\\\
\\hline
\\end{tabular}
\\caption{Structural hyperparameter specification for ${design.name}.}
\\label{tab:arch_specs}
\\end{table}

\\subsection{Governing Block Dynamics}
For layer block $l \\in \\{1, \\dots, L\\}$, the state update with residual bypass and normalization is:
\\begin{equation}
\\mathbf{h}_l = ${design.norm !== 'none' ? `\\text{${design.norm.toUpperCase()}}\\left(` : ''}${design.residual ? '\\mathbf{h}_{l-1} + ' : ''}\\mathcal{F}_l(\\mathbf{h}_{l-1})${design.norm !== 'none' ? `\\right)` : ''}
\\end{equation}

${layersMath}
`;
}

/**
 * Generates a clean BibTeX citation stack based on the components present in the design.
 */
export function generateBibtexBibliography(design: Design): string {
  const bibs: string[] = [];

  const hasKind = (k: LayerKind) => design.block.some((l) => l.kind === k);

  if (hasKind('attention')) {
    bibs.push(`@article{vaswani2017attention,
  title={Attention is all you need},
  author={Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob and Jones, Llion and Gomez, Aidan N and Kaiser, {\\L}ukasz and Polosukhin, Illia},
  journal={Advances in neural information processing systems},
  volume={30},
  year={2017}
}`);
  }

  if (hasKind('ssm')) {
    bibs.push(`@article{gu2023mamba,
  title={Mamba: Linear-time sequence modeling with selective state spaces},
  author={Gu, Albert and Dao, Tri},
  journal={arXiv preprint arXiv:2312.00752},
  year={2023}
}`);
  }

  if (hasKind('swiglu')) {
    bibs.push(`@article{shazeer2020glu,
  title={GLU variants improve transformer},
  author={Shazeer, Noam},
  journal={arXiv preprint arXiv:2002.05202},
  year={2020}
}`);
  }

  if (hasKind('moe')) {
    bibs.push(`@article{shazeer2017outrageously,
  title={Outrageously large neural networks: The sparsely-gated mixture-of-experts layer},
  author={Shazeer, Noam and Mirhoseini, Azalia and Maziarz, Krzysztof and Davis, Andy and Le, Quoc and Hinton, Geoffrey and Dean, Jeff},
  journal={arXiv preprint arXiv:1701.06538},
  year={2017}
}`);
  }

  if (design.residual) {
    bibs.push(`@inproceedings{he2016deep,
  title={Deep residual learning for image recognition},
  author={He, Kaiming and Zhang, Xiangyu and Ren, Shaoqing and Sun, Jian},
  booktitle={Proceedings of the IEEE conference on computer vision and pattern recognition},
  pages={770--778},
  year={2016}
}`);
  }

  if (design.pos === 'rope') {
    bibs.push(`@article{su2024roformer,
  title={Roformer: Enhanced transformer with rotary position embedding},
  author={Su, Jianlin and Ahmed, Murtadha and Lu, Yu and Pan, Shengfeng and Bo, Wen and Liu, Yunfeng},
  journal={Neurocomputing},
  volume={568},
  pages={127063},
  year={2024}
}`);
  }

  return bibs.join('\n\n');
}


