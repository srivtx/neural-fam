/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Theory Thinking Sanctuary:
 * An interactive first-principles exploration engine teaching researchers how to make
 * the non-linear cognitive leaps that produce breakthrough theories.
 *
 * Connects the continuum from quantum electron mechanics and thermodynamics
 * to biological action potentials, Shannon information, and artificial neural manifolds.
 */

import React, { useState } from 'react';
import {
  Atom,
  Flame,
  Activity,
  Network,
  Cpu,
  Sparkles,
  Compass,
  Brain,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  BookOpen,
  Layers,
  Lightbulb,
  Workflow,
  Target,
  Scale,
  Code2,
  Terminal,
  HelpCircle,
} from 'lucide-react';
import {
  PHYSICAL_PILLARS,
  COGNITIVE_LEAP_PATTERNS,
  PAPER_DECONSTRUCTIONS,
  INVENTION_GYM_EXERCISES,
  THOUGHT_EXPERIMENTS,
} from '../data/epistemologyData';
import { TheoryPhysicalSimCanvas } from './TheoryPhysicalSimCanvas';
import { MathView } from './MathView';
import { soundFX } from '../utils/audio';

type ActiveSection = 'continuum' | 'patterns' | 'deconstructions' | 'gym' | 'gedanken';

export const TheoryThinkingSanctuary: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('continuum');
  const [selectedPillarId, setSelectedPillarId] = useState<string>(PHYSICAL_PILLARS[0].id);
  const [selectedPatternId, setSelectedPatternId] = useState<string>(COGNITIVE_LEAP_PATTERNS[0].id);
  const [selectedPaperId, setSelectedPaperId] = useState<string>(PAPER_DECONSTRUCTIONS[0].id);

  // Gym State
  const [selectedGymId, setSelectedGymId] = useState<string>(INVENTION_GYM_EXERCISES[0].id);
  const [selectedMetaphorId, setSelectedMetaphorId] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  // Gedanken State
  const [selectedGedankenId, setSelectedGedankenId] = useState<string>(THOUGHT_EXPERIMENTS[0].id);

  const activePillar = PHYSICAL_PILLARS.find((p) => p.id === selectedPillarId) || PHYSICAL_PILLARS[0];
  const activePattern = COGNITIVE_LEAP_PATTERNS.find((p) => p.id === selectedPatternId) || COGNITIVE_LEAP_PATTERNS[0];
  const activePaper = PAPER_DECONSTRUCTIONS.find((p) => p.id === selectedPaperId) || PAPER_DECONSTRUCTIONS[0];
  const activeGym = INVENTION_GYM_EXERCISES.find((g) => g.id === selectedGymId) || INVENTION_GYM_EXERCISES[0];
  const activeGedanken = THOUGHT_EXPERIMENTS.find((g) => g.id === selectedGedankenId) || THOUGHT_EXPERIMENTS[0];

  const handleTabChange = (section: ActiveSection) => {
    setActiveSection(section);
    soundFX.playTap();
  };

  const handlePillarSelect = (id: string) => {
    setSelectedPillarId(id);
    soundFX.playTap();
  };

  const handlePatternSelect = (id: string) => {
    setSelectedPatternId(id);
    soundFX.playTap();
  };

  const handlePaperSelect = (id: string) => {
    setSelectedPaperId(id);
    soundFX.playTap();
  };

  const handleGymSelect = (id: string) => {
    setSelectedGymId(id);
    setSelectedMetaphorId(null);
    setIsRevealed(false);
    soundFX.playTap();
  };

  const handleSelectMetaphor = (id: string) => {
    setSelectedMetaphorId(id);
    soundFX.playTap();
  };

  const handleRevealLeap = () => {
    setIsRevealed(true);
    soundFX.playSuccess();
  };

  const renderPillarIcon = (name: string, className: string = 'w-5 h-5') => {
    switch (name) {
      case 'Atom':
        return <Atom className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Activity':
        return <Activity className={className} />;
      case 'Network':
        return <Network className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-ink-950 via-ink-900 to-brand-950 border border-brand-500/20 p-6 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            First-Principles Epistemology & Theory Thinking
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
            How Theorists Think: <span className="text-brand-400">The Anatomy of the Cognitive Leap</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-300 max-w-3xl leading-relaxed">
            Breakthrough theories are never produced by incremental tuning. They happen when a researcher spots an
            insoluble physical contradiction, borrows an isomorphism from another scientific discipline, and performs
            a differentiable relaxation onto computing hardware.
          </p>

          {/* Section Navigation Pills */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => handleTabChange('continuum')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                activeSection === 'continuum'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white/5 hover:bg-white/10 text-ink-300 border border-white/5'
              }`}
            >
              <Workflow className="w-4 h-4" />
              1. The Physical Continuum (Electron → AI)
            </button>
            <button
              onClick={() => handleTabChange('patterns')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                activeSection === 'patterns'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white/5 hover:bg-white/10 text-ink-300 border border-white/5'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              2. The 11 Universal Leap Patterns
            </button>
            <button
              onClick={() => handleTabChange('deconstructions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                activeSection === 'deconstructions'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white/5 hover:bg-white/10 text-ink-300 border border-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              3. Deconstructing Seminal Papers
            </button>
            <button
              onClick={() => handleTabChange('gym')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                activeSection === 'gym'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white/5 hover:bg-white/10 text-ink-300 border border-white/5'
              }`}
            >
              <Target className="w-4 h-4" />
              4. The Invention Gym
            </button>
            <button
              onClick={() => handleTabChange('gedanken')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                activeSection === 'gedanken'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white/5 hover:bg-white/10 text-ink-300 border border-white/5'
              }`}
            >
              <Brain className="w-4 h-4" />
              5. Gedankenexperiments (Pure-Scratch Epistemology)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Invariant Canvas */}
      <TheoryPhysicalSimCanvas />

      {/* SECTION 1: THE PHYSICAL CONTINUUM */}
      {activeSection === 'continuum' && (
        <div className="space-y-6 animate-fade-in">
          {/* Stepper Chain Bar */}
          <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-4 shadow-xs">
            <h2 className="text-xs font-bold text-ink-400 dark:text-ink-500 uppercase tracking-wider mb-3">
              The Grand Chain of Information Existence: Click any station
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PHYSICAL_PILLARS.map((pillar, idx) => {
                const isSelected = pillar.id === selectedPillarId;
                return (
                  <button
                    key={pillar.id}
                    onClick={() => handlePillarSelect(pillar.id)}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-500/10 dark:bg-brand-950/50 border-brand-500 text-brand-900 dark:text-brand-300 shadow-md shadow-brand-500/10 ring-2 ring-brand-500/30 scale-[1.01]'
                        : 'bg-ink-50 dark:bg-ink-800/50 border-ink-200/60 dark:border-white/5 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400">
                        Pillar 0{idx + 1}
                      </span>
                      {renderPillarIcon(pillar.iconName, 'w-4 h-4 text-brand-500')}
                    </div>
                    <span className="text-xs font-bold truncate">{pillar.title.split(':')[0]}</span>
                    <span className="text-[10px] text-ink-400 dark:text-ink-500 truncate mt-0.5">
                      {pillar.fundamentalEntity.split('(')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Pillar Deep-Dive Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 cols: Philosophy & Physics */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                      Stage {activePillar.order} of 5 · {activePillar.domain.replace('_', ' ').toUpperCase()}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white mt-1">
                      {activePillar.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-700 dark:text-brand-300 font-medium italic mt-1">
                      "{activePillar.tagline}"
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 shrink-0">
                    {renderPillarIcon(activePillar.iconName, 'w-6 h-6')}
                  </div>
                </div>

                {/* Governing Equation Box */}
                <div className="bg-ink-950/95 border border-brand-500/30 rounded-2xl p-4 sm:p-5 font-mono text-center space-y-2 shadow-inner">
                  <div className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">
                    Governing Law: {activePillar.governingPhysicalLaw}
                  </div>
                  <div className="text-brand-300 text-sm sm:text-base font-bold py-1.5 overflow-x-auto no-scrollbar">
                    <MathView math={activePillar.mathematicalEquation} display={true} className="text-brand-300" />
                  </div>
                  <p className="text-[11px] text-ink-300 font-sans text-left leading-relaxed pt-2 border-t border-ink-800/80">
                    {activePillar.equationExplanation}
                  </p>
                </div>

                {/* Physical Intuition */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-ink-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Physical First-Principles Intuition
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-700 dark:text-ink-300 leading-relaxed bg-ink-50 dark:bg-ink-800/40 p-4 rounded-xl border border-ink-200/60 dark:border-white/5">
                    {activePillar.physicalIntuition}
                  </p>
                </div>

                {/* Bridge to Next Level */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <ArrowRight className="w-4 h-4 text-amber-500" />
                    The Inevitable Transition to the Next Pillar
                  </div>
                  <p className="text-ink-700 dark:text-ink-300 text-xs leading-relaxed">
                    {activePillar.theBridgeToNextLevel}
                  </p>
                </div>
              </div>
            </div>

            {/* Right 5 cols: AI Isomorphism & Conceptual Takeaway */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink-900 dark:text-white">
                      The Direct Artificial Intelligence Isomorphism
                    </h3>
                    <span className="text-[10px] text-ink-400">How this manifests in modern networks</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/20 text-xs sm:text-sm text-ink-700 dark:text-ink-300 leading-relaxed">
                  {activePillar.aiAnalogy}
                </div>

                <div className="bg-ink-50 dark:bg-ink-800/60 rounded-xl p-4 border border-ink-200/60 dark:border-white/5 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    The Researcher's Mental Reflex
                  </span>
                  <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed italic">
                    Whenever you feel stuck with an abstract software concept, descend the stack: Is your problem an
                    electron transit delay? A thermodynamic entropy wall? An energy dissipation ceiling? Or a Shannon
                    channel limit? The physical world has already solved every constraint you will ever encounter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: THE 11 UNIVERSAL LEAP PATTERNS */}
      {activeSection === 'patterns' && (
        <div className="space-y-6 animate-fade-in">
          {/* Pattern Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {COGNITIVE_LEAP_PATTERNS.map((pattern) => {
              const isSelected = pattern.id === selectedPatternId;
              return (
                <button
                  key={pattern.id}
                  onClick={() => handlePatternSelect(pattern.id)}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 shadow-xs'
                      : 'bg-surface dark:bg-ink-900 border-ink-200 dark:border-white/10 hover:border-brand-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400">
                        Jump {pattern.number < 10 ? `0${pattern.number}` : pattern.number}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-ink-200/60 dark:bg-ink-800 text-ink-500 dark:text-ink-400 truncate max-w-[120px] border border-ink-300/40 dark:border-white/5">
                        {pattern.originatingField.split('&')[0].trim()}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-ink-900 dark:text-white mt-0.5 line-clamp-1">
                      {pattern.name}
                    </h3>
                    <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-1 line-clamp-2">
                      {pattern.tagline}
                    </p>
                  </div>
                  <div className="mt-3 text-[10px] font-medium text-brand-700 dark:text-brand-300 flex items-center gap-1">
                    Inspect Metaphor <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Pattern Deep-Dive Card */}
          <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-ink-200/60 dark:border-white/10 pb-4">
              <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                Universal Discovery Template #{activePattern.number}
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-ink-900 dark:text-white mt-1">
                {activePattern.name}
              </h2>
              <p className="text-sm font-medium text-brand-700 dark:text-brand-300 italic mt-1">
                "{activePattern.tagline}"
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (6 cols): The Dialectic */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/50 border border-ink-200/60 dark:border-white/5 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    The Core Mental Leap
                  </span>
                  <p className="text-xs sm:text-sm text-ink-800 dark:text-ink-200 leading-relaxed font-medium">
                    {activePattern.theMentalJump}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    The False Assumption It Shatters
                  </span>
                  <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
                    {activePattern.falseAssumptionBroken}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    The Differentiable Relaxation Trick (Making It Learnable)
                  </span>
                  <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                    {activePattern.differentiableRelaxationTrick}
                  </p>
                </div>
              </div>

              {/* Right Column (6 cols): The Isomorphism & Math */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Originating Field & Borrowed Metaphor
                  </span>
                  <p className="text-xs text-brand-900 dark:text-brand-200 font-semibold">
                    {activePattern.originatingField}
                  </p>
                  <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed italic">
                    "{activePattern.borrowedMetaphor}"
                  </p>
                </div>

                {/* Mathematical Invariant Formula Box */}
                <div className="bg-ink-950 border border-ink-800 rounded-xl p-4 font-mono text-center space-y-2">
                  <div className="text-[10px] uppercase font-bold text-ink-400 tracking-wider">
                    The Mathematical Invariant
                  </div>
                  <div className="text-brand-300 text-sm sm:text-base font-bold py-1 overflow-x-auto no-scrollbar">
                    <MathView math={activePattern.keyFormula} display={true} className="text-brand-300" />
                  </div>
                  <p className="text-[11px] text-ink-400 font-sans text-left leading-relaxed">
                    {activePattern.formulaExplanation}
                  </p>
                </div>

                {/* How to Apply in Research */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    How to Deploy This Jump in 2026 AI Research
                  </span>
                  <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
                    {activePattern.howToApplyInResearch}
                  </p>
                </div>
              </div>
            </div>

            {/* Historical Milestones Tape */}
            <div className="pt-2 border-t border-ink-200/60 dark:border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400 block mb-2">
                Historical Lineage of Breakthroughs Using This Exact Pattern:
              </span>
              <div className="flex flex-wrap gap-2">
                {activePattern.historicalMilestones.map((milestone, mIdx) => (
                  <span
                    key={mIdx}
                    className="px-2.5 py-1 rounded-lg bg-ink-100 dark:bg-ink-800 text-[11px] font-mono text-ink-700 dark:text-ink-300 border border-ink-200/60 dark:border-white/5"
                  >
                    {milestone}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: DECONSTRUCTING SEMINAL PAPERS */}
      {activeSection === 'deconstructions' && (
        <div className="space-y-6 animate-fade-in">
          {/* Paper Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {PAPER_DECONSTRUCTIONS.map((paper) => {
              const isSelected = paper.id === selectedPaperId;
              return (
                <button
                  key={paper.id}
                  onClick={() => handlePaperSelect(paper.id)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                      : 'bg-surface dark:bg-ink-900 text-ink-600 dark:text-ink-300 border-ink-200 dark:border-white/10 hover:border-brand-500/40'
                  }`}
                >
                  {paper.architecturalBreakthrough.split('(')[0]}
                </button>
              );
            })}
          </div>

          {/* Active Paper Deconstruction Card */}
          <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                {activePaper.authorsAndYear}
              </span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-ink-900 dark:text-white mt-1">
                {activePaper.paperTitle}
              </h2>
              <div className="inline-block mt-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-bold border border-brand-500/20">
                Breakthrough: {activePaper.architecturalBreakthrough}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (7 cols): The Raw Unwritten Thoughts */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    The Apparent Paradox They Faced
                  </span>
                  <p className="text-xs sm:text-sm text-ink-800 dark:text-ink-200 leading-relaxed font-medium">
                    {activePaper.theApparentParadox}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    The Raw Intuitive Visualization (Before Math Was Written Down)
                  </span>
                  <p className="text-xs sm:text-sm text-brand-900 dark:text-brand-200 leading-relaxed italic">
                    "{activePaper.theRawIntuitionBeforeMath}"
                  </p>
                </div>

                {/* Step-by-Step Unwritten Mental Path */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-ink-900 dark:text-white uppercase tracking-wider block">
                    The Unwritten Step-by-Step Cognitive Leap:
                  </span>
                  <div className="space-y-2">
                    {activePaper.unwrittenMentalPath.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-ink-50 dark:bg-ink-800/40 border-l-4 border-l-brand-500 border border-ink-200/60 dark:border-white/5 text-xs text-ink-700 dark:text-ink-300 leading-relaxed font-mono shadow-xs"
                      >
                        <span className="w-5 h-5 rounded-md bg-brand-500/15 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5 border border-brand-500/25">
                          {sIdx + 1}
                        </span>
                        <span className="flex-1">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): The Math & Hardware Symbiosis */}
              <div className="lg:col-span-5 space-y-5">
                {/* Formal Equation */}
                <div className="bg-ink-950 border border-ink-800 rounded-xl p-4 font-mono text-center space-y-2">
                  <div className="text-[10px] uppercase font-bold text-ink-400 tracking-wider">
                    The Formal Equation
                  </div>
                  <div className="text-brand-300 text-sm sm:text-base font-bold py-1 overflow-x-auto no-scrollbar">
                    <MathView math={activePaper.formalEquation} display={true} className="text-brand-300" />
                  </div>
                  <p className="text-[11px] text-ink-400 font-sans text-left leading-relaxed">
                    Differentiable Relaxation: {activePaper.theDifferentiableRelaxation}
                  </p>
                </div>

                {/* The Hardware Symbiosis */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    The Hardware Symbiosis (Why GPUs Loved It)
                  </span>
                  <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                    {activePaper.theHardwareSymbiosis}
                  </p>
                </div>

                {/* Why Previous Attempts Failed */}
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Why Smart Competitors Failed
                  </span>
                  <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed">
                    {activePaper.whyPreviousAttemptsFailed}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: THE INVENTION GYM */}
      {activeSection === 'gym' && (
        <div className="space-y-6 animate-fade-in">
          {/* Gym Challenge Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {INVENTION_GYM_EXERCISES.map((gym) => {
              const isSelected = gym.id === selectedGymId;
              return (
                <button
                  key={gym.id}
                  onClick={() => handleGymSelect(gym.id)}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 shadow-xs'
                      : 'bg-surface dark:bg-ink-900 border-ink-200 dark:border-white/10 hover:border-brand-500/40'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400">
                    Target Domain: {gym.targetDomain}
                  </span>
                  <h3 className="text-sm font-bold text-ink-900 dark:text-white mt-0.5">{gym.title}</h3>
                </button>
              );
            })}
          </div>

          {/* Active Challenge Workbench */}
          <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                Active Research Challenge
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white mt-0.5">
                {activeGym.title}
              </h2>
            </div>

            {/* Current Bottleneck */}
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                The Current Architectural Wall
              </span>
              <p className="text-xs sm:text-sm text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
                {activeGym.currentBottleneckDescription}
              </p>
              <p className="text-[11px] text-ink-500 dark:text-ink-400 pt-1">
                <strong>False Assumption:</strong> {activeGym.theFalseAssumption}
              </p>
            </div>

            {/* Step 1: Pick the Cross-Disciplinary Metaphor */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-ink-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Step 1: Test Your Cognitive Leap — Choose a Cross-Disciplinary Metaphor
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeGym.candidateMetaphors.map((meta) => {
                  const isSelected = meta.id === selectedMetaphorId;
                  return (
                    <button
                      key={meta.id}
                      onClick={() => handleSelectMetaphor(meta.id)}
                      className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-brand-500/10 border-brand-500 ring-2 ring-brand-500/30'
                          : 'bg-ink-50 dark:bg-ink-800/50 border-ink-200/60 dark:border-white/5 hover:bg-ink-100 dark:hover:bg-ink-800'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400 uppercase font-bold">
                          {meta.sourceDiscipline}
                        </span>
                        <h4 className="text-xs font-bold text-ink-900 dark:text-white mt-0.5">
                          {meta.metaphorName}
                        </h4>
                        <p className="text-[11px] text-ink-600 dark:text-ink-300 mt-1 leading-relaxed">
                          {meta.intuition}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-ink-200/40 dark:border-white/5 text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                        {isSelected ? '✓ Selected Metaphor' : 'Click to Hypothesize'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Reveal & Verify */}
            {selectedMetaphorId && (
              <div className="space-y-4 pt-2 border-t border-ink-200/60 dark:border-white/10 animate-fade-in">
                {(() => {
                  const chosen = activeGym.candidateMetaphors.find((m) => m.id === selectedMetaphorId);
                  if (!chosen) return null;
                  return (
                    <div
                      className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                        chosen.isOptimalLeap
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5 mb-1">
                        {chosen.isOptimalLeap ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                        Evaluation of "{chosen.metaphorName}":
                      </div>
                      <p>{chosen.whyItFitsOrFails}</p>
                    </div>
                  );
                })()}

                {!isRevealed ? (
                  <button
                    onClick={handleRevealLeap}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-brand-500/25 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Synthesize Full Mathematical Solution & Hardware Check
                  </button>
                ) : (
                  <div className="space-y-4 pt-2 animate-fade-in">
                    <div className="bg-ink-950 border border-ink-800 rounded-xl p-5 font-mono text-center space-y-2">
                      <div className="text-[10px] uppercase font-bold text-ink-400 tracking-wider">
                        The Synthesized Architectural Invariant: {activeGym.theBreakthroughArchitectureName}
                      </div>
                      <div className="text-brand-300 text-sm sm:text-base font-bold py-1 overflow-x-auto no-scrollbar">
                        <MathView math={activeGym.suggestedMathematicalInvariant} display={true} className="text-brand-300" />
                      </div>
                      <p className="text-[11px] text-ink-400 font-sans text-left leading-relaxed">
                        <strong>Differentiable Relaxation:</strong> {activeGym.differentiableRelaxationPrompt}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs sm:text-sm text-ink-800 dark:text-ink-200 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5" />
                        Hardware Reality Check (The Hardware Lottery Invariant)
                      </span>
                      <p>{activeGym.hardwareRealityCheck}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: GEDANKENEXPERIMENTS (PURE-SCRATCH EPISTEMOLOGY) */}
      {activeSection === 'gedanken' && (
        <div className="space-y-6 animate-fade-in">
          {/* Gedankenexperiment Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {THOUGHT_EXPERIMENTS.map((exp, idx) => {
              const isSelected = exp.id === selectedGedankenId;
              return (
                <button
                  key={exp.id}
                  onClick={() => {
                    setSelectedGedankenId(exp.id);
                    soundFX.playTap();
                  }}
                  className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 shadow-xs ring-1 ring-brand-500/30'
                      : 'bg-surface dark:bg-ink-900 border-ink-200 dark:border-white/10 hover:border-brand-500/40'
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-brand-600 dark:text-brand-400">
                      Gedanken 0{idx + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-ink-900 dark:text-white mt-1 line-clamp-2">
                      {exp.title}
                    </h3>
                  </div>
                  <div className="mt-3 text-[10px] font-medium text-brand-600 dark:text-brand-300 flex items-center gap-1">
                    Explore Derivation <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Gedankenexperiment Workbench */}
          <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Title & Domain Header */}
            <div className="border-b border-ink-200/60 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                <Brain className="w-4 h-4" />
                <span>First-Principles Gedankenexperiment · {activeGedanken.physicalDomain}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-ink-900 dark:text-white mt-1">
                {activeGedanken.title}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-brand-700 dark:text-brand-300 italic mt-1">
                "{activeGedanken.subtitle}"
              </p>
            </div>

            {/* The Paradox & Shattered Intuition Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  The Apparent Physical Paradox
                </span>
                <p className="text-xs sm:text-sm text-ink-800 dark:text-ink-200 leading-relaxed font-medium">
                  {activeGedanken.paradoxPrompt}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  The Shattered Intuition
                </span>
                <p className="text-xs sm:text-sm text-rose-950 dark:text-rose-200 leading-relaxed">
                  {activeGedanken.brokenIntuition}
                </p>
              </div>
            </div>

            {/* 5-Step Pure-Scratch Axiomatic Derivation Chain */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-ink-200/60 dark:border-white/10 pb-2">
                <h3 className="text-xs font-bold text-ink-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-emerald-500" />
                  Pure Scratch Axiomatic Derivation (Step-by-Step Mathematical Flow)
                </h3>
                <span className="text-[10px] text-brand-600 dark:text-brand-400 font-mono font-semibold px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
                  {activeGedanken.pureScratchDerivation.length} Physical Axioms
                </span>
              </div>

              <div className="relative pl-6 sm:pl-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-linear-to-b before:from-emerald-500 before:via-brand-500 before:to-cyan-500 space-y-4">
                {activeGedanken.pureScratchDerivation.map((step) => {
                  return (
                    <div
                      key={step.step}
                      className="relative p-4 sm:p-5 rounded-2xl border bg-surface dark:bg-ink-950/80 border-ink-200 dark:border-white/10 hover:border-brand-500/40 space-y-3 transition-all shadow-xs group"
                    >
                      {/* Node Bullet */}
                      <div className="absolute -left-6 sm:-left-8 top-5 w-6 h-6 rounded-full bg-ink-950 border-2 border-emerald-500 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-400 shadow-sm shadow-emerald-500/50">
                        {step.step}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-mono font-bold text-ink-900 dark:text-emerald-300">
                          {step.axiom}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-ink-400 font-mono border border-white/5">
                          Axiomatic Step 0{step.step}
                        </span>
                      </div>

                      <div className="bg-ink-900/90 dark:bg-black/70 border border-ink-800 rounded-xl p-3 sm:p-4 text-center font-mono overflow-x-auto no-scrollbar shadow-inner">
                        <MathView math={step.mathematicalStatement} display={true} className="text-brand-300 text-xs sm:text-sm" />
                      </div>

                      <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed font-sans pt-1 border-t border-ink-100 dark:border-white/5">
                        <strong className="text-ink-900 dark:text-ink-100 font-semibold">Physical Meaning:</strong>{' '}
                        {step.physicalInterpretation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* The Epistemological Synthesis & Hardware Invariant */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-xl bg-brand-500/10 border border-brand-500/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  The Epistemological Synthesis
                </span>
                <p className="text-xs sm:text-sm text-ink-800 dark:text-ink-200 leading-relaxed font-medium">
                  {activeGedanken.theSynthesis}
                </p>
              </div>
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Hardware Reality Check (Physical Silicon Invariant)
                </span>
                <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  {activeGedanken.hardwareImplication}
                </p>
              </div>
            </div>

            {/* Interactive Researcher Reflection Prompt */}
            <div className="p-4 rounded-xl bg-ink-900 border border-ink-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Researcher Thought Experiment Challenge
              </span>
              <p className="text-xs sm:text-sm text-ink-200 italic leading-relaxed">
                "{activeGedanken.interactiveHypothesisPrompt}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

