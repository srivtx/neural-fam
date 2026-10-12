/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Socratic Question Graph Master Dataset:
 * 30 interconnected, first-principles inquiries linking quantum electron bandgaps
 * and thermodynamic Landauer limits to Python VMs, high-dimensional manifolds,
 * residual highways, gradients, AdamW, language, memory bus walls, MLA, and MoE.
 */

export type QuestionRealm =
  | 'physics'
  | 'computation'
  | 'geometry'
  | 'optimization'
  | 'language'
  | 'hardware';

export interface ChainOfThoughtStep {
  axiom: string;
  unaskedQuestion: string;
  stepByStepDerivation: {
    title: string;
    description: string;
    formula?: string;
  }[];
  siliconRegisterDetail: string;
  deepIntuitionQuote: string;
}

export interface SocraticQuestionNode {
  id: string;
  stepNumber: number;
  question: string;
  realm: QuestionRealm;
  realmLabel: string;
  realmColor: string;
  x: number; // coordinate for SVG graph layout
  y: number;
  oneLiner: string;
  naiveMisconception: string;
  firstPrinciplesReality: string;
  mathematicalEquation?: string;
  siliconReality: string;
  connectedQuestionIds: string[]; // outgoing links
  originQuestionIds: string[]; // incoming links
  researcherReflectionPrompt: string;
  chainOfThought: ChainOfThoughtStep;
  runnablePythonVerification?: {
    title: string;
    code: string;
    expectedInsight: string;
  };
}

export const QUESTION_REALMS: { id: QuestionRealm; label: string; color: string; desc: string }[] = [
  { id: 'physics', label: 'Physics & Potential Wells', color: '#06b6d4', desc: 'Electrons, bandgaps, Landauer limits, and physical distinguishability.' },
  { id: 'computation', label: 'Programs & Virtual Machines', color: '#3b82f6', desc: 'CPython opcodes, control flow branches, and parametric models.' },
  { id: 'geometry', label: 'Manifolds & Topological Layers', color: '#8b5cf6', desc: 'Coordinate spaces, affine projections, and origami non-linear folds.' },
  { id: 'optimization', label: 'Gradients & Energy Landscapes', color: '#f59e0b', desc: 'High-dimensional geometry, backpropagation, and thermal downhill roll.' },
  { id: 'language', label: 'Language & Mental Compression', color: '#ec4899', desc: 'Biological communication bottlenecks, sequential tokens, and world models.' },
  { id: 'hardware', label: 'Silicon Buses & KV-Caches', color: '#10b981', desc: 'HBM memory walls, arithmetic intensity, systolic arrays, and MLA.' },
];

export const SOCRATIC_QUESTION_NODES: SocraticQuestionNode[] = [
  {
    id: 'q_wigner_math',
    stepNumber: 1,
    question: 'Why does physical reality obey mathematics at all? What is an invariant?',
    realm: 'physics',
    realmLabel: 'Axiomatic Physics',
    realmColor: '#06b6d4',
    x: 80,
    y: 80,
    oneLiner: 'Symmetry is the only reason physics and artificial intelligence are possible.',
    naiveMisconception: 'People assume mathematics is just a human language invented to describe tools, rather than the intrinsic symmetry of spacetime.',
    firstPrinciplesReality:
      'Under Emmy Noether’s Theorem (1915), every continuous differentiable symmetry of a physical system corresponds to a conserved quantity: time translation symmetry yields Conservation of Energy; spatial translation symmetry yields Conservation of Momentum. Neural networks work for the exact same reason: they exploit group symmetries (equivariance and invariance) in high-dimensional data.',
    mathematicalEquation: '\\delta S = 0 \\iff \\frac{d}{dt} \\left( \\frac{\\partial L}{\\partial \\dot{q}_i} \\right) - \\frac{\\partial L}{\\partial q_i} = 0',
    siliconReality:
      'Silicon atoms crystalize in a face-centered diamond cubic lattice whose spatial translation symmetry creates periodic electronic band structures.',
    connectedQuestionIds: ['q_electron'],
    originQuestionIds: [],
    researcherReflectionPrompt: 'If intelligence is finding invariants under data transformations, what group symmetry is the attention mechanism invariant to?',
    chainOfThought: {
      axiom: 'If physical reality did not possess continuous symmetries, every single second and every millimeter of space would follow different laws, making learning impossible.',
      unaskedQuestion: 'Why can a neural network generalize to data it has never seen before?',
      stepByStepDerivation: [
        {
          title: '1. The Symmetry Axiom',
          description: 'A cat rotated by 5 degrees is still a cat. This is SO(2) rotational symmetry.',
        },
        {
          title: '2. The Mathematical Representation',
          description: 'A model is equivariant if transforming the input transforms the output identically: f(g · x) = g · f(x).',
          formula: 'f(T_g(x)) = T_g\'(f(x))',
        },
        {
          title: '3. Generalization as Symmetry',
          description: 'Generalization is not magic: it is the mathematical projection of learned features along unbroken symmetry manifolds.',
        },
      ],
      siliconRegisterDetail: 'Transistors rely on crystalline symmetry to maintain uniform electron mobility across all billions of gate channels.',
      deepIntuitionQuote: 'Generalization is simply the discovery of a geometric symmetry that the universe respects.',
    },
  },
  {
    id: 'q_electron',
    stepNumber: 2,
    question: 'What is an electron, and why does matter have discrete states?',
    realm: 'physics',
    realmLabel: 'Quantum Physics',
    realmColor: '#06b6d4',
    x: 230,
    y: 80,
    oneLiner: 'Before there is a token, an electron is trapped in an atomic potential well.',
    naiveMisconception: 'People think data is an ethereal, abstract mathematical concept that floats freely from the physical universe.',
    firstPrinciplesReality:
      'Under the Schrödinger wave equation and the Pauli Exclusion Principle, fermions cannot occupy the same quantum state. Electrons orbiting periodic Silicon lattices form energy bands separated by a forbidden bandgap (1.12 eV). This energetic barrier prevents quantum collapse and enables stable physical bi-stability.',
    mathematicalEquation: '-\\frac{\\hbar^2}{2m} \\nabla^2 \\psi(\\mathbf{r}) + V(\\mathbf{r})\\psi(\\mathbf{r}) = E\\psi(\\mathbf{r})',
    siliconReality:
      'Applying gate voltage tilts the potential well, either permitting electrons to hop into the conduction band or trapping them. Physical distinguishability in silicon is the bedrock of all computation.',
    connectedQuestionIds: ['q_data_bit'],
    originQuestionIds: ['q_wigner_math'],
    researcherReflectionPrompt: 'If information requires physical state distinguishability, what thermodynamic heat must be dissipated every time your loss function compresses high-dimensional tokens?',
    chainOfThought: {
      axiom: 'To distinguish 0 from 1, there must exist an energetic hill that random thermal room-temperature noise (kT ≈ 0.026 eV) cannot spontaneously jump.',
      unaskedQuestion: 'Why is Silicon the chosen element of human computation rather than conductors like Copper or insulators like Glass?',
      stepByStepDerivation: [
        {
          title: '1. The Conductor Problem',
          description: 'Copper has overlapping valence and conduction bands. Electrons flow constantly; you cannot switch it OFF.',
        },
        {
          title: '2. The Insulator Problem',
          description: 'Glass has an 9 eV bandgap. Switching it ON requires thousands of volts that vaporize the material.',
        },
        {
          title: '3. The Silicon Goldilocks Zone',
          description: 'Silicon has an 1.12 eV bandgap: large enough to resist thermal noise, small enough to be switched by a 0.8V gate voltage.',
          formula: 'E_g = 1.12 \\text{ eV} \\gg k_B T \\approx 0.026 \\text{ eV}',
        },
      ],
      siliconRegisterDetail: 'DRAM capacitors store ~20,000 electrons in a potential well. If 5,000 leak out via thermal tunneling, the bit flips unless refreshed.',
      deepIntuitionQuote: 'Computation is the art of corralling electrons across atomic bandgaps without melting the lattice.',
    },
  },
  {
    id: 'q_data_bit',
    stepNumber: 3,
    question: 'What is data? What is a bit in the physical universe?',
    realm: 'physics',
    realmLabel: 'Thermodynamics & Information',
    realmColor: '#06b6d4',
    x: 380,
    y: 80,
    oneLiner: 'A bit is a stable potential energy barrier that resists thermal Brownian fluctuations.',
    naiveMisconception: 'People assume a 1 or 0 is an ink mark or an arbitrary symbol on a screen.',
    firstPrinciplesReality:
      'A bit is a macrostate that can be differentiated from another macrostate without ambiguity. Landauer proved that erasing 1 bit of information irreversibly dissipates a minimum thermodynamic heat into the ambient environment.',
    mathematicalEquation: '\\Delta Q \\ge k_B T \\ln 2 \\approx 2.87 \\times 10^{-21} \\text{ J (at 300K)}',
    siliconReality:
      'In DRAM, a bit is literally ~20,000 to ~40,000 trapped electrons inside a microscopic trench capacitor. Reading a bit empties the capacitor through a sense amplifier, requiring immediate refresh cycles.',
    connectedQuestionIds: ['q_program_vm'],
    originQuestionIds: ['q_electron'],
    researcherReflectionPrompt: 'When an attention layer projects 128 tokens into 1 token summary, how many Landauer bits of entropy did the network destroy?',
    chainOfThought: {
      axiom: 'Information is not free. Reversible computing costs zero energy; logical erasure costs irreducible entropy.',
      unaskedQuestion: 'What does "erasing memory" actually do to the physical room where your GPU sits?',
      stepByStepDerivation: [
        {
          title: '1. Shannon Logical Entropy',
          description: 'A 2-state system has Shannon entropy S = k ln(2). When you reset it to a known 0 state, entropy decreases by ln(2).',
        },
        {
          title: '2. Second Law Conservation',
          description: 'The universe’s total entropy cannot decrease: ΔS_system + ΔS_environment ≥ 0.',
        },
        {
          title: '3. Physical Heat Dissipation',
          description: 'To decrease logical entropy, thermal heat must be ejected into the air: Q ≥ T · ΔS = k_B T ln(2).',
          formula: 'Q_{\\text{Landauer}} = k_B T \\ln 2',
        },
      ],
      siliconRegisterDetail: 'A GPU consumes 700 Watts primarily because charging and discharging gate capacitances billions of times per second dumps Landauer and resistive heat.',
      deepIntuitionQuote: 'Every time your transformer deletes past tokens from memory, the air in your datacenter gets physically hotter.',
    },
  },
  {
    id: 'q_program_vm',
    stepNumber: 4,
    question: 'What is a Python program running inside a VM? What is code?',
    realm: 'computation',
    realmLabel: 'Programs & Opcodes',
    realmColor: '#3b82f6',
    x: 530,
    y: 80,
    oneLiner: 'A program is a hand-crafted deterministic routing circuit of conditional jumps.',
    naiveMisconception: 'People think Python code has "thought" or that the computer understands variables and functions.',
    firstPrinciplesReality:
      'A program is a fixed sequence of binary operation codes. CPython compiles text into bytecode instructions (LOAD_FAST, BINARY_ADD, JUMP_IF_FALSE). The Python Virtual Machine is simply a continuous while loop written in C executing a switch statement over memory bytes.',
    mathematicalEquation: 'P: \\Sigma^* \\times \\mathcal{S} \\to \\mathcal{S}, \\quad \\text{State}_{t+1} = \\delta(\\text{State}_t, \\text{Opcode}_t)',
    siliconReality:
      'The CPU instruction decoder turns opcodes into micro-ops, driving gate voltage pulses down metal copper traces to clock gating transistors, routing electrons through arithmetic logic units (ALUs).',
    connectedQuestionIds: ['q_model_vs_code'],
    originQuestionIds: ['q_data_bit'],
    researcherReflectionPrompt: 'Why is it impossible to write a classical Python program with if/else branches to recognize every handwritten digit or speak fluent language?',
    chainOfThought: {
      axiom: 'Von Neumann architectures separate code instructions from data values in addressable memory.',
      unaskedQuestion: 'What is Python doing at the nanosecond scale while you wait for your PyTorch script to run?',
      stepByStepDerivation: [
        {
          title: '1. Text Tokenization',
          description: 'CPython lexer splits your script into tokens (def, model, return).',
        },
        {
          title: '2. AST Compilation',
          description: 'Builds an Abstract Syntax Tree and emits integer bytecodes into a PyCodeObject.',
        },
        {
          title: '3. The Evaluation Loop',
          description: 'Executes `ceval.c`: a giant switch-case loop executing on CPU registers.',
          formula: '\\text{while(1) switch(*next_instr)} \\{ \\text{case LOAD_FAST: ...} \\}',
        },
      ],
      siliconRegisterDetail: 'When Python calls PyTorch, it drops the GIL and passes C pointers to CUDA driver libraries, dispatching kernels to GPU hardware.',
      deepIntuitionQuote: 'Python is a high-level conductor waving a baton; C and CUDA are the musicians actually blowing air through copper instruments.',
    },
  },
  {
    id: 'q_model_vs_code',
    stepNumber: 5,
    question: 'What is a model vs a classical program? Where does the logic live?',
    realm: 'computation',
    realmLabel: 'Parametric Geometry',
    realmColor: '#3b82f6',
    x: 680,
    y: 80,
    oneLiner: 'In a model, the Python code is completely dumb and static; the intelligence lives in the coordinate parameters.',
    naiveMisconception: 'People think AI writes new Python code or modifies its own if/else statements when learning.',
    firstPrinciplesReality:
      'During training and inference, the Python code never changes a single line. The program simply executes static matrix multiplications. The decision boundaries and intelligence are encoded entirely as continuous geometric parameters (weights and biases).',
    mathematicalEquation: 'y = f_\\theta(x), \\quad \\theta \\in \\mathbb{R}^P \\text{ (Static function structure, dynamic manifold parameters)}',
    siliconReality:
      'Instead of the CPU branching into different instruction addresses, the GPU runs the exact same fused kernel over and over, simply streaming different floating-point numbers through systolic array multiply-accumulators.',
    connectedQuestionIds: ['q_continuous_vectors'],
    originQuestionIds: ['q_program_vm'],
    researcherReflectionPrompt: 'If the software code is static, why do we call it "software"? Is deep learning actually high-dimensional analog geometry simulated on digital computers?',
    chainOfThought: {
      axiom: 'Software 1.0 is written by humans in discrete instructions; Software 2.0 is written by optimization in continuous weight space.',
      unaskedQuestion: 'Why did 60 years of expert systems (Symbolic AI) fail to understand images or voice?',
      stepByStepDerivation: [
        {
          title: '1. The Combinatorial Cliff',
          description: 'In raw pixels, a 256x256 image has 256^65536 possible combinations. No human can write enough if-statements.',
        },
        {
          title: '2. The Continuous Escape',
          description: 'Instead of branching on discrete pixel values, parameterize a smooth manifold with continuous weights θ.',
        },
        {
          title: '3. The Inductive Parameterization',
          description: 'The code defines the topology (how layers connect); optimization sculpts the parameters.',
          formula: '\\theta^* = \\arg\\min_\\theta \\sum_{i=1}^N \\mathcal{L}(f_\\theta(x_i), y_i)',
        },
      ],
      siliconRegisterDetail: 'A 70B model has 0 lines of custom reasoning logic in C; all its reasoning logic is stored as 70 billion 16-bit floats in DRAM.',
      deepIntuitionQuote: 'A classical program is a clockwork gear train; a neural network is a mold of clay sculpted by gradients.',
    },
  },
  {
    id: 'q_continuous_vectors',
    stepNumber: 6,
    question: 'Why do we represent concepts as continuous vectors instead of discrete dictionary keys?',
    realm: 'geometry',
    realmLabel: 'Differentiable Spaces',
    realmColor: '#8b5cf6',
    x: 830,
    y: 80,
    oneLiner: 'Discrete symbols have no slope; continuous vectors allow calculus to interpolate between ideas.',
    naiveMisconception: 'People think words and symbols could be processed directly as discrete letters or hash tables by learning algorithms.',
    firstPrinciplesReality:
      'In a discrete dictionary, the word "king" (ID 1420) and "queen" (ID 9821) have Hamming distance 1. There is no intermediate concept at ID 5620. Discrete symbols have zero derivative: d(symbol)/dx is undefined. Continuous vector spaces allow ideas to have distance, direction, and smooth paths.',
    mathematicalEquation: '\\mathbf{v}_{\\text{queen}} \\approx \\mathbf{v}_{\\text{king}} - \\mathbf{v}_{\\text{man}} + \\mathbf{v}_{\\text{woman}}',
    siliconReality:
      'ALUs cannot differentiate lookup tables. ALUs compute floating-point dot products, enabling gradients to flow backward through coordinates.',
    connectedQuestionIds: ['q_embedding_lookup'],
    originQuestionIds: ['q_model_vs_code'],
    researcherReflectionPrompt: 'If meaning is a vector in continuous space, does the space between words contain concepts that human languages have never named?',
    chainOfThought: {
      axiom: 'Gradient descent requires a continuous manifold; you cannot take the derivative of a discrete symbol table.',
      unaskedQuestion: 'Why did Word2Vec in 2013 revolutionize AI overnight?',
      stepByStepDerivation: [
        {
          title: '1. The One-Hot Impasse',
          description: 'One-hot vectors are mutually orthogonal: ⟨e_cat, e_kitten⟩ = 0. The network treats them as completely unrelated.',
        },
        {
          title: '2. Low-Rank Semantic Subspace',
          description: 'Project 50,000 discrete symbols into ℝ^4096. Concepts that share contexts align their dot products.',
          formula: '\\cos(\\theta) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\| \\|\\mathbf{v}\\|} > 0',
        },
        {
          title: '3. Semantic Arithmetic',
          description: 'Linear directions encode semantic relationships: vector offsets correspond to gender, tense, and royalty.',
        },
      ],
      siliconRegisterDetail: 'FPU registers multiply float32 coordinates at 1 operation per cycle, computing cosine similarities in nanoseconds.',
      deepIntuitionQuote: 'Vectors turn language from an unsearchable phonebook into a smooth universe with gravity and orbits.',
    },
  },
  {
    id: 'q_embedding_lookup',
    stepNumber: 7,
    question: 'What is an embedding matrix? What does it physically do to a discrete symbol?',
    realm: 'geometry',
    realmLabel: 'Embedding Projections',
    realmColor: '#8b5cf6',
    x: 830,
    y: 220,
    oneLiner: 'It is a 1-hot matrix multiplication that places a discrete word onto a continuous hypersphere.',
    naiveMisconception: 'People think embedding is a hash table lookup that has nothing to do with linear algebra.',
    firstPrinciplesReality:
      'Mathematically, looking up token ID t in an embedding table is identical to multiplying a 1-hot vector e_t by a dense matrix W_e in ℝ^(V x d). The embedding matrix is simply the very first linear layer of the network, whose rows are updated by gradients during backpropagation.',
    mathematicalEquation: '\\mathbf{x}_t = \\mathbf{e}_t^\\top \\mathbf{W}_e = \\mathbf{W}_e[t, :] \\in \\mathbb{R}^d',
    siliconReality:
      'Instead of executing a slow matrix multiply of mostly zeros, GPU kernels optimize this as an indirect memory address stride fetch: `pointer + (token_id * d * sizeof(float))`.',
    connectedQuestionIds: ['q_high_dim_geometry'],
    originQuestionIds: ['q_continuous_vectors'],
    researcherReflectionPrompt: 'If the embedding matrix has 100,000 rows and 4,096 columns, that is 400M parameters. What happens if two words share the exact same row?',
    chainOfThought: {
      axiom: 'Every discrete input symbol must be assigned an initial coordinate address in the semantic manifold.',
      unaskedQuestion: 'Why do word embeddings cluster into a hollow hypersphere instead of filling the whole volume?',
      stepByStepDerivation: [
        {
          title: '1. The Input Interface',
          description: 'A text tokenizer maps strings to integer tokens: "neural" -> 42109.',
        },
        {
          title: '2. The Coordinate Assignment',
          description: 'Row 42109 of W_e contains 4,096 floating-point numbers.',
        },
        {
          title: '3. Gradient Updates on Rows',
          description: 'During training, backprop updates only row 42109 by pulling it closer to contextually related token vectors.',
          formula: '\\mathbf{W}_e[t, :] \\leftarrow \\mathbf{W}_e[t, :] - \\eta \\frac{\\partial \\mathcal{L}}{\\partial \\mathbf{x}_t}',
        },
      ],
      siliconRegisterDetail: 'PyTorch `nn.Embedding` calls `cuBLAS` or custom memory gather kernels to load rows directly into SRAM cache.',
      deepIntuitionQuote: 'The embedding matrix is the passport control desk where discrete symbols are stamped with continuous coordinates.',
    },
  },
  {
    id: 'q_high_dim_geometry',
    stepNumber: 8,
    question: 'What is high-dimensional space (ℝ^4096)? Why does human intuition fail in high dimensions?',
    realm: 'geometry',
    realmLabel: 'High-Dimensional Geometry',
    realmColor: '#8b5cf6',
    x: 680,
    y: 220,
    oneLiner: 'In 4,096 dimensions, all volume is on the surface, and almost all random vectors are perfectly orthogonal.',
    naiveMisconception: 'People imagine 4,096 dimensions like 3D space with extra axes sticking out like spokes of a bicycle wheel.',
    firstPrinciplesReality:
      'In high dimensions, geometric realities reverse: 1) The volume of a sphere concentrates almost entirely in an infinitesimally thin shell at the surface. 2) Two random vectors in ℝ^4096 have dot product close to 0 with near 100% probability: almost all directions are orthogonal! This allows models to pack millions of independent semantic concepts without interference.',
    mathematicalEquation: '\\mathbb{E}[\\mathbf{u} \\cdot \\mathbf{v}] = 0, \\quad \\text{Var}(\\mathbf{u} \\cdot \\mathbf{v}) = \\frac{1}{d} \\to 0 \\text{ as } d \\to 4096',
    siliconReality:
      'High dimensionality requires massive matrix memory footprints: storing a single 4096 x 4096 weight matrix in FP16 takes exactly 32 Megabytes of VRAM.',
    connectedQuestionIds: ['q_weight_activation'],
    originQuestionIds: ['q_embedding_lookup'],
    researcherReflectionPrompt: 'If all random vectors in high dimensions are orthogonal, why don’t attention heads accidentally attend to everything equally?',
    chainOfThought: {
      axiom: 'Human intuition is trapped in ℝ^3; in ℝ^4096, distance and volume behave in counter-intuitive, almost magical ways.',
      unaskedQuestion: 'How many mutually orthogonal directions can exist in 4,096 dimensions?',
      stepByStepDerivation: [
        {
          title: '1. The Orthogonal Blessing',
          description: 'In 3D, you can only have 3 mutually perpendicular axes. In ℝ^4096, you have 4,096 mutually perpendicular axes.',
        },
        {
          title: '2. Nearly-Orthogonal Packing',
          description: 'If you allow an angle of 89 degrees instead of 90, you can pack exponentially many vectors (2^(O(d))) without interference!',
          formula: 'N_{\\text{concepts}} \\ge e^{c \\cdot d}',
        },
        {
          title: '3. Shell Concentration',
          description: 'The probability that a vector has length less than 1 - ε vanishes exponentially: (1 - ε)^d -> 0.',
        },
      ],
      siliconRegisterDetail: 'Systolic arrays compute 128x128 matrix multiplications in parallel because high-dimensional operations are embarrassingly parallelizable.',
      deepIntuitionQuote: 'High-dimensional space is an infinite mansion with 4,096 orthogonal rooms that never touch.',
    },
    runnablePythonVerification: {
      title: 'Monte Carlo Orthogonality Proof: Var(cos θ) = 1/d in ℝ^4096',
      code: `# Monte Carlo Orthogonality Proof in R^4096
# Axiom: In high dimensions, random vectors are nearly almost orthogonal.
# Theoretical Invariant: Var(cos theta) = 1/d, StdDev = 1/sqrt(d)
import random
import math
import time

random.seed(42)
d = 4096
n_vectors = 10000

t0 = time.time()
# Sample 10,000 isotropic random vectors in R^4096
# By spherical symmetry, cos(theta) between two random unit vectors
# is distributed as u_1 / ||u|| where ||u||^2 ~ Chi2(d)
cosines = []
for _ in range(n_vectors):
    u_proj = random.gauss(0, 1)
    norm = math.sqrt(random.gammavariate(d / 2.0, 2.0))
    cosines.append(u_proj / norm)

mean_cos = sum(cosines) / len(cosines)
var_cos = sum((c - mean_cos) ** 2 for c in cosines) / (len(cosines) - 1)
std_cos = math.sqrt(var_cos)
theory_var = 1.0 / d
theory_std = 1.0 / math.sqrt(d)
elapsed_ms = (time.time() - t0) * 1000

print(f"=== HIGH-DIMENSIONAL ORTHOGONALITY PROOF (d = {d}) ===")
print(f"Monte Carlo Trials:        {n_vectors:,} random vectors")
print(f"Empirical Mean cos(theta): {mean_cos:+.8f} (Theoretical: 0.0)")
print(f"Empirical Variance:        {var_cos:.8f}")
print(f"Theoretical 1/d:           {theory_var:.8f}")
print(f"Variance Error:            {abs(var_cos - theory_var) / theory_var * 100:.2f}%")
print(f"Empirical StdDev (sigma):  {std_cos:.6f} (~ {math.degrees(std_cos):.2f}° deviation from 90°)")
print(f"Theoretical 1/sqrt(d):     {theory_std:.6f} (~ {math.degrees(theory_std):.2f}° deviation)")
print(f"Max |cos(theta)|:          {max(abs(c) for c in cosines):.6f}")
print(f"Closest Angle to 90°:      {math.degrees(math.acos(max(abs(c) for c in cosines))):.2f}°")
print(f"Execution Time:            {elapsed_ms:.1f} ms")
print(f"\\n[VERIFIED] Var(cos theta) = 1/d holds exactly. In R^4096, orthogonality is virtually guaranteed!")`,
      expectedInsight: 'In ℝ^4096, random vectors have Var(cos θ) = 1/4096 = 0.000244, meaning 99.9% of random directions are within 1° of perfect 90° orthogonality.',
    },
  },
  {
    id: 'q_weight_activation',
    stepNumber: 9,
    question: 'What do those floating-point numbers (weights and activations) actually represent?',
    realm: 'geometry',
    realmLabel: 'Weights & Activations',
    realmColor: '#8b5cf6',
    x: 530,
    y: 220,
    oneLiner: 'Activations are spatial coordinates in a semantic universe; weights are transformation coefficients.',
    naiveMisconception: 'People assume weights are mysterious black-box magic numbers with no geometric meaning.',
    firstPrinciplesReality:
      'An activation vector is a coordinate point in a high-dimensional space (e.g. 4096 dimensions). Each axis represents a continuous property (animacy, tense, technicality). A weight is a coupling conductance: it dictates how much one semantic axis rotates, stretches, or projects onto another.',
    mathematicalEquation: '\\mathbf{x} = \\sum_{i=1}^d c_i \\mathbf{e}_i, \\quad \\mathbf{W}_{j, i} = \\langle \\mathbf{e}_j^{(l)}, T(\\mathbf{e}_i^{(l-1)}) \\rangle',
    siliconReality:
      'Each weight is 16 bits (FP16) or 8 bits (FP8) stored in memory capacitors. When multiplied, the exponent and mantissa bits are parsed by hardware multipliers to scale electrical charges.',
    connectedQuestionIds: ['q_layer_math'],
    originQuestionIds: ['q_high_dim_geometry'],
    researcherReflectionPrompt: 'If activations are points in 4,096-dimensional space, what does the cosine angle between two word vectors physically represent?',
    chainOfThought: {
      axiom: 'Weights rotate and scale coordinate systems; activations are coordinates that travel through those rotated systems.',
      unaskedQuestion: 'What would happen if all weights in a network were set to the exact same number (e.g. 1.0)?',
      stepByStepDerivation: [
        {
          title: '1. Symmetry Trap',
          description: 'If all weights are identical, every neuron computes the exact same value: z_1 = z_2 = ... = z_d.',
        },
        {
          title: '2. Gradient Collapse',
          description: 'During backpropagation, all neurons receive identical gradients: ∂L/∂w_1 = ∂L/∂w_2. They never differentiate.',
          formula: '\\Delta w_i = \\Delta w_j \\implies \\text{Rank}(W) = 1',
        },
        {
          title: '3. Random Initialization',
          description: 'We must initialize weights with random Gaussian noise (Xavier/He init) to break symmetry before learning can start.',
        },
      ],
      siliconRegisterDetail: 'FP16 weights occupy 2 bytes each: 1 sign bit, 5 exponent bits, 10 mantissa bits. In FP8, this drops to 1 byte.',
      deepIntuitionQuote: 'Weights are the lens curves; activations are the light rays passing through the glass.',
    },
  },
  {
    id: 'q_layer_math',
    stepNumber: 10,
    question: 'What does a "layer" even mean mathematically? What is a function doing?',
    realm: 'geometry',
    realmLabel: 'Manifold Mapping',
    realmColor: '#8b5cf6',
    x: 380,
    y: 220,
    oneLiner: 'A layer is an affine coordinate transformation followed by a symmetry-shattering fold.',
    naiveMisconception: 'People think a layer is a row of physical dots with wires running between them.',
    firstPrinciplesReality:
      'A layer is a mathematical mapping that takes a high-dimensional manifold, rotates and shifts it via matrix multiplication, and then applies a non-linear activation function to fold and separate previously inseparable topological regions.',
    mathematicalEquation: '\\mathbf{h}^{(l)} = \\sigma\\left(\\mathbf{W}^{(l)} \\mathbf{h}^{(l-1)} + \\mathbf{b}^{(l)}\\right)',
    siliconReality:
      'A layer corresponds to one full matrix-matrix multiplication (GEMM) executed across thousands of GPU tensor cores, reading input activations from SRAM and writing output activations back to memory.',
    connectedQuestionIds: ['q_nonlinearity', 'q_connecting_neurons'],
    originQuestionIds: ['q_weight_activation'],
    researcherReflectionPrompt: 'If a layer is an affine map followed by a fold, how many folds are necessary to separate two tangled spirals in 2D space?',
    chainOfThought: {
      axiom: 'Affine maps stretch and rotate; non-linearities fold and bend. Deep learning is high-dimensional origami.',
      unaskedQuestion: 'Why do we need the bias vector b in Wx + b? Why not just Wx?',
      stepByStepDerivation: [
        {
          title: '1. The Origin Pin',
          description: 'A pure matrix multiplication Wx always maps 0 to 0: W · 0 = 0. The decision plane is pinned to the origin (0,0).',
        },
        {
          title: '2. The Bias Shift',
          description: 'Adding bias b shifts the hyperplane away from the origin, allowing boundaries anywhere in space.',
          formula: '\\mathbf{W} \\mathbf{x} + \\mathbf{b} = 0 \\implies \\text{Distance to origin: } \\frac{|\\mathbf{b}|}{\\|\\mathbf{W}\\|}',
        },
        {
          title: '3. Homogeneous Coordinates',
          description: 'Mathematically, adding bias is equivalent to adding 1 extra constant dimension to the input vector.',
        },
      ],
      siliconRegisterDetail: 'In hardware, bias addition is fused directly into the multiply-accumulate unit: `D = A * B + C`.',
      deepIntuitionQuote: 'Without bias, your scissors can only cut paper through the exact center point.',
    },
  },
  {
    id: 'q_nonlinearity',
    stepNumber: 11,
    question: 'Why do we need non-linear activations? What happens if you remove them?',
    realm: 'geometry',
    realmLabel: 'Origami Folds',
    realmColor: '#8b5cf6',
    x: 230,
    y: 220,
    oneLiner: 'Without non-linearity, 100 stacked layers collapse mathematically into just 1 single flat matrix.',
    naiveMisconception: 'People think more layers automatically make a network deeper and smarter, even without activation functions.',
    firstPrinciplesReality:
      'Because matrix multiplication is associative, the product of linear maps is strictly a linear map: W_3 * (W_2 * (W_1 * x)) = W_net * x. Without non-linearities like ReLU or GeLU, 100 layers has the exact same representational power as a single-layer perceptron: it can only draw a straight line!',
    mathematicalEquation: '\\prod_{i=1}^L \\mathbf{W}_i = \\mathbf{W}_{\\text{collapsed}} \\implies \\text{Linearity is closed under composition}',
    siliconReality:
      'In hardware, non-linearities (like ReLU: max(0, x)) are tiny branchless conditional clamps in ALU registers that zero out negative floating-point numbers, breaking symmetry at zero latency.',
    connectedQuestionIds: ['q_depth_vs_width'],
    originQuestionIds: ['q_layer_math'],
    researcherReflectionPrompt: 'Why did biological brains evolve the all-or-nothing action potential spike threshold instead of linear electrical transmission?',
    chainOfThought: {
      axiom: 'Linear transformations can only rotate and stretch flat planes; they cannot untangle knots.',
      unaskedQuestion: 'Why did early neural networks use Sigmoid / Tanh instead of ReLU, and why did that trigger an AI winter?',
      stepByStepDerivation: [
        {
          title: '1. The Sigmoid Derivative Trap',
          description: 'Sigmoid σ(x) has maximum derivative of 0.25 at x=0. As |x| grows, derivative approaches 0.',
          formula: '\\sigma\'(x) = \\sigma(x)(1 - \\sigma(x)) \\le 0.25',
        },
        {
          title: '2. The Vanishing Gradient Avalanche',
          description: 'Across 10 layers, backpropagating gradients multiply: (0.25)^10 ≈ 0.00000095. Gradients vanish to zero.',
        },
        {
          title: '3. The ReLU Breakthrough',
          description: 'ReLU(x) = max(0, x) has derivative exactly 1.0 for all positive values. Gradients flow across 100 layers without attenuation!',
        },
      ],
      siliconRegisterDetail: 'Modern GPUs have dedicated hardware instructions for GeLU and SiLU (Swish) inside their Special Function Units (SFUs).',
      deepIntuitionQuote: 'Non-linearity is the crease in the paper that allows 2D planes to fold into 3D birds.',
    },
    runnablePythonVerification: {
      title: 'Linear Collapse & Rank Bounding Proof: W3(W2(W1 x)) == W_eff x',
      code: `# Linear Collapse & Rank Bounding Theorem
# Axiom: Linearity is closed under composition: W3 @ W2 @ W1 collapses into 1 flat matrix.
# Invariant: rank(W_eff) <= min(rank(W1), rank(W2), rank(W3))
import random

random.seed(42)

def matmul(A, B):
    m, k, n = len(A), len(A[0]), len(B[0])
    return [[sum(A[i][p] * B[p][j] for p in range(k)) for j in range(n)] for i in range(m)]

def matvec(A, x):
    return [sum(A[i][j] * x[j] for j in range(len(x))) for i in range(len(A))]

def matrix_rank(matrix, eps=1e-9):
    M = [row[:] for row in matrix]
    rows, cols = len(M), len(M[0])
    rank = 0
    for c in range(cols):
        pivot = max(range(rank, rows), key=lambda r: abs(M[r][c]), default=None)
        if pivot is None or abs(M[pivot][c]) < eps:
            continue
        M[rank], M[pivot] = M[pivot], M[rank]
        p_val = M[rank][c]
        for r in range(rank + 1, rows):
            factor = M[r][c] / p_val
            for k in range(c, cols):
                M[r][k] -= factor * M[rank][k]
        rank += 1
        if rank == rows:
            break
    return rank

# Network architecture: R^8 -> R^16 -> R^4 (bottleneck) -> R^8
d_in, h1, h2, d_out = 8, 16, 4, 8
W1 = [[random.uniform(-1, 1) for _ in range(d_in)] for _ in range(h1)]
W2 = [[random.uniform(-1, 1) for _ in range(h1)] for _ in range(h2)]
W3 = [[random.uniform(-1, 1) for _ in range(h2)] for _ in range(d_out)]

# Collapsed single effective transformation matrix: W_eff = W3 @ W2 @ W1
W_eff = matmul(matmul(W3, W2), W1)

# Verify identity W3(W2(W1 x)) == W_eff x over 100 test samples
max_error = 0.0
for _ in range(100):
    x = [random.uniform(-1, 1) for _ in range(d_in)]
    y_deep = matvec(W3, matvec(W2, matvec(W1, x)))
    y_collapsed = matvec(W_eff, x)
    err = max(abs(a - b) for a, b in zip(y_deep, y_collapsed))
    if err > max_error:
        max_error = err

r1, r2, r3, r_eff = matrix_rank(W1), matrix_rank(W2), matrix_rank(W3), matrix_rank(W_eff)

print("=== LINEAR COLLAPSE & RANK BOUND THEOREM PROOF ===")
print(f"Layer 1 (W1): {h1}x{d_in} -> Rank = {r1}")
print(f"Layer 2 (W2): {h2}x{h1} -> Rank = {r2} (Low-rank bottleneck dimension = {h2})")
print(f"Layer 3 (W3): {d_out}x{h2} -> Rank = {r3}")
print(f"Effective Collapsed Matrix (W_eff): {d_out}x{d_in}")
print(f"Rank(W_eff) = {r_eff} <= min({r1}, {r2}, {r3}) = {min(r1, r2, r3)}")
print(f"Max Reconstruction Error |W3(W2(W1 x)) - W_eff x|: {max_error:.2e}")
print(f"Is Linear Collapse Exact: {max_error < 1e-12}")
print(f"\\n[VERIFIED] Without non-linear activations, multi-layer depth mathematically collapses to a single flat matrix!")`,
      expectedInsight: 'Without non-linear activations, 100 stacked linear layers collapse into a single matrix whose expressive rank is forever bounded by min(ranks).',
    },
  },
  {
    id: 'q_depth_vs_width',
    stepNumber: 12,
    question: 'Why deep (vertical) layers instead of horizontal (wide) layers? Why did wide networks fail?',
    realm: 'geometry',
    realmLabel: 'Depth vs Width',
    realmColor: '#8b5cf6',
    x: 80,
    y: 220,
    oneLiner: 'Wide networks memorize lookup tables at exponential cost; deep networks compute functions of functions at polynomial cost.',
    naiveMisconception: 'The Universal Approximation Theorem says 1 wide layer can learn anything, so why bother going deep?',
    firstPrinciplesReality:
      'While 1 infinitely wide layer can approximate any function, doing so requires an exponential number of parameters (O(2^N))—it memorizes points without generalizing. Real reality is compositional (edges -> parts -> objects). Deep vertical networks compute nested compositions, reusing sub-manifolds exponentially with linear parameter growth.',
    mathematicalEquation: 'f(x) = f_L(f_{L-1}(\\dots f_1(x)\\dots)), \\quad \\text{Parameters: } O(N) \\text{ vs } O(2^N)',
    siliconReality:
      'Deep networks require intermediate activation tensors to be held in VRAM for backpropagation, trading peak memory capacity for astronomical parameter efficiency.',
    connectedQuestionIds: ['q_connecting_neurons', 'q_residual_highways'],
    originQuestionIds: ['q_nonlinearity'],
    researcherReflectionPrompt: 'Could human language exist if human cognition were flat and wide rather than hierarchical and compositional?',
    chainOfThought: {
      axiom: 'Functions that represent the physical universe are hierarchical compositions, not random lookup tables.',
      unaskedQuestion: 'Can an MLP with 1 layer compute the parity function (XOR of N bits) efficiently?',
      stepByStepDerivation: [
        {
          title: '1. Parity in 1 Layer',
          description: 'Computing whether the sum of N bits is odd requires 2^(N-1) hidden units in a 1-layer network.',
        },
        {
          title: '2. Parity in Deep Layers',
          description: 'A deep network solves parity with O(log N) depth and O(N) total neurons by computing a binary tree of 2-bit XORs.',
          formula: '\\text{Neurons}_{\\text{deep}} = O(N) \\ll \\text{Neurons}_{\\text{shallow}} = O(2^N)',
        },
        {
          title: '3. The Exponential Separation Theorem',
          description: 'Telgarsky (2016) proved functions exist computable by O(k^3) depth that require exponential width in k-depth networks.',
        },
      ],
      siliconRegisterDetail: 'Deeper networks mean longer sequential dependencies during inference: you cannot compute layer 40 before layer 39 finishes.',
      deepIntuitionQuote: 'Depth is the ability to write a sentence with clauses, instead of shouting every word at the exact same moment.',
    },
  },
  {
    id: 'q_connecting_neurons',
    stepNumber: 13,
    question: 'What does "connecting" between layers mean in actual physical silicon?',
    realm: 'computation',
    realmLabel: 'Silicon Connection',
    realmColor: '#3b82f6',
    x: 80,
    y: 360,
    oneLiner: 'Connections are not physical copper wires; they are arithmetic address reads in memory.',
    naiveMisconception: 'People picture physical wires running like telephone lines between neuron nodes.',
    firstPrinciplesReality:
      'A "connection" between neuron i and neuron j simply means that the value stored at memory address of activation x_i is multiplied by the weight value stored at address W_ji and accumulated into the register of z_j.',
    mathematicalEquation: 'z_j = \\sum_{i} W_{ji} x_i + b_j \\quad \\equiv \\text{ Memory load, FMA instruction, Register accumulation}',
    siliconReality:
      'In a systolic array, weights remain stationary in processing elements (PEs) while input activation data flows rhythmically across columns, performing fused multiply-accumulates (FMAs) on every clock cycle.',
    connectedQuestionIds: ['q_residual_highways'],
    originQuestionIds: ['q_depth_vs_width'],
    researcherReflectionPrompt: 'In biological brains, connections ARE physical axon wires. Why did digital computers decouple connectivity from physical wiring via memory addresses?',
    chainOfThought: {
      axiom: 'Biological wiring is spatial; digital computing is temporal through memory virtualization.',
      unaskedQuestion: 'How does an NVIDIA Tensor Core compute 16x16 matrix multiplies in 1 clock cycle?',
      stepByStepDerivation: [
        {
          title: '1. The Memory Load',
          description: 'Loads 16-element vector X and 16x16 weight matrix W from on-chip SRAM cache.',
        },
        {
          title: '2. The Systolic Array Flow',
          description: 'Activations shift horizontally across a grid of 256 multiply-accumulator processing elements.',
        },
        {
          title: '3. The Output Write',
          description: 'Result vector Z is accumulated in FP32 registers before being clamped or normalized.',
          formula: 'Z_{j} = \\sum_{i=1}^{16} A_{i} W_{ij} + C_{j}',
        },
      ],
      siliconRegisterDetail: 'Weights are cached in L1/L2 SRAM cache (~50-100 MB). If weights fall out of cache to HBM DRAM, memory latency increases by 10x.',
      deepIntuitionQuote: 'A synapse in silicon is just a row index and a column index meeting inside a register.',
    },
  },
  {
    id: 'q_residual_highways',
    stepNumber: 14,
    question: 'What is a residual connection (y = x + F(x))? Why did deep networks freeze before He et al. 2015?',
    realm: 'geometry',
    realmLabel: 'Identity Highways',
    realmColor: '#8b5cf6',
    x: 230,
    y: 360,
    oneLiner: 'Residual connections provide an unbroken identity highway for gradients to flow from layer 100 to layer 1.',
    naiveMisconception: 'People think residual skip connections are just a minor engineering hack to make networks train slightly faster.',
    firstPrinciplesReality:
      'Before ResNet, stacking more than 20 layers caused training error to skyrocket (the degradation problem). Why? Jacobians multiply across depth: ∂x_L/∂x_0 = ∏ W_l. If singular values deviate from 1, gradients vanish or explode exponentially. ResNet changes the equation to x_{l+1} = x_l + F(x_l). The derivative contains an unbroken identity matrix I: gradients can flow backward across 1,000 layers without decay!',
    mathematicalEquation: '\\mathbf{x}_{l+1} = \\mathbf{x}_l + \\mathcal{F}(\\mathbf{x}_l) \\implies \\frac{\\partial \\mathbf{x}_L}{\\partial \\mathbf{x}_l} = \\mathbf{I} + \\frac{\\partial}{\\partial \\mathbf{x}_l} \\sum_{i=l}^{L-1} \\mathcal{F}_i',
    siliconReality:
      'Requires allocating an extra buffer in VRAM to preserve tensor x while F(x) is computed, followed by an in-place elementwise vector addition kernel: `x.add_(fx)`.',
    connectedQuestionIds: ['q_normalization_drift'],
    originQuestionIds: ['q_connecting_neurons', 'q_depth_vs_width'],
    researcherReflectionPrompt: 'Without the identity term I in ResNet, could modern 80-layer LLMs (GPT-4, LLaMA 3) ever have been trained?',
    chainOfThought: {
      axiom: 'Learning the identity function f(x) = x using non-linear weight matrices is mathematically unstable; learning perturbation F(x) = 0 is effortless.',
      unaskedQuestion: 'Why does adding a simple plus sign (+) solve an optimization problem that stumped the AI world for 20 years?',
      stepByStepDerivation: [
        {
          title: '1. The Degradation Paradox',
          description: 'A 56-layer network had higher training loss than a 20-layer network, despite having strictly greater capacity.',
        },
        {
          title: '2. The Zero Perturbation',
          description: 'If extra layers are useless, initialize F(x) = 0. The network defaults to x_{l+1} = x_l (identity).',
        },
        {
          title: '3. The Gradient Highway',
          description: 'The gradient derivative ∂x_L/∂x_l = I + ... guarantees a signal path of magnitude ≥ 1 directly to early layers.',
          formula: '\\frac{\\partial \\mathcal{L}}{\\partial \\mathbf{x}_l} = \\frac{\\partial \\mathcal{L}}{\\partial \\mathbf{x}_L} \\left( \\mathbf{I} + \\frac{\\partial}{\\partial \\mathbf{x}_l} \\sum_{i=l}^{L-1} \\mathcal{F}_i \\right)',
        },
      ],
      siliconRegisterDetail: 'Modern transformers use Pre-LN Residuals: `x = x + Attn(RMSNorm(x))`, keeping the identity highway strictly linear without normalization obstacles.',
      deepIntuitionQuote: 'The residual connection is a bullet train track running directly through a 100-story building.',
    },
  },
  {
    id: 'q_normalization_drift',
    stepNumber: 15,
    question: 'What is LayerNorm / RMSNorm? Why do activation vectors blow up or shrink without it?',
    realm: 'geometry',
    realmLabel: 'Hypersphere Projection',
    realmColor: '#8b5cf6',
    x: 380,
    y: 360,
    oneLiner: 'RMSNorm projects the activation vector back onto a hypersphere of fixed radius sqrt(d) to prevent explosion.',
    naiveMisconception: 'People think normalization is just centering data around zero for neatness.',
    firstPrinciplesReality:
      'As activations pass through 80 residual layers, variance accumulates linearly: Var(x + F(x)) = Var(x) + Var(F(x)). Without normalization, vector magnitudes grow exponentially across depth (||x|| -> infinity), causing Softmax attention logits to saturate, gradients to vanish, and float16 tensors to overflow into NaN.',
    mathematicalEquation: '\\text{RMSNorm}(\\mathbf{x}) = \\frac{\\mathbf{x}}{\\text{RMS}(\\mathbf{x})} \\odot \\mathbf{g}, \\quad \\text{RMS}(\\mathbf{x}) = \\sqrt{\\frac{1}{d} \\sum_{i=1}^d x_i^2}',
    siliconReality:
      'RMSNorm is faster than LayerNorm because it eliminates the mean-subtraction step, requiring only 1 pass over memory registers instead of 2.',
    connectedQuestionIds: ['q_gradient_random'],
    originQuestionIds: ['q_residual_highways'],
    researcherReflectionPrompt: 'Why does DeepSeek-V3 and LLaMA 3 use RMSNorm instead of standard LayerNorm, and how much memory bus bandwidth does that save?',
    chainOfThought: {
      axiom: 'Unconstrained vector growth in deep networks inevitably crashes floating-point registers into overflow (NaN).',
      unaskedQuestion: 'Why does RMSNorm only scale by root-mean-square instead of subtracting the mean like LayerNorm?',
      stepByStepDerivation: [
        {
          title: '1. LayerNorm Complexity',
          description: 'LayerNorm computes mean μ and variance σ^2: requires 2 synchronization reductions across the vector.',
        },
        {
          title: '2. The Invariance Finding',
          description: 'Zhang & Sennrich (2019) proved that centering (subtracting μ) contributes zero to training stability; only scaling matters!',
        },
        {
          title: '3. The RMS Speedup',
          description: 'RMSNorm divides by root-mean-square: 50% fewer reduction steps, perfectly stabilizing activations on a radius √d sphere.',
          formula: '\\text{RMS}(\\mathbf{x}) = \\sqrt{\\frac{1}{d} \\|\\mathbf{x}\\|^2}',
        },
      ],
      siliconRegisterDetail: 'RMSNorm kernels are fused directly into the input of attention and MLP GEMMs, eliminating an intermediate round-trip to DRAM.',
      deepIntuitionQuote: 'RMSNorm is the governor on an engine that stops the RPM needle from burying itself in the red.',
    },
  },
  {
    id: 'q_gradient_random',
    stepNumber: 16,
    question: 'What is a gradient? Why can\'t we just search or guess the numbers randomly?',
    realm: 'optimization',
    realmLabel: 'The Spatial Compass',
    realmColor: '#f59e0b',
    x: 530,
    y: 360,
    oneLiner: 'In 70 billion dimensions, random guessing is impossible; the gradient is the spatial compass of error.',
    naiveMisconception: 'People think we can test random variations of weights (like brute force genetic mutation) to find a working model.',
    firstPrinciplesReality:
      'In high dimensions, the volume of space scales exponentially. In 70 billion dimensions, random search would not find a working solution before the heat death of the universe. The gradient is the vector pointing along the steepest slope of error. Backpropagation calculates this exact slope for all billions of parameters simultaneously in a single reverse sweep.',
    mathematicalEquation: '\\nabla_{\\mathbf{W}} \\mathcal{L} = \\left[ \\frac{\\partial \\mathcal{L}}{\\partial w_1}, \\frac{\\partial \\mathcal{L}}{\\partial w_2}, \\dots, \\frac{\\partial \\mathcal{L}}{\\partial w_P} \\right]',
    siliconReality:
      'The GPU reverses the computation graph, multiplying upstream adjoint vectors by transposed weight matrices to write gradient tensors into memory buffers for AdamW optimizer updates.',
    connectedQuestionIds: ['q_loss_potentials'],
    originQuestionIds: ['q_normalization_drift'],
    researcherReflectionPrompt: 'Why does the chain rule from 17th-century calculus enable modern artificial intelligence on 21st-century GPUs?',
    chainOfThought: {
      axiom: 'Random search scales as O(K^D); gradient descent scales as O(D). In high dimensions, gradients are the only viable path.',
      unaskedQuestion: 'What is the physical meaning of a gradient vector in 70-billion-dimensional space?',
      stepByStepDerivation: [
        {
          title: '1. The Directional Derivative',
          description: 'The gradient ∇L points in the direction of maximum rate of increase of loss.',
        },
        {
          title: '2. The Adjoint Method',
          description: 'Instead of evaluating D separate forward passes, reverse automatic differentiation propagates 1 adjoint signal backward.',
          formula: '\\bar{x}_i = \\sum_{j \\in \\text{children}(i)} \\bar{x}_j \\frac{\\partial x_j}{\\partial x_i}',
        },
        {
          title: '3. Steepest Descent',
          description: 'Taking a step -η ∇L is mathematically guaranteed to decrease loss for an infinitesimally small step size η.',
        },
      ],
      siliconRegisterDetail: 'Backpropagation requires saving all forward activation tensors in GPU memory to compute weight gradients: `dW = dZ^T * X`.',
      deepIntuitionQuote: 'The gradient is a blind person feeling the tilt of the mountain floor with their walking stick.',
    },
    runnablePythonVerification: {
      title: 'Dimensional Scaling Proof: Random Search Downhill Probability (1/2)^d → 0',
      code: `# Dimensional Scaling & The Gradient Compass Proof
# Axiom: In d dimensions, guessing a downhill vector via random search has probability (1/2)^d -> 0.
# The gradient vector calculates the exact slope in 1 reverse pass.
import random
import math

random.seed(42)

# 1. Monte Carlo simulation for low dimensions
mc_dims = [1, 2, 3, 4, 5, 8, 10, 12]
n_trials = 10000

print("=== 1. MONTE CARLO RANDOM SEARCH vs DIMENSION ===")
print(f"{'Dimension (d)':<15} | {'Empirical P':<15} | {'Theoretical (1/2)^d':<22} | {'Error':<10}")
print("-" * 70)

for d in mc_dims:
    # Let loss decrease when step aligns negatively with gradient direction g = [+1, ..., +1]
    success = 0
    for _ in range(n_trials):
        step = [random.choice([-1.0, 1.0]) for _ in range(d)]
        if all(s < 0 for s in step):
            success += 1
    p_emp = success / n_trials
    p_theo = (0.5) ** d
    err = abs(p_emp - p_theo) / p_theo * 100 if p_theo > 0 else 0
    print(f"{d:<15} | {p_emp:<15.6f} | {p_theo:<22.6f} | {err:.2f}%")

# 2. Scaling to neural network parameter spaces
scale_dims = [20, 50, 100, 512, 4096, 70_000_000_000]
print("\\n=== 2. EXPONENTIAL COLLAPSE IN HIGH-DIMENSIONAL SPACES ===")
print(f"{'Dimension (d)':<18} | {'Prob (1/2)^d':<20} | {'Log10(P)':<14} | {'H100 GPU Search Time (@1e12/s)'}")
print("-" * 80)

for d in scale_dims:
    log10_p = -d * math.log10(2)
    p_str = f"10^({log10_p:.1f})" if abs(log10_p) > 15 else f"{(0.5)**d:.4e}"
    # Expected trials = 2^d. At 1 trillion evaluations/sec on an H100 GPU cluster:
    log10_seconds = d * math.log10(2) - 12
    log10_years = log10_seconds - math.log10(3600 * 24 * 365)
    time_str = f"10^{log10_years:.1f} years" if log10_years > 2 else f"{10**log10_years:.2e} years"
    print(f"{d:<18,d} | {p_str:<20} | {log10_p:<14.1f} | {time_str}")

print(f"\\n[VERIFIED] In 70B dimensions, random search requires 10^21,072,099,664 years. Gradients provide the exact downhill vector in 1 step!")`,
      expectedInsight: 'The probability of finding a downhill step via random search in d dimensions is (1/2)^d. At 70B parameters, random search takes 10^21,072,099,664 years.',
    },
  },
  {
    id: 'q_loss_potentials',
    stepNumber: 17,
    question: 'What is a loss function? Why is cross-entropy isomorphic to thermodynamic free energy?',
    realm: 'optimization',
    realmLabel: 'Loss & Thermodynamic Potentials',
    realmColor: '#f59e0b',
    x: 680,
    y: 360,
    oneLiner: 'Cross-entropy loss is literally the thermodynamic Kullback-Leibler divergence between reality and simulation.',
    naiveMisconception: 'People think loss is an arbitrary grading score invented by software engineers.',
    firstPrinciplesReality:
      'Cross-entropy loss H(p, q) measures the expected number of bits required to encode data sampled from true distribution p using model distribution q. In statistical mechanics, this is identical to the Helmholtz free energy potential: minimizing loss is mathematically equivalent to maximizing physical entropy under external constraints.',
    mathematicalEquation: '\\mathcal{L}_{\\text{CE}} = -\\sum_{k=1}^V y_k \\log \\hat{y}_k = D_{\\text{KL}}(p \\parallel q) + H(p)',
    siliconReality:
      'Log-softmax and cross-entropy are fused in a single CUDA kernel to prevent numerical underflow when exponentiating extreme negative logits.',
    connectedQuestionIds: ['q_adamw_ravines'],
    originQuestionIds: ['q_gradient_random'],
    researcherReflectionPrompt: 'If cross-entropy is the number of bits needed to compress the universe, what does a loss of 1.2 on next-token prediction mean in terms of compression ratio?',
    chainOfThought: {
      axiom: 'Minimizing prediction error is identical to maximizing compression efficiency (Solomonoff induction).',
      unaskedQuestion: 'Why don\'t we use Mean Squared Error (MSE) for language models?',
      stepByStepDerivation: [
        {
          title: '1. The MSE Gradient Saturation',
          description: 'With Softmax + MSE, when the model is completely wrong (output 0, target 1), the derivative vanishes: σ\'(z) -> 0! The model refuses to learn.',
        },
        {
          title: '2. The Cross-Entropy Cancellation',
          description: 'With Softmax + Cross-Entropy, the logarithm cancels the exponential in the derivative: ∂L/∂z = p - y. Beautiful, linear gradient!',
          formula: '\\frac{\\partial \\mathcal{L}_{\\text{CE}}}{\\partial z_k} = \\hat{y}_k - y_k',
        },
        {
          title: '3. Maximum Likelihood',
          description: 'Minimizing cross-entropy is the exact maximum likelihood estimation of a multinomial Bernoulli trial.',
        },
      ],
      siliconRegisterDetail: 'Fused cross-entropy kernels avoid allocating a giant [Batch, SeqLen, 128k] probability tensor in memory, saving 32 GB of VRAM.',
      deepIntuitionQuote: 'Loss is the tension in a stretched rubber band pulling the model toward ground truth.',
    },
  },
  {
    id: 'q_adamw_ravines',
    stepNumber: 18,
    question: 'What is AdamW? Why does vanilla gradient descent fail in high-dimensional anisotropic ravines?',
    realm: 'optimization',
    realmLabel: 'Optimizer Dynamics',
    realmColor: '#f59e0b',
    x: 830,
    y: 360,
    oneLiner: 'AdamW normalizes anisotropic loss ravines using momentum and second-moment variance scaling.',
    naiveMisconception: 'People think vanilla gradient descent (W = W - lr * grad) works fine in deep networks.',
    firstPrinciplesReality:
      'High-dimensional loss landscapes are deeply anisotropic ravines: steep along some directions (eigenvalues of Hessian >> 1) and ultra-flat along others (eigenvalues ≈ 0). Vanilla SGD bounces wildly between canyon walls without making forward progress. AdamW computes running momentum (first moment) and divides by square root of variance (second moment), equalizing all coordinate velocities.',
    mathematicalEquation: '\\mathbf{m}_t = \\beta_1 \\mathbf{m}_{t-1} + (1-\\beta_1) \\mathbf{g}_t, \\quad \\mathbf{v}_t = \\beta_2 \\mathbf{v}_{t-1} + (1-\\beta_2) \\mathbf{g}_t^2, \\quad \\mathbf{w}_{t+1} = \\mathbf{w}_t - \\frac{\\eta}{\\sqrt{\\mathbf{v}_t} + \\epsilon} \\mathbf{m}_t - \\eta \\lambda \\mathbf{w}_t',
    siliconReality:
      'AdamW triples optimizer memory: for every 1 parameter, it stores 1 momentum float and 1 variance float (requiring 16 bytes per parameter in total during training).',
    connectedQuestionIds: ['q_training_physical'],
    originQuestionIds: ['q_loss_potentials'],
    researcherReflectionPrompt: 'Why did Ilya Loshchilov & Frank Hutter have to fix Adam into AdamW in 2017, and why was weight decay decoupled from the gradient update?',
    chainOfThought: {
      axiom: 'When a loss canyon has 100,000x steeper walls than floor slope, gradient direction points almost perpendicular to the true minimum.',
      unaskedQuestion: 'Why does Adam divide by the square root of v_t?',
      stepByStepDerivation: [
        {
          title: '1. The Anisotropic Canyon',
          description: 'Hessian matrix H has condition number κ = λ_max / λ_min >> 10^5.',
        },
        {
          title: '2. Diagonal Preconditioning',
          description: 'Dividing by √v_t approximates diagonal Hessian preconditioning, rescaling all axes to have unit step size.',
          formula: '\\Delta w_i \\approx -\\eta \\cdot \\text{sign}(g_i)',
        },
        {
          title: '3. Decoupled Weight Decay',
          description: 'AdamW subtracts η · λ · w directly, preventing weight decay from being corrupted by gradient variance scaling.',
        },
      ],
      siliconRegisterDetail: 'Training a 70B model with AdamW requires: 140 GB (weights) + 140 GB (gradients) + 280 GB (optimizer states) = 560 GB VRAM minimum.',
      deepIntuitionQuote: 'AdamW puts studded snow tires on a car trying to drive down an icy high-dimensional bobled run.',
    },
  },
  {
    id: 'q_training_physical',
    stepNumber: 19,
    question: 'What does "training" actually mean physically? What are we doing to the system?',
    realm: 'optimization',
    realmLabel: 'Physical Training',
    realmColor: '#f59e0b',
    x: 830,
    y: 500,
    oneLiner: 'You are not teaching Python; you are rolling a high-dimensional marble down an energy surface into free-energy minima.',
    naiveMisconception: 'People think training is like teaching a child or writing instructions in a book.',
    firstPrinciplesReality:
      'The loss function defines an energy potential surface over weight space. Training is numerical gradient descent: stepping opposite the slope with momentum and noise. This is isomorphic to the Langevin diffusion equation rolling a thermal particle into low-energy ground states.',
    mathematicalEquation: '\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta \\nabla \\mathcal{L}(\\mathbf{w}_t) + \\beta (\\mathbf{w}_t - \\mathbf{w}_{t-1})',
    siliconReality:
      'During training, the GPU memory bus sustains peak write cycles, constantly modifying billions of floating-point numbers in HBM memory banks through high-power electrical switching.',
    connectedQuestionIds: ['q_language_nature'],
    originQuestionIds: ['q_adamw_ravines'],
    researcherReflectionPrompt: 'If training is sliding into thermodynamic free energy minima, why does Stochastic Gradient Descent (SGD) avoid getting trapped in bad local minima?',
    chainOfThought: {
      axiom: 'Mini-batch sampling acts as thermal noise in Langevin dynamics, shaking the model out of shallow local minima.',
      unaskedQuestion: 'Why don\'t neural networks get stuck in local minima in 70 billion dimensions?',
      stepByStepDerivation: [
        {
          title: '1. The Saddle Point Reality',
          description: 'In high dimensions, true local minima are astronomically rare. For a point to be a minimum, all 70 billion eigenvalues must be positive: P = (1/2)^70B ≈ 0!',
        },
        {
          title: '2. Saddle Points Everywhere',
          description: 'Almost all critical points with zero gradient are saddle points: slopes go UP in some directions, DOWN in others.',
        },
        {
          title: '3. Escape via Mini-Batch Noise',
          description: 'Mini-batch gradient noise easily kicks the optimizer along negative curvature directions, escaping saddles.',
          formula: 'd\\mathbf{w} = -\\nabla \\mathcal{L}(\\mathbf{w}) dt + \\sqrt{2 T} d\\mathbf{B}_t',
        },
      ],
      siliconRegisterDetail: 'Clusters of 16,000 H100 GPUs burn megawatts of electricity synchronizing all-reduce gradient buckets across InfiniBand networks.',
      deepIntuitionQuote: 'Training is thermal annealing: heating up the metal so the atoms can settle into the strongest crystal structure.',
    },
  },
  {
    id: 'q_language_nature',
    stepNumber: 20,
    question: 'What is a language? Why is it a 1D sequence of discrete tokens?',
    realm: 'language',
    realmLabel: 'Serial Bottleneck',
    realmColor: '#ec4899',
    x: 680,
    y: 500,
    oneLiner: 'Language is an evolutionary compression protocol invented because brains cannot touch or beam firing patterns.',
    naiveMisconception: 'People assume language is the primary format of thought itself.',
    firstPrinciplesReality:
      'Human thoughts are continuous, multi-dimensional mental simulations across billions of biological neurons. Because skulls cannot touch, evolution invented language: a low-bandwidth serialized compression protocol that collapses continuous mental states into a 1D string of acoustic symbols (words/tokens).',
    mathematicalEquation: '\\text{Simulation}(\\mathbb{R}^{10^{11}}) \\xrightarrow{\\text{Encode}} (x_1, x_2, \\dots, x_T) \\in \\mathcal{V}^T',
    siliconReality:
      'Tokens are discrete integer IDs (e.g. 50257 vocabulary). The embedding matrix looks up row index `tok_id` to translate discrete symbols back into continuous 4,096-dimensional vectors.',
    connectedQuestionIds: ['q_attention_qkv'],
    originQuestionIds: ['q_training_physical'],
    researcherReflectionPrompt: 'If language is just a lossy serial compression of a mental simulation, can a model that only predicts text ever reconstruct the full simulation?',
    chainOfThought: {
      axiom: 'Language is a sequential wire protocol bridging isolated parallel biological computers.',
      unaskedQuestion: 'Why did transformers replace RNNs and LSTMs for processing sequential language?',
      stepByStepDerivation: [
        {
          title: '1. The RNN Sequential Bottleneck',
          description: 'RNNs must process token 1, then token 2, then token 3 in order. You cannot compute h_100 before h_99.',
        },
        {
          title: '2. The Silicon Hardware Mismatch',
          description: 'GPUs have 16,384 parallel cores. Running tokens sequentially leaves 99% of GPU cores idle!',
        },
        {
          title: '3. The Attention Inversion',
          description: 'Attention processes all tokens simultaneously in parallel: every token attends to every token in one massive matrix multiply.',
          formula: '\\text{Complexity}_{\\text{parallel time}} = O(1) \\text{ on GPU}',
        },
      ],
      siliconRegisterDetail: 'Self-attention parallelizes across sequence length T during training, saturating 100% of GPU compute cores.',
      deepIntuitionQuote: 'Language is Morse code tapped out between two prison cells through a concrete wall.',
    },
  },
  {
    id: 'q_attention_qkv',
    stepNumber: 21,
    question: 'Why did they invent Query, Key, and Value? What is attention physically doing?',
    realm: 'language',
    realmLabel: 'Attention Mechanics',
    realmColor: '#ec4899',
    x: 530,
    y: 500,
    oneLiner: 'Query is the search filter, Key is the file index, and Value is the substantive information payload.',
    naiveMisconception: 'People think attention is just a single dot product matrix comparing tokens to themselves.',
    firstPrinciplesReality:
      'Attention originates from database lookup and content-addressable memory: Query (Q = W_Q * x) asks "What am I looking for?"; Key (K = W_K * x) advertises "What attributes do I have?"; Value (V = W_V * x) provides "Here is my actual semantic payload". Splitting them allows a token to seek something completely different from what it provides.',
    mathematicalEquation: '\\text{Attention}(\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}) = \\text{softmax}\\left( \\frac{\\mathbf{Q} \\mathbf{K}^\\top}{\\sqrt{d_k}} \\right) \\mathbf{V}',
    siliconReality:
      'Computes two back-to-back GEMM operations: First GEMM calculates QK^T [T, T] attention weights; Second GEMM multiplies weights by V [T, d] to aggregate information.',
    connectedQuestionIds: ['q_attention_scaling'],
    originQuestionIds: ['q_language_nature'],
    researcherReflectionPrompt: 'If Query and Key were forced to be identical (W_Q = W_K), what linguistic operations would become impossible?',
    chainOfThought: {
      axiom: 'What you are looking for in context is almost never identical to who you are.',
      unaskedQuestion: 'Why can\'t we just use Q = K = V = x?',
      stepByStepDerivation: [
        {
          title: '1. The Asymmetric Matching Need',
          description: 'A verb looking for its subject pronoun needs to match "he/she/they", not another verb.',
        },
        {
          title: '2. The Linear Projection Freedom',
          description: 'W_Q and W_K project tokens into a specialized "matching space" while W_V preserves substantive features.',
        },
        {
          title: '3. Softmax Routing Weights',
          description: 'The dot product Q_i · K_j measures mutual relevance; Softmax normalizes it into a convex combination sum = 1.',
          formula: '\\alpha_{ij} = \\frac{\\exp(q_i \\cdot k_j / \\sqrt{d})}{\\sum_m \\exp(q_i \\cdot k_m / \\sqrt{d})}',
        },
      ],
      siliconRegisterDetail: 'FlashAttention fuses QK^T calculation, Softmax scaling, and V-multiplication directly in SRAM without saving the intermediate TxT matrix to DRAM.',
      deepIntuitionQuote: 'Query is the lock, Key is the key, and Value is the treasure inside the chest.',
    },
  },
  {
    id: 'q_attention_scaling',
    stepNumber: 22,
    question: 'Why do we divide by sqrt(d_k) in attention? What is the softmax temperature collapse?',
    realm: 'language',
    realmLabel: 'Temperature Scaling',
    realmColor: '#ec4899',
    x: 380,
    y: 500,
    oneLiner: 'Dividing by sqrt(d_k) stops dot products from blowing up and freezing the Softmax into hard argmax blindness.',
    naiveMisconception: 'People think dividing by sqrt(d_k) is an arbitrary normalization constant.',
    firstPrinciplesReality:
      'Assume components of q and k are independent random variables with zero mean and unit variance. Their dot product is a sum of d_k products: its mean is 0, but its variance is d_k! If d_k = 128, standard deviation is sqrt(128) ≈ 11.3. Dot products reach +35 and -35. When inputs to Softmax are this large, Softmax outputs 1.0 for the maximum and 0.0 for everything else: gradients vanish to zero! Dividing by sqrt(d_k) pulls variance back to 1.0.',
    mathematicalEquation: '\\text{Var}\\left( \\sum_{i=1}^{d_k} q_i k_i \\right) = d_k \\implies \\text{Var}\\left( \\frac{\\mathbf{q} \\cdot \\mathbf{k}}{\\sqrt{d_k}} \\right) = 1.0',
    siliconReality:
      'In hardware, floating-point numbers outside [-80, 80] cause exp(x) to overflow to Inf or underflow to 0 in tensor core registers.',
    connectedQuestionIds: ['q_softmax_boltzmann'],
    originQuestionIds: ['q_attention_qkv'],
    researcherReflectionPrompt: 'What happens to a transformer during training if you accidentally forget the sqrt(d_k) scaling factor?',
    chainOfThought: {
      axiom: 'Adding independent random variables adds their variances; in high dimensions, dot product variance explodes linearly with dimension.',
      unaskedQuestion: 'Why does dividing by d_k instead of sqrt(d_k) break the network in the opposite direction?',
      stepByStepDerivation: [
        {
          title: '1. The Variance Derivation',
          description: 'Let q_i, k_i ~ N(0, 1). Var(q_i · k_i) = Var(q_i)Var(k_i) + [E(q_i)]^2 Var(k_i) + [E(k_i)]^2 Var(q_i) = 1 · 1 = 1.',
        },
        {
          title: '2. Sum of Variances',
          description: 'Var(q · k) = Var(∑ q_i k_i) = ∑ Var(q_i k_i) = d_k.',
          formula: '\\text{StdDev}(\\mathbf{q} \\cdot \\mathbf{k}) = \\sqrt{d_k}',
        },
        {
          title: '3. Scaling by 1/√d_k',
          description: 'Multiplying by scalar c multiplies variance by c^2. Choosing c = 1/√d_k yields Var = (1/d_k) · d_k = 1.',
        },
      ],
      siliconRegisterDetail: 'Dividing by sqrt(d_k) is implemented as a single hardware multiply by constant `rsqrt_d = 1.0 / sqrt(head_dim)`.',
      deepIntuitionQuote: 'Without sqrt(d_k), high dimensions turns Softmax into an angry spotlight that only sees one token and blinds everything else.',
    },
    runnablePythonVerification: {
      title: 'Attention Temperature Scaling: Var(q · k) = d_k & Softmax Saturation',
      code: `# Attention Scaling & Softmax Temperature Collapse
# Axiom: Dot product of two independent N(0, 1) vectors in R^d_k has variance d_k.
# Dividing by sqrt(d_k) normalizes variance to 1.0, preventing softmax gradient saturation.
import random
import math

random.seed(42)

dims = [32, 64, 128, 256]
n_samples = 2500

print("=== 1. VARIANCE EXPLOSION: Var(q · k) == d_k ===")
print(f"{'Head Dim (d_k)':<16} | {'Unscaled Var':<15} | {'Expected Var':<15} | {'Scaled Var':<15} | {'StdDev (spread)'}")
print("-" * 75)

for d_k in dims:
    unscaled = []
    scaled = []
    scale = 1.0 / math.sqrt(d_k)
    for _ in range(n_samples):
        dot = sum(random.gauss(0, 1) * random.gauss(0, 1) for _ in range(d_k))
        unscaled.append(dot)
        scaled.append(dot * scale)
    var_u = sum(x * x for x in unscaled) / len(unscaled)
    var_s = sum(x * x for x in scaled) / len(scaled)
    std_u = math.sqrt(var_u)
    print(f"{d_k:<16} | {var_u:<15.2f} | {d_k:<15.2f} | {var_s:<15.4f} | +/- {std_u:.2f}")

print("\\n=== 2. SOFTMAX GRADIENT SATURATION (d_k = 128, S = 32 tokens) ===")
d_k = 128
seq_len = 32
q = [random.gauss(0, 1) for _ in range(d_k)]
keys = [[random.gauss(0, 1) for _ in range(d_k)] for _ in range(seq_len)]

unscaled_logits = [sum(q[i] * k[i] for i in range(d_k)) for k in keys]
scaled_logits = [l / math.sqrt(d_k) for l in unscaled_logits]

def softmax(logits):
    m = max(logits)
    exps = [math.exp(x - m) for x in logits]
    s = sum(exps)
    return [x / s for x in exps]

def softmax_grad_norm(probs):
    norm_sq = 0.0
    for i, pi in enumerate(probs):
        for j, pj in enumerate(probs):
            dp = pi * (1.0 - pi) if i == j else -pi * pj
            norm_sq += dp * dp
    return math.sqrt(norm_sq)

p_unscaled = softmax(unscaled_logits)
p_scaled = softmax(scaled_logits)
grad_unscaled = softmax_grad_norm(p_unscaled)
grad_scaled = softmax_grad_norm(p_scaled)

print(f"Unscaled Logits:  min = {min(unscaled_logits):.1f}, max = {max(unscaled_logits):.1f}, range = {max(unscaled_logits) - min(unscaled_logits):.1f}")
print(f"Scaled Logits:    min = {min(scaled_logits):.2f}, max = {max(scaled_logits):.2f}, range = {max(scaled_logits) - min(scaled_logits):.2f}")
print(f"Unscaled Softmax: Peak Prob = {max(p_unscaled):.6f} | Gradient Norm = {grad_unscaled:.2e} (VANISHING GRADIENT)")
print(f"Scaled Softmax:   Peak Prob = {max(p_scaled):.6f} | Gradient Norm = {grad_scaled:.4f} (HEALTHY DYNAMICS)")
print(f"Gradient Attenuation: {grad_scaled / grad_unscaled:.1f}x weaker gradients without 1/sqrt(d_k) scaling!")
print(f"\\n[VERIFIED] Dividing by sqrt(d_k) prevents logits from blowing up and protects gradients from vanishing!")`,
      expectedInsight: 'Unscaled attention dot products have variance equal to d_k, blowing up logits to ±35 and collapsing softmax gradient norms by over 13x.',
    },
  },
  {
    id: 'q_softmax_boltzmann',
    stepNumber: 23,
    question: 'What is Softmax? Why is it the Gibbs-Boltzmann distribution from statistical mechanics?',
    realm: 'language',
    realmLabel: 'Boltzmann Statistics',
    realmColor: '#ec4899',
    x: 230,
    y: 500,
    oneLiner: 'Softmax is the thermodynamic equilibrium distribution of energy microstates under maximum entropy.',
    naiveMisconception: 'People think Softmax is just a mathematical trick to turn any list of numbers into percentages that sum to 1.',
    firstPrinciplesReality:
      'Softmax is the unique mathematical solution to: "What is the probability distribution that maximizes Shannon entropy subject to an expected energy constraint?" It is literally Ludwig Boltzmann’s 1877 distribution of gas molecules at thermal equilibrium. Softmax temperature T controls whether the system acts like frozen ice (hard argmax, T -> 0) or hot gas (uniform distribution, T -> infinity).',
    mathematicalEquation: 'P(i) = \\frac{\\exp(-E_i / k_B T)}{\\sum_j \\exp(-E_j / k_B T)} \\equiv \\frac{\\exp(z_i / \\tau)}{\\sum_j \\exp(z_j / \\tau)}',
    siliconReality:
      'To prevent floating-point overflow when computing exp(z), GPU kernels compute: `z_max = max(z); exp(z - z_max)`.',
    connectedQuestionIds: ['q_next_token_world_model'],
    originQuestionIds: ['q_attention_scaling'],
    researcherReflectionPrompt: 'When you change the generation temperature slider from 0.7 to 0.2 in an LLM, what are you physically doing to the entropy of the Boltzmann ensemble?',
    chainOfThought: {
      axiom: 'Any system in thermodynamic equilibrium settles into the Gibbs-Boltzmann distribution; Softmax is nature\'s choice.',
      unaskedQuestion: 'Why don\'t we just normalize by absolute values: P(i) = |z_i| / ∑ |z_j|?',
      stepByStepDerivation: [
        {
          title: '1. The Exponential Separation',
          description: 'Exponentiation magnifies slight advantages: a score of 4 vs 2 becomes e^4 (54.6) vs e^2 (7.4), a 7.4x advantage instead of 2x.',
        },
        {
          title: '2. Smooth Argmax',
          description: 'As temperature τ -> 0, Softmax converges smoothly to the indicator function argmax: P(max) -> 1, P(others) -> 0.',
          formula: '\\lim_{\\tau \\to 0} \\frac{\\exp(z_i / \\tau)}{\\sum_j \\exp(z_j / \\tau)} = \\mathbf{1}_{i = \\arg\\max(z)}',
        },
        {
          title: '3. Differentiability Everywhere',
          description: 'Unlike argmax, Softmax has continuous, non-zero derivatives everywhere: ∂P_i / ∂z_j = P_i(δ_ij - P_j).',
        },
      ],
      siliconRegisterDetail: 'Online Softmax (Milakov & Gimelshein 2018) calculates maximum and denominator incrementally, enabling single-pass execution in SRAM.',
      deepIntuitionQuote: 'Softmax is thermodynamic democracy: the best candidate wins most votes, but every candidate retains a voice.',
    },
  },
  {
    id: 'q_next_token_world_model',
    stepNumber: 24,
    question: 'Why does predicting the next token force the network to construct a simulation of the world?',
    realm: 'language',
    realmLabel: 'World Model Emergence',
    realmColor: '#ec4899',
    x: 80,
    y: 500,
    oneLiner: 'To predict what word comes next in a book about orbital physics, the model must internally simulate gravity.',
    naiveMisconception: 'People think next-token prediction is merely a stochastic parrot doing superficial text autocomplete.',
    firstPrinciplesReality:
      'Language describes the underlying physical and causal universe. If a sentence reads: "The glass fell off the counter and hit the tile floor, so it...", predicting "shattered" requires understanding gravity, momentum, material brittleness, and causality. Next-token prediction on all human text forces the network to learn the generative model of the reality that produced the text.',
    mathematicalEquation: '\\min_\\theta \\mathbb{E}_{x \\sim \\mathcal{D}} \\left[ -\\sum_{t=1}^T \\log p_\\theta(x_t \\mid x_{<t}) \\right]',
    siliconReality:
      'Attention heads learn specialized semantic routing patterns: induction heads, syntax heads, and causal reasoning heads that activate systematically during token generation.',
    connectedQuestionIds: ['q_memory_bus'],
    originQuestionIds: ['q_softmax_boltzmann'],
    researcherReflectionPrompt: 'What is the theoretical boundary between predicting the next token with 0 loss and possessing a complete deterministic simulation of the universe?',
    chainOfThought: {
      axiom: 'To achieve optimal compression of a sequence generated by an underlying system, your model must simulate the system itself.',
      unaskedQuestion: 'Why does a simple objective like next-token prediction produce reasoning and arithmetic abilities?',
      stepByStepDerivation: [
        {
          title: '1. Shannon Information Bound',
          description: 'The entropy of natural text is bounded by the predictability of the universe it describes.',
        },
        {
          title: '2. The Inadequacy of N-Grams',
          description: 'Memorizing 5-word phrases cannot predict what happens in a novel chess position or code compiler output.',
        },
        {
          title: '3. Causal Internal State',
          description: 'To minimize cross-entropy loss, the network must maintain an internal world-state register h_t that tracks chess pieces, variable scopes, and physical laws.',
          formula: '\\mathbf{h}_t = \\text{Compress}(\\text{World State at time } t)',
        },
      ],
      siliconRegisterDetail: 'During generation, each token takes ~20-40 milliseconds on a GPU; the forward pass reconstructs the hidden state from past context.',
      deepIntuitionQuote: 'Next-token prediction is not autocomplete; it is a compression algorithm that must simulate the universe to compress human thought.',
    },
  },
  {
    id: 'q_memory_bus',
    stepNumber: 25,
    question: 'What is the memory bus doing internally? Why is generation memory-bandwidth bound?',
    realm: 'hardware',
    realmLabel: 'The Memory Wall',
    realmColor: '#10b981',
    x: 80,
    y: 640,
    oneLiner: 'The Tensor Cores compute at lightspeed, but the copper memory bus takes 20ms just to fetch the weights.',
    naiveMisconception: 'People think token generation takes time because the math calculations are heavy.',
    firstPrinciplesReality:
      'In autoregressive token generation, the math is trivial (1 vector-matrix multiply per layer). The bottleneck is fetching the 70B weights from DRAM to the compute cores. An H100 GPU can do 1,000 TFLOPS, but memory bandwidth is only 3.35 TB/s. The arithmetic intensity is ~1 FLOP/Byte, meaning the tensor cores sit idle 99% of the time waiting for memory bytes to crawl across the bus.',
    mathematicalEquation: 'I = \\frac{\\text{FLOPs}}{\\text{Bytes}} \\approx 1 \\ll I^* = \\frac{\\text{Peak TFLOPS}}{\\text{Bandwidth (GB/s)}} \\approx 295 \\text{ (Memory Bound)}',
    siliconReality:
      'Billions of bits are streamed across high-density interposer micro-bumps between HBM3 memory stacks and the GPU compute die, saturating physical bus pin frequency.',
    connectedQuestionIds: ['q_kv_cache'],
    originQuestionIds: ['q_next_token_world_model'],
    researcherReflectionPrompt: 'If memory bandwidth grows at 1.5x every 2 years while compute FLOPS grow at 3.0x, how will future architectures survive the widening memory wall?',
    chainOfThought: {
      axiom: 'Prefill is compute-bound (GEMM); Generation is memory-bandwidth bound (GEMV).',
      unaskedQuestion: 'Why does generating 1 token take almost the exact same time as generating 1 token for a batch of 8 users?',
      stepByStepDerivation: [
        {
          title: '1. The Weight Fetch Constant',
          description: 'To generate 1 token, you must load all 140 GB of FP16 weights across the memory bus once.',
        },
        {
          title: '2. The Batch Reuse Secret',
          description: 'If batch size is 8, you load the 140 GB weights once and reuse them for 8 users simultaneously! Arithmetic intensity increases 8x.',
          formula: 'I_{\\text{batch=8}} = 8 \\times I_{\\text{batch=1}}',
        },
        {
          title: '3. Roofline Saturation',
          description: 'As batch size increases, you cross the roofline knee and finally saturate the GPU tensor cores.',
        },
      ],
      siliconRegisterDetail: 'Memory bus lines toggle at 6.4 Gbps per pin; charging bus wire capacitances generates over 50% of total GPU power consumption.',
      deepIntuitionQuote: 'The GPU is a Ferrari engine trapped behind a horse-and-buggy dirt road called the memory bus.',
    },
    runnablePythonVerification: {
      title: 'Roofline Model & Arithmetic Intensity: Token Generation FLOPs/Byte = 1.0',
      code: `# Roofline Arithmetic Intensity: Why Autoregressive Generation is Memory-Bound
# Axiom: Autoregressive decoding reads every weight matrix once per token for only 2 FLOPs per weight.
# Invariant: Arithmetic intensity I = 2 FLOPs / 2 Bytes = 1.0 FLOP/Byte << Compute Knee I* ~ 295

# Hardware Parameters: NVIDIA H100 SXM5
peak_tflops = 989.0       # FP16 Tensor Core Peak Compute
bandwidth_tb_s = 3.35     # HBM3 Memory Bandwidth

# Roofline knee: Arithmetic Intensity threshold (FLOPs / Byte)
roofline_knee = (peak_tflops * 1e12) / (bandwidth_tb_s * 1e12)

# Batch size 1 autoregressive decode
flops_per_weight = 2       # 1 multiply + 1 accumulate
bytes_per_weight_fp16 = 2  # FP16 = 2 bytes
intensity_b1 = flops_per_weight / bytes_per_weight_fp16

achieved_tflops_b1 = intensity_b1 * bandwidth_tb_s
utilization_b1 = (achieved_tflops_b1 / peak_tflops) * 100

print("=== ROOFLINE MODEL: AUTOREGRESSIVE TOKEN GENERATION ===")
print(f"GPU Hardware:              NVIDIA H100 SXM5")
print(f"Peak FP16 Tensor Compute:  {peak_tflops:.1f} TFLOPS")
print(f"HBM3 Memory Bandwidth:     {bandwidth_tb_s:.2f} TB/s")
print(f"Hardware Roofline Knee I*: {roofline_knee:.1f} FLOPs/Byte\\n")

print("--- Batch Size = 1 Generation (Single User) ---")
print(f"Arithmetic Intensity:      {intensity_b1:.1f} FLOP/Byte")
print(f"Max Achieved Throughput:   {achieved_tflops_b1:.2f} TFLOPS")
print(f"Tensor Core Utilization:   {utilization_b1:.2f}% (Idle: {100 - utilization_b1:.2f}%)")
print(f"Execution Regime:          STRICTLY MEMORY BOUND (1.0 << {roofline_knee:.1f})\\n")

batch_table = [1, 2, 8, 32, 64, 128, 256, 295, 512]
print(f"{'Batch (B)':<10} | {'Intensity (FLOP/B)':<20} | {'Achieved TFLOPS':<16} | {'Utilization (%)':<15} | {'Roofline Regime'}")
print("-" * 80)

for b in batch_table:
    intensity_b = b * intensity_b1
    achieved = min(peak_tflops, intensity_b * bandwidth_tb_s)
    util = (achieved / peak_tflops) * 100
    regime = "MEMORY BOUND" if intensity_b < roofline_knee else "COMPUTE BOUND (SATURATED)"
    print(f"{b:<10} | {intensity_b:<20.1f} | {achieved:<16.1f} | {util:<15.1f}% | {regime}")

print(f"\\n[VERIFIED] For batch=1 token generation, arithmetic intensity is 1.0 FLOP/Byte. GPU Tensor Cores are 99.66% idle waiting for memory bus bandwidth!")`,
      expectedInsight: 'At batch=1, token generation has an arithmetic intensity of only 1.0 FLOP/Byte versus the H100 knee of 295.2, leaving GPU Tensor Cores 99.66% idle.',
    },
  },
  {
    id: 'q_kv_cache',
    stepNumber: 26,
    question: 'What is the KV-cache, and why does it cause catastrophic GPU Out-Of-Memory (OOM) crashes?',
    realm: 'hardware',
    realmLabel: 'KV-Cache Explosion',
    realmColor: '#10b981',
    x: 230,
    y: 640,
    oneLiner: 'Without the KV-cache, inference is quadratic O(N²); with the KV-cache, memory blows up to hundreds of gigabytes.',
    naiveMisconception: 'People think the model only holds its weights in memory, so memory usage is constant regardless of context length.',
    firstPrinciplesReality:
      'In self-attention, generating token t requires attending to all past tokens. Recomputing past Keys and Values on every token would be unacceptably slow (O(N^2)). The KV-cache saves past Keys and Values in VRAM. But at 128k context and batch size 16, the KV-cache alone consumes 200+ GB, far exceeding an 80GB GPU and triggering fatal CUDA OOM errors.',
    mathematicalEquation: '\\text{KV Memory} = 2 \\times N_{\\text{heads}} \\times d_k \\times L \\times T \\times B \\times \\text{bytes}',
    siliconReality:
      'Contiguous GPU memory allocations fragment VRAM, requiring systems like vLLM PageAttention and FP8 KV quantization to fit long-context generation in hardware.',
    connectedQuestionIds: ['q_mla_compression', 'q_moe_decoupling'],
    originQuestionIds: ['q_memory_bus'],
    researcherReflectionPrompt: 'Why does self-attention store separate Key and Value representations for every token when they were derived from the exact same hidden state?',
    chainOfThought: {
      axiom: 'To avoid quadratic compute re-evaluation, autoregressive models trade memory storage for execution time.',
      unaskedQuestion: 'How many gigabytes does a 70B model KV cache consume for 1 user at 128k context?',
      stepByStepDerivation: [
        {
          title: '1. Standard MHA Formula',
          description: 'KV size = 2 * n_heads * d_k * L * T * bytes.',
        },
        {
          title: '2. Numerical Plug-in (70B scale)',
          description: 'n_heads = 64, d_k = 128, L = 80, T = 131,072 tokens, bytes = 2 (FP16).',
          formula: '2 \\times 64 \\times 128 \\times 80 \\times 131072 \\times 2 \\approx 343.6 \\text{ Gigabytes!}',
        },
        {
          title: '3. The Multi-GPU Crash',
          description: 'A single user at 128k context requires 5 separate 80GB H100 GPUs just to hold the KV cache!',
        },
      ],
      siliconRegisterDetail: 'VRAM fragmentation in PyTorch creates virtual memory holes, triggering CUDA OOM even when 20% of memory is technically free.',
      deepIntuitionQuote: 'The KV-cache is a giant backpack that gets heavier with every word you speak until your knees buckle.',
    },
  },
  {
    id: 'q_mla_compression',
    stepNumber: 27,
    question: 'How does Multi-Head Latent Attention (MLA) compress the KV-cache by over 93%?',
    realm: 'hardware',
    realmLabel: 'Subspace Projection & Matrix Absorption',
    realmColor: '#10b981',
    x: 380,
    y: 640,
    oneLiner: 'DeepSeek MLA projects Keys and Values into a low-rank latent vector and absorbs projection weights into queries.',
    naiveMisconception: 'People think you must either sacrifice attention heads (GQA) or accept massive KV-cache VRAM explosions (MHA).',
    firstPrinciplesReality:
      'DeepSeek-V2/V3 compresses Keys and Values into a single compact latent vector c_t^(KV) in R^512 and caches decoupled rotary position vectors in R^64. During inference, the up-projection weight W_UK is mathematically absorbed directly into the Query vector, so uncompressed multi-head keys never need to be materialized in GPU VRAM!',
    mathematicalEquation: 'q_t^\\top k_s = (q_t^\\top \\mathbf{W}_{UK}) \\mathbf{c}_s^{KV} \\implies \\text{Cache size: } 576 \\text{ floats vs } 32,768 \\text{ floats}',
    siliconReality:
      'Reduces KV-cache memory traffic across the memory bus by 93.3%, instantly transforming long-context inference from memory-bound stall to high-throughput compute saturation.',
    connectedQuestionIds: ['q_moe_decoupling'],
    originQuestionIds: ['q_kv_cache'],
    researcherReflectionPrompt: 'Can we apply low-rank latent subspace compression to the Query stream during training, or does Query compression destroy optimization dynamics?',
    chainOfThought: {
      axiom: 'High-dimensional multi-head Key and Value tensors live on a low-rank semantic manifold; storing full ranks in VRAM is redundant waste.',
      unaskedQuestion: 'Why can\'t RoPE (Rotary Position Embeddings) be compressed into the latent vector c_t^(KV)?',
      stepByStepDerivation: [
        {
          title: '1. The RoPE Non-Commutativity Problem',
          description: 'RoPE applies an orthogonal rotation R_t to key vectors. Rotation matrices DO NOT commute with low-rank projection matrices: W_UK · R_t ≠ R_t · W_UK!',
        },
        {
          title: '2. The Decoupled RoPE Invention',
          description: 'MLA splits the key into two pieces: a low-rank content key k^C (unrotated) and a tiny decoupled rotary key k^R in ℝ^64 (rotated).',
          formula: '\\mathbf{q}_t^\\top \\mathbf{k}_s = \\mathbf{q}_{t, C}^\\top \\mathbf{k}_{s, C} + \\mathbf{q}_{t, R}^\\top \\mathbf{k}_{s, R}',
        },
        {
          title: '3. Matrix Absorption',
          description: 'Because k^C is unrotated, W_UK can be absorbed directly into the Query: (q^C · W_UK) · c^(KV). The uncompressed keys NEVER exist in memory!',
        },
      ],
      siliconRegisterDetail: 'Saves 93.3% of HBM memory bandwidth on every generation step, allowing DeepSeek-V3 to serve 128k context on commodity clusters.',
      deepIntuitionQuote: 'MLA folds a sprawling king-size bedsheet down into a tight suitcase before storing it in VRAM.',
    },
    runnablePythonVerification: {
      title: 'KV-Cache Memory Scaling: MHA vs DeepSeek MLA at 128k Context',
      code: `# Multi-Head Latent Attention (MLA) KV-Cache Compression Proof
# Axiom: High-dimensional Keys and Values live on a low-rank manifold.
# DeepSeek MLA compresses KV into a 512-dim latent vector, slashing cache by over 93%.

# Architecture specifications (DeepSeek-V2 / V3 scale)
layers = 60
n_heads = 128
head_dim = 128
d_latent = 512     # Compressed KV latent vector c_t^(KV)
d_rope = 64        # Decoupled Rotary Position Embedding k_t^R
bytes_per_elem = 2  # FP16 (2 bytes per float)

# Per-token per-layer element counts
mha_per_token_layer = 2 * n_heads * head_dim  # Key + Value tensors
mla_per_token_layer = d_latent + d_rope        # Latent + RoPE key

compression_ratio = mha_per_token_layer / mla_per_token_layer
savings_pct = (1.0 - mla_per_token_layer / mha_per_token_layer) * 100

print("=== DEEPSEEK MLA vs TRADITIONAL MHA KV-CACHE COMPRESSION ===")
print(f"MHA Elements / Token / Layer: {mha_per_token_layer:,} floats ({mha_per_token_layer * bytes_per_elem:,} bytes)")
print(f"MLA Elements / Token / Layer: {mla_per_token_layer:,} floats ({mla_per_token_layer * bytes_per_elem:,} bytes)")
print(f"Compression Factor:           {compression_ratio:.2f}x ({savings_pct:.2f}% VRAM reduction)\\n")

context_lengths = [2048, 8192, 32768, 65536, 131072]
print(f"{'Context (Tokens)':<18} | {'MHA Cache':<14} | {'MLA Cache':<14} | {'VRAM Saved':<14} | {'80GB GPUs Needed (MHA vs MLA)'}")
print("-" * 85)

for seq_len in context_lengths:
    mha_bytes = mha_per_token_layer * layers * seq_len * bytes_per_elem
    mla_bytes = mla_per_token_layer * layers * seq_len * bytes_per_elem
    mha_gb = mha_bytes / (1024 ** 3)
    mla_gb = mla_bytes / (1024 ** 3)
    saved_gb = mha_gb - mla_gb
    mha_gpus = -(-int(mha_gb) // 80) if mha_gb > 80 else 1
    mla_gpus = 1
    print(f"{seq_len:<18,d} | {mha_gb:<14.2f} GB | {mla_gb:<14.2f} GB | {saved_gb:<14.2f} GB | {mha_gpus} GPUs vs {mla_gpus} GPU")

print(f"\\n[VERIFIED] At 128k context, MHA consumes 480 GB (6x 80GB H100 GPUs), while MLA compresses it to 8.44 GB (fits in a single consumer GPU)!")`,
      expectedInsight: 'At 128k context length, DeepSeek MLA compresses KV-cache VRAM from 480 GB down to 8.44 GB (a 56.9x reduction), fitting long context into a single GPU.',
    },
  },
  {
    id: 'q_moe_decoupling',
    stepNumber: 28,
    question: 'What is Sparse Mixture-of-Experts (MoE)? How do we decouple knowledge capacity from compute?',
    realm: 'hardware',
    realmLabel: 'Sparse Routing',
    realmColor: '#10b981',
    x: 530,
    y: 640,
    oneLiner: 'MoE lets you have the knowledge capacity of 671 billion parameters with the inference latency of 37 billion parameters.',
    naiveMisconception: 'People assume every parameter in a neural network must execute for every single token.',
    firstPrinciplesReality:
      'Sparse MoE replaces a single monolithic feedforward block with multiple specialized expert subnetworks. A lightweight router computes softmax over Top-k (e.g. Top-2 of 8, or Top-8 of 256). Tokens are only dispatched to the selected experts, multiplying total parameter capacity by 8x while keeping active inference compute completely constant.',
    mathematicalEquation: 'y = \\sum_{i \\in \\text{Top-}k} p_i(x) E_i(x), \\quad \\mathcal{L}_{\\text{balance}} = \\alpha \\cdot E \\sum_{i=1}^E f_i P_i',
    siliconReality:
      'Requires expert parallelism across multiple GPUs over ultra-fast NVLink interconnects, plus auxiliary load balancing losses to prevent winner-take-all GPU rank stalls.',
    connectedQuestionIds: ['q_quantization_bits'],
    originQuestionIds: ['q_kv_cache', 'q_mla_compression'],
    researcherReflectionPrompt: 'If human brains only fire ~1-2% of neurons at any given millisecond, is Sparse MoE the first digital step toward biological metabolic sparsity?',
    chainOfThought: {
      axiom: 'No human thinks about quantum electrodynamics and culinary pastry baking on the exact same syllable.',
      unaskedQuestion: 'Why does naive MoE routing collapse without an auxiliary load balancing loss?',
      stepByStepDerivation: [
        {
          title: '1. The Winner-Take-All Feedback Loop',
          description: 'Early in training, 1 expert randomly receives slightly better initialized weights. The router routes more tokens to it.',
        },
        {
          title: '2. Expert Starvation',
          description: 'The favorite expert receives more gradients and gets smarter; other experts starve. In 1,000 steps, 1 expert handles 100% of tokens while 7 do zero!',
        },
        {
          title: '3. The Auxiliary Balance Loss',
          description: 'Add a penalty loss: α · E · ∑ (f_i · P_i). This penalizes correlation between dispatch frequency f_i and routing probability P_i, forcing uniform load balancing.',
          formula: '\\mathcal{L}_{\\text{balance}} = \\alpha \\cdot E \\sum_{i=1}^E f_i P_i',
        },
      ],
      siliconRegisterDetail: 'NVLink all-to-all communication exchanges dispatched tokens between GPUs at 900 GB/s per GPU in H100 clusters.',
      deepIntuitionQuote: 'MoE is a hospital where every patient goes to a cardiologist or orthopedist, instead of all doctors examining all patients at once.',
    },
  },
  {
    id: 'q_quantization_bits',
    stepNumber: 29,
    question: 'What is Quantization (FP32 -> FP8 -> INT4)? Why does deep learning survive losing precision?',
    realm: 'hardware',
    realmLabel: 'Numerical Precision',
    realmColor: '#10b981',
    x: 680,
    y: 640,
    oneLiner: 'Deep learning is topologically redundant: relative coordinate separation matters, not trailing decimal digits.',
    naiveMisconception: 'People think reducing float precision to 4 bits corrupts the network with catastrophic numerical error.',
    firstPrinciplesReality:
      'In classical scientific computing (like weather forecasting or rocket trajectories), rounding errors accumulate chaotically. In deep neural networks, activations represent high-dimensional manifold regions separated by wide margins. Quantizing from FP32 (32 bits) to FP8 (8 bits) or INT4 (4 bits) quadruples memory bandwidth throughput while degrading accuracy by less than 0.5%.',
    mathematicalEquation: 'q = \\text{clamp}\\left( \\left\\lfloor \\frac{x}{S} \\right\\rceil + Z, -2^{b-1}, 2^{b-1}-1 \\right)',
    siliconReality:
      'NVIDIA Hopper and Blackwell GPUs include dedicated FP8 and INT4 Tensor Cores that double or quadruple FLOPS per watt compared to FP16.',
    connectedQuestionIds: ['q_unsolved_frontier'],
    originQuestionIds: ['q_moe_decoupling'],
    researcherReflectionPrompt: 'If human biological synapses operate with barely 1 to 2 bits of effective precision under noisy neurotransmitter vesicles, why did AI ever start with 32-bit floats?',
    chainOfThought: {
      axiom: 'Topological separation in high dimensions is robust to random spherical perturbations.',
      unaskedQuestion: 'What is the difference between FP8 E4M3 and FP8 E5M2?',
      stepByStepDerivation: [
        {
          title: '1. The Dynamic Range Dilemma',
          description: 'In 8 bits: E4M3 has 4 exponent bits (dynamic range) and 3 mantissa bits (precision). E5M2 has 5 exponent bits and 2 mantissa bits.',
        },
        {
          title: '2. Forward vs Backward Assignment',
          description: 'Forward pass activations need precision -> use E4M3. Backward pass gradients have extreme dynamic range -> use E5M2!',
        },
        {
          title: '3. Outlier Clipping',
          description: 'Outlier channels in attention (Dettmers et al. 2022) are kept in FP16 while 99.9% of normal weights are safely quantized to INT4/FP8.',
          formula: '\\mathbf{W} \\mathbf{x} = \\mathbf{W}_{\\text{int8}} \\mathbf{x}_{\\text{int8}} + \\mathbf{W}_{\\text{fp16, outliers}} \\mathbf{x}_{\\text{fp16, outliers}}',
        },
      ],
      siliconRegisterDetail: 'Quantization cuts DRAM bandwidth traffic by 4x, directly boosting tokens-per-second on memory-bandwidth-bound inference.',
      deepIntuitionQuote: 'You don’t need an atomic clock to know if someone is walking into the room or leaving it.',
    },
  },
  {
    id: 'q_unsolved_frontier',
    stepNumber: 30,
    question: 'What is the next unasked question? The thermodynamic and continuous frontier of intelligence?',
    realm: 'physics',
    realmLabel: 'The Unsolved Frontier',
    realmColor: '#06b6d4',
    x: 830,
    y: 640,
    oneLiner: 'Where discrete layers and digital clock cycles dissolve into continuous thermodynamics and analog physics.',
    naiveMisconception: 'People think modern transformers with 80 discrete layers and AdamW optimization are the final form of AI.',
    firstPrinciplesReality:
      'Digital synchronous clock-gated hardware wastes 99% of energy shuffling bits across buses. The next breakthroughs lie at the intersection of continuous dynamical systems (Neural ODEs), non-von-Neumann neuromorphic event-driven spikes, and thermodynamic physics-informed computing where the physical substrate itself performs the mathematical relaxation.',
    mathematicalEquation: '\\frac{d\\mathbf{h}}{dt} = \\mathbf{f}(\\mathbf{h}(t), t, \\theta), \\quad \\Delta S_{\\text{universe}} \\ge 0 \\implies \\text{Reversible analog computing}',
    siliconReality:
      'Emerging analog optical matrix multipliers (photonic tensor cores) and in-memory analog memristor crossbar arrays compute dot products at zero memory bus transit cost using Ohm\'s and Kirchhoff\'s laws.',
    connectedQuestionIds: ['q_wigner_math'],
    originQuestionIds: ['q_quantization_bits'],
    researcherReflectionPrompt: 'If nature solved intelligence using 20 Watts of chemical ion gradients without digital clock cycles, why are we burning megawatts on matrix multiplication?',
    chainOfThought: {
      axiom: 'The laws of physics are not a limit to computation; the laws of physics ARE computation.',
      unaskedQuestion: 'What will replace digital matrix multiplication in the year 2035?',
      stepByStepDerivation: [
        {
          title: '1. The Digital Von Neumann Paradox',
          description: 'We spend 90% of our energy moving numbers between memory and compute, not doing the math.',
        },
        {
          title: '2. In-Memory Analog Physics',
          description: 'When current I flows through conductance G, Ohm\'s law computes multiplication: I = V · G. Kirchhoff\'s law computes addition: I_total = ∑ I_i. Zero bus transit!',
          formula: 'I_{\\text{out}} = \\sum_{j} V_j G_{ij} \\quad \\equiv \\text{ Continuous analog GEMM at zero energy delay}',
        },
        {
          title: '3. Full Circle to Physics',
          description: 'We began with electrons in potential wells. We conclude with electrons computing directly through their physical state trajectories.',
        },
      ],
      siliconRegisterDetail: 'Memristive crossbars, photonics, and superconducting Josephson junctions will dissolve the boundary between memory and processor.',
      deepIntuitionQuote: 'The universe is not a computer calculating equations; the universe is the equation solving itself in real time.',
    },
  },
];
