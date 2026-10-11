/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FamilyCategory } from '../types';

export interface FailedIntuition {
  id: string;
  title: string;
  hypothesis: string;
  whyItFailed: string;
  mathExplanation: string;
}

export interface InvariantBreakdown {
  symbol: string;
  role: string;
  whyItDissolvesBottleneck: string;
}

export interface TelemetryMetric {
  name: string;
  baselineVal: number | string;
  breakthroughVal: number | string;
  unit: string;
  interpretation: string;
}

export interface FirstPrinciplesDossier {
  labId: string;
  level: number;
  title: string;
  family: FamilyCategory;
  era: string;
  inventors: string;
  heroQuestion: string;
  crisis: {
    name: string;
    description: string;
    stressParameterName: string;
    stressParameterUnit: string;
    minStress: number;
    maxStress: number;
    defaultStress: number;
    stressStep: number;
    baselineMethodName: string;
    baselineFailureSymptom: string;
    empiricalWallQuote: string;
    computeFailure: (stress: number) => {
      isCollapsed: boolean;
      baselineMetric: number;
      breakthroughMetric: number;
      metricLabel: string;
      statusText: string;
    };
  };
  failedIntuitions: FailedIntuition[];
  invariant: {
    governingEquation: string;
    plainEnglishSummary: string;
    breakdown: InvariantBreakdown[];
    identityDerivativeFormula?: string;
    proofSketch?: string;
  };
  breakthrough: {
    mechanismName: string;
    activationLabel: string;
    successMetricName: string;
    verificationLog: string[];
    badgeId: string;
    nextFrontierId?: string;
    nextFrontierName?: string;
  };
}
