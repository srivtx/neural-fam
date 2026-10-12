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
 * 4. High-Dimensional Orthogonality & Measure Concentration Simulator
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Atom,
  Flame,
  Network,
  Compass,
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

type SimMode = 'quantum' | 'thermodynamic' | 'attention' | 'geometry';

export const DIMENSION_OPTIONS = [2, 3, 10, 50, 100, 4096] as const;
export type Dimension = (typeof DIMENSION_OPTIONS)[number];

interface GeometryData {
  vectors: Float32Array[];
  cosineSimilarities: number[];
  mean: number;
  variance: number;
  stdDev: number;
  tailProb: number; // P(|cos θ| > 0.05)
  histogram: number[]; // 50 bins across [-1, 1]
  binCenters: number[];
  maxBinCount: number;
  totalPairs: number;
  projectedCoords: { x: number; y: number; z: number; cosWithU0: number }[];
}

function sampleUnitSphereVector(d: number): Float32Array {
  const vec = new Float32Array(d);
  let normSq = 0;
  for (let i = 0; i < d; i++) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const g = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    vec[i] = g;
    normSq += g * g;
  }
  const invNorm = 1 / Math.sqrt(normSq || 1e-12);
  for (let i = 0; i < d; i++) {
    vec[i] *= invNorm;
  }
  return vec;
}

function computeGeometrySimulation(d: number, n: number): GeometryData {
  const vectors: Float32Array[] = [];
  for (let i = 0; i < n; i++) {
    vectors.push(sampleUnitSphereVector(d));
  }

  // Reference vector u0 is vectors[0]
  const u0 = vectors[0];

  // Build 2 orthogonal directions w1 and w2 for projection visualization
  const w1 = new Float32Array(d);
  const w2 = new Float32Array(d);

  if (d === 2) {
    w1[0] = -u0[1];
    w1[1] = u0[0];
  } else {
    // Generate random direction and Gram-Schmidt orthogonalize against u0
    const r1 = sampleUnitSphereVector(d);
    let dot1 = 0;
    for (let i = 0; i < d; i++) dot1 += r1[i] * u0[i];
    let normSq1 = 0;
    for (let i = 0; i < d; i++) {
      w1[i] = r1[i] - dot1 * u0[i];
      normSq1 += w1[i] * w1[i];
    }
    const invNorm1 = 1 / Math.sqrt(normSq1 || 1e-12);
    for (let i = 0; i < d; i++) w1[i] *= invNorm1;

    // Second orthogonal direction
    const r2 = sampleUnitSphereVector(d);
    let dot2_u = 0;
    let dot2_w = 0;
    for (let i = 0; i < d; i++) {
      dot2_u += r2[i] * u0[i];
      dot2_w += r2[i] * w1[i];
    }
    let normSq2 = 0;
    for (let i = 0; i < d; i++) {
      w2[i] = r2[i] - dot2_u * u0[i] - dot2_w * w1[i];
      normSq2 += w2[i] * w2[i];
    }
    const invNorm2 = 1 / Math.sqrt(normSq2 || 1e-12);
    for (let i = 0; i < d; i++) w2[i] *= invNorm2;
  }

  // Precompute 2D projection for visualization (first min(n, 160) vectors)
  const maxProj = Math.min(n, 160);
  const projectedCoords: { x: number; y: number; z: number; cosWithU0: number }[] = [];

  for (let i = 0; i < maxProj; i++) {
    const v = vectors[i];
    let cosWithU0 = 0;
    let projY = 0;
    let projZ = 0;
    for (let k = 0; k < d; k++) {
      cosWithU0 += v[k] * u0[k];
      projY += v[k] * w1[k];
      projZ += v[k] * w2[k];
    }
    cosWithU0 = Math.max(-1, Math.min(1, cosWithU0));

    // For visualization:
    // x coordinate is cosWithU0 (the coordinate along u0)
    // The orthogonal component has magnitude sqrt(max(0, 1 - cosWithU0^2))
    const rPerp = Math.sqrt(Math.max(0, 1 - cosWithU0 * cosWithU0));
    const yzNorm = Math.sqrt(projY * projY + projZ * projZ);
    const scale = yzNorm > 1e-6 ? rPerp / yzNorm : (rPerp > 0 ? rPerp : 0);

    projectedCoords.push({
      x: cosWithU0,
      y: projY * scale,
      z: projZ * scale,
      cosWithU0,
    });
  }

  // Pairwise cosine similarities
  const similarities: number[] = [];
  const maxPairs = 10000;
  const totalPossiblePairs = (n * (n - 1)) / 2;

  if (totalPossiblePairs <= maxPairs) {
    for (let i = 0; i < n; i++) {
      const vi = vectors[i];
      for (let j = i + 1; j < n; j++) {
        const vj = vectors[j];
        let dot = 0;
        for (let k = 0; k < d; k++) dot += vi[k] * vj[k];
        similarities.push(Math.max(-1, Math.min(1, dot)));
      }
    }
  } else {
    for (let p = 0; p < maxPairs; p++) {
      const i = Math.floor(Math.random() * n);
      let j = Math.floor(Math.random() * (n - 1));
      if (j >= i) j++;
      const vi = vectors[i];
      const vj = vectors[j];
      let dot = 0;
      for (let k = 0; k < d; k++) dot += vi[k] * vj[k];
      similarities.push(Math.max(-1, Math.min(1, dot)));
    }
  }

  const numPairs = similarities.length;
  let sum = 0;
  let sumSq = 0;
  let tailCount = 0;

  for (let i = 0; i < numPairs; i++) {
    const s = similarities[i];
    sum += s;
    sumSq += s * s;
    if (Math.abs(s) > 0.05) {
      tailCount++;
    }
  }

  const mean = sum / (numPairs || 1);
  const variance = Math.max(0, sumSq / (numPairs || 1) - mean * mean);
  const stdDev = Math.sqrt(variance);
  const tailProb = tailCount / (numPairs || 1);

  // Compute 50 histogram bins across [-1, 1]
  const numBins = 50;
  const histogram = new Array(numBins).fill(0);
  const binCenters = new Array(numBins);
  const binWidth = 2.0 / numBins;

  for (let b = 0; b < numBins; b++) {
    binCenters[b] = -1.0 + (b + 0.5) * binWidth;
  }

  let maxBinCount = 0;
  for (let i = 0; i < numPairs; i++) {
    const s = similarities[i];
    const binIdx = Math.min(numBins - 1, Math.max(0, Math.floor(((s + 1.0) / 2.0) * numBins)));
    histogram[binIdx]++;
    if (histogram[binIdx] > maxBinCount) {
      maxBinCount = histogram[binIdx];
    }
  }

  return {
    vectors,
    cosineSimilarities: similarities,
    mean,
    variance,
    stdDev,
    tailProb,
    histogram,
    binCenters,
    maxBinCount: Math.max(1, maxBinCount),
    totalPairs: numPairs,
    projectedCoords,
  };
}

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

  // High-Dimensional Geometry & Orthogonality Controls
  const [dimension, setDimension] = useState<Dimension>(50);
  const [sampleCount, setSampleCount] = useState<number>(120);
  const [resampleTrigger, setResampleTrigger] = useState<number>(0);
  const geomAngleRef = useRef<number>(0);

  const geomData = useMemo(() => {
    return computeGeometrySimulation(dimension, sampleCount);
  }, [dimension, sampleCount, resampleTrigger]);

  const geomDataRef = useRef<GeometryData>(geomData);
  useEffect(() => {
    geomDataRef.current = geomData;
  }, [geomData]);

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
    } else if (currentMode === 'attention') {
      // Attention energy packets
      list.push(...Array(10).fill(0).map(() => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        originX: 0,
        originY: 0,
      })));
    } else {
      // Geometry mode: 2D projection and histogram rendered deterministically
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
      ctx.fillStyle =
        mode === 'geometry'
          ? '#090810'
          : mode === 'thermodynamic' && reverseDrift
          ? 'rgba(10, 8, 14, 0.25)'
          : 'rgba(12, 10, 18, 0.35)';
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

      // =========================================================================
      // 4. HIGH-DIMENSIONAL ORTHOGONALITY & MEASURE CONCENTRATION SIMULATION
      // =========================================================================
      else if (mode === 'geometry') {
        const gData = geomDataRef.current;
        if (isRunning) {
          geomAngleRef.current += 0.008 * dt;
        }
        const rot = geomAngleRef.current;

        // Fonts
        const fHeading = 'bold 12px JetBrains Mono, monospace';
        const fSub = '10px JetBrains Mono, monospace';
        const fSmall = '9px JetBrains Mono, monospace';

        // -----------------------------------------------------------------------
        // PANE A (LEFT): 2D EQUATOR / HYPERSPHERE PROJECTION
        // -----------------------------------------------------------------------
        const cx = w * 0.22;
        const cy = h * 0.54;
        const R = Math.min(w * 0.16, h * 0.35);

        // Titles
        ctx.textAlign = 'center';
        ctx.font = fHeading;
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`HYPERSPHERE S^{${dimension - 1}} 2D PROJECTION`, cx, cy - R - 20);

        ctx.font = fSub;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(
          dimension === 4096
            ? 'Dirac Collapse: All vectors adhere to 90° Equator'
            : `Dimension d = ${dimension} · Equator Concentration`,
          cx,
          cy - R - 6
        );

        // Shaded Disc
        const discGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        discGrad.addColorStop(0, 'rgba(30, 41, 59, 0.45)');
        discGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
        ctx.fillStyle = discGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();

        // Concentric guide rings
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        [0.25, 0.5, 0.75].forEach((ratio) => {
          ctx.beginPath();
          ctx.arc(cx, cy, R * ratio, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // Outer boundary ring
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();

        // Horizontal Axis (Reference Vector u0 Axis)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - R, cy);
        ctx.lineTo(cx + R, cy);
        ctx.stroke();

        // Vertical Equator Axis (cos θ = 0 -> 90° Orthogonal Subspace)
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, cy - R);
        ctx.lineTo(cx, cy + R);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = fSmall;
        ctx.fillStyle = '#22d3ee';
        ctx.textAlign = 'center';
        ctx.fillText('90° Equator (⊥)', cx, cy - R + 14);

        // Golden Reference Vector u0
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#d97706';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + R, cy);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(cx + R, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();

        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'left';
        ctx.fillText('u₀ (Ref)', cx + R + 6, cy + 4);

        // Sampled Vectors v_i
        const projList = gData.projectedCoords;
        for (let i = 1; i < projList.length; i++) {
          const p = projList[i];
          const rx = p.x;
          const ry = p.y * Math.cos(rot) - p.z * Math.sin(rot);
          const vx = cx + rx * R;
          const vy = cy - ry * R;

          // Draw faint ray from center for first 35 vectors
          if (i < 35) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(vx, vy);
            ctx.strokeStyle =
              Math.abs(p.cosWithU0) <= 0.05
                ? 'rgba(52, 211, 153, 0.22)'
                : 'rgba(167, 139, 250, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Node dot
          ctx.beginPath();
          ctx.arc(vx, vy, Math.abs(p.cosWithU0) <= 0.05 ? 2.5 : 2.0, 0, Math.PI * 2);
          if (Math.abs(p.cosWithU0) <= 0.05) {
            ctx.fillStyle = '#34d399';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = '#818cf8';
            ctx.fill();
          }
        }

        // Highlighted Sample Pair Demonstration (u0 vs v1)
        if (projList.length > 1) {
          const p1 = projList[1];
          const r1x = p1.x;
          const r1y = p1.y * Math.cos(rot) - p1.z * Math.sin(rot);
          const v1x = cx + r1x * R;
          const v1y = cy - r1y * R;

          // Bright emerald beam for v1
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(v1x, v1y);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Compute angle
          const thetaDeg =
            Math.acos(Math.max(-1, Math.min(1, p1.cosWithU0))) * (180 / Math.PI);

          // Angle arc
          const arcR = Math.min(36, R * 0.45);
          const angleCanvas = Math.atan2(v1y - cy, v1x - cx);
          ctx.beginPath();
          if (angleCanvas < 0) {
            ctx.arc(cx, cy, arcR, 0, angleCanvas, true);
          } else {
            ctx.arc(cx, cy, arcR, 0, angleCanvas, false);
          }
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Angle label along arc bisector
          const midAng = angleCanvas / 2;
          const labelDist = arcR + 14;
          const labelX = cx + Math.cos(midAng) * labelDist;
          const labelY = cy + Math.sin(midAng) * labelDist;
          ctx.font = 'bold 10px JetBrains Mono, monospace';
          ctx.fillStyle = '#34d399';
          ctx.textAlign = 'center';
          ctx.fillText(`θ = ${thetaDeg.toFixed(1)}°`, labelX, labelY);

          // If 4096, draw exact perpendicular square symbol
          if (dimension === 4096) {
            const sq = 9;
            const sgnY = v1y >= cy ? 1 : -1;
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx + sq, cy);
            ctx.lineTo(cx + sq, cy + sgnY * sq);
            ctx.lineTo(cx, cy + sgnY * sq);
            ctx.stroke();
          }
        }

        // -----------------------------------------------------------------------
        // PANE B (RIGHT): REAL-TIME COSINE SIMILARITY HISTOGRAM & DIRAC SPIKE
        // -----------------------------------------------------------------------
        const px = w * 0.47;
        const pw = w - px - 24;
        const py = h * 0.20;
        const ph = h * 0.58;

        // Titles
        ctx.textAlign = 'left';
        ctx.font = fHeading;
        ctx.fillStyle = '#c084fc';
        ctx.fillText('PAIRWISE COSINE SIMILARITY: cos(θ) = u·v / (||u|| ||v||)', px, py - 20);

        ctx.font = fSub;
        if (dimension === 4096) {
          ctx.fillStyle = '#34d399';
          ctx.fillText(
            'DIRAC DELTA SPIKE δ(0) · VAR = 1/d = 0.00024 · P(|cos θ| > 0.05) → 0.0%',
            px,
            py - 6
          );
        } else if (dimension >= 50) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(
            `GAUSSIAN CONCENTRATION N(0, 1/d) · Var = ${(1 / dimension).toFixed(4)} · σ = ${(
              1 / Math.sqrt(dimension)
            ).toFixed(3)}`,
            px,
            py - 6
          );
        } else {
          ctx.fillStyle = '#f59e0b';
          ctx.fillText(
            `BROAD ANGULAR DISPERSION · Var = ${(1 / dimension).toFixed(3)} · P(|cos θ| > 0.05) = ${(
              gData.tailProb * 100
            ).toFixed(1)}%`,
            px,
            py - 6
          );
        }

        // Plot Background & Box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, pw, ph);

        // Horizontal dashed grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        [0.25, 0.5, 0.75].forEach((frac) => {
          const gy = py + ph * (1 - frac);
          ctx.beginPath();
          ctx.moveTo(px, gy);
          ctx.lineTo(px + pw, gy);
          ctx.stroke();
        });

        // Near-Orthogonal Target Zone [-0.05, 0.05]
        const zx1 = px + ((-0.05 + 1) / 2) * pw;
        const zx2 = px + ((0.05 + 1) / 2) * pw;
        const zw = zx2 - zx1;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fillRect(zx1, py, zw, ph);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(zx1, py, zw, ph);
        ctx.setLineDash([]);

        ctx.font = fSmall;
        ctx.fillStyle = '#34d399';
        ctx.textAlign = 'center';
        ctx.fillText('|cos θ| ≤ 0.05', (zx1 + zx2) / 2, py + 12);

        // Center line at cos θ = 0.0 (90° exact orthogonality)
        const cx0 = px + pw / 2;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(cx0, py);
        ctx.lineTo(cx0, py + ph);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = fSmall;
        ctx.fillStyle = '#22d3ee';
        ctx.fillText('90° (⊥)', cx0, py + ph - 8);

        // Histogram Bars (50 bins)
        const numBins = 50;
        const barSlotW = pw / numBins;
        const barW = Math.max(1, barSlotW - 1);
        for (let b = 0; b < numBins; b++) {
          const cnt = gData.histogram[b];
          const center = gData.binCenters[b];
          const barFrac = cnt / gData.maxBinCount;
          const barH = barFrac * (ph - 24);
          const bx = px + b * barSlotW;
          const by = py + ph - barH;

          if (Math.abs(center) <= 0.05) {
            ctx.fillStyle = '#10b981';
            ctx.shadowColor = '#059669';
            ctx.shadowBlur = 4;
          } else {
            ctx.fillStyle = '#8b5cf6';
            ctx.shadowBlur = 0;
          }
          ctx.fillRect(bx, by, barW, barH);
        }
        ctx.shadowBlur = 0;

        // Overlaid Theoretical Distribution Curve
        ctx.beginPath();
        const curvePoints = 120;
        for (let i = 0; i <= curvePoints; i++) {
          const t = -1 + (i / curvePoints) * 2;
          let density = 0;
          if (dimension === 2) {
            density = 1 / Math.PI / Math.sqrt(Math.max(0.008, 1 - t * t));
          } else if (dimension === 3) {
            density = 0.5;
          } else {
            // Gaussian exp(-d * t^2 / 2)
            density = Math.exp((-dimension * t * t) / 2);
          }

          // Scale curve peak to match plot top
          const maxDensity =
            dimension === 2
              ? 1 / Math.PI / Math.sqrt(0.008)
              : dimension === 3
              ? 0.5
              : 1.0;
          const normY = (density / maxDensity) * (ph - 24) * 0.95;
          const curveX = px + ((t + 1) / 2) * pw;
          const curveY = py + ph - normY;

          if (i === 0) ctx.moveTo(curveX, curveY);
          else ctx.lineTo(curveX, curveY);
        }
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#d97706';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // X-Axis Labels
        ctx.font = fSmall;
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.fillText('-1.0 (180°)', px, py + ph + 14);
        ctx.fillText('-0.5 (120°)', px + pw * 0.25, py + ph + 14);
        ctx.fillText('0.0 (90° ⊥)', px + pw * 0.5, py + ph + 14);
        ctx.fillText('+0.5 (60°)', px + pw * 0.75, py + ph + 14);
        ctx.fillText('+1.0 (0°)', px + pw, py + ph + 14);

        // Stats HUD Card
        const cardW = 195;
        const cardH = 62;
        const cardX = px + pw - cardW - 8;
        const cardY = py + 8;
        ctx.fillStyle = 'rgba(10, 8, 16, 0.82)';
        ctx.fillRect(cardX, cardY, cardW, cardH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.strokeRect(cardX, cardY, cardW, cardH);

        ctx.font = fSmall;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Sampled Pairs: M = ${gData.totalPairs.toLocaleString()}`, cardX + 8, cardY + 16);
        ctx.fillText(
          `Var: ${gData.variance.toFixed(4)} (Theory: ${(1 / dimension).toFixed(4)})`,
          cardX + 8,
          cardY + 32
        );

        ctx.fillStyle = gData.tailProb < 0.05 ? '#34d399' : '#f59e0b';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText(
          `P(|cos θ| > 0.05): ${(gData.tailProb * 100).toFixed(1)}% ${dimension === 4096 ? '→ 0.0%' : ''}`,
          cardX + 8,
          cardY + 48
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    mode,
    isRunning,
    diffusionNoise,
    reverseDrift,
    thermalTemp,
    electricField,
    selectedTokenIndex,
    softmaxTemp,
    dimension,
    sampleCount,
    geomData,
  ]);

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
      if (mode === 'geometry') {
        setResampleTrigger((prev) => prev + 1);
        geomAngleRef.current = 0;
      }
      soundFX.playTap();
    }
  };

  const handleDimensionChange = (newDim: Dimension) => {
    setDimension(newDim);
    soundFX.playTap();
  };

  const handleResampleGeometry = () => {
    setResampleTrigger((prev) => prev + 1);
    soundFX.playTap();
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

          <button
            onClick={() => handleModeChange('geometry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'geometry'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            4. High-Dim Geometry
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

            {mode === 'geometry' && (
              <button
                onClick={handleResampleGeometry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white cursor-pointer transition-all shadow-xs"
                title="Re-sample Random Vectors on Hypersphere"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Re-sample Geometry
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
            {mode === 'geometry' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  Dimension: <strong className="text-cyan-400">d = {dimension}</strong>
                </span>
                <span>·</span>
                <span>
                  Variance: <strong className="text-purple-400">1/d = {(1 / dimension).toFixed(dimension >= 100 ? 5 : 3)}</strong>
                </span>
                <span>·</span>
                <span>
                  P(|cos θ| &gt; 0.05):{' '}
                  <strong className={geomData.tailProb < 0.05 ? 'text-emerald-400' : 'text-amber-400'}>
                    {(geomData.tailProb * 100).toFixed(1)}%
                  </strong>
                </span>
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

        {mode === 'geometry' && (
          <div className="space-y-4 text-xs">
            {/* Dimension Selector Pill Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-cyan-500 shrink-0" />
                  Select Dimension (<MathView math="d" />): Watch angles collapse to 90° as <MathView math="d \to 4096" />
                </span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  d = {dimension}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {DIMENSION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleDimensionChange(opt)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      dimension === opt
                        ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/25 ring-2 ring-brand-400/50'
                        : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700 border border-ink-200/60 dark:border-white/5'
                    }`}
                  >
                    <span className="text-sm font-bold">{opt}D</span>
                    <span className="text-[10px] opacity-75">
                      {opt === 2
                        ? 'Circle'
                        : opt === 3
                        ? 'Sphere'
                        : opt === 10
                        ? 'Latent'
                        : opt === 50
                        ? 'Manifold'
                        : opt === 100
                        ? 'High-Dim'
                        : 'LLM Embed'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sample Count Slider & Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-end">
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-ink-600 dark:text-ink-300">
                    Sample Count (<MathView math="N" /> vectors):
                  </span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">
                    {sampleCount} vectors ({geomData.totalPairs.toLocaleString()} pairs)
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={sampleCount}
                  onChange={(e) => setSampleCount(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-ink-400 font-mono">
                  <span>10 vectors</span>
                  <span>250 vectors</span>
                  <span>500 vectors</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResampleGeometry}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-400 text-white transition-all cursor-pointer shadow-xs w-full"
                >
                  <RotateCcw className="w-4 h-4" />
                  Re-sample Geometry
                </button>
              </div>
            </div>

            {/* Mathematical Bedrock Theory Card */}
            <div className="p-3.5 rounded-xl bg-ink-100/70 dark:bg-ink-800/60 border border-ink-200/60 dark:border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-ink-900 dark:text-white">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                The First-Principles Geometry of Deep Learning
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-ink-600 dark:text-ink-300">
                <div className="space-y-1">
                  <div className="font-semibold text-ink-900 dark:text-white">
                    1. Cosine Variance & Dirac Collapse:
                  </div>
                  <div>
                    For random unit vectors on <MathView math="S^{d-1}" />, cosine similarity follows:
                  </div>
                  <MathView math="\cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|} \sim \mathcal{N}\left(0, \frac{1}{d}\right), \quad \mathrm{Var}(\cos \theta) = \frac{1}{d}" />
                  <div>
                    As <MathView math="d \to 4096" />, variance shrinks to <MathView math="1/4096 \approx 0.00024" />, collapsing the distribution of angles into a Dirac delta spike <MathView math="\delta(0)" /> at exactly 90 degrees (<MathView math="\cos \theta = 0" />).
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-ink-900 dark:text-white">
                    2. Equator Measure Concentration:
                  </div>
                  <div>
                    By Levy's Lemma, almost the entire surface area of the hypersphere is concentrated within an equatorial strip of thickness <MathView math="\varepsilon" />:
                  </div>
                  <MathView math="P(|\cos \theta| > 0.05) \le 2\exp\left(-\frac{d \cdot 0.05^2}{2}\right) \xrightarrow{d \to 4096} 0" />
                  <div>
                    <strong>Why Transformers Work:</strong> In 4096-dimensional space (LLaMA, GPT-4, Gemma), any two random semantic vectors or weight directions are almost certainly perpendicular (<MathView math="90^\circ \pm 0.9^\circ" />). Billions of facts coexist with zero interference!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
