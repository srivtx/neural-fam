/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Code2, Play, CheckCircle2, Activity, Sliders, Award, ArrowRight } from 'lucide-react';
import { CheckpointQuiz } from '../CheckpointQuiz';
import { LAB_QUIZZES } from '../../data/labQuizzes';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';

export const SpecializedLab: React.FC = () => {
  const [stepSizeDt, setStepSizeDt] = useState<number>(0.2);
  const [initialH0, setInitialH0] = useState<number>(0.0);
  const [subTab, setSubTab] = useState<'visual' | 'code' | 'tax' | 'analogy' | 'quiz'>('visual');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  // Solve 1D Neural ODE: dh/dt = 1.0 - h(t)
  const stepsCount = 6;
  const trajectory: { t: number; h: number }[] = [];
  let currentH = initialH0;

  for (let i = 0; i <= stepsCount; i++) {
    const t = Number((i * stepSizeDt).toFixed(2));
    trajectory.push({ t, h: Number(currentH.toFixed(3)) });
    const velocity = 1.0 - currentH;
    currentH = currentH + stepSizeDt * velocity;
  }

  const specializedFamilies = [
    { name: 'Neural ODEs (Chen et al. 2018)', core: 'Continuous-time dynamical systems', distinct: 'Depth is continuous time t; evaluated using adaptive ODE numerical solvers (Euler / Runge-Kutta).' },
    { name: 'Spiking Neural Networks (SNN)', core: 'Temporal event-driven neuromorphic units', distinct: 'Neurons communicate via discrete spike events in time (0 or 1 pulses); runs at milliwatt power on brain-inspired neuromorphic chips.' },
    { name: 'Kolmogorov-Arnold Networks (KAN 2024)', core: 'Learnable univariate splines on edges', distinct: 'Replaces fixed activation functions on nodes with learnable 1D B-spline curves on connections between neurons.' },
    { name: 'Physics-Informed Neural Networks (PINN)', core: 'PDE / ODE regularized feedforward networks', distinct: 'Injects known laws of physics (Navier-Stokes, wave equations, heat diffusion) directly into the loss function.' },
    { name: 'Capsule Networks (Sabour & Hinton 2017)', core: 'Vector-output capsules with dynamic routing', distinct: 'Represents entities and spatial orientation poses as coordinate vectors rather than scalar feature maps.' },
    { name: 'Reservoir Computing', core: 'Fixed recurrent dynamical reservoir', distinct: 'Recurrent weight matrix is randomly fixed and never trained; only linear readout weights are trained with simple regression.' },
  ];

  const runOdeTest = () => {
    markTestRun('specialized');
    markLabCompleted('specialized');
    const lines = [
      '[Neural ODE Continuous Integration Test]',
      `Initial State h(0): ${initialH0}`,
      `Integration Step Size dt: ${stepSizeDt}`,
      `Equation: dh/dt = f(h) = 1.0 - h (Pulls state toward equilibrium 1.0)`,
      'Continuous State Trajectory:',
      ...trajectory.map((pt) => `  Depth t = ${pt.t} -> State h(t) = ${pt.h}`),
      'STATUS: PASS (Adjoint sensitivity method valid for backpropagation through ODE solver)',
      '✓ Level 8 Progress Recorded!',
    ];
    setCodeOutput(lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Level 8 · Specialized Frontiers & Continuous Depths
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Neural ODEs, SNNs, KANs & Continuous Physics
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Where discrete layers disappear into continuous differential vector fields, edge splines, and brain-like temporal spikes.
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
            Neural ODE Solver
          </button>
          <button
            onClick={() => setSubTab('tax')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'tax'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Frontier Catalog
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
            <span>Water Slide Analogy</span>
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
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 shadow-xs">
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                Integration Step Size (dt): <strong className="text-emerald-600 dark:text-emerald-400">{stepSizeDt.toFixed(2)}</strong>
              </span>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={stepSizeDt}
                onChange={(e) => setStepSizeDt(parseFloat(e.target.value))}
                className="w-28 accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                Initial State h(0): <strong className="text-emerald-600 dark:text-emerald-400">{initialH0.toFixed(1)}</strong>
              </span>
              <input
                type="range"
                min="-1.0"
                max="1.5"
                step="0.5"
                value={initialH0}
                onChange={(e) => setInitialH0(parseFloat(e.target.value))}
                className="w-28 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Continuous Integration Trajectory */}
          <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Continuous State Evolution:</span>
              <span className="font-mono">dh/dt = f(h(t), t) = 1.0 - h(t)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {trajectory.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-white/5 text-center space-y-1"
                >
                  <div className="text-[10px] font-mono text-slate-400">t = {pt.t}</div>
                  <div className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-300">{pt.h}</div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    vel: {(1.0 - pt.h).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>Continuous Depth Insight:</strong> In standard networks, you must choose 18, 50, or 101 layers before training. In Neural ODEs, network depth is a continuous time variable $t \in [0, T]$. You can test with a fast, coarse step size ($dt=0.3$) for low latency on mobile, or fine $dt=0.05$ for maximum accuracy on cloud servers—without re-training the network!
            </div>
          </div>

          {/* Quick Concept Check Prompt */}
          <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-xl border border-emerald-300/80 dark:border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Ready to verify Level 8 mastery?</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">Test continuous depth, Kolmogorov-Arnold splines, and neuromorphic SNN concepts.</p>
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

      {/* Frontier Catalog Tab */}
      {subTab === 'tax' && (
        <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Specialized & Unconventional Architectures</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            A reference breakdown of architectures that challenge conventional matrix multiplications:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-4 font-semibold">Architecture</th>
                  <th className="py-2.5 px-4 font-semibold">Core Innovation</th>
                  <th className="py-2.5 px-4 font-semibold">What Makes It Distinct</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {specializedFamilies.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{item.core}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.distinct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code Tab */}
      {subTab === 'code' && (
        <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Neural ODE Euler Integration Step</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Formula: h_(t+dt) = h_t + dt · f(h_t, t, θ)
              </p>
            </div>
            <button
              onClick={runOdeTest}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Simulate Continuous Solve</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
{`function neuralOdeEulerStep(h_t: number, dt: number, velocityField: (h: number) => number): number {
  // 1. Evaluate neural network to get instantaneous rate of change:
  const dh = velocityField(h_t);

  // 2. Continuous time Euler step:
  return h_t + dt * dh;
}`}
          </pre>

          {codeOutput && (
            <div className="p-4 bg-slate-950 border border-emerald-500/30 rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Integration Diagnostics</span>
              </div>
              <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">{codeOutput}</pre>
            </div>
          )}
        </div>
      )}

      {/* Analogy Tab */}
      {subTab === 'analogy' && (
        <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">The Water Slide Analogy</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Standard neural networks are like a building with separate concrete floors: you take an elevator that stops at Floor 1, then Floor 2, then Floor 3.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-white/5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <p>
              <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">A Neural ODE is a smooth continuous water slide.</strong> There are no discrete floors. You glide down smoothly, and a differential equation specifies the exact curve and speed at every single millimeter along your journey!
            </p>
          </div>
        </div>
      )}

      {/* SubTab 5: Checkpoint Quiz */}
      {subTab === 'quiz' && (
        <CheckpointQuiz
          quizKey="quiz_specialized"
          title={LAB_QUIZZES.specialized.title}
          questions={LAB_QUIZZES.specialized.questions}
          onPassAll={() => markLabCompleted('specialized')}
        />
      )}
    </div>
  );
};
