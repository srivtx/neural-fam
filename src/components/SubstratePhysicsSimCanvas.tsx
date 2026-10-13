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

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Radio,
  Workflow,
  StepForward,
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
  | 'roofline_memory_wall'
  | 'pn_junction'
  | 'superscalar_pipeline'
  | 'quantum_tunneling'
  | 'systolic_array'
  | 'landauer_reversible';

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

  // ==========================================
  // STATION 8: PN JUNCTION DIODE & SPACE CHARGE
  // ==========================================
  const [pnVoltage, setPnVoltage] = useState<number>(0.0); // -5.0V to +0.8V
  const [pnTempK, setPnTempK] = useState<number>(300); // 100K to 450K

  const pnPhysics = useMemo(() => {
    const q = 1.60217663e-19;
    const kB = 1.380649e-23;
    const eps0 = 8.8541878e-12;
    const epsR = 11.7; // Silicon relative permittivity
    const epsS = eps0 * epsR;
    const Na = 1e22; // Acceptor doping: 10^16 cm^-3 in m^-3
    const Nd = 1e22; // Donor doping: 10^16 cm^-3 in m^-3

    const Vt = (kB * pnTempK) / q; // Thermal voltage (V) ~ 0.02585V at 300K
    const Eg = 1.17 - (4.73e-4 * pnTempK * pnTempK) / (pnTempK + 636); // Bandgap eV
    const ni = Math.max(1e12, 5.2e21 * Math.pow(pnTempK / 300, 1.5) * Math.exp((-Eg * q) / (2 * kB * pnTempK)));

    // Built-in potential V_bi = (k*T / q) * ln(N_A * N_D / n_i^2)
    const VbiRaw = Vt * Math.log((Na * Nd) / (ni * ni));
    const Vbi = Math.max(0.45, Math.min(0.92, VbiRaw));

    // Depletion region width W(V) = sqrt((2*eps_s / q) * (1/Na + 1/Nd) * max(0.015, Vbi - V))
    const effectiveBarrier = Math.max(0.015, Vbi - pnVoltage);
    const W_meters = Math.sqrt(((2 * epsS) / q) * (1 / Na + 1 / Nd) * effectiveBarrier);
    const W_um = W_meters * 1e6;

    // Equilibrium width W0 at V=0
    const W0_meters = Math.sqrt(((2 * epsS) / q) * (1 / Na + 1 / Nd) * Vbi);
    const W0_um = W0_meters * 1e6;

    // Shockley Diode equation: I = Is * (exp(q*V / (n*k*T)) - 1)
    const Is0 = 1e-12; // 1 pA at 300K
    const Is = Is0 * Math.pow(pnTempK / 300, 3) * Math.exp((-Eg / (8.617e-5 * pnTempK)) * (1 - 300 / pnTempK));
    const nIdeality = 1.25;

    let current = 0; // Amperes
    const isBreakdown = pnVoltage <= -4.4;
    if (isBreakdown) {
      current = -Is - 0.035 * Math.exp((-pnVoltage - 4.4) / 0.12);
    } else {
      const exponent = Math.min(30, pnVoltage / (nIdeality * Vt));
      current = Is * (Math.exp(exponent) - 1);
    }

    let operatingMode: string;
    if (isBreakdown) {
      operatingMode = 'Avalanche Breakdown (Zener/Impact Ionization)';
    } else if (pnVoltage < -0.05) {
      operatingMode = 'Reverse Bias (Wide Depletion / Diffusion Blocked)';
    } else if (Math.abs(pnVoltage) <= 0.05) {
      operatingMode = 'Thermal Equilibrium (Space-Charge Balance / J = 0)';
    } else if (pnVoltage < 0.6) {
      operatingMode = 'Forward Sub-Threshold (Minority Injection)';
    } else {
      operatingMode = 'Forward Conduction (Barrier Collapsed / Diffusion Flood)';
    }

    return {
      Vt,
      Vbi,
      W_um,
      W0_um,
      current,
      operatingMode,
      isBreakdown,
      barrierHeight: effectiveBarrier,
      Eg,
    };
  }, [pnVoltage, pnTempK]);

  const formattedPnCurrent = useMemo(() => {
    const i = pnPhysics.current;
    const absI = Math.abs(i);
    if (absI < 1e-9) return `${(i * 1e12).toFixed(1)} pA`;
    if (absI < 1e-6) return `${(i * 1e9).toFixed(1)} nA`;
    if (absI < 1e-3) return `${(i * 1e6).toFixed(1)} µA`;
    return `${(i * 1e3).toFixed(2)} mA`;
  }, [pnPhysics.current]);

  // Procedural audio trigger on avalanche breakdown threshold crossing
  const prevBreakdownRef = useRef<boolean>(false);
  useEffect(() => {
    if (station === 'pn_junction') {
      if (pnPhysics.isBreakdown && !prevBreakdownRef.current) {
        soundFX.playDiodeBreakdown();
      }
      prevBreakdownRef.current = pnPhysics.isBreakdown;
    }
  }, [station, pnPhysics.isBreakdown]);

  // ==========================================
  // STATION 9: RISC-V 5-STAGE SUPERSCALAR PIPELINE
  // ==========================================
  interface PipelineInstruction {
    id: string;
    mnemonic: string;
    badge: string;
    dest?: string;
    src1?: string;
    src2?: string;
    color: string;
    type: 'load' | 'alu' | 'branch' | 'store' | 'bubble';
    isBubble?: boolean;
    isFlushed?: boolean;
    rawDep?: string;
    comment: string;
  }

  const PIPELINE_PROGRAM = useMemo<PipelineInstruction[]>(
    () => [
      {
        id: 'i0',
        mnemonic: 'LW x1, 0(x2)',
        badge: 'LW',
        dest: 'x1',
        src1: 'x2',
        color: '#06b6d4',
        type: 'load',
        comment: 'Load word from memory [x2] into x1',
      },
      {
        id: 'i1',
        mnemonic: 'ADD x3, x1, x4',
        badge: 'ADD',
        dest: 'x3',
        src1: 'x1',
        src2: 'x4',
        color: '#10b981',
        type: 'alu',
        rawDep: 'x1',
        comment: 'ALU: R[x3] = R[x1] + R[x4] (RAW on x1)',
      },
      {
        id: 'i2',
        mnemonic: 'BEQ x3, x0, loop',
        badge: 'BEQ',
        src1: 'x3',
        src2: 'x0',
        color: '#f59e0b',
        type: 'branch',
        rawDep: 'x3',
        comment: 'Branch conditional: if x3 == x0 goto loop',
      },
      {
        id: 'i3',
        mnemonic: 'SUB x5, x3, x6',
        badge: 'SUB',
        dest: 'x5',
        src1: 'x3',
        src2: 'x6',
        color: '#8b5cf6',
        type: 'alu',
        rawDep: 'x3',
        comment: 'ALU: R[x5] = R[x3] - R[x6] (Speculative)',
      },
      {
        id: 'i4',
        mnemonic: 'ANDI x7, x5, 0xF',
        badge: 'ANDI',
        dest: 'x7',
        src1: 'x5',
        color: '#3b82f6',
        type: 'alu',
        rawDep: 'x5',
        comment: 'ALU: R[x7] = R[x5] & 0x0F',
      },
      {
        id: 'i5',
        mnemonic: 'SW x7, 4(x2)',
        badge: 'SW',
        src1: 'x7',
        src2: 'x2',
        color: '#f43f5e',
        type: 'store',
        comment: 'Store word R[x7] to memory [x2+4]',
      },
      {
        id: 'i6',
        mnemonic: 'OR x8, x1, x7',
        badge: 'OR',
        dest: 'x8',
        src1: 'x1',
        src2: 'x7',
        color: '#14b8a6',
        type: 'alu',
        comment: 'ALU: R[x8] = R[x1] | R[x7]',
      },
      {
        id: 'i7',
        mnemonic: 'ADDI x2, x2, 4',
        badge: 'ADDI',
        dest: 'x2',
        src1: 'x2',
        color: '#a855f7',
        type: 'alu',
        comment: 'Pointer increment: R[x2] += 4',
      },
    ],
    []
  );

  const [dataForwarding, setDataForwarding] = useState<boolean>(true);
  const [pipelineAutoClock, setPipelineAutoClock] = useState<boolean>(false);
  const [cycleCount, setCycleCount] = useState<number>(0);
  const [committedCount, setCommittedCount] = useState<number>(0);
  const [stallCount, setStallCount] = useState<number>(0);
  const [flushCount, setFlushCount] = useState<number>(0);
  const [flushAnimation, setFlushAnimation] = useState<number>(0);
  const [pcIndex, setPcIndex] = useState<number>(0);
  const [stallRemaining, setStallRemaining] = useState<number>(0);
  const [activeHazard, setActiveHazard] = useState<string>('Nominal Execution (No Hazards)');

  const [stages, setStages] = useState<{
    if: PipelineInstruction | null;
    id: PipelineInstruction | null;
    ex: PipelineInstruction | null;
    mem: PipelineInstruction | null;
    wb: PipelineInstruction | null;
  }>({
    if: null,
    id: null,
    ex: null,
    mem: null,
    wb: null,
  });

  // Step pipeline clock cycle
  const stepPipelineClock = useCallback(() => {
    setCycleCount((c) => c + 1);

    setStages((prev) => {
      const nextWb = prev.mem;
      const nextMem = prev.ex;
      let nextEx: PipelineInstruction | null = prev.id;
      let nextId: PipelineInstruction | null = prev.if;
      let nextIf: PipelineInstruction | null = null;

      // 1. Retirement in WB
      if (prev.wb && !prev.wb.isBubble && !prev.wb.isFlushed) {
        setCommittedCount((ret) => ret + 1);
        soundFX.playTap();
      }

      // 2. Check for RAW Data Hazard in ID stage
      const instInId = prev.id;
      let needsStall = false;
      let hazardReason = 'Nominal Execution';

      if (instInId && instInId.rawDep && !instInId.isBubble) {
        const depReg = instInId.rawDep;
        const exProduces = prev.ex && prev.ex.dest === depReg && !prev.ex.isBubble;
        const memProduces = prev.mem && prev.mem.dest === depReg && !prev.mem.isBubble;

        if (dataForwarding) {
          if (exProduces && prev.ex?.type === 'load') {
            if (stallRemaining <= 0) {
              needsStall = true;
              hazardReason = `Load-Use Hazard on ${depReg}: Forwarding from MEM requires 1-cycle bubble`;
            }
          } else if (exProduces) {
            hazardReason = `Bypass Forwarding (EX->EX): ${depReg} passed directly into ALU (0 stalls)`;
          } else if (memProduces) {
            hazardReason = `Bypass Forwarding (MEM->EX): ${depReg} forwarded from Memory stage (0 stalls)`;
          }
        } else {
          if (exProduces || memProduces) {
            if (stallRemaining <= 0) {
              needsStall = true;
              hazardReason = `RAW Hazard on ${depReg}: No bypass forwarding! Inserting 2-cycle stall bubble`;
            }
          }
        }
      }

      if (needsStall) {
        setStallCount((s) => s + 1);
        setStallRemaining(dataForwarding ? 0 : 1);
        setActiveHazard(hazardReason);
        soundFX.playPipelineStall();

        nextEx = {
          id: `bubble_${Date.now()}`,
          mnemonic: 'BUBBLE (RAW STALL)',
          badge: 'STALL',
          color: '#f43f5e',
          type: 'bubble',
          isBubble: true,
          comment: hazardReason,
        };
        nextId = prev.id; // Freeze ID
        nextIf = prev.if; // Freeze IF
        return {
          if: nextIf,
          id: nextId,
          ex: nextEx,
          mem: nextMem,
          wb: nextWb,
        };
      }

      if (stallRemaining > 0) {
        setStallRemaining((r) => r - 1);
        setStallCount((s) => s + 1);
        soundFX.playPipelineStall();
        nextEx = {
          id: `bubble_${Date.now()}`,
          mnemonic: 'BUBBLE (RAW STALL)',
          badge: 'STALL',
          color: '#f43f5e',
          type: 'bubble',
          isBubble: true,
          comment: 'Stall cycle 2/2 awaiting Register WriteBack commit',
        };
        nextId = prev.id;
        nextIf = prev.if;
        return {
          if: nextIf,
          id: nextId,
          ex: nextEx,
          mem: nextMem,
          wb: nextWb,
        };
      }

      // No stall: Advance IF stage from program
      setActiveHazard(hazardReason);
      setPcIndex((p) => (p + 1) % PIPELINE_PROGRAM.length);
      nextIf = PIPELINE_PROGRAM[pcIndex % PIPELINE_PROGRAM.length];

      return {
        if: nextIf,
        id: nextId,
        ex: nextEx,
        mem: nextMem,
        wb: nextWb,
      };
    });
  }, [dataForwarding, stallRemaining, pcIndex, PIPELINE_PROGRAM]);

  // Trigger branch flush
  const triggerBranchFlush = useCallback(() => {
    setFlushCount((f) => f + 1);
    setFlushAnimation(Date.now());
    soundFX.playPipelineStall();
    setActiveHazard('⚠ SPECULATIVE BRANCH MISPREDICTION: Flushed speculative instructions in IF & ID');

    setStages((prev) => ({
      ...prev,
      if: {
        id: `flush_if_${Date.now()}`,
        mnemonic: 'FLUSH (MISPREDICT)',
        badge: 'FLUSH',
        color: '#ef4444',
        type: 'bubble',
        isFlushed: true,
        comment: 'Speculative instruction squashed by branch evaluator',
      },
      id: {
        id: `flush_id_${Date.now()}`,
        mnemonic: 'FLUSH (MISPREDICT)',
        badge: 'FLUSH',
        color: '#ef4444',
        type: 'bubble',
        isFlushed: true,
        comment: 'Speculative instruction squashed by branch evaluator',
      },
    }));
  }, []);

  // Reset pipeline
  const resetPipeline = useCallback(() => {
    setCycleCount(0);
    setCommittedCount(0);
    setStallCount(0);
    setFlushCount(0);
    setPcIndex(0);
    setStallRemaining(0);
    setPipelineAutoClock(false);
    setActiveHazard('Pipeline Reset to Initial State');
    setStages({
      if: PIPELINE_PROGRAM[0],
      id: null,
      ex: null,
      mem: null,
      wb: null,
    });
    soundFX.playTap();
  }, [PIPELINE_PROGRAM]);

  const currentCPI = useMemo(() => {
    if (cycleCount === 0 || committedCount === 0) return 1.0;
    return parseFloat((cycleCount / committedCount).toFixed(2));
  }, [cycleCount, committedCount]);

  // Pipeline auto clock
  useEffect(() => {
    if (station !== 'superscalar_pipeline' || !pipelineAutoClock || !isPlaying) return;
    const interval = setInterval(() => {
      stepPipelineClock();
    }, 1100);
    return () => clearInterval(interval);
  }, [station, pipelineAutoClock, isPlaying, stepPipelineClock]);

  // Pipeline flush animation decay
  useEffect(() => {
    if (!flushAnimation) return;
    const timer = setTimeout(() => {
      setFlushAnimation(0);
    }, 800);
    return () => clearTimeout(timer);
  }, [flushAnimation]);

  // ==========================================
  // STATION 10: QUANTUM TUNNELING & FLASH FLOATING GATE
  // ==========================================
  const [tunnelBarrierWidthNm, setTunnelBarrierWidthNm] = useState<number>(2.4);
  const [tunnelBarrierHeightEv] = useState<number>(3.2);
  const [electronEnergyEv, setElectronEnergyEv] = useState<number>(1.1);
  const [trappedElectrons, setTrappedElectrons] = useState<number>(120);
  const [flashCellType, setFlashCellType] = useState<'slc' | 'mlc' | 'tlc' | 'qlc'>('tlc');
  const [isTunnelingPulse, setIsTunnelingPulse] = useState<boolean>(false);

  const tunnelingPhysics = useMemo(() => {
    const d = tunnelBarrierWidthNm;
    const V0 = tunnelBarrierHeightEv;
    const E = Math.min(V0 - 0.05, electronEnergyEv);
    const kappa = 5.123 * Math.sqrt(Math.max(0.01, V0 - E));
    const factor = 16 * (E / V0) * (1 - E / V0);
    const exponent = -2 * kappa * d;
    const transProb = factor * Math.exp(Math.max(-80, exponent));
    const deltaVth = (trappedElectrons / 450) * 4.0;
    const baseVth = 1.2;
    const effectiveVth = baseVth + deltaVth;
    const numLevels = flashCellType === 'slc' ? 2 : flashCellType === 'mlc' ? 4 : flashCellType === 'tlc' ? 8 : 16;
    const activeLevel = Math.min(numLevels - 1, Math.floor((trappedElectrons / 450) * numLevels));
    return { kappa, transProb, effectiveVth, deltaVth, numLevels, activeLevel };
  }, [tunnelBarrierWidthNm, tunnelBarrierHeightEv, electronEnergyEv, trappedElectrons, flashCellType]);

  const triggerProgramPulse = () => {
    setIsTunnelingPulse(true);
    setTrappedElectrons((prev) => Math.min(450, prev + 60));
    soundFX.playTap();
    setTimeout(() => setIsTunnelingPulse(false), 350);
  };

  const triggerErasePulse = () => {
    setIsTunnelingPulse(true);
    setTrappedElectrons((prev) => Math.max(0, prev - 120));
    soundFX.playTap();
    setTimeout(() => setIsTunnelingPulse(false), 350);
  };

  // ==========================================
  // STATION 11: 2D SYSTOLIC ARRAY MATRIX ENGINE
  // ==========================================
  const [systolicCycle, setSystolicCycle] = useState<number>(0);
  const [systolicAutoClock, setSystolicAutoClock] = useState<boolean>(false);
  const [systolicMode, setSystolicMode] = useState<'weight_stationary' | 'output_stationary'>('weight_stationary');

  const systolicWeights = useMemo(() => [
    [2, 1, 3],
    [1, 2, 0],
    [3, 0, 2],
  ], []);

  const systolicInputs = useMemo(() => [
    [1, 2, 0],
    [2, 1, 3],
    [0, 3, 1],
  ], []);

  const stepSystolicClock = useCallback(() => {
    setSystolicCycle((c) => (c + 1) % 10);
    soundFX.playTap();
  }, []);

  useEffect(() => {
    if (station !== 'systolic_array' || !systolicAutoClock) return;
    const interval = setInterval(() => {
      setSystolicCycle((c) => (c + 1) % 10);
    }, 750);
    return () => clearInterval(interval);
  }, [station, systolicAutoClock]);

  // ==========================================
  // STATION 12: THERMODYNAMIC LANDAUER LIMIT & REVERSIBLE COMPUTING
  // ==========================================
  const [landauerTempK, setLandauerTempK] = useState<number>(300);
  const [landauerBitState, setLandauerBitState] = useState<0 | 1>(1);
  const [landauerErasing, setLandauerErasing] = useState<boolean>(false);
  const [totalHeatDissipatedZJ, setTotalHeatDissipatedZJ] = useState<number>(0);
  const [erasureCount, setErasureCount] = useState<number>(0);
  const [reversibleGate, setReversibleGate] = useState<'fredkin' | 'toffoli'>('fredkin');
  const [revInputA, setRevInputA] = useState<0 | 1>(1);
  const [revInputB, setRevInputB] = useState<0 | 1>(0);
  const [revInputC, setRevInputC] = useState<0 | 1>(1);

  const landauerEnergyZJ = useMemo(() => {
    const kB = 1.380649e-23;
    const energyJoules = kB * landauerTempK * Math.LN2;
    return energyJoules * 1e21;
  }, [landauerTempK]);

  const reversibleOutputs = useMemo(() => {
    if (reversibleGate === 'fredkin') {
      const outA = revInputA;
      const outB = revInputA === 1 ? revInputC : revInputB;
      const outC = revInputA === 1 ? revInputB : revInputC;
      return { outA, outB, outC };
    } else {
      const outA = revInputA;
      const outB = revInputB;
      const outC = (revInputC ^ (revInputA & revInputB)) as 0 | 1;
      return { outA, outB, outC };
    }
  }, [reversibleGate, revInputA, revInputB, revInputC]);

  const triggerLandauerErasure = () => {
    setLandauerErasing(true);
    setLandauerBitState(0);
    setErasureCount((c) => c + 1);
    setTotalHeatDissipatedZJ((prev) => prev + landauerEnergyZJ);
    soundFX.playTap();
    setTimeout(() => setLandauerErasing(false), 500);
  };

  // Initialize pipeline if empty when switching to superscalar_pipeline
  useEffect(() => {
    if (station === 'superscalar_pipeline' && stages.if === null && cycleCount === 0) {
      setStages({
        if: PIPELINE_PROGRAM[0],
        id: null,
        ex: null,
        mem: null,
        wb: null,
      });
    }
  }, [station, stages.if, cycleCount, PIPELINE_PROGRAM]);

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
      } else if (station === 'pn_junction') {
        renderPnJunction(ctx, width, height, pnVoltage, pnTempK, pnPhysics, time);
      } else if (station === 'superscalar_pipeline') {
        renderSuperscalarPipeline(
          ctx,
          width,
          height,
          stages,
          dataForwarding,
          cycleCount,
          committedCount,
          currentCPI,
          activeHazard,
          flushAnimation,
          time
        );
      } else if (station === 'quantum_tunneling') {
        renderQuantumTunneling(
          ctx,
          width,
          height,
          tunnelBarrierWidthNm,
          electronEnergyEv,
          tunnelingPhysics,
          isTunnelingPulse,
          flashCellType,
          time
        );
      } else if (station === 'systolic_array') {
        renderSystolicArray(
          ctx,
          width,
          height,
          systolicCycle,
          systolicWeights,
          systolicInputs,
          systolicMode,
          time
        );
      } else if (station === 'landauer_reversible') {
        renderLandauerReversible(
          ctx,
          width,
          height,
          landauerTempK,
          landauerBitState,
          landauerErasing,
          landauerEnergyZJ,
          totalHeatDissipatedZJ,
          erasureCount,
          reversibleGate,
          revInputA,
          revInputB,
          revInputC,
          reversibleOutputs,
          time
        );
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
    pnVoltage,
    pnTempK,
    pnPhysics,
    stages,
    dataForwarding,
    cycleCount,
    committedCount,
    currentCPI,
    activeHazard,
    flushAnimation,
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

  // Interactive pointer dragging for Station 4: Bistable Latch bead
  const updateLatchFromPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const cx = rect.width / 2;
    const halfW = rect.width < 440 ? 110 : rect.width < 600 ? 135 : 160;
    const normX = (x - cx) / (halfW * 0.75);
    const clampedNorm = Math.max(-1.0, Math.min(1.0, normX));
    const newV = 0.375 + clampedNorm * 0.375;
    setLatchVoltage(parseFloat(newV.toFixed(3)));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (station !== 'bistable_latch') return;
    setIsDraggingBead(true);
    updateLatchFromPointer(e);
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingBead || station !== 'bistable_latch') return;
    updateLatchFromPointer(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDraggingBead(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerCancel = () => {
    setIsDraggingBead(false);
  };

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

  const renderPnJunction = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    vBias: number,
    tempK: number,
    physics: {
      Vt: number;
      Vbi: number;
      W_um: number;
      W0_um: number;
      current: number;
      operatingMode: string;
      isBreakdown: boolean;
      barrierHeight: number;
      Eg: number;
    },
    t: number
  ) => {
    ctx.save();
    const isMobile = w < 640;
    const isCompact = w < 460;

    // Header Title
    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 10px monospace' : 'bold 12px monospace';
    ctx.fillText(
      isCompact
        ? 'PN JUNCTION: DEPLETION REGION'
        : 'PN JUNCTION DIODE: SPACE-CHARGE CARRIER DEPLETION & SHOCKLEY DYNAMICS',
      isMobile ? 12 : 24,
      24
    );

    const padL = isMobile ? 10 : 20;
    const hudW = isMobile ? w - padL * 2 : Math.min(260, Math.round(w * 0.33));
    const mainW = isMobile ? w - padL * 2 : w - padL * 2 - hudW - 14;
    const mainH = isMobile ? Math.round(h * 0.58) : h - 40;
    const hudL = isMobile ? padL : padL + mainW + 14;
    const hudY = isMobile ? mainH + 34 : 34;
    const hudH = isMobile ? h - hudY - 10 : h - 40;

    // --- 1. MAIN PANEL: SEMICONDUCTOR CRYSTAL & BAND PROFILE ---
    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.fillRect(padL, 34, mainW, mainH);
    ctx.strokeRect(padL, 34, mainW, mainH);

    // Crystal cross-section geometry
    const crystalY = 38;
    const crystalH = Math.round(mainH * 0.54);
    const junctionX = padL + mainW / 2;

    // Map physical depletion width to pixel width
    const baseWpx = Math.max(10, Math.min(mainW * 0.78, (physics.W_um / 0.43) * 64));
    const depLeft = junctionX - baseWpx / 2;
    const depRight = junctionX + baseWpx / 2;

    // P-type Region (Left: dark indigo/purple)
    ctx.fillStyle = '#160d26';
    ctx.fillRect(padL + 1, crystalY, junctionX - padL - 1, crystalH);

    // N-type Region (Right: dark blue/teal)
    ctx.fillStyle = '#071827';
    ctx.fillRect(junctionX, crystalY, padL + mainW - junctionX - 1, crystalH);

    // Depletion Region (Center: space charge zone)
    ctx.fillStyle = physics.isBreakdown ? '#450a0a88' : '#0f172a99';
    ctx.fillRect(depLeft, crystalY, baseWpx, crystalH);
    ctx.strokeStyle = physics.isBreakdown ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(depLeft, crystalY, baseWpx, crystalH);

    // Region Labels
    ctx.font = isCompact ? 'bold 8.5px monospace' : 'bold 10px monospace';
    ctx.fillStyle = '#c084fc';
    ctx.fillText('P-TYPE (Acceptor B⁻ + Holes h⁺)', padL + 8, crystalY + 16);

    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'right';
    ctx.fillText('N-TYPE (Donor P⁺ + Electrons e⁻)', padL + mainW - 8, crystalY + 16);
    ctx.textAlign = 'left';

    // Metal Contacts on edges
    ctx.fillStyle = '#64748b';
    ctx.fillRect(padL + 1, crystalY, 6, crystalH);
    ctx.fillRect(padL + mainW - 7, crystalY, 6, crystalH);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('ANODE (+)', padL + 10, crystalY + crystalH - 8);
    ctx.textAlign = 'right';
    ctx.fillText('CATHODE (-)', padL + mainW - 10, crystalY + crystalH - 8);
    ctx.textAlign = 'left';

    // Fixed Lattice Ions
    const rows = 4;
    const colsPerSide = 5;
    for (let r = 0; r < rows; r++) {
      const iy = crystalY + 28 + (r / (rows - 1)) * (crystalH - 52);

      // P-side fixed Boron ions (B^-)
      for (let c = 0; c < colsPerSide; c++) {
        const ix = padL + 18 + (c / (colsPerSide - 1)) * (junctionX - padL - 28);
        const inDepletion = ix >= depLeft && ix <= junctionX;
        ctx.fillStyle = inDepletion ? '#dc262622' : '#33415533';
        ctx.beginPath();
        ctx.arc(ix, iy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = inDepletion ? '#f87171' : '#64748b';
        ctx.lineWidth = inDepletion ? 1.5 : 1;
        ctx.stroke();

        ctx.fillStyle = inDepletion ? '#fca5a5' : '#94a3b8';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('−', ix - 2.5, iy + 3);
      }

      // N-side fixed Phosphorus ions (P^+)
      for (let c = 0; c < colsPerSide; c++) {
        const ix = junctionX + 12 + (c / (colsPerSide - 1)) * (padL + mainW - junctionX - 30);
        const inDepletion = ix <= depRight && ix >= junctionX;
        ctx.fillStyle = inDepletion ? '#0284c722' : '#33415533';
        ctx.beginPath();
        ctx.arc(ix, iy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = inDepletion ? '#38bdf8' : '#64748b';
        ctx.lineWidth = inDepletion ? 1.5 : 1;
        ctx.stroke();

        ctx.fillStyle = inDepletion ? '#bae6fd' : '#94a3b8';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('+', ix - 2.5, iy + 3);
      }
    }

    // Mobile Charge Carriers (Holes & Electrons)
    const jitter = (tempK / 300) * 1.5;
    const isForward = vBias > 0.4;
    const isReverse = vBias < -0.1;
    const numCarriers = 16;

    // Mobile holes (h+) in P region
    ctx.fillStyle = '#f43f5e';
    for (let i = 0; i < numCarriers; i++) {
      let xOffset = 0;
      if (isForward) {
        xOffset = ((t * 40 * (vBias / 0.7) + i * 18) % (mainW - 30)) + padL + 12;
      } else {
        const baseX = padL + 16 + (i / numCarriers) * (depLeft - padL - 22);
        const pull = isReverse ? -Math.min(15, -vBias * 4) : 0;
        xOffset = baseX + pull + Math.sin(t * 4 + i) * jitter;
      }
      const yOffset = crystalY + 24 + ((i * 17) % (crystalH - 44)) + Math.cos(t * 3 + i) * jitter;

      if (xOffset > padL + 8 && xOffset < padL + mainW - 8) {
        ctx.beginPath();
        ctx.arc(xOffset, yOffset, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Mobile electrons (e-) in N region
    ctx.fillStyle = '#06b6d4';
    for (let i = 0; i < numCarriers; i++) {
      let xOffset = 0;
      if (isForward) {
        xOffset = padL + mainW - 12 - ((t * 40 * (vBias / 0.7) + i * 18) % (mainW - 30));
      } else {
        const baseX = depRight + 8 + (i / numCarriers) * (padL + mainW - depRight - 20);
        const pull = isReverse ? Math.min(15, -vBias * 4) : 0;
        xOffset = baseX + pull + Math.cos(t * 4 + i) * jitter;
      }
      const yOffset = crystalY + 24 + ((i * 19) % (crystalH - 44)) + Math.sin(t * 3 + i) * jitter;

      if (xOffset > padL + 8 && xOffset < padL + mainW - 8) {
        ctx.beginPath();
        ctx.arc(xOffset, yOffset, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Depletion Zone Dimension line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    const dimY = crystalY + crystalH - 12;
    ctx.beginPath();
    ctx.moveTo(depLeft, dimY);
    ctx.lineTo(depRight, dimY);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(depLeft, dimY);
    ctx.lineTo(depLeft + 4, dimY - 3);
    ctx.lineTo(depLeft + 4, dimY + 3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(depRight, dimY);
    ctx.lineTo(depRight - 4, dimY - 3);
    ctx.lineTo(depRight - 4, dimY + 3);
    ctx.fill();

    ctx.font = 'bold 8.5px monospace';
    ctx.fillText(`W = ${physics.W_um.toFixed(2)} µm`, junctionX - 25, dimY - 4);

    // Electric field arrow in depletion region (points N to P)
    const eFieldY = crystalY + 22;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(depRight - 4, eFieldY);
    ctx.lineTo(depLeft + 4, eFieldY);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(depLeft + 4, eFieldY);
    ctx.lineTo(depLeft + 9, eFieldY - 3);
    ctx.lineTo(depLeft + 9, eFieldY + 3);
    ctx.fill();

    ctx.font = 'bold 8px monospace';
    ctx.fillText('E-field (N→P)', junctionX - 26, eFieldY - 3);

    // Avalanche breakdown sparks
    if (physics.isBreakdown) {
      ctx.strokeStyle = '#f87171';
      ctx.lineWidth = 2;
      for (let s = 0; s < 4; s++) {
        const sx = depLeft + Math.random() * baseWpx;
        const sy = crystalY + 20 + Math.random() * (crystalH - 40);
        ctx.beginPath();
        ctx.moveTo(sx - 8, sy - 6);
        ctx.lineTo(sx, sy);
        ctx.lineTo(sx + 8, sy + 6);
        ctx.stroke();
      }
    }

    // --- BOTTOM SECTION: ENERGY BAND DIAGRAM ---
    const bandY = crystalY + crystalH + 10;
    const bandH = mainH - (crystalH + 18);
    ctx.fillStyle = '#060913';
    ctx.fillRect(padL + 2, bandY, mainW - 4, bandH);

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('ENERGY BAND DIAGRAM & POTENTIAL BARRIER q(Vbi - V)', padL + 10, bandY + 14);

    const barrierStep = Math.max(4, Math.min(bandH - 28, (physics.barrierHeight / 0.8) * (bandH * 0.42)));
    const pBandEc = bandY + 26;
    const nBandEc = pBandEc + barrierStep;

    // Conduction Band Ec(x)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL + 10, pBandEc);
    ctx.lineTo(depLeft, pBandEc);
    ctx.bezierCurveTo(
      junctionX - baseWpx * 0.2,
      pBandEc,
      junctionX + baseWpx * 0.2,
      nBandEc,
      depRight,
      nBandEc
    );
    ctx.lineTo(padL + mainW - 10, nBandEc);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('Ec (Conduction)', padL + mainW - 80, nBandEc - 4);

    // Valence Band Ev(x)
    const egPx = 18;
    const pBandEv = pBandEc + egPx;
    const nBandEv = nBandEc + egPx;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL + 10, pBandEv);
    ctx.lineTo(depLeft, pBandEv);
    ctx.bezierCurveTo(
      junctionX - baseWpx * 0.2,
      pBandEv,
      junctionX + baseWpx * 0.2,
      nBandEv,
      depRight,
      nBandEv
    );
    ctx.lineTo(padL + mainW - 10, nBandEv);
    ctx.stroke();

    ctx.fillStyle = '#f43f5e';
    ctx.fillText('Ev (Valence)', padL + mainW - 65, nBandEv + 10);

    // Barrier Height readout
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 8.5px monospace';
    ctx.fillText(`Barrier: ${physics.barrierHeight.toFixed(2)} eV`, junctionX - 35, bandY + bandH - 6);

    // --- 2. RIGHT PANEL: IV CHARACTERISTIC & OPERATING Q-POINT ---
    if (!isMobile) {
      ctx.fillStyle = '#0a0f1d';
      ctx.strokeStyle = '#1e293b';
      ctx.fillRect(hudL, 34, hudW, hudH);
      ctx.strokeRect(hudL, 34, hudW, hudH);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('I-V CHARACTERISTIC & Q-POINT', hudL + 10, 50);

      const gX = hudL + 24;
      const gY = 62;
      const gW = hudW - 36;
      const gH = Math.min(130, hudH - 120);

      ctx.fillStyle = '#060a12';
      ctx.strokeStyle = '#334155';
      ctx.fillRect(gX, gY, gW, gH);
      ctx.strokeRect(gX, gY, gW, gH);

      const zeroVx = gX + (5.0 / 5.8) * gW;
      const zeroIy = gY + (50 / 80) * gH;

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(zeroVx, gY);
      ctx.lineTo(zeroVx, gY + gH);
      ctx.moveTo(gX, zeroIy);
      ctx.lineTo(gX + gW, zeroIy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '7.5px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText('-5V', gX + 2, zeroIy - 3);
      ctx.fillText('0V', zeroVx - 5, gY + gH - 3);
      ctx.fillText('+0.8V', gX + gW - 24, zeroIy - 3);

      // Plot IV curve
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      for (let px = 0; px <= gW; px += 2) {
        const v = -5.0 + (px / gW) * 5.8;
        let cur = 0;
        if (v <= -4.4) {
          cur = -0.035 * Math.exp((-v - 4.4) / 0.12);
        } else {
          cur = 1e-6 * (Math.exp(Math.min(25, v / (1.25 * physics.Vt))) - 1);
        }
        const clampedCur = Math.max(-0.03, Math.min(0.05, cur));
        const py = gY + gH - ((clampedCur - -0.03) / 0.08) * gH;
        if (px === 0) ctx.moveTo(gX + px, py);
        else ctx.lineTo(gX + px, py);
      }
      ctx.stroke();

      // Operating Q-Point
      const qPx = gX + ((vBias - -5.0) / 5.8) * gW;
      const clampedCurQ = Math.max(-0.03, Math.min(0.05, physics.current));
      const qPy = gY + gH - ((clampedCurQ - -0.03) / 0.08) * gH;

      const pulse = Math.sin(t * 6) * 2;
      ctx.strokeStyle = physics.isBreakdown ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(qPx, qPy, 6 + pulse, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = physics.isBreakdown ? '#ef4444' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(qPx, qPy, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Telemetry readouts
      const metaY = gY + gH + 16;
      ctx.font = 'bold 8.5px monospace';

      ctx.fillStyle = '#94a3b8';
      ctx.fillText('BIAS VOLTAGE:', hudL + 12, metaY);
      ctx.fillStyle = vBias >= 0 ? '#34d399' : '#f87171';
      ctx.fillText(`${vBias >= 0 ? '+' : ''}${vBias.toFixed(2)} V`, hudL + 110, metaY);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText('DIODE CURRENT:', hudL + 12, metaY + 15);
      ctx.fillStyle = physics.isBreakdown ? '#ef4444' : '#38bdf8';
      let iStr = '0.0 pA';
      const absI = Math.abs(physics.current);
      if (absI < 1e-9) iStr = `${(physics.current * 1e12).toFixed(1)} pA`;
      else if (absI < 1e-6) iStr = `${(physics.current * 1e9).toFixed(1)} nA`;
      else if (absI < 1e-3) iStr = `${(physics.current * 1e6).toFixed(1)} µA`;
      else iStr = `${(physics.current * 1e3).toFixed(2)} mA`;
      ctx.fillText(iStr, hudL + 110, metaY + 15);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText('BUILT-IN Vbi:', hudL + 12, metaY + 30);
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`${physics.Vbi.toFixed(2)} V`, hudL + 110, metaY + 30);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText('THERMAL Vt (kT/q):', hudL + 12, metaY + 45);
      ctx.fillStyle = '#a78bfa';
      ctx.fillText(`${(physics.Vt * 1000).toFixed(1)} mV`, hudL + 110, metaY + 45);

      ctx.fillStyle = '#94a3b8';
      ctx.fillText('DEPLETION W:', hudL + 12, metaY + 60);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${physics.W_um.toFixed(2)} µm`, hudL + 110, metaY + 60);

      const badgeY = metaY + 76;
      ctx.fillStyle = physics.isBreakdown
        ? '#450a0a'
        : vBias > 0.5
        ? '#064e3b'
        : '#1e293b';
      ctx.strokeStyle = physics.isBreakdown
        ? '#ef4444'
        : vBias > 0.5
        ? '#10b981'
        : '#475569';
      ctx.fillRect(hudL + 10, badgeY, hudW - 20, 20);
      ctx.strokeRect(hudL + 10, badgeY, hudW - 20, 20);

      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = physics.isBreakdown ? '#fca5a5' : vBias > 0.5 ? '#6ee7b7' : '#94a3b8';
      ctx.fillText(
        physics.isBreakdown
          ? 'AVALANCHE BREAKDOWN'
          : vBias > 0.5
          ? 'FORWARD DIFFUSION FLOOD'
          : vBias < -0.05
          ? 'REVERSE BLOCKING'
          : 'EQUILIBRIUM (J = 0)',
        hudL + 16,
        badgeY + 13
      );
    }

    ctx.restore();
  };

  const renderSuperscalarPipeline = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    stageSlots: {
      if: PipelineInstruction | null;
      id: PipelineInstruction | null;
      ex: PipelineInstruction | null;
      mem: PipelineInstruction | null;
      wb: PipelineInstruction | null;
    },
    forwardingEnabled: boolean,
    cycles: number,
    committed: number,
    cpi: number,
    hazardMsg: string,
    flushAnim: number,
    t: number
  ) => {
    ctx.save();
    const isMobile = w < 640;
    const isCompact = w < 460;

    // Header Title
    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 10px monospace' : 'bold 12px monospace';
    ctx.fillText(
      isCompact
        ? 'RISC-V 5-STAGE PIPELINE'
        : 'RISC-V 5-STAGE SUPERSCALAR PIPELINE: HAZARD MITIGATION & SPECULATIVE FLUSH',
      isMobile ? 12 : 24,
      24
    );

    const padL = isMobile ? 8 : 20;
    const availW = w - padL * 2;
    const stageKeys: (keyof typeof stageSlots)[] = ['if', 'id', 'ex', 'mem', 'wb'];
    const stageLabels = [
      { tag: 'IF', name: 'FETCH', desc: 'PC & I-Cache' },
      { tag: 'ID', name: 'DECODE', desc: 'RegFile & Hazard' },
      { tag: 'EX', name: 'EXEC', desc: 'ALU & Branch' },
      { tag: 'MEM', name: 'MEMORY', desc: 'D-Cache / RAM' },
      { tag: 'WB', name: 'WRITE', desc: 'Commit R[rd]' },
    ];
    const stageColors = ['#0284c7', '#0d9488', '#16a34a', '#d97706', '#9333ea'];

    const numStages = 5;
    const gap = isMobile ? 4 : 8;
    const stageW = (availW - gap * (numStages - 1)) / numStages;
    const stageY = 40;
    const stageH = isMobile ? 130 : 155;

    // 1. Draw 5 Stage Blocks
    for (let i = 0; i < numStages; i++) {
      const key = stageKeys[i];
      const info = stageLabels[i];
      const color = stageColors[i];
      const sx = padL + i * (stageW + gap);
      const inst = stageSlots[key];

      // Stage Container Box
      ctx.fillStyle = '#0a0f1d';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.fillRect(sx, stageY, stageW, stageH);
      ctx.strokeRect(sx, stageY, stageW, stageH);

      // Stage Header Badge
      ctx.fillStyle = color + '22';
      ctx.fillRect(sx, stageY, stageW, 26);
      ctx.fillStyle = color;
      ctx.font = isCompact ? 'bold 9px monospace' : 'bold 10px monospace';
      ctx.fillText(`${info.tag}: ${info.name}`, sx + 6, stageY + 16);

      ctx.fillStyle = '#64748b';
      ctx.font = '7.5px monospace';
      ctx.fillText(info.desc, sx + 6, stageY + 38);

      // Instruction Packet Card inside stage
      const cardY = stageY + 48;
      const cardH = stageH - 56;
      const cardW = stageW - 10;
      const cardX = sx + 5;

      if (inst) {
        if (inst.isBubble) {
          ctx.fillStyle = '#450a0a';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.fillRect(cardX, cardY, cardW, cardH);
          ctx.strokeRect(cardX, cardY, cardW, cardH);

          ctx.fillStyle = '#fca5a5';
          ctx.font = isCompact ? 'bold 7.5px monospace' : 'bold 8.5px monospace';
          ctx.fillText('STALL BUBBLE', cardX + 4, cardY + 16);
          ctx.fillStyle = '#f87171';
          ctx.font = '7.5px monospace';
          ctx.fillText('RAW Hazard Hold', cardX + 4, cardY + 28);
          ctx.fillText('Freezing Pipeline', cardX + 4, cardY + 40);
        } else if (inst.isFlushed) {
          ctx.fillStyle = '#3f1d24';
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1.5;
          ctx.fillRect(cardX, cardY, cardW, cardH);
          ctx.strokeRect(cardX, cardY, cardW, cardH);

          ctx.fillStyle = '#fda4af';
          ctx.font = isCompact ? 'bold 7.5px monospace' : 'bold 8.5px monospace';
          ctx.fillText('FLUSH (NOP)', cardX + 4, cardY + 16);
          ctx.fillStyle = '#fb7185';
          ctx.font = '7.5px monospace';
          ctx.fillText('Speculative Kill', cardX + 4, cardY + 28);
        } else {
          ctx.fillStyle = inst.color + '18';
          ctx.strokeStyle = inst.color;
          ctx.lineWidth = 1.5;
          ctx.fillRect(cardX, cardY, cardW, cardH);
          ctx.strokeRect(cardX, cardY, cardW, cardH);

          ctx.fillStyle = inst.color;
          ctx.fillRect(cardX + 4, cardY + 5, 26, 12);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7.5px monospace';
          ctx.fillText(inst.badge, cardX + 6, cardY + 14);

          ctx.fillStyle = '#ffffff';
          ctx.font = isCompact ? 'bold 7.5px monospace' : 'bold 8.5px monospace';
          ctx.fillText(inst.mnemonic, cardX + 4, cardY + 30);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '7.5px monospace';
          if (inst.dest) {
            ctx.fillText(`Dest: ${inst.dest}`, cardX + 4, cardY + 43);
          }
          if (inst.src1) {
            ctx.fillText(`Src: ${inst.src1}${inst.src2 ? `, ${inst.src2}` : ''}`, cardX + 4, cardY + 54);
          }
        }
      } else {
        ctx.strokeStyle = '#1e293b';
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(cardX, cardY, cardW, cardH);
        ctx.setLineDash([]);
        ctx.fillStyle = '#334155';
        ctx.font = '8px monospace';
        ctx.fillText('IDLE (NOP)', cardX + 8, cardY + cardH / 2);
      }

      // Inter-stage pipeline latch registers
      if (i < numStages - 1) {
        const latchX = sx + stageW + gap / 2;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(latchX, stageY + 10);
        ctx.lineTo(latchX, stageY + stageH - 10);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(latchX, stageY + stageH / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Data Forwarding Bypass Buses
    const bypassY = stageY + stageH + 16;
    const exStageX = padL + 2 * (stageW + gap) + stageW / 2;
    const memStageX = padL + 3 * (stageW + gap) + stageW / 2;
    const wbStageX = padL + 4 * (stageW + gap) + stageW / 2;

    if (forwardingEnabled) {
      // EX -> EX Forwarding Bypass
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(memStageX, stageY + stageH);
      ctx.bezierCurveTo(
        memStageX,
        bypassY + 8,
        exStageX + 15,
        bypassY + 8,
        exStageX + 15,
        stageY + stageH
      );
      ctx.stroke();

      // MEM -> EX Forwarding Bypass
      ctx.strokeStyle = '#06b6d4';
      ctx.beginPath();
      ctx.moveTo(wbStageX, stageY + stageH);
      ctx.bezierCurveTo(
        wbStageX,
        bypassY + 22,
        exStageX - 15,
        bypassY + 22,
        exStageX - 15,
        stageY + stageH
      );
      ctx.stroke();

      // Animated traveling pulse
      const pulseT = (t * 2) % 1;
      const pulseX = memStageX - pulseT * (memStageX - exStageX);
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(pulseX, bypassY + 8, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('◄ EX->EX & MEM->EX BYPASS BUS (0-CYCLE HAZARD RESOLUTION)', padL + 6, bypassY + 16);
    } else {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(memStageX, stageY + stageH);
      ctx.lineTo(exStageX, bypassY + 12);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 8.5px monospace';
      ctx.fillText('✕ FORWARDING DISABLED: RAW HAZARDS REQUIRE 2 STALL BUBBLES', padL + 6, bypassY + 16);
    }

    // 3. Branch Misprediction Flush Overlay
    if (flushAnim > 0) {
      const flushW = (stageW + gap) * 2;
      ctx.fillStyle = '#ef444428';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.fillRect(padL, stageY, flushW, stageH);
      ctx.strokeRect(padL, stageY, flushW, stageH);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('⚠ BRANCH MISPREDICTION FLUSH ⚠', padL + 12, stageY + stageH / 2);
    }

    // 4. Telemetry Bar at bottom
    const teleY = h - 22;
    ctx.fillStyle = '#060a12';
    ctx.strokeStyle = '#1e293b';
    ctx.fillRect(padL, teleY - 14, availW, 26);
    ctx.strokeRect(padL, teleY - 14, availW, 26);

    ctx.font = isCompact ? 'bold 8px monospace' : 'bold 9px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`CLK:`, padL + 8, teleY + 3);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${cycles}`, padL + 36, teleY + 3);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`RETIRED:`, padL + 80, teleY + 3);
    ctx.fillStyle = '#34d399';
    ctx.fillText(`${committed}`, padL + 140, teleY + 3);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`CPI:`, padL + 180, teleY + 3);
    ctx.fillStyle = cpi > 1.3 ? '#f87171' : '#fbbf24';
    ctx.fillText(`${cpi.toFixed(2)}`, padL + 210, teleY + 3);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`STATUS:`, padL + 250, teleY + 3);
    ctx.fillStyle = hazardMsg.includes('⚠') ? '#ef4444' : hazardMsg.includes('Bypass') ? '#34d399' : '#cbd5e1';
    ctx.fillText(hazardMsg, padL + 305, teleY + 3);

    ctx.restore();
  };

  // ========================================================
  // RENDER STATION 10: QUANTUM TUNNELING & FLASH FLOATING GATE
  // ========================================================
  const renderQuantumTunneling = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    dNm: number,
    energyEv: number,
    physics: {
      kappa: number;
      transProb: number;
      effectiveVth: number;
      deltaVth: number;
      numLevels: number;
      activeLevel: number;
    },
    isPulse: boolean,
    cellType: 'slc' | 'mlc' | 'tlc' | 'qlc',
    t: number
  ) => {
    ctx.save();
    const isMobile = w < 640;
    const isCompact = w < 460;

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 9px monospace' : 'bold 12px monospace';
    ctx.fillText(
      isCompact
        ? 'QUANTUM TUNNELING & FLASH'
        : 'QUANTUM TUNNELING BARRIER & FLASH FLOATING GATE (FOWLER-NORDHEIM)',
      isMobile ? 12 : 24,
      24
    );

    const padL = isMobile ? 12 : 24;
    const availW = w - padL * 2;
    const midX = padL + availW * 0.52;

    const leftW = isMobile ? availW : availW * 0.48;
    const boxY = 42;
    const boxH = h - 75;

    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = '#1e293b';
    ctx.fillRect(padL, boxY, leftW, boxH);
    ctx.strokeRect(padL, boxY, leftW, boxH);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('1. SCHRÖDINGER WAVEPACKET TUNNELING', padL + 8, boxY + 16);

    const bCenter = padL + leftW * 0.55;
    const bWidthPx = Math.max(16, Math.min(60, dNm * 8));
    const bLeft = bCenter - bWidthPx / 2;
    const bRight = bCenter + bWidthPx / 2;
    const bTop = boxY + 45;
    const bBottom = boxY + boxH - 25;

    ctx.fillStyle = isPulse ? 'rgba(239, 68, 68, 0.35)' : 'rgba(56, 189, 248, 0.15)';
    ctx.strokeStyle = isPulse ? '#ef4444' : '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(bLeft, bTop, bWidthPx, bBottom - bTop);
    ctx.strokeRect(bLeft, bTop, bWidthPx, bBottom - bTop);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SiO2 Barrier (V0 = 3.2 eV)', bCenter, bTop - 6);
    ctx.fillText(`Width d = ${dNm.toFixed(1)} nm`, bCenter, bBottom + 14);

    const eLevelY = bBottom - (energyEv / 3.2) * (bBottom - bTop);
    ctx.strokeStyle = '#fbbf24';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padL + 10, eLevelY);
    ctx.lineTo(padL + leftW - 10, eLevelY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fbbf24';
    ctx.font = '8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`E = ${energyEv.toFixed(1)} eV`, padL + 12, eLevelY - 4);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const k = 0.25;
    const omega = 3.5;
    const amp = (bBottom - bTop) * 0.22;

    for (let x = padL + 10; x < bLeft; x += 2) {
      const relX = x - padL;
      const yWave = eLevelY - Math.sin(k * relX - t * omega) * amp;
      if (x === padL + 10) ctx.moveTo(x, yWave);
      else ctx.lineTo(x, yWave);
    }
    ctx.stroke();

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const startY = eLevelY - Math.sin(k * (bLeft - padL) - t * omega) * amp;
    ctx.moveTo(bLeft, startY);

    const decayFraction = Math.max(0.04, Math.exp(-physics.kappa * (dNm * 0.35)));
    const endY = eLevelY - Math.sin(k * (bLeft - padL) - t * omega) * amp * decayFraction;
    ctx.quadraticCurveTo(bCenter, eLevelY, bRight, endY);
    ctx.stroke();

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    const transAmp = amp * Math.max(0.12, Math.sqrt(physics.transProb) * 2.5);
    ctx.moveTo(bRight, endY);
    for (let x = bRight; x < padL + leftW - 10; x += 2) {
      const relX = x - bRight;
      const yWave = eLevelY - Math.sin(k * relX - t * omega) * transAmp;
      ctx.lineTo(x, yWave);
    }
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Tunneling Prob T: ${physics.transProb.toExponential(2)}`, padL + 12, boxY + boxH - 10);

    if (!isMobile) {
      const rightW = availW - leftW - 16;
      const rightX = midX + 8;

      ctx.fillStyle = '#0a0f1d';
      ctx.strokeStyle = '#1e293b';
      ctx.fillRect(rightX, boxY, rightW, boxH);
      ctx.strokeRect(rightX, boxY, rightW, boxH);

      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('2. NAND FLASH FLOATING GATE CHARGE CELL', rightX + 8, boxY + 16);

      const cellY = boxY + 30;
      const cellW = rightW - 24;
      const cellLeft = rightX + 12;

      ctx.fillStyle = '#334155';
      ctx.fillRect(cellLeft, cellY, cellW, 16);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Control Gate (CG)', cellLeft + cellW / 2, cellY + 11);

      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fillRect(cellLeft, cellY + 18, cellW, 6);

      ctx.fillStyle = isPulse ? '#dc2626' : '#6366f1';
      ctx.fillRect(cellLeft, cellY + 26, cellW, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText(`Floating Gate [${trappedElectrons} e⁻ Trapped]`, cellLeft + cellW / 2, cellY + 38);

      const numDots = Math.min(40, Math.floor(trappedElectrons / 10));
      for (let i = 0; i < numDots; i++) {
        const dx = cellLeft + 8 + ((i * 19) % (cellW - 16));
        const dy = cellY + 29 + ((i * 7) % 12);
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(dx, dy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isPulse ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(cellLeft, cellY + 46, cellW, 8);

      if (isPulse) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        for (let sp = 0; sp < 4; sp++) {
          const sx = cellLeft + cellW * 0.2 + sp * (cellW * 0.2);
          ctx.beginPath();
          ctx.moveTo(sx, cellY + 46);
          ctx.lineTo(sx - 3, cellY + 50);
          ctx.lineTo(sx + 3, cellY + 52);
          ctx.lineTo(sx, cellY + 54);
          ctx.stroke();
        }
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cellLeft, cellY + 56, cellW, 20);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px monospace';
      ctx.fillText('P-type Silicon Substrate (Inversion Channel)', cellLeft + cellW / 2, cellY + 70);

      const histY = cellY + 86;
      const histH = boxH - 120;
      ctx.fillStyle = '#060a12';
      ctx.fillRect(cellLeft, histY, cellW, histH);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(cellLeft, histY, cellW, histH);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${cellType.toUpperCase()} Voltage Distribution Histograms (${physics.numLevels} States):`, cellLeft + 6, histY + 12);

      const nLevels = physics.numLevels;
      const peakSpacing = (cellW - 20) / nLevels;
      for (let lvl = 0; lvl < nLevels; lvl++) {
        const px = cellLeft + 12 + lvl * peakSpacing;
        const isActive = lvl === physics.activeLevel;
        ctx.strokeStyle = isActive ? '#34d399' : '#64748b';
        ctx.fillStyle = isActive ? 'rgba(52, 211, 153, 0.25)' : 'rgba(100, 116, 139, 0.1)';
        ctx.lineWidth = isActive ? 2 : 1;

        ctx.beginPath();
        for (let bx = -12; bx <= 12; bx += 2) {
          const by = Math.exp(-((bx / 5) ** 2)) * (histH - 28);
          const drawX = px + bx;
          const drawY = histY + histH - 4 - by;
          if (bx === -12) ctx.moveTo(drawX, drawY);
          else ctx.lineTo(drawX, drawY);
        }
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = isActive ? '#34d399' : '#64748b';
        ctx.font = '7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`L${lvl}`, px, histY + histH - 6);
      }

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Vth: ${physics.effectiveVth.toFixed(2)}V (ΔVth = +${physics.deltaVth.toFixed(2)}V)`, cellLeft + cellW - 6, histY + 12);
    }

    ctx.restore();
  };

  // ========================================================
  // RENDER STATION 11: 2D SYSTOLIC ARRAY MATRIX ENGINE
  // ========================================================
  const renderSystolicArray = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    cycle: number,
    weights: number[][],
    inputs: number[][],
    mode: 'weight_stationary' | 'output_stationary',
    t: number
  ) => {
    ctx.save();
    const isMobile = w < 640;
    const isCompact = w < 460;

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 9px monospace' : 'bold 12px monospace';
    ctx.fillText(
      isCompact
        ? 'TPU 2D SYSTOLIC ARRAY ENGINE'
        : '2D SYSTOLIC ARRAY MATRIX MULTIPLICATION (GOOGLE TPU v1 DATAFLOW)',
      isMobile ? 12 : 24,
      24
    );

    const padL = isMobile ? 12 : 24;
    const availW = w - padL * 2;
    const boxY = 42;
    const boxH = h - 68;

    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = '#1e293b';
    ctx.fillRect(padL, boxY, availW, boxH);
    ctx.strokeRect(padL, boxY, availW, boxH);

    const gridDim = 3;
    const cellSize = isMobile ? 52 : 68;
    const cellGap = isMobile ? 16 : 24;
    const totalGridW = gridDim * cellSize + (gridDim - 1) * cellGap;
    const startX = padL + (availW * 0.5) - totalGridW / 2 + 10;
    const startY = boxY + (boxH * 0.5) - totalGridW / 2 + 4;

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`DATAFLOW: ${mode.toUpperCase().replace('_', ' ')} | CLK CYCLE: ${cycle}/9`, padL + 12, boxY + 18);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Arithmetic Intensity: 2.0 FLOPs/Byte (Zero Bus Stalls)', padL + availW - 12, boxY + 18);

    // Compute expected true matrix product C = inputs * weights
    const matC = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    for (let i = 0; i < 3; i++) {
      for (let c = 0; c < 3; c++) {
        for (let r = 0; r < 3; r++) {
          matC[i][c] += inputs[i][r] * weights[r][c];
        }
      }
    }

    // Top Input Accumulator Ports (Column Entry Ports)
    for (let c = 0; c < gridDim; c++) {
      const topPeX = startX + c * (cellSize + cellGap);
      const topPeY = startY;
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(topPeX + cellSize / 2, topPeY - 24);
      ctx.lineTo(topPeX + cellSize / 2, topPeY);
      ctx.stroke();

      // Top arrow
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.moveTo(topPeX + cellSize / 2, topPeY);
      ctx.lineTo(topPeX + cellSize / 2 - 3, topPeY - 5);
      ctx.lineTo(topPeX + cellSize / 2 + 3, topPeY - 5);
      ctx.fill();

      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Y₀=0', topPeX + cellSize / 2, topPeY - 26);
    }

    for (let r = 0; r < gridDim; r++) {
      for (let c = 0; c < gridDim; c++) {
        const peX = startX + c * (cellSize + cellGap);
        const peY = startY + r * (cellSize + cellGap);
        const arrivalCycle = r + c;
        const activeVecIdx = cycle - arrivalCycle;
        const isActiveNow = activeVecIdx >= 0 && activeVecIdx < 3;
        const isDone = activeVecIdx >= 3;

        // 1. Horizontal Left Entry on Column 0
        if (c === 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(peX - 38, peY + cellSize / 2);
          ctx.lineTo(peX, peY + cellSize / 2);
          ctx.stroke();

          // Left entry arrow head
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(peX, peY + cellSize / 2);
          ctx.lineTo(peX - 5, peY + cellSize / 2 - 3);
          ctx.lineTo(peX - 5, peY + cellSize / 2 + 3);
          ctx.fill();

          const curVecIdx = cycle - r;
          const inVal = curVecIdx >= 0 && curVecIdx < 3 ? inputs[curVecIdx][r] : 0;
          ctx.fillStyle = inVal > 0 ? '#38bdf8' : '#475569';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'right';
          const label = curVecIdx >= 0 && curVecIdx < 3 ? `A[${curVecIdx},${r}]=${inVal}` : `A[-,${r}]=0`;
          ctx.fillText(label, peX - 8, peY + cellSize / 2 - 4);
        }

        // 2. Horizontal Inter-PE Bus
        if (c < gridDim - 1) {
          ctx.strokeStyle = isActiveNow ? '#38bdf8' : '#334155';
          ctx.lineWidth = isActiveNow ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(peX + cellSize, peY + cellSize / 2);
          ctx.lineTo(peX + cellSize + cellGap, peY + cellSize / 2);
          ctx.stroke();
        }

        // 3. Vertical Inter-PE / Output Bus
        if (r < gridDim - 1) {
          ctx.strokeStyle = isActiveNow ? '#34d399' : '#334155';
          ctx.lineWidth = isActiveNow ? 2 : 1;
          ctx.beginPath();
          ctx.moveTo(peX + cellSize / 2, peY + cellSize);
          ctx.lineTo(peX + cellSize / 2, peY + cellSize + cellGap);
          ctx.stroke();
        } else {
          // Bottom Output Port from row 2
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(peX + cellSize / 2, peY + cellSize);
          ctx.lineTo(peX + cellSize / 2, peY + cellSize + 22);
          ctx.stroke();

          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.moveTo(peX + cellSize / 2, peY + cellSize + 22);
          ctx.lineTo(peX + cellSize / 2 - 3, peY + cellSize + 17);
          ctx.lineTo(peX + cellSize / 2 + 3, peY + cellSize + 17);
          ctx.fill();

          // Output completed dot product result
          const outVecIdx = cycle - (2 + c + 1);
          if (outVecIdx >= 0 && outVecIdx < 3) {
            const outVal = matC[outVecIdx][c];
            ctx.fillStyle = '#facc15';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`C[${outVecIdx},${c}]=${outVal}`, peX + cellSize / 2, peY + cellSize + 32);
          }
        }

        // PE Box Background
        ctx.fillStyle = isActiveNow
          ? 'rgba(56, 189, 248, 0.22)'
          : isDone
          ? 'rgba(52, 211, 153, 0.15)'
          : '#111827';
        ctx.strokeStyle = isActiveNow ? '#38bdf8' : isDone ? '#34d399' : '#374151';
        ctx.lineWidth = isActiveNow ? 2 : 1;
        ctx.fillRect(peX, peY, cellSize, cellSize);
        ctx.strokeRect(peX, peY, cellSize, cellSize);

        // PE Cell Information
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`PE(${r},${c})`, peX + 4, peY + 11);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '8px monospace';
        ctx.fillText(`W: ${weights[r][c]}`, peX + 4, peY + 23);

        // Compute authentic accumulated partial sum for the most recent active vector
        let accumSum = 0;
        let lastVecCalculated = -1;
        for (let vi = 0; vi < 3; vi++) {
          const vecArrival = arrivalCycle + vi;
          if (cycle >= vecArrival) {
            lastVecCalculated = vi;
          }
        }

        if (lastVecCalculated >= 0) {
          for (let k = 0; k <= r; k++) {
            accumSum += inputs[lastVecCalculated][k] * weights[k][c];
          }
        }

        ctx.fillStyle = isActiveNow ? '#38bdf8' : isDone ? '#34d399' : '#64748b';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(
          lastVecCalculated >= 0 ? `Σ: ${accumSum} (v${lastVecCalculated})` : 'Σ: 0',
          peX + 4,
          peY + cellSize - 6
        );

        if (isActiveNow) {
          // Highlight active PE pulse
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(peX - 2, peY - 2, cellSize + 4, cellSize + 4);

          // Moving dot along horizontal bus
          const busProgress = (t * 4) % 1;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(peX + busProgress * cellSize, peY + cellSize / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  };

  // ========================================================
  // RENDER STATION 12: THERMODYNAMIC LANDAUER & REVERSIBLE
  // ========================================================
  const renderLandauerReversible = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    tempK: number,
    bitState: 0 | 1,
    isErasing: boolean,
    energyZJ: number,
    totalHeatZJ: number,
    erasureCount: number,
    gateType: 'fredkin' | 'toffoli',
    revInA: 0 | 1,
    revInB: 0 | 1,
    revInC: 0 | 1,
    revOutputs: { outA: number; outB: number; outC: number },
    t: number
  ) => {
    ctx.save();
    const isMobile = w < 640;
    const isCompact = w < 460;

    ctx.fillStyle = '#ffffff';
    ctx.font = isCompact ? 'bold 9px monospace' : 'bold 12px monospace';
    ctx.fillText(
      isCompact
        ? 'LANDAUER LIMIT & REVERSIBLE GATES'
        : 'THERMODYNAMIC LANDAUER LIMIT (kB·T·ln 2) & REVERSIBLE COMPUTATION (FREDKIN/TOFFOLI)',
      isMobile ? 12 : 24,
      24
    );

    const padL = isMobile ? 12 : 24;
    const availW = w - padL * 2;
    const boxY = 42;
    const boxH = h - 68;

    const leftW = isMobile ? availW : availW * 0.48;
    ctx.fillStyle = '#0a0f1d';
    ctx.strokeStyle = '#1e293b';
    ctx.fillRect(padL, boxY, leftW, boxH);
    ctx.strokeRect(padL, boxY, leftW, boxH);

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('1. IRREVERSIBLE BIT ERASURE & LANDAUER HEAT', padL + 8, boxY + 16);

    const wellCenterX = padL + leftW / 2;
    const wellCenterY = boxY + boxH * 0.62;
    const wellSpanX = leftW * 0.38;
    const barrierHeight = isErasing ? 8 : 45;

    ctx.strokeStyle = isErasing ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    for (let px = -wellSpanX; px <= wellSpanX; px += 2) {
      const normX = px / (wellSpanX * 0.65);
      const potY = barrierHeight * (1 - normX * normX) ** 2;
      const drawX = wellCenterX + px;
      const drawY = wellCenterY - potY;
      if (px === -wellSpanX) ctx.moveTo(drawX, drawY);
      else ctx.lineTo(drawX, drawY);
    }
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Well 0', wellCenterX - wellSpanX * 0.65, wellCenterY + 14);
    ctx.fillText('Well 1', wellCenterX + wellSpanX * 0.65, wellCenterY + 14);

    const thermalJitter = Math.sin(t * 12) * (tempK / 300) * 4;
    const particleX = bitState === 0
      ? wellCenterX - wellSpanX * 0.65 + thermalJitter
      : wellCenterX + wellSpanX * 0.65 + thermalJitter;
    const particleY = wellCenterY - (isErasing ? 8 : 0);

    ctx.fillStyle = isErasing ? '#ef4444' : '#facc15';
    ctx.beginPath();
    ctx.arc(particleX, particleY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (isErasing) {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      for (let ph = 0; ph < 5; ph++) {
        const phR = 10 + ph * 6 + ((t * 20) % 8);
        ctx.beginPath();
        ctx.arc(particleX, particleY, phR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Landauer Heat (kB·T·ln2): ${energyZJ.toFixed(2)} zJ / bit`, padL + 8, boxY + boxH - 24);
    ctx.fillText(`Total Dissipated: ${totalHeatZJ.toFixed(2)} zJ (${erasureCount} erasures)`, padL + 8, boxY + boxH - 10);

    if (!isMobile) {
      const rightX = padL + leftW + 16;
      const rightW = availW - leftW - 16;

      ctx.fillStyle = '#0a0f1d';
      ctx.strokeStyle = '#1e293b';
      ctx.fillRect(rightX, boxY, rightW, boxH);
      ctx.strokeRect(rightX, boxY, rightW, boxH);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`2. REVERSIBLE ${gateType.toUpperCase()} GATE (ZERO DISSIPATION)`, rightX + 8, boxY + 16);

      const lineSpacing = 28;
      const startLineY = boxY + 45;
      const inX = rightX + 24;
      const outX = rightX + rightW - 24;
      const gateCenterX = rightX + rightW / 2;

      const lines = [
        { label: 'A', inVal: revInA, outVal: revOutputs.outA, y: startLineY },
        { label: 'B', inVal: revInB, outVal: revOutputs.outB, y: startLineY + lineSpacing },
        { label: 'C', inVal: revInC, outVal: revOutputs.outC, y: startLineY + lineSpacing * 2 },
      ];

      lines.forEach((l) => {
        ctx.strokeStyle = l.inVal === 1 ? '#34d399' : '#475569';
        ctx.lineWidth = l.inVal === 1 ? 2.5 : 1.2;
        ctx.beginPath();
        ctx.moveTo(inX, l.y);
        ctx.lineTo(outX, l.y);
        ctx.stroke();

        ctx.fillStyle = l.inVal === 1 ? '#34d399' : '#94a3b8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${l.label}=${l.inVal}`, inX - 6, l.y + 3);

        ctx.fillStyle = l.outVal === 1 ? '#34d399' : '#94a3b8';
        ctx.textAlign = 'left';
        ctx.fillText(`${l.label}'=${l.outVal}`, outX + 6, l.y + 3);
      });

      ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.8;
      ctx.fillRect(gateCenterX - 18, startLineY - 8, 36, lineSpacing * 2 + 16);
      ctx.strokeRect(gateCenterX - 18, startLineY - 8, 36, lineSpacing * 2 + 16);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(gateType.toUpperCase(), gateCenterX, startLineY + lineSpacing);

      ctx.fillStyle = '#064e3b';
      ctx.fillRect(rightX + 8, boxY + boxH - 32, rightW - 16, 22);
      ctx.strokeStyle = '#059669';
      ctx.strokeRect(rightX + 8, boxY + boxH - 32, rightW - 16, 22);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BIJECTIVE MAPPING: ΔS_info = 0 ⇒ LANDAUER HEAT = 0.000 zJ', rightX + rightW / 2, boxY + boxH - 18);
    }

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

          <button
            onClick={() => {
              setStation('pn_junction');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              station === 'pn_junction'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 inline mr-1" />
            PN Junction Diode
          </button>

          <button
            onClick={() => {
              setStation('superscalar_pipeline');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              station === 'superscalar_pipeline'
                ? 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 inline mr-1" />
            RISC-V Superscalar Pipeline
          </button>

          <button
            onClick={() => {
              setStation('quantum_tunneling');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              station === 'quantum_tunneling'
                ? 'bg-sky-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 inline mr-1" />
            Quantum Tunneling & Flash
          </button>

          <button
            onClick={() => {
              setStation('systolic_array');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              station === 'systolic_array'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 inline mr-1" />
            TPU Systolic Array Engine
          </button>

          <button
            onClick={() => {
              setStation('landauer_reversible');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
              station === 'landauer_reversible'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'text-ink-400 hover:text-white hover:bg-ink-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 inline mr-1" />
            Landauer Limit & Reversible
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
      <div
        ref={containerRef}
        className={`w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-white/10 relative bg-black ${
          station === 'bistable_latch' ? 'touch-none cursor-ew-resize' : 'touch-pan-y'
        }`}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
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

      {station === 'pn_junction' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-mono">Bias Voltage:</span>
              <input
                type="range"
                min="-500"
                max="80"
                step="2"
                value={Math.round(pnVoltage * 100)}
                onChange={(e) => {
                  const val = parseInt(e.target.value) / 100;
                  setPnVoltage(val);
                  if (val <= -4.4) {
                    soundFX.playDiodeBreakdown();
                  } else if (val > 0.65) {
                    soundFX.playHarmonicResolution();
                  } else {
                    soundFX.playClockTick(400);
                  }
                }}
                className="w-28 sm:w-32 accent-cyan-500"
              />
              <span className="text-cyan-300 font-mono font-bold">
                {pnVoltage >= 0 ? '+' : ''}
                {pnVoltage.toFixed(2)} V
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-mono">Die Temp (T):</span>
              <input
                type="range"
                min="100"
                max="450"
                step="10"
                value={pnTempK}
                onChange={(e) => setPnTempK(parseInt(e.target.value))}
                className="w-20 sm:w-24 accent-amber-500"
              />
              <span className="text-amber-400 font-mono font-bold">{pnTempK} K</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => {
                  setPnVoltage(-5.0);
                  soundFX.playDiodeBreakdown();
                }}
                className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-600/50 rounded font-mono cursor-pointer"
              >
                Avalanche (-5V)
              </button>
              <button
                onClick={() => {
                  setPnVoltage(-2.5);
                  soundFX.playClockTick(300);
                }}
                className="px-2 py-0.5 bg-ink-800 hover:bg-ink-700 text-ink-300 rounded font-mono cursor-pointer"
              >
                Reverse (-2.5V)
              </button>
              <button
                onClick={() => {
                  setPnVoltage(0.0);
                  soundFX.playTap();
                }}
                className="px-2 py-0.5 bg-ink-800 hover:bg-ink-700 text-ink-300 rounded font-mono cursor-pointer"
              >
                Equilibrium (0V)
              </button>
              <button
                onClick={() => {
                  setPnVoltage(0.65);
                  soundFX.playTap();
                }}
                className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-600/50 rounded font-mono cursor-pointer"
              >
                Knee (+0.65V)
              </button>
              <button
                onClick={() => {
                  setPnVoltage(0.78);
                  soundFX.playHarmonicResolution();
                }}
                className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-600/50 rounded font-mono cursor-pointer"
              >
                Forward Flood (+0.78V)
              </button>
            </div>
          </div>

          <div className="text-ink-300 font-mono text-xs">
            W = <strong className="text-cyan-300">{pnPhysics.W_um.toFixed(2)} µm</strong> | Vbi ={' '}
            <strong className="text-amber-300">{pnPhysics.Vbi.toFixed(2)} V</strong> | I ={' '}
            <strong className={pnPhysics.isBreakdown ? 'text-rose-400' : pnVoltage > 0.6 ? 'text-emerald-400' : 'text-ink-200'}>
              {formattedPnCurrent}
            </strong>
          </div>
        </div>
      )}

      {station === 'superscalar_pipeline' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => {
                stepPipelineClock();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg cursor-pointer"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>Step Clock Cycle</span>
            </button>

            <button
              onClick={() => {
                setPipelineAutoClock((prev) => !prev);
                soundFX.playTap();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono font-bold cursor-pointer transition-colors ${
                pipelineAutoClock
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-ink-800 hover:bg-ink-700 text-ink-300'
              }`}
            >
              {pipelineAutoClock ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{pipelineAutoClock ? 'Auto Clock: RUNNING' : 'Auto-Advance Clock'}</span>
            </button>

            <button
              onClick={() => {
                const nextVal = !dataForwarding;
                setDataForwarding(nextVal);
                soundFX.playLogicGateToggle(nextVal);
              }}
              className={`px-2.5 py-1.5 rounded-lg font-mono font-bold cursor-pointer transition-colors ${
                dataForwarding
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                  : 'bg-rose-950 text-rose-300 border border-rose-600/50'
              }`}
            >
              Forwarding Bypass: {dataForwarding ? 'ON (EX->EX, MEM->EX)' : 'OFF (2-Cycle Stalls)'}
            </button>

            <button
              onClick={() => {
                triggerBranchFlush();
              }}
              className="px-2.5 py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-600/50 rounded-lg font-mono font-bold cursor-pointer"
            >
              Branch Misprediction Flush
            </button>

            <button
              onClick={() => {
                resetPipeline();
              }}
              className="p-1.5 bg-ink-800 hover:bg-ink-700 text-ink-300 rounded-lg cursor-pointer"
              title="Reset Pipeline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-ink-300 font-mono text-xs">
            Cycle = <strong className="text-cyan-300">{cycleCount}</strong> | Committed ={' '}
            <strong className="text-emerald-300">{committedCount}</strong> | CPI ={' '}
            <strong className={currentCPI > 1.3 ? 'text-amber-400' : 'text-emerald-400'}>{currentCPI.toFixed(2)}</strong> | Stalls ={' '}
            <strong className={stallCount > 0 ? 'text-rose-400' : 'text-ink-400'}>{stallCount}</strong>
          </div>
        </div>
      )}

      {station === 'quantum_tunneling' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-mono text-[11px]">Barrier Oxide Width:</span>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.2"
                value={tunnelBarrierWidthNm}
                onChange={(e) => setTunnelBarrierWidthNm(parseFloat(e.target.value))}
                className="w-24 accent-sky-400 cursor-pointer"
              />
              <span className="font-mono font-bold text-sky-400 text-xs">{tunnelBarrierWidthNm.toFixed(1)} nm</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-mono text-[11px]">Electron Energy:</span>
              <input
                type="range"
                min="0.4"
                max="3.0"
                step="0.1"
                value={electronEnergyEv}
                onChange={(e) => setElectronEnergyEv(parseFloat(e.target.value))}
                className="w-20 accent-amber-400 cursor-pointer"
              />
              <span className="font-mono font-bold text-amber-400 text-xs">{electronEnergyEv.toFixed(1)} eV</span>
            </div>

            <div className="flex items-center gap-1 bg-ink-950 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
              {(['slc', 'mlc', 'tlc', 'qlc'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setFlashCellType(mode);
                    soundFX.playTap();
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer font-bold ${
                    flashCellType === mode ? 'bg-sky-500 text-ink-950' : 'text-ink-400 hover:text-white'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={triggerProgramPulse}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer text-xs font-mono"
            >
              ⚡ 18V Program Pulse (+e⁻)
            </button>

            <button
              onClick={triggerErasePulse}
              className="px-3 py-1 bg-ink-800 hover:bg-ink-700 text-ink-300 font-bold rounded-lg cursor-pointer text-xs font-mono"
            >
              ↺ Erase Pulse (-e⁻)
            </button>
          </div>

          <div className="text-ink-300 font-mono text-xs">
            P(Tunnel) = <strong className="text-emerald-400">{tunnelingPhysics.transProb.toExponential(2)}</strong> | Vth ={' '}
            <strong className="text-amber-300">{tunnelingPhysics.effectiveVth.toFixed(2)}V</strong>
          </div>
        </div>
      )}

      {station === 'systolic_array' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={stepSystolicClock}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg cursor-pointer"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>Step Systolic Clock</span>
            </button>

            <button
              onClick={() => {
                setSystolicAutoClock((prev) => !prev);
                soundFX.playTap();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono font-bold cursor-pointer transition-colors ${
                systolicAutoClock ? 'bg-emerald-600 text-white' : 'bg-ink-800 text-ink-300'
              }`}
            >
              {systolicAutoClock ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{systolicAutoClock ? 'Auto: RUNNING' : 'Auto Clock'}</span>
            </button>

            <button
              onClick={() => {
                setSystolicCycle(0);
                soundFX.playTap();
              }}
              className="p-1.5 bg-ink-800 hover:bg-ink-700 text-ink-300 rounded-lg cursor-pointer"
              title="Reset Systolic Wavefront"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <span className="text-ink-400 font-mono text-[11px]">
              Wavefront Diagonal: Row 0 @ t, Row 1 @ t+1, Row 2 @ t+2
            </span>
          </div>

          <div className="text-ink-300 font-mono text-xs">
            Cycle = <strong className="text-cyan-300">{systolicCycle}</strong>/9 | Intensity ={' '}
            <strong className="text-emerald-300">2.0 FLOPs/B</strong> (100% Data Reuse)
          </div>
        </div>
      )}

      {station === 'landauer_reversible' && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-ink-900/80 rounded-xl border border-white/10 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-ink-400 font-mono text-[11px]">Die Temp T:</span>
              <input
                type="range"
                min="4"
                max="450"
                step="5"
                value={landauerTempK}
                onChange={(e) => setLandauerTempK(parseInt(e.target.value))}
                className="w-24 accent-rose-400 cursor-pointer"
              />
              <span className="font-mono font-bold text-rose-400 text-xs">{landauerTempK} K</span>
            </div>

            <button
              onClick={triggerLandauerErasure}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer text-xs font-mono"
            >
              🔥 Erase Bit to 0 (Dissipate kB·T·ln2)
            </button>

            <button
              onClick={() => {
                setLandauerBitState(1);
                soundFX.playTap();
              }}
              className="px-2.5 py-1 bg-ink-800 hover:bg-ink-700 text-ink-300 rounded-lg font-mono text-xs cursor-pointer"
            >
              Set Bit = 1
            </button>

            <div className="flex items-center gap-1 bg-ink-950 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
              {(['fredkin', 'toffoli'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setReversibleGate(g);
                    soundFX.playTap();
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer font-bold ${
                    reversibleGate === g ? 'bg-emerald-500 text-ink-950' : 'text-ink-400 hover:text-white'
                  }`}
                >
                  {g.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Input toggles A, B, C */}
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <button
                onClick={() => {
                  setRevInputA((a) => (a === 1 ? 0 : 1));
                  soundFX.playTap();
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer font-bold ${
                  revInputA === 1 ? 'bg-emerald-600 text-white' : 'bg-ink-800 text-ink-400'
                }`}
              >
                A={revInputA}
              </button>
              <button
                onClick={() => {
                  setRevInputB((b) => (b === 1 ? 0 : 1));
                  soundFX.playTap();
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer font-bold ${
                  revInputB === 1 ? 'bg-emerald-600 text-white' : 'bg-ink-800 text-ink-400'
                }`}
              >
                B={revInputB}
              </button>
              <button
                onClick={() => {
                  setRevInputC((c) => (c === 1 ? 0 : 1));
                  soundFX.playTap();
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer font-bold ${
                  revInputC === 1 ? 'bg-emerald-600 text-white' : 'bg-ink-800 text-ink-400'
                }`}
              >
                C={revInputC}
              </button>
            </div>
          </div>

          <div className="text-ink-300 font-mono text-xs">
            Heat = <strong className="text-rose-400">{landauerEnergyZJ.toFixed(2)} zJ</strong>/bit | Total:{' '}
            <strong className="text-amber-300">{totalHeatDissipatedZJ.toFixed(2)} zJ</strong>
          </div>
        </div>
      )}
    </div>
  );
};
