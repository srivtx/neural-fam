/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Exhaustive First-Principles Invention Dataset across 9 architectural levels.
 * Codifies the dialectic: Crisis (Bottleneck Wall) -> Graveyard of Failed Intuitions
 * -> Mathematical Invariant -> Proof-of-Concept Breakthrough.
 */

import { FirstPrinciplesDossier } from '../types/firstPrinciples';

export const FIRST_PRINCIPLES_DOSSIERS: Record<string, FirstPrinciplesDossier> = {
  perceptron: {
    labId: 'perceptron',
    level: 0,
    title: 'The Linear Separability Impasse',
    family: 'feedforward',
    era: '1958–1969',
    inventors: 'Frank Rosenblatt (1958) · Critiqued by Marvin Minsky & Seymour Papert (1969)',
    heroQuestion: 'Why did a simple 4-point logic gate (XOR) trigger the first 15-year AI Winter?',
    crisis: {
      name: 'The XOR Hyperplane Wall',
      description: 'A single Rosenblatt perceptron computes an affine transformation followed by a threshold step function. Geometrically, this carves the feature space with a single flat hyperplane (a straight line in 2D). In the XOR problem, the True points (0,1) and (1,0) sit diagonally opposite the False points (0,0) and (1,1).',
      stressParameterName: 'Diagonal Asymmetry Bias',
      stressParameterUnit: 'skew',
      minStress: 0,
      maxStress: 10,
      defaultStress: 5,
      stressStep: 1,
      baselineMethodName: 'Single Linear Hyperplane',
      baselineFailureSymptom: 'Accuracy rigidly locked at ≤ 75%. Any line that separates (0,1) and (1,0) inevitably misclassifies either (0,0) or (1,1).',
      empiricalWallQuote: 'No machine composed of single-layer linear threshold units can compute parity functions such as Exclusive-OR without prior feature engineering. — Minsky & Papert, Perceptrons (1969)',
      computeFailure: (stress: number) => {
        // As diagonal asymmetry increases, a single line fails worse
        const isCollapsed = true; // XOR is fundamentally non-separable
        const baselineAcc = 75 - Math.min(25, stress * 2.5);
        return {
          isCollapsed,
          baselineMetric: baselineAcc,
          breakthroughMetric: 100,
          metricLabel: 'XOR Classification Accuracy (%)',
          statusText: `Single hyperplane capped at ${baselineAcc}%. Convex hulls overlap diagonally.`,
        };
      },
    },
    failedIntuitions: [
      {
        id: 'large_weights',
        title: 'Heuristic 1: Jack up weights to infinity',
        hypothesis: 'Make weights arbitrarily large (w = 1000) to create a razor-sharp decision cliff.',
        whyItFailed: 'Scaling weights changes the steepness of the boundary slope, but does not rotate or bend the boundary line. A straight line remains straight regardless of scale.',
        mathExplanation: 'w^T x + b = 0 defines the exact same hyperplane as c(w^T x + b) = 0 for any scalar c > 0.',
      },
      {
        id: 'step_stack',
        title: 'Heuristic 2: Stack multiple step-function neurons',
        hypothesis: 'Connect layers of step-function neurons to carve multiple straight lines.',
        whyItFailed: 'The Heaviside step function H(z) has a derivative of zero everywhere (dH/dz = 0) and is undefined at 0. Gradient backpropagation is mathematically impossible because all error gradients vanish to exactly 0.',
        mathExplanation: '\\frac{\\partial \\mathcal{L}}{\\partial w} = \\frac{\\partial \\mathcal{L}}{\\partial y} \\cdot H\'(z) \\cdot x = 0 \\quad \\forall z \\neq 0.',
      },
      {
        id: 'polynomial_expansion',
        title: 'Heuristic 3: Manual polynomial feature cross-products',
        hypothesis: 'Manually feed hand-crafted interaction terms x1 * x2 into the input vector.',
        whyItFailed: 'Requires the human engineer to anticipate every nonlinear combination. In high dimensions, combinatorial explosion requires O(d^k) parameters, destroying scaling.',
        mathExplanation: 'Combinatorial degree-k expansion scales as \\binom{d+k}{k}, exceeding billions of parameters for natural images.',
      },
    ],
    invariant: {
      governingEquation: 'h = \\sigma(W_1 x + b_1), \\quad y = \\sigma(W_2 h + b_2)',
      plainEnglishSummary: 'Nonlinear Coordinate Space Warping: Hidden neurons do not draw separate lines in the original input space; they warp and fold the input coordinate sheet so that previously diagonal points end up on one side of a new, single flat hyperplane.',
      breakdown: [
        {
          symbol: 'h ∈ R^d',
          role: 'Latent feature representation',
          whyItDissolvesBottleneck: 'Folds the 2D plane into a higher-dimensional manifold where XOR points are linearly separable.',
        },
        {
          symbol: 'σ(z) = 1 / (1 + e^-z)',
          role: 'Smooth differentiable activation',
          whyItDissolvesBottleneck: 'Yields a continuous derivative σ\'(z) = σ(z)(1 - σ(z)), unlocking gradient backpropagation via the multivariable chain rule.',
        },
      ],
      identityDerivativeFormula: '\\frac{d\\sigma}{dz} = \\sigma(z)(1 - \\sigma(z)) > 0 \\quad \\forall z \\in \\mathbb{R}',
      proofSketch: 'With 2 hidden neurons h1 = ReLU(x1 + x2 - 0.5) and h2 = ReLU(x1 + x2 - 1.5), the output y = h1 - 2*h2 isolates the XOR diagonal with zero classification error.',
    },
    breakthrough: {
      mechanismName: 'Multilayer Perceptron + Backpropagation',
      activationLabel: 'Enable Hidden Coordinate Warping',
      successMetricName: 'Classification Accuracy',
      verificationLog: [
        '[XOR Coordinate Warping Test]',
        'Input Space: (0,0)->0, (1,0)->1, (0,1)->1, (1,1)->0',
        'Hidden Layer Mapping: z1 = x1 + x2 - 0.5, z2 = x1 + x2 - 1.5',
        'Manifold Folded: Diagonal points transformed into linearly separable space.',
        'Output Decision Hyperplane: y = h1 - 2*h2 >= 0.5',
        'STATUS: PASS (100% Accuracy on XOR logic gate)',
        'Level 0 Bottleneck Dissolved.',
      ],
      badgeId: 'bottleneck_breaker_perceptron',
      nextFrontierId: 'mlp',
      nextFrontierName: 'Level 1: Multilayer Perceptron & Backprop',
    },
  },

  mlp: {
    labId: 'mlp',
    level: 1,
    title: 'The Vanishing Gradient & Parameter Explosion Wall',
    family: 'feedforward',
    era: '1986–1990',
    inventors: 'David Rumelhart, Geoffrey Hinton & Ronald Williams (1986) · Yann LeCun (1989)',
    heroQuestion: 'Why did stacking 10 dense layers fail to learn, while flattening images caused trillion-weight explosions?',
    crisis: {
      name: 'Combinatorial Density & Vanishing Gradient Decay',
      description: 'Fully connected networks connect every input neuron to every hidden neuron. On visual or spatial data, a modest 256x256 image flattened into an MLP creates 65,536 inputs. A single 1024-neuron hidden layer demands 67.1 million parameters! Worse, shifting an object by just 1 pixel creates an entirely distinct input vector, forcing the MLP to relearn features at every spatial coordinate.',
      stressParameterName: 'Spatial Translation Offset',
      stressParameterUnit: 'pixels',
      minStress: 0,
      maxStress: 16,
      defaultStress: 8,
      stressStep: 2,
      baselineMethodName: 'Flattened Dense MLP',
      baselineFailureSymptom: 'MLP accuracy crashes as objects translate across coordinates because dense weights possess zero translation equivariance.',
      empiricalWallQuote: 'A fully connected network has no built-in invariance with respect to translations or local distortions of the inputs. — Yann LeCun et al., Backpropagation Applied to Handwritten Zip Code Recognition (1989)',
      computeFailure: (stress: number) => {
        const isCollapsed = stress >= 4;
        const baselineAcc = Math.max(12, Math.round(96 * Math.exp(-stress * 0.18)));
        return {
          isCollapsed,
          baselineMetric: baselineAcc,
          breakthroughMetric: 98,
          metricLabel: 'Image Classification Accuracy (%)',
          statusText: isCollapsed
            ? `Translation sensitivity: MLP accuracy plummeted to ${baselineAcc}% at ${stress}px shift.`
            : `Small shift: MLP retains ${baselineAcc}% but memory footprint remains huge.`,
        };
      },
    },
    failedIntuitions: [
      {
        id: 'infinite_augmentation',
        title: 'Heuristic 1: Endless Data Augmentation',
        hypothesis: 'Train the MLP on millions of translated copies of every image at every possible pixel coordinate.',
        whyItFailed: 'Requires exponential data volume and trillions of weights. The model memorizes pixel positions rather than learning invariant geometric features.',
        mathExplanation: 'Parameter complexity remains O(H \\cdot W \\cdot C \\cdot D), scaling quadratically with image resolution.',
      },
      {
        id: 'handcrafted_sift',
        title: 'Heuristic 2: Hand-crafted SIFT/HOG feature extractors',
        hypothesis: 'Extract engineered edge histograms before feeding vectors into an MLP.',
        whyItFailed: 'Manual feature engineering creates an unscalable human bottleneck that cannot adapt to diverse natural domains.',
        mathExplanation: 'Human priors cannot span high-dimensional semantic spaces without empirical end-to-end gradient learning.',
      },
    ],
    invariant: {
      governingEquation: '(X * K)_{i,j} = \\sum_{m=-k}^k \\sum_{n=-k}^k X_{i+m, j+n} \\cdot K_{m,n}',
      plainEnglishSummary: 'Translation Equivariance & Weight Sharing: The visual meaning of an edge or curve does not change whether it appears in the top-left or bottom-right corner of an image. A single small filter kernel (e.g., 3x3) can slide across all spatial positions.',
      breakdown: [
        {
          symbol: 'K ∈ R^{k × k}',
          role: 'Shared local filter kernel',
          whyItDissolvesBottleneck: 'Decouples parameter count from image resolution: a 3x3 kernel uses only 9 weights regardless of whether the image is 32x32 or 4K.',
        },
        {
          symbol: 'T_v(f(x)) = f(T_v(x))',
          role: 'Translation Equivariance',
          whyItDissolvesBottleneck: 'Shifting the input produces an identically shifted feature map, guaranteeing zero generalization loss on translated objects.',
        },
      ],
      identityDerivativeFormula: '\\mathcal{T}_v(X * K) = (\\mathcal{T}_v X) * K',
      proofSketch: 'Toeplitz matrix structure of discrete 2D convolution guarantees that spatial shifts commute with convolution operations.',
    },
    breakthrough: {
      mechanismName: '2D Convolution & Weight Sharing (CNN)',
      activationLabel: 'Enable Shared Convolutional Kernel',
      successMetricName: 'Shift Invariance Accuracy',
      verificationLog: [
        '[Convolutional Translation Equivariance Test]',
        'Image Dimension: 256x256x3',
        'Dense MLP Parameters: 67,108,864 weights (Memory footprint: ~268 MB)',
        '3x3 Conv Kernel Parameters: 27 weights (Memory footprint: ~108 Bytes)',
        'Compression Ratio: 2,485,513x parameter reduction!',
        'Shift Stress: 16px translation applied',
        'Dense MLP Accuracy: 14.2% (Failed)',
        'CNN Equivariant Accuracy: 98.4% (Preserved)',
        'STATUS: PASS (Translation Equivariance Validated)',
      ],
      badgeId: 'bottleneck_breaker_mlp',
      nextFrontierId: 'cnn_resnet',
      nextFrontierName: 'Level 2: Deep CNNs & Skip Connections',
    },
  },

  cnn_resnet: {
    labId: 'cnn_resnet',
    level: 2,
    title: 'The Optimization Degradation Wall',
    family: 'feedforward',
    era: '2012–2015',
    inventors: 'Alex Krizhevsky (2012) · Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun (2015)',
    heroQuestion: 'Why did a 56-layer plain network have HIGHER training error than a 20-layer network?',
    crisis: {
      name: 'The Degradation Abyss (Optimization Breakdown)',
      description: 'Before ResNet, researchers believed deeper networks always had greater representational capacity. But empirically, a 56-layer plain convolutional network had higher training error than a 20-layer network. This was NOT overfitting (which has low training error and high test error); the optimizer physically could not fit the training set because gradients vanished into numerical noise over 50 matrix multiplications.',
      stressParameterName: 'Network Depth (Layers)',
      stressParameterUnit: 'layers',
      minStress: 10,
      maxStress: 100,
      defaultStress: 56,
      stressStep: 5,
      baselineMethodName: 'Plain Deep Feedforward Stack',
      baselineFailureSymptom: 'Gradient norm collapses to zero (10^-12). Backpropagating error signals through 50 layers shrinks gradients exponentially.',
      empiricalWallQuote: 'When deeper networks are able to start converging, a degradation problem has been exposed: with network depth increasing, accuracy gets saturated and then degrades rapidly. Unexpectedly, such degradation is not caused by overfitting. — Kaiming He et al., Deep Residual Learning for Image Recognition (1612.01560)',
      computeFailure: (stress: number) => {
        const isCollapsed = stress > 24;
        // Plain network gradient decays as (0.85)^depth
        const gradientNorm = Math.pow(0.82, stress);
        const trainingError = isCollapsed ? Math.min(68, 12 + (stress - 24) * 0.9) : 14;
        return {
          isCollapsed,
          baselineMetric: Number(gradientNorm.toExponential(2)),
          breakthroughMetric: 1.05,
          metricLabel: 'Layer 1 Gradient Magnitude (||∇||)',
          statusText: isCollapsed
            ? `CRITICAL DEGRADATION: At depth ${stress}, gradient shrunk to ${gradientNorm.toExponential(2)}. Training error rose to ${trainingError.toFixed(1)}%.`
            : `Stable regime: Depth ${stress} retains gradient norm ${gradientNorm.toFixed(3)}.`,
        };
      },
    },
    failedIntuitions: [
      {
        id: 'careful_init',
        title: 'Heuristic 1: Xavier / He Weight Initialization',
        hypothesis: 'Calibrate initial weight variance to Var(W) = 2/n_in so signals neither explode nor vanish in the first forward pass.',
        whyItFailed: 'Helps networks train up to ~25 layers, but non-linearities and learned parameter divergence during training inevitably perturb the spectrum back into vanishing gradients.',
        mathExplanation: 'Empirical weight spectrum drifts: \\prod_{l=1}^L \\sigma_{max}(W_l) decays exponentially as L \\to 50+.',
      },
      {
        id: 'batch_norm_stack',
        title: 'Heuristic 2: Stack Batch Normalization after every conv',
        hypothesis: 'Re-center and rescale intermediate feature activations to zero mean and unit variance at every layer.',
        whyItFailed: 'Stabilizes forward activations, but does not provide an uninterrupted additive gradient highway in the backward pass through depth.',
        mathExplanation: 'Backward pass still evaluates \\prod_{l=1}^L J_l; while singular values are bounded, optimization landscapes become intensely non-convex.',
      },
      {
        id: 'auxiliary_losses',
        title: 'Heuristic 3: Intermediate auxiliary loss heads (GoogLeNet)',
        hypothesis: 'Attach secondary classifier heads at layers 10 and 20 to inject gradients directly midway through the network.',
        whyItFailed: 'Clutters network architecture, adds multiple loss weight hyperparameters to tune, and only provides relief at specific tapped points.',
        mathExplanation: 'Only mitigates layers near the auxiliary taps; does not solve depth scaling toward 100+ or 1000+ layers.',
      },
    ],
    invariant: {
      governingEquation: 'y = x + \\mathcal{F}(x, \\mathcal{W})',
      plainEnglishSummary: 'The Residual Perturbation Formulation: It should never be harder to learn the identity function (doing nothing) than to construct a signal from scratch. By parameterizing a layer as y = x + F(x), the default state of the layer when weights initialize to zero is the exact identity mapping y = x.',
      breakdown: [
        {
          symbol: 'x',
          role: 'Identity shortcut bypass',
          whyItDissolvesBottleneck: 'Provides a zero-loss information highway that carries signals forward and backward without attenuation.',
        },
        {
          symbol: 'F(x, W)',
          role: 'Residual perturbation',
          whyItDissolvesBottleneck: 'Only needs to learn small differential adjustments (residuals) rather than reconstructing the full representation from scratch.',
        },
        {
          symbol: 'dy/dx = 1 + dF/dx',
          role: 'The Miracle Derivative',
          whyItDissolvesBottleneck: 'The additive "+1" guarantees that even if intermediate layer gradients dF/dx vanish completely, the total gradient never drops below 1!',
        },
      ],
      identityDerivativeFormula: '\\frac{\\partial \\mathcal{E}}{\\partial x_l} = \\frac{\\partial \\mathcal{E}}{\\partial x_L} \\left( \\mathbf{I} + \\frac{\\partial}{\\partial x_l} \\sum_{i=l}^{L-1} \\mathcal{F}_i \\right)',
      proofSketch: 'Because the identity matrix I is added to the summation, gradients backpropagate directly from layer L to layer l with zero multiplicative decay.',
    },
    breakthrough: {
      mechanismName: 'Residual Skip Highway (ResNet)',
      activationLabel: 'Engage Residual Shortcut Highway',
      successMetricName: 'Backward Gradient Flow',
      verificationLog: [
        '[ResNet Gradient Highway Verification]',
        'Stack Depth: 100 Convolutional Layers',
        'Plain Network Layer 1 Gradient: 1.42e-13 (Vanished / Stalled)',
        'Plain Network Training Error: 46.8% (Failed to converge)',
        'Residual Shortcut Engaged: y = x + F(x)',
        'Residual Layer 1 Gradient: 1.042 (Unattenuated Highway)',
        'Residual Training Error: 3.1% (Superhuman Convergence)',
        'STATUS: PASS (Zero Gradient Decay across 100 layers)',
      ],
      badgeId: 'bottleneck_breaker_resnet',
      nextFrontierId: 'rnn_lstm',
      nextFrontierName: 'Level 3: Recurrent Memory & Constant Error Carousels',
    },
  },

  rnn_lstm: {
    labId: 'rnn_lstm',
    level: 3,
    title: 'The Vanishing Recurrence Horizon',
    family: 'sequence',
    era: '1991–1997',
    inventors: 'Sepp Hochreiter (1991) · Yoshua Bengio (1994) · Jürgen Schmidhuber & Sepp Hochreiter (1997)',
    heroQuestion: 'Why did repeated matrix multiplication cause RNNs to forget words after just 10 steps?',
    crisis: {
      name: 'The Vanishing & Exploding Temporal Gradient',
      description: 'An Elman RNN updates its hidden state recurrently: h_t = tanh(W_hh * h_{t-1} + W_xh * x_t). Backpropagating an error signal across T time steps involves multiplying by the recurrent weight matrix W_hh repeatedly: dh_T / dh_1 = prod_{t=2}^T W_hh^T * diag(1 - h_t^2). If the spectral radius of W_hh is less than 1, gradients decay exponentially to 0; if greater than 1, they explode to infinity. In practice, RNNs cannot remember clues across more than 10-15 tokens.',
      stressParameterName: 'Sequence Token Horizon (T)',
      stressParameterUnit: 'tokens',
      minStress: 5,
      maxStress: 60,
      defaultStress: 30,
      stressStep: 5,
      baselineMethodName: 'Vanilla Elman RNN',
      baselineFailureSymptom: 'Hidden state forgets the initial keyword token. Context derivative dh_T / dh_1 decays to 0.000.',
      empiricalWallQuote: 'Standard RNNs are unable to bridge long time lags between relevant events and error signals. The error either explodes or vanishes exponentially. — Hochreiter & Schmidhuber, Long Short-Term Memory (1997)',
      computeFailure: (stress: number) => {
        const isCollapsed = stress > 12;
        const memoryRetention = Math.max(0.1, 100 * Math.pow(0.78, stress - 5));
        return {
          isCollapsed,
          baselineMetric: Number(memoryRetention.toFixed(1)),
          breakthroughMetric: 99.4,
          metricLabel: 'Initial Token Memory Retention (%)',
          statusText: isCollapsed
            ? `MEMORY AMNESIA: At T=${stress} steps, RNN memory retained only ${memoryRetention.toFixed(1)}% of initial token signal.`
            : `Short context: T=${stress} retains ${memoryRetention.toFixed(1)}% of signal.`,
        };
      },
    },
    failedIntuitions: [
      {
        id: 'gradient_clipping',
        title: 'Heuristic 1: Gradient norm clipping',
        hypothesis: 'If ||g|| > threshold, rescale g = threshold * g / ||g|| to prevent explosive divergence.',
        whyItFailed: 'Clipping prevents arithmetic overflow (NaNs), but does nothing to resurrect gradients that have vanished to 0.00000.',
        mathExplanation: 'Clipping only bounds the ceiling: min(1, c/||g||) * g. It provides no floor for vanishing terms.',
      },
      {
        id: 'orthogonal_weights',
        title: 'Heuristic 2: Orthogonal weight initialization',
        hypothesis: 'Initialize W_hh such that W_hh^T * W_hh = I, guaranteeing all eigenvalues have magnitude |λ| = 1.',
        whyItFailed: 'The tanh activation derivative (1 - h^2) is strictly <= 1. Multiplying by terms <= 1 at every step still causes exponential decay to 0 over 20+ steps.',
        mathExplanation: '\\prod_{t=1}^T \\text{diag}(1 - h_t^2) < 1^T \\to 0 \\text{ as } T \\to \\infty.',
      },
    ],
    invariant: {
      governingEquation: 'C_t = f_t \\odot C_{t-1} + i_t \\odot \\tilde{C}_t, \\quad \\frac{\\partial C_t}{\\partial C_{t-1}} = f_t',
      plainEnglishSummary: 'The Constant Error Carousel (CEC): Memory state must be integrated ADDITIVELY rather than MULTIPLICATIVELY. By decoupling the linear cell state C_t from nonlinear activations and protecting it with multiplicative gating valves (forget, input, output), information can flow through time indefinitely with zero decay when f_t = 1.0.',
      breakdown: [
        {
          symbol: 'C_t',
          role: 'Linear Cell State Accumulator',
          whyItDissolvesBottleneck: 'Acts as an internal conveyer belt: signals are added, not repeatedly multiplied by weight matrices.',
        },
        {
          symbol: 'f_t = σ(W_f · [h, x])',
          role: 'Forget Gating Valve',
          whyItDissolvesBottleneck: 'When set to 1.0, the gradient derivative dC_t/dC_{t-1} is exactly 1.0, preserving error signals with zero attenuation.',
        },
        {
          symbol: 'i_t · C_tilde',
          role: 'Candidate Input Valve',
          whyItDissolvesBottleneck: 'Allows the network to write new information to the cell state without destroying existing memories.',
        },
      ],
      identityDerivativeFormula: '\\frac{\\partial C_T}{\\partial C_1} = \\prod_{t=2}^T f_t \\approx 1.0 \\quad \\text{when } f_t \\approx 1.0',
      proofSketch: 'Because the cell update is linear (C_t = C_{t-1} + ...), error gradients flow through the Constant Error Carousel with eigenvalue 1.0.',
    },
    breakthrough: {
      mechanismName: 'Constant Error Carousel (LSTM)',
      activationLabel: 'Engage Constant Error Carousel (CEC)',
      successMetricName: 'Long-Range Memory Retention',
      verificationLog: [
        '[LSTM Constant Error Carousel Verification]',
        'Sequence Horizon: T = 50 tokens',
        'Vanilla RNN Retention: 0.04% (Catastrophic Amnesia)',
        'LSTM Cell State Carousel Engaged: f_t = 0.99',
        'LSTM Token Retention: 98.7% (Lossless Memory)',
        'STATUS: PASS (Bridge across 50-token gap verified)',
      ],
      badgeId: 'bottleneck_breaker_lstm',
      nextFrontierId: 'transformer',
      nextFrontierName: 'Level 4: Self-Attention & Parallel Context',
    },
  },

  transformer: {
    labId: 'transformer',
    level: 4,
    title: 'The Sequential Recurrence Bottleneck',
    family: 'attention',
    era: '2017',
    inventors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan Gomez, Łukasz Kaiser, Illia Polosukhin (2017)',
    heroQuestion: 'Why did researchers abandon recurrent sequential processing to let tokens query each other directly?',
    crisis: {
      name: 'The Sequential O(T) Execution Barrier & Fixed-Vector Squeeze',
      description: 'LSTMs solved vanishing gradients, but retained a fundamental architectural flaw: SEQUENTIAL RECURRENCE. To compute token t, the GPU must wait for token t-1 to finish. Thousands of GPU tensor cores sit idle waiting for serial step-by-step loops. Furthermore, compressing a 1000-word paragraph into a single fixed vector h_T forces an extreme information bottleneck.',
      stressParameterName: 'Context Sequence Length (T)',
      stressParameterUnit: 'tokens',
      minStress: 64,
      maxStress: 2048,
      defaultStress: 512,
      stressStep: 128,
      baselineMethodName: 'Sequential Recurrent LSTM',
      baselineFailureSymptom: 'GPU Tensor Core utilization drops to < 12%. Wall-clock step latency scales linearly O(T) as sequential dependencies stall parallelism.',
      empiricalWallQuote: 'This sequentially constrained computation factor remains an obstacle to parallelizing within training examples, since memory constraints limit batching across examples. Attention mechanisms have become an integral part of compelling sequence modeling without regard to distance. — Vaswani et al., Attention Is All You Need (1706.03762)',
      computeFailure: (stress: number) => {
        const isCollapsed = stress >= 512;
        // RNN wall clock time scales linearly with length; GPU utilization stays flat or drops
        const gpuUtilization = Math.max(8, Math.round(45 * (128 / stress)));
        return {
          isCollapsed,
          baselineMetric: gpuUtilization,
          breakthroughMetric: 94,
          metricLabel: 'GPU Hardware Utilization (%)',
          statusText: isCollapsed
            ? `GPU BOTTLENECK: Serial recurrence locks tensor cores. GPU utilization collapsed to ${gpuUtilization}%.`
            : `Small sequence: GPU utilization at ${gpuUtilization}%.`,
        };
      },
    },
    failedIntuitions: [
      {
        id: 'wider_hidden_dim',
        title: 'Heuristic 1: Make LSTM hidden state 8192-wide',
        hypothesis: 'Increase hidden state width d to store more information without loss.',
        whyItFailed: 'Multiplies matrix parameter counts quadratically (4 * d^2), causing massive VRAM consumption, but execution remains strictly sequential in time.',
        mathExplanation: 'Sequential dependency graph depth remains O(T); FLOPs increase by O(d^2) with zero parallel speedup.',
      },
      {
        id: 'bidirectional_stack',
        title: 'Heuristic 2: Stack 16 bidirectional LSTM layers',
        hypothesis: 'Pass information forward and backward simultaneously across deep stacks.',
        whyItFailed: 'Layer 2 still cannot compute step t until Layer 1 finishes steps t and t+1. Latency compounds multiplicatively with depth.',
        mathExplanation: 'Critical path latency scales as O(L \\cdot T); GPUs remain memory-bandwidth bound.',
      },
    ],
    invariant: {
      governingEquation: '\\text{Attention}(Q, K, V) = \\text{Softmax}\\left( \\frac{Q K^T}{\\sqrt{d_k}} \\right) V',
      plainEnglishSummary: 'Order-Free Associative Routing + Temperature Normalization: A sentence is not a sequential chain; it is a complete graph where words query each other directly based on semantic relevance (Queries and Keys). The scale factor 1/sqrt(d_k) prevents dot-product logits from exploding into saturated zero-gradient regions.',
      breakdown: [
        {
          symbol: 'Q K^T',
          role: 'Pairwise Content-Addressable Affinity Matrix',
          whyItDissolvesBottleneck: 'Computes all pairwise relationships across all tokens simultaneously using massively parallel GPU matrix multiplication (GEMM).',
        },
        {
          symbol: '1 / √d_k',
          role: 'Temperature Variance Stabilizer',
          whyItDissolvesBottleneck: 'For vectors with unit variance, Var(q^T k) = d_k. Dividing by √d_k guarantees Var = 1.0, preventing Softmax from saturating into sharp one-hot delta distributions.',
        },
        {
          symbol: 'V ∈ R^{T × d}',
          role: 'Value Representation Matrix',
          whyItDissolvesBottleneck: 'Softmax weights dynamically average value representations in a single constant-time O(1) hop.',
        },
      ],
      identityDerivativeFormula: '\\text{Var}\\left( \\frac{q^T k}{\\sqrt{d_k}} \\right) = \\frac{1}{d_k} \\sum_{i=1}^{d_k} \\text{Var}(q_i k_i) = \\frac{d_k}{d_k} = 1.0',
      proofSketch: 'Parallel GEMM operations execute across thousands of GPU cores in O(1) sequential dependency steps, achieving >90% tensor core saturation.',
    },
    breakthrough: {
      mechanismName: 'Scaled Dot-Product Self-Attention',
      activationLabel: 'Engage Parallel Self-Attention',
      successMetricName: 'GPU Core Saturation',
      verificationLog: [
        '[Self-Attention Parallel Execution Test]',
        'Sequence Length: 1024 tokens (d_model = 768, heads = 12)',
        'Sequential LSTM Steps: 1024 serial loops (GPU Utilization: 11%)',
        'Self-Attention GEMM: QK^T executed in 1 parallel matrix pass',
        'Scaled Softmax Logit Variance: 1.002 (Unsaturated gradients)',
        'GPU Core Utilization: 94.6% (Full Tensor Core Saturation)',
        'STATUS: PASS (O(1) Sequential Dependency Depth Achieved)',
      ],
      badgeId: 'bottleneck_breaker_transformer',
      nextFrontierId: 'ssm_mamba',
      nextFrontierName: 'Level 5: Sub-Quadratic State-Space Models (Mamba)',
    },
  },

  ssm_mamba: {
    labId: 'ssm_mamba',
    level: 5,
    title: 'The Quadratic Memory Wall & KV-Cache Explosion',
    family: 'ssm',
    era: '2021–2023',
    inventors: 'Albert Gu & Tri Dao (2023)',
    heroQuestion: 'How can an architecture achieve Transformer-grade in-context reasoning while consuming O(1) constant inference memory?',
    crisis: {
      name: 'The O(N^2) Attention Memory Wall & KV-Cache Choke',
      description: 'While Transformers parallelize training, their self-attention matrix scales quadratically with sequence length: O(N^2). During autoregressive text generation, every new token must attend to all previous tokens, requiring an ever-growing Key-Value Cache stored in GPU VRAM. At 128k context length, the KV-cache consumes tens of gigabytes per single user stream, making long-context inference economically prohibitive.',
      stressParameterName: 'Context Window Length (Tokens)',
      stressParameterUnit: 'tokens',
      minStress: 2048,
      maxStress: 65536,
      defaultStress: 16384,
      stressStep: 4096,
      baselineMethodName: 'Standard Transformer KV-Cache',
      baselineFailureSymptom: 'GPU VRAM memory footprint explodes quadratically. Memory bandwidth chokes token generation speed.',
      empiricalWallQuote: 'Transformers are computationally inefficient at inference time due to the quadratic scaling of attention and the linear growth of the KV-cache with sequence length. SSMs have linear scaling, but prior LTI formulations lacked content-dependent reasoning. — Albert Gu & Tri Dao, Mamba: Linear-Time Sequence Modeling with Selective State Spaces (2312.00752)',
      computeFailure: (stress: number) => {
        const isCollapsed = stress >= 8192;
        // KV cache: 2 * 2 * layers(32) * heads(32) * head_dim(128) * seqLen * 2 bytes
        const kvCacheMB = Math.round((2 * 32 * 4096 * stress * 2) / (1024 * 1024));
        const mambaMB = 24; // constant recurrent state
        return {
          isCollapsed,
          baselineMetric: kvCacheMB,
          breakthroughMetric: mambaMB,
          metricLabel: 'Inference Memory Footprint (MB)',
          statusText: isCollapsed
            ? `MEMORY EXPLOSION: Transformer KV-cache consumes ${kvCacheMB} MB per stream. Mamba state remains fixed at ${mambaMB} MB.`
            : `Small context: Transformer KV-cache at ${kvCacheMB} MB vs Mamba ${mambaMB} MB.`,
        };
      },
    },
    failedIntuitions: [
      {
        id: 'linear_attention',
        title: 'Heuristic 1: Linear Attention via kernel feature maps',
        hypothesis: 'Approximate Softmax(QK^T) with phi(Q) * phi(K)^T to associate in linear time.',
        whyItFailed: 'Lacks the sharp selective gating of Softmax. Fails miserably on associative recall and copying tasks (e.g. remembering a phone number mentioned 2000 tokens ago).',
        mathExplanation: 'Unnormalized kernel maps blur token distinctions; state capacity degrades without input-dependent decay.',
      },
      {
        id: 'sliding_window',
        title: 'Heuristic 2: Sliding Window Local Attention',
        hypothesis: 'Only attend to the previous 1024 tokens, discarding earlier keys and values.',
        whyItFailed: 'Completely blinds the model to global document context; cannot answer questions about facts stated in chapter 1.',
        mathExplanation: 'Receptive field grows linearly with depth; cross-document information flow is truncated.',
      },
      {
        id: 'constant_lti_ssm',
        title: 'Heuristic 3: Linear Time-Invariant State Spaces (S4)',
        hypothesis: 'Use fixed continuous-time ODE state matrices (A, B) with HiPPO initialization.',
        whyItFailed: 'Constant B treats every incoming token identically. Background noise tokens pollute and overwrite the state register.',
        mathExplanation: 'LTI systems cannot selectively filter information based on input content: B is independent of x_t.',
      },
    ],
    invariant: {
      governingEquation: 'h_t = \\bar{A}_t h_{t-1} + \\bar{B}_t x_t, \\quad \\Delta_t = \\text{softplus}(\\text{Proj}(x_t)), \\; B_t = \\text{Proj}(x_t)',
      plainEnglishSummary: 'Input-Dependent Selective Discretization: The continuous-time transition parameters (B, C, Δ) are made dynamic functions of the current input token x_t. When a filler noise token arrives, Δ -> 0 closes the input valve, freezing the state and preserving historical memories indefinitely.',
      breakdown: [
        {
          symbol: 'Δ(x_t) ∈ R',
          role: 'Input-dependent timescale discretization',
          whyItDissolvesBottleneck: 'Acts as a dynamic valve: when noise arrives, Δ -> 0, meaning the model ignores the token and preserves the existing memory state.',
        },
        {
          symbol: 'B(x_t), C(x_t)',
          role: 'Selective input/output projection matrices',
          whyItDissolvesBottleneck: 'Allows the model to filter what gets written to the state register based on the semantic meaning of the token.',
        },
        {
          symbol: 'Parallel Associative Scan',
          role: 'Hardware-aware SRAM scan algorithm',
          whyItDissolvesBottleneck: 'Executes the non-LTI recurrent scan directly within fast GPU SRAM without materializing large intermediate tensors in HBM.',
        },
      ],
      identityDerivativeFormula: '\\bar{A}_t = \\exp(\\Delta_t A) \\to I \\quad \\text{as } \\Delta_t \\to 0',
      proofSketch: 'When Δ_t -> 0, A_bar -> I and B_bar -> 0. The state h_t = h_{t-1} remains completely unchanged across filler intervals.',
    },
    breakthrough: {
      mechanismName: 'Selective State Space Model (Mamba)',
      activationLabel: 'Enable Selective Discretization B(x_t), Δ(x_t)',
      successMetricName: 'Inference Memory Footprint',
      verificationLog: [
        '[Selective State Space Verification]',
        'Sequence Length: 32,768 tokens',
        'Transformer KV-Cache Memory: 4,096 MB (Linear growth with context)',
        'Mamba Selective Memory: 24 MB (Constant O(1) state)',
        'Noise Filtering Stress: 20 filler tokens injected between key and query',
        'Constant LTI S4 Recall: 18.2% (Memory contaminated by noise)',
        'Mamba Selective Recall: 99.6% (Noise filtered out by Δ valve)',
        'STATUS: PASS (Linear-time scaling with Transformer-grade recall)',
      ],
      badgeId: 'bottleneck_breaker_mamba',
      nextFrontierId: 'gnn',
      nextFrontierName: 'Level 6: Relational Graph Networks & Equivariance',
    },
  },

  gnn: {
    labId: 'gnn',
    level: 6,
    title: 'The Non-Euclidean Permutation Wall',
    family: 'graph',
    era: '2016–2020',
    inventors: 'Thomas Kipf & Max Welling (2016) · Petar Veličković (2018) · DeepMind AlphaFold-2 (2020)',
    heroQuestion: 'Why do CNNs and Transformers fail when processing molecules, social networks, and protein structures?',
    crisis: {
      name: 'The Permutation Ambiguity & Topological Irregularity Wall',
      description: 'CNNs assume inputs live on regular 2D grids (pixels). Transformers assume inputs live on 1D ordered sequences. Real-world molecules, financial transaction graphs, and biological proteins live on irregular topological graphs where nodes have varying numbers of neighbors and no canonical coordinate ordering. Feeding an adjacency matrix into an MLP fails because reordering the arbitrary node IDs changes all rows, producing inconsistent predictions.',
      stressParameterName: 'Node Label Permutation Index',
      stressParameterUnit: 'perm',
      minStress: 1,
      maxStress: 10,
      defaultStress: 4,
      stressStep: 1,
      baselineMethodName: 'Flattened Adjacency MLP',
      baselineFailureSymptom: 'MLP outputs wildly different predictions for the exact same molecule whenever atom indexing order is shuffled.',
      empiricalWallQuote: 'Graphs are invariant to permutations of their node orderings. A model processing graphs must respect this permutation equivariance: f(P A P^T, P X) = P f(A, X). — Kipf & Welling, Semi-Supervised Classification with Graph Convolutional Networks (ICLR 2017)',
      computeFailure: (stress: number) => {
        const isCollapsed = stress > 1;
        // Variance across permutations
        const mlpVariance = isCollapsed ? 0.68 : 0.0;
        return {
          isCollapsed,
          baselineMetric: Number(mlpVariance.toFixed(2)),
          breakthroughMetric: 0.0,
          metricLabel: 'Prediction Variance across Node Permutations',
          statusText: isCollapsed
            ? `PERMUTATION SENSITIVITY: MLP variance is ${mlpVariance} under node relabeling. Identical molecules yield conflicting predictions.`
            : `Initial node ordering: MLP and GNN match on canonical ordering.`,
        };
      },
    },
    failedIntuitions: [
      {
        id: 'canonical_sort',
        title: 'Heuristic 1: Sort nodes by degree or centrality',
        hypothesis: 'Enforce a canonical ordering by sorting atoms from highest bond count to lowest.',
        whyItFailed: 'Ties between nodes with identical degrees are ambiguous. Small structural perturbations cause discontinuous index jumps, ruining stability.',
        mathExplanation: 'Degree tie-breaking requires arbitrary conventions; graph isomorphism cannot be solved by sorting degrees alone.',
      },
      {
        id: 'padding_tensor',
        title: 'Heuristic 2: Pad graph adjacency to a fixed NxN matrix',
        hypothesis: 'Pad all graphs to size 100x100 and apply a standard 2D CNN.',
        whyItFailed: '2D convolutions assume spatial neighbors on a grid; swapping row 2 and row 5 shuffles the entire receptive field, destroying spatial locality.',
        mathExplanation: 'Grid kernels lack the permutation group symmetry S_N of arbitrary graphs.',
      },
    ],
    invariant: {
      governingEquation: 'h_v^{(k)} = \\text{UPDATE}\\left( h_v^{(k-1)}, \\bigoplus_{u \\in \\mathcal{N}(v)} \\text{MSG}(h_u^{(k-1)}, h_v^{(k-1)}, e_{uv}) \\right)',
      plainEnglishSummary: 'Permutation-Invariant Message Passing: Each node aggregates messages from its immediate topological neighbors using a symmetric reduction operator (Sum, Mean, or Max). Because addition is commutative (a + b = b + a), the result is mathematically identical regardless of the order in which neighbors are listed.',
      breakdown: [
        {
          symbol: '⨁ (Sum / Mean / Max)',
          role: 'Symmetric Neighborhood Aggregation Operator',
          whyItDissolvesBottleneck: 'Commutative and associative reduction guarantees exact permutation invariance across neighboring nodes.',
        },
        {
          symbol: 'N(v)',
          role: 'Topological Neighborhood of Node v',
          whyItDissolvesBottleneck: 'Only communicates along true physical graph edges, respecting the exact relational geometry of the domain.',
        },
        {
          symbol: 'UPDATE(h_v, m_v)',
          role: 'Localized State Update Function',
          whyItDissolvesBottleneck: 'Combines the node’s own representation with aggregated neighborhood context to produce new k-hop features.',
        },
      ],
      identityDerivativeFormula: '\\bigoplus_{u \\in \\mathcal{N}(v)} m_u = \\bigoplus_{\\pi(u) \\in \\mathcal{N}(v)} m_{\\pi(u)} \\quad \\forall \\pi \\in S_{|\\mathcal{N}(v)|}',
      proofSketch: 'Commutativity of the aggregation operator guarantees f(P A P^T, P X) = P f(A, X) for all permutation matrices P.',
    },
    breakthrough: {
      mechanismName: 'Message Passing Neural Network (MPNN)',
      activationLabel: 'Enable Permutation-Equivariant Message Passing',
      successMetricName: 'Isomorphism Consistency',
      verificationLog: [
        '[Graph Message Passing Equivariance Test]',
        'Molecule: Benzene Ring + Functional Group (6 nodes, 7 edges)',
        'Node Permutation Stress: 10 random re-indexings tested',
        'Flattened MLP Prediction Variance: 0.684 (Unstable / Broken)',
        'GNN Message Passing Engaged: Aggregation = SUM',
        'GNN Prediction Variance: 0.0000 (Exact Mathematical Invariance)',
        'STATUS: PASS (Permutation Equivariance Validated)',
      ],
      badgeId: 'bottleneck_breaker_gnn',
      nextFrontierId: 'generative',
      nextFrontierName: 'Level 7: Probabilistic Manifolds & Thermodynamic Diffusion',
    },
  },

  generative: {
    labId: 'generative',
    level: 7,
    title: 'The Minimax Saddle Point Collapse',
    family: 'generative',
    era: '2014–2020',
    inventors: 'Ian Goodfellow (2014) · Jascha Sohl-Dickstein (2015) · Jonathan Ho, Ajay Jain, Pieter Abbeel (2020)',
    heroQuestion: 'Why did AI researchers trade adversarial game theory for non-equilibrium thermodynamics?',
    crisis: {
      name: 'Minimax Game Instability & Mode Collapse in GANs',
      description: 'Generative Adversarial Networks formulate image generation as a zero-sum game between a Generator and Discriminator: min_G max_D V(D, G). Because optimization occurs via simultaneous gradient descent on non-convex objectives, training behaves like an unstable game of cat-and-mouse. When the generator discovers a single output that tricks the discriminator, it collapses into outputting only that one image (Mode Collapse), completely failing to cover the full diversity of the data distribution.',
      stressParameterName: 'Data Distribution Modes (Clusters)',
      stressParameterUnit: 'modes',
      minStress: 1,
      maxStress: 8,
      defaultStress: 4,
      stressStep: 1,
      baselineMethodName: 'Minimax Adversarial GAN',
      baselineFailureSymptom: 'Mode collapse: Generator drops 7 out of 8 clusters, producing identical duplicate outputs.',
      empiricalWallQuote: 'Training GANs requires finding a Nash equilibrium of a two-player non-cooperative game. Gradient descent may fail to converge and instead enter limit cycles. Mode collapse occurs when the generator produces only a small subset of the data. — Goodfellow et al. (2014) / Arjovsky et al. (2017)',
      computeFailure: (stress: number) => {
        const isCollapsed = stress > 2;
        const capturedModes = isCollapsed ? 1 : stress;
        return {
          isCollapsed,
          baselineMetric: capturedModes,
          breakthroughMetric: stress,
          metricLabel: 'Distribution Modes Successfully Covered',
          statusText: isCollapsed
            ? `MODE COLLAPSE: GAN generator collapsed into generating only ${capturedModes} of ${stress} modes.`
            : `Low diversity: GAN manages to cover ${capturedModes} modes.`,
        };
      },
    },
    failedIntuitions: [
      {
        id: 'wgan_clipping',
        title: 'Heuristic 1: Wasserstein distance with weight clipping (WGAN)',
        hypothesis: 'Replace Jensen-Shannon divergence with Earth Mover Distance to provide smooth gradients.',
        whyItFailed: 'Weight clipping artificially restricts discriminator capacity, leading to capacity underutilization and slow convergence.',
        mathExplanation: 'Weight clipping forces weights to extreme values [-c, c], destroying gradient diversity.',
      },
      {
        id: 'd_steps_ratio',
        title: 'Heuristic 2: Tune Discriminator vs Generator update ratios',
        hypothesis: 'Take 5 discriminator steps for every 1 generator step to maintain equilibrium.',
        whyItFailed: 'Extremely fragile hyperparameter balance that collapses whenever data complexity or batch size shifts.',
        mathExplanation: 'Non-convex saddle points possess imaginary Jacobian eigenvalues, creating unclosed rotational orbits.',
      },
    ],
    invariant: {
      governingEquation: 'x_{t-1} = \\frac{1}{\\sqrt{\\alpha_t}} \\left( x_t - \\frac{\\beta_t}{\\sqrt{1 - \\bar{\\alpha}_t}} \\epsilon_\\theta(x_t, t) \\right) + \\sigma_t z',
      plainEnglishSummary: 'Thermodynamic Reverse Diffusion: Instead of generating an image in one blind leap against an adversary, break generation down into a physical Markov diffusion process that gradually corrupts data into Gaussian noise, and train a network to reverse it step-by-step by predicting the noise residual via stable Mean Squared Error regression.',
      breakdown: [
        {
          symbol: 'q(x_t | x_0)',
          role: 'Forward Gaussian Noising Process',
          whyItDissolvesBottleneck: 'Trivially computes noisy samples at any arbitrary timestep t without iterative simulation: x_t = √ᾱ_t x_0 + √(1 - ᾱ_t) ε.',
        },
        {
          symbol: 'ε_θ(x_t, t)',
          role: 'Noise Predictor Neural Network (U-Net)',
          whyItDissolvesBottleneck: 'Replaces unstable adversarial games with monotonic, convex-like Mean Squared Error loss: ||ε - ε_θ(x_t, t)||^2.',
        },
        {
          symbol: 'Langevin Denoising Trajectory',
          role: 'Score-based Generative Sampling',
          whyItDissolvesBottleneck: 'Guarantees 100% mode coverage because diffusion fills the entire ambient space, preventing probability mass from collapsing.',
        },
      ],
      identityDerivativeFormula: '\\mathcal{L}_{\\text{simple}}(\\theta) = \\mathbb{E}_{t, x_0, \\epsilon} \\left[ \\| \\epsilon - \\epsilon_\\theta(\\sqrt{\\bar{\\alpha}_t}x_0 + \\sqrt{1-\\bar{\\alpha}_t}\\epsilon, t) \\|^2 \\right]',
      proofSketch: 'Because the loss is a standard supervised MSE on noise vectors, training is stationary, convex, and completely immune to adversarial oscillations.',
    },
    breakthrough: {
      mechanismName: 'Denoising Diffusion Probabilistic Model (DDPM)',
      activationLabel: 'Engage Reverse Langevin Diffusion',
      successMetricName: 'Mode Diversity Coverage',
      verificationLog: [
        '[Diffusion Multi-Modal Diversity Test]',
        'Distribution Target: 8 Gaussian clusters in a circle',
        'Adversarial GAN Performance: 1 mode captured (7 modes dropped / Mode Collapse)',
        'DDPM Reverse Score Matching Engaged: Schedule = Cosine, T = 1000',
        'Loss Convergence: L_simple monotonically descended to 0.0084',
        'Captured Distribution Modes: 8 of 8 modes (100% full manifold coverage)',
        'STATUS: PASS (Adversarial Instability Eliminated)',
      ],
      badgeId: 'bottleneck_breaker_generative',
      nextFrontierId: 'specialized',
      nextFrontierName: 'Level 8: Continuous Dynamical Frontiers (Neural ODEs)',
    },
  },

  specialized: {
    labId: 'specialized',
    level: 8,
    title: 'The Discrete Depth Rigidity Barrier',
    family: 'specialized',
    era: '2018–2024',
    inventors: 'Ricky T. Q. Chen, Yulia Rubanova, Jesse Bettencourt, David Duvenaud (2018) · Ziming Liu et al. (KANs 2024)',
    heroQuestion: 'What happens when network depth ceases to be an integer and becomes continuous time?',
    crisis: {
      name: 'Rigid Integer Layer Depth & Backprop Memory Explosion',
      description: 'Standard neural networks treat depth as an arbitrary list of discrete integer floors: Layer 1 -> Layer 2 -> ... -> Layer L. In medical patient ICU telemetry, seismic readings, or financial sensors, observations arrive at irregular, continuous timestamps. Fitting irregular time-series with discrete networks requires clumsy bucket binning or massive interpolation. Furthermore, training a 100-layer network requires storing all intermediate activation tensors in GPU VRAM for the backward pass, imposing an O(L) memory footprint.',
      stressParameterName: 'Adaptive Solver Precision Tolerance',
      stressParameterUnit: 'log10(tol)',
      minStress: 1,
      maxStress: 6,
      defaultStress: 3,
      stressStep: 1,
      baselineMethodName: 'Fixed Discrete Layer Stack',
      baselineFailureSymptom: 'Fixed discrete layers cannot adapt compute to input difficulty. Activation memory scales linearly O(L) during training.',
      empiricalWallQuote: 'Instead of specifying a discrete sequence of hidden layers, we parameterize the continuous dynamics of hidden units using an ordinary differential equation. Reverse-mode automatic differentiation (adjoint method) allows constant O(1) memory training. — Chen et al., Neural Ordinary Differential Equations (NeurIPS 2018 Best Paper)',
      computeFailure: (stress: number) => {
        // As depth/precision requirement increases, discrete memory explodes
        const discreteMemMB = stress * 48;
        const odeMemMB = 12; // constant memory via adjoint method
        return {
          isCollapsed: stress >= 3,
          baselineMetric: discreteMemMB,
          breakthroughMetric: odeMemMB,
          metricLabel: 'Training Activation Memory Footprint (MB)',
          statusText: `Continuous depth: Discrete network stores ${discreteMemMB} MB of activations; Neural ODE uses constant ${odeMemMB} MB via adjoint sensitivity.`,
        };
      },
    },
    failedIntuitions: [
      {
        id: 'variable_depth_exits',
        title: 'Heuristic 1: Early-exit classifiers',
        hypothesis: 'Add intermediate classifier heads and exit early if confidence > 0.9.',
        whyItFailed: 'Sub-networks are sub-optimal and brittle to calibrate. Depth is still constrained to pre-chosen discrete integer checkpoints.',
        mathExplanation: 'Threshold tuning requires manual heuristics and does not support continuous irregular time intervals.',
      },
      {
        id: 'dense_spline_grids',
        title: 'Heuristic 2: Re-train separate models for each mobile device quota',
        hypothesis: 'Train a 10-layer model for mobile, a 50-layer model for desktop, and a 100-layer model for cloud.',
        whyItFailed: 'Multiplies engineering maintenance, storage footprint, and training costs 3x without runtime adaptability.',
        mathExplanation: 'Static weights cannot trade off latency and accuracy dynamically at inference time.',
      },
    ],
    invariant: {
      governingEquation: '\\frac{dh(t)}{dt} = f(h(t), t, \\theta), \\quad h(t_1) = h(t_0) + \\int_{t_0}^{t_1} f(h(t), t, \\theta) dt',
      plainEnglishSummary: 'Continuous Dynamical Flow & The Adjoint Sensitivity Method: ResNet skip steps h_{l+1} = h_l + f(h_l) are simply Euler step discretizations of a continuous Ordinary Differential Equation with step size dt = 1. By treating depth as continuous time t in [0, T], an adaptive numerical solver (Runge-Kutta) can take large fast steps for easy inputs, and small precise steps for hard inputs—using the exact same learned weights.',
      breakdown: [
        {
          symbol: 'dh(t)/dt = f(h, t, θ)',
          role: 'Continuous Velocity Vector Field',
          whyItDissolvesBottleneck: 'Allows seamless continuous-time modeling of irregular observations without clumsy discrete binning.',
        },
        {
          symbol: 'Adjoint Sensitivity Method',
          role: 'O(1) Memory Reverse Optimization',
          whyItDissolvesBottleneck: 'Solves an augmented ODE backward in time, eliminating the need to store intermediate activations in GPU VRAM.',
        },
        {
          symbol: 'Adaptive Numerical Solvers (DOPRI5)',
          role: 'Dynamic Compute Tradeoff',
          whyItDissolvesBottleneck: 'Allows adjusting the solver tolerance at test time: coarse tolerance for fast mobile preview, fine tolerance for cloud accuracy.',
        },
      ],
      identityDerivativeFormula: '\\frac{da(t)}{dt} = -a(t)^T \\frac{\\partial f(h(t), t, \\theta)}{\\partial h}',
      proofSketch: 'Pontryagin’s Maximum Principle allows calculating parameter gradients backward in time with O(1) memory by integrating the continuous adjoint state a(t).',
    },
    breakthrough: {
      mechanismName: 'Continuous Neural ODE + Adjoint Solver',
      activationLabel: 'Engage Continuous ODE Solver',
      successMetricName: 'Continuous Depth Memory',
      verificationLog: [
        '[Continuous Neural ODE Adjoint Verification]',
        'Continuous Interval: t ∈ [0.0, 1.0]',
        'Discrete Network Memory Footprint: 288 MB (Linear in depth)',
        'Neural ODE Adjoint Method Engaged: O(1) Memory Mode',
        'Backward Memory Footprint: 12 MB (Constant memory for all depths)',
        'Adaptive Solver Steps: 14 steps taken automatically based on vector curvature',
        'STATUS: PASS (Continuous-Time Depth Validated)',
      ],
      badgeId: 'bottleneck_breaker_neural_ode',
    },
  },
};
