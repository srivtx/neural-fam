/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Epistemology & Theory Thinking Dataset:
 * Maps the continuum from quantum electron mechanics and thermodynamics
 * to biological neurodynamics, Shannon information, and artificial intelligence architecture invention.
 */

import {
  PhysicalPillar,
  CognitiveLeapPattern,
  PaperInventionDeconstruction,
  InventionGymExercise,
} from '../types/epistemology';

export const PHYSICAL_PILLARS: PhysicalPillar[] = [
  {
    id: 'pillar_quantum',
    order: 1,
    domain: 'quantum_physics',
    title: 'The Electron: Quantized States & The Bit',
    tagline: 'Before there is a token, there is an electron hopping across a forbidden bandgap.',
    fundamentalEntity: 'Electron in a Silicon Crystal Lattice (Valence vs Conduction Band)',
    governingPhysicalLaw: 'Schrödinger Wave Equation & Pauli Exclusion Principle',
    mathematicalEquation: '-\\frac{\\hbar^2}{2m} \\nabla^2 \\psi(\\mathbf{r}) + V(\\mathbf{r})\\psi(\\mathbf{r}) = E\\psi(\\mathbf{r})',
    equationExplanation:
      'Electrons in periodic atomic lattices cannot possess arbitrary energies; wave interference creates forbidden energy bandgaps (E_g ≈ 1.12 eV in Silicon). This discrete gap enables physical bi-stability (conduction vs insulation), giving birth to the binary digit (0 vs 1).',
    physicalIntuition:
      'Information is never abstract. It requires physical distinguishability. Because fermions obey the Pauli Exclusion Principle, matter has volume, stable electron shells exist, and silicon transistors can switch states without quantum states collapsing into an undifferentiated soup.',
    theBridgeToNextLevel:
      'Switching an electron state requires moving electrical charge through resistance, which inevitably dissipates heat. This directly connects quantum state switching to thermodynamics.',
    aiAnalogy:
      'Just as quantum quantization forces an electron into discrete energy states, neural networks use non-linear activations (ReLU, GELU, Sigmoid) to shatter linear symmetry and separate continuous vector spaces into distinct decision basins.',
    iconName: 'Atom',
  },
  {
    id: 'pillar_thermodynamics',
    order: 2,
    domain: 'thermodynamics',
    title: 'Thermodynamics: Entropy & Landauer’s Limit',
    tagline: 'Information is physical: Erasing memory dissipates irreducible heat into the universe.',
    fundamentalEntity: 'Ensemble Microstate Multiplicity & Heat Dissipation',
    governingPhysicalLaw: 'Landauer’s Principle & Second Law of Thermodynamics',
    mathematicalEquation: '\\Delta Q \\ge k_B T \\ln 2 \\approx 2.87 \\times 10^{-21} \\text{ Joules (at 300K)}',
    equationExplanation:
      'Erasing a single bit of information reduces the logical entropy of the computational system by ln(2), which by the Second Law of Thermodynamics forces a minimum heat dissipation of k_B * T * ln(2) into the thermal environment.',
    physicalIntuition:
      'Computation is not free. Reversible computing (like unitary quantum gates) can theoretically consume zero energy, but learning and forgetting (loss functions projecting high dimensions to low dimensions) are non-invertible compressions that inherently generate thermal entropy.',
    theBridgeToNextLevel:
      'Living biological brains must survive within strict thermal and caloric limits. The human brain consumes only ~20 Watts of power, forcing it to evolve sparse, energy-efficient signal transmission.',
    aiAnalogy:
      'Loss functions in deep learning (Cross-Entropy, Kullback-Leibler divergence) are literal thermodynamic potentials. Training a network via gradient descent is equivalent to sliding down an energy surface into free-energy minima (Gibbs-Boltzmann distribution).',
    iconName: 'Flame',
  },
  {
    id: 'pillar_biology',
    order: 3,
    domain: 'biology',
    title: 'The Biological Neuron: Ion Pumps & Metabolic Budgets',
    tagline: '86 billion neurons operating on 20 Watts via sparse, event-driven electrochemical spikes.',
    fundamentalEntity: 'Lipid Bilayer Membrane & Voltage-Gated Ion Channels (Na+ / K+)',
    governingPhysicalLaw: 'Nernst-Planck Electrodynamics & Hodgkin-Huxley Dynamics',
    mathematicalEquation: 'C_m \\frac{dV}{dt} = -g_{Na}(V - E_{Na}) - g_K(V - E_K) - g_L(V - E_L) + I_{inj}',
    equationExplanation:
      'A neuron membrane acts as a biological capacitor charged to -70 mV by ATP-consuming ion pumps. When voltage crosses threshold (-55 mV), positive feedback causes a rapid spike (action potential) lasting ~1 ms.',
    physicalIntuition:
      'Each biological action potential consumes ~10^4 ATP molecules. To survive on 20 Watts, the cortex fires at an average rate of only 0.1 to 1 Hz. The brain cannot afford dense continuous matrix multiplications—it uses sparse, temporal, asynchronous spike-timing codes.',
    theBridgeToNextLevel:
      'How does a train of sparse electrical pulses transmit semantic meaning without noise corruption? Claude Shannon provided the exact mathematical foundation with Information Theory.',
    aiAnalogy:
      'Artificial neurons originally simplified Hodgkin-Huxley into a static scalar rate code (McCulloch-Pitts, Rosenblatt). Today, the tension between dense continuous GEMMs (GPUs) and sparse biological event-driven compute remains the central dilemma of Neuromorphic AI.',
    iconName: 'Activity',
  },
  {
    id: 'pillar_information',
    order: 4,
    domain: 'information_theory',
    title: 'Information Theory: Shannon Capacity & Bottlenecks',
    tagline: 'The mathematical quantification of uncertainty, channel noise, and optimal compression.',
    fundamentalEntity: 'Probability Distribution & Channel Mutual Information',
    governingPhysicalLaw: 'Shannon Channel Coding Theorem & The Information Bottleneck',
    mathematicalEquation: 'C = B \\log_2\\left(1 + \\frac{S}{N}\\right), \\quad \\min_{p(t|x)} \\mathcal{I}(X; T) - \\beta \\mathcal{I}(T; Y)',
    equationExplanation:
      'No physical communication channel can transmit information faster than bandwidth B multiplied by log(1 + Signal-to-Noise). The Information Bottleneck principle states that an optimal representation T discards all extraneous information about input X while preserving predictive information about target Y.',
    physicalIntuition:
      'Noise is inevitable in any physical substrate. Shannon proved that error-free communication is possible up to a sharp mathematical threshold C by introducing redundancy. Deep learning representations are optimal lossy compression codes.',
    theBridgeToNextLevel:
      'To represent complex multi-modal data in computers, high-dimensional probability distributions must be embedded as continuous geometric structures: statistical manifolds.',
    aiAnalogy:
      'The Information Bottleneck explains why deep neural networks generalize: early layers compress input X (dropping noise, background, lighting), while late layers preserve only label-relevant features Y. Attention and VAEs are direct implementations of this principle.',
    iconName: 'Network',
  },
  {
    id: 'pillar_ai',
    order: 5,
    domain: 'artificial_intelligence',
    title: 'The AI Manifold: Geometry, Gradients & Synthesized Thought',
    tagline: 'High-dimensional curved manifolds where semantics correspond to geometric geodesics.',
    fundamentalEntity: 'Latent Representation Manifolds & Vector Field Flow',
    governingPhysicalLaw: 'Manifold Hypothesis & Lie Group Equivariance',
    mathematicalEquation: '\\mathcal{M} \\subset \\mathbb{R}^D, \\quad \\mathbf{z}_{t+1} = \\mathbf{z}_t - \\eta \\nabla_{\\mathbf{z}} \\mathcal{L}(\\mathbf{z}) + \\sqrt{2\\eta T} \\boldsymbol{\\xi}_t',
    equationExplanation:
      'High-dimensional data (e.g., 1024x1024 images in R^(10^6)) does not fill space uniformly; it concentrates on a low-dimensional sub-manifold M. Learning is the process of mapping this complex curved geometry into smooth, linear semantic spaces.',
    physicalIntuition:
      'Tokens, words, images, and protein folds are coordinates on a shared semantic manifold. Moving along a vector direction (e.g., king - man + woman = queen) is navigating parallel transport on a learned Riemannian manifold.',
    theBridgeToNextLevel:
      'This completes the physical continuum: from electron bandgaps to thermodynamics, to biological ion currents, to Shannon channels, to geometric manifolds of thought.',
    aiAnalogy:
      'Every neural breakthrough (Attention, Diffusion, Mamba, GNNs) is simply a more clever way to navigate, preserve symmetries on, or compress this high-dimensional manifold without destroying gradients.',
    iconName: 'Cpu',
  },
];

export const COGNITIVE_LEAP_PATTERNS: CognitiveLeapPattern[] = [
  {
    id: 'leap_symmetry',
    number: 1,
    name: 'The Symmetry & Invariance Leap',
    tagline: 'If physical reality does not change under a transformation, your equations must be mathematically blind to it.',
    theMentalJump:
      'Stop trying to memorize all variations of data with massive parameters. Instead, hardcode the transformation symmetry directly into the network architecture so the model cannot even express an invariant violation.',
    originatingField: 'Theoretical Physics (Emmy Noether’s Theorem, 1915: Every continuous symmetry corresponds to a conserved physical law).',
    borrowedMetaphor:
      'Conservation of momentum comes from spatial translation symmetry. A cat in the top-left of an image is physically identical to a cat in the bottom-right.',
    falseAssumptionBroken:
      'The assumption that a fully connected neural network must independently learn what a cat looks like at every single pixel coordinate (x, y).',
    differentiableRelaxationTrick:
      'Parameter sharing via Discrete 2D Cross-Correlation (Convolutions). Weight sharing forces translation equivariance: f(T_x(I)) = T_x(f(I)).',
    historicalMilestones: [
      'Hubel & Wiesel (1959) - Visual cortex receptive fields',
      'Fukushima (1980) - Neocognitron',
      'LeCun (1989) - Convolutional Neural Networks',
      'Bronstein et al. (2017) - Geometric Deep Learning & Equivariant GNNs',
    ],
    keyFormula: 'f(g \\cdot x) = g \\cdot f(x) \\quad \\forall g \\in G',
    formulaExplanation:
      'Group Equivariance: Transforming the input by group element g (rotation, translation, permutation) results in an identically transformed output.',
    howToApplyInResearch:
      'Look at your target domain: What transformations leave the underlying truth unchanged? (3D rotations in molecular folding, permutations in graph nodes, time translations in audio). Build weight-sharing or canonical coordinate projections that enforce this symmetry by construction.',
    dangerSignOrTrap:
      'Imposing too strict an invariance when the domain is actually sensitive to it (e.g., translation invariance in medical MRI scans where organ position is anatomically critical).',
  },
  {
    id: 'leap_thermodynamics',
    number: 2,
    name: 'The Thermodynamic Inversion Leap',
    tagline: 'Destroying order is easy and predictable; reversing the destruction creates realistic synthesis.',
    theMentalJump:
      'Instead of trying to generate complex data from scratch in a single brittle step, slowly inject physical entropy until the data is pure Gaussian noise, and then learn the reverse arrow of time.',
    originatingField: 'Statistical Mechanics & Non-Equilibrium Thermodynamics (Langevin Dynamics & Fokker-Planck Equation).',
    borrowedMetaphor:
      'Dropping a drop of blue ink into a glass of water. Forward in time, Brownian motion diffuses the ink until water is uniformly pale blue. If you could reverse the velocity vector of every water molecule, the ink would assemble back into a single drop.',
    falseAssumptionBroken:
      'The assumption that generative modeling requires a single direct mapping from latent z to complex image x (GANs/VAEs), which causes mode collapse and training instability.',
    differentiableRelaxationTrick:
      'Tweedie’s Formula & Score Matching: At each noisy timestep t, train a neural network to predict the gradient of the log-density (the score ∇_x log p(x)), which is analytically equivalent to predicting the added Gaussian noise ε.',
    historicalMilestones: [
      'Paul Langevin (1908) - Brownian motion stochastic differential equation',
      'Sohl-Dickstein et al. (2015) - Deep Unsupervised Learning using Nonequilibrium Thermodynamics',
      'Song & Ermon (2019) - Generative Modeling by Estimating Gradients of the Data Distribution',
      'Ho, Jain, Abbeel (2020) - Denoising Diffusion Probabilistic Models (DDPM)',
      'Lipman et al. (2022) - Flow Matching',
    ],
    keyFormula: 'd\\mathbf{x} = \\mathbf{f}(\\mathbf{x}, t)dt + g(t)d\\mathbf{w}, \\quad \\nabla_{\\mathbf{x}} \\log p_t(\\mathbf{x}) \\approx -\\frac{\\boldsymbol{\\epsilon}_\\theta(\\mathbf{x}_t, t)}{\\sigma_t}',
    formulaExplanation:
      'Forward stochastic differential equation slowly adds Wiener noise; reverse ODE trajectories reconstruct data along the learned score vector field.',
    howToApplyInResearch:
      'When generation or optimization is too complex to solve directly, find an irreversible degradation process with known analytical statistics (blurring, masking, noisy diffusion), and frame learning as the micro-step inversion of that degradation.',
    dangerSignOrTrap:
      'Over-sampling during inference: Iterating through 1,000 reverse steps is computationally slow. Modern researchers jump to straight-line Flow Matching ODEs to reach synthesis in 4–10 steps.',
  },
  {
    id: 'leap_bottleneck',
    number: 3,
    name: 'The Channel Bottleneck & Attention Leap',
    tagline: 'Do not force an infinite stream through a needle’s eye; let the receiver query the archive directly.',
    theMentalJump:
      'Recognize when an architecture suffers from catastrophic information compression. Replace static bottleneck representations with dynamic, content-addressable query-key routing.',
    originatingField: 'Computer Architecture & Shannon Communication Theory (Content-Addressable RAM & Address Busses).',
    borrowedMetaphor:
      'A CPU does not remember the entire 64 GB hard drive in its tiny register. It issues a memory address (Query), matches it against the RAM address bus (Key), and retrieves the data byte (Value).',
    falseAssumptionBroken:
      'The assumption that an encoder network must compress an entire arbitrary-length sentence or video into a single fixed-size vector state h_T.',
    differentiableRelaxationTrick:
      'Softmax inner-product similarity: Replace discrete memory lookup with a continuous weighted convex combination over all historical vectors.',
    historicalMilestones: [
      'Claude Shannon (1948) - Channel Capacity & Rate-Distortion',
      'Bahdanau, Cho, Bengio (2014) - Neural Machine Translation by Jointly Learning to Align and Translate',
      'Vaswani et al. (2017) - Attention Is All You Need (The Transformer)',
      'Dao et al. (2022) - FlashAttention (Tiling IO memory optimization)',
    ],
    keyFormula: '\\text{Attention}(Q, K, V) = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
    formulaExplanation:
      'Queries and Keys interact via dot products scaled by dimension to prevent softmax saturation; normalized weights dynamically route Values.',
    howToApplyInResearch:
      'Whenever your architecture forces sequential or heterogeneous data through a single vector bottleneck, break the bottleneck! Allow the output to inspect intermediate representations via dynamic routing.',
    dangerSignOrTrap:
      'Quadratic O(N^2) memory and compute explosion: Full pairwise attention cannot scale to 10M tokens without tiling or sparse routing.',
  },
  {
    id: 'leap_perturbation',
    number: 4,
    name: 'The Dynamical Perturbation & Identity Highway Leap',
    tagline: 'Do not learn a brand-new universe at every layer; learn a tiny correction to what already exists.',
    theMentalJump:
      'Deep networks fail not because of expressivity, but because parameterizing the simple identity function f(x) = x using dense non-linear matrices is mathematically unstable. Re-parameterize layers as residual perturbations: y = x + F(x).',
    originatingField: 'Numerical Analysis & Ordinary Differential Equations (Euler’s Method & Taylor Series Expansion).',
    borrowedMetaphor:
      'Newtonian mechanics: The position of a planet at time t + Δt is its existing position plus a tiny velocity delta: x(t + Δt) = x(t) + Δt * v(t).',
    falseAssumptionBroken:
      'The assumption that deep networks should learn complete mappings H(x) at each layer, which causes multiplicative gradient decay (vanishing gradients).',
    differentiableRelaxationTrick:
      'The Additive Skip Connection: By making the layer compute F(x) = H(x) - x, setting weights to 0 naturally preserves the identity function and provides an uninterrupted gradient highway.',
    historicalMilestones: [
      'Leonhard Euler (1768) - Numerical integration of differential equations',
      'Sepp Hochreiter (1997) - Constant Error Carousel in LSTM',
      'Kaiming He et al. (2015) - Deep Residual Learning for Image Recognition (ResNet)',
      'Chen et al. (2018) - Neural Ordinary Differential Equations',
    ],
    keyFormula: '\\mathbf{x}_{l+1} = \\mathbf{x}_l + \\mathcal{F}(\\mathbf{x}_l, \\mathcal{W}_l) \\implies \\frac{\\partial \\mathcal{L}}{\\partial \\mathbf{x}_l} = \\frac{\\partial \\mathcal{L}}{\\partial \\mathbf{x}_L} \\left( \\mathbf{I} + \\frac{\\partial}{\\partial \\mathbf{x}_l} \\sum_{i=l}^{L-1} \\mathcal{F}_i \\right)',
    formulaExplanation:
      'The chain rule gradient contains an additive identity matrix I, ensuring gradients flow back across 100+ layers even if layer Jacobians vanish.',
    howToApplyInResearch:
      'Whenever you build deeper architectures, make sure the default un-trained state is the lossless identity mapping. Additive skip connections, gating units, and residual streams guarantee stable gradient flow.',
    dangerSignOrTrap:
      'Representation explosion: If residual streams accumulate un-normalized variance, features blow up unless stabilized with Pre-LN or RMSNorm.',
  },
  {
    id: 'leap_energy',
    number: 5,
    name: 'The Energy Landscape & Attractor Leap',
    tagline: 'A memory is not a file in a drawer; it is a gravitational valley in a high-dimensional energy landscape.',
    theMentalJump:
      'Stop treating memory and classification as forward classification functions. Frame memory as an energy surface where valid memories correspond to local energy minima (attractor basins).',
    originatingField: 'Condensed Matter Physics (Ising Spin Glasses & Statistical Mechanics of Magnetism).',
    borrowedMetaphor:
      'A ball rolling down a bumpy rubber sheet. Wherever you drop the ball, gravity pulls it into the nearest bowl. The shape of the bowl is the memory; dropping the ball is partial recall.',
    falseAssumptionBroken:
      'The assumption that memory retrieval must be done by indexing and pointer arithmetic.',
    differentiableRelaxationTrick:
      'Lyapunov Energy Functions: Define a scalar energy E(s) = -1/2 s^T W s. Updating neurons asynchronously guarantees dE/dt ≤ 0, guaranteeing convergence to stable attractors.',
    historicalMilestones: [
      'Wilhelm Lenz & Ernst Ising (1925) - Spin glass magnetic models',
      'John Hopfield (1982) - Neural networks and physical systems with emergent collective computational abilities',
      'Hinton & Sejnowski (1985) - Boltzmann Machines',
      'Krotov & Hopfield (2016) / Demircigil et al. (2020) - Modern Dense Hopfield Networks',
    ],
    keyFormula: 'E(\\mathbf{x}) = -\\sum_{i < j} w_{ij} x_i x_j - \\sum_i b_i x_i, \\quad p(\\mathbf{x}) = \\frac{1}{Z} e^{-E(\\mathbf{x})/T}',
    formulaExplanation:
      'Gibbs-Boltzmann probability distribution connects scalar energy E(x) directly to probability density through partition function Z.',
    howToApplyInResearch:
      'When handling associative recall, auto-completion, or pattern cleanup, define an energy scalar and formulate inference as gradient descent along the energy landscape.',
    dangerSignOrTrap:
      'Spurious attractors: Traditional Hopfield nets suffer from capacity limits (C ≈ 0.14 N) where false memories form between real valleys. Modern Hopfield nets fix this with exponential energy functions.',
  },
  {
    id: 'leap_state_space',
    number: 6,
    name: 'The Continuous Control & State-Space Leap',
    tagline: 'Treat time as a continuous differential manifold, then discretize with exact mathematical guarantees.',
    theMentalJump:
      'Do not design discrete step-by-step token processors from scratch. Formulate the sequence processor as a continuous-time differential equation from linear control theory, and use exact mathematical discretization (ZOH) to bridge to computers.',
    originatingField: 'Linear System Theory & Control Engineering (State-Space Models & Kalman Filtering).',
    borrowedMetaphor:
      'An analog radio tuner filtering an incoming continuous radio wave. The internal circuit state maintains a continuous summary of past sound waves without storing the raw waveform.',
    falseAssumptionBroken:
      'The assumption that language models must either use quadratic attention or discrete heuristic RNN gates.',
    differentiableRelaxationTrick:
      'HiPPO Orthogonal Polynomial Memory + Zero-Order Hold (ZOH) discretization: Maps continuous differential equations into parallel associative scans.',
    historicalMilestones: [
      'Rudolf E. Kálmán (1960) - A New Approach to Linear Filtering and Prediction Problems',
      'Gu et al. (2020) - HiPPO: Recurrent Memory with Optimal Polynomial Projections',
      'Gu et al. (2021) - Efficiently Modeling Long Sequences with Structured State Spaces (S4)',
      'Gu & Dao (2023) - Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    ],
    keyFormula: '\\dot{\\mathbf{h}}(t) = \\mathbf{A}\\mathbf{h}(t) + \\mathbf{B}\\mathbf{x}(t), \\quad \\bar{\\mathbf{A}} = \\exp(\\Delta \\mathbf{A}), \\quad \\bar{\\mathbf{B}} = (\\Delta \\mathbf{A})^{-1}(\\exp(\\Delta \\mathbf{A}) - \\mathbf{I}) \\cdot \\Delta \\mathbf{B}',
    formulaExplanation:
      'Continuous-time LTI system discretized via Zero-Order Hold (ZOH) into exact discrete transition matrices parameterized by dynamic timescale Δ.',
    howToApplyInResearch:
      'When dealing with extremely long streams (audio, DNA, sensor logs, 1M context), formulate the problem as continuous signal tracking. Control theory has 70 years of analytical stability proofs waiting to be borrowed.',
    dangerSignOrTrap:
      'Linear Time Invariance (LTI) trap: Pure linear state spaces cannot filter out noise or perform in-context associative recall. You must make matrices input-dependent (selective), breaking pure convolution and requiring GPU-fused parallel scans.',
  },
  {
    id: 'leap_relaxation',
    number: 7,
    name: 'The Differentiable Relaxation Leap',
    tagline: 'If an operation has a discrete step or zero gradient, smooth it until gradients can flow through.',
    theMentalJump:
      'Take any discrete, combinatorial, or algorithmic operation (sorting, selecting, routing, branching) and construct a smooth probabilistic relaxation whose expectation equals the discrete operation.',
    originatingField: 'Convex Optimization & Variational Calculus (Smoothing & Log-Sum-Exp Approximations).',
    borrowedMetaphor:
      'Replacing a staircase of sharp steps with a smooth ramp. A ball on a flat step feels zero horizontal force; a ball on a smooth ramp rolls predictably toward the minimum.',
    falseAssumptionBroken:
      'The assumption that neural networks cannot learn discrete algorithmic structures like routing, parsing, or tree search.',
    differentiableRelaxationTrick:
      'Gumbel-Softmax / Temperature Annealing / Straight-Through Estimators: Parameterize categorical sampling as differentiable Gumbel perturbations.',
    historicalMilestones: [
      'Bridle (1990) - Softmax classification',
      'Jang, Gu, Poole (2016) / Maddison et al. (2016) - Categorical Reparameterization with Gumbel-Softmax',
      'Shazeer et al. (2017) - Outrageously Large Neural Networks: The Sparsely-Gated Mixture-of-Experts',
      'Blondel et al. (2020) - Fast Differentiable Sorting and Ranking',
    ],
    keyFormula: 'y_i = \\frac{\\exp((\\log \\pi_i + g_i) / \\tau)}{\\sum_j \\exp((\\log \\pi_j + g_j) / \\tau)}, \\quad g_i \\sim \\text{Gumbel}(0, 1)',
    formulaExplanation:
      'Gumbel-Softmax trick smoothly interpolates between a uniform continuous distribution (high temperature τ) and a discrete one-hot sample (τ → 0).',
    howToApplyInResearch:
      'Whenever an idea requires discrete branching (MoE routing, graph matching, discrete token search), do not abandon gradient descent. Construct a smooth relaxation, train end-to-end, and anneal temperature toward discrete execution.',
    dangerSignOrTrap:
      'High gradient variance: Soft approximations can suffer from severe gradient noise or vanishing gradients at near-zero temperatures.',
  },
];

export const PAPER_DECONSTRUCTIONS: PaperInventionDeconstruction[] = [
  {
    id: 'paper_attention',
    paperTitle: 'Attention Is All You Need',
    authorsAndYear: 'Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin (2017)',
    architecturalBreakthrough: 'The Transformer (Multi-Head Self-Attention without Recurrence or Convolutions)',
    theApparentParadox:
      'Everyone believed recurrence was fundamental to sequence processing. But RNNs were sequential: step t+1 strictly depended on step t, making training non-parallelizable on GPUs. How can an architecture model sequence order and dependency without any temporal loop?',
    theRawIntuitionBeforeMath:
      'What if a sequence is not a time-series tape at all, but a fully connected graph where every word can instantaneously look at and talk to every other word in parallel?',
    theCrossDisciplinaryMetaphor:
      'Computer Architecture (Memory Addressing): Queries, Keys, and Values. A Query is a search vector; Keys are address labels; Values are content payloads.',
    theDifferentiableRelaxation:
      'Discrete database indexing requires exact string matching. Vaswani replaced exact matching with vector dot products scaled by 1/sqrt(d_k), normalized into attention distributions via Softmax.',
    theHardwareSymbiosis:
      'The entire self-attention mechanism reduces to two large matrix multiplications (GEMMs): Q*K^T and Attention*V. Modern GPUs are literal hardware accelerators for large GEMMs. By removing recurrence, training throughput jumped by orders of magnitude.',
    unwrittenMentalPath: [
      '1. Crisis: RNN translation models take weeks to train because GPUs sit underutilized during sequential step loops.',
      '2. Insight: Recurrence is just a mechanism for passing context. Attention was already used as an add-on in Bahdanau RNNs.',
      '3. Radical Question: What if we delete the RNN entirely? What if attention is NOT an add-on, but the whole model?',
      '4. Dilemma: Without recurrence, words have no concept of position! "Dog bites man" equals "Man bites dog".',
      '5. Fix: Add sinusoidal positional encodings to inject geometric coordinates into the input tokens.',
    ],
    formalEquation: '\\text{Attention}(Q, K, V) = \\text{Softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V',
    whyPreviousAttemptsFailed:
      'Previous attempts tried to make RNNs faster by pruning weights or compressing states, rather than attacking the core sequential dependency assumption.',
  },
  {
    id: 'paper_resnet',
    paperTitle: 'Deep Residual Learning for Image Recognition',
    authorsAndYear: 'Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun (2015)',
    architecturalBreakthrough: 'ResNet (Deep Residual Networks with Identity Skip Connections)',
    theApparentParadox:
      'The Degradation Paradox: Overfitting causes training error to decrease while test error increases. But when researchers stacked 20+ plain layers, TRAINING error increased! An 18-layer network beat a 34-layer network on the training set. Mathematically, the 34-layer network contains the 18-layer network (by simply setting extra layers to identity), so its training error should be strictly less than or equal.',
    theRawIntuitionBeforeMath:
      'Deep networks are not suffering from capacity limits; they are suffering from optimization friction. It is unnatural and mathematically unstable for nonlinear weight layers to learn the identity function f(x) = x.',
    theCrossDisciplinaryMetaphor:
      'Euler’s Method in Numerical Analysis: x(t+1) = x(t) + Δt * f(x(t)). You do not re-invent position from scratch at every second; you update it with a tiny delta.',
    theDifferentiableRelaxation:
      'Do not ask layers to fit the full mapping H(x). Ask them to fit the residual F(x) = H(x) - x. The output is y = x + F(x). If a layer is unnecessary, SGD naturally drives weights toward 0, which effortlessly collapses the block to an exact identity pass-through.',
    theHardwareSymbiosis:
      'Skip connections require zero additional FLOPs or parameters—only an elementwise tensor addition (torch.add). It is computationally free and preserves gradient highways across 1,000+ layers.',
    unwrittenMentalPath: [
      '1. Crisis: Stacking 30 layers in VGG/GoogLeNet causes optimization to fail completely.',
      '2. Hypothesis: Maybe vanishing gradients? Checked: Batch Normalization already fixed forward/backward scale!',
      '3. Deeper Paradox: If gradients are healthy and capacity is higher, why is training loss worse?',
      '4. Realization: Identity mapping is hard to learn with W*x + b. What if identity is the default baseline?',
      '5. Architectural Leap: Wire a physical wire directly from input to output: y = x + F(x).',
    ],
    formalEquation: '\\mathbf{y} = \\mathcal{F}(\\mathbf{x}, \\{W_i\\}) + \\mathbf{x}',
    whyPreviousAttemptsFailed:
      'Previous attempts added highway gating with learned parameters (Highway Networks), which still suffered from gate initialization decay. He made the identity pass-through completely parameter-free.',
  },
  {
    id: 'paper_mamba',
    paperTitle: 'Mamba: Linear-Time Sequence Modeling with Selective State Spaces',
    authorsAndYear: 'Albert Gu & Tri Dao (2023)',
    architecturalBreakthrough: 'Mamba (Selective Structured State Space Sequence Models)',
    theApparentParadox:
      'The Attention vs RNN Dilemma: Transformers scale quadratically O(T^2) in memory during inference, making million-token contexts prohibitively expensive. Linear RNNs/SSMs scale in O(1) inference memory, but perform poorly on language tasks because they cannot selectively ignore noise or recall specific tokens.',
    theRawIntuitionBeforeMath:
      'What if an SSM could act like a selective cognitive gate: when reading an important word, open the write-valve; when reading punctuation or noise, freeze the memory state and do not update?',
    theCrossDisciplinaryMetaphor:
      'Time-Varying Linear Dynamical Systems in Control Theory: A Kalman filter whose measurement noise and state transition parameters dynamically adjust depending on the incoming sensory signal.',
    theDifferentiableRelaxation:
      'Make the discretization timescale Δ, input projection B, and output projection C input-dependent functions of x_t (selective mechanism). Discretize continuous-time ODE via Zero-Order Hold (ZOH).',
    theHardwareSymbiosis:
      'Making parameters input-dependent destroys the convolution trick of S4! Traditional implementation would be slow in PyTorch. Gu and Dao invented a hardware-aware algorithm: fuse the associative scan entirely inside GPU SRAM (avoiding HBM memory traffic) to maintain massive training throughput.',
    unwrittenMentalPath: [
      '1. Background: S4 proved continuous state spaces can model long sequences via convolutions.',
      '2. Limitation: S4 is Linear Time-Invariant (LTI). It processes every token with the exact same transition matrix, making it blind to content.',
      '3. The Leap: Break LTI! Make matrices B, C, and timescale Δ functions of input token x_t.',
      '4. The Hardware Crisis: Breaking LTI prevents using FFT convolutions for training. Sequential scan is too slow on GPUs.',
      '5. Breakthrough: Formulate the recurrence as an associative operator, and write a custom Triton GPU kernel executing a parallel scan directly in on-chip SRAM.',
    ],
    formalEquation: 'h_t = \\bar{\\mathbf{A}}_t h_{t-1} + \\bar{\\mathbf{B}}_t x_t, \\quad y_t = \\mathbf{C}_t h_t, \\quad \\bar{\\mathbf{A}}_t = \\exp(\\Delta_t \\mathbf{A})',
    whyPreviousAttemptsFailed:
      'Previous SSM research refused to break Linear Time-Invariance because they were wedded to the FFT convolution algorithm. Gu and Dao were willing to break the math and solve the hardware kernel directly.',
  },
  {
    id: 'paper_diffusion',
    paperTitle: 'Deep Unsupervised Learning using Nonequilibrium Thermodynamics / DDPM',
    authorsAndYear: 'Jascha Sohl-Dickstein (2015) / Jonathan Ho, Ajay Jain, Pieter Abbeel (2020)',
    architecturalBreakthrough: 'Diffusion Probabilistic Models (DDPM)',
    theApparentParadox:
      'Generative Adversarial Networks (GANs) produced sharp images but were notoriously unstable, suffering from minimax mode collapse and impossible hyperparameter tuning. How can an architecture model complex multimodal image distributions without an adversarial discriminator?',
    theRawIntuitionBeforeMath:
      'If you drop dye into water, entropy naturally dissolves the image into uniform noise. What if we learn to run the film backward? Each individual reversal step is simple Gaussian denoising.',
    theCrossDisciplinaryMetaphor:
      'Nonequilibrium Statistical Mechanics: Jarzynski equality and reverse Langevin drift-diffusion processes.',
    theDifferentiableRelaxation:
      'Ho et al. re-parameterized the variational lower bound into simple Mean Squared Error: instead of predicting the clean image x_0, the U-Net simply predicts the added noise vector ε_t at each timestep.',
    theHardwareSymbiosis:
      'During training, you do NOT need to step sequentially through 1,000 steps! The forward Gaussian process has an analytical shortcut: x_t = sqrt(α_t)*x_0 + sqrt(1-α_t)*ε. You can sample any random timestep t uniformly and train on independent image batches in parallel on GPUs.',
    unwrittenMentalPath: [
      '1. Sohl-Dickstein (2015): Noticed that physics equations for reversing entropy exist, but compute was too weak.',
      '2. Ho et al. (2020): Took the complex physical formulas and stripped away mathematical complexity.',
      '3. Realization: Score matching and variational diffusion can be simplified to a simple L2 loss predicting noise ε.',
      '4. U-Net backbone: Re-use proven image segmentation architectures with sinusoidal timestep embeddings.',
    ],
    formalEquation: 'L_{\\text{simple}}(\\theta) = \\mathbb{E}_{t, \\mathbf{x}_0, \\boldsymbol{\\epsilon}}\\left[ \\| \\boldsymbol{\\epsilon} - \\boldsymbol{\\epsilon}_\\theta(\\sqrt{\\bar{\\alpha}_t}\\mathbf{x}_0 + \\sqrt{1-\\bar{\\alpha}_t}\\boldsymbol{\\epsilon}, t) \\|^2 \\right]',
    whyPreviousAttemptsFailed:
      'Researchers focused on single-step autoencoders (VAEs) which caused blurry averages, or GAN discriminators which caused game-theoretic collapse.',
  },
];

export const INVENTION_GYM_EXERCISES: InventionGymExercise[] = [
  {
    id: 'gym_context_horizon',
    targetDomain: 'Sequence Modeling & Long Context',
    title: 'The Infinite Context Horizon Wall',
    currentBottleneckDescription:
      'Transformer KV-caches grow linearly O(T) per user session. For a 1M token context, storing Key and Value tensors requires ~120 GB of GPU RAM per stream. Inference costs become economically prohibitive, and context windows are hard-capped by physical accelerator memory.',
    theFalseAssumption:
      'The false assumption that every token in a 1M sequence requires an independent high-dimensional geometric embedding stored in RAM indefinitely.',
    candidateMetaphors: [
      {
        id: 'meta_lossy_compression',
        metaphorName: 'Wavelet Compression / Hierarchy',
        sourceDiscipline: 'Signal Processing',
        intuition: 'Older tokens are progressively downsampled into multi-scale wavelets.',
        whyItFitsOrFails: 'Works well for continuous audio, but catastrophic for discrete code/language where a single character (like a semicolon or minus sign) changes program semantics.',
        isOptimalLeap: false,
      },
      {
        id: 'meta_associative_lti',
        metaphorName: 'Continuous Dynamic State Space / Kalman Filter',
        sourceDiscipline: 'Control Theory',
        intuition: 'Compress all history into a fixed-size state vector via continuous differential equations.',
        whyItFitsOrFails: 'Optimal for constant memory O(1), but pure LTI struggles with exact associative recall and copy-paste tasks.',
        isOptimalLeap: false,
      },
      {
        id: 'meta_hybrid_latent',
        metaphorName: 'Hierarchical Memory Architecture (Cache L1/L2 vs Main RAM)',
        sourceDiscipline: 'Computer Architecture & Multi-Head Latent Compression',
        intuition: 'Project Keys and Values into a shared ultra-low-rank latent space, while keeping full dimensional Queries, combined with selective state caching.',
        whyItFitsOrFails: 'This is the exact breakthrough behind DeepSeek MLA (Multi-Head Latent Attention) and Hybrid Mamba-Transformers! It achieves 5x-6x KV-cache compression while retaining full associative recall.',
        isOptimalLeap: true,
      },
    ],
    differentiableRelaxationPrompt:
      'How do you mathematically project K and V into a compressed latent vector c_t^(KV) while preserving positional awareness without blowing up cache sizes?',
    suggestedMathematicalInvariant:
      '\\mathbf{c}_t^{KV} = \\mathbf{W}_{DKV} \\mathbf{h}_t, \\quad \\mathbf{k}_t^C = \\mathbf{W}_{UK} \\mathbf{c}_t^{KV}, \\quad \\mathbf{v}_t^C = \\mathbf{W}_{UV} \\mathbf{c}_t^{KV}',
    theBreakthroughArchitectureName: 'Multi-Head Latent Attention (MLA) / Hybrid Recurrent-Attention',
    hardwareRealityCheck:
      'Decoupled RoPE: Position encodings cannot be compressed into the low-rank latent vector. Keep a tiny separate RoPE vector to preserve spatial distance, allowing the bulk KV cache to be compressed by 80% on H100 GPUs.',
  },
  {
    id: 'gym_discrete_planning',
    targetDomain: 'Reasoning & Test-Time Compute',
    title: 'The Continuous-vs-Discrete Reasoning Dilemma',
    currentBottleneckDescription:
      'Autoregressive language models sample tokens greedily or with top-p sampling, but cannot explore multiple proof paths, backtrack when hitting an error, or dynamically allocate more compute to harder steps.',
    theFalseAssumption:
      'The false assumption that reasoning is a pure next-token prediction task modeled by a single forward pass without search.',
    candidateMetaphors: [
      {
        id: 'meta_monte_carlo',
        metaphorName: 'Monte Carlo Tree Search with Value Functions',
        sourceDiscipline: 'Game Theory & Optimal Control (AlphaGo)',
        intuition: 'Use an auxiliary Process Reward Model (PRM) to score intermediate reasoning steps and guide beam search.',
        whyItFitsOrFails: 'This is the foundation of OpenAI o1 / modern reasoning models! Allocating compute at test-time by exploring rollout trees.',
        isOptimalLeap: true,
      },
      {
        id: 'meta_recurrent_thinking',
        metaphorName: 'Continuous Thought Latents / Adaptive Computation Time',
        sourceDiscipline: 'Recurrent Neural Networks',
        intuition: 'Let the hidden state iterate in a recurrent loop before emitting the next token.',
        whyItFitsOrFails: 'Suffers from vanishing gradients and lack of interpretability; cannot be verified by external symbolic checkers.',
        isOptimalLeap: false,
      },
    ],
    differentiableRelaxationPrompt:
      'How do you train a model to generate verification tokens and evaluate step correctness when step boundaries are variable?',
    suggestedMathematicalInvariant:
      '\\mathcal{L}_{\\text{PRM}} = -\\sum_{s=1}^S y_s^* \\log \\sigma(r_\\phi(x, z_{1:s})) + (1 - y_s^*) \\log(1 - \\sigma(r_\\phi(x, z_{1:s})))',
    theBreakthroughArchitectureName: 'Process Reward Verifier & Test-Time Search Scaling',
    hardwareRealityCheck:
      'Test-time search is embarrassingly parallel on inference clusters. Generating 64 reasoning rollouts concurrently achieves linear speedup on vLLM/TensorRT-LLM.',
  },
];
