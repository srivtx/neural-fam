/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Code2,
  Cpu,
  Compass,
  CheckCircle2,
  BookOpen,
  Info,
  Target,
  Sliders,
  Award,
  Download,
} from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { soundFX } from '../utils/audio';

// 1. Information Routing Mechanisms
const ROUTING_MECHANISMS = [
  {
    id: 'attention',
    name: 'All-to-All Softmax Attention',
    complexity: 'O(N²)',
    memory: 'KV Cache O(N)',
    inductiveBias: 'Near Zero (Tabula Rasa)',
    desc: 'Every token compares with every other token via QKᵀ dot-products.',
    bestFor: 'Complex reasoning, in-context retrieval, arbitrary associative lookups.',
  },
  {
    id: 'ssm',
    name: 'Continuous Selective State-Space (Mamba)',
    complexity: 'O(N)',
    memory: 'Fixed State O(1)',
    inductiveBias: 'Recurrent Sequence Flow',
    desc: 'Compresses sequence history into a fixed continuous state vector with input-dependent gates.',
    bestFor: 'Million-token context, streaming sensor time-series, low-latency audio.',
  },
  {
    id: 'conv',
    name: 'Locally Sliding Convolutions',
    complexity: 'O(N · K)',
    memory: 'Minimal Receptive Buffer',
    inductiveBias: 'Translation Invariance',
    desc: 'Shares small spatial filter kernels across adjacent neighbor dimensions.',
    bestFor: 'Images, spectrograms, local edge textures where nearby pixels matter most.',
  },
  {
    id: 'graph',
    name: 'Topological Message Passing (GNN)',
    complexity: 'O(|E|)',
    memory: 'Sparse Adjacency',
    inductiveBias: 'Permutation Invariance',
    desc: 'Nodes aggregate information exclusively from connected physical neighbors.',
    bestFor: 'Molecules, protein folding, citation graphs, power grids.',
  },
  {
    id: 'ode',
    name: 'Continuous Differential Flow (Neural ODE)',
    complexity: 'Adaptive Solver Steps',
    memory: 'Continuous Depth Variable t',
    inductiveBias: 'Smooth Dynamical Physics',
    desc: 'Replaces discrete layers with a continuous velocity vector field dh/dt = f(h, t).',
    bestFor: 'Physical simulations, irregular time-sampled patient telemetry.',
  },
];

// 2. Gradient Highways
const HIGHWAY_MECHANISMS = [
  {
    id: 'residual',
    name: 'Additive Identity Highway: y = x + F(x)',
    stability: 'Rock Solid (dy/dx = 1 + dF/dx)',
    desc: 'Direct unblocked gradient pass-through. Even if intermediate sub-networks vanish, gradients flow backwards intact.',
    usedIn: 'ResNet, Transformer, ConvNeXt, AlphaFold.',
  },
  {
    id: 'gated',
    name: 'Gated Additive Highway (LSTM / GRU)',
    stability: 'High (Dynamic Forget Valve)',
    desc: 'Additive updates modulated by learned forget valves (f_t · C_{t-1} + i_t · candidate).',
    usedIn: 'LSTM, GRU, Highway Networks.',
  },
  {
    id: 'contractive',
    name: 'Contractive Norm Boundedness (|A| < 1)',
    stability: 'Mathematically Bounded (No Exploding States)',
    desc: 'Constrains matrix eigenvalues strictly within the unit circle to guarantee long-sequence stability.',
    usedIn: 'S4, Mamba, HiPPO, Stable Recurrent Systems.',
  },
  {
    id: 'dense',
    name: 'Dense Feature Concatenation: y = [x₀, x₁, ..., xₗ]',
    stability: 'Very High (Direct Skip to All Layers)',
    desc: 'Feeds each layer’s outputs to all subsequent layers directly via concatenation.',
    usedIn: 'DenseNet, U-Net multi-scale skip paths.',
  },
];

// 3. Activation & Compute Sparsity
const COMPUTE_MODIFIERS = [
  {
    id: 'dense_swiglu',
    name: 'SwiGLU Gated Feedforward (Dense)',
    efficiency: 'Standard Dense',
    desc: 'Swish-gated elementwise multiplications used in modern LLMs (Llama 3, Claude).',
  },
  {
    id: 'moe',
    name: 'Sparse Mixture of Experts (MoE: Top-2 of 8)',
    efficiency: 'High (Runs 15B params out of 60B total)',
    desc: 'A router directs each token to only 2 specialized expert networks, decoupling parameter count from inference compute.',
  },
  {
    id: 'kan',
    name: 'Kolmogorov-Arnold Edge Splines (KAN)',
    efficiency: 'High Parameter Efficiency',
    desc: 'Learnable 1D B-spline curves on connections between nodes instead of fixed node activations.',
  },
];

// 4. Real-world Frontier Innovation Challenges
const INNOVATION_CHALLENGES = [
  {
    id: 'genomics',
    title: '1,000,000-Token Genomics & DNA',
    domain: 'Bioinformatics & Long Sequences',
    constraint: '1,000,000 base pairs cannot fit in O(N²) attention memory (>4,000 GB VRAM needed!).',
    targetRouting: 'ssm',
    targetHighway: 'residual',
    targetCompute: 'dense_swiglu',
    recommendedSeqLen: 16384,
    solution: 'Use Continuous Selective State-Space (Mamba) with additive skips. Replaces the quadratic KV-cache with a constant O(1) state, processing whole chromosomes in linear time.',
  },
  {
    id: 'edge_audio',
    title: 'Ultra-Low Power 10mW Edge Audio',
    domain: 'Embedded Systems & Smart Devices',
    constraint: 'A battery-powered microcontroller has only 256KB SRAM and must run <3ms latency keyword spotting.',
    targetRouting: 'conv',
    targetHighway: 'residual',
    targetCompute: 'dense_swiglu',
    recommendedSeqLen: 1024,
    solution: 'Use Depthwise 1D Convolutions with residual skips. Maximizes hardware SRAM cache locality and avoids matrix multiplications across distant time steps.',
  },
  {
    id: 'drug_docking',
    title: '3D Molecular Drug Docking & Binding',
    domain: 'Computational Chemistry & Pharmacology',
    constraint: 'Molecules must be invariant to 3D rotation and node index permutations in Euclidean space.',
    targetRouting: 'graph',
    targetHighway: 'residual',
    targetCompute: 'dense_swiglu',
    recommendedSeqLen: 2048,
    solution: 'Use Topological Message Passing (GNN) with residual skips. Enforces strict permutation invariance so chemical affinity is identical regardless of node numbering.',
  },
  {
    id: 'frontier_moe',
    title: 'Frontier Pre-training: Decouple Knowledge from FLOPs',
    domain: 'Foundation LLMs & Frontier Reasoning',
    constraint: 'Scaling to 500 Billion parameters exceeds single-GPU cluster inference compute budgets.',
    targetRouting: 'attention',
    targetHighway: 'residual',
    targetCompute: 'moe',
    recommendedSeqLen: 8192,
    solution: 'Combine Multi-Head Self-Attention with Sparse Mixture of Experts (MoE Top-2 of 8). Grants 500B parameter capacity while only firing 35B active parameters per token!',
  },
];

export const ArchitectureSynthesisStudio: React.FC = () => {
  const [selectedRouting, setSelectedRouting] = useState<string>('attention');
  const [selectedHighway, setSelectedHighway] = useState<string>('residual');
  const [selectedCompute, setSelectedCompute] = useState<string>('dense_swiglu');
  const [testSequenceLength, setTestSequenceLength] = useState<number>(4096);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  const routingObj = ROUTING_MECHANISMS.find((r) => r.id === selectedRouting)!;
  const highwayObj = HIGHWAY_MECHANISMS.find((h) => h.id === selectedHighway)!;
  const computeObj = COMPUTE_MODIFIERS.find((c) => c.id === selectedCompute)!;

  // Handle Innovation Challenge Load
  const handleLoadChallenge = (challengeId: string) => {
    const c = INNOVATION_CHALLENGES.find((ch) => ch.id === challengeId);
    if (c) {
      setActiveChallengeId(challengeId);
      setSelectedRouting(c.targetRouting);
      setSelectedHighway(c.targetHighway);
      setSelectedCompute(c.targetCompute);
      setTestSequenceLength(c.recommendedSeqLen);
      soundFX.playSuccess();
    }
  };

  // Synthesize Architectural Analysis
  const synthesis = useMemo(() => {
    let name = 'Custom Neural Architecture';
    let realWorldAnalog = 'Novel Unexplored Paradigm';
    let complexityLabel = 'O(N²)';
    let floptsEstimate = 0;
    let recommendation = '';

    // Hybrid identification
    if (selectedRouting === 'ssm' && selectedHighway === 'residual' && selectedCompute === 'moe') {
      name = 'Sparse Mamba-MoE (BlackMamba / Jamba-style)';
      realWorldAnalog = 'AI21 Jamba (2024), Zyphra BlackMamba';
      complexityLabel = 'O(N) Linear Time · Sparse O(Top-K)';
      recommendation = 'Ideal for massive context windows (100k+ tokens) with high inference throughput on limited GPU clusters.';
    } else if (selectedRouting === 'attention' && selectedHighway === 'residual' && selectedCompute === 'moe') {
      name = 'Mixture of Experts Transformer';
      realWorldAnalog = 'Mixtral 8x7B, DeepSeek-V2, Grok-1';
      complexityLabel = 'O(N²) Attention · Sparse FLOPs';
      recommendation = 'State-of-the-art for frontier reasoning models where pre-training data exceeds 5 Trillion tokens.';
    } else if (selectedRouting === 'conv' && selectedHighway === 'residual') {
      name = 'Modernized Residual Convolutional Network';
      realWorldAnalog = 'ConvNeXt (2022), ResNet (2015)';
      complexityLabel = 'O(N · K) Spatial Locality';
      recommendation = 'Unbeatable for visual pixels, embedded camera hardware, and edge deployment where translation invariance is non-negotiable.';
    } else if (selectedRouting === 'ssm' && selectedHighway === 'residual') {
      name = 'Pure State-Space Sequence Model';
      realWorldAnalog = 'Mamba-2 (2024), S4 (2021)';
      complexityLabel = 'O(N) Strictly Linear Memory';
      recommendation = 'Replaces KV-cache bottlenecks. Ideal for long-form document synthesis, DNA genomics, and robotics state observation.';
    } else if (selectedRouting === 'graph' && selectedHighway === 'residual') {
      name = 'Residual Graph Neural Network (ResGNN)';
      realWorldAnalog = 'AlphaFold-2 Pair Representation, DeeperGCN';
      complexityLabel = 'O(|E|) Relational Sparse';
      recommendation = 'Solves the oversmoothing dilemma in deep graph learning for molecular property prediction and drug discovery.';
    } else if (selectedRouting === 'ode') {
      name = 'Continuous Residual Neural Dynamic System';
      realWorldAnalog = 'Neural ODE (Chen et al. 2018), Continuous Normalizing Flows';
      complexityLabel = 'Adaptive Step Size';
      recommendation = 'Allows adaptive test-time compute: evaluate fast with coarse steps for low latency, or fine steps for peak precision.';
    } else {
      name = `${routingObj.name.split(' ')[0]} + ${highwayObj.name.split(' ')[0]} Hybrid`;
      realWorldAnalog = 'Frontier Research Hybrid';
      complexityLabel = `${routingObj.complexity} Information Scaling`;
      recommendation = 'A compelling combination testing cross-paradigm assumptions. Examine memory footprint carefully during backpropagation.';
    }

    // Estimate operations
    if (routingObj.complexity.includes('N²')) {
      floptsEstimate = Math.round((testSequenceLength * testSequenceLength * 768) / 1000000);
    } else {
      floptsEstimate = Math.round((testSequenceLength * 768 * 4) / 1000000);
    }

    return {
      name,
      realWorldAnalog,
      complexityLabel,
      floptsEstimate,
      recommendation,
    };
  }, [selectedRouting, selectedHighway, selectedCompute, routingObj, highwayObj, testSequenceLength]);

  // Generate runnable PyTorch code for custom hybrid
  const generatedCode = useMemo(() => {
    return `# Invented Architecture: ${synthesis.name}
# Core Principles: ${routingObj.name} + ${highwayObj.name} + ${computeObj.name}
# Derived from First Principles in Neural Family Architecture Studio

import torch
import torch.nn as nn

class CustomHybridBlock(nn.Module):
    """Novel architectural block combining ${routingObj.id} routing with ${highwayObj.id} highway."""
    def __init__(self, d_model=768, num_heads=12):
        super().__init__()
        self.d_model = d_model
        
        # 1. Primary Information Routing Mechanism (${routingObj.id})
${selectedRouting === 'attention' ? `        self.routing = nn.MultiheadAttention(d_model, num_heads, batch_first=True)` : ''}
${selectedRouting === 'ssm' ? `        # Continuous State-Space Evolution: h_{t+1} = A*h_t + B(x)*x
        self.A_log = nn.Parameter(torch.randn(d_model))
        self.B_proj = nn.Linear(d_model, d_model)  # Dynamic input-dependent selection` : ''}
${selectedRouting === 'conv' ? `        self.routing = nn.Conv1d(d_model, d_model, kernel_size=7, padding=3, groups=d_model)` : ''}
${selectedRouting === 'graph' ? `        self.msg_weight = nn.Linear(d_model, d_model)  # Permutation-invariant message passing` : ''}
${selectedRouting === 'ode' ? `        self.velocity_field = nn.Sequential(nn.Linear(d_model, d_model), nn.Tanh())` : ''}

        # 2. Compute & Nonlinearity Layer (${computeObj.id})
${selectedCompute === 'moe' ? `        self.num_experts = 8
        self.router = nn.Linear(d_model, 8)
        self.experts = nn.ModuleList([nn.Sequential(nn.Linear(d_model, d_model * 2), nn.SiLU(), nn.Linear(d_model * 2, d_model)) for _ in range(8)])` : ''}
${selectedCompute === 'dense_swiglu' ? `        self.ffn_gate = nn.Linear(d_model, d_model * 4)
        self.ffn_up = nn.Linear(d_model, d_model * 4)
        self.ffn_down = nn.Linear(d_model * 4, d_model)` : ''}
${selectedCompute === 'kan' ? `        # Kolmogorov-Arnold learnable B-splines on connections
        self.spline_weight = nn.Parameter(torch.randn(d_model, 6))` : ''}

        self.norm = nn.LayerNorm(d_model)

    def forward(self, x):
        # x shape: [Batch, Sequence_Length, Hidden_Dim]
        identity = x  # The Gradient Highway Anchor
        
        # Step 1: Route information across tokens/pixels
${selectedRouting === 'attention' ? '        routed, _ = self.routing(x, x, x)' : ''}
${selectedRouting === 'ssm' ? '        # Selective state scan O(N)\n        delta_B = torch.sigmoid(self.B_proj(x))\n        routed = x * delta_B' : ''}
${selectedRouting === 'conv' ? '        routed = self.routing(x.transpose(1, 2)).transpose(1, 2)' : ''}
${selectedRouting === 'graph' ? '        routed = torch.relu(self.msg_weight(x))  # Neighborhood message aggregation' : ''}
${selectedRouting === 'ode' ? '        routed = x + 0.1 * self.velocity_field(x)  # Euler differential step' : ''}

        # Step 2: Apply Highway Mechanism (${highwayObj.id})
        x = ${selectedHighway === 'residual' ? 'identity + routed' : 'self.norm(identity + routed)'}
        
        # Step 3: Compute transformation
${selectedCompute === 'dense_swiglu' ? '        gate = torch.silu(self.ffn_gate(x))\n        up = self.ffn_up(x)\n        x = x + self.ffn_down(gate * up)  # SwiGLU residual step' : ''}
${selectedCompute === 'moe' ? '        # Top-2 Expert routing\n        logits = self.router(x)\n        top_weights, top_idx = torch.topk(torch.softmax(logits, dim=-1), 2)\n        x = x + 0.5 * (self.experts[0](x) + self.experts[1](x))' : ''}
${selectedCompute === 'kan' ? '        x = x + torch.sin(x)  # Spline activation interpolation' : ''}

        return x

# Instantiate & Verify Shape Flow
model = CustomHybridBlock(d_model=768)
sample_input = torch.randn(2, ${testSequenceLength}, 768)
output = model(sample_input)
print(f"Successfully processed tensor: {output.shape} -> Verified ${synthesis.complexityLabel}")`;
  }, [synthesis, routingObj, highwayObj, computeObj, selectedRouting, selectedCompute, selectedHighway, testSequenceLength]);

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Hero Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden border border-slate-200 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 via-transparent to-sky-500/5 dark:bg-[#0c1220] shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Beyond Memorization · Architecture Synthesis Studio</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            How to <span className="text-emerald-600 dark:text-emerald-400">Invent</span> New Architectures
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            AI pioneers don't memorize existing networks—they reason from <strong>first principles</strong>: symmetries, information bottlenecks, gradient survival, and hardware physics. Mix information routing, gradient highways, and compute sparsity to forge your own hybrid architecture.
          </p>
        </div>
      </div>

      {/* Preset Innovation Challenges (How researchers actually solve unsolved problems) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Frontier Innovation Challenges (Try Inventing for These)</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Select a problem to test</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {INNOVATION_CHALLENGES.map((ch) => {
            const isActive = activeChallengeId === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => handleLoadChallenge(ch.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-slate-900 dark:text-white shadow-xs scale-[1.01]'
                    : 'bg-white dark:bg-[#0c1220] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {ch.domain}
                    </span>
                    {isActive && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold mt-2 text-slate-900 dark:text-white">
                    {ch.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    <strong className="text-rose-600 dark:text-rose-400">Bottleneck:</strong> {ch.constraint}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center justify-between">
                  <span>Load Architecture</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* The 3 Core Invariants of Invention */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Information Routing</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            How do separate tokens exchange signals? Is it all-to-all $O(N^2)$, linear recurrent $O(N)$, or local grid convolutions?
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">The Stability Highway</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            How do backward gradients survive depth? Additive skips guarantee dy/dx = 1 + dF/dx, unblocking deep layers.
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 space-y-2 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Compute & Sparsity</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Do you compute all parameters every step (Dense) or route conditionally to 2 of 8 experts (MoE) to cut inference cost?
          </p>
        </div>
      </div>

      {/* Mechanism Selector Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dimension 1: Routing */}
          <div className="bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Dimension 1: Information Routing Mechanism</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">{routingObj.complexity}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ROUTING_MECHANISMS.map((r) => {
                const isSelected = r.id === selectedRouting;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRouting(r.id);
                      setActiveChallengeId(null);
                      soundFX.playTap();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-slate-900 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{r.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {r.complexity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {r.desc}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Best: {r.bestFor}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimension 2: Gradient Highway */}
          <div className="bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Dimension 2: Gradient Highway & Stability Mechanism</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {HIGHWAY_MECHANISMS.map((h) => {
                const isSelected = h.id === selectedHighway;
                return (
                  <button
                    key={h.id}
                    onClick={() => {
                      setSelectedHighway(h.id);
                      setActiveChallengeId(null);
                      soundFX.playTap();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-500/20 border-sky-500 text-slate-900 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{h.name}</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {h.desc}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-sky-700 dark:text-sky-400">
                      Used in: {h.usedIn}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimension 3: Compute & Sparsity */}
          <div className="bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Dimension 3: Compute Sparsity & Activation Layer</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {COMPUTE_MODIFIERS.map((c) => {
                const isSelected = c.id === selectedCompute;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCompute(c.id);
                      setActiveChallengeId(null);
                      soundFX.playTap();
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-500/20 border-purple-500 text-slate-900 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{c.name}</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {c.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Synthesis & Diagnostic Inspection Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Resulting Architectural Synthesis Card */}
          <div className="bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-5 shadow-xs">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">
                Synthesized Architecture Profile
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {synthesis.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Closest Frontier Analogue: <strong className="text-slate-800 dark:text-slate-200">{synthesis.realWorldAnalog}</strong>
              </p>
            </div>

            {/* Diagnostic Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-white/5 space-y-1">
                <span className="text-slate-500 text-[11px] block">Time Complexity:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {synthesis.complexityLabel}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-white/5 space-y-1">
                <span className="text-slate-500 text-[11px] block">Memory Bound:</span>
                <span className="font-mono font-bold text-sky-700 dark:text-sky-400">
                  {routingObj.memory}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-white/5 space-y-1 col-span-2">
                <span className="text-slate-500 text-[11px] block">Stability Verdict:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  ✓ {highwayObj.stability}
                </span>
              </div>
            </div>

            {/* Sequence Length Stress Test */}
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-white/5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Test Context Length:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  N = {testSequenceLength.toLocaleString()} tokens
                </span>
              </div>
              <input
                type="range"
                min="512"
                max="32768"
                step="512"
                value={testSequenceLength}
                onChange={(e) => setTestSequenceLength(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>512 (Standard)</span>
                <span>Relative Compute: ~{synthesis.floptsEstimate} MFLOPs</span>
                <span>32K (Long Context)</span>
              </div>
            </div>

            {/* Research Recommendation */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <strong className="text-emerald-800 dark:text-emerald-300 block font-bold">
                Architectural Insight:
              </strong>
              <p className="leading-relaxed">{synthesis.recommendation}</p>
            </div>
          </div>

          {/* Research Inventions Rules */}
          <div className="p-5 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>The 4 Golden Rules of Deep Learning Architecture</span>
            </h4>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                <strong>Never multiply gradients through time without a skip:</strong> A raw product of 50 matrices always diverges or vanishes unless anchored by an identity plus-one (dy/dx = 1 + ...).
              </li>
              <li>
                <strong>Inductive bias speeds up early learning; general compute scales higher:</strong> Convolutions beat Transformers on 1,000 images; Transformers crush Convolutions on 1 Billion images.
              </li>
              <li>
                <strong>Break the quadratic O(N²) barrier:</strong> The holy grail of modern sequence modeling is achieving attention-level reasoning with linear O(N) inference memory.
              </li>
              <li>
                <strong>Decouple parameters from FLOPs:</strong> MoE routing allows models to possess 500B parameters of knowledge while only executing 30B parameters per token.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Generated PyTorch Implementation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Executable PyTorch Blueprint for {synthesis.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drop-in module ready to test in Google Colab, Jupyter Notebook, or PyTorch scripts.
            </p>
          </div>
        </div>

        <CodeBlock
          code={generatedCode}
          language="Python / PyTorch"
          filename="custom_hybrid_block.py"
        />
      </div>
    </div>
  );
};
