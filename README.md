# Neural Family Tree · Interactive Architecture Laboratory

<p align="center">
  <a href="https://ais-pre-wtquidnmwlynjc3xzujcc6-371726331409.asia-southeast1.run.app">
    <img src="https://img.shields.io/badge/Live_App-Visit_Website-10b981?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live App">
  </a>
  <a href="https://github.com">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19">
  </a>
  <a href="https://vitejs.dev">
    <img src="https://img.shields.io/badge/Vite-8.x-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  </a>
  <a href="https://tailwindcss.com">
    <img src="https://img.shields.io/badge/Tailwind-4.x-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  </a>
  <a href="https://pytorch.org">
    <img src="https://img.shields.io/badge/PyTorch-Ready-ee4c2c?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch Ready">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge" alt="License">
  </a>
</p>

<p align="center">
  <strong>From Perceptrons to Transformers, State Space Models (Mamba), and Graph Neural Networks.</strong><br>
  An interactive, zero-memorization evolutionary tree, 3-question design matrix, live math visualizers, and code workshop.
</p>

<p align="center">
  <a href="#-live-website">Live Demo</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-the-3-question-architectural-taxonomy">3-Question Taxonomy</a> •
  <a href="#-interactive-laboratories">Interactive Labs</a> •
  <a href="#-architecture-synthesis-studio">Synthesis Studio</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-shortcuts">Hotkeys</a>
</p>

---

## 🌐 Live Website

Access the full standalone application in any browser:

| Environment | URL | Status |
| :--- | :--- | :--- |
| **Production / Shareable App** | **[https://ais-pre-wtquidnmwlynjc3xzujcc6-371726331409.asia-southeast1.run.app](https://ais-pre-wtquidnmwlynjc3xzujcc6-371726331409.asia-southeast1.run.app)** | ![Active](https://img.shields.io/badge/Status-Online-emerald?style=flat-square) |
| **Development Preview** | [https://ais-dev-wtquidnmwlynjc3xzujcc6-371726331409.asia-southeast1.run.app](https://ais-dev-wtquidnmwlynjc3xzujcc6-371726331409.asia-southeast1.run.app) | ![Dev](https://img.shields.io/badge/Build-Passing-blue?style=flat-square) |

> 💡 **Tip:** Open the URL in a separate desktop or mobile browser tab to explore without iframe constraints.

---

## ⚡ What Makes This Different?

Most machine learning tutorials encourage memorizing models as disjointed blocks (`CNN`, `RNN`, `Transformer`, `GNN`). 
**Neural Family Tree** is structured around the **fundamental inductive biases** that produced every major architecture:

1. **How is information routed?** (Local translation invariance, recurrent recurrence, pairwise all-to-all attention, permutation-invariant aggregation)
2. **What bottleneck exists?** (Vanishing gradients, quadratic $O(N^2)$ memory, context compression, over-smoothing)
3. **What is the mathematical breakthrough?** (Skip connections, gated memory cells, queries/keys/values, continuous ODEs, selective hidden state filtering)

---

## 🔬 Key Features

### 1. 🧬 Interactive Lineage Tree & Atlas
- Trace the chronological evolution from McCulloch-Pitts (1943) & Rosenblatt's Perceptron (1958) to Deep Feedforward, ResNets, ConvNeXt, Transformers, RetNet, Mamba SSMs, and Diffusion models.
- Filter by computational paradigm: **Dense**, **Convolutional**, **Recurrent**, **Attention / Transformer**, **State-Space Model (SSM)**, **Graph-Based**, **Energy / Generative**, and **Hardware-Native**.
- Color-coded inductive biases and failure modes for every architecture.

### 2. 🎛️ 11 Hands-on Neural Simulators
Every family has a live mathematical laboratory running real-time calculations directly in the browser:
- **Single Neuron & Perceptron**: Decision boundaries, weight vectors $w_1, w_2$, bias $b$, and activation functions ($\sigma$, ReLU, Tanh).
- **Multi-Layer Perceptron (MLP)**: Universal approximation, XOR non-linear manifold folding.
- **CNN & ResNet Residual Lab**: Interactive $3\times3$ convolution filter kernels, residual skip addition $F(x) + x$, and vanishing gradient mitigation.
- **RNN / LSTM / GRU Memory**: Hidden state recurrence, forget gates, and long-range sequential attenuation.
- **Multi-Head Self-Attention (Transformer)**: Scaled dot-product matrix heatmap $\text{softmax}(QK^T / \sqrt{d_k})$, token routing, and $O(N^2)$ vs. linear scaling.
- **Mamba & State Space Models (SSM)**: Continuous $(A, B, C, \Delta)$ discretization, selective gating, and linear time complexity.
- **Graph Neural Network (GNN)**: Message-passing, node feature aggregation, and over-smoothing depth test.
- **Diffusion Generative Sandbox**: Forward noise injection $q(x_t|x_{t-1})$ and reverse denoising trajectory $p_\theta(x_{t-1}|x_t)$.
- **Autoencoders & VAE**: Latent manifold bottleneck with Reparameterization Trick $\mu + \sigma \odot \epsilon$.
- **Transformer Scaling Law Calculator**: Chinchilla compute-optimal parameters vs. dataset tokens calculator.
- **Transformer Parameter Inspector**: Exact parameter counter for weights, embeddings, MLP expansion, and KV caches.

### 3. 🧩 Architecture Synthesis Studio (*Beyond Memorization*)
Instead of asking *"Which model did someone else publish?"*, the Studio trains you to think like an architecture designer:
- **Interactive Constraint Workbench**: Select your data structure (1D sequence, 2D grid, arbitrary graph, multi-modal), sequence length $N$, computational budget, latency ceiling, and permutation invariance requirement.
- **Real-Time Architectural Recommendation Engine**: Synthesizes custom architectures (e.g., *Conv-Attention Hybrid*, *Linear SSM Backbone*, *Message-Passing Transformer*) with detailed rationale, trade-offs, and failure mode warnings.
- **Architecture Idea Generator**: Generates novel research hypotheses combining state-of-the-art primitives.

### 4. 💻 PyTorch Architecture Code Workshop
- Copy-paste ready, clean, modular PyTorch (`torch.nn.Module`) implementations for:
  - Scaled Dot-Product Multi-Head Attention
  - Residual Block (`ResBlock`) with bottleneck support
  - Minimal Selective State Space Model (`MambaMinimal`)
  - Graph Convolutional Layer (`GCNConv`)
  - Gated Recurrent Unit (`MinimalGRU`)
- One-click copy with resilient fallback across browsers, security contexts, and iframes.
- Interactive parameter playground to inspect shapes and output tensor dimensions.

### 5. 🛡️ Rock-Solid Architecture & Error Boundaries
- Integrated React 19 `ErrorBoundary` preventing visualizer edge-case crashes (numerical divergences, canvas overflows).
- Responsive layout with desktop, tablet, and mobile views.
- Ambient Web Audio feedback synthesizer with discrete toggle.
- Full dark / light mode with high-contrast scientific typography.

---

## 📐 The 3-Question Architectural Taxonomy

Every architecture answers three fundamental engineering questions:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DATA TOPOLOGY                                            │
│    Grid? Continuous Stream? Graph? Unordered Set?           │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. INDUCTIVE BIAS ROUTING                                   │
│    Weight Sharing? Recurrent Memory? Pairwise Cross-Product?│
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. COMPUTE & SCALING BOTTLENECK                             │
│    O(1) Step Cost? O(N) Linear Time? O(N²) Quadratic Memory?│
└─────────────────────────────────────────────────────────────┘
```

---

## ⌨️ Hotkeys & Quick Navigation

Press any of the following keys anywhere in the app (when not typing in a text field):

| Key | View |
| :---: | :--- |
| <kbd>1</kbd> | **Home** (Overview & Evolutionary Tree) |
| <kbd>2</kbd> | **Atlas** (Comprehensive Architecture Cards) |
| <kbd>3</kbd> | **Labs** (Interactive Math Simulators) |
| <kbd>4</kbd> | **Taxonomy** (3-Question Research Matrix) |
| <kbd>5</kbd> | **Synthesis Studio** (Custom Architecture Designer) |
| <kbd>6</kbd> | **Code Workshop** (PyTorch Reference Implementations) |
| <kbd>?</kbd> | **Glossary** (ML Architecture Lexicon) |
| <kbd>F</kbd> | **Zen / Focus Mode** (Toggle full-screen focus) |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | **Global Search** (Search all architectures, formulas, and papers) |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) >= 18.0.0
- `npm` or `pnpm` or `bun`

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/neural-network-family-tree.git
cd neural-network-family-tree

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern component architecture, hooks, and error boundaries |
| **TypeScript 5** | Strict type safety for network parameters, tensor shapes, and state |
| **Tailwind CSS 4** | Zero-runtime modern styling, dark mode, responsive layouts |
| **Lucide Icons** | Consistent, legible scientific icon system |
| **Vite 8** | Instantaneous HMR and optimized tree-shaken production bundles |
| **Web Audio API** | Subtle, client-synthesized procedural tactile audio feedback |

---

## 📄 License

Distributed under the Apache-2.0 License. See [LICENSE](LICENSE) for more information.
