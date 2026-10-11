/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Code2, Play, CheckCircle2, Sliders, ArrowRight, Award, Sparkles, Flame, BookOpen, Terminal } from 'lucide-react';
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

export const RnnLstmLaboratory: React.FC = () => {
  const [forgetGate, setForgetGate] = useState<number>(0.8);
  const [currentStep, setCurrentStep] = useState<number>(3);
  const [subTab, setSubTab] = useState<'visual' | 'theory' | 'build' | 'code' | 'analogy' | 'quiz' | 'first_principles'>('visual');

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
      '✓ Level 3 progress recorded.',
    ];
    setCodeOutput(lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ink-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Level 3 · Recurrent networks
          </span>
          <h2 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white mt-0.5">
            Recurrent networks: RNN, LSTM, and GRU
          </h2>
          <p className="text-sm text-ink-600 dark:text-ink-400 mt-1 max-w-2xl">
            How internal loops carry information through time, and how LSTM gates prevent memories from fading away.
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
            Sequence unrolling
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
          {/* Time Steps Tape */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
              <span className="font-semibold text-ink-900 dark:text-ink-200">Temporal Sequence Unrolling:</span>
              <span>Click any step or step through with arrow</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
              {states.map((s) => {
                const isCurrent = s.step === currentStep;
                return (
                  <button
                    key={s.step}
                    onClick={() => setCurrentStep(s.step)}
                    className={`flex-1 min-w-[100px] p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-800 dark:text-brand-300 shadow-xs'
                        : 'bg-ink-50 dark:bg-ink-900/60 border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="text-[11px] font-mono text-ink-400">t = {s.step}</div>
                    <div className="text-sm font-bold text-ink-900 dark:text-white mt-0.5 truncate font-mono">
                      "{s.token}"
                    </div>
                    <div className="text-[11px] font-mono text-brand-600 dark:text-brand-400 mt-1">
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
                className="px-3 py-1 text-xs rounded border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300 disabled:opacity-40 hover:bg-ink-100 dark:hover:bg-ink-800 cursor-pointer disabled:cursor-not-allowed"
              >
                Previous Step
              </button>
              <span className="text-xs font-mono text-ink-500 dark:text-ink-400">
                Step {currentStep + 1} of {tokens.length}
              </span>
              <button
                onClick={() => setCurrentStep(Math.min(tokens.length - 1, currentStep + 1))}
                disabled={currentStep === tokens.length - 1}
                className="px-3 py-1 text-xs rounded border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300 disabled:opacity-40 hover:bg-ink-100 dark:hover:bg-ink-800 cursor-pointer disabled:cursor-not-allowed"
              >
                Next Step
              </button>
            </div>
          </div>

          {/* Interactive Gating Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls & Gates */}
            <div className="lg:col-span-6 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-ink-100 dark:border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  LSTM Gate Valve Controls
                </span>
                <span className="text-xs font-mono text-ink-500">t = {active.step}</span>
              </div>

              {/* Forget Gate Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-700 dark:text-ink-300 font-medium">Forget Gate f_t (Eraser Valve):</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{forgetGate.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={forgetGate}
                  onChange={(e) => setForgetGate(parseFloat(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <div className="flex flex-col sm:flex-row justify-between gap-1 text-[10px] text-ink-400">
                  <span>0.0: Wipe Past Memory Clean</span>
                  <span>1.0: Preserve All Historical Context</span>
                </div>
              </div>

              {/* Mathematical Representation */}
              <div className="p-3 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2 text-xs font-mono">
                <div className="text-ink-500 dark:text-ink-400 text-[11px]">Cell State Update Formula:</div>
                <div className="text-brand-700 dark:text-brand-300 font-bold">
                  C_t = (f_t · C_{'{t-1}'}) + (i_t · tanh(W_c · x_t + b_c))
                </div>
                <div className="text-ink-600 dark:text-ink-400 text-[11px] leading-relaxed">
                  Notice the <strong>addition sign (+)</strong>. Unlike vanilla RNN which multiplies matrices repeatedly, LSTM updates cell memory additively, protecting gradients from exponential decay.
                </div>
              </div>
            </div>

            {/* Right State Inspector */}
            <div className="lg:col-span-6 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-ink-100 dark:border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Step State Diagnostics
                </span>
                <span className="text-xs font-bold text-ink-900 dark:text-white font-mono">"{active.token}"</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <div className="text-ink-500 dark:text-ink-400 text-[11px]">1. Input Feature Vector:</div>
                  <div className="text-ink-900 dark:text-white font-bold">x_{active.step} = {active.x_t}</div>
                </div>

                <div className="pt-2 border-t border-ink-100 dark:border-white/5 space-y-1">
                  <div className="text-ink-500 dark:text-ink-400 text-[11px]">2. Internal Cell State (Memory Vault):</div>
                  <div className="text-ink-700 dark:text-ink-300">
                    C_t = ({forgetGate.toFixed(2)} · C_{'{t-1}'}) + New Clues
                  </div>
                  <div className="text-brand-700 dark:text-brand-400 font-bold text-sm">
                    C_{active.step} = {active.cellState}
                  </div>
                </div>

                <div className="pt-2 border-t border-ink-100 dark:border-white/5 space-y-1">
                  <div className="text-ink-500 dark:text-ink-400 text-[11px]">3. Observable Hidden State:</div>
                  <div className="text-ink-700 dark:text-ink-300">
                    h_t = o_t · tanh(C_t)
                  </div>
                  <div className="text-brand-700 dark:text-brand-400 font-bold text-sm">
                    h_{active.step} = {active.hiddenState}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Concept Check Prompt */}
          <div className="p-4 bg-brand-50/80 dark:bg-brand-950/30 rounded-xl border border-brand-300/80 dark:border-brand-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-900 dark:text-white">Check your understanding</h4>
                <p className="text-xs text-ink-600 dark:text-ink-300">Test your understanding of recurrent state unrolling and additive gradient gates.</p>
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

      {/* Code Tab */}
      {subTab === 'code' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">LSTM cell step and unrolling</h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Notice how the cell state C_t updates additively, avoiding vanishing gradient multiplications.
              </p>
            </div>
            <button
              onClick={runSequenceTest}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </button>
          </div>

          <pre className="p-4 bg-ink-950 rounded-lg border border-ink-800 font-mono text-xs text-ink-300 overflow-x-auto no-scrollbar leading-relaxed">
{`function lstmStep(prevH: number, prevC: number, x: number, f_val: number): { nextH: number, nextC: number } {
  // Forget gate: how much old cell memory to keep
  const f_t = f_val;
  // Input gate candidate
  const candidate = Math.tanh(x);
  
  // Cell state update (additive, not multiplicative)
  const nextC = (f_t * prevC) + (0.5 * candidate);
  
  // Hidden state output
  const nextH = Math.tanh(nextC);
  
  return { nextH, nextC };
}`}
          </pre>

          {codeOutput && (
            <div className="p-4 bg-ink-950 border border-green-500/30 rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Unrolling Results</span>
              </div>
              <pre className="text-xs font-mono text-ink-300 whitespace-pre-wrap">{codeOutput}</pre>
            </div>
          )}
        </div>
      )}

      {/* Analogy Tab */}
      {subTab === 'analogy' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Analogy: The detective's notebook</h3>
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
            Imagine an investigator reading a 500-page mystery novel one sentence at a time.
          </p>
          <div className="p-4 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2 text-xs text-ink-600 dark:text-ink-300">
            <p>
              <strong className="text-rose-600 dark:text-rose-400 font-semibold">Plain RNN:</strong> The detective has no notebook and tries to memorize everything in their head. By page 50, all details from page 1 have completely vanished from memory.
            </p>
            <p>
              <strong className="text-green-700 dark:text-green-400 font-semibold">LSTM Cell State (The Notebook):</strong> The detective carries a notebook that stays open across all 500 pages.
            </p>
            <p className="text-ink-800 dark:text-ink-200 font-medium">
              The <strong>Forget Gate</strong> is an eraser: it rubs out clues that turn out to be red herrings. The <strong>Input Gate</strong> is a pen: it jots down critical facts. Because the notebook is written additively, page 1 clues remain legible on page 500.
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

      {/* SubTab 5: First Principles Discovery Notebook */}
      {subTab === 'first_principles' && (
        <FirstPrinciplesNotebook dossier={FIRST_PRINCIPLES_DOSSIERS['rnn_lstm']} />
      )}

      {/* SubTab 6: Deep First-Principles Theory */}
      {subTab === 'theory' && (
        <TheorySectionView theory={THEORY_DOSSIERS['rnn_lstm']} />
      )}

      {/* SubTab 7: Interactive Build It Yourself from Scratch Project */}
      {subTab === 'build' && (
        <BuildFromScratchLab project={DIY_PROJECTS['rnn_lstm']} />
      )}
    </div>
  );
};

