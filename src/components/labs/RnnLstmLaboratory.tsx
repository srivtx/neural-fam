/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Code2, Play, CheckCircle2, Sliders, ArrowRight, Award, Sparkles } from 'lucide-react';
import { CheckpointQuiz } from '../CheckpointQuiz';
import { LAB_QUIZZES } from '../../data/labQuizzes';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';

export const RnnLstmLaboratory: React.FC = () => {
  const [forgetGate, setForgetGate] = useState<number>(0.8);
  const [currentStep, setCurrentStep] = useState<number>(3);
  const [subTab, setSubTab] = useState<'visual' | 'code' | 'analogy' | 'quiz'>('visual');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  const tokens = ['The', 'detective', 'examined', 'the', 'clue', 'carefully'];

  // Calculate unrolled hidden states through steps
  let cellState = 0;
  let hiddenState = 0;

  const states = tokens.map((token, idx) => {
    // Synthetic token embedding
    const x_t = (idx + 1) * 0.4;
    // LSTM Cell update: C_t = f_t * C_{t-1} + i_t * candidate
    const f_t = forgetGate;
    const i_t = 0.6;
    const candidate = Math.tanh(x_t);
    cellState = f_t * cellState + i_t * candidate;
    hiddenState = Math.tanh(cellState);

    return {
      step: idx,
      token,
      x_t: x_t.toFixed(2),
      cellState: cellState.toFixed(2),
      hiddenState: hiddenState.toFixed(2),
    };
  });

  const active = states[currentStep];

  const runSequenceTest = () => {
    markTestRun('rnn_lstm');
    markLabCompleted('rnn_lstm');
    const lines = [
      '[RNN / LSTM Sequence Unrolling Verification]',
      `Input Sequence Length: ${tokens.length} time-steps`,
      `Forget Gate Setting f_t: ${forgetGate} (${forgetGate > 0.7 ? 'Strong Long-Term Retention' : 'Rapid Memory Decay'})`,
      'Step-by-Step Internal State Evolution:',
      ...states.map(
        (s) => `  t=${s.step}: "${s.token}" -> Input: ${s.x_t}, Cell State C_t: ${s.cellState}, Hidden Output h_t: ${s.hiddenState}`
      ),
      'Additive Gradient Highway: dC_t/dC_{t-1} = f_t (Linear gradient flow avoids vanishing multipliers)',
      'STATUS: PASS (Gated temporal recurrence verified)',
      '✓ Level 3 Progress Recorded!',
    ];
    setCodeOutput(lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Level 3 · Recurrence & Memory Gating
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Recurrent Networks (RNN, LSTM & GRU)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            How internal loops carry information through time, and how LSTM gates prevent memories from fading away.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg">
          <button
            onClick={() => setSubTab('visual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'visual'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Temporal Unroller
          </button>
          <button
            onClick={() => setSubTab('code')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'code'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Scratchpad</span>
          </button>
          <button
            onClick={() => setSubTab('analogy')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'analogy'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Notebook Analogy</span>
          </button>
          <button
            onClick={() => setSubTab('quiz')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'quiz'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Concept Check</span>
          </button>
        </div>
      </div>

      {subTab === 'visual' && (
        <div className="space-y-6">
          {/* Time Steps Tape */}
          <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-slate-200">Temporal Sequence Unrolling:</span>
              <span>Click any step or step through with arrow</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {states.map((s) => {
                const isCurrent = s.step === currentStep;
                return (
                  <button
                    key={s.step}
                    onClick={() => setCurrentStep(s.step)}
                    className={`flex-1 min-w-[100px] p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="text-[11px] font-mono text-slate-400">t = {s.step}</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate font-mono">
                      "{s.token}"
                    </div>
                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                      h_t: {s.hiddenState}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-3 py-1 text-xs rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous Step
              </button>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Step {currentStep + 1} of {tokens.length}
              </span>
              <button
                onClick={() => setCurrentStep(Math.min(tokens.length - 1, currentStep + 1))}
                disabled={currentStep === tokens.length - 1}
                className="px-3 py-1 text-xs rounded border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </div>
          </div>

          {/* Interactive Gating Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls & Gates */}
            <div className="lg:col-span-6 bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  LSTM Gate Valve Controls
                </span>
                <span className="text-xs font-mono text-slate-500">t = {active.step}</span>
              </div>

              {/* Forget Gate Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Forget Gate f_t (Eraser Valve):</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{forgetGate.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={forgetGate}
                  onChange={(e) => setForgetGate(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0.0: Wipe Past Memory Clean</span>
                  <span>1.0: Preserve All Historical Context</span>
                </div>
              </div>

              {/* Mathematical Representation */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-white/5 space-y-2 text-xs font-mono">
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">Cell State Update Formula:</div>
                <div className="text-emerald-700 dark:text-emerald-300 font-bold">
                  C_t = (f_t · C_{'{t-1}'}) + (i_t · tanh(W_c · x_t + b_c))
                </div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Notice the <strong>addition sign (+)</strong>. Unlike vanilla RNN which multiplies matrices repeatedly, LSTM updates cell memory additively, protecting gradients from exponential decay!
                </div>
              </div>
            </div>

            {/* Right State Inspector */}
            <div className="lg:col-span-6 bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Step State Diagnostics
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">"{active.token}"</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">1. Input Feature Vector:</div>
                  <div className="text-slate-900 dark:text-white font-bold">x_{active.step} = {active.x_t}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">2. Internal Cell State (Memory Vault):</div>
                  <div className="text-slate-700 dark:text-slate-300">
                    C_t = ({forgetGate.toFixed(2)} · C_{'{t-1}'}) + New Clues
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    C_{active.step} = {active.cellState}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-1">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">3. Observable Hidden State:</div>
                  <div className="text-slate-700 dark:text-slate-300">
                    h_t = o_t · tanh(C_t)
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    h_{active.step} = {active.hiddenState}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Concept Check Prompt */}
          <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl border border-emerald-300/80 dark:border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ready to verify Level 3 mastery?</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Test your understanding of recurrent state unrolling and additive gradient gates.</p>
              </div>
            </div>
            <button
              onClick={() => setSubTab('quiz')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <span>Take Concept Check</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Code Tab */}
      {subTab === 'code' && (
        <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">LSTM Cell Step & Unrolling</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Notice how the cell state C_t updates additively, avoiding vanishing gradient multiplications.
              </p>
            </div>
            <button
              onClick={runSequenceTest}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Unroll Full Sequence</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`function lstmStep(prevH: number, prevC: number, x: number, f_val: number): { nextH: number, nextC: number } {
  // Forget gate: how much old cell memory to keep
  const f_t = f_val;
  // Input gate candidate
  const candidate = Math.tanh(x);
  
  // Cell state update (ADDITIVE, not multiplicative!)
  const nextC = (f_t * prevC) + (0.5 * candidate);
  
  // Hidden state output
  const nextH = Math.tanh(nextC);
  
  return { nextH, nextC };
}`}
          </pre>

          {codeOutput && (
            <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Unrolling Results</span>
              </div>
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">{codeOutput}</pre>
            </div>
          )}
        </div>
      )}

      {/* Analogy Tab */}
      {subTab === 'analogy' && (
        <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">The Detective’s Notebook Analogy</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Imagine an investigator reading a 500-page mystery novel one sentence at a time.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-white/5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <p>
              <strong className="text-red-600 dark:text-red-400 font-semibold">Plain RNN:</strong> The detective has no notebook and tries to memorize everything in their head. By page 50, all details from page 1 have completely vanished from memory.
            </p>
            <p>
              <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">LSTM Cell State (The Notebook):</strong> The detective carries a notebook that stays open across all 500 pages.
            </p>
            <p className="text-emerald-800 dark:text-emerald-300 font-medium">
              The <strong>Forget Gate</strong> is an eraser: it rubs out clues that turn out to be red herrings. The <strong>Input Gate</strong> is a pen: it jots down critical facts. Because the notebook is written additively, page 1 clues remain crystal clear on page 500!
            </p>
          </div>
        </div>
      )}

      {/* SubTab 4: Checkpoint Quiz */}
      {subTab === 'quiz' && (
        <CheckpointQuiz
          quizKey="quiz_rnn_lstm"
          title={LAB_QUIZZES.rnn_lstm.title}
          questions={LAB_QUIZZES.rnn_lstm.questions}
          onPassAll={() => markLabCompleted('rnn_lstm')}
        />
      )}
    </div>
  );
};
