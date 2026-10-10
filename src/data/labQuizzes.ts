/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuizQuestion } from '../components/CheckpointQuiz';

export const LAB_QUIZZES: Record<string, { title: string; questions: QuizQuestion[] }> = {
  perceptron: {
    title: 'Level 0 Mastery: Single Neuron & Linear Separation',
    questions: [
      {
        question: 'In the equation y = σ(w₁x₁ + w₂x₂ + b), what does the bias (b) physically control?',
        options: [
          'It shifts the position of the decision boundary without altering its angle.',
          'It controls the learning rate during optimization.',
          'It squares the magnitude of input x₁.',
        ],
        correctIndex: 0,
        explanation: 'Bias is an independent threshold offset. Without bias (b = 0), the boundary line is rigidly pinned to pass through the origin (0,0).',
      },
      {
        question: 'Why was Frank Rosenblatt’s original Perceptron unable to solve the XOR logic gate?',
        options: [
          'Because XOR points are diagonally separated and cannot be split by any single straight line.',
          'Because early hardware lacked floating-point registers.',
          'Because the step function has no derivative at zero.',
        ],
        correctIndex: 0,
        explanation: 'A single neuron defines a linear hyperplane. In XOR, the diagonal distribution of classes makes linear separation geometrically impossible.',
      },
    ],
  },

  mlp: {
    title: 'Level 1 Mastery: Multilayer Perceptron & Space Warping',
    questions: [
      {
        question: 'How do hidden layers in an MLP resolve the XOR failure?',
        options: [
          'They warp and fold the coordinate space so non-linear points become linearly separable.',
          'They eliminate the need for matrix multiplication.',
          'They replace activation functions with linear identity pass-throughs.',
        ],
        correctIndex: 0,
        explanation: 'Stacked non-linear layers project raw inputs into a higher-dimensional feature space, effectively folding geometry so a straight slice can separate them.',
      },
      {
        question: 'What does the Universal Approximation Theorem guarantee?',
        options: [
          'An MLP with 1 non-linear hidden layer can approximate any continuous function given enough width.',
          'Neural networks never overfit to noisy training sets.',
          'Gradient descent will always reach the global minimum in polynomial time.',
        ],
        correctIndex: 0,
        explanation: 'Cybenko (1989) proved that feedforward networks with non-linear activations can fit any continuous mathematical surface to arbitrary precision.',
      },
    ],
  },

  cnn_resnet: {
    title: 'Level 2 Mastery: CNNs & Residual Identity Highways',
    questions: [
      {
        question: 'Why are 2D convolutions translation-invariant on image grids?',
        options: [
          'Because the same learned 3×3 kernel filter slides across all spatial coordinates.',
          'Because images are flattened into 1D vectors before processing.',
          'Because convolutions destroy all spatial edge information.',
        ],
        correctIndex: 0,
        explanation: 'Weight sharing means a kernel looking for a cat ear or vertical edge will detect it whether it appears in the top-left or bottom-right of the image.',
      },
      {
        question: 'Why does the residual connection y = x + F(x) prevent vanishing gradients in deep networks?',
        options: [
          'The identity skip term guarantees dy/dx = 1 + dF/dx, keeping backpropagated gradients intact.',
          'It forces all weights in F(x) to stay strictly positive.',
          'It halves the number of parameters in the network.',
        ],
        correctIndex: 0,
        explanation: 'By the chain rule, dy/dx = 1 + dF/dx. Even if intermediate sublayer gradients dF/dx vanish toward 0, the constant 1 guarantees an unblocked gradient highway straight back to layer 1.',
      },
    ],
  },

  rnn_lstm: {
    title: 'Level 3 Mastery: Recurrent Loops & LSTM Memory Valves',
    questions: [
      {
        question: 'What is the primary function of the LSTM Forget Gate (f_t)?',
        options: [
          'To regulate what fraction of the previous internal cell state (C_{t-1}) to preserve or flush.',
          'To discard the entire model weights after each training epoch.',
          'To convert text tokens into frequency domain spectrograms.',
        ],
        correctIndex: 0,
        explanation: 'The forget gate outputs values between 0 (completely erase obsolete context) and 1 (preserve historical memories intact across long sequence intervals).',
      },
      {
        question: 'Why do vanilla RNNs suffer from vanishing gradients over long sequences?',
        options: [
          'Repeated matrix multiplications across time cause gradient norms to decay exponentially.',
          'Because sequences can only be processed from right to left.',
          'Because RNNs cannot use gradient descent.',
        ],
        correctIndex: 0,
        explanation: 'In a plain RNN, backpropagating through 100 time steps repeatedly multiplies by weight matrix W_hh, shrinking signals to zero if eigenvalues are < 1.',
      },
    ],
  },

  transformer: {
    title: 'Level 4 Mastery: Scaled Dot-Product Attention & Masking',
    questions: [
      {
        question: 'What is the purpose of dividing the dot product Q·Kᵀ by √d_k in self-attention?',
        options: [
          'To prevent dot products from growing excessively large, which pushes Softmax into vanishing gradients.',
          'To invert the direction of the attention vector.',
          'To convert floating point scores into binary integers.',
        ],
        correctIndex: 0,
        explanation: 'In high-dimensional spaces, dot products grow with d_k, pushing Softmax into regions with near-zero gradients. Scaling by √d_k stabilizes the distribution.',
      },
      {
        question: 'Why do autoregressive models like GPT-4 require causal upper-triangular masking?',
        options: [
          'To prevent tokens from looking ahead into future positions during next-token text generation.',
          'To compress the model weights into 8-bit integers.',
          'To speed up GPU matrix transpose operations.',
        ],
        correctIndex: 0,
        explanation: 'If a model could peek at word 5 while predicting word 5, training would become trivial and the model could not generate text sequentially during real inference.',
      },
    ],
  },

  ssm_mamba: {
    title: 'Level 5 Mastery: State-Space Models & Bounded States',
    questions: [
      {
        question: 'What allows Mamba to scale linearly O(N) with context length while maintaining strong reasoning?',
        options: [
          'It compresses sequence history into a compact fixed-size hidden state h_t using input-dependent selection.',
          'It discards all past tokens and only reads the last 4 words.',
          'It runs exclusively on quantum processors.',
        ],
        correctIndex: 0,
        explanation: 'Unlike Transformers which store all past tokens in a quadratic KV-cache, SSMs evolve a continuous-state register with O(1) inference memory and linear O(N) training speed.',
      },
      {
        question: 'In state-space research (and the P-027 experiment), why are constrained state updates required?',
        options: [
          'Unconstrained linear state evolution can suffer from exploding state norms if eigenvalues exceed 1.',
          'Because state matrices cannot contain negative numbers.',
          'Because GPUs only support symmetric matrices.',
        ],
        correctIndex: 0,
        explanation: 'Without mathematical constraints on the state update law, repeated recurrence can diverge exponentially. Boundedness constraints guarantee internal stability.',
      },
    ],
  },

  gnn: {
    title: 'Level 6 Mastery: Graph Message Passing & Permutation Invariance',
    questions: [
      {
        question: 'What does permutation invariance mean for a Graph Neural Network?',
        options: [
          'Reordering node ID numbers produces the exact same prediction for the graph.',
          'The graph must always contain exactly 10 nodes.',
          'Edges must only point in a clockwise direction.',
        ],
        correctIndex: 0,
        explanation: 'Molecules and citation webs have no natural "first" or "second" node. Aggregations (Sum, Mean, Max) ensure outputs depend on topology, not arbitrary index ordering.',
      },
      {
        question: 'How does GAT (Graph Attention) improve upon standard GCN (Graph Convolution)?',
        options: [
          'It learns dynamic attention coefficients α_ij so more relevant neighbors contribute larger updates.',
          'It replaces edges with 3D pixels.',
          'It removes all neural network weights from the aggregation step.',
        ],
        correctIndex: 0,
        explanation: 'GCN treats all connected neighbors with fixed degree-based weighting, whereas GAT uses self-attention to weight informative neighbors more heavily.',
      },
    ],
  },

  generative: {
    title: 'Level 7 Mastery: Diffusion Noise Dynamics & U-Nets',
    questions: [
      {
        question: 'What does the neural network inside a diffusion model actually predict?',
        options: [
          'It predicts the specific Gaussian noise vector ε that was added at timestep t.',
          'It predicts the entire final high-resolution image in a single forward pass.',
          'It predicts the user’s next prompt text.',
        ],
        correctIndex: 0,
        explanation: 'Rather than synthesizing pixels out of thin air, a diffusion network is a noise estimator: subtracting its predicted noise nudges the noisy sample toward structure.',
      },
      {
        question: 'Why is the U-Net architecture favored for image denoising?',
        options: [
          'Its long skip connections pass high-frequency spatial details directly from encoder to decoder.',
          'It has no convolutional layers.',
          'It does not require backpropagation during training.',
        ],
        correctIndex: 0,
        explanation: 'Skip connections bypass the bottleneck, allowing fine edges and pixel textures to be preserved while deeper layers process global semantic structure.',
      },
    ],
  },

  specialized: {
    title: 'Level 8 Mastery: Neural ODEs & Continuous Depth',
    questions: [
      {
        question: 'How do Neural ODEs fundamentally redefine network depth?',
        options: [
          'Depth is treated as continuous time t, evaluated via adaptive differential equation solvers.',
          'Depth is restricted to a maximum of 3 layers.',
          'Depth is measured in bits rather than layers.',
        ],
        correctIndex: 0,
        explanation: 'Neural ODEs replace discrete layer indices with dh/dt = f(h(t), t, θ). Network depth is continuous, and solvers dynamically adjust step sizes based on required precision.',
      },
      {
        question: 'What distinguishes Kolmogorov-Arnold Networks (KANs) from standard MLPs?',
        options: [
          'KANs place learnable 1D spline curves directly on edges rather than fixed activations on nodes.',
          'KANs only work on audio signals.',
          'KANs do not use weights.',
        ],
        correctIndex: 0,
        explanation: 'Inspired by the Kolmogorov-Arnold representation theorem, KANs (2024) make edge connections themselves learnable univariate splines, enhancing interpretability.',
      },
    ],
  },
};
