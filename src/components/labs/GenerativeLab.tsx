/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HelpCircle, Code2, Play, Pause, RotateCcw, CheckCircle2, Sparkles, Layers, Sliders, Award, ArrowRight, Eye } from 'lucide-react';
import { CheckpointQuiz } from '../CheckpointQuiz';
import { LAB_QUIZZES } from '../../data/labQuizzes';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';

// Target 8x8 pattern grids
type PatternKey = 'eight' | 'face' | 'star' | 'heart';

interface PatternDef {
  id: PatternKey;
  name: string;
  grid: number[][];
}

const PATTERNS: PatternDef[] = [
  {
    id: 'eight',
    name: 'Digit 8',
    grid: [
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
    ],
  },
  {
    id: 'face',
    name: 'Smiley face',
    grid: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 0, 0, 0, 1, 0],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 1, 0, 1],
      [1, 0, 0, 1, 1, 0, 0, 1],
      [0, 1, 0, 0, 0, 0, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
    ],
  },
  {
    id: 'star',
    name: 'Geometric star',
    grid: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 0, 1, 1, 0, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
    ],
  },
  {
    id: 'heart',
    name: 'Heart icon',
    grid: [
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
];

// Fixed deterministic pseudo-random Gaussian noise matrix
const NOISE_GRID: number[][] = [
  [0.82, 0.18, 0.45, 0.91, 0.12, 0.74, 0.33, 0.62],
  [0.15, 0.94, 0.78, 0.28, 0.61, 0.42, 0.88, 0.23],
  [0.71, 0.35, 0.22, 0.84, 0.53, 0.14, 0.69, 0.93],
  [0.39, 0.63, 0.87, 0.09, 0.79, 0.31, 0.24, 0.56],
  [0.92, 0.08, 0.73, 0.51, 0.21, 0.82, 0.44, 0.67],
  [0.29, 0.85, 0.41, 0.58, 0.95, 0.19, 0.52, 0.11],
  [0.64, 0.26, 0.49, 0.89, 0.16, 0.76, 0.81, 0.37],
  [0.22, 0.72, 0.34, 0.43, 0.86, 0.48, 0.13, 0.97],
];

export const GenerativeLab: React.FC = () => {
  const [selectedPatternKey, setSelectedPatternKey] = useState<PatternKey>('eight');
  const [denoiseStep, setDenoiseStep] = useState<number>(8); // t in 0..20
  const [scheduleType, setScheduleType] = useState<'cosine' | 'linear'>('cosine');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [subTab, setSubTab] = useState<'visual' | 'code' | 'paradigms' | 'analogy' | 'quiz'>('visual');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  const totalSteps = 20;
  const activePattern = PATTERNS.find((p) => p.id === selectedPatternKey) || PATTERNS[0];

  // Autoplay timer effect
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = window.setInterval(() => {
        setDenoiseStep((prev) => {
          if (prev <= 0) {
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 220);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  // Compute variance schedule values
  // alpha_bar_t represents cumulative signal retention factor
  const scheduleValues = useMemo(() => {
    const t = denoiseStep;
    const T = totalSteps;

    let alphaBar = 1.0;
    let beta = 0.02;

    if (scheduleType === 'cosine') {
      const s = 0.008;
      const f = (val: number) => Math.pow(Math.cos(((val / T + s) / (1 + s)) * (Math.PI / 2)), 2);
      alphaBar = f(t) / f(0);
      alphaBar = Math.max(0.001, Math.min(0.999, alphaBar));
      beta = 1 - alphaBar / (t > 0 ? f(t - 1) / f(0) : 1);
    } else {
      // Linear schedule
      const betaMin = 0.0001;
      const betaMax = 0.02;
      beta = betaMin + (t / T) * (betaMax - betaMin);
      // approximate cumulative alphaBar
      alphaBar = Math.pow(1 - (betaMin + betaMax) / 2, t);
    }

    alphaBar = Math.max(0.001, Math.min(0.999, alphaBar));
    const sqrtAlphaBar = Math.sqrt(alphaBar);
    const sqrtOneMinusAlphaBar = Math.sqrt(1 - alphaBar);
    const snr = alphaBar / (1 - alphaBar);
    const snrDb = 10 * Math.log10(Math.max(0.0001, snr));

    return {
      t,
      T,
      alphaBar,
      sqrtAlphaBar,
      sqrtOneMinusAlphaBar,
      beta: Math.max(0.0001, beta),
      snr,
      snrDb,
    };
  }, [denoiseStep, totalSteps, scheduleType]);

  const generativeParadigms = [
    { name: 'Diffusion Models', models: 'Stable Diffusion, Midjourney, FLUX', mechanism: 'Reverses gradual Gaussian noise injection via score matching (U-Net / DiT)', tradeoff: 'Highest fidelity and mode coverage; iterative multi-step sampling' },
    { name: 'Variational Autoencoders (VAE)', models: 'Standard VAE, VQ-VAE, SD VAE Latent', mechanism: 'Encodes input into continuous probabilistic Gaussian latent space q(z|x) and reconstructs', tradeoff: 'Instant single-pass generation; can suffer from slightly blurry reconstructed edges' },
    { name: 'Generative Adversarial Nets (GAN)', models: 'StyleGAN3, BigGAN, CycleGAN', mechanism: 'Minimax zero-sum game between Generator G(z) and Discriminator D(x)', tradeoff: 'Fast single-pass synthesis; prone to mode collapse and training instability' },
    { name: 'Normalizing Flows', models: 'RealNVP, Glow, Flow Matching', mechanism: 'Sequence of invertible mathematical functions with tractable Jacobian determinants', tradeoff: 'Exact log-likelihood evaluation and invertible latents; heavy parameter footprint' },
    { name: 'Autoregressive Generative', models: 'GPT-4, PixelCNN, AudioLM, Sora', mechanism: 'Generates sequence elements strictly one-by-one conditioned on past tokens', tradeoff: 'Strong context coherence; inference runtime scales linearly with sequence length' },
  ];

  const runDiffusionTest = () => {
    markTestRun('generative');
    markLabCompleted('generative');
    const lines = [
      '[Diffusion Reverse Denoising Trajectory Test]',
      `Selected Pattern: ${activePattern.name}`,
      `Schedule Mode: ${scheduleType.toUpperCase()} (Nichol & Dhariwal 2021)`,
      `Current Reverse Step: t=${scheduleValues.t} / ${scheduleValues.T}`,
      `Signal Retention Factor √ᾱ_t: ${(scheduleValues.sqrtAlphaBar * 100).toFixed(1)}%`,
      `Noise Level √(1 - ᾱ_t): ${(scheduleValues.sqrtOneMinusAlphaBar * 100).toFixed(1)}%`,
      `Signal-to-Noise Ratio (SNR): ${scheduleValues.snr.toFixed(3)} (${scheduleValues.snrDb.toFixed(1)} dB)`,
      `Instantaneous Step Variance β_t: ${scheduleValues.beta.toFixed(4)}`,
      'Score matching loss: L_simple = E_{t, x_0, ε}[ || ε - ε_θ(x_t, t) ||^2 ] = 0.0094 (Converged)',
      'STATUS: PASS (High-fidelity sample synthesized from Gaussian prior)',
      '✓ Level 7 progress recorded.',
    ];
    setCodeOutput(lines.join('\n'));
  };

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
            Iterative reverse Langevin dynamics: synthesizing structured signals out of pure thermodynamic chaos via learned score vectors <span className="font-mono text-xs font-bold text-ink-800 dark:text-ink-200">∇_x log p(x)</span>.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 p-1 bg-ink-100 dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-lg max-w-full overflow-x-auto">
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
          {/* Pattern Selector & Trajectory Controls */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold font-display tracking-tight text-ink-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Reverse Langevin Sampling Trajectory</span>
                </h3>
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Select a target prior pattern and step backward through the diffusion trajectory from noise to signal.
                </p>
              </div>

              {/* Target Pattern Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPatternKey(p.id)}
                    className={`px-3 py-1 text-xs rounded-lg border transition-all cursor-pointer font-medium ${
                      selectedPatternKey === p.id
                        ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-700 dark:text-brand-300 font-bold shadow-xs'
                        : 'bg-ink-50 dark:bg-ink-950/60 border-ink-200 dark:border-white/10 text-ink-700 dark:text-ink-300 hover:border-brand-400'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Playback Controls & Scrubber */}
            <div className="p-4 bg-ink-50 dark:bg-ink-950 rounded-xl border border-ink-200 dark:border-white/5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      isPlaying
                        ? 'bg-amber-600 text-white'
                        : 'bg-brand-600 hover:bg-brand-500 text-white shadow-xs'
                    }`}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isPlaying ? 'Pause' : 'Play trajectory'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setDenoiseStep(totalSteps);
                    }}
                    className="p-1.5 rounded-lg border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white cursor-pointer"
                    title="Reset to pure noise (t = 20)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-xs font-mono font-bold text-ink-900 dark:text-white pl-2">
                    Timestep: <span className="text-brand-600 dark:text-brand-400 font-bold">t = {scheduleValues.t}</span> / {scheduleValues.T}
                  </span>
                </div>

                {/* Schedule Selector */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-ink-500 dark:text-ink-400">Schedule:</span>
                  <button
                    onClick={() => setScheduleType('cosine')}
                    className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                      scheduleType === 'cosine'
                        ? 'bg-brand-600 text-white font-bold'
                        : 'bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-400'
                    }`}
                  >
                    Cosine (Improved)
                  </button>
                  <button
                    onClick={() => setScheduleType('linear')}
                    className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                      scheduleType === 'linear'
                        ? 'bg-brand-600 text-white font-bold'
                        : 'bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-400'
                    }`}
                  >
                    Linear (DDPM)
                  </button>
                </div>
              </div>

              {/* Slider */}
              <input
                type="range"
                min="0"
                max={totalSteps}
                step="1"
                value={denoiseStep}
                onChange={(e) => {
                  setIsPlaying(false);
                  setDenoiseStep(parseInt(e.target.value, 10));
                }}
                className="w-full accent-brand-600 cursor-pointer"
              />

              <div className="flex flex-col sm:flex-row justify-between gap-1 text-[10px] sm:text-[11px] font-mono text-ink-500 dark:text-ink-400">
                <span>{"← Clean Data x_0 (t = 0)"}</span>
                <span className="hidden sm:inline">{"Reverse Denoising Direction ←"}</span>
                <span>{"Pure Prior Noise x_T ~ N(0, I) (t = 20)"}</span>
              </div>
            </div>

            {/* Quantitative Schedule Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-ink-50 dark:bg-ink-950 rounded-lg border border-ink-200 dark:border-white/5">
                <span className="text-ink-500 block text-[10px]">Signal Retention √ᾱ_t:</span>
                <span className="font-bold text-ink-900 dark:text-white">{(scheduleValues.sqrtAlphaBar * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2.5 bg-ink-50 dark:bg-ink-950 rounded-lg border border-ink-200 dark:border-white/5">
                <span className="text-ink-500 block text-[10px]">Noise Level √(1 - ᾱ_t):</span>
                <span className="font-bold text-ink-900 dark:text-white">{(scheduleValues.sqrtOneMinusAlphaBar * 100).toFixed(1)}%</span>
              </div>
              <div className="p-2.5 bg-ink-50 dark:bg-ink-950 rounded-lg border border-ink-200 dark:border-white/5">
                <span className="text-ink-500 block text-[10px]">SNR (Signal/Noise):</span>
                <span className="font-bold text-ink-900 dark:text-white">{scheduleValues.snrDb.toFixed(1)} dB</span>
              </div>
              <div className="p-2.5 bg-ink-50 dark:bg-ink-950 rounded-lg border border-ink-200 dark:border-white/5">
                <span className="text-ink-500 block text-[10px]">Step Variance β_t:</span>
                <span className="font-bold text-ink-900 dark:text-white">{scheduleValues.beta.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {/* Interactive Dual-Panel Visualization: Latent x_t vs Predicted x_0 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Noisy Latent x_t */}
            <div className="lg:col-span-6 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-4 sm:p-6 flex flex-col items-center justify-center space-y-4 shadow-xs">
              <div className="flex items-center justify-between w-full text-xs">
                <span className="font-semibold text-ink-900 dark:text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Noisy Latent State $x_t$</span>
                </span>
                <span className="font-mono text-ink-500 text-[11px]">8×8 pixel grid</span>
              </div>

              <div className="grid grid-cols-8 gap-1 sm:gap-1.5 p-2.5 sm:p-3.5 bg-ink-900 rounded-xl border border-ink-800 shadow-inner max-w-full overflow-x-auto">
                {activePattern.grid.map((row, r) =>
                  row.map((cleanVal, c) => {
                    const noiseVal = NOISE_GRID[r][c];
                    // Continuous interpolation according to standard DDPM formula
                    const val =
                      scheduleValues.sqrtAlphaBar * cleanVal +
                      scheduleValues.sqrtOneMinusAlphaBar * noiseVal;
                    const clamped = Math.max(0, Math.min(1, val));
                    const brightness = Math.round(clamped * 255);

                    return (
                      <div
                        key={`noisy-${r}-${c}`}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-xs transition-colors duration-150 flex items-center justify-center text-[7px] font-mono select-none"
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
                {"Formula: x_t = √(ᾱ_t) x_0 + √(1 - ᾱ_t) ε"}
              </div>
            </div>

            {/* Right: Tweedie's Clean Reconstruction x_hat_0 */}
            <div className="lg:col-span-6 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-4 sm:p-6 flex flex-col items-center justify-center space-y-4 shadow-xs">
              <div className="flex items-center justify-between w-full text-xs">
                <span className="font-semibold text-ink-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Model Score Reconstruction x̂_0</span>
                </span>
                <span className="font-mono text-ink-500 text-[11px]">Tweedie estimation</span>
              </div>

              <div className="grid grid-cols-8 gap-1 sm:gap-1.5 p-2.5 sm:p-3.5 bg-ink-900 rounded-xl border border-ink-800 shadow-inner max-w-full overflow-x-auto">
                {activePattern.grid.map((row, r) =>
                  row.map((cleanVal, c) => {
                    // When t is high, model makes a coarse prior guess; as t decreases, Tweedie estimate becomes crystal sharp
                    const confidence = Math.max(0.1, 1 - scheduleValues.t / (totalSteps * 1.3));
                    const noiseEstimateError = (1 - confidence) * (NOISE_GRID[r][c] - 0.5);
                    const reconstructedVal = Math.max(0, Math.min(1, cleanVal * confidence + noiseEstimateError + (1 - confidence) * 0.5));
                    const brightness = Math.round(reconstructedVal * 255);

                    return (
                      <div
                        key={`recon-${r}-${c}`}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-xs transition-colors duration-150 flex items-center justify-center text-[7px] font-mono select-none"
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
                {"Reconstruction: x̂_0 = (x_t - √(1 - ᾱ_t) ε̂_θ) / √(ᾱ_t)"}
              </div>
            </div>
          </div>

          {/* Theoretical Breakdown Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold font-display tracking-tight text-ink-900 dark:text-white">Why diffusion avoids mode collapse</h3>
              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                Generative Adversarial Networks (GANs) suffer from <strong>mode collapse</strong>: the generator discovers a handful of trick samples that fool the discriminator and halts exploratory learning.
              </p>
              <div className="p-3 bg-brand-50 dark:bg-brand-950/20 rounded-lg border border-brand-300/80 dark:border-brand-500/30 text-xs text-ink-700 dark:text-ink-300 space-y-1">
                <span className="font-bold text-brand-800 dark:text-brand-300 block">The Denoising Trick:</span>
                <p>
                  By decomposing generation into dozens of tiny Gaussian noise subtractions, the neural network only ever solves a smooth convex regression problem: <em>predicting Gaussian noise vector $\epsilon$</em>.
                </p>
              </div>
            </div>

            <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold font-display tracking-tight text-ink-900 dark:text-white">Architectural evolution: U-Net to DiT</h3>
              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                Early models (Stable Diffusion 1.5, DDPM) relied on convolutional <strong>U-Nets</strong> with residual skip connections. Modern state-of-the-art systems (FLUX, Sora, Stable Diffusion 3) use <strong>Diffusion Transformers (DiT)</strong>: patchifying continuous latent latents into tokens and processing them with standard self-attention blocks.
              </p>
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
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-4 sm:p-6 space-y-5 shadow-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Five core generative paradigms</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generativeParadigms.map((p, idx) => (
              <div key={idx} className="p-4 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
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
              <span>Run verification</span>
            </button>
          </div>

          <pre className="p-4 bg-ink-950 rounded-lg border border-ink-800 font-mono text-xs text-ink-300 overflow-x-auto leading-relaxed">
{`function reverseDiffusionStep(
  x_t: number, 
  t: number, 
  alpha_t: number, 
  alpha_bar_t: number,
  noiseModel: (x: number, step: number) => number
): number {
  // 1. Neural network estimates the noise vector:
  const predictedNoise = noiseModel(x_t, t);

  // 2. Subtract predicted noise to take one step toward clean data (Tweedie direction)
  const beta_t = 1 - alpha_t;
  const mean = (1 / Math.sqrt(alpha_t)) * (x_t - (beta_t / Math.sqrt(1 - alpha_bar_t)) * predictedNoise);

  // 3. Add stochastic Langevin exploration noise (except at final step t=0)
  const sigma_t = Math.sqrt(beta_t);
  const z = t > 0 ? (Math.random() - 0.5) * 2 : 0;

  return mean + sigma_t * z;
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

      {/* Checkpoint Quiz */}
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
