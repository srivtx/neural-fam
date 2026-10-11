/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WhyNotContrast {
  alternativeMethod: string;
  theNaiveAppeal: string;
  theFatalFlaw: string;
  mathematicalProof: string;
}

export interface DerivationStep {
  stepNumber: number;
  stepTitle: string;
  formula: string;
  explanation: string;
  criticalInsight: string;
}

export interface DesignDecision {
  parameterOrComponent: string;
  standardChoice: string;
  whyThisExactValue: string;
  consequenceOfAlternation: string;
}

export interface TheoryDossier {
  labId: string;
  level: number;
  title: string;
  subtitle: string;
  foundationalObjective: {
    problemStatement: string;
    axioms: string[];
    physicsOrMathGoal: string;
  };
  whyNotContrasts: WhyNotContrast[];
  firstPrinciplesDerivation: {
    overview: string;
    steps: DerivationStep[];
    finalGoverningEquation: string;
    derivationTakeaway: string;
  };
  geometricManifoldInterpretation: {
    spaceName: string;
    manifoldConcept: string;
    visualizationDescription: string;
    energyOrLossGeometry: string;
  };
  designDecisionsDecoded: DesignDecision[];
  researchFrontiers: string[];
}
