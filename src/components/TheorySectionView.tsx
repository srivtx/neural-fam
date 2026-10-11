/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { TheoryDossier } from '../types/theory';

interface TheorySectionViewProps {
  theory: TheoryDossier;
}

export const TheorySectionView: React.FC<TheorySectionViewProps> = ({ theory }) => {
  const [selectedContrastIdx, setSelectedContrastIdx] = useState<number>(0);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({
    0: true,
    1: true,
  });

  const toggleStep = (idx: number) => {
    setExpandedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const activeContrast = theory.whyNotContrasts[selectedContrastIdx] || theory.whyNotContrasts[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Header & Foundational Objective */}
      <div className="p-6 sm:p-8 bg-surface dark:bg-ink-900 rounded-3xl border border-ink-200 dark:border-white/10 shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20">
              LEVEL {theory.level} · FIRST-PRINCIPLES THEORY
            </span>
            <span className="text-xs text-ink-500 dark:text-ink-400 font-mono">
              Mathematical Foundations
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Axiomatic Formulation</span>
          </div>
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-ink-900 dark:text-white">
            {theory.title}
          </h2>
          <p className="text-sm text-ink-600 dark:text-ink-300 mt-1 max-w-3xl leading-relaxed">
            {theory.subtitle}
          </p>
        </div>

        {/* Foundational Problem Box */}
        <div className="p-5 rounded-2xl bg-ink-50 dark:bg-ink-950/80 border border-ink-200/80 dark:border-white/5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400 font-mono">
            <Compass className="w-4 h-4" />
            <span>The Foundational Problem (What Are We Actually Trying to Do?)</span>
          </div>

          <p className="text-xs sm:text-sm text-ink-800 dark:text-ink-200 leading-relaxed font-serif sm:font-sans">
            {theory.foundationalObjective.problemStatement}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 font-mono block">
                Fundamental Axioms Assumed:
              </span>
              <ul className="space-y-1.5 text-xs text-ink-700 dark:text-ink-300">
                {theory.foundationalObjective.axioms.map((axiom, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-brand-600 dark:text-brand-400 font-mono text-[11px] mt-0.5 font-bold">
                      A{idx + 1}.
                    </span>
                    <span className="leading-relaxed">{axiom}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 font-mono block">
                Target Physical / Mathematical Objective:
              </span>
              <div className="p-3 rounded-xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 text-xs text-ink-800 dark:text-ink-200 leading-relaxed">
                {theory.foundationalObjective.physicsOrMathGoal}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Counterfactual Inquiry: "Why This Way and Why NOT Any Other Way?" */}
      <div className="p-6 sm:p-8 bg-surface dark:bg-ink-900 rounded-3xl border border-ink-200 dark:border-white/10 shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-100 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono">
              <Scale className="w-4 h-4" />
              <span>Counterfactual Inquiry & Eliminative Deduction</span>
            </div>
            <h3 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white mt-1">
              Why this specific formulation, and why NOT any other way?
            </h3>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
              Every architectural choice survived by killing intuitive alternatives. Inspect why the intuitive alternatives collapsed.
            </p>
          </div>
        </div>

        {/* Alternative Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {theory.whyNotContrasts.map((c, idx) => {
            const isSelected = selectedContrastIdx === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedContrastIdx(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer border text-left ${
                  isSelected
                    ? 'bg-rose-50 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 font-bold shadow-2xs'
                    : 'bg-ink-50 dark:bg-ink-950 border-ink-200 dark:border-white/5 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                <span className="block text-[10px] uppercase font-mono text-ink-400 mb-0.5">
                  Alternative #{idx + 1}
                </span>
                <span>{c.alternativeMethod}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Alternative Deep-Dive Card */}
        {activeContrast && (
          <div className="p-5 rounded-2xl bg-ink-50 dark:bg-ink-950/80 border border-ink-200/80 dark:border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-ink-200/60 dark:border-white/5">
              <h4 className="text-base font-bold text-ink-900 dark:text-white font-display">
                Rejected Alternative: {activeContrast.alternativeMethod}
              </h4>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                Fatal Mathematical Flaw
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-500 font-mono flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                  <span>The Naive Intuition (Why it seems appealing):</span>
                </span>
                <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed bg-surface dark:bg-ink-900 p-3.5 rounded-xl border border-ink-200 dark:border-white/5">
                  {activeContrast.theNaiveAppeal}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>The Fatal Bottleneck / Breakdown:</span>
                </span>
                <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed bg-surface dark:bg-ink-900 p-3.5 rounded-xl border border-rose-200/60 dark:border-rose-500/20">
                  {activeContrast.theFatalFlaw}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-600 dark:text-ink-400 font-mono block">
                The Mathematical Proof of Failure:
              </span>
              <div className="p-3.5 rounded-xl bg-ink-950 border border-ink-800 text-ink-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {activeContrast.mathematicalProof}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Step-by-Step Mathematical Derivation from First Principles */}
      <div className="p-6 sm:p-8 bg-surface dark:bg-ink-900 rounded-3xl border border-ink-200 dark:border-white/10 shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-100 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 font-mono">
              <BookOpen className="w-4 h-4" />
              <span>Rigorous Mathematical Proof & Derivation</span>
            </div>
            <h3 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white mt-1">
              Step-by-Step Derivation from Elementary Axioms
            </h3>
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
              {theory.firstPrinciplesDerivation.overview}
            </p>
          </div>
        </div>

        {/* Derivation Steps List */}
        <div className="space-y-3">
          {theory.firstPrinciplesDerivation.steps.map((step, idx) => {
            const isExpanded = expandedSteps[idx] ?? true;
            return (
              <div
                key={step.stepNumber}
                className="rounded-2xl border border-ink-200 dark:border-white/10 bg-ink-50 dark:bg-ink-950/60 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleStep(idx)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-ink-100/60 dark:hover:bg-ink-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {step.stepNumber}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-ink-900 dark:text-white">
                      {step.stepTitle}
                    </span>
                  </div>

                  <div className="text-ink-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 space-y-3 text-xs border-t border-ink-100 dark:border-white/5">
                    {/* Formula Banner */}
                    <div className="p-3 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 font-mono text-xs sm:text-sm text-brand-700 dark:text-brand-300 overflow-x-auto shadow-2xs font-semibold">
                      {step.formula}
                    </div>

                    <p className="text-ink-700 dark:text-ink-300 leading-relaxed">
                      {step.explanation}
                    </p>

                    <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="block text-[11px] uppercase tracking-wider font-mono">
                          Critical Insight:
                        </strong>
                        <span className="text-xs leading-relaxed">{step.criticalInsight}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Final Governing Equation Box */}
        <div className="p-6 rounded-2xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Final Derived Governing Equation</span>
            </span>
            <span className="text-[11px] font-mono text-ink-500">Universal Form</span>
          </div>

          <div className="p-4 bg-surface dark:bg-ink-950 rounded-xl border border-brand-500/20 text-center font-mono text-sm sm:text-base font-bold text-brand-700 dark:text-brand-300 overflow-x-auto shadow-xs">
            {theory.firstPrinciplesDerivation.finalGoverningEquation}
          </div>

          <p className="text-xs text-ink-600 dark:text-ink-400 leading-relaxed">
            {theory.firstPrinciplesDerivation.derivationTakeaway}
          </p>
        </div>
      </div>

      {/* 4. Geometric & Manifold Interpretation */}
      <div className="p-6 sm:p-8 bg-surface dark:bg-ink-900 rounded-3xl border border-ink-200 dark:border-white/10 shadow-xs space-y-5 transition-colors">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 font-mono">
          <Layers className="w-4 h-4" />
          <span>Geometric & Manifold Geometry</span>
        </div>

        <div>
          <h3 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white">
            {theory.geometricManifoldInterpretation.spaceName}
          </h3>
          <p className="text-xs text-ink-600 dark:text-ink-400 mt-1">
            {theory.geometricManifoldInterpretation.manifoldConcept}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-2">
            <span className="text-xs font-bold text-ink-900 dark:text-white block font-sans">
              Topological Visual Interpretation:
            </span>
            <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
              {theory.geometricManifoldInterpretation.visualizationDescription}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-2">
            <span className="text-xs font-bold text-ink-900 dark:text-white block font-sans">
              Energy Surface & Optimization Landscape:
            </span>
            <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
              {theory.geometricManifoldInterpretation.energyOrLossGeometry}
            </p>
          </div>
        </div>
      </div>

      {/* 5. Architectural Design Decisions Decoded */}
      <div className="p-6 sm:p-8 bg-surface dark:bg-ink-900 rounded-3xl border border-ink-200 dark:border-white/10 shadow-xs space-y-5 transition-colors">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
          <Cpu className="w-4 h-4" />
          <span>Design Decisions Decoded</span>
        </div>

        <div>
          <h3 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white">
            Why are hyperparameters and constants chosen this exact way?
          </h3>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">
            Nothing in deep learning is arbitrary. Explore the mathematical justification behind every standard constant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {theory.designDecisionsDecoded.map((dec, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950/80 border border-ink-200 dark:border-white/5 space-y-2.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink-900 dark:text-white">
                  {dec.parameterOrComponent}
                </span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-semibold">
                  Standard: {dec.standardChoice}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-ink-700 dark:text-ink-300 block">
                  Why this exact choice:
                </span>
                <p className="text-ink-600 dark:text-ink-400 leading-relaxed">
                  {dec.whyThisExactValue}
                </p>
              </div>

              <div className="pt-2 border-t border-ink-200/50 dark:border-white/5 text-[11px] text-rose-600 dark:text-rose-400">
                <strong>Failure symptom if altered:</strong> {dec.consequenceOfAlternation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Active Research Frontiers */}
      {theory.researchFrontiers.length > 0 && (
        <div className="p-6 bg-surface dark:bg-ink-900 rounded-3xl border border-ink-200 dark:border-white/10 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 font-mono">
            <Flame className="w-4 h-4" />
            <span>Active Research Frontiers & Open Questions</span>
          </div>

          <p className="text-xs text-ink-600 dark:text-ink-400">
            Current research questions actively investigated by frontier laboratories worldwide:
          </p>

          <div className="space-y-2">
            {theory.researchFrontiers.map((frontier, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-ink-50 dark:bg-ink-950/60 border border-ink-200/60 dark:border-white/5 text-xs text-ink-700 dark:text-ink-300 flex items-start gap-2.5"
              >
                <span className="text-brand-600 dark:text-brand-400 font-mono font-bold shrink-0">
                  #{idx + 1}
                </span>
                <span className="leading-relaxed">{frontier}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
