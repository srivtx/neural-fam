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
  { id: 'specialized', level: '8', title: 'Neural ODEs', tag: 'Specialized' },
];

export const BADGES: BadgeDefinition[] = [
  {
    id: 'badge_perceptron',
    title: 'Synapse Pioneer',
    tagline: 'Linear decision boundary',
    category: 'architecture',
    moduleId: 'perceptron',
    moduleLabel: 'Module 0 · Single Neuron',
    tier: 'Bronze',
    xpReward: 100,
    iconName: 'Zap',
    accentColor: '#4353ff',
    description: 'Understood the single-neuron linear decision boundary, dot products, bias offsets, and step activations.',
    requirement: 'Complete Module 0: Single neuron lab.',
    checkUnlocked: (p) => p.completedLabs.includes('perceptron') || p.solvedQuizzes.includes('perceptron'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('perceptron') || p.solvedQuizzes.includes('perceptron') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('perceptron') || p.solvedQuizzes.includes('perceptron') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_mlp',
    title: 'XOR Separation',
    tagline: 'Nonlinear representation space',
    category: 'architecture',
    moduleId: 'mlp',
    moduleLabel: 'Module 1 · MLP & XOR',
    tier: 'Bronze',
    xpReward: 120,
    iconName: 'Split',
    accentColor: '#2f3bf0',
    description: 'Understood how hidden layers fold representation space to separate nonlinear data.',
    requirement: 'Complete Module 1: MLP and feedforward lab.',
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
    tagline: 'Filters and skip connections',
    category: 'architecture',
    moduleId: 'cnn_resnet',
    moduleLabel: 'Module 2 · CNN & ResNet',
    tier: 'Silver',
    xpReward: 150,
    iconName: 'Layers',
    accentColor: '#0284c7',
    description: 'Understood translation-invariant convolutional filters, spatial pooling, and residual skip connections y = x + F(x).',
    requirement: 'Complete Module 2: CNN and ResNet lab.',
    checkUnlocked: (p) => p.completedLabs.includes('cnn_resnet') || p.solvedQuizzes.includes('cnn_resnet'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('cnn_resnet') || p.solvedQuizzes.includes('cnn_resnet') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('cnn_resnet') || p.solvedQuizzes.includes('cnn_resnet') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_rnn',
    title: 'Temporal Recurrence',
    tagline: 'Sequential state memory',
    category: 'architecture',
    moduleId: 'rnn_lstm',
    moduleLabel: 'Module 3 · RNN & LSTM',
    tier: 'Silver',
    xpReward: 150,
    iconName: 'Clock',
    accentColor: '#d97706',
    description: 'Understood recurrent sequential state flow and LSTM gating mechanisms that address vanishing gradients.',
    requirement: 'Complete Module 3: Recurrent networks and LSTM lab.',
    checkUnlocked: (p) => p.completedLabs.includes('rnn_lstm') || p.solvedQuizzes.includes('rnn_lstm'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('rnn_lstm') || p.solvedQuizzes.includes('rnn_lstm') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('rnn_lstm') || p.solvedQuizzes.includes('rnn_lstm') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_transformer',
    title: 'Self-Attention',
    tagline: 'Pairwise query-key interaction',
    category: 'architecture',
    moduleId: 'transformer',
    moduleLabel: 'Module 4 · Transformers',
    tier: 'Gold',
    xpReward: 200,
    iconName: 'Sparkles',
    accentColor: '#7c3aed',
    description: 'Understood Query-Key-Value self-attention and parallel sequence processing.',
    requirement: 'Complete Module 4: Transformers and self-attention lab.',
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
    tagline: 'Linear-time selective scan',
    category: 'architecture',
    moduleId: 'ssm_mamba',
    moduleLabel: 'Module 5 · SSM & Mamba',
    tier: 'Gold',
    xpReward: 200,
    iconName: 'Binary',
    accentColor: '#2563eb',
    description: 'Understood continuous state-space representations, selective discretization B(x), and linear-time sequence scans.',
    requirement: 'Complete Module 5: State-space models and Mamba lab.',
    checkUnlocked: (p) => p.completedLabs.includes('ssm_mamba') || p.solvedQuizzes.includes('ssm_mamba'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('ssm_mamba') || p.solvedQuizzes.includes('ssm_mamba') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('ssm_mamba') || p.solvedQuizzes.includes('ssm_mamba') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_gnn',
    title: 'Graph Message Passer',
    tagline: 'Permutation-invariant aggregation',
    category: 'architecture',
    moduleId: 'gnn',
    moduleLabel: 'Module 6 · Graph Neural Networks',
    tier: 'Gold',
    xpReward: 200,
    iconName: 'Share2',
    accentColor: '#0891b2',
    description: 'Understood permutation-invariant message passing across graph topologies.',
    requirement: 'Complete Module 6: Graph neural networks lab.',
    checkUnlocked: (p) => p.completedLabs.includes('gnn') || p.solvedQuizzes.includes('gnn'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('gnn') || p.solvedQuizzes.includes('gnn') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('gnn') || p.solvedQuizzes.includes('gnn') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_generative',
    title: 'Diffusion Denoising',
    tagline: 'Reverse noise estimation',
    category: 'architecture',
    moduleId: 'generative',
    moduleLabel: 'Module 7 · Diffusion & VAE',
    tier: 'Platinum',
    xpReward: 250,
    iconName: 'Flame',
    accentColor: '#e11d48',
    description: 'Understood generative paradigms including diffusion score estimation, VAE latents, and U-Net backbones.',
    requirement: 'Complete Module 7: Generative models lab.',
    checkUnlocked: (p) => p.completedLabs.includes('generative') || p.solvedQuizzes.includes('generative'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('generative') || p.solvedQuizzes.includes('generative') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('generative') || p.solvedQuizzes.includes('generative') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_neural_ode',
    title: 'Continuous Depth',
    tagline: 'Vector fields and ODE solvers',
    category: 'architecture',
    moduleId: 'specialized',
    moduleLabel: 'Module 8 · Neural ODEs',
    tier: 'Platinum',
    xpReward: 250,
    iconName: 'Orbit',
    accentColor: '#4f46e5',
    description: 'Understood continuous depth vector fields solved with numerical ODE integration.',
    requirement: 'Complete Module 8: Neural ODEs and specialized models lab.',
    checkUnlocked: (p) => p.completedLabs.includes('specialized') || p.solvedQuizzes.includes('specialized'),
    getProgress: (p) => ({
      current: p.completedLabs.includes('specialized') || p.solvedQuizzes.includes('specialized') ? 1 : 0,
      total: 1,
      label: p.completedLabs.includes('specialized') || p.solvedQuizzes.includes('specialized') ? 'Completed' : '0/1 Completed',
    }),
  },
  {
    id: 'badge_quiz_champion',
    title: 'Checkpoint Explorer',
    tagline: 'Theory and mechanics',
    category: 'milestone',
    tier: 'Silver',
    xpReward: 200,
    iconName: 'CheckCircle2',
    accentColor: '#4353ff',
    description: 'Answered 4 or more architecture concept check quizzes correctly.',
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
    title: 'Code Workshop Tester',
    tagline: 'From math to code',
    category: 'milestone',
    tier: 'Gold',
    xpReward: 220,
    iconName: 'Code2',
    accentColor: '#0ea5e9',
    description: 'Ran unit test suites in the code workshop across multiple architectures.',
    requirement: 'Run unit test suites for at least 3 architectures in the code workshop.',
    checkUnlocked: (p) => p.runCodeTests.length >= 3,
    getProgress: (p) => ({
      current: Math.min(p.runCodeTests.length, 3),
      total: 3,
      label: `${Math.min(p.runCodeTests.length, 3)}/3 test suites run`,
    }),
  },
  {
    id: 'badge_grandmaster',
    title: 'Atlas Explorer',
    tagline: 'All nine architecture modules completed',
    category: 'mastery',
    tier: 'Diamond',
    xpReward: 500,
    iconName: 'Trophy',
    accentColor: '#f59e0b',
    description: 'Completed all 9 neural architecture modules from the 1958 Perceptron to continuous Neural ODEs.',
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
  // Level 7: 3800+ (Atlas Architect)
  const LEVEL_THRESHOLDS = [
    { level: 1, minXp: 0, maxXp: 250, title: 'Novice Observer' },
    { level: 2, minXp: 250, maxXp: 600, title: 'Synaptic Builder' },
    { level: 3, minXp: 600, maxXp: 1100, title: 'Deep Visionary' },
    { level: 4, minXp: 1100, maxXp: 1800, title: 'Attention Specialist' },
    { level: 5, minXp: 1800, maxXp: 2700, title: 'State-Space Pilot' },
    { level: 6, minXp: 2700, maxXp: 3800, title: 'Generative Architect' },
    { level: 7, minXp: 3800, maxXp: 5000, title: 'Atlas Architect' },
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
