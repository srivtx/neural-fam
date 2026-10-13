/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * WokwiProjectBuilder:
 * Production-grade interactive guided project builder workflow for all 8 physical computing experiments.
 * Features:
 * - Stage 1: "1. BOM & Power" - Interactive component inventory cards, datasheets, voltage ratings, current meters, and tools needed.
 * - Stage 2: "2. Wiring Sequence" - Interactive wiring sequencer with wire number, color badge, from/to pins, and engineering rationale.
 *   Controls: Previous Wire, Next Wire, Auto-Assemble All, Reset Wiring, and sync callback onWiringStepChange.
 * - Stage 3: "3. Netlist Table" - Searchable, filterable pin-to-pin wiring netlist table with copy-netlist button.
 * - Stage 4: "4. Pre-Flight" - Interactive checkboxes for hardware safety checks with "All Systems Go" verification banner.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Zap,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  FastForward,
  ArrowRight,
  Search,
  Wrench,
  ShieldCheck,
  Sparkles,
  Layers,
  Flame,
  Radar,
  Bot,
  Compass,
  Scale,
  ListTree,
  Activity,
  CheckSquare,
  Square,
  Radio,
  Gauge,
  X,
} from 'lucide-react';
import {
  WOKWI_PROJECT_GUIDES,
  WokwiProjectGuide,
  WiringStep,
  BOMComponent,
  NetlistEntry,
  PreFlightCheckItem,
  WireType,
} from '../data/wokwiProjectGuidesData';
import { ROBOTICS_EXPERIMENTS } from '../data/roboticsExperimentsData';
import { soundFX } from '../utils/audio';
import { copyTextToClipboard } from '../utils/clipboard';

export interface WokwiProjectBuilderProps {
  experimentId?: string;
  onExperimentChange?: (experimentId: string) => void;
  currentWiringStep?: number;
  onWiringStepChange?: (step: number) => void;
  className?: string;
  layout?: 'split' | 'stacked';
  isMaximized?: boolean;
}

export type BuilderStage = 'bom_power' | 'wiring_sequencer' | 'netlist' | 'preflight';

export const WokwiProjectBuilder: React.FC<WokwiProjectBuilderProps> = ({
  experimentId,
  onExperimentChange,
  currentWiringStep,
  onWiringStepChange,
  className = '',
  layout = 'stacked',
  isMaximized = false,
}) => {
  // 1. Experiment Selection State
  const defaultExpId = 'exp_pir_servo_buzzer';
  const [internalExpId, setInternalExpId] = useState<string>(experimentId || defaultExpId);
  const activeExpId = experimentId || internalExpId;

  // Active guide dataset
  const activeGuide: WokwiProjectGuide = useMemo(() => {
    return WOKWI_PROJECT_GUIDES[activeExpId] || WOKWI_PROJECT_GUIDES[defaultExpId];
  }, [activeExpId]);

  // 2. Active Stage State (Defaults to 'wiring_sequencer' in split or maximized view)
  const [activeStage, setActiveStage] = useState<BuilderStage>(() =>
    layout === 'split' || isMaximized ? 'wiring_sequencer' : 'bom_power'
  );

  const prevLayoutRef = React.useRef(layout);
  const prevMaximizedRef = React.useRef(isMaximized);

  useEffect(() => {
    const enteredSplitOrMax =
      (layout === 'split' && prevLayoutRef.current !== 'split') ||
      (isMaximized && !prevMaximizedRef.current);
    if (enteredSplitOrMax) {
      setActiveStage('wiring_sequencer');
    }
    prevLayoutRef.current = layout;
    prevMaximizedRef.current = isMaximized;
  }, [layout, isMaximized]);

  // 3. Wire-by-Wire Assembly State
  const [internalWiringStep, setInternalWiringStep] = useState<number>(
    currentWiringStep !== undefined ? currentWiringStep : 1
  );

  // Normalize activeStep to totalWiringSteps when circuit is complete (-1)
  const isCircuitComplete =
    currentWiringStep === -1 || (currentWiringStep === undefined && internalWiringStep === -1);
  const totalWiringSteps = activeGuide.wiringSequence.length;
  const activeStep = isCircuitComplete
    ? totalWiringSteps
    : currentWiringStep !== undefined
      ? currentWiringStep
      : internalWiringStep;

  // Sync internal wiring step when experiment changes
  useEffect(() => {
    if (currentWiringStep === undefined) {
      setInternalWiringStep(1);
      onWiringStepChange?.(1);
    }
  }, [activeExpId]);

  const handleSetWiringStep = (step: number) => {
    if (step === -1) {
      setInternalWiringStep(-1);
      onWiringStepChange?.(-1);
      soundFX.playMilestone?.();
      return;
    }
    const clamped = Math.max(1, Math.min(totalWiringSteps, step));
    setInternalWiringStep(clamped);
    onWiringStepChange?.(clamped);
    soundFX.playTap();
  };

  const handleNextWire = () => {
    if (isCircuitComplete) return;
    if (activeStep >= totalWiringSteps) {
      // Complete circuit / Energize
      handleSetWiringStep(-1);
    } else {
      handleSetWiringStep(activeStep + 1);
    }
  };

  const handlePrevWire = () => {
    if (isCircuitComplete) {
      // When circuit complete: step back to Wire totalWiringSteps - 1
      handleSetWiringStep(Math.max(1, totalWiringSteps - 1));
    } else if (activeStep > 1) {
      handleSetWiringStep(activeStep - 1);
    }
  };

  const handleAutoAssembleAll = () => {
    handleSetWiringStep(-1);
    soundFX.playSuccess();
  };

  const handleResetWiring = () => {
    handleSetWiringStep(1);
    soundFX.playTap();
  };

  // 4. Netlist Search and Filter State
  const [netlistSearch, setNetlistSearch] = useState<string>('');
  const [netlistDomainFilter, setNetlistDomainFilter] = useState<string>('ALL');
  const [netlistCopied, setNetlistCopied] = useState<boolean>(false);

  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: activeGuide.netlist.length };
    activeGuide.netlist.forEach((n) => {
      counts[n.signalDomain] = (counts[n.signalDomain] || 0) + 1;
    });
    return counts;
  }, [activeGuide.netlist]);

  const filteredNetlist = useMemo(() => {
    return activeGuide.netlist.filter((entry) => {
      const matchesSearch =
        entry.netId.toLowerCase().includes(netlistSearch.toLowerCase()) ||
        entry.netName.toLowerCase().includes(netlistSearch.toLowerCase()) ||
        entry.fromPin.toLowerCase().includes(netlistSearch.toLowerCase()) ||
        entry.toPin.toLowerCase().includes(netlistSearch.toLowerCase()) ||
        entry.wireColor.toLowerCase().includes(netlistSearch.toLowerCase()) ||
        entry.electricalFunction.toLowerCase().includes(netlistSearch.toLowerCase());

      const matchesDomain =
        netlistDomainFilter === 'ALL' || entry.signalDomain === netlistDomainFilter;

      return matchesSearch && matchesDomain;
    });
  }, [activeGuide.netlist, netlistSearch, netlistDomainFilter]);

  const handleCopyNetlist = async () => {
    const header = `# Netlist for: ${activeGuide.title}\n# Generated by WokwiProjectBuilder\n\n`;
    const rows = activeGuide.netlist
      .map(
        (n) =>
          `[${n.netId}] ${n.netName}\n  FROM: ${n.fromPin}\n  TO:   ${n.toPin}\n  WIRE: ${n.wireColor} (${n.wireGauge})\n  FUNC: ${n.electricalFunction}\n`
      )
      .join('\n');
    const ok = await copyTextToClipboard(header + rows);
    if (ok) {
      setNetlistCopied(true);
      soundFX.playSuccess();
      setTimeout(() => setNetlistCopied(false), 2000);
    }
  };

  // 5. Pre-Flight Checklist Interactive State
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Reset or initialize checklist on experiment change
  useEffect(() => {
    setCheckedItems({});
  }, [activeExpId]);

  const toggleCheckItem = (id: string) => {
    setCheckedItems((prev) => {
      const nextState = !prev[id];
      if (nextState) {
        soundFX.playTap();
      }
      return { ...prev, [id]: nextState };
    });
  };

  const totalChecks = activeGuide.preFlightChecklist.length;
  const verifiedCount = activeGuide.preFlightChecklist.filter(
    (item) => !!checkedItems[item.id]
  ).length;
  const allVerified = totalChecks > 0 && verifiedCount === totalChecks;

  useEffect(() => {
    if (allVerified) {
      soundFX.playMilestone?.();
    }
  }, [allVerified]);

  const handleCheckAll = () => {
    const allChecked: Record<string, boolean> = {};
    activeGuide.preFlightChecklist.forEach((item) => {
      allChecked[item.id] = true;
    });
    setCheckedItems(allChecked);
    soundFX.playSuccess();
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
    soundFX.playTap();
  };

  // 6. BOM Filter State
  const [bomCategoryFilter, setBomCategoryFilter] = useState<string>('all');

  const bomCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: activeGuide.bom.length };
    activeGuide.bom.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [activeGuide.bom]);

  const filteredBOM = useMemo(() => {
    if (bomCategoryFilter === 'all') return activeGuide.bom;
    return activeGuide.bom.filter((c) => c.category === bomCategoryFilter);
  }, [activeGuide.bom, bomCategoryFilter]);

  // Experiment icon helper
  const renderExpIcon = (expId: string, classNameStr: string = 'w-5 h-5') => {
    switch (expId) {
      case 'exp_pir_servo_buzzer':
        return <Flame className={classNameStr} />;
      case 'exp_ultrasonic_radar':
        return <Radar className={classNameStr} />;
      case 'exp_ir_line_follower':
        return <Bot className={classNameStr} />;
      case 'exp_mpu6050_balancing':
        return <Compass className={classNameStr} />;
      case 'exp_ldr_solar_tracker':
        return <Sparkles className={classNameStr} />;
      case 'exp_encoder_motor_pid':
        return <Activity className={classNameStr} />;
      case 'exp_hall_effect_tachometer':
        return <Zap className={classNameStr} />;
      case 'exp_loadcell_smart_gripper':
        return <Scale className={classNameStr} />;
      default:
        return <Cpu className={classNameStr} />;
    }
  };

  // Wire type badge styling helper
  const renderWireTypeBadge = (wireType: WireType) => {
    switch (wireType) {
      case 'power':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-700/80 flex items-center gap-1.5 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>Power (+5V / VCC)</span>
          </span>
        );
      case 'ground':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-zinc-800 text-zinc-200 border border-zinc-600 flex items-center gap-1.5 shadow-sm">
            <Check className="w-3.5 h-3.5 text-zinc-400" />
            <span>Ground (0V GND)</span>
          </span>
        );
      case 'pwm':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-700/80 flex items-center gap-1.5 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>PWM Signal (~Timer)</span>
          </span>
        );
      case 'i2c':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-blue-950/80 text-blue-300 border border-blue-700/80 flex items-center gap-1.5 shadow-sm">
            <ListTree className="w-3.5 h-3.5 text-blue-400" />
            <span>I2C Bus (SDA/SCL)</span>
          </span>
        );
      case 'analog':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 flex items-center gap-1.5 shadow-sm">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Analog Sensor (ADC)</span>
          </span>
        );
      case 'signal':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-700/80 flex items-center gap-1.5 shadow-sm">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Digital Logic Signal</span>
          </span>
        );
    }
  };

  const currentStepData: WiringStep | undefined = activeGuide.wiringSequence[activeStep - 1];

  return (
    <div
      className={`flex flex-col bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden ${className}`}
    >
      {/* =========================================================================
          TOP HEADER: Experiment Selector & Title
      ========================================================================= */}
      <div
        className={`bg-zinc-900/95 border-b border-zinc-800/90 p-4 sm:p-5 flex flex-col gap-3.5 backdrop-blur-md ${
          layout === 'split' ? '' : 'md:flex-row md:items-center md:justify-between'
        }`}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/40 shadow-inner shrink-0">
            {renderExpIcon(activeExpId, 'w-6 h-6')}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-800/60 shadow-xs">
                Wokwi Builder Lab
              </span>
              <span className="text-[10px] sm:text-xs text-zinc-400 font-mono">
                {activeGuide.wiringSequence.length} Wires • {activeGuide.bom.length} Parts • {activeGuide.powerBudget.maxPeakCurrentMa}mA Peak
              </span>
            </div>
            <h2
              className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white truncate mt-1"
              title={activeGuide.title}
            >
              {activeGuide.title}
            </h2>
          </div>
        </div>

        {/* Experiment Selector Dropdown */}
        <div
          className={`flex items-center gap-2.5 shrink-0 ${
            layout === 'split' ? 'w-full justify-between pt-1 border-t border-zinc-800/60' : ''
          }`}
        >
          <label className="text-xs text-zinc-400 font-semibold uppercase tracking-wider whitespace-nowrap font-mono">
            Experiment:
          </label>
          <select
            value={activeExpId}
            onChange={(e) => {
              const newId = e.target.value;
              setInternalExpId(newId);
              onExperimentChange?.(newId);
              soundFX.playTap();
            }}
            aria-label="Select Robotics Experiment"
            className="bg-zinc-800/95 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-100 text-xs sm:text-sm rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer max-w-[280px] truncate shadow-sm"
          >
            {ROBOTICS_EXPERIMENTS.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.order}. {exp.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =========================================================================
          STAGE NAVIGATION TABS (RESPONSIVE GRID)
      ========================================================================= */}
      <div
        className={`grid gap-2 p-2.5 sm:p-3 border-b border-zinc-800 bg-zinc-900/70 text-xs ${
          layout === 'split' ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {/* Stage 1 Tab */}
        <button
          onClick={() => {
            setActiveStage('bom_power');
            soundFX.playTap();
          }}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl font-semibold transition-all cursor-pointer ${
            activeStage === 'bom_power'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/50 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Package className="w-4 h-4 shrink-0 text-cyan-400" />
            <span className="truncate text-xs sm:text-sm">1. BOM & Power</span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-300 border border-zinc-800 shrink-0">
            {activeGuide.bom.length}
          </span>
        </button>

        {/* Stage 2 Tab */}
        <button
          onClick={() => {
            setActiveStage('wiring_sequencer');
            soundFX.playTap();
          }}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl font-semibold transition-all cursor-pointer ${
            activeStage === 'wiring_sequencer'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Zap className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="truncate text-xs sm:text-sm">2. Wiring Sequence</span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/70 shrink-0">
            {isCircuitComplete
              ? `${totalWiringSteps}/${totalWiringSteps}`
              : `${activeStep}/${totalWiringSteps}`}
          </span>
        </button>

        {/* Stage 3 Tab */}
        <button
          onClick={() => {
            setActiveStage('netlist');
            soundFX.playTap();
          }}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl font-semibold transition-all cursor-pointer ${
            activeStage === 'netlist'
              ? 'bg-purple-500/20 text-purple-200 border border-purple-500/50 shadow-md shadow-purple-950/40 ring-1 ring-purple-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <ListTree className="w-4 h-4 shrink-0 text-purple-400" />
            <span className="truncate text-xs sm:text-sm">3. Netlist Table</span>
          </div>
          <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-800/70 shrink-0">
            {activeGuide.netlist.length}
          </span>
        </button>

        {/* Stage 4 Tab */}
        <button
          onClick={() => {
            setActiveStage('preflight');
            soundFX.playTap();
          }}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl font-semibold transition-all cursor-pointer ${
            activeStage === 'preflight'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/30'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/70 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="truncate text-xs sm:text-sm">4. Pre-Flight</span>
          </div>
          {allVerified ? (
            <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1 shrink-0 font-bold">
              <Check className="w-3 h-3" /> All Go
            </span>
          ) : (
            <span className="text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-300 border border-zinc-800 shrink-0">
              {verifiedCount}/{totalChecks}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          STAGE BODY (Spacious, Scrollable, Never Crunched)
      ========================================================================= */}
      <div
        className={`p-4 sm:p-5 md:p-6 space-y-6 custom-scrollbar ${
          layout === 'split'
            ? isMaximized
              ? 'flex-1 min-h-0 overflow-y-auto'
              : 'flex-1 min-h-[500px] lg:min-h-[580px] max-h-[760px] lg:max-h-[820px] overflow-y-auto'
            : isMaximized
              ? 'flex-1 min-h-0 overflow-y-auto'
              : 'max-h-[calc(100vh-230px)] overflow-y-auto'
        }`}
      >
        {/* =====================================================================
            STAGE 1: BOM & POWER BUDGET
        ===================================================================== */}
        {activeStage === 'bom_power' && (
          <div className="space-y-6">
            {/* Real-World Engineering Problem Statement */}
            <div className="bg-gradient-to-r from-blue-950/40 via-zinc-900/70 to-zinc-900 border border-blue-900/60 rounded-2xl p-5 md:p-6 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 shrink-0 shadow-inner">
                  <Info className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300 bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-800/60">
                      Engineering Specification
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      Substrate Challenge
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Real-World Robotics Challenge
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base text-zinc-200 leading-relaxed font-sans">
                    {activeGuide.realWorldProblemStatement}
                  </p>
                </div>
              </div>

              {/* Objectives List */}
              <div
                className={`mt-5 pt-5 border-t border-blue-900/40 grid gap-3 text-xs sm:text-sm ${
                  layout === 'split' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                }`}
              >
                {activeGuide.educationalObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-zinc-300 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/80">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Required */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center gap-3 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-300 mr-2 font-mono">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>Workbench Tools:</span>
              </div>
              {activeGuide.toolsRequired.map((tool, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800/90 text-zinc-200 text-xs border border-zinc-700/80 font-mono flex items-center gap-2 shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400/50" />
                  {tool}
                </span>
              ))}
            </div>

            {/* Rigorous Power Budget Calculation */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 md:p-6 space-y-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-inner">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                      Electrical Power Budget & Headroom Analysis
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Supply Architecture: {activeGuide.powerBudget.supplySource}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                {activeGuide.powerBudget.requiresExternalPower ? (
                  <div className="px-3.5 py-2 rounded-xl bg-rose-950/80 border border-rose-700/90 text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2 self-start sm:self-auto shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>External DC Supply Mandatory</span>
                  </div>
                ) : (
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-700/90 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 self-start sm:self-auto shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>USB 500mA Bus Powered OK</span>
                  </div>
                )}
              </div>

              {/* Power Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-1">
                <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                  <span className="text-[10px] sm:text-xs uppercase font-mono text-zinc-400 block font-semibold">
                    Idle Current (I_idle)
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-cyan-400 block">
                    {activeGuide.powerBudget.idleCurrentMa} mA
                  </span>
                  <span className="text-[11px] text-zinc-400 block font-sans">
                    Static quiescent draw
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                  <span className="text-[10px] sm:text-xs uppercase font-mono text-zinc-400 block font-semibold">
                    Peak Current (I_peak)
                  </span>
                  <span
                    className={`text-xl sm:text-2xl font-bold font-mono block ${
                      activeGuide.powerBudget.maxPeakCurrentMa > 500
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {activeGuide.powerBudget.maxPeakCurrentMa} mA
                  </span>
                  <span className="text-[11px] text-zinc-400 block font-sans">
                    Actuator stall / acceleration
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                  <span className="text-[10px] sm:text-xs uppercase font-mono text-zinc-400 block font-semibold">
                    USB PTC Polyfuse Limit
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-200 block">
                    {activeGuide.powerBudget.usbPolyfuseLimitMa} mA
                  </span>
                  <span className="text-[11px] text-zinc-400 block font-sans">
                    Trips on thermal overload
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-1">
                  <span className="text-[10px] sm:text-xs uppercase font-mono text-zinc-400 block font-semibold">
                    MCU Linear Reg Limit
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-zinc-200 block">
                    {activeGuide.powerBudget.mcuRegulatorLimitMa} mA
                  </span>
                  <span className="text-[11px] text-zinc-400 block font-sans">
                    NCP1117ST50 dissipation
                  </span>
                </div>
              </div>

              {/* Visual Headroom Bar */}
              <div className="space-y-2 pt-1 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80">
                <div className="flex justify-between text-xs sm:text-sm font-mono text-zinc-300">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Peak Current Relative to 500mA USB Safety Limit:</span>
                  </span>
                  <span
                    className={`font-bold ${
                      activeGuide.powerBudget.maxPeakCurrentMa > 500
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {Math.round((activeGuide.powerBudget.maxPeakCurrentMa / 500) * 100)}% of Limit ({activeGuide.powerBudget.maxPeakCurrentMa} mA)
                  </span>
                </div>
                <div className="w-full h-3.5 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden relative shadow-inner">
                  {/* 500mA Marker Line (center) */}
                  <div
                    className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-zinc-400 z-10"
                    title="500mA USB Bus Limit"
                  />
                  {/* Current Fill Bar */}
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      activeGuide.powerBudget.maxPeakCurrentMa > 500
                        ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{
                      width: `${Math.min(100, (activeGuide.powerBudget.maxPeakCurrentMa / 1000) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                  <span>0 mA</span>
                  <span className="text-zinc-200 font-bold">500 mA (USB Bus Boundary)</span>
                  <span>1000+ mA</span>
                </div>
              </div>

              {/* Engineering Explanation Box */}
              <div className="p-4 rounded-xl bg-zinc-950/90 border border-zinc-800/90 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                <div className="flex items-center gap-2 font-bold text-amber-400 mb-1.5 font-mono text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>First-Principles Circuit Safety Note:</span>
                </div>
                <p className="leading-relaxed">
                  {activeGuide.powerBudget.engineeringExplanation}
                </p>
              </div>
            </div>

            {/* Bill of Materials (BOM) Table / Cards */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/90 p-4 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <Package className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                    Bill of Materials (BOM) Component Inventory ({filteredBOM.length} Items)
                  </h3>
                </div>

                {/* BOM Category Filters with counts */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {['all', 'microcontroller', 'sensor', 'actuator', 'passive', 'driver', 'power'].map(
                    (cat) => {
                      const count = bomCategoryCounts[cat] || 0;
                      if (count === 0 && cat !== 'all') return null;
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            setBomCategoryFilter(cat);
                            soundFX.playTap();
                          }}
                          className={`px-3 py-1.5 rounded-lg capitalize transition-all font-mono text-xs flex items-center gap-1.5 cursor-pointer ${
                            bomCategoryFilter === cat
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 font-bold shadow-sm'
                              : 'bg-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className="text-[10px] opacity-70">({count})</span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* BOM Cards Grid */}
              <div
                className={`grid gap-4 ${
                  layout === 'split' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                }`}
              >
                {filteredBOM.map((comp: BOMComponent, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4 shadow-lg"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700">
                              {comp.partNumber}
                            </span>
                            <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 capitalize font-medium">
                              {comp.category}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-white mt-1.5 tracking-tight">
                            {comp.name}
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold bg-zinc-800/90 text-cyan-300 px-3 py-1.5 rounded-lg border border-zinc-700 shadow-xs shrink-0">
                          Qty: {comp.quantity}
                        </span>
                      </div>

                      {/* Electrical Specs Grid */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs font-mono bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800/80">
                        <div>
                          <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                            Voltage Rating:
                          </span>
                          <span className="text-zinc-100 font-bold">{comp.voltageRating}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                            Operating Voltage:
                          </span>
                          <span className="text-zinc-100 font-bold">{comp.operatingVoltage}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                            Idle Current Draw:
                          </span>
                          <span className="text-cyan-400 font-bold">{comp.currentDrawIdle}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                            Peak / Stall Draw:
                          </span>
                          <span className="text-amber-400 font-bold">{comp.currentDrawMax}</span>
                        </div>
                      </div>

                      {/* Pin Functions */}
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1.5 font-semibold">
                          Pin Interface:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {comp.pinFunctions.map((pin, pIdx) => (
                            <span
                              key={pIdx}
                              className="text-xs font-mono px-2 py-0.5 rounded-md bg-zinc-800/90 text-zinc-300 border border-zinc-700/70"
                            >
                              {pin}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Datasheet Snippet */}
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans italic border-l-2 border-zinc-700 pl-3 py-0.5">
                        "{comp.datasheetSnippet}"
                      </p>
                    </div>

                    {comp.criticalNotes && (
                      <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{comp.criticalNotes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STAGE 2: WIRE-BY-WIRE ASSEMBLY SEQUENCER
        ===================================================================== */}
        {activeStage === 'wiring_sequencer' && (
          <div className="space-y-6">
            {/* Top Section: Progress Bar & Tactile Controls */}
            <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 sm:p-5 md:p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {isCircuitComplete ? (
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/90 px-3 py-1 rounded-full border border-emerald-700/80 flex items-center gap-1.5 shadow-sm">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Circuit Complete ({totalWiringSteps}/{totalWiringSteps} Wires)
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800/80 shadow-sm">
                        Wire Step {activeStep} of {totalWiringSteps}
                      </span>
                    )}
                    <span className="text-xs text-zinc-400 font-mono">
                      ({isCircuitComplete ? 100 : Math.round((activeStep / totalWiringSteps) * 100)}% Complete)
                    </span>
                  </div>
                  <h3
                    className="text-base sm:text-lg md:text-xl font-bold text-white mt-1.5 truncate tracking-tight"
                    title={isCircuitComplete ? 'Circuit Fully Assembled & Energized' : currentStepData?.title}
                  >
                    {isCircuitComplete ? 'Circuit Fully Assembled & Energized' : currentStepData?.title}
                  </h3>
                </div>

                {/* Tactile Navigation & Action Controls */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={handlePrevWire}
                    disabled={!isCircuitComplete && activeStep <= 1}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-zinc-100 text-xs sm:text-sm font-semibold border border-zinc-700 shadow-sm transition-all cursor-pointer"
                    title="Previous Wire Step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev Wire</span>
                  </button>

                  {isCircuitComplete ? (
                    <button
                      disabled
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-950/90 text-emerald-300 text-xs sm:text-sm font-bold border border-emerald-700/90 shadow-inner opacity-90 cursor-default"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Circuit Energized</span>
                    </button>
                  ) : activeStep >= totalWiringSteps ? (
                    <button
                      onClick={handleNextWire}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/60 border border-emerald-400/60 ring-2 ring-emerald-400/30 animate-pulse transition-all active:scale-95 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-emerald-200" />
                      <span>Finish Circuit (Energize)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNextWire}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-cyan-950/50 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Next Wire</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={handleAutoAssembleAll}
                    disabled={isCircuitComplete}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none text-emerald-400 text-xs sm:text-sm font-semibold border border-zinc-700 transition-colors cursor-pointer"
                    title="Auto-assemble all remaining wires"
                  >
                    <FastForward className="w-4 h-4" />
                    <span className="hidden sm:inline">Auto-Assemble</span>
                  </button>

                  <button
                    onClick={handleResetWiring}
                    className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                    title="Reset Wiring to Step 1"
                    aria-label="Reset Wiring to Step 1"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Percentage Progress Track */}
              <div className="w-full h-3 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCircuitComplete
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 w-full'
                      : 'bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-400'
                  }`}
                  style={{
                    width: `${isCircuitComplete ? 100 : (activeStep / totalWiringSteps) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Celebratory Milestone Card when Circuit is Complete */}
            {isCircuitComplete && (
              <div className="p-6 sm:p-7 md:p-8 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-zinc-900 to-teal-950/80 border-2 border-emerald-500/70 shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                  <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner shrink-0">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full bg-emerald-500 text-zinc-950 text-xs font-bold font-mono uppercase tracking-wider shadow-sm">
                        All Systems Wired & Checked
                      </span>
                      <span className="text-xs text-emerald-400 font-mono font-semibold">
                        100% Assembled
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
                      Circuit Fully Assembled (All {totalWiringSteps} Wires Connected)
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                      All physical point-to-point connections have been placed according to the electrical schematic. The circuit netlist is fully closed, power rails are established, and the system is ready for safety verification and firmware testing.
                    </p>
                  </div>
                </div>

                {/* 100% Progress Bar */}
                <div className="space-y-2 pt-1 bg-zinc-950/60 p-4 rounded-xl border border-emerald-900/50">
                  <div className="flex justify-between text-xs sm:text-sm font-mono text-emerald-300">
                    <span className="flex items-center gap-2 font-semibold">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Assembly Progress:</span>
                    </span>
                    <span className="font-bold">
                      {totalWiringSteps} of {totalWiringSteps} Wires Placed (100%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-zinc-950 rounded-full border border-emerald-900/60 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full shadow-lg" />
                  </div>
                </div>

                {/* Key Electrical Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-300">
                    <span className="text-zinc-500 block text-[10px] uppercase">Wires Connected</span>
                    <span className="text-base font-bold text-emerald-400">{totalWiringSteps} Wires</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-300">
                    <span className="text-zinc-500 block text-[10px] uppercase">Active Modules</span>
                    <span className="text-base font-bold text-cyan-400">{activeGuide.bom.length} Parts</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-300">
                    <span className="text-zinc-500 block text-[10px] uppercase">Peak Current</span>
                    <span className="text-base font-bold text-amber-400">{activeGuide.powerBudget.maxPeakCurrentMa} mA</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-zinc-300">
                    <span className="text-zinc-500 block text-[10px] uppercase">Power Bus</span>
                    <span className="text-base font-bold text-zinc-200">
                      {activeGuide.powerBudget.requiresExternalPower ? 'Dual Supply' : 'USB 5V'}
                    </span>
                  </div>
                </div>

                {/* Milestone Actions: "Inspect Netlist", "Run Pre-Flight Check", "Step-by-Step Replay" */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setActiveStage('netlist');
                      soundFX.playTap();
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold border border-purple-400/50 shadow-lg shadow-purple-950/50 transition-all active:scale-95 cursor-pointer"
                  >
                    <ListTree className="w-4 h-4 text-purple-200" />
                    <span>Inspect Netlist</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveStage('preflight');
                      soundFX.playTap();
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold border border-emerald-400/50 shadow-lg shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    <span>Run Pre-Flight Check</span>
                  </button>

                  <button
                    onClick={() => {
                      handleSetWiringStep(1);
                    }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold border border-zinc-700 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-cyan-400" />
                    <span>Step-by-Step Replay</span>
                  </button>
                </div>
              </div>
            )}

            {/* Center Section: Grand Wire Assembly Card (When Active Step is Selected) */}
            {currentStepData && (
              <div className="bg-gradient-to-b from-zinc-900/95 to-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 md:p-7 space-y-6 shadow-2xl relative overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
                  style={{ backgroundColor: currentStepData.colorHex }}
                />

                {/* Grand Wire Header: Large color chip & Wire type badge */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Large Physical Color Chip */}
                    <div className="relative group shrink-0">
                      <div
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-2 border-white/30 shadow-lg flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ backgroundColor: currentStepData.colorHex }}
                      >
                        <span className="w-3 h-3 rounded-full bg-black/20" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base sm:text-lg font-bold font-mono text-white">
                          {currentStepData.colorName} Wire
                        </span>
                        <span className="text-xs font-mono text-zinc-400 bg-zinc-800/90 px-2 py-0.5 rounded border border-zinc-700">
                          {currentStepData.colorHex}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 font-mono block mt-0.5">
                        Step #{currentStepData.stepNumber} of {totalWiringSteps}
                      </span>
                    </div>
                  </div>

                  {/* Wire Type & Ratings Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {renderWireTypeBadge(currentStepData.wireType)}

                    <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700 shadow-sm">
                      Gauge: {currentStepData.gauge}
                    </span>

                    <span className="px-3 py-1 rounded-full text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
                      300V / 80°C PVC
                    </span>
                  </div>
                </div>

                {/* Two Clear Terminal Blocks: FROM block -> Large animated arrow -> TO block */}
                <div
                  className={`grid gap-3.5 items-stretch bg-zinc-950/90 border border-zinc-800/90 p-4 sm:p-5 rounded-2xl shadow-inner ${
                    layout === 'split' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-11'
                  }`}
                >
                  {/* FROM Terminal Block */}
                  <div
                    className={`${
                      layout === 'split' ? 'w-full' : 'lg:col-span-5'
                    } bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-800 space-y-2.5 min-w-0 flex flex-col justify-between shadow-sm`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          Source Terminal (FROM):
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/50">
                          Origin Pin
                        </span>
                      </div>
                      {/* Terminal pin name */}
                      <div className="text-base sm:text-lg md:text-xl font-bold font-mono text-zinc-100 break-words leading-snug">
                        {currentStepData.from}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 font-mono">
                      Lead Pin #1 • Secure in header socket
                    </div>
                  </div>

                  {/* Large Animated Arrow Divider */}
                  <div
                    className={`${
                      layout === 'split' ? 'w-full py-1' : 'lg:col-span-1 py-1 lg:py-0'
                    } flex flex-col items-center justify-center shrink-0`}
                  >
                    <div className="p-2 sm:p-2.5 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 text-cyan-400 border border-cyan-500/40 shadow-md shadow-cyan-950/30">
                      <ArrowRight
                        className={`w-5 h-5 transition-transform motion-safe:animate-pulse ${
                          layout === 'split' ? 'rotate-90' : 'rotate-90 lg:rotate-0'
                        }`}
                      />
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold mt-1">
                      Signal Flow
                    </span>
                  </div>

                  {/* TO Terminal Block */}
                  <div
                    className={`${
                      layout === 'split' ? 'w-full' : 'lg:col-span-5'
                    } bg-gradient-to-br from-zinc-900 to-zinc-950 p-4 sm:p-5 rounded-xl border border-zinc-800 space-y-2.5 min-w-0 flex flex-col justify-between shadow-sm`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Destination Terminal (TO):
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50">
                          Target Bus / Pin
                        </span>
                      </div>
                      {/* Terminal pin name */}
                      <div className="text-base sm:text-lg md:text-xl font-bold font-mono text-cyan-300 break-words leading-snug">
                        {currentStepData.to}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 font-mono">
                      Lead Pin #2 • Insert firmly into tie-point
                    </div>
                  </div>
                </div>

                {/* Step Action Description */}
                <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl text-sm sm:text-base text-zinc-200 leading-relaxed font-sans">
                  <span className="font-semibold text-white block mb-1">
                    Action Instructions:
                  </span>
                  {currentStepData.description}
                </div>

                {/* Engineering Rationale Card: First-Principles Physical Rationale */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-zinc-900/70 to-zinc-900 border border-cyan-800/50 space-y-2.5 shadow-md">
                  <div className="flex items-center gap-2.5 text-cyan-300 text-xs sm:text-sm font-bold uppercase tracking-wider font-mono">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>First-Principles Physical Rationale:</span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base text-zinc-200 leading-relaxed font-sans">
                    {currentStepData.engineeringReason}
                  </p>
                </div>

                {/* Caution Alert if Present */}
                {currentStepData.cautionAlert && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/70 border border-rose-800 text-xs sm:text-sm text-rose-200 flex items-start gap-3 shadow-md">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-100 block mb-1 font-mono text-xs uppercase tracking-wider">
                        Hardware Safety Warning:
                      </span>
                      <p className="leading-relaxed">{currentStepData.cautionAlert}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Section: Step Indicator Carousel/Strip with #1, #2, ..., #12 Pills */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Wiring Sequence Strip (Step 1 to {totalWiringSteps})</span>
                </span>
                <span className="text-[11px] text-zinc-400">Click any wire to inspect</span>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 pt-1 custom-scrollbar">
                {activeGuide.wiringSequence.map((step) => {
                  const isDone = isCircuitComplete || step.stepNumber < activeStep;
                  const isCurrent = !isCircuitComplete && step.stepNumber === activeStep;
                  return (
                    <button
                      key={step.stepNumber}
                      onClick={() => handleSetWiringStep(step.stepNumber)}
                      title={`Wire #${step.stepNumber}: ${step.title} (${step.colorName})`}
                      className={`h-9 px-3 sm:px-3.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer shadow-xs ${
                        isCurrent
                          ? 'bg-amber-500 text-zinc-950 font-black ring-2 ring-amber-400 shadow-md shadow-amber-950/50 scale-105'
                          : isDone
                            ? 'bg-zinc-800 hover:bg-zinc-700 text-emerald-300 border border-zinc-700'
                            : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      <span>#{step.stepNumber}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs"
                        style={{ backgroundColor: step.colorHex }}
                      />
                    </button>
                  );
                })}

                {/* Complete Pill */}
                <button
                  onClick={() => handleSetWiringStep(-1)}
                  title="Circuit Fully Assembled & Energized"
                  className={`h-9 px-3.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    isCircuitComplete
                      ? 'bg-emerald-500 text-zinc-950 font-black ring-2 ring-emerald-400 shadow-md shadow-emerald-950/50 scale-105'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STAGE 3: SCHEMATIC NETLIST
        ===================================================================== */}
        {activeStage === 'netlist' && (
          <div className="space-y-4">
            {/* Header, Search & Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-zinc-900/90 p-4 sm:p-5 rounded-2xl border border-zinc-800 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-72">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={netlistSearch}
                    onChange={(e) => setNetlistSearch(e.target.value)}
                    placeholder="Search nets, pins, color, function..."
                    className="w-full bg-zinc-950 border border-zinc-700/80 hover:border-zinc-600 text-zinc-200 text-xs sm:text-sm rounded-xl pl-10 pr-8 py-2.5 font-mono placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                  />
                  {netlistSearch && (
                    <button
                      onClick={() => setNetlistSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Domain Filter Pills with Counts */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {['ALL', 'POWER', 'GROUND', 'ANALOG', 'DIGITAL_IO', 'PWM', 'I2C_BUS'].map(
                  (domain) => {
                    const count = domainCounts[domain] || 0;
                    if (count === 0 && domain !== 'ALL') return null;
                    return (
                      <button
                        key={domain}
                        onClick={() => {
                          setNetlistDomainFilter(domain);
                          soundFX.playTap();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                          netlistDomainFilter === domain
                            ? 'bg-purple-500/20 text-purple-200 border border-purple-500/60 font-bold shadow-sm'
                            : 'bg-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent'
                        }`}
                      >
                        <span>{domain}</span>
                        <span className="text-[10px] opacity-70">({count})</span>
                      </button>
                    );
                  }
                )}

                {/* Copy Netlist Button */}
                <button
                  onClick={handleCopyNetlist}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-950/50 transition-all active:scale-95 ml-auto md:ml-3 cursor-pointer"
                >
                  {netlistCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied Netlist!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Netlist</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Netlist Data Table */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-zinc-950 border-b border-zinc-800 text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    <tr>
                      <th className="py-3.5 px-4">Net ID</th>
                      <th className="py-3.5 px-4">Net Name</th>
                      <th className="py-3.5 px-4">Signal Domain</th>
                      <th className="py-3.5 px-4">From Pin</th>
                      <th className="py-3.5 px-4">To Pin</th>
                      <th className="py-3.5 px-4">Color & Gauge</th>
                      <th className="py-3.5 px-4">Electrical Function</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70 font-mono text-zinc-300">
                    {filteredNetlist.map((net: NetlistEntry, idx: number) => (
                      <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-purple-300 whitespace-nowrap">
                          {net.netId}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                          {net.netName}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${
                              net.signalDomain === 'POWER'
                                ? 'bg-red-950/80 text-red-300 border-red-800/60'
                                : net.signalDomain === 'GROUND'
                                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                  : net.signalDomain === 'ANALOG'
                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                                    : net.signalDomain === 'PWM'
                                      ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                                      : net.signalDomain === 'I2C_BUS'
                                        ? 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                                        : 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60'
                            }`}
                          >
                            {net.signalDomain}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-200 whitespace-nowrap font-medium">
                          {net.fromPin}
                        </td>
                        <td className="py-3.5 px-4 text-cyan-300 whitespace-nowrap font-medium">
                          {net.toPin}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-zinc-200 font-bold block">{net.wireColor}</span>
                          <span className="text-[10px] text-zinc-400 block">{net.wireGauge}</span>
                        </td>
                        <td className="py-3.5 px-4 font-sans text-xs text-zinc-300 min-w-[220px] leading-relaxed">
                          {net.electricalFunction}
                        </td>
                      </tr>
                    ))}
                    {filteredNetlist.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-zinc-400 font-sans">
                          No nets match the filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Netlist Table Footer Summary */}
              <div className="bg-zinc-950/80 border-t border-zinc-800 p-3.5 px-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-zinc-400">
                <span>Showing {filteredNetlist.length} of {activeGuide.netlist.length} Nets</span>
                <span>Standard Jumper Spec: 22 AWG Solid-Core Copper</span>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STAGE 4: PRE-FLIGHT CHECKLIST
        ===================================================================== */}
        {activeStage === 'preflight' && (
          <div className="space-y-6">
            {/* All Systems Go Banner if 100% verified */}
            {allVerified ? (
              <div className="p-6 sm:p-7 md:p-8 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-zinc-900 border-2 border-emerald-500/80 shadow-2xl flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left animate-in fade-in zoom-in-95 duration-300">
                <div className="p-4 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner shrink-0">
                  <Sparkles className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <span className="px-3 py-0.5 rounded-full bg-emerald-500 text-zinc-950 text-xs font-bold uppercase font-mono tracking-wider shadow-sm">
                      ALL SYSTEMS GO
                    </span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold">
                      100% Safety Verified
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
                    Hardware Pre-Flight Safety Verification Complete
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                    Ground bonds verified, capacitor polarities checked, power rails segregated, and mechanical clearances confirmed. The circuit is cleared for power-up and firmware flashing!
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-900/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-amber-300 shadow-md">
                <div className="flex items-start sm:items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    Hardware Pre-Flight Safety In Progress: Verify all {totalChecks} checkpoints before applying DC power to prevent component damage.
                  </span>
                </div>
                <span className="font-mono font-bold text-amber-400 whitespace-nowrap bg-amber-950/80 px-3 py-1 rounded-lg border border-amber-800">
                  {verifiedCount} of {totalChecks} Verified
                </span>
              </div>
            )}

            {/* Checklist Action Header & Progress Meter */}
            <div className="bg-zinc-900/90 p-4 sm:p-5 rounded-2xl border border-zinc-800 space-y-3.5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white">
                      Pre-Flight Safety Verification Points
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Progress: {verifiedCount}/{totalChecks} Verified ({Math.round((verifiedCount / totalChecks) * 100)}%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCheckAll}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs sm:text-sm font-semibold border border-zinc-700 transition-colors cursor-pointer"
                  >
                    Verify All Points
                  </button>
                  <button
                    onClick={handleResetChecklist}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs sm:text-sm font-semibold border border-zinc-700 transition-colors cursor-pointer"
                  >
                    Reset Checklist
                  </button>
                </div>
              </div>

              {/* Progress Meter Bar */}
              <div className="w-full h-3 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{
                    width: `${totalChecks > 0 ? (verifiedCount / totalChecks) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-4">
              {activeGuide.preFlightChecklist.map((item: PreFlightCheckItem) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheckItem(item.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer select-none space-y-3.5 shadow-md ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-800/80 hover:border-emerald-700'
                        : 'bg-zinc-900/90 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold shadow-sm">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg border-2 border-zinc-600 bg-zinc-950/80 hover:border-zinc-400 transition-colors" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm sm:text-base font-bold ${
                              isChecked ? 'text-emerald-300' : 'text-white'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                            {item.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">
                          {item.instruction}
                        </p>
                      </div>
                    </div>

                    {/* Danger vs Verified Explanation */}
                    <div
                      className={`grid gap-3 text-xs sm:text-sm font-sans ${
                        layout === 'split' ? 'grid-cols-1 pl-0 sm:pl-10' : 'grid-cols-1 md:grid-cols-2 pl-10'
                      }`}
                    >
                      <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 space-y-1">
                        <span className="font-bold text-rose-400 block font-mono text-xs uppercase tracking-wider">
                          Potential Damage If Skipped:
                        </span>
                        <p className="leading-relaxed">{item.potentialDamageIfSkipped}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-zinc-300 space-y-1">
                        <span className="font-bold text-emerald-400 block font-mono text-xs uppercase tracking-wider">
                          Verified Condition:
                        </span>
                        <p className="leading-relaxed">{item.verifiedExplanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          BOTTOM FOOTER BAR
      ========================================================================= */}
      <div className="bg-zinc-900/95 border-t border-zinc-800 p-3.5 px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isCircuitComplete ? 'bg-emerald-400 shadow-sm shadow-emerald-400/80 animate-pulse' : 'bg-cyan-400'
            }`}
          />
          <span className="font-semibold text-zinc-300">Experiment: {activeGuide.experimentId}</span>
          <span>•</span>
          <span>
            {isCircuitComplete
              ? `All ${totalWiringSteps} Wires Active (Circuit Energized)`
              : `Wire ${activeStep} of ${totalWiringSteps}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">Wokwi Virtual Breadboard Sync Active</span>
        </div>
      </div>
    </div>
  );
};
