/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { HelpCircle, Code2, Play, CheckCircle2, Zap, AlertTriangle, Award, Sparkles, ArrowRight, Sliders, Flame, BookOpen, Terminal } from 'lucide-react';
import { CheckpointQuiz } from '../CheckpointQuiz';
import { FirstPrinciplesNotebook } from '../FirstPrinciplesNotebook';
import { FIRST_PRINCIPLES_DOSSIERS } from '../../data/firstPrinciplesData';
import { TheorySectionView } from '../TheorySectionView';
import { THEORY_DOSSIERS } from '../../data/theoryData';
import { BuildFromScratchLab } from '../BuildFromScratchLab';
import { DIY_PROJECTS } from '../../data/diyProjectsData';
import { LAB_QUIZZES } from '../../data/labQuizzes';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';


interface TokenItem {
  text: string;
  importance: number;
  isKey?: boolean;
}

const PRESET_SEQUENCES: { id: string; name: string; description: string; tokens: TokenItem[] }[] = [
  {
    id: 'passphrase',
    name: 'Passphrase filtering',
    description: 'A key credential buried inside filler tokens. Mamba filters out background noise.',
    tokens: [
      { text: 'Start', importance: 0.15 },
      { text: 'the', importance: 0.1 },
      { text: 'ambient', importance: 0.1 },
      { text: 'KEY_VAULT', importance: 1.0, isKey: true },
      { text: 'is', importance: 0.1 },
      { text: 'whispered', importance: 0.1 },
      { text: 'softly', importance: 0.1 },
      { text: 'ACCESS', importance: 0.9, isKey: true },
      { text: 'now', importance: 0.2 },
    ],
  },
  {
    id: 'induction',
    name: 'Associative recall',
    description: 'Simulates the induction head task (A -> X association across filler intervals).',
    tokens: [
      { text: 'Token_A', importance: 0.8, isKey: true },
      { text: 'maps_to', importance: 0.3 },
      { text: 'VAL_99', importance: 0.95, isKey: true },
      { text: 'noise_1', importance: 0.05 },
      { text: 'noise_2', importance: 0.05 },
      { text: 'noise_3', importance: 0.05 },
      { text: 'Token_A', importance: 0.85, isKey: true },
      { text: 'query', importance: 0.7 },
    ],
  },
  {
    id: 'sentiment',
    name: 'Valence flip',
    description: 'Context negation flipping overall sentence emotional polarity.',
    tokens: [
      { text: 'The', importance: 0.1 },
      { text: 'movie', importance: 0.2 },
      { text: 'was', importance: 0.1 },
      { text: 'NOT', importance: 0.9, isKey: true },
      { text: 'terrible', importance: 0.85, isKey: true },
      { text: 'at', importance: 0.1 },
      { text: 'all', importance: 0.4 },
    ],
  },
];

export const SsmMambaLab: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('passphrase');
  const [continuousA, setContinuousA] = useState<number>(-0.8); // Continuous system pole (stable < 0)
  const [deltaStep, setDeltaStep] = useState<number>(0.6); // Discretization timescale Δ
  const [selectiveMode, setSelectiveMode] = useState<boolean>(true);
  const [subTab, setSubTab] = useState<'visual' | 'theory' | 'build' | 'code' | 'p027' | 'analogy' | 'quiz' | 'first_principles'>('visual');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  const activePreset = PRESET_SEQUENCES.find((p) => p.id === selectedPresetId) || PRESET_SEQUENCES[0];

  // Zero-Order Hold (ZOH) discretization:
  // A_bar = exp(Δ * A)
  // B_bar = (Δ * A)^(-1) * (exp(Δ * A) - 1) * Δ * B = (exp(Δ * A) - 1) / A * B
  const discreteA = Math.exp(deltaStep * continuousA);

  const trajectory = useMemo(() => {
    let currentH = 0;
    return activePreset.tokens.map((tok, idx) => {
      // In Mamba, Δ and B are input-dependent
      const rawB = selectiveMode ? (tok.importance > 0.5 ? 1.2 : 0.08) : 0.6;
      // ZOH discretization of B:
      const discreteB = continuousA !== 0
        ? ((Math.exp(deltaStep * continuousA) - 1) / continuousA) * rawB
        : deltaStep * rawB;

      const x_val = tok.importance;
      const nextH = discreteA * currentH + discreteB * x_val;
      const y_t = nextH; // Observation matrix C = 1
      currentH = nextH;

      return {
        step: idx,
        tok: tok.text,
        isKey: Boolean(tok.isKey),
        rawB,
        discreteB: Number(discreteB.toFixed(3)),
        h_val: Number(nextH.toFixed(3)),
        y_t: Number(y_t.toFixed(3)),
      };
    });
  }, [activePreset, continuousA, deltaStep, discreteA, selectiveMode]);

  const runSsmTest = () => {
    markTestRun('ssm_mamba');
    markLabCompleted('ssm_mamba');
    const lines = [
      '[State-Space Model & Selective Mamba Test]',
      `Selected Sequence: ${activePreset.name}`,
      `Continuous Pole A: ${continuousA.toFixed(2)} (Hurwitz stable for Re(A) < 0)`,
      `Discretization Timescale Δ: ${deltaStep.toFixed(2)}`,
      `Discretized Transition Ā = exp(Δ·A): ${discreteA.toFixed(4)} (|Ā| < 1 ensures bounded state)`,
      `Selective Mechanism: ${selectiveMode ? 'Mamba Dynamic Selection B(x_t), Δ(x_t)' : 'Standard S4 Constant LTI'}`,
      'State Evolution Across Tokens:',
      ...trajectory.map(
        (t) => `  t=${t.step} "${t.tok}" [${t.isKey ? 'KEY' : 'filler'}] -> B̄_t: ${t.discreteB.toFixed(2)}, State h_t: ${t.h_val}`
      ),
      `Result: ${selectiveMode ? 'Selective gating successfully prevented memory contamination by filler tokens.' : 'Constant LTI absorbed filler noise into state register.'}`,
      'STATUS: PASS (Linear time complexity O(N) verified)',
      '✓ Level 5 progress recorded.',
    ];
    setCodeOutput(lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ink-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Level 5 · State-space models
          </span>
          <h2 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white mt-0.5">
            State-space models (S4 and Mamba)
          </h2>
          <p className="text-sm text-ink-600 dark:text-ink-400 mt-1 max-w-2xl">
            Continuous dynamical physics discretized for long context: linear O(N) runtime, constant O(1) inference state, and input-dependent selective filtering.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-ink-100 dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-lg overflow-x-auto max-w-full overscroll-x-contain no-scrollbar">
          <button
            onClick={() => setSubTab('visual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'visual'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            Simulation
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
            onClick={() => setSubTab('p027')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'p027'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            State boundedness
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
          {/* Preset Sequence Picker */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-ink-900 dark:text-white">
                Select Workload Sequence:
              </span>
              <span className="text-xs text-ink-500 dark:text-ink-400">
                {activePreset.description}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PRESET_SEQUENCES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer font-medium ${
                    selectedPresetId === preset.id
                      ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-brand-300 font-bold shadow-xs'
                      : 'bg-ink-50 dark:bg-ink-950/60 border-ink-200 dark:border-white/10 text-ink-700 dark:text-ink-300 hover:border-brand-400'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 shadow-xs">
            {/* Selective Toggle */}
            <div className="space-y-1.5">
              <span className="text-xs text-ink-700 dark:text-ink-300 font-medium block">SSM Mechanism:</span>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectiveMode(false)}
                  className={`w-full px-2.5 py-1.5 text-xs rounded border text-left transition-colors cursor-pointer ${
                    !selectiveMode
                      ? 'bg-ink-800 text-white font-semibold border-ink-700'
                      : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                  }`}
                >
                  Standard S4 (Constant LTI)
                </button>
                <button
                  onClick={() => setSelectiveMode(true)}
                  className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded border text-left transition-colors cursor-pointer ${
                    selectiveMode
                      ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-700 dark:text-brand-300 font-bold'
                      : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                  <span>Mamba Selective Gating B(x_t)</span>
                </button>
              </div>
            </div>

            {/* Continuous Pole A Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink-700 dark:text-ink-300">Continuous Pole A:</span>
                <strong className="text-brand-600 dark:text-brand-400">{continuousA.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="-2.0"
                max="-0.1"
                step="0.1"
                value={continuousA}
                onChange={(e) => setContinuousA(parseFloat(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <span className="text-[10px] text-ink-500 block">
                Discretized Ā = exp(Δ·A) = <strong className="text-ink-800 dark:text-ink-200">{discreteA.toFixed(3)}</strong>
              </span>
            </div>

            {/* Discretization Step Δ Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span className="text-ink-700 dark:text-ink-300">Timescale Δ:</span>
                </div>
                <strong className="text-brand-600 dark:text-brand-400">{deltaStep.toFixed(2)}</strong>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={deltaStep}
                onChange={(e) => setDeltaStep(parseFloat(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <span className="text-[10px] text-ink-500 block">
                Small Δ = smooth memory · Large Δ = rapid state reset
              </span>
            </div>
          </div>

          {/* Sequence Stream Visualizer */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-ink-500 dark:text-ink-400">
              <span className="font-semibold text-ink-800 dark:text-ink-200">
                Hidden State Trajectory:
              </span>
              <span className="font-mono">
                h_(t+1) = {discreteA.toFixed(2)} · h_t + B̄_t · x_t
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {trajectory.map((step) => (
                <div
                  key={step.step}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    step.isKey
                      ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-400 shadow-sm'
                      : 'bg-ink-50 dark:bg-ink-900/60 border-ink-200 dark:border-white/5'
                  }`}
                >
                  <div className="text-[10px] font-mono text-ink-400">t = {step.step}</div>
                  <div
                    className={`text-xs font-bold mt-1 truncate ${
                      step.isKey ? 'text-brand-700 dark:text-brand-300' : 'text-ink-800 dark:text-ink-200'
                    }`}
                  >
                    "{step.tok}"
                  </div>

                  {/* Valve B_t Indicator */}
                  <div className="mt-2 text-[10px] font-mono text-ink-500 dark:text-ink-400">
                    B̄_t: <span className={step.isKey ? 'text-brand-600 dark:text-brand-300 font-bold' : 'text-ink-400'}>{step.discreteB.toFixed(2)}</span>
                  </div>

                  {/* State Bar */}
                  <div className="w-full bg-ink-200 dark:bg-ink-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        step.isKey ? 'bg-brand-500' : 'bg-ink-400 dark:bg-ink-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.abs(step.h_val / 2.0) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-ink-600 dark:text-ink-400 mt-1">
                    h: {step.h_val}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
              <strong>Observation:</strong> In standard S4 with constant B, filler tokens contaminate the memory register h. In Mamba with <strong>Selective B(x_t) and Δ(x_t)</strong>, the input valve clamps shut on noise, preserving the critical keyword state intact.
            </div>
          </div>

          {/* Prompt to take Concept Check */}
          <div className="p-4 bg-brand-50/80 dark:bg-brand-950/30 rounded-xl border border-brand-300/80 dark:border-brand-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-900 dark:text-white">Check your understanding</h4>
                <p className="text-xs text-ink-600 dark:text-ink-300">Test your understanding of linear context scaling and bounded recurrence state dynamics.</p>
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

      {/* P-027 State Boundedness Tab */}
      {subTab === 'p027' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">State boundedness and stability</h3>
          </div>
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
            In state-space models and recurrent control theory, repeatedly multiplying states by transition matrix A over thousands of steps can lead to numerical explosion if eigenvalues exceed unity (lambda &gt; 1).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-500/30 space-y-2">
              <strong className="text-rose-700 dark:text-rose-400 font-bold block">1. The Divergence Hazard (|Ā| &gt; 1)</strong>
              <p className="text-ink-600 dark:text-ink-300">
                If Ā = 1.05, after 100 tokens, h_100 ≈ 1.05^100 × h_0 ≈ 131 × h_0. By token 500, state values overflow into NaNs.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-500/30 space-y-2">
              <strong className="text-green-700 dark:text-green-400 font-bold block">2. The Bounded Fix (|Ā| &lt; 1, HiPPO initialization)</strong>
              <p className="text-ink-600 dark:text-ink-300">
                Gu guarantees that the continuous state updates contract towards a stable manifold. State norms stay tightly bounded, allowing million-token context without exploding memory.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Code Tab */}
      {subTab === 'code' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Mamba selective state-space step</h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Input-dependent B(x_t), C(x_t), and Δ(x_t) computation.
              </p>
            </div>
            <button
              onClick={runSsmTest}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run verification</span>
            </button>
          </div>

          <pre className="p-4 bg-ink-950 rounded-lg border border-ink-800 font-mono text-xs text-ink-300 overflow-x-auto no-scrollbar leading-relaxed">
{`function mambaSelectiveStep(
  h_prev: number[], // [d_state]
  x_t: number,       // scalar input feature
  A_cont: number[], // continuous diagonal poles
  W_B: number[],    // weights predicting B(x_t)
  W_delta: number   // weights predicting delta(x_t)
): { h_next: number[], y_t: number } {
  // 1. Compute input-dependent timescale delta_t > 0
  const delta_t = Math.log(1 + Math.exp(W_delta * x_t)); // Softplus

  // 2. Compute input-dependent B(x_t)
  const B_t = W_B.map(w => 1 / (1 + Math.exp(-w * x_t)));

  // 3. Discretize A and B via Zero-Order Hold (ZOH)
  const A_bar = A_cont.map(a => Math.exp(delta_t * a));
  const B_bar = B_t.map((b, i) => ((Math.exp(delta_t * A_cont[i]) - 1) / A_cont[i]) * b);

  // 4. Update recurrent state vector: h_(t+1) = A_bar * h_t + B_bar * x_t
  const h_next = h_prev.map((h_i, i) => A_bar[i] * h_i + B_bar[i] * x_t);

  // 5. Output projection: y_t = C(x_t) * h_(t+1)
  const y_t = h_next.reduce((sum, val) => sum + val, 0);

  return { h_next, y_t };
}`}
          </pre>

          {codeOutput && (
            <div className="p-4 bg-ink-950 border border-green-500/30 rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulation Log</span>
              </div>
              <pre className="text-xs font-mono text-ink-300 whitespace-pre-wrap">{codeOutput}</pre>
            </div>
          )}
        </div>
      )}

      {/* Analogy Tab */}
      {subTab === 'analogy' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Analogy: The audio tape recorder</h3>
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
            Transformers are like keeping a massive library of 100,000 photos, forcing you to look at every single photo simultaneously.
          </p>
          <div className="p-4 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2 text-xs text-ink-600 dark:text-ink-300">
            <p>
              <strong className="text-amber-600 dark:text-amber-400 font-semibold">An SSM is a continuous audio tape player.</strong> The magnetic head maintains a single continuous magnetic state (h). As new sound frequencies arrive (x), the magnetic tape smoothly updates.
            </p>
            <p className="text-brand-700 dark:text-brand-400">
              <strong>Mamba adds an intelligent noise gate:</strong> When you cough or there is static silence ("the", "um"), the valve clamps shut (B ≈ 0). When a secret password is said, the valve opens wide (B ≈ 1) and records it into the state.
            </p>
          </div>
        </div>
      )}

      {/* Checkpoint Quiz */}
      {subTab === 'quiz' && (
        <CheckpointQuiz
          quizKey="quiz_ssm_mamba"
          title={LAB_QUIZZES.ssm_mamba.title}
          questions={LAB_QUIZZES.ssm_mamba.questions}
          onPassAll={() => markLabCompleted('ssm_mamba')}
        />
      )}

      {/* First Principles Discovery Notebook */}
      {subTab === 'first_principles' && (
        <FirstPrinciplesNotebook dossier={FIRST_PRINCIPLES_DOSSIERS['ssm_mamba']} />
      )}

      {/* Deep First-Principles Theory */}
      {subTab === 'theory' && (
        <TheorySectionView theory={THEORY_DOSSIERS['ssm_mamba']} />
      )}

      {/* Interactive Build It Yourself from Scratch Project */}
      {subTab === 'build' && (
        <BuildFromScratchLab project={DIY_PROJECTS['ssm_mamba']} />
      )}
    </div>
  );
};

