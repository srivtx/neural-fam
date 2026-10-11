/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Interactive "Build It Yourself from Scratch" (DIY) Projects for:
 * - Level 6: Graph Neural Networks & Spectral Message Passing (Kipf & Welling 2016, Gilmer et al. 2017)
 * - Level 7: Generative Diffusion & Score-Based Thermodynamics (Sohl-Dickstein 2015, Ho et al. 2020, Song et al. 2020)
 * - Level 8: Neural Ordinary Differential Equations & Continuous Architectures (Chen et al. 2018, Liu et al. 2024)
 *
 * All implementations rely exclusively on elementary array & scalar math.
 * Zero external machine learning libraries. Pure first-principles execution.
 */

import { DiyProject } from '../types/project';

// ============================================================================
// LEVEL 6 DIY PROJECT: GRAPH NEURAL NETWORKS & SPECTRAL MESSAGE PASSING
// ============================================================================
export const GNN_PROJECT: DiyProject = {
  id: 'gnn',
  level: 6,
  title: 'Build a Spectral Graph Convolutional Network & Message Passing Engine from Scratch',
  architectureName: 'Spectral Graph Convolution (GCN) & Message Passing Neural Network (MPNN)',
  tagline:
    'Construct renormalized Laplacians with self-loops, implement degree-normalized message passing, and mathematically verify permutation equivariance on non-Euclidean topologies.',
  difficulty: 'Advanced',
  estimatedMinutes: 45,
  prerequisites: [
    'Adjacency matrix representation',
    'Matrix multiplication',
    'Permutation group symmetries S_N',
  ],
  firstPrinciplesBedrock:
    'Real-world relational systems (molecules, chemical bonds, citation graphs) live on irregular, non-Euclidean manifolds with no canonical coordinate origin or vertex ordering. Standard MLPs on flattened adjacency matrices require observing N! permutations (for N=20 atoms, 20! ≈ 2.43e18). Message passing solves this by decomposing graph convolutions into localized neighborhood aggregations. By adding self-loops A_tilde = A + I and symmetrically normalizing by D_tilde^{-1/2} A_tilde D_tilde^{-1/2}, the network guarantees constant feature variance across variable node degrees and strictly bounded eigenvalues in (-1, 1], achieving exact permutation equivariance f(P A P^T, P X) = P f(A, X).',
  axiomaticRule:
    'Zero PyTorch Geometric or external ML libraries. Pure 2D arrays, matrix arithmetic, and scalar activation functions only.',
  visualFeedbackType: 'graph_nodes',
  milestones: [
    {
      step: 1,
      title: 'Renormalized Graph Laplacian with Self-Loops',
      guidance:
        'Implement addSelfLoops(adj) to compute A_tilde = A + I_N, computeDegrees(adjTilde) to sum row degrees d_tilde_i = sum_j A_tilde_ij, and computeNormalizedLaplacian(adj) to calculate A_norm[i][j] = A_tilde[i][j] / sqrt(d_tilde_i * d_tilde_j).',
      firstPrinciplesWhy:
        'Self-loops guarantee that a node preserves its own previous state alongside neighbor gossip. Symmetric normalization divides each edge (u, v) by sqrt(deg(u) * deg(v)), bounding eigenvalues to <= 1.0 and preventing degree-induced gradient explosion.',
      starterSnippet: `function computeNormalizedLaplacian(adj) {\n  // TODO: Add identity self-loops, compute row degrees, and normalize by 1 / sqrt(d_i * d_j)\n}`,
      hint: 'd_i is the sum of row i in A_tilde. Entry (i, j) is A_tilde[i][j] / Math.sqrt(d_i * d_j).',
    },
    {
      step: 2,
      title: 'Topological Neighborhood Message Aggregation',
      guidance:
        'Implement aggregateNeighbors(normAdj, features) computing H_agg = A_norm · X, where H_agg[i][d] = sum_j (A_norm[i][j] * features[j][d]).',
      firstPrinciplesWhy:
        'Because addition is commutative (a + b = b + a), aggregating neighbor signals along normalized adjacency edges creates a permutation-equivariant multiset reduction.',
      starterSnippet: `function aggregateNeighbors(normAdj, features) {\n  // TODO: Multiply N x N normalized adjacency by N x d feature matrix\n}`,
      hint: 'For each node i and feature d, sum up normAdj[i][j] * features[j][d] across all j.',
    },
    {
      step: 3,
      title: 'Linear Feature Projection & ReLU Update',
      guidance:
        'Implement gcnLayer(adj, features, weights) which computes H_agg = aggregateNeighbors(normAdj, features), applies linear projection H_proj = H_agg · W, and applies ReLU activation max(0, z).',
      firstPrinciplesWhy:
        'The linear weight matrix W transforms multi-channel node features, while non-linear ReLU activation allows learning complex relational representations.',
      starterSnippet: `function gcnLayer(adj, features, weights) {\n  // TODO: Compute normalized Laplacian, aggregate, project with weights, and apply ReLU\n}`,
      hint: 'Output dimension is weights[0].length. Apply Math.max(0, val) elementwise.',
    },
    {
      step: 4,
      title: 'Permutation Equivariance Verification',
      guidance:
        'Implement verifyPermutationEquivariance(adj, features, weights, permutation) to verify that running GCN on permuted inputs P A P^T and P X yields the exact same output as permuting the original GCN output: f(P A P^T, P X) == P f(A, X).',
      firstPrinciplesWhy:
        'Renumbering the arbitrary memory indices of atoms in a molecule must not change physical predictions. This test mathematically validates the core symmetry theorem.',
      starterSnippet: `function verifyPermutationEquivariance(adj, features, weights, perm) {\n  // TODO: Permute inputs, run gcnLayer, and verify matching with permuted original output\n}`,
      hint: 'P[i][j] = 1 if perm[i] === j. Permuted feature X_p has row i equal to features[perm[i]].',
    },
  ],
  starterCode: `// LEVEL 6: BUILD A GRAPH CONVOLUTIONAL NETWORK & MESSAGE PASSING ENGINE FROM SCRATCH

/**
 * 1. Add Self-Loops and Compute Symmetrically Normalized Adjacency
 * adj: N x N adjacency matrix (binary 0 or 1)
 * Returns: N x N normalized matrix where A_norm[i][j] = (A[i][j] + delta_ij) / sqrt(d_i * d_j)
 */
function computeNormalizedLaplacian(adj) {
  const N = adj.length;

  // TODO 1.1: Create A_tilde by adding self-loops (add 1 along diagonal)
  // const adjTilde = ...

  // TODO 1.2: Compute degrees d_tilde_i = sum of row i in A_tilde
  // const degrees = ...

  // TODO 1.3: Compute normalized adjacency: A_tilde[i][j] / Math.sqrt(degrees[i] * degrees[j])
  // return adjNorm;
}

/**
 * 2. Topological Neighborhood Message Aggregation
 * normAdj: N x N normalized adjacency matrix
 * features: N x inDim node feature matrix
 * Returns: N x inDim aggregated feature matrix
 */
function aggregateNeighbors(normAdj, features) {
  const N = normAdj.length;
  const inDim = features[0].length;
  const aggregated = [];

  // TODO 2.1: Matrix multiply normAdj (N x N) by features (N x inDim)
  // For each node i and feature d: sum_{j=0}^{N-1} normAdj[i][j] * features[j][d]

  return aggregated;
}

/**
 * 3. Complete GCN Layer Forward Pass
 * adj: N x N adjacency matrix
 * features: N x inDim node features
 * weights: inDim x outDim weight projection matrix
 * Returns: N x outDim updated node features after ReLU activation
 */
function gcnLayer(adj, features, weights) {
  // TODO 3.1: Compute normalized Laplacian
  // TODO 3.2: Aggregate neighbor features
  // TODO 3.3: Multiply aggregated features by weights matrix
  // TODO 3.4: Apply ReLU activation: Math.max(0, val)

  return [];
}

/**
 * 4. Permutation Equivariance Validator
 * perm: permutation array of length N, e.g. [2, 0, 3, 1]
 * Returns: boolean indicating whether f(P A P^T, P X) === P f(A, X) within tolerance 1e-4
 */
function verifyPermutationEquivariance(adj, features, weights, perm) {
  // TODO 4.1: Compute original GCN output: H_orig = gcnLayer(adj, features, weights)
  // TODO 4.2: Construct permuted adjacency A_perm where A_perm[i][j] = adj[perm[i]][perm[j]]
  // TODO 4.3: Construct permuted features X_perm where X_perm[i] = features[perm[i]]
  // TODO 4.4: Run GCN on permuted inputs: H_perm = gcnLayer(A_perm, X_perm, weights)
  // TODO 4.5: Check if H_perm[i][d] === H_orig[perm[i]][d] within tolerance 1e-4

  return false;
}

if (typeof exports !== 'undefined') {
  exports.computeNormalizedLaplacian = computeNormalizedLaplacian;
  exports.aggregateNeighbors = aggregateNeighbors;
  exports.gcnLayer = gcnLayer;
  exports.verifyPermutationEquivariance = verifyPermutationEquivariance;
}
`,
  solutionCode: `function computeNormalizedLaplacian(adj) {
  const N = adj.length;
  const adjTilde = adj.map((row, i) =>
    row.map((val, j) => (i === j ? val + 1 : val))
  );

  const degrees = adjTilde.map((row) => row.reduce((a, b) => a + b, 0));

  const adjNorm = [];
  for (let i = 0; i < N; i++) {
    const row = [];
    for (let j = 0; j < N; j++) {
      const denom = Math.sqrt(degrees[i] * degrees[j]);
      row.push(denom > 0 ? adjTilde[i][j] / denom : 0);
    }
    adjNorm.push(row);
  }
  return adjNorm;
}

function aggregateNeighbors(normAdj, features) {
  const N = normAdj.length;
  const inDim = features[0].length;
  const aggregated = [];

  for (let i = 0; i < N; i++) {
    const row = [];
    for (let d = 0; d < inDim; d++) {
      let sum = 0;
      for (let j = 0; j < N; j++) {
        sum += normAdj[i][j] * features[j][d];
      }
      row.push(sum);
    }
    aggregated.push(row);
  }
  return aggregated;
}

function gcnLayer(adj, features, weights) {
  const normAdj = computeNormalizedLaplacian(adj);
  const agg = aggregateNeighbors(normAdj, features);

  const N = agg.length;
  const inDim = weights.length;
  const outDim = weights[0].length;

  const output = [];
  for (let i = 0; i < N; i++) {
    const row = [];
    for (let o = 0; o < outDim; o++) {
      let sum = 0;
      for (let d = 0; d < inDim; d++) {
        sum += agg[i][d] * weights[d][o];
      }
      row.push(Number(Math.max(0, sum).toFixed(5)));
    }
    output.push(row);
  }
  return output;
}

function verifyPermutationEquivariance(adj, features, weights, perm) {
  const N = adj.length;
  const origOut = gcnLayer(adj, features, weights);

  // Construct permuted adjacency A_perm = P A P^T
  const adjPerm = [];
  for (let i = 0; i < N; i++) {
    const row = [];
    for (let j = 0; j < N; j++) {
      row.push(adj[perm[i]][perm[j]]);
    }
    adjPerm.push(row);
  }

  // Construct permuted features X_perm = P X
  const featPerm = [];
  for (let i = 0; i < N; i++) {
    featPerm.push([...features[perm[i]]]);
  }

  const permOut = gcnLayer(adjPerm, featPerm, weights);

  // Verify permOut[i][d] matches origOut[perm[i]][d]
  for (let i = 0; i < N; i++) {
    for (let d = 0; d < origOut[0].length; d++) {
      const diff = Math.abs(permOut[i][d] - origOut[perm[i]][d]);
      if (diff > 1e-4) return false;
    }
  }
  return true;
}

if (typeof exports !== 'undefined') {
  exports.computeNormalizedLaplacian = computeNormalizedLaplacian;
  exports.aggregateNeighbors = aggregateNeighbors;
  exports.gcnLayer = gcnLayer;
  exports.verifyPermutationEquivariance = verifyPermutationEquivariance;
}
`,
  testCases: [
    {
      id: 'test_normalized_laplacian_with_self_loops',
      description: 'Symmetric normalized Laplacian with self-loops on 3-node path graph',
      inputDesc: '3-node path graph 0-1-2 with adjacency [[0,1,0],[1,0,1],[0,1,0]]',
      expectedDesc:
        'A_norm[0][1] = 1/sqrt(2 * 3) = 1/sqrt(6) ≈ 0.40825, A_norm[0][0] = 0.5',
      testFn: 'computeNormalizedLaplacian',
      args: [
        [
          [0, 1, 0],
          [1, 0, 1],
          [0, 1, 0],
        ],
      ],
      expected: [
        [0.5, 0.40825, 0.0],
        [0.40825, 0.33333, 0.40825],
        [0.0, 0.40825, 0.5],
      ],
      tolerance: 1e-4,
    },
    {
      id: 'test_gcn_layer_forward',
      description: 'Multi-channel GCN forward pass with linear projection & ReLU',
      inputDesc:
        '3 nodes, 2 input features X=[[1,0],[0,2],[1,1]], weights W=[[1.0, 0.5],[0.5, 1.0]]',
      expectedDesc:
        'Node 0 output: [0.90825, 1.06650], Node 1 output: [1.35395, 1.48316], Node 2 output: [1.15825, 1.56650]',
      testFn: 'gcnLayer',
      args: [
        [
          [0, 1, 0],
          [1, 0, 1],
          [0, 1, 0],
        ],
        [
          [1.0, 0.0],
          [0.0, 2.0],
          [1.0, 1.0],
        ],
        [
          [1.0, 0.5],
          [0.5, 1.0],
        ],
      ],
      expected: [
        [0.90825, 1.0665],
        [1.35395, 1.48316],
        [1.15825, 1.5665],
      ],
      tolerance: 1e-3,
    },
    {
      id: 'test_permutation_equivariance_theorem',
      description:
        'Exact permutation equivariance theorem validation f(P A P^T, P X) = P f(A, X)',
      inputDesc:
        '4-node cyclic molecule (ring 0-1-2-3-0) with shuffled vertex order [2, 0, 3, 1]',
      expectedDesc:
        'Permuted inputs yield exactly permuted outputs with difference <= 1e-4',
      testFn: 'verifyPermutationEquivariance',
      args: [
        [
          [0, 1, 0, 1],
          [1, 0, 1, 0],
          [0, 1, 0, 1],
          [1, 0, 1, 0],
        ],
        [
          [1.0, 0.2],
          [0.5, 1.5],
          [2.0, 0.0],
          [0.1, 0.8],
        ],
        [
          [0.8, -0.2],
          [0.5, 1.2],
        ],
        [2, 0, 3, 1],
      ],
      expected: true,
    },
    {
      id: 'test_degree_invariance_leaf_vs_hub',
      description:
        'Degree normalization preserves bounded activation scale between leaf & hub nodes',
      inputDesc:
        'Star graph: Node 0 is center hub with degree 4; Nodes 1-4 are leaf nodes with degree 1',
      expectedDesc:
        'Symmetric normalized Laplacian bounds hub-to-leaf ratio within stable numerical range',
      testFn: 'computeNormalizedLaplacian',
      args: [
        [
          [0, 1, 1, 1, 1],
          [1, 0, 0, 0, 0],
          [1, 0, 0, 0, 0],
          [1, 0, 0, 0, 0],
          [1, 0, 0, 0, 0],
        ],
      ],
      expected: [
        [0.2, 0.31623, 0.31623, 0.31623, 0.31623],
        [0.31623, 0.5, 0.0, 0.0, 0.0],
        [0.31623, 0.0, 0.5, 0.0, 0.0],
        [0.31623, 0.0, 0.0, 0.5, 0.0],
        [0.31623, 0.0, 0.0, 0.0, 0.5],
      ],
      tolerance: 1e-4,
    },
  ],
};

// ============================================================================
// LEVEL 7 DIY PROJECT: GENERATIVE DIFFUSION & SCORE-BASED THERMODYNAMICS
// ============================================================================
export const DIFFUSION_PROJECT: DiyProject = {
  id: 'generative',
  level: 7,
  title: 'Build a Thermodynamic Diffusion Model & Tweedie Score Denoiser from Scratch',
  architectureName: 'Ornstein-Uhlenbeck Score Diffusion & Tweedie Inversion',
  tagline:
    'Formulate cosine noise schedules, derive the forward Gaussian shortcut, and reconstruct clean signals via Tweedie’s identity and reverse Langevin dynamics.',
  difficulty: 'Mastery',
  estimatedMinutes: 50,
  prerequisites: [
    'Gaussian distributions and variance',
    'Markov chains',
    'Score matching vector fields',
  ],
  firstPrinciplesBedrock:
    'Generative Adversarial Networks (GANs) suffer from rotational Jacobian curl in zero-sum minimax games (dtheta/dt = -phi, dphi/dt = theta producing purely imaginary eigenvalues +/- i and mode collapse), while single-step VAEs blur multi-modal details under Gaussian conditional-mean penalties. Generative Diffusion treats generation as the continuous time-reversal of Brownian motion. By estimating the score field ∇_x log p_t(x) via noise prediction ε_θ, Tweedie’s formula enables exact conditional-mean reconstruction in a strictly convex L2 regression landscape with zero rotational curl and no mode collapse.',
  axiomaticRule:
    'Zero Hugging Face diffusers or external ML libraries. Pure variance scheduling arithmetic, forward Gaussian shortcuts, Tweedie inversions, and reverse Langevin stepping.',
  visualFeedbackType: 'diffusion_grid',
  milestones: [
    {
      step: 1,
      title: 'Cosine Variance Schedule (Nichol & Dhariwal 2021)',
      guidance:
        'Implement buildCosineSchedule(timesteps, s) computing cumulative product alpha_bar_t = f(t)/f(0) where f(t) = cos^2(((t/T + s)/(1 + s)) * (pi/2)), beta_t = min(1 - alpha_bar_t / alpha_bar_{t-1}, 0.999), and alpha_t = 1 - beta_t.',
      firstPrinciplesWhy:
        'Linear schedules destroy signal too rapidly in early steps. The cosine schedule drops signal smoothly, preserving mid-frequency details throughout the trajectory.',
      starterSnippet: `function buildCosineSchedule(T, s = 0.008) {\n  // TODO: Implement cosine schedule for alpha_bars, betas, and alphas\n}`,
      hint: 'Clamp beta_t to a maximum of 0.999 to prevent numerical division by zero.',
    },
    {
      step: 2,
      title: 'Closed-Form Forward Shortcut q(x_t | x_0)',
      guidance:
        'Implement qSample(x0, alphaBar, noise) computing x_t = sqrt(alphaBar) * x_0 + sqrt(1 - alphaBar) * noise for each dimension.',
      firstPrinciplesWhy:
        'By recursing Gaussian convolution, any noisy intermediate state x_t can be evaluated in O(1) time without simulating intermediate steps 1 to t-1.',
      starterSnippet: `function qSample(x0, alphaBar, noise) {\n  // TODO: Compute sqrt(alphaBar) * x0 + sqrt(1 - alphaBar) * noise\n}`,
      hint: 'Apply elementwise across input vectors: Math.sqrt(alphaBar) * x0[i] + Math.sqrt(1 - alphaBar) * noise[i].',
    },
    {
      step: 3,
      title: 'Tweedie’s Formula & Clean Signal Reconstruction',
      guidance:
        'Implement tweedieRecoverX0(xt, alphaBar, epsPred) computing x0_hat = (xt - sqrt(1 - alphaBar) * epsPred) / sqrt(alphaBar).',
      firstPrinciplesWhy:
        'By Tweedie’s formula, the posterior expectation E[x_0 | x_t] = (x_t + (1 - alphaBar) * nabla_x log p_t(x_t)) / sqrt(alphaBar). Predicting noise eps_theta is mathematically identical to estimating the score vector field nabla_x log p_t(x_t) = -eps / sqrt(1 - alphaBar)!',
      starterSnippet: `function tweedieRecoverX0(xt, alphaBar, epsPred) {\n  // TODO: Invert forward shortcut to solve for x0\n}`,
      hint: 'Direct algebraic rearrangement of the forward Gaussian shortcut equation.',
    },
    {
      step: 4,
      title: 'Reverse DDPM Langevin Micro-Step',
      guidance:
        'Implement pSampleStep(xt, epsPred, beta, alpha, alphaBar, prevAlphaBar, z) computing mean mu = (1 / sqrt(alpha)) * (xt - (beta / sqrt(1 - alphaBar)) * epsPred), variance sigma = sqrt(((1 - prevAlphaBar) / (1 - alphaBar)) * beta), and next state x_{t-1} = mu + sigma * z.',
      firstPrinciplesWhy:
        'Reverses thermodynamic diffusion step-by-step: subtracts a fraction of the predicted noise vector and injects a calibrated Brownian perturbation z to explore probability modes.',
      starterSnippet: `function pSampleStep(xt, epsPred, beta, alpha, alphaBar, prevAlphaBar, z) {\n  // TODO: Compute reverse mean mu and add scaled stochastic noise sigma * z\n}`,
      hint: 'If prevAlphaBar is 1.0 (step t=1 to t=0), sigma is 0.',
    },
    {
      step: 5,
      title: 'Monotonic Lyapunov Denoising Loss',
      guidance:
        'Implement scoreMatchingLoss(epsTarget, epsPred) computing mean squared error 1/D * sum((epsTarget_i - epsPred_i)^2).',
      firstPrinciplesWhy:
        'L2 regression forms a convex quadratic potential bowl with symmetric Hessian and zero rotational curl (curl = 0), guaranteeing monotonic energy descent and eliminating adversarial limit cycles.',
      starterSnippet: `function scoreMatchingLoss(epsTarget, epsPred) {\n  // TODO: Compute MSE between target noise and predicted noise vectors\n}`,
      hint: 'Sum squared differences and divide by vector length.',
    },
  ],
  starterCode: `// LEVEL 7: BUILD A THERMODYNAMIC DIFFUSION MODEL & TWEEDIE SCORE DENOISER FROM SCRATCH

/**
 * 1. Cosine Variance Schedule (Nichol & Dhariwal 2021)
 * T: total timesteps (e.g. 100)
 * s: small offset (default 0.008)
 * Returns: { alphas, alphasCumprod, betas } arrays of length T + 1
 */
function buildCosineSchedule(T, s = 0.008) {
  // TODO 1.1: Compute f(t) = Math.cos(((t / T + s) / (1 + s)) * (Math.PI / 2)) ** 2
  // TODO 1.2: Compute alpha_bar_t = f(t) / f(0)
  // TODO 1.3: Compute beta_t = Math.min(1 - alpha_bar_t / alpha_bar_{t-1}, 0.999)
  // TODO 1.4: Compute alpha_t = 1 - beta_t

  return { alphas: [], alphasCumprod: [], betas: [] };
}

/**
 * 2. Closed-Form Forward Diffusion Shortcut q(x_t | x_0)
 * x0: clean data array
 * alphaBar: cumulative product alpha_bar_t at step t
 * noise: standard normal noise array epsilon ~ N(0, I)
 * Returns: noisy sample array x_t = sqrt(alphaBar) * x_0 + sqrt(1 - alphaBar) * noise
 */
function qSample(x0, alphaBar, noise) {
  // TODO 2.1: Compute mean weight sqrt(alphaBar) and noise weight sqrt(1 - alphaBar)
  // TODO 2.2: Apply linear combination elementwise to each dimension

  return [];
}

/**
 * 3. Tweedie's Identity Clean Signal Recovery
 * xt: noisy sample array at step t
 * alphaBar: alpha_bar_t
 * epsPred: neural network predicted noise vector
 * Returns: estimated clean signal x0_hat = (xt - sqrt(1 - alphaBar) * epsPred) / sqrt(alphaBar)
 */
function tweedieRecoverX0(xt, alphaBar, epsPred) {
  // TODO 3.1: Subtract noise residual and scale by 1 / sqrt(alphaBar)

  return [];
}

/**
 * 4. Reverse DDPM Langevin Sampling Micro-Step
 * xt: current noisy state array
 * epsPred: neural network predicted noise
 * beta: beta_t
 * alpha: alpha_t
 * alphaBar: alpha_bar_t
 * prevAlphaBar: alpha_bar_{t-1}
 * z: random Brownian noise array (set to 0 for t=0)
 * Returns: denoised state array x_{t-1}
 */
function pSampleStep(xt, epsPred, beta, alpha, alphaBar, prevAlphaBar, z) {
  // TODO 4.1: Compute reverse mean: (1 / sqrt(alpha)) * (xt - (beta / sqrt(1 - alphaBar)) * epsPred)
  // TODO 4.2: Compute posterior variance sigma: sqrt(((1 - prevAlphaBar) / (1 - alphaBar)) * beta)
  // TODO 4.3: Return mean + sigma * z

  return [];
}

/**
 * 5. Score Matching L2 Regression Loss
 * epsTarget: actual injected noise vector
 * epsPred: model predicted noise vector
 * Returns: scalar MSE loss = (1 / D) * sum((epsTarget[i] - epsPred[i])^2)
 */
function scoreMatchingLoss(epsTarget, epsPred) {
  // TODO 5.1: Compute Mean Squared Error between target noise and predicted noise

  return 0.0;
}

/**
 * 6. Helper: Boundary Endpoints Evaluator
 * Returns: [alphasCumprod[0], alphasCumprod[T]]
 */
function getCosineEndpoints(T, s = 0.008) {
  const sched = buildCosineSchedule(T, s);
  return [sched.alphasCumprod[0], Number(sched.alphasCumprod[T].toFixed(4))];
}

if (typeof exports !== 'undefined') {
  exports.buildCosineSchedule = buildCosineSchedule;
  exports.getCosineEndpoints = getCosineEndpoints;
  exports.qSample = qSample;
  exports.tweedieRecoverX0 = tweedieRecoverX0;
  exports.pSampleStep = pSampleStep;
  exports.scoreMatchingLoss = scoreMatchingLoss;
}
`,
  solutionCode: `function buildCosineSchedule(T, s = 0.008) {
  const f = (t) => {
    const val = ((t / T + s) / (1 + s)) * (Math.PI / 2);
    return Math.cos(val) ** 2;
  };

  const f0 = f(0);
  const alphasCumprod = [];
  for (let t = 0; t <= T; t++) {
    alphasCumprod.push(f(t) / f0);
  }

  const betas = [0];
  const alphas = [1];
  for (let t = 1; t <= T; t++) {
    const rawBeta = 1 - alphasCumprod[t] / alphasCumprod[t - 1];
    const beta = Math.max(1e-5, Math.min(0.999, rawBeta));
    betas.push(Number(beta.toFixed(5)));
    alphas.push(Number((1 - beta).toFixed(5)));
  }

  return { alphas, alphasCumprod, betas };
}

function qSample(x0, alphaBar, noise) {
  const sqrtAlphaBar = Math.sqrt(alphaBar);
  const sqrtOneMinusAlphaBar = Math.sqrt(1 - alphaBar);

  return x0.map((val, i) =>
    Number((sqrtAlphaBar * val + sqrtOneMinusAlphaBar * noise[i]).toFixed(5))
  );
}

function tweedieRecoverX0(xt, alphaBar, epsPred) {
  const sqrtAlphaBar = Math.sqrt(alphaBar);
  const sqrtOneMinusAlphaBar = Math.sqrt(1 - alphaBar);

  return xt.map((val, i) =>
    Number(((val - sqrtOneMinusAlphaBar * epsPred[i]) / sqrtAlphaBar).toFixed(5))
  );
}

function pSampleStep(xt, epsPred, beta, alpha, alphaBar, prevAlphaBar, z) {
  const sqrtAlpha = Math.sqrt(alpha);
  const coeff = beta / Math.sqrt(1 - alphaBar);

  // Posterior variance sigma
  let sigma = 0;
  if (prevAlphaBar < 1.0) {
    const variance = ((1 - prevAlphaBar) / (1 - alphaBar)) * beta;
    sigma = Math.sqrt(Math.max(0, variance));
  }

  return xt.map((val, i) => {
    const mean = (1 / sqrtAlpha) * (val - coeff * epsPred[i]);
    const noiseComponent = z ? sigma * z[i] : 0;
    return Number((mean + noiseComponent).toFixed(5));
  });
}

function scoreMatchingLoss(epsTarget, epsPred) {
  const D = epsTarget.length;
  let sumSq = 0;
  for (let i = 0; i < D; i++) {
    const diff = epsTarget[i] - epsPred[i];
    sumSq += diff * diff;
  }
  return Number((sumSq / D).toFixed(5));
}

function getCosineEndpoints(T, s = 0.008) {
  const sched = buildCosineSchedule(T, s);
  return [sched.alphasCumprod[0], Number(sched.alphasCumprod[T].toFixed(4))];
}

if (typeof exports !== 'undefined') {
  exports.buildCosineSchedule = buildCosineSchedule;
  exports.getCosineEndpoints = getCosineEndpoints;
  exports.qSample = qSample;
  exports.tweedieRecoverX0 = tweedieRecoverX0;
  exports.pSampleStep = pSampleStep;
  exports.scoreMatchingLoss = scoreMatchingLoss;
}
`,
  testCases: [
    {
      id: 'test_cosine_schedule_boundaries',
      description: 'Cosine schedule preserves alpha_bar_0 ≈ 1.0 and drops smoothly to ≈ 0',
      inputDesc: 'T = 100 timesteps with s = 0.008 offset',
      expectedDesc:
        'alphasCumprod[0] = 1.0, alphasCumprod[100] ≈ 0.0000 (<= 0.01)',
      testFn: 'getCosineEndpoints',
      args: [100, 0.008],
      expected: [1.0, 0.0],
      tolerance: 0.01,
    },
    {
      id: 'test_forward_q_sample_shortcut',
      description: 'Closed-form forward Gaussian perturbation q(x_t | x_0) in O(1) time',
      inputDesc:
        'x0 = [1.0, 2.0], alphaBar = 0.64 (sqrt=0.8, noise weight=0.6), noise = [0.5, -0.5]',
      expectedDesc:
        'x_t = [0.8 * 1.0 + 0.6 * 0.5, 0.8 * 2.0 + 0.6 * (-0.5)] = [1.1, 1.3]',
      testFn: 'qSample',
      args: [[1.0, 2.0], 0.64, [0.5, -0.5]],
      expected: [1.1, 1.3],
      tolerance: 1e-4,
    },
    {
      id: 'test_tweedie_exact_inversion',
      description:
        'Tweedie’s identity exactly recovers original clean signal from noisy observation',
      inputDesc:
        'xt = [1.1, 1.3], alphaBar = 0.64, predicted noise epsPred = [0.5, -0.5]',
      expectedDesc:
        'x0_hat = ([1.1, 1.3] - 0.6 * [0.5, -0.5]) / 0.8 = [1.0, 2.0]',
      testFn: 'tweedieRecoverX0',
      args: [[1.1, 1.3], 0.64, [0.5, -0.5]],
      expected: [1.0, 2.0],
      tolerance: 1e-4,
    },
    {
      id: 'test_reverse_langevin_step',
      description:
        'Reverse DDPM Langevin micro-step updates mean and adds calibrated Brownian noise',
      inputDesc:
        'xt = [1.1, 1.3], epsPred = [0.5, -0.5], beta = 0.05, alpha = 0.95, alphaBar = 0.64, prevAlphaBar = 0.67368, z = [0, 0]',
      expectedDesc:
        'Deterministic mean step accurately subtracts noise residual toward clean data',
      testFn: 'pSampleStep',
      args: [
        [1.1, 1.3],
        [0.5, -0.5],
        0.05,
        0.95,
        0.64,
        0.67368,
        [0.0, 0.0],
      ],
      expected: [1.08573, 1.37568],
      tolerance: 1e-3,
    },
    {
      id: 'test_score_matching_loss_lyapunov',
      description:
        'Score matching L2 regression loss evaluates quadratic potential bowl',
      inputDesc:
        'epsTarget = [0.5, -0.3, 0.8, -0.2], epsPred = [0.4, -0.3, 0.9, -0.1]',
      expectedDesc:
        'MSE = ((0.1)^2 + 0^2 + (-0.1)^2 + (-0.1)^2) / 4 = 0.03 / 4 = 0.0075',
      testFn: 'scoreMatchingLoss',
      args: [
        [0.5, -0.3, 0.8, -0.2],
        [0.4, -0.3, 0.9, -0.1],
      ],
      expected: 0.0075,
      tolerance: 1e-4,
    },
  ],
};

// ============================================================================
// LEVEL 8 DIY PROJECT: NEURAL ODES & CONTINUOUS ARCHITECTURES
// ============================================================================
export const NEURAL_ODE_PROJECT: DiyProject = {
  id: 'specialized',
  level: 8,
  title: 'Build a Continuous Neural ODE & Pontryagin Adjoint Sensitivity Engine from Scratch',
  architectureName: 'Continuous Neural ODE & Reverse Adjoint Integrator',
  tagline:
    'Replace discrete layers with continuous vector fields, integrate forward trajectories with 4th-Order Runge-Kutta (RK4), and backpropagate in constant O(1) memory via continuous adjoint dynamics.',
  difficulty: 'Mastery',
  estimatedMinutes: 55,
  prerequisites: [
    'Differential equations (dh/dt = f(h))',
    'Taylor expansions',
    'Vector calculus & chain rule',
  ],
  firstPrinciplesBedrock:
    'Residual networks h_{t+1} = h_t + f(h_t) are simply 1st-order forward Euler discretizations of a continuous ordinary differential equation. Taking dt -> 0 transforms discrete layers into a continuous dynamical flow dh/dt = f(h(t), t, theta). In discrete networks, backpropagation requires storing L intermediate activation tensors in GPU memory (O(L) memory explosion). By formulating the continuous adjoint state a(t) = dL/dh(t) and integrating the augmented system backwards in time from t_1 to t_0, parameter gradients are obtained in exact O(1) activation memory, liberating training from discrete depth limits.',
  axiomaticRule:
    'Zero scipy.integrate or external ML libraries. Pure Runge-Kutta numerical integration, vector calculus, and reverse adjoint differential equations.',
  visualFeedbackType: 'continuous_flow',
  milestones: [
    {
      step: 1,
      title: '4th-Order Runge-Kutta (RK4) High-Precision Integrator',
      guidance:
        'Implement rk4Step(h, dt, f) evaluating k1 = f(h), k2 = f(h + dt/2 * k1), k3 = f(h + dt/2 * k2), k4 = f(h + dt * k4), and computing next_h = h + (dt / 6) * (k1 + 2k2 + 2k3 + k4).',
      firstPrinciplesWhy:
        'Euler integration accumulates truncation error O(dt). The classical 4th-order Runge-Kutta scheme cancels Taylor expansion error terms up to 4th order, achieving high-fidelity O(dt^4) precision.',
      starterSnippet: `function rk4Step(h, dt, f) {\n  // TODO: Compute 4 Runge-Kutta stages k1, k2, k3, k4 and weighted average\n}`,
      hint: 'For multi-dimensional state h, perform vector addition and scaling elementwise across dimensions.',
    },
    {
      step: 2,
      title: 'Continuous Forward Trajectory Integration',
      guidance:
        'Implement integrateOde(h0, t0, t1, steps, f) which computes step size dt = (t1 - t0) / steps, iteratively applies rk4Step, and returns final state and trajectory history.',
      firstPrinciplesWhy:
        'Continuous integration replaces discrete stacked layers with smooth trajectory flow through vector fields.',
      starterSnippet: `function integrateOde(h0, t0, t1, steps, f) {\n  // TODO: Step through interval [t0, t1] using rk4Step\n}`,
      hint: 'Start with current = [...h0] and loop from step 0 to steps - 1.',
    },
    {
      step: 3,
      title: 'Exact Trajectory Time-Reversibility',
      guidance:
        'Implement reverseIntegrate(h1, t1, t0, steps, f) by integrating backwards from t1 to t0 using negative step size -dt. Verify that h(t0) is reconstructed from terminal state h(t1).',
      firstPrinciplesWhy:
        'Because ODE flows are continuous diffeomorphisms, time-reversal reconstructs intermediate states backwards in time, completely eliminating the need to store activations in GPU memory during training.',
      starterSnippet: `function reverseIntegrate(h1, t1, t0, steps, f) {\n  // TODO: Integrate backwards with negative dt\n}`,
      hint: 'Negative dt = (t0 - t1) / steps automatically reverses time flow.',
    },
    {
      step: 4,
      title: 'Continuous Adjoint State Dynamics da(t)/dt = -a(t)^T J_f(h)',
      guidance:
        'Implement adjointDynamics(a, h, W) computing the reverse derivative of the adjoint state da/dt = -a^T · diag(1 - tanh^2(W h)) · W.',
      firstPrinciplesWhy:
        'By the continuous chain rule, the loss sensitivity vector a(t) = dL/dh(t) satisfies its own differential equation running backwards in time with boundary condition a(t1) = dL/dh(t1).',
      starterSnippet: `function adjointDynamics(a, h, W) {\n  // TODO: Compute Jacobian-vector product -a^T (df/dh)\n}`,
      hint: 'The derivative of tanh(u) is 1 - tanh(u)^2. Multiply by W to form the Jacobian.',
    },
    {
      step: 5,
      title: 'Constant O(1) Memory Adjoint Sensitivity Backpropagation',
      guidance:
        'Implement adjointBackward(h1, dL_dh1, t1, t0, steps, W) integrating the augmented state [h(t), a(t), dL/dW] backwards in time to return dL/dh0 and parameter gradients dL/dW in constant O(1) memory.',
      firstPrinciplesWhy:
        'Calculates exact parameter gradients without caching any intermediate activations in GPU VRAM, breaking through the memory barrier of deep architectures.',
      starterSnippet: `function adjointBackward(h1, dL_dh1, t1, t0, steps, W) {\n  // TODO: Integrate h and a backward simultaneously, accumulating dL/dW\n}`,
      hint: 'At each reverse step, accumulate dL/dW += dt * outerProduct(a, h_pre_act).',
    },
  ],
  starterCode: `// LEVEL 8: BUILD A CONTINUOUS NEURAL ODE & ADJOINT SENSITIVITY ENGINE FROM SCRATCH

/**
 * 1. 4th-Order Runge-Kutta (RK4) Step for Vector States
 * h: current hidden state array [h_0, h_1, ..., h_{d-1}]
 * dt: numerical integration step size (e.g. 0.1)
 * f: velocity vector field function f(h) returning dh/dt array
 * Returns: updated state array h_{next}
 */
function rk4Step(h, dt, f) {
  // TODO 1.1: Evaluate k1 = f(h)
  // TODO 1.2: Evaluate k2 = f(h + 0.5 * dt * k1)
  // TODO 1.3: Evaluate k3 = f(h + 0.5 * dt * k2)
  // TODO 1.4: Evaluate k4 = f(h + dt * k3)
  // TODO 1.5: Return h + (dt / 6) * (k1 + 2*k2 + 2*k3 + k4)

  return [];
}

/**
 * 2. Continuous Trajectory Integration Across [t0, t1]
 * h0: initial state array
 * t0: start time
 * t1: end time
 * steps: number of integration sub-steps
 * f: vector field function
 * Returns: { finalState, trajectory }
 */
function integrateOde(h0, t0, t1, steps, f) {
  // TODO 2.1: Compute dt = (t1 - t0) / steps
  // TODO 2.2: Loop through steps, calling rk4Step
  // TODO 2.3: Return final state array and array of trajectory checkpoints

  return { finalState: [], trajectory: [] };
}

/**
 * 3. Exact Reverse-Time Trajectory Reconstruction
 * h1: terminal state array at time t1
 * t1: end time
 * t0: initial time
 * steps: number of integration sub-steps
 * f: vector field function
 * Returns: reconstructed initial state array h0
 */
function reverseIntegrate(h1, t1, t0, steps, f) {
  // TODO 3.1: Integrate backward with negative dt = (t0 - t1) / steps
  // Returns reconstructed h0

  return [];
}

/**
 * 4. Continuous Adjoint State Dynamics da(t)/dt = -a(t)^T J_f(h)
 * a: adjoint sensitivity state vector dL/dh(t)
 * h: current hidden state vector h(t)
 * W: d x d weight matrix defining vector field f(h) = tanh(W h)
 * Returns: da/dt array
 */
function adjointDynamics(a, h, W) {
  // TODO 4.1: Compute z = W h
  // TODO 4.2: Compute diagonal activation derivative: diag(1 - tanh(z)^2)
  // TODO 4.3: Compute Jacobian J = diag * W
  // TODO 4.4: Return -a^T J

  return [];
}

/**
 * 5. Constant O(1) Memory Adjoint Sensitivity Backpropagation
 * h1: final state at terminal time t1
 * dL_dh1: initial adjoint vector at terminal time dL/dh(t1)
 * t1: terminal time
 * t0: initial time
 * steps: number of sub-steps
 * W: d x d parameter weight matrix
 * Returns: { dL_dh0, dL_dW } calculated in constant memory
 */
function adjointBackward(h1, dL_dh1, t1, t0, steps, W) {
  // TODO 5.1: Integrate h(t) backward to reconstruct past activations
  // TODO 5.2: Integrate a(t) backward using adjointDynamics
  // TODO 5.3: Accumulate parameter gradients dL/dW += -dt * (a outerProduct h)
  // TODO 5.4: Return dL_dh0 and dL_dW in O(1) activation memory

  return { dL_dh0: [], dL_dW: [] };
}

if (typeof exports !== 'undefined') {
  exports.rk4Step = rk4Step;
  exports.integrateOde = integrateOde;
  exports.reverseIntegrate = reverseIntegrate;
  exports.adjointDynamics = adjointDynamics;
  exports.adjointBackward = adjointBackward;
}
`,
  solutionCode: `function vecAdd(a, b) {
  return a.map((val, i) => val + b[i]);
}

function vecScale(a, s) {
  return a.map((val) => val * s);
}

function matVecMul(M, v) {
  return M.map((row) => row.reduce((sum, w, i) => sum + w * v[i], 0));
}

function rk4Step(h, dt, f) {
  const k1 = f(h);
  const k2 = f(vecAdd(h, vecScale(k1, 0.5 * dt)));
  const k3 = f(vecAdd(h, vecScale(k2, 0.5 * dt)));
  const k4 = f(vecAdd(h, vecScale(k3, dt)));

  const sumK = k1.map((v, i) => v + 2 * k2[i] + 2 * k3[i] + k4[i]);
  const nextH = vecAdd(h, vecScale(sumK, dt / 6));
  return nextH.map((v) => Number(v.toFixed(5)));
}

function integrateOde(h0, t0, t1, steps, f) {
  const dt = (t1 - t0) / steps;
  let current = [...h0];
  const trajectory = [[...current]];

  for (let i = 0; i < steps; i++) {
    current = rk4Step(current, dt, f);
    trajectory.push([...current]);
  }
  return { finalState: current, trajectory };
}

function reverseIntegrate(h1, t1, t0, steps, f) {
  const dt = (t0 - t1) / steps;
  let current = [...h1];

  for (let i = 0; i < steps; i++) {
    current = rk4Step(current, dt, f);
  }
  return current;
}

function adjointDynamics(a, h, W) {
  const d = h.length;
  const z = matVecMul(W, h);
  const diagGrad = z.map((val) => 1 - Math.tanh(val) ** 2);

  // Jacobian J[i][j] = diagGrad[i] * W[i][j]
  // Vector-Jacobian product a^T J: for each col j, sum_i a[i] * diagGrad[i] * W[i][j]
  const da_dt = [];
  for (let j = 0; j < d; j++) {
    let sum = 0;
    for (let i = 0; i < d; i++) {
      sum += a[i] * diagGrad[i] * W[i][j];
    }
    da_dt.push(Number((-sum).toFixed(5)));
  }
  return da_dt;
}

function adjointBackward(h1, dL_dh1, t1, t0, steps, W) {
  const d = h1.length;
  const dt = (t1 - t0) / steps;
  let h = [...h1];
  let a = [...dL_dh1];

  // Initialize parameter gradient accumulator dL_dW
  const dL_dW = Array(d)
    .fill(0)
    .map(() => Array(d).fill(0));

  const f = (state) => matVecMul(W, state).map((val) => Math.tanh(val));

  for (let step = 0; step < steps; step++) {
    // 1. Reconstruct previous h by stepping backward with -dt
    const hPrev = rk4Step(h, -dt, f);

    // 2. Accumulate parameter gradient using midpoint approximation
    const z = matVecMul(W, h);
    const diagGrad = z.map((val) => 1 - Math.tanh(val) ** 2);

    for (let i = 0; i < d; i++) {
      for (let j = 0; j < d; j++) {
        // dL/dW_ij = -int a_i * (1 - tanh(z_i)^2) * h_j dt
        dL_dW[i][j] += dt * (a[i] * diagGrad[i] * h[j]);
      }
    }

    // 3. Step adjoint state backward: a_prev = a - dt * (da/dt)
    const da = adjointDynamics(a, h, W);
    a = vecAdd(a, vecScale(da, -dt)).map((v) => Number(v.toFixed(5)));

    h = hPrev;
  }

  const dL_dW_rounded = dL_dW.map((row) =>
    row.map((val) => Number(val.toFixed(5)))
  );

  return { dL_dh0: a, dL_dW: dL_dW_rounded };
}

if (typeof exports !== 'undefined') {
  exports.rk4Step = rk4Step;
  exports.integrateOde = integrateOde;
  exports.reverseIntegrate = reverseIntegrate;
  exports.adjointDynamics = adjointDynamics;
  exports.adjointBackward = adjointBackward;
}
`,
  testCases: [
    {
      id: 'test_rk4_superior_precision_over_euler',
      description:
        'RK4 4th-order scheme achieves >100x higher precision than forward Euler on decay dh/dt = -h',
      inputDesc:
        'h(0) = [1.0], dt = 0.5, true analytic solution exp(-0.5) ≈ 0.60653. Euler yields 0.5 (17.5% error)',
      expectedDesc:
        'RK4 yields h(0.5) = 0.60677 with absolute error <= 0.0003 (< 0.05% error)',
      testFn: 'rk4Step',
      args: [[1.0], 0.5, (h: number[]) => [-h[0]]],
      expected: [0.60677],
      tolerance: 1e-4,
    },
    {
      id: 'test_continuous_forward_integration',
      description:
        'Integrate 2D nonlinear neural vector field dh/dt = tanh(W h) across t in [0, 1]',
      inputDesc:
        'h0 = [0.5, -0.5], W = [[0.8, -0.4], [0.4, 0.8]], 5 integration steps over [0, 1]',
      expectedDesc:
        'Smooth continuous flow rotates and dampens coordinates into stable phase orbit',
      testFn: 'integrateOde',
      args: [
        [0.5, -0.5],
        0.0,
        1.0,
        5,
        (h: number[]) => {
          const W = [
            [0.8, -0.4],
            [0.4, 0.8],
          ];
          return [
            Math.tanh(W[0][0] * h[0] + W[0][1] * h[1]),
            Math.tanh(W[1][0] * h[0] + W[1][1] * h[1]),
          ];
        },
      ],
      expected: {
        finalState: [1.20162, -0.63329],
      },
      tolerance: 1e-3,
    },
    {
      id: 'test_exact_trajectory_time_reversibility',
      description:
        'Continuous time-reversal reconstructs initial state h(t0) from terminal state h(t1) with zero stored activations',
      inputDesc:
        'Terminal state h1 = [1.20162, -0.63329], integrated backwards from t1=1.0 to t0=0.0',
      expectedDesc:
        'Reconstructs initial state h0 = [0.5, -0.5] within tolerance 1e-3',
      testFn: 'reverseIntegrate',
      args: [
        [1.20162, -0.63329],
        1.0,
        0.0,
        5,
        (h: number[]) => {
          const W = [
            [0.8, -0.4],
            [0.4, 0.8],
          ];
          return [
            Math.tanh(W[0][0] * h[0] + W[0][1] * h[1]),
            Math.tanh(W[1][0] * h[0] + W[1][1] * h[1]),
          ];
        },
      ],
      expected: [0.5, -0.5],
      tolerance: 1e-3,
    },
    {
      id: 'test_continuous_adjoint_gradient',
      description:
        'Pontryagin adjoint sensitivity calculates exact gradient dL/dh0 in constant O(1) memory',
      inputDesc:
        'Terminal state h1=[0.8, 0.5], loss gradient dL/dh1=[1.0, 1.0], integrated backward over [1.0, 0.0]',
      expectedDesc:
        'Adjoint vector backward dynamics matches continuous sensitivity flow',
      testFn: 'adjointDynamics',
      args: [
        [1.0, 1.0],
        [0.8, 0.5],
        [
          [0.5, 0.2],
          [0.2, 0.5],
        ],
      ],
      expected: [-0.56304, -0.58183],
      tolerance: 1e-3,
    },
  ],
};
