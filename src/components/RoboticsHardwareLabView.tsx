/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * RoboticsHardwareLabView:
 * A dedicated first-principles laboratory page for robotics and physical computing experiments.
 * Features 8 canonical hardware experiments with real-time 60 FPS visual physics simulation,
 * live digital pin oscilloscope, circuit schematics, hardware trap audits, and runnable Arduino C++ code.
 */

import React, { useState, useMemo } from 'react';
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
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  ROBOTICS_EXPERIMENTS,
  RoboticsExperiment,
} from '../data/roboticsExperimentsData';
import { RoboticsHardwareSimCanvas } from './RoboticsHardwareSimCanvas';
import { MathView } from './MathView';
import { CodeBlock } from './CodeBlock';
import { soundFX } from '../utils/audio';
import { copyTextToClipboard } from '../utils/clipboard';

export const RoboticsHardwareLabView: React.FC = () => {
  const [selectedExpId, setSelectedExpId] = useState<string>(ROBOTICS_EXPERIMENTS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'simulation' | 'transduction' | 'wiring' | 'traps' | 'firmware'>('simulation');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const activeExp = useMemo(() => {
    return ROBOTICS_EXPERIMENTS.find((e) => e.id === selectedExpId) || ROBOTICS_EXPERIMENTS[0];
  }, [selectedExpId]);

  const filteredExperiments = useMemo(() => {
    if (selectedCategory === 'all') return ROBOTICS_EXPERIMENTS;
    return ROBOTICS_EXPERIMENTS.filter((e) => e.category === selectedCategory);
  }, [selectedCategory]);

  const handleSelectExperiment = (exp: RoboticsExperiment) => {
    setSelectedExpId(exp.id);
    soundFX.playTap();
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-ink-900 dark:text-white">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-950 via-ink-900 to-brand-950 border border-brand-500/25 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/35 text-brand-300 text-xs font-semibold uppercase tracking-wider font-mono">
            <Bot className="w-3.5 h-3.5" />
            Robotics & Physical Computing Laboratory
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
      <div className="space-y-6">
        {/* Active Experiment Header Strip */}
        <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                Experiment 0{activeExp.order} · {activeExp.categoryLabel}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-ink-900 dark:text-white flex items-center gap-2">
              {renderIcon(activeExp.iconName, 'w-6 h-6 text-brand-500')}
              <span>{activeExp.title}</span>
            </h2>
            <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-300">
              {activeExp.subtitle}
            </p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-ink-100 dark:bg-ink-950 p-1.5 rounded-2xl border border-ink-200 dark:border-white/10 shrink-0 overflow-x-auto no-scrollbar">
            {[
              { id: 'simulation', label: 'Interactive Sim', icon: Zap },
              { id: 'transduction', label: 'Physics & Law', icon: BookOpen },
              { id: 'wiring', label: 'Circuit & Pinout', icon: Layers },
              { id: 'traps', label: 'Hardware Traps', icon: AlertTriangle },
              { id: 'firmware', label: 'Arduino C++ Code', icon: Code2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    soundFX.playTap();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: INTERACTIVE 60 FPS SIMULATION CANVAS */}
        {activeTab === 'simulation' && (
          <div className="space-y-6 animate-fade-in">
            <RoboticsHardwareSimCanvas experiment={activeExp} />

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
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Auto-Triggered · 60 Hz Sample Stream</span>
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

            {/* Live Transduction Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider block">
                  Input Transducer
                </span>
                <h4 className="text-xs font-bold text-ink-900 dark:text-white">{activeExp.transducerType}</h4>
                <p className="text-xs text-ink-500 dark:text-ink-400">{activeExp.physics.physicalTransduction}</p>
              </div>

              <div className="p-4 rounded-2xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Physical Actuator
                </span>
                <h4 className="text-xs font-bold text-ink-900 dark:text-white">{activeExp.actuatorType}</h4>
                <p className="text-xs text-ink-500 dark:text-ink-400">{activeExp.tagline}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FIRST-PRINCIPLES TRANSDUCTION & LAW */}
        {activeTab === 'transduction' && (
          <div className="space-y-6 animate-fade-in">
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
          </div>
        )}

        {/* TAB 3: CIRCUIT BREADBOARD & WIRING INSPECTOR */}
        {activeTab === 'wiring' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 sm:p-8 rounded-3xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-200/60 dark:border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    Microcontroller Target
                  </span>
                  <h3 className="text-lg font-bold text-ink-900 dark:text-white">{activeExp.wiring.microcontroller}</h3>
                </div>
                <div className="text-right text-xs font-mono text-ink-500">
                  <span>Power: {activeExp.wiring.powerRequirements}</span>
                </div>
              </div>

              {/* Pin Connections Table */}
              <div className="overflow-x-auto no-scrollbar rounded-2xl border border-ink-200 dark:border-white/10">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-ink-100 dark:bg-ink-950 text-ink-700 dark:text-ink-300 border-b border-ink-200 dark:border-white/10">
                    <tr>
                      <th className="p-3">Component</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Pin Connections</th>
                      <th className="p-3">Engineering Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-200/60 dark:divide-white/5 text-ink-700 dark:text-ink-300">
                    {activeExp.wiring.components.map((c, idx) => (
                      <tr key={idx} className="hover:bg-ink-50 dark:hover:bg-white/5 transition-colors">
                        <td className="p-3 font-bold text-ink-900 dark:text-white">{c.name}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-ink-200/80 dark:bg-white/10 text-ink-700 dark:text-ink-300 text-[10px] uppercase font-bold">
                            {c.type}
                          </span>
                        </td>
                        <td className="p-3 text-brand-600 dark:text-brand-400">{c.pinConnection}</td>
                        <td className="p-3 text-ink-600 dark:text-ink-400">{c.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 text-xs text-ink-600 dark:text-ink-300">
                <strong className="text-ink-900 dark:text-white block mb-1">Schematic Logic:</strong>
                {activeExp.wiring.schematicSummary}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HARDWARE REALITY TRAPS */}
        {activeTab === 'traps' && (
          <div className="space-y-4 animate-fade-in">
            {activeExp.hardwareTraps.map((t, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-surface dark:bg-ink-900 border border-amber-500/20 space-y-2 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Hardware Trap #{idx + 1}: {t.trap}</span>
                </div>
                <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
                  <strong className="text-ink-900 dark:text-white font-semibold">Physical Cause:</strong> {t.physicalReason}
                </p>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300">
                  <strong className="block text-emerald-700 dark:text-emerald-400 font-semibold mb-0.5">Physical Solution:</strong>
                  {t.solution}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: PRODUCTION ARDUINO C++ FIRMWARE */}
        {activeTab === 'firmware' && (
          <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200/60 dark:border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 className="w-4 h-4" />
                  Arduino C++ Firmware
                </span>
                <h3 className="text-base font-bold text-ink-900 dark:text-white mt-0.5">{activeExp.id}.ino</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-100 hover:bg-ink-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-ink-900 dark:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .ino</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-ink-800">
              <CodeBlock code={activeExp.arduinoCode} language="cpp" filename={`${activeExp.id}.ino`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
