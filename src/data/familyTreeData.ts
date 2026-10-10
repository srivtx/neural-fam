/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NetworkFamilyNode, LandmarkModel } from '../types';

export const NETWORK_NODES: NetworkFamilyNode[] = [
  // 1. SINGLE NEURON & PERCEPTRON
  {
    id: 'perceptron',
    title: 'The Single Neuron & Perceptron',
    family: 'feedforward',
    familyName: 'Feedforward Networks',
    oneLiner: 'The fundamental building block: weighted sum of inputs plus a bias, passed through an activation function.',
    analogy: 'Imagine a sound mixing board. You have multiple instrument sliders (inputs x). You set sensitivity dials for each instrument (weights W). You add an ambient base hum (bias b). If the total volume exceeds a threshold, an alarm speaker rings (activation function σ).',
    mathFormula: 'y = \\sigma\\left(\\sum_{i=1}^n w_i x_i + b\\right) = \\sigma(W x + b)',
    mathBreakdown: [
      { symbol: 'x', meaning: 'The input features (e.g. screen pixels, house square footage, sensor readings).' },
      { symbol: 'W', meaning: 'Learned weights (sensitivity knobs indicating how much each input matters).' },
      { symbol: 'b', meaning: 'Learned bias (an offset shifting the activation threshold up or down).' },
      { symbol: '\\sigma', meaning: 'Activation function (e.g. Step, Sigmoid, ReLU) introducing non-linear switching.' },
    ],
    keyIdeas: [
      'Draws a single straight hyperplane (decision boundary) separating 2 classes.',
      'Cannot solve non-linear problems on its own (like XOR).',
      'Invented by Frank Rosenblatt in 1958 at Cornell Aeronautical Laboratory.',
    ],
    historicalContext: '1958: Frank Rosenblatt creates the Mark I Perceptron. In 1969, Minsky and Papert proved it could not learn the simple XOR logic gate, triggering the first AI winter.',
    examples: ['Binary logical gates (AND, OR)', 'Linear regression with threshold', 'Early character recognition'],
    threeQuestions: {
      coreArchitecture: 'Single computational node / Linear classifier',
      structuralMechanisms: ['Dot product', 'Threshold / Sigmoid activation', 'Affine transformation'],
      trainingObjective: 'Binary classification (Perceptron learning rule / Cross-entropy)',
    },
    labAvailable: true,
    codeSnippet: `// Pure TypeScript Single Neuron Forward Pass
function forwardNeuron(inputs: number[], weights: number[], bias: number, activation: 'step' | 'sigmoid' | 'relu'): number {
  let z = bias;
  for (let i = 0; i < inputs.length; i++) {
    z += inputs[i] * weights[i];
  }
  
  if (activation === 'step') {
    return z >= 0 ? 1 : 0;
  } else if (activation === 'sigmoid') {
    return 1 / (1 + Math.exp(-z));
  } else {
    return Math.max(0, z);
  }
}`,
    testCases: [
      { input: 'inputs: [1, 1], weights: [0.6, 0.6], bias: -1.0, activation: "step"', expected: '1 (AND gate fires)', description: 'AND Gate True' },
      { input: 'inputs: [1, 0], weights: [0.6, 0.6], bias: -1.0, activation: "step"', expected: '0 (AND gate silent)', description: 'AND Gate False' },
      { input: 'inputs: [2, 3], weights: [0.5, -1], bias: 0, activation: "relu"', expected: '0 (z = -2, clamped)', description: 'ReLU clamping negative' },
    ],
  },

  // 2. MULTILAYER PERCEPTRON (MLP)
  {
    id: 'mlp',
    title: 'Multilayer Perceptron (MLP)',
    family: 'feedforward',
    familyName: 'Feedforward Networks',
    oneLiner: 'Layers of interconnected neurons where hidden layers warp and bend input space to classify non-linear patterns.',
    analogy: 'If one ruler (single neuron) can only draw straight lines, an MLP is like folding a piece of paper in half first. Suddenly, a single straight slice cuts across two separated regions at once! Hidden layers bend the geometry.',
    mathFormula: 'h = \\sigma(W_1 x + b_1), \\quad y = g(W_2 h + b_2)',
    mathBreakdown: [
      { symbol: 'W_1, b_1', meaning: 'Weights and biases of the first (hidden) layer transforming input into feature space.' },
      { symbol: 'h', meaning: 'Hidden representation vector (the folded intermediate space).' },
      { symbol: 'W_2, b_2', meaning: 'Weights and biases of the second (output) layer.' },
      { symbol: 'g', meaning: 'Final output activation (e.g. Softmax for multi-class probability).' },
    ],
    keyIdeas: [
      'Universal Approximation Theorem: An MLP with even 1 non-linear hidden layer can approximate any continuous function.',
      'Solves the XOR problem by projecting inputs into a representation space where classes become linearly separable.',
      'Trained via Backpropagation (chain rule of calculus propagating gradients backward).',
    ],
    historicalContext: '1986: Rumelhart, Hinton, and Williams popularize Backpropagation, reigniting neural network research.',
    examples: ['Tabular tabular feature modeling', 'Transformer Feedforward Sublayer (FFN)', 'Financial risk scoring'],
    threeQuestions: {
      coreArchitecture: 'Dense feedforward acyclic graph (Layers of fully-connected nodes)',
      structuralMechanisms: ['Matrix multiplications', 'Non-linear activations (ReLU/GELU)', 'Layer stacking'],
      trainingObjective: 'Supervised classification or regression (MSE / Cross-entropy)',
    },
    labAvailable: true,
    codeSnippet: `// 2-Layer MLP Forward Pass with ReLU
function forwardMlp(x: number[], W1: number[][], b1: number[], W2: number[][], b2: number[]): number[] {
  // Hidden layer: h = ReLU(W1 * x + b1)
  const h = b1.map((b, i) => {
    let sum = b;
    for (let j = 0; j < x.length; j++) {
      sum += W1[i][j] * x[j];
    }
    return Math.max(0, sum); // ReLU
  });
  
  // Output layer: y = W2 * h + b2
  const y = b2.map((b, i) => {
    let sum = b;
    for (let j = 0; j < h.length; j++) {
      sum += W2[i][j] * h[j];
    }
    return sum;
  });
  return y;
}`,
    testCases: [
      { input: 'x: [0, 1], XOR weights initialized', expected: 'Output ~ 1', description: 'XOR logic [0, 1] -> 1' },
      { input: 'x: [1, 1], XOR weights initialized', expected: 'Output ~ 0', description: 'XOR logic [1, 1] -> 0' },
    ],
  },

  // 3. CNN & RESNET
  {
    id: 'cnn_resnet',
    title: 'CNN & Residual Networks (ResNet)',
    family: 'feedforward',
    familyName: 'Feedforward Networks',
    oneLiner: 'Translation-invariant spatial filters combined with residual skip connections that prevent signal collapse in deep networks.',
    analogy: 'Convolutions are like sliding a magnifying glass looking for specific patterns (edges, circles, ears) regardless of where they appear on a photo. Residual connections are express bypass highways: original information jumps straight through, so very deep stacks never choke or forget.',
    mathFormula: 'y = x + F(x, \\{W_i\\})',
    mathBreakdown: [
      { symbol: 'x', meaning: 'The input feature map identity before this residual block.' },
      { symbol: 'F(x)', meaning: 'The residual function: the learned perturbation or modification after 2-3 convolution layers.' },
      { symbol: 'y = x + F(x)', meaning: 'Identity skip addition: guarantees gradients can flow backwards undiminished without vanishing.' },
    ],
    keyIdeas: [
      'Weight sharing: The same 3x3 filter scans the entire image, drastically reducing parameter counts.',
      'Hierarchical features: Early layers detect edges, middle layers detect textures, late layers detect objects.',
      'ResNet is not a separate family: it is a convolutional architecture with identity skip connections that made 100+ layer networks trainable.',
    ],
    historicalContext: '1989: LeCun introduces LeNet-5 for digit reading. 2012: AlexNet wins ImageNet. 2015: He et al. introduce ResNet (152 layers), winning all ImageNet benchmarks.',
    examples: ['AlexNet (2012)', 'VGG (2014)', 'ResNet (2015)', 'DenseNet (2017)', 'ConvNeXt (2022)'],
    threeQuestions: {
      coreArchitecture: 'Convolutional grid-based spatial feature extractor',
      structuralMechanisms: ['Sliding dot-product kernels', 'Residual identity addition y = x + F(x)', 'Batch/Layer normalization', 'Pooling'],
      trainingObjective: 'Image classification, object detection, pixel segmentation',
    },
    labAvailable: true,
    codeSnippet: `// 2D Convolution on a 4x4 matrix with a 3x3 Kernel
function conv2d(input: number[][], kernel: number[][]): number[][] {
  const inH = input.length;
  const inW = input[0].length;
  const kH = kernel.length;
  const kW = kernel[0].length;
  const outH = inH - kH + 1;
  const outW = inW - kW + 1;
  const output: number[][] = [];

  for (let r = 0; r < outH; r++) {
    output[r] = [];
    for (let c = 0; c < outW; c++) {
      let sum = 0;
      for (let kr = 0; kr < kH; kr++) {
        for (let kc = 0; kc < kW; kc++) {
          sum += input[r + kr][c + kc] * kernel[kr][kc];
        }
      }
      output[r][c] = sum;
    }
  }
  return output;
}`,
    testCases: [
      { input: 'Horizontal edge detector kernel on 4x4 horizontal stripe', expected: 'High edge response at boundary rows', description: 'Detects horizontal line' },
      { input: 'Identity bypass on vector [1, 2, 3] with F(x) = [0.1, -0.2, 0.4]', expected: '[1.1, 1.8, 3.4]', description: 'Residual identity skip' },
    ],
  },

  // 4. RNN, LSTM & SEQUENCE NETWORKS
  {
    id: 'rnn_lstm',
    title: 'Recurrent Networks (RNN, LSTM & GRU)',
    family: 'sequence',
    familyName: 'Sequence Networks',
    oneLiner: 'Networks with internal loops that carry state across time steps, using gates to regulate what to remember and what to forget.',
    analogy: 'Reading a mystery novel one word at a time. As you read word 50, your brain holds a working memory note (hidden state h) summarizing clues from chapters 1-49. An LSTM adds three valves: one to erase irrelevant clues (forget gate), one to jot down new suspects (input gate), and one to make a deduction (output gate).',
    mathFormula: 'h_t = \\tanh(W_{hh} h_{t-1} + W_{xh} x_t + b_h), \\quad f_t = \\sigma(W_f [h_{t-1}, x_t] + b_f)',
    mathBreakdown: [
      { symbol: 'h_{t-1}', meaning: 'Hidden state from the preceding time step (summary of the past).' },
      { symbol: 'x_t', meaning: 'Current token or sensor input at time step t.' },
      { symbol: 'h_t', meaning: 'Updated hidden state passed forward to time step t+1.' },
      { symbol: 'f_t', meaning: 'LSTM Forget gate: values near 0 dump old cell memory, near 1 retain it.' },
    ],
    keyIdeas: [
      'Handles arbitrary-length sequential data (sentences, audio waveforms, stock prices).',
      'Plain RNNs suffer from vanishing/exploding gradients over long time horizons.',
      'LSTMs & GRUs introduced constant error carousels (additive cell state channels) with multiplicative gates.',
    ],
    historicalContext: '1986: Jordan & Elman recurrent nets. 1997: Hochreiter & Schmidhuber invent LSTM. 2014: Cho et al. invent GRU.',
    examples: ['Speech-to-text', 'Time series forecasting', 'Early machine translation (Seq2Seq)'],
    threeQuestions: {
      coreArchitecture: 'Recurrent state-machine processing sequential inputs iteratively',
      structuralMechanisms: ['Recurrent feedback loop', 'Hidden state registers', 'Multiplicative gates (forget/input/output)'],
      trainingObjective: 'Next-token prediction, sequence-to-sequence translation, time-series forecasting',
    },
    labAvailable: true,
    codeSnippet: `// Step-by-step Recurrent Hidden State Update
function rnnStep(prevHidden: number, inputVal: number, Whh: number, Wxh: number, bias: number): number {
  const z = (Whh * prevHidden) + (Wxh * inputVal) + bias;
  // Hyperbolic tangent activation between -1 and 1
  return Math.tanh(z);
}

// Unroll a 3-step sequence
function unrollRnn(inputs: number[], initHidden: number, Whh: number, Wxh: number, bias: number): number[] {
  const states: number[] = [initHidden];
  let h = initHidden;
  for (const x of inputs) {
    h = rnnStep(h, x, Whh, Wxh, bias);
    states.push(Number(h.toFixed(4)));
  }
  return states;
}`,
    testCases: [
      { input: 'inputs: [1, 2, -1], init: 0, Whh: 0.8, Wxh: 0.5, b: 0', expected: '[0, 0.4621, 0.9069, 0.1738]', description: '3-step hidden state unroll' },
    ],
  },

  // 5. TRANSFORMERS & ATTENTION
  {
    id: 'transformer',
    title: 'Transformers & Self-Attention',
    family: 'attention',
    familyName: 'Transformers & Attention',
    oneLiner: 'Replaces recurrence with pairwise parallel self-attention, letting every token attend to every other token simultaneously.',
    analogy: 'Imagine a cocktail party where everyone talks at once. Instead of whispering down a telephone chain (RNN), each guest has a spotlight. For every sentence, each word shines its spotlight on the exact other words that give it meaning (e.g. "it" shines its spotlight directly onto "bank" and "river").',
    mathFormula: '\\text{Attention}(Q, K, V) = \\text{Softmax}\\left(\\frac{Q K^T}{\\sqrt{d_k}}\\right) V',
    mathBreakdown: [
      { symbol: 'Q', meaning: 'Query matrix ("What am I looking for in the other tokens?").' },
      { symbol: 'K', meaning: 'Key matrix ("What do I offer to other tokens?").' },
      { symbol: 'V', meaning: 'Value matrix ("What information do I actually carry?").' },
      { symbol: '\\sqrt{d_k}', meaning: 'Scaling factor preventing dot products from exploding in high dimensions.' },
    ],
    keyIdeas: [
      'Quadratic context flexibility: Computes all-to-all token relationships in parallel $O(N^2)$.',
      'No recurrent bottleneck: Scalable on massive parallel GPU clusters.',
      'Three archetypes: Encoder-only (BERT), Decoder-only (GPT, Llama), Encoder-Decoder (T5, Whisper).',
    ],
    historicalContext: '2017: Vaswani et al. publish "Attention Is All You Need" from Google Research. Became the dominant foundation of all contemporary LLMs.',
    examples: ['GPT-4 / Claude / Llama', 'BERT', 'Vision Transformer (ViT)', 'Mixture of Experts (MoE)'],
    threeQuestions: {
      coreArchitecture: 'Self-attention based sequence-to-sequence transformer',
      structuralMechanisms: ['Multi-head self-attention', 'Residual connections', 'LayerNorm/RMSNorm', 'Feedforward MLP', 'Positional embeddings'],
      trainingObjective: 'Autoregressive next-token prediction (Decoder) or Masked Language Modeling (Encoder)',
    },
    labAvailable: true,
    codeSnippet: `// Scaled Dot-Product Attention for 2D vectors
function scaledDotProductAttention(Q: number[][], K: number[][], V: number[][]): { attentionWeights: number[][], output: number[][] } {
  const d_k = Q[0].length;
  const numTokens = Q.length;
  const scores: number[][] = [];

  // Compute Q * K^T / sqrt(d_k)
  for (let i = 0; i < numTokens; i++) {
    scores[i] = [];
    for (let j = 0; j < numTokens; j++) {
      let dot = 0;
      for (let d = 0; d < d_k; d++) {
        dot += Q[i][d] * K[j][d];
      }
      scores[i][j] = dot / Math.sqrt(d_k);
    }
  }

  // Softmax per row
  const attentionWeights = scores.map(row => {
    const maxVal = Math.max(...row);
    const expRow = row.map(v => Math.exp(v - maxVal));
    const sumExp = expRow.reduce((a, b) => a + b, 0);
    return expRow.map(v => Number((v / sumExp).toFixed(4)));
  });

  // Multiply by V
  const output: number[][] = [];
  const d_v = V[0].length;
  for (let i = 0; i < numTokens; i++) {
    output[i] = [];
    for (let d = 0; d < d_v; d++) {
      let sum = 0;
      for (let j = 0; j < numTokens; j++) {
        sum += attentionWeights[i][j] * V[j][d];
      }
      output[i][d] = Number(sum.toFixed(4));
    }
  }

  return { attentionWeights, output };
}`,
    testCases: [
      { input: '2 tokens with identical Q and K', expected: 'Attention weights split [0.5, 0.5]', description: 'Uniform attention split' },
      { input: 'Token 0 high similarity with Token 1', expected: 'Weight row 0 -> ~ [0.1, 0.9]', description: 'Targeted attention spotlight' },
    ],
  },

  // 6. STATE-SPACE MODELS (S4 & MAMBA)
  {
    id: 'ssm_mamba',
    title: 'State-Space Models (S4 & Mamba)',
    family: 'ssm',
    familyName: 'State-Space Models',
    oneLiner: 'Continuous dynamical systems discretized for sequence modeling: achieves linear O(N) training speed and constant O(1) inference memory.',
    analogy: 'Instead of keeping every past word in a giant expensive photo album (Transformers quadratic memory), an SSM is like a continuous audio tape player. It continuously blends the new audio frequency into an internal magnetic head state using differential equations. Mamba adds selective valves so it can filter out static noise while locking in critical phrases.',
    mathFormula: 'h_{t+1} = \\bar{A} h_t + \\bar{B} x_t, \\quad y_t = \\bar{C} h_t',
    mathBreakdown: [
      { symbol: '\\bar{A}', meaning: 'Transition matrix: governs how the internal state memory decays or evolves over time.' },
      { symbol: '\\bar{B}', meaning: 'Input projection matrix: governs how current token x affects the internal memory.' },
      { symbol: 'h_t', meaning: 'Compact fixed-size hidden state vector (continuous memory register).' },
      { symbol: '\\bar{C}', meaning: 'Output projection matrix: reads out observable predictions from the hidden state.' },
    ],
    keyIdeas: [
      'Sub-quadratic scaling: $O(N)$ sequence length scaling instead of Transformer $O(N^2)$.',
      'Selective State Spaces (Mamba): Parameters B and C are functions of the input $x_t$, allowing context-dependent forgetting.',
      'Research connection: Standard SSMs do not automatically guarantee bounded state growth unless constrained (crucial in P-027 stability analysis).',
    ],
    historicalContext: '2021: Gu et al. introduce S4 (Structured State Spaces). 2023: Gu and Dao release Mamba, matching or outperforming Transformers on language benchmarks.',
    examples: ['S4 (2021)', 'H3 (2022)', 'Mamba (2023)', 'Mamba-2 (2024)', 'P-027 Constrained Dynamic State Updates'],
    threeQuestions: {
      coreArchitecture: 'Continuous-time dynamical linear system discretized into recurrence/convolution',
      structuralMechanisms: ['Discretized state transition A', 'Selective gating B(x) and C(x)', 'Associative scan parallelism'],
      trainingObjective: 'Long-context language modeling, genomic sequence analysis, time series modeling',
    },
    labAvailable: true,
    codeSnippet: `// Discretized State-Space Model Step (1D simplified)
function ssmStep(h_prev: number, x_t: number, A: number, B: number, C: number): { h_next: number, y_t: number } {
  // h_{t+1} = A * h_t + B * x_t
  const h_next = (A * h_prev) + (B * x_t);
  // y_t = C * h_next
  const y_t = C * h_next;
  return { h_next: Number(h_next.toFixed(4)), y_t: Number(y_t.toFixed(4)) };
}

// Simulating Mamba dynamic selection where B depends on input magnitude
function selectiveMambaStep(h_prev: number, x_t: number, A: number, C: number): { h_next: number, y_t: number, B_t: number } {
  // Input-dependent selective parameter B(x_t)
  const B_t = 1 / (1 + Math.exp(-x_t)); // Sigmoid selection valve
  const h_next = (A * h_prev) + (B_t * x_t);
  const y_t = C * h_next;
  return { h_next: Number(h_next.toFixed(4)), y_t: Number(y_t.toFixed(4)), B_t: Number(B_t.toFixed(4)) };
}`,
    testCases: [
      { input: 'A: 0.9 (decay), B: 0.5, C: 1.0, h_0: 0, x: [1, 0, 0]', expected: 'Memory decays smoothly: 0.5 -> 0.45 -> 0.405', description: 'SSM exponential memory decay' },
    ],
  },

  // 7. GRAPH NEURAL NETWORKS (GNN)
  {
    id: 'gnn',
    title: 'Graph Neural Networks (GNN, GAT & MPNN)',
    family: 'graph',
    familyName: 'Graph Neural Networks',
    oneLiner: 'Operates directly on non-Euclidean graphs (molecules, social networks, citation webs) through localized message passing between connected neighbors.',
    analogy: 'Imagine a small neighborhood where houses represent nodes and streets represent edges. In each round of gossip, every house listens to what their immediate neighbors say (aggregation), mixes that gossip with their own thoughts (update), and shares their new worldview in the next round.',
    mathFormula: 'h_v^{(k)} = \\text{UPDATE}^{(k)}\\left(h_v^{(k-1)}, \\text{AGGREGATE}^{(k)}\\left(\\{h_u^{(k-1)} : u \\in \\mathcal{N}(v)\\}\\right)\\right)',
    mathBreakdown: [
      { symbol: 'h_v^{(k)}', meaning: 'Feature representation of target node v at iteration or layer k.' },
      { symbol: '\\mathcal{N}(v)', meaning: 'The set of neighbor nodes directly connected to node v.' },
      { symbol: '\\text{AGGREGATE}', meaning: 'Permutation-invariant function (Sum, Mean, Max, or Attention) gathering neighbor signals.' },
      { symbol: '\\text{UPDATE}', meaning: 'Neural layer combining the node’s previous state with the aggregated neighborhood message.' },
    ],
    keyIdeas: [
      'Permutation Invariance: Graph structure has no arbitrary "first" or "second" node order; results are identical regardless of how nodes are numbered.',
      'Message Passing Neural Network (MPNN) unifies GCN, GAT, and GraphSAGE under one conceptual umbrella.',
      'Applications in molecular chemistry (atoms as nodes, chemical bonds as edges) and recommendation engines.',
    ],
    historicalContext: '2016: Kipf & Welling introduce GCN. 2017: Veličković et al. introduce Graph Attention Networks (GAT). 2020: DeepMind uses GNNs in AlphaFold 2.',
    examples: ['GCN (Kipf & Welling)', 'GAT (Graph Attention)', 'GraphSAGE', 'AlphaFold 2', 'MoleculeNet'],
    threeQuestions: {
      coreArchitecture: 'Node-and-edge message passing network over non-Euclidean topology',
      structuralMechanisms: ['Neighborhood aggregation (sum/mean/attention)', 'Adjacency matrix normalization', 'Edge feature conditioning'],
      trainingObjective: 'Node classification, link prediction, molecular property regression',
    },
    labAvailable: true,
    codeSnippet: `// GCN-style Neighborhood Message Passing Step
function messagePassingStep(nodeFeatures: number[], adjacency: number[][], W: number): number[] {
  const numNodes = nodeFeatures.length;
  const updatedFeatures: number[] = [];

  for (let i = 0; i < numNodes; i++) {
    // 1. Aggregate neighbors (including self-loop)
    let aggregated = 0;
    let degree = 0;
    for (let j = 0; j < numNodes; j++) {
      if (adjacency[i][j] === 1 || i === j) { // self-loop
        aggregated += nodeFeatures[j];
        degree++;
      }
    }
    // Normalized mean aggregation
    const meanMsg = aggregated / degree;
    
    // 2. Linear transformation + activation
    const updated = Math.max(0, meanMsg * W); // ReLU
    updatedFeatures.push(Number(updated.toFixed(4)));
  }

  return updatedFeatures;
}`,
    testCases: [
      { input: '3 nodes: 0-1 connected, 2 isolated. W = 1.0', expected: 'Nodes 0 & 1 average features; Node 2 preserves self', description: 'GCN neighborhood smoothing' },
    ],
  },

  // 8. GENERATIVE FAMILIES: DIFFUSION, VAE, GAN
  {
    id: 'generative',
    title: 'Generative Models: Diffusion, VAE & GAN',
    family: 'generative',
    familyName: 'Generative Model Families',
    oneLiner: 'Models organized around how they learn to produce new data distributions: reverse denoising trajectories, adversarial min-max games, or latent autoencoders.',
    analogy: 'Diffusion is like dropping a drop of blue ink into a glass of water until it completely dissolves into random blue haze (forward process). The neural network learns how to reverse time, watching the random haze and nudging molecules back into a pristine drop of ink (reverse denoising).',
    mathFormula: 'x_{t-1} = \\frac{1}{\\sqrt{\\alpha_t}} \\left(x_t - \\frac{1 - \\alpha_t}{\\sqrt{1 - \\bar{\\alpha}_t}} \\epsilon_\\theta(x_t, t)\\right) + \\sigma_t z',
    mathBreakdown: [
      { symbol: 'x_t', meaning: 'The noisy image or tensor at timestep t.' },
      { symbol: '\\epsilon_\\theta(x_t, t)', meaning: 'Neural network (typically a U-Net or DiT Transformer) trained to predict the exact noise injected at step t.' },
      { symbol: '\\alpha_t, \\bar{\\alpha}_t', meaning: 'Pre-computed variance noise schedule parameters.' },
      { symbol: 'z', meaning: 'Random Gaussian noise injected at each reverse step for stochastic variation.' },
    ],
    keyIdeas: [
      'Generative models are a training paradigm, NOT a mutually exclusive architecture. A diffusion model can use a CNN (U-Net) or a Transformer (DiT).',
      'Autoencoders/VAEs compress inputs into a continuous probabilistic latent distribution $q(z|x)$ and reconstruct.',
      'GANs pit a Generator against a Discriminator in a game-theoretic minimax optimization.',
    ],
    historicalContext: '2013: Kingma & Welling introduce VAEs. 2014: Goodfellow introduces GANs. 2020: Ho et al. popularize DDPM (Diffusion). 2023: DiT replaces U-Net with Transformers in modern generation.',
    examples: ['Stable Diffusion', 'Midjourney', 'FLUX', 'StyleGAN', 'Variational Autoencoders'],
    threeQuestions: {
      coreArchitecture: 'U-Net or Diffusion Transformer (DiT) parameterized denoiser',
      structuralMechanisms: ['Score-based reverse SDE/ODE', 'Cross-attention text conditioning', 'Timestep sinusoidal embeddings'],
      trainingObjective: 'Noise prediction MSE loss: ||ε - ε_θ(x_t, t)||^2',
    },
    labAvailable: true,
    codeSnippet: `// 1D Toy Diffusion Denoising Step Simulation
function diffusionDenoiseStep(x_t: number, predictedNoise: number, alpha: number, beta: number): number {
  // Reverse update: remove fraction of estimated noise
  const mean = (1 / Math.sqrt(alpha)) * (x_t - (beta / Math.sqrt(1 - alpha)) * predictedNoise);
  return Number(mean.toFixed(4));
}

// Multi-step denoising trajectory
function denoiseTrajectory(initialNoise: number, steps: number): number[] {
  let x = initialNoise;
  const path: number[] = [Number(x.toFixed(3))];
  for (let t = steps; t > 0; t--) {
    // Simulated neural network predicting noise toward target 0.5
    const predNoise = (x - 0.5) * 0.4;
    x = diffusionDenoiseStep(x, predNoise, 0.9, 0.1);
    path.push(Number(x.toFixed(3)));
  }
  return path;
}`,
    testCases: [
      { input: 'Initial noise x_T = 2.4, 5 denoising steps', expected: 'Converges smoothly toward structured signal ~0.5', description: 'Reverse diffusion convergence' },
    ],
  },

  // 9. SPECIALIZED & EMERGING FAMILIES
  {
    id: 'specialized',
    title: 'Specialized & Continuous Networks',
    family: 'specialized',
    familyName: 'Specialized Networks',
    oneLiner: 'Specialized paradigms: Spiking Neural Networks (SNNs), Continuous-time Neural ODEs, Kolmogorov-Arnold Networks (KANs), and Physics-Informed PINNs.',
    analogy: 'Neural ODEs view a neural network not as distinct stacked floors in a building (Layer 1 -> Layer 2 -> Layer 3), but as a continuous fluid slide where depth is smooth continuous time $t \\in [0, T]$ governed by a differential equation.',
    mathFormula: '\\frac{dh(t)}{dt} = f(h(t), t, \\theta), \\quad h(t_1) = h(t_0) + \\int_{t_0}^{t_1} f(h(t), t, \\theta) dt',
    mathBreakdown: [
      { symbol: 'h(t)', meaning: 'Continuous hidden state as a function of depth/time t.' },
      { symbol: 'f(...)', meaning: 'Neural network computing the instantaneous velocity vector.' },
      { symbol: '\\int', meaning: 'ODE solver (Runge-Kutta / Euler) stepping across depth.' },
    ],
    keyIdeas: [
      'Neural ODEs replace discrete layer indices with adaptive step-size differential solvers.',
      'Spiking Neural Networks (SNNs): Communicate via discrete temporal pulses like real biological synapses for ultra-low power neuromorphic chips.',
      'Kolmogorov-Arnold Networks (KANs): Place learnable spline functions directly on edges rather than fixed nodes.',
      'Physics-Informed Neural Networks (PINNs): Incorporate conservation laws and PDE residuals directly into the loss function.',
    ],
    historicalContext: '2018: Chen et al. publish "Neural Ordinary Differential Equations" (NeurIPS Best Paper). 2024: Liu et al. publish KANs.',
    examples: ['Neural ODEs (2018)', 'Spiking Neural Networks (SNN)', 'Physics-Informed Neural Nets (PINN)', 'KANs (2024)', 'Capsule Networks'],
    threeQuestions: {
      coreArchitecture: 'Continuous dynamical system parameterized by vector fields',
      structuralMechanisms: ['ODE / PDE numerical integrators', 'Continuous depth modeling', 'Learnable spline weight functions (KAN)'],
      trainingObjective: 'Adjoint sensitivity method, physical PDE loss constraint, temporal spike-timing dependent plasticity',
    },
    labAvailable: true,
    codeSnippet: `// Euler Integration step for a 1D Neural ODE: h_{t+1} = h_t + dt * f(h_t, t)
function neuralOdeStep(h_t: number, dt: number, velocityFunction: (h: number) => number): number {
  const dh = velocityFunction(h_t);
  return Number((h_t + dt * dh).toFixed(4));
}

// Solve trajectory from t=0 to t=1 with dt = 0.2
function solveTrajectory(h0: number, steps: number, dt: number): number[] {
  let h = h0;
  const trajectory: number[] = [h0];
  // Example velocity field: pulls state toward equilibrium 1.0: f(h) = 1.0 - h
  for (let i = 0; i < steps; i++) {
    h = neuralOdeStep(h, dt, (val) => 1.0 - val);
    trajectory.push(h);
  }
  return trajectory;
}`,
    testCases: [
      { input: 'h0 = 0.0, dt = 0.2, 5 steps', expected: 'Trajectory smoothly ascends: 0.0 -> 0.2 -> 0.36 -> 0.488...', description: 'Continuous depth ODE trajectory' },
    ],
  },
];

export const LANDMARK_MODELS: LandmarkModel[] = [
  {
    id: 'resnet50',
    name: 'ResNet-50',
    year: 2015,
    authorOrOrg: 'Kaiming He et al. (Microsoft Research)',
    coreArchitecture: 'Convolutional Neural Network (CNN)',
    mechanisms: ['Residual Identity Connections: y = x + F(x)', 'Batch Normalization', 'Bottleneck 1x1-3x3-1x1 blocks'],
    trainingTask: 'Supervised 1000-class ImageNet classification',
    whyItMatters: 'Demonstrated that degradation in deep networks came from vanishing gradients rather than overfitting, enabling networks with 100+ layers.',
    familyId: 'cnn_resnet',
  },
  {
    id: 'gpt4',
    name: 'Typical GPT-style LLM',
    year: 2023,
    authorOrOrg: 'OpenAI',
    coreArchitecture: 'Decoder-Only Transformer',
    mechanisms: ['Causal Multi-Head Self-Attention', 'Residual Connections', 'RMSNorm / LayerNorm', 'SwiGLU Feedforward MLPs', 'Rotary Positional Embeddings (RoPE)'],
    trainingTask: 'Autoregressive Next-Token Prediction on massive internet corpora',
    whyItMatters: 'Showed that scaling causal attention and parameters improves complex reasoning across domains.',
    familyId: 'transformer',
  },
  {
    id: 'bert',
    name: 'BERT',
    year: 2018,
    authorOrOrg: 'Devlin et al. (Google Research)',
    coreArchitecture: 'Encoder-Only Transformer',
    mechanisms: ['Bidirectional Self-Attention', 'Residual Connections', 'Layer Normalization', 'Absolute Positional Embeddings'],
    trainingTask: 'Masked Language Modeling (fill-in-the-blank) & Next Sentence Prediction',
    whyItMatters: 'Improved search and NLP representations by allowing tokens to attend bidirectionally across the entire sentence.',
    familyId: 'transformer',
  },
  {
    id: 'mamba2',
    name: 'Mamba-2',
    year: 2024,
    authorOrOrg: 'Tri Dao & Albert Gu (Carnegie Mellon & Together AI)',
    coreArchitecture: 'State-Space Model (SSM)',
    mechanisms: ['Discretized Linear Continuous State Update', 'Input-Dependent Selective Parameters B(x) and C(x)', 'Structured State Space Duality (SSD)'],
    trainingTask: 'Autoregressive language modeling with linear O(N) context scaling',
    whyItMatters: 'Breaks the quadratic memory bottleneck of Transformers while maintaining comparable reasoning accuracy.',
    familyId: 'ssm_mamba',
  },
  {
    id: 'stablediffusion',
    name: 'Stable Diffusion (Latent Diffusion)',
    year: 2022,
    authorOrOrg: 'Rombach et al. (CompVis / Stability AI)',
    coreArchitecture: 'Convolutional U-Net with Cross-Attention (Latent Diffusion)',
    mechanisms: ['Autoencoder Latent Space Compression', 'Iterative Denoising Score Matching', 'Text Cross-Attention Conditioning'],
    trainingTask: 'Predicting Gaussian noise vector ε given noisy latent z_t and text prompt prompt',
    whyItMatters: 'Made high-resolution image synthesis runnable on consumer GPUs by diffusing in compressed latent space instead of raw pixel space.',
    familyId: 'generative',
  },
  {
    id: 'alphafold2',
    name: 'AlphaFold 2',
    year: 2020,
    authorOrOrg: 'John Jumper et al. (DeepMind)',
    coreArchitecture: 'Graph Neural Network & Invariant Point Attention Transformer',
    mechanisms: ['Evoformer Multiple Sequence Alignment', '3D Rigid Body Frame Transformations', 'Geometric SE(3) Equivariant Message Passing'],
    trainingTask: 'Predicting 3D atomic coordinates from 1D amino acid sequence',
    whyItMatters: 'Solved the 50-year-old Grand Challenge of protein folding, demonstrating the power of combining GNN geometry with attention.',
    familyId: 'gnn',
  },
  {
    id: 'p027_experiment',
    name: 'P-027 Constrained Dynamic Experiment',
    year: 2026,
    authorOrOrg: 'User Research Project',
    coreArchitecture: 'CNN-based Residual Dynamical Network',
    mechanisms: ['Proposed Constrained Internal State Update Law', 'Residual Identity Highway', 'Non-divergent Bounded State Space Constraints'],
    trainingTask: 'CIFAR-10 image classification with guaranteed bounded state evolution',
    whyItMatters: 'Explores how constrained state updates prevent exponential state explosion, bridging continuous SSMs and deep residual blocks.',
    familyId: 'ssm_mamba',
  },
];
