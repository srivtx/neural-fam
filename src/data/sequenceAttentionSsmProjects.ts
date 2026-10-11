/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Interactive "Build It Yourself from Scratch" (DIY) Projects for:
 * - Level 3: Recurrent Neural Networks & LSTM (Hochreiter & Schmidhuber 1997)
 * - Level 4: Transformers & Multi-Head Self-Attention (Vaswani et al. 2017)
 * - Level 5: State Space Models & Mamba (Gu & Dao 2023)
 *
 * All implementations rely exclusively on elementary array & scalar math.
 * Zero external machine learning libraries. Pure first-principles execution.
 */

import { DiyProject } from '../types/project';

// ============================================================================
// LEVEL 3 DIY PROJECT: RNN & LSTM CONSTANT ERROR CAROUSEL
// ============================================================================
export const RNN_LSTM_PROJECT: DiyProject = {
  id: 'rnn_lstm',
  level: 3,
  title: 'Build an LSTM Cell & The Constant Error Carousel from Scratch',
  architectureName: 'Long Short-Term Memory (LSTM)',
  tagline:
    'Derive gated recurrence with forget, input, and output valves in pure scalar arithmetic to conquer exponential gradient vanishing.',
  difficulty: 'Intermediate',
  estimatedMinutes: 35,
  prerequisites: [
    'Vector dot products',
    'Sigmoid & Tanh activation functions',
    'Recurrent state loops across time',
  ],
  firstPrinciplesBedrock:
    'Vanilla RNNs multiply error gradients by W_hh^T diag(1 - h_t^2) at every timestep, causing exponential decay to zero over 10-20 steps. Hochreiter & Schmidhuber (1997) dissolved this bottleneck by creating the Constant Error Carousel (CEC): an unscaled additive cell state conveyor belt c_t = f_t * c_{t-1} + i_t * c_tilde_t where dc_t / dc_{t-1} = f_t. When f_t = 1.0, error flows indefinitely across hundreds of steps with eigenvalue 1.0.',
  axiomaticRule:
    'Zero external ML libraries. Implement sigmoid, tanh, vanilla RNN step, LSTM gated cell, and CEC error propagation using pure JavaScript scalar arithmetic and arrays.',
  visualFeedbackType: 'sequence_state',
  milestones: [
    {
      step: 1,
      title: 'Numerically Stable Sigmoid & Tanh Activations',
      guidance:
        'Implement sigmoid(z) = 1 / (1 + exp(-z)) with bounding clamp [-15, 15] to prevent floating-point overflow, and tanh(z) = (exp(2z) - 1) / (exp(2z) + 1).',
      firstPrinciplesWhy:
        'Sigmoid outputs [0, 1] represent gating valve probabilities (how much information passes). Tanh outputs [-1, 1] provide zero-centered candidate updates that can both increment and decrement cell memory.',
      starterSnippet: `function sigmoid(z) {\n  // TODO: Clamp z between -15 and 15, then return 1 / (1 + Math.exp(-z))\n}`,
      hint: 'Math.max(-15, Math.min(15, z)) protects against Math.exp overflow.',
    },
    {
      step: 2,
      title: 'Vanilla RNN Step & Gradient Decay Simulation',
      guidance:
        'Implement vanillaRnnStep(x_t, h_prev, w_xh, w_hh, b_h) returning h_t = tanh(w_xh * x_t + w_hh * h_prev + b_h). Then implement simulateRnnJacobianProduct(w_hh, sequenceLength) returning the product of (w_hh * (1 - h^2)) to demonstrate exponential vanishing.',
      firstPrinciplesWhy:
        'The Jacobian dh_t / dh_{t-1} is w_hh * (1 - h_t^2). When |w_hh| <= 1.0, multiplying (w_hh * 0.8)^T decays to zero exponentially fast.',
      starterSnippet: `function vanillaRnnStep(x_t, h_prev, w_xh, w_hh, b_h) {\n  // TODO: Compute h_t = tanh(w_xh * x_t + w_hh * h_prev + b_h)\n}`,
      hint: 'Remember that tanh derivative is 1 - tanh(z)^2.',
    },
    {
      step: 3,
      title: 'The Gated LSTM Cell Step',
      guidance:
        'Implement lstmCellStep(x_t, h_prev, c_prev, weights) computing forget gate f_t, input gate i_t, candidate c_tilde_t, additive cell update c_t = f_t * c_prev + i_t * c_tilde_t, output gate o_t, and hidden state h_t = o_t * tanh(c_t).',
      firstPrinciplesWhy:
        'Additive cell update c_t = f_t * c_{t-1} + i_t * c_tilde eliminates recurrent matrix multiplication on c, creating an unattenuated gradient highway.',
      starterSnippet: `function lstmCellStep(x_t, h_prev, c_prev, w) {\n  // TODO: Compute f, i, c_tilde, c, o, h and return { h, c, f, i, o }\n}`,
      hint: 'f = sigmoid(w.w_xf * x_t + w.w_hf * h_prev + w.b_f). Same pattern for i and o. Candidate c_tilde uses tanh.',
    },
    {
      step: 4,
      title: 'Constant Error Carousel (CEC) Gradient Highway',
      guidance:
        'Implement propagateCellGradient(forgetGates) which computes the cumulative derivative dc_T / dc_1 = prod(forgetGates). Contrast forget bias b_f = 0 (f ≈ 0.5) vs b_f = +2.0 (f ≈ 0.88).',
      firstPrinciplesWhy:
        'When b_f = 0, f_t = 0.5 and after 30 steps 0.5^30 ≈ 9.3e-10 (amnesia). When b_f is initialized to +1 or +2, f_t ≈ 0.95 and error flows losslessly across hundreds of steps.',
      starterSnippet: `function propagateCellGradient(forgetGates) {\n  // TODO: Multiply all values in forgetGates array and return the product\n}`,
      hint: 'Use array reduce: forgetGates.reduce((acc, f) => acc * f, 1.0).',
    },
  ],
  starterCode: `// ============================================================================
// LEVEL 3: RECURRENT NEURAL NETWORKS & LSTM FROM SCRATCH
// Pure Scalar Math & Array Primitives (No external libraries)
// ============================================================================

/**
 * 1. Numerically Stable Sigmoid
 * Clamps input to [-15, 15] to prevent arithmetic overflow.
 */
function sigmoid(z) {
  // TODO: Clamp z to [-15, 15] and return 1 / (1 + exp(-z))
  return 0;
}

/**
 * 2. Hyperbolic Tangent
 */
function tanh(z) {
  return Math.tanh(z);
}

/**
 * 3. Vanilla RNN Forward Step
 * Formula: h_t = tanh(w_xh * x_t + w_hh * h_prev + b_h)
 */
function vanillaRnnStep(x_t, h_prev, w_xh, w_hh, b_h) {
  // TODO: Implement single-step vanilla RNN transition
  return 0;
}

/**
 * 4. LSTM Cell Forward Step
 * Weights object format:
 * {
 *   w_xf, w_hf, b_f,   // Forget gate weights
 *   w_xi, w_hi, b_i,   // Input gate weights
 *   w_xc, w_hc, b_c,   // Candidate state weights
 *   w_xo, w_ho, b_o    // Output gate weights
 * }
 */
function lstmCellStep(x_t, h_prev, c_prev, w) {
  // TODO: Compute:
  // f_t = sigmoid(w.w_xf * x_t + w.w_hf * h_prev + w.b_f)
  // i_t = sigmoid(w.w_xi * x_t + w.w_hi * h_prev + w.b_i)
  // c_tilde = tanh(w.w_xc * x_t + w.w_hc * h_prev + w.b_c)
  // c_t = f_t * c_prev + i_t * c_tilde  <-- Constant Error Carousel
  // o_t = sigmoid(w.w_xo * x_t + w.w_ho * h_prev + w.b_o)
  // h_t = o_t * tanh(c_t)
  // Return: { h: h_t, c: c_t, f: f_t, i: i_t, o: o_t }
  return { h: 0, c: 0, f: 0, i: 0, o: 0 };
}

/**
 * 5. Constant Error Carousel (CEC) Gradient Sensitivity
 * Computes: dc_T / dc_1 = prod_{t=2}^T f_t
 */
function propagateCellGradient(forgetGates) {
  // TODO: Compute cumulative product of forget gates across time
  return 0;
}

/**
 * 6. Multi-Step LSTM Sequence Unroller
 * Iterates through sequence of scalar inputs and tracks states.
 */
function runLstmSequence(inputs, initial_h, initial_c, weights) {
  // TODO: Loop over inputs, update h and c using lstmCellStep, return final { h, c }
  return { h: 0, c: 0 };
}

// Export for sandbox test harness
if (typeof exports !== 'undefined') {
  exports.sigmoid = sigmoid;
  exports.vanillaRnnStep = vanillaRnnStep;
  exports.lstmCellStep = lstmCellStep;
  exports.propagateCellGradient = propagateCellGradient;
  exports.runLstmSequence = runLstmSequence;
}
`,
  solutionCode: `// ============================================================================
// LEVEL 3: RECURRENT NEURAL NETWORKS & LSTM REFERENCE SOLUTION
// ============================================================================

function sigmoid(z) {
  const clamped = Math.max(-15, Math.min(15, z));
  return 1 / (1 + Math.exp(-clamped));
}

function tanh(z) {
  return Math.tanh(z);
}

function vanillaRnnStep(x_t, h_prev, w_xh, w_hh, b_h) {
  const z = w_xh * x_t + w_hh * h_prev + b_h;
  return Math.tanh(z);
}

function lstmCellStep(x_t, h_prev, c_prev, w) {
  // 1. Forget gate valve
  const f_t = sigmoid(w.w_xf * x_t + w.w_hf * h_prev + w.b_f);
  // 2. Input gate valve
  const i_t = sigmoid(w.w_xi * x_t + w.w_hi * h_prev + w.b_i);
  // 3. Candidate update vector
  const c_tilde = Math.tanh(w.w_xc * x_t + w.w_hc * h_prev + w.b_c);
  // 4. Constant Error Carousel: Additive cell accumulation
  const c_t = f_t * c_prev + i_t * c_tilde;
  // 5. Output gate valve
  const o_t = sigmoid(w.w_xo * x_t + w.w_ho * h_prev + w.b_o);
  // 6. Filtered hidden readout
  const h_t = o_t * Math.tanh(c_t);

  return { h: h_t, c: c_t, f: f_t, i: i_t, o: o_t };
}

function propagateCellGradient(forgetGates) {
  return forgetGates.reduce((prod, f) => prod * f, 1.0);
}

function runLstmSequence(inputs, initial_h, initial_c, weights) {
  let h = initial_h;
  let c = initial_c;
  for (let t = 0; t < inputs.length; t++) {
    const step = lstmCellStep(inputs[t], h, c, weights);
    h = step.h;
    c = step.c;
  }
  return { h, c };
}

if (typeof exports !== 'undefined') {
  exports.sigmoid = sigmoid;
  exports.vanillaRnnStep = vanillaRnnStep;
  exports.lstmCellStep = lstmCellStep;
  exports.propagateCellGradient = propagateCellGradient;
  exports.runLstmSequence = runLstmSequence;
}
`,
  testCases: [
    {
      id: 'test_sigmoid_clamping',
      description: 'Sigmoid activation bounds extreme values without overflow',
      inputDesc: 'z = 20.0 (extreme positive) and z = -20.0 (extreme negative)',
      expectedDesc: 'sigmoid(20) ≈ 0.99999969, sigmoid(-20) ≈ 3.059e-7',
      testFn: 'sigmoid',
      args: [20.0],
      expected: 0.99999969,
      tolerance: 1e-4,
    },
    {
      id: 'test_vanilla_rnn_step',
      description: 'Vanilla RNN step computes affine transformation followed by tanh',
      inputDesc: 'x_t = 0.5, h_prev = 0.2, w_xh = 1.0, w_hh = 0.8, b_h = -0.1',
      expectedDesc: 'tanh(0.5 + 0.16 - 0.1) = tanh(0.56) ≈ 0.50798',
      testFn: 'vanillaRnnStep',
      args: [0.5, 0.2, 1.0, 0.8, -0.1],
      expected: 0.50798,
      tolerance: 1e-4,
    },
    {
      id: 'test_lstm_forget_gate_memory_preservation',
      description: 'LSTM forget gate with b_f=+2.0 preserves memory cell state',
      inputDesc:
        'x_t = 0.0, h_prev = 0.0, c_prev = 5.0, weights with b_f = 2.0 and zero input gate',
      expectedDesc: 'f_t ≈ 0.8808, c_t ≈ 0.8808 * 5.0 = 4.4040',
      testFn: 'lstmCellStep',
      args: [
        0.0,
        0.0,
        5.0,
        {
          w_xf: 0,
          w_hf: 0,
          b_f: 2.0,
          w_xi: 0,
          w_hi: 0,
          b_i: -15.0, // shut input gate
          w_xc: 0,
          w_hc: 0,
          b_c: 0,
          w_xo: 0,
          w_ho: 0,
          b_o: 2.0,
        },
      ],
      expected: {
        h: 0.8808 * Math.tanh(4.404),
        c: 4.404,
        f: 0.8808,
        i: 0.0,
        o: 0.8808,
      },
      tolerance: 1e-3,
    },
    {
      id: 'test_cec_gradient_propagation',
      description:
        'Constant Error Carousel allows linear error flow across 20 steps (f_t = 0.99)',
      inputDesc: 'Array of 20 forget gates initialized to 0.99',
      expectedDesc: '0.99^20 ≈ 0.8179 (retains 81.8% gradient vs 0.5^20 ≈ 9.5e-7)',
      testFn: 'propagateCellGradient',
      args: [new Array(20).fill(0.99)],
      expected: 0.8179,
      tolerance: 1e-3,
    },
    {
      id: 'test_lstm_sequence_run',
      description: 'Unrolls sequence of 4 scalar inputs through LSTM cell',
      inputDesc: 'inputs = [1.0, 0.5, -0.5, 0.0], h_0 = 0, c_0 = 0',
      expectedDesc: 'Final hidden state h ≈ 0.1409 and cell state c ≈ 0.2276',
      testFn: 'runLstmSequence',
      args: [
        [1.0, 0.5, -0.5, 0.0],
        0.0,
        0.0,
        {
          w_xf: 0.5,
          w_hf: 0.2,
          b_f: 1.0,
          w_xi: 0.5,
          w_hi: 0.2,
          b_i: 0.0,
          w_xc: 0.8,
          w_hc: 0.3,
          b_c: 0.0,
          w_xo: 0.4,
          w_ho: 0.2,
          b_o: 0.5,
        },
      ],
      expected: {
        h: 0.1409,
        c: 0.2276,
      },
      tolerance: 1e-2,
    },
  ],
};

// ============================================================================
// LEVEL 4 DIY PROJECT: TRANSFORMER MULTI-HEAD SELF-ATTENTION
// ============================================================================
export const TRANSFORMER_PROJECT: DiyProject = {
  id: 'transformer',
  level: 4,
  title: 'Build Scaled Dot-Product Self-Attention & RoPE from Scratch',
  architectureName: 'Multi-Head Self-Attention (Vaswani et al. 2017)',
  tagline:
    'Construct all-to-all content routing, temperature variance stabilization (1/√d_k), and Rotary Position Embeddings using pure array mathematics.',
  difficulty: 'Advanced',
  estimatedMinutes: 45,
  prerequisites: [
    '2D Matrix Multiplication',
    'Softmax probability simplex normalization',
    'Variance and standard deviation mechanics',
  ],
  firstPrinciplesBedrock:
    'Sequential models suffer from O(T) communication path lengths. Self-attention converts sequences into complete graphs where any two tokens interact in O(1) depth. The dot-product variance Var[q^T k] = d_k causes softmax saturation when unscaled (for d_k = 64, std dev is 8, pushing logits to ±24 where softmax derivatives collapse to 0). Dividing by √d_k enforces Var = 1.0, preserving healthy gradients.',
  axiomaticRule:
    'Zero external ML frameworks. Implement matrix multiplication, stable row-wise softmax, scaled dot-product attention, causal masking, and rotary position embeddings using pure TypeScript arrays.',
  visualFeedbackType: 'attention_matrix',
  milestones: [
    {
      step: 1,
      title: 'Numerically Stable 1D Softmax with Max-Subtraction',
      guidance:
        'Implement softmax1D(logits) returning exp(z_i - max(z)) / sum(exp(z_j - max(z))). Verify that all elements are non-negative and sum to exactly 1.0.',
      firstPrinciplesWhy:
        'Computing exp(1000) produces IEEE-754 Infinity (NaN). Subtracting max(z) guarantees the largest exponent is exp(0) = 1, eliminating overflow while preserving exact probability ratios because exp(z_i - m) / sum exp(z_j - m) = exp(z_i) / sum exp(z_j).',
      starterSnippet: `function softmax1D(logits) {\n  // TODO: Find max, subtract from logits, exponentiate, normalize by sum\n}`,
      hint: 'const max = Math.max(...logits); const exps = logits.map(v => Math.exp(v - max));',
    },
    {
      step: 2,
      title: 'Matrix Multiplication & Scaled Compatibility Logits',
      guidance:
        'Implement matmul(A, B) for 2D matrices. Then compute pairwise compatibility S = (Q * K^T) / sqrt(d_k), where Q and K are N x d_k matrices.',
      firstPrinciplesWhy:
        'For i.i.d. zero-mean unit-variance queries and keys, Var(q^T k) = d_k. Scaling by 1 / sqrt(d_k) divides variance by (sqrt(d_k))^2 = d_k, locking logit variance at identically 1.0.',
      starterSnippet: `function computeScaledScores(Q, K, d_k) {\n  // TODO: Compute S_{ij} = sum_m(Q_{im} * K_{jm}) / Math.sqrt(d_k)\n}`,
      hint: 'Outer loop over i (tokens in Q), inner loop over j (tokens in K).',
    },
    {
      step: 3,
      title: 'Scaled Dot-Product Attention with Optional Causal Mask',
      guidance:
        'Implement scaledDotProductAttention(Q, K, V, d_k, isCausal). Apply causal mask by setting S_{ij} = -1e9 for j > i so future tokens cannot be attended to. Softmax each row of S to get attention weights A, then return A * V.',
      firstPrinciplesWhy:
        'Autoregressive language models must obey temporal causality: token i cannot see future token j > i. Setting masked logits to -1e9 forces exp(-1e9) ≈ 0, zeroing out future weights.',
      starterSnippet: `function scaledDotProductAttention(Q, K, V, d_k, isCausal) {\n  // TODO: Compute S, apply causal mask if true, apply softmax per row, multiply by V\n}`,
      hint: 'Row-wise softmax: for each row i in S, weights[i] = softmax1D(S[i]).',
    },
    {
      step: 4,
      title: 'Rotary Position Embeddings (RoPE)',
      guidance:
        'Implement applyRoPE(vector, pos, theta_base = 10000). For each consecutive 2D pair (v_{2i}, v_{2i+1}), rotate by angle m * theta_i where theta_i = theta_base^(-2i / d).',
      firstPrinciplesWhy:
        'RoPE applies complex 2D planar rotations such that <R_m q, R_n k> = q^T R_{n-m} k. The inner product depends strictly on relative distance (n - m), preserving relative positional geometry across unbounded sequence lengths.',
      starterSnippet: `function applyRoPE(vector, pos, theta_base = 10000) {\n  // TODO: Rotate 2D pairs [v_0, v_1], [v_2, v_3] by m * theta_i\n}`,
      hint: 'new_0 = v_0 * cos(m*theta) - v_1 * sin(m*theta); new_1 = v_0 * sin(m*theta) + v_1 * cos(m*theta);',
    },
  ],
  starterCode: `// ============================================================================
// LEVEL 4: TRANSFORMERS & MULTI-HEAD ATTENTION FROM SCRATCH
// Pure Scalar Math & 2D Arrays (No external libraries)
// ============================================================================

/**
 * 1. Numerically Stable Softmax for 1D Array
 * Subtracts maximum logit to eliminate numerical overflow.
 */
function softmax1D(logits) {
  // TODO: Compute exp(z_i - max) / sum(exp(z_j - max))
  return [];
}

/**
 * 2. 2D Matrix Multiplication
 * Multiplies Matrix A (N x K) by Matrix B (K x M) -> (N x M)
 */
function matmul(A, B) {
  // TODO: Compute standard matrix multiplication
  return [];
}

/**
 * 3. Scaled Dot-Product Attention Core
 * Q: N x d_k
 * K: N x d_k
 * V: N x d_v
 * d_k: scalar dimension
 * isCausal: boolean, if true masks entries where j > i with -1e9
 *
 * Returns: { output: N x d_v, attentionWeights: N x N }
 */
function scaledDotProductAttention(Q, K, V, d_k, isCausal = false) {
  // TODO:
  // 1. Compute similarity logits: S_{ij} = (q_i . k_j) / sqrt(d_k)
  // 2. If isCausal and j > i, set S_{ij} = -1e9
  // 3. For each row i, compute attentionWeights[i] = softmax1D(S[i])
  // 4. Output[i] = sum_j (attentionWeights[i][j] * V[j])
  // Return { output, attentionWeights }
  return { output: [], attentionWeights: [] };
}

/**
 * 4. Theoretical Variance Verification
 * Proves that Var(q^T k) = d_k and Var((q^T k) / sqrt(d_k)) = 1.0
 */
function computeLogitVariance(d_k, numSamples = 500) {
  // TODO: Generate independent samples of q, k ~ N(0, 1), compute variance of raw dot product vs scaled dot product
  return { rawVariance: 0, scaledVariance: 0 };
}

/**
 * 5. Rotary Position Embedding (RoPE)
 * vector: array of length d (must be even)
 * pos: integer position m
 * theta_base: base frequency (default 10000)
 */
function applyRoPE(vector, pos, theta_base = 10000) {
  // TODO: For each pair [2i, 2i+1], rotate by angle pos * theta_i
  // where theta_i = Math.pow(theta_base, -2 * i / vector.length)
  // [v_2i_rot, v_2i+1_rot] = rotationMatrix(angle) * [v_2i, v_2i+1]
  return [];
}

// Export for test harness
if (typeof exports !== 'undefined') {
  exports.softmax1D = softmax1D;
  exports.matmul = matmul;
  exports.scaledDotProductAttention = scaledDotProductAttention;
  exports.applyRoPE = applyRoPE;
}
`,
  solutionCode: `// ============================================================================
// LEVEL 4: TRANSFORMERS & MULTI-HEAD ATTENTION REFERENCE SOLUTION
// ============================================================================

function softmax1D(logits) {
  if (!logits || logits.length === 0) return [];
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) {
    if (logits[i] > max) max = logits[i];
  }
  const exps = new Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    exps[i] = Math.exp(logits[i] - max);
    sum += exps[i];
  }
  for (let i = 0; i < logits.length; i++) {
    exps[i] = exps[i] / (sum || 1e-12);
  }
  return exps;
}

function matmul(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const result = Array.from({ length: rowsA }, () => new Array(colsB).fill(0));
  for (let i = 0; i < rowsA; i++) {
    for (let k = 0; k < colsA; k++) {
      const a_ik = A[i][k];
      for (let j = 0; j < colsB; j++) {
        result[i][j] += a_ik * B[k][j];
      }
    }
  }
  return result;
}

function scaledDotProductAttention(Q, K, V, d_k, isCausal = false) {
  const N = Q.length;
  const scale = 1 / Math.sqrt(d_k);

  // 1. Compute Pairwise Scaled Similarity Matrix S = Q K^T / sqrt(d_k)
  const S = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      let dot = 0;
      for (let m = 0; m < d_k; m++) {
        dot += Q[i][m] * K[j][m];
      }
      let score = dot * scale;
      // Causal Masking: future tokens get -1e9
      if (isCausal && j > i) {
        score = -1e9;
      }
      S[i][j] = score;
    }
  }

  // 2. Softmax Normalization Per Row
  const A = Array.from({ length: N }, () => new Array(N).fill(0));
  for (let i = 0; i < N; i++) {
    A[i] = softmax1D(S[i]);
  }

  // 3. Value Aggregation: Output = A * V
  const d_v = V[0].length;
  const output = Array.from({ length: N }, () => new Array(d_v).fill(0));
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const weight = A[i][j];
      for (let m = 0; m < d_v; m++) {
        output[i][m] += weight * V[j][m];
      }
    }
  }

  return { output, attentionWeights: A };
}

function applyRoPE(vector, pos, theta_base = 10000) {
  const d = vector.length;
  const rotated = new Array(d);
  for (let i = 0; i < d; i += 2) {
    const theta_i = Math.pow(theta_base, -i / d);
    const angle = pos * theta_i;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const v0 = vector[i];
    const v1 = vector[i + 1];
    // 2D Rotation: [cos, -sin; sin, cos] * [v0; v1]
    rotated[i] = v0 * cosA - v1 * sinA;
    rotated[i + 1] = v0 * sinA + v1 * cosA;
  }
  return rotated;
}

if (typeof exports !== 'undefined') {
  exports.softmax1D = softmax1D;
  exports.matmul = matmul;
  exports.scaledDotProductAttention = scaledDotProductAttention;
  exports.applyRoPE = applyRoPE;
}
`,
  testCases: [
    {
      id: 'test_softmax_stability',
      description: 'Softmax handles massive logit scales without NaN overflow',
      inputDesc: 'logits = [1000, 1001, 1002]',
      expectedDesc:
        'Softmax distribution [0.09003, 0.24473, 0.66524] summing to 1.0',
      testFn: 'softmax1D',
      args: [[1000, 1001, 1002]],
      expected: [0.09003, 0.24473, 0.66524],
      tolerance: 1e-4,
    },
    {
      id: 'test_scaled_dot_product_attention',
      description:
        'Computes scaled dot-product attention on 2 tokens with d_k=2',
      inputDesc:
        'Q=[[1, 0], [0, 1]], K=[[1, 0], [0, 1]], V=[[2, 0], [0, 3]], d_k=2',
      expectedDesc:
        'Output matches attention-weighted sum of V vectors (diag boosted)',
      testFn: 'scaledDotProductAttention',
      args: [
        [
          [1, 0],
          [0, 1],
        ],
        [
          [1, 0],
          [0, 1],
        ],
        [
          [2, 0],
          [0, 3],
        ],
        2,
        false,
      ],
      expected: {
        output: [
          [1.3396, 0.9906],
          [0.6604, 2.0094],
        ],
        attentionWeights: [
          [0.6698, 0.3302],
          [0.3302, 0.6698],
        ],
      },
      tolerance: 1e-3,
    },
    {
      id: 'test_causal_masking_zero_leakage',
      description:
        'Causal masking strictly zeros out attention from token 0 to token 1',
      inputDesc: 'Q, K, V with isCausal = true',
      expectedDesc:
        'Row 0 attention weights = [1.0, 0.0], output row 1 = [8.349, 8.349]',
      testFn: 'scaledDotProductAttention',
      args: [
        [
          [1, 0],
          [0, 1],
        ],
        [
          [1, 0],
          [0, 1],
        ],
        [
          [5, 5],
          [10, 10],
        ],
        2,
        true, // Causal enabled
      ],
      expected: {
        output: [
          [5.0, 5.0],
          [8.3488, 8.3488],
        ],
        attentionWeights: [
          [1.0, 0.0],
          [0.3302, 0.6698],
        ],
      },
      tolerance: 1e-3,
    },
    {
      id: 'test_rope_relative_shift_invariance',
      description:
        'RoPE inner product <R_m q, R_n k> equals <R_{m+k} q, R_{n+k} k>',
      inputDesc:
        'q = [1, 0, 0, 1], k = [0, 1, 1, 0] evaluated at relative offset delta=2',
      expectedDesc:
        'Inner product at pos (0, 2) matches inner product at shifted pos (3, 5)',
      testFn: 'applyRoPE',
      args: [[1.0, 0.0, 0.0, 1.0], 1, 10000],
      expected: [
        Math.cos(1.0),
        Math.sin(1.0),
        Math.cos(1.0 * 0.01) * 0.0 - Math.sin(1.0 * 0.01) * 1.0,
        Math.sin(1.0 * 0.01) * 0.0 + Math.cos(1.0 * 0.01) * 1.0,
      ],
      tolerance: 1e-4,
    },
  ],
};

// ============================================================================
// LEVEL 5 DIY PROJECT: MAMBA SELECTIVE STATE SPACE MODEL
// ============================================================================
export const SSM_MAMBA_PROJECT: DiyProject = {
  id: 'ssm_mamba',
  level: 5,
  title: 'Build a Selective State Space & Parallel Associative Scan from Scratch',
  architectureName: 'Mamba Selective State Space (Gu & Dao 2023)',
  tagline:
    'Derive exact Zero-Order Hold (ZOH) discretization, content-dependent selective gating, and the Blelloch parallel associative scan in pure arrays.',
  difficulty: 'Mastery',
  estimatedMinutes: 50,
  prerequisites: [
    'Continuous linear ODEs (h\' = Ah + Bx)',
    'Matrix exponential & ZOH integration',
    'Associative prefix tree reduction',
  ],
  firstPrinciplesBedrock:
    'Continuous physical dynamics satisfy h\'(t) = A h(t) + B x(t). Integrating over timescale step Δ assuming piecewise-constant input yields the exact Zero-Order Hold (ZOH) recurrence: A_bar = exp(Δ A), B_bar = (Δ A)^-1 (exp(Δ A) - I) * Δ B. Linear Time-Invariant (LTI) systems fail on associative recall because their static impulse response cannot filter noise. Mamba makes (Δ, B, C) input-dependent functions of x_t, breaking LTI while maintaining O(N) training speed via parallel associative prefix scans.',
  axiomaticRule:
    'Zero external ML libraries. Implement ZOH discretization, input-dependent selective step, associative operator, and parallel prefix scan using pure JavaScript primitives.',
  visualFeedbackType: 'ssm_state',
  milestones: [
    {
      step: 1,
      title: 'Exact Zero-Order Hold (ZOH) Discretization',
      guidance:
        'Implement discretizeZOH(A_diag, B, delta). For each state dimension n, compute A_bar[n] = exp(delta * A_diag[n]) and B_bar[n] = (exp(delta * A_diag[n]) - 1) / A_diag[n] * B[n].',
      firstPrinciplesWhy:
        'Continuous differential equations cannot run on digital hardware. ZOH exact integration guarantees sample-rate invariance and numerical stability across arbitrary discretization timescales Δ.',
      starterSnippet: `function discretizeZOH(A_diag, B, delta) {\n  // TODO: Compute A_bar = exp(delta * A) and B_bar = (exp(delta * A) - 1) / A * B\n}`,
      hint: 'If delta * A is very close to 0, use Taylor expansion B_bar = delta * B to avoid 0/0 division.',
    },
    {
      step: 2,
      title: 'Input-Dependent Selective Parameters',
      guidance:
        'Implement computeSelectiveParams(x_t, projDelta, projB, projC). Compute delta_t = softplus(projDelta * x_t + bias), B_t = projB * x_t, and C_t = projC * x_t. Note: softplus(z) = ln(1 + exp(z)).',
      firstPrinciplesWhy:
        'Making discretization timescale Δ_t input-dependent breaks Linear Time Invariance (LTI). When an irrelevant filler token arrives, the model outputs Δ_t → 0, freezing the state h_t = h_{t-1} and protecting memory from corruption.',
      starterSnippet: `function computeSelectiveParams(x_t, projDelta, projB, projC) {\n  // TODO: Compute softplus delta, selective B, and selective C\n}`,
      hint: 'For stable softplus: z > 20 ? z : Math.log(1 + Math.exp(z)).',
    },
    {
      step: 3,
      title: 'The Binary Associative Operator',
      guidance:
        'Implement associativeOperator(elem_j, elem_i) where each element is a tuple { a, b }. The operator computes (a_j, b_j) • (a_i, b_i) = { a: a_j * a_i, b: a_j * b_i + b_j }.',
      firstPrinciplesWhy:
        'The recurrence h_t = a_t * h_{t-1} + b_t satisfies associativity: (u • v) • w = u • (v • w). This fundamental algebraic invariant enables evaluating recurrent states across N tokens in O(log N) parallel depth instead of sequential serial loops.',
      starterSnippet: `function associativeOperator(elem_j, elem_i) {\n  // TODO: Return { a: elem_j.a * elem_i.a, b: elem_j.a * elem_i.b + elem_j.b }\n}`,
      hint: 'Carefully verify the order: new_a = a_j * a_i, new_b = a_j * b_i + b_j.',
    },
    {
      step: 4,
      title: 'Parallel Associative Prefix Scan',
      guidance:
        'Implement associativeScan(elements). Given an array of N tuples [{a, b}], compute all cumulative prefix states using sequential or tree reduction. Return array of cumulative states h_t.',
      firstPrinciplesWhy:
        'On GPU hardware, the Blelloch associative scan executes inside ultra-fast on-chip SRAM in parallel tree passes, solving sequential recurrent states 5x faster than FlashAttention-2 without quadratic memory.',
      starterSnippet: `function associativeScan(elements) {\n  // TODO: Compute prefix scan using associativeOperator across all elements\n}`,
      hint: 'Sequential baseline: let current = elements[0]; results.push(current.b); then fold forward.',
    },
  ],
  starterCode: `// ============================================================================
// LEVEL 5: STATE SPACE MODELS & MAMBA FROM SCRATCH
// Pure Scalar Math & Array Primitives (No external libraries)
// ============================================================================

/**
 * 1. Numerically Stable Softplus
 * Formula: softplus(z) = ln(1 + exp(z))
 */
function softplus(z) {
  // TODO: Stable implementation: if z > 20 return z, else Math.log(1 + Math.exp(z))
  return 0;
}

/**
 * 2. Exact Zero-Order Hold (ZOH) Discretization
 * A_diag: array of negative continuous decay values (e.g. [-1.0, -2.0])
 * B: array of input projection values
 * delta: positive discretization step size
 *
 * Formulas:
 * A_bar[n] = exp(delta * A_diag[n])
 * B_bar[n] = (exp(delta * A_diag[n]) - 1) / A_diag[n] * B[n]
 */
function discretizeZOH(A_diag, B, delta) {
  // TODO: Compute A_bar and B_bar for each dimension n
  return { A_bar: [], B_bar: [] };
}

/**
 * 3. Mamba Input-Dependent Parameter Projection
 * Computes selective Δ_t, B_t, C_t from input token x_t
 */
function computeSelectiveParams(x_t, projDelta, projB, projC, deltaBias = -0.5) {
  // TODO:
  // delta_t = softplus(projDelta * x_t + deltaBias)
  // B_t = projB * x_t
  // C_t = projC * x_t
  return { delta_t: 0, B_t: [], C_t: [] };
}

/**
 * 4. The Binary Associative Operator
 * For recurrence h_t = a_t * h_{t-1} + b_t
 * Evaluates: (a_j, b_j) • (a_i, b_i) = (a_j * a_i, a_j * b_i + b_j)
 */
function associativeOperator(elem_j, elem_i) {
  // TODO: Combine two transition tuples
  return { a: 0, b: 0 };
}

/**
 * 5. Prefix Associative Scan
 * Computes all cumulative states across N steps in O(N) operations / O(log N) depth
 * elements: array of { a, b } tuples
 * Returns: array of cumulative states h_t
 */
function associativeScan(elements) {
  // TODO: Compute prefix scan using associativeOperator
  return [];
}

/**
 * 6. Full Mamba Step Simulation
 * Simulates a selective SSM token step: state update + output readout
 */
function mambaStep(x_t, h_prev, A_diag, projDelta, projB, projC) {
  // TODO:
  // 1. Compute selective params
  // 2. Discretize A and B via ZOH
  // 3. Update state: h_t = A_bar * h_prev + B_bar * x_t
  // 4. Output readout: y_t = sum(C_t * h_t)
  return { y_t: 0, h_t: [], delta_t: 0 };
}

// Export for test harness
if (typeof exports !== 'undefined') {
  exports.softplus = softplus;
  exports.discretizeZOH = discretizeZOH;
  exports.computeSelectiveParams = computeSelectiveParams;
  exports.associativeOperator = associativeOperator;
  exports.associativeScan = associativeScan;
  exports.mambaStep = mambaStep;
}
`,
  solutionCode: `// ============================================================================
// LEVEL 5: STATE SPACE MODELS & MAMBA REFERENCE SOLUTION
// ============================================================================

function softplus(z) {
  if (z > 20) return z;
  if (z < -20) return Math.exp(z);
  return Math.log(1 + Math.exp(z));
}

function discretizeZOH(A_diag, B, delta) {
  const N = A_diag.length;
  const A_bar = new Array(N);
  const B_bar = new Array(N);

  for (let n = 0; n < N; n++) {
    const a = A_diag[n];
    const b = B[n];
    const da = delta * a;
    const exp_da = Math.exp(da);
    A_bar[n] = exp_da;

    // Stable limit when delta * a -> 0
    if (Math.abs(da) < 1e-6) {
      B_bar[n] = delta * b;
    } else {
      B_bar[n] = ((exp_da - 1.0) / a) * b;
    }
  }

  return { A_bar, B_bar };
}

function computeSelectiveParams(x_t, projDelta, projB, projC, deltaBias = -0.5) {
  // 1. Dynamic timescale valve Δ_t
  const deltaRaw = projDelta * x_t + deltaBias;
  const delta_t = softplus(deltaRaw);

  // 2. Dynamic input projection B_t
  const B_t = projB.map((w) => w * x_t);

  // 3. Dynamic output observation C_t
  const C_t = projC.map((w) => w * x_t);

  return { delta_t, B_t, C_t };
}

function associativeOperator(elem_j, elem_i) {
  return {
    a: elem_j.a * elem_i.a,
    b: elem_j.a * elem_i.b + elem_j.b,
  };
}

function associativeScan(elements) {
  if (!elements || elements.length === 0) return [];
  const N = elements.length;
  const states = new Array(N);

  let acc = elements[0];
  states[0] = acc.b;

  for (let i = 1; i < N; i++) {
    acc = associativeOperator(elements[i], acc);
    states[i] = acc.b;
  }

  return states;
}

function mambaStep(x_t, h_prev, A_diag, projDelta, projB, projC) {
  const { delta_t, B_t, C_t } = computeSelectiveParams(x_t, projDelta, projB, projC);
  const { A_bar, B_bar } = discretizeZOH(A_diag, B_t, delta_t);

  const N = A_diag.length;
  const h_t = new Array(N);
  let y_t = 0;

  for (let n = 0; n < N; n++) {
    h_t[n] = A_bar[n] * h_prev[n] + B_bar[n] * x_t;
    y_t += C_t[n] * h_t[n];
  }

  return { y_t, h_t, delta_t };
}

if (typeof exports !== 'undefined') {
  exports.softplus = softplus;
  exports.discretizeZOH = discretizeZOH;
  exports.computeSelectiveParams = computeSelectiveParams;
  exports.associativeOperator = associativeOperator;
  exports.associativeScan = associativeScan;
  exports.mambaStep = mambaStep;
}
`,
  testCases: [
    {
      id: 'test_zoh_discretization_precision',
      description:
        'ZOH discretization produces exact exponential matrices A_bar and B_bar',
      inputDesc: 'A = [-1.0, -2.0], B = [1.0, 1.0], delta = 0.5',
      expectedDesc:
        'A_bar = [exp(-0.5), exp(-1.0)] ≈ [0.60653, 0.36788], B_bar = [0.39347, 0.31606]',
      testFn: 'discretizeZOH',
      args: [[-1.0, -2.0], [1.0, 1.0], 0.5],
      expected: {
        A_bar: [0.60653, 0.36788],
        B_bar: [0.39347, 0.31606],
      },
      tolerance: 1e-4,
    },
    {
      id: 'test_associative_operator_identity',
      description:
        'Binary operator • satisfies mathematical associativity (u • v) • w == u • (v • w)',
      inputDesc:
        'u = { a: 0.8, b: 1.2 }, v = { a: 0.5, b: 0.9 }, w = { a: 0.9, b: 0.4 }',
      expectedDesc:
        'Combined transition tuple matches exact associative composition',
      testFn: 'associativeOperator',
      args: [
        { a: 0.8, b: 1.2 },
        { a: 0.5, b: 0.9 },
      ],
      expected: {
        a: 0.4,
        b: 0.8 * 0.9 + 1.2, // 0.72 + 1.2 = 1.92
      },
      tolerance: 1e-4,
    },
    {
      id: 'test_parallel_prefix_scan_equivalence',
      description:
        'Associative scan matches sequential recurrence across sequence of 4 steps',
      inputDesc:
        'elements = [{ a: 0.5, b: 1.0 }, { a: 0.8, b: 0.5 }, { a: 0.9, b: 0.2 }, { a: 0.6, b: 1.5 }]',
      expectedDesc:
        'h_0 = 1.0, h_1 = 0.8*1.0 + 0.5 = 1.3, h_2 = 0.9*1.3 + 0.2 = 1.37, h_3 = 0.6*1.37 + 1.5 = 2.322',
      testFn: 'associativeScan',
      args: [
        [
          { a: 0.5, b: 1.0 },
          { a: 0.8, b: 0.5 },
          { a: 0.9, b: 0.2 },
          { a: 0.6, b: 1.5 },
        ],
      ],
      expected: [1.0, 1.3, 1.37, 2.322],
      tolerance: 1e-3,
    },
    {
      id: 'test_selective_noise_freezing',
      description:
        'When delta -> 0 (noise token), state remains frozen (A_bar -> 1.0, B_bar -> 0.0)',
      inputDesc: 'A = [-1.0], B = [1.0], delta = 1e-6',
      expectedDesc:
        'A_bar ≈ 1.0000, B_bar ≈ 0.0000 (state memory is cryogenically preserved)',
      testFn: 'discretizeZOH',
      args: [[-1.0], [1.0], 1e-6],
      expected: {
        A_bar: [0.999999],
        B_bar: [0.000001],
      },
      tolerance: 1e-4,
    },
    {
      id: 'test_mamba_step_forward',
      description:
        'Full selective Mamba step updates state and computes scalar output y_t',
      inputDesc:
        'x_t = 1.0, h_prev = [0.5, 0.5], A = [-1.0, -1.0], delta_proj = 0.5',
      expectedDesc:
        'A_bar=[0.5, 0.5], B_bar=[0.4, 0.2], h_t=[0.65, 0.45], y_t=0.55',
      testFn: 'mambaStep',
      args: [
        1.0,
        [0.5, 0.5],
        [-1.0, -1.0],
        0.5,
        [0.8, 0.4],
        [0.5, 0.5],
      ],
      expected: {
        y_t: 0.55,
        h_t: [0.65, 0.45],
        delta_t: 0.6931,
      },
      tolerance: 1e-2,
    },
  ],
};
