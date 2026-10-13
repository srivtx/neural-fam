/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Theory Physical Simulation Canvas:
 * An interactive, real-time HTML5 Canvas simulator demonstrating the core
 * physical metaphors and first-principles mechanisms of modern AI:
 * 1. Quantum Electron Bandgap (Quantization & the Physical Bit)
 * 2. Thermodynamic Entropy Dissolution & Reversal (Diffusion Score-Matching)
 * 3. Content-Addressable Attention Beam (Dynamic QK^T Query-Key routing)
 * 4. High-Dimensional Orthogonality & Measure Concentration (Dirac Collapse)
 * 5. Neural ODE Continuous Vector Field Flow (Picard-Lindelöf Invertibility & Adjoint)
 * 6. Loss Landscape & Saddle Point Escape (Curvature, Momentum & Langevin Dynamics)
 * 7. Grokking Fourier Frequency Emergence & Phase Transition (Modular Circuits)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Atom,
  Flame,
  Network,
  Compass,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Info,
  GitFork,
  Mountain,
  Radio,
  Shield,
  Gauge,
  Scale,
  Layers,
  ArrowRightLeft,
  Activity,
} from 'lucide-react';
import { soundFX } from '../utils/audio';
import { MathView } from './MathView';

export type SimMode =
  | 'thermodynamic'
  | 'quantum'
  | 'attention'
  | 'geometry'
  | 'neural_ode'
  | 'saddle_escape'
  | 'grokking'
  | 'superposition';

export const DIMENSION_OPTIONS = [2, 3, 10, 50, 100, 4096] as const;
export type Dimension = (typeof DIMENSION_OPTIONS)[number];

// =============================================================================
// FIRST-PRINCIPLES DOSSIER DATA STRUCTURE
// =============================================================================

export interface FirstPrinciplesSimDossier {
  modeName: string;
  tagline: string;
  invariant: {
    title: string;
    equation: string;
    explanation: string;
  };
  force: {
    title: string;
    equation: string;
    explanation: string;
  };
  normalizer: {
    title: string;
    equation: string;
    explanation: string;
  };
  conservationLaw: {
    title: string;
    equation: string;
    explanation: string;
  };
}

export const FIRST_PRINCIPLES_SIM_DOSSIERS: Record<SimMode, FirstPrinciplesSimDossier> = {
  thermodynamic: {
    modeName: 'Thermodynamic Diffusion & Score Matching',
    tagline: 'Brownian Entropy Dissolution and Exact Time-Reversal via the Stein Score',
    invariant: {
      title: 'Fokker-Planck Density Evolution',
      equation: '\\frac{\\partial p_t(x)}{\\partial t} = -\\nabla \\cdot (f(x, t) p_t(x)) + \\frac{1}{2} g^2(t) \\nabla^2 p_t(x)',
      explanation:
        'Total probability measure is strictly conserved across time under the Kolmogorov forward equation, continuously dissipating semantic structure into an isotropic Gaussian heat bath.',
    },
    force: {
      title: 'Stein Score Gradient Vector Field',
      equation: '\\mathbf{s}_\\theta(x, t) = \\nabla_x \\log p_t(x)',
      explanation:
        'The score function exerts an attractive conservative gradient force that pulls dispersed thermal particles back toward high-density data modes on the underlying data manifold.',
    },
    normalizer: {
      title: 'Variance-Preserving Noise Schedule',
      equation: '\\alpha_t^2 + \\sigma_t^2 = 1, \\quad \\text{SNR}(t) = \\frac{\\alpha_t^2}{\\sigma_t^2}',
      explanation:
        'Normalizes total signal-plus-noise variance to unit trace at every intermediate timestep, preventing numerical explosion across continuous reverse-time trajectory integration.',
    },
    conservationLaw: {
      title: 'Second Law of Thermodynamics & Entropy Reversal',
      equation: '\\Delta S_{\\text{forward}} \\ge 0 \\iff \\frac{dx}{dt} = f(x,t) - \\frac{1}{2}g^2(t)\\nabla_x \\log p_t(x)',
      explanation:
        'While the Second Law mandates entropy increase forward in time, the reverse-time Langevin SDE exactly negates entropy production via learned empirical Fisher score information.',
    },
  },

  quantum: {
    modeName: 'Quantum Semiconductor Bandgap',
    tagline: 'Sub-Nanometer Electron Confinement and the Thermodynamic Cost of Bit Flips',
    invariant: {
      title: 'Forbidden Crystal Bandgap Eg',
      equation: 'E_g = 1.12\\text{ eV} \\quad (\\text{Silicon at } T = 300\\text{ K})',
      explanation:
        'The periodic atomic lattice of silicon establishes a forbidden quantum energy zone between the valence band (bit 0) and the conduction band (bit 1), preventing thermal bit flips.',
    },
    force: {
      title: 'Electrostatic Gate Potential',
      equation: '\\mathbf{F} = -q \\nabla \\phi = -q \\mathcal{E}_{\\text{gate}}',
      explanation:
        'The gate electric field exerts Coulomb force, tilting the band structure and lowering the effective potential barrier to trigger channel conduction.',
    },
    normalizer: {
      title: 'Thermal Voltage Scale',
      equation: 'V_T = \\frac{k_B T}{q} \\approx 25.86\\text{ mV}',
      explanation:
        'Sets the thermodynamic subthreshold swing limit (60 mV/decade) below which transistor subthreshold leakage current cannot be silenced without cryogenic cooling.',
    },
    conservationLaw: {
      title: 'Landauer Thermodynamic Limit',
      equation: 'E_{\\text{erase}} \\ge k_B T \\ln 2 \\approx 2.87 \\times 10^{-21}\\text{ J}',
      explanation:
        'Erasing one bit of physical information necessarily dissipates at least kB*T*ln(2) of heat into the environment, coupling abstract information theory to non-equilibrium thermodynamics.',
    },
  },

  attention: {
    modeName: 'Dynamic Content-Addressable Attention Beam',
    tagline: 'Bilinear Metric Query-Key Routing on the Unit Simplex',
    invariant: {
      title: 'Simplex Convex Hull Mass',
      equation: '\\sum_{j=1}^N \\alpha_{ij} = 1, \\quad \\alpha_{ij} \\ge 0',
      explanation:
        'Every contextual output vector is guaranteed to lie strictly inside the convex hull formed by the Value token vectors, preserving representation scale across deep layers.',
    },
    force: {
      title: 'Bilinear Inner Product Affinity',
      equation: 'A_{ij} = \\frac{\\mathbf{q}_i^T \\mathbf{k}_j}{\\sqrt{d_k}}',
      explanation:
        'The dot product measures geometric alignment in learned latent space, pulling attention weight toward maximally correlated semantic keys.',
    },
    normalizer: {
      title: 'Dimension Variance Normalizer',
      equation: '\\tau = \\sqrt{d_k} \\implies \\text{Var}\\left(\\frac{\\mathbf{q}^T \\mathbf{k}}{\\sqrt{d_k}}\\right) = 1',
      explanation:
        'Normalizes the inner product variance back to unit scale, preventing the Softmax function from saturating into near-zero gradients in high dimensions.',
    },
    conservationLaw: {
      title: 'Routing Capacity Conservation',
      equation: '\\text{Tr}(\\mathbf{A}) \\le N, \\quad \\mathbf{y}_i = \\sum_j \\text{Softmax}(A_{ij}) \\mathbf{v}_j',
      explanation:
        'Attention does not create semantic mass; it conserves total routing capacity by redistributing fixed contextual focus across tokens.',
    },
  },

  geometry: {
    modeName: 'High-Dimensional Measure Concentration',
    tagline: "Levy's Lemma and the Dirac Collapse of Random Embeddings to Orthogonality",
    invariant: {
      title: 'Equatorial Belt Concentration',
      equation: '\\mathbb{P}\\left(|\\cos \\theta| > \\varepsilon\\right) \\le 2\\exp\\left(-\\frac{d \\cdot \\varepsilon^2}{2}\\right)',
      explanation:
        'Almost the entirety of a high-dimensional hypersphere surface area is concentrated within an equatorial slab of microscopic thickness epsilon.',
    },
    force: {
      title: 'Uniform Haar Hypersphere Measure',
      equation: 'd\\mu(v) = \\frac{\\Gamma(d/2)}{2\\pi^{d/2}} \\delta(\\|v\\|_2 - 1) dv',
      explanation:
        'Isotropic geometric density forces uniform dispersion across all d orthogonal basis dimensions simultaneously.',
    },
    normalizer: {
      title: 'Cosine Variance Normalizer',
      equation: '\\text{Var}(\\cos \\theta) = \\frac{1}{d}, \\quad \\sigma = \\frac{1}{\\sqrt{d}}',
      explanation:
        'As d approaches 4096 (modern LLMs), angular variance shrinks to 0.00024, locking random vectors into 90° ± 0.9° orthogonality.',
    },
    conservationLaw: {
      title: 'Quasi-Orthogonal Channel Capacity',
      equation: 'N_{\\text{orthogonal}} \\approx \\exp\\left(c \\cdot d \\cdot \\varepsilon^2\\right) \\gg d',
      explanation:
        'In d dimensions, one can fit exponentially many almost-orthogonal vectors, allowing billions of concepts to coexist in a transformer with near-zero interference.',
    },
  },

  neural_ode: {
    modeName: 'Continuous Invertible Vector Field Flow',
    tagline: 'Picard-Lindelöf Diffeomorphisms and Constant Memory Adjoint Sensitivity',
    invariant: {
      title: 'Topological Invertibility & Non-Crossing',
      equation: '\\det\\left(\\frac{\\partial \\Phi_t}{\\partial z_0}\\right) = \\exp\\left(\\int_0^t \\text{div}(f(z(\\tau), \\tau)) d\\tau\\right) > 0',
      explanation:
        'Under a smooth Lipschitz velocity field, trajectory curves can never intersect or collide. The continuous transformation is an exact diffeomorphism that untangles non-linear data without topological tearing.',
    },
    force: {
      title: 'Autonomous Neural Velocity Field',
      equation: '\\frac{dz(t)}{dt} = f_\\theta(z(t), t)',
      explanation:
        'The parameterized neural network acts as a continuous velocity field driving states through latent phase space rather than jumping discrete layers.',
    },
    normalizer: {
      title: 'Lipschitz Regularity & Step-Size',
      equation: '\\|f_\\theta(z_1) - f_\\theta(z_2)\\| \\le L \\|z_1 - z_2\\|, \\quad \\Delta t \\le \\frac{2}{L}',
      explanation:
        'Enforces finite velocity gradients across space, ensuring numerical ODE integrators (RK4, Dormand-Prince) converge with bounded truncation error.',
    },
    conservationLaw: {
      title: 'Adjoint State & O(1) Memory Conservation',
      equation: '\\frac{da(t)}{dt} = -a(t)^T \\frac{\\partial f(z(t), t, \\theta)}{\\partial z}, \\quad \\text{Memory} = \\mathcal{O}(1)',
      explanation:
        'By integrating the adjoint sensitivity state backward in time alongside reversed dynamics, gradients are computed exactly without storing any intermediate forward activations in RAM.',
    },
  },

  saddle_escape: {
    modeName: '3D Loss Landscape & Skip-Connection Homotopy',
    tagline: 'Li et al. Filter-Normalized Convexification & Dauphin High-Dimensional Saddle Escape',
    invariant: {
      title: 'Homotopy Convexification Invariant',
      equation: 'f(\\alpha, x) = (1 - \\alpha) L_{\\text{chaotic}}(x) + \\alpha L_{\\text{convex}}(x), \\quad y = x + F(x)',
      explanation:
        'Identity skip connections act as an architectural homotopy that smooths non-convex fractal barriers into an open convex funnel where gradient flows unimpeded.',
    },
    force: {
      title: 'Hessian Negative Curvature & Heavy-Ball Momentum',
      equation: '\\mathbf{v}_{t+1} = \\beta \\mathbf{v}_t - \\eta \\nabla f(\\mathbf{x}_t) + \\sigma \\sqrt{\\eta} \\boldsymbol{\\xi}_t, \\quad \\lambda_{\\min} < 0',
      explanation:
        'While vanilla SGD halts at flat saddles, momentum accumulates kinetic energy and thermal Langevin kicks fling the state down the negative curvature escape chute.',
    },
    normalizer: {
      title: 'Dauphin High-Dimensional Saddle Ratio',
      equation: '\\frac{N_{\\text{minima}}}{N_{\\text{saddle}}} \\sim \\mathcal{O}(2^{-d}), \\quad \\kappa = \\frac{\\lambda_{\\max}}{|\\lambda_{\\min}|}',
      explanation:
        'As dimension d scales to 100+, the probability that all d Hessian eigenvalues are positive drops exponentially as 2^-d. True local minima vanish; critical points are almost universally saddles.',
    },
    conservationLaw: {
      title: 'Phase Space Kinetic Energy Dissipation',
      equation: '\\frac{d}{dt}\\left(\\frac{1}{2}\\|v\\|^2 + f(x)\\right) = -\\gamma \\|v\\|^2 + \\text{noise}',
      explanation:
        'Heavy-ball optimization is isomorphic to a physical particle with mass rolling down a potential well. Stored momentum enables tunneling past narrow chaotic ravines.',
    },
  },

  grokking: {
    modeName: 'Fourier Frequency Emergence & Phase Transition',
    tagline: 'Weight Decay Regularization Driving Abrupt Generalization Cliffs',
    invariant: {
      title: 'Discrete Fourier Group Symmetry',
      equation: '\\mathcal{F}[W](\\omega) = \\sum_{x \\in \\mathbb{Z}_p} W(x) e^{-i 2\\pi \\omega x / p}',
      explanation:
        'The underlying algorithmic task (modular arithmetic) is governed by cyclic group representations. Generalization corresponds to weights collapsing onto exact Fourier harmonics.',
    },
    force: {
      title: 'Weight Decay Pruning Pressure',
      equation: '\\dot{\\mathbf{W}} = -\\nabla_W L_{\\text{task}} - \\lambda \\mathbf{W}',
      explanation:
        'L2 weight decay acts as a constant centripetal compression force, pruning noisy high-capacity memorization circuits and forcing the network to discover the minimal Fourier circuit.',
    },
    normalizer: {
      title: 'Weight Norm Budget Horizon',
      equation: '\\|\\mathbf{W}\\|_2^2 \\le \\frac{2 C_{\\text{param}}}{\\lambda}, \\quad t_{\\text{crit}} \\propto \\frac{1}{\\lambda \\cdot \\sqrt{\\text{DataRedundancy}} }',
      explanation:
        'Sets the critical timescale t_crit. If weight decay lambda is zero, the model memorizes forever; with sufficient lambda, the weight norm contracts until the generalization phase transition ignites.',
    },
    conservationLaw: {
      title: 'Thermodynamic Free Energy Minimization',
      equation: 'F = \\langle L \\rangle - T \\cdot S(W) \\implies \\text{Phase Transition at } t_{\\text{crit}}',
      explanation:
        'Grokking is a first-order phase transition in parameter space, moving from a high-entropy disordered memorization state to an ordered, low-entropy crystalline Fourier circuit.',
    },
  },

  superposition: {
    modeName: 'The Superposition Paradox (High-Dimensional Sparse Coding)',
    tagline: 'Anthropic Toy Models of Superposition, Welch Bound, and Overcomplete Polytopes',
    invariant: {
      title: 'Welch Mutual Coherence Lower Bound',
      equation: '\\mu(W) = \\max_{i \\neq j} |\\mathbf{w}_i^T \\mathbf{w}_j| \\ge \\sqrt{\\frac{M - d}{d(M - 1)}}',
      explanation:
        'Any dictionary of M unit features embedded into a d-dimensional bottleneck must exhibit mutual cross-interference lower-bounded by the Welch bound. Features pack into antipodal pairs or regular simplex polytopes on the hypersphere.',
    },
    force: {
      title: 'Non-Linear ReLU Sparse Reconstruction',
      equation: '\\hat{x}_i = \\text{ReLU}\\left(x_i + \\sum_{j \\neq i} (\\mathbf{w}_i^T \\mathbf{w}_j) x_j - b_i\\right)',
      explanation:
        'Because individual concepts in LLMs activate sparsely (p << 1), the cross-interference term stays below threshold b with high probability. Non-linear ReLU completely filters out interference, yielding lossless retrieval.',
    },
    normalizer: {
      title: 'Sparsity Collision Horizon',
      equation: '\\mathbb{P}(\\text{interference collision}) \\sim \\mathcal{O}\\left(\\frac{p^2 M^2}{d}\\right), \\quad S = 1 - p',
      explanation:
        'As sparsity S approaches 1.0 (p -> 0), the chance of two correlated features co-activating simultaneously shrinks to zero, allowing thousands of concepts to coexist safely in a few hundred dimensions.',
    },
    conservationLaw: {
      title: 'Overcomplete Polytope Channel Capacity',
      equation: 'M_{\\text{features}} \\gg d_{\\text{bottleneck}}, \\quad \\mathcal{L}_{\\text{MSE}} = \\frac{1}{M}\\|x - \\hat{x}\\|^2 \\to 0',
      explanation:
        'Superposition breaks the linear capacity limit M <= d. By exploiting the sparsity of human knowledge, deep neural networks achieve exponentially higher concept density per unit parameter.',
    },
  },
};

// =============================================================================
// GEOMETRY SIMULATION LOGIC
// =============================================================================

export type GeometrySubMode = 'equator' | 'shell' | 'distance';
export type GeometryZoomMode = 'adaptive' | 'global';

export interface GeometryData {
  dimension: number;
  sampleCount: number;
  vectors: Float32Array[];

  // 1. Orthogonality & Equator Belt (Levy's Lemma)
  cosineSimilarities: number[];
  mean: number;
  variance: number;
  stdDev: number;
  theoryVariance: number;
  equatorBeltProb: number;
  theoryEquatorBeltProb: number;
  tailProb: number;
  histogram: number[];
  binCenters: number[];
  maxBinCount: number;
  adaptiveHistogram: number[];
  adaptiveBinCenters: number[];
  maxAdaptiveBinCount: number;
  adaptiveRange: number;
  totalPairs: number;
  projectedCoords: {
    x: number;
    y: number;
    z: number;
    cosWithU0: number;
    thetaDeg: number;
    isEquator: boolean;
  }[];

  // 2. Shell Volume Concentration (The Orange Peel)
  shellRadii: number[];
  meanRadius: number;
  theoryMeanRadius: number;
  outerShellFraction: number;
  theoryOuterShellFraction: number;
  radiusHistogram: number[];
  radiusBinCenters: number[];
  maxRadiusBinCount: number;
  shellSampleCoords: {
    x: number;
    y: number;
    z: number;
    r: number;
    isShell: boolean;
  }[];

  // 3. Pairwise Distance Concentration
  pairwiseDistances: number[];
  meanDistance: number;
  varDistance: number;
  theoryDistance: number;
  theoryVarDistance: number;
  distHistogram: number[];
  distBinCenters: number[];
  maxDistBinCount: number;
}

function sampleUnitSphereVector(d: number): Float32Array {
  const vec = new Float32Array(d);
  let normSq = 0;
  for (let i = 0; i < d; i++) {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const g = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    vec[i] = g;
    normSq += g * g;
  }
  const invNorm = 1 / Math.sqrt(normSq || 1e-12);
  for (let i = 0; i < d; i++) {
    vec[i] *= invNorm;
  }
  return vec;
}

function computeGeometrySimulation(d: number, n: number): GeometryData {
  const vectors: Float32Array[] = [];
  for (let i = 0; i < n; i++) {
    vectors.push(sampleUnitSphereVector(d));
  }

  const u0 = vectors[0];
  const w1 = new Float32Array(d);
  const w2 = new Float32Array(d);

  if (d === 2) {
    w1[0] = -u0[1];
    w1[1] = u0[0];
  } else {
    const r1 = sampleUnitSphereVector(d);
    let dot1 = 0;
    for (let i = 0; i < d; i++) dot1 += r1[i] * u0[i];
    let normSq1 = 0;
    for (let i = 0; i < d; i++) {
      w1[i] = r1[i] - dot1 * u0[i];
      normSq1 += w1[i] * w1[i];
    }
    const invNorm1 = 1 / Math.sqrt(normSq1 || 1e-12);
    for (let i = 0; i < d; i++) w1[i] *= invNorm1;

    const r2 = sampleUnitSphereVector(d);
    let dot2_u = 0;
    let dot2_w = 0;
    for (let i = 0; i < d; i++) {
      dot2_u += r2[i] * u0[i];
      dot2_w += r2[i] * w1[i];
    }
    let normSq2 = 0;
    for (let i = 0; i < d; i++) {
      w2[i] = r2[i] - dot2_u * u0[i] - dot2_w * w1[i];
      normSq2 += w2[i] * w2[i];
    }
    const invNorm2 = 1 / Math.sqrt(normSq2 || 1e-12);
    for (let i = 0; i < d; i++) w2[i] *= invNorm2;
  }

  const maxProj = Math.min(n, 160);
  const projectedCoords: GeometryData['projectedCoords'] = [];

  for (let i = 0; i < maxProj; i++) {
    const v = vectors[i];
    let cosWithU0 = 0;
    let projX = 0;
    let projY = 0;
    for (let k = 0; k < d; k++) {
      cosWithU0 += v[k] * u0[k];
      projX += v[k] * w1[k];
      projY += v[k] * w2[k];
    }
    cosWithU0 = Math.max(-1, Math.min(1, cosWithU0));
    const rPerp = Math.sqrt(Math.max(0, 1 - cosWithU0 * cosWithU0));
    const xyNorm = Math.sqrt(projX * projX + projY * projY);

    let x = 0;
    let y = 0;
    if (d === 2) {
      x = rPerp * (projX >= 0 ? 1 : -1);
      y = 0;
    } else {
      x = xyNorm > 1e-7 ? (projX / xyNorm) * rPerp : rPerp;
      y = xyNorm > 1e-7 ? (projY / xyNorm) * rPerp : 0;
    }
    const z = cosWithU0;
    const thetaDeg = Math.acos(cosWithU0) * (180 / Math.PI);
    const isEquator = Math.abs(cosWithU0) <= 0.05;

    projectedCoords.push({
      x,
      y,
      z,
      cosWithU0,
      thetaDeg,
      isEquator,
    });
  }

  const similarities: number[] = [];
  const pairwiseDistances: number[] = [];
  const maxPairs = 10000;
  const totalPossiblePairs = (n * (n - 1)) / 2;

  if (totalPossiblePairs <= maxPairs) {
    for (let i = 0; i < n; i++) {
      const vi = vectors[i];
      for (let j = i + 1; j < n; j++) {
        const vj = vectors[j];
        let dot = 0;
        for (let k = 0; k < d; k++) dot += vi[k] * vj[k];
        dot = Math.max(-1, Math.min(1, dot));
        similarities.push(dot);
        pairwiseDistances.push(Math.sqrt(Math.max(0, 2 - 2 * dot)));
      }
    }
  } else {
    for (let p = 0; p < maxPairs; p++) {
      const i = Math.floor(Math.random() * n);
      let j = Math.floor(Math.random() * (n - 1));
      if (j >= i) j++;
      const vi = vectors[i];
      const vj = vectors[j];
      let dot = 0;
      for (let k = 0; k < d; k++) dot += vi[k] * vj[k];
      dot = Math.max(-1, Math.min(1, dot));
      similarities.push(dot);
      pairwiseDistances.push(Math.sqrt(Math.max(0, 2 - 2 * dot)));
    }
  }

  const numPairs = similarities.length;
  let sumCos = 0;
  let sumSqCos = 0;
  let equatorCount = 0;

  let sumDist = 0;
  let sumSqDist = 0;

  for (let i = 0; i < numPairs; i++) {
    const s = similarities[i];
    sumCos += s;
    sumSqCos += s * s;
    if (Math.abs(s) <= 0.05) {
      equatorCount++;
    }

    const dist = pairwiseDistances[i];
    sumDist += dist;
    sumSqDist += dist * dist;
  }

  const mean = sumCos / (numPairs || 1);
  const variance = Math.max(0, sumSqCos / (numPairs || 1) - mean * mean);
  const stdDev = Math.sqrt(variance);
  const equatorBeltProb = equatorCount / (numPairs || 1);
  const tailProb = 1 - equatorBeltProb;
  const theoryVariance = 1 / d;
  const theoryEquatorBeltProb = Math.max(0, 1 - 2 * Math.exp((-d * 0.05 * 0.05) / 2));

  const numBins = 50;
  const histogram = new Array(numBins).fill(0);
  const binCenters = new Array(numBins);
  const binWidth = 2.0 / numBins;
  for (let b = 0; b < numBins; b++) {
    binCenters[b] = -1.0 + (b + 0.5) * binWidth;
  }

  let maxBinCount = 0;
  for (let i = 0; i < numPairs; i++) {
    const s = similarities[i];
    const binIdx = Math.min(numBins - 1, Math.max(0, Math.floor(((s + 1.0) / 2.0) * numBins)));
    histogram[binIdx]++;
    if (histogram[binIdx] > maxBinCount) {
      maxBinCount = histogram[binIdx];
    }
  }

  const adaptiveRange = Math.max(0.06, Math.min(1.0, 4 / Math.sqrt(d)));
  const adaptiveHistogram = new Array(numBins).fill(0);
  const adaptiveBinCenters = new Array(numBins);
  const adaptiveBinWidth = (2 * adaptiveRange) / numBins;
  for (let b = 0; b < numBins; b++) {
    adaptiveBinCenters[b] = -adaptiveRange + (b + 0.5) * adaptiveBinWidth;
  }
  let maxAdaptiveBinCount = 0;
  for (let i = 0; i < numPairs; i++) {
    const s = similarities[i];
    if (s >= -adaptiveRange && s <= adaptiveRange) {
      const binIdx = Math.min(
        numBins - 1,
        Math.max(0, Math.floor(((s + adaptiveRange) / (2 * adaptiveRange)) * numBins))
      );
      adaptiveHistogram[binIdx]++;
      if (adaptiveHistogram[binIdx] > maxAdaptiveBinCount) {
        maxAdaptiveBinCount = adaptiveHistogram[binIdx];
      }
    }
  }

  // Shell volume concentration: sample radii inside solid unit ball
  const shellRadii: number[] = [];
  const shellSampleCoords: GeometryData['shellSampleCoords'] = [];
  let sumR = 0;
  let outerShellCount = 0;

  for (let i = 0; i < maxProj; i++) {
    const u = Math.random();
    const r = Math.pow(u, 1 / d);
    shellRadii.push(r);
    sumR += r;
    const isShell = r >= 0.95;
    if (isShell) outerShellCount++;

    const base = projectedCoords[i];
    shellSampleCoords.push({
      x: base.x * r,
      y: base.y * r,
      z: base.z * r,
      r,
      isShell,
    });
  }

  const meanRadius = sumR / maxProj;
  const theoryMeanRadius = d / (d + 1);
  const outerShellFraction = outerShellCount / maxProj;
  const theoryOuterShellFraction = 1 - Math.pow(0.95, d);

  const numRadiusBins = 30;
  const radiusHistogram = new Array(numRadiusBins).fill(0);
  const radiusBinCenters = new Array(numRadiusBins);
  let maxRadiusBinCount = 0;
  for (let b = 0; b < numRadiusBins; b++) {
    radiusBinCenters[b] = (b + 0.5) / numRadiusBins;
  }
  for (let i = 0; i < maxProj; i++) {
    const r = shellRadii[i];
    const binIdx = Math.min(numRadiusBins - 1, Math.max(0, Math.floor(r * numRadiusBins)));
    radiusHistogram[binIdx]++;
    if (radiusHistogram[binIdx] > maxRadiusBinCount) {
      maxRadiusBinCount = radiusHistogram[binIdx];
    }
  }

  // Pairwise distance concentration
  const meanDistance = sumDist / (numPairs || 1);
  const varDistance = Math.max(0, sumSqDist / (numPairs || 1) - meanDistance * meanDistance);
  const theoryDistance = Math.SQRT2;
  const theoryVarDistance = 1 / (2 * d);

  const numDistBins = 40;
  const distHistogram = new Array(numDistBins).fill(0);
  const distBinCenters = new Array(numDistBins);
  let maxDistBinCount = 0;
  for (let b = 0; b < numDistBins; b++) {
    distBinCenters[b] = ((b + 0.5) / numDistBins) * 2.0;
  }
  for (let i = 0; i < numPairs; i++) {
    const dist = pairwiseDistances[i];
    const binIdx = Math.min(numDistBins - 1, Math.max(0, Math.floor((dist / 2.0) * numDistBins)));
    distHistogram[binIdx]++;
    if (distHistogram[binIdx] > maxDistBinCount) {
      maxDistBinCount = distHistogram[binIdx];
    }
  }

  return {
    dimension: d,
    sampleCount: n,
    vectors,
    cosineSimilarities: similarities,
    mean,
    variance,
    stdDev,
    theoryVariance,
    equatorBeltProb,
    theoryEquatorBeltProb,
    tailProb,
    histogram,
    binCenters,
    maxBinCount: Math.max(1, maxBinCount),
    adaptiveHistogram,
    adaptiveBinCenters,
    maxAdaptiveBinCount: Math.max(1, maxAdaptiveBinCount),
    adaptiveRange,
    totalPairs: numPairs,
    projectedCoords,

    shellRadii,
    meanRadius,
    theoryMeanRadius,
    outerShellFraction,
    theoryOuterShellFraction,
    radiusHistogram,
    radiusBinCenters,
    maxRadiusBinCount: Math.max(1, maxRadiusBinCount),
    shellSampleCoords,

    pairwiseDistances,
    meanDistance,
    varDistance,
    theoryDistance,
    theoryVarDistance,
    distHistogram,
    distBinCenters,
    maxDistBinCount: Math.max(1, maxDistBinCount),
  };
}

// =============================================================================
// NEURAL ODE DATA & STREAMLINES
// =============================================================================

interface OdePoint {
  id: number;
  classLabel: 0 | 1;
  u: number;
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;
  jitterX: number;
  jitterY: number;
}

interface OdeStreamline {
  x: number;
  y: number;
  trail: { x: number; y: number }[];
  life: number;
  maxLife: number;
}

function createOdePoints(): OdePoint[] {
  const points: OdePoint[] = [];
  const perClass = 55;

  for (let c = 0; c < 2; c++) {
    for (let i = 0; i < perClass; i++) {
      const u = (i + 1) / perClass;
      const angle = 2.5 * Math.PI * u + (c === 1 ? Math.PI : 0);
      const r = 0.18 + 0.70 * u;
      const jx = (Math.random() - 0.5) * 0.05;
      const jy = (Math.random() - 0.5) * 0.05;

      const ox = r * Math.cos(angle);
      const oy = r * Math.sin(angle);

      // Target separated clusters at t=1:
      // Class 0 on left (x in [-0.9, -0.3]), Class 1 on right (x in [0.3, 0.9])
      const tx = c === 0 ? -0.58 + (Math.random() - 0.5) * 0.25 : 0.58 + (Math.random() - 0.5) * 0.25;
      const ty = (u - 0.5) * 1.1 + (Math.random() - 0.5) * 0.15;

      points.push({
        id: c * perClass + i,
        classLabel: c as 0 | 1,
        u,
        originX: ox,
        originY: oy,
        targetX: tx,
        targetY: ty,
        jitterX: jx,
        jitterY: jy,
      });
    }
  }
  return points;
}

function getOdeVelocity(x: number, y: number, t: number): { vx: number; vy: number } {
  // Smooth time-dependent velocity field v(x, y, t)
  // At t=0: swirling vortex that unwinds spiral
  // At t=1: laminar outward separating drift along x
  const rotWeight = Math.max(0, 1 - t * 0.9);
  const sepWeight = t * 1.4;

  const vxRot = -1.6 * y * rotWeight;
  const vyRot = 1.6 * x * rotWeight;

  const vxSep = (x >= 0 ? 1 : -1) * sepWeight * 0.75;
  const vySep = -0.4 * y * sepWeight;

  return {
    vx: vxRot + vxSep,
    vy: vyRot + vySep,
  };
}

function getOdePointPosition(p: OdePoint, t: number): { x: number; y: number } {
  // Analytical flow trajectory diffeomorphism matching the smooth vector field
  const s = 3 * t * t - 2 * t * t * t;
  const unwindAngle = -2.2 * Math.PI * p.u * t;
  const cosA = Math.cos(unwindAngle);
  const sinA = Math.sin(unwindAngle);

  const rotX = p.originX * cosA - p.originY * sinA;
  const rotY = p.originX * sinA + p.originY * cosA;

  const curX = (1 - s) * rotX + s * p.targetX + (1 - s) * p.jitterX * (1 - t * 0.5);
  const curY = (1 - s) * rotY + s * p.targetY + (1 - s) * p.jitterY * (1 - t * 0.5);

  return { x: curX, y: curY };
}

// =============================================================================
// SUPERPOSITION SIMULATION LOGIC
// =============================================================================

export function generateSuperpositionWeights(M: number, d: number): number[][] {
  const W: number[][] = [];
  if (d === 2) {
    if (M === 2) {
      W.push([1, 0]);
      W.push([0, 1]);
    } else if (M === 3) {
      // 120-degree Mercedes-Benz star
      for (let i = 0; i < 3; i++) {
        const theta = (i * 2 * Math.PI) / 3;
        W.push([Math.cos(theta), Math.sin(theta)]);
      }
    } else if (M % 2 === 0) {
      // Antipodal pairs
      const pairs = M / 2;
      for (let i = 0; i < pairs; i++) {
        const theta = (i * Math.PI) / pairs;
        W.push([Math.cos(theta), Math.sin(theta)]);
        W.push([-Math.cos(theta), -Math.sin(theta)]);
      }
    } else {
      for (let i = 0; i < M; i++) {
        const theta = (i * 2 * Math.PI) / M;
        W.push([Math.cos(theta), Math.sin(theta)]);
      }
    }
  } else {
    // d >= 3: Deterministic pseudo-random hypersphere embedding + Thomson repulsion relaxation
    for (let i = 0; i < M; i++) {
      const vec: number[] = [];
      let normSq = 0;
      for (let k = 0; k < d; k++) {
        const val = Math.sin((i + 1) * 12.9898 + (k + 1) * 78.233);
        vec.push(val);
        normSq += val * val;
      }
      const norm = Math.sqrt(normSq) || 1;
      W.push(vec.map((v) => v / norm));
    }

    // Thomson repulsion relaxation to distribute vectors uniformly over S^{d-1}
    for (let iter = 0; iter < 18; iter++) {
      for (let i = 0; i < M; i++) {
        const grad: number[] = new Array(d).fill(0);
        for (let j = 0; j < M; j++) {
          if (i === j) continue;
          let dot = 0;
          for (let k = 0; k < d; k++) dot += W[i][k] * W[j][k];
          for (let k = 0; k < d; k++) {
            grad[k] += 2 * dot * W[j][k];
          }
        }
        let normSq = 0;
        for (let k = 0; k < d; k++) {
          W[i][k] -= 0.04 * grad[k];
          normSq += W[i][k] * W[i][k];
        }
        const norm = Math.sqrt(normSq) || 1;
        for (let k = 0; k < d; k++) W[i][k] /= norm;
      }
    }
  }
  return W;
}

export function computeGramMatrix(W: number[][]): number[][] {
  const M = W.length;
  const G: number[][] = [];
  for (let i = 0; i < M; i++) {
    G[i] = [];
    for (let j = 0; j < M; j++) {
      let dot = 0;
      for (let k = 0; k < W[i].length; k++) {
        dot += W[i][k] * W[j][k];
      }
      G[i][j] = dot;
    }
  }
  return G;
}

export function computeWelchBound(M: number, d: number): number {
  if (M <= d) return 0;
  return Math.sqrt((M - d) / (d * (M - 1)));
}

export function sampleSparseInput(M: number, sparsity: number): number[] {
  const x = new Array(M).fill(0);
  let activeCount = 0;
  for (let i = 0; i < M; i++) {
    if (Math.random() < sparsity) {
      x[i] = 0.55 + Math.random() * 0.65;
      activeCount++;
    }
  }
  if (activeCount === 0) {
    const pick = Math.floor(Math.random() * M);
    x[pick] = 0.85;
  }
  return x;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  energyLevel?: number;
  targetX?: number;
  targetY?: number;
}

export const TheoryPhysicalSimCanvas: React.FC = () => {
  const [mode, setMode] = useState<SimMode>('neural_ode');
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Thermodynamic (Diffusion) Controls
  const [diffusionNoise, setDiffusionNoise] = useState<number>(0.5);
  const [reverseDrift, setReverseDrift] = useState<boolean>(false);
  const [entropyLevel, setEntropyLevel] = useState<number>(0);

  // Quantum Controls
  const [thermalTemp, setThermalTemp] = useState<number>(300);
  const [electricField, setElectricField] = useState<number>(1.0);

  // Attention Controls
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number>(8);
  const [softmaxTemp, setSoftmaxTemp] = useState<number>(1.0);

  // High-Dimensional Geometry Controls
  const [dimension, setDimension] = useState<Dimension>(50);
  const [sampleCount, setSampleCount] = useState<number>(120);
  const [geomSubMode, setGeomSubMode] = useState<GeometrySubMode>('equator');
  const [geomZoomMode, setGeomZoomMode] = useState<GeometryZoomMode>('adaptive');
  const [resampleTrigger, setResampleTrigger] = useState<number>(0);
  const geomAngleRef = useRef<number>(0);
  const geomPitchRef = useRef<number>(0.35);
  const geomYawRef = useRef<number>(0.0);
  const isDraggingGeomRef = useRef<boolean>(false);
  const dragStartGeomRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Neural ODE Controls
  const [odeTime, setOdeTime] = useState<number>(0.0);
  const [odeReverse, setOdeReverse] = useState<boolean>(false);
  const [odeSpeed, setOdeSpeed] = useState<number>(0.4);
  const [odeSolver, setOdeSolver] = useState<'rk4' | 'euler'>('rk4');
  const odeTimeRef = useRef<number>(0.0);
  const odePointsRef = useRef<OdePoint[]>(createOdePoints());
  const odeStreamlinesRef = useRef<OdeStreamline[]>([]);

  // Loss Landscape & Saddle Escape Controls (Li et al. & Dauphin et al.)
  const [residualAlpha, setResidualAlpha] = useState<number>(0.35);
  const [landscapeDim, setLandscapeDim] = useState<number>(12);
  const [saddleMomentum, setSaddleMomentum] = useState<number>(0.9);
  const [saddleLr, setSaddleLr] = useState<number>(0.08);
  const [saddleNoise, setSaddleNoise] = useState<number>(0.06);
  const [saddleCurvature, setSaddleCurvature] = useState<number>(1.0);
  const saddleVanillaPosRef = useRef<{ x: number; y: number }>({ x: 0.04, y: 0.015 });
  const saddleVanillaTrailRef = useRef<{ x: number; y: number }[]>([]);
  const saddleMomentumPosRef = useRef<{ x: number; y: number }>({ x: 0.04, y: 0.015 });
  const saddleMomentumVelRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const saddleMomentumTrailRef = useRef<{ x: number; y: number }[]>([]);
  const saddleStepRef = useRef<number>(0);
  const saddleAngleRef = useRef<number>(-0.75);
  const saddlePitchRef = useRef<number>(0.55);
  const saddleYawRef = useRef<number>(-0.65);

  // Superposition Paradox Controls (Anthropic Toy Models & Welch Bound)
  const [superpositionM, setSuperpositionM] = useState<number>(12);
  const [superpositionD, setSuperpositionD] = useState<number>(2);
  const [superpositionSparsity, setSuperpositionSparsity] = useState<number>(0.12);
  const [superpositionThreshold, setSuperpositionThreshold] = useState<number>(0.16);
  const superpositionYawRef = useRef<number>(0.0);
  const superpositionPitchRef = useRef<number>(0.35);
  const superpositionInputsRef = useRef<number[]>(sampleSparseInput(12, 0.12));
  const superpositionWeightsRef = useRef<number[][]>(generateSuperpositionWeights(12, 2));
  const superpositionTimerRef = useRef<number>(0);

  // Unified Mouse & Touch Dragging State
  const isDraggingCanvasRef = useRef<boolean>(false);
  const dragStartCanvasRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Grokking Controls
  const [grokkingStep, setGrokkingStep] = useState<number>(0);
  const [grokkingWeightDecay, setGrokkingWeightDecay] = useState<number>(0.35);
  const [grokkingDataRedundancy, setGrokkingDataRedundancy] = useState<number>(0.5);
  const grokkingStepRef = useRef<number>(0);
  const grokkingCelebratedRef = useRef<boolean>(false);

  const geomData = useMemo(() => {
    return computeGeometrySimulation(dimension, sampleCount);
  }, [dimension, sampleCount, resampleTrigger]);

  const geomDataRef = useRef<GeometryData>(geomData);
  useEffect(() => {
    geomDataRef.current = geomData;
  }, [geomData]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  const tokens = [
    { word: 'The', role: 'det', keyVector: [0.1, 0.1] },
    { word: 'animal', role: 'subject', keyVector: [0.9, 0.8] },
    { word: 'did', role: 'aux', keyVector: [0.2, 0.1] },
    { word: 'not', role: 'neg', keyVector: [0.3, 0.2] },
    { word: 'cross', role: 'verb', keyVector: [0.6, 0.4] },
    { word: 'the', role: 'det', keyVector: [0.1, 0.1] },
    { word: 'street', role: 'object', keyVector: [0.4, 0.9] },
    { word: 'because', role: 'conj', keyVector: [0.3, 0.3] },
    { word: 'it', role: 'pronoun', keyVector: [0.85, 0.75] },
    { word: 'was', role: 'copula', keyVector: [0.2, 0.2] },
    { word: 'tired', role: 'adj', keyVector: [0.8, 0.6] },
  ];

  // Initialize particles & simulation state for mode
  const initModeState = (currentMode: SimMode, width: number, height: number) => {
    const list: Particle[] = [];
    const count = currentMode === 'thermodynamic' ? 180 : currentMode === 'quantum' ? 40 : 25;

    if (currentMode === 'thermodynamic') {
      const centerX = width / 2;
      const centerY = height / 2;
      for (let i = 0; i < count; i++) {
        const radius = i < 80 ? 45 + (i % 3) * 15 : i < 140 ? 95 + (i % 4) * 10 : 135;
        const angle = (i / count) * Math.PI * 4 + (i % 5) * 0.2;
        const ox = centerX + Math.cos(angle) * radius;
        const oy = centerY + Math.sin(angle) * radius;
        list.push({
          x: ox,
          y: oy,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          originX: ox,
          originY: oy,
        });
      }
    } else if (currentMode === 'quantum') {
      for (let i = 0; i < count; i++) {
        const ox = width * 0.15 + (i / count) * (width * 0.7) + (Math.random() - 0.5) * 20;
        const inConduction = Math.random() < 0.15;
        const oy = inConduction
          ? height * 0.32 + (Math.random() - 0.5) * 25
          : height * 0.72 + (Math.random() - 0.5) * 25;
        list.push({
          x: ox,
          y: oy,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 0.5,
          originX: ox,
          originY: oy,
          energyLevel: inConduction ? 1 : 0,
        });
      }
    } else if (currentMode === 'neural_ode') {
      // Initialize 40 streamline ribbons
      const ribbons: OdeStreamline[] = [];
      for (let i = 0; i < 40; i++) {
        ribbons.push({
          x: (Math.random() - 0.5) * 2.2,
          y: (Math.random() - 0.5) * 1.8,
          trail: [],
          life: Math.random() * 80,
          maxLife: 60 + Math.random() * 60,
        });
      }
      odeStreamlinesRef.current = ribbons;
    } else if (currentMode === 'saddle_escape') {
      saddleVanillaPosRef.current = { x: 0.85, y: 0.95 };
      saddleVanillaTrailRef.current = [];
      saddleMomentumPosRef.current = { x: 0.85, y: 0.95 };
      saddleMomentumVelRef.current = { x: 0, y: 0 };
      saddleMomentumTrailRef.current = [];
      saddleStepRef.current = 0;
    } else if (currentMode === 'grokking') {
      grokkingStepRef.current = 0;
      setGrokkingStep(0);
      grokkingCelebratedRef.current = false;
    } else if (currentMode === 'superposition') {
      superpositionWeightsRef.current = generateSuperpositionWeights(superpositionM, superpositionD);
      superpositionInputsRef.current = sampleSparseInput(superpositionM, superpositionSparsity);
      superpositionTimerRef.current = 0;
    }

    particlesRef.current = list;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    initModeState(mode, canvas.width, canvas.height);
  }, [mode]);

  // Main Canvas Render Loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();
    let frameCounter = 0;

    const render = (time: number) => {
      const dt = Math.min(32, time - lastTime) / 16;
      lastTime = time;
      frameCounter++;

      const w = canvas.width;
      const h = canvas.height;

      // Dark canvas clear with fade trail
      ctx.fillStyle =
        mode === 'geometry' || mode === 'grokking'
          ? '#090810'
          : mode === 'thermodynamic' && reverseDrift
          ? 'rgba(10, 8, 14, 0.25)'
          : mode === 'saddle_escape'
          ? 'rgba(8, 7, 14, 0.35)'
          : mode === 'neural_ode'
          ? 'rgba(10, 8, 18, 0.38)'
          : 'rgba(12, 10, 18, 0.35)';
      ctx.fillRect(0, 0, w, h);

      // =======================================================================
      // 1. THERMODYNAMIC SIMULATION (DIFFUSION & SCORE MATCHING REVERSAL)
      // =======================================================================
      if (mode === 'thermodynamic') {
        const particles = particlesRef.current;
        let totalDispersion = 0;

        particles.forEach((p, idx) => {
          if (isRunning) {
            if (reverseDrift) {
              const dx = p.originX - p.x;
              const dy = p.originY - p.y;
              p.vx = p.vx * 0.85 + dx * 0.08;
              p.vy = p.vy * 0.85 + dy * 0.08;
            } else {
              const noiseScale = diffusionNoise * 2.2;
              p.vx += (Math.random() - 0.5) * noiseScale;
              p.vy += (Math.random() - 0.5) * noiseScale;
              p.vx *= 0.96;
              p.vy *= 0.96;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            if (p.x < 10) {
              p.x = 10;
              p.vx *= -0.8;
            }
            if (p.x > w - 10) {
              p.x = w - 10;
              p.vx *= -0.8;
            }
            if (p.y < 10) {
              p.y = 10;
              p.vy *= -0.8;
            }
            if (p.y > h - 10) {
              p.y = h - 10;
              p.vy *= -0.8;
            }
          }

          const distFromOrigin = Math.hypot(p.x - p.originX, p.y - p.originY);
          totalDispersion += distFromOrigin;

          for (let j = idx + 1; j < Math.min(idx + 12, particles.length); j++) {
            const p2 = particles[j];
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 45) {
              const alpha = (1 - dist / 45) * 0.45;
              ctx.strokeStyle = reverseDrift
                ? `rgba(67, 83, 255, ${alpha})`
                : `rgba(255, 138, 0, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, reverseDrift ? 2.5 : 2.0, 0, Math.PI * 2);
          ctx.fillStyle = reverseDrift ? '#60a5fa' : '#f59e0b';
          ctx.shadowColor = reverseDrift ? '#3b82f6' : '#d97706';
          ctx.shadowBlur = reverseDrift ? 8 : 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        const meanEntropy = Math.min(100, Math.round((totalDispersion / (particles.length || 1)) * 0.8));
        setEntropyLevel(meanEntropy);

        ctx.font = '12px JetBrains Mono, monospace';
        ctx.fillStyle = reverseDrift ? '#93c5fd' : '#fcd34d';
        ctx.fillText(
          reverseDrift
            ? '⇄ REVERSE LANGEVIN SCORE MATCHING (∇_x log p(x) Active)'
            : '→ FORWARD BROWNIAN DIFFUSION (Entropy Maximizing)',
          24,
          32
        );
      }

      // =======================================================================
      // 2. QUANTUM ELECTRON BANDGAP SIMULATION
      // =======================================================================
      else if (mode === 'quantum') {
        const particles = particlesRef.current;
        const yCond = h * 0.32;
        const yVal = h * 0.72;
        const gapH = yVal - yCond;

        ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
        ctx.fillRect(w * 0.1, yCond - 40, w * 0.8, 55);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.35)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(w * 0.1, yCond - 40, w * 0.8, 55);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
        ctx.fillRect(w * 0.1, yCond + 15, w * 0.8, gapH - 50);
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
        ctx.fillRect(w * 0.1, yVal - 15, w * 0.8, 55);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.strokeRect(w * 0.1, yVal - 15, w * 0.8, 55);

        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = '#60a5fa';
        ctx.fillText('CONDUCTION BAND (Free Mobile Electrons · Bit "1")', w * 0.12, yCond - 20);

        ctx.fillStyle = '#f87171';
        ctx.fillText('FORBIDDEN BANDGAP Eg = 1.12 eV (Quantum Forbidden Zone)', w * 0.12, (yCond + yVal) / 2);

        ctx.fillStyle = '#34d399';
        ctx.fillText('VALENCE BAND (Tightly Bound Valence Electrons · Bit "0")', w * 0.12, yVal + 28);

        particles.forEach((p) => {
          if (isRunning) {
            const thermalJumpProb = (thermalTemp / 1200) * 0.008;
            if (p.energyLevel === 0 && Math.random() < thermalJumpProb) {
              p.energyLevel = 1;
              p.vy = -3.5;
            } else if (p.energyLevel === 1 && Math.random() < 0.006) {
              p.energyLevel = 0;
              p.vy = 3.5;
            }

            if (p.energyLevel === 1) {
              p.vx = electricField * 1.8 + (Math.random() - 0.5) * 1.5;
            } else {
              p.vx = (Math.random() - 0.5) * 0.8;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            const targetY = p.energyLevel === 1 ? yCond - 10 : yVal + 10;
            p.y += (targetY - p.y) * 0.08;

            if (p.x < w * 0.12) p.x = w * 0.88;
            if (p.x > w * 0.88) p.x = w * 0.12;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.energyLevel === 1 ? 3.5 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.energyLevel === 1 ? '#93c5fd' : '#10b981';
          ctx.shadowColor = p.energyLevel === 1 ? '#3b82f6' : '#059669';
          ctx.shadowBlur = p.energyLevel === 1 ? 10 : 3;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // =======================================================================
      // 3. CONTENT-ADDRESSABLE ATTENTION BEAM SIMULATION
      // =======================================================================
      else if (mode === 'attention') {
        const queryToken = tokens[selectedTokenIndex];
        const numTokens = tokens.length;
        const startX = w * 0.1;
        const stepX = (w * 0.8) / (numTokens - 1);
        const tokenY = h * 0.65;
        const queryY = h * 0.22;

        const dotProducts = tokens.map((t) => {
          const dot = queryToken.keyVector[0] * t.keyVector[0] + queryToken.keyVector[1] * t.keyVector[1];
          return dot / Math.SQRT2;
        });

        const expScores = dotProducts.map((s) => Math.exp(s / Math.max(0.1, softmaxTemp)));
        const sumExp = expScores.reduce((acc, v) => acc + v, 0);
        const attentionWeights = expScores.map((v) => v / sumExp);

        const qX = startX + selectedTokenIndex * stepX;

        ctx.beginPath();
        ctx.arc(qX, queryY, 12, 0, Math.PI * 2);
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(`Q: "${queryToken.word}"`, qX, queryY - 20);

        tokens.forEach((t, i) => {
          const tX = startX + i * stepX;
          const weight = attentionWeights[i];

          ctx.beginPath();
          ctx.moveTo(qX, queryY);
          ctx.lineTo(tX, tokenY);
          const beamWidth = Math.max(0.5, weight * 8);
          ctx.lineWidth = beamWidth;
          ctx.strokeStyle = `rgba(244, 63, 94, ${Math.max(0.1, weight * 0.95)})`;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(tX, tokenY, 10 + weight * 12, 0, Math.PI * 2);
          ctx.fillStyle = weight > 0.3 ? '#8b5cf6' : '#374151';
          ctx.fill();

          ctx.font = `${weight > 0.3 ? 'bold ' : ''}11px JetBrains Mono, monospace`;
          ctx.fillStyle = weight > 0.3 ? '#a78bfa' : '#9ca3af';
          ctx.fillText(t.word, tX, tokenY + 26);

          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillStyle = weight > 0.3 ? '#34d399' : '#6b7280';
          ctx.fillText(`${(weight * 100).toFixed(1)}%`, tX, tokenY + 40);
        });
      }

      // =======================================================================
      // 4. HIGH-DIMENSIONAL GEOMETRY SIMULATION (FIRST PRINCIPLES)
      // =======================================================================
      else if (mode === 'geometry') {
        const gData = geomDataRef.current;
        if (isRunning) {
          geomAngleRef.current += 0.006 * dt;
        }
        const rot = geomAngleRef.current;
        const totalYaw = geomYawRef.current + rot;
        const pitch = geomPitchRef.current;

        const cosY = Math.cos(totalYaw), sinY = Math.sin(totalYaw);
        const cosP = Math.cos(pitch), sinP = Math.sin(pitch);

        const fHeading = 'bold 12px JetBrains Mono, monospace';
        const fSub = '10px JetBrains Mono, monospace';
        const fSmall = '9px JetBrains Mono, monospace';

        const cx = w * 0.22;
        const cy = h * 0.54;
        const R = Math.min(w * 0.16, h * 0.35);

        // 3D perspective projection helper: yaw around Z, pitch around X
        const project3D = (x: number, y: number, z: number) => {
          const rx1 = x * cosY - y * sinY;
          const ry1 = x * sinY + y * cosY;
          const rz1 = z;

          const rx2 = rx1;
          const ry2 = ry1 * cosP - rz1 * sinP;
          const rz2 = ry1 * sinP + rz1 * cosP;

          const depthScale = 1 / (1 - rz2 * 0.25);
          return {
            sx: cx + rx2 * R * depthScale,
            sy: cy - ry2 * R * depthScale,
            depth: rz2,
            scale: depthScale,
          };
        };

        // Header Title above 3D Globe
        ctx.textAlign = 'center';
        ctx.font = fHeading;
        ctx.fillStyle = '#38bdf8';
        if (geomSubMode === 'equator') {
          ctx.fillText(`HYPERSPHERE S^{${dimension - 1}} · LEVY EQUATORIAL BELT`, cx, cy - R - 22);
        } else if (geomSubMode === 'shell') {
          ctx.fillText(`SOLID BALL B^{${dimension}} · THE ORANGE PEEL PARADOX`, cx, cy - R - 22);
        } else {
          ctx.fillText(`METRIC SPACE ℝ^{${dimension}} · PAIRWISE DISTANCE COLLAPSE`, cx, cy - R - 22);
        }

        ctx.font = fSub;
        ctx.fillStyle = '#94a3b8';
        if (geomSubMode === 'equator') {
          ctx.fillText(
            dimension === 4096
              ? 'Dirac Spike: 100% of vectors locked within 90° ± 0.9° Equator'
              : `Dimension d = ${dimension} · Equator Belt [−0.05, +0.05] Concentration`,
            cx,
            cy - R - 8
          );
        } else if (geomSubMode === 'shell') {
          ctx.fillText(
            `Solid Unit Ball: ${(gData.outerShellFraction * 100).toFixed(1)}% of volume in outer 5% crust (Theory: ${(gData.theoryOuterShellFraction * 100).toFixed(1)}%)`,
            cx,
            cy - R - 8
          );
        } else {
          ctx.fillText(
            `Loss of Nearest-Neighbor Contrast: All points equidistant at D → √2 (1.4142)`,
            cx,
            cy - R - 8
          );
        }

        // 3D Sphere Background Globe
        const discGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        discGrad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
        discGrad.addColorStop(0.75, 'rgba(15, 23, 42, 0.75)');
        discGrad.addColorStop(1, 'rgba(30, 41, 59, 0.95)');
        ctx.fillStyle = discGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();

        // 3D Wireframe Latitudes & Longitudes
        ctx.lineWidth = 1;
        const numLatRings = 5;
        for (let l = 1; l < numLatRings; l++) {
          const latAngle = ((l / numLatRings) - 0.5) * Math.PI;
          const latZ = Math.sin(latAngle);
          const latR = Math.cos(latAngle);

          ctx.beginPath();
          ctx.strokeStyle = Math.abs(latZ) < 0.1 ? 'rgba(52, 211, 153, 0.45)' : 'rgba(255, 255, 255, 0.08)';
          ctx.setLineDash(Math.abs(latZ) < 0.1 ? [] : [2, 4]);

          const steps = 40;
          for (let s = 0; s <= steps; s++) {
            const phi = (s / steps) * Math.PI * 2;
            const pt = project3D(latR * Math.cos(phi), latR * Math.sin(phi), latZ);
            if (s === 0) ctx.moveTo(pt.sx, pt.sy);
            else ctx.lineTo(pt.sx, pt.sy);
          }
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Outer Sphere Horizon Rim
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();

        // ---------------------------------------------------------------------
        // SUB-MODE 1: LEVY'S LEMMA EQUATORIAL BELT
        // ---------------------------------------------------------------------
        if (geomSubMode === 'equator') {
          // Glowing Emerald Ribbon for Equatorial Belt [-0.05, +0.05]
          const beltHalf = 0.05;
          const steps = 48;
          ctx.beginPath();
          for (let s = 0; s <= steps; s++) {
            const phi = (s / steps) * Math.PI * 2;
            const rBase = Math.sqrt(1 - beltHalf * beltHalf);
            const pt = project3D(rBase * Math.cos(phi), rBase * Math.sin(phi), beltHalf);
            if (s === 0) ctx.moveTo(pt.sx, pt.sy);
            else ctx.lineTo(pt.sx, pt.sy);
          }
          for (let s = steps; s >= 0; s--) {
            const phi = (s / steps) * Math.PI * 2;
            const rBase = Math.sqrt(1 - beltHalf * beltHalf);
            const pt = project3D(rBase * Math.cos(phi), rBase * Math.sin(phi), -beltHalf);
            ctx.lineTo(pt.sx, pt.sy);
          }
          ctx.closePath();
          ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // North Pole Reference u0 = (0, 0, 1)
          const pNorth = project3D(0, 0, 1);
          const pOrigin = project3D(0, 0, 0);

          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#d97706';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(pOrigin.sx, pOrigin.sy);
          ctx.lineTo(pNorth.sx, pNorth.sy);
          ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.beginPath();
          ctx.arc(pNorth.sx, pNorth.sy, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#fbbf24';
          ctx.fill();

          ctx.font = 'bold 10px JetBrains Mono, monospace';
          ctx.fillStyle = '#fbbf24';
          ctx.textAlign = 'left';
          ctx.fillText('u₀ (North Pole)', pNorth.sx + 7, pNorth.sy + 3);

          // Render Projected Points with Depth Sorting
          const projList = gData.projectedCoords;
          const renderedPoints = projList.slice(1).map((p, idx) => {
            const pt = project3D(p.x, p.y, p.z);
            return { ...p, ...pt, origIdx: idx + 1 };
          });

          // Sort back-to-front
          renderedPoints.sort((a, b) => a.depth - b.depth);

          // Vector rays from origin to first 25 points
          for (let i = 0; i < Math.min(25, renderedPoints.length); i++) {
            const p = renderedPoints[i];
            ctx.beginPath();
            ctx.moveTo(pOrigin.sx, pOrigin.sy);
            ctx.lineTo(p.sx, p.sy);
            ctx.strokeStyle = p.isEquator
              ? 'rgba(52, 211, 153, 0.22)'
              : 'rgba(167, 139, 250, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Points
          for (let i = 0; i < renderedPoints.length; i++) {
            const p = renderedPoints[i];
            const isFront = p.depth > 0;
            const ptRadius = p.isEquator ? (isFront ? 3.0 : 2.0) : (isFront ? 2.2 : 1.5);
            const alpha = isFront ? 0.95 : 0.45;

            ctx.beginPath();
            ctx.arc(p.sx, p.sy, ptRadius, 0, Math.PI * 2);
            if (p.isEquator) {
              ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
              if (isFront) {
                ctx.shadowColor = '#10b981';
                ctx.shadowBlur = 4;
              }
              ctx.fill();
              ctx.shadowBlur = 0;
            } else {
              ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`;
              ctx.fill();
            }
          }

          // Angle θ arc for vector v1
          if (projList.length > 1) {
            const v1 = projList[1];
            const p1 = project3D(v1.x, v1.y, v1.z);

            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(pOrigin.sx, pOrigin.sy);
            ctx.lineTo(p1.sx, p1.sy);
            ctx.stroke();
            ctx.shadowBlur = 0;

            const midX = (pNorth.sx + p1.sx) / 2;
            const midY = (pNorth.sy + p1.sy) / 2;
            ctx.font = 'bold 10px JetBrains Mono, monospace';
            ctx.fillStyle = '#34d399';
            ctx.textAlign = 'center';
            ctx.fillText(`θ = ${v1.thetaDeg.toFixed(1)}°`, midX, midY - 6);
          }
        }

        // ---------------------------------------------------------------------
        // SUB-MODE 2: THE ORANGE PEEL PARADOX (RADIAL VOLUME CONCENTRATION)
        // ---------------------------------------------------------------------
        else if (geomSubMode === 'shell') {
          // Inner core sphere boundary at r = 0.95 * R
          const rInner = R * 0.95;
          ctx.beginPath();
          ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
          ctx.beginPath();
          ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = fSmall;
          ctx.fillStyle = 'rgba(245, 158, 11, 0.75)';
          ctx.textAlign = 'center';
          ctx.fillText('Outer 5% Crust (r ≥ 0.95)', cx, cy - R + 14);

          // Project sampled solid ball points
          const shellPoints = gData.shellSampleCoords.map((p) => {
            const pt = project3D(p.x, p.y, p.z);
            return { ...p, ...pt };
          });
          shellPoints.sort((a, b) => a.depth - b.depth);

          for (let i = 0; i < shellPoints.length; i++) {
            const p = shellPoints[i];
            const isFront = p.depth > 0;
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, p.isShell ? (isFront ? 3.2 : 2.2) : (isFront ? 2.0 : 1.4), 0, Math.PI * 2);
            if (p.isShell) {
              ctx.fillStyle = isFront ? '#f59e0b' : 'rgba(245, 158, 11, 0.6)';
              if (isFront) {
                ctx.shadowColor = '#d97706';
                ctx.shadowBlur = 5;
              }
              ctx.fill();
              ctx.shadowBlur = 0;
            } else {
              ctx.fillStyle = isFront ? 'rgba(100, 116, 139, 0.5)' : 'rgba(71, 85, 105, 0.3)';
              ctx.fill();
            }
          }

          // Interior Void Callout
          if (dimension >= 50) {
            ctx.font = 'bold 9px JetBrains Mono, monospace';
            ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
            ctx.fillText('INTERIOR VOID: NO VOLUME', cx, cy);
          }
        }

        // ---------------------------------------------------------------------
        // SUB-MODE 3: PAIRWISE DISTANCE COLLAPSE (||u - v|| -> √2)
        // ---------------------------------------------------------------------
        else {
          // Render points and connecting distance constellation chords
          const pts = gData.projectedCoords.map((p) => {
            const pt = project3D(p.x, p.y, p.z);
            return { ...p, ...pt };
          });

          // Draw random distance chords between first 20 pairs
          ctx.lineWidth = 1;
          for (let i = 0; i < Math.min(18, pts.length); i++) {
            for (let j = i + 1; j < Math.min(i + 4, pts.length); j++) {
              ctx.strokeStyle = 'rgba(6, 182, 212, 0.16)';
              ctx.beginPath();
              ctx.moveTo(pts[i].sx, pts[i].sy);
              ctx.lineTo(pts[j].sx, pts[j].sy);
              ctx.stroke();
            }
          }

          // Primary benchmark pair (vector 1 and vector 2)
          if (pts.length > 2) {
            const p1 = pts[1];
            const p2 = pts[2];
            const d12 = Math.sqrt(
              Math.max(
                0,
                2 - 2 * (gData.cosineSimilarities[0] !== undefined ? gData.cosineSimilarities[0] : 0)
              )
            );

            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 2.5;
            ctx.shadowColor = '#0891b2';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.stroke();
            ctx.shadowBlur = 0;

            const midX = (p1.sx + p2.sx) / 2;
            const midY = (p1.sy + p2.sy) / 2;
            ctx.font = 'bold 10px JetBrains Mono, monospace';
            ctx.fillStyle = '#22d3ee';
            ctx.textAlign = 'center';
            ctx.fillText(`||u - v||₂ = ${d12.toFixed(3)} → √2`, midX, midY - 6);
          }

          // Draw points
          for (let i = 0; i < pts.length; i++) {
            const p = pts[i];
            ctx.beginPath();
            ctx.arc(p.sx, p.sy, p.depth > 0 ? 2.6 : 1.8, 0, Math.PI * 2);
            ctx.fillStyle = p.depth > 0 ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)';
            ctx.fill();
          }
        }

        // =====================================================================
        // RIGHT PANE: FIRST-PRINCIPLES MATHEMATICAL DIAGNOSTIC DISTRIBUTIONS
        // =====================================================================
        const px = w * 0.47;
        const pw = w - px - 24;
        const py = h * 0.2;
        const ph = h * 0.58;

        // Container card
        ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, pw, ph);

        // ---------------------------------------------------------------------
        // RIGHT PANE 1: COSINE SIMILARITY HISTOGRAM
        // ---------------------------------------------------------------------
        if (geomSubMode === 'equator') {
          ctx.textAlign = 'left';
          ctx.font = fHeading;
          ctx.fillStyle = '#c084fc';
          ctx.fillText('PAIRWISE COSINE SIMILARITY: cos(θ) = u·v / (||u|| ||v||)', px, py - 20);

          ctx.font = fSub;
          if (geomZoomMode === 'adaptive') {
            ctx.fillStyle = '#38bdf8';
            ctx.fillText(
              `ADAPTIVE MICRO-ZOOM [−${gData.adaptiveRange.toFixed(3)}, +${gData.adaptiveRange.toFixed(3)}] · σ = 1/√d = ${(1 / Math.sqrt(dimension)).toFixed(4)} · N(0, 1/d)`,
              px,
              py - 6
            );
          } else {
            ctx.fillStyle = dimension === 4096 ? '#34d399' : '#f59e0b';
            ctx.fillText(
              `GLOBAL VIEW [−1, 1] · VAR = 1/d = ${(1 / dimension).toFixed(5)} · BELT MASS = ${(gData.equatorBeltProb * 100).toFixed(1)}%`,
              px,
              py - 6
            );
          }

          // Active Histogram Selection
          const isAdaptive = geomZoomMode === 'adaptive';
          const hist = isAdaptive ? gData.adaptiveHistogram : gData.histogram;
          const binCenters = isAdaptive ? gData.adaptiveBinCenters : gData.binCenters;
          const maxCnt = isAdaptive ? gData.maxAdaptiveBinCount : gData.maxBinCount;
          const nBins = hist.length;
          const rangeMin = isAdaptive ? -gData.adaptiveRange : -1.0;
          const rangeMax = isAdaptive ? gData.adaptiveRange : 1.0;
          const rangeSpan = rangeMax - rangeMin;

          // Highlight Equatorial Belt [-0.05, +0.05]
          const zx1 = px + ((-0.05 - rangeMin) / rangeSpan) * pw;
          const zx2 = px + ((0.05 - rangeMin) / rangeSpan) * pw;
          const cZx1 = Math.max(px, zx1);
          const cZx2 = Math.min(px + pw, zx2);
          if (cZx2 > cZx1) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
            ctx.fillRect(cZx1, py, cZx2 - cZx1, ph);
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
            ctx.strokeRect(cZx1, py, cZx2 - cZx1, ph);
          }

          // Zero line
          const cx0 = px + ((0 - rangeMin) / rangeSpan) * pw;
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.75)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx0, py);
          ctx.lineTo(cx0, py + ph);
          ctx.stroke();

          // Histogram Bars
          const barSlotW = pw / nBins;
          const barW = Math.max(1, barSlotW - 1);
          for (let b = 0; b < nBins; b++) {
            const cnt = hist[b];
            const center = binCenters[b];
            const barFrac = cnt / maxCnt;
            const barH = barFrac * (ph - 28);
            const bx = px + b * barSlotW;
            const by = py + ph - barH;

            ctx.fillStyle = Math.abs(center) <= 0.05 ? '#10b981' : '#8b5cf6';
            ctx.fillRect(bx, by, barW, barH);
          }

          // Theoretical Gaussian Overlay
          ctx.beginPath();
          const curvePts = 100;
          for (let i = 0; i <= curvePts; i++) {
            const t = rangeMin + (i / curvePts) * rangeSpan;
            let density = 0;
            if (dimension === 2 && !isAdaptive) {
              density = 1 / Math.PI / Math.sqrt(Math.max(0.008, 1 - t * t));
            } else if (dimension === 3 && !isAdaptive) {
              density = 0.5;
            } else {
              // Gaussian N(0, 1/d)
              density = Math.exp((-dimension * t * t) / 2);
            }
            const normY = density * (ph - 28) * 0.95;
            const curveX = px + ((t - rangeMin) / rangeSpan) * pw;
            const curveY = py + ph - normY;
            if (i === 0) ctx.moveTo(curveX, curveY);
            else ctx.lineTo(curveX, curveY);
          }
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Telemetry Invariant Badge inside Pane
          ctx.font = fSmall;
          ctx.fillStyle = '#e2e8f0';
          ctx.textAlign = 'right';
          ctx.fillText(
            `μ = ${gData.mean.toFixed(4)} | σ² = ${gData.variance.toFixed(5)} (Theory 1/d = ${(1/dimension).toFixed(5)})`,
            px + pw - 10,
            py + 18
          );
          ctx.fillText(
            `Equator Belt Mass: ${(gData.equatorBeltProb * 100).toFixed(1)}% (Theory: ${(gData.theoryEquatorBeltProb * 100).toFixed(1)}%)`,
            px + pw - 10,
            py + 32
          );
        }

        // ---------------------------------------------------------------------
        // RIGHT PANE 2: THE ORANGE PEEL RADIAL DENSITY HISTOGRAM
        // ---------------------------------------------------------------------
        else if (geomSubMode === 'shell') {
          ctx.textAlign = 'left';
          ctx.font = fHeading;
          ctx.fillStyle = '#f59e0b';
          ctx.fillText('THE ORANGE PEEL PARADOX: RADIAL VOLUME DENSITY p(r) = d · r^{d-1}', px, py - 20);

          ctx.font = fSub;
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(
            `OUTER 5% CRUST (r ≥ 0.95): Measured ${(gData.outerShellFraction * 100).toFixed(1)}% | Theory 1 - 0.95^d = ${(gData.theoryOuterShellFraction * 100).toFixed(1)}%`,
            px,
            py - 6
          );

          // Highlight Outer Crust [0.95, 1.0]
          const crustX = px + 0.95 * pw;
          ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
          ctx.fillRect(crustX, py, pw - (crustX - px), ph);
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
          ctx.strokeRect(crustX, py, pw - (crustX - px), ph);

          // Radial Histogram Bars
          const nBins = gData.radiusHistogram.length;
          const barSlotW = pw / nBins;
          const barW = Math.max(1, barSlotW - 1);
          for (let b = 0; b < nBins; b++) {
            const cnt = gData.radiusHistogram[b];
            const center = gData.radiusBinCenters[b];
            const barFrac = cnt / gData.maxRadiusBinCount;
            const barH = barFrac * (ph - 28);
            const bx = px + b * barSlotW;
            const by = py + ph - barH;

            ctx.fillStyle = center >= 0.95 ? '#f59e0b' : '#64748b';
            ctx.fillRect(bx, by, barW, barH);
          }

          // Theoretical Power Law Density p(r) = r^{d-1}
          ctx.beginPath();
          const curvePts = 80;
          for (let i = 0; i <= curvePts; i++) {
            const r = i / curvePts;
            const density = Math.pow(r, Math.min(100, dimension - 1));
            const normY = density * (ph - 28) * 0.95;
            const curveX = px + r * pw;
            const curveY = py + ph - normY;
            if (i === 0) ctx.moveTo(curveX, curveY);
            else ctx.lineTo(curveX, curveY);
          }
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Mean radius marker E[r] = d / (d+1)
          const meanX = px + gData.meanRadius * pw;
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(meanX, py);
          ctx.lineTo(meanX, py + ph);
          ctx.stroke();
          ctx.setLineDash([]);

          // Telemetry
          ctx.font = fSmall;
          ctx.fillStyle = '#e2e8f0';
          ctx.textAlign = 'right';
          ctx.fillText(
            `Mean Radius: E[r] = ${gData.meanRadius.toFixed(4)} (Theory d/(d+1) = ${gData.theoryMeanRadius.toFixed(4)})`,
            px + pw - 10,
            py + 18
          );
          ctx.fillText(
            `Solid Unit Ball Interior: ${dimension >= 100 ? '99.4% to 100% HOLLOW VOID' : 'Uniform to Crust Migration'}`,
            px + pw - 10,
            py + 32
          );
        }

        // ---------------------------------------------------------------------
        // RIGHT PANE 3: PAIRWISE DISTANCE COLLAPSE (||u - v|| -> √2)
        // ---------------------------------------------------------------------
        else {
          ctx.textAlign = 'left';
          ctx.font = fHeading;
          ctx.fillStyle = '#06b6d4';
          ctx.fillText('PAIRWISE EUCLIDEAN DISTANCE COLLAPSE: ||u - v||₂ → √2 ≈ 1.4142', px, py - 20);

          ctx.font = fSub;
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(
            `MEAN DISTANCE = ${gData.meanDistance.toFixed(4)} · VAR = ${gData.varDistance.toFixed(5)} (Theory 1/(2d) = ${(1/(2*dimension)).toFixed(5)})`,
            px,
            py - 6
          );

          // Prominent √2 Limit Line
          const sqrt2X = px + (Math.SQRT2 / 2.0) * pw;
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sqrt2X, py);
          ctx.lineTo(sqrt2X, py + ph);
          ctx.stroke();

          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.fillStyle = '#10b981';
          ctx.textAlign = 'center';
          ctx.fillText('√2 Limit (1.4142)', sqrt2X, py + 14);

          // Distance Histogram Bars across [0, 2]
          const nBins = gData.distHistogram.length;
          const barSlotW = pw / nBins;
          const barW = Math.max(1, barSlotW - 1);
          for (let b = 0; b < nBins; b++) {
            const cnt = gData.distHistogram[b];
            const center = gData.distBinCenters[b];
            const barFrac = cnt / gData.maxDistBinCount;
            const barH = barFrac * (ph - 28);
            const bx = px + b * barSlotW;
            const by = py + ph - barH;

            ctx.fillStyle = Math.abs(center - Math.SQRT2) < 0.1 ? '#06b6d4' : '#818cf8';
            ctx.fillRect(bx, by, barW, barH);
          }

          // Theoretical Gaussian centered at √2 with variance 1/(2d)
          ctx.beginPath();
          const curvePts = 80;
          const varD = 1 / (2 * dimension);
          for (let i = 0; i <= curvePts; i++) {
            const dist = (i / curvePts) * 2.0;
            const diff = dist - Math.SQRT2;
            const density = Math.exp((-diff * diff) / (2 * varD));
            const normY = density * (ph - 28) * 0.95;
            const curveX = px + (dist / 2.0) * pw;
            const curveY = py + ph - normY;
            if (i === 0) ctx.moveTo(curveX, curveY);
            else ctx.lineTo(curveX, curveY);
          }
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Telemetry
          ctx.font = fSmall;
          ctx.fillStyle = '#e2e8f0';
          ctx.textAlign = 'right';
          ctx.fillText(
            `Contrast Ratio: (D_max - D_min) / D_min → 0`,
            px + pw - 10,
            py + 28
          );
          ctx.fillText(
            `In d=${dimension}, all ${gData.totalPairs.toLocaleString()} point pairs are mutually equidistant!`,
            px + pw - 10,
            py + 42
          );
        }
      }

      // =======================================================================
      // 5. NEURAL ODE CONTINUOUS VECTOR FIELD FLOW SIMULATION
      // =======================================================================
      else if (mode === 'neural_ode') {
        // Advance or reverse time
        if (isRunning) {
          const stepSize = 0.0035 * odeSpeed * dt;
          if (odeReverse) {
            odeTimeRef.current = Math.max(0, odeTimeRef.current - stepSize);
          } else {
            odeTimeRef.current = Math.min(1.0, odeTimeRef.current + stepSize);
            if (odeTimeRef.current >= 1.0 && frameCounter % 120 === 0) {
              // Loop back after lingering at separated state
              odeTimeRef.current = 0.0;
            }
          }
          if (frameCounter % 6 === 0) {
            setOdeTime(odeTimeRef.current);
          }
        }

        const t = odeTimeRef.current;
        const cx = w * 0.5;
        const cy = h * 0.48;
        const scale = Math.min(w * 0.38, h * 0.40);

        // Header Title
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(
          'CONTINUOUS INVERTIBLE VECTOR FIELD FLOW: dz(t)/dt = f_θ(z(t), t)',
          24,
          28
        );

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = odeReverse ? '#34d399' : '#94a3b8';
        ctx.fillText(
          odeReverse
            ? '⇄ ADJOINT BACKWARD PASS: Exactly reconstructing z(0) with O(1) Memory Footprint'
            : `Flow Parameter t = ${t.toFixed(2)} / 1.00 · Lipschitz Diffeomorphism (No Crossing)`,
          24,
          44
        );

        // Background Velocity Vector Field Grid
        const gridCols = 15;
        const gridRows = 9;
        ctx.lineWidth = 1;

        for (let col = 0; col < gridCols; col++) {
          for (let row = 0; row < gridRows; row++) {
            const gx = -1.2 + (col / (gridCols - 1)) * 2.4;
            const gy = -0.9 + (row / (gridRows - 1)) * 1.8;
            const vel = getOdeVelocity(gx, gy, t);
            const vLen = Math.hypot(vel.vx, vel.vy);
            const angle = Math.atan2(vel.vy, vel.vx);

            const sx = cx + gx * scale;
            const sy = cy + gy * scale;
            const arrowLen = Math.min(18, 5 + vLen * 8);

            ctx.strokeStyle = `rgba(56, 189, 248, ${Math.min(0.28, 0.08 + vLen * 0.12)})`;
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(sx + Math.cos(angle) * arrowLen, sy + Math.sin(angle) * arrowLen);
            ctx.stroke();
          }
        }

        // Streamline Particle Ribbons
        const ribbons = odeStreamlinesRef.current;
        ribbons.forEach((rib) => {
          if (isRunning) {
            const v = getOdeVelocity(rib.x, rib.y, t);
            const mult = odeReverse ? -1 : 1;
            rib.x += v.vx * 0.015 * mult * dt;
            rib.y += v.vy * 0.015 * mult * dt;
            rib.life += dt;

            rib.trail.push({ x: rib.x, y: rib.y });
            if (rib.trail.length > 10) rib.trail.shift();

            if (rib.life > rib.maxLife || Math.abs(rib.x) > 1.4 || Math.abs(rib.y) > 1.1) {
              rib.x = (Math.random() - 0.5) * 2.2;
              rib.y = (Math.random() - 0.5) * 1.8;
              rib.trail = [];
              rib.life = 0;
            }
          }

          if (rib.trail.length > 2) {
            ctx.beginPath();
            const startP = rib.trail[0];
            ctx.moveTo(cx + startP.x * scale, cy + startP.y * scale);
            for (let i = 1; i < rib.trail.length; i++) {
              const tp = rib.trail[i];
              ctx.lineTo(cx + tp.x * scale, cy + tp.y * scale);
            }
            ctx.strokeStyle = 'rgba(125, 211, 252, 0.22)';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        });

        // Separating Hyperplane at t > 0.70
        if (t > 0.65) {
          const alphaSep = Math.min(1, (t - 0.65) / 0.35);
          ctx.strokeStyle = `rgba(52, 211, 153, ${alphaSep * 0.75})`;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(cx, cy - scale * 0.95);
          ctx.lineTo(cx, cy + scale * 0.95);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.fillStyle = `rgba(52, 211, 153, ${alphaSep})`;
          ctx.textAlign = 'center';
          ctx.fillText('LINEAR SEPARATOR: w^T z(1) + b = 0', cx, cy - scale * 0.98);
        }

        // Untangling Spiral Data Points
        const points = odePointsRef.current;
        points.forEach((p) => {
          const pos = getOdePointPosition(p, t);
          const px = cx + pos.x * scale;
          const py = cy + pos.y * scale;

          ctx.beginPath();
          ctx.arc(px, py, p.classLabel === 0 ? 3.0 : 3.0, 0, Math.PI * 2);
          if (p.classLabel === 0) {
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 5;
          } else {
            ctx.fillStyle = '#fb7185';
            ctx.shadowColor = '#e11d48';
            ctx.shadowBlur = 5;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        });

        // Center HUD Stats
        const hudW = 210;
        const hudH = 58;
        const hx = w - hudW - 20;
        const hy = 20;
        ctx.fillStyle = 'rgba(10, 8, 20, 0.85)';
        ctx.fillRect(hx, hy, hudW, hudH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.strokeRect(hx, hy, hudW, hudH);

        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Integration Time: t = ${t.toFixed(2)}`, hx + 8, hy + 16);
        ctx.fillText('Memory Cost: O(1) [Adjoint]', hx + 8, hy + 30);
        ctx.fillStyle = t > 0.8 ? '#34d399' : '#f59e0b';
        ctx.fillText(
          `Separability: ${t > 0.85 ? '100% Linear' : `${Math.round(45 + t * 55)}% Separable`}`,
          hx + 8,
          hy + 46
        );
      }

      // =======================================================================
      // 6. 3D LOSS LANDSCAPE & SKIP-CONNECTIONS (LI ET AL. HOMOTOPY & DAUPHIN SADDLE ESCAPE)
      // =======================================================================
      else if (mode === 'saddle_escape') {
        const cx = w * 0.44;
        const cy = h * 0.54;
        const scale = Math.min(w, h) * 0.22;
        const pitch = saddlePitchRef.current;
        const yaw = saddleYawRef.current;
        const cosY = Math.cos(yaw);
        const sinY = Math.sin(yaw);
        const cosP = Math.cos(pitch);
        const sinP = Math.sin(pitch);

        const project3D = (x: number, y: number, z: number) => {
          const rx = x * cosY - y * sinY;
          const ry = x * sinY + y * cosY;
          const rz = z;

          const py = ry * cosP - rz * sinP;
          const pz = ry * sinP + rz * cosP;

          const fov = 4.0;
          const dist = 5.2 - pz * 0.4;
          const factor = (scale * fov) / Math.max(0.2, dist);

          const sx = cx + rx * factor;
          const sy = cy + py * factor;
          return { sx, sy, depth: pz };
        };

        const computeLoss = (x: number, y: number) => {
          // Convex basin (ResNet with identity highways)
          const lConvex =
            0.5 * (0.85 * x * x + 1.15 * y * y) +
            0.4 * Math.log(1 + 0.5 * (x * x + y * y)) +
            0.12 * Math.exp(-0.6 * (x * x + y * y)) * (Math.cos(3.2 * x) * Math.cos(3.2 * y) - 1);

          // Chaotic rugged surface with cliffs, ravines and local traps (VGG-style without skips)
          const lChaotic =
            0.18 * ((1 - x) * (1 - x) + 8 * Math.pow(y - x * x, 2)) +
            0.75 *
              (Math.sin(2.0 * x) * Math.cos(2.0 * y) +
                0.5 * Math.sin(4.8 * x) * Math.cos(4.8 * y) +
                0.33 * Math.sin(9.3 * x) * Math.cos(9.3 * y)) +
            0.35 * (Math.pow(x, 3) / 3 - x * y * y) * Math.exp(-0.25 * (x * x + y * y));

          // Dauphin et al. high-dimensional negative curvature escape channel modulation
          const dimFactor = 1 - Math.pow(2, -(landscapeDim - 2) / 8);
          const saddleMod = -0.28 * dimFactor * (y * y - 0.22 * Math.pow(y, 4));

          return (1 - residualAlpha) * lChaotic + residualAlpha * lConvex + saddleMod;
        };

        // Header Title
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#c084fc';
        ctx.fillText(
          '3D LOSS LANDSCAPE & SKIP-CONNECTIONS: f(α, x) = (1-α) L_chaotic + α L_convex',
          24,
          26
        );

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(
          `Highway α = ${residualAlpha.toFixed(2)} [${
            residualAlpha < 0.3
              ? 'VGG-19 Fractal Chaos'
              : residualAlpha > 0.7
              ? 'ResNet-152 Convex Funnel'
              : 'Intermediate Highway'
          }] · Optimization Dimension d = ${landscapeDim} · Dauphin Saddle Escape Ratio ~ 2^-d = ${(Math.pow(2, -landscapeDim / 6)).toFixed(4)}`,
          24,
          42
        );

        // 3D Quad Mesh with depth sorting & Lambertian lighting
        const steps = 24;
        const range = 2.1;
        const quads: {
          p0: { sx: number; sy: number };
          p1: { sx: number; sy: number };
          p2: { sx: number; sy: number };
          p3: { sx: number; sy: number };
          depth: number;
          zMean: number;
          normDot: number;
        }[] = [];

        for (let j = 0; j < steps; j++) {
          const y0 = -range + (j / steps) * (2 * range);
          const y1 = -range + ((j + 1) / steps) * (2 * range);
          for (let i = 0; i < steps; i++) {
            const x0 = -range + (i / steps) * (2 * range);
            const x1 = -range + ((i + 1) / steps) * (2 * range);

            const z00 = computeLoss(x0, y0);
            const z10 = computeLoss(x1, y0);
            const z11 = computeLoss(x1, y1);
            const z01 = computeLoss(x0, y1);

            const p0 = project3D(x0, y0, z00);
            const p1 = project3D(x1, y0, z10);
            const p2 = project3D(x1, y1, z11);
            const p3 = project3D(x0, y1, z01);

            const depth = (p0.depth + p1.depth + p2.depth + p3.depth) / 4;
            const zMean = (z00 + z10 + z11 + z01) / 4;

            // Approximate surface normal
            const ux = x1 - x0, uy = 0, uz = z10 - z00;
            const vx = 0, vy = y1 - y0, vz = z01 - z00;
            const nx = uy * vz - uz * vy;
            const ny = uz * vx - ux * vz;
            const nz = ux * vy - uy * vx;
            const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
            // Directional light [0.4, 0.8, 0.45]
            const normDot = Math.max(0.2, (nx * 0.4 + ny * 0.8 + nz * 0.45) / nLen);

            quads.push({ p0, p1, p2, p3, depth, zMean, normDot });
          }
        }

        // Sort quads back to front
        quads.sort((a, b) => a.depth - b.depth);

        // Render quads
        ctx.lineWidth = 0.5;
        for (let q = 0; q < quads.length; q++) {
          const quad = quads[q];
          const brightness = quad.normDot;
          let r = 20, g = 30, b = 60;
          if (residualAlpha > 0.6) {
            // Convex funnel: sapphire to cyan-emerald
            if (quad.zMean < 0.4) {
              r = 14; g = 116; b = 144;
            } else if (quad.zMean < 1.0) {
              r = 16; g = 185; b = 129;
            } else {
              r = 56; g = 189; b = 248;
            }
          } else {
            // Chaotic fractured surface: purple, magenta and fiery amber
            if (quad.zMean < 0.4) {
              r = 76; g = 29; b = 149;
            } else if (quad.zMean < 1.1) {
              r = 190; g = 24; b = 93;
            } else {
              r = 245; g = 158; b = 11;
            }
          }

          const fillR = Math.min(255, Math.floor(r * brightness));
          const fillG = Math.min(255, Math.floor(g * brightness));
          const fillB = Math.min(255, Math.floor(b * brightness));

          ctx.beginPath();
          ctx.moveTo(quad.p0.sx, quad.p0.sy);
          ctx.lineTo(quad.p1.sx, quad.p1.sy);
          ctx.lineTo(quad.p2.sx, quad.p2.sy);
          ctx.lineTo(quad.p3.sx, quad.p3.sy);
          ctx.closePath();

          ctx.fillStyle = `rgba(${fillR}, ${fillG}, ${fillB}, 0.78)`;
          ctx.fill();
          ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
          ctx.stroke();
        }

        // Numerical Gradient helper (central differences)
        const getGradient = (x: number, y: number) => {
          const eps = 0.005;
          const gx = (computeLoss(x + eps, y) - computeLoss(x - eps, y)) / (2 * eps);
          const gy = (computeLoss(x, y + eps) - computeLoss(x, y - eps)) / (2 * eps);
          return { gx, gy };
        };

        // Simulation Updates for Both Particles
        if (isRunning) {
          saddleStepRef.current += 1;

          // 1. Vanilla SGD Update
          const vPos = saddleVanillaPosRef.current;
          const { gx: vGx, gy: vGy } = getGradient(vPos.x, vPos.y);
          vPos.x -= saddleLr * vGx;
          vPos.y -= saddleLr * vGy;
          saddleVanillaTrailRef.current.push({ x: vPos.x, y: vPos.y });
          if (saddleVanillaTrailRef.current.length > 70) saddleVanillaTrailRef.current.shift();

          // 2. Heavy-Ball Momentum + Langevin Update
          const mPos = saddleMomentumPosRef.current;
          const mVel = saddleMomentumVelRef.current;
          const { gx: mGx, gy: mGy } = getGradient(mPos.x, mPos.y);
          const noiseX = (Math.random() - 0.5) * 2;
          const noiseY = (Math.random() - 0.5) * 2;

          mVel.x = saddleMomentum * mVel.x - saddleLr * mGx + saddleNoise * Math.sqrt(saddleLr) * noiseX;
          mVel.y = saddleMomentum * mVel.y - saddleLr * mGy + saddleNoise * Math.sqrt(saddleLr) * noiseY;
          mPos.x += mVel.x;
          mPos.y += mVel.y;

          saddleMomentumTrailRef.current.push({ x: mPos.x, y: mPos.y });
          if (saddleMomentumTrailRef.current.length > 70) saddleMomentumTrailRef.current.shift();

          // Boundary clamp / respawn
          if (Math.abs(mPos.x) > range || Math.abs(mPos.y) > range) {
            mPos.x = 0.85;
            mPos.y = 0.95;
            mVel.x = 0;
            mVel.y = 0;
            saddleMomentumTrailRef.current = [];
          }
          if (Math.abs(vPos.x) > range || Math.abs(vPos.y) > range) {
            vPos.x = 0.85;
            vPos.y = 0.95;
            saddleVanillaTrailRef.current = [];
          }
        }

        // Draw Vanilla SGD Trail & Glowing Particle
        const vTrail = saddleVanillaTrailRef.current;
        if (vTrail.length > 1) {
          ctx.beginPath();
          const pStart = project3D(vTrail[0].x, vTrail[0].y, computeLoss(vTrail[0].x, vTrail[0].y));
          ctx.moveTo(pStart.sx, pStart.sy);
          for (let k = 1; k < vTrail.length; k++) {
            const pt = project3D(vTrail[k].x, vTrail[k].y, computeLoss(vTrail[k].x, vTrail[k].y));
            ctx.lineTo(pt.sx, pt.sy);
          }
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        const curV = saddleVanillaPosRef.current;
        const curVPt = project3D(curV.x, curV.y, computeLoss(curV.x, curV.y));
        ctx.beginPath();
        ctx.arc(curVPt.sx, curVPt.sy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#d97706';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('Vanilla SGD', curVPt.sx + 8, curVPt.sy - 4);

        // Draw Momentum Trail & Glowing Particle
        const mTrail = saddleMomentumTrailRef.current;
        if (mTrail.length > 1) {
          ctx.beginPath();
          const pStart = project3D(mTrail[0].x, mTrail[0].y, computeLoss(mTrail[0].x, mTrail[0].y));
          ctx.moveTo(pStart.sx, pStart.sy);
          for (let k = 1; k < mTrail.length; k++) {
            const pt = project3D(mTrail[k].x, mTrail[k].y, computeLoss(mTrail[k].x, mTrail[k].y));
            ctx.lineTo(pt.sx, pt.sy);
          }
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
          ctx.lineWidth = 2.6;
          ctx.stroke();
        }

        const curM = saddleMomentumPosRef.current;
        const curMPt = project3D(curM.x, curM.y, computeLoss(curM.x, curM.y));
        ctx.beginPath();
        ctx.arc(curMPt.sx, curMPt.sy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('Momentum SGD', curMPt.sx + 9, curMPt.sy - 4);

        // HUD Statistics Panel (Right Side)
        const shudW = 228;
        const shudH = 92;
        const shx = w - shudW - 16;
        const shy = 16;
        ctx.fillStyle = 'rgba(10, 8, 20, 0.88)';
        ctx.fillRect(shx, shy, shudW, shudH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.strokeRect(shx, shy, shudW, shudH);

        const { gx: vgx, gy: vgy } = getGradient(curV.x, curV.y);
        const vGradNorm = Math.hypot(vgx, vgy);
        const mVelNorm = Math.hypot(saddleMomentumVelRef.current.x, saddleMomentumVelRef.current.y);
        const mKinetic = 0.5 * mVelNorm * mVelNorm;

        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Vanilla SGD: ||∇f|| = ${vGradNorm.toFixed(3)} ${vGradNorm < 0.05 ? '(TRAPPED)' : ''}`, shx + 8, shy + 16);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`Momentum SGD: ||v|| = ${mVelNorm.toFixed(3)} (Tunnels)`, shx + 8, shy + 32);
        ctx.fillText(`Kinetic Energy E_k = ${mKinetic.toFixed(4)}`, shx + 8, shy + 48);
        ctx.fillStyle = residualAlpha > 0.6 ? '#34d399' : '#f43f5e';
        ctx.fillText(
          residualAlpha > 0.6 ? 'Landscape: Convex Funnel (Global Flow)' : 'Landscape: Chaotic Fractures (Saddles & Cliffs)',
          shx + 8,
          shy + 64
        );
        ctx.fillStyle = '#a78bfa';
        ctx.fillText('Drag canvas to orbit 3D camera', shx + 8, shy + 80);
      }

      // =======================================================================
      // 7. GROKKING FOURIER FREQUENCY EMERGENCE & PHASE TRANSITION
      // =======================================================================
      else if (mode === 'grokking') {
        if (isRunning) {
          grokkingStepRef.current = Math.min(10000, grokkingStepRef.current + 22);
          if (frameCounter % 6 === 0) {
            setGrokkingStep(grokkingStepRef.current);
          }
        }

        const step = grokkingStepRef.current;
        const wd = grokkingWeightDecay;
        const red = grokkingDataRedundancy;

        // Critical Grokking step t_crit
        const tCrit =
          wd < 0.05
            ? 10001
            : Math.round((3600 / Math.max(0.08, wd)) * (1 / Math.sqrt(Math.max(0.1, red))));

        const isGrokked = step >= tCrit;
        if (isGrokked && !grokkingCelebratedRef.current) {
          grokkingCelebratedRef.current = true;
          soundFX.playMilestone();
        }

        // Left Pane: Fourier Frequency Spectrum Circle
        const cx = w * 0.23;
        const cy = h * 0.52;
        const R = Math.min(w * 0.17, h * 0.35);

        ctx.textAlign = 'center';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillStyle = '#c084fc';
        ctx.fillText('REPRESENTATION FOURIER SPECTRUM Z_p', cx, cy - R - 20);

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = isGrokked ? '#34d399' : '#94a3b8';
        ctx.fillText(
          isGrokked
            ? 'Phase 3: Sharp Fourier Harmonics Snapped (Generalization)'
            : step < tCrit * 0.75
            ? 'Phase 1: Disordered Noise Cloud (Memorization)'
            : 'Phase 2: Weight Decay Compression ||W||_2 Drop',
          cx,
          cy - R - 6
        );

        // Guide Circles
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        [0.35, 0.7, 1.0].forEach((rRatio) => {
          ctx.beginPath();
          ctx.arc(cx, cy, R * rRatio, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        // Radial ticks for cyclic harmonics (6-fold / 8-fold)
        for (let k = 0; k < 6; k++) {
          const ang = (k * Math.PI) / 3;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
          ctx.stroke();
        }

        // Draw Representation Weight Points
        const numWeightPoints = 36;
        const fourierHarmonicPts: { x: number; y: number }[] = [];

        for (let i = 0; i < numWeightPoints; i++) {
          let px = 0,
            py = 0;

          if (isGrokked) {
            // Snapped into sharp 6-fold harmonic vertices
            const k = i % 6;
            const targetAngle = (k * Math.PI) / 3;
            const jitterR = (i / numWeightPoints) * 0.15;
            const rRadius = R * (0.85 + jitterR);
            px = cx + Math.cos(targetAngle) * rRadius;
            py = cy + Math.sin(targetAngle) * rRadius;
            fourierHarmonicPts.push({ x: px, y: py });
          } else {
            // Disordered cloud or contracting circle
            const progress = step / Math.max(1, tCrit);
            const rBase = R * (0.9 - progress * 0.35);
            const randAng = (i / numWeightPoints) * Math.PI * 2 + Math.sin(i * 1.5) * 0.5;
            const noiseR = Math.cos(i * 2.3) * (1 - progress * 0.7) * (R * 0.35);
            px = cx + Math.cos(randAng) * (rBase + noiseR);
            py = cy + Math.sin(randAng) * (rBase + noiseR);
          }

          ctx.beginPath();
          ctx.arc(px, py, isGrokked ? 3.5 : 2.5, 0, Math.PI * 2);
          if (isGrokked) {
            ctx.fillStyle = '#34d399';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = '#a78bfa';
            ctx.shadowBlur = 0;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // If grokked, draw harmonic connecting chords (star polygon)
        if (isGrokked && fourierHarmonicPts.length > 6) {
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const nextK = (k + 2) % 6;
            const p1 = fourierHarmonicPts[k];
            const p2 = fourierHarmonicPts[nextK];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
          ctx.stroke();
        }

        // Right Pane: Live Loss & Weight Norm Grokking Curves
        const px = w * 0.47;
        const pw = w - px - 24;
        const py = h * 0.18;
        const ph = h * 0.62;

        ctx.textAlign = 'left';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('LIVE GROKKING CLIFF: TRAIN LOSS vs VALIDATION LOSS vs ||W||_2', px, py - 20);

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(
          `Weight Decay λ = ${wd.toFixed(2)} · Critical Grokking Threshold t_crit = ${
            wd < 0.05 ? '∞ (No Grokking)' : tCrit
          }`,
          px,
          py - 6
        );

        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, pw, ph);

        // Horizontal grid lines
        [0.25, 0.5, 0.75].forEach((frac) => {
          const gy = py + ph * (1 - frac);
          ctx.beginPath();
          ctx.moveTo(px, gy);
          ctx.lineTo(px + pw, gy);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.stroke();
        });

        // Compute loss functions across 10000 steps
        const numCurvePts = 120;

        // 1. Training Loss Curve (Amber)
        ctx.beginPath();
        for (let i = 0; i <= numCurvePts; i++) {
          const s = (i / numCurvePts) * 10000;
          const lossVal = 4.0 * Math.exp(-s / 220) + 0.005;
          const cxp = px + (i / numCurvePts) * pw;
          const cyp = py + ph - (lossVal / 4.5) * (ph - 20);
          if (i === 0) ctx.moveTo(cxp, cyp);
          else ctx.lineTo(cxp, cyp);
        }
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 2. Validation Loss Curve (Rose / Red)
        ctx.beginPath();
        for (let i = 0; i <= numCurvePts; i++) {
          const s = (i / numCurvePts) * 10000;
          let valLoss = 4.0;
          if (wd >= 0.05) {
            valLoss = 4.0 / (1 + Math.exp((s - tCrit) / 130)) + 0.02;
          }
          const cxp = px + (i / numCurvePts) * pw;
          const cyp = py + ph - (valLoss / 4.5) * (ph - 20);
          if (i === 0) ctx.moveTo(cxp, cyp);
          else ctx.lineTo(cxp, cyp);
        }
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#e11d48';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 3. Weight Norm Curve (Cyan Dashed)
        ctx.beginPath();
        ctx.setLineDash([4, 3]);
        for (let i = 0; i <= numCurvePts; i++) {
          const s = (i / numCurvePts) * 10000;
          const normVal = 0.8 + 3.2 * Math.exp((-wd * s) / 2200);
          const cxp = px + (i / numCurvePts) * pw;
          const cyp = py + ph - (normVal / 4.5) * (ph - 20);
          if (i === 0) ctx.moveTo(cxp, cyp);
          else ctx.lineTo(cxp, cyp);
        }
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);

        // Vertical Playhead Needle at current step
        const needleX = px + (step / 10000) * pw;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(needleX, py);
        ctx.lineTo(needleX, py + ph);
        ctx.stroke();

        // Live Metric HUD Card
        const ghudW = 205;
        const ghudH = 64;
        const ghx = px + pw - ghudW - 10;
        const ghy = py + 10;
        ctx.fillStyle = 'rgba(10, 8, 20, 0.85)';
        ctx.fillRect(ghx, ghy, ghudW, ghudH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.strokeRect(ghx, ghy, ghudW, ghudH);

        const currentTrainLoss = 4.0 * Math.exp(-step / 220) + 0.005;
        const currentValLoss =
          wd < 0.05 ? 4.0 : 4.0 / (1 + Math.exp((step - tCrit) / 130)) + 0.02;
        const currentWeightNorm = (0.8 + 3.2 * Math.exp((-wd * step) / 2200)) * 5.0;

        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`Train Loss: ${currentTrainLoss.toFixed(4)}`, ghx + 8, ghy + 16);
        ctx.fillStyle = '#f43f5e';
        ctx.fillText(`Val Loss: ${currentValLoss.toFixed(4)}`, ghx + 8, ghy + 32);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`||W||_2: ${currentWeightNorm.toFixed(2)}`, ghx + 8, ghy + 48);
      }

      // =======================================================================
      // 8. THE SUPERPOSITION PARADOX SIMULATOR (ANTHROPIC TOY MODELS & WELCH BOUND)
      // =======================================================================
      else if (mode === 'superposition') {
        const M = superpositionM;
        const d = superpositionD;
        const p = superpositionSparsity;
        const threshold = superpositionThreshold;

        // Periodic input resampling if running
        if (isRunning) {
          superpositionTimerRef.current += 1;
          if (superpositionTimerRef.current % 140 === 0) {
            superpositionInputsRef.current = sampleSparseInput(M, p);
          }
        }

        const W = superpositionWeightsRef.current;
        const x = superpositionInputsRef.current;
        const G = computeGramMatrix(W);
        const welch = computeWelchBound(M, d);

        // Run forward pass
        // 1. Bottleneck compression: h = sum_j x_j * w_j in R^d
        const hiddenH: number[] = new Array(d).fill(0);
        for (let j = 0; j < M; j++) {
          if (x[j] !== 0) {
            for (let k = 0; k < d; k++) {
              hiddenH[k] += x[j] * W[j][k];
            }
          }
        }

        // 2. Decoder projection & ReLU threshold: xHat_i = ReLU(w_i^T h - b)
        const xHat: number[] = new Array(M).fill(0);
        let totalSqErr = 0;
        for (let i = 0; i < M; i++) {
          let proj = 0;
          for (let k = 0; k < d; k++) {
            proj += W[i][k] * hiddenH[k];
          }
          xHat[i] = Math.max(0, proj - threshold);
          const err = x[i] - xHat[i];
          totalSqErr += err * err;
        }
        const mse = totalSqErr / Math.max(1, M);

        // Header Title
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText(
          'THE SUPERPOSITION PARADOX: OVERCOMPLETE DICTIONARIES & NON-LINEAR RELU RECOVERY',
          24,
          26
        );

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#94a3b8';
        const activeCount = x.filter((v) => v > 0).length;
        ctx.fillText(
          `Features M = ${M} · Bottleneck Dim d = ${d} · Capacity Ratio M/d = ${(M / d).toFixed(2)}x · Sparsity S = ${(1 - p).toFixed(2)} (${activeCount} Active) · Welch Lower Bound μ_W = ${welch.toFixed(3)}`,
          24,
          42
        );

        // ---------------------------------------------------------------------
        // ZONE 1: HYPERSPHERE GEOMETRY S^{d-1} (LEFT 32%)
        // ---------------------------------------------------------------------
        const z1Cx = w * 0.17;
        const z1Cy = h * 0.54;
        const z1R = Math.min(w * 0.13, h * 0.35);

        ctx.textAlign = 'center';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`HYPERSPHERE S^{d-1} (d=${d})`, z1Cx, z1Cy - z1R - 16);
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(d === 2 ? 'Mercedes / Antipodal Polytope' : 'Thomson Equipotential Equilibrium', z1Cx, z1Cy - z1R - 4);

        // Draw Sphere / Circle Outline
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(z1Cx, z1Cy, z1R, 0, Math.PI * 2);
        ctx.stroke();

        // Coordinate Crosshairs
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(z1Cx - z1R, z1Cy);
        ctx.lineTo(z1Cx + z1R, z1Cy);
        ctx.moveTo(z1Cx, z1Cy - z1R);
        ctx.lineTo(z1Cx, z1Cy + z1R);
        ctx.stroke();

        if (d >= 3) {
          const pitch = superpositionPitchRef.current;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
          ctx.beginPath();
          ctx.ellipse(z1Cx, z1Cy, z1R, z1R * Math.abs(Math.sin(pitch)), 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw Feature Vectors W_i
        for (let i = 0; i < M; i++) {
          const isActive = x[i] > 0;
          let px = 0, py = 0;

          if (d === 2) {
            px = z1Cx + W[i][0] * z1R;
            py = z1Cy - W[i][1] * z1R;
          } else {
            const yaw = superpositionYawRef.current;
            const pitch = superpositionPitchRef.current;
            const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
            const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
            const wx = W[i][0], wy = W[i][1], wz = W[i][2] || 0;
            const rx = wx * cosY - wy * sinY;
            const ry = wx * sinY + wy * cosY;
            const rz = wz;
            const sy = ry * cosP - rz * sinP;
            px = z1Cx + rx * z1R;
            py = z1Cy - sy * z1R;
          }

          ctx.beginPath();
          ctx.moveTo(z1Cx, z1Cy);
          ctx.lineTo(px, py);

          if (isActive) {
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 2.4;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(px, py, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = '#f59e0b';
            ctx.shadowColor = '#d97706';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.font = 'bold 9px JetBrains Mono, monospace';
            ctx.fillStyle = '#fbbf24';
            ctx.fillText(`f${i+1}`, px + (px > z1Cx ? 7 : -7), py - 3);
          } else {
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
            ctx.fill();
          }
        }

        // Compressed Latent Vector h in center
        let hx = 0, hy = 0;
        if (d === 2) {
          hx = z1Cx + hiddenH[0] * z1R * 0.7;
          hy = z1Cy - hiddenH[1] * z1R * 0.7;
        } else {
          hx = z1Cx + hiddenH[0] * z1R * 0.7;
          hy = z1Cy - hiddenH[1] * z1R * 0.7;
        }
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(z1Cx, z1Cy);
        ctx.lineTo(hx, hy);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(hx, hy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#be185d';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillStyle = '#ec4899';
        ctx.fillText('h (Latent)', hx + 8, hy + 2);

        // ---------------------------------------------------------------------
        // ZONE 2: GRAM MATRIX HEATMAP G = W^T W (CENTER 34%)
        // ---------------------------------------------------------------------
        const z2Cx = w * 0.50;
        const z2Cy = h * 0.54;
        const matSize = Math.min(w * 0.28, h * 0.62);
        const cell = matSize / M;
        const matLeft = z2Cx - matSize / 2;
        const matTop = z2Cy - matSize / 2 + 10;

        ctx.textAlign = 'center';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText('GRAM MATRIX G = WᵀW', z2Cx, matTop - 20);

        let maxCoherence = 0;
        for (let r = 0; r < M; r++) {
          for (let c = 0; c < M; c++) {
            if (r !== c) {
              maxCoherence = Math.max(maxCoherence, Math.abs(G[r][c]));
            }
          }
        }

        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Max Coherence μ = ${maxCoherence.toFixed(3)} · Welch Bound μ_W = ${welch.toFixed(3)}`, z2Cx, matTop - 7);

        // Draw Matrix Cells
        for (let r = 0; r < M; r++) {
          for (let c = 0; c < M; c++) {
            const val = G[r][c];
            const mcx = matLeft + c * cell;
            const mcy = matTop + r * cell;

            if (r === c) {
              ctx.fillStyle = '#ffffff';
            } else if (val < 0) {
              const intensity = Math.min(1, Math.abs(val));
              ctx.fillStyle = `rgba(14, 165, 233, ${0.15 + intensity * 0.8})`;
            } else {
              const intensity = Math.min(1, val);
              ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + intensity * 0.85})`;
            }

            ctx.fillRect(mcx, mcy, cell - 1, cell - 1);
          }
        }

        // Matrix border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(matLeft, matTop, matSize, matSize);

        // Legend below Gram Matrix
        const legY = matTop + matSize + 16;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('● -1.0 (Antipodal)', z2Cx - 85, legY);
        ctx.fillStyle = '#64748b';
        ctx.fillText('● 0.0 (Orthogonal)', z2Cx, legY);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('● +1.0 (Interference)', z2Cx + 85, legY);

        // ---------------------------------------------------------------------
        // ZONE 3: NON-LINEAR RELU RECONSTRUCTION BARS & HUD (RIGHT 34%)
        // ---------------------------------------------------------------------
        const z3Left = w * 0.68;
        const z3Width = w * 0.29;
        const z3Top = h * 0.22;
        const rowH = Math.min(18, (h * 0.54) / M);

        ctx.textAlign = 'left';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillStyle = '#a78bfa';
        ctx.fillText('RECONSTRUCTION: x̂ = ReLU(Wᵀh - b)', z3Left, z3Top - 22);

        // Status Badge
        const isClean = mse < 0.03;
        ctx.fillStyle = isClean ? '#34d399' : mse < 0.12 ? '#fbbf24' : '#f43f5e';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText(
          isClean
            ? '✓ ZERO INTERFERENCE (ReLU Filtered Cross-Talk)'
            : mse < 0.12
            ? '~ BOUNDED SUPERPOSITION NOISE'
            : '⚠ CAPACITY COLLAPSE (Polytope Overwhelmed)',
          z3Left,
          z3Top - 7
        );

        // Feature Bars
        const barMaxW = z3Width * 0.42;
        for (let i = 0; i < M; i++) {
          const ry = z3Top + i * rowH;

          // Label
          ctx.font = '9px JetBrains Mono, monospace';
          ctx.fillStyle = x[i] > 0 ? '#fbbf24' : '#64748b';
          ctx.fillText(`f${i+1}`, z3Left, ry + rowH * 0.7);

          // Bar 1: Input x[i]
          const bx = z3Left + 24;
          const trueW = (x[i] / 1.5) * barMaxW;
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.fillRect(bx, ry + 2, trueW, rowH * 0.38);

          // Bar 2: Reconstructed xHat[i]
          const hatW = (xHat[i] / 1.5) * barMaxW;
          const err = Math.abs(xHat[i] - x[i]);
          ctx.fillStyle = err < 0.08 ? 'rgba(52, 211, 153, 0.85)' : 'rgba(239, 68, 68, 0.85)';
          ctx.fillRect(bx, ry + rowH * 0.45, hatW, rowH * 0.42);

          // Numeric values
          if (x[i] > 0 || xHat[i] > 0.05) {
            ctx.fillStyle = err < 0.08 ? '#34d399' : '#f87171';
            ctx.fillText(`${xHat[i].toFixed(2)}`, bx + barMaxW + 8, ry + rowH * 0.7);
          }
        }

        // Bottom Stats HUD
        const bhudTop = z3Top + M * rowH + 12;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`Reconstruction Loss MSE: ${mse.toFixed(4)}`, z3Left, bhudTop);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`Cyan: Input x_i  |  Emerald: Reconstructed x̂_i`, z3Left, bhudTop + 14);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [
    mode,
    isRunning,
    diffusionNoise,
    reverseDrift,
    thermalTemp,
    electricField,
    selectedTokenIndex,
    softmaxTemp,
    dimension,
    sampleCount,
    geomData,
    geomSubMode,
    geomZoomMode,
    odeSpeed,
    odeReverse,
    odeSolver,
    saddleMomentum,
    saddleLr,
    saddleNoise,
    saddleCurvature,
    residualAlpha,
    landscapeDim,
    superpositionM,
    superpositionD,
    superpositionSparsity,
    superpositionThreshold,
    grokkingWeightDecay,
    grokkingDataRedundancy,
  ]);

  // Mode & Button Handlers
  const handleModeChange = (newMode: SimMode) => {
    setMode(newMode);
    setReverseDrift(false);
    setOdeReverse(false);
    soundFX.playTap();
  };

  const handleTogglePlay = () => {
    setIsRunning((prev) => !prev);
    soundFX.playTap();
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      initModeState(mode, canvas.width, canvas.height);
      setReverseDrift(false);
      setOdeReverse(false);
      odeTimeRef.current = 0.0;
      setOdeTime(0.0);
      grokkingStepRef.current = 0;
      setGrokkingStep(0);
      saddleStepRef.current = 0;
      if (mode === 'geometry') {
        setResampleTrigger((prev) => prev + 1);
        geomAngleRef.current = 0;
      }
      soundFX.playTap();
    }
  };

  const handleDimensionChange = (newDim: Dimension) => {
    setDimension(newDim);
    soundFX.playDimensionCollapseChord(newDim);
  };

  const handleResampleGeometry = () => {
    setResampleTrigger((prev) => prev + 1);
    soundFX.playTap();
  };

  const handleTriggerReverse = () => {
    setReverseDrift((prev) => !prev);
    if (!reverseDrift) soundFX.playSuccess();
    else soundFX.playTap();
  };

  const handleToggleOdeReverse = () => {
    setOdeReverse((prev) => !prev);
    if (!odeReverse) soundFX.playSuccess();
    else soundFX.playTap();
  };

  const handlePerturbSaddle = () => {
    saddleMomentumPosRef.current = {
      x: 0.85 + (Math.random() - 0.5) * 0.4,
      y: 0.95 + (Math.random() - 0.5) * 0.4,
    };
    saddleMomentumVelRef.current = {
      x: (Math.random() - 0.5) * 0.05,
      y: (Math.random() - 0.5) * 0.05,
    };
    saddleMomentumTrailRef.current = [];
    saddleVanillaPosRef.current = {
      x: 0.85 + (Math.random() - 0.5) * 0.4,
      y: 0.95 + (Math.random() - 0.5) * 0.4,
    };
    saddleVanillaTrailRef.current = [];
    soundFX.playTap();
  };

  const handleSampleSuperposition = () => {
    const newInputs = sampleSparseInput(superpositionM, superpositionSparsity);
    superpositionInputsRef.current = newInputs;
    const activeCount = newInputs.filter((v) => v > 0).length;
    const isClean = activeCount <= Math.max(1, Math.floor(superpositionD * 0.8));
    soundFX.playSuperpositionResonance(superpositionSparsity, isClean);
  };

  const handleReoptimizeWeights = (newM?: number, newD?: number) => {
    const targetM = newM ?? superpositionM;
    const targetD = newD ?? superpositionD;
    superpositionWeightsRef.current = generateSuperpositionWeights(targetM, targetD);
    superpositionInputsRef.current = sampleSparseInput(targetM, superpositionSparsity);
    soundFX.playTap();
  };

  const handleJumpGrokkingCliff = () => {
    const wd = grokkingWeightDecay;
    const red = grokkingDataRedundancy;
    const tCrit =
      wd < 0.05
        ? 5000
        : Math.round((3600 / Math.max(0.08, wd)) * (1 / Math.sqrt(Math.max(0.1, red))));
    grokkingStepRef.current = Math.max(0, tCrit - 200);
    setGrokkingStep(grokkingStepRef.current);
    soundFX.playSuccess();
  };

  const currentDossier = FIRST_PRINCIPLES_SIM_DOSSIERS[mode];

  return (
    <div className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-5 animate-fade-in">
      {/* Simulation Mode Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200/60 dark:border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Interactive First-Principles Physical Laboratory
          </span>
          <h2 className="text-lg font-bold text-ink-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Live Invariant Canvas: See the Mathematical Jump in Action
          </h2>
        </div>

        {/* 7 Interactive Simulation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-ink-100 dark:bg-ink-800 rounded-xl border border-ink-200/60 dark:border-white/5 flex-wrap">
          <button
            onClick={() => handleModeChange('thermodynamic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'thermodynamic'
                ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30 ring-1 ring-amber-400/50'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            1. Thermodynamic
          </button>

          <button
            onClick={() => handleModeChange('quantum')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'quantum'
                ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 ring-1 ring-blue-400/50'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            2. Quantum Bandgap
          </button>

          <button
            onClick={() => handleModeChange('attention')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'attention'
                ? 'bg-pink-600 text-white font-bold shadow-md shadow-pink-600/30 ring-1 ring-pink-400/50'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            3. Dynamic Attention
          </button>

          <button
            onClick={() => handleModeChange('geometry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'geometry'
                ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30 ring-1 ring-cyan-400/50'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            4. High-Dim Geometry
          </button>

          <button
            onClick={() => handleModeChange('neural_ode')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'neural_ode'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/50'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            5. Neural ODE Flow
          </button>

          <button
            onClick={() => handleModeChange('saddle_escape')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'saddle_escape'
                ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30 ring-1 ring-purple-400/50'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            6. Loss Landscape & Skips
          </button>

          <button
            onClick={() => handleModeChange('grokking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'grokking'
                ? 'bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30 ring-1 ring-violet-400/50'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            7. Grokking
          </button>

          <button
            onClick={() => handleModeChange('superposition')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'superposition'
                ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/30 ring-1 ring-amber-400/50'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            8. Superposition Paradox
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-ink-200 dark:border-white/10 bg-ink-950 shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-80 sm:h-96 block cursor-crosshair touch-none select-none"
          title="Interactive Physical Simulation Canvas - Drag to rotate 3D view"
          onMouseDown={(e) => {
            isDraggingCanvasRef.current = true;
            dragStartCanvasRef.current = { x: e.clientX, y: e.clientY };
          }}
          onMouseMove={(e) => {
            if (isDraggingCanvasRef.current) {
              const dx = e.clientX - dragStartCanvasRef.current.x;
              const dy = e.clientY - dragStartCanvasRef.current.y;
              dragStartCanvasRef.current = { x: e.clientX, y: e.clientY };
              if (mode === 'geometry') {
                geomYawRef.current += dx * 0.01;
                geomPitchRef.current = Math.max(-1.4, Math.min(1.4, geomPitchRef.current + dy * 0.01));
              } else if (mode === 'saddle_escape') {
                saddleYawRef.current += dx * 0.01;
                saddlePitchRef.current = Math.max(-1.3, Math.min(1.3, saddlePitchRef.current + dy * 0.01));
              } else if (mode === 'superposition') {
                superpositionYawRef.current += dx * 0.01;
                superpositionPitchRef.current = Math.max(-1.4, Math.min(1.4, superpositionPitchRef.current + dy * 0.01));
              }
            }
          }}
          onMouseUp={() => {
            isDraggingCanvasRef.current = false;
          }}
          onMouseLeave={() => {
            isDraggingCanvasRef.current = false;
          }}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              isDraggingCanvasRef.current = true;
              dragStartCanvasRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
          }}
          onTouchMove={(e) => {
            if (isDraggingCanvasRef.current && e.touches.length > 0) {
              const dx = e.touches[0].clientX - dragStartCanvasRef.current.x;
              const dy = e.touches[0].clientY - dragStartCanvasRef.current.y;
              dragStartCanvasRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
              if (mode === 'geometry') {
                geomYawRef.current += dx * 0.01;
                geomPitchRef.current = Math.max(-1.4, Math.min(1.4, geomPitchRef.current + dy * 0.01));
              } else if (mode === 'saddle_escape') {
                saddleYawRef.current += dx * 0.01;
                saddlePitchRef.current = Math.max(-1.3, Math.min(1.3, saddlePitchRef.current + dy * 0.01));
              } else if (mode === 'superposition') {
                superpositionYawRef.current += dx * 0.01;
                superpositionPitchRef.current = Math.max(-1.4, Math.min(1.4, superpositionPitchRef.current + dy * 0.01));
              }
            }
          }}
          onTouchEnd={() => {
            isDraggingCanvasRef.current = false;
          }}
        />

        {/* Floating Canvas Overlays & Controls */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-ink-900/90 backdrop-blur-md border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              title={isRunning ? 'Pause Simulation' : 'Run Simulation'}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              title="Reset Simulation State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {mode === 'thermodynamic' && (
              <button
                onClick={handleTriggerReverse}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer shadow-xs ${
                  reverseDrift
                    ? 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-400/50'
                    : 'bg-amber-500 hover:bg-amber-400 text-ink-950'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {reverseDrift ? 'Reverse Langevin Active' : 'Reverse Arrow of Time (Denoise)'}
              </button>
            )}

            {mode === 'geometry' && (
              <button
                onClick={handleResampleGeometry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white cursor-pointer transition-all shadow-xs"
                title="Re-sample Random Vectors on Hypersphere"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Re-sample Geometry
              </button>
            )}

            {mode === 'neural_ode' && (
              <button
                onClick={handleToggleOdeReverse}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer shadow-xs ${
                  odeReverse
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/50'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                }`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                {odeReverse ? 'Reverse Adjoint Active (t → 0)' : 'Reverse Flow (Adjoint)'}
              </button>
            )}

            {mode === 'saddle_escape' && (
              <button
                onClick={handlePerturbSaddle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white cursor-pointer transition-all shadow-xs"
                title="Inject Thermal Langevin Perturbation"
              >
                <Zap className="w-3.5 h-3.5" />
                Perturb Particles
              </button>
            )}

            {mode === 'grokking' && (
              <button
                onClick={handleJumpGrokkingCliff}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-all shadow-xs"
                title="Fast Forward to Grokking Cliff"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Jump to Cliff
              </button>
            )}

            {mode === 'superposition' && (
              <>
                <button
                  onClick={handleSampleSuperposition}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white cursor-pointer transition-all shadow-xs"
                  title="Sample New Random Sparse Input Activations"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Sample Inputs
                </button>
                <button
                  onClick={() => handleReoptimizeWeights()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs bg-brand-600 hover:bg-brand-500 text-white cursor-pointer transition-all shadow-xs"
                  title="Re-optimize Polytope Packing Equilibrium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Re-pack
                </button>
              </>
            )}
          </div>

          {/* Dynamic Status Metric */}
          <div className="flex items-center gap-3 font-mono text-[11px] text-ink-300">
            {mode === 'thermodynamic' && (
              <div>
                Entropy Dissipation:{' '}
                <strong className={reverseDrift ? 'text-blue-400' : 'text-amber-400'}>
                  {entropyLevel}%
                </strong>
              </div>
            )}
            {mode === 'quantum' && (
              <div>
                Thermal Energy: <strong className="text-emerald-400">{thermalTemp} K</strong> · Bandgap:{' '}
                <strong className="text-red-400">1.12 eV</strong>
              </div>
            )}
            {mode === 'attention' && (
              <div>
                Query:{' '}
                <strong className="text-pink-400">"{tokens[selectedTokenIndex].word}"</strong> · Temperature:{' '}
                <strong className="text-cyan-400">τ = {softmaxTemp.toFixed(1)}</strong>
              </div>
            )}
            {mode === 'geometry' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  Dimension: <strong className="text-cyan-400">d = {dimension}</strong>
                </span>
                <span>·</span>
                {geomSubMode === 'equator' && (
                  <>
                    <span>
                      Variance:{' '}
                      <strong className="text-purple-400">
                        1/d = {(1 / dimension).toFixed(dimension >= 100 ? 5 : 3)}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Equator Belt [−0.05, +0.05]:{' '}
                      <strong
                        className={geomData.equatorBeltProb > 0.8 ? 'text-emerald-400' : 'text-amber-400'}
                      >
                        {(geomData.equatorBeltProb * 100).toFixed(1)}%
                      </strong>
                    </span>
                  </>
                )}
                {geomSubMode === 'shell' && (
                  <>
                    <span>
                      Mean Radius:{' '}
                      <strong className="text-pink-400">
                        E[r] = {geomData.meanRadius.toFixed(4)}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Outer 5% Crust:{' '}
                      <strong
                        className={geomData.outerShellFraction > 0.8 ? 'text-amber-400' : 'text-cyan-400'}
                      >
                        {(geomData.outerShellFraction * 100).toFixed(1)}%
                      </strong>
                    </span>
                  </>
                )}
                {geomSubMode === 'distance' && (
                  <>
                    <span>
                      Mean Distance:{' '}
                      <strong className="text-emerald-400">
                        ||u−v|| = {geomData.meanDistance.toFixed(4)} (→ √2)
                      </strong>
                    </span>
                    <span>·</span>
                    <span>
                      Variance:{' '}
                      <strong className="text-purple-400">
                        {(geomData.varDistance).toFixed(5)}
                      </strong>
                    </span>
                  </>
                )}
              </div>
            )}
            {mode === 'neural_ode' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  Time: <strong className="text-cyan-400">t = {odeTime.toFixed(2)}</strong>
                </span>
                <span>·</span>
                <span>
                  Memory: <strong className="text-emerald-400">O(1) Adjoint</strong>
                </span>
                <span>·</span>
                <span>
                  Invertibility: <strong className="text-purple-400">Det(J) &gt; 0</strong>
                </span>
              </div>
            )}
            {mode === 'saddle_escape' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  Highway: <strong className="text-purple-400">α = {residualAlpha.toFixed(2)}</strong>
                </span>
                <span>·</span>
                <span>
                  Dim: <strong className="text-cyan-400">d = {landscapeDim}</strong>
                </span>
                <span>·</span>
                <span>
                  Momentum: <strong className="text-emerald-400">β = {saddleMomentum.toFixed(2)}</strong>
                </span>
                <span>·</span>
                <span>
                  Saddle 2^-d: <strong className="text-amber-400">{(Math.pow(2, -landscapeDim / 6)).toFixed(4)}</strong>
                </span>
              </div>
            )}
            {mode === 'superposition' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  M = <strong className="text-amber-400">{superpositionM}</strong>
                </span>
                <span>·</span>
                <span>
                  d = <strong className="text-cyan-400">{superpositionD}</strong>
                </span>
                <span>·</span>
                <span>
                  Sparsity: <strong className="text-emerald-400">{(1 - superpositionSparsity).toFixed(2)}</strong>
                </span>
                <span>·</span>
                <span>
                  Threshold: <strong className="text-purple-400">b = {superpositionThreshold.toFixed(2)}</strong>
                </span>
              </div>
            )}
            {mode === 'grokking' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  Step: <strong className="text-cyan-400">{grokkingStep.toLocaleString()}</strong>
                </span>
                <span>·</span>
                <span>
                  Decay λ: <strong className="text-purple-400">{grokkingWeightDecay.toFixed(2)}</strong>
                </span>
                <span>·</span>
                <span>
                  State:{' '}
                  <strong
                    className={
                      grokkingStep >=
                      (grokkingWeightDecay < 0.05
                        ? 10001
                        : Math.round(
                            (3600 / Math.max(0.08, grokkingWeightDecay)) *
                              (1 / Math.sqrt(Math.max(0.1, grokkingDataRedundancy)))
                          ))
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }
                  >
                    {grokkingStep >=
                    (grokkingWeightDecay < 0.05
                      ? 10001
                      : Math.round(
                          (3600 / Math.max(0.08, grokkingWeightDecay)) *
                            (1 / Math.sqrt(Math.max(0.1, grokkingDataRedundancy)))
                        ))
                      ? 'Grokked (Fourier Circuit)'
                      : 'Memorization'}
                  </strong>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mode-Specific Interactive Sliders & Parameter Control Deck */}
      <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/40 border border-ink-200/60 dark:border-white/5 space-y-3">
        {mode === 'thermodynamic' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">
                  Brownian Noise Variance (Diffusion Speed):
                </span>
                <span className="font-mono text-brand-600 dark:text-brand-400">
                  {diffusionNoise.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={diffusionNoise}
                onChange={(e) => setDiffusionNoise(parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>
            <div className="text-[11px] text-ink-500 dark:text-ink-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Forward diffusion slowly destroys semantic structure with Gaussian noise. Reversing
                time (Score Matching) pulls particles back along the learned gradient vector field{' '}
                <MathView math="\nabla_x \log p(x)" />.
              </span>
            </div>
          </div>
        )}

        {mode === 'quantum' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300 flex items-center gap-1">
                  Lattice Temperature (Thermal Energy <MathView math="k_B T" />):
                </span>
                <span className="font-mono text-brand-600 dark:text-brand-400">{thermalTemp} Kelvin</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="25"
                value={thermalTemp}
                onChange={(e) => setThermalTemp(parseInt(e.target.value, 10))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Gate Electric Field (Voltage Bias):</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">
                  {electricField.toFixed(1)} V/μm
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={electricField}
                onChange={(e) => setElectricField(parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {mode === 'attention' && (
          <div className="space-y-3 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-mono text-ink-400 mr-1">Select Query Token:</span>
              {tokens.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTokenIndex(idx)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    selectedTokenIndex === idx
                      ? 'bg-pink-600 text-white font-bold'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200'
                  }`}
                >
                  {t.word}
                </button>
              ))}
            </div>

            <div className="space-y-1.5 max-w-md">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Softmax Temperature (τ):</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">
                  {softmaxTemp.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.1"
                value={softmaxTemp}
                onChange={(e) => setSoftmaxTemp(parseFloat(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-400 font-mono">
                <span>0.1 (Hard Argmax)</span>
                <span>1.0 (Standard)</span>
                <span>3.0 (Uniform Blur)</span>
              </div>
            </div>
          </div>
        )}

        {mode === 'geometry' && (
          <div className="space-y-4 text-xs">
            {/* 3 High-Dimensional First-Principles Sub-Modes */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                Canonical High-Dimensional Phenomenon:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setGeomSubMode('equator');
                    soundFX.playTap();
                  }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    geomSubMode === 'equator'
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/50'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700 border border-ink-200/60 dark:border-white/5'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  1. Equator Belt (Levy's Lemma)
                </button>
                <button
                  onClick={() => {
                    setGeomSubMode('shell');
                    soundFX.playTap();
                  }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    geomSubMode === 'shell'
                      ? 'bg-amber-600 text-white font-bold shadow-md shadow-amber-600/25 ring-2 ring-amber-400/50'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700 border border-ink-200/60 dark:border-white/5'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  2. Orange Peel (Volume Crust)
                </button>
                <button
                  onClick={() => {
                    setGeomSubMode('distance');
                    soundFX.playTap();
                  }}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    geomSubMode === 'distance'
                      ? 'bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/25 ring-2 ring-cyan-400/50'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700 border border-ink-200/60 dark:border-white/5'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  3. Distance Collapse (√2 Metric)
                </button>
              </div>
            </div>

            {/* Sub-mode Specific Explanatory & Zoom Banners */}
            {geomSubMode === 'equator' && (
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-ink-100 dark:bg-ink-800/80 border border-ink-200/60 dark:border-white/5">
                <span className="text-[11px] font-mono text-ink-500 dark:text-ink-400 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-emerald-500" />
                  Equator Belt: <MathView math="\mathbb{P}(|\cos\theta| \le 0.05)" /> approaches 100% via Levy's Lemma.
                </span>
                <div className="flex items-center gap-1.5 bg-ink-200/60 dark:bg-ink-900/60 p-1 rounded-lg">
                  <button
                    onClick={() => {
                      setGeomZoomMode('adaptive');
                      soundFX.playTap();
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                      geomZoomMode === 'adaptive'
                        ? 'bg-brand-500 text-white font-bold shadow-xs'
                        : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    Adaptive Gaussian (±4σ Zoom)
                  </button>
                  <button
                    onClick={() => {
                      setGeomZoomMode('global');
                      soundFX.playTap();
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
                      geomZoomMode === 'global'
                        ? 'bg-brand-500 text-white font-bold shadow-xs'
                        : 'text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    Global View ([-1, 1] Dirac Spike)
                  </button>
                </div>
              </div>
            )}

            {geomSubMode === 'shell' && (
              <div className="p-2.5 rounded-xl bg-ink-100 dark:bg-ink-800/80 border border-ink-200/60 dark:border-white/5 text-[11px] font-mono text-ink-500 dark:text-ink-300 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  The Orange Peel Paradox: In <MathView math="d=100" />, a solid unit ball has{' '}
                  <strong className="text-amber-400">99.4%</strong> of its volume in the outer 5% shell ($1 - 0.95^{100}$). The core is virtually empty void!
                </span>
              </div>
            )}

            {geomSubMode === 'distance' && (
              <div className="p-2.5 rounded-xl bg-ink-100 dark:bg-ink-800/80 border border-ink-200/60 dark:border-white/5 text-[11px] font-mono text-ink-500 dark:text-ink-300 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                <span>
                  Metric Distance Collapse: As <MathView math="d \to 4096" />, all pairwise Euclidean distances collapse to{' '}
                  <strong className="text-cyan-400">\|u - v\|_2 \to \sqrt{2} \approx 1.4142</strong> with vanishing variance <MathView math="1/(2d)" />. Contrast disappears!
                </span>
              </div>
            )}

            {/* Dimension Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-cyan-500 shrink-0" />
                  Select Dimension (<MathView math="d" />):
                </span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  d = {dimension}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {DIMENSION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleDimensionChange(opt)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      dimension === opt
                        ? 'bg-brand-500 text-white font-bold shadow-md shadow-brand-500/25 ring-2 ring-brand-400/50'
                        : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700 border border-ink-200/60 dark:border-white/5'
                    }`}
                  >
                    <span className="text-sm font-bold">{opt}D</span>
                    <span className="text-[10px] opacity-75">
                      {opt === 2
                        ? 'Circle'
                        : opt === 3
                        ? 'Sphere'
                        : opt === 10
                        ? 'Latent'
                        : opt === 50
                        ? 'Manifold'
                        : opt === 100
                        ? 'High-Dim'
                        : 'LLM Embed'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Vector Sampling & 3D Interaction Tip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 items-end">
              <div className="space-y-1.5">
                <div className="flex justify-between font-medium">
                  <span className="text-ink-600 dark:text-ink-300">
                    Sample Count (<MathView math="N" /> vectors):
                  </span>
                  <span className="font-mono text-brand-600 dark:text-brand-400">
                    {sampleCount} vectors ({geomData.totalPairs.toLocaleString()} pairs)
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={sampleCount}
                  onChange={(e) => setSampleCount(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleResampleGeometry}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-500 hover:bg-brand-400 text-white transition-all cursor-pointer shadow-xs w-full"
                >
                  <RotateCcw className="w-4 h-4" />
                  Re-sample Geometry
                </button>
              </div>
            </div>

            <div className="text-[10px] font-mono text-ink-400 flex items-center justify-between pt-1 border-t border-ink-200/40 dark:border-white/5">
              <span>🖱️ Drag on 3D Globe to rotate Pitch & Yaw</span>
              <span>⚡ 60 FPS First-Principles Haar Hypersphere Measure</span>
            </div>
          </div>
        )}

        {mode === 'neural_ode' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Continuous Depth Scrubber (t):</span>
                <span className="font-mono text-cyan-400">{odeTime.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.01"
                value={odeTime}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  odeTimeRef.current = val;
                  setOdeTime(val);
                }}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-400 font-mono">
                <span>0.0 (Tangled Spiral)</span>
                <span>0.5 (Flow Field)</span>
                <span>1.0 (Untangled Clusters)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Flow Integration Speed:</span>
                <span className="font-mono text-cyan-400">{odeSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.1"
                value={odeSpeed}
                onChange={(e) => setOdeSpeed(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-ink-600 dark:text-ink-300 font-medium block">Numerical ODE Integrator:</span>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setOdeSolver('rk4')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    odeSolver === 'rk4'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-400 hover:text-white'
                  }`}
                >
                  RK4 (Dormand-Prince)
                </button>
                <button
                  onClick={() => setOdeSolver('euler')}
                  className={`flex-1 py-1.5 px-2 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                    odeSolver === 'euler'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'bg-ink-100 dark:bg-ink-800 text-ink-400 hover:text-white'
                  }`}
                >
                  Euler (Discrete Drift)
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'saddle_escape' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Slider 1: Residual Highway Alpha */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-ink-100/70 dark:bg-ink-900/60 border border-ink-200/50 dark:border-white/5">
                <div className="flex justify-between font-medium">
                  <span className="text-ink-600 dark:text-ink-300">Residual Highway (α):</span>
                  <span className="font-mono text-purple-400">{residualAlpha.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={residualAlpha}
                  onChange={(e) => setResidualAlpha(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-ink-400 font-mono">
                  <span>0.0 (VGG Chaos)</span>
                  <span>1.0 (ResNet Funnel)</span>
                </div>
              </div>

              {/* Slider 2: Dimension d (Dauphin Saddle Ratio) */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-ink-100/70 dark:bg-ink-900/60 border border-ink-200/50 dark:border-white/5">
                <div className="flex justify-between font-medium">
                  <span className="text-ink-600 dark:text-ink-300">Dimension (d):</span>
                  <span className="font-mono text-cyan-400">d = {landscapeDim}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="100"
                  step="2"
                  value={landscapeDim}
                  onChange={(e) => {
                    const d = parseInt(e.target.value, 10);
                    setLandscapeDim(d);
                    soundFX.playDimensionCollapseChord(d);
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-ink-400 font-mono">
                  <span>2 (Saddles Rare)</span>
                  <span>100 (2^-d Escape)</span>
                </div>
              </div>

              {/* Slider 3: Heavy-Ball Momentum */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-ink-100/70 dark:bg-ink-900/60 border border-ink-200/50 dark:border-white/5">
                <div className="flex justify-between font-medium">
                  <span className="text-ink-600 dark:text-ink-300">Momentum (β):</span>
                  <span className="font-mono text-emerald-400">{saddleMomentum.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.98"
                  step="0.02"
                  value={saddleMomentum}
                  onChange={(e) => setSaddleMomentum(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-ink-400 font-mono">
                  <span>0.0 (Massless)</span>
                  <span>0.98 (Heavy Ball)</span>
                </div>
              </div>

              {/* Slider 4: Learning Rate */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-ink-100/70 dark:bg-ink-900/60 border border-ink-200/50 dark:border-white/5">
                <div className="flex justify-between font-medium">
                  <span className="text-ink-600 dark:text-ink-300">Learning Rate (η):</span>
                  <span className="font-mono text-amber-400">{saddleLr.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.25"
                  step="0.01"
                  value={saddleLr}
                  onChange={(e) => setSaddleLr(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-ink-400 font-mono">
                  <span>0.01 (Slow)</span>
                  <span>0.25 (Aggressive)</span>
                </div>
              </div>

              {/* Slider 5: Langevin Thermal Noise */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-ink-100/70 dark:bg-ink-900/60 border border-ink-200/50 dark:border-white/5">
                <div className="flex justify-between font-medium">
                  <span className="text-ink-600 dark:text-ink-300">Langevin Noise (σ):</span>
                  <span className="font-mono text-pink-400">{saddleNoise.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.25"
                  step="0.01"
                  value={saddleNoise}
                  onChange={(e) => setSaddleNoise(parseFloat(e.target.value))}
                  className="w-full accent-pink-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-ink-400 font-mono">
                  <span>0.0 (Deterministic)</span>
                  <span>0.25 (Thermal Kick)</span>
                </div>
              </div>
            </div>

            {/* Quick Architectural Presets */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] font-mono text-ink-400">Architectural Presets:</span>
              <button
                onClick={() => {
                  setResidualAlpha(0.0);
                  setLandscapeDim(2);
                  soundFX.playTap();
                }}
                className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold bg-ink-200 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:text-white cursor-pointer"
              >
                VGG Plain Net (α=0, d=2: Fractured Chaos)
              </button>
              <button
                onClick={() => {
                  setResidualAlpha(0.5);
                  setLandscapeDim(10);
                  soundFX.playTap();
                }}
                className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold bg-ink-200 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:text-white cursor-pointer"
              >
                Half-Skip Transition (α=0.5, d=10)
              </button>
              <button
                onClick={() => {
                  setResidualAlpha(1.0);
                  setLandscapeDim(50);
                  soundFX.playTap();
                }}
                className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold bg-brand-600/30 text-brand-300 border border-brand-500/40 hover:bg-brand-600 hover:text-white cursor-pointer"
              >
                ResNet Identity Highway (α=1.0, d=50: Convex Funnel)
              </button>
            </div>
          </div>
        )}

        {mode === 'grokking' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Weight Decay Regularizer (λ):</span>
                <span className="font-mono text-purple-400">{grokkingWeightDecay.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.9"
                step="0.05"
                value={grokkingWeightDecay}
                onChange={(e) => setGrokkingWeightDecay(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink-400 font-mono">
                <span>0.0 (Never Groks)</span>
                <span>0.35 (Optimal)</span>
                <span>0.9 (Heavy Decay)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Dataset Redundancy / Split:</span>
                <span className="font-mono text-cyan-400">
                  {Math.round(grokkingDataRedundancy * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.8"
                step="0.05"
                value={grokkingDataRedundancy}
                onChange={(e) => setGrokkingDataRedundancy(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Step Scrubber:</span>
                <span className="font-mono text-amber-400">{grokkingStep.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={grokkingStep}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  grokkingStepRef.current = val;
                  setGrokkingStep(val);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {mode === 'superposition' && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Slider 1: Feature Count M */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-ink-100/70 dark:bg-ink-900/60 border border-ink-200/50 dark:border-white/5">
                <div className="flex justify-between font-medium">
                  <span className="text-ink-600 dark:text-ink-300">Feature Count (M):</span>
                  <span className="font-mono text-amber-400">M = {superpositionM}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="24"
                  step="1"
                  value={superpositionM}
                  onChange={(e) => {
                    const m = parseInt(e.target.value, 10);
                    setSuperpositionM(m);
                    handleReoptimizeWeights(m, superpositionD);
                  }}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-ink-400 font-mono">
                  <span>3 Features</span>
                  <span>24 Features</span>
                </div>
              </div>

              {/* Slider 2: Bottleneck Dimension d */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-ink-100/70 dark:bg-ink-900/60 border border-ink-200/50 dark:border-white/5">
                <div className="flex justify-between font-medium">
                  <span className="text-ink-600 dark:text-ink-300">Bottleneck Dim (d):</span>
                  <span className="font-mono text-cyan-400">d = {superpositionD}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={superpositionD}
                  onChange={(e) => {
                    const d = parseInt(e.target.value, 10);
                    setSuperpositionD(d);
                    handleReoptimizeWeights(superpositionM, d);
                  }}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-ink-400 font-mono">
                  <span>2D (Circle)</span>
                  <span>8D (Hyper-volume)</span>
                </div>
              </div>

              {/* Slider 3: Sparsity p */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-ink-100/70 dark:bg-ink-900/60 border border-ink-200/50 dark:border-white/5">
                <div className="flex justify-between font-medium">
                  <span className="text-ink-600 dark:text-ink-300">Activation Prob (p):</span>
                  <span className="font-mono text-emerald-400">p = {superpositionSparsity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.60"
                  step="0.02"
                  value={superpositionSparsity}
                  onChange={(e) => {
                    const s = parseFloat(e.target.value);
                    setSuperpositionSparsity(s);
                    const newInputs = sampleSparseInput(superpositionM, s);
                    superpositionInputsRef.current = newInputs;
                    const active = newInputs.filter((v) => v > 0).length;
                    const isClean = active <= Math.max(1, Math.floor(superpositionD * 0.8));
                    soundFX.playSuperpositionResonance(s, isClean);
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-ink-400 font-mono">
                  <span>0.02 (98% Sparse)</span>
                  <span>0.60 (Dense Storm)</span>
                </div>
              </div>

              {/* Slider 4: ReLU Threshold b */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-ink-100/70 dark:bg-ink-900/60 border border-ink-200/50 dark:border-white/5">
                <div className="flex justify-between font-medium">
                  <span className="text-ink-600 dark:text-ink-300">ReLU Threshold (b):</span>
                  <span className="font-mono text-purple-400">b = {superpositionThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="0.35"
                  step="0.01"
                  value={superpositionThreshold}
                  onChange={(e) => setSuperpositionThreshold(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-ink-400 font-mono">
                  <span>0.00 (Pass Through)</span>
                  <span>0.35 (Heavy Filter)</span>
                </div>
              </div>
            </div>

            {/* Quick Geometric Presets */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-[11px] font-mono text-ink-400">Polytope Presets:</span>
              <button
                onClick={() => {
                  setSuperpositionM(3);
                  setSuperpositionD(2);
                  setSuperpositionSparsity(0.33);
                  handleReoptimizeWeights(3, 2);
                }}
                className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold bg-ink-200 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:text-white cursor-pointer"
              >
                2D Mercedes Star (M=3, d=2, 120°)
              </button>
              <button
                onClick={() => {
                  setSuperpositionM(4);
                  setSuperpositionD(2);
                  setSuperpositionSparsity(0.25);
                  handleReoptimizeWeights(4, 2);
                }}
                className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold bg-ink-200 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:text-white cursor-pointer"
              >
                2D Antipodal Pairs (M=4, d=2, w_j = -w_i)
              </button>
              <button
                onClick={() => {
                  setSuperpositionM(16);
                  setSuperpositionD(4);
                  setSuperpositionSparsity(0.08);
                  handleReoptimizeWeights(16, 4);
                }}
                className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold bg-brand-600/30 text-brand-300 border border-brand-500/40 hover:bg-brand-600 hover:text-white cursor-pointer"
              >
                High-Dim Overcomplete (M=16, d=4, 92% Sparse)
              </button>
              <button
                onClick={() => {
                  setSuperpositionM(16);
                  setSuperpositionD(2);
                  setSuperpositionSparsity(0.50);
                  handleReoptimizeWeights(16, 2);
                }}
                className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600 hover:text-white cursor-pointer"
              >
                Interference Collapse (M=16, d=2, 50% Active)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* FIRST-PRINCIPLES DOSSIER: THE FOUR FUNDAMENTAL PILLARS */}
      {/* ===================================================================== */}
      <div className="p-4 sm:p-5 rounded-2xl bg-ink-100/70 dark:bg-ink-900/80 border border-ink-200/80 dark:border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-200/60 dark:border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-500 dark:text-brand-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink-900 dark:text-white flex items-center gap-2">
                First-Principles Dossier: {currentDossier.modeName}
              </h3>
              <p className="text-[11px] text-ink-500 dark:text-ink-400">{currentDossier.tagline}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 font-semibold">
            Governing Physical Invariants
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Governing Invariant */}
          <div className="p-4 rounded-xl bg-surface dark:bg-ink-950/80 border border-indigo-500/25 dark:border-indigo-500/35 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-2.5 shadow-xs group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 dark:text-indigo-400">
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  1. Governing Invariant
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Symmetry
                </span>
              </div>
              <div className="font-bold text-xs text-ink-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                {currentDossier.invariant.title}
              </div>
              <div className="p-2.5 rounded-lg bg-ink-900/90 dark:bg-black/60 border border-indigo-500/20 text-center font-mono overflow-x-auto no-scrollbar shadow-inner">
                <MathView math={currentDossier.invariant.equation} display={true} className="text-indigo-300 text-xs sm:text-[13px]" />
              </div>
            </div>
            <p className="text-[11px] text-ink-600 dark:text-ink-300 leading-relaxed pt-2 border-t border-ink-100 dark:border-white/5">
              {currentDossier.invariant.explanation}
            </p>
          </div>

          {/* Card 2: Dynamic Force */}
          <div className="p-4 rounded-xl bg-surface dark:bg-ink-950/80 border border-amber-500/25 dark:border-amber-500/35 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-2.5 shadow-xs group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500 dark:text-amber-400">
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  2. Dynamic Force
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Gradient
                </span>
              </div>
              <div className="font-bold text-xs text-ink-900 dark:text-white group-hover:text-amber-400 transition-colors">
                {currentDossier.force.title}
              </div>
              <div className="p-2.5 rounded-lg bg-ink-900/90 dark:bg-black/60 border border-amber-500/20 text-center font-mono overflow-x-auto no-scrollbar shadow-inner">
                <MathView math={currentDossier.force.equation} display={true} className="text-amber-300 text-xs sm:text-[13px]" />
              </div>
            </div>
            <p className="text-[11px] text-ink-600 dark:text-ink-300 leading-relaxed pt-2 border-t border-ink-100 dark:border-white/5">
              {currentDossier.force.explanation}
            </p>
          </div>

          {/* Card 3: Scale Normalizer */}
          <div className="p-4 rounded-xl bg-surface dark:bg-ink-950/80 border border-cyan-500/25 dark:border-cyan-500/35 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-2.5 shadow-xs group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-500 dark:text-cyan-400">
                  <Gauge className="w-3.5 h-3.5 shrink-0" />
                  3. Scale Normalizer
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Variance
                </span>
              </div>
              <div className="font-bold text-xs text-ink-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                {currentDossier.normalizer.title}
              </div>
              <div className="p-2.5 rounded-lg bg-ink-900/90 dark:bg-black/60 border border-cyan-500/20 text-center font-mono overflow-x-auto no-scrollbar shadow-inner">
                <MathView math={currentDossier.normalizer.equation} display={true} className="text-cyan-300 text-xs sm:text-[13px]" />
              </div>
            </div>
            <p className="text-[11px] text-ink-600 dark:text-ink-300 leading-relaxed pt-2 border-t border-ink-100 dark:border-white/5">
              {currentDossier.normalizer.explanation}
            </p>
          </div>

          {/* Card 4: Physical Conservation Law */}
          <div className="p-4 rounded-xl bg-surface dark:bg-ink-950/80 border border-emerald-500/25 dark:border-emerald-500/35 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-2.5 shadow-xs group">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 dark:text-emerald-400">
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  4. Conservation Law
                </span>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Capacity
                </span>
              </div>
              <div className="font-bold text-xs text-ink-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                {currentDossier.conservationLaw.title}
              </div>
              <div className="p-2.5 rounded-lg bg-ink-900/90 dark:bg-black/60 border border-emerald-500/20 text-center font-mono overflow-x-auto no-scrollbar shadow-inner">
                <MathView math={currentDossier.conservationLaw.equation} display={true} className="text-emerald-300 text-xs sm:text-[13px]" />
              </div>
            </div>
            <p className="text-[11px] text-ink-600 dark:text-ink-300 leading-relaxed pt-2 border-t border-ink-100 dark:border-white/5">
              {currentDossier.conservationLaw.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
