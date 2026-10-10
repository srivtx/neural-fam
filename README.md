<p align="center">
  <h1 align="center">Neural Family Tree</h1>
  <p align="center"><strong>An interactive evolutionary laboratory for artificial neural network architectures.</strong></p>
  <p align="center">
    From the 1943 McCulloch-Pitts threshold neuron to modern Transformers, Mamba state-space models, and Diffusion networks.
  </p>
</p>

<p align="center">
  <a href="https://github.com/srivtx/neural-fam/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="Build Status" /></a>
  <a href="https://github.com/srivtx/neural-fam"><img src="https://img.shields.io/badge/typescript-5.8-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/react-19-61dafb?style=flat-square&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://vite.dev"><img src="https://img.shields.io/badge/vite-8.3-646cff?style=flat-square&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/tailwind-4.3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsrivtx%2Fneural-fam"><img src="https://img.shields.io/badge/deploy-vercel-black?style=flat-square&logo=vercel&logoColor=white" alt="Deploy to Vercel" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square" alt="License" /></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#key-capabilities">Key Capabilities</a> &bull;
  <a href="#the-3-question-architectural-taxonomy">3-Question Taxonomy</a> &bull;
  <a href="#interactive-laboratories">Interactive Labs</a> &bull;
  <a href="#architecture-synthesis-studio">Synthesis Studio</a> &bull;
  <a href="#deployment">Deployment</a>
</p>

---

## What is Neural Family Tree?

Most machine learning courses ask students to memorize model acronyms (`CNN`, `RNN`, `Transformer`, `SSM`) as disconnected black boxes.

**Neural Family Tree** is organized around **inductive biases** and **hardware constraints**:
1. **Topology & Symmetries:** Does the data live on an ordered 1D stream, a 2D spatial grid, an arbitrary relational graph, or an unordered set?
2. **Gradient Survival:** How do backpropagation signals travel across 100+ layers without vanishing or exploding? ($y = x + F(x)$)
3. **Information Bottlenecks:** What forced each paradigm shift? (Perceptron XOR failure &rarr; MLP non-linear manifolds &rarr; Vanishing gradients &rarr; ResNet skips &rarr; Sequential recurrence bottleneck &rarr; Transformer parallel attention &rarr; Quadratic memory wall &rarr; Selective SSMs).

Every concept is backed by an interactive mathematical canvas running client-side tensor calculations, live parameter counters, and copyable PyTorch reference modules.

---

## Key Capabilities

- **Architecture Synthesis Studio:** Compose custom neural blocks from scratch (Attention, Sliding-Window, Linear Attention, Mamba SSM, Depthwise Convolutions, SwiGLU, and Sparse Mixture of Experts). Live KV-cache memory estimator, GPU roofline simulator, VRAM bounds, and automatic PyTorch `nn.Module` code generation.
- **9 Progressive Interactive Labs:** From a single McCulloch-Pitts decision boundary to XOR manifold folding, $3\times3$ spatial convolutions, LSTM forget valves, multi-head attention heatmaps, and continuous ODE dynamical flows.
- **The 3-Question Decision Compass:** Rapidly diagnose the optimal architecture family for any dataset in 30 seconds.
- **Family Tree Atlas:** Chronological exploration of landmark models with author credits, year of publication, and exact paper references.
- **PyTorch Code Workshop:** Production-ready reference implementations of modern primitives (Scaled Dot-Product Attention, RoPE, RMSNorm, SwiGLU, Minimal Mamba, and GCN).
- **Zero-Latency In-Browser Math:** Procedural math engine written in pure TypeScript with zero external Python backend requirements.

---

## The 3-Question Architectural Taxonomy

Every neural network architecture answers three engineering questions:

```
┌────────────────────────────────────────────────────────┐
│ 1. DATA TOPOLOGY                                       │
│    1D Sequence? 2D Spatial Grid? Relational Graph? Set?│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 2. INDUCTIVE BIAS ROUTING                              │
│    Local Weight Sharing? Recurrent State? All-to-All?  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│ 3. COMPUTE & SCALING BOTTLENECK                        │
│    O(1) Step Cost? O(N) Linear Time? O(N²) Quadratic?  │
└────────────────────────────────────────────────────────┘
```

| Family | Topology | Routing Primitive | Complexity | Landmark Example |
| :--- | :--- | :--- | :--- | :--- |
| **Feedforward** | Fixed vector | Dense matrix multiplication | $O(d^2)$ | MLP, Rosenblatt Perceptron |
| **Convolutional** | 2D/3D Grid | Sliding localized kernels | $O(N \cdot k)$ | ConvNeXt, ResNet-50 |
| **Sequential** | 1D Ordered | Recurrent hidden state update | $O(N)$ (sequential) | LSTM, GRU |
| **Attention** | Any token set | Scaled pairwise dot-product | $O(N^2)$ | Transformer, LLaMA 3 |
| **State-Space (SSM)** | Continuous sequence | Discretized linear state dynamics | $O(N)$ (parallel) | Mamba-2, S4 |
| **Graph Networks** | Arbitrary topology | Topological message passing | $O(\|E\|)$ | GCN, AlphaFold-2 |
| **Generative** | Continuous manifold | Denoising diffusion / Latent bottleneck | Adaptive steps | DDPM, VAE |

---

## Architecture Synthesis Studio

The studio allows you to design custom hybrid architectures and test them against realistic hardware workloads:

- **Configurable Primitives:** Stack any combination of MHA, Grouped-Query Attention (GQA), Sliding Window, Mamba SSM, 1D Convolutions, SwiGLU, and MoE.
- **Hardware Targets:** Verify memory feasibility against NVIDIA H100 (80GB), A100 (80GB), RTX 4090 (24GB), T4 (16GB), Laptop GPUs (8GB), or Microcontrollers (512KB).
- **Live Memory Profiler:** Real-time breakdown of model weights, KV-cache footprint across sequence lengths from $256$ to $131,072$ tokens, and activation buffers.
- **Roofline Feasibility Engine:** Evaluates arithmetic intensity ($\text{FLOPs} / \text{Byte}$) against GPU memory bandwidth to identify memory-bound vs. compute-bound regimes.
- **Executable Blueprint Export:** Generates clean, type-annotated PyTorch modules ready for training or fine-tuning.

---

## Interactive Laboratories

| Level | Laboratory | Core Formula | Key Visualizer |
| :---: | :--- | :--- | :--- |
| **0** | **Single Neuron** | $y = \sigma(W x + b)$ | 2D decision boundary with live weight and bias sliders |
| **1** | **MLP & XOR Space Warping** | $h = \text{ReLU}(W_1 x + b_1)$ | Non-linear geometric surface deformation separating XOR |
| **2** | **CNN & ResNet Highways** | $y = x + F(x)$ | Interactive $3\times3$ filter convolution and residual gradient flow |
| **3** | **RNN & LSTM Memory** | $C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t$ | Sequence timeline with dynamic forget and input gate valves |
| **4** | **Transformers & Attention** | $\text{Softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$ | Interactive attention matrix heatmap and token routing |
| **5** | **State-Space Models & Mamba** | $h_{t+1} = \bar{A}h_t + \bar{B}x_t$ | Continuous discretization and input-dependent selective filtering |
| **6** | **Graph Neural Networks** | $h_v^{(k)} = \text{AGG}\left(\{h_u : u \in \mathcal{N}(v)\}\right)$ | Relational message passing and over-smoothing depth stress test |
| **7** | **Diffusion & Generative VAE** | $q(x_t \mid x_{t-1}), \; p_\theta(x_{t-1} \mid x_t)$ | Forward noise injection and reverse thermodynamic denoising |
| **8** | **Neural ODEs & Continuous Systems** | $\frac{dh(t)}{dt} = f(h, t, \theta)$ | Continuous vector field trajectories with adaptive Euler steps |

---

## Quick Start

### Using Bun (Recommended)

```bash
# Clone the repository
git clone https://github.com/srivtx/neural-fam.git
cd neural-fam

# Install dependencies
bun install

# Start development server
bun dev
```

### Using npm / pnpm

```bash
npm install
npm run dev
```

Open your browser to `http://localhost:3000`.

---

## Deployment

### Deploy to Vercel in 1 Click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsrivtx%2Fneural-fam)

The application builds as a clean, static single-page application with zero server dependencies:

```bash
# Production build
npm run build

# Preview production output locally
npm run preview
```

Output is compiled to the `dist/` folder, ready for immediate deployment on Vercel, Cloudflare Pages, Netlify, or AWS S3.

---

## Keyboard Shortcuts

| Shortcut | Destination / Action |
| :---: | :--- |
| <kbd>1</kbd> | Home Overview & Evolutionary Timeline |
| <kbd>2</kbd> | Tree Atlas (Chronological model catalog) |
| <kbd>3</kbd> | Interactive Project Laboratories |
| <kbd>4</kbd> | 3-Question Architectural Taxonomy Matrix |
| <kbd>5</kbd> | Architecture Synthesis Studio |
| <kbd>6</kbd> | PyTorch Code Reference Workshop |
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | Global Search & Command Palette |
| <kbd>?</kbd> | Architectural Glossary & Analogies |
| <kbd>F</kbd> | Focus Mode (Toggle Top Navigation) |

---

## Tech Stack

- **Framework:** React 19 + TypeScript 5.8
- **Bundler:** Vite 8.3
- **Styling:** Tailwind CSS 4.3 (warm paper/ink neutrals, semantic family tokens)
- **Icons:** Lucide React
- **Audio:** Client-synthesized Web Audio API feedback (with mute toggle)

---

## License

Distributed under the Apache-2.0 License. See [LICENSE](LICENSE) for details.
