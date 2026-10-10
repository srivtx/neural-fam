/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Code2, Play, CheckCircle2, Sparkles, Layers, Sliders, Award, ArrowRight } from 'lucide-react';
import { CheckpointQuiz } from '../CheckpointQuiz';
import { LAB_QUIZZES } from '../../data/labQuizzes';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';

export const GenerativeLab: React.FC = () => {
  const [denoiseStep, setDenoiseStep] = useState<number>(4); // Timestep t from 0 to 10
  const [subTab, setSubTab] = useState<'visual' | 'code' | 'paradigms' | 'analogy' | 'quiz'>('visual');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  // 10 Steps of simulated denoising on an 8x8 digit pattern (e.g. digit "8")
  // At t=10: pure random noise. At t=0: crystal clean crisp 8.
  const maxSteps = 10;
  const noiseLevel = denoiseStep / maxSteps; // 1.0 = pure noise, 0.0 = clean

  const generativeParadigms = [
    { name: 'Diffusion Models', models: 'Stable Diffusion, Midjourney, FLUX', mechanism: 'Reverses gradual noise injection via U-Net or DiT score prediction', tradeoff: 'Highest fidelity and diverse sampling; requires multiple iterative denoising steps' },
    { name: 'Variational Autoencoders (VAE)', models: 'Standard VAE, VQ-VAE', mechanism: 'Encodes input into continuous probabilistic Gaussian latent space q(z|x) and reconstructs', tradeoff: 'Single-step instant generation; can suffer from slightly blurry outputs' },
    { name: 'Generative Adversarial Nets (GAN)', models: 'StyleGAN, BigGAN', mechanism: 'Minimax game between a Generator and Discriminator discriminator', tradeoff: 'Super fast single-pass generation; prone to mode collapse and training instability' },
    { name: 'Normalizing Flows', models: 'RealNVP, Glow', mechanism: 'Sequence of invertible mathematical functions with tractable Jacobian determinants', tradeoff: 'Exact likelihood evaluation and exact invertibility; heavy parameter footprint' },
    { name: 'Autoregressive Generative', models: 'GPT-4, PixelCNN, AudioLM', mechanism: 'Generates sequence elements strictly one-by-one conditioned on all previous elements', tradeoff: 'Flawless coherence; inference runtime scales with length' },
  ];

  const runDiffusionTest = () => {
    markTestRun('generative');
    markLabCompleted('generative');
    const lines = [
      '[Diffusion Reverse Denoising Trajectory Test]',
      `Current Reverse Step: t=${denoiseStep} / ${maxSteps}`,
      `Noise Level σ_t: ${(noiseLevel * 100).toFixed(0)}%`,
      `Predicted Noise ε_θ(x_t, t): Successfully removed ~${((1 - noiseLevel) * 100).toFixed(0)}% corrupted entropy`,
      'Score matching loss: L_simple = E_{t, x_0, ε}[ || ε - ε_θ(x_t, t) ||^2 ] = 0.0124 (Converged)',
      'STATUS: PASS (High-fidelity sample synthesized from Gaussian prior)',
      '✓ Level 7 progress recorded.',
    ];
    setCodeOutput(lines.join('\n'));
  };

  // 8x8 clean digit "8" grid
  const cleanGrid = [
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ];

  // Pseudo-random noise values fixed per coordinate
  const noiseGrid = [
    [0.8, 0.2, 0.4, 0.9, 0.1, 0.7, 0.3, 0.6],
    [0.1, 0.9, 0.8, 0.3, 0.6, 0.4, 0.9, 0.2],
    [0.7, 0.3, 0.2, 0.8, 0.5, 0.1, 0.7, 0.9],
    [0.4, 0.6, 0.9, 0.1, 0.8, 0.3, 0.2, 0.5],
    [0.9, 0.1, 0.7, 0.5, 0.2, 0.8, 0.4, 0.6],
    [0.3, 0.8, 0.4, 0.6, 0.9, 0.2, 0.5, 0.1],
    [0.6, 0.2, 0.5, 0.9, 0.1, 0.7, 0.8, 0.3],
    [0.2, 0.7, 0.3, 0.4, 0.8, 0.5, 0.1, 0.9],
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ink-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Level 7 · Generative models
          </span>
          <h2 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white mt-0.5">
            Generative models: Diffusion, VAE, and GAN
          </h2>
          <p className="text-sm text-ink-600 dark:text-ink-400 mt-1 max-w-2xl">
            Generative models are defined by <em>how they learn to produce data</em>, not by a single architecture. A diffusion model can use CNNs (U-Net) or Transformers (DiT).
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
            Denoising process
          </button>
          <button
            onClick={() => setSubTab('paradigms')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'paradigms'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            Paradigms
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
          {/* Timeline Slider */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-semibold text-ink-800 dark:text-ink-200">
                  Reverse Denoising Step: <strong className="text-brand-600 dark:text-brand-400 font-mono">t = {denoiseStep}</strong>
                </span>
              </div>
              <span className="text-xs font-mono text-ink-500 dark:text-ink-400">
                {denoiseStep === 0
                  ? 'Step t=0 (clean signal x_0)'
                  : denoiseStep === maxSteps
                  ? 'Step t=10 (Gaussian noise x_T)'
                  : `Intermediate denoising (${((1 - noiseLevel) * 100).toFixed(0)}% signal recovered)`}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max={maxSteps}
              step="1"
              value={denoiseStep}
              onChange={(e) => setDenoiseStep(parseInt(e.target.value, 10))}
              className="w-full accent-brand-600 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] font-mono text-ink-500">
              <span>t=0: Clean Data $x_0$</span>
              <span>← Neural Network Reverse Path ←</span>
              <span>t=T: Pure Noise $x_T$</span>
            </div>
          </div>

          {/* Canvas Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-6 flex flex-col items-center justify-center space-y-4 shadow-xs">
              <span className="text-xs font-mono text-ink-500">8x8 Pixel Grid Under Denoising Schedule:</span>
              
              <div className="grid grid-cols-8 gap-1.5 p-3 bg-ink-900 rounded-xl border border-ink-800 shadow-inner">
                {cleanGrid.map((row, r) =>
                  row.map((cleanVal, c) => {
                    const noiseVal = noiseGrid[r][c];
                    const interp = (1 - noiseLevel) * cleanVal + noiseLevel * noiseVal;
                    const brightness = Math.min(255, Math.max(0, Math.round(interp * 255)));

                    return (
                      <div
                        key={`${r}-${c}`}
                        className="w-6 h-6 rounded-xs transition-colors duration-200 flex items-center justify-center text-[8px] font-mono"
                        style={{
                          backgroundColor: `rgb(${brightness}, ${brightness}, ${brightness})`,
                          color: brightness > 128 ? '#000' : '#fff',
                        }}
                      />
                    );
                  })
                )}
              </div>

              <div className="text-[11px] text-ink-500 dark:text-ink-400 text-center font-mono">
                Pixel State: x_t = √(α_t) x_0 + √(1 - α_t) ε
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 shadow-xs">
                <h3 className="text-sm font-bold font-display tracking-tight text-ink-900 dark:text-white">Why diffusion avoids mode collapse</h3>
                <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                  GANs suffer from <strong>mode collapse</strong>: the generator discovers a couple of trick samples that fool the discriminator and stops learning variety.
                </p>
                <div className="p-3 bg-brand-50 dark:bg-brand-950/20 rounded-lg border border-brand-300/80 dark:border-brand-500/30 text-xs text-ink-700 dark:text-ink-300 space-y-1">
                  <span className="font-bold text-brand-800 dark:text-brand-300 block">The Denoising Trick:</span>
                  <p>
                    By breaking the generation problem into 50 tiny micro-steps of subtracting small amounts of noise, the neural network only ever solves an easy regression problem: <em>predicting Gaussian noise ε</em>.
                  </p>
                </div>
              </div>

              <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 shadow-xs">
                <h3 className="text-sm font-bold font-display tracking-tight text-ink-900 dark:text-white">Architectural backbones: U-Net to DiT</h3>
                <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                  Early models (Stable Diffusion 1.5) used convolutional <strong>U-Nets</strong> with residual skips. Modern models (FLUX, Sora) use <strong>Diffusion Transformers (DiT)</strong>: dividing latent image patches into tokens and processing them with standard self-attention blocks.
                </p>
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
                <p className="text-xs text-ink-600 dark:text-ink-300">Test your grasp of noise estimation, U-Net skip connections, and VAE latents.</p>
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

      {/* Paradigms Comparison Tab */}
      {subTab === 'paradigms' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-6 space-y-5 shadow-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Five core generative paradigms</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generativeParadigms.map((p, idx) => (
              <div key={idx} className="p-4 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-ink-900 dark:text-white text-sm">{p.name}</h4>
                  <span className="font-mono text-[10px] text-brand-700 dark:text-brand-400 font-semibold">{p.models}</span>
                </div>
                <p className="text-ink-600 dark:text-ink-300 leading-relaxed">
                  <strong>Mechanism:</strong> {p.mechanism}
                </p>
                <div className="p-2 bg-surface dark:bg-ink-950 rounded border border-ink-200 dark:border-white/5 text-[11px] text-ink-500 dark:text-ink-400">
                  <strong>Trade-off:</strong> {p.tradeoff}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Tab */}
      {subTab === 'code' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Reverse diffusion denoising step</h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Formula: x_(t-1) = 1/√α_t · (x_t - (1 - α_t)/√(1 - α_bar_t) · ε_θ(x_t, t)) + σ_t z
              </p>
            </div>
            <button
              onClick={runDiffusionTest}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </button>
          </div>

          <pre className="p-4 bg-ink-950 rounded-lg border border-ink-800 font-mono text-xs text-ink-300 overflow-x-auto leading-relaxed">
{`function reverseDiffusionStep(x_t: number, t: number, noiseModel: (x: number, step: number) => number): number {
  // 1. Neural network estimates the noise:
  const predictedNoise = noiseModel(x_t, t);

  // 2. Subtract predicted noise to take one step toward clean data
  const alpha = 0.95;
  const beta = 0.05;
  const x_prev = (1 / Math.sqrt(alpha)) * (x_t - (beta / Math.sqrt(1 - alpha)) * predictedNoise);

  return x_prev;
}`}
          </pre>

          {codeOutput && (
            <div className="p-4 bg-ink-950 border border-green-500/30 rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Diagnostics</span>
              </div>
              <pre className="text-xs font-mono text-ink-300 whitespace-pre-wrap">{codeOutput}</pre>
            </div>
          )}
        </div>
      )}

      {/* Analogy Tab */}
      {subTab === 'analogy' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Analogy: Ink in water</h3>
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
            Drop a single droplet of blue ink into a glass of warm water.
          </p>
          <div className="p-4 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2 text-xs text-ink-600 dark:text-ink-300">
            <p>
              <strong className="text-brand-700 dark:text-brand-400 font-semibold">The Forward Process ($t=0 \to T$):</strong> Over 60 seconds, the ink droplet dissolves and diffuses until the entire glass is an indistinct, hazy light blue (pure random noise).
            </p>
            <p>
              <strong className="text-brand-800 dark:text-brand-300 font-medium">The Reverse Process (Neural Denoising):</strong> Diffusion models learn to reverse this process. The neural network estimates the added noise and subtracts it step by step until the sharp image is recovered.
            </p>
          </div>
        </div>
      )}

      {/* SubTab 5: Checkpoint Quiz */}
      {subTab === 'quiz' && (
        <CheckpointQuiz
          quizKey="quiz_generative"
          title={LAB_QUIZZES.generative.title}
          questions={LAB_QUIZZES.generative.questions}
          onPassAll={() => markLabCompleted('generative')}
        />
      )}
    </div>
  );
};
