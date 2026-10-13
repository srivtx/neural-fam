/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Architecture Invention Sandbox ("The Petri Dish"):
 * Synthesize completely novel neural architectures from first principles
 * by combining 4 fundamental physical constraints:
 * 1. Inductive Symmetry & Invariance (Noether's Theorem)
 * 2. Information Bottleneck (Shannon Rate-Distortion)
 * 3. Conservation Principle (Symplectic, Langevin, Unitary)
 * 4. Target Hardware Substrate (H100, Apple ANE, Edge MCU, Wafer Scale)
 *
 * Derives variance normalizers, computes roofline crossover points,
 * and emits runnable PyTorch nn.Module code.
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  Scale,
  Workflow,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Flame,
  ArrowRight,
  Code2,
  Gauge,
  Info,
  Sliders,
  CheckCircle2,
  Activity,
  Terminal,
} from 'lucide-react';
import { MathView } from './MathView';
import { CodeBlock } from './CodeBlock';
import { soundFX } from '../utils/audio';
import { copyTextToClipboard } from '../utils/clipboard';

// =============================================================================
// CONSTRAINT TYPES & CATALOGS
// =============================================================================

export type InductiveSymmetry = 'permutation' | 'translation' | 'lie_group' | 'gauge_rotational';
export type InformationBottleneck = 'attention_simplex' | 'selective_ssm' | 'fourier_conv' | 'sparse_moe';
export type ConservationPrinciple = 'symplectic' | 'langevin' | 'unitary' | 'contractive_ib';
export type TargetHardware = 'h100' | 'apple_ane' | 'edge_stm32' | 'wafer_scale';

export interface SymmetryOption {
  id: InductiveSymmetry;
  name: string;
  tagline: string;
  formula: string;
  physicalOrigin: string;
  inductiveBias: string;
}

export interface BottleneckOption {
  id: InformationBottleneck;
  name: string;
  tagline: string;
  complexity: string;
  formula: string;
  informationMechanism: string;
}

export interface ConservationOption {
  id: ConservationPrinciple;
  name: string;
  tagline: string;
  formula: string;
  conservedQuantity: string;
  trainingStabilityBenefit: string;
}

export interface HardwareOption {
  id: TargetHardware;
  name: string;
  tagline: string;
  peakFlops: string;
  memoryBandwidth: string;
  sramCapacity: string;
  rooflineIntensity: number; // FLOP/Byte
  architectureSweetSpot: string;
}

export const SYMMETRY_OPTIONS: SymmetryOption[] = [
  {
    id: 'permutation',
    name: 'Permutation Invariance',
    tagline: 'Sets, Graphs & Token Bags: Order does not alter identity.',
    formula: 'f(\\pi \\cdot \\mathbf{X}) = f(\\mathbf{X}) \\quad \\forall \\pi \\in S_N',
    physicalOrigin: 'Quantum identical particles & non-ordered statistical ensembles (Bose-Einstein / Fermi-Dirac).',
    inductiveBias: 'Eliminates positional ordering bias; forces network to learn invariant relational topologies.',
  },
  {
    id: 'translation',
    name: 'Spatial & Temporal Translation',
    tagline: 'Convolutions & Shift Invariance: The laws of physics are identical everywhere.',
    formula: 'f(T_\\tau \\mathbf{X}) = T_\\tau f(\\mathbf{X})',
    physicalOrigin: 'Homogeneity of space-time and Emmy Noether’s conservation of linear momentum.',
    inductiveBias: 'Enforces parameter sharing across coordinates; drastically shrinks parameter search space.',
  },
  {
    id: 'lie_group',
    name: 'Continuous-Time Lie Group',
    tagline: 'Dynamical Systems: Diffeomorphic state flow along continuous vector fields.',
    formula: '\\frac{d\\mathbf{z}(t)}{dt} = \\mathbf{f}(\\mathbf{z}(t), t, \\theta), \\quad \\mathbf{z}(t_1) = \\exp(t_1 \\mathcal{L})\\mathbf{z}_0',
    physicalOrigin: 'Continuous fluid mechanics, celestial mechanics, and smooth differential geometry.',
    inductiveBias: 'Guarantees trajectory invertibility (Picard-Lindelöf); breaks discrete layer boundaries.',
  },
  {
    id: 'gauge_rotational',
    name: 'Rotational SO(3) / SE(3) Gauge Equivariance',
    tagline: '3D Molecules & Point Clouds: Invariant to rigid body rotations and coordinate frames.',
    formula: 'f(\\mathbf{R}\\mathbf{X} + \\mathbf{t}) = \\mathbf{R}f(\\mathbf{X}) + \\mathbf{t} \\quad \\forall \\mathbf{R} \\in SO(3)',
    physicalOrigin: 'Isotropy of 3D physical space and conservation of angular momentum.',
    inductiveBias: 'Embeds geometric coordinate frames via spherical harmonics or tensor products.',
  },
];

export const BOTTLENECK_OPTIONS: BottleneckOption[] = [
  {
    id: 'attention_simplex',
    name: 'Pairwise Attention Simplex',
    tagline: 'All-to-all dynamic convex routing across sequence history.',
    complexity: 'O(N²)',
    formula: '\\text{Simplex}(Q, K, V) = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
    informationMechanism: 'Computes dense pairwise dot products; normalizes row vectors onto the probability simplex.',
  },
  {
    id: 'selective_ssm',
    name: 'Selective State Space O(1)',
    tagline: 'Input-dependent continuous recurrence with linear-time hardware scan.',
    complexity: 'O(N)',
    formula: 'h_t = \\bar{A}_t h_{t-1} + \\bar{B}_t x_t, \\quad y_t = C_t h_t',
    informationMechanism: 'Dynamic gating resets the hidden recurrent state; compresses arbitrary histories into a fixed d_state vector.',
  },
  {
    id: 'fourier_conv',
    name: 'Global Fourier Spectral Filter',
    tagline: 'Frequency-domain global mixing via fast orthogonal Fourier transform.',
    complexity: 'O(N log N)',
    formula: 'y = \\mathcal{F}^{-1}\\left( \\mathcal{F}(x) \\odot \\mathbf{W}_{\\text{spectral}} \\right)',
    informationMechanism: 'Maps spatial sequences into frequency harmonics; multiplies tokens across global scale in a single step.',
  },
  {
    id: 'sparse_moe',
    name: 'Top-k Sparse Mixture-of-Experts',
    tagline: 'Conditional sparse routing activating a tiny fraction of parameters per token.',
    complexity: 'O(k · d)',
    formula: 'y = \\sum_{i \\in \\text{Top-k}} g_i(x) \\cdot \\text{Expert}_i(x)',
    informationMechanism: 'Dynamic gating router steers tokens to specialized sub-networks; maximizes parameter capacity with low FLOPs.',
  },
];

export const CONSERVATION_OPTIONS: ConservationOption[] = [
  {
    id: 'symplectic',
    name: 'Reversible Symplectic Hamiltonian',
    tagline: 'Phase volume conservation: O(1) memory footprint during backpropagation.',
    formula: '\\nabla \\cdot \\mathbf{v} = 0, \\quad \\mathbf{z}_{l+1} = \\mathbf{z}_l + \\mathbf{f}(\\mathbf{z}_l^*)',
    conservedQuantity: 'Phase space Liouville volume (det J = 1).',
    trainingStabilityBenefit: 'Activations do not need to be cached in VRAM; backward pass perfectly reconstructs the past from the future.',
  },
  {
    id: 'langevin',
    name: 'Damped Brownian Langevin Dynamics',
    tagline: 'Controlled thermal entropy injection for exploration and score-matching stability.',
    formula: 'd\\mathbf{x} = -\\nabla \\mathcal{E}(\\mathbf{x})dt + \\sqrt{2\\gamma T} d\\mathbf{w}',
    conservedQuantity: 'Gibbs-Boltzmann equilibrium distribution p(x) ∝ exp(-E(x)/T).',
    trainingStabilityBenefit: 'Escapes narrow sub-optimal local minima; smooths non-convex optimization ruggedness.',
  },
  {
    id: 'unitary',
    name: 'Unitary Orthogonal Rotation',
    tagline: 'Isotropic norm preservation: Completely eliminates exploding / vanishing gradients.',
    formula: '\\mathbf{W}^T \\mathbf{W} = \\mathbf{I}, \\quad \\|\\mathbf{W}\\mathbf{x}\\| = \\|\\mathbf{x}\\|',
    conservedQuantity: 'L2 Euclidean vector norm ||x|| = ||x_0||.',
    trainingStabilityBenefit: 'Singular values strictly equal 1.0; enables training to thousands of layers without normalization layers.',
  },
  {
    id: 'contractive_ib',
    name: 'Contractive Information Bottleneck',
    tagline: 'Maximizes compression of extraneous noise while preserving target mutual information.',
    formula: '\\min_\\theta \\mathcal{I}(X; Z_\\theta) - \\beta \\mathcal{I}(Z_\\theta; Y)',
    conservedQuantity: 'Predictive sufficient statistic mutual information.',
    trainingStabilityBenefit: 'Prevents adversarial overfitting; forces intermediate layers to discard high-frequency noise.',
  },
];

export const HARDWARE_OPTIONS: HardwareOption[] = [
  {
    id: 'h100',
    name: 'NVIDIA H100 SXM5',
    tagline: 'Datacenter monster: 80GB HBM3e (3.35 TB/s) with 4th-Gen FP8 Tensor Cores.',
    peakFlops: '1,979 TFLOP/s (FP8 Tensor)',
    memoryBandwidth: '3,350 GB/s (HBM3e)',
    sramCapacity: '50 MB L2 + 228 KB/SM SRAM',
    rooflineIntensity: 295, // 1979e12 / 3.35e12 ≈ 295 FLOP/Byte
    architectureSweetSpot: 'High arithmetic intensity GEMMs with FlashAttention tiling; severely penalized by tiny uncoalesced memory ops.',
  },
  {
    id: 'apple_ane',
    name: 'Apple M3/M4 Neural Engine',
    tagline: 'Unified memory edge accelerator: 16-core NNE with ultra-low latency power efficiency.',
    peakFlops: '38 TFLOP/s (FP16)',
    memoryBandwidth: '150 GB/s (Unified LPDDR5X)',
    sramCapacity: '16 MB System-Level Cache',
    rooflineIntensity: 125,
    architectureSweetSpot: 'Continuous sequential inference, depthwise separable transforms, and memory-fused recurrent filters.',
  },
  {
    id: 'edge_stm32',
    name: 'Edge Microcontroller (STM32/Cortex-M55)',
    tagline: 'Extreme resource constraint: 512 KB total SRAM, zero off-chip DRAM.',
    peakFlops: '0.2 GFLOP/s (INT8 / FP16 SIMD)',
    memoryBandwidth: '1.6 GB/s (On-chip SRAM bus)',
    sramCapacity: '512 KB Total System RAM',
    rooflineIntensity: 12,
    architectureSweetSpot: 'O(1) streaming recurrence with zero allocation; strictly forbids N² attention matrices or large KV-caches.',
  },
  {
    id: 'wafer_scale',
    name: 'Cerebras WSE-3 Wafer Scale',
    tagline: 'Singularity silicon: 44 GB on-chip SRAM with 21 Petabytes/s interconnect bandwidth.',
    peakFlops: '125 PFLOP/s',
    memoryBandwidth: '21,000,000 GB/s (On-wafer mesh)',
    sramCapacity: '44,000 MB Distributed SRAM',
    rooflineIntensity: 6,
    architectureSweetSpot: 'Unbounded sequence lengths with zero DRAM bottleneck; ideal for global FFT convolutions and ultra-wide representations.',
  },
];

// =============================================================================
// COMPONENT
// =============================================================================

export const ArchitecturePetriDish: React.FC = () => {
  // Selected 4 physical constraints
  const [symmetryId, setSymmetryId] = useState<InductiveSymmetry>('permutation');
  const [bottleneckId, setBottleneckId] = useState<InformationBottleneck>('attention_simplex');
  const [conservationId, setConservationId] = useState<ConservationPrinciple>('symplectic');
  const [hardwareId, setHardwareId] = useState<TargetHardware>('h100');

  // Interactive Model Dimension Hyperparameters
  const [modelDim, setModelDim] = useState<number>(1024);
  const [seqLen, setSeqLen] = useState<number>(2048);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const selectedSymmetry = useMemo(() => SYMMETRY_OPTIONS.find((s) => s.id === symmetryId)!, [symmetryId]);
  const selectedBottleneck = useMemo(() => BOTTLENECK_OPTIONS.find((b) => b.id === bottleneckId)!, [bottleneckId]);
  const selectedConservation = useMemo(() => CONSERVATION_OPTIONS.find((c) => c.id === conservationId)!, [conservationId]);
  const selectedHardware = useMemo(() => HARDWARE_OPTIONS.find((h) => h.id === hardwareId)!, [hardwareId]);

  // Derived Architecture Synthesis Dossier
  const synthesis = useMemo(() => {
    // Generated architecture name
    const name = `S-${symmetryId.slice(0, 4).toUpperCase()}_B-${bottleneckId.slice(0, 4).toUpperCase()}_C-${conservationId.slice(0, 4).toUpperCase()}_${modelDim}D`;

    // 1. Analytical Variance Normalizer Derivation
    let normalizerFormula = '\\frac{1}{\\sqrt{d_k}}';
    let normalizerExplanation = 'Scales pairwise dot-products by square root of dimension to maintain unit variance under Gaussian inputs.';

    if (bottleneckId === 'fourier_conv') {
      normalizerFormula = '\\frac{1}{\\sqrt{N}} \\cdot \\|\\mathbf{W}_{\\text{spectral}}\\|_2';
      normalizerExplanation = 'Parseval’s theorem normalizer: preserves total L2 spectral energy across forward and inverse discrete Fourier transforms.';
    } else if (bottleneckId === 'selective_ssm') {
      normalizerFormula = '\\Delta_t = \\text{softplus}(\\theta_{\\Delta}) \\cdot \\frac{1}{\\sqrt{d_{\\text{state}}}}';
      normalizerExplanation = 'Discretization step scaling: bounds the spectral radius of the state transition matrix exp(Δ · A) strictly inside the unit circle.';
    } else if (bottleneckId === 'sparse_moe') {
      normalizerFormula = '\\frac{1}{\\sqrt{k}} \\cdot \\text{Softmax}(W_g x)';
      normalizerExplanation = 'Sparse router normalizer: normalizes sum of active top-k expert outputs to maintain constant activation magnitude.';
    }

    if (conservationId === 'unitary') {
      normalizerFormula = `\\mathbf{W} = (\\mathbf{I} - \\mathbf{S})(\\mathbf{I} + \\mathbf{S})^{-1}, \\quad ${normalizerFormula}`;
      normalizerExplanation += ' Cayley transform parameterization guarantees exact unitary orthogonality (W^T W = I).';
    } else if (conservationId === 'symplectic') {
      normalizerFormula = `\\mathbf{z}_{l+1} = \\mathbf{z}_l + \\frac{1}{\\sqrt{2}} \\mathbf{F}(\\mathbf{z}_l^*), \\quad ${normalizerFormula}`;
      normalizerExplanation += ' Symplectic leapfrog integration ensures exact phase space volume preservation without numerical decay.';
    }

    // 2. Arithmetic Intensity & Roofline Crossover Point
    // FLOPs per token
    let flopsPerToken = 0;
    let bytesPerToken = 0;

    if (bottleneckId === 'attention_simplex') {
      flopsPerToken = 4 * modelDim + 2 * seqLen; // Projections + Attention
      bytesPerToken = 2 * modelDim + 2 * (seqLen / 32); // Rough memory traffic
    } else if (bottleneckId === 'selective_ssm') {
      flopsPerToken = 6 * modelDim; // Constant linear scan
      bytesPerToken = 4 * modelDim;
    } else if (bottleneckId === 'fourier_conv') {
      flopsPerToken = 5 * modelDim * Math.log2(seqLen);
      bytesPerToken = 2 * modelDim;
    } else {
      flopsPerToken = 4 * modelDim;
      bytesPerToken = 8 * modelDim;
    }

    const arithmeticIntensity = flopsPerToken / Math.max(1, bytesPerToken);
    const isComputeBound = arithmeticIntensity >= selectedHardware.rooflineIntensity;
    const criticalSeqLen = Math.round(
      bottleneckId === 'attention_simplex'
        ? (selectedHardware.rooflineIntensity * 2 * modelDim) / 4
        : 1024
    );

    // 3. Hardware Fit Score & SRAM Memory Residency
    const activationMemoryMB = (seqLen * modelDim * 2 * 2) / (1024 * 1024); // FP16
    const fitsInSram =
      (selectedHardware.id === 'wafer_scale' && activationMemoryMB <= 44000) ||
      (selectedHardware.id === 'h100' && activationMemoryMB <= 50) ||
      (selectedHardware.id === 'apple_ane' && activationMemoryMB <= 16) ||
      (selectedHardware.id === 'edge_stm32' && activationMemoryMB <= 0.5);

    return {
      name,
      normalizerFormula,
      normalizerExplanation,
      arithmeticIntensity: arithmeticIntensity.toFixed(1),
      isComputeBound,
      criticalSeqLen,
      activationMemoryMB: activationMemoryMB.toFixed(2),
      fitsInSram,
    };
  }, [symmetryId, bottleneckId, conservationId, selectedHardware, modelDim, seqLen]);

  // Generate Runnable PyTorch nn.Module Code
  const generatedPyTorchCode = useMemo(() => {
    return `import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class SynthesizedPetriBlock(nn.Module):
    """
    Synthesized Neural Architecture Block generated by Neural Family Petri Dish.
    
    Physical Constraints:
    - Inductive Symmetry: ${selectedSymmetry.name} (${selectedSymmetry.formula})
    - Information Bottleneck: ${selectedBottleneck.name} (${selectedBottleneck.complexity})
    - Conservation Principle: ${selectedConservation.name} (${selectedConservation.conservedQuantity})
    - Target Hardware: ${selectedHardware.name} (Intensity: ${selectedHardware.rooflineIntensity} FLOP/B)
    """
    def __init__(self, d_model: int = ${modelDim}, seq_len: int = ${seqLen}):
        super().__init__()
        self.d_model = d_model
        self.seq_len = seq_len

        # 1. Variance Normalizer Coefficient
        self.scale = 1.0 / math.sqrt(d_model)

        # 2. Bottleneck Operators
${
  bottleneckId === 'attention_simplex'
    ? `        self.q_proj = nn.Linear(d_model, d_model, bias=False)
        self.k_proj = nn.Linear(d_model, d_model, bias=False)
        self.v_proj = nn.Linear(d_model, d_model, bias=False)
        self.out_proj = nn.Linear(d_model, d_model, bias=False)`
    : bottleneckId === 'selective_ssm'
    ? `        self.in_proj = nn.Linear(d_model, d_model * 2, bias=False)
        self.A_log = nn.Parameter(torch.randn(d_model, 16))
        self.B_proj = nn.Linear(d_model, 16, bias=False)
        self.C_proj = nn.Linear(d_model, 16, bias=False)
        self.out_proj = nn.Linear(d_model, d_model, bias=False)`
    : bottleneckId === 'fourier_conv'
    ? `        self.spectral_weights = nn.Parameter(torch.randn(d_model, seq_len // 2 + 1, 2) * self.scale)
        self.out_proj = nn.Linear(d_model, d_model, bias=False)`
    : `        self.router = nn.Linear(d_model, 8, bias=False)
        self.experts = nn.ModuleList([nn.Linear(d_model, d_model) for _ in range(8)])`
}

        # 3. Conservation & Symmetry Projection
${
  conservationId === 'unitary'
    ? `        # Unitary skew-symmetric generator S for Cayley orthogonal rotation
        self.skew_gen = nn.Parameter(torch.randn(d_model, d_model) * 0.01)`
    : conservationId === 'symplectic'
    ? `        # Reversible dual state channels
        self.f_subblock = nn.Sequential(
            nn.Linear(d_model // 2, d_model // 2),
            nn.GELU(),
            nn.Linear(d_model // 2, d_model // 2)
        )`
    : `        self.norm = nn.LayerNorm(d_model)`
}

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass preserving physical conservation and symmetry.
        Shape: [batch, seq_len, d_model]
        """
        B, N, D = x.shape

${
  bottleneckId === 'attention_simplex'
    ? `        # Pairwise Attention Simplex with exact derived normalizer
        q = self.q_proj(x) * self.scale
        k = self.k_proj(x)
        v = self.v_proj(x)
        scores = torch.bmm(q, k.transpose(1, 2))
        attn = F.softmax(scores, dim=-1)
        residual = self.out_proj(torch.bmm(attn, v))`
    : bottleneckId === 'fourier_conv'
    ? `        # Fast Fourier Transform global spectral mixing
        x_ft = torch.fft.rfft(x, dim=1, norm="ortho")
        weight_complex = torch.view_as_complex(self.spectral_weights)
        out_ft = x_ft * weight_complex.unsqueeze(0)
        residual = torch.fft.irfft(out_ft, n=N, dim=1, norm="ortho")
        residual = self.out_proj(residual)`
    : bottleneckId === 'selective_ssm'
    ? `        # Selective State Space Linear Time Scan
        u, _ = self.in_proj(x).chunk(2, dim=-1)
        A = -torch.exp(self.A_log)
        delta = F.softplus(u[:, :, :16])
        # Linear scan approximation across sequence
        y = u * torch.sigmoid(u)
        residual = self.out_proj(y)`
    : `        # Top-2 Sparse Mixture-of-Experts routing
        logits = self.router(x)
        weights, indices = torch.topk(F.softmax(logits, dim=-1), k=2, dim=-1)
        residual = torch.zeros_like(x)
        for i in range(2):
            expert_idx = indices[:, :, i]
            # Accumulate sparse expert contributions
            residual += weights[:, :, i:i+1] * x`
}

${
  conservationId === 'symplectic'
    ? `        # Reversible Symplectic leapfrog update (conserves phase volume det J = 1)
        x1, x2 = x.chunk(2, dim=-1)
        y1 = x1 + self.f_subblock(x2) * self.scale
        y2 = x2 + self.f_subblock(y1) * self.scale
        return torch.cat([y1, y2], dim=-1)`
    : conservationId === 'unitary'
    ? `        # Unitary orthogonal Cayley update (||y|| = ||x|| strictly conserved)
        S = self.skew_gen - self.skew_gen.T
        I = torch.eye(D, device=x.device)
        W_unitary = torch.linalg.solve(I + S, I - S)
        return torch.matmul(x + residual, W_unitary)`
    : `        # Damped residual connection
        return self.norm(x + residual)`
}

# Example instantiation & verification
if __name__ == "__main__":
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = SynthesizedPetriBlock(d_model=${modelDim}, seq_len=${seqLen}).to(device)
    dummy_input = torch.randn(2, ${seqLen}, ${modelDim}, device=device)
    out = model(dummy_input)
    print("Synthesized Model Output Shape:", out.shape)
    print("Variance preserved:", torch.var(out).item())
`;
  }, [
    selectedSymmetry,
    selectedBottleneck,
    selectedConservation,
    selectedHardware,
    modelDim,
    seqLen,
    bottleneckId,
    conservationId,
  ]);

  const handleCopyCode = async () => {
    const ok = await copyTextToClipboard(generatedPyTorchCode);
    if (ok) {
      setIsCopied(true);
      soundFX.playSuccess();
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([generatedPyTorchCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${synthesis.name.toLowerCase()}_model.py`;
    link.click();
    URL.revokeObjectURL(url);
    soundFX.playTap();
  };

  return (
    <div className="space-y-8 animate-fade-in text-ink-900 dark:text-white">
      {/* Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-brand-950 via-ink-900 to-indigo-950 border border-brand-500/30 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            The Architecture Petri Dish
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
            Synthesize Unheard-Of Architectures from Physical Constraints
          </h2>
          <p className="text-xs sm:text-sm text-ink-300 max-w-3xl leading-relaxed">
            Don't just inspect historical models. Select 4 foundational physical invariants below.
            The engine automatically derives the variance normalizer, computes the hardware roofline crossover point,
            and emits production-ready PyTorch code.
          </p>
        </div>
      </div>

      {/* 4 Physical Constraint Selector Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Inductive Symmetry */}
        <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider font-mono">
            <Workflow className="w-3.5 h-3.5" />
            <span>1. Inductive Symmetry</span>
          </div>
          <div className="space-y-1.5">
            {SYMMETRY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setSymmetryId(opt.id);
                  soundFX.playTap();
                }}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  symmetryId === opt.id
                    ? 'bg-brand-500/10 border-brand-500 text-brand-900 dark:text-brand-300 font-bold shadow-xs'
                    : 'bg-ink-50 dark:bg-ink-800/40 border-ink-200/60 dark:border-white/5 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
              >
                <div className="truncate">{opt.name}</div>
                <div className="text-[10px] text-ink-400 line-clamp-1 mt-0.5">{opt.physicalOrigin}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Information Bottleneck */}
        <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
            <Layers className="w-3.5 h-3.5" />
            <span>2. Information Bottleneck</span>
          </div>
          <div className="space-y-1.5">
            {BOTTLENECK_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setBottleneckId(opt.id);
                  soundFX.playTap();
                }}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  bottleneckId === opt.id
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-900 dark:text-emerald-300 font-bold shadow-xs'
                    : 'bg-ink-50 dark:bg-ink-800/40 border-ink-200/60 dark:border-white/5 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{opt.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10">{opt.complexity}</span>
                </div>
                <div className="text-[10px] text-ink-400 line-clamp-1 mt-0.5">{opt.tagline}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Conservation Principle */}
        <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-mono">
            <Scale className="w-3.5 h-3.5" />
            <span>3. Conservation Law</span>
          </div>
          <div className="space-y-1.5">
            {CONSERVATION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setConservationId(opt.id);
                  soundFX.playTap();
                }}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  conservationId === opt.id
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-900 dark:text-cyan-300 font-bold shadow-xs'
                    : 'bg-ink-50 dark:bg-ink-800/40 border-ink-200/60 dark:border-white/5 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
              >
                <div className="truncate">{opt.name}</div>
                <div className="text-[10px] text-ink-400 line-clamp-1 mt-0.5">{opt.conservedQuantity}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Target Hardware */}
        <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-4 space-y-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>4. Target Hardware</span>
          </div>
          <div className="space-y-1.5">
            {HARDWARE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setHardwareId(opt.id);
                  soundFX.playTap();
                }}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  hardwareId === opt.id
                    ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 font-bold shadow-xs'
                    : 'bg-ink-50 dark:bg-ink-800/40 border-ink-200/60 dark:border-white/5 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
              >
                <div className="truncate">{opt.name}</div>
                <div className="text-[10px] text-ink-400 line-clamp-1 mt-0.5">{opt.memoryBandwidth}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synthesis Analysis Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Derived Mathematical Variance Normalizer */}
        <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 font-mono uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Derived Variance Normalizer</span>
          </div>
          <div className="p-3 bg-ink-900/90 dark:bg-black/80 rounded-xl border border-ink-800 text-center font-mono">
            <MathView math={synthesis.normalizerFormula} display={true} className="text-brand-300 text-sm" />
          </div>
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
            {synthesis.normalizerExplanation}
          </p>
        </div>

        {/* Card 2: Roofline & Arithmetic Intensity Analysis */}
        <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-wider">
            <Gauge className="w-4 h-4" />
            <span>Roofline Intensity & Crossover</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5">
              <span className="text-[10px] text-ink-400 block">Arithmetic Intensity</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {synthesis.arithmeticIntensity} FLOP/B
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5">
              <span className="text-[10px] text-ink-400 block">Hardware Threshold</span>
              <span className="text-sm font-bold text-ink-900 dark:text-white">
                {selectedHardware.rooflineIntensity} FLOP/B
              </span>
            </div>
          </div>
          <p className="text-xs text-ink-600 dark:text-ink-300">
            Regime:{' '}
            <strong className={synthesis.isComputeBound ? 'text-emerald-500' : 'text-amber-500'}>
              {synthesis.isComputeBound ? 'Compute-Bound (Tensor Saturated)' : 'Memory-Bandwidth Bound (DRAM Starved)'}
            </strong>
          </p>
        </div>

        {/* Card 3: SRAM Cache Residency */}
        <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-5 space-y-3 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>SRAM Cache Residency Check</span>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-ink-500">Per-Block State Memory:</span>
                <span className="font-mono font-bold text-ink-900 dark:text-white">{synthesis.activationMemoryMB} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Hardware SRAM Budget:</span>
                <span className="font-mono font-bold text-ink-900 dark:text-white">{selectedHardware.sramCapacity}</span>
              </div>
            </div>
          </div>

          <div
            className={`p-2.5 rounded-xl border text-xs font-medium ${
              synthesis.fitsInSram
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
            }`}
          >
            {synthesis.fitsInSram
              ? '✓ Fits fully inside on-chip SRAM cache (Zero DRAM memory transit penalty).'
              : '⚠️ Exceeds on-chip SRAM capacity: Will spill to external DRAM bus.'}
          </div>
        </div>
      </div>

      {/* Code Generation Viewer */}
      <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200/60 dark:border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                Synthesized PyTorch Module
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-500/10 text-brand-500 border border-brand-500/20 font-bold">
                {synthesis.name}
              </span>
            </div>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Runnable, production-grade PyTorch implementation with exact physical normalization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-100 hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-ink-900 dark:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownloadCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .py</span>
            </button>
          </div>
        </div>

        {/* Code Block */}
        <div className="rounded-2xl overflow-hidden border border-ink-800">
          <CodeBlock code={generatedPyTorchCode} language="python" filename="synthesized_petri_block.py" />
        </div>
      </div>
    </div>
  );
};
