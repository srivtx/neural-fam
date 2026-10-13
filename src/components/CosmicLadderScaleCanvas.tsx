/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The Cosmic Ladder of Scale: From Token to Transistor (10^0 m -> 10^-9 m)
 * An interactive, continuous multi-scale zoomable canvas spanning 9 orders
 * of spatial magnitude. Demonstrates that information is physical: a thought
 * in an LLM is charge flowing through silicon, bound by relativistic electrodynamics
 * and Landauer thermodynamics.
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Compass,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Layers,
  Sparkles,
  Flame,
  ArrowRight,
  Info,
  Maximize2,
  Minimize2,
  Activity,
  Cpu,
  Atom,
  ChevronRight,
} from 'lucide-react';
import { soundFX } from '../utils/audio';
import { MathView } from './MathView';

export interface ScaleRung {
  exponent: number; // lambda: scale = 10^-lambda meters
  name: string;
  tagline: string;
  physicalEntity: string;
  spatialDimension: string;
  timeConstant: string;
  propagationVelocity: string;
  energyPerBit: string;
  heatFlux: string;
  landauerRatio: string;
  governingLaw: string;
  equation: string;
  equationExplanation: string;
  firstPrinciplesIntuition: string;
  whyClayOrWireCannotDoThis: string;
}

export const SCALE_RUNGS: ScaleRung[] = [
  {
    exponent: 0,
    name: '10⁰ m: Human Mind & Keyboard',
    tagline: 'The macroscopic genesis: Biological motor spikes trigger mechanical key switch closure.',
    physicalEntity: 'Human Finger & Mechanical Key Switch (Token "because")',
    spatialDimension: '1.0 meter (Macro Anthropometric)',
    timeConstant: '~200 ms (5 Hz typing rate)',
    propagationVelocity: '~50 m/s (Axonal motor action potentials)',
    energyPerBit: '~1 mJ (10⁻³ J mechanical work)',
    heatFlux: '0.01 W/cm² (Human skin metabolism)',
    landauerRatio: '3.5 × 10¹⁷ × Landauer Limit',
    governingLaw: 'Hodgkin-Huxley Neurodynamics & Newtonian Contact Mechanics',
    equation: 'F = m\\frac{d^2 x}{dt^2} + b\\frac{dx}{dt} + kx, \\quad \\tau_{\\text{action}} \\approx 200\\text{ ms}',
    equationExplanation:
      'Human neuromuscular intent drives a mechanical spring-damper key switch across a 4 mm travel distance, closing copper electrical contacts to send an 8-bit ASCII token packet (0x62 0x65 0x63 0x61 0x75 0x73 0x65).',
    firstPrinciplesIntuition:
      'A thought does not exist in the ether. It originates in biological ion currents consuming ATP, transformed into mechanical kinetic energy by muscle fibers, creating the macroscopic boundary condition for computing.',
    whyClayOrWireCannotDoThis:
      'Clay has no elastic bi-stability or rapid electrical conduction. Humans use silicon and metals because we require rapid, reversible state transitions that survive millions of cycles without plastic deformation.',
  },
  {
    exponent: 1,
    name: '10⁻¹ m: PCIe Gen5 Bus & PCB Differential Pairs',
    tagline: 'Relativistic electrodynamics across FR4 fiberglass to GPU High-Bandwidth Memory.',
    physicalEntity: 'Copper Differential Microstrip Traces & H100 PCB Package',
    spatialDimension: '0.1 meter (10 centimeters)',
    timeConstant: '~50 ns (PCIe Gen5 / NVLink packet flight)',
    propagationVelocity: '0.152 mm/ps (c / √ε_r in FR4 dielectric)',
    energyPerBit: '20 to 50 pJ/bit (Trace charging capacitance)',
    heatFlux: '0.5 W/cm² (Motherboard copper planes)',
    landauerRatio: '1.7 × 10¹⁰ × Landauer Limit',
    governingLaw: 'Maxwell’s Equations & Relativistic Telegrapher Equations',
    equation: 'v = \\frac{c}{\\sqrt{\\epsilon_r}} \\approx 0.152\\text{ mm/ps}, \\quad E = \\frac{1}{2} C_{\\text{trace}} V^2',
    equationExplanation:
      'Electromagnetic energy does not travel inside the copper electrons—it travels in the dielectric electromagnetic field around the wires at half the speed of light. Charging the macroscopic capacitance of 10 cm traces consumes massive dynamic power.',
    firstPrinciplesIntuition:
      'The speed of light in vacuum is 30 cm/ns. In circuit boards (ε_r ≈ 4), signals travel only 15 cm in one nanosecond. Even if a GPU computes instantly, moving data across a 10 cm motherboard takes physical nanoseconds. This is the inescapable relativistic foundation of the memory wall.',
    whyClayOrWireCannotDoThis:
      'Unshielded wires or lossy substrates create catastrophic inter-symbol interference and dielectric loss. Pure copper traces with controlled impedance and ground planes are mandatory to prevent electromagnetic reflections.',
  },
  {
    exponent: 2,
    name: '10⁻² m: Silicon Die & Systolic Tensor Grid',
    tagline: '814 mm² monolithic silicon executing FP8 matrix multiplications across 132 SMs.',
    physicalEntity: '16 × 16 Systolic Tensor Core on TSMC 4N Silicon Die',
    spatialDimension: '0.01 meter (1 centimeter)',
    timeConstant: '~1.8 ns (1.8 GHz GPU Clock Cycle)',
    propagationVelocity: '0.165 mm/ps (Low-κ silicon dioxide dielectric)',
    energyPerBit: '2 to 5 pJ/bit (On-chip crossbar routing)',
    heatFlux: '100 W/cm² (Exceeding the thermal surface of a nuclear fuel rod)',
    landauerRatio: '1.2 × 10⁹ × Landauer Limit',
    governingLaw: 'Systolic Array Fused Matrix Multiply-Accumulate',
    equation: 'C_{ij}^{(k)} = C_{ij}^{(k-1)} + A_{ik} \\cdot B_{kj}, \\quad \\text{Throughput} = 2 \\times 16^3 = 8,192\\text{ FLOP/cycle}',
    equationExplanation:
      'Activations and weights flow rhythmically through a 2D grid of multiply-accumulate processing elements. Each PE holds partial sums, passing operands to nearest neighbors with zero global memory fetch.',
    firstPrinciplesIntuition:
      'Why a chip? Why not thousands of discrete components? Because macroscopic solder joints introduce parasitic inductance and millimeters of transit delay. Compressing 80 billion transistors onto one 1-centimeter silicon die brings wire lengths down to microns, raising switching frequencies from MHz to GHz.',
    whyClayOrWireCannotDoThis:
      'Discrete wires would require a physical room size of several football stadiums to wire 80 billion switches, resulting in light-speed propagation delays of hundreds of microseconds per operation and melting from thermal resistance.',
  },
  {
    exponent: 4,
    name: '10⁻⁴ m: On-Chip SRAM Register File',
    tagline: 'Static RAM flip-flops holding 4,096-d activations with zero DRAM refresh penalty.',
    physicalEntity: '6T CMOS Cross-Coupled Inverter Bistable Bitcell',
    spatialDimension: '100 micrometers (10⁻⁴ m)',
    timeConstant: '~0.2 ns (SRAM read/write access time)',
    propagationVelocity: '0.150 mm/ps (Local M1-M3 copper interconnect)',
    energyPerBit: '0.1 pJ/bit (100 fJ per local register access)',
    heatFlux: '250 W/cm² (Localized SRAM hotspot)',
    landauerRatio: '3.5 × 10⁷ × Landauer Limit',
    governingLaw: 'CMOS Bistable Positive Feedback Inverter Dynamics',
    equation: '\\frac{dV_Q}{dt} = \\frac{I_{\\text{pullup}}(V_{\\bar{Q}}) - I_{\\text{pulldown}}(V_{\\bar{Q}})}{C_{\\text{gate}}}, \\quad \\tau_{\\text{latch}} \\approx 50\\text{ ps}',
    equationExplanation:
      'Two cross-coupled CMOS inverters lock each other in stable equilibrium (Q=1, Q̄=0 or vice versa). Positive loop gain regenerates the bit value against thermal noise indefinitely without consuming dynamic refresh power.',
    firstPrinciplesIntuition:
      'DRAM stores charge in a leaky microscopic capacitor that must be refreshed every 64 ms (costing 50 pJ per read). SRAM uses active transistor latches microns from the ALU (costing 0.1 pJ). This 500x energy difference is why FlashAttention keeps tiles entirely in SRAM.',
    whyClayOrWireCannotDoThis:
      'Passive materials cannot sustain non-linear positive feedback. A bistable electronic switch requires gain (amplification) so that slight perturbations are actively restored rather than decaying into analog noise.',
  },
  {
    exponent: 6,
    name: '10⁻⁶ m: Interconnect Metal Stack (M1–M14)',
    tagline: '14 tiers of damascene copper wiring with relativistic RC delay and electromigration bounds.',
    physicalEntity: 'Multi-Level Dual Damascene Copper Interconnect Wire',
    spatialDimension: '1 micrometer (10⁻⁶ m)',
    timeConstant: '~5 ps (Local RC Elmore delay)',
    propagationVelocity: '0.120 mm/ps (Drift velocity + low-κ dielectric)',
    energyPerBit: '10 fJ/bit (10⁻¹⁴ J per wire transition)',
    heatFlux: '500 W/cm² (Wire Joule heating density)',
    landauerRatio: '3.5 × 10⁶ × Landauer Limit',
    governingLaw: 'Elmore RC Delay & Black’s Electromigration Equation',
    equation: '\\tau_{RC} = \\sum_k R_k C_k, \\quad \\text{MTTF} = \\frac{A}{J^n} \\exp\\left(\\frac{E_a}{k_B T}\\right)',
    equationExplanation:
      'As copper wire widths shrink below the electron mean free path (λ ≈ 39 nm), electron surface scattering multiplies electrical resistivity. Current densities exceeding 10⁶ A/cm² exert momentum transfer that physically moves copper atoms (electromigration).',
    firstPrinciplesIntuition:
      'Why metals? Why not salt water or conductive polymers? Metals possess a sea of delocalized conduction electrons (Fermi gas) with extreme electron density (~8.5 × 10²⁸ electrons/m³ in Cu), providing the minimal possible resistance. But at nanoscale, even copper behaves as a sluggish RC transmission line.',
    whyClayOrWireCannotDoThis:
      'Clay consists of mineral silicates bound by ionic and covalent bonds with zero free conduction electrons—it is an insulator. Without metal’s delocalized electron cloud, electrical current cannot flow.',
  },
  {
    exponent: 9,
    name: '10⁻⁹ m: 3nm Gate-All-Around Transistor & Landauer Limit',
    tagline: 'Electron wave packets tunneling through silicon; the thermodynamic floor of computation.',
    physicalEntity: 'Gate-All-Around (GAA) Silicon Nanosheet Channel',
    spatialDimension: '1.0 nanometer (10⁻⁹ m: Atomic Crystal Lattice)',
    timeConstant: '~0.1 ps (100 fs intrinsic transistor switching)',
    propagationVelocity: '10⁵ m/s (Electron saturation drift velocity in Si)',
    energyPerBit: '2.87 × 10⁻²¹ J (The Landauer Thermodynamic Bound)',
    heatFlux: '1,000 W/cm² (Cryogenic or microchannel liquid cooling limit)',
    landauerRatio: '1.00 × Landauer Floor (Theoretical minimum)',
    governingLaw: 'Schrödinger Quantum Tunneling & Landauer’s Principle',
    equation: 'T(E) \\approx \\exp\\left(-2\\int \\sqrt{\\frac{2m(V(x)-E)}{\\hbar^2}} dx\\right), \\quad E_{\\text{erase}} \\ge k_B T \\ln 2',
    equationExplanation:
      'At 1 nm, the gate oxide is only ~4 atoms thick. Electrons cease behaving as point particles and tunnel through the barrier via quantum wave mechanics. Erasing one bit dissipates a physical minimum of kB*T*ln(2) ≈ 2.87×10⁻²¹ J into the universe as thermal lattice phonons.',
    firstPrinciplesIntuition:
      'Information is physical. When you compute a loss function or erase a KV-cache token in an LLM, you are not performing an abstract mathematical operation. You are forcing electron wave packets across a silicon potential barrier, emitting real thermal phonons into datacenter cooling water. If you compute, the universe must warm.',
    whyClayOrWireCannotDoThis:
      'Below 3nm, classical materials break down completely. Silicon crystal lattice permits controlled bandgap engineering (1.12 eV) where quantum tunneling can be electrostaticly suppressed by surrounding the channel with gate dielectric on all 4 sides (GAA).',
  },
];

export const CosmicLadderScaleCanvas: React.FC = () => {
  // Continuous logarithmic exponent: lambda in [0, 9]
  const [scaleExp, setScaleExp] = useState<number>(0);
  const [isPlayingTour, setIsPlayingTour] = useState<boolean>(false);
  const [tourDirection, setTourDirection] = useState<'down' | 'up'>('down');
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundFX.getMuted());
  const [activeRungIdx, setActiveRungIdx] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'physics' | 'telemetry' | 'first_principles'>('physics');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const tourTimerRef = useRef<number | null>(null);
  const lastSoundExpRef = useRef<number>(0);

  // Find nearest discrete rung based on scaleExp
  const currentRung = useMemo(() => {
    let closest = SCALE_RUNGS[0];
    let minDiff = Infinity;
    SCALE_RUNGS.forEach((rung, idx) => {
      const diff = Math.abs(rung.exponent - scaleExp);
      if (diff < minDiff) {
        minDiff = diff;
        closest = rung;
      }
    });
    return closest;
  }, [scaleExp]);

  // Update active rung index when scaleExp changes significantly
  useEffect(() => {
    let closestIdx = 0;
    let minDiff = Infinity;
    SCALE_RUNGS.forEach((rung, idx) => {
      const diff = Math.abs(rung.exponent - scaleExp);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    setActiveRungIdx(closestIdx);

    // Audio frequency feedback on integer or major step crossings
    if (Math.abs(scaleExp - lastSoundExpRef.current) >= 0.75) {
      lastSoundExpRef.current = scaleExp;
      soundFX.playCosmicLadderScale(scaleExp);
    }
  }, [scaleExp]);

  // Auto-Tour smooth animation loop
  useEffect(() => {
    if (!isPlayingTour) return;

    let lastTime = performance.now();
    const tourStep = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setScaleExp((prev) => {
        const speed = 0.9; // 0.9 orders of magnitude per second
        if (tourDirection === 'down') {
          const next = prev + speed * dt;
          if (next >= 9) {
            setTourDirection('up');
            return 9;
          }
          return next;
        } else {
          const next = prev - speed * dt;
          if (next <= 0) {
            setTourDirection('down');
            return 0;
          }
          return next;
        }
      });

      animationFrameRef.current = requestAnimationFrame(tourStep);
    };

    animationFrameRef.current = requestAnimationFrame(tourStep);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlayingTour, tourDirection]);

  // Jump to specific scale rung
  const handleJumpToRung = (rung: ScaleRung, idx: number) => {
    setIsPlayingTour(false);
    setScaleExp(rung.exponent);
    setActiveRungIdx(idx);
    soundFX.playCosmicLadderScale(rung.exponent);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlayingTour(false);
    const val = parseFloat(e.target.value);
    setScaleExp(val);
  };

  const handleToggleTour = () => {
    const nextPlaying = !isPlayingTour;
    setIsPlayingTour(nextPlaying);
    if (nextPlaying) {
      soundFX.playSuccess();
    } else {
      soundFX.playTap();
    }
  };

  // Keyboard controls (ArrowLeft/ArrowRight to scrub)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsPlayingTour(false);
        setScaleExp((prev) => Math.min(9, prev + 0.25));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsPlayingTour(false);
        setScaleExp((prev) => Math.max(0, prev - 0.25));
      } else if (e.key === ' ') {
        e.preventDefault();
        handleToggleTour();
      }
    },
    [isPlayingTour]
  );

  // Wheel zoom handler on canvas
  const handleWheelZoom = (e: React.WheelEvent) => {
    e.preventDefault();
    setIsPlayingTour(false);
    const delta = e.deltaY > 0 ? 0.2 : -0.2;
    setScaleExp((prev) => Math.max(0, Math.min(9, prev + delta)));
  };

  // Canvas drawing loop: procedural multi-scale renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.02;

      // Handle High-DPI canvas resolution
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      // Deep cosmological dark substrate gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
      );
      bgGrad.addColorStop(0, '#0c101c');
      bgGrad.addColorStop(0.5, '#070a13');
      bgGrad.addColorStop(1, '#020408');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // -----------------------------------------------------------------------
      // Multi-Scale Drawing Layers based on scaleExp in [0, 9]
      // -----------------------------------------------------------------------

      // Helper to compute layer visibility alpha based on exponent range
      const getLayerAlpha = (center: number, spread: number) => {
        const dist = Math.abs(scaleExp - center);
        if (dist >= spread) return 0;
        return Math.cos((dist / spread) * (Math.PI / 2));
      };

      // 1. LEVEL 0: Human Keyboard & Token "because" (0 to 1.5)
      const alpha0 = getLayerAlpha(0, 1.4);
      if (alpha0 > 0.01) {
        ctx.save();
        ctx.globalAlpha = alpha0;

        // Draw Keyboard Key Cap
        const keySize = Math.min(width, height) * 0.45;
        const pulse = Math.sin(time * 3) * 0.05 + 1;

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.roundRect(cx - keySize / 2 + 6, cy - keySize / 2 + 10, keySize, keySize, 24);
        ctx.fill();

        // Keycap Body
        const keyGrad = ctx.createLinearGradient(cx - keySize / 2, cy - keySize / 2, cx + keySize / 2, cy + keySize / 2);
        keyGrad.addColorStop(0, '#1e293b');
        keyGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = keyGrad;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx - keySize / 2, cy - keySize / 2, keySize, keySize, 24);
        ctx.fill();
        ctx.stroke();

        // Mechanical key switch stem center
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 32 * pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Mechanical contact spark ripple
        ctx.strokeStyle = `rgba(14, 165, 233, ${0.4 + Math.sin(time * 6) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 60 * ((time * 1.5) % 1.5), 0, Math.PI * 2);
        ctx.stroke();

        // Token String Glowing Text
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(keySize * 0.16)}px ui-sans-serif, system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('"because"', cx, cy - 15);

        // ASCII Hex Stream
        ctx.fillStyle = '#38bdf8';
        ctx.font = `600 ${Math.round(keySize * 0.065)}px ui-monospace, monospace`;
        ctx.fillText('0x62 0x65 0x63 0x61 0x75 0x73 0x65', cx, cy + 28);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px ui-sans-serif, system-ui';
        ctx.fillText('Human Motor Intent: ~200 ms · 5 Hz Typing Pulse', cx, cy + keySize / 2 + 28);

        ctx.restore();
      }

      // 2. LEVEL 1: PCIe Gen5 / PCB Differential Stripline Pairs (0.5 to 2.2)
      const alpha1 = getLayerAlpha(1.0, 1.2);
      if (alpha1 > 0.01) {
        ctx.save();
        ctx.globalAlpha = alpha1;

        // Draw FR4 PCB Fiberglass Weave Background Pattern
        const weaveSize = 30;
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += weaveSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += weaveSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Draw 4 Parallel High-Speed Differential Microstrip Lanes
        const numLanes = 4;
        const laneSpacing = 50;
        const startY = cy - ((numLanes - 1) * laneSpacing) / 2;

        for (let i = 0; i < numLanes; i++) {
          const ly = startY + i * laneSpacing;

          // Copper stripline positive rail
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(30, ly - 8);
          ctx.lineTo(width - 30, ly - 8);
          ctx.stroke();

          // Copper stripline negative rail (complementary pair)
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(30, ly + 8);
          ctx.lineTo(width - 30, ly + 8);
          ctx.stroke();

          // Traveling Differential Electromagnetic Wave Packet
          const wavePhase = (time * 400 + i * 80) % (width - 60);
          const packetX = 30 + wavePhase;

          // Electric field lines between differential traces
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(packetX, ly - 8);
          ctx.lineTo(packetX, ly + 8);
          ctx.stroke();

          // Glowing wave packet envelope
          const waveGlow = ctx.createRadialGradient(packetX, ly, 2, packetX, ly, 35);
          waveGlow.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
          waveGlow.addColorStop(0.5, 'rgba(14, 165, 233, 0.3)');
          waveGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
          ctx.fillStyle = waveGlow;
          ctx.beginPath();
          ctx.arc(packetX, ly, 35, 0, Math.PI * 2);
          ctx.fill();
        }

        // Label
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PCIe Gen5 Differential Copper Stripline Pairs (c / √ε_r ≈ 0.152 mm/ps)', cx, cy + 130);

        ctx.restore();
      }

      // 3. LEVEL 2: Silicon Die & 16x16 Systolic Tensor Core (1.5 to 3.5)
      const alpha2 = getLayerAlpha(2.0, 1.2);
      if (alpha2 > 0.01) {
        ctx.save();
        ctx.globalAlpha = alpha2;

        // Silicon Die Boundary
        const dieSize = Math.min(width, height) * 0.65;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(cx - dieSize / 2, cy - dieSize / 2, dieSize, dieSize, 12);
        ctx.fill();
        ctx.stroke();

        // 16x16 Systolic Array Grid
        const gridSize = 16;
        const cellSize = (dieSize * 0.8) / gridSize;
        const startX = cx - (gridSize * cellSize) / 2;
        const startY = cy - (gridSize * cellSize) / 2;

        for (let r = 0; r < gridSize; r++) {
          for (let c = 0; c < gridSize; c++) {
            const cellX = startX + c * cellSize;
            const cellY = startY + r * cellSize;

            // Rhythmic systolic activation wave passing diagonally
            const diagDist = r + c;
            const wave = Math.sin(diagDist * 0.5 - time * 6);
            const intensity = Math.max(0, wave);

            ctx.fillStyle =
              intensity > 0.5
                ? `rgba(99, 102, 241, ${0.3 + intensity * 0.7})`
                : 'rgba(30, 41, 59, 0.6)';
            ctx.strokeStyle = 'rgba(129, 140, 248, 0.3)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.rect(cellX + 1, cellY + 1, cellSize - 2, cellSize - 2);
            ctx.fill();
            ctx.stroke();

            // Processing Element (PE) Center Dot
            if (intensity > 0.65) {
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(cellX + cellSize / 2, cellY + cellSize / 2, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Systolic Flow Arrows (Activations Right, Weights Down)
        ctx.fillStyle = '#a5b4fc';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('16×16 Systolic Matrix Engine (FP8 Fused MAC: C_ij ← C_ij + A_ik · B_kj)', cx, startY - 14);

        ctx.restore();
      }

      // 4. LEVEL 4: On-Chip SRAM 6T Bitcell (3.2 to 5.2)
      const alpha4 = getLayerAlpha(4.0, 1.2);
      if (alpha4 > 0.01) {
        ctx.save();
        ctx.globalAlpha = alpha4;

        // 6T SRAM Schematic & Charge Latch
        const sramWidth = Math.min(width, height) * 0.68;
        const sramHeight = sramWidth * 0.65;
        const sx = cx - sramWidth / 2;
        const sy = cy - sramHeight / 2;

        // Cell boundary
        ctx.fillStyle = '#090d16';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(sx, sy, sramWidth, sramHeight, 14);
        ctx.fill();
        ctx.stroke();

        // Wordline (horizontal top wire)
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sx + 20, sy + 30);
        ctx.lineTo(sx + sramWidth - 20, sy + 30);
        ctx.stroke();
        ctx.fillStyle = '#34d399';
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText('Wordline (WL) Active', sx + 30, sy + 22);

        // Bitlines (vertical wires: BL and BL_bar)
        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 3;
        // Left Bitline BL
        ctx.beginPath();
        ctx.moveTo(sx + 40, sy + 20);
        ctx.lineTo(sx + 40, sy + sramHeight - 20);
        ctx.stroke();
        // Right Bitline BL_bar
        ctx.beginPath();
        ctx.moveTo(sx + sramWidth - 40, sy + 20);
        ctx.lineTo(sx + sramWidth - 40, sy + sramHeight - 20);
        ctx.stroke();

        // Dual Cross-Coupled Inverter Gates
        const gate1X = cx - 60;
        const gate2X = cx + 60;
        const gateY = cy + 10;

        // Inverter 1 (holding Bit Q = 1, glowing green charge)
        const qGlow = ctx.createRadialGradient(gate1X, gateY, 4, gate1X, gateY, 40);
        qGlow.addColorStop(0, '#10b981');
        qGlow.addColorStop(0.5, 'rgba(16, 185, 129, 0.4)');
        qGlow.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = qGlow;
        ctx.beginPath();
        ctx.arc(gate1X, gateY, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Q = 1 (+0.8V)', gate1X, gateY + 5);

        // Inverter 2 (holding Bit Q_bar = 0, ground)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gate2X, gateY, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Q̄ = 0 (GND)', gate2X, gateY + 5);

        // Cross-coupled feedback arrows
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(gate1X + 25, gateY - 15);
        ctx.quadraticCurveTo(cx, gateY - 35, gate2X - 25, gateY - 15);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(gate2X - 25, gateY + 15);
        ctx.quadraticCurveTo(cx, gateY + 35, gate1X + 25, gateY + 15);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.fillText('6T SRAM Bistable Bitcell: 0.1 pJ/bit (Zero DRAM Refresh)', cx, sy + sramHeight - 15);

        ctx.restore();
      }

      // 5. LEVEL 6: Multi-Level Copper Interconnect Stack M1–M14 (5.2 to 7.4)
      const alpha6 = getLayerAlpha(6.0, 1.2);
      if (alpha6 > 0.01) {
        ctx.save();
        ctx.globalAlpha = alpha6;

        // Draw 14 Metal Tiers M1 (bottom) to M14 (top)
        const stackHeight = Math.min(width, height) * 0.7;
        const stackWidth = stackHeight * 0.85;
        const sx = cx - stackWidth / 2;
        const sy = cy - stackHeight / 2;
        const numTiers = 10;
        const tierHeight = stackHeight / numTiers;

        for (let i = 0; i < numTiers; i++) {
          const tierY = sy + i * tierHeight;
          const isTopTier = i < 3; // M12-M14 are thick global power/clock wires

          // Metal wire lines
          ctx.fillStyle = isTopTier ? '#f59e0b' : '#d97706';
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1;

          const wireThickness = isTopTier ? tierHeight * 0.6 : tierHeight * 0.45;
          ctx.beginPath();
          ctx.roundRect(sx + 30, tierY + 4, stackWidth - 60, wireThickness, 3);
          ctx.fill();
          ctx.stroke();

          // Inter-tier copper vias (vertical studs connecting layers)
          if (i < numTiers - 1) {
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.rect(sx + 80 + (i % 3) * 60, tierY + wireThickness, 12, tierHeight - wireThickness + 4);
            ctx.fill();
          }

          // Electron drift animation along wires
          const electronCount = 4;
          for (let e = 0; e < electronCount; e++) {
            const ex = sx + 40 + ((time * (60 + i * 15) + e * 70) % (stackWidth - 80));
            ctx.fillStyle = '#67e8f9';
            ctx.beginPath();
            ctx.arc(ex, tierY + 4 + wireThickness / 2, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          // Layer labels
          ctx.fillStyle = '#fed7aa';
          ctx.font = '9px ui-monospace, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`M${numTiers - i}`, sx + 6, tierY + wireThickness);
        }

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('14-Tier Damascene Copper Interconnect: RC Delay & Electromigration Limit', cx, sy + stackHeight + 20);

        ctx.restore();
      }

      // 6. LEVEL 9: 3nm Gate-All-Around & Landauer Quantum Limit (7.2 to 9.0)
      const alpha9 = getLayerAlpha(9.0, 1.2);
      if (alpha9 > 0.01) {
        ctx.save();
        ctx.globalAlpha = alpha9;

        // Draw Silicon Crystal Atomic Lattice (Diamond cubic lattice)
        const atomicSpacing = 42;
        const gridW = Math.min(width, height) * 0.7;
        const ax = cx - gridW / 2;
        const ay = cy - gridW / 2;

        // Lattice bonds
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.lineWidth = 1;
        for (let x = 0; x < gridW; x += atomicSpacing) {
          ctx.beginPath();
          ctx.moveTo(ax + x, ay);
          ctx.lineTo(ax + x, ay + gridW);
          ctx.stroke();
        }
        for (let y = 0; y < gridW; y += atomicSpacing) {
          ctx.beginPath();
          ctx.moveTo(ax, ay + y);
          ctx.lineTo(ax + gridW, ay + y);
          ctx.stroke();
        }

        // Silicon Atoms (Glowing Blue Spheres)
        for (let x = 0; x <= gridW; x += atomicSpacing) {
          for (let y = 0; y <= gridW; y += atomicSpacing) {
            const atomX = ax + x;
            const atomY = ay + y;

            // Thermal phonon vibration
            const vibeX = Math.sin(time * 8 + atomX) * 1.5;
            const vibeY = Math.cos(time * 8 + atomY) * 1.5;

            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(atomX + vibeX, atomY + vibeY, 5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#bae6fd';
            ctx.beginPath();
            ctx.arc(atomX + vibeX, atomY + vibeY, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Gate Dielectric Potential Barrier (Central Energy Wall)
        const barrierW = 60;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx - barrierW / 2, ay, barrierW, gridW, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fca5a5';
        ctx.font = '10px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('1.2 nm Gate Oxide', cx, ay - 10);
        ctx.fillText('(Tunneling Barrier)', cx, ay + 15);

        // Quantum Electron Wave Packet Tunneling (|ψ(x)|² probability wave)
        const waveX = (time * 120) % (gridW + 80);
        const packetX = ax - 40 + waveX;
        const inBarrier = packetX >= cx - barrierW / 2 && packetX <= cx + barrierW / 2;
        const waveAmp = inBarrier ? 8 : 24;

        ctx.strokeStyle = inBarrier ? '#f87171' : '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let ox = -40; ox <= 40; ox += 2) {
          const px = packetX + ox;
          const py = cy + Math.sin(ox * 0.25 - time * 10) * (waveAmp * Math.exp(-(ox * ox) / 400));
          if (ox === -40) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Landauer Heat Phonon Radiation (Thermal entropy emission into heat bath)
        const phononCount = 6;
        for (let p = 0; p < phononCount; p++) {
          const pAngle = (p * Math.PI * 2) / phononCount + time * 2;
          const pDist = 50 + ((time * 60 + p * 20) % 70);
          const px = cx + Math.cos(pAngle) * pDist;
          const py = cy + Math.sin(pAngle) * pDist;

          ctx.fillStyle = 'rgba(251, 146, 60, 0.7)';
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 12px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Landauer Limit: E ≥ k_B T ln 2 ≈ 2.87 × 10⁻²¹ J (Thermal Entropy Dissipated)', cx, ay + gridW + 28);

        ctx.restore();
      }

      // HUD Compass Reticle & Coordinate Crosshairs
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 30, cy);
      ctx.lineTo(cx + 30, cy);
      ctx.moveTo(cx, cy - 30);
      ctx.lineTo(cx, cy + 30);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [scaleExp]);

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative w-full rounded-3xl border border-brand-500/20 bg-ink-950 text-white shadow-2xl overflow-hidden focus:outline-none transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none p-4' : 'p-4 sm:p-6 lg:p-8 space-y-6'
      }`}
    >
      {/* Top Header & Telemetry Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 font-mono text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              The Cosmic Ladder of Scale
            </span>
            <span className="text-xs font-mono text-ink-400">
              10⁰ m → 10⁻⁹ m (9 Orders of Magnitude)
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>{currentRung.name}</span>
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Auto Tour Play/Pause */}
          <button
            onClick={handleToggleTour}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isPlayingTour
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'bg-brand-500 text-white shadow-md shadow-brand-500/20 hover:bg-brand-400'
            }`}
          >
            {isPlayingTour ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlayingTour ? 'Pause Flight' : 'Auto Flight Tour'}</span>
          </button>

          {/* Reset to Human Scale */}
          <button
            onClick={() => {
              setIsPlayingTour(false);
              setScaleExp(0);
              soundFX.playTap();
            }}
            title="Reset to 10⁰ m Human Scale"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-ink-300 border border-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const muted = soundFX.toggleMute();
              setIsSoundMuted(muted);
              if (!muted) soundFX.playSuccess();
            }}
            title={isSoundMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-ink-300 border border-white/10 transition-colors cursor-pointer"
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Canvas'}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-ink-300 border border-white/10 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Rung Jump Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SCALE_RUNGS.map((rung, idx) => {
          const isSelected = activeRungIdx === idx;
          return (
            <button
              key={rung.exponent}
              onClick={() => handleJumpToRung(rung, idx)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-brand-500/20 border-brand-400 text-white shadow-sm ring-1 ring-brand-400/50 scale-[1.02]'
                  : 'bg-white/5 border-white/10 text-ink-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-[10px] font-mono font-bold text-brand-300">
                10⁻{rung.exponent === 0 ? '0' : rung.exponent} m
              </span>
              <span className="text-xs font-bold truncate mt-1">
                {rung.name.split(':')[1]?.trim() || rung.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scrubbable Logarithmic Range Slider */}
      <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between text-xs font-mono text-ink-300">
          <span className="text-brand-300 font-bold">10⁰ m (1 Meter)</span>
          <span className="px-2 py-0.5 rounded bg-brand-500/30 text-white font-bold border border-brand-500/40">
            Scale: 10⁻{scaleExp.toFixed(2)} m ({currentRung.spatialDimension})
          </span>
          <span className="text-rose-400 font-bold">10⁻⁹ m (1 Nanometer)</span>
        </div>

        <input
          type="range"
          min="0"
          max="9"
          step="0.05"
          value={scaleExp}
          onChange={handleSliderChange}
          className="w-full h-2 bg-ink-800 rounded-lg appearance-none cursor-ew-resize accent-brand-500"
        />

        <div className="flex justify-between text-[10px] font-mono text-ink-500 px-1">
          <span>Human</span>
          <span>PCB Trace</span>
          <span>Systolic Die</span>
          <span>SRAM Latch</span>
          <span>Copper Wire</span>
          <span>3nm GAA</span>
        </div>
      </div>

      {/* Main Canvas Visualizer */}
      <div
        className="relative w-full h-72 sm:h-96 rounded-2xl border border-white/10 overflow-hidden bg-black shadow-inner touch-none cursor-crosshair group"
        onWheel={handleWheelZoom}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Live Overlay HUD Telemetry */}
        <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md border border-white/10 rounded-xl p-3 font-mono text-[11px] space-y-1 shadow-lg pointer-events-none">
          <div className="text-brand-400 font-bold flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5" />
            <span>PHYSICAL TELEMETRY HUD</span>
          </div>
          <div className="text-white">
            <span className="text-ink-400">Entity: </span>
            {currentRung.physicalEntity}
          </div>
          <div className="text-emerald-400">
            <span className="text-ink-400">Transit Time τ: </span>
            {currentRung.timeConstant}
          </div>
          <div className="text-amber-400">
            <span className="text-ink-400">Velocity: </span>
            {currentRung.propagationVelocity}
          </div>
          <div className="text-cyan-400">
            <span className="text-ink-400">Energy / Bit: </span>
            {currentRung.energyPerBit}
          </div>
          <div className="text-rose-400">
            <span className="text-ink-400">Heat Flux: </span>
            {currentRung.heatFlux}
          </div>
          <div className="text-purple-300">
            <span className="text-ink-400">Landauer Ratio: </span>
            {currentRung.landauerRatio}
          </div>
        </div>

        {/* Canvas Zoom Hint Bottom-Right */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs border border-white/10 px-2.5 py-1 rounded-lg text-[10px] font-mono text-ink-400 pointer-events-none">
          Use Mouse Wheel / Arrow Keys to Zoom Scale
        </div>
      </div>

      {/* Epistemological Deep-Dive Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('physics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'physics'
                ? 'bg-brand-500 text-white'
                : 'text-ink-400 hover:text-white'
            }`}
          >
            Governing Physics & Derivation
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-brand-500 text-white'
                : 'text-ink-400 hover:text-white'
            }`}
          >
            Comparative Scale Matrix
          </button>
          <button
            onClick={() => setActiveTab('first_principles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'first_principles'
                ? 'bg-brand-500 text-white'
                : 'text-ink-400 hover:text-white'
            }`}
          >
            First-Principles Socratic Truth
          </button>
        </div>

        {/* TAB 1: Governing Physics */}
        {activeTab === 'physics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-mono font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Physical Law at 10⁻{currentRung.exponent} m
              </span>
              <h3 className="text-base font-bold text-white">{currentRung.governingLaw}</h3>
              <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-center">
                <MathView math={currentRung.equation} display={true} className="text-brand-300 text-sm" />
              </div>
              <p className="text-xs text-ink-300 leading-relaxed">
                {currentRung.equationExplanation}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  First-Principles Physical Intuition
                </span>
                <p className="text-xs sm:text-sm text-ink-200 leading-relaxed mt-2 font-medium">
                  {currentRung.firstPrinciplesIntuition}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <strong className="text-amber-300 block mb-1">
                  Why Clay or Discrete Wires Fail Here:
                </strong>
                {currentRung.whyClayOrWireCannotDoThis}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Comparative Telemetry Matrix */}
        {activeTab === 'telemetry' && (
          <div className="overflow-x-auto no-scrollbar rounded-2xl border border-white/10 bg-white/5 animate-fade-in">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-white/5 text-brand-300 border-b border-white/10">
                <tr>
                  <th className="p-3">Scale</th>
                  <th className="p-3">Physical Entity</th>
                  <th className="p-3">Time Constant τ</th>
                  <th className="p-3">Signal Speed</th>
                  <th className="p-3">Energy / Bit</th>
                  <th className="p-3">Heat Flux</th>
                  <th className="p-3">Landauer Bound</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-ink-300">
                {SCALE_RUNGS.map((rung) => (
                  <tr
                    key={rung.exponent}
                    className={`hover:bg-white/5 transition-colors ${
                      currentRung.exponent === rung.exponent ? 'bg-brand-500/10 text-white font-bold' : ''
                    }`}
                  >
                    <td className="p-3 text-brand-400">10⁻{rung.exponent} m</td>
                    <td className="p-3">{rung.name.split(':')[1]}</td>
                    <td className="p-3 text-emerald-400">{rung.timeConstant}</td>
                    <td className="p-3 text-amber-400">{rung.propagationVelocity}</td>
                    <td className="p-3 text-cyan-400">{rung.energyPerBit}</td>
                    <td className="p-3 text-rose-400">{rung.heatFlux}</td>
                    <td className="p-3 text-purple-300">{rung.landauerRatio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: First-Principles Socratic Truth */}
        {activeTab === 'first_principles' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
              <Atom className="w-4 h-4" />
              <span>The Grand Socratic Epistemology: Information Is Strictly Physical</span>
            </div>
            <p className="text-xs sm:text-sm text-ink-300 leading-relaxed">
              In computer science textbooks, a neural network is defined as a series of abstract matrix multiplications{' '}
              <MathView math="Y = \text{softmax}(QK^T / \sqrt{d})V" display={false} />. In physical reality, an LLM is a thermodynamic heat engine:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">1. Charge Flow</span>
                <p className="text-xs text-ink-300">
                  Bits are not logical symbols. They are electrons held behind a 1.12 eV silicon bandgap.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">2. Relativistic Limit</span>
                <p className="text-xs text-ink-300">
                  Data travels at <MathView math="0.15\text{ mm/ps}" display={false} />. Moving weights across a 10 cm board chokes FLOPs.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">3. Landauer Heat</span>
                <p className="text-xs text-ink-300">
                  Erasing a token dissipates <MathView math="k_B T \ln 2" display={false} /> of entropy into datacenter liquid cooling.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
