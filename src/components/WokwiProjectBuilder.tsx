/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * WokwiProjectBuilder:
 * Production-grade interactive guided project builder workflow for all 8 physical computing experiments.
 * Features:
 * - Stage 1: "1. BOM & Power Budget" - Interactive component inventory cards, datasheets, voltage ratings, current meters, and tools needed.
 * - Stage 2: "2. Wire-by-Wire Assembly" - Interactive wiring sequencer with wire number, color badge, from/to pins, and engineering rationale.
 *   Controls: Previous Wire, Next Wire, Auto-Assemble All, Reset Wiring, and sync callback onWiringStepChange.
 * - Stage 3: "3. Schematic Netlist" - Searchable, filterable pin-to-pin wiring netlist table with copy-netlist button.
 * - Stage 4: "4. Pre-Flight Checklist" - Interactive checkboxes for hardware safety checks with "All Systems Go" verification banner.
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
  Maximize2,
  CheckSquare,
  Square,
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
      soundFX.playMilestone();
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
  const filteredBOM = useMemo(() => {
    if (bomCategoryFilter === 'all') return activeGuide.bom;
    return activeGuide.bom.filter((c) => c.category === bomCategoryFilter);
  }, [activeGuide.bom, bomCategoryFilter]);

  // Experiment icon helper
  const renderExpIcon = (expId: string, classNameStr: string = 'w-4 h-4') => {
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

  const currentStepData: WiringStep | undefined = activeGuide.wiringSequence[activeStep - 1];

  return (
    <div
      className={`flex flex-col bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden ${className}`}
    >
      {/* =========================================================================
          TOP HEADER: Experiment Selector & Title
      ========================================================================= */}
      <div
        className={`bg-zinc-900/90 border-b border-zinc-800 p-3.5 sm:p-4 md:p-5 flex flex-col gap-3 backdrop-blur-md ${
          layout === 'split' ? '' : 'md:flex-row md:items-center md:justify-between'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner shrink-0">
            {renderExpIcon(activeExpId, 'w-5 h-5 sm:w-6 sm:h-6')}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                Wokwi Builder Lab
              </span>
              <span className="text-[10px] sm:text-xs text-zinc-400 font-mono">
                {activeGuide.wiringSequence.length} Wires • {activeGuide.bom.length} Parts
              </span>
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-zinc-100 truncate mt-0.5" title={activeGuide.title}>
              {activeGuide.title}
            </h2>
          </div>
        </div>

        {/* Experiment Selector Dropdown */}
        <div className={`flex items-center gap-2 shrink-0 ${layout === 'split' ? 'w-full justify-between' : ''}`}>
          <label className="text-xs text-zinc-400 font-medium whitespace-nowrap">Experiment:</label>
          <select
            value={activeExpId}
            onChange={(e) => {
              const newId = e.target.value;
              setInternalExpId(newId);
              onExperimentChange?.(newId);
              soundFX.playTap();
            }}
            aria-label="Select Robotics Experiment"
            className="bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors cursor-pointer max-w-[240px] truncate"
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
        className={`grid gap-1.5 p-2 border-b border-zinc-800/80 bg-zinc-900/60 text-xs ${
          layout === 'split' ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'
        }`}
      >
        <button
          onClick={() => {
            setActiveStage('bom_power');
            soundFX.playTap();
          }}
          className={`flex items-center justify-between gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-medium transition-all ${
            activeStage === 'bom_power'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Package className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">1. BOM & Power</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0">
            {activeGuide.bom.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveStage('wiring_sequencer');
            soundFX.playTap();
          }}
          className={`flex items-center justify-between gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-medium transition-all ${
            activeStage === 'wiring_sequencer'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">2. Wiring Sequence</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-800/60 shrink-0">
            {isCircuitComplete ? `${totalWiringSteps}/${totalWiringSteps}` : `${activeStep}/${totalWiringSteps}`}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveStage('netlist');
            soundFX.playTap();
          }}
          className={`flex items-center justify-between gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-medium transition-all ${
            activeStage === 'netlist'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <ListTree className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">3. Netlist Table</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-400 border border-purple-800/60 shrink-0">
            {activeGuide.netlist.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveStage('preflight');
            soundFX.playTap();
          }}
          className={`flex items-center justify-between gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl font-medium transition-all ${
            activeStage === 'preflight'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">4. Pre-Flight</span>
          </div>
          {allVerified ? (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-700 flex items-center gap-1 shrink-0">
              <Check className="w-2.5 h-2.5" /> All Go
            </span>
          ) : (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0">
              {Object.keys(checkedItems).length}/{activeGuide.preFlightChecklist.length}
            </span>
          )}
        </button>
      </div>

      {/* =========================================================================
          STAGE BODY
      ========================================================================= */}
      <div
        className={`p-3.5 sm:p-4 md:p-5 space-y-5 custom-scrollbar ${
          layout === 'split'
            ? isMaximized
              ? 'flex-1 min-h-0 overflow-y-auto'
              : 'max-h-[640px] lg:max-h-[680px] overflow-y-auto'
            : isMaximized
              ? 'max-h-[calc(100vh-230px)] overflow-y-auto'
              : 'max-h-[calc(100vh-250px)] overflow-y-auto'
        }`}
      >
        {/* =====================================================================
            STAGE 1: BOM & POWER BUDGET
        ===================================================================== */}
        {activeStage === 'bom_power' && (
          <div className="space-y-6">
            {/* Real-World Engineering Problem Statement */}
            <div className="bg-gradient-to-r from-blue-950/40 via-zinc-900/60 to-zinc-900 border border-blue-900/50 rounded-xl p-4 md:p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-300">
                    Real-World Engineering Challenge
                  </h3>
                  <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                    {activeGuide.realWorldProblemStatement}
                  </p>
                </div>
              </div>

              {/* Objectives List */}
              <div
                className={`mt-4 pt-4 border-t border-blue-900/30 grid gap-2 text-xs ${
                  layout === 'split' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                }`}
              >
                {activeGuide.educationalObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2 text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools Required */}
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 mr-2">
                <Wrench className="w-4 h-4 text-zinc-400" />
                <span>Workbench Tools:</span>
              </div>
              {activeGuide.toolsRequired.map((tool, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 text-xs border border-zinc-700/60 font-mono flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {tool}
                </span>
              ))}
            </div>

            {/* Rigorous Power Budget Calculation */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                      Electrical Power Budget & Headroom Analysis
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      {activeGuide.powerBudget.supplySource}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                {activeGuide.powerBudget.requiresExternalPower ? (
                  <div className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-700/80 text-rose-300 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>External Power Supply Mandatory</span>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>USB 500mA Bus Powered OK</span>
                  </div>
                )}
              </div>

              {/* Power Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                    Idle Current (I_idle)
                  </span>
                  <span className="text-lg font-bold font-mono text-cyan-400">
                    {activeGuide.powerBudget.idleCurrentMa} mA
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Static quiescent draw</span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                    Peak Current (I_peak)
                  </span>
                  <span
                    className={`text-lg font-bold font-mono ${
                      activeGuide.powerBudget.maxPeakCurrentMa > 500
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {activeGuide.powerBudget.maxPeakCurrentMa} mA
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    Actuator acceleration / stall
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                    USB PTC Polyfuse Limit
                  </span>
                  <span className="text-lg font-bold font-mono text-zinc-300">
                    {activeGuide.powerBudget.usbPolyfuseLimitMa} mA
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Trips on thermal overload</span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block">
                    MCU Linear Reg Limit
                  </span>
                  <span className="text-lg font-bold font-mono text-zinc-300">
                    {activeGuide.powerBudget.mcuRegulatorLimitMa} mA
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">NCP1117ST50 dissipation</span>
                </div>
              </div>

              {/* Visual Headroom Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>Current Draw Relative to 500mA USB Safety Limit:</span>
                  <span
                    className={
                      activeGuide.powerBudget.maxPeakCurrentMa > 500
                        ? 'text-rose-400 font-bold'
                        : 'text-emerald-400'
                    }
                  >
                    {Math.round((activeGuide.powerBudget.maxPeakCurrentMa / 500) * 100)}% of Limit
                  </span>
                </div>
                <div className="w-full h-3 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden relative">
                  {/* 500mA Marker Line */}
                  <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-zinc-400 z-10" />
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
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>0 mA</span>
                  <span className="text-zinc-300 font-bold">500 mA (USB Limit)</span>
                  <span>1000+ mA</span>
                </div>
              </div>

              {/* Engineering Explanation Box */}
              <div className="p-3.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed font-sans">
                <span className="font-semibold text-amber-400 block mb-1">
                  First-Principles Circuit Safety Note:
                </span>
                {activeGuide.powerBudget.engineeringExplanation}
              </div>
            </div>

            {/* Bill of Materials (BOM) Table / Cards */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                    Bill of Materials (BOM) Component Inventory ({filteredBOM.length} Items)
                  </h3>
                </div>

                {/* BOM Category Filters */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {['all', 'microcontroller', 'sensor', 'actuator', 'passive', 'driver', 'power'].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setBomCategoryFilter(cat);
                          soundFX.playTap();
                        }}
                        className={`px-2.5 py-1 rounded-md capitalize transition-colors font-mono text-[11px] ${
                          bomCategoryFilter === cat
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                            : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div
                className={`grid gap-3 ${
                  layout === 'split' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                }`}
              >
                {filteredBOM.map((comp: BOMComponent, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {comp.partNumber}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 capitalize">
                              {comp.category}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm text-zinc-100 mt-1">{comp.name}</h4>
                        </div>
                        <span className="text-xs font-mono font-bold bg-zinc-800 text-cyan-300 px-2 py-1 rounded border border-zinc-700/80">
                          Qty: {comp.quantity}
                        </span>
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/70">
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Voltage Rating:</span>
                          <span className="text-zinc-200">{comp.voltageRating}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Operating V:</span>
                          <span className="text-zinc-200">{comp.operatingVoltage}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Idle Current:</span>
                          <span className="text-cyan-400">{comp.currentDrawIdle}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 block text-[10px]">Peak / Stall Current:</span>
                          <span className="text-amber-400">{comp.currentDrawMax}</span>
                        </div>
                      </div>

                      {/* Key Pin Functions */}
                      <div className="mt-2.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                          Pin Interface:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {comp.pinFunctions.map((pin, pIdx) => (
                            <span
                              key={pIdx}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/90 text-zinc-300 border border-zinc-700/60"
                            >
                              {pin}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Datasheet Snippet */}
                      <p className="mt-2 text-xs text-zinc-400 leading-relaxed italic">
                        {comp.datasheetSnippet}
                      </p>
                    </div>

                    {comp.criticalNotes && (
                      <div className="p-2 rounded bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-300 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                        <span>{comp.criticalNotes}</span>
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
            {/* Progress Bar & Header Controls */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 sm:p-4 md:p-5 space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {isCircuitComplete ? (
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/90 px-2.5 py-0.5 rounded-full border border-emerald-700/80 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        All {totalWiringSteps} Wires Connected
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/80">
                        Wire {activeStep} of {totalWiringSteps}
                      </span>
                    )}
                    <span className="text-xs text-zinc-400 font-mono">
                      ({isCircuitComplete ? 100 : Math.round((activeStep / totalWiringSteps) * 100)}% Complete)
                    </span>
                  </div>
                  <h3
                    className="text-sm sm:text-base md:text-lg font-bold text-zinc-100 mt-1 truncate"
                    title={isCircuitComplete ? 'Circuit Fully Assembled & Energized' : currentStepData?.title}
                  >
                    {isCircuitComplete ? 'Circuit Fully Assembled & Energized' : currentStepData?.title}
                  </h3>
                </div>

                {/* Interactive Controls */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={handlePrevWire}
                    disabled={!isCircuitComplete && activeStep <= 1}
                    className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-zinc-200 text-xs sm:text-sm font-semibold border border-zinc-700 shadow-sm transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Prev Wire</span>
                  </button>

                  {isCircuitComplete ? (
                    <button
                      disabled
                      className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-950/80 text-emerald-300 text-xs sm:text-sm font-bold border border-emerald-700/80 shadow-inner opacity-90 cursor-default"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Circuit Energized</span>
                    </button>
                  ) : activeStep >= totalWiringSteps ? (
                    <button
                      onClick={handleNextWire}
                      className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-900/60 border border-emerald-400/60 ring-2 ring-emerald-400/40 animate-pulse transition-all active:scale-95 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-emerald-200" />
                      <span>Finish Circuit (Energize)</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleNextWire}
                      className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-cyan-950/50 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Next Wire</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={handleAutoAssembleAll}
                    disabled={isCircuitComplete}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none text-emerald-400 text-xs sm:text-sm font-medium border border-zinc-700 transition-colors cursor-pointer"
                    title="Skip to fully assembled circuit"
                  >
                    <FastForward className="w-4 h-4" />
                    <span className="hidden sm:inline">Auto-Assemble</span>
                  </button>

                  <button
                    onClick={handleResetWiring}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700 transition-colors cursor-pointer"
                    title="Reset to Step 1"
                    aria-label="Reset Wiring to Step 1"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Percentage Progress Track */}
              <div className="w-full h-2.5 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCircuitComplete
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 w-full'
                      : 'bg-gradient-to-r from-cyan-500 via-amber-500 to-emerald-400'
                  }`}
                  style={{ width: `${isCircuitComplete ? 100 : (activeStep / totalWiringSteps) * 100}%` }}
                />
              </div>

              {/* Scrollable Step Indicator Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1 custom-scrollbar">
                {activeGuide.wiringSequence.map((step) => {
                  const isDone = isCircuitComplete || step.stepNumber < activeStep;
                  const isCurrent = !isCircuitComplete && step.stepNumber === activeStep;
                  return (
                    <button
                      key={step.stepNumber}
                      onClick={() => handleSetWiringStep(step.stepNumber)}
                      title={`Wire ${step.stepNumber}: ${step.title}`}
                      className={`h-7 px-2.5 rounded-md font-mono text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500 text-zinc-950 font-bold ring-2 ring-amber-400/50'
                          : isDone
                            ? 'bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700'
                            : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 border border-zinc-800/80'
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3" />}
                      <span>#{step.stepNumber}</span>
                      <span
                        className="w-2 h-2 rounded-full border border-black/30"
                        style={{ backgroundColor: step.colorHex }}
                      />
                    </button>
                  );
                })}

                {/* Complete Pill */}
                <button
                  onClick={() => handleSetWiringStep(-1)}
                  title="Circuit Fully Assembled & Energized"
                  className={`h-7 px-2.5 rounded-md font-mono text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    isCircuitComplete
                      ? 'bg-emerald-500 text-zinc-950 font-bold ring-2 ring-emerald-400/50'
                      : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 border border-zinc-800/80'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Complete</span>
                </button>
              </div>
            </div>

            {/* Prominent Celebratory Card when Circuit is Complete */}
            {isCircuitComplete && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-zinc-900 border-2 border-emerald-500/80 shadow-2xl space-y-4 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner shrink-0">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-zinc-950 text-xs font-bold font-mono uppercase tracking-wider">
                          All Systems Wired & Checked
                        </span>
                        <span className="text-xs text-emerald-400 font-mono font-semibold">
                          100% Assembled
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">
                        Circuit Fully Assembled (All {totalWiringSteps} Wires Connected & Energized)
                      </h3>
                      <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                        All point-to-point connections have been placed according to the electrical schematic. The circuit netlist is fully closed and ready for safety verification.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress bar at 100% */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-mono text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Assembly Progress:</span>
                    </span>
                    <span className="font-bold">{totalWiringSteps} of {totalWiringSteps} Wires Placed (100%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-950 rounded-full border border-emerald-900/60 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      setActiveStage('netlist');
                      soundFX.playTap();
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-semibold border border-purple-400/50 shadow-md shadow-purple-950/50 transition-all active:scale-95 cursor-pointer"
                  >
                    <ListTree className="w-4 h-4 text-purple-200" />
                    <span>Inspect Netlist Table</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveStage('preflight');
                      soundFX.playTap();
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold border border-emerald-400/50 shadow-md shadow-emerald-950/50 transition-all active:scale-95 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    <span>Run Hardware Pre-Flight</span>
                  </button>

                  <button
                    onClick={() => {
                      handleSetWiringStep(1);
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-medium border border-zinc-700 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-cyan-400" />
                    <span>Step-by-Step Replay (Wire 1)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Current Step Big Card */}
            {currentStepData && (
              <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 shadow-xl relative overflow-hidden">
                <div
                  className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
                  style={{ backgroundColor: currentStepData.colorHex }}
                />

                {/* Step Metadata Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {isCircuitComplete && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs font-mono font-bold">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Final Wire #{currentStepData.stepNumber}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/90 border border-zinc-700/80 text-xs font-mono">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: currentStepData.colorHex }}
                    />
                    <span className="font-semibold text-zinc-200">
                      {currentStepData.colorName} ({currentStepData.colorHex})
                    </span>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-mono uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">
                    {currentStepData.wireType} WIRE
                  </span>

                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Gauge: {currentStepData.gauge}
                  </span>
                </div>

                {/* FROM -> TO Big Connection Terminal Card */}
                <div
                  className={`grid gap-2.5 sm:gap-3 items-center bg-zinc-950/80 border border-zinc-800 p-3 sm:p-4 rounded-xl ${
                    layout === 'split' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-11'
                  }`}
                >
                  {/* FROM Terminal */}
                  <div
                    className={`${
                      layout === 'split' ? 'w-full' : 'lg:col-span-5'
                    } bg-zinc-900 p-3 sm:p-3.5 rounded-xl border border-zinc-800 space-y-1 min-w-0`}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block truncate">
                      Connect Wire Lead 1 (FROM):
                    </span>
                    <div className="text-xs sm:text-sm md:text-base font-bold font-mono text-zinc-100 flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                      <span className="break-words font-semibold text-zinc-100">{currentStepData.from}</span>
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div
                    className={`${
                      layout === 'split' ? 'w-full py-0.5' : 'lg:col-span-1 py-1 lg:py-0'
                    } flex justify-center shrink-0`}
                  >
                    <div className="p-1.5 rounded-full bg-zinc-800 text-cyan-400 border border-zinc-700 shadow-sm">
                      <ArrowRight
                        className={`w-4 h-4 ${layout === 'split' ? 'rotate-90' : 'rotate-90 lg:rotate-0'}`}
                      />
                    </div>
                  </div>

                  {/* TO Terminal */}
                  <div
                    className={`${
                      layout === 'split' ? 'w-full' : 'lg:col-span-5'
                    } bg-zinc-900 p-3 sm:p-3.5 rounded-xl border border-zinc-800 space-y-1 min-w-0`}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block truncate">
                      Connect Wire Lead 2 (TO):
                    </span>
                    <div className="text-xs sm:text-sm md:text-base font-bold font-mono text-cyan-300 flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="break-words font-semibold text-cyan-300">{currentStepData.to}</span>
                    </div>
                  </div>
                </div>

                {/* Step Action Description */}
                <div className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                  {currentStepData.description}
                </div>

                {/* First-Principles Engineering Rationale Box */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-zinc-900/60 to-zinc-900 border border-cyan-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>Physical Computing Engineering Rationale:</span>
                  </div>
                  <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-sans">
                    {currentStepData.engineeringReason}
                  </p>
                </div>

                {/* Caution Alert if Present */}
                {currentStepData.cautionAlert && (
                  <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-200 block">
                        Hardware Safety Warning:
                      </span>
                      {currentStepData.cautionAlert}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            STAGE 3: SCHEMATIC NETLIST
        ===================================================================== */}
        {activeStage === 'netlist' && (
          <div className="space-y-4">
            {/* Header, Search & Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={netlistSearch}
                    onChange={(e) => setNetlistSearch(e.target.value)}
                    placeholder="Search nets, pins, color..."
                    className="w-full bg-zinc-950 border border-zinc-700/80 text-zinc-200 text-xs rounded-lg pl-9 pr-3 py-2 font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Domain Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {['ALL', 'POWER', 'GROUND', 'ANALOG', 'DIGITAL_IO', 'PWM', 'I2C_BUS'].map(
                  (domain) => (
                    <button
                      key={domain}
                      onClick={() => {
                        setNetlistDomainFilter(domain);
                        soundFX.playTap();
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                        netlistDomainFilter === domain
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {domain}
                    </button>
                  )
                )}

                {/* Copy Netlist Button */}
                <button
                  onClick={handleCopyNetlist}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all ml-auto md:ml-2"
                >
                  {netlistCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Netlist</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Netlist Data Table */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-inner">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="py-3 px-4">Net ID</th>
                      <th className="py-3 px-4">Net Name</th>
                      <th className="py-3 px-4">Signal Domain</th>
                      <th className="py-3 px-4">From Pin</th>
                      <th className="py-3 px-4">To Pin</th>
                      <th className="py-3 px-4">Color / Gauge</th>
                      <th className="py-3 px-4">Electrical Function</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70 font-mono text-zinc-300">
                    {filteredNetlist.map((net: NetlistEntry, idx: number) => (
                      <tr key={idx} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-purple-400 whitespace-nowrap">
                          {net.netId}
                        </td>
                        <td className="py-3 px-4 font-semibold text-zinc-100 whitespace-nowrap">
                          {net.netName}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] border ${
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
                        <td className="py-3 px-4 text-zinc-200 whitespace-nowrap">{net.fromPin}</td>
                        <td className="py-3 px-4 text-cyan-300 whitespace-nowrap">{net.toPin}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-zinc-300 block">{net.wireColor}</span>
                          <span className="text-[10px] text-zinc-400 block">{net.wireGauge}</span>
                        </td>
                        <td className="py-3 px-4 font-sans text-xs text-zinc-300 min-w-[200px]">
                          {net.electricalFunction}
                        </td>
                      </tr>
                    ))}
                    {filteredNetlist.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-zinc-400 font-sans">
                          No nets match the filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
              <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-zinc-900 border-2 border-emerald-500/80 shadow-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left animate-in fade-in zoom-in-95 duration-300">
                <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-zinc-950 text-xs font-bold uppercase font-mono tracking-wider">
                      ALL SYSTEMS GO
                    </span>
                    <span className="text-xs text-emerald-400 font-mono">100% Verified</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    Hardware Pre-Flight Safety Verification Complete
                  </h3>
                  <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-sans">
                    Ground bonds verified, capacitor polarities checked, power rails segregated, and
                    mechanical clearances confirmed. Circuit is cleared for power-up and firmware
                    flashing!
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-900/60 flex items-center justify-between gap-3 text-xs text-amber-300">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Hardware Pre-Flight In Progress: Verify all {totalChecks} checkpoints before
                    applying DC power to prevent component destruction.
                  </span>
                </div>
                <span className="font-mono font-bold text-amber-400 whitespace-nowrap">
                  {verifiedCount} of {totalChecks} Checked
                </span>
              </div>
            )}

            {/* Checklist Action Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">
                    Pre-Flight Safety Verification Points
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Progress: {verifiedCount}/{totalChecks} Verified ({Math.round((verifiedCount / totalChecks) * 100)}%)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCheckAll}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-medium border border-zinc-700 transition-colors"
                >
                  Verify All Points
                </button>
                <button
                  onClick={handleResetChecklist}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
                >
                  Reset Checklist
                </button>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {activeGuide.preFlightChecklist.map((item: PreFlightCheckItem) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheckItem(item.id)}
                    className={`p-4 md:p-5 rounded-xl border transition-all cursor-pointer select-none space-y-3 ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-800/80 hover:border-emerald-700'
                        : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5">
                        {isChecked ? (
                          <div className="w-5 h-5 rounded-md bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold shadow-sm">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-md border-2 border-zinc-600 bg-zinc-950/80 hover:border-zinc-400 transition-colors" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs md:text-sm font-bold ${
                              isChecked ? 'text-emerald-300' : 'text-zinc-100'
                            }`}
                          >
                            {item.title}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-wider">
                            {item.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                          {item.instruction}
                        </p>
                      </div>
                    </div>

                    {/* Danger vs Verified Explanation */}
                    <div
                      className={`grid gap-2 text-xs font-sans ${
                        layout === 'split' ? 'grid-cols-1 pl-0 sm:pl-8' : 'grid-cols-1 md:grid-cols-2 pl-8'
                      }`}
                    >
                      <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300">
                        <span className="font-semibold text-rose-400 block mb-0.5">
                          Potential Damage If Skipped:
                        </span>
                        {item.potentialDamageIfSkipped}
                      </div>

                      <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-zinc-300">
                        <span className="font-semibold text-emerald-400 block mb-0.5">
                          Verified Condition:
                        </span>
                        {item.verifiedExplanation}
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
      <div className="bg-zinc-900/90 border-t border-zinc-800 p-3.5 px-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isCircuitComplete ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
          <span>Experiment: {activeGuide.experimentId}</span>
          <span>•</span>
          <span>
            {isCircuitComplete
              ? `All ${totalWiringSteps} Wires Active (Circuit Energized)`
              : `Wire ${activeStep} of ${totalWiringSteps}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>Wokwi Virtual Breadboard Sync Active</span>
        </div>
      </div>
    </div>
  );
};
