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
