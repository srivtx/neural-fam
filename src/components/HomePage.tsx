/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
} from 'lucide-react';
import { getProgress, resetProgress, LearningProgress } from '../utils/progressStore';
import { CheckpointQuiz, QuizQuestion } from './CheckpointQuiz';

interface HomePageProps {
  onSelectView: (view: 'atlas' | 'labs' | 'taxonomy' | 'code' | 'synthesis') => void;
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

  const handleResetProgress = () => {
    const updated = resetProgress();
    setProgress(updated);
  };

  // 9 Sequential Curriculum Levels
  const levels = [
    {
      id: 'perceptron',
      level: 0,
      title: 'The Atomic Neuron & Decision Boundary',
      category: 'Feedforward Genesis',
      duration: '10 min',
      formula: 'y = σ(Wx + b)',
      analogy: 'Volume dials, counterweight spring, and lightbulb snap switch.',
      difficulty: 'Beginner',
      badgeColor: 'emerald',
    },
    {
      id: 'mlp',
      level: 1,
      title: 'Multilayer Perceptrons & Space Warping',
      category: 'Feedforward Expansion',
      duration: '15 min',
      formula: 'h = ReLU(W₁x + b₁)',
      analogy: 'Folding flat paper in half so one straight cut separates XOR points.',
      difficulty: 'Beginner',
      badgeColor: 'emerald',
    },
    {
      id: 'cnn_resnet',
      level: 2,
      title: 'CNNs & Residual Skip Highways',
      category: 'Spatial Vision',
      duration: '20 min',
      formula: 'y = x + F(x)',
      analogy: 'Sliding magnifying glass filters and express conveyor belts for gradients.',
      difficulty: 'Intermediate',
      badgeColor: 'teal',
    },
    {
      id: 'rnn_lstm',
      level: 3,
      title: 'Recurrence & LSTM Memory Gating',
      category: 'Sequential Systems',
      duration: '20 min',
      formula: 'C_t = f_t · C_{t-1} + i_t · ~C_t',
      analogy: 'The detective’s notebook with eraser (forget) and pen (input) valves.',
      difficulty: 'Intermediate',
      badgeColor: 'amber',
    },
    {
      id: 'transformer',
      level: 4,
      title: 'Transformers & Scaled Self-Attention',
      category: 'Parallel Attention',
      duration: '25 min',
      formula: 'Softmax(QKᵀ / √d_k) V',
      analogy: 'Dynamic spotlights shining across an entire sentence simultaneously.',
      difficulty: 'Advanced',
      badgeColor: 'emerald',
    },
    {
      id: 'ssm_mamba',
      level: 5,
      title: 'State-Space Models & Mamba Selection',
      category: 'Sub-Quadratic Scaling',
      duration: '25 min',
      formula: 'h_(t+1) = Ah_t + B(x_t) x_t',
      analogy: 'Continuous audio tape recorder with an automatic adaptive noise gate.',
      difficulty: 'Advanced',
      badgeColor: 'emerald',
    },
    {
      id: 'gnn',
      level: 6,
      title: 'Graph Networks & Message Passing',
      category: 'Non-Euclidean Graphs',
      duration: '20 min',
      formula: 'UPDATE(AGGREGATE(N(v)))',
      analogy: 'Neighborhood morning gossip circles over molecular bonds.',
      difficulty: 'Advanced',
      badgeColor: 'teal',
    },
    {
      id: 'generative',
      level: 7,
      title: 'Generative Models: Diffusion & VAEs',
      category: 'Probabilistic Synthesis',
      duration: '25 min',
      formula: 'x_{t-1} = Denoise(x_t, ε_θ)',
      analogy: 'Watching a drop of ink dissolve in water and running time backward.',
      difficulty: 'Mastery',
      badgeColor: 'purple',
    },
    {
      id: 'specialized',
      level: 8,
      title: 'Neural ODEs, SNNs & Emerging Frontiers',
      category: 'Continuous Frontiers',
      duration: '20 min',
      formula: 'dh(t)/dt = f(h, t, θ)',
      analogy: 'Gliding down a smooth continuous water slide with no discrete floors.',
      difficulty: 'Mastery',
      badgeColor: 'emerald',
    },
  ];

  const homeQuizQuestions: QuizQuestion[] = [
    {
      question: 'What is the core distinction between a Transformer and an RNN when processing text?',
      options: [
        'Transformers process all tokens simultaneously using parallel attention matrices, whereas RNNs process step-by-step sequentially.',
        'RNNs can only handle images while Transformers only handle numbers.',
        'Transformers do not use matrix multiplication.',
      ],
      correctIndex: 0,
      explanation: 'RNNs must wait for step t-1 before computing step t. Transformers use Q, K, V self-attention to correlate all tokens in parallel on GPUs!',
    },
    {
      question: 'Why did ResNet add the identity skip connection y = x + F(x)?',
      options: [
        'To prevent vanishing gradients and allow signals to bypass hundreds of layers unchanged.',
        'To reduce model parameter count to zero.',
        'To make the network run in reverse.',
      ],
      correctIndex: 0,
      explanation: 'With a skip highway, the gradient can flow directly back through the addition operator without exploding or shrinking through hundreds of matrix multiplications.',
    },
    {
      question: 'What is the key advantage of State-Space Models (like Mamba) over standard Transformers for long sequences?',
      options: [
        'Linear memory and runtime scaling O(L) instead of quadratic O(L²) attention cost.',
        'They do not require any training data.',
        'They replace all weights with random numbers.',
      ],
      correctIndex: 0,
      explanation: 'Self-attention requires comparing every token against every other token (L × L). Mamba maintains a fixed-size recurrent state, processing 1M+ tokens in O(L) time.',
    },
  ];

  const filteredLevels = levels.filter(
    (lvl) =>
      lvl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lvl.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lvl.analogy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lvl.formula.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedCount = progress.completedLabs.length;
  const progressPct = Math.round((completedCount / levels.length) * 100);

  return (
    <div className="space-y-10 pb-8">
      {/* Hero Section */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c1220] shadow-sm transition-colors">
        <div className="max-w-3xl space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Interactive Architecture Laboratory · Pure Tensor Mechanics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            The Family Tree of <br />
            <span className="text-emerald-600 dark:text-emerald-400">
              Artificial Neural Networks
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            From the atomic single neuron to Transformers, Mamba state-spaces, and Diffusion models. Master every major neural architecture from first principles using physical analogies, live mathematical playgrounds, and runnable code.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectLab('perceptron')}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Start at Level 0: The Single Neuron</span>
            </button>

            <button
              onClick={() => onSelectView('synthesis')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100/70 hover:bg-emerald-200/80 dark:bg-emerald-500/20 dark:hover:bg-emerald-500/30 rounded-xl border border-emerald-300/80 dark:border-emerald-500/30 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Compose novel neural building blocks from first principles"
            >
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Invent New Architectures</span>
            </button>

            <button
              onClick={() => onSelectView('atlas')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              <Network className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Explore Family Atlas</span>
            </button>

            <button
              onClick={() => onSelectView('taxonomy')}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>The 3-Questions Matrix</span>
            </button>

            <button
              onClick={onOpenGlossary}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Glossary & Analogies</span>
            </button>
          </div>
        </div>

        {/* Live Learning Stats Strip */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="space-y-1">
            <span className="text-slate-400 dark:text-slate-500 uppercase text-[10px]">Curriculum</span>
            <div className="text-slate-900 dark:text-white text-base font-bold font-sans">9 Progressive Labs</div>
            <div className="text-slate-500 text-[11px]">Level 0 to Level 8</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 dark:text-slate-500 uppercase text-[10px]">Architectural Families</span>
            <div className="text-emerald-600 dark:text-emerald-400 text-base font-bold font-sans">7 Core Families</div>
            <div className="text-slate-500 text-[11px]">+ Continuous Frontiers</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 dark:text-slate-500 uppercase text-[10px]">Your Progress</span>
            <div className="text-emerald-700 dark:text-emerald-300 text-base font-bold font-sans">
              {completedCount} / {levels.length} Labs ({progressPct}%)
            </div>
            <div className="text-slate-500 text-[11px]">Auto-saved locally</div>
          </div>

          <div className="space-y-1">
            <span className="text-slate-400 dark:text-slate-500 uppercase text-[10px]">Simulations</span>
            <div className="text-slate-900 dark:text-white text-base font-bold font-sans">Real Math Engine</div>
            <div className="text-slate-500 text-[11px]">Instant interactive canvas</div>
          </div>
        </div>
      </div>

      {/* Progress Track Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 text-xs shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Track Progress:</span>
          <div className="w-36 sm:w-60 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{progressPct}%</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">
            {completedCount} of {levels.length} labs mastered
          </span>
          {onOpenBadges && (
            <button
              onClick={onOpenBadges}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-200 dark:border-emerald-500/20 transition-colors cursor-pointer"
            >
              <Trophy className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Badges & Milestones</span>
            </button>
          )}
          {completedCount > 0 && (
            <button
              onClick={handleResetProgress}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Mental Model in 60 Seconds: Ground-Up Analogies */}
      <div className="p-6 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            The 60-Second Mental Model: What Are Neural Networks Made Of?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">1. Inputs (x)</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Raw sensory values: pixel brightness, audio frequencies, or word tokens.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">2. Weights (W)</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Volume dials. They amplify or silence incoming signals based on importance.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">3. Bias (b)</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Counterweight spring. Determines how much evidence is needed before firing.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">4. Activation (σ)</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Non-linear snap switch (ReLU, Sigmoid). Prevents deep stacks from collapsing into a single flat equation.
            </p>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">5. Architecture</span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              How units interconnect: Feedforward, Convolutions, Recurrence, Attention, or Continuous ODEs.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Search curriculum by architecture or concept (e.g. 'Mamba', 'XOR', 'ResNet', 'Attention', 'Diffusion', 'Water slide')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-xs transition-colors"
        />
      </div>

      {/* Curriculum Roadmap: Level 0 to Level 8 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              The Step-by-Step Curriculum Roadmap
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any lab to launch the live simulator, visual analogies, and code scratchpad.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
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
                className="p-5 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold">
                      LEVEL {lvl.level}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">{lvl.duration}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {lvl.title}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lvl.category}</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-white/5 font-mono text-xs text-emerald-700 dark:text-emerald-300 truncate">
                    {lvl.formula}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    <strong className="text-slate-900 dark:text-slate-100">Analogy: </strong>
                    {lvl.analogy}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  {isDone ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">Ready to start</span>
                  )}

                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Home Concept Checkpoint */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Pre-Flight Concept Check
          </h2>
        </div>
        <CheckpointQuiz
          quizKey="home_overview"
          title="Neural Architecture Core Intuitions"
          questions={homeQuizQuestions}
        />
      </div>

      {/* The 3-Question Taxonomy Section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-xs transition-colors">
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
            <Sliders className="w-4 h-4" />
            <span>Modern Research Framework</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Classifying Any Neural Network With 3 Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Neural networks do not form a single rigid tree: researchers combine <strong>Core Architectures</strong> (CNN, Transformer, SSM), <strong>Structural Mechanisms</strong> (Residual skips, normalization, attention), and <strong>Training Tasks</strong> (next-token prediction, diffusion, classification).
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => onSelectView('taxonomy')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <span>Explore 3-Question Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectView('code')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Open Code Workshop</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-white/5 space-y-2.5 text-xs font-mono">
          <div className="text-slate-600 dark:text-slate-300">
            <strong className="text-emerald-600 dark:text-emerald-400 block font-bold">1. Core Architecture?</strong>
            CNN, Transformer, SSM, GNN, MLP...
          </div>
          <div className="text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-white/5">
            <strong className="text-emerald-600 dark:text-emerald-400 block font-bold">2. Structural Mechanisms?</strong>
            Residuals (y = x + F(x)), LayerNorm, MoE...
          </div>
          <div className="text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-white/5">
            <strong className="text-emerald-600 dark:text-emerald-400 block font-bold">3. Training Task?</strong>
            Next-Token Prediction, Diffusion, Contrastive...
          </div>
        </div>
      </div>
    </div>
  );
};
