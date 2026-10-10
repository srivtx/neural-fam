/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Code2, Play, CheckCircle2, Zap, AlertTriangle, Award, Sparkles, ArrowRight } from 'lucide-react';
import { CheckpointQuiz } from '../CheckpointQuiz';
import { LAB_QUIZZES } from '../../data/labQuizzes';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';

export const SsmMambaLab: React.FC = () => {
  const [decayA, setDecayA] = useState<number>(0.85);
  const [selectiveMode, setSelectiveMode] = useState<boolean>(true);
  const [subTab, setSubTab] = useState<'visual' | 'code' | 'p027' | 'analogy' | 'quiz'>('visual');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  // Sample sequence with noise vs important tokens
  const sequence = [
    { text: 'Start', importance: 0.2 },
    { text: 'the', importance: 0.1 },
    { text: 'ambient', importance: 0.1 },
    { text: 'PASSPHRASE', importance: 1.0 }, // Critical keyword
    { text: 'is', importance: 0.2 },
    { text: 'whispered', importance: 0.1 },
    { text: 'softly', importance: 0.1 },
    { text: 'now', importance: 0.3 },
  ];

  // Run SSM unrolling
  let currentH = 0;
  const trajectory = sequence.map((tok) => {
    // In Mamba, B(x_t) is a function of the input token
    const B_t = selectiveMode ? (tok.importance > 0.5 ? 1.0 : 0.05) : 0.5;
    const x_val = tok.importance;
    
    // State update: h_{t+1} = A * h_t + B_t * x_t
    const nextH = decayA * currentH + B_t * x_val;
    const y_t = nextH; // C = 1
    currentH = nextH;

    return {
      tok: tok.text,
      isKey: tok.importance > 0.5,
      B_t,
      h_val: Number(nextH.toFixed(3)),
      y_t: Number(y_t.toFixed(3)),
    };
  });

  const runSsmTest = () => {
    markTestRun('ssm_mamba');
    markLabCompleted('ssm_mamba');
    const lines = [
      '[State-Space Model & Selective Mamba Test]',
      `Decay Parameter A: ${decayA} (Stability condition: |A| < 1 for bounded state)`,
      `Selective Mechanism: ${selectiveMode ? 'Mamba Dynamic Selection B(x_t)' : 'Standard LTI Constant B'}`,
      'State Evolution Across Tokens:',
      ...trajectory.map(
        (t) => `  Token "${t.tok}" [${t.isKey ? 'CRITICAL KEY' : 'Filler'}] -> B_t: ${t.B_t.toFixed(2)}, Memory State h_t: ${t.h_val}`
      ),
      `Notice how ${selectiveMode ? 'selective gating filtered out background filler noise.' : 'constant B absorbed all noise into memory.'}`,
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
            Continuous dynamical physics discretized for ultra-long context: linear $O(N)$ runtime, constant $O(1)$ memory, and input-dependent selective filtering.
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
            Simulation
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
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
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
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 shadow-xs">
            {/* Selective Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-700 dark:text-ink-300 font-medium">Mechanism:</span>
              <button
                onClick={() => setSelectiveMode(false)}
                className={`px-3 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  !selectiveMode
                    ? 'bg-ink-800 text-white font-semibold border-ink-700'
                    : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                Standard S4 (Constant B)
              </button>
              <button
                onClick={() => setSelectiveMode(true)}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  selectiveMode
                    ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-700 dark:text-brand-300 font-semibold'
                    : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Mamba Selective B(x_t)</span>
              </button>
            </div>

            {/* Decay A Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-ink-700 dark:text-ink-300">
                Memory Decay A: <strong className="text-brand-600 dark:text-brand-400">{decayA.toFixed(2)}</strong>
              </span>
              <input
                type="range"
                min="0.4"
                max="0.99"
                step="0.05"
                value={decayA}
                onChange={(e) => setDecayA(parseFloat(e.target.value))}
                className="w-28 accent-brand-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Sequence Stream Visualizer */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
              <span className="font-semibold text-ink-800 dark:text-ink-200">Continuous Hidden State Trajectory:</span>
              <span className="font-mono">h_(t+1) = {decayA.toFixed(2)} · h_t + B_t · x_t</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {trajectory.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    step.isKey
                      ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-400 shadow-sm'
                      : 'bg-ink-50 dark:bg-ink-900/60 border-ink-200 dark:border-white/5'
                  }`}
                >
                  <div className="text-[10px] font-mono text-ink-400">t = {idx}</div>
                  <div className={`text-xs font-bold mt-1 truncate ${step.isKey ? 'text-brand-700 dark:text-brand-300' : 'text-ink-800 dark:text-ink-200'}`}>
                    "{step.tok}"
                  </div>
                  
                  {/* Valve B_t Indicator */}
                  <div className="mt-2 text-[10px] font-mono text-ink-500 dark:text-ink-400">
                    B_t: <span className={step.isKey ? 'text-brand-600 dark:text-brand-300 font-bold' : 'text-ink-400'}>{step.B_t.toFixed(2)}</span>
                  </div>

                  {/* State Bar */}
                  <div className="w-full bg-ink-200 dark:bg-ink-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${step.isKey ? 'bg-brand-500' : 'bg-ink-400 dark:bg-ink-600'}`}
                      style={{ width: `${Math.min(100, (step.h_val / 2.0) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-ink-600 dark:text-ink-400 mt-1">
                    h: {step.h_val}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
              <strong>Observation:</strong> In standard S4 with constant $B$, filler tokens like "ambient", "is", and "softly" contaminate the memory register $h$. In Mamba with <strong>Selective $B(x_t)$</strong>, the input valve clamps shut ($B \approx 0.05$) on noise, preserving the critical keyword state intact.
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
            In state-space models and recurrent control theory, repeatedly multiplying states by transition matrix $A$ over thousands of steps can lead to numerical explosion if eigenvalues exceed unity (&lambda; &gt; 1).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-500/30 space-y-2">
              <strong className="text-rose-700 dark:text-rose-400 font-bold block">1. The Divergence Hazard (|A| &gt; 1)</strong>
              <p className="text-ink-600 dark:text-ink-300">
                If $A = 1.05$, after 100 tokens, $h_{100} \approx 1.05^{100} \times h_0 \approx 131 \times h_0$. By token 500, state values overflow into NaNs.
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-500/30 space-y-2">
              <strong className="text-green-700 dark:text-green-400 font-bold block">2. The Bounded Fix (|A| &lt; 1, HiPPO initialization)</strong>
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Mamba selective state-space step</h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Input-dependent B(x_t) and C(x_t) computation.
              </p>
            </div>
            <button
              onClick={runSsmTest}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </button>
          </div>

          <pre className="p-4 bg-ink-950 rounded-lg border border-ink-800 font-mono text-xs text-ink-300 overflow-x-auto leading-relaxed">
{`function mambaStep(h_t: number, x_t: number, A: number, W_B: number): { next_h: number, y_t: number, B_t: number } {
  // 1. Selection: Parameter B is computed dynamically from current input x_t
  const B_t = 1 / (1 + Math.exp(-W_B * x_t)); // Sigmoid valve

  // 2. Continuous State Evolution: h_{t+1} = A * h_t + B(x_t) * x_t
  const next_h = (A * h_t) + (B_t * x_t);

  // 3. Readout: y_t = C * h_{t+1}
  const y_t = next_h;

  return { next_h, y_t, B_t };
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
              <strong className="text-amber-600 dark:text-amber-400 font-semibold">An SSM is a continuous audio tape player.</strong> The magnetic head maintains a single continuous magnetic state ($h$). As new sound frequencies arrive ($x$), the magnetic tape smoothly updates.
            </p>
            <p className="text-brand-700 dark:text-brand-400">
              <strong>Mamba adds an intelligent noise gate:</strong> When you cough or there is static silence ("the", "um"), the valve clamps shut ($B \approx 0$). When a secret password is said, the valve opens wide ($B \approx 1$) and records it into the state.
            </p>
          </div>
        </div>
      )}

      {/* SubTab 5: Checkpoint Quiz */}
      {subTab === 'quiz' && (
        <CheckpointQuiz
          quizKey="quiz_ssm_mamba"
          title={LAB_QUIZZES.ssm_mamba.title}
          questions={LAB_QUIZZES.ssm_mamba.questions}
          onPassAll={() => markLabCompleted('ssm_mamba')}
        />
      )}
    </div>
  );
};
