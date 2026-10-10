/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LearningProgress } from '../utils/progressStore';

export interface BadgeDefinition {
  id: string;
  title: string;
  tagline: string;
  category: 'architecture' | 'milestone' | 'mastery';
  moduleId?: string; // target lab ID for quick jump
  moduleLabel?: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  xpReward: number;
  iconName: string;
  accentColor: string;
  description: string;
  requirement: string;
  checkUnlocked: (progress: LearningProgress) => boolean;
  getProgress: (progress: LearningProgress) => { current: number; total: number; label: string };
}

export const ARCHITECTURE_MODULES = [
  { id: 'perceptron', level: '0', title: 'Single Neuron', tag: 'Perceptron' },
  { id: 'mlp', level: '1', title: 'MLP & XOR', tag: 'Feedforward' },
  { id: 'cnn_resnet', level: '2', title: 'CNN & ResNet', tag: 'Vision & Skips' },
  { id: 'rnn_lstm', level: '3', title: 'RNN & LSTM', tag: 'Sequence Memory' },
  { id: 'transformer', level: '4', title: 'Transformers', tag: 'Self-Attention' },
  { id: 'ssm_mamba', level: '5', title: 'SSM & Mamba', tag: 'State Spaces' },
  { id: 'gnn', level: '6', title: 'Graph Networks', tag: 'Message Passing' },
  { id: 'generative', level: '7', title: 'Diffusion & VAE', tag: 'Generative' },
  { id: 'specialized', level: '8', title: 'Neural ODEs', tag: 'Frontiers' },
];

export const BADGES: BadgeDefinition[] = [
  {
    id: 'badge_perceptron',
    title: 'Synapse Pioneer',
    tagline: 'First Step Across the Threshold',
    category: 'architecture',
    moduleId: 'perceptron',
    moduleLabel: 'Module 0 · Single Neuron',
    tier: 'Bronze',
    xpReward: 100,
    iconName: 'Zap',
    accentColor: '#10b981', // emerald
    description: 'Mastered the single neuron linear separation hyperplane, dot products, bias offsets, and step activations.',
    requirement: 'Complete Module 0: Single Neuron Lab and pass its concept check.',
    checkUnlocked: (p) => p.completedLabs.includes('perceptron') || p.solvedQuizzes.includes('perceptron'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('perceptron') || p.solvedQuizzes.includes('perceptron') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('perceptron') || p.solvedQuizzes.includes('perceptron') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_mlp',
    title: 'XOR Shatterer',
    tagline: 'Non-Linear Space Warper',
    category: 'architecture',
    moduleId: 'mlp',
    moduleLabel: 'Module 1 · MLP & XOR',
    tier: 'Bronze',
    xpReward: 120,
    iconName: 'Split',
    accentColor: '#059669', // emerald dark
    description: 'Overcame the Minsky & Papert linear limitation by warping representation space with hidden layers.',
    requirement: 'Complete Module 1: MLP & Feedforward Lab.',
    checkUnlocked: (p) => p.completedLabs.includes('mlp') || p.solvedQuizzes.includes('mlp'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('mlp') || p.solvedQuizzes.includes('mlp') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('mlp') || p.solvedQuizzes.includes('mlp') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_cnn',
    title: 'Spatial Convolver',
    tagline: 'Kernel Slider & Skip Highway',
    category: 'architecture',
    moduleId: 'cnn_resnet',
    moduleLabel: 'Module 2 · CNN & ResNet',
    tier: 'Silver',
    xpReward: 150,
    iconName: 'Layers',
    accentColor: '#0284c7', // sky
    description: 'Harnessed translation-invariant convolutional filters, spatial pooling, and identity residual shortcuts F(x) + x.',
    requirement: 'Complete Module 2: CNN & ResNet Lab.',
    checkUnlocked: (p) => p.completedLabs.includes('cnn_resnet') || p.solvedQuizzes.includes('cnn_resnet'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('cnn_resnet') || p.solvedQuizzes.includes('cnn_resnet') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('cnn_resnet') || p.solvedQuizzes.includes('cnn_resnet') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_rnn',
    title: 'Temporal Gatekeeper',
    tagline: 'Memory Cell Guardian',
    category: 'architecture',
    moduleId: 'rnn_lstm',
    moduleLabel: 'Module 3 · RNN & LSTM',
    tier: 'Silver',
    xpReward: 150,
    iconName: 'Clock',
    accentColor: '#d97706', // amber
    description: 'Controlled recurrent sequential information flow using forget, input, and output gates to conquer vanishing gradients.',
    requirement: 'Complete Module 3: RNN & LSTM Laboratory.',
    checkUnlocked: (p) => p.completedLabs.includes('rnn_lstm') || p.solvedQuizzes.includes('rnn_lstm'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('rnn_lstm') || p.solvedQuizzes.includes('rnn_lstm') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('rnn_lstm') || p.solvedQuizzes.includes('rnn_lstm') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_transformer',
    title: 'Attention Maestro',
    tagline: 'All You Need is Softmax(QKᵀ / √d)',
    category: 'architecture',
    moduleId: 'transformer',
    moduleLabel: 'Module 4 · Transformers',
    tier: 'Gold',
    xpReward: 200,
    iconName: 'Sparkles',
    accentColor: '#7c3aed', // violet
    description: 'Decoupled sequence length from compute paths using Query-Key-Value self-attention and multi-head parallel projections.',
    requirement: 'Complete Module 4: Transformer & Attention Lab.',
    checkUnlocked: (p) => p.completedLabs.includes('transformer') || p.solvedQuizzes.includes('transformer'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('transformer') || p.solvedQuizzes.includes('transformer') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('transformer') || p.solvedQuizzes.includes('transformer') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_mamba',
    title: 'State-Space Navigator',
    tagline: 'Linear-Time Selective Scan',
    category: 'architecture',
    moduleId: 'ssm_mamba',
    moduleLabel: 'Module 5 · SSM & Mamba',
    tier: 'Gold',
    xpReward: 200,
    iconName: 'Binary',
    accentColor: '#2563eb', // blue
    description: 'Traversed continuous state-space representations, selective discretization B(x), and hardware-aware associative scans.',
    requirement: 'Complete Module 5: SSM & Mamba Lab.',
    checkUnlocked: (p) => p.completedLabs.includes('ssm_mamba') || p.solvedQuizzes.includes('ssm_mamba'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('ssm_mamba') || p.solvedQuizzes.includes('ssm_mamba') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('ssm_mamba') || p.solvedQuizzes.includes('ssm_mamba') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_gnn',
    title: 'Relational Grapher',
    tagline: 'Permutation Invariant Message Passer',
    category: 'architecture',
    moduleId: 'gnn',
    moduleLabel: 'Module 6 · Graph Neural Networks',
    tier: 'Gold',
    xpReward: 200,
    iconName: 'Share2',
    accentColor: '#0891b2', // cyan
    description: 'Propagated structural node embeddings across irregular non-Euclidean graphs via localized message passing.',
    requirement: 'Complete Module 6: Graph Networks Lab.',
    checkUnlocked: (p) => p.completedLabs.includes('gnn') || p.solvedQuizzes.includes('gnn'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('gnn') || p.solvedQuizzes.includes('gnn') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('gnn') || p.solvedQuizzes.includes('gnn') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_generative',
    title: 'Diffusion Alchemist',
    tagline: 'Reverse Noise Trajectory Sculptor',
    category: 'architecture',
    moduleId: 'generative',
    moduleLabel: 'Module 7 · Diffusion & VAE',
    tier: 'Platinum',
    xpReward: 250,
    iconName: 'Flame',
    accentColor: '#e11d48', // rose
    description: 'Synthesized complex high-dimensional distributions through latent KL regularization and reverse stochastic differential equations.',
    requirement: 'Complete Module 7: Generative Diffusion & VAE Lab.',
    checkUnlocked: (p) => p.completedLabs.includes('generative') || p.solvedQuizzes.includes('generative'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('generative') || p.solvedQuizzes.includes('generative') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('generative') || p.solvedQuizzes.includes('generative') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_neural_ode',
    title: 'Continuous Dynamicist',
    tagline: 'Infinite Depth via ODE Solvers',
    category: 'architecture',
    moduleId: 'specialized',
    moduleLabel: 'Module 8 · Neural ODEs',
    tier: 'Platinum',
    xpReward: 250,
    iconName: 'Orbit',
    accentColor: '#4f46e5', // indigo
    description: 'Replaced discrete layers with continuous vector fields solved via Runge-Kutta numerical integration and adjoint backpropagation.',
    requirement: 'Complete Module 8: Neural ODEs & Specialized Frontiers.',
    checkUnlocked: (p) => p.completedLabs.includes('specialized') || p.solvedQuizzes.includes('specialized'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('specialized') || p.solvedQuizzes.includes('specialized') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('specialized') || p.solvedQuizzes.includes('specialized') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_quiz_champion',
    title: 'Concept Checkpoint Ace',
    tagline: 'Theory & Intuition Invariant',
    category: 'milestone',
    tier: 'Silver',
    xpReward: 200,
    iconName: 'CheckCircle2',
    accentColor: '#10b981',
    description: 'Demonstrated deep conceptual understanding by answering 4 or more architecture checkpoints correctly on the first attempt.',
    requirement: 'Pass at least 4 architecture concept quizzes.',
    checkUnlocked: (p) => p.solvedQuizzes.length >= 4,
    getProgress: (p) => ({
      current: Math.min(p.solvedQuizzes.length, 4),
      total: 4,
      label: `${Math.min(p.solvedQuizzes.length, 4)}/4 quizzes solved`,
    }),
  },
  {
    id: 'badge_code_architect',
    title: 'Kernel Synthesizer',
    tagline: 'From Math to Executable Tensors',
    category: 'milestone',
    tier: 'Gold',
    xpReward: 220,
    iconName: 'Code2',
    accentColor: '#0ea5e9',
    description: 'Executed and passed automated mathematical invariant unit tests in the Code Workshop sandbox across multiple families.',
    requirement: 'Execute unit test suites for at least 3 architectures in the Code Workshop.',
    checkUnlocked: (p) => p.runCodeTests.length >= 3,
    getProgress: (p) => ({
      current: Math.min(p.runCodeTests.length, 3),
      total: 3,
      label: `${Math.min(p.runCodeTests.length, 3)}/3 test suites run`,
    }),
  },
  {
    id: 'badge_grandmaster',
    title: 'Grandmaster Architect',
    tagline: 'Unified Master of the Neural Atlas',
    category: 'mastery',
    tier: 'Diamond',
    xpReward: 500,
    iconName: 'Trophy',
    accentColor: '#f59e0b', // amber gold
    description: 'Completed all 9 core neural architecture modules spanning from Rosenblatt’s 1958 Perceptron to continuous Neural ODEs.',
    requirement: 'Complete all 9 architecture modules across the platform.',
    checkUnlocked: (p) => {
      const allModules = ['perceptron', 'mlp', 'cnn_resnet', 'rnn_lstm', 'transformer', 'ssm_mamba', 'gnn', 'generative', 'specialized'];
      return allModules.every((id) => p.completedLabs.includes(id) || p.solvedQuizzes.includes(id));
    },
    getProgress: (p) => {
      const allModules = ['perceptron', 'mlp', 'cnn_resnet', 'rnn_lstm', 'transformer', 'ssm_mamba', 'gnn', 'generative', 'specialized'];
      const completed = allModules.filter((id) => p.completedLabs.includes(id) || p.solvedQuizzes.includes(id)).length;
      return {
        current: completed,
        total: 9,
        label: `${completed}/9 modules complete`,
      };
    },
  },
];

export interface UserStats {
  totalXp: number;
  level: number;
  rankTitle: string;
  nextLevelXp: number;
  prevLevelXp: number;
  levelProgressPercent: number;
  unlockedBadgesCount: number;
  totalBadgesCount: number;
  completedModulesCount: number;
  totalModulesCount: number;
  solvedQuizzesCount: number;
  runCodeTestsCount: number;
}

export function computeUserStats(progress: LearningProgress): UserStats {
  const allModules = ['perceptron', 'mlp', 'cnn_resnet', 'rnn_lstm', 'transformer', 'ssm_mamba', 'gnn', 'generative', 'specialized'];
  const completedModulesCount = allModules.filter(
    (id) => p_hasModule(progress, id)
  ).length;

  const solvedQuizzesCount = progress.solvedQuizzes.length;
  const runCodeTestsCount = progress.runCodeTests.length;

  let totalXp = 0;

  // Base module XP (100 per completed module)
  totalXp += completedModulesCount * 100;
  // Quizzes XP (50 each)
  totalXp += solvedQuizzesCount * 50;
  // Code tests XP (40 each)
  totalXp += runCodeTestsCount * 40;

  // Badge unlock rewards
  let unlockedCount = 0;
  BADGES.forEach((b) => {
    if (b.checkUnlocked(progress)) {
      unlockedCount += 1;
      totalXp += b.xpReward;
    }
  });

  // Calculate Level & Rank
  // Levels:
  // Level 1: 0 - 250 (Novice Observer)
  // Level 2: 250 - 600 (Synaptic Builder)
  // Level 3: 600 - 1100 (Deep Visionary)
  // Level 4: 1100 - 1800 (Attention Specialist)
  // Level 5: 1800 - 2700 (State Space Pilot)
  // Level 6: 2700 - 3800 (Generative Architect)
  // Level 7: 3800+ (Foundation Grandmaster)
  const LEVEL_THRESHOLDS = [
    { level: 1, minXp: 0, maxXp: 250, title: 'Novice Observer' },
    { level: 2, minXp: 250, maxXp: 600, title: 'Synaptic Builder' },
    { level: 3, minXp: 600, maxXp: 1100, title: 'Deep Visionary' },
    { level: 4, minXp: 1100, maxXp: 1800, title: 'Attention Specialist' },
    { level: 5, minXp: 1800, maxXp: 2700, title: 'State-Space Pilot' },
    { level: 6, minXp: 2700, maxXp: 3800, title: 'Generative Architect' },
    { level: 7, minXp: 3800, maxXp: 5000, title: 'Foundation Grandmaster' },
  ];

  let currentTier = LEVEL_THRESHOLDS[0];
  for (const tier of LEVEL_THRESHOLDS) {
    if (totalXp >= tier.minXp) {
      currentTier = tier;
    }
  }

  const range = currentTier.maxXp - currentTier.minXp;
  const progressInLevel = Math.max(0, totalXp - currentTier.minXp);
  const percent = Math.min(100, Math.round((progressInLevel / range) * 100));

  return {
    totalXp,
    level: currentTier.level,
    rankTitle: currentTier.title,
    nextLevelXp: currentTier.maxXp,
    prevLevelXp: currentTier.minXp,
    levelProgressPercent: percent,
    unlockedBadgesCount: unlockedCount,
    totalBadgesCount: BADGES.length,
    completedModulesCount,
    totalModulesCount: allModules.length,
    solvedQuizzesCount,
    runCodeTestsCount,
  };
}

function p_hasModule(progress: LearningProgress, id: string): boolean {
  return progress.completedLabs.includes(id) || progress.solvedQuizzes.includes(id);
}
