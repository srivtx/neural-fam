/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Thoughtfully redesigned home page: clear architectural taxonomy,
 * an interactive chronological lineage, a 30-second decision compass,
 * and a 9-level hands-on laboratory curriculum.
 */

import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Sliders,
  CheckCircle2,
  Search,
  Sparkles,
  Network,
  Zap,
  RotateCcw,
  Code2,
  Compass,
  HelpCircle,
  Layers,
  Activity,
  Trophy,
  GitBranch,
  ShieldCheck,
  ChevronRight,
  Filter,
  Lightbulb,
} from 'lucide-react';
import { getProgress, resetProgress, LearningProgress } from '../utils/progressStore';
import { CheckpointQuiz, QuizQuestion } from './CheckpointQuiz';
import { soundFX } from '../utils/audio';

interface HomePageProps {
  onSelectView: (view: 'atlas' | 'labs' | 'taxonomy' | 'code' | 'synthesis' | 'epistemology') => void;
  onSelectLab: (labId: string) => void;
  onOpenGlossary: () => void;
  onOpenBadges?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectView,
  onSelectLab,
  onOpenGlossary,
  onOpenBadges,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [progress, setProgress] = useState<LearningProgress>(getProgress());
  const [selectedTimelineId, setSelectedTimelineId] = useState<string>('transformer');

  // 3-Question Quick Compass State
  const [compassDataType, setCompassDataType] = useState<'text' | 'image' | 'graph' | 'tabular'>('text');
  const [compassSeqLen, setCompassSeqLen] = useState<'short' | 'medium' | 'huge'>('huge');
  const [compassLatency, setCompassLatency] = useState<'low' | 'any'>('low');

  const handleResetProgress = () => {
    const updated = resetProgress();
    setProgress(updated);
    soundFX.playTap();
  };

  // Chronological Breakthrough Lineage
  const lineageEvents = [
    {
      id: 'perceptron',
      year: '1958',
      name: 'Single Neuron',
      author: 'Rosenblatt',
      bottleneckSolved: 'Linear thresholding',
      fatalBottleneck: 'Minsky & Papert prove it cannot compute XOR (first AI winter).',
      inductiveBias: 'Single hyperplane boundary',
      labId: 'perceptron',
      color: '#3346ff',
    },
    {
      id: 'mlp',
      year: '1986',
      name: 'Multilayer Perceptron',
      author: 'Rumelhart et al.',
      bottleneckSolved: 'Non-linear geometry warping via hidden layers and backpropagation.',
      fatalBottleneck: 'Dense connections ignore spatial translation and explode on sequences.',
      inductiveBias: 'Universal function approximation',
      labId: 'mlp',
      color: '#3346ff',
    },
    {
      id: 'cnn',
      year: '1998 / 2012',
      name: 'Convolutional Networks',
      author: 'LeCun / Krizhevsky',
      bottleneckSolved: 'Spatial translation invariance via weight sharing across grid patches.',
      fatalBottleneck: 'Fixed receptive field; struggle with long-range relational dependencies.',
      inductiveBias: 'Locality & translation invariance',
      labId: 'cnn_resnet',
      color: '#00a86b',
    },
    {
      id: 'rnn_lstm',
      year: '1997 / 2014',
      name: 'LSTM & Recurrent Gates',
      author: 'Hochreiter & Schmidhuber',
      bottleneckSolved: 'Additive constant error carousel prevents vanishing sequential gradients.',
      fatalBottleneck: 'Sequential bottleneck: step t requires step t-1, preventing GPU parallelism.',
      inductiveBias: 'Temporal order & recurrent state',
      labId: 'rnn_lstm',
      color: '#ff8a00',
    },
    {
      id: 'resnet',
      year: '2015',
      name: 'Residual Highway (ResNet)',
      author: 'He et al.',
      bottleneckSolved: 'Additive identity skip y = x + F(x) unblocks 100+ layer backprop.',
      fatalBottleneck: 'Solves gradient depth, but does not solve token interaction routing.',
      inductiveBias: 'Identity gradient preservation',
      labId: 'cnn_resnet',
      color: '#00a86b',
    },
    {
      id: 'transformer',
      year: '2017',
      name: 'Self-Attention (Transformer)',
      author: 'Vaswani et al.',
      bottleneckSolved: 'Parallel all-to-all QK^T token comparison; completely removes sequential steps.',
      fatalBottleneck: 'O(N^2) quadratic memory and KV-cache footprint limit million-token context.',
      inductiveBias: 'Zero relational bias (tabula rasa)',
      labId: 'transformer',
      color: '#ff3b6b',
    },
    {
      id: 'diffusion',
      year: '2020',
      name: 'Denoising Diffusion',
      author: 'Sohl-Dickstein / Ho et al.',
      bottleneckSolved: 'Reversible thermodynamic denoising trajectories for generative distribution modeling.',
      fatalBottleneck: 'High inference sampling latency requiring 20-50 iterative solver steps.',
      inductiveBias: 'Iterative Langevin denoising',
      labId: 'generative',
      color: '#ffb800',
    },
    {
      id: 'mamba',
      year: '2023',
      name: 'Selective SSM (Mamba)',
      author: 'Gu & Dao',
      bottleneckSolved: 'Continuous input-dependent state compression; linear O(N) runtime with O(1) state.',
      fatalBottleneck: 'Finite memory capacity requires selective forgetting during long associative recall.',
      inductiveBias: 'Continuous dynamical time-evolution',
      labId: 'ssm_mamba',
      color: '#8b5cf6',
    },
  ];

  // 9 Progressive Hands-on Curriculum Levels
  const levels = [
    {
      id: 'perceptron',
      level: 0,
      title: 'The Atomic Neuron & Decision Boundary',
      family: 'Feedforward',
      duration: '10 min',
      formula: 'y = σ(Wx + b)',
      analogy: 'Volume dials, counterweight spring, and lightbulb snap switch.',
      color: '#3346ff',
    },
    {
      id: 'mlp',
      level: 1,
      title: 'Multilayer Perceptrons & Space Warping',
      family: 'Feedforward',
      duration: '15 min',
      formula: 'h = ReLU(W₁x + b₁)',
      analogy: 'Folding flat paper in half so one straight cut separates XOR points.',
      color: '#3346ff',
    },
    {
      id: 'cnn_resnet',
      level: 2,
      title: 'CNNs & Residual Skip Highways',
      family: 'Spatial Vision',
      duration: '20 min',
      formula: 'y = x + F(x)',
      analogy: 'Sliding magnifying glass filters and express conveyor belts for gradients.',
      color: '#00a86b',
    },
    {
      id: 'rnn_lstm',
      level: 3,
      title: 'Recurrence & LSTM Memory Gating',
      family: 'Sequential',
      duration: '20 min',
      formula: 'C_t = f_t · C_{t-1} + i_t · ~C_t',
      analogy: 'The detective’s notebook with eraser (forget) and pen (input) valves.',
      color: '#ff8a00',
    },
    {
      id: 'transformer',
      level: 4,
      title: 'Transformers & Scaled Self-Attention',
      family: 'Attention',
      duration: '25 min',
      formula: 'Softmax(QKᵀ / √d_k) V',
      analogy: 'Dynamic spotlights shining across an entire sentence simultaneously.',
      color: '#ff3b6b',
    },
    {
      id: 'ssm_mamba',
      level: 5,
      title: 'State-Space Models & Mamba Selection',
      family: 'Sub-Quadratic',
      duration: '25 min',
      formula: 'h_(t+1) = Ah_t + B(x_t) x_t',
      analogy: 'Continuous audio tape recorder with an automatic adaptive noise gate.',
      color: '#8b5cf6',
    },
    {
      id: 'gnn',
      level: 6,
      title: 'Graph Networks & Message Passing',
      family: 'Relational Graphs',
      duration: '20 min',
      formula: 'UPDATE(AGGREGATE(N(v)))',
      analogy: 'Neighborhood morning gossip circles over molecular bonds.',
      color: '#00b8d9',
    },
    {
      id: 'generative',
      level: 7,
      title: 'Generative Models: Diffusion & VAEs',
      family: 'Probabilistic',
      duration: '25 min',
      formula: 'x_{t-1} = Denoise(x_t, ε_θ)',
      analogy: 'Watching a drop of ink dissolve in water and running time backward.',
      color: '#ffb800',
    },
    {
      id: 'specialized',
      level: 8,
      title: 'Neural ODEs & Continuous Frontiers',
      family: 'Frontiers',
      duration: '20 min',
      formula: 'dh(t)/dt = f(h, t, θ)',
      analogy: 'Gliding down a smooth continuous water slide with no discrete floors.',
      color: '#84cc16',
    },
  ];

  // Concept check questions
  const homeQuizQuestions: QuizQuestion[] = [
    {
      question: 'Why did Transformers replace RNNs as the foundational backbone of large language models?',
      options: [
        'Transformers compute all token interactions in parallel across GPU matrix units, whereas RNNs are constrained to step-by-step sequential recurrence.',
        'Transformers use fewer floating point operations than RNNs for every sequence length.',
        'Transformers do not require positional information.',
      ],
      correctIndex: 0,
      explanation: 'RNNs require step t-1 to finish before computing step t. Transformers use pairwise QK^T dot-products to process entire documents at once on parallel GPUs.',
    },
    {
      question: 'What is the mathematical role of the residual connection y = x + F(x) in deep networks?',
      options: [
        'It ensures the gradient derivative dy/dx = 1 + dF/dx has an unblocked identity pathway, preventing signals from shrinking to zero across deep layers.',
        'It halves the number of parameters needed in each layer.',
        'It forces all neuron activations to be positive.',
      ],
      correctIndex: 0,
      explanation: 'Because dy/dx = 1 + dF/dx, even if intermediate weights F(x) have vanishing gradients, the "+1" term lets backpropagation travel through hundreds of layers intact.',
    },
    {
      question: 'What trade-off does a Selective State-Space Model (like Mamba) make compared to standard attention?',
      options: [
        'It achieves strictly linear O(N) runtime and constant O(1) state memory by continuously compressing history into a fixed vector instead of caching every token.',
        'It can only handle numeric data and cannot process natural language.',
        'It requires quadratic memory during training.',
      ],
      correctIndex: 0,
      explanation: 'Attention keeps a growing KV cache of every previous token (quadratic or linear memory per token). Mamba compresses past context into a fixed-size hidden state.',
    },
  ];

  // Decision Compass Recommendation
  const compassRecommendation = (() => {
    if (compassDataType === 'graph') {
      return {
        name: 'Graph Neural Network (GNN) with Residuals',
        reason: 'Permutation-invariant message passing across arbitrary physical or relational topology.',
        labId: 'gnn',
      };
    }
    if (compassDataType === 'image') {
      return {
        name: 'Hybrid ConvNeXt or Vision Transformer (ViT)',
        reason: 'Local 2D convolution for texture locality or patchified self-attention for global spatial coherence.',
        labId: 'cnn_resnet',
      };
    }
    if (compassSeqLen === 'huge' && compassLatency === 'low') {
      return {
        name: 'Selective State Space Model (Mamba) / Hybrid SSM-MoE',
        reason: 'Sub-quadratic O(N) linear time and constant O(1) state cache for long sequence throughput.',
        labId: 'ssm_mamba',
      };
    }
    return {
      name: 'Grouped-Query Attention Transformer (Llama 3 style)',
      reason: 'General-purpose in-context retrieval and reasoning with GQA to compress KV-cache overhead.',
      labId: 'transformer',
    };
  })();

  const filteredLevels = levels.filter(
    (lvl) =>
      lvl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lvl.family.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lvl.analogy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lvl.formula.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = progress.completedLabs.length;
  const progressPct = Math.round((completedCount / levels.length) * 100);
  const activeTimelineEvent = lineageEvents.find((e) => e.id === selectedTimelineId) || lineageEvents[5];

  return (
    <div className="space-y-10 pb-12 animate-fade-in">
      {/* Hero Section */}
      <div className="relative rounded-3xl p-6 sm:p-10 border border-ink-200 dark:border-white/10 bg-surface dark:bg-ink-900 shadow-xs transition-colors overflow-hidden">
        {/* Subtle decorative dot-pattern backdrop */}
        <div className="absolute inset-0 paper-grid opacity-50 pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Interactive neural architecture laboratory</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-ink-900 dark:text-white tracking-tight leading-[1.12]">
            The Evolutionary Tree of <br />
            <span className="text-brand-600 dark:text-brand-400">
              Artificial Neural Networks
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-ink-600 dark:text-ink-300 leading-relaxed max-w-2xl">
            From the 1943 McCulloch-Pitts perceptron to Transformers, Mamba state spaces, and Diffusion models. Understand why each architecture exists, test the math interactively, and synthesize custom hybrids.
          </p>

          {/* Family Palette Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-ink-500 font-mono mr-1">Families:</span>
            {[
              { name: 'Feedforward', color: '#3346ff' },
              { name: 'Convolution', color: '#00a86b' },
              { name: 'Recurrent', color: '#ff8a00' },
              { name: 'Attention', color: '#ff3b6b' },
              { name: 'State Space', color: '#8b5cf6' },
              { name: 'Graph', color: '#00b8d9' },
              { name: 'Generative', color: '#ffb800' },
            ].map((fam) => (
              <span
                key={fam.name}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono border border-ink-200 dark:border-white/10 bg-ink-50 dark:bg-ink-950 text-ink-700 dark:text-ink-300"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fam.color }} />
                <span>{fam.name}</span>
              </span>
            ))}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => onSelectLab('perceptron')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Start at Level 0: The Single Neuron</span>
            </button>

            <button
              onClick={() => onSelectView('synthesis')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-brand-800 dark:text-brand-200 bg-brand-100/70 hover:bg-brand-200/80 dark:bg-brand-500/20 dark:hover:bg-brand-500/30 rounded-xl border border-brand-300/80 dark:border-brand-500/30 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Compass className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Architecture Synthesis Studio</span>
            </button>

            <button
              onClick={() => onSelectView('epistemology')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-amber-900 dark:text-amber-200 bg-amber-100/80 hover:bg-amber-200/90 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 rounded-xl border border-amber-300 dark:border-amber-500/40 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span>Theory Thinking: How Breakthroughs Are Made</span>
            </button>

            <button
              onClick={() => onSelectView('taxonomy')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-ink-700 dark:text-ink-200 bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700 rounded-xl border border-ink-200 dark:border-white/10 transition-all cursor-pointer active:scale-95"
            >
              <Sliders className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>3-Question Taxonomy</span>
            </button>

            <button
              onClick={() => onSelectView('atlas')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-ink-700 dark:text-ink-200 bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700 rounded-xl border border-ink-200 dark:border-white/10 transition-all cursor-pointer active:scale-95"
            >
              <Network className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Family Tree Atlas</span>
            </button>
          </div>
        </div>

        {/* Live Curriculum Telemetry Bar */}
        <div className="mt-8 pt-6 border-t border-ink-100 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono relative z-10">
          <div className="space-y-1">
            <span className="text-ink-500 uppercase text-[10px]">Curriculum Path</span>
            <div className="text-ink-900 dark:text-white text-base font-bold font-sans">
              9 Hands-on Labs
            </div>
            <div className="text-ink-500 text-[11px]">Levels 0 through 8</div>
          </div>

          <div className="space-y-1">
            <span className="text-ink-500 uppercase text-[10px]">Taxonomy Coverage</span>
            <div className="text-brand-600 dark:text-brand-400 text-base font-bold font-sans">
              7 Major Families
            </div>
            <div className="text-ink-500 text-[11px]">+ Continuous dynamical systems</div>
          </div>

          <div className="space-y-1">
            <span className="text-ink-500 uppercase text-[10px]">Your Progress</span>
            <div className="text-green-700 dark:text-green-300 text-base font-bold font-sans">
              {completedCount} of {levels.length} mastered ({progressPct}%)
            </div>
            <div className="text-ink-500 text-[11px]">Saved locally in browser</div>
          </div>

          <div className="space-y-1">
            <span className="text-ink-500 uppercase text-[10px]">Compute Model</span>
            <div className="text-ink-900 dark:text-white text-base font-bold font-sans">
              Client Tensor Math
            </div>
            <div className="text-ink-500 text-[11px]">Runs 100% in-browser</div>
          </div>
        </div>
      </div>

      {/* Progress Track & Quick Badges Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 text-xs shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-ink-800 dark:text-ink-200">Curriculum Progress:</span>
          <div className="w-24 sm:w-60 h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden border border-ink-200/50 dark:border-white/5 shrink">
            <div
              className="h-full bg-brand-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">{progressPct}%</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-ink-500 text-[11px]">
            {completedCount} of {levels.length} labs completed
          </span>

          {onOpenBadges && (
            <button
              onClick={onOpenBadges}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-semibold text-[11px] border border-brand-200 dark:border-brand-500/20 transition-colors cursor-pointer"
            >
              <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Badges & Milestones</span>
            </button>
          )}

          {completedCount > 0 && (
            <button
              onClick={handleResetProgress}
              className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 flex items-center gap-1 cursor-pointer transition-colors text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Chronological Breakthrough Lineage */}
      <div className="p-6 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold font-display text-ink-900 dark:text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>The Evolutionary Timeline: How Bottlenecks Forced Breakthroughs</span>
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Architectures evolved when previous approaches hit hard mathematical bottlenecks.
            </p>
          </div>
          <span className="text-[11px] font-mono text-ink-400">Click a milestone to inspect</span>
        </div>

        {/* Horizontal Timeline Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {lineageEvents.map((evt) => {
            const isSelected = evt.id === selectedTimelineId;
            return (
              <button
                key={evt.id}
                onClick={() => {
                  setSelectedTimelineId(evt.id);
                  soundFX.playTap();
                }}
                className={`p-3 rounded-xl border text-left shrink-0 min-w-[140px] transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-ink-100 dark:bg-ink-800 border-ink-400 dark:border-white/30 shadow-xs scale-[1.02]'
                    : 'bg-ink-50 dark:bg-ink-950 border-ink-200 dark:border-white/5 hover:border-ink-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold text-ink-500">{evt.year}</span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: evt.color }} />
                </div>
                <div className="font-bold text-xs text-ink-900 dark:text-white mt-1 truncate">
                  {evt.name}
                </div>
                <div className="text-[10px] text-ink-500 mt-0.5 truncate">{evt.author}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Milestone Inspection Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeTimelineEvent.color }}
              />
              <span className="font-bold text-sm text-ink-900 dark:text-white">
                {activeTimelineEvent.name} ({activeTimelineEvent.year}) · {activeTimelineEvent.author}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ink-200 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
                {activeTimelineEvent.inductiveBias}
              </span>
            </div>

            <div className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
              <strong className="text-green-700 dark:text-green-400 font-semibold">Breakthrough: </strong>
              {activeTimelineEvent.bottleneckSolved}
            </div>

            <div className="text-xs text-ink-600 dark:text-ink-400 leading-relaxed">
              <strong className="text-rose-600 dark:text-rose-400 font-semibold">Fatal Bottleneck: </strong>
              {activeTimelineEvent.fatalBottleneck}
            </div>
          </div>

          <div className="md:col-span-4 flex md:justify-end">
            <button
              onClick={() => onSelectLab(activeTimelineEvent.labId)}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Open {activeTimelineEvent.name} Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* The 3-Question Architectural Compass */}
      <div className="p-6 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-xs space-y-5 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-display text-ink-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Architectural Decision Compass</span>
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Select constraints to diagnose the optimal architecture family.
            </p>
          </div>

          <button
            onClick={() => onSelectView('taxonomy')}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>Full 3-Question Matrix</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Question 1: Data Topology */}
          <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-2">
            <span className="font-bold text-ink-900 dark:text-white block text-[11px] uppercase tracking-wider text-brand-600 dark:text-brand-400">
              1. What is your data topology?
            </span>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { id: 'text', label: '1D Sequence / Text' },
                { id: 'image', label: '2D Spatial Grid' },
                { id: 'graph', label: 'Graph / Molecules' },
                { id: 'tabular', label: 'Tabular / Flat' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCompassDataType(opt.id as any)}
                  className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                    compassDataType === opt.id
                      ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-900 dark:text-brand-100 font-bold'
                      : 'border-ink-200 dark:border-white/5 hover:border-ink-300 dark:hover:border-white/20 text-ink-700 dark:text-ink-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Sequence Length */}
          <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-2">
            <span className="font-bold text-ink-900 dark:text-white block text-[11px] uppercase tracking-wider text-brand-600 dark:text-brand-400">
              2. What is your sequence scale?
            </span>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { id: 'short', label: '≤1K tokens' },
                { id: 'medium', label: '4K - 16K' },
                { id: 'huge', label: '100K+ tokens' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCompassSeqLen(opt.id as any)}
                  className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                    compassSeqLen === opt.id
                      ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-900 dark:text-brand-100 font-bold'
                      : 'border-ink-200 dark:border-white/5 hover:border-ink-300 dark:hover:border-white/20 text-ink-700 dark:text-ink-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Latency & Memory Ceiling */}
          <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-2">
            <span className="font-bold text-ink-900 dark:text-white block text-[11px] uppercase tracking-wider text-brand-600 dark:text-brand-400">
              3. Latency & memory constraint?
            </span>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { id: 'low', label: 'Ultra-low / Streaming' },
                { id: 'any', label: 'Cloud GPU Cluster' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setCompassLatency(opt.id as any)}
                  className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                    compassLatency === opt.id
                      ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-900 dark:text-brand-100 font-bold'
                      : 'border-ink-200 dark:border-white/5 hover:border-ink-300 dark:hover:border-white/20 text-ink-700 dark:text-ink-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendation Output Bar */}
        <div className="p-4 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-brand-600 dark:text-brand-400 font-bold">
                Recommended Paradigm:
              </span>
              <span className="font-bold text-ink-900 dark:text-white">
                {compassRecommendation.name}
              </span>
            </div>
            <p className="text-ink-600 dark:text-ink-300 text-[11px]">
              {compassRecommendation.reason}
            </p>
          </div>

          <button
            onClick={() => onSelectLab(compassRecommendation.labId)}
            className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>Launch Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-ink-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Search curriculum by architecture or concept (e.g. 'Mamba', 'XOR', 'ResNet', 'Attention', 'Diffusion')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:border-brand-500 shadow-xs transition-colors"
        />
      </div>

      {/* Curriculum Roadmap: Level 0 to Level 8 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-ink-900 dark:text-white">
              The 9 Progressive Hands-on Laboratories
            </h2>
            <p className="text-xs text-ink-500 mt-0.5">
              Each lab includes real mathematical calculations, interactive visualizers, physical analogies, and runnable PyTorch code.
            </p>
          </div>
          <span className="text-xs font-mono text-brand-600 dark:text-brand-400 font-semibold">
            {filteredLevels.length} Labs Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLevels.map((lvl) => {
            const isDone = progress.completedLabs.includes(lvl.id);

            return (
              <div
                key={lvl.id}
                onClick={() => onSelectLab(lvl.id)}
                className="p-5 rounded-2xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 hover:border-brand-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-xs lift"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span
                      className="px-2 py-0.5 rounded font-bold text-white text-[10px]"
                      style={{ backgroundColor: lvl.color }}
                    >
                      LEVEL {lvl.level}
                    </span>
                    <span className="text-ink-400">{lvl.duration}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-ink-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {lvl.title}
                    </h3>
                    <div className="text-xs text-ink-500 mt-0.5">{lvl.family}</div>
                  </div>

                  <div className="p-2.5 bg-ink-50 dark:bg-ink-950 rounded-lg border border-ink-200/60 dark:border-white/5 font-mono text-xs text-brand-700 dark:text-brand-300 truncate">
                    {lvl.formula}
                  </div>

                  <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed line-clamp-2">
                    <strong className="text-ink-900 dark:text-slate-100">Analogy: </strong>
                    {lvl.analogy}
                  </p>
                </div>

                <div className="pt-3 border-t border-ink-100 dark:border-white/5 flex items-center justify-between">
                  {isDone ? (
                    <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span className="text-xs text-ink-400 font-mono">Ready to start</span>
                  )}

                  <span className="flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Open lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-Flight Concept Checkpoint */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h2 className="text-base font-bold font-display text-ink-900 dark:text-white">
            Pre-flight concept checkpoint
          </h2>
        </div>
        <CheckpointQuiz
          quizKey="home_overview"
          title="Neural Architecture Core Intuitions"
          questions={homeQuizQuestions}
        />
      </div>
    </div>
  );
};
