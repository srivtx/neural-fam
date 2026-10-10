# Neural Family: Interactive Neural Network Taxonomy & Project Laboratory

An interactive, visual-first learning laboratory and phylogenetic tree of artificial neural networks. Learn every major family—from the single neuron perceptron to Transformers, State-Space Models (Mamba), Graph Neural Networks, and Diffusion models—combining live mathematical simulations, intuitive real-world analogies, interactive code scratchpads with real-time test runners, and hands-on miniature projects built from the ground up.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences from Turn 1 clarification have been incorporated as core pillars:
> - **Dual Format Labs**: Every architecture includes BOTH an interactive visual simulator (with live sliders, dynamic synaptic graph activations, and step-by-step mathematical breakdown) AND an interactive code scratchpad with runnable code, sample inputs, and verification test cases.
> - **Zero-Prerequisite Onboarding**: The curriculum begins with a bird's-eye phylogenetic tree atlas, then immediately zooms into Chapter 0: "The Biological to Digital Spark" (a single artificial neuron: inputs, weights, bias, step function, and 2D decision boundary explained with simple physical scale analogies).
> - **Aesthetic Posture**: Dark high-tech laboratory environment (`#0B0F17` canvas, `#131B2E` panels, cyan/indigo synapsing vectors, amber excitation pulses, crisp JetBrains/IBM Plex Mono math & code readouts, zero AI slop).

- **Confirmed Decision 1**: Interactive visual simulator + runnable code workshop scratchpad in each lab module.
- **Confirmed Decision 2**: Progression starts with the global Interactive Family Tree & 3-Question Taxonomy classifier, dropping down into Level 1: Single Neuron & Linear Decision Boundary, then scaling up to Multilayer Perceptrons, CNNs/ResNets, RNNs/LSTMs, Transformers, SSMs/Mamba, GNNs, Diffusion/VAEs, and Specialized Networks.
- **Confirmed Decision 3**: Dark scientific lab theme with glowing synaptic SVG graphs, canvas-based live decision boundary plots, and tabular numeric telemetry.

---

## 1. Overview & Core Concept

### What It Does
*Neural Family* is a full-featured educational workstation that demystifies how neural networks actually compute. Rather than treating architectures as abstract black boxes, it organizes them along the three fundamental research questions:
1. **Core Architecture**: How information is structured (Grid/CNN, Flat/MLP, Ordered Sequence/RNN, Graph/GNN, Continuous/ODE).
2. **Structural Mechanisms**: How layers communicate (Residual skips $y = x + F(x)$, Self-Attention, Gating, Normalization, Dense concatenation, MoE routing).
3. **Training Objective & Generative Paradigm**: What the network produces (Discriminative Classifier, Autoregressive Next-Token Predictor, Autoencoder/VAE Reconstructor, Denoising Diffusion, Invertible Normalizing Flow).

### Target Audience & Pedagogical Tone
- Built for learners, students, and engineers who want intuitive mental models without getting lost in math jargon, yet demands rigorous formulas ($y = \sigma(Wx+b)$, causal attention, state-space updates $h_{t+1} = Ah_t + Bx_t$).
- Every concept uses an intuitive physical intuition (e.g., weights as volume knobs, bias as the baseline activation threshold, residual connections as an express highway preventing signals from fading, attention as dynamic spotlighting).

---

## 2. User Experience & Visual Design

### Key User Flows
1. **The Neural Tree Atlas (Phylogenetic Navigator)**:
   - An interactive node-link graph mapping the 7 major families (Feedforward, Sequence, Attention & Transformers, State-Space Models, Graph Networks, Generative Models, Specialized/Continuous Networks).
   - Filter by computational paradigm, historical epoch, or mechanism. Clicking any node focuses its architectural profile and launches its Project Lab.
2. **The "3 Questions" Interactive Classifier**:
   - An interactive taxonomy matrix allowing the user to configure any paper or model (e.g., *ResNet-50*, *GPT-4*, *Mamba-2*, *AlphaFold / GNN*, *Stable Diffusion U-Net*) and see how core architecture, mechanisms, and objectives intersect.
3. **Hands-On Project Labs (From Neuron to Modern Foundation Models)**:
   - **Lab 0: The Atomic Neuron & Decision Boundary** (Weights, bias, step & sigmoid activations, live 2D planar separation).
   - **Lab 1: The Multilayer Perceptron (MLP) & XOR Problem** (Why linear boundaries fail, hidden layer feature space bending).
   - **Lab 2: Convolutional Vision (CNN & ResNet)** (Kernel sliding filters, spatial feature maps, residual skip highway).
   - **Lab 3: Recurrence & Memory (RNN, LSTM & GRU)** (Hidden state carrying loop, gating valves forgetting vs retaining).
   - **Lab 4: Attention & Transformers** (Query-Key-Value dot products, attention matrix heatmap, causal autoregressive masking).
   - **Lab 5: State-Space Models (S4 & Mamba)** (Continuous-to-discrete state update $h_{t+1} = Ah_t + Bx_t$, input-dependent selective filtering, comparing linear memory vs quadratic attention).
   - **Lab 6: Graph Neural Networks (GCN & Message Passing)** (Nodes, adjacency matrix, aggregate-and-update step for molecules/networks).
   - **Lab 7: Generative Engines (Diffusion & VAE)** (Noise corruption and reverse denoising trajectory step-by-step).
4. **Code Workshop & Playground**:
   - In-browser editable TypeScript/Python-syntax scratchpad with pre-loaded, dependency-free implementations of forward passes, matrix multiplications, and loss updates.
   - One-click "Run Code & Verify" executing against unit test suites with clear pass/fail diagnostics.

### Visual Identity & Theme
- **Canvas & Surfaces**:
  - Main background: `#090D16` (Deep Obsidian Void).
  - Surface containers: `#101726` with hairline border `rgba(255, 255, 255, 0.08)`.
  - Secondary active surfaces: `#182238`.
- **Accent Palette**:
  - Synapse & Signal Cyan: `#06B6D4` (Active data flow & feedforward vectors).
  - Neural Excitation Violet: `#8B5CF6` (Weights & attention focal points).
  - Residual Highway Emerald: `#10B981` (Identity connections & verified states).
  - State Gradient Amber: `#F59E0B` (SSM states, bias adjustments, warning thresholds).
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` (Crisp, modern, authoritative).
  - Body & Explanations: `Plus Jakarta Sans` / `DM Sans` (Clean, warm legibility).
  - Math & Code: `JetBrains Mono` / `IBM Plex Mono` with `tabular-nums`.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side Fast Numerical Engine**:
  - *Chosen Approach*: Write pure TypeScript tensor/matrix operations directly in the browser for all simulations (matrix multiplication, activations, 2D boundary rasterization, attention dot-products, SSM recurrence).
  - *Why*: Instant 60 FPS slider response with zero network latency, offline reliability, and transparent math that users can inspect directly in code.
- **Decision 2: Dual Simulation & Code Workshop Tab in Every Lab**:
  - *Chosen Approach*: Each family lab has a segmented toggle: `[Visual Simulator]` $\leftrightarrow$ `[Code Workshop]` $\leftrightarrow$ `[Theory & Analogies]`.
  - *Why*: Satisfies both visual learners who grasp spatial intuitions and developers who understand algorithms best through runnable code.
- **Decision 3: Universal 3-Question Taxonomy Drawer**:
  - *Chosen Approach*: An omnipresent or readily accessible classifier panel showing the (Core Architecture, Structural Mechanisms, Training Objective) breakdown for both preset landmark models and custom user configurations.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Neural Family Workstation                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  Top Bar: [Brand: NEURAL FAMILY] ── [Atlas | Labs | Classifier | Code] ──   │
│           [Quick Tour / Lab Selector]                                       │
├──────────────────────────────────────┬──────────────────────────────────────┤
│ Left Column (40% / Collapsible):     │ Right Column (60% Interactive):      │
│ ┌──────────────────────────────────┐ │ ┌──────────────────────────────────┐ │
│ │ • Architecture Taxonomy Tree     │ │ │ Active Lab Stage:                 │ │
│ │ • Curriculum Path (0 to 7)       │ │ │  [Visual Sim] [Code] [Theory]    │ │
│ │ • 3-Question Model Profiler      │ │ │ ──────────────────────────────── │ │
│ │ • Analogy & Real-World Examples  │ │ │  • Live Interactive Canvas / SVG  │ │
│ └──────────────────────────────────┘ │ │  • Synaptic Sliders & Parameters │ │
│                                      │ │  • Step-by-Step Math Inspector    │ │
│                                      │ │  • Code Editor & Test Runner      │ │
│                                      │ └──────────────────────────────────┘ │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### State Model
- `activeFamilyId`: Currently selected architecture family (`perceptron`, `mlp`, `cnn_resnet`, `rnn_lstm`, `transformer`, `ssm_mamba`, `gnn`, `diffusion`, `specialized`).
- `activeTab`: `'visual' | 'code' | 'theory' | 'taxonomy'`.
- `simState`: Real-time weights, biases, inputs, sequence tokens, adjacency matrices, and step counters for the active simulation.
- `codeScratchpadState`: Per-lab user code snippets with reset-to-solution and live evaluation output.
