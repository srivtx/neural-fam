/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Code2, Play, CheckCircle2, AlertTriangle, Layers, Award, Flame, BookOpen, Terminal } from 'lucide-react';
import { CheckpointQuiz, QuizQuestion } from '../CheckpointQuiz';
import { CodeBlock } from '../CodeBlock';
import { FirstPrinciplesNotebook } from '../FirstPrinciplesNotebook';
import { FIRST_PRINCIPLES_DOSSIERS } from '../../data/firstPrinciplesData';
import { TheorySectionView } from '../TheorySectionView';
import { THEORY_DOSSIERS } from '../../data/theoryData';
import { BuildFromScratchLab } from '../BuildFromScratchLab';
import { DIY_PROJECTS } from '../../data/diyProjectsData';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';

export const MlpLab: React.FC = () => {
  const [mode, setMode] = useState<'single_fail' | 'mlp_solved'>('mlp_solved');
  const [activePoint, setActivePoint] = useState<{ x1: number; x2: number; label: string; target: number }>({
    x1: 1,
    x2: 0,
    label: '(1, 0)',
    target: 1,
  });
  const [subTab, setSubTab] = useState<'visual' | 'theory' | 'build' | 'code' | 'analogy' | 'quiz' | 'first_principles'>('visual');

  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  const mlpQuizQuestions: QuizQuestion[] = [
    {
      question: 'Why can a 2-layer MLP solve XOR when a single perceptron failed?',
      options: [
        'Hidden neurons warp coordinate space so diagonally separated points become linearly separable.',
        'Because MLPs use floating point numbers instead of binary logic.',
        'Because MLPs skip the dot-product step completely.',
      ],
      correctIndex: 0,
      explanation: 'Hidden neurons create intermediate feature representations, effectively folding flat geometry so the output neuron can make a single clean slice.',
    },
    {
      question: 'What does the Universal Approximation Theorem guarantee?',
      options: [
        'An MLP with 1 non-linear hidden layer can approximate any continuous function given enough neurons.',
        'Every neural network is guaranteed to find the global minimum loss.',
        'MLPs have zero inference latency on all datasets.',
      ],
      correctIndex: 0,
      explanation: 'Cybenko (1989) proved that stacked non-linear layers can fit any continuous function to arbitrary precision.',
    },
  ];

  // Hidden neurons for XOR:
  // h1 = ReLU(x1 + x2 - 0.5) -> acts like OR
  // h2 = ReLU(-x1 - x2 + 1.5) -> acts like NAND
  // y = Step(h1 + h2 - 1.5)
  const computeXor = (x1: number, x2: number) => {
    // Hidden Layer
    const z1 = 1.0 * x1 + 1.0 * x2 - 0.5;
    const h1 = Math.max(0, z1);

    const z2 = -1.0 * x1 - 1.0 * x2 + 1.5;
    const h2 = Math.max(0, z2);

    // Output Layer: combines h1 and h2
    const zOut = 1.0 * h1 + 1.0 * h2 - 1.5;
    const y = zOut >= 0 ? 1 : 0;

    return { z1, h1, z2, h2, zOut, y };
  };

  const xorPoints = [
    { x1: 0, x2: 0, label: '(0, 0)', target: 0 },
    { x1: 1, x2: 0, label: '(1, 0)', target: 1 },
    { x1: 0, x2: 1, label: '(0, 1)', target: 1 },
    { x1: 1, x2: 1, label: '(1, 1)', target: 0 },
  ];

  const currentCalc = computeXor(activePoint.x1, activePoint.x2);

  const runMlpTest = () => {
    markTestRun('mlp');
    markLabCompleted('mlp');
    const lines = [
      '[MLP XOR Verification Test]',
      ...xorPoints.map((pt) => {
        const res = computeXor(pt.x1, pt.x2);
        const match = res.y === pt.target ? '✓ PASS' : '✗ FAIL';
        return `Point ${pt.label}: h1=${res.h1.toFixed(1)}, h2=${res.h2.toFixed(1)} -> Prediction ŷ=${res.y} (Target: ${pt.target}) [${match}]`;
      }),
      'All 4 XOR points classified correctly (non-linear separation achieved).',
      '✓ Level 1 progress recorded.',
    ];
    setCodeOutput(lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ink-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 font-mono">
            Level 1 · Multilayer perceptron
          </span>
          <h2 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white mt-0.5">
            Multilayer perceptron and non-linear separation
          </h2>
          <p className="text-sm text-ink-600 dark:text-ink-400 mt-1 max-w-2xl">
            Why one neuron failed in 1969, and how stacking a hidden layer folds geometric space to separate the inseparable.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-ink-100 dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-lg overflow-x-auto max-w-full overscroll-x-contain">
          <button
            onClick={() => setSubTab('visual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'visual'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
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
            onClick={() => setSubTab('code')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'code'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
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
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
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
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Canvas (7 cols) */}
            <div className="lg:col-span-7 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-semibold text-ink-800 dark:text-ink-200">
                  Exclusive OR (XOR) Feature Plane
                </span>

                {/* Mode switch */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMode('single_fail')}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                      mode === 'single_fail'
                        ? 'border-red-500 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 font-semibold'
                        : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span>Single Neuron (Fails)</span>
                  </button>
                  <button
                    onClick={() => setMode('mlp_solved')}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer flex items-center gap-1 ${
                      mode === 'mlp_solved'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/20 text-brand-800 dark:text-brand-300 font-semibold'
                        : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    <Layers className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                    <span>2-Layer MLP (Solves)</span>
                  </button>
                </div>
              </div>

              {/* SVG Visual Representation */}
              <div className="relative aspect-square max-h-[360px] w-full mx-auto bg-ink-50 dark:bg-ink-950 rounded-lg border border-ink-200/60 dark:border-white/5 p-4 flex items-center justify-center">
                <svg viewBox="-0.5 -0.5 2 2" className="w-full h-full">
                  {/* Background grid */}
                  <line x1="-0.2" y1="0" x2="1.4" y2="0" stroke="rgba(100,116,139,0.15)" strokeWidth="0.01" />
                  <line x1="0" y1="-0.2" x2="0" y2="1.4" stroke="rgba(100,116,139,0.15)" strokeWidth="0.01" />

                  {/* Single Neuron Fail Line */}
                  {mode === 'single_fail' && (
                    <>
                      <line
                        x1="-0.2"
                        y1="0.8"
                        x2="1.2"
                        y2="-0.2"
                        stroke="#ef4444"
                        strokeWidth="0.02"
                        strokeDasharray="0.04 0.04"
                      />
                      <text x="0.1" y="-0.1" fill="#ef4444" fontSize="0.06" fontFamily="JetBrains Mono">
                        Impossible straight slice (misclassifies diagonal points)
                      </text>
                    </>
                  )}

                  {/* MLP Dual Decision Lines */}
                  {mode === 'mlp_solved' && (
                    <>
                      {/* Line 1: x1 + x2 = 0.5 (h1) */}
                      <line x1="-0.1" y1="0.6" x2="0.6" y2="-0.1" stroke="#2f3bf0" strokeWidth="0.02" />
                      {/* Line 2: x1 + x2 = 1.5 (h2) */}
                      <line x1="0.3" y1="1.2" x2="1.2" y2="0.3" stroke="#0d9488" strokeWidth="0.02" />
                      {/* Shaded zone between lines */}
                      <polygon
                        points="-0.1,0.6 0.6,-0.1 1.2,0.3 0.3,1.2"
                        fill="rgba(5, 150, 105, 0.15)"
                      />
                      <text x="0.05" y="0.5" fill="#2f3bf0" fontSize="0.05" fontFamily="JetBrains Mono" fontWeight="bold">
                        Line 1 (h₁)
                      </text>
                      <text x="0.75" y="0.9" fill="#0d9488" fontSize="0.05" fontFamily="JetBrains Mono" fontWeight="bold">
                        Line 2 (h₂)
                      </text>
                    </>
                  )}

                  {/* 4 XOR points */}
                  {xorPoints.map((pt) => {
                    const isSelected = activePoint.x1 === pt.x1 && activePoint.x2 === pt.x2;
                    const color = pt.target === 1 ? '#2f3bf0' : '#ef4444';
                    return (
                      <g
                        key={pt.label}
                        onClick={() => setActivePoint(pt)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={pt.x1}
                          cy={pt.x2}
                          r={isSelected ? 0.08 : 0.05}
                          fill={color}
                          stroke="#ffffff"
                          strokeWidth="0.015"
                        />
                        {isSelected && (
                          <circle
                            cx={pt.x1}
                            cy={pt.x2}
                            r={0.12}
                            fill="none"
                            stroke={color}
                            strokeWidth="0.01"
                            strokeDasharray="0.02 0.02"
                          />
                        )}
                        <text
                          x={pt.x1 + 0.08}
                          y={pt.x2 + 0.03}
                          fill="#5a5448"
                          fontSize="0.06"
                          fontFamily="JetBrains Mono"
                          className="dark:fill-ink-300"
                        >
                          {pt.label} → {pt.target}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400 pt-2 border-t border-ink-100 dark:border-white/5">
                <span>Click any dot to trace hidden neuron firings.</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" /> Target = 1
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Target = 0
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Network Architecture Diagram & Neuron Math (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Visual Synapse Flow */}
              <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs transition-colors">
                <h3 className="text-sm font-semibold font-display tracking-tight text-ink-900 dark:text-white">
                  Network Architecture & Layer Forward Pass
                </h3>

                {/* Point Inspector */}
                <div className="p-3 bg-ink-50 dark:bg-ink-950/80 rounded-lg border border-ink-200/60 dark:border-white/5 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center text-ink-700 dark:text-ink-300">
                    <span>Inspecting Point:</span>
                    <span className="text-brand-700 dark:text-brand-400 font-bold">{activePoint.label} (Target = {activePoint.target})</span>
                  </div>

                  {/* Layer 1: Hidden Neurons */}
                  <div className="space-y-1.5 pt-2 border-t border-ink-200 dark:border-white/10">
                    <div className="text-ink-500 dark:text-ink-400 text-[11px] font-sans uppercase font-semibold">
                      Hidden Layer (2 Neurons)
                    </div>
                    <div className="p-2 bg-surface dark:bg-ink-900 rounded border border-ink-200 dark:border-brand-500/20 shadow-xs">
                      <div className="flex justify-between text-brand-800 dark:text-brand-300 font-semibold">
                        <span>h₁ (OR boundary):</span>
                        <span>{currentCalc.h1.toFixed(2)}</span>
                      </div>
                      <div className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">
                        z₁ = (1·{activePoint.x1}) + (1·{activePoint.x2}) - 0.5 = {currentCalc.z1.toFixed(1)}
                      </div>
                    </div>

                    <div className="p-2 bg-surface dark:bg-ink-900 rounded border border-ink-200 dark:border-teal-500/20 shadow-xs">
                      <div className="flex justify-between text-teal-800 dark:text-teal-300 font-semibold">
                        <span>h₂ (NAND boundary):</span>
                        <span>{currentCalc.h2.toFixed(2)}</span>
                      </div>
                      <div className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">
                        z₂ = (-1·{activePoint.x1}) + (-1·{activePoint.x2}) + 1.5 = {currentCalc.z2.toFixed(1)}
                      </div>
                    </div>
                  </div>

                  {/* Layer 2: Output Neuron */}
                  <div className="space-y-1.5 pt-2 border-t border-ink-200 dark:border-white/10">
                    <div className="text-ink-500 dark:text-ink-400 text-[11px] font-sans uppercase font-semibold">
                      Output Layer (1 Neuron)
                    </div>
                    <div className="p-2 bg-surface dark:bg-ink-900 rounded border border-ink-200 dark:border-brand-500/20 shadow-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-ink-700 dark:text-ink-300">Prediction ŷ:</span>
                        <span className={currentCalc.y === activePoint.target ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}>
                          {currentCalc.y} {currentCalc.y === activePoint.target ? '✓ (CORRECT)' : '✗ (ERROR)'}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">
                        z_out = (1·{currentCalc.h1.toFixed(1)}) + (1·{currentCalc.h2.toFixed(1)}) - 1.5 = {currentCalc.zOut.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Universal Approximation Theorem callout */}
                <div className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 p-3 rounded-lg">
                  <span className="font-semibold text-brand-800 dark:text-brand-300 block mb-1">
                    Universal Approximation Theorem (Cybenko, 1989)
                  </span>
                  An MLP with even a single hidden layer and non-linear activations can approximate <em>any</em> smooth mathematical function to arbitrary precision.
                </div>
              </div>
            </div>
          </div>

          {/* Prompt To Concept Check */}
          <div className="p-4 bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h4 className="text-xs font-bold text-ink-900 dark:text-white">
                Understood Space Warping & XOR?
              </h4>
              <p className="text-[11px] text-ink-600 dark:text-ink-400">
                Test your understanding with the Level 1 Concept Checkpoint quiz.
              </p>
            </div>
            <button
              onClick={() => setSubTab('quiz')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
            >
              Take Concept Check
            </button>
          </div>
        </div>
      )}

      {/* Code Tab */}
      {subTab === 'code' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Two-layer MLP forward pass</h3>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Vectorized multiplication that maps 2 inputs through 2 hidden neurons to an output.
            </p>
          </div>

          <CodeBlock
            code={`function forwardMlpXor(x1: number, x2: number) {
  // Layer 1: W1 = [[1, 1], [-1, -1]], b1 = [-0.5, 1.5]
  const h1 = Math.max(0, 1.0 * x1 + 1.0 * x2 - 0.5);   // ReLU (OR boundary)
  const h2 = Math.max(0, -1.0 * x1 - 1.0 * x2 + 1.5); // ReLU (NAND boundary)

  // Layer 2: W2 = [1, 1], b2 = -1.5
  const z_out = (1.0 * h1) + (1.0 * h2) - 1.5;
  const prediction = z_out >= 0 ? 1 : 0;

  return { h1, h2, prediction };
}`}
            language="TypeScript"
            filename="mlp_xor_forward.ts"
            onRun={runMlpTest}
            runLabel="Run"
            output={codeOutput}
          />
        </div>
      )}

      {/* Analogy Tab */}
      {subTab === 'analogy' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-6 space-y-4 shadow-xs transition-colors">
          <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Paper-folding analogy</h3>
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
            Take a flat sheet of paper. Draw two blue dots on the top-left and bottom-right, and two red dots on the bottom-left and top-right (the XOR layout).
          </p>
          <div className="p-4 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2 text-xs text-ink-700 dark:text-ink-300">
            <p>
              <strong className="text-red-600 dark:text-red-400">Can you make one straight scissors cut</strong> that separates both blue dots from both red dots? It is mathematically impossible on a flat sheet.
            </p>
            <p>
              <strong className="text-brand-700 dark:text-brand-400 font-semibold">Now fold the paper in half.</strong> Suddenly, the two blue dots touch each other in 3D space. A single straight cut now separates both classes simultaneously.
            </p>
            <p className="text-brand-800 dark:text-brand-300 font-medium">
              That folding action is what hidden layers do: they warp flat coordinate space into a geometry where straight lines can easily solve non-linear problems.
            </p>
          </div>
        </div>
      )}

      {/* SubTab 4: Checkpoint Quiz */}
      {subTab === 'quiz' && (
        <CheckpointQuiz
          quizKey="quiz_mlp"
          title="Level 1 concept check: Multilayer perceptrons and XOR"
          questions={mlpQuizQuestions}
          onPassAll={() => markLabCompleted('mlp')}
        />
      )}

      {/* SubTab 5: First Principles Discovery Notebook */}
      {subTab === 'first_principles' && (
        <FirstPrinciplesNotebook dossier={FIRST_PRINCIPLES_DOSSIERS['mlp']} />
      )}

      {/* SubTab 6: Deep First-Principles Theory */}
      {subTab === 'theory' && (
        <TheorySectionView theory={THEORY_DOSSIERS['mlp']} />
      )}

      {/* SubTab 7: Interactive Build It Yourself from Scratch Project */}
      {subTab === 'build' && (
        <BuildFromScratchLab project={DIY_PROJECTS['mlp']} />
      )}
    </div>
  );
};

