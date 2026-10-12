/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Socratic Question Graph Dataset:
 * A directed, interconnected graph of first-principles inquiries linking
 * quantum electrons and physical bits to Python VMs, geometric manifolds,
 * gradients, language, memory buses, and frontier AI architectures.
 */

export type QuestionRealm =
  | 'physics'
  | 'computation'
  | 'geometry'
  | 'optimization'
  | 'language'
  | 'hardware';

export interface SocraticQuestionNode {
  id: string;
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
    id: 'q_electron',
    question: 'What is an electron, and why does matter have discrete states?',
    realm: 'physics',
    realmLabel: 'Physics & Matter',
    realmColor: '#06b6d4',
    x: 100,
    y: 120,
    oneLiner: 'Before there is a token, an electron is trapped in an atomic potential well.',
    naiveMisconception: 'People think data is an ethereal, abstract mathematical concept that floats freely from the physical universe.',
    firstPrinciplesReality:
      'Under the Schrödinger wave equation and the Pauli Exclusion Principle, fermions cannot occupy the same quantum state. Electrons orbiting periodic Silicon lattices form energy bands separated by a forbidden bandgap (1.12 eV). This energetic barrier prevents quantum collapse and enables stable physical bi-stability.',
    mathematicalEquation: '-\\frac{\\hbar^2}{2m} \\nabla^2 \\psi(\\mathbf{r}) + V(\\mathbf{r})\\psi(\\mathbf{r}) = E\\psi(\\mathbf{r})',
    siliconReality:
      'Applying gate voltage tilts the potential well, either permitting electrons to hop into the conduction band or trapping them. Physical distinguishability in silicon is the bedrock of all computation.',
    connectedQuestionIds: ['q_data_bit'],
    originQuestionIds: [],
    researcherReflectionPrompt: 'If information requires physical state distinguishability, what thermodynamic heat must be dissipated every time your loss function compresses high-dimensional tokens?',
  },
  {
    id: 'q_data_bit',
    question: 'What is data? What is a bit in the physical universe?',
    realm: 'physics',
    realmLabel: 'Physics & Information',
    realmColor: '#06b6d4',
    x: 260,
    y: 120,
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
  },
  {
    id: 'q_program_vm',
    question: 'What is a Python program running inside a VM? What is code?',
    realm: 'computation',
    realmLabel: 'Programs & Logic',
    realmColor: '#3b82f6',
    x: 430,
    y: 120,
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
  },
  {
    id: 'q_model_vs_code',
    question: 'What is a model vs a classical program? Where does the logic live?',
    realm: 'computation',
    realmLabel: 'Parametric Systems',
    realmColor: '#3b82f6',
    x: 600,
    y: 120,
    oneLiner: 'In a model, the Python code is completely dumb and static; the intelligence lives in the coordinate parameters.',
    naiveMisconception: 'People think AI writes new Python code or modifies its own if/else statements when learning.',
    firstPrinciplesReality:
      'During training and inference, the Python code never changes a single line. The program simply executes static matrix multiplications. The decision boundaries and intelligence are encoded entirely as continuous geometric parameters (weights and biases).',
    mathematicalEquation: 'y = f_\\theta(x), \\quad \\theta \\in \\mathbb{R}^P \\text{ (Static function structure, dynamic manifold parameters)}',
    siliconReality:
      'Instead of the CPU branching into different instruction addresses, the GPU runs the exact same fused kernel over and over, simply streaming different floating-point numbers through systolic array multiply-accumulators.',
    connectedQuestionIds: ['q_weight_activation'],
    originQuestionIds: ['q_program_vm'],
    researcherReflectionPrompt: 'If the software code is static, why do we call it "software"? Is deep learning actually high-dimensional analog geometry simulated on digital computers?',
  },
  {
    id: 'q_weight_activation',
    question: 'What do those floating-point numbers (weights and activations) actually represent?',
    realm: 'geometry',
    realmLabel: 'Vector Spaces',
    realmColor: '#8b5cf6',
    x: 770,
    y: 120,
    oneLiner: 'Activations are spatial coordinates in a semantic universe; weights are transformation coefficients.',
    naiveMisconception: 'People assume weights are mysterious black-box magic numbers with no geometric meaning.',
    firstPrinciplesReality:
      'An activation vector is a coordinate point in a high-dimensional space (e.g. 4096 dimensions). Each axis represents a continuous property (animacy, tense, technicality). A weight is a coupling conductance: it dictates how much one semantic axis rotates, stretches, or projects onto another.',
    mathematicalEquation: '\\mathbf{x} = \\sum_{i=1}^d c_i \\mathbf{e}_i, \\quad \\mathbf{W}_{j, i} = \\langle \\mathbf{e}_j^{(l)}, T(\\mathbf{e}_i^{(l-1)}) \\rangle',
    siliconReality:
      'Each weight is 16 bits (FP16) or 8 bits (FP8) stored in memory capacitors. When multiplied, the exponent and mantissa bits are parsed by hardware multipliers to scale electrical charges.',
    connectedQuestionIds: ['q_layer_math'],
    originQuestionIds: ['q_model_vs_code'],
    researcherReflectionPrompt: 'If activations are points in 4,096-dimensional space, what does the cosine angle between two word vectors physically represent?',
  },
  {
    id: 'q_layer_math',
    question: 'What does a "layer" even mean mathematically? What is a function doing?',
    realm: 'geometry',
    realmLabel: 'Manifold Warping',
    realmColor: '#8b5cf6',
    x: 770,
    y: 280,
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
  },
  {
    id: 'q_nonlinearity',
    question: 'Why do we need non-linear activations? What happens if you remove them?',
    realm: 'geometry',
    realmLabel: 'Topological Folds',
    realmColor: '#8b5cf6',
    x: 600,
    y: 280,
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
  },
  {
    id: 'q_depth_vs_width',
    question: 'Why deep (vertical) layers instead of horizontal (wide) layers? Why did wide networks fail?',
    realm: 'geometry',
    realmLabel: 'Compositional Depth',
    realmColor: '#8b5cf6',
    x: 430,
    y: 280,
    oneLiner: 'Wide networks memorize lookup tables at exponential cost; deep networks compute functions of functions at polynomial cost.',
    naiveMisconception: 'The Universal Approximation Theorem says 1 wide layer can learn anything, so why bother going deep?',
    firstPrinciplesReality:
      'While 1 infinitely wide layer can approximate any function, doing so requires an exponential number of parameters (O(2^N))—it memorizes points without generalizing. Real reality is compositional (edges -> parts -> objects). Deep vertical networks compute nested compositions, reusing sub-manifolds exponentially with linear parameter growth.',
    mathematicalEquation: 'f(x) = f_L(f_{L-1}(\\dots f_1(x)\\dots)), \\quad \\text{Parameters: } O(N) \\text{ vs } O(2^N)',
    siliconReality:
      'Deep networks require intermediate activation tensors to be held in VRAM for backpropagation, trading peak memory capacity for astronomical parameter efficiency.',
    connectedQuestionIds: ['q_connecting_neurons', 'q_gradient_random'],
    originQuestionIds: ['q_nonlinearity'],
    researcherReflectionPrompt: 'Could human language exist if human cognition were flat and wide rather than hierarchical and compositional?',
  },
  {
    id: 'q_connecting_neurons',
    question: 'What does "connecting" between layers mean in actual physical silicon?',
    realm: 'computation',
    realmLabel: 'Silicon Mechanics',
    realmColor: '#3b82f6',
    x: 260,
    y: 280,
    oneLiner: 'Connections are not physical copper wires; they are arithmetic address reads in memory.',
    naiveMisconception: 'People picture physical wires running like telephone lines between neuron nodes.',
    firstPrinciplesReality:
      'A "connection" between neuron i and neuron j simply means that the value stored at memory address of activation x_i is multiplied by the weight value stored at address W_ji and accumulated into the register of z_j.',
    mathematicalEquation: 'z_j = \\sum_{i} W_{ji} x_i + b_j \\quad \\equiv \\text{ Memory load, FMA instruction, Register accumulation}',
    siliconReality:
      'In a systolic array, weights remain stationary in processing elements (PEs) while input activation data flows rhythmically across columns, performing fused multiply-accumulates (FMAs) on every clock cycle.',
    connectedQuestionIds: ['q_gradient_random'],
    originQuestionIds: ['q_layer_math', 'q_depth_vs_width'],
    researcherReflectionPrompt: 'In biological brains, connections ARE physical axon wires. Why did digital computers decouple connectivity from physical wiring via memory addresses?',
  },
  {
    id: 'q_gradient_random',
    question: 'What is a gradient? Why can\'t we just search or guess the numbers randomly?',
    realm: 'optimization',
    realmLabel: 'Spatial Compass',
    realmColor: '#f59e0b',
    x: 100,
    y: 280,
    oneLiner: 'In 70 billion dimensions, random guessing is impossible; the gradient is the spatial compass of error.',
    naiveMisconception: 'People think we can test random variations of weights (like brute force genetic mutation) to find a working model.',
    firstPrinciplesReality:
      'In high dimensions, the volume of space scales exponentially. In 70 billion dimensions, random search would not find a working solution before the heat death of the universe. The gradient is the vector pointing along the steepest slope of error. Backpropagation calculates this exact slope for all billions of parameters simultaneously in a single reverse sweep.',
    mathematicalEquation: '\\nabla_{\\mathbf{W}} \\mathcal{L} = \\left[ \\frac{\\partial \\mathcal{L}}{\\partial w_1}, \\frac{\\partial \\mathcal{L}}{\\partial w_2}, \\dots, \\frac{\\partial \\mathcal{L}}{\\partial w_P} \\right]',
    siliconReality:
      'The GPU reverses the computation graph, multiplying upstream adjoint vectors by transposed weight matrices to write gradient tensors into memory buffers for AdamW optimizer updates.',
    connectedQuestionIds: ['q_training_physical'],
    originQuestionIds: ['q_depth_vs_width', 'q_connecting_neurons'],
    researcherReflectionPrompt: 'Why does the chain rule from 17th-century calculus enable modern artificial intelligence on 21st-century GPUs?',
  },
  {
    id: 'q_training_physical',
    question: 'What does "training" actually mean physically? What are we doing to the system?',
    realm: 'optimization',
    realmLabel: 'Thermodynamic Descent',
    realmColor: '#f59e0b',
    x: 100,
    y: 440,
    oneLiner: 'You are not teaching Python; you are rolling a high-dimensional marble down an energy surface into free-energy minima.',
    naiveMisconception: 'People think training is like teaching a child or writing instructions in a book.',
    firstPrinciplesReality:
      'The loss function defines an energy potential surface over weight space. Training is numerical gradient descent: stepping opposite the slope with momentum and noise. This is isomorphic to the Langevin diffusion equation rolling a thermal particle into low-energy ground states.',
    mathematicalEquation: '\\mathbf{w}_{t+1} = \\mathbf{w}_t - \\eta \\nabla \\mathcal{L}(\\mathbf{w}_t) + \\beta (\\mathbf{w}_t - \\mathbf{w}_{t-1})',
    siliconReality:
      'During training, the GPU memory bus sustains peak write cycles, constantly modifying billions of floating-point numbers in HBM memory banks through high-power electrical switching.',
    connectedQuestionIds: ['q_language_nature'],
    originQuestionIds: ['q_gradient_random'],
    researcherReflectionPrompt: 'If training is sliding into thermodynamic free energy minima, why does Stochastic Gradient Descent (SGD) avoid getting trapped in bad local minima?',
  },
  {
    id: 'q_language_nature',
    question: 'What is a language? Why is it a 1D sequence of discrete tokens?',
    realm: 'language',
    realmLabel: 'Serial Compression',
    realmColor: '#ec4899',
    x: 260,
    y: 440,
    oneLiner: 'Language is an evolutionary compression protocol invented because brains cannot touch or beam firing patterns.',
    naiveMisconception: 'People assume language is the primary format of thought itself.',
    firstPrinciplesReality:
      'Human thoughts are continuous, multi-dimensional mental simulations across billions of biological neurons. Because skulls cannot touch, evolution invented language: a low-bandwidth serialized compression protocol that collapses continuous mental states into a 1D string of acoustic symbols (words/tokens).',
    mathematicalEquation: '\\text{Simulation}(\\mathbb{R}^{10^{11}}) \\xrightarrow{\\text{Encode}} (x_1, x_2, \\dots, x_T) \\in \\mathcal{V}^T',
    siliconReality:
      'Tokens are discrete integer IDs (e.g. 50257 vocabulary). The embedding matrix looks up row index `tok_id` to translate discrete symbols back into continuous 4,096-dimensional vectors.',
    connectedQuestionIds: ['q_next_token_world_model'],
    originQuestionIds: ['q_training_physical'],
    researcherReflectionPrompt: 'If language is just a lossy serial compression of a mental simulation, can a model that only predicts text ever reconstruct the full simulation?',
  },
  {
    id: 'q_next_token_world_model',
    question: 'Why does predicting the next token force the network to construct a simulation of the world?',
    realm: 'language',
    realmLabel: 'Causal World Models',
    realmColor: '#ec4899',
    x: 430,
    y: 440,
    oneLiner: 'To predict what word comes next in a book about orbital physics, the model must internally simulate gravity.',
    naiveMisconception: 'People think next-token prediction is merely a stochastic parrot doing superficial text autocomplete.',
    firstPrinciplesReality:
      'Language describes the underlying physical and causal universe. If a sentence reads: "The glass fell off the counter and hit the tile floor, so it...", predicting "shattered" requires understanding gravity, momentum, material brittleness, and causality. Next-token prediction on all human text forces the network to learn the generative model of the reality that produced the text.',
    mathematicalEquation: '\\min_\\theta \\mathbb{E}_{x \\sim \\mathcal{D}} \\left[ -\\sum_{t=1}^T \\log p_\\theta(x_t \\mid x_{<t}) \\right]',
    siliconReality:
      'Attention heads learn specialized semantic routing patterns: induction heads, syntax heads, and causal reasoning heads that activate systematically during token generation.',
    connectedQuestionIds: ['q_memory_bus'],
    originQuestionIds: ['q_language_nature'],
    researcherReflectionPrompt: 'What is the theoretical boundary between predicting the next token with 0 loss and possessing a complete deterministic simulation of the universe?',
  },
  {
    id: 'q_memory_bus',
    question: 'What is the memory bus doing internally? Why is generation memory-bandwidth bound?',
    realm: 'hardware',
    realmLabel: 'The Memory Wall',
    realmColor: '#10b981',
    x: 600,
    y: 440,
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
  },
  {
    id: 'q_kv_cache',
    question: 'What is the KV-cache, and why does it cause catastrophic GPU Out-Of-Memory (OOM) crashes?',
    realm: 'hardware',
    realmLabel: 'VRAM Explosion',
    realmColor: '#10b981',
    x: 770,
    y: 440,
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
  },
  {
    id: 'q_mla_compression',
    question: 'How does Multi-Head Latent Attention (MLA) compress the KV-cache by over 93%?',
    realm: 'hardware',
    realmLabel: 'Subspace Projection',
    realmColor: '#10b981',
    x: 770,
    y: 600,
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
  },
  {
    id: 'q_moe_decoupling',
    question: 'What is Sparse Mixture-of-Experts (MoE)? How do we decouple knowledge from compute?',
    realm: 'hardware',
    realmLabel: 'Sparse Routing',
    realmColor: '#10b981',
    x: 600,
    y: 600,
    oneLiner: 'MoE lets you have the knowledge capacity of 671 billion parameters with the inference latency of 37 billion parameters.',
    naiveMisconception: 'People assume every parameter in a neural network must execute for every single token.',
    firstPrinciplesReality:
      'Sparse MoE replaces a single monolithic feedforward block with multiple specialized expert subnetworks. A lightweight router computes softmax over Top-k (e.g. Top-2 of 8, or Top-8 of 256). Tokens are only dispatched to the selected experts, multiplying total parameter capacity by 8x while keeping active inference compute completely constant.',
    mathematicalEquation: 'y = \\sum_{i \\in \\text{Top-}k} p_i(x) E_i(x), \\quad \\mathcal{L}_{\\text{balance}} = \\alpha \\cdot E \\sum_{i=1}^E f_i P_i',
    siliconReality:
      'Requires expert parallelism across multiple GPUs over ultra-fast NVLink interconnects, plus auxiliary load balancing losses to prevent winner-take-all GPU rank stalls.',
    connectedQuestionIds: ['q_unsolved_frontier'],
    originQuestionIds: ['q_kv_cache', 'q_mla_compression'],
    researcherReflectionPrompt: 'If human brains only fire ~1-2% of neurons at any given millisecond, is Sparse MoE the first digital step toward biological metabolic sparsity?',
  },
  {
    id: 'q_unsolved_frontier',
    question: 'What is the next unasked question? The thermodynamic and continuous frontier of intelligence?',
    realm: 'physics',
    realmLabel: 'The Unsolved Frontier',
    realmColor: '#06b6d4',
    x: 350,
    y: 600,
    oneLiner: 'Where discrete layers and digital clock cycles dissolve into continuous thermodynamics and analog physics.',
    naiveMisconception: 'People think modern transformers with 80 discrete layers and AdamW optimization are the final form of AI.',
    firstPrinciplesReality:
      'Digital synchronous clock-gated hardware wastes 99% of energy shuffling bits across buses. The next breakthroughs lie at the intersection of continuous dynamical systems (Neural ODEs), non-von-Neumann neuromorphic event-driven spikes, and thermodynamic physics-informed computing where the physical substrate itself performs the mathematical relaxation.',
    mathematicalEquation: '\\frac{d\\mathbf{h}}{dt} = \\mathbf{f}(\\mathbf{h}(t), t, \\theta), \\quad \\Delta S_{\\text{universe}} \\ge 0 \\implies \\text{Reversible analog computing}',
    siliconReality:
      'Emerging analog optical matrix multipliers (photonic tensor cores) and in-memory analog memristor crossbar arrays compute dot products at zero memory bus transit cost using Ohm\'s and Kirchhoff\'s laws.',
    connectedQuestionIds: ['q_electron'],
    originQuestionIds: ['q_moe_decoupling'],
    researcherReflectionPrompt: 'If nature solved intelligence using 20 Watts of chemical ion gradients without digital clock cycles, why are we burning megawatts on matrix multiplication?',
  },
];
