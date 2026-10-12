/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Epistemology & Theory Thinking Data Types:
 * Connects fundamental physics (electrons, thermodynamics) to biological cognition,
 * information theory, and artificial neural architecture invention.
 */

export interface PhysicalPillar {
  id: string;
  order: number;
  domain: 'quantum_physics' | 'thermodynamics' | 'biology' | 'information_theory' | 'artificial_intelligence';
  title: string;
  tagline: string;
  fundamentalEntity: string;
  governingPhysicalLaw: string;
  mathematicalEquation: string;
  equationExplanation: string;
  physicalIntuition: string;
  theBridgeToNextLevel: string;
  aiAnalogy: string;
  iconName: string;
}

export interface CognitiveLeapPattern {
  id: string;
  number: number;
  name: string;
  tagline: string;
  theMentalJump: string;
  originatingField: string;
  borrowedMetaphor: string;
  falseAssumptionBroken: string;
  differentiableRelaxationTrick: string;
  historicalMilestones: string[];
  keyFormula: string;
  formulaExplanation: string;
  howToApplyInResearch: string;
  dangerSignOrTrap: string;
}

export interface PaperInventionDeconstruction {
  id: string;
  paperTitle: string;
  authorsAndYear: string;
  architecturalBreakthrough: string;
  theApparentParadox: string;
  theRawIntuitionBeforeMath: string;
  theCrossDisciplinaryMetaphor: string;
  theDifferentiableRelaxation: string;
  theHardwareSymbiosis: string;
  unwrittenMentalPath: string[];
  formalEquation: string;
  whyPreviousAttemptsFailed: string;
}

export interface InventionGymExercise {
  id: string;
  targetDomain: string;
  title: string;
  currentBottleneckDescription: string;
  theFalseAssumption: string;
  candidateMetaphors: {
    id: string;
    metaphorName: string;
    sourceDiscipline: string;
    intuition: string;
    whyItFitsOrFails: string;
    isOptimalLeap: boolean;
  }[];
  differentiableRelaxationPrompt: string;
  suggestedMathematicalInvariant: string;
  theBreakthroughArchitectureName: string;
  hardwareRealityCheck: string;
}

export interface ThoughtExperimentDerivationStep {
  step: number;
  axiom: string;
  mathematicalStatement: string;
  physicalInterpretation: string;
}

export interface ThoughtExperiment {
  id: string;
  title: string;
  subtitle: string;
  paradoxPrompt: string;
  physicalDomain: string;
  brokenIntuition: string;
  pureScratchDerivation: ThoughtExperimentDerivationStep[];
  theSynthesis: string;
  hardwareImplication: string;
  interactiveHypothesisPrompt: string;
}
