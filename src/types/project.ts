/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Types for Interactive "Build It Yourself from Scratch" (DIY) Projects.
 * Allows learners to code foundational neural architectures from elementary
 * mathematical primitives without external library blackboxes.
 */

export interface TestCase {
  id: string;
  description: string;
  inputDesc: string;
  expectedDesc: string;
  testFn: string; // Name of the target function in user code
  args: any[];
  expected: any;
  tolerance?: number;
}

export interface ProjectMilestone {
  step: number;
  title: string;
  guidance: string;
  firstPrinciplesWhy: string;
  starterSnippet: string;
  hint: string;
}

export interface VisualSimulationMapping {
  renderType: 'decision_boundary' | 'loss_curve' | 'feature_map' | 'sequence_state' | 'attention_matrix' | 'ssm_state' | 'graph_nodes' | 'diffusion_grid' | 'continuous_flow';
  canvasDescription: string;
  dataExtractorFn: string;
  interactiveControls: string[];
}

export interface DiyProject {
  id: string; // e.g. 'perceptron', 'mlp', 'cnn_resnet'
  level: number;
  title: string;
  architectureName: string;
  tagline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastery';
  estimatedMinutes: number;
  prerequisites: string[];
  firstPrinciplesBedrock: string;
  axiomaticRule: string; // e.g. "Zero external ML libraries. Pure scalar math & raw arrays only."
  milestones: ProjectMilestone[];
  starterCode: string;
  solutionCode: string;
  pythonStarterCode?: string;
  pythonSolutionCode?: string;
  testCases: TestCase[];
  visualFeedbackType: 'decision_boundary' | 'loss_curve' | 'feature_map' | 'sequence_state' | 'attention_matrix' | 'ssm_state' | 'graph_nodes' | 'diffusion_grid' | 'continuous_flow';
  visualSimulationMapping?: VisualSimulationMapping;
}
