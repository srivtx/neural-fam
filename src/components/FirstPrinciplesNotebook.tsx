/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Interactive First-Principles Discovery Engine Component:
 * Allows learners to experience the Crisis, test Failed Intuitions,
 * uncover the Mathematical Invariant, and trigger the Breakthrough.
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw,
  Zap,
  Award,
  BookOpen,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { FirstPrinciplesDossier } from '../types/firstPrinciples';
import { soundFX } from '../utils/audio';
import { markLabCompleted } from '../utils/progressStore';
import { MathView } from './MathView';

interface FirstPrinciplesNotebookProps {
  dossier: FirstPrinciplesDossier;
  onNavigateToNextLab?: (nextLabId: string) => void;
}

export const FirstPrinciplesNotebook: React.FC<FirstPrinciplesNotebookProps> = ({
  dossier,
  onNavigateToNextLab,
}) => {
  const [activeStage, setActiveStage] = useState<'crisis' | 'failed' | 'invariant' | 'validation'>('crisis');
  const [stressValue, setStressValue] = useState<number>(dossier.crisis.defaultStress);
  const [selectedIntuitionId, setSelectedIntuitionId] = useState<string>(
    dossier.failedIntuitions[0]?.id || ''
  );
  const [isMechanismActive, setIsMechanismActive] = useState<boolean>(false);
  const [hasUnlockedBreakthrough, setHasUnlockedBreakthrough] = useState<boolean>(false);

  // Compute live failure dynamics
  const failureState = dossier.crisis.computeFailure(stressValue);
  const selectedIntuition =
    dossier.failedIntuitions.find((i) => i.id === selectedIntuitionId) ||
    dossier.failedIntuitions[0];

  const handleActivateBreakthrough = () => {
    setIsMechanismActive(true);
    setHasUnlockedBreakthrough(true);
    soundFX.playMilestone();
    markLabCompleted(dossier.labId);
  };

  return (
    <div className="bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 p-5 sm:p-7 space-y-6 shadow-xs transition-colors">
      {/* Top Header Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-ink-100 dark:border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-semibold tracking-wide uppercase font-mono">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>The Inventor's Notebook</span>
            </span>
            <span className="text-xs text-ink-500 font-mono">
              Level {dossier.level} · {dossier.era}
            </span>
          </div>
          <h3 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white mt-1">
            {dossier.title}
          </h3>
          <p className="text-xs text-ink-600 dark:text-ink-300 mt-0.5 max-w-2xl font-serif italic">
            "{dossier.heroQuestion}"
          </p>
        </div>

        {/* 4-Stage Stepper Pills */}
        <div className="flex items-center gap-1 p-1 bg-ink-100 dark:bg-ink-950 rounded-xl border border-ink-200/60 dark:border-white/10 text-xs overflow-x-auto no-scrollbar">
          {[
            { id: 'crisis', label: '1. The Crisis', icon: ShieldAlert },
            { id: 'failed', label: '2. Failed Intuitions', icon: RotateCcw },
            { id: 'invariant', label: '3. Invariant', icon: Sparkles },
            { id: 'validation', label: '4. Breakthrough', icon: Zap },
          ].map((stg) => {
            const IconComponent = stg.icon;
            const isActive = activeStage === stg.id;
            return (
              <button
                key={stg.id}
                onClick={() => {
                  setActiveStage(stg.id as any);
                  soundFX.playTap();
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-600 text-white font-bold shadow-xs'
                    : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{stg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE 1: THE CRISIS */}
      {activeStage === 'crisis' && (
        <div className="space-y-6 animate-fade-in">
          {/* Historical Crisis Context */}
          <div className="p-4 sm:p-5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-bold text-rose-900 dark:text-rose-300 text-sm">
                  The Bottleneck Wall: {dossier.crisis.name}
                </h4>
                <span className="text-[11px] font-mono text-ink-500 dark:text-ink-400">
                  {dossier.inventors}
                </span>
              </div>
              <p className="text-ink-700 dark:text-ink-300 leading-relaxed text-xs sm:text-[13px]">
                {dossier.crisis.description}
              </p>
              <blockquote className="italic text-ink-600 dark:text-ink-400 pt-1 border-l-2 border-rose-400 pl-3 bg-white/40 dark:bg-black/20 p-2 rounded-r-lg">
                "{dossier.crisis.empiricalWallQuote}"
              </blockquote>
            </div>
          </div>

          {/* Interactive Stress Simulator */}
          <div className="p-5 sm:p-6 bg-ink-50 dark:bg-ink-950 rounded-xl border border-ink-200 dark:border-white/5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-ink-500 font-mono">
                  Bottleneck Stress Simulator
                </span>
                <h4 className="text-sm font-bold text-ink-900 dark:text-white mt-0.5">
                  Dial up the operational difficulty to expose the failure mode
                </h4>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-ink-600 dark:text-ink-400 font-medium">
                  {dossier.crisis.stressParameterName}:
                </span>
                <span className="px-2.5 py-1 rounded bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-500/30">
                  {stressValue} {dossier.crisis.stressParameterUnit}
                </span>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min={dossier.crisis.minStress}
                max={dossier.crisis.maxStress}
                step={dossier.crisis.stressStep}
                value={stressValue}
                onChange={(e) => setStressValue(parseFloat(e.target.value))}
                className="w-full accent-brand-600 cursor-pointer h-2 bg-ink-200 dark:bg-ink-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] font-mono text-ink-400">
                <span>Min: {dossier.crisis.minStress} {dossier.crisis.stressParameterUnit}</span>
                <span>Max: {dossier.crisis.maxStress} {dossier.crisis.stressParameterUnit}</span>
              </div>
            </div>

            {/* Live Telemetry Meters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Baseline Telemetry */}
              <div className={`p-4 rounded-xl border transition-all ${
                failureState.isCollapsed
                  ? 'bg-rose-50/80 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/40'
                  : 'bg-surface dark:bg-ink-900 border-ink-200 dark:border-white/10'
              }`}>
                <div className="flex items-center justify-between text-xs pb-1">
                  <span className="font-semibold text-ink-600 dark:text-ink-400">
                    {dossier.crisis.baselineMethodName}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    failureState.isCollapsed
                      ? 'bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300'
                  }`}>
                    {failureState.isCollapsed ? 'COLLAPSED' : 'STRESSED'}
                  </span>
                </div>
                <div className="text-2xl font-extrabold font-mono mt-1 text-rose-600 dark:text-rose-400">
                  {typeof failureState.baselineMetric === 'number'
                    ? failureState.baselineMetric
                    : failureState.baselineMetric}
                </div>
                <div className="text-[11px] text-ink-500 dark:text-ink-400 mt-1">
                  {failureState.metricLabel}
                </div>
              </div>

              {/* Status Explanation */}
              <div className="p-4 rounded-xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 flex flex-col justify-between">
                <span className="text-[11px] font-mono uppercase text-ink-400 font-semibold">
                  Physical Failure Diagnosis
                </span>
                <p className="text-xs text-ink-700 dark:text-ink-300 font-medium mt-1 leading-relaxed">
                  {failureState.statusText}
                </p>
                <div className="text-[11px] text-rose-600 dark:text-rose-400 font-mono mt-2">
                  {dossier.crisis.baselineFailureSymptom}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setActiveStage('failed');
                soundFX.playTap();
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>Examine Why Naive Solutions Failed</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: FAILED INTUITIONS */}
      {activeStage === 'failed' && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
              <RotateCcw className="w-4 h-4" />
              <span>The Graveyard of Failed Intuitions</span>
            </div>
            <h4 className="text-base font-bold text-ink-900 dark:text-white">
              What researchers tried first that failed mathematically
            </h4>
            <p className="text-xs text-ink-600 dark:text-ink-400">
              Breakthroughs rarely happen in one leap. Click each intuitive heuristic below to see the exact theoretical flaw that caused it to collapse.
            </p>
          </div>

          {/* Cards Deck */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {dossier.failedIntuitions.map((intuition) => {
              const isSelected = selectedIntuitionId === intuition.id;
              return (
                <button
                  key={intuition.id}
                  onClick={() => {
                    setSelectedIntuitionId(intuition.id);
                    soundFX.playTap();
                  }}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-amber-50/70 dark:bg-amber-500/10 border-amber-400 dark:border-amber-500/50 shadow-xs ring-1 ring-amber-400/50'
                      : 'bg-ink-50 dark:bg-ink-950 border-ink-200 dark:border-white/5 hover:border-ink-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-ink-900 dark:text-white line-clamp-1">
                      {intuition.title}
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 text-[10px] font-mono font-bold uppercase shrink-0">
                      Failed ✗
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-600 dark:text-ink-400 line-clamp-2">
                    {intuition.hypothesis}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Detailed Teardown of the Selected Intuition */}
          <div className="p-5 bg-ink-50 dark:bg-ink-950 rounded-xl border border-ink-200 dark:border-white/10 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-ink-900 dark:text-white font-bold text-sm">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <span>Tested Hypothesis: "{selectedIntuition.hypothesis}"</span>
            </div>

            <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/20 rounded-lg border border-rose-200/80 dark:border-rose-500/30 text-rose-900 dark:text-rose-300 leading-relaxed">
              <strong>Why it collapsed:</strong> {selectedIntuition.whyItFailed}
            </div>

            <div className="p-3.5 bg-surface dark:bg-ink-900 rounded-lg border border-ink-200/80 dark:border-white/5 font-mono text-ink-700 dark:text-ink-200 text-xs space-y-1">
              <div className="text-[10px] uppercase font-bold text-ink-400">
                Mathematical Proof of Failure:
              </div>
              <div className="text-amber-700 dark:text-amber-400 font-bold overflow-x-auto no-scrollbar py-1">
                {selectedIntuition.mathExplanation}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                setActiveStage('crisis');
                soundFX.playTap();
              }}
              className="text-xs font-semibold text-ink-500 hover:text-ink-900 dark:hover:text-white cursor-pointer"
            >
              ← Back to The Crisis
            </button>
            <button
              onClick={() => {
                setActiveStage('invariant');
                soundFX.playTap();
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>Discover the Mathematical Invariant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: THE MATHEMATICAL INVARIANT */}
      {activeStage === 'invariant' && (
        <div className="space-y-6 animate-fade-in">
          {/* Invariant Headline Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-brand-50/80 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 space-y-3">
            <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-bold text-xs uppercase tracking-wider font-mono">
              <Sparkles className="w-4 h-4" />
              <span>The Governing Invariant & Conservation Law</span>
            </div>

            {/* Formula Presentation */}
            <div className="p-4 rounded-xl bg-surface dark:bg-ink-900 border border-brand-300/80 dark:border-brand-500/30 font-mono text-center text-base sm:text-lg font-bold text-brand-900 dark:text-brand-200 overflow-x-auto no-scrollbar shadow-2xs">
              <MathView math={dossier.invariant.governingEquation} display={true} className="text-brand-900 dark:text-brand-200" />
            </div>

            <p className="text-xs sm:text-[13px] text-ink-700 dark:text-ink-200 leading-relaxed font-sans">
              {dossier.invariant.plainEnglishSummary}
            </p>
          </div>

          {/* Symbol Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {dossier.invariant.breakdown.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-ink-50 dark:bg-ink-950 rounded-xl border border-ink-200 dark:border-white/5 space-y-1.5 text-xs"
              >
                <div className="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">
                  {item.symbol}
                </div>
                <div className="text-ink-800 dark:text-ink-200 font-bold">
                  {item.role}
                </div>
                <p className="text-[11px] text-ink-600 dark:text-ink-400 leading-relaxed">
                  {item.whyItDissolvesBottleneck}
                </p>
              </div>
            ))}
          </div>

          {/* Derivative Highway Proof if present */}
          {dossier.invariant.identityDerivativeFormula && (
            <div className="p-4 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 space-y-2 text-xs">
              <div className="text-[11px] font-mono uppercase font-bold text-ink-500">
                Analytical Invariant Formulation:
              </div>
              <div className="p-2.5 bg-ink-50 dark:bg-ink-950 rounded-lg font-mono text-brand-700 dark:text-brand-300 text-xs overflow-x-auto no-scrollbar">
                <MathView math={dossier.invariant.identityDerivativeFormula} display={true} className="text-brand-700 dark:text-brand-300" />
              </div>
              {dossier.invariant.proofSketch && (
                <p className="text-ink-600 dark:text-ink-400 text-[11px] leading-relaxed italic">
                  {dossier.invariant.proofSketch}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => {
                setActiveStage('failed');
                soundFX.playTap();
              }}
              className="text-xs font-semibold text-ink-500 hover:text-ink-900 dark:hover:text-white cursor-pointer"
            >
              ← Back to Failed Intuitions
            </button>
            <button
              onClick={() => {
                setActiveStage('validation');
                soundFX.playTap();
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>Test Proof-of-Concept Breakthrough</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: PROOF-OF-CONCEPT BREAKTHROUGH */}
      {activeStage === 'validation' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-5 sm:p-6 bg-ink-50 dark:bg-ink-950 rounded-2xl border border-ink-200 dark:border-white/5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-600 dark:text-green-400 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proof-of-Concept Validation</span>
                </div>
                <h4 className="text-base font-bold text-ink-900 dark:text-white mt-0.5">
                  Breakthrough: {dossier.breakthrough.mechanismName}
                </h4>
                <p className="text-xs text-ink-600 dark:text-ink-400 mt-0.5">
                  Activate the novel mechanism to verify that the bottleneck wall dissolves under maximum stress.
                </p>
              </div>

              <button
                onClick={handleActivateBreakthrough}
                className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap ${
                  isMechanismActive
                    ? 'bg-green-600 text-white font-bold'
                    : 'bg-brand-600 text-white hover:bg-brand-500 active:scale-95'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isMechanismActive ? 'Mechanism Active ✓' : dossier.breakthrough.activationLabel}</span>
              </button>
            </div>

            {/* Before vs After Telemetry Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Baseline collapsed */}
              <div className="p-4 rounded-xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 text-center">
                <span className="text-[10px] text-ink-500 font-mono uppercase block">
                  Without Invariant (Baseline)
                </span>
                <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 block">
                  {failureState.baselineMetric}
                </span>
                <span className="text-[11px] text-rose-500 block mt-1">
                  Collapsed under stress
                </span>
              </div>

              {/* Breakthrough dissolved */}
              <div className={`p-4 rounded-xl border text-center transition-all ${
                isMechanismActive
                  ? 'bg-green-50/70 dark:bg-green-950/20 border-green-500/40 shadow-xs'
                  : 'bg-surface dark:bg-ink-900 border-ink-200 dark:border-white/10 opacity-70'
              }`}>
                <span className="text-[10px] text-green-700 dark:text-green-400 font-mono uppercase block font-semibold">
                  With Invariant Mechanism
                </span>
                <span className="text-2xl font-bold font-mono text-green-600 dark:text-green-400 mt-1 block">
                  {failureState.breakthroughMetric}
                </span>
                <span className="text-[11px] text-green-600 dark:text-green-400 block mt-1 font-medium">
                  {isMechanismActive ? 'Bottleneck Wall Dissolved ✓' : 'Pending Activation'}
                </span>
              </div>
            </div>

            {/* Verification Terminal Log */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-ink-400 uppercase font-bold">
                Verification Execution Log:
              </span>
              <pre className="p-4 bg-ink-900 dark:bg-black rounded-xl border border-ink-800 font-mono text-[11px] text-green-400 overflow-x-auto no-scrollbar leading-relaxed shadow-inner">
                {dossier.breakthrough.verificationLog.join('\n')}
              </pre>
            </div>
          </div>

          {/* Milestone Award Banner */}
          {hasUnlockedBreakthrough && (
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-scale-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-ink-950 flex items-center justify-center shrink-0 shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-ink-900 dark:text-white">
                    Milestone Recorded: Bottleneck Breaker
                  </h4>
                  <p className="text-xs text-ink-600 dark:text-ink-400">
                    You derived the governing invariant for {dossier.title} from first principles!
                  </p>
                </div>
              </div>

              {dossier.breakthrough.nextFrontierId && onNavigateToNextLab && (
                <button
                  onClick={() => {
                    soundFX.playTap();
                    onNavigateToNextLab(dossier.breakthrough.nextFrontierId!);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-500/20 hover:bg-brand-200 dark:hover:bg-brand-500/30 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Explore Next Frontier: {dossier.breakthrough.nextFrontierName}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <div className="flex justify-start pt-2">
            <button
              onClick={() => {
                setActiveStage('invariant');
                soundFX.playTap();
              }}
              className="text-xs font-semibold text-ink-500 hover:text-ink-900 dark:hover:text-white cursor-pointer"
            >
              ← Back to Invariant
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
