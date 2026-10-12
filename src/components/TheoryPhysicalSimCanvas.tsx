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
  | 'grokking';

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
    modeName: 'Loss Landscape & Saddle Point Escape',
    tagline: 'Hessian Negative Curvature Eigenvectors and Kinetic Energy Barrier Crossing',
    invariant: {
      title: 'Hessian Spectral Signature',
      equation: '\\lambda_{\\min}(\\nabla^2 L(x^*)) < 0, \\quad \\nabla L(x^*) = 0',
      explanation:
        'In high dimensions, critical points are almost never local minima; they possess strict saddle geometry with both positive (confining) and negative (escape) curvature directions.',
    },
    force: {
      title: 'Heavy-Ball Momentum & Langevin Kick',
      equation: '\\mathbf{v}_{t+1} = \\beta \\mathbf{v}_t - \\eta \\nabla L(\\mathbf{x}_t) + \\sigma \\sqrt{\\eta} \\boldsymbol{\\xi}_t',
      explanation:
        'While vanilla SGD halts where grad L is zero, momentum accumulates kinetic energy and Langevin noise perturbs the particle onto the negative curvature eigenvector.',
    },
    normalizer: {
      title: 'Spectral Step-Size Bound',
      equation: '\\eta < \\frac{2(1 + \\beta)}{\\lambda_{\\max}}, \\quad \\kappa = \\frac{\\lambda_{\\max}}{|\\lambda_{\\min}|}',
      explanation:
        'Prevents runaway oscillations across steep positive curvature canyon walls while allowing acceleration along the shallow negative curvature chute.',
    },
    conservationLaw: {
      title: 'Phase Space Energy Dissipation',
      equation: '\\frac{d}{dt}\\left(\\frac{1}{2}\\|v\\|^2 + L(x)\\right) = -\\gamma \\|v\\|^2 + \\text{noise}',
      explanation:
        'Heavy-ball optimization is isomorphic to a damped physical particle with mass. Stored kinetic energy overcomes flat saddle plateaus that trap massless gradient descent.',
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
};

// =============================================================================
// GEOMETRY SIMULATION LOGIC
// =============================================================================

interface GeometryData {
  vectors: Float32Array[];
  cosineSimilarities: number[];
  mean: number;
  variance: number;
  stdDev: number;
  tailProb: number;
  histogram: number[];
  binCenters: number[];
  maxBinCount: number;
  totalPairs: number;
  projectedCoords: { x: number; y: number; z: number; cosWithU0: number }[];
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
  const projectedCoords: { x: number; y: number; z: number; cosWithU0: number }[] = [];

  for (let i = 0; i < maxProj; i++) {
    const v = vectors[i];
    let cosWithU0 = 0;
    let projY = 0;
    let projZ = 0;
    for (let k = 0; k < d; k++) {
      cosWithU0 += v[k] * u0[k];
      projY += v[k] * w1[k];
      projZ += v[k] * w2[k];
    }
    cosWithU0 = Math.max(-1, Math.min(1, cosWithU0));
    const rPerp = Math.sqrt(Math.max(0, 1 - cosWithU0 * cosWithU0));
    const yzNorm = Math.sqrt(projY * projY + projZ * projZ);
    const scale = yzNorm > 1e-6 ? rPerp / yzNorm : rPerp > 0 ? rPerp : 0;

    projectedCoords.push({
      x: cosWithU0,
      y: projY * scale,
      z: projZ * scale,
      cosWithU0,
    });
  }

  const similarities: number[] = [];
  const maxPairs = 10000;
  const totalPossiblePairs = (n * (n - 1)) / 2;

  if (totalPossiblePairs <= maxPairs) {
    for (let i = 0; i < n; i++) {
      const vi = vectors[i];
      for (let j = i + 1; j < n; j++) {
        const vj = vectors[j];
        let dot = 0;
        for (let k = 0; k < d; k++) dot += vi[k] * vj[k];
        similarities.push(Math.max(-1, Math.min(1, dot)));
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
      similarities.push(Math.max(-1, Math.min(1, dot)));
    }
  }

  const numPairs = similarities.length;
  let sum = 0;
  let sumSq = 0;
  let tailCount = 0;

  for (let i = 0; i < numPairs; i++) {
    const s = similarities[i];
    sum += s;
    sumSq += s * s;
    if (Math.abs(s) > 0.05) {
      tailCount++;
    }
  }

  const mean = sum / (numPairs || 1);
  const variance = Math.max(0, sumSq / (numPairs || 1) - mean * mean);
  const stdDev = Math.sqrt(variance);
  const tailProb = tailCount / (numPairs || 1);

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

  return {
    vectors,
    cosineSimilarities: similarities,
    mean,
    variance,
    stdDev,
    tailProb,
    histogram,
    binCenters,
    maxBinCount: Math.max(1, maxBinCount),
    totalPairs: numPairs,
    projectedCoords,
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
  const [resampleTrigger, setResampleTrigger] = useState<number>(0);
  const geomAngleRef = useRef<number>(0);

  // Neural ODE Controls
  const [odeTime, setOdeTime] = useState<number>(0.0);
  const [odeReverse, setOdeReverse] = useState<boolean>(false);
  const [odeSpeed, setOdeSpeed] = useState<number>(0.4);
  const [odeSolver, setOdeSolver] = useState<'rk4' | 'euler'>('rk4');
  const odeTimeRef = useRef<number>(0.0);
  const odePointsRef = useRef<OdePoint[]>(createOdePoints());
  const odeStreamlinesRef = useRef<OdeStreamline[]>([]);

  // Saddle Escape Controls
  const [saddleMomentum, setSaddleMomentum] = useState<number>(0.9);
  const [saddleLr, setSaddleLr] = useState<number>(0.12);
  const [saddleNoise, setSaddleNoise] = useState<number>(0.08);
  const [saddleCurvature, setSaddleCurvature] = useState<number>(1.0);
  const saddleVanillaPosRef = useRef<{ x: number; y: number }>({ x: 0.04, y: 0.015 });
  const saddleVanillaTrailRef = useRef<{ x: number; y: number }[]>([]);
  const saddleMomentumPosRef = useRef<{ x: number; y: number }>({ x: 0.04, y: 0.015 });
  const saddleMomentumVelRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const saddleMomentumTrailRef = useRef<{ x: number; y: number }[]>([]);
  const saddleStepRef = useRef<number>(0);
  const saddleAngleRef = useRef<number>(-0.75);

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
      saddleVanillaPosRef.current = { x: 0.04, y: 0.015 };
      saddleVanillaTrailRef.current = [];
      saddleMomentumPosRef.current = { x: 0.04, y: 0.015 };
      saddleMomentumVelRef.current = { x: 0, y: 0 };
      saddleMomentumTrailRef.current = [];
      saddleStepRef.current = 0;
    } else if (currentMode === 'grokking') {
      grokkingStepRef.current = 0;
      setGrokkingStep(0);
      grokkingCelebratedRef.current = false;
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
      // 4. HIGH-DIMENSIONAL ORTHOGONALITY SIMULATION
      // =======================================================================
      else if (mode === 'geometry') {
        const gData = geomDataRef.current;
        if (isRunning) {
          geomAngleRef.current += 0.008 * dt;
        }
        const rot = geomAngleRef.current;

        const fHeading = 'bold 12px JetBrains Mono, monospace';
        const fSub = '10px JetBrains Mono, monospace';
        const fSmall = '9px JetBrains Mono, monospace';

        const cx = w * 0.22;
        const cy = h * 0.54;
        const R = Math.min(w * 0.16, h * 0.35);

        ctx.textAlign = 'center';
        ctx.font = fHeading;
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`HYPERSPHERE S^{${dimension - 1}} 2D PROJECTION`, cx, cy - R - 20);

        ctx.font = fSub;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(
          dimension === 4096
            ? 'Dirac Collapse: All vectors adhere to 90° Equator'
            : `Dimension d = ${dimension} · Equator Concentration`,
          cx,
          cy - R - 6
        );

        const discGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
        discGrad.addColorStop(0, 'rgba(30, 41, 59, 0.45)');
        discGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
        ctx.fillStyle = discGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        [0.25, 0.5, 0.75].forEach((ratio) => {
          ctx.beginPath();
          ctx.arc(cx, cy, R * ratio, 0, Math.PI * 2);
          ctx.stroke();
        });
        ctx.setLineDash([]);

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - R, cy);
        ctx.lineTo(cx + R, cy);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(6, 182, 212, 0.65)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, cy - R);
        ctx.lineTo(cx, cy + R);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = fSmall;
        ctx.fillStyle = '#22d3ee';
        ctx.textAlign = 'center';
        ctx.fillText('90° Equator (⊥)', cx, cy - R + 14);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#d97706';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + R, cy);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(cx + R, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();

        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'left';
        ctx.fillText('u₀ (Ref)', cx + R + 6, cy + 4);

        const projList = gData.projectedCoords;
        for (let i = 1; i < projList.length; i++) {
          const p = projList[i];
          const rx = p.x;
          const ry = p.y * Math.cos(rot) - p.z * Math.sin(rot);
          const vx = cx + rx * R;
          const vy = cy - ry * R;

          if (i < 35) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(vx, vy);
            ctx.strokeStyle =
              Math.abs(p.cosWithU0) <= 0.05
                ? 'rgba(52, 211, 153, 0.22)'
                : 'rgba(167, 139, 250, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.beginPath();
          ctx.arc(vx, vy, Math.abs(p.cosWithU0) <= 0.05 ? 2.5 : 2.0, 0, Math.PI * 2);
          if (Math.abs(p.cosWithU0) <= 0.05) {
            ctx.fillStyle = '#34d399';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            ctx.fillStyle = '#818cf8';
            ctx.fill();
          }
        }

        if (projList.length > 1) {
          const p1 = projList[1];
          const r1x = p1.x;
          const r1y = p1.y * Math.cos(rot) - p1.z * Math.sin(rot);
          const v1x = cx + r1x * R;
          const v1y = cy - r1y * R;

          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(v1x, v1y);
          ctx.stroke();
          ctx.shadowBlur = 0;

          const thetaDeg = Math.acos(Math.max(-1, Math.min(1, p1.cosWithU0))) * (180 / Math.PI);
          const arcR = Math.min(36, R * 0.45);
          const angleCanvas = Math.atan2(v1y - cy, v1x - cx);
          ctx.beginPath();
          if (angleCanvas < 0) {
            ctx.arc(cx, cy, arcR, 0, angleCanvas, true);
          } else {
            ctx.arc(cx, cy, arcR, 0, angleCanvas, false);
          }
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          const midAng = angleCanvas / 2;
          const labelDist = arcR + 14;
          const labelX = cx + Math.cos(midAng) * labelDist;
          const labelY = cy + Math.sin(midAng) * labelDist;
          ctx.font = 'bold 10px JetBrains Mono, monospace';
          ctx.fillStyle = '#34d399';
          ctx.textAlign = 'center';
          ctx.fillText(`θ = ${thetaDeg.toFixed(1)}°`, labelX, labelY);
        }

        // Histograms
        const px = w * 0.47;
        const pw = w - px - 24;
        const py = h * 0.2;
        const ph = h * 0.58;

        ctx.textAlign = 'left';
        ctx.font = fHeading;
        ctx.fillStyle = '#c084fc';
        ctx.fillText('PAIRWISE COSINE SIMILARITY: cos(θ) = u·v / (||u|| ||v||)', px, py - 20);

        ctx.font = fSub;
        if (dimension === 4096) {
          ctx.fillStyle = '#34d399';
          ctx.fillText(
            'DIRAC DELTA SPIKE δ(0) · VAR = 1/d = 0.00024 · P(|cos θ| > 0.05) → 0.0%',
            px,
            py - 6
          );
        } else if (dimension >= 50) {
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(
            `GAUSSIAN CONCENTRATION N(0, 1/d) · Var = ${(1 / dimension).toFixed(4)} · σ = ${(
              1 / Math.sqrt(dimension)
            ).toFixed(3)}`,
            px,
            py - 6
          );
        } else {
          ctx.fillStyle = '#f59e0b';
          ctx.fillText(
            `BROAD ANGULAR DISPERSION · Var = ${(1 / dimension).toFixed(3)} · P(|cos θ| > 0.05) = ${(
              gData.tailProb * 100
            ).toFixed(1)}%`,
            px,
            py - 6
          );
        }

        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, pw, ph);

        const zx1 = px + ((-0.05 + 1) / 2) * pw;
        const zx2 = px + ((0.05 + 1) / 2) * pw;
        const zw = zx2 - zx1;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fillRect(zx1, py, zw, ph);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.strokeRect(zx1, py, zw, ph);

        const cx0 = px + pw / 2;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx0, py);
        ctx.lineTo(cx0, py + ph);
        ctx.stroke();

        const numBins = 50;
        const barSlotW = pw / numBins;
        const barW = Math.max(1, barSlotW - 1);
        for (let b = 0; b < numBins; b++) {
          const cnt = gData.histogram[b];
          const center = gData.binCenters[b];
          const barFrac = cnt / gData.maxBinCount;
          const barH = barFrac * (ph - 24);
          const bx = px + b * barSlotW;
          const by = py + ph - barH;

          ctx.fillStyle = Math.abs(center) <= 0.05 ? '#10b981' : '#8b5cf6';
          ctx.fillRect(bx, by, barW, barH);
        }

        ctx.beginPath();
        const curvePoints = 120;
        for (let i = 0; i <= curvePoints; i++) {
          const t = -1 + (i / curvePoints) * 2;
          let density = 0;
          if (dimension === 2) {
            density = 1 / Math.PI / Math.sqrt(Math.max(0.008, 1 - t * t));
          } else if (dimension === 3) {
            density = 0.5;
          } else {
            density = Math.exp((-dimension * t * t) / 2);
          }
          const maxDensity =
            dimension === 2 ? 1 / Math.PI / Math.sqrt(0.008) : dimension === 3 ? 0.5 : 1.0;
          const normY = (density / maxDensity) * (ph - 24) * 0.95;
          const curveX = px + ((t + 1) / 2) * pw;
          const curveY = py + ph - normY;

          if (i === 0) ctx.moveTo(curveX, curveY);
          else ctx.lineTo(curveX, curveY);
        }
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();
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
      // 6. SADDLE POINT ESCAPE (CURVATURE & MOMENTUM)
      // =======================================================================
      else if (mode === 'saddle_escape') {
        const cx = w * 0.5;
        const cy = h * 0.52;
        const scale = Math.min(w, h) * 0.21;
        const pitch = 0.58;
        const angle = saddleAngleRef.current;
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        const project3D = (x: number, y: number, z: number) => {
          const rx = x * cosA - y * sinA;
          const ry = x * sinA + y * cosA;
          const sx = cx + scale * rx;
          const sy = cy + scale * (ry * Math.sin(pitch) - z * Math.cos(pitch));
          return { sx, sy };
        };

        const computeLoss = (x: number, y: number) => {
          return 0.5 * 1.6 * x * x - 0.5 * saddleCurvature * y * y + 0.08 * saddleCurvature * Math.pow(y, 4);
        };

        // Header Title
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('3D LOSS LANDSCAPE & SADDLE ESCAPE: L(x, y) = 1/2 λ₁ x² - 1/2 λ₂ y²', 24, 28);

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(
          `Curvature Ratio κ = ${(1.6 / Math.max(0.01, saddleCurvature)).toFixed(2)} · Negative Curvature λ₂ < 0 (Unstable Manifold)`,
          24,
          44
        );

        // 3D Wireframe Saddle Surface Grid
        const stepsX = 15;
        const stepsY = 15;
        ctx.lineWidth = 1;

        // Lines along X
        for (let j = 0; j <= stepsY; j++) {
          const y = -2.0 + (j / stepsY) * 4.0;
          ctx.beginPath();
          for (let i = 0; i <= stepsX; i++) {
            const x = -1.5 + (i / stepsX) * 3.0;
            const z = computeLoss(x, y);
            const pt = project3D(x, y, z);
            if (i === 0) ctx.moveTo(pt.sx, pt.sy);
            else ctx.lineTo(pt.sx, pt.sy);
          }
          const zMean = computeLoss(0, y);
          ctx.strokeStyle =
            zMean < -0.4
              ? 'rgba(14, 165, 233, 0.35)'
              : zMean > 0.4
              ? 'rgba(168, 85, 247, 0.28)'
              : 'rgba(71, 85, 105, 0.32)';
          ctx.stroke();
        }

        // Lines along Y
        for (let i = 0; i <= stepsX; i++) {
          const x = -1.5 + (i / stepsX) * 3.0;
          ctx.beginPath();
          for (let j = 0; j <= stepsY; j++) {
            const y = -2.0 + (j / stepsY) * 4.0;
            const z = computeLoss(x, y);
            const pt = project3D(x, y, z);
            if (j === 0) ctx.moveTo(pt.sx, pt.sy);
            else ctx.lineTo(pt.sx, pt.sy);
          }
          ctx.strokeStyle = 'rgba(71, 85, 105, 0.22)';
          ctx.stroke();
        }

        // Eigenvector Arrows at Origin
        const e1Pt = project3D(1.2, 0, computeLoss(1.2, 0));
        const origPt = project3D(0, 0, 0);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(origPt.sx, origPt.sy);
        ctx.lineTo(e1Pt.sx, e1Pt.sy);
        ctx.stroke();

        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('+λ₁ Wall', e1Pt.sx + 4, e1Pt.sy);

        const e2Pt = project3D(0, 1.4, computeLoss(0, 1.4));
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(origPt.sx, origPt.sy);
        ctx.lineTo(e2Pt.sx, e2Pt.sy);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.fillText('-λ₂ Escape Chute', e2Pt.sx + 4, e2Pt.sy);

        // Simulation Update for Both Particles
        if (isRunning) {
          saddleStepRef.current += 1;

          // 1. Vanilla SGD Update
          const vPos = saddleVanillaPosRef.current;
          const vGx = 1.6 * vPos.x;
          const vGy = -saddleCurvature * vPos.y + 0.32 * saddleCurvature * Math.pow(vPos.y, 3);
          vPos.x -= saddleLr * vGx;
          vPos.y -= saddleLr * vGy;
          saddleVanillaTrailRef.current.push({ x: vPos.x, y: vPos.y });
          if (saddleVanillaTrailRef.current.length > 70) saddleVanillaTrailRef.current.shift();

          // 2. Heavy-Ball Momentum + Langevin Update
          const mPos = saddleMomentumPosRef.current;
          const mVel = saddleMomentumVelRef.current;
          const mGx = 1.6 * mPos.x;
          const mGy = -saddleCurvature * mPos.y + 0.32 * saddleCurvature * Math.pow(mPos.y, 3);
          const noiseX = (Math.random() - 0.5) * 2;
          const noiseY = (Math.random() - 0.5) * 2;

          mVel.x = saddleMomentum * mVel.x - saddleLr * mGx + saddleNoise * Math.sqrt(saddleLr) * noiseX;
          mVel.y = saddleMomentum * mVel.y - saddleLr * mGy + saddleNoise * Math.sqrt(saddleLr) * noiseY;
          mPos.x += mVel.x;
          mPos.y += mVel.y;

          saddleMomentumTrailRef.current.push({ x: mPos.x, y: mPos.y });
          if (saddleMomentumTrailRef.current.length > 70) saddleMomentumTrailRef.current.shift();

          // Clamp / reset if escaped far into valley
          if (Math.abs(mPos.y) > 2.3 || Math.abs(mPos.x) > 2.0) {
            mPos.x = 0.04;
            mPos.y = 0.015;
            mVel.x = 0;
            mVel.y = 0;
            saddleMomentumTrailRef.current = [];
          }
        }

        // Draw Vanilla SGD Trail & Sphere
        const vTrail = saddleVanillaTrailRef.current;
        if (vTrail.length > 1) {
          ctx.beginPath();
          const firstP = project3D(vTrail[0].x, vTrail[0].y, computeLoss(vTrail[0].x, vTrail[0].y));
          ctx.moveTo(firstP.sx, firstP.sy);
          for (let i = 1; i < vTrail.length; i++) {
            const pt = project3D(vTrail[i].x, vTrail[i].y, computeLoss(vTrail[i].x, vTrail[i].y));
            ctx.lineTo(pt.sx, pt.sy);
          }
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        const curV = saddleVanillaPosRef.current;
        const curVPt = project3D(curV.x, curV.y, computeLoss(curV.x, curV.y));
        ctx.beginPath();
        ctx.arc(curVPt.sx, curVPt.sy, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#d97706';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('Vanilla SGD (Stuck)', curVPt.sx + 8, curVPt.sy - 6);

        // Draw Momentum Trail & Sphere
        const mTrail = saddleMomentumTrailRef.current;
        if (mTrail.length > 1) {
          ctx.beginPath();
          const firstP = project3D(mTrail[0].x, mTrail[0].y, computeLoss(mTrail[0].x, mTrail[0].y));
          ctx.moveTo(firstP.sx, firstP.sy);
          for (let i = 1; i < mTrail.length; i++) {
            const pt = project3D(mTrail[i].x, mTrail[i].y, computeLoss(mTrail[i].x, mTrail[i].y));
            ctx.lineTo(pt.sx, pt.sy);
          }
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        const curM = saddleMomentumPosRef.current;
        const curMPt = project3D(curM.x, curM.y, computeLoss(curM.x, curM.y));
        ctx.beginPath();
        ctx.arc(curMPt.sx, curMPt.sy, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('Momentum SGD (Escaping)', curMPt.sx + 8, curMPt.sy - 6);

        // Comparison Stats HUD
        const shudW = 220;
        const shudH = 62;
        const shx = w - shudW - 20;
        const shy = 20;
        ctx.fillStyle = 'rgba(10, 8, 20, 0.85)';
        ctx.fillRect(shx, shy, shudW, shudH);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.strokeRect(shx, shy, shudW, shudH);

        const vGradNorm = Math.hypot(1.6 * curV.x, -saddleCurvature * curV.y);
        const mVelNorm = Math.hypot(saddleMomentumVelRef.current.x, saddleMomentumVelRef.current.y);

        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`Vanilla SGD: ||∇L|| = ${vGradNorm.toFixed(3)} (Stalled)`, shx + 8, shy + 16);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`Momentum: ||v|| = ${mVelNorm.toFixed(3)} (Kinetic)`, shx + 8, shy + 32);
        ctx.fillStyle = '#34d399';
        ctx.fillText(`Step: ${saddleStepRef.current} · Escaped Down -λ₂`, shx + 8, shy + 48);
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
    odeSpeed,
    odeReverse,
    odeSolver,
    saddleMomentum,
    saddleLr,
    saddleNoise,
    saddleCurvature,
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
    soundFX.playTap();
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
      x: 0.04 + (Math.random() - 0.5) * 0.03,
      y: 0.015 + (Math.random() - 0.5) * 0.02,
    };
    saddleMomentumVelRef.current = {
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.02,
    };
    saddleMomentumTrailRef.current = [];
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
                ? 'bg-brand-500 text-white shadow-xs'
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
                ? 'bg-brand-500 text-white shadow-xs'
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
                ? 'bg-brand-500 text-white shadow-xs'
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
                ? 'bg-brand-500 text-white shadow-xs'
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
                ? 'bg-brand-500 text-white shadow-xs'
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
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Mountain className="w-3.5 h-3.5" />
            6. Saddle Escape
          </button>

          <button
            onClick={() => handleModeChange('grokking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'grokking'
                ? 'bg-brand-500 text-white shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            7. Grokking
          </button>
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border border-ink-200 dark:border-white/10 bg-ink-950 shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-80 sm:h-96 block cursor-crosshair"
          title="Interactive Physical Simulation Canvas"
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
                Perturb Saddle
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
                <span>
                  Variance:{' '}
                  <strong className="text-purple-400">
                    1/d = {(1 / dimension).toFixed(dimension >= 100 ? 5 : 3)}
                  </strong>
                </span>
                <span>·</span>
                <span>
                  P(|cos θ| &gt; 0.05):{' '}
                  <strong
                    className={geomData.tailProb < 0.05 ? 'text-emerald-400' : 'text-amber-400'}
                  >
                    {(geomData.tailProb * 100).toFixed(1)}%
                  </strong>
                </span>
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
                  Curvature: <strong className="text-cyan-400">λ₂ = -{saddleCurvature.toFixed(2)}</strong>
                </span>
                <span>·</span>
                <span>
                  Momentum: <strong className="text-purple-400">β = {saddleMomentum.toFixed(2)}</strong>
                </span>
                <span>·</span>
                <span>
                  Noise: <strong className="text-amber-400">σ = {saddleNoise.toFixed(2)}</strong>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-cyan-500 shrink-0" />
                  Select Dimension (<MathView math="d" />): Watch angles collapse to 90° as{' '}
                  <MathView math="d \to 4096" />
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Heavy-Ball Momentum (β):</span>
                <span className="font-mono text-cyan-400">{saddleMomentum.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.98"
                step="0.02"
                value={saddleMomentum}
                onChange={(e) => setSaddleMomentum(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Learning Rate (η):</span>
                <span className="font-mono text-cyan-400">{saddleLr.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.3"
                step="0.01"
                value={saddleLr}
                onChange={(e) => setSaddleLr(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Langevin Noise (σ):</span>
                <span className="font-mono text-amber-400">{saddleNoise.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.3"
                step="0.02"
                value={saddleNoise}
                onChange={(e) => setSaddleNoise(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-medium">
                <span className="text-ink-600 dark:text-ink-300">Negative Curvature (|λ₂|):</span>
                <span className="font-mono text-purple-400">{saddleCurvature.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.1"
                value={saddleCurvature}
                onChange={(e) => setSaddleCurvature(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
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
          <div className="p-3.5 rounded-xl bg-surface dark:bg-ink-950/70 border border-indigo-500/20 dark:border-indigo-500/30 flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 dark:text-indigo-400">
                <Shield className="w-3.5 h-3.5 shrink-0" />
                1. Governing Invariant
              </div>
              <div className="font-semibold text-xs text-ink-900 dark:text-white">
                {currentDossier.invariant.title}
              </div>
              <div className="p-1.5 rounded bg-indigo-500/5 dark:bg-indigo-950/30 border border-indigo-500/15 text-[11px]">
                <MathView math={currentDossier.invariant.equation} />
              </div>
            </div>
            <p className="text-[11px] text-ink-600 dark:text-ink-300 leading-relaxed pt-1">
              {currentDossier.invariant.explanation}
            </p>
          </div>

          {/* Card 2: Dynamic Force */}
          <div className="p-3.5 rounded-xl bg-surface dark:bg-ink-950/70 border border-amber-500/20 dark:border-amber-500/30 flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 dark:text-amber-400">
                <Zap className="w-3.5 h-3.5 shrink-0" />
                2. Dynamic Force
              </div>
              <div className="font-semibold text-xs text-ink-900 dark:text-white">
                {currentDossier.force.title}
              </div>
              <div className="p-1.5 rounded bg-amber-500/5 dark:bg-amber-950/30 border border-amber-500/15 text-[11px]">
                <MathView math={currentDossier.force.equation} />
              </div>
            </div>
            <p className="text-[11px] text-ink-600 dark:text-ink-300 leading-relaxed pt-1">
              {currentDossier.force.explanation}
            </p>
          </div>

          {/* Card 3: Scale Normalizer */}
          <div className="p-3.5 rounded-xl bg-surface dark:bg-ink-950/70 border border-cyan-500/20 dark:border-cyan-500/30 flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-500 dark:text-cyan-400">
                <Gauge className="w-3.5 h-3.5 shrink-0" />
                3. Scale Normalizer
              </div>
              <div className="font-semibold text-xs text-ink-900 dark:text-white">
                {currentDossier.normalizer.title}
              </div>
              <div className="p-1.5 rounded bg-cyan-500/5 dark:bg-cyan-950/30 border border-cyan-500/15 text-[11px]">
                <MathView math={currentDossier.normalizer.equation} />
              </div>
            </div>
            <p className="text-[11px] text-ink-600 dark:text-ink-300 leading-relaxed pt-1">
              {currentDossier.normalizer.explanation}
            </p>
          </div>

          {/* Card 4: Physical Conservation Law */}
          <div className="p-3.5 rounded-xl bg-surface dark:bg-ink-950/70 border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col justify-between space-y-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 dark:text-emerald-400">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                4. Conservation Law
              </div>
              <div className="font-semibold text-xs text-ink-900 dark:text-white">
                {currentDossier.conservationLaw.title}
              </div>
              <div className="p-1.5 rounded bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/15 text-[11px]">
                <MathView math={currentDossier.conservationLaw.equation} />
              </div>
            </div>
            <p className="text-[11px] text-ink-600 dark:text-ink-300 leading-relaxed pt-1">
              {currentDossier.conservationLaw.explanation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
