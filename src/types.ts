/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FamilyCategory =
  | 'feedforward'
  | 'sequence'
  | 'attention'
  | 'ssm'
  | 'graph'
  | 'generative'
  | 'specialized';

export interface ThreeQuestionsProfile {
  coreArchitecture: string;
  structuralMechanisms: string[];
  trainingObjective: string;
}

export interface NetworkFamilyNode {
  id: string;
  title: string;
  family: FamilyCategory;
  familyName: string;
  oneLiner: string;
  analogy: string;
  mathFormula: string;
  mathBreakdown: { symbol: string; meaning: string }[];
  keyIdeas: string[];
  historicalContext: string;
  examples: string[];
  threeQuestions: ThreeQuestionsProfile;
  labAvailable: boolean;
  codeSnippet: string;
  testCases: { input: string; expected: string; description: string }[];
}

export interface LandmarkModel {
  id: string;
  name: string;
  year: number;
  authorOrOrg: string;
  coreArchitecture: string;
  mechanisms: string[];
  trainingTask: string;
  whyItMatters: string;
  familyId: string;
}
