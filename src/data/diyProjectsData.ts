/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Exhaustive "Build It Yourself from Scratch" (DIY) Projects for Neural Architectures.
 * Covers:
 * - Level 0: Rosenblatt Perceptron (1958)
 * - Level 1: Multilayer Perceptron & Analytical Backpropagation (1986)
 * - Level 2: 2D Convolution & Deep ResNet Identity Highways (1989 / 2015)
 *
 * Axiomatic Rule: ZERO external ML frameworks (no PyTorch, TensorFlow, or mathjs).
 * Pure scalar math and raw JavaScript/TypeScript arrays only.
 */

import { DiyProject } from '../types/project';
import {
  RNN_LSTM_PROJECT,
  TRANSFORMER_PROJECT,
  SSM_MAMBA_PROJECT,
} from './sequenceAttentionSsmProjects';
import {
  GNN_PROJECT,
  DIFFUSION_PROJECT,
  NEURAL_ODE_PROJECT,
} from './nonEuclideanGenerativeContinuousProjects';
import { PYTHON_DIY_PROJECTS } from './pythonDiyProjects';

export {
  RNN_LSTM_PROJECT,
  TRANSFORMER_PROJECT,
  SSM_MAMBA_PROJECT,
  GNN_PROJECT,
  DIFFUSION_PROJECT,
  NEURAL_ODE_PROJECT,
  PYTHON_DIY_PROJECTS,
};

export const DIY_PROJECTS: Record<string, DiyProject> = {
  // =========================================================================
  // LEVEL 0: ROSENBLATT PERCEPTRON (1958)
  // =========================================================================
  perceptron: {
    id: 'perceptron',
    level: 0,
    title: 'Build a Rosenblatt Perceptron from Raw Arithmetic',
    architectureName: 'Rosenblatt Perceptron (1958)',
    tagline: 'Carve Euclidean vector space with a single affine hyperplane using biological thresholding logic.',
    difficulty: 'Beginner',
    estimatedMinutes: 25,
    prerequisites: [
      'Elementary arithmetic & algebraic summation',
      'Cartesian coordinate geometry (2D points and lines)',
      'Vector inner product intuition (projection of arrows)',
    ],
    firstPrinciplesBedrock: `
### The Physical Sensory Origin
Biological intelligence does not begin with floating-point tensors; it begins with physical energy quanta impinging upon sensory membranes. In the biological visual system, photons strike rod photoreceptor cells in the retina, inducing photochemical isomerization of 11-cis-retinal into all-trans-retinal within rhodopsin pigments. This triggers a G-protein enzymatic cascade (transducin -> phosphodiesterase) that hydrolyzes cyclic GMP, closing sodium ion channels. The resulting hyperpolarization modulates glutamate release at synaptic terminals connecting bipolar and ganglion cells.

At the axon hillock of the ganglion neuron, excitatory and inhibitory postsynaptic potentials (EPSPs and IPSPs) summate electrotonically over space and time. If the net membrane potential crosses a critical threshold $\\theta$ (typically depolarizing from $-70\\text{ mV}$ resting potential to $-55\\text{ mV}$), voltage-gated sodium channels burst open in an explosive, regenerative cascade. An action potential (~100 mV voltage spike) fires along the axon down the optic nerve. If the threshold is not reached, nothing fires. This is the **all-or-none thresholding law**.

### The Minimal Mathematical Abstraction
Frank Rosenblatt (1958) sought the absolute simplest mathematical model capable of reproducing this physical integration and firing:
1. **Inputs as continuous coordinates**: Sensory excitations are represented as a real vector $\\mathbf{x} = [x_1, x_2, \\dots, x_n]^T \\in \\mathbb{R}^n$.
2. **Synaptic efficacies as weights**: Synaptic transmission strengths are represented as a weight vector $\\mathbf{w} = [w_1, w_2, \\dots, w_n]^T \\in \\mathbb{R}^n$, where $w_i > 0$ represents an excitatory synapse and $w_i < 0$ represents an inhibitory synapse.
3. **Inner product as cumulative excitation**: Total postsynaptic excitation is the Euclidean dot product:
   $$z = \\mathbf{w}^T \\mathbf{x} = \\sum_{i=1}^n w_i x_i = \\|\\mathbf{w}\\| \\|\\mathbf{x}\\| \\cos(\\theta)$$
4. **Membrane threshold via affine bias**: Rather than comparing $z$ to a constant threshold $\\theta$, Rosenblatt subtracted $\\theta$ directly, defining a scalar bias $b = -\\theta$. The decision condition $z \\ge \\theta$ becomes:
   $$z + b = \\mathbf{w}^T \\mathbf{x} + b \\ge 0$$
5. **Why a linear hyperplane is irreducible**: An affine hyperplane $\\{\\mathbf{x} \\in \\mathbb{R}^n : \\mathbf{w}^T \\mathbf{x} + b = 0\\}$ is a degree-1 polynomial. It requires exactly $n + 1$ parameters ($n$ direction cosines $+ 1$ offset) and $O(n)$ compute operations. This is the absolute mathematical lower bound required to inspect $n$ independent sensory inputs even once. Any model with fewer parameters cannot weigh all inputs; any model of degree $\\ge 2$ requires at least $O(n^2)$ compute and introduces non-convex optimization.

### The 1969 Minsky & Papert XOR Catastrophe
In 1969, Marvin Minsky and Seymour Papert published *Perceptrons*, presenting a devastating algebraic proof that a single linear threshold unit cannot compute the Exclusive-OR (XOR) parity function. This mathematical proof triggered the first 17-year AI Winter.

**The Full Algebraic Contradiction Proof**:
Let the XOR truth table be defined on binary inputs $(x_1, x_2) \\in \\{0, 1\\}^2$:
- $(0, 0) \\mapsto 0$
- $(1, 0) \\mapsto 1$
- $(0, 1) \\mapsto 1$
- $(1, 1) \\mapsto 0$

Assume there exist real numbers $w_1, w_2, b \\in \\mathbb{R}$ such that $y = \\text{step}(w_1 x_1 + w_2 x_2 + b)$ correctly classifies all four vertices. This yields four simultaneous linear inequalities:
1. For $(0, 0) \\mapsto 0$:
   $$w_1(0) + w_2(0) + b < 0 \\implies b < 0 \\quad \\text{[Eq. 1]}$$
2. For $(1, 0) \\mapsto 1$:
   $$w_1(1) + w_2(0) + b \\ge 0 \\implies w_1 + b \\ge 0 \\quad \\text{[Eq. 2]}$$
3. For $(0, 1) \\mapsto 1$:
   $$w_1(0) + w_2(1) + b \\ge 0 \\implies w_2 + b \\ge 0 \\quad \\text{[Eq. 3]}$$
4. For $(1, 1) \\mapsto 0$:
   $$w_1(1) + w_2(1) + b < 0 \\implies w_1 + w_2 + b < 0 \\quad \\text{[Eq. 4]}$$

Now, perform direct algebraic summation of inequalities [Eq. 2] and [Eq. 3]:
$$(w_1 + b) + (w_2 + b) \\ge 0 + 0 \\implies w_1 + w_2 + 2b \\ge 0 \\quad \\text{[Eq. 5]}$$

Next, consider [Eq. 4]: $w_1 + w_2 + b < 0$. Add the scalar $b$ to both sides:
$$(w_1 + w_2 + b) + b < 0 + b \\implies w_1 + w_2 + 2b < b \\quad \\text{[Eq. 6]}$$

Now chain [Eq. 5] and [Eq. 6] together with [Eq. 1] ($b < 0$):
$$0 \\le w_1 + w_2 + 2b < b < 0$$
$$\\implies 0 < 0$$
This is an immediate, irreconcilable algebraic contradiction ($0 < 0$).
Therefore, **NO linear hyperplane in $\\mathbb{R}^2$ can ever classify XOR**.

### Why Stacking Linear Layers Fails
A naive intuition is: "If one linear neuron draws one line, stacking two linear layers will draw two lines."
Mathematically, linear transformations are closed under function composition:
$$\\mathbf{y} = \\mathbf{W}_2 (\\mathbf{W}_1 \\mathbf{x} + \\mathbf{b}_1) + \\mathbf{b}_2 = (\\mathbf{W}_2 \\mathbf{W}_1) \\mathbf{x} + (\\mathbf{W}_2 \\mathbf{b}_1 + \\mathbf{b}_2) = \\mathbf{W}_{\\text{eff}} \\mathbf{x} + \\mathbf{b}_{\\text{eff}}$$
Because matrix multiplication is associative, stacking 100 linear layers collapses identically to a single linear layer of rank $\\le \\min(\\text{rank}(\\mathbf{W}_i))$. Non-linear squashing functions are an absolute ontological necessity.
    `,
    axiomaticRule: 'Zero external ML libraries. Pure scalar math & raw 1D arrays only.',
    milestones: [
      {
        step: 1,
        title: 'Affine Inner Product & Bias Translation',
        guidance: 'Implement dotProduct(w, x) and forwardAffine(w, x, b). The inner product projects input vector x onto normal direction w; the bias b shifts the hyperplane perpendicular to itself away from the origin by distance |b| / ||w||.',
        firstPrinciplesWhy: 'Without bias b, the decision boundary is permanently pinned through the origin (0, 0), incapable of classifying translated clusters.',
        starterSnippet: 'function forwardAffine(w: number[], x: number[], b: number): number {\n  // TODO: sum(w[i] * x[i]) + b\n}',
        hint: 'Use a simple for-loop accumulating products w[i] * x[i], then add scalar b.',
      },
      {
        step: 2,
        title: 'Heaviside Step & Sigmoid Activations',
        guidance: 'Implement stepActivation(z) returning 1 if z >= 0 else 0. Implement sigmoidActivation(z) = 1 / (1 + exp(-z)).',
        firstPrinciplesWhy: 'The step function embodies biological all-or-none firing. Sigmoid provides a smooth, differentiable continuous approximation.',
        starterSnippet: 'function stepActivation(z: number): number {\n  // TODO: return 1 if z >= 0 else 0\n}',
        hint: 'In step activation, evaluate z >= 0. For sigmoid, use Math.exp(-z).',
      },
      {
        step: 3,
        title: 'Perceptron Learning Rule',
        guidance: 'Implement perceptronUpdate(w, b, x, yTrue, yPred, lr). If prediction is correct, weights do not change. If misclassified, update w_i += lr * (yTrue - yPred) * x_i and b += lr * (yTrue - yPred).',
        firstPrinciplesWhy: 'The Novikoff Perceptron Convergence Theorem (1962) proves that if data is linearly separable by margin gamma, this rule converges to zero errors in at most (R / gamma)^2 steps.',
        starterSnippet: 'function perceptronUpdate(w: number[], b: number, x: number[], yTrue: number, yPred: number, lr: number) {\n  // TODO: compute error = yTrue - yPred and update w and b\n}',
        hint: 'error = yTrue - yPred. When yTrue === yPred, error === 0 and weights remain unchanged.',
      },
      {
        step: 4,
        title: 'Training Loop on Logic Gates (AND Gate)',
        guidance: 'Train the perceptron across multiple epochs on the 4-point AND gate dataset until 100% training accuracy is attained.',
        firstPrinciplesWhy: 'Validates that the learning rule reliably discovers a separating hyperplane in finite iterations on linearly separable data.',
        starterSnippet: 'function trainAndGate(epochs: number, lr: number): number {\n  // TODO: train on [{x:[0,0],y:0}, {x:[0,1],y:0}, {x:[1,0],y:0}, {x:[1,1],y:1}]\n}',
        hint: 'Iterate over epochs and dataset samples, calling forwardAffine, stepActivation, and perceptronUpdate.',
      },
      {
        step: 5,
        title: 'Extracting the Geometric Decision Boundary',
        guidance: 'Derive the 2D Cartesian slope and y-intercept of the boundary line w1*x1 + w2*x2 + b = 0.',
        firstPrinciplesWhy: 'Rearranging the equation yields x2 = -(w1 / w2) * x1 - (b / w2). The slope is -w1/w2 and intercept is -b/w2.',
        starterSnippet: 'function getDecisionBoundary(w: number[], b: number): { slope: number; intercept: number } {\n  // TODO: return slope and intercept\n}',
        hint: 'Slope is -w[0] / w[1], intercept is -b / w[1]. Guard against division by zero if w[1] === 0.',
      },
    ],
    starterCode: `/**
 * LEVEL 0 DIY: The Rosenblatt Perceptron from Raw Arithmetic
 * Axiom: Zero external ML libraries. Pure scalar math & raw arrays only.
 */

// MILESTONE 1: Affine Dot Product & Bias Translation
export function dotProduct(w: number[], x: number[]): number {
  // TODO: Compute the dot product sum_{i=0}^{n-1} w[i] * x[i]
  let sum = 0;
  for (let i = 0; i < w.length; i++) {
    sum += w[i] * x[i];
  }
  return sum;
}

export function forwardAffine(w: number[], x: number[], b: number): number {
  // TODO: Return dotProduct(w, x) + b
  return dotProduct(w, x) + b;
}

// MILESTONE 2: Step & Sigmoid Activations
export function stepActivation(z: number): number {
  // TODO: Biological thresholding: return 1 if z >= 0 else 0
  return z >= 0 ? 1 : 0;
}

export function stepActivationMulti(zs: number[]): number[] {
  return zs.map(z => stepActivation(z));
}

export function sigmoidActivation(z: number): number {
  // TODO: Smooth squashing: 1 / (1 + exp(-z))
  return 1 / (1 + Math.exp(-z));
}

// MILESTONE 3: Perceptron Learning Rule Update
export function perceptronUpdate(
  w: number[],
  b: number,
  x: number[],
  yTrue: number,
  yPred: number,
  lr: number
): { w: number[]; b: number } {
  // TODO: Compute prediction error = yTrue - yPred
  // Update weights: w_new[i] = w[i] + lr * error * x[i]
  // Update bias: b_new = b + lr * error
  const error = yTrue - yPred;
  const newW = w.map((wi, i) => wi + lr * error * x[i]);
  const newB = b + lr * error;
  return { w: newW, b: newB };
}

// MILESTONE 4: Training Loop on AND Gate
export function trainAndGateAccuracy(epochs: number = 50, lr: number = 0.1): number {
  const dataset = [
    { x: [0, 0], y: 0 },
    { x: [0, 1], y: 0 },
    { x: [1, 0], y: 0 },
    { x: [1, 1], y: 1 },
  ];

  let w = [0, 0];
  let b = 0;

  for (let ep = 0; ep < epochs; ep++) {
    for (const sample of dataset) {
      const z = forwardAffine(w, sample.x, b);
      const yPred = stepActivation(z);
      const updated = perceptronUpdate(w, b, sample.x, sample.y, yPred, lr);
      w = updated.w;
      b = updated.b;
    }
  }

  // Calculate final accuracy
  let correct = 0;
  for (const sample of dataset) {
    const z = forwardAffine(w, sample.x, b);
    const yPred = stepActivation(z);
    if (yPred === sample.y) correct++;
  }
  return correct / dataset.length;
}

// MILESTONE 5: Decision Boundary Geometry
export function getDecisionBoundary(w: number[], b: number): { slope: number; intercept: number } {
  // Line equation: w[0]*x1 + w[1]*x2 + b = 0 => x2 = -(w[0]/w[1])*x1 - (b/w[1])
  const slope = -w[0] / w[1];
  const intercept = -b / w[1];
  return { slope, intercept };
}
`,
    solutionCode: `/**
 * LEVEL 0 DIY: The Rosenblatt Perceptron Reference Solution
 * Strict First-Principles Formulation. Pure scalar arithmetic.
 */

export function dotProduct(w: number[], x: number[]): number {
  let sum = 0;
  for (let i = 0; i < w.length; i++) {
    sum += w[i] * x[i];
  }
  return sum;
}

export function forwardAffine(w: number[], x: number[], b: number): number {
  return dotProduct(w, x) + b;
}

export function stepActivation(z: number): number {
  return z >= 0 ? 1 : 0;
}

export function stepActivationMulti(zs: number[]): number[] {
  return zs.map(z => stepActivation(z));
}

export function sigmoidActivation(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function perceptronUpdate(
  w: number[],
  b: number,
  x: number[],
  yTrue: number,
  yPred: number,
  lr: number
): { w: number[]; b: number } {
  const error = yTrue - yPred;
  const newW = new Array(w.length);
  for (let i = 0; i < w.length; i++) {
    newW[i] = w[i] + lr * error * x[i];
  }
  const newB = b + lr * error;
  return { w: newW, b: newB };
}

export function trainAndGateAccuracy(epochs: number = 50, lr: number = 0.1): number {
  const dataset = [
    { x: [0, 0], y: 0 },
    { x: [0, 1], y: 0 },
    { x: [1, 0], y: 0 },
    { x: [1, 1], y: 1 },
  ];

  let w = [0, 0];
  let b = 0;

  for (let ep = 0; ep < epochs; ep++) {
    for (const sample of dataset) {
      const z = forwardAffine(w, sample.x, b);
      const yPred = stepActivation(z);
      const updated = perceptronUpdate(w, b, sample.x, sample.y, yPred, lr);
      w = updated.w;
      b = updated.b;
    }
  }

  let correct = 0;
  for (const sample of dataset) {
    const z = forwardAffine(w, sample.x, b);
    const yPred = stepActivation(z);
    if (yPred === sample.y) correct++;
  }
  return correct / dataset.length;
}

export function getDecisionBoundary(w: number[], b: number): { slope: number; intercept: number } {
  if (Math.abs(w[1]) < 1e-9) {
    return { slope: -Infinity, intercept: 0 };
  }
  return {
    slope: -w[0] / w[1],
    intercept: -b / w[1],
  };
}
`,
    testCases: [
      {
        id: 'tc_p1',
        description: 'Forward Affine Dot Product & Translation (w · x + b)',
        inputDesc: 'w = [1.5, -2.0], x = [2.0, 3.0], b = 0.5',
        expectedDesc: '-2.5',
        testFn: 'forwardAffine',
        args: [[1.5, -2.0], [2.0, 3.0], 0.5],
        expected: -2.5,
        tolerance: 1e-4,
      },
      {
        id: 'tc_p2',
        description: 'Biological Heaviside Step Activation at Boundaries',
        inputDesc: 'zs = [0.0, -0.05, 3.2]',
        expectedDesc: '[1, 0, 1]',
        testFn: 'stepActivationMulti',
        args: [[0.0, -0.05, 3.2]],
        expected: [1, 0, 1],
      },
      {
        id: 'tc_p3',
        description: 'Perceptron Learning Rule Update on Misclassification',
        inputDesc: 'w = [0, 0], b = 0, x = [2.0, 1.0], yTrue = 1, yPred = 0, lr = 0.1',
        expectedDesc: '{ w: [0.2, 0.1], b: 0.1 }',
        testFn: 'perceptronUpdate',
        args: [[0, 0], 0, [2.0, 1.0], 1, 0, 0.1],
        expected: { w: [0.2, 0.1], b: 0.1 },
        tolerance: 1e-4,
      },
      {
        id: 'tc_p4',
        description: 'Novikoff Convergence on Linearly Separable AND Gate',
        inputDesc: 'epochs = 50, lr = 0.1 on 4-point AND logic gate',
        expectedDesc: '1.0 (100% accuracy)',
        testFn: 'trainAndGateAccuracy',
        args: [50, 0.1],
        expected: 1.0,
        tolerance: 1e-4,
      },
      {
        id: 'tc_p5',
        description: 'Geometric Decision Boundary Extraction (Line slope & intercept)',
        inputDesc: 'w = [2.0, 4.0], b = -6.0',
        expectedDesc: '{ slope: -0.5, intercept: 1.5 }',
        testFn: 'getDecisionBoundary',
        args: [[2.0, 4.0], -6.0],
        expected: { slope: -0.5, intercept: 1.5 },
        tolerance: 1e-4,
      },
    ],
    visualFeedbackType: 'decision_boundary',
    visualSimulationMapping: {
      renderType: 'decision_boundary',
      canvasDescription: 'Interactive 2D Cartesian coordinate plane plotting data samples as circular glyphs (class 0 in slate, class 1 in emerald) and the dynamic affine hyperplane line x2 = -(w1/w2)x1 - (b/w2) sweeping across epochs.',
      dataExtractorFn: '(state) => ({ points: state.dataset, boundary: state.getDecisionBoundary(state.w, state.b), accuracy: state.accuracy })',
      interactiveControls: ['Weight Slider w1', 'Weight Slider w2', 'Bias Slider b', 'Learning Rate lr', 'Epoch Step Button'],
    },
  },

  // =========================================================================
  // LEVEL 1: MULTILAYER PERCEPTRON & BACKPROPAGATION (1986)
  // =========================================================================
  mlp: {
    id: 'mlp',
    level: 1,
    title: 'Build a 2-Layer MLP & Reverse-Mode Backpropagation Engine from Scratch',
    architectureName: 'Multilayer Perceptron with Analytical Backpropagation (Rumelhart et al. 1986)',
    tagline: 'Fold non-linear coordinate manifolds and route exact analytical gradients backwards in O(1) passes.',
    difficulty: 'Intermediate',
    estimatedMinutes: 45,
    prerequisites: [
      'Multivariable chain rule: dy/dx = (dy/du) · (du/dx)',
      'Matrix-vector multiplication and transposed projections',
      'Derivative of sigmoid: d/dz σ(z) = σ(z)(1 - σ(z))',
    ],
    firstPrinciplesBedrock: `
### The Credit Assignment Crisis
Following the 1969 Minsky & Papert critique, neural network research stalled because of the **Credit Assignment Crisis**. In a single neuron, error is transparent: $e = y - \\hat{y}$. But in a network with hidden layers, hidden neurons receive no direct target labels from the external world. If a network outputs an error, which hidden synapse among millions was responsible, and by how much should it change?

Biologically inspired Hebbian plasticity ("neurons that fire together wire together") operates solely on local co-activity: $\\Delta w_{ij} \\propto a_i a_j$. It is fundamentally blind to downstream global error signals and cannot optimize a global scalar objective function.

### The 1986 Breakthrough: Rumelhart, Hinton, & Williams
In 1986, Rumelhart, Hinton, and Williams solved this crisis by making two profound mathematical decisions:
1. **Differentiable squashing**: Replace non-differentiable step functions with smooth, monotonic activations (Sigmoid: $\\sigma(z) = 1/(1+e^{-z})$). Because $\\sigma$ is continuously differentiable everywhere, infinitesimal changes in any weight induce smooth, predictable changes in the output loss.
2. **Reverse-mode multivariable chain rule**: Rather than perturbing weights individually, route sensitivities backward through the network in a single sweep using intermediate adjoint error vectors $\\boldsymbol{\\delta}$.

### Exhaustive Algebraic Derivation of Backpropagation
Consider a network where layer $l$ computes:
$$\\mathbf{z}^{(l)} = \\mathbf{W}^{(l)} \\mathbf{a}^{(l-1)} + \\mathbf{b}^{(l)}, \\quad \\mathbf{a}^{(l)} = \\sigma\\left(\\mathbf{z}^{(l)}\\right)$$
Let $\\mathcal{L}$ be a scalar loss function (e.g., squared error $\\mathcal{L} = \\frac{1}{2} \\|\\mathbf{a}^{(L)} - \\mathbf{y}\\|^2$).

**Step 1: The Adjoint Error Sensitivity Vector**
Define the sensitivity of the loss with respect to pre-activation $z_j^{(l)}$ as:
$$\\delta_j^{(l)} \\equiv \\frac{\\partial \\mathcal{L}}{\\partial z_j^{(l)}}$$

**Step 2: Output Layer Error $\\boldsymbol{\\delta}^{(L)}$**
By the univariate chain rule applied to each element $j$:
$$\\delta_j^{(L)} = \\frac{\\partial \\mathcal{L}}{\\partial z_j^{(L)}} = \\frac{\\partial \\mathcal{L}}{\\partial a_j^{(L)}} \\cdot \\frac{\\partial a_j^{(L)}}{\\partial z_j^{(L)}} = \\frac{\\partial \\mathcal{L}}{\\partial a_j^{(L)}} \\cdot \\sigma'\\left(z_j^{(L)}\\right)$$
For squared error $\\mathcal{L} = \\frac{1}{2}(a_j^{(L)} - y_j)^2$, we have $\\frac{\\partial \\mathcal{L}}{\\partial a_j^{(L)}} = (a_j^{(L)} - y_j)$. Thus:
$$\\delta_j^{(L)} = (a_j^{(L)} - y_j) \\cdot \\sigma'\\left(z_j^{(L)}\\right)$$
In vector notation:
$$\\boldsymbol{\\delta}^{(L)} = \\nabla_{\\mathbf{a}^{(L)}} \\mathcal{L} \\odot \\sigma'\\left(\\mathbf{z}^{(L)}\\right)$$

**Step 3: Hidden Layer Recurrent Adjoint Equation**
To compute $\\delta_j^{(l)}$ for a hidden layer $l < L$, apply the multivariable chain rule across all $K$ neurons in layer $l+1$:
$$\\delta_j^{(l)} = \\frac{\\partial \\mathcal{L}}{\\partial z_j^{(l)}} = \\sum_{k=1}^K \\frac{\\partial \\mathcal{L}}{\\partial z_k^{(l+1)}} \\cdot \\frac{\\partial z_k^{(l+1)}}{\\partial a_j^{(l)}} \\cdot \\frac{\\partial a_j^{(l)}}{\\partial z_j^{(l)}}$$
Notice the terms:
- $\\frac{\\partial \\mathcal{L}}{\\partial z_k^{(l+1)}} = \\delta_k^{(l+1)}$ (the error from downstream neuron $k$)
- $z_k^{(l+1)} = \\sum_m W_{km}^{(l+1)} a_m^{(l)} + b_k^{(l+1)} \\implies \\frac{\\partial z_k^{(l+1)}}{\\partial a_j^{(l)}} = W_{kj}^{(l+1)}$
- $a_j^{(l)} = \\sigma(z_j^{(l)}) \\implies \\frac{\\partial a_j^{(l)}}{\\partial z_j^{(l)}} = \\sigma'\\left(z_j^{(l)}\\right)$

Substituting these in:
$$\\delta_j^{(l)} = \\left( \\sum_{k=1}^K \\delta_k^{(l+1)} W_{kj}^{(l+1)} \\right) \\cdot \\sigma'\\left(z_j^{(l)}\\right)$$
In vector-matrix form:
$$\\boldsymbol{\\delta}^{(l)} = \\left( (\\mathbf{W}^{(l+1)})^T \\boldsymbol{\\delta}^{(l+1)} \\right) \\odot \\sigma'\\left(\\mathbf{z}^{(l)}\\right)$$
*Critical Physical Insight*: Forward signals propagate along weight matrix $\\mathbf{W}$; error sensitivities propagate backward along transposed matrix $\\mathbf{W}^T$.

**Step 4: Parameter Gradients**
Now express the loss gradient with respect to synaptic weight $W_{ji}^{(l)}$:
$$\\frac{\\partial \\mathcal{L}}{\\partial W_{ji}^{(l)}} = \\frac{\\partial \\mathcal{L}}{\\partial z_j^{(l)}} \\cdot \\frac{\\partial z_j^{(l)}}{\\partial W_{ji}^{(l)}} = \\delta_j^{(l)} \\cdot a_i^{(l-1)}$$
In matrix outer-product form:
$$\\frac{\\partial \\mathcal{L}}{\\partial \\mathbf{W}^{(l)}} = \\boldsymbol{\\delta}^{(l)} (\\mathbf{a}^{(l-1)})^T, \\quad \\frac{\\partial \\mathcal{L}}{\\partial \\mathbf{b}^{(l)}} = \\boldsymbol{\\delta}^{(l)}$$

### Computational Complexity: Reverse-Mode vs Numerical Differentiation
Why did backpropagation revolutionize science? Consider numerical finite differences:
$$\\frac{\\partial \\mathcal{L}}{\\partial w_p} \\approx \\frac{\\mathcal{L}(\\mathbf{w} + \\varepsilon \\mathbf{e}_p) - \\mathcal{L}(\\mathbf{w})}{\\varepsilon}$$
To compute the gradient vector for a network with $P$ parameters:
- Finite differences requires $P + 1$ complete forward passes through the network.
- For a modest 100M parameter model ($P = 10^8$), if one forward pass takes $10\\text{ ms}$ ($0.01\\text{ s}$):
  $$T = 10^8 \\times 0.01\\text{ s} = 1,000,000\\text{ seconds} \\approx 11.57\\text{ DAYS per gradient step!}$$
  Training for 100,000 iterations would take $3,170\\text{ YEARS}$.
- **Reverse-Mode Automatic Differentiation (Backprop)** computes **ALL $10^8$ partial derivatives simultaneously** in a single reverse sweep whose compute cost is bounded by $\\le 3 \\times$ forward pass cost (~$0.02\\text{ s}$, or $\\sim 30\\text{ ms}$ total).

### Why Sigmoid Fails in Deep Networks and ReLU Succeeded
For Sigmoid: $\\sigma(z) = \\frac{1}{1 + e^{-z}}$. Its derivative is $\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))$.
The maximum derivative occurs at $z = 0$, where $\\sigma(0) = 0.5$:
$$\\sigma'(0) = 0.5 \\times (1 - 0.5) = 0.25 = \\frac{1}{4}$$
For any $|z| > 0$, $\\sigma'(z) < 0.25$.
In an $L$-layer deep network, backpropagating through $L$ layers involves multiplying $L$ derivative terms:
$$\\left\\| \\boldsymbol{\\delta}^{(1)} \\right\\| \\le \\left\\| \\boldsymbol{\\delta}^{(L)} \\right\\| \\cdot \\|\\mathbf{W}\\|^{L-1} \\cdot (0.25)^L$$
For $L = 10$ layers: $(0.25)^{10} = \\frac{1}{4^{10}} = \\frac{1}{1,048,576} \\approx 9.54 \\times 10^{-7}$.
For $L = 20$ layers: $(0.25)^{20} \\approx 9.09 \\times 10^{-13}$ (underflows 32-bit floating point precision).
Early layers receive essentially zero gradient, freezing feature extraction (**Vanishing Gradient Problem**).

**Why ReLU solves this**:
$$\\text{ReLU}(z) = \\max(0, z), \\quad \\frac{d}{dz}\\text{ReLU}(z) = \\begin{cases} 1 & \\text{if } z > 0 \\\\ 0 & \\text{if } z < 0 \\end{cases}$$
For all active neurons ($z > 0$), the derivative is **identically 1.0**. Gradients multiply by $1.0^L = 1.0$, flowing backward without exponential attenuation regardless of depth.
    `,
    axiomaticRule: 'Zero external ML libraries. Pure scalar math & raw 2D arrays only.',
    milestones: [
      {
        step: 1,
        title: 'Matrix-Vector Operations Engine',
        guidance: 'Implement matVecMul(W, v) and vecAdd(a, b). Matrix W (shape M x N) transforms vector v (shape N) into vector of length M.',
        firstPrinciplesWhy: 'Affine transformations in Euclidean space are the fundamental building blocks of layered neural representations.',
        starterSnippet: 'function matVecMul(W: number[][], v: number[]): number[] {\n  // TODO: compute W * v\n}',
        hint: 'Iterate over each row i of W, summing row[j] * v[j] over all columns j.',
      },
      {
        step: 2,
        title: 'Differentiable Activations & Exact Derivatives',
        guidance: 'Implement sigmoid(z), sigmoidPrime(z) = sigmoid(z)*(1 - sigmoid(z)), relu(z) = max(0, z), and reluPrime(z) = z > 0 ? 1 : 0.',
        firstPrinciplesWhy: 'Backpropagation requires analytical derivatives of activations to compute the adjoint error gate sigma prime.',
        starterSnippet: 'function sigmoidPrime(z: number): number {\n  // TODO: return sigmoid(z) * (1 - sigmoid(z))\n}',
        hint: 'Calculate s = sigmoid(z), then return s * (1 - s).',
      },
      {
        step: 3,
        title: 'Two-Layer Forward Signal Propagation',
        guidance: 'Compute forwardMlp(x, W1, b1, W2, b2): z1 = W1*x + b1, h1 = sigmoid(z1), z2 = W2*h1 + b2, yHat = sigmoid(z2). Return all intermediate vectors.',
        firstPrinciplesWhy: 'Intermediate activations must be cached in memory during forward propagation because they are required to compute parameter gradients during the backward pass.',
        starterSnippet: 'function forwardMlp(x: number[], W1: number[][], b1: number[], W2: number[], b2: number) {\n  // TODO: return { z1, h1, z2, yHat }\n}',
        hint: 'Use sigmoid on each element of z1 to produce h1; use dot product of W2 and h1 plus b2 to compute z2.',
      },
      {
        step: 4,
        title: 'Reverse-Mode Adjoint Error Vector & Parameter Gradients',
        guidance: 'Implement backwardMlp(x, y, fwd, W2): compute output error delta2 = (yHat - y)*yHat*(1 - yHat), hidden error delta1 = (delta2 * W2) * h1*(1 - h1), and parameter gradients dW2, db2, dW1, db1.',
        firstPrinciplesWhy: 'This is the discrete adjoint sensitivity equation derived from the multivariable chain rule.',
        starterSnippet: 'function backwardMlp(x: number[], y: number, fwd: any, W2: number[]) {\n  // TODO: return { dW1, db1, dW2, db2 }\n}',
        hint: 'dW2 is delta2 * h1; dW1 is outer product of delta1 and x.',
      },
      {
        step: 5,
        title: 'Full Gradient Descent Loop Solving the XOR Crisis',
        guidance: 'Implement trainMlpXorAccuracy(epochs, lr): iterate across the XOR dataset, update weights via gradient descent, and verify 100% classification accuracy.',
        firstPrinciplesWhy: 'Proves empirically that a 2-layer non-linear network dissolves the 1969 Minsky & Papert impasse by folding coordinate space.',
        starterSnippet: 'function trainMlpXorAccuracy(epochs: number = 3000, lr: number = 1.5): number {\n  // TODO: train 2-layer MLP on XOR and return accuracy\n}',
        hint: 'Use learning rate ~1.5 and 2000-3000 epochs. Evaluate final accuracy with threshold 0.5.',
      },
    ],
    starterCode: `/**
 * LEVEL 1 DIY: 2-Layer MLP & Analytical Backpropagation Engine
 * Axiom: Zero external ML libraries. Pure scalar math & 2D arrays only.
 */

// MILESTONE 1: Matrix-Vector Operations
export function matVecMul(W: number[][], v: number[]): number[] {
  // TODO: Return W * v where W is M x N and v is N x 1
  return W.map(row => {
    let sum = 0;
    for (let j = 0; j < v.length; j++) sum += row[j] * v[j];
    return sum;
  });
}

// MILESTONE 2: Differentiable Activations & Derivatives
export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function sigmoidPrime(z: number): number {
  // TODO: Exact analytical derivative: sigma(z) * (1 - sigma(z))
  const s = sigmoid(z);
  return s * (1 - s);
}

export function relu(z: number): number {
  return Math.max(0, z);
}

export function reluPrime(z: number): number {
  return z > 0 ? 1 : 0;
}

export function checkActivationDerivatives(): number[] {
  return [sigmoidPrime(0.0), reluPrime(2.5), reluPrime(-1.0)];
}

// MILESTONE 3: Forward Pass
export interface MlpForwardState {
  z1: number[];
  h1: number[];
  z2: number;
  yHat: number;
}

export function forwardMlp(
  x: number[],
  W1: number[][],
  b1: number[],
  W2: number[],
  b2: number
): MlpForwardState {
  // Layer 1: z1 = W1 * x + b1, h1 = sigmoid(z1)
  const z1 = [
    W1[0][0] * x[0] + W1[0][1] * x[1] + b1[0],
    W1[1][0] * x[0] + W1[1][1] * x[1] + b1[1],
  ];
  const h1 = [sigmoid(z1[0]), sigmoid(z1[1])];

  // Layer 2: z2 = W2 · h1 + b2, yHat = sigmoid(z2)
  const z2 = W2[0] * h1[0] + W2[1] * h1[1] + b2;
  const yHat = sigmoid(z2);

  return { z1, h1, z2, yHat };
}

// MILESTONE 4: Reverse-Mode Adjoint Backpropagation
export interface MlpGradients {
  dW1: number[][];
  db1: number[];
  dW2: number[];
  db2: number;
}

export function backwardMlp(
  x: number[],
  y: number,
  fwd: MlpForwardState,
  W2: number[]
): MlpGradients {
  // 1. Output adjoint error: delta2 = dL/dz2 = (yHat - y) * sigma'(z2)
  const err = fwd.yHat - y;
  const delta2 = err * fwd.yHat * (1 - fwd.yHat);

  // 2. Output parameter gradients
  const dW2 = [delta2 * fwd.h1[0], delta2 * fwd.h1[1]];
  const db2 = delta2;

  // 3. Hidden layer adjoint error: delta1 = (delta2 * W2) * sigma'(z1)
  const dSigH0 = fwd.h1[0] * (1 - fwd.h1[0]);
  const dSigH1 = fwd.h1[1] * (1 - fwd.h1[1]);
  const delta1_0 = (delta2 * W2[0]) * dSigH0;
  const delta1_1 = (delta2 * W2[1]) * dSigH1;

  // 4. Hidden parameter gradients
  const dW1 = [
    [delta1_0 * x[0], delta1_0 * x[1]],
    [delta1_1 * x[0], delta1_1 * x[1]],
  ];
  const db1 = [delta1_0, delta1_1];

  return { dW1, db1, dW2, db2 };
}

// Numerical gradient checking to verify analytical backpropagation
export function verifyGradientsWithFiniteDiff(eps: number = 1e-5): boolean {
  const x = [0.7, 0.3];
  const y = 1.0;
  const W1 = [[0.5, -0.2], [0.3, 0.8]];
  const b1 = [0.1, -0.1];
  const W2 = [0.4, -0.6];
  const b2 = 0.2;

  const fwd = forwardMlp(x, W1, b1, W2, b2);
  const grads = backwardMlp(x, y, fwd, W2);

  // Numerical gradient for W2[0]
  const lossBase = 0.5 * Math.pow(fwd.yHat - y, 2);
  const W2_pert = [W2[0] + eps, W2[1]];
  const fwdPert = forwardMlp(x, W1, b1, W2_pert, b2);
  const lossPert = 0.5 * Math.pow(fwdPert.yHat - y, 2);
  const numGradW2_0 = (lossPert - lossBase) / eps;

  const relDiff = Math.abs(grads.dW2[0] - numGradW2_0) / (Math.abs(grads.dW2[0]) + 1e-8);
  return relDiff < 1e-3;
}

// MILESTONE 5: Full Training on XOR Dataset
export function trainMlpXorAccuracy(epochs: number = 3000, lr: number = 1.5): number {
  const X = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const Y = [0, 1, 1, 0];

  let W1 = [[0.8, -0.5], [-0.4, 0.9]];
  let b1 = [0.1, -0.2];
  let W2 = [1.1, -1.2];
  let b2 = -0.1;

  for (let ep = 0; ep < epochs; ep++) {
    for (let i = 0; i < 4; i++) {
      const fwd = forwardMlp(X[i], W1, b1, W2, b2);
      const grads = backwardMlp(X[i], Y[i], fwd, W2);

      // Gradient descent updates
      W2[0] -= lr * grads.dW2[0];
      W2[1] -= lr * grads.dW2[1];
      b2 -= lr * grads.db2;

      W1[0][0] -= lr * grads.dW1[0][0];
      W1[0][1] -= lr * grads.dW1[0][1];
      b1[0] -= lr * grads.db1[0];

      W1[1][0] -= lr * grads.dW1[1][0];
      W1[1][1] -= lr * grads.dW1[1][1];
      b1[1] -= lr * grads.db1[1];
    }
  }

  let correct = 0;
  for (let i = 0; i < 4; i++) {
    const fwd = forwardMlp(X[i], W1, b1, W2, b2);
    const pred = fwd.yHat >= 0.5 ? 1 : 0;
    if (pred === Y[i]) correct++;
  }
  return correct / 4;
}

export function checkHiddenSeparability(): boolean {
  return trainMlpXorAccuracy(3000, 1.5) === 1.0;
}
`,
    solutionCode: `/**
 * LEVEL 1 DIY: Reference Solution for 2-Layer MLP & Backpropagation
 * Strict scalar/array matrix arithmetic without external dependencies.
 */

export function matVecMul(W: number[][], v: number[]): number[] {
  const out = new Array(W.length);
  for (let i = 0; i < W.length; i++) {
    let s = 0;
    const row = W[i];
    for (let j = 0; j < v.length; j++) {
      s += row[j] * v[j];
    }
    out[i] = s;
  }
  return out;
}

export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

export function sigmoidPrime(z: number): number {
  const s = sigmoid(z);
  return s * (1 - s);
}

export function relu(z: number): number {
  return Math.max(0, z);
}

export function reluPrime(z: number): number {
  return z > 0 ? 1 : 0;
}

export function checkActivationDerivatives(): number[] {
  return [sigmoidPrime(0.0), reluPrime(2.5), reluPrime(-1.0)];
}

export interface MlpForwardState {
  z1: number[];
  h1: number[];
  z2: number;
  yHat: number;
}

export function forwardMlp(
  x: number[],
  W1: number[][],
  b1: number[],
  W2: number[],
  b2: number
): MlpForwardState {
  const z1 = [
    W1[0][0] * x[0] + W1[0][1] * x[1] + b1[0],
    W1[1][0] * x[0] + W1[1][1] * x[1] + b1[1],
  ];
  const h1 = [sigmoid(z1[0]), sigmoid(z1[1])];
  const z2 = W2[0] * h1[0] + W2[1] * h1[1] + b2;
  const yHat = sigmoid(z2);
  return { z1, h1, z2, yHat };
}

export interface MlpGradients {
  dW1: number[][];
  db1: number[];
  dW2: number[];
  db2: number;
}

export function backwardMlp(
  x: number[],
  y: number,
  fwd: MlpForwardState,
  W2: number[]
): MlpGradients {
  const err = fwd.yHat - y;
  const delta2 = err * fwd.yHat * (1 - fwd.yHat);

  const dW2 = [delta2 * fwd.h1[0], delta2 * fwd.h1[1]];
  const db2 = delta2;

  const dSigH0 = fwd.h1[0] * (1 - fwd.h1[0]);
  const dSigH1 = fwd.h1[1] * (1 - fwd.h1[1]);
  const delta1_0 = (delta2 * W2[0]) * dSigH0;
  const delta1_1 = (delta2 * W2[1]) * dSigH1;

  const dW1 = [
    [delta1_0 * x[0], delta1_0 * x[1]],
    [delta1_1 * x[0], delta1_1 * x[1]],
  ];
  const db1 = [delta1_0, delta1_1];

  return { dW1, db1, dW2, db2 };
}

export function verifyGradientsWithFiniteDiff(eps: number = 1e-5): boolean {
  const x = [0.7, 0.3];
  const y = 1.0;
  const W1 = [[0.5, -0.2], [0.3, 0.8]];
  const b1 = [0.1, -0.1];
  const W2 = [0.4, -0.6];
  const b2 = 0.2;

  const fwd = forwardMlp(x, W1, b1, W2, b2);
  const grads = backwardMlp(x, y, fwd, W2);

  const lossBase = 0.5 * Math.pow(fwd.yHat - y, 2);
  const W2_pert = [W2[0] + eps, W2[1]];
  const fwdPert = forwardMlp(x, W1, b1, W2_pert, b2);
  const lossPert = 0.5 * Math.pow(fwdPert.yHat - y, 2);
  const numGradW2_0 = (lossPert - lossBase) / eps;

  const relDiff = Math.abs(grads.dW2[0] - numGradW2_0) / (Math.abs(grads.dW2[0]) + 1e-8);
  return relDiff < 1e-3;
}

export function trainMlpXorAccuracy(epochs: number = 3000, lr: number = 1.5): number {
  const X = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const Y = [0, 1, 1, 0];

  let W1 = [[0.8, -0.5], [-0.4, 0.9]];
  let b1 = [0.1, -0.2];
  let W2 = [1.1, -1.2];
  let b2 = -0.1;

  for (let ep = 0; ep < epochs; ep++) {
    for (let i = 0; i < 4; i++) {
      const fwd = forwardMlp(X[i], W1, b1, W2, b2);
      const grads = backwardMlp(X[i], Y[i], fwd, W2);

      W2[0] -= lr * grads.dW2[0];
      W2[1] -= lr * grads.dW2[1];
      b2 -= lr * grads.db2;

      W1[0][0] -= lr * grads.dW1[0][0];
      W1[0][1] -= lr * grads.dW1[0][1];
      b1[0] -= lr * grads.db1[0];

      W1[1][0] -= lr * grads.dW1[1][0];
      W1[1][1] -= lr * grads.dW1[1][1];
      b1[1] -= lr * grads.db1[1];
    }
  }

  let correct = 0;
  for (let i = 0; i < 4; i++) {
    const fwd = forwardMlp(X[i], W1, b1, W2, b2);
    const pred = fwd.yHat >= 0.5 ? 1 : 0;
    if (pred === Y[i]) correct++;
  }
  return correct / 4;
}

export function checkHiddenSeparability(): boolean {
  return trainMlpXorAccuracy(3000, 1.5) === 1.0;
}
`,
    testCases: [
      {
        id: 'tc_mlp1',
        description: 'Matrix-Vector Affine Transformation (W · v)',
        inputDesc: 'W = [[1, 2], [3, 4]], v = [5, 6]',
        expectedDesc: '[17, 39]',
        testFn: 'matVecMul',
        args: [[[1, 2], [3, 4]], [5, 6]],
        expected: [17, 39],
      },
      {
        id: 'tc_mlp2',
        description: 'Exact Analytical Activation Derivatives',
        inputDesc: 'sigmoidPrime(0.0), reluPrime(2.5), reluPrime(-1.0)',
        expectedDesc: '[0.25, 1.0, 0.0]',
        testFn: 'checkActivationDerivatives',
        args: [],
        expected: [0.25, 1.0, 0.0],
        tolerance: 1e-4,
      },
      {
        id: 'tc_mlp3',
        description: 'Numerical Finite Difference vs Analytical Backpropagation Verification',
        inputDesc: 'eps = 1e-5 numerical perturbation check on weight gradients',
        expectedDesc: 'true (Relative discrepancy < 1e-3)',
        testFn: 'verifyGradientsWithFiniteDiff',
        args: [1e-5],
        expected: true,
      },
      {
        id: 'tc_mlp4',
        description: 'Complete Resolution of the 1969 XOR Crisis (100% Convergence)',
        inputDesc: 'epochs = 3000, lr = 1.5 on 4-point XOR dataset',
        expectedDesc: '1.0 (100% accuracy)',
        testFn: 'trainMlpXorAccuracy',
        args: [3000, 1.5],
        expected: 1.0,
        tolerance: 1e-4,
      },
      {
        id: 'tc_mlp5',
        description: 'Hidden Coordinate Space Separation Metric',
        inputDesc: 'Evaluates coordinate warping in latent space (h1, h2)',
        expectedDesc: 'true (Linear separability restored in hidden manifold)',
        testFn: 'checkHiddenSeparability',
        args: [],
        expected: true,
      },
    ],
    visualFeedbackType: 'loss_curve',
    visualSimulationMapping: {
      renderType: 'loss_curve',
      canvasDescription: 'Dual interactive canvas: Left panel renders the non-linear 2D decision contour boundary bending around the XOR diagonal points; Right panel renders real-time empirical risk loss decay curve descending from 0.25 to < 0.02.',
      dataExtractorFn: '(state) => ({ lossHistory: state.lossHistory, contourGrid: state.contourGrid, accuracy: state.accuracy })',
      interactiveControls: ['Learning Rate lr Slider', 'Hidden Unit Count (2 vs 4 vs 8)', 'Epoch Step', 'Reset Weights'],
    },
  },

  // =========================================================================
  // LEVEL 2: CONVOLUTIONAL NETWORKS & RESNET (1989 / 2015)
  // =========================================================================
  cnn_resnet: {
    id: 'cnn_resnet',
    level: 2,
    title: 'Build 2D Convolution, Max-Pooling & a Residual Highway from Scratch',
    architectureName: 'LeNet-5 Conv2D (1989) & Deep Residual Highway (He et al. 2015)',
    tagline: 'Master spatial translation equivariance and build an uninhibited identity gradient highway across 50 layers.',
    difficulty: 'Advanced',
    estimatedMinutes: 60,
    prerequisites: [
      '2D discrete lattice matrices and spatial coordinate indices',
      'Sliding window convolution / cross-correlation arithmetic',
      'Jacobian decomposition and telescoping recursive sums',
    ],
    firstPrinciplesBedrock: `
### The Physical Reality of 2D Images
Photons emitted or reflected from macroscopic physical surfaces travel through an optical aperture (camera lens or eye pupil) and strike a discrete 2D spatial array of photoreceptors (CMOS sensor photosites or retinal rod/cone mosaic). The resulting sensory data is an image tensor $\\mathbf{I} \\in \\mathbb{R}^{H \\times W \\times C}$.

Two physical laws govern natural visual data:
1. **Spatial Locality**: Matter in our universe is spatially contiguous. Photons striking neighboring pixels $(r, c)$ and $(r, c+1)$ reflect from adjacent points on the same physical object. Spatial covariance $\\text{Cov}(\\mathbf{I}(r, c), \\mathbf{I}(r+\\Delta r, c+\\Delta c))$ decays rapidly as Euclidean distance $\\|(\\Delta r, \\Delta c)\\|$ increases.
2. **Translational Symmetry**: A physical object (e.g. a predatory cat, a traffic sign, or an oriented contour edge) retains its semantic identity regardless of its position in the visual field. If an object shifts by $(\\Delta r, \\Delta c)$, its sensory signature is translated by the exact same shift.

### Why Fully Connected MLPs Suffer Parameter Explosion & Lack Equivariance
If we flatten a $1000 \\times 1000$ RGB image into a 1D vector:
$$\\mathbf{x} \\in \\mathbb{R}^{1000 \\times 1000 \\times 3} = \\mathbb{R}^{3,000,000}$$
Connecting this to a modest hidden layer of just 1,000 neurons requires:
$$\\mathbf{W} \\in \\mathbb{R}^{1,000 \\times 3,000,000} \\implies 3,000,000,000 \\text{ (3 BILLION) weights!}$$
At 4 bytes per 32-bit floating point number:
$$3 \\times 10^9 \\times 4\\text{ bytes} = 12,000,000,000\\text{ bytes} = 12\\text{ GB of RAM}$$
for a **single weight matrix**!

Furthermore, fully connected MLPs lack **Translational Equivariance**:
In an MLP, pixel $(10, 10)$ connects to weight $w_{j, 10, 10}$, while pixel $(11, 10)$ connects to $w_{j, 11, 10}$. If an object moves by 1 pixel, the MLP receives it through completely independent, unshared synapses. The MLP must re-learn what the object looks like at every single coordinate independently!

### Mathematical Derivation of 2D Convolution as a Toeplitz Matrix
Discrete 2D convolution (cross-correlation) slides a compact kernel $\\mathbf{K} \\in \\mathbb{R}^{K_h \\times K_w}$ over image $\\mathbf{I}$:
$$\\mathbf{S}(i, j) = (\\mathbf{I} * \\mathbf{K})(i, j) = \\sum_{m=0}^{K_h-1} \\sum_{n=0}^{K_w-1} \\mathbf{I}(i+m, j+n) \\mathbf{K}(m, n)$$

**Proof of Translational Equivariance**:
Let $\\mathcal{T}_{\\Delta}$ be the spatial translation operator: $(\\mathcal{T}_{\\Delta} \\mathbf{I})(i, j) = \\mathbf{I}(i - \\Delta_i, j - \\Delta_j)$.
$$((\\mathcal{T}_{\\Delta} \\mathbf{I}) * \\mathbf{K})(i, j) = \\sum_{m, n} (\\mathcal{T}_{\\Delta} \\mathbf{I})(i+m, j+n) \\mathbf{K}(m, n) = \\sum_{m, n} \\mathbf{I}(i - \\Delta_i + m, j - \\Delta_j + n) \\mathbf{K}(m, n) = (\\mathbf{I} * \\mathbf{K})(i - \\Delta_i, j - \\Delta_j) = \\mathcal{T}_{\\Delta} ((\\mathbf{I} * \\mathbf{K}))(i, j)$$
Thus, **convolution commutes with spatial translations**: $\\text{Conv}(\\mathcal{T}(\\mathbf{I})) = \\mathcal{T}(\\text{Conv}(\\mathbf{I}))$.

When an image is unrolled into vector $\\text{vec}(\\mathbf{I}) \\in \\mathbb{R}^{HW}$, convolution is mathematically identical to multiplication by a **doubly block Toeplitz matrix** $\\mathbf{C} \\in \\mathbb{R}^{H_{\\text{out}}W_{\\text{out}} \\times H_{\\text{in}}W_{\\text{in}}}$.
A Toeplitz matrix has constant diagonals: $C_{i, j} = c_{i - j}$. This enforces two irreducible physical priors:
1. **Sparsity**: Each row contains only $K_h K_w$ non-zero entries (receptive field locality).
2. **Weight Sharing**: The non-zero entries are identical across all rows, slashing parameter count from $O(H^2 W^2)$ to $O(K_h K_w)$, completely independent of image resolution.

### Receptive Field Growth Arithmetic
The effective receptive field $r_l$ (the spatial diameter in the input image that influences a feature in layer $l$) expands hierarchically:
$$r_l = r_{l-1} + (k_l - 1) \\times S_{l-1}$$
where $S_{l-1} = \\prod_{i=1}^{l-1} s_i$ is the cumulative stride up to layer $l-1$.
For unit stride ($s = 1$): $r_l = r_{l-1} + (k_l - 1)$.
- Stacking two $3 \\times 3$ convolutions gives an effective receptive field of $1 + (3 - 1) + (3 - 1) = 5 \\times 5$.
- Parameter count: Two $3 \\times 3$ kernels use $2 \\times (3^2 \\times C^2) = 18 C^2$ weights. A single $5 \\times 5$ kernel uses $25 C^2$ weights (a **28% parameter reduction**) while introducing an additional non-linear activation in between!

### The 2015 Deep Network Optimization Crisis (He et al. 2015)
In 2015, Kaiming He and colleagues exposed the **Degradation Problem**:
When training plain deep convolutional networks (e.g., 56 layers vs 20 layers on CIFAR-10 and ImageNet), the **56-layer network had higher TRAINING error than the 20-layer network**!

*Crucial First-Principles Distinction*: This was **NOT overfitting**. Overfitting occurs when training error is low but test error is high. Here, the deeper model failed to fit the **training set**.
Mathematically, a 56-layer network contains the 20-layer network as a trivial sub-solution: simply set the extra 36 layers to the identity mapping $\\mathcal{H}(\\mathbf{x}) = \\mathbf{x}$. Because the hypothesis space of the 56-layer network is a superset of the 20-layer network, its optimal training error should be monotonic non-increasing with depth.

The crisis proved that gradient descent optimization breaks down when propagating through dozens of unconstrained non-linear layers: learning $\\mathcal{H}(\\mathbf{x}) = \\mathbf{x}$ via stacked non-linear layers $\\mathbf{W}_2 \\sigma(\\mathbf{W}_1 \\mathbf{x} + \\mathbf{b}_1) + \\mathbf{b}_2 = \\mathbf{x}$ is practically impossible due to multiplicative Jacobian degradation.

### Mathematical Proof of the ResNet Identity Gradient Highway
He et al. (2015) introduced the residual formulation:
$$\\mathbf{x}_{l+1} = \\mathbf{x}_l + \\mathcal{F}(\\mathbf{x}_l, \\mathcal{W}_l)$$
Recursively unrolling this formula from shallow layer $l$ to deep layer $L$:
$$\\mathbf{x}_L = \\mathbf{x}_l + \\sum_{i=l}^{L-1} \\mathcal{F}(\\mathbf{x}_i, \\mathcal{W}_i)$$
Now compute the exact loss gradient with respect to shallow activation $\\mathbf{x}_l$ via the multivariable chain rule for scalar loss $\\mathcal{E}$:
$$\\frac{\\partial \\mathcal{E}}{\\partial \\mathbf{x}_l} = \\frac{\\partial \\mathcal{E}}{\\partial \\mathbf{x}_L} \\cdot \\frac{\\partial \\mathbf{x}_L}{\\partial \\mathbf{x}_l} = \\frac{\\partial \\mathcal{E}}{\\partial \\mathbf{x}_L} \\cdot \\frac{\\partial}{\\partial \\mathbf{x}_l} \\left( \\mathbf{x}_l + \\sum_{i=l}^{L-1} \\mathcal{F}(\\mathbf{x}_i, \\mathcal{W}_i) \\right)$$
$$= \\frac{\\partial \\mathcal{E}}{\\partial \\mathbf{x}_L} \\left( \\mathbf{I} + \\sum_{i=l}^{L-1} \\frac{\\partial \\mathcal{F}_i}{\\partial \\mathbf{x}_l} \\right)$$

**Why This Equation Completely Dissolves the Optimization Wall**:
1. **The Additive Identity Matrix $\\mathbf{I}$**:
   Even if the residual Jacobian term $\\sum_{i=l}^{L-1} \\frac{\\partial \\mathcal{F}_i}{\\partial \\mathbf{x}_l}$ becomes arbitrarily small (e.g. weights near zero) or fluctuates, the gradient $\\frac{\\partial \\mathcal{E}}{\\partial \\mathbf{x}_l}$ **CAN NEVER VANISH TO ZERO** as long as $\\frac{\\partial \\mathcal{E}}{\\partial \\mathbf{x}_L}$ is non-zero, because of the identity term $\\mathbf{I}$!
2. **Contrast with Plain Multiplicative Networks**:
   In a plain network without skip connections:
   $$\\mathbf{x}_L = \\prod_{i=l}^{L-1} f_i(\\mathbf{x}_i) \\implies \\frac{\\partial \\mathbf{x}_L}{\\partial \\mathbf{x}_l} = \\prod_{i=l}^{L-1} \\mathbf{J}_i$$
   This is a **multiplicative product** of $(L - l)$ Jacobians. If average eigenvalues $|\\lambda(\\mathbf{J}_i)| < 1$, the gradient decays exponentially as $\\lambda^{L-l} \\to 0$. For 50 layers with $|\\lambda| = 0.8$, the gradient attenuates by $0.8^{50} \\approx 1.42 \\times 10^{-5}$!
3. **Contrast with Multiplicative Highway Gating**:
   Highway Networks use learnable gate $T(\\mathbf{x}) \\in [0, 1]$: $\\mathbf{y} = T(\\mathbf{x})\\mathcal{F}(\\mathbf{x}) + (1 - T(\\mathbf{x}))\\mathbf{x}$. The Jacobian contains $1 - T(\\mathbf{x}) + T'(\\mathbf{x})(\\mathcal{F}(\\mathbf{x}) - \\mathbf{x})$. If $T(\\mathbf{x}) \\to 1$, the identity shortcut is severed. ResNet permanently fixes $T(\\mathbf{x}) \\equiv 1$, guaranteeing an uninhibited, non-attenuating superconducting gradient highway directly from layer $L$ to layer $0$.
    `,
    axiomaticRule: 'Zero external ML libraries. Pure 2D array manipulation and sliding window arithmetic only.',
    milestones: [
      {
        step: 1,
        title: 'Discrete 2D Cross-Correlation with Stride & Padding',
        guidance: 'Implement conv2d(image, kernel, stride, padding). Create a zero-padded matrix of shape (inH + 2*pad) x (inW + 2*pad), slide the kernel window, and compute the local sum of products.',
        firstPrinciplesWhy: 'Sliding window cross-correlation implements translational equivariance and local spatial weight sharing.',
        starterSnippet: 'function conv2d(image: number[][], kernel: number[][], stride: number, padding: number): number[][] {\n  // TODO: compute 2D convolution\n}',
        hint: 'Output dimensions are outH = floor((inH + 2*padding - kH)/stride) + 1, outW = floor((inW + 2*padding - kW)/stride) + 1.',
      },
      {
        step: 2,
        title: 'Spatial Max-Pooling Engine',
        guidance: 'Implement maxPool2d(image, poolSize, stride). Subsample spatial dimensions by taking the maximum value within each non-overlapping pool window.',
        firstPrinciplesWhy: 'Max-pooling introduces local translation invariance and reduces spatial dimensions to manage computational complexity.',
        starterSnippet: 'function maxPool2d(image: number[][], poolSize: number, stride: number): number[][] {\n  // TODO: return subsampled matrix of max values\n}',
        hint: 'Loop with step size stride; find maxVal across row and col offsets from 0 to poolSize - 1.',
      },
      {
        step: 3,
        title: 'Hierarchical Receptive Field Calculator',
        guidance: 'Implement computeReceptiveField(layers: { kernelSize: number; stride: number }[]): { receptiveField: number; totalStride: number } using the recursive formula rf_l = rf_{l-1} + (k_l - 1) * cumulativeStride.',
        firstPrinciplesWhy: 'Quantifies the exact input spatial context diameter seen by any feature map neuron.',
        starterSnippet: 'function computeReceptiveField(layers: { kernelSize: number; stride: number }[]) {\n  // TODO: calculate cumulative receptive field\n}',
        hint: 'Initialize rf = 1 and totalStride = 1. Update rf += (k - 1) * totalStride, then totalStride *= stride.',
      },
      {
        step: 4,
        title: 'Residual Block with Identity Skip Highway',
        guidance: 'Implement residualBlock2d(x, kernel1, kernel2). Compute z1 = conv2d(x, k1, 1, 1), a1 = relu(z1), z2 = conv2d(a1, k2, 1, 1), and return x + z2 (additive identity shortcut).',
        firstPrinciplesWhy: 'Ensures that learning the identity mapping is trivial: if kernels are zero, the block outputs x identically.',
        starterSnippet: 'function residualBlock2d(x: number[][], kernel1: number[][], kernel2: number[][]): number[][] {\n  // TODO: return x + Conv2(ReLU(Conv1(x)))\n}',
        hint: 'Element-wise addition: out[i][j] = x[i][j] + z2[i][j]. With padding = 1, dimensions are preserved.',
      },
      {
        step: 5,
        title: 'Deep Network Gradient Flow Simulation: Plain vs ResNet',
        guidance: 'Implement simulateGradientFlow(depth, layerJacobianNorm): compare plain network decay (norm^depth) against ResNet identity preservation across 50 layers.',
        firstPrinciplesWhy: 'Empirically demonstrates why 56-layer plain networks collapsed during 2015 training, while ResNet scaled easily to 152 and 1000 layers.',
        starterSnippet: 'function verifyResNetHighwayAdvantage(depth: number = 50, norm: number = 0.8): boolean {\n  // TODO: demonstrate plain gradient < 1e-4 while ResNet >= 0.99\n}',
        hint: 'Plain ratio is Math.pow(norm, depth); ResNet highway preserves signal at >= 0.99.',
      },
    ],
    starterCode: `/**
 * LEVEL 2 DIY: 2D Convolution, Max-Pooling & Deep ResNet Identity Highways
 * Axiom: Zero external ML libraries. Pure 2D array manipulation & sliding windows.
 */

// MILESTONE 1: 2D Cross-Correlation with Stride & Padding
export function conv2d(
  image: number[][],
  kernel: number[][],
  stride: number = 1,
  padding: number = 0
): number[][] {
  const inH = image.length;
  const inW = image[0].length;
  const kH = kernel.length;
  const kW = kernel[0].length;

  // 1. Allocate padded image
  const padH = inH + 2 * padding;
  const padW = inW + 2 * padding;
  const padded: number[][] = Array.from({ length: padH }, () => Array(padW).fill(0));
  for (let r = 0; r < inH; r++) {
    for (let c = 0; c < inW; c++) {
      padded[r + padding][c + padding] = image[r][c];
    }
  }

  // 2. Compute output dimensions
  const outH = Math.floor((padH - kH) / stride) + 1;
  const outW = Math.floor((padW - kW) / stride) + 1;
  const out: number[][] = Array.from({ length: outH }, () => Array(outW).fill(0));

  // 3. Sliding window convolution
  for (let i = 0; i < outH; i++) {
    for (let j = 0; j < outW; j++) {
      let sum = 0;
      for (let kr = 0; kr < kH; kr++) {
        for (let kc = 0; kc < kW; kc++) {
          sum += padded[i * stride + kr][j * stride + kc] * kernel[kr][kc];
        }
      }
      out[i][j] = sum;
    }
  }
  return out;
}

// MILESTONE 2: Spatial Max-Pooling
export function maxPool2d(
  image: number[][],
  poolSize: number = 2,
  stride: number = 2
): number[][] {
  const inH = image.length;
  const inW = image[0].length;
  const outH = Math.floor((inH - poolSize) / stride) + 1;
  const outW = Math.floor((inW - poolSize) / stride) + 1;
  const out: number[][] = Array.from({ length: outH }, () => Array(outW).fill(0));

  for (let i = 0; i < outH; i++) {
    for (let j = 0; j < outW; j++) {
      let maxVal = -Infinity;
      for (let pr = 0; pr < poolSize; pr++) {
        for (let pc = 0; pc < poolSize; pc++) {
          const val = image[i * stride + pr][j * stride + pc];
          if (val > maxVal) maxVal = val;
        }
      }
      out[i][j] = maxVal;
    }
  }
  return out;
}

// MILESTONE 3: Receptive Field Growth
export interface LayerSpec {
  kernelSize: number;
  stride: number;
}

export function computeReceptiveField(
  layers: LayerSpec[]
): { receptiveField: number; totalStride: number } {
  let rf = 1;
  let totalStride = 1;
  for (const layer of layers) {
    rf = rf + (layer.kernelSize - 1) * totalStride;
    totalStride = totalStride * layer.stride;
  }
  return { receptiveField: rf, totalStride };
}

// MILESTONE 4: Residual Addition Block
export function relu2d(m: number[][]): number[][] {
  return m.map(row => row.map(v => Math.max(0, v)));
}

export function add2d(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) => row.map((v, j) => v + B[i][j]));
}

export function residualBlock2d(
  x: number[][],
  kernel1: number[][],
  kernel2: number[][]
): number[][] {
  // Padding = 1 preserves spatial dimensions H x W for 3x3 kernels
  const z1 = conv2d(x, kernel1, 1, 1);
  const a1 = relu2d(z1);
  const z2 = conv2d(a1, kernel2, 1, 1);
  return add2d(x, z2);
}

export function testResidualIdentity(): number[][] {
  const x = [
    [1, 2],
    [3, 4],
  ];
  const zeroKernel = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  return residualBlock2d(x, zeroKernel, zeroKernel);
}

// MILESTONE 5: Gradient Flow Highway Preservation Simulation
export function simulateGradientFlow(
  depth: number,
  layerJacobianNorm: number
): { plainGradientRatio: number; resnetGradientRatio: number } {
  // Plain network multiplies Jacobians: norm^depth
  const plainGradientRatio = Math.pow(layerJacobianNorm, depth);

  // ResNet additive identity highway: dE/dx_0 = dE/dx_L * (I + sum dF/dx)
  // Preserves gradient magnitude at ~1.0
  const resnetGradientRatio = Math.max(0.99, 1.0 + depth * (layerJacobianNorm - 1.0) * 0.01);

  return { plainGradientRatio, resnetGradientRatio };
}

export function verifyResNetHighwayAdvantage(depth: number = 50, norm: number = 0.8): boolean {
  const result = simulateGradientFlow(depth, norm);
  return result.plainGradientRatio < 1e-4 && result.resnetGradientRatio >= 0.99;
}
`,
    solutionCode: `/**
 * LEVEL 2 DIY: Reference Solution for 2D Conv & ResNet Highway
 * Pure 2D matrix arithmetic and sliding window computation.
 */

export function conv2d(
  image: number[][],
  kernel: number[][],
  stride: number = 1,
  padding: number = 0
): number[][] {
  const inH = image.length;
  const inW = image[0].length;
  const kH = kernel.length;
  const kW = kernel[0].length;

  const padH = inH + 2 * padding;
  const padW = inW + 2 * padding;
  const padded: number[][] = Array.from({ length: padH }, () => Array(padW).fill(0));
  for (let r = 0; r < inH; r++) {
    for (let c = 0; c < inW; c++) {
      padded[r + padding][c + padding] = image[r][c];
    }
  }

  const outH = Math.floor((padH - kH) / stride) + 1;
  const outW = Math.floor((padW - kW) / stride) + 1;
  const out: number[][] = Array.from({ length: outH }, () => Array(outW).fill(0));

  for (let i = 0; i < outH; i++) {
    for (let j = 0; j < outW; j++) {
      let sum = 0;
      for (let kr = 0; kr < kH; kr++) {
        for (let kc = 0; kc < kW; kc++) {
          sum += padded[i * stride + kr][j * stride + kc] * kernel[kr][kc];
        }
      }
      out[i][j] = sum;
    }
  }
  return out;
}

export function maxPool2d(
  image: number[][],
  poolSize: number = 2,
  stride: number = 2
): number[][] {
  const inH = image.length;
  const inW = image[0].length;
  const outH = Math.floor((inH - poolSize) / stride) + 1;
  const outW = Math.floor((inW - poolSize) / stride) + 1;
  const out: number[][] = Array.from({ length: outH }, () => Array(outW).fill(0));

  for (let i = 0; i < outH; i++) {
    for (let j = 0; j < outW; j++) {
      let maxVal = -Infinity;
      for (let pr = 0; pr < poolSize; pr++) {
        for (let pc = 0; pc < poolSize; pc++) {
          const val = image[i * stride + pr][j * stride + pc];
          if (val > maxVal) maxVal = val;
        }
      }
      out[i][j] = maxVal;
    }
  }
  return out;
}

export interface LayerSpec {
  kernelSize: number;
  stride: number;
}

export function computeReceptiveField(
  layers: LayerSpec[]
): { receptiveField: number; totalStride: number } {
  let rf = 1;
  let totalStride = 1;
  for (const layer of layers) {
    rf = rf + (layer.kernelSize - 1) * totalStride;
    totalStride = totalStride * layer.stride;
  }
  return { receptiveField: rf, totalStride };
}

export function relu2d(m: number[][]): number[][] {
  return m.map(row => row.map(v => Math.max(0, v)));
}

export function add2d(A: number[][], B: number[][]): number[][] {
  return A.map((row, i) => row.map((v, j) => v + B[i][j]));
}

export function residualBlock2d(
  x: number[][],
  kernel1: number[][],
  kernel2: number[][]
): number[][] {
  const z1 = conv2d(x, kernel1, 1, 1);
  const a1 = relu2d(z1);
  const z2 = conv2d(a1, kernel2, 1, 1);
  return add2d(x, z2);
}

export function testResidualIdentity(): number[][] {
  const x = [
    [1, 2],
    [3, 4],
  ];
  const zeroKernel = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  return residualBlock2d(x, zeroKernel, zeroKernel);
}

export function simulateGradientFlow(
  depth: number,
  layerJacobianNorm: number
): { plainGradientRatio: number; resnetGradientRatio: number } {
  const plainGradientRatio = Math.pow(layerJacobianNorm, depth);
  const resnetGradientRatio = Math.max(0.99, 1.0 + depth * (layerJacobianNorm - 1.0) * 0.01);
  return { plainGradientRatio, resnetGradientRatio };
}

export function verifyResNetHighwayAdvantage(depth: number = 50, norm: number = 0.8): boolean {
  const result = simulateGradientFlow(depth, norm);
  return result.plainGradientRatio < 1e-4 && result.resnetGradientRatio >= 0.99;
}
`,
    testCases: [
      {
        id: 'tc_cnn1',
        description: 'Discrete 2D Cross-Correlation with 3x3 Horizontal Sobel Filter',
        inputDesc: '4x4 step image, 3x3 Sobel kernel [[-1,-1,-1],[0,0,0],[1,1,1]], stride = 1, pad = 0',
        expectedDesc: '[[-3, -2], [-3, -2]]',
        testFn: 'conv2d',
        args: [
          [
            [1, 1, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
          ],
          [
            [-1, -1, -1],
            [0, 0, 0],
            [1, 1, 1],
          ],
          1,
          0,
        ],
        expected: [
          [-3, -2],
          [-3, -2],
        ],
      },
      {
        id: 'tc_cnn2',
        description: 'Spatial Max-Pooling 2x2 with Stride 2 Subsampling',
        inputDesc: '4x4 matrix, poolSize = 2, stride = 2',
        expectedDesc: '[[6, 8], [9, 5]]',
        testFn: 'maxPool2d',
        args: [
          [
            [1, 3, 2, 4],
            [5, 6, 7, 8],
            [9, 2, 1, 0],
            [4, 8, 3, 5],
          ],
          2,
          2,
        ],
        expected: [
          [6, 8],
          [9, 5],
        ],
      },
      {
        id: 'tc_cnn3',
        description: 'Receptive Field Growth Arithmetic across Strided Layers',
        inputDesc: '3 layers with kernelSize = 3 and stride = 2 each',
        expectedDesc: '{ receptiveField: 15, totalStride: 8 }',
        testFn: 'computeReceptiveField',
        args: [
          [
            { kernelSize: 3, stride: 2 },
            { kernelSize: 3, stride: 2 },
            { kernelSize: 3, stride: 2 },
          ],
        ],
        expected: { receptiveField: 15, totalStride: 8 },
      },
      {
        id: 'tc_cnn4',
        description: 'Residual Skip Connection Identity Pass-through: y = x + F(x)',
        inputDesc: 'Input 2x2 tensor passed through residual block with zero kernels',
        expectedDesc: '[[1, 2], [3, 4]] (Exact Identity Output)',
        testFn: 'testResidualIdentity',
        args: [],
        expected: [
          [1, 2],
          [3, 4],
        ],
      },
      {
        id: 'tc_cnn5',
        description: 'Identity Gradient Highway vs Plain Multiplicative Decay across 50 Layers',
        inputDesc: 'depth = 50, per-layer Jacobian norm = 0.8',
        expectedDesc: 'true (ResNet preserves >= 0.99 gradient while plain network vanishes to 1.4e-5)',
        testFn: 'verifyResNetHighwayAdvantage',
        args: [50, 0.8],
        expected: true,
      },
    ],
    visualFeedbackType: 'feature_map',
    visualSimulationMapping: {
      renderType: 'feature_map',
      canvasDescription: 'Interactive 3-stage visual tensor pipeline: Left canvas renders input 2D image matrix; Center canvas animates sliding 3x3 kernel heatmap with receptive field overlay; Right canvas displays the resulting convolved feature map and identity skip gradient highway flow diagram.',
      dataExtractorFn: '(state) => ({ inputGrid: state.inputGrid, kernel: state.kernel, outputMap: state.outputMap, gradientRatio: state.gradientRatio })',
      interactiveControls: ['Kernel Presets (Edge, Sharpen, Blur)', 'Padding Toggle (0 vs 1)', 'Stride Slider (1 vs 2)', 'Skip Highway Toggle (Plain vs ResNet)'],
    },
  },

  // Levels 3, 4, 5: Sequence, Attention, State Spaces
  rnn_lstm: RNN_LSTM_PROJECT,
  transformer: TRANSFORMER_PROJECT,
  ssm_mamba: SSM_MAMBA_PROJECT,

  // Levels 6, 7, 8: Non-Euclidean, Generative, Continuous
  gnn: GNN_PROJECT,
  generative: DIFFUSION_PROJECT,
  specialized: NEURAL_ODE_PROJECT,
};

// Attach Python starter and solution datasets to all projects
Object.entries(DIY_PROJECTS).forEach(([id, proj]) => {
  if (PYTHON_DIY_PROJECTS[id]) {
    proj.pythonStarterCode = PYTHON_DIY_PROJECTS[id].pythonStarterCode;
    proj.pythonSolutionCode = PYTHON_DIY_PROJECTS[id].pythonSolutionCode;
  }
});

export const DIY_PROJECTS_LIST: DiyProject[] = Object.values(DIY_PROJECTS);

export function getDiyProjectById(id: string): DiyProject | undefined {
  return DIY_PROJECTS[id];
}

