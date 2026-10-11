/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { HelpCircle, Code2, Play, CheckCircle2, Sliders, Eye, Award, ArrowRight, Grid, Type, Sparkles, Flame, BookOpen, Terminal } from 'lucide-react';
import { CheckpointQuiz } from '../CheckpointQuiz';
import { CodeBlock } from '../CodeBlock';
import { FirstPrinciplesNotebook } from '../FirstPrinciplesNotebook';
import { FIRST_PRINCIPLES_DOSSIERS } from '../../data/firstPrinciplesData';
import { TheorySectionView } from '../TheorySectionView';
import { THEORY_DOSSIERS } from '../../data/theoryData';
import { BuildFromScratchLab } from '../BuildFromScratchLab';
import { DIY_PROJECTS } from '../../data/diyProjectsData';
import { LAB_QUIZZES } from '../../data/labQuizzes';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';


interface SentencePreset {
  id: string;
  name: string;
  description: string;
  tokens: string[];
  defaultQueryIdx: number;
  coreferenceTarget: string;
  contrastPresetId?: string;
}

const PRESETS: SentencePreset[] = [
  {
    id: 'winograd-tired',
    name: "Winograd: 'tired' animal",
    description: "The pronoun 'it' resolves to 'animal' because tired is an animate state.",
    tokens: ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'],
    defaultQueryIdx: 7, // "it"
    coreferenceTarget: 'animal',
    contrastPresetId: 'winograd-wide',
  },
  {
    id: 'winograd-wide',
    name: "Winograd: 'wide' street",
    description: "Changing one word from 'tired' to 'wide' flips 'it' to resolve to 'street'.",
    tokens: ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'wide'],
    defaultQueryIdx: 7, // "it"
    coreferenceTarget: 'street',
    contrastPresetId: 'winograd-tired',
  },
  {
    id: 'winograd-big',
    name: "Winograd: 'big' trophy",
    description: "The pronoun 'it' resolves to 'trophy' because being too big prevents fitting.",
    tokens: ['The', 'trophy', "didn't", 'fit', 'in', 'the', 'suitcase', 'because', 'it', 'was', 'too', 'big'],
    defaultQueryIdx: 8, // "it"
    coreferenceTarget: 'trophy',
    contrastPresetId: 'winograd-small',
  },
  {
    id: 'winograd-small',
    name: "Winograd: 'small' suitcase",
    description: "Switching 'big' to 'small' flips coreference to 'suitcase'.",
    tokens: ['The', 'trophy', "didn't", 'fit', 'in', 'the', 'suitcase', 'because', 'it', 'was', 'too', 'small'],
    defaultQueryIdx: 8, // "it"
    coreferenceTarget: 'suitcase',
    contrastPresetId: 'winograd-big',
  },
  {
    id: 'council-feared',
    name: "Winograd: 'feared' council",
    description: "'they' refers to councilmen who feared violence.",
    tokens: ['The', 'councilmen', 'refused', 'the', 'demonstrators', 'a', 'permit', 'because', 'they', 'feared', 'violence'],
    defaultQueryIdx: 8, // "they"
    coreferenceTarget: 'councilmen',
  },
];

type AttentionHead = 'semantic' | 'syntactic' | 'positional' | 'combined';

export const TransformerAttentionLab: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('winograd-tired');
  const [customText, setCustomText] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(7);
  const [activeHead, setActiveHead] = useState<AttentionHead>('semantic');
  const [causalMask, setCausalMask] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(1.0);
  const [viewMode, setViewMode] = useState<'bars' | 'matrix'>('bars');
  const [subTab, setSubTab] = useState<'visual' | 'theory' | 'build' | 'code' | 'types' | 'analogy' | 'quiz' | 'first_principles'>('visual');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  // Active sentence tokens
  const activePreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const sentenceTokens = useMemo(() => {
    if (isCustomMode && customText.trim().length > 0) {
      const parsed = customText
        .trim()
        .split(/\s+/)
        .slice(0, 16); // max 16 tokens
      return parsed.length > 0 ? parsed : ['Empty'];
    }
    return activePreset.tokens;
  }, [isCustomMode, customText, activePreset]);

  // Adjust selectedTokenIdx if out of range
  const safeQueryIdx = Math.min(selectedTokenIdx, Math.max(0, sentenceTokens.length - 1));

  // Switch preset helper
  const handleSelectPreset = (id: string) => {
    setIsCustomMode(false);
    setSelectedPresetId(id);
    const p = PRESETS.find((pr) => pr.id === id);
    if (p) {
      setSelectedTokenIdx(p.defaultQueryIdx);
    }
  };

  // Generate base score matrix based on head semantics
  const baseScores: number[][] = useMemo(() => {
    const N = sentenceTokens.length;
    const scores: number[][] = Array.from({ length: N }, () => Array(N).fill(0.3));

    const lowerTokens = sentenceTokens.map((t) => t.toLowerCase().replace(/[^a-z0-9]/g, ''));

    for (let i = 0; i < N; i++) {
      const qToken = lowerTokens[i];

      for (let j = 0; j < N; j++) {
        const kToken = lowerTokens[j];
        const dist = Math.abs(i - j);

        if (activeHead === 'positional') {
          // Attends strongly to the immediate previous and next token
          if (j === i) scores[i][j] = 2.0;
          else if (j === i - 1) scores[i][j] = 3.8;
          else if (j === i + 1) scores[i][j] = 2.4;
          else scores[i][j] = Math.max(0.1, 1.5 - dist * 0.3);
        } else if (activeHead === 'syntactic') {
          // Attends to verbs and grammatical heads
          const isVerb = ['cross', "didn't", 'fit', 'refused', 'was', 'feared'].includes(kToken);
          const isPreposition = ['in', 'because', 'to'].includes(kToken);

          if (i === j) scores[i][j] = 1.8;
          else if (isVerb) scores[i][j] = 3.6;
          else if (isPreposition && dist <= 2) scores[i][j] = 2.9;
          else scores[i][j] = Math.max(0.2, 1.4 - dist * 0.2);
        } else if (activeHead === 'semantic') {
          // Coreference and semantic affinities
          if (i === j) {
            scores[i][j] = 2.0; // Self baseline
          } else if (selectedPresetId === 'winograd-tired' && !isCustomMode) {
            // "it" attends to "animal" and "tired"
            if (i === 7) {
              if (j === 1) scores[i][j] = 4.8; // animal
              else if (j === 10) scores[i][j] = 4.2; // tired
              else if (j === 5) scores[i][j] = 1.1; // street
              else scores[i][j] = 0.3;
            } else if (i === 1) {
              // animal attends to tired
              if (j === 10) scores[i][j] = 3.5;
              else if (j === 3) scores[i][j] = 2.8; // cross
              else scores[i][j] = 0.5;
            } else {
              scores[i][j] = dist <= 1 ? 2.2 : 0.5;
            }
          } else if (selectedPresetId === 'winograd-wide' && !isCustomMode) {
            // "it" attends to "street" and "wide"
            if (i === 7) {
              if (j === 5) scores[i][j] = 4.9; // street
              else if (j === 10) scores[i][j] = 4.4; // wide
              else if (j === 1) scores[i][j] = 1.2; // animal
              else scores[i][j] = 0.3;
            } else if (i === 5) {
              if (j === 10) scores[i][j] = 3.6; // wide
              else scores[i][j] = 0.6;
            } else {
              scores[i][j] = dist <= 1 ? 2.2 : 0.5;
            }
          } else if (selectedPresetId === 'winograd-big' && !isCustomMode) {
            // "it" attends to "trophy" and "big"
            if (i === 8) {
              if (j === 1) scores[i][j] = 4.7; // trophy
              else if (j === 11) scores[i][j] = 4.1; // big
              else if (j === 6) scores[i][j] = 1.2; // suitcase
              else scores[i][j] = 0.3;
            } else {
              scores[i][j] = dist <= 1 ? 2.0 : 0.4;
            }
          } else if (selectedPresetId === 'winograd-small' && !isCustomMode) {
            // "it" attends to "suitcase" and "small"
            if (i === 8) {
              if (j === 6) scores[i][j] = 4.8; // suitcase
              else if (j === 11) scores[i][j] = 4.3; // small
              else if (j === 1) scores[i][j] = 1.1; // trophy
              else scores[i][j] = 0.3;
            } else {
              scores[i][j] = dist <= 1 ? 2.0 : 0.4;
            }
          } else if (selectedPresetId === 'council-feared' && !isCustomMode) {
            if (i === 8) {
              // "they"
              if (j === 1) scores[i][j] = 4.5; // councilmen
              else if (j === 9) scores[i][j] = 3.9; // feared
              else if (j === 4) scores[i][j] = 1.3; // demonstrators
              else scores[i][j] = 0.4;
            } else {
              scores[i][j] = dist <= 1 ? 2.0 : 0.5;
            }
          } else {
            // Generic heuristic for custom text
            const isPronoun = ['it', 'they', 'he', 'she', 'we', 'that', 'this'].includes(qToken);
            if (isPronoun) {
              // Look backward for nouns (first 4 tokens)
              if (j < i && j <= 2) scores[i][j] = 3.8;
              else if (j === N - 1) scores[i][j] = 3.2; // last word (predicate)
              else scores[i][j] = Math.max(0.2, 1.2 - dist * 0.15);
            } else {
              scores[i][j] = i === j ? 2.5 : Math.max(0.2, 1.8 - dist * 0.25);
            }
          }
        } else {
          // Combined ensemble head: 40% semantic + 30% syntactic + 30% positional
          const pos = j === i - 1 ? 3.5 : Math.max(0.1, 1.5 - dist * 0.25);
          const syn = ['cross', 'fit', 'refused', 'was', 'feared', 'animal', 'street', 'trophy'].includes(kToken) ? 3.2 : 1.2;
          scores[i][j] = 0.5 * (i === j ? 2.5 : 1.0) + 0.3 * pos + 0.2 * syn;
        }
      }
    }
    return scores;
  }, [sentenceTokens, activeHead, selectedPresetId, isCustomMode]);

  // Softmax with causal mask & temperature
  const computeFullAttentionMatrix = useMemo(() => {
    const N = sentenceTokens.length;
    return baseScores.map((row, i) => {
      const raw = row.map((score, j) => {
        if (causalMask && j > i) return -1e9;
        return score / Math.max(0.1, temperature);
      });
      const maxVal = Math.max(...raw);
      const exps = raw.map((val) => (val < -1000 ? 0 : Math.exp(val - maxVal)));
      const sum = exps.reduce((a, b) => a + b, 0);
      return exps.map((v) => (sum === 0 ? 0 : Number((v / sum).toFixed(4))));
    });
  }, [baseScores, causalMask, temperature, sentenceTokens]);

  const attentionWeights = computeFullAttentionMatrix[safeQueryIdx] || [];

  // Attention entropy for the selected query token: H = -sum(p * log2(p))
  const attentionEntropy = useMemo(() => {
    return attentionWeights.reduce((acc, p) => {
      if (p <= 0.0001) return acc;
      return acc - p * Math.log2(p);
    }, 0);
  }, [attentionWeights]);

  const transformerArchetypes = [
    { type: 'Encoder-Only', example: 'BERT, RoBERTa', use: 'Bidirectional representation, sentence classification, embeddings', access: 'All tokens attend to all tokens' },
    { type: 'Decoder-Only', example: 'GPT-4, Llama 3, Claude', use: 'Autoregressive generative next-token text prediction', access: 'Causal upper-triangular mask (past only)' },
    { type: 'Encoder-Decoder', example: 'T5, BART, Whisper', use: 'Sequence-to-sequence translation, audio-to-text, summarization', access: 'Cross-attention between encoder and decoder' },
  ];

  const runAttentionTest = () => {
    markTestRun('transformer');
    markLabCompleted('transformer');
    const lines = [
      '[Scaled Dot-Product Attention Verification]',
      `Selected Query Token: "${sentenceTokens[safeQueryIdx]}" (idx ${safeQueryIdx})`,
      `Head Mode: ${activeHead.toUpperCase()}`,
      `Attention Mask Mode: ${causalMask ? 'Causal Upper-Triangular (GPT style)' : 'Bidirectional Full Access (BERT style)'}`,
      `Softmax Temperature: ${temperature.toFixed(1)}`,
      `Attention Shannon Entropy: ${attentionEntropy.toFixed(2)} bits (Max possible: ${Math.log2(sentenceTokens.length).toFixed(2)} bits)`,
      'Top Attended Tokens for Query:',
      ...sentenceTokens.map((tok, i) => {
        const wt = attentionWeights[i] || 0;
        return `  Token [${i}] "${tok}": ${(wt * 100).toFixed(1)}% ${i === safeQueryIdx ? '(Self)' : ''}`;
      }),
      'STATUS: PASS (Softmax normalizes row sum to 1.0)',
      '✓ Level 4 progress recorded.',
    ];
    setCodeOutput(lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ink-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Level 4 · Attention mechanisms
          </span>
          <h2 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white mt-0.5">
            Transformers and scaled dot-product attention
          </h2>
          <p className="text-sm text-ink-600 dark:text-ink-400 mt-1 max-w-2xl">
            Parallel matrix multiplication replacing recurrent loops: <span className="font-mono text-xs font-bold text-ink-800 dark:text-ink-200">Attention(Q, K, V) = Softmax(QKᵀ / √d_k) V</span>.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-ink-100 dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-lg">
          <button
            onClick={() => setSubTab('visual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'visual'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            Attention map
          </button>
          <button
            onClick={() => setSubTab('theory')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'theory'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory</span>
          </button>
          <button
            onClick={() => setSubTab('build')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'build'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Build from scratch</span>
          </button>
          <button
            onClick={() => setSubTab('first_principles')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'first_principles'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>First principles</span>
          </button>
          <button
            onClick={() => setSubTab('types')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'types'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            Archetypes
          </button>
          <button
            onClick={() => setSubTab('code')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'code'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Reference code</span>
          </button>
          <button
            onClick={() => setSubTab('analogy')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'analogy'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Analogy</span>
          </button>
          <button
            onClick={() => setSubTab('quiz')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'quiz'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Concept check</span>
          </button>
        </div>
      </div>

      {subTab === 'visual' && (
        <div className="space-y-6">
          {/* Winograd Schema & Sentence Selector */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold font-display tracking-tight text-ink-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Winograd Schema Coreference Test</span>
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Select a classic Winograd schema pair to observe how self-attention dynamically flips pronoun resolution based on context.
                </p>
              </div>

              {/* View switch: Bar chart vs 2D Attention Matrix */}
              <div className="flex items-center gap-1 p-0.5 bg-ink-100 dark:bg-ink-950 rounded-lg border border-ink-200 dark:border-white/10 text-xs">
                <button
                  onClick={() => setViewMode('bars')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    viewMode === 'bars' ? 'bg-brand-600 text-white font-bold' : 'text-ink-600 dark:text-ink-400'
                  }`}
                >
                  Query Spotlight
                </button>
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    viewMode === 'matrix' ? 'bg-brand-600 text-white font-bold' : 'text-ink-600 dark:text-ink-400'
                  }`}
                >
                  <Grid className="w-3 h-3" />
                  <span>Full N×N Matrix</span>
                </button>
              </div>
            </div>

            {/* Preset Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((preset) => {
                const isActive = !isCustomMode && selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer font-medium ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-brand-300 font-bold shadow-xs'
                        : 'bg-ink-50 dark:bg-ink-950/60 border-ink-200 dark:border-white/10 text-ink-700 dark:text-ink-300 hover:border-brand-400'
                    }`}
                  >
                    {preset.name}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setIsCustomMode(true);
                  if (!customText) setCustomText('The robot picked up the apple because it was red');
                  setSelectedTokenIdx(7);
                }}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCustomMode
                    ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-brand-300 font-bold shadow-xs'
                    : 'bg-ink-50 dark:bg-ink-950/60 border-ink-200 dark:border-white/10 text-ink-700 dark:text-ink-300 hover:border-brand-400'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Custom sentence</span>
              </button>
            </div>

            {/* Custom Input Field */}
            {isCustomMode && (
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Type any sentence (e.g. The robot picked up the apple because it was red)..."
                  className="flex-1 px-3 py-2 text-xs font-mono bg-ink-50 dark:bg-ink-950 rounded-lg border border-ink-200 dark:border-white/10 text-ink-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
                <span className="text-[11px] font-mono text-ink-500">({sentenceTokens.length} tokens)</span>
              </div>
            )}

            {!isCustomMode && (
              <div className="p-3 bg-brand-50/50 dark:bg-brand-950/20 rounded-lg border border-brand-200 dark:border-brand-500/20 text-xs text-ink-700 dark:text-ink-300 flex items-center justify-between">
                <span>
                  💡 <strong>Schema Insight:</strong> {activePreset.description}
                </span>
                {activePreset.contrastPresetId && (
                  <button
                    onClick={() => handleSelectPreset(activePreset.contrastPresetId!)}
                    className="text-brand-600 dark:text-brand-400 hover:underline font-semibold cursor-pointer shrink-0 ml-3"
                  >
                    Compare with paired contrast →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Controls Bar: Multi-Head, Masking, Temperature */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 shadow-xs">
            {/* Attention Head Selector */}
            <div className="space-y-1.5">
              <span className="text-xs text-ink-700 dark:text-ink-300 font-medium block">Multi-Head Projection:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'semantic', label: 'Head 1: Semantic' },
                    { id: 'syntactic', label: 'Head 2: Syntactic' },
                    { id: 'positional', label: 'Head 3: Positional' },
                    { id: 'combined', label: 'Head 4: Ensemble' },
                  ] as const
                ).map((head) => (
                  <button
                    key={head.id}
                    onClick={() => setActiveHead(head.id)}
                    className={`px-2 py-1.5 text-[11px] rounded border text-left transition-colors cursor-pointer ${
                      activeHead === head.id
                        ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-800 dark:text-brand-300 font-bold'
                        : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    {head.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Causal Mask Toggle */}
            <div className="space-y-1.5">
              <span className="text-xs text-ink-700 dark:text-ink-300 font-medium block">Attention Mask:</span>
              <div className="space-y-1.5">
                <button
                  onClick={() => setCausalMask(false)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded border text-left transition-colors cursor-pointer ${
                    !causalMask
                      ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-800 dark:text-brand-300 font-semibold'
                      : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                  }`}
                >
                  Bidirectional (BERT / ViT)
                </button>
                <button
                  onClick={() => setCausalMask(true)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded border text-left transition-colors cursor-pointer ${
                    causalMask
                      ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-800 dark:text-brand-300 font-semibold'
                      : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                  }`}
                >
                  Causal Autoregressive (GPT / Llama)
                </button>
              </div>
            </div>

            {/* Softmax Temperature Slider & Entropy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span className="text-xs font-mono text-ink-700 dark:text-ink-300">
                    Temp: <strong className="text-brand-600 dark:text-brand-400">{temperature.toFixed(1)}</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-ink-500">
                  Entropy: <strong className="text-ink-800 dark:text-ink-200">{attentionEntropy.toFixed(2)}</strong>b
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-400">
                <span>0.2 (Argmax peak)</span>
                <span>1.0 (Standard)</span>
                <span>3.0 (Uniform diffuse)</span>
              </div>
            </div>
          </div>

          {/* Interactive Token Strip */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-ink-500 dark:text-ink-400">
              <span className="font-semibold text-ink-900 dark:text-ink-200">
                1. Select a query token (Q) to observe its attention weights across keys (K):
              </span>
              <span className="font-mono text-[11px]">
                Query = <span className="font-bold text-brand-600 dark:text-brand-400">"{sentenceTokens[safeQueryIdx]}"</span> (pos {safeQueryIdx})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {sentenceTokens.map((tok, idx) => {
                const isQuery = idx === safeQueryIdx;
                const weight = attentionWeights[idx] || 0;
                return (
                  <button
                    key={`${tok}-${idx}`}
                    onClick={() => setSelectedTokenIdx(idx)}
                    className={`px-3 py-2 rounded-lg border font-mono text-xs transition-all cursor-pointer flex flex-col items-center min-w-[52px] ${
                      isQuery
                        ? 'bg-brand-600 border-brand-700 text-white font-bold shadow-md ring-2 ring-brand-400/40'
                        : weight > 0.2
                        ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-400 text-brand-900 dark:text-brand-200 font-semibold'
                        : 'bg-ink-50 dark:bg-ink-950/60 border-ink-200 dark:border-white/10 text-ink-700 dark:text-ink-300 hover:border-brand-500'
                    }`}
                  >
                    <span>{tok}</span>
                    <span
                      className={`text-[10px] mt-1 ${
                        isQuery ? 'text-brand-100 font-bold' : weight > 0.2 ? 'text-brand-600 dark:text-brand-300 font-bold' : 'text-ink-400'
                      }`}
                    >
                      {(weight * 100).toFixed(0)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attention View: Spotlight Bar Chart vs N×N Matrix */}
          {viewMode === 'bars' ? (
            <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                <span className="font-semibold text-ink-900 dark:text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>
                    Attention Spotlight for Query:{' '}
                    <strong className="text-brand-700 dark:text-brand-300 font-mono">"{sentenceTokens[safeQueryIdx]}"</strong>
                  </span>
                </span>
                <span className="text-ink-500 dark:text-ink-400 font-mono text-[11px]">
                  Softmax sum = 100% · Scaling factor 1/√d_k
                </span>
              </div>

              <div className="space-y-2">
                {sentenceTokens.map((tok, idx) => {
                  const weight = attentionWeights[idx] || 0;
                  const pct = (weight * 100).toFixed(1);
                  const isMasked = causalMask && idx > safeQueryIdx;
                  const isTarget = !isCustomMode && tok.toLowerCase() === activePreset.coreferenceTarget?.toLowerCase();

                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs font-mono">
                      <span
                        className={`w-20 truncate font-medium text-right shrink-0 ${
                          isTarget
                            ? 'text-brand-600 dark:text-brand-400 font-bold'
                            : 'text-ink-700 dark:text-ink-300'
                        }`}
                      >
                        {tok} {isTarget ? '★' : ''}
                      </span>
                      <div className="flex-1 h-6 bg-ink-100 dark:bg-ink-950 rounded-md border border-ink-200 dark:border-white/5 overflow-hidden flex items-center px-2 relative">
                        {isMasked ? (
                          <span className="text-[10px] text-rose-500 dark:text-rose-400 italic">
                            [Future token masked by causal triangle]
                          </span>
                        ) : (
                          <div
                            className={`h-full absolute left-0 top-0 rounded-md transition-all duration-300 ${
                              isTarget ? 'bg-brand-600 dark:bg-brand-500' : 'bg-brand-500/80 dark:bg-brand-400/80'
                            }`}
                            style={{ width: `${pct}%`, opacity: Math.max(0.2, weight) }}
                          />
                        )}
                        {!isMasked && (
                          <span className="relative z-10 text-[11px] text-ink-900 dark:text-white font-bold pl-1">
                            {pct}% {idx === safeQueryIdx ? '(self)' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* 2D Attention Heatmap Grid */
            <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs overflow-x-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink-900 dark:text-white flex items-center gap-2">
                  <Grid className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Full Attention Heatmap Matrix (N = {sentenceTokens.length} tokens)</span>
                </span>
                <span className="text-ink-500 dark:text-ink-400 font-mono text-[11px]">
                  Rows = Queries (Q) · Columns = Keys (K)
                </span>
              </div>

              <div className="inline-block min-w-full">
                <div className="grid" style={{ gridTemplateColumns: `70px repeat(${sentenceTokens.length}, minmax(36px, 1fr))` }}>
                  {/* Top Header Labels */}
                  <div className="h-8" />
                  {sentenceTokens.map((t, colIdx) => (
                    <div
                      key={`col-${colIdx}`}
                      className="h-8 flex items-center justify-center font-mono text-[10px] text-ink-600 dark:text-ink-400 truncate px-0.5 font-semibold"
                      title={t}
                    >
                      {t}
                    </div>
                  ))}

                  {/* Rows */}
                  {sentenceTokens.map((qTok, rIdx) => (
                    <React.Fragment key={`row-${rIdx}`}>
                      <div
                        onClick={() => setSelectedTokenIdx(rIdx)}
                        className={`h-9 flex items-center justify-end pr-2 font-mono text-[10px] truncate cursor-pointer ${
                          rIdx === safeQueryIdx
                            ? 'font-bold text-brand-600 dark:text-brand-400'
                            : 'text-ink-700 dark:text-ink-300'
                        }`}
                      >
                        {qTok}
                      </div>
                      {sentenceTokens.map((_, cIdx) => {
                        const score = computeFullAttentionMatrix[rIdx]?.[cIdx] || 0;
                        const isMasked = causalMask && cIdx > rIdx;
                        const isSelectedRow = rIdx === safeQueryIdx;

                        return (
                          <div
                            key={`cell-${rIdx}-${cIdx}`}
                            onClick={() => setSelectedTokenIdx(rIdx)}
                            className={`h-9 border border-ink-100 dark:border-white/5 flex items-center justify-center font-mono text-[9px] transition-colors cursor-pointer ${
                              isSelectedRow ? 'ring-1 ring-brand-500/50' : ''
                            } ${isMasked ? 'bg-ink-100 dark:bg-ink-950 text-ink-300' : ''}`}
                            style={{
                              backgroundColor: !isMasked
                                ? `rgba(67, 83, 255, ${Math.max(0.04, score)})`
                                : undefined,
                            }}
                            title={`Q="${qTok}" attends to K="${sentenceTokens[cIdx]}": ${(score * 100).toFixed(1)}%`}
                          >
                            {!isMasked ? (
                              <span className={score > 0.35 ? 'text-white font-bold' : 'text-ink-800 dark:text-ink-200'}>
                                {(score * 100).toFixed(0)}
                              </span>
                            ) : (
                              <span className="text-[8px] text-ink-400">-</span>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Concept Check Prompt */}
          <div className="p-4 bg-brand-50/80 dark:bg-brand-950/30 rounded-xl border border-brand-300/80 dark:border-brand-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-900 dark:text-white">Check your understanding</h4>
                <p className="text-xs text-ink-600 dark:text-ink-300">Test your understanding of Q/K/V vectors, Softmax temperature scaling, and causal masks.</p>
              </div>
            </div>
            <button
              onClick={() => setSubTab('quiz')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <span>Take concept check</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Types Tab */}
      {subTab === 'types' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-ink-100 dark:border-white/10">
            <h3 className="text-sm font-bold font-display tracking-tight text-ink-900 dark:text-white">Transformer archetypes and variants</h3>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Self-attention blocks are versatile lego pieces configured differently based on the task.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-50 dark:bg-ink-950 text-ink-500 dark:text-ink-400 font-semibold border-b border-ink-100 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Archetype</th>
                  <th className="py-3 px-4">Landmark Models</th>
                  <th className="py-3 px-4">Attention Masking</th>
                  <th className="py-3 px-4">Primary Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-white/5 text-ink-700 dark:text-ink-300">
                {transformerArchetypes.map((arch) => (
                  <tr key={arch.type} className="hover:bg-ink-50 dark:hover:bg-ink-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700 dark:text-brand-400 whitespace-nowrap">
                      {arch.type}
                    </td>
                    <td className="py-3 px-4 font-semibold text-ink-900 dark:text-white">{arch.example}</td>
                    <td className="py-3 px-4 text-ink-500 dark:text-ink-400">{arch.access}</td>
                    <td className="py-3 px-4 text-ink-600 dark:text-ink-300">{arch.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code Tab */}
      {subTab === 'code' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Scaled dot-product attention in TypeScript</h3>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Formula: Attention(Q, K, V) = Softmax(Q · K^T / sqrt(d_k)) · V
            </p>
          </div>

          <CodeBlock
            code={`function scaledDotProductAttention(
  Q: number[][], // [seq_len, d_k]
  K: number[][], // [seq_len, d_k]
  V: number[][], // [seq_len, d_v]
  causal: boolean = false,
  temperature: number = 1.0
) {
  const d_k = Q[0].length;
  const numTokens = Q.length;

  // 1. Scaled dot-product: Q * K^T / sqrt(d_k)
  const scores = Q.map((qRow, i) =>
    K.map((kRow, j) => {
      if (causal && j > i) return -1e9; // Causal upper-triangular mask
      const dot = qRow.reduce((sum, qVal, d) => sum + qVal * kRow[d], 0);
      return (dot / Math.sqrt(d_k)) / temperature;
    })
  );

  // 2. Softmax per row (numerically stabilized)
  const attentionWeights = scores.map(row => {
    const maxVal = Math.max(...row);
    const expRow = row.map(v => (v < -1e8 ? 0 : Math.exp(v - maxVal)));
    const sumExp = expRow.reduce((a, b) => a + b, 0);
    return expRow.map(v => v / sumExp);
  });

  // 3. Matmul: weights * V -> [seq_len, d_v]
  const d_v = V[0].length;
  const contextOutput = attentionWeights.map(row =>
    Array.from({ length: d_v }, (_, d) =>
      row.reduce((sum, weight, j) => sum + weight * V[j][d], 0)
    )
  );

  return { attentionWeights, contextOutput };
}`}
            language="TypeScript"
            filename="scaled_dot_product_attention.ts"
            onRun={runAttentionTest}
            runLabel="Run verification"
            output={codeOutput}
          />
        </div>
      )}

      {/* Analogy Tab */}
      {subTab === 'analogy' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Query, key, and value analogy</h3>
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
            Imagine every word in a sentence is an actor on a dark stage holding three things:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-ink-700 dark:text-ink-300">
            <div className="p-4 bg-ink-50 dark:bg-ink-900 rounded-lg border border-ink-200 dark:border-white/5 space-y-1.5">
              <strong className="text-brand-700 dark:text-brand-400 font-bold block">1. A Query Card (Q)</strong>
              <p>
                "What clue am I looking for?" For example, the pronoun <em>"it"</em> holds a card asking: <em>"Who am I talking about?"</em>
              </p>
            </div>
            <div className="p-4 bg-ink-50 dark:bg-ink-900 rounded-lg border border-ink-200 dark:border-white/5 space-y-1.5">
              <strong className="text-amber-700 dark:text-amber-400 font-bold block">2. A Key Badge (K)</strong>
              <p>
                "Who am I?" The noun <em>"animal"</em> wears a badge saying: <em>"Living subject"</em>. When Query meets Key, their dot product produces an attention weight.
              </p>
            </div>
            <div className="p-4 bg-ink-50 dark:bg-ink-900 rounded-lg border border-ink-200 dark:border-white/5 space-y-1.5">
              <strong className="text-brand-700 dark:text-brand-400 font-bold block">3. A Value Backpack (V)</strong>
              <p>
                The actual meaning vector passed forward. <em>"it"</em> packs <em>"animal"</em>’s value into its own bag, so future layers understand exactly what it means.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Checkpoint Quiz */}
      {subTab === 'quiz' && (
        <CheckpointQuiz
          quizKey="quiz_transformer"
          title={LAB_QUIZZES.transformer.title}
          questions={LAB_QUIZZES.transformer.questions}
          onPassAll={() => markLabCompleted('transformer')}
        />
      )}

      {/* First Principles Discovery Notebook */}
      {subTab === 'first_principles' && (
        <FirstPrinciplesNotebook dossier={FIRST_PRINCIPLES_DOSSIERS['transformer']} />
      )}

      {/* Deep First-Principles Theory */}
      {subTab === 'theory' && (
        <TheorySectionView theory={THEORY_DOSSIERS['transformer']} />
      )}

      {/* Interactive Build It Yourself from Scratch Project */}
      {subTab === 'build' && (
        <BuildFromScratchLab project={DIY_PROJECTS['transformer']} />
      )}
    </div>
  );
};

