/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SubstratePhysicsSimCanvas:
 * An interactive, 60fps HTML5 Canvas visualizer providing:
 * 1. Procedural physical rendering for all 9 levels of The Cosmic Ladder of Scale (10⁰ m → 10⁻⁹ m)
 * 2. 4 Interactive Physical Stations:
 *    - Full Adder Conduction Simulator (Interactive A, B, Cin switches and channel currents)
 *    - DRAM 1T-1C Trench Leakage & Refresh Scope (Thermal leakage & refresh timing)
 *    - Bistable Double-Well Potential (SRAM Latch positive feedback)
 *    - Metal vs Silicon vs Clay Bandgap Explorer (Fermi-Dirac & carrier densities)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Atom,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sliders,
  Flame,
  Activity,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Scale,
  RefreshCw,
  Cpu,
  ToggleLeft,
  Gauge,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { soundFX } from '../utils/audio';
import { MathView } from './MathView';

export type SubstrateSimStation =
  | 'cosmic_scale'
  | 'full_adder'
  | 'dram_leakage'
  | 'bistable_latch'
  | 'bandgap_comparison'
  | 'cmos_inverter'
  | 'roofline_memory_wall';

interface SubstratePhysicsSimCanvasProps {
  initialStation?: SubstrateSimStation;
  cosmicScaleIndex?: number;
  className?: string;
  onScaleChange?: (index: number) => void;
}

export const SubstratePhysicsSimCanvas: React.FC<SubstratePhysicsSimCanvasProps> = ({
  initialStation = 'cosmic_scale',
  cosmicScaleIndex = 0,
  className = '',
  onScaleChange,
}) => {
  const [station, setStation] = useState<SubstrateSimStation>(initialStation);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 320 });

  // Sync station if initialStation changes externally
  useEffect(() => {
    setStation(initialStation);
  }, [initialStation]);

  // Responsive Canvas Resize Observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height || (w < 640 ? 300 : 320));
      if (w > 0) {
        setDimensions((prev) => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // ==========================================
  // STATION 1: FULL ADDER CONDUCTION STATE
  // ==========================================
  const [inputA, setInputA] = useState<number>(1);
  const [inputB, setInputB] = useState<number>(1);
  const [inputCin, setInputCin] = useState<number>(0);

  const fullAdderResults = useMemo(() => {
    const sum = (inputA ^ inputB ^ inputCin);
    const cout = (inputA & inputB) | (inputCin & (inputA ^ inputB));
    return { sum, cout };
  }, [inputA, inputB, inputCin]);

  // ==========================================
  // STATION 2: DRAM LEAKAGE & REFRESH SCOPE
  // ==========================================
  const [dramTempK, setDramTempK] = useState<number>(300); // Kelvin
  const [dramVoltage, setDramVoltage] = useState<number>(0.75); // Volts
  const [dramRefreshPeriodMs, setDramRefreshPeriodMs] = useState<number>(64); // ms
  const [dramAutoRefresh, setDramAutoRefresh] = useState<boolean>(true);
  const [dramBitFlipped, setDramBitFlipped] = useState<boolean>(false);
  const lastRefreshTimeRef = useRef<number>(performance.now());
  const dramVoltageHistoryRef = useRef<number[]>(new Array(120).fill(0.75));

  // ==========================================
  // STATION 3: BISTABLE LATCH DOUBLE-WELL
  // ==========================================
  const [latchVoltage, setLatchVoltage] = useState<number>(0.75); // Volts (0 to 0.75)
  const [latchNoiseAmplitude, setLatchNoiseAmplitude] = useState<number>(0.05);
  const [isDraggingBead, setIsDraggingBead] = useState<boolean>(false);

  // ==========================================
  // STATION 4: BANDGAP CARRIER EXPLORER
  // ==========================================
  const [bandgapTempK, setBandgapTempK] = useState<number>(300); // 50K to 600K
  const [selectedMaterial, setSelectedMaterial] = useState<'metal' | 'silicon' | 'clay'>('silicon');

  const carrierDensity = useMemo(() => {
    const kB = 8.617e-5; // eV/K
    const EgMap = { metal: 0.0, silicon: 1.12, clay: 8.0 };
    const Eg = EgMap[selectedMaterial];
    if (Eg === 0.0) return '8.5 × 10²⁸ m⁻³ (Permanent Fermi Sea)';
    const expFactor = -Eg / (2 * kB * bandgapTempK);
    if (expFactor < -100) return '0.0 m⁻³ (Literally Zero Free Carriers)';
    const val = 5e21 * Math.pow(bandgapTempK / 300, 1.5) * Math.exp(expFactor);
    if (val < 1e-15) return '≈ 10⁻³⁵ cm⁻³ (Zero Carriers)';
    return `${val.toExponential(2)} cm⁻³`;
  }, [selectedMaterial, bandgapTempK]);

  // ==========================================
  // STATION 5: CMOS INVERTER DYNAMIC SWITCHING
  // ==========================================
  const [inverterVin, setInverterVin] = useState<number>(0.0); // 0 to 1.0V
  const cmosOperatingState = useMemo(() => {
    const vdd = 1.0;
    const vin = inverterVin;
    const vout = vdd / (1 + Math.exp(16 * (vin - 0.5)));
    const isCrowbar = vin > 0.25 && vin < 0.75;
    const iShootThrough = isCrowbar ? 145 * Math.exp(-Math.pow((vin - 0.5) / 0.12, 2)) : 0;
    const pmosState = vin < 0.35 ? 'Triode (ON - Pulls UP to VDD)' : vin > 0.65 ? 'Cutoff (OFF)' : 'Saturation';
    const nmosState = vin < 0.35 ? 'Cutoff (OFF)' : vin > 0.65 ? 'Triode (ON - Pulls DOWN to GND)' : 'Saturation';
    return { vout, iShootThrough, pmosState, nmosState };
  }, [inverterVin]);

  // ==========================================
  // STATION 6: GPU ROOFLINE & MEMORY WALL
  // ==========================================
  const [arithmeticIntensity, setArithmeticIntensity] = useState<number>(16); // FLOPs/Byte
  const rooflineMetrics = useMemo(() => {
    const peakComputeTFlops = 2000;
    const hbmBandwidthTBps = 3.35;
    const sramBandwidthTBps = 19.0;
    const attainedHbmTFlops = Math.min(peakComputeTFlops, arithmeticIntensity * hbmBandwidthTBps);
    const attainedSramTFlops = Math.min(peakComputeTFlops, arithmeticIntensity * sramBandwidthTBps);
    const hbmRidgePoint = peakComputeTFlops / hbmBandwidthTBps; // ~597 FLOPs/byte
    const isMemoryBound = arithmeticIntensity < hbmRidgePoint;
    const utilizationPct = Math.round((attainedHbmTFlops / peakComputeTFlops) * 100);
    return {
      peakComputeTFlops,
      hbmBandwidthTBps,
      sramBandwidthTBps,
      attainedHbmTFlops,
      attainedSramTFlops,
      hbmRidgePoint,
      isMemoryBound,
      utilizationPct,
    };
  }, [arithmeticIntensity]);

  // Continuous animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.02;
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Draw faint background grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 40) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // ========================================================
      // 1. RENDER ACTIVE STATION
      // ========================================================
      if (station === 'cosmic_scale') {
        renderCosmicScale(ctx, width, height, cosmicScaleIndex, time);
      } else if (station === 'full_adder') {
        renderFullAdderCircuit(ctx, width, height, inputA, inputB, inputCin, fullAdderResults, time);
      } else if (station === 'dram_leakage') {
        renderDramScope(ctx, width, height, dramVoltage, dramVoltageHistoryRef.current, dramBitFlipped, time);
      } else if (station === 'bistable_latch') {
        renderDoubleWellPotential(ctx, width, height, latchVoltage, time);
      } else if (station === 'bandgap_comparison') {
        renderBandgapDiagram(ctx, width, height, selectedMaterial, bandgapTempK, time);
      } else if (station === 'cmos_inverter') {
        renderCmosInverter(ctx, width, height, inverterVin, cmosOperatingState, time);
      } else if (station === 'roofline_memory_wall') {
        renderRooflineModel(ctx, width, height, arithmeticIntensity, rooflineMetrics, time);
      }

      if (isPlaying) {
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [
    station,
    isPlaying,
    cosmicScaleIndex,
    inputA,
    inputB,
    inputCin,
    fullAdderResults,
    dramVoltage,
    dramBitFlipped,
    latchVoltage,
    selectedMaterial,
    bandgapTempK,
    inverterVin,
    cmosOperatingState,
    arithmeticIntensity,
    rooflineMetrics,
  ]);

  // ==========================================================
  // DRAM LEAKAGE TICK ENGINE
  // ==========================================================
  useEffect(() => {
    if (station !== 'dram_leakage' || !isPlaying) return;

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsedSinceRefresh = now - lastRefreshTimeRef.current;

      // Leakage rate increases exponentially with temperature: I ~ exp(-Eg / 2kT)
      const thermalFactor = Math.exp((dramTempK - 300) / 45);
      const decayRate = 0.0035 * thermalFactor;

      setDramVoltage((prev) => {
        let next = prev * (1 - decayRate);
        if (dramAutoRefresh && elapsedSinceRefresh >= dramRefreshPeriodMs) {
          next = 0.75;
          lastRefreshTimeRef.current = now;
        }

        const isFlipped = next < 0.35;
        setDramBitFlipped(isFlipped);

        dramVoltageHistoryRef.current.push(next);
        if (dramVoltageHistoryRef.current.length > 120) {
          dramVoltageHistoryRef.current.shift();
        }
        return next;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [station, isPlaying, dramTempK, dramRefreshPeriodMs, dramAutoRefresh]);

  // ==========================================================
  // BISTABLE LATCH DYNAMICS (Lyapunov Double Well Relaxation)
  // ==========================================================
  useEffect(() => {
    if (station !== 'bistable_latch' || isDraggingBead || !isPlaying) return;

    const interval = setInterval(() => {
      setLatchVoltage((prev) => {
        // Double-well derivative: f(V) = -(V - 0.375) * ((V - 0.75) * V)
        const center = 0.375;
        const normalized = (prev - center) / center; // -1 to +1
        // dU/dx = -(x^3 - x)
        const force = -(Math.pow(normalized, 3) - normalized);
        const noise = (Math.random() - 0.5) * latchNoiseAmplitude;
        const nextNormalized = Math.max(-1, Math.min(1, normalized + force * 0.15 + noise));
        return center + nextNormalized * center;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [station, isDraggingBead, isPlaying, latchNoiseAmplitude]);

  // ==========================================================
  // PROCEDURAL CANVAS RENDERERS
  // ==========================================================

  // --- 1. THE COSMIC SCALE PROCEDURAL RENDERER ---
  const renderCosmicScale = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    scaleIdx: number,
    t: number
  ) => {
    ctx.save();

    // Scale title watermark
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`COSMIC SCALE TIER: ${scaleIdx} (10^${-scaleIdx} m)`, 20, 30);

    const cx = w / 2;
    const cy = h / 2;

    switch (scaleIdx) {
      case 0: {
        // 10^0 m: Mechanical Switch & Keycap
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        // Keycap top
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(cx - 70, cy - 90, 140, 45, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('"because"', cx, cy - 62);

        // Spring coils
        const springCompression = Math.sin(t * 3) * 10;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        let sy = cy - 45;
        ctx.moveTo(cx, sy);
        for (let i = 0; i < 6; i++) {
          const sx = cx + (i % 2 === 0 ? 25 : -25);
          sy += (16 + springCompression / 6);
          ctx.lineTo(sx, sy);
        }
        ctx.lineTo(cx, cy + 60);
        ctx.stroke();

        // Contact points
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(cx - 15, cy + 65, 6, 0, Math.PI * 2);
        ctx.arc(cx + 15, cy + 65, 6, 0, Math.PI * 2);
        ctx.fill();

        // Contact sparks
        if (Math.sin(t * 3) > 0.6) {
          ctx.strokeStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(cx - 15, cy + 65);
          ctx.lineTo(cx + 15, cy + 65);
          ctx.stroke();
        }
        break;
      }

      case 1: {
        // 10^-1 m: PCIe Bus Differential Traces & TEM Wave
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;

        // Trace + and Trace -
        ctx.beginPath();
        ctx.moveTo(40, cy - 35);
        ctx.lineTo(w - 40, cy - 35);
        ctx.moveTo(40, cy + 35);
        ctx.lineTo(w - 40, cy + 35);
        ctx.stroke();

        // Propagating TEM Electromagnetic Wavefronts
        for (let x = 60; x < w - 60; x += 55) {
          const wavePhase = (x - t * 180) % (w - 120);
          const drawX = 60 + ((wavePhase + (w - 120)) % (w - 120));
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(drawX, cy - 35);
          ctx.lineTo(drawX, cy + 35);
          ctx.stroke();

          // Field arrowheads
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(drawX, cy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText('v = c / √ε_r ≈ 0.154 mm/ps (TEM Wave in FR-4)', 40, cy + 70);
        break;
      }

      case 2: {
        // 10^-2 m: Monolithic Reticle Die & HBM3e Interposer
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 120, cy - 85, 240, 170);

        ctx.fillStyle = '#3b82f6';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('GPU CORE RETICLE DIE (814 mm²)', cx - 110, cy - 65);

        // HBM3e Memory stacks on sides
        ctx.fillStyle = '#06b6d4';
        for (let i = 0; i < 3; i++) {
          ctx.fillRect(cx - 160, cy - 70 + i * 50, 30, 40);
          ctx.fillRect(cx + 130, cy - 70 + i * 50, 30, 40);
        }

        ctx.fillStyle = '#ffffff';
        ctx.font = '9px monospace';
        ctx.fillText('HBM3e', cx - 158, cy);
        ctx.fillText('HBM3e', cx + 132, cy);

        // Moving data pulses across CoWoS interposer
        const pulseX = cx - 130 + ((t * 80) % 260);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(pulseX, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 3: {
        // 10^-3 m: Streaming Multiprocessor (SM) & Crossbar
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;

        // 4 Tensor Core tiles
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 2; c++) {
            const tx = cx - 90 + c * 100;
            const ty = cy - 75 + r * 80;
            ctx.strokeRect(tx, ty, 80, 65);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(tx, ty, 80, 65);

            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 9px monospace';
            ctx.fillText(`Tensor Tile [${r},${c}]`, tx + 5, ty + 16);

            // Systolic pulsing dot
            const p = (Math.sin(t * 5 + r * 2 + c) + 1) * 0.5;
            ctx.fillStyle = `rgba(245, 158, 11, ${p})`;
            ctx.fillRect(tx + 25, ty + 28, 30, 20);
          }
        }
        break;
      }

      case 4: {
        // 10^-4 m: 6T SRAM Cell
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;

        // Inverter 1 & Inverter 2 back-to-back cross-coupled
        ctx.strokeRect(cx - 60, cy - 40, 50, 80);
        ctx.strokeRect(cx + 10, cy - 40, 50, 80);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('INV 1', cx - 50, cy + 5);
        ctx.fillText('INV 2', cx + 20, cy + 5);

        // Cross feedback lines
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 20);
        ctx.lineTo(cx + 10, cy + 20);
        ctx.moveTo(cx - 10, cy + 20);
        ctx.lineTo(cx + 10, cy - 20);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.fillText('Q = 0.75V', cx - 55, cy + 60);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('Q̄ = 0.00V', cx + 15, cy + 60);
        break;
      }

      case 5: {
        // 10^-6 m: M1–M15 Interconnect Metal Stack
        ctx.lineWidth = 2;
        const layers = ['M15 Power', 'M10 Clock', 'M5 Semi-Global', 'M2 Local', 'M1 Cell'];
        for (let i = 0; i < 5; i++) {
          const ly = cy - 80 + i * 38;
          ctx.strokeStyle = i === 0 ? '#ef4444' : i === 1 ? '#eab308' : '#38bdf8';
          ctx.strokeRect(cx - 110, ly, 220, 26);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px monospace';
          ctx.fillText(layers[i], cx - 100, ly + 17);

          // Via connecting adjacent layers
          if (i < 4) {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(cx + 40, ly + 26, 8, 12);
          }
        }
        break;
      }

      case 6: {
        // 10^-7 m: CMOS Standard Cell NAND Gate
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;

        // PMOS top rail
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 80, cy - 70, 70, 45);
        ctx.strokeRect(cx - 80, cy - 70, 70, 45);
        ctx.fillRect(cx + 10, cy - 70, 70, 45);
        ctx.strokeRect(cx + 10, cy - 70, 70, 45);

        // NMOS bottom rail
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 80, cy + 20, 70, 45);
        ctx.strokeRect(cx - 80, cy + 20, 70, 45);
        ctx.fillRect(cx + 10, cy + 20, 70, 45);
        ctx.strokeRect(cx + 10, cy + 20, 70, 45);

        ctx.fillStyle = '#ec4899';
        ctx.font = '10px monospace';
        ctx.fillText('PMOS 1 (||)', cx - 75, cy - 42);
        ctx.fillText('PMOS 2 (||)', cx + 15, cy - 42);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('NMOS 1 (Series)', cx - 78, cy + 48);
        ctx.fillText('NMOS 2 (Series)', cx + 12, cy + 48);
        break;
      }

      case 7: {
        // 10^-8 m: FinFET & Gate-All-Around (GAA) Nanosheet
        ctx.lineWidth = 2;
        // 3 Vertically stacked silicon nanosheets
        for (let i = 0; i < 3; i++) {
          const sy = cy - 45 + i * 35;
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(cx - 70, sy, 140, 14);

          // Wrapped gate around it
          ctx.strokeStyle = '#ec4899';
          ctx.strokeRect(cx - 20, sy - 6, 40, 26);
        }
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('HfO₂ High-k Metal Gate (Wraps 4 sides)', cx - 110, cy + 75);
        break;
      }

      case 8: {
        // 10^-9 m: Quantum Wave Packet & Landauer Limit
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.5;

        // 1.2nm Potential barrier
        ctx.fillStyle = '#334155';
        ctx.fillRect(cx - 15, cy - 80, 30, 160);

        // Incident Schrödinger wave packet
        ctx.beginPath();
        for (let x = cx - 140; x <= cx - 15; x += 2) {
          const envelope = Math.exp(-Math.pow((x - (cx - 75)) / 25, 2));
          const y = cy + Math.sin((x - t * 60) * 0.4) * 35 * envelope;
          if (x === cx - 140) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Tunneling transmitted wave (attenuated amplitude)
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        for (let x = cx + 15; x <= cx + 140; x += 2) {
          const envelope = Math.exp(-Math.pow((x - (cx + 80)) / 30, 2));
          const y = cy + Math.sin((x - t * 60) * 0.4) * 8 * envelope;
          if (x === cx + 15) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Phonon heat dissipation (Landauer heat)
        ctx.fillStyle = '#ef4444';
        ctx.font = '10px monospace';
        ctx.fillText('Landauer Heat: E ≥ kB T ln 2 (2.87 × 10⁻²¹ J)', cx - 130, cy + 95);
        break;
      }
    }

    ctx.restore();
  };

  // --- 2. FULL ADDER CONDUCTION CIRCUIT RENDERER ---
  const renderFullAdderCircuit = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    a: number,
    b: number,
    cin: number,
    res: { sum: number; cout: number },
    t: number
  ) => {
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;
    const isMobile = w < 600;
    const isCompact = w < 440;

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 11px monospace' : 'bold 13px monospace';
    ctx.fillText(isCompact ? '1-BIT CMOS FULL ADDER' : '1-BIT CMOS FULL ADDER CONDUCTION CHANNELS', isMobile ? 12 : 25, 26);

    const gateW = isCompact ? 95 : isMobile ? 125 : 160;
    const gateLeft = cx - gateW / 2;
    const gateRight = cx + gateW / 2;

    // Left Input Lines
    const inputs = [
      { label: isCompact ? `A=${a}` : `A = ${a} (${a ? '0.75V' : '0.0V'})`, val: a, y: cy - 55 },
      { label: isCompact ? `B=${b}` : `B = ${b} (${b ? '0.75V' : '0.0V'})`, val: b, y: cy },
      { label: isCompact ? `Cin=${cin}` : `Cin = ${cin} (${cin ? '0.75V' : '0.0V'})`, val: cin, y: cy + 55 },
    ];

    inputs.forEach((inp) => {
      ctx.fillStyle = inp.val ? '#10b981' : '#64748b';
      ctx.font = isCompact ? 'bold 9px monospace' : 'bold 11px monospace';
      ctx.fillText(inp.label, isMobile ? 8 : 25, inp.y + 4);

      ctx.strokeStyle = inp.val ? '#10b981' : '#334155';
      ctx.lineWidth = inp.val ? 2.5 : 1.5;
      ctx.beginPath();
      const inLineStart = isCompact ? 48 : isMobile ? 75 : 150;
      ctx.moveTo(inLineStart, inp.y);
      ctx.lineTo(gateLeft, inp.y);
      ctx.stroke();
    });

    // Central Conduction Gate Matrix
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(gateLeft, cy - 85, gateW, 170);
    ctx.strokeRect(gateLeft, cy - 85, gateW, 170);

    ctx.fillStyle = '#38bdf8';
    ctx.font = isCompact ? 'bold 8px monospace' : 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('28 CMOS GATES', cx, cy - 65);
    ctx.fillText('TOPOLOGY', cx, cy - 50);

    // Dynamic Conduction Pathways inside
    const isSumActive = res.sum === 1;
    const isCoutActive = res.cout === 1;

    ctx.strokeStyle = isSumActive ? '#10b981' : '#334155';
    ctx.lineWidth = isSumActive ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(gateLeft + 8, cy - 20);
    ctx.lineTo(gateRight, cy - 20);
    ctx.stroke();

    ctx.strokeStyle = isCoutActive ? '#f59e0b' : '#334155';
    ctx.lineWidth = isCoutActive ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(gateLeft + 8, cy + 25);
    ctx.lineTo(gateRight, cy + 25);
    ctx.stroke();

    // Right Outputs
    ctx.textAlign = 'left';
    ctx.fillStyle = res.sum ? '#10b981' : '#64748b';
    ctx.font = isCompact ? 'bold 10px monospace' : 'bold 12px monospace';
    const sumLabel = isCompact ? `S=${res.sum}` : `SUM=${res.sum}`;
    ctx.fillText(sumLabel, gateRight + 8, cy - 20);

    ctx.fillStyle = res.cout ? '#f59e0b' : '#64748b';
    ctx.font = isCompact ? 'bold 10px monospace' : 'bold 12px monospace';
    const coutLabel = isCompact ? `C=${res.cout}` : `C_OUT=${res.cout}`;
    ctx.fillText(coutLabel, gateRight + 8, cy + 25);

    // Interpretive Binary Result Box
    ctx.fillStyle = '#1e293b';
    const resultBoxW = isCompact ? 110 : 140;
    ctx.roundRect(cx - resultBoxW / 2, cy + 95, resultBoxW, 26, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 9.5px monospace' : 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${res.cout}${res.sum}₂ = ${res.cout * 2 + res.sum}`, cx, cy + 112);

    ctx.restore();
  };

  // --- 3. DRAM 1T-1C LEAKAGE SCOPE RENDERER ---
  const renderDramScope = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    voltage: number,
    history: number[],
    isFlipped: boolean,
    t: number
  ) => {
    ctx.save();
    const isMobile = w < 600;
    const isCompact = w < 440;

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 11px monospace' : 'bold 13px monospace';
    ctx.fillText(isCompact ? 'DRAM 1T-1C DISCHARGE' : 'DRAM 1T-1C TRENCH CAPACITOR DISCHARGE SCOPE', isMobile ? 12 : 25, 26);

    // Oscilloscope Grid Frame
    const scopeX = isMobile ? 16 : 40;
    const scopeY = 45;
    const scopeW = w - scopeX * 2;
    const scopeH = h - 85;

    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.fillRect(scopeX, scopeY, scopeW, scopeH);
    ctx.strokeRect(scopeX, scopeY, scopeW, scopeH);

    // Reference Voltage threshold lines
    const vRefY = scopeY + scopeH * (1 - 0.35 / 0.85); // 0.35V flip threshold
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(scopeX, vRefY);
    ctx.lineTo(scopeX + scopeW, vRefY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ef4444';
    ctx.font = isCompact ? '8.5px monospace' : '10px monospace';
    ctx.fillText('0.35V Flip Barrier', scopeX + 8, vRefY - 5);

    // Plot Voltage History Waveform
    ctx.strokeStyle = isFlipped ? '#ef4444' : '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const stepX = scopeW / 120;
    history.forEach((v, idx) => {
      const px = scopeX + idx * stepX;
      const py = scopeY + scopeH * (1 - Math.max(0, Math.min(0.85, v)) / 0.85);
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Current Voltage readout HUD
    const hudRight = scopeX + (isMobile ? 10 : scopeW - 230);
    ctx.fillStyle = isFlipped ? '#ef4444' : '#10b981';
    ctx.font = isCompact ? 'bold 12px monospace' : 'bold 15px monospace';
    ctx.fillText(`V(t): ${voltage.toFixed(3)} V`, hudRight, scopeY + 22);
    ctx.font = isCompact ? '9px monospace' : '11px monospace';
    ctx.fillText(
      isFlipped ? 'STATUS: CORRUPTED' : 'STATUS: RETAINED (1)',
      hudRight,
      scopeY + 38
    );

    ctx.restore();
  };

  // --- 4. BISTABLE DOUBLE-WELL POTENTIAL RENDERER ---
  const renderDoubleWellPotential = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    v: number,
    t: number
  ) => {
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;
    const isMobile = w < 600;
    const isCompact = w < 440;

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 11px monospace' : 'bold 13px monospace';
    ctx.fillText(isCompact ? 'SRAM DOUBLE-WELL POTENTIAL' : 'CROSS-COUPLED INVERTER: DOUBLE-WELL LYAPUNOV POTENTIAL', isMobile ? 12 : 25, 26);

    // Draw Potential Energy Curve: V(x) = x^4 - 2x^2
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const halfW = isCompact ? 110 : isMobile ? 135 : 160;
    const curveH = isCompact ? 75 : 100;
    for (let px = -halfW; px <= halfW; px += 2) {
      const normX = px / (halfW * 0.75); // -1.33 to +1.33
      const potential = (Math.pow(normX, 4) - 2 * Math.pow(normX, 2)) * 0.7;
      const drawX = cx + px;
      const drawY = cy + 25 + potential * curveH;
      if (px === -halfW) ctx.moveTo(drawX, drawY);
      else ctx.lineTo(drawX, drawY);
    }
    ctx.stroke();

    // Attractor Labels
    ctx.font = isCompact ? 'bold 9px monospace' : 'bold 10.5px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText(isCompact ? '"1" (0.75V)' : 'Attractor (0.75V = "1")', cx + (isCompact ? 25 : 50), cy + 105);
    ctx.fillStyle = '#ef4444';
    ctx.fillText(isCompact ? '"0" (0.00V)' : 'Attractor (0.00V = "0")', cx - halfW + 5, cy + 105);

    // Unstable Saddle Point
    ctx.fillStyle = '#eab308';
    ctx.fillText(isCompact ? 'Saddle (0.375V)' : 'Unstable Saddle (0.375V)', cx - 40, cy - 25);

    // The State Bead (Voltage Ball)
    const normalizedV = (v - 0.375) / 0.375; // -1 to +1
    const clampedNorm = Math.max(-1.3, Math.min(1.3, normalizedV));
    const beadPotential = (Math.pow(clampedNorm, 4) - 2 * Math.pow(clampedNorm, 2)) * 0.7;
    const beadX = cx + clampedNorm * (halfW * 0.75);
    const beadY = cy + 25 + beadPotential * curveH;

    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(beadX, beadY, isCompact ? 8 : 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 10px monospace' : 'bold 12px monospace';
    ctx.fillText(`Node: ${v.toFixed(3)} V`, cx - (isCompact ? 40 : 55), cy + 135);

    ctx.restore();
  };

  // --- 5. BANDGAP CARRIER COMPARISON RENDERER ---
  const renderBandgapDiagram = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    mat: 'metal' | 'silicon' | 'clay',
    tempK: number,
    t: number
  ) => {
    ctx.save();
    const isMobile = w < 600;
    const isCompact = w < 440;

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 11px monospace' : 'bold 13px monospace';
    ctx.fillText(isCompact ? 'BANDGAPS: METAL VS CLAY' : 'ELECTRON ENERGY BANDS: WHY METAL & WHY NOT CLAY?', isMobile ? 12 : 25, 26);

    const materials = [
      { id: 'metal', label: isCompact ? 'Copper' : 'Copper Metal', Eg: 0.0, color: '#eab308' },
      { id: 'silicon', label: isCompact ? 'Silicon' : 'Silicon (Si)', Eg: 1.12, color: '#06b6d4' },
      { id: 'clay', label: isCompact ? 'Clay' : 'Clay (Silicate)', Eg: 8.0, color: '#ef4444' },
    ];

    const margin = isMobile ? 8 : 30;
    const gap = isMobile ? 6 : 16;
    const colW = Math.floor((w - margin * 2 - gap * 2) / 3);
    const boxTop = 45;
    const boxH = h - 65;

    materials.forEach((m, idx) => {
      const bx = margin + idx * (colW + gap);
      const isSelected = mat === m.id;

      ctx.fillStyle = isSelected ? '#1e293b' : '#0f172a';
      ctx.strokeStyle = isSelected ? m.color : '#334155';
      ctx.lineWidth = isSelected ? 2.5 : 1;
      ctx.fillRect(bx, boxTop, colW, boxH);
      ctx.strokeRect(bx, boxTop, colW, boxH);

      ctx.fillStyle = m.color;
      ctx.font = isCompact ? 'bold 9.5px monospace' : 'bold 11px monospace';
      ctx.fillText(m.label, bx + 5, boxTop + 18);

      ctx.font = isCompact ? '8px monospace' : '9.5px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Eg=${m.Eg.toFixed(1)}eV`, bx + 5, boxTop + 33);

      const innerPad = Math.max(3, Math.floor(colW * 0.06));
      const innerW = colW - innerPad * 2;
      const bandH = Math.min(36, Math.floor(boxH * 0.22));

      // Conduction Band (Top)
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx + innerPad, boxTop + 44, innerW, bandH);
      ctx.fillStyle = '#ffffff';
      ctx.font = isCompact ? 'bold 7.5px monospace' : 'bold 9px monospace';
      ctx.fillText('Conduction', bx + innerPad + 3, boxTop + 44 + bandH / 2 + 3);

      // Forbidden Gap Visual
      const gapY = boxTop + 44 + bandH + (boxH - 44 - bandH * 2) / 2;
      if (m.Eg > 0) {
        ctx.fillStyle = '#ef4444';
        ctx.font = isCompact ? 'bold 8px monospace' : 'bold 9.5px monospace';
        ctx.fillText(`ΔE=${m.Eg}eV`, bx + innerPad + 2, gapY + 3);
      } else {
        ctx.fillStyle = '#eab308';
        ctx.font = isCompact ? 'bold 7.5px monospace' : 'bold 9px monospace';
        ctx.fillText('OVERLAP', bx + innerPad + 2, gapY + 3);
      }

      // Valence Band (Bottom)
      const valY = boxTop + boxH - bandH - 8;
      ctx.fillStyle = '#64748b';
      ctx.fillRect(bx + innerPad, valY, innerW, bandH);
      ctx.fillStyle = '#ffffff';
      ctx.font = isCompact ? 'bold 7.5px monospace' : 'bold 9px monospace';
      ctx.fillText('Valence', bx + innerPad + 3, valY + bandH / 2 + 3);
    });

    ctx.restore();
  };

  // --- 5. CMOS INVERTER DYNAMIC SWITCHING & CROWBAR CURRENT ---
  const renderCmosInverter = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    vin: number,
    cmosState: { vout: number; iShootThrough: number; pmosState: string; nmosState: string },
    t: number
  ) => {
    ctx.save();
    const isMobile = w < 600;
    const isCompact = w < 440;

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 11px monospace' : 'bold 13px monospace';
    ctx.fillText(isCompact ? 'CMOS INVERTER DYNAMICS' : 'CMOS INVERTER: COMPLEMENTARY SWITCHING & SHOOT-THROUGH CURRENT', isMobile ? 12 : 25, 26);

    const midX = isCompact ? Math.round(w * 0.44) : isMobile ? Math.round(w * 0.42) : 260;
    const schemLeft = isMobile ? 8 : 25;
    const schemW = midX - schemLeft - 6;

    // Left: Schematic
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#334155';
    ctx.fillRect(schemLeft, 40, schemW, h - 55);
    ctx.strokeRect(schemLeft, 40, schemW, h - 55);

    ctx.font = isCompact ? 'bold 8.5px monospace' : 'bold 10px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('VDD=1V', schemLeft + 6, 55);

    const railCenterX = schemLeft + schemW / 2;
    const pmosConducting = vin < 0.5;
    const nmosConducting = vin >= 0.5;
    const transW = Math.min(55, schemW - 12);
    const transX = railCenterX - transW / 2;

    // PMOS
    ctx.fillStyle = pmosConducting ? '#065f46' : '#1e293b';
    ctx.strokeStyle = pmosConducting ? '#34d399' : '#475569';
    ctx.lineWidth = 1.5;
    ctx.fillRect(transX, 72, transW, 34);
    ctx.strokeRect(transX, 72, transW, 34);
    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 8px monospace' : 'bold 9px monospace';
    ctx.fillText('P-MOS', transX + 5, 93);

    // NMOS
    ctx.fillStyle = nmosConducting ? '#1e3a8a' : '#1e293b';
    ctx.strokeStyle = nmosConducting ? '#60a5fa' : '#475569';
    ctx.lineWidth = 1.5;
    ctx.fillRect(transX, 145, transW, 34);
    ctx.strokeRect(transX, 145, transW, 34);
    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 8px monospace' : 'bold 9px monospace';
    ctx.fillText('N-MOS', transX + 5, 166);

    // Central Output Node
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(railCenterX, 126, 5, 0, Math.PI * 2);
    ctx.fill();

    // Right: Oscilloscope & VTC Curve
    const graphLeft = midX + 6;
    const graphWidth = w - graphLeft - (isMobile ? 8 : 20);
    const graphTop = 45;
    const graphHeight = h - 75;

    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#1e293b';
    ctx.fillRect(graphLeft, graphTop, graphWidth, graphHeight);
    ctx.strokeRect(graphLeft, graphTop, graphWidth, graphHeight);

    // VTC Curve (Vout vs Vin)
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 0; x <= graphWidth; x += 3) {
      const v = x / graphWidth;
      const vo = 1.0 / (1 + Math.exp(16 * (v - 0.5)));
      const px = graphLeft + x;
      const py = graphTop + (1.0 - vo) * graphHeight;
      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Crowbar Current Spike Curve (I_sc in red)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let x = 0; x <= graphWidth; x += 3) {
      const v = x / graphWidth;
      const isc = Math.exp(-Math.pow((v - 0.5) / 0.12, 2));
      const px = graphLeft + x;
      const py = graphTop + (1.0 - isc * 0.7) * graphHeight;
      if (x === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Current Operating Point Marker
    const curX = graphLeft + vin * graphWidth;
    const curY = graphTop + (1.0 - cmosState.vout) * graphHeight;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(curX, curY, isCompact ? 6 : 7 + Math.sin(t * 8) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Legend
    ctx.fillStyle = '#8b5cf6';
    ctx.font = isCompact ? '8.5px monospace' : '9.5px monospace';
    ctx.fillText('— Vout', graphLeft + 8, graphTop + 16);
    ctx.fillStyle = '#ef4444';
    ctx.fillText('-- I_sc', graphLeft + (isCompact ? 55 : 70), graphTop + 16);

    ctx.restore();
  };

  // --- 6. GPU ROOFLINE MODEL & SRAM VS HBM MEMORY WALL ---
  const renderRooflineModel = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    intensity: number,
    metrics: {
      peakComputeTFlops: number;
      hbmBandwidthTBps: number;
      sramBandwidthTBps: number;
      attainedHbmTFlops: number;
      attainedSramTFlops: number;
      hbmRidgePoint: number;
      isMemoryBound: boolean;
      utilizationPct: number;
    },
    t: number
  ) => {
    ctx.save();
    const isMobile = w < 600;
    const isCompact = w < 440;

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 11px monospace' : 'bold 13px monospace';
    ctx.fillText(isCompact ? 'ROOFLINE: SRAM VS HBM' : 'THE ROOFLINE MODEL: WHY HIGH-BANDWIDTH MEMORY & SRAM TILING DICTATE AI COMPUTE', isMobile ? 12 : 25, 26);

    const padL = isCompact ? 35 : isMobile ? 45 : 60;
    const padR = isMobile ? 12 : 35;
    const padT = 42;
    const padB = 38;
    const gw = w - padL - padR;
    const gh = h - padT - padB;

    const minLogX = -1;
    const maxLogX = 3;
    const toX = (val: number) => {
      const lx = Math.log10(Math.max(0.1, val));
      return padL + ((lx - minLogX) / (maxLogX - minLogX)) * gw;
    };

    const minLogY = 0;
    const maxLogY = 3.5;
    const toY = (val: number) => {
      const ly = Math.log10(Math.max(1, val));
      return padT + gh - ((ly - minLogY) / (maxLogY - minLogY)) * gh;
    };

    // Grid box
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#1e293b';
    ctx.fillRect(padL, padT, gw, gh);
    ctx.strokeRect(padL, padT, gw, gh);

    // Compute Ceiling (2000 TFLOPs)
    const ceilY = toY(metrics.peakComputeTFlops);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(padL, ceilY);
    ctx.lineTo(padL + gw, ceilY);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = isCompact ? 'bold 8.5px monospace' : 'bold 9.5px monospace';
    ctx.fillText(`Peak: ${metrics.peakComputeTFlops} TF`, padL + 6, ceilY - 6);

    // HBM3e Memory Bandwidth Roofline (Slanted line)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const x0 = toX(0.1);
    const y0 = toY(0.1 * metrics.hbmBandwidthTBps);
    const xRidge = toX(metrics.hbmRidgePoint);
    ctx.moveTo(x0, y0);
    ctx.lineTo(xRidge, ceilY);
    ctx.lineTo(padL + gw, ceilY);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = isCompact ? 'bold 8px monospace' : 'bold 9.5px monospace';
    ctx.fillText(`HBM3e (3.3 TB/s)`, padL + 8, toY(15));

    // SRAM / L1 Roofline (19 TB/s)
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const sramRidge = metrics.peakComputeTFlops / metrics.sramBandwidthTBps;
    ctx.moveTo(toX(0.1), toY(0.1 * metrics.sramBandwidthTBps));
    ctx.lineTo(toX(sramRidge), ceilY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Benchmark Markers
    const drawBenchmark = (xVal: number, label: string, color: string) => {
      const bx = toX(xVal);
      const by = toY(Math.min(metrics.peakComputeTFlops, xVal * metrics.hbmBandwidthTBps));
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
      ctx.fill();
      if (!isCompact) {
        ctx.font = '8px monospace';
        ctx.fillText(label, bx - 15, by + 14);
      }
    };

    drawBenchmark(2, 'Naive Attn', '#ef4444');
    drawBenchmark(150, 'FlashAttn', '#10b981');
    drawBenchmark(350, 'GEMM', '#60a5fa');

    // Current Operating Point
    const opX = toX(intensity);
    const opY = toY(metrics.attainedHbmTFlops);

    ctx.fillStyle = metrics.isMemoryBound ? '#ef4444' : '#10b981';
    ctx.beginPath();
    ctx.arc(opX, opY, isCompact ? 5 : 7 + Math.sin(t * 6) * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // HUD Status Box (Dynamically positioned)
    const hudW = isCompact ? Math.min(170, gw - 10) : isMobile ? 190 : 230;
    const hudX = isMobile ? padL + 6 : w - 270;
    const hudY = isMobile ? padT + gh - 58 : 46;
    const hudH = isMobile ? 52 : 72;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = metrics.isMemoryBound ? '#ef4444' : '#10b981';
    ctx.lineWidth = 1.2;
    ctx.fillRect(hudX, hudY, hudW, hudH);
    ctx.strokeRect(hudX, hudY, hudW, hudH);

    ctx.font = isCompact ? 'bold 8.5px monospace' : 'bold 9.5px monospace';
    ctx.fillStyle = metrics.isMemoryBound ? '#f87171' : '#34d399';
    ctx.fillText(metrics.isMemoryBound ? '⚠️ MEMORY BOUND' : '⚡ COMPUTE BOUND', hudX + 6, hudY + 14);

    ctx.font = isCompact ? '8px monospace' : '9px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Intensity: ${intensity.toFixed(1)} F/B`, hudX + 6, hudY + 28);
    ctx.fillText(`Attained: ${metrics.attainedHbmTFlops.toFixed(0)} TF (${metrics.utilizationPct}%)`, hudX + 6, hudY + 42);

    ctx.restore();
  };

  return (
    <div className={`flex flex-col space-y-3 bg-ink-950 p-4 rounded-2xl border border-ink-800 shadow-xl ${className}`}>
      {/* Top Station Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setStation('cosmic_scale');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              station === 'cosmic_scale'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5 inline mr-1" />
            Cosmic Zoom Engine
          </button>

          <button
            onClick={() => {
              setStation('full_adder');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              station === 'full_adder'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 inline mr-1" />
            Full Adder Channels
          </button>

          <button
            onClick={() => {
              setStation('dram_leakage');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              station === 'dram_leakage'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5 inline mr-1" />
            DRAM 1T-1C Leakage Scope
          </button>

          <button
            onClick={() => {
              setStation('bistable_latch');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              station === 'bistable_latch'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1" />
            Bistable SRAM Double-Well
          </button>

          <button
            onClick={() => {
              setStation('bandgap_comparison');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              station === 'bandgap_comparison'
                ? 'bg-rose-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }`}
          >
            <Atom className="w-3.5 h-3.5 inline mr-1" />
            Metal vs Clay Bandgap
          </button>

          <button
            onClick={() => {
              setStation('cmos_inverter');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              station === 'cmos_inverter'
                ? 'bg-violet-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }`}
          >
            <ToggleLeft className="w-3.5 h-3.5 inline mr-1" />
            CMOS Inverter Dynamics
          </button>

          <button
            onClick={() => {
              setStation('roofline_memory_wall');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              station === 'roofline_memory_wall'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 inline mr-1" />
            GPU Roofline Model
          </button>
        </div>

        {/* Audio Toggle & Play/Pause Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFX.toggleMute();
              soundFX.playTap();
            }}
            title="Toggle Procedural Physics Sonification"
            className="p-1.5 rounded-lg border border-white/10 text-ink-300 hover:text-white cursor-pointer"
          >
            {soundFX.getMuted() ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying((p) => !p);
              soundFX.playTap();
            }}
            className="p-1.5 rounded-lg border border-white/10 text-ink-300 hover:text-white cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* HTML5 Canvas Surface */}
      <div ref={containerRef} className="w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-white/10 relative bg-black">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full block"
        />
      </div>

      {/* ========================================================= */}
      {/* STATION CONTROLS BAR                                      */}
      {/* ========================================================= */}
      {station === 'full_adder' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-ink-400 font-mono">Toggle Input Gates:</span>
            <button
              onClick={() => {
                setInputA((v) => (v === 1 ? 0 : 1));
                soundFX.playTap();
              }}
              className={`px-3 py-1 rounded-lg font-mono font-bold cursor-pointer transition-colors ${
                inputA ? 'bg-emerald-600 text-white' : 'bg-ink-800 text-ink-400'
              }`}
            >
              Gate A = {inputA}
            </button>
            <button
              onClick={() => {
                setInputB((v) => (v === 1 ? 0 : 1));
                soundFX.playTap();
              }}
              className={`px-3 py-1 rounded-lg font-mono font-bold cursor-pointer transition-colors ${
                inputB ? 'bg-emerald-600 text-white' : 'bg-ink-800 text-ink-400'
              }`}
            >
              Gate B = {inputB}
            </button>
            <button
              onClick={() => {
                setInputCin((v) => (v === 1 ? 0 : 1));
                soundFX.playTap();
              }}
              className={`px-3 py-1 rounded-lg font-mono font-bold cursor-pointer transition-colors ${
                inputCin ? 'bg-emerald-600 text-white' : 'bg-ink-800 text-ink-400'
              }`}
            >
              Gate Cin = {inputCin}
            </button>
          </div>

          <div className="text-ink-300 font-mono text-xs">
            Boolean Result: Sum = <strong>{fullAdderResults.sum}</strong>, Carry = <strong>{fullAdderResults.cout}</strong>
          </div>
        </div>
      )}

      {station === 'dram_leakage' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-mono">Die Temperature:</span>
              <input
                type="range"
                min="200"
                max="400"
                step="5"
                value={dramTempK}
                onChange={(e) => setDramTempK(parseInt(e.target.value))}
                className="w-24 accent-amber-500"
              />
              <span className="text-amber-400 font-mono">{dramTempK} K ({dramTempK - 273}°C)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-mono">Refresh Period:</span>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={dramRefreshPeriodMs}
                onChange={(e) => setDramRefreshPeriodMs(parseInt(e.target.value))}
                className="w-24 accent-cyan-500"
              />
              <span className="text-cyan-400 font-mono">{dramRefreshPeriodMs} ms</span>
            </div>
          </div>

          <button
            onClick={() => {
              setDramVoltage(0.75);
              lastRefreshTimeRef.current = performance.now();
              soundFX.playSuccess();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Manual Refresh Pulse</span>
          </button>
        </div>
      )}

      {station === 'bistable_latch' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-ink-400 font-mono">Force Voltage:</span>
            <button
              onClick={() => {
                setLatchVoltage(0.75);
                soundFX.playTap();
              }}
              className="px-2.5 py-1 bg-emerald-600 text-white rounded font-mono font-bold cursor-pointer"
            >
              Snap to 1 (0.75V)
            </button>
            <button
              onClick={() => {
                setLatchVoltage(0.375);
                soundFX.playTap();
              }}
              className="px-2.5 py-1 bg-amber-600 text-white rounded font-mono font-bold cursor-pointer"
            >
              Perturb to Saddle (0.375V)
            </button>
            <button
              onClick={() => {
                setLatchVoltage(0.00);
                soundFX.playTap();
              }}
              className="px-2.5 py-1 bg-rose-600 text-white rounded font-mono font-bold cursor-pointer"
            >
              Snap to 0 (0.00V)
            </button>
          </div>

          <div className="text-ink-400 font-mono">
            Lyapunov fixed points actively fight thermal noise via regenerative feedback.
          </div>
        </div>
      )}

      {station === 'bandgap_comparison' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-ink-400 font-mono">Select Substrate:</span>
            {(['metal', 'silicon', 'clay'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setSelectedMaterial(m);
                  soundFX.playTap();
                }}
                className={`px-2.5 py-1 rounded font-mono font-bold cursor-pointer uppercase ${
                  selectedMaterial === m ? 'bg-cyan-600 text-white' : 'bg-ink-800 text-ink-400'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="text-cyan-300 font-mono">
            Intrinsic Free Carrier Density: <strong>{carrierDensity}</strong>
          </div>
        </div>
      )}

      {station === 'cmos_inverter' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-mono">Gate Input Voltage (Vin):</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={Math.round(inverterVin * 100)}
                onChange={(e) => {
                  const val = parseInt(e.target.value) / 100;
                  setInverterVin(val);
                  soundFX.playLogicGateToggle(val > 0.5);
                }}
                className="w-28 sm:w-32 accent-violet-500"
              />
              <span className="text-violet-300 font-mono font-bold">{inverterVin.toFixed(2)} V</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  setInverterVin(0.0);
                  soundFX.playLogicGateToggle(false);
                }}
                className="px-2 py-0.5 bg-ink-800 hover:bg-ink-700 text-ink-300 rounded font-mono cursor-pointer"
              >
                Vin = 0V
              </button>
              <button
                onClick={() => {
                  setInverterVin(0.5);
                  soundFX.playQuantumTunneling();
                }}
                className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-600/50 rounded font-mono cursor-pointer"
              >
                Vin = 0.5V (Crowbar Spike)
              </button>
              <button
                onClick={() => {
                  setInverterVin(1.0);
                  soundFX.playLogicGateToggle(true);
                }}
                className="px-2 py-0.5 bg-ink-800 hover:bg-ink-700 text-ink-300 rounded font-mono cursor-pointer"
              >
                Vin = 1V
              </button>
            </div>
          </div>

          <div className="text-ink-400 font-mono">
            Vout = <strong className="text-amber-400">{cmosOperatingState.vout.toFixed(2)} V</strong> | Crowbar Current ={' '}
            <strong className={cmosOperatingState.iShootThrough > 10 ? 'text-rose-400' : 'text-emerald-400'}>
              {cmosOperatingState.iShootThrough.toFixed(1)} µA
            </strong>
          </div>
        </div>
      )}

      {station === 'roofline_memory_wall' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-mono">Operational Intensity:</span>
              <input
                type="range"
                min="-10"
                max="30"
                step="1"
                value={Math.round(Math.log10(Math.max(0.1, arithmeticIntensity)) * 10)}
                onChange={(e) => {
                  const logVal = parseInt(e.target.value) / 10;
                  const intensity = Math.pow(10, logVal);
                  setArithmeticIntensity(intensity);
                  if (intensity > rooflineMetrics.hbmRidgePoint) {
                    soundFX.playHarmonicResolution();
                  } else {
                    soundFX.playClockTick(500);
                  }
                }}
                className="w-28 sm:w-32 accent-amber-500"
              />
              <span className="text-amber-300 font-mono font-bold">{arithmeticIntensity.toFixed(1)} FLOPs/Byte</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  setArithmeticIntensity(2.0);
                  soundFX.playClockTick(300);
                }}
                className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-600/40 rounded font-mono cursor-pointer"
              >
                Naive Attention (2 F/B)
              </button>
              <button
                onClick={() => {
                  setArithmeticIntensity(150.0);
                  soundFX.playSuccess();
                }}
                className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600/40 rounded font-mono cursor-pointer"
              >
                FlashAttention (150 F/B)
              </button>
              <button
                onClick={() => {
                  setArithmeticIntensity(700.0);
                  soundFX.playHarmonicResolution();
                }}
                className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-600/40 rounded font-mono cursor-pointer"
              >
                Dense GEMM (700 F/B)
              </button>
            </div>
          </div>

          <div className="text-ink-300 font-mono">
            H100 Status:{' '}
            <strong className={rooflineMetrics.isMemoryBound ? 'text-rose-400' : 'text-emerald-400'}>
              {rooflineMetrics.isMemoryBound ? 'Memory-Bound (Starved)' : 'Compute-Bound (Saturated)'}
            </strong>{' '}
            ({rooflineMetrics.attainedHbmTFlops.toFixed(0)} TFLOPs)
          </div>
        </div>
      )}
    </div>
  );
};
