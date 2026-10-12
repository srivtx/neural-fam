/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Theory Physical Simulation Canvas:
 * An interactive, real-time HTML5 Canvas simulator demonstrating the three core
 * physical metaphors of modern AI:
 * 1. Quantum Electron Bandgap (Quantization & the Physical Bit)
 * 2. Thermodynamic Entropy Dissolution & Reversal (Diffusion Score-Matching)
 * 3. Content-Addressable Attention Beam (Dynamic QK^T Query-Key routing)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Atom,
  Flame,
  Network,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sliders,
  Zap,
  Info,
} from 'lucide-react';
import { soundFX } from '../utils/audio';
import { MathView } from './MathView';

type SimMode = 'quantum' | 'thermodynamic' | 'attention';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  energyLevel?: number;
  targetX?: number;
  targetY?: number;
}

export const TheoryPhysicalSimCanvas: React.FC = () => {
  const [mode, setMode] = useState<SimMode>('thermodynamic');
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Thermodynamic (Diffusion) Controls
  const [diffusionNoise, setDiffusionNoise] = useState<number>(0.5);
  const [reverseDrift, setReverseDrift] = useState<boolean>(false);
  const [entropyLevel, setEntropyLevel] = useState<number>(0);

  // Quantum Controls
  const [thermalTemp, setThermalTemp] = useState<number>(300); // Kelvin
  const [electricField, setElectricField] = useState<number>(1.0); // V/um

  // Attention Controls
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(8); // "it"
  const [softmaxTemp, setSoftmaxTemp] = useState<number>(1.0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  const tokens = [
    { word: 'The', role: 'det', keyVector: [0.1, 0.1] },
    { word: 'animal', role: 'subject', keyVector: [0.9, 0.8] },
    { word: 'did', role: 'aux', keyVector: [0.2, 0.1] },
    { word: 'not', role: 'neg', keyVector: [0.3, 0.2] },
    { word: 'cross', role: 'verb', keyVector: [0.6, 0.4] },
    { word: 'the', role: 'det', keyVector: [0.1, 0.1] },
    { word: 'street', role: 'object', keyVector: [0.4, 0.9] },
    { word: 'because', role: 'conj', keyVector: [0.3, 0.3] },
    { word: 'it', role: 'pronoun', keyVector: [0.85, 0.75] },
    { word: 'was', role: 'copula', keyVector: [0.2, 0.2] },
    { word: 'tired', role: 'adj', keyVector: [0.8, 0.6] },
  ];

  // Initialize particles based on mode
  const initParticles = (currentMode: SimMode, width: number, height: number) => {
    const list: Particle[] = [];
    const count = currentMode === 'thermodynamic' ? 180 : currentMode === 'quantum' ? 40 : 25;

    if (currentMode === 'thermodynamic') {
      // Shape: Glowing neural network constellation (2 concentric rings + spokes)
      const centerX = width / 2;
      const centerY = height / 2;
      for (let i = 0; i < count; i++) {
        const radius = i < 80 ? 45 + (i % 3) * 15 : i < 140 ? 95 + (i % 4) * 10 : 135;
        const angle = (i / count) * Math.PI * 4 + ((i % 5) * 0.2);
        const ox = centerX + Math.cos(angle) * radius;
        const oy = centerY + Math.sin(angle) * radius;
        list.push({
          x: ox,
          y: oy,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          originX: ox,
          originY: oy,
        });
      }
    } else if (currentMode === 'quantum') {
      // Electrons sitting in lower valence band or hopping to conduction band
      for (let i = 0; i < count; i++) {
        const ox = (width * 0.15) + (i / count) * (width * 0.7) + (Math.random() - 0.5) * 20;
        const inConduction = Math.random() < 0.15;
        const oy = inConduction ? height * 0.32 + (Math.random() - 0.5) * 25 : height * 0.72 + (Math.random() - 0.5) * 25;
        list.push({
          x: ox,
          y: oy,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 0.5,
          originX: ox,
          originY: oy,
          energyLevel: inConduction ? 1 : 0,
        });
      }
    } else {
      // Attention energy packets
      list.push(...Array(10).fill(0).map(() => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        originX: 0,
        originY: 0,
      })));
    }

    particlesRef.current = list;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    initParticles(mode, canvas.width, canvas.height);
  }, [mode]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(32, time - lastTime) / 16;
      lastTime = time;

      const w = canvas.width;
      const h = canvas.height;

      // Dark canvas clear with fade trail
      ctx.fillStyle = mode === 'thermodynamic' && reverseDrift ? 'rgba(10, 8, 14, 0.25)' : 'rgba(12, 10, 18, 0.35)';
      ctx.fillRect(0, 0, w, h);

      // =========================================================================
      // 1. THERMODYNAMIC SIMULATION (DIFFUSION & SCORE MATCHING REVERSAL)
      // =========================================================================
      if (mode === 'thermodynamic') {
        const particles = particlesRef.current;
        let totalDispersion = 0;

        particles.forEach((p, idx) => {
          if (isRunning) {
            if (reverseDrift) {
              // Langevin reverse score-matching drift: pull back toward origin manifold
              const dx = p.originX - p.x;
              const dy = p.originY - p.y;
              p.vx = p.vx * 0.85 + dx * 0.08;
              p.vy = p.vy * 0.85 + dy * 0.08;
            } else {
              // Forward Brownian thermal diffusion
              const noiseScale = diffusionNoise * 2.2;
              p.vx += (Math.random() - 0.5) * noiseScale;
              p.vy += (Math.random() - 0.5) * noiseScale;
              p.vx *= 0.96;
              p.vy *= 0.96;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Bounding bounce
            if (p.x < 10) { p.x = 10; p.vx *= -0.8; }
            if (p.x > w - 10) { p.x = w - 10; p.vx *= -0.8; }
            if (p.y < 10) { p.y = 10; p.vy *= -0.8; }
            if (p.y > h - 10) { p.y = h - 10; p.vy *= -0.8; }
          }

          const distFromOrigin = Math.hypot(p.x - p.originX, p.y - p.originY);
          totalDispersion += distFromOrigin;

          // Draw connecting neural filament lines between nearby particles
          for (let j = idx + 1; j < Math.min(idx + 12, particles.length); j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 45) {
              const alpha = (1 - dist / 45) * 0.45;
              ctx.strokeStyle = reverseDrift ? `rgba(67, 83, 255, ${alpha})` : `rgba(255, 138, 0, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }

          // Draw particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, reverseDrift ? 2.5 : 2.0, 0, Math.PI * 2);
          ctx.fillStyle = reverseDrift ? '#60a5fa' : '#f59e0b';
          ctx.shadowColor = reverseDrift ? '#3b82f6' : '#d97706';
          ctx.shadowBlur = reverseDrift ? 8 : 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        const meanEntropy = Math.min(100, Math.round((totalDispersion / particles.length) * 0.8));
        setEntropyLevel(meanEntropy);

        // Center HUD
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.fillStyle = reverseDrift ? '#93c5fd' : '#fcd34d';
        ctx.fillText(
          reverseDrift
            ? '⇄ REVERSE LANGEVIN SCORE MATCHING (∇_x log p(x) Active)'
            : '→ FORWARD BROWNIAN DIFFUSION (Entropy Maximizing)',
          24,
          32
        );
      }

      // =========================================================================
      // 2. QUANTUM ELECTRON BANDGAP SIMULATION
      // =========================================================================
      else if (mode === 'quantum') {
        const particles = particlesRef.current;

        // Draw conduction band (upper) & valence band (lower) with bandgap
        const yCond = h * 0.32;
        const yVal = h * 0.72;
        const gapH = yVal - yCond;

        // Conduction Band zone
        ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
        ctx.fillRect(w * 0.1, yCond - 40, w * 0.8, 55);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(w * 0.1, yCond - 40, w * 0.8, 55);

        // Forbidden Bandgap zone (1.12 eV)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
        ctx.fillRect(w * 0.1, yCond + 15, w * 0.8, gapH - 50);
        ctx.setLineDash([]);

        // Valence Band zone
        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.fillRect(w * 0.1, yVal - 15, w * 0.8, 55);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.strokeRect(w * 0.1, yVal - 15, w * 0.8, 55);

        // Labels
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = '#60a5fa';
        ctx.fillText('CONDUCTION BAND (Free Mobile Electrons · Bit "1")', w * 0.12, yCond - 20);

        ctx.fillStyle = '#f87171';
        ctx.fillText('FORBIDDEN BANDGAP Eg = 1.12 eV (Quantum Forbidden Zone)', w * 0.12, (yCond + yVal) / 2);

        ctx.fillStyle = '#34d399';
        ctx.fillText('VALENCE BAND (Tightly Bound Valence Electrons · Bit "0")', w * 0.12, yVal + 28);

        // Update and draw electrons
        particles.forEach((p) => {
          if (isRunning) {
            // Thermal excitation probability (Fermi-Dirac distribution)
            const thermalJumpProb = (thermalTemp / 1200) * 0.008;
            if (p.energyLevel === 0 && Math.random() < thermalJumpProb) {
              p.energyLevel = 1;
              p.vy = -3.5;
            } else if (p.energyLevel === 1 && Math.random() < 0.006) {
              // Recombination relaxation back to valence band
              p.energyLevel = 0;
              p.vy = 3.5;
            }

            // Electric field drift in conduction band
            if (p.energyLevel === 1) {
              p.vx = electricField * 1.8 + (Math.random() - 0.5) * 1.5;
            } else {
              p.vx = (Math.random() - 0.5) * 0.8;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Target Y positions
            const targetY = p.energyLevel === 1 ? yCond - 10 : yVal + 10;
            p.y += (targetY - p.y) * 0.08;

            if (p.x < w * 0.12) p.x = w * 0.88;
            if (p.x > w * 0.88) p.x = w * 0.12;
          }

          // Draw electron
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.energyLevel === 1 ? 3.5 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.energyLevel === 1 ? '#93c5fd' : '#10b981';
          ctx.shadowColor = p.energyLevel === 1 ? '#3b82f6' : '#059669';
          ctx.shadowBlur = p.energyLevel === 1 ? 10 : 3;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // =========================================================================
      // 3. CONTENT-ADDRESSABLE ATTENTION BEAM SIMULATION
      // =========================================================================
      else if (mode === 'attention') {
        const queryToken = tokens[selectedTokenIndex];
        const numTokens = tokens.length;
        const startX = w * 0.1;
        const stepX = (w * 0.8) / (numTokens - 1);
        const tokenY = h * 0.65;
        const queryY = h * 0.22;

        // Compute Softmax Attention weights Q*K^T / sqrt(d)
        const dotProducts = tokens.map((t) => {
          const dot = queryToken.keyVector[0] * t.keyVector[0] + queryToken.keyVector[1] * t.keyVector[1];
          return dot / Math.SQRT2;
        });

        // Apply temperature
        const expScores = dotProducts.map((s) => Math.exp(s / Math.max(0.1, softmaxTemp)));
        const sumExp = expScores.reduce((acc, v) => acc + v, 0);
        const attentionWeights = expScores.map((v) => v / sumExp);

        const qX = startX + selectedTokenIndex * stepX;

        // Draw Query Source node
        ctx.beginPath();
        ctx.arc(qX, queryY, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`Q: "${queryToken.word}"`, qX, queryY - 20);

        // Draw attention beams to all tokens
        tokens.forEach((t, i) => {
          const tX = startX + i * stepX;
          const weight = attentionWeights[i];

          // Laser beam
          ctx.beginPath();
          ctx.moveTo(qX, queryY);
          ctx.lineTo(tX, tokenY);
          const beamWidth = Math.max(0.5, weight * 8);
          ctx.lineWidth = beamWidth;
          ctx.strokeStyle = `rgba(244, 63, 94, ${Math.max(0.1, weight * 0.95)})`;
          ctx.stroke();

          // Token Key Node
          const isTarget = i === selectedTokenIndex;
          ctx.beginPath();
          ctx.arc(tX, tokenY, 10 + weight * 12, 0, Math.PI * 2);
          ctx.fillStyle = weight > 0.3 ? '#8b5cf6' : '#374151';
          ctx.fill();

          // Token Text
          ctx.font = `${weight > 0.3 ? 'bold ' : ''}11px JetBrains Mono, monospace`;
          ctx.fillStyle = weight > 0.3 ? '#a78bfa' : '#9ca3af';
          ctx.fillText(t.word, tX, tokenY + 26);

          // Weight percentage pill
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillStyle = weight > 0.3 ? '#34d399' : '#6b7280';
          ctx.fillText(`${(weight * 100).toFixed(1)}%`, tX, tokenY + 40);
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mode, isRunning, diffusionNoise, reverseDrift, thermalTemp, electricField, selectedTokenIndex, softmaxTemp]);

  const handleModeChange = (newMode: SimMode) => {
    setMode(newMode);
    setReverseDrift(false);
    soundFX.playTap();
  };

  const handleTogglePlay = () => {
    setIsRunning((prev) => !prev);
    soundFX.playTap();
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      initParticles(mode, canvas.width, canvas.height);
      setReverseDrift(false);
      soundFX.playTap();
    }
  };

  const handleTriggerReverse = () => {
    setReverseDrift((prev) => !prev);
    if (!reverseDrift) soundFX.playSuccess();
    else soundFX.playTap();
  };

  return (
    <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-5 animate-fade-in">
      {/* Simulation Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200/60 dark:border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Interactive First-Principles Physical Laboratory
          </span>
          <h2 className="text-lg font-bold text-ink-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Live Invariant Canvas: See the Mathematical Jump in Action
          </h2>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-ink-100 dark:bg-ink-800 rounded-xl border border-ink-200/60 dark:border-white/5">
          <button
            onClick={() => handleModeChange('thermodynamic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'thermodynamic'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            1. Thermodynamic Diffusion
          </button>

          <button
            onClick={() => handleModeChange('quantum')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'quantum'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            2. Quantum Bandgap
          </button>

          <button
            onClick={() => handleModeChange('attention')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'attention'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            3. Dynamic Attention Beam
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-ink-200 dark:border-white/10 bg-ink-950 shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-80 sm:h-96 block cursor-crosshair"
          title="Interactive Physical Simulation Canvas"
        />

        {/* Floating Canvas Overlays & Controls */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-ink-900/90 backdrop-blur-md border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              title={isRunning ? 'Pause Simulation' : 'Run Simulation'}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              title="Reset Particles"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {mode === 'thermodynamic' && (
              <button
                onClick={handleTriggerReverse}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer shadow-xs ${
                  reverseDrift
                    ? 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-400/50'
                    : 'bg-amber-500 hover:bg-amber-400 text-ink-950'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {reverseDrift ? 'Reverse Langevin Active' : 'Reverse Arrow of Time (Denoise)'}
              </button>
            )}
          </div>

          {/* Dynamic Status Metric */}
          <div className="flex items-center gap-3 font-mono text-[11px] text-ink-300">
            {mode === 'thermodynamic' && (
              <div>
                Entropy Dissipation: <strong className={reverseDrift ? 'text-blue-400' : 'text-amber-400'}>{entropyLevel}%</strong>
              </div>
            )}
            {mode === 'quantum' && (
              <div>
                Thermal Energy: <strong className="text-emerald-400">{thermalTemp} K</strong> · Bandgap: <strong className="text-red-400">1.12 eV</strong>
              </div>
            )}
            {mode === 'attention' && (
              <div>
                Query: <strong className="text-pink-400">"{tokens[selectedTokenIndex].word}"</strong> · Temperature: <strong className="text-cyan-400">τ = {softmaxTemp.toFixed(1)}</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mode-Specific Interactive Sliders & Parameter Control Deck */}
      <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/40 border border-ink-200/60 dark:border-white/5 space-y-3">
        {mode === 'thermodynamic' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Brownian Noise Variance (Diffusion Speed):</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">{diffusionNoise.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={diffusionNoise}
                onChange={(e) => setDiffusionNoise(parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>
            <div className="text-[11px] text-ink-500 dark:text-ink-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Forward diffusion slowly destroys semantic structure with Gaussian noise. Reversing time (Score Matching) pulls particles back along the learned gradient vector field <MathView math="\nabla_x \log p(x)" />.
              </span>
            </div>
          </div>
        )}

        {mode === 'quantum' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300 flex items-center gap-1">Lattice Temperature (Thermal Energy <MathView math="k_B T" />):</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">{thermalTemp} Kelvin</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="25"
                value={thermalTemp}
                onChange={(e) => setThermalTemp(parseInt(e.target.value, 10))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Gate Electric Field (Voltage Bias):</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">{electricField.toFixed(1)} V/μm</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={electricField}
                onChange={(e) => setElectricField(parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {mode === 'attention' && (
          <div className="space-y-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-ink-400 mr-1">Select Query Token:</span>
              {tokens.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTokenIndex(idx)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    selectedTokenIndex === idx
                      ? 'bg-pink-600 text-white font-bold'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200'
                  }`}
                >
                  {t.word}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 max-w-md">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Softmax Temperature (τ):</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">{softmaxTemp.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={softmaxTemp}
                onChange={(e) => setSoftmaxTemp(parseFloat(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-400 font-mono">
                <span>0.1 (Hard Argmax)</span>
                <span>1.0 (Standard)</span>
                <span>3.0 (Uniform Blur)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
