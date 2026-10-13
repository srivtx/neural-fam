/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * RoboticsHardwareLabView:
 * A dedicated first-principles laboratory page for robotics and physical computing experiments.
 * Features 8 canonical hardware experiments with real-time 60 FPS visual physics simulation,
 * authentic Wokwi vector breadboard & wire-by-wire project sequencer, 4-channel digital logic analyzer,
 * DSO oscilloscope, production-grade non-blocking C++ firmware studio, and fault injection matrix.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Bot,
  Cpu,
  Flame,
  Radar,
  Compass,
  Activity,
  RotateCcw,
  Scale,
  Sparkles,
  Zap,
  Layers,
  Code2,
  Copy,
  Check,
  Download,
  AlertTriangle,
  BookOpen,
  Info,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Terminal,
  Binary,
  Wrench,
  Gauge,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Split,
  Monitor,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import {
  ROBOTICS_EXPERIMENTS,
  RoboticsExperiment,
} from '../data/roboticsExperimentsData';
import {
  RoboticsHardwareSimCanvas,
  HardwareFaults,
} from './RoboticsHardwareSimCanvas';
import { SerialMonitorFaultsPanel } from './SerialMonitorFaultsPanel';
import { DigitalLogicAnalyzer } from './DigitalLogicAnalyzer';
import { WokwiVirtualBreadboard } from './WokwiVirtualBreadboard';
import { WokwiProjectBuilder } from './WokwiProjectBuilder';
import { MathView } from './MathView';
import { CodeBlock } from './CodeBlock';
import { soundFX } from '../utils/audio';
import { copyTextToClipboard } from '../utils/clipboard';

export type StudioMode =
  | 'breadboard_build'
  | 'physics_sim'
  | 'instrument_bench'
  | 'firmware_studio'
  | 'faults_matrix';

export const RoboticsHardwareLabView: React.FC = () => {
  const [selectedExpId, setSelectedExpId] = useState<string>(ROBOTICS_EXPERIMENTS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [studioMode, setStudioMode] = useState<StudioMode>('breadboard_build');
  const [currentWiringStep, setCurrentWiringStep] = useState<number>(1);
  const [benchInstrument, setBenchInstrument] = useState<'logic_analyzer' | 'serial_console' | 'split_bench'>('logic_analyzer');
  const [activeFaults, setActiveFaults] = useState<HardwareFaults>({
    groundBounce: false,
    opticalOcclusion: false,
    acousticMultipath: false,
    inductiveSpike: false,
    thermalDrift: false,
  });
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [workbenchLayout, setWorkbenchLayout] = useState<'split' | 'stacked'>('split');
  const [isStudioMaximized, setIsStudioMaximized] = useState<boolean>(false);

  // Listen for Escape key to close maximized studio view cleanly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isStudioMaximized) {
        setIsStudioMaximized(false);
        soundFX.playTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStudioMaximized]);

  // Lock background body scroll when studio is maximized
  useEffect(() => {
    if (isStudioMaximized) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isStudioMaximized]);

  const activeExp = useMemo(() => {
    return ROBOTICS_EXPERIMENTS.find((e) => e.id === selectedExpId) || ROBOTICS_EXPERIMENTS[0];
  }, [selectedExpId]);

  const currentExpIndex = useMemo(() => {
    return ROBOTICS_EXPERIMENTS.findIndex((e) => e.id === selectedExpId);
  }, [selectedExpId]);

  const filteredExperiments = useMemo(() => {
    if (selectedCategory === 'all') return ROBOTICS_EXPERIMENTS;
    return ROBOTICS_EXPERIMENTS.filter((e) => e.category === selectedCategory);
  }, [selectedCategory]);

  const handleSelectExperiment = (exp: RoboticsExperiment) => {
    setSelectedExpId(exp.id);
    setCurrentWiringStep(1);
    soundFX.playTap();
  };

  const handlePrevExperiment = () => {
    if (currentExpIndex > 0) {
      handleSelectExperiment(ROBOTICS_EXPERIMENTS[currentExpIndex - 1]);
    }
  };

  const handleNextExperiment = () => {
    if (currentExpIndex < ROBOTICS_EXPERIMENTS.length - 1) {
      handleSelectExperiment(ROBOTICS_EXPERIMENTS[currentExpIndex + 1]);
    }
  };

  const handleCopyCode = async () => {
    const ok = await copyTextToClipboard(activeExp.arduinoCode);
    if (ok) {
      setIsCopied(true);
      soundFX.playSuccess();
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadCode = () => {
    const blob = new Blob([activeExp.arduinoCode], { type: 'text/x-c++src' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeExp.id}.ino`;
    link.click();
    URL.revokeObjectURL(url);
    soundFX.playTap();
  };

  const activeFaultCount = useMemo(() => {
    return Object.values(activeFaults).filter(Boolean).length;
  }, [activeFaults]);

  const renderIcon = (name: string, className: string = 'w-5 h-5') => {
    switch (name) {
      case 'Flame':
        return <Flame className={className} />;
      case 'Radar':
        return <Radar className={className} />;
      case 'Bot':
        return <Bot className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      case 'RotateCcw':
        return <RotateCcw className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'Scale':
        return <Scale className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // Mode 2 Content Renderer: 60 FPS Kinematics & Physics Simulation
  const renderPhysicsSimContent = () => (
    <>
      {activeFaultCount > 0 && (
        <div className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-xs">
          <span className="flex items-center gap-2 text-rose-300 font-mono">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Hardware Faults Active ({activeFaultCount}):</strong> Injected anomalies are distorting canvas physics &amp; oscilloscope traces.
            </span>
          </span>
          <button
            onClick={() => {
              setStudioMode('faults_matrix');
              soundFX.playTap();
            }}
            className="text-xs font-mono font-bold text-rose-400 hover:text-rose-300 underline cursor-pointer shrink-0 ml-3"
          >
            Manage Faults Matrix →
          </button>
        </div>
      )}

      {/* 60 FPS Physics Canvas */}
      <RoboticsHardwareSimCanvas experiment={activeExp} activeFaults={activeFaults} />

      {/* Live Oscilloscope Probe & Channel Inspector */}
      <div className="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-200/60 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block">
                Microcontroller Signal Acquisition
              </span>
              <h3 className="text-sm sm:text-base font-bold text-ink-900 dark:text-white">
                Digital Storage Oscilloscope (DSO) Probe Channels
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Auto-Triggered · 60 Hz Sample Stream</span>
            </div>
            <button
              onClick={() => {
                setStudioMode('instrument_bench');
                setBenchInstrument('logic_analyzer');
                soundFX.playTap();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-500 text-white shadow-xs hover:bg-brand-400 cursor-pointer"
              title="Switch to Virtual Instrument Bench"
            >
              <Binary className="w-3.5 h-3.5" />
              <span>Logic Analyzer Bench →</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {activeExp.oscilloscopeChannels.map((ch, idx) => (
            <div
              key={ch.id}
              className="p-4 rounded-2xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md text-white shadow-xs" style={{ backgroundColor: ch.color }}>
                    CH {idx + 1}
                  </span>
                  <span className="text-[11px] font-mono text-ink-500 dark:text-ink-400 font-medium">
                    [{ch.rangeMin} → {ch.rangeMax} {ch.unit}]
                  </span>
                </div>
                <h4 className="text-xs font-bold text-ink-900 dark:text-white">{ch.name}</h4>
                <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">{ch.description}</p>
              </div>

              <div className="pt-2 border-t border-ink-200/40 dark:border-white/5 flex items-center justify-between text-[10px] font-mono text-ink-500 dark:text-ink-400">
                <span>Probe Impedance: 10 MΩ</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Synced with HUD</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/15 text-xs text-brand-900 dark:text-brand-200">
          <Info className="w-4 h-4 shrink-0 text-brand-500" />
          <span>
            <strong>Oscilloscope HUD Guide:</strong> The real-time waveform display at the bottom of the canvas renders a circular rolling buffer of the past 180 frames. Use the <strong>1x / 2x / 4x timebase selector</strong> on the canvas to adjust horizontal sweep frequency.
          </span>
        </div>
      </div>

      {/* Physics Formula & Transduction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physics Formula Card */}
        <div className="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Governing Physical Law</span>
          </div>
          <h3 className="text-base font-bold text-ink-900 dark:text-white">{activeExp.physics.governingLaw}</h3>
          <div className="p-4 rounded-2xl bg-ink-900/90 dark:bg-black/80 border border-ink-800 text-center font-mono">
            <MathView math={activeExp.physics.equation} display={true} className="text-brand-300 text-sm" />
          </div>
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
            {activeExp.physics.equationExplanation}
          </p>
        </div>

        {/* Physical Transduction Chain */}
        <div className="p-6 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>The Step-by-Step Transduction Chain</span>
          </div>
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed font-medium">
            {activeExp.physics.physicalTransduction}
          </p>

          {/* Socratic Questions */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider block">
              Socratic Hardware Thought Experiment
            </span>
            {activeExp.socraticQuestions.map((q, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 space-y-1">
                <strong className="text-xs text-ink-900 dark:text-white block font-medium">Q: {q.question}</strong>
                <p className="text-xs text-ink-600 dark:text-ink-300">A: {q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // Mode 3 Content Renderer: Virtual Instrument Bench
  const renderInstrumentBenchContent = () => (
    <>
      {/* Instrument Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-brand-500 uppercase tracking-wider block">
              Virtual Multi-Instrument Bench
            </span>
            <h3 className="text-sm font-bold text-ink-900 dark:text-white">
              Synchronous Signal Probes &amp; Telemetry Monitors
            </h3>
          </div>
        </div>

        {/* Instrument View Switcher */}
        <div className="flex items-center gap-1.5 bg-ink-100 dark:bg-ink-950 p-1.5 rounded-xl border border-ink-200 dark:border-white/10">
          <button
            onClick={() => {
              setBenchInstrument('logic_analyzer');
              soundFX.playTap();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              benchInstrument === 'logic_analyzer'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>4-CH Logic Analyzer</span>
          </button>

          <button
            onClick={() => {
              setBenchInstrument('serial_console');
              soundFX.playTap();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              benchInstrument === 'serial_console'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>UART Console &amp; SFRs</span>
          </button>

          <button
            onClick={() => {
              setBenchInstrument('split_bench');
              soundFX.playTap();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              benchInstrument === 'split_bench'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Dual Bench View</span>
          </button>
        </div>
      </div>

      {/* Instrument Viewport */}
      {benchInstrument === 'logic_analyzer' && (
        <DigitalLogicAnalyzer
          experiment={activeExp}
          onSelectExperiment={(expId) => {
            setSelectedExpId(expId);
            setCurrentWiringStep(1);
          }}
        />
      )}

      {benchInstrument === 'serial_console' && (
        <SerialMonitorFaultsPanel
          experiment={activeExp}
          activeFaults={activeFaults}
          onToggleFault={(f) => setActiveFaults((prev) => ({ ...prev, [f]: !prev[f] }))}
          onResetFaults={() =>
            setActiveFaults({
              groundBounce: false,
              opticalOcclusion: false,
              acousticMultipath: false,
              inductiveSpike: false,
              thermalDrift: false,
            })
          }
          onSetAllFaults={(val) =>
            setActiveFaults({
              groundBounce: val,
              opticalOcclusion: val,
              acousticMultipath: val,
              inductiveSpike: val,
              thermalDrift: val,
            })
          }
        />
      )}

      {benchInstrument === 'split_bench' && (
        <div className="space-y-6">
          <DigitalLogicAnalyzer
            experiment={activeExp}
            onSelectExperiment={(expId) => {
              setSelectedExpId(expId);
              setCurrentWiringStep(1);
            }}
          />
          <div className="p-4 rounded-2xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 space-y-4">
            <h4 className="text-xs font-mono font-bold text-brand-500 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>Synchronous ATmega328P Serial Stream</span>
            </h4>
            <SerialMonitorFaultsPanel
              experiment={activeExp}
              activeFaults={activeFaults}
              onToggleFault={(f) => setActiveFaults((prev) => ({ ...prev, [f]: !prev[f] }))}
              onResetFaults={() =>
                setActiveFaults({
                  groundBounce: false,
                  opticalOcclusion: false,
                  acousticMultipath: false,
                  inductiveSpike: false,
                  thermalDrift: false,
                })
              }
              onSetAllFaults={(val) =>
                setActiveFaults({
                  groundBounce: val,
                  opticalOcclusion: val,
                  acousticMultipath: val,
                  inductiveSpike: val,
                  thermalDrift: val,
                })
              }
            />
          </div>
        </div>
      )}
    </>
  );

  // Mode 4 Content Renderer: Production Firmware Studio
  const renderFirmwareStudioContent = () => (
    <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ink-200/60 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-4 h-4" />
              Production Microcontroller Firmware
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              Non-Blocking 115200 Baud
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-ink-900 dark:text-white mt-1">
            {activeExp.id}.ino
          </h3>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ink-100 hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-ink-900 dark:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Source'}</span>
          </button>
          <button
            onClick={handleDownloadCode}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-brand-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download .ino File</span>
          </button>
        </div>
      </div>

      {/* Architecture Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 space-y-1">
          <span className="text-[10px] font-mono font-bold text-brand-500 uppercase tracking-wider block">
            Architecture Pattern
          </span>
          <p className="text-xs font-semibold text-ink-900 dark:text-white">
            {activeExp.firmwareArchitecture.architecturePattern}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 space-y-1">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider block">
            Hardware Timer Registers
          </span>
          <p className="text-xs font-semibold text-ink-900 dark:text-white">
            {activeExp.firmwareArchitecture.timerUsage}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 space-y-1">
          <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-wider block">
            Interrupt Vector Map
          </span>
          <p className="text-xs font-semibold text-ink-900 dark:text-white">
            {activeExp.firmwareArchitecture.interruptMap}
          </p>
        </div>
      </div>

      {/* 4-Part Pedagogical Architecture Breakdown */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <h4 className="text-xs font-mono font-bold text-brand-500 uppercase tracking-wider">
            Line-by-Line Pedagogical Architecture Breakdown
          </h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeExp.firmwareArchitecture.annotatedBreakdown.map((section, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-surface dark:bg-ink-950/70 border border-ink-200 dark:border-white/10 space-y-3 flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-400 border border-brand-500/20">
                    0{idx + 1} · {section.section}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-ink-900 dark:bg-black/90 border border-ink-800 font-mono text-[11px] text-ink-200 overflow-x-auto no-scrollbar">
                  <pre>{section.codeSnippet}</pre>
                </div>
                <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
                  {section.explanation}
                </p>
              </div>

              <div className="pt-2.5 border-t border-ink-200/50 dark:border-white/5 text-[11px] text-emerald-600 dark:text-emerald-400">
                <strong className="block text-[10px] font-mono uppercase font-bold text-emerald-500 mb-0.5">
                  Production Engineering Rationale:
                </strong>
                {section.realWorldRationale}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Source Code Block */}
      <div className="space-y-3 pt-4 border-t border-ink-200/60 dark:border-white/10">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold text-ink-700 dark:text-ink-300 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            <span>Complete Compilable Source (`{activeExp.id}.ino`)</span>
          </h4>
          <span className="text-[10px] font-mono text-ink-500">
            Target: ATmega328P (16 MHz) · Baud: 115200
          </span>
        </div>
        <div className="rounded-2xl overflow-hidden border border-ink-800 shadow-xl">
          <CodeBlock
            code={activeExp.arduinoCode}
            language="cpp"
            filename={`${activeExp.id}.ino`}
          />
        </div>
      </div>
    </div>
  );

  // Mode 5 Content Renderer: Hardware Traps & Fault Matrix
  const renderFaultsMatrixContent = () => (
    <>
      {/* Fault Matrix Banner & Interactive Toggles */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200/60 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Silicon &amp; Physical Fault Injection Suite
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                {activeFaultCount} Faults Active
              </span>
            </div>
            <h3 className="text-lg font-bold text-ink-900 dark:text-white mt-0.5">
              Hardware Stress &amp; Boundary Failure Simulator
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveFaults({
                  groundBounce: false,
                  opticalOcclusion: false,
                  acousticMultipath: false,
                  inductiveSpike: false,
                  thermalDrift: false,
                });
                soundFX.playTap();
              }}
              className="px-3 py-1.5 rounded-xl bg-ink-100 hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-ink-900 dark:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Clear All Faults
            </button>
            <button
              onClick={() => {
                setActiveFaults({
                  groundBounce: true,
                  opticalOcclusion: true,
                  acousticMultipath: true,
                  inductiveSpike: true,
                  thermalDrift: true,
                });
                soundFX.playTap();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Inject All Faults
            </button>
          </div>
        </div>

        {/* Fault Injection Checkbox Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            {
              key: 'groundBounce' as keyof HardwareFaults,
              label: 'Ground Bounce (L di/dt)',
              desc: 'Rail sag on high current surges',
            },
            {
              key: 'opticalOcclusion' as keyof HardwareFaults,
              label: 'Optical Occlusion / Glare',
              desc: 'Ambient near-IR photon saturation',
            },
            {
              key: 'acousticMultipath' as keyof HardwareFaults,
              label: 'Acoustic Multipath',
              desc: 'Glancing angle specular bounce',
            },
            {
              key: 'inductiveSpike' as keyof HardwareFaults,
              label: 'Inductive Back-EMF',
              desc: 'DC motor spark EMI resets',
            },
            {
              key: 'thermalDrift' as keyof HardwareFaults,
              label: 'Thermal Drift (dT/dt)',
              desc: 'Silicon amplifier zero-creep',
            },
          ].map((f) => {
            const isActive = activeFaults[f.key];
            return (
              <button
                key={f.key}
                onClick={() => {
                  setActiveFaults((prev) => ({ ...prev, [f.key]: !prev[f.key] }));
                  soundFX.playTap();
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-rose-500/15 border-rose-500 text-rose-200 shadow-md ring-2 ring-rose-500/30'
                    : 'bg-ink-50 dark:bg-ink-950 border-ink-200/60 dark:border-white/5 text-ink-600 dark:text-ink-400 hover:border-ink-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-xs font-bold">{f.label}</strong>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isActive ? 'bg-rose-500 animate-ping' : 'bg-ink-400 dark:bg-ink-600'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-ink-500 dark:text-ink-400">{f.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hardware Reality Traps Catalog */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Known Hardware Reality Traps &amp; Physical Mitigations</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeExp.hardwareTraps.map((t, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-surface dark:bg-ink-900 border border-amber-500/20 space-y-2.5 shadow-xs"
            >
              <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Trap #{idx + 1}: {t.trap}</span>
              </div>
              <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
                <strong className="text-ink-900 dark:text-white font-semibold">Physical Cause:</strong> {t.physicalReason}
              </p>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300">
                <strong className="block text-emerald-700 dark:text-emerald-400 font-semibold mb-0.5">
                  Production Solution:
                </strong>
                {t.solution}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded Serial Faults Inspector */}
      <SerialMonitorFaultsPanel
        experiment={activeExp}
        activeFaults={activeFaults}
        onToggleFault={(f) => setActiveFaults((prev) => ({ ...prev, [f]: !prev[f] }))}
        onResetFaults={() =>
          setActiveFaults({
            groundBounce: false,
            opticalOcclusion: false,
            acousticMultipath: false,
            inductiveSpike: false,
            thermalDrift: false,
          })
        }
        onSetAllFaults={(val) =>
          setActiveFaults({
            groundBounce: val,
            opticalOcclusion: val,
            acousticMultipath: val,
            inductiveSpike: val,
            thermalDrift: val,
          })
        }
      />
    </>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-ink-900 dark:text-white">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-ink-900 to-brand-950 border border-brand-500/25 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/35 text-brand-300 text-xs font-semibold uppercase tracking-wider font-mono">
            <Bot className="w-3.5 h-3.5" />
            Robotics &amp; Physical Computing Laboratory
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
            From Transducers to Kinematics: <span className="text-brand-400">Embodied Physical Robotics</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-300 max-w-3xl leading-relaxed">
            Software alone cannot touch matter. In robotics, microcontrollers interface with the physical universe
            through <strong>transducers</strong> (converting photons, acoustic waves, and Lorentz forces into volts)
            and <strong>actuators</strong> (converting electrical pulses into kinetic mechanical torque).
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All 8 Experiments' },
              { id: 'transducers_actuators', label: 'Transducers & Actuators' },
              { id: 'autonomous_navigation', label: 'Autonomous Navigation' },
              { id: 'inertial_control', label: 'Inertial Navigation & PID' },
              { id: 'precision_force', label: 'Precision Force & Touch' },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    soundFX.playTap();
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                      : 'bg-white/5 hover:bg-white/10 text-ink-300 border border-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Experiment Selector Carousel Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {filteredExperiments.map((exp) => {
          const isSelected = exp.id === selectedExpId;
          return (
            <button
              key={exp.id}
              onClick={() => handleSelectExperiment(exp)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 dark:border-brand-400 text-brand-950 dark:text-white shadow-md ring-2 ring-brand-500/30 scale-[1.02]'
                  : 'bg-surface dark:bg-ink-900 border-ink-200 dark:border-white/10 text-ink-700 dark:text-ink-400 hover:border-brand-500/40 hover:bg-ink-50 dark:hover:bg-ink-800/60'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400">
                  0{exp.order}
                </span>
                <div className={isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-ink-500 dark:text-ink-400'}>
                  {renderIcon(exp.iconName, 'w-4 h-4')}
                </div>
              </div>
              <h3 className="text-xs font-bold line-clamp-2 leading-tight text-ink-900 dark:text-white">
                {exp.title}
              </h3>
            </button>
          );
        })}
      </div>

      {/* Active Experiment Main Workbench */}
      {!isStudioMaximized ? (
        <div className="space-y-6">
        {/* Active Experiment Command Deck */}
        <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          {/* Top Metadata Row: Category & Badges on Left, Prev/Next Stepper on Right */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200/60 dark:border-white/10 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/25 uppercase tracking-wider flex items-center gap-1.5">
                {renderIcon(activeExp.iconName, 'w-3.5 h-3.5')}
                <span>Experiment 0{activeExp.order} · {activeExp.categoryLabel}</span>
              </span>

              {activeFaultCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{activeFaultCount} Physical Fault{activeFaultCount > 1 ? 's' : ''} Injected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Hardware State: Nominal</span>
                </span>
              )}
            </div>

            {/* Experiment Stepper Quick Navigation & Universal Maximize */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsStudioMaximized(true);
                  soundFX.playTap();
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30 transition-all cursor-pointer shadow-xs hover:scale-[1.02]"
                title="Maximize Studio: Fullscreen edge-to-edge engineering workspace across all 5 modes (Esc to exit)"
              >
                <Maximize2 className="w-3.5 h-3.5 text-brand-500" />
                <span className="hidden sm:inline">Maximize Studio</span>
                <span className="sm:hidden">Maximize</span>
              </button>

              <div className="flex items-center gap-1.5 bg-ink-100 dark:bg-ink-950 p-1 rounded-xl border border-ink-200 dark:border-white/10">
                <button
                  onClick={handlePrevExperiment}
                  disabled={currentExpIndex === 0}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white hover:bg-ink-200/60 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Previous Experiment"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                <span className="px-2 text-xs font-mono font-bold text-ink-400">
                  0{activeExp.order} / 08
                </span>
                <button
                  onClick={handleNextExperiment}
                  disabled={currentExpIndex === ROBOTICS_EXPERIMENTS.length - 1}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white hover:bg-ink-200/60 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Next Experiment"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Title & Physical Premise */}
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-ink-900 dark:text-white tracking-tight flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shrink-0">
                {renderIcon(activeExp.iconName, 'w-6 h-6')}
              </span>
              <span>{activeExp.title}</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-ink-600 dark:text-ink-300 leading-relaxed max-w-4xl pt-0.5">
              {activeExp.subtitle}
            </p>
          </div>

          {/* Silicon & Physical Specs Chip Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-ink-200/40 dark:border-white/5">
            <div className="p-2.5 rounded-xl bg-ink-50 dark:bg-ink-950/70 border border-ink-200/60 dark:border-white/5 space-y-0.5">
              <span className="text-[10px] font-mono text-ink-500 dark:text-ink-400 uppercase tracking-wider block">Target MCU</span>
              <span className="text-xs font-bold text-ink-900 dark:text-white font-mono">ATmega328P (16 MHz)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-ink-50 dark:bg-ink-950/70 border border-ink-200/60 dark:border-white/5 space-y-0.5">
              <span className="text-[10px] font-mono text-ink-500 dark:text-ink-400 uppercase tracking-wider block">Bus Voltage</span>
              <span className="text-xs font-bold text-ink-900 dark:text-white font-mono">5.0V DC (Vcc Rail)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-ink-50 dark:bg-ink-950/70 border border-ink-200/60 dark:border-white/5 space-y-0.5">
              <span className="text-[10px] font-mono text-ink-500 dark:text-ink-400 uppercase tracking-wider block">Architecture</span>
              <span className="text-xs font-bold text-ink-900 dark:text-white truncate block" title={activeExp.firmwareArchitecture.architecturePattern}>
                {activeExp.firmwareArchitecture.architecturePattern.split('(')[0].trim()}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-ink-50 dark:bg-ink-950/70 border border-ink-200/60 dark:border-white/5 space-y-0.5">
              <span className="text-[10px] font-mono text-ink-500 dark:text-ink-400 uppercase tracking-wider block">Hardware Timer</span>
              <span className="text-xs font-bold text-ink-900 dark:text-white truncate block" title={activeExp.firmwareArchitecture.timerUsage}>
                {activeExp.firmwareArchitecture.timerUsage.split(';')[0].trim()}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Studio Workbench Mode Command Deck (5 Distinct Studio Modes) */}
        <div className="p-2.5 sm:p-3 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 shadow-sm space-y-2.5">
          <div className="px-2 pt-1 pb-0.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-brand-500" />
                <span>Interactive Engineering Workbench Modes</span>
              </span>
              <span className="text-[10px] font-mono text-ink-400 block">
                Select mode to inspect circuit, kinematics, waveforms, firmware, or traps
              </span>
            </div>

            <button
              onClick={() => {
                setIsStudioMaximized(true);
                soundFX.playTap();
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold bg-brand-500 hover:bg-brand-400 text-white shadow-md shadow-brand-500/25 transition-all cursor-pointer hover:scale-[1.02] shrink-0"
              title="Maximize Studio: Fullscreen edge-to-edge engineering workspace across all 5 modes (Esc to exit)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-white" />
              <span>Maximize Studio</span>
              <span className="text-brand-100 font-normal hidden sm:inline">(Fullscreen)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {[
              {
                id: 'breadboard_build' as StudioMode,
                title: 'Virtual Breadboard & Build',
                tag: 'Wokwi Build',
                desc: 'Wire-by-wire circuit sequencer & photorealistic Uno layout',
                icon: Layers,
              },
              {
                id: 'physics_sim' as StudioMode,
                title: '60 FPS Physics & Kinematics',
                tag: 'Live 60 FPS',
                desc: 'Real-time 60 FPS physics engine & DSO analog oscilloscope',
                icon: Zap,
              },
              {
                id: 'instrument_bench' as StudioMode,
                title: 'Virtual Instrument Bench',
                tag: 'Logic / DSO',
                desc: '4-channel digital logic analyzer, microsecond cursors & decoders',
                icon: Activity,
              },
              {
                id: 'firmware_studio' as StudioMode,
                title: 'Production Firmware Studio',
                tag: 'Non-Blocking C++',
                desc: 'Non-blocking C++ state machines, Timer 1 registers & ISRs',
                icon: Code2,
              },
              {
                id: 'faults_matrix' as StudioMode,
                title: 'Hardware Traps & Fault Matrix',
                tag: activeFaultCount > 0 ? `${activeFaultCount} Faults Active` : 'Fault Injection',
                desc: 'Silicon stress matrix, ground bounce & pre-flight checklist',
                icon: AlertTriangle,
              },
            ].map((mode) => {
              const Icon = mode.icon;
              const isActive = studioMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    setStudioMode(mode.id);
                    soundFX.playTap();
                  }}
                  className={`group relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                    isActive
                      ? 'bg-brand-500 text-white border-brand-400 shadow-md shadow-brand-500/25 ring-2 ring-brand-500/30 scale-[1.01]'
                      : 'bg-ink-50/70 dark:bg-ink-950/60 border-ink-200/60 dark:border-white/5 text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800/60 hover:border-brand-500/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:bg-brand-500/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-black/25 text-white'
                          : mode.id === 'faults_matrix' && activeFaultCount > 0
                          ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30 animate-pulse'
                          : 'bg-ink-200/80 dark:bg-white/10 text-ink-600 dark:text-ink-400'
                      }`}
                    >
                      {mode.tag}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className={`text-xs sm:text-sm font-bold tracking-tight ${isActive ? 'text-white' : 'text-ink-900 dark:text-white'}`}>
                      {mode.title}
                    </h3>
                    <p className={`text-[11px] leading-snug line-clamp-2 ${isActive ? 'text-white/80' : 'text-ink-500 dark:text-ink-400'}`}>
                      {mode.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================= */}
        {/* MODE 1: VIRTUAL BREADBOARD & GUIDED WIRE-BY-WIRE BUILD */}
        {/* ================================================================= */}
        {studioMode === 'breadboard_build' && (
          <div className="space-y-5 animate-fade-in">
            {/* Workbench Controls Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 text-xs shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-brand-500 uppercase tracking-wider block">
                      Wokwi-Class Interactive Physical Electronics
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      Step #{currentWiringStep} Active
                    </span>
                  </div>
                  <strong className="text-sm font-bold text-ink-900 dark:text-white block mt-0.5">
                    Photorealistic Solderless Breadboard &amp; Wire Sequencer
                  </strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Layout Toggle Buttons: Split vs Stacked */}
                <div className="flex items-center p-1 bg-ink-100 dark:bg-ink-950 rounded-xl border border-ink-200 dark:border-white/10 text-xs font-mono">
                  <button
                    onClick={() => {
                      setWorkbenchLayout('split');
                      soundFX.playTap();
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      workbenchLayout === 'split'
                        ? 'bg-brand-500 text-white shadow-xs'
                        : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                    title="Split View (Side-by-Side): 60% Breadboard on left + 40% Wire Sequencer on right with zero vertical scrolling"
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Split View (Side-by-Side)</span>
                  </button>
                  <button
                    onClick={() => {
                      setWorkbenchLayout('stacked');
                      soundFX.playTap();
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      workbenchLayout === 'stacked'
                        ? 'bg-brand-500 text-white shadow-xs'
                        : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                    title="Stacked View: Full width breadboard canvas + Full width project builder below"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Stacked View</span>
                  </button>
                </div>

                {/* Maximize Studio / Fullscreen Button */}
                <button
                  onClick={() => {
                    setIsStudioMaximized(true);
                    soundFX.playTap();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-ink-100 dark:bg-ink-950 hover:bg-ink-200 dark:hover:bg-ink-800 text-ink-700 dark:text-ink-200 border border-ink-200 dark:border-white/10 shadow-xs cursor-pointer transition-colors"
                  title="Maximize studio: Edge-to-edge immersive workspace (Esc to exit)"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-brand-500" />
                  <span className="hidden sm:inline">Maximize Studio</span>
                  <span className="sm:hidden">Maximize</span>
                </button>

                {/* Physics Sim Quick Jump */}
                <button
                  onClick={() => {
                    setStudioMode('physics_sim');
                    soundFX.playTap();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold bg-brand-500 hover:bg-brand-400 text-white shadow-xs cursor-pointer transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Run Physics Sim →</span>
                </button>
              </div>
            </div>

            {/* Build Area: Split Side-by-Side or Stacked */}
            {workbenchLayout === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* 60% Breadboard on Left (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-3">
                  <WokwiVirtualBreadboard
                    experimentId={activeExp.id}
                    activeWiringStep={currentWiringStep}
                    onStepChange={(step) => setCurrentWiringStep(step)}
                    interactive={true}
                    showControls={true}
                    isMaximized={false}
                    fitHeight={false}
                    className="w-full shadow-2xl"
                  />
                </div>

                {/* 40% Wire Sequencer on Right (lg:col-span-5) */}
                <div className="lg:col-span-5">
                  <WokwiProjectBuilder
                    experimentId={activeExp.id}
                    currentWiringStep={currentWiringStep}
                    onWiringStepChange={(step) => setCurrentWiringStep(step)}
                    onExperimentChange={(id) => {
                      setSelectedExpId(id);
                      setCurrentWiringStep(1);
                    }}
                    layout="split"
                    isMaximized={false}
                    className="h-full"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <WokwiVirtualBreadboard
                  experimentId={activeExp.id}
                  activeWiringStep={currentWiringStep}
                  onStepChange={(step) => setCurrentWiringStep(step)}
                  interactive={true}
                  showControls={true}
                  isMaximized={false}
                  fitHeight={false}
                  className="w-full shadow-2xl"
                />
                <WokwiProjectBuilder
                  experimentId={activeExp.id}
                  currentWiringStep={currentWiringStep}
                  onWiringStepChange={(step) => setCurrentWiringStep(step)}
                  onExperimentChange={(id) => {
                    setSelectedExpId(id);
                    setCurrentWiringStep(1);
                  }}
                  layout="stacked"
                  isMaximized={false}
                />
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* MODE 2: 60 FPS KINEMATICS & PHYSICS SIMULATION */}
        {/* ================================================================= */}
        {studioMode === 'physics_sim' && (
          <div className="space-y-6 animate-fade-in">
            {renderPhysicsSimContent()}
          </div>
        )}

        {/* ================================================================= */}
        {/* MODE 3: VIRTUAL INSTRUMENT BENCH (LOGIC ANALYZER + DSO + UART) */}
        {/* ================================================================= */}
        {studioMode === 'instrument_bench' && (
          <div className="space-y-6 animate-fade-in">
            {renderInstrumentBenchContent()}
          </div>
        )}

        {/* ================================================================= */}
        {/* MODE 4: PRODUCTION FIRMWARE STUDIO */}
        {/* ================================================================= */}
        {studioMode === 'firmware_studio' && (
          <div className="space-y-6 animate-fade-in">
            {renderFirmwareStudioContent()}
          </div>
        )}

        {/* ================================================================= */}
        {/* MODE 5: HARDWARE TRAPS & FAULT MATRIX */}
        {/* ================================================================= */}
        {studioMode === 'faults_matrix' && (
          <div className="space-y-6 animate-fade-in">
            {renderFaultsMatrixContent()}
          </div>
        )}
      </div>
    ) : (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-surface dark:bg-ink-900 border border-brand-500/25 space-y-3 shadow-md animate-fade-in">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
          <Maximize2 className="w-6 h-6 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-ink-900 dark:text-white">
          Robotics Studio is Active in Fullscreen Maximized Viewport
        </h3>
        <p className="text-xs text-ink-500 dark:text-ink-400 max-w-md mx-auto">
          The interactive breadboard, physics simulation, logic analyzer, and firmware studio are running in edge-to-edge mode.
        </p>
        <button
          onClick={() => {
            setIsStudioMaximized(false);
            soundFX.playTap();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold bg-brand-500 hover:bg-brand-400 text-white shadow-md shadow-brand-500/20 cursor-pointer transition-colors"
        >
          <Minimize2 className="w-4 h-4 text-amber-300" />
          <span>Restore Inline Workbench (Esc)</span>
        </button>
      </div>
    )}

      {/* ================================================================= */}
      {/* IMMERSIVE FULL-SCREEN MAXIMIZED STUDIO MODAL */}
      {/* ================================================================= */}
      {isStudioMaximized && (
        <div className="fixed inset-0 z-50 bg-[#090d16] flex flex-col p-3 sm:p-5 backdrop-blur-2xl overflow-hidden text-ink-100 animate-fade-in">
          {/* Top Bar: Experiment Dropdown, 5 Mode Pills, Mode 1 Layout Toggle + Step Badge, Close / Minimize */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-white/10 shrink-0">
            {/* Left: Experiment Icon, Dropdown Selector (1 to 8), Prev/Next Stepper */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shrink-0">
                {renderIcon(activeExp.iconName, 'w-4 h-4 text-brand-400')}
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <select
                  value={selectedExpId}
                  onChange={(e) => {
                    const exp = ROBOTICS_EXPERIMENTS.find((x) => x.id === e.target.value);
                    if (exp) handleSelectExperiment(exp);
                  }}
                  className="bg-ink-950/90 text-white text-xs font-mono font-bold rounded-xl px-2.5 py-1.5 border border-white/20 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer shadow-inner max-w-[190px] sm:max-w-xs truncate"
                  title="Switch Experiment"
                  aria-label="Switch Experiment"
                >
                  {ROBOTICS_EXPERIMENTS.map((exp) => (
                    <option key={exp.id} value={exp.id} className="bg-ink-950 text-white">
                      {exp.order}. {exp.title}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-0.5 bg-ink-950/80 p-0.5 rounded-xl border border-white/10 shrink-0">
                  <button
                    onClick={handlePrevExperiment}
                    disabled={currentExpIndex === 0}
                    className="p-1 rounded-lg text-ink-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Previous Experiment"
                    aria-label="Previous Experiment"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleNextExperiment}
                    disabled={currentExpIndex === ROBOTICS_EXPERIMENTS.length - 1}
                    className="p-1 rounded-lg text-ink-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                    title="Next Experiment"
                    aria-label="Next Experiment"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Center: 5 Studio Mode Switcher Pills */}
            <div className="flex items-center gap-1 p-1 bg-ink-950/90 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
              {[
                { id: 'breadboard_build' as StudioMode, label: '🔌 Virtual Breadboard' },
                { id: 'physics_sim' as StudioMode, label: '⚡ 60 FPS Physics' },
                { id: 'instrument_bench' as StudioMode, label: '📊 Instrument Bench' },
                { id: 'firmware_studio' as StudioMode, label: '💻 Firmware Studio' },
                { id: 'faults_matrix' as StudioMode, label: '🛡️ Faults Matrix' },
              ].map((pill) => {
                const isActive = studioMode === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => {
                      setStudioMode(pill.id);
                      soundFX.playTap();
                    }}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30 scale-[1.02]'
                        : 'text-ink-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Right: Mode 1 Controls (Split/Stacked + Step Badge) & Close/Minimize Button */}
            <div className="flex items-center gap-2 shrink-0">
              {studioMode === 'breadboard_build' && (
                <>
                  <div className="flex items-center p-0.5 bg-ink-950/80 rounded-xl border border-white/10 text-xs font-mono">
                    <button
                      onClick={() => {
                        setWorkbenchLayout('split');
                        soundFX.playTap();
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        workbenchLayout === 'split'
                          ? 'bg-brand-500 text-white shadow-xs'
                          : 'text-ink-400 hover:text-white'
                      }`}
                      title="Split View (Side-by-Side)"
                    >
                      <Split className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Split</span>
                    </button>
                    <button
                      onClick={() => {
                        setWorkbenchLayout('stacked');
                        soundFX.playTap();
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        workbenchLayout === 'stacked'
                          ? 'bg-brand-500 text-white shadow-xs'
                          : 'text-ink-400 hover:text-white'
                      }`}
                      title="Stacked View (Full width)"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Stacked</span>
                    </button>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap hidden lg:inline-flex">
                    Step #{currentWiringStep} Active
                  </span>
                </>
              )}

              {/* Close / Minimize Button */}
              <button
                onClick={() => {
                  setIsStudioMaximized(false);
                  soundFX.playTap();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all shadow-md cursor-pointer"
                title="Minimize Studio (Esc)"
              >
                <Minimize2 className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Minimize Studio</span>
                <span className="sm:hidden">Exit</span>
                <span className="text-[10px] text-ink-400 font-normal hidden md:inline">(Esc)</span>
              </button>
            </div>
          </div>

          {/* Main Body: Renders the active studioMode in edge-to-edge fullscreen */}
          <div className="flex-1 min-h-0 w-full overflow-hidden pt-3 sm:pt-4">
            {/* Mode 1: Virtual Breadboard & Project Builder */}
            {studioMode === 'breadboard_build' && (
              workbenchLayout === 'split' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full min-h-0">
                  {/* 60% Breadboard Canvas on Left (lg:col-span-7) */}
                  <div className="lg:col-span-7 h-full min-h-0 flex flex-col overflow-y-auto custom-scrollbar pr-1">
                    <WokwiVirtualBreadboard
                      experimentId={activeExp.id}
                      activeWiringStep={currentWiringStep}
                      onStepChange={(step) => setCurrentWiringStep(step)}
                      interactive={true}
                      showControls={true}
                      isMaximized={true}
                      fitHeight={true}
                      className="w-full shadow-2xl shrink-0"
                    />
                  </div>

                  {/* 40% Wire Sequencer on Right (lg:col-span-5) */}
                  <div className="lg:col-span-5 h-full min-h-0 flex flex-col overflow-hidden">
                    <WokwiProjectBuilder
                      experimentId={activeExp.id}
                      currentWiringStep={currentWiringStep}
                      onWiringStepChange={(step) => setCurrentWiringStep(step)}
                      onExperimentChange={(id) => {
                        setSelectedExpId(id);
                        setCurrentWiringStep(1);
                      }}
                      layout="split"
                      isMaximized={true}
                      className="h-full flex flex-col min-h-0"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-0 overflow-y-auto space-y-6 custom-scrollbar pr-2">
                  <WokwiVirtualBreadboard
                    experimentId={activeExp.id}
                    activeWiringStep={currentWiringStep}
                    onStepChange={(step) => setCurrentWiringStep(step)}
                    interactive={true}
                    showControls={true}
                    isMaximized={true}
                    fitHeight={false}
                    className="w-full shadow-2xl"
                  />
                  <WokwiProjectBuilder
                    experimentId={activeExp.id}
                    currentWiringStep={currentWiringStep}
                    onWiringStepChange={(step) => setCurrentWiringStep(step)}
                    onExperimentChange={(id) => {
                      setSelectedExpId(id);
                      setCurrentWiringStep(1);
                    }}
                    layout="stacked"
                    isMaximized={true}
                  />
                </div>
              )
            )}

            {/* Mode 2: Fullscreen 60 FPS Physics Canvas & DSO Oscilloscope */}
            {studioMode === 'physics_sim' && (
              <div className="h-full min-h-0 overflow-y-auto space-y-6 custom-scrollbar pr-2 pb-6 animate-fade-in">
                {renderPhysicsSimContent()}
              </div>
            )}

            {/* Mode 3: Fullscreen 4-Channel Digital Logic Analyzer & Serial UART Console */}
            {studioMode === 'instrument_bench' && (
              <div className="h-full min-h-0 overflow-y-auto space-y-6 custom-scrollbar pr-2 pb-6 animate-fade-in">
                {renderInstrumentBenchContent()}
              </div>
            )}

            {/* Mode 4: Fullscreen Arduino C++ Code Viewer & Architecture Breakdown */}
            {studioMode === 'firmware_studio' && (
              <div className="h-full min-h-0 overflow-y-auto space-y-6 custom-scrollbar pr-2 pb-6 animate-fade-in">
                {renderFirmwareStudioContent()}
              </div>
            )}

            {/* Mode 5: Fullscreen Hardware Fault Injection Matrix */}
            {studioMode === 'faults_matrix' && (
              <div className="h-full min-h-0 overflow-y-auto space-y-6 custom-scrollbar pr-2 pb-6 animate-fade-in">
                {renderFaultsMatrixContent()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
