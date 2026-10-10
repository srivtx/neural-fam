/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Studio data model: what a design is, what the workload is, and the
 * catalogue of building blocks you can stack.
 */

export type Modality = 'text' | 'image' | 'audio' | 'timeseries' | 'graph' | 'set';

export type LayerKind =
  | 'attention'
  | 'window_attention'
  | 'linear_attention'
  | 'ssm'
  | 'conv'
  | 'gnn'
  | 'mlp'
  | 'swiglu'
  | 'moe';

export interface Layer {
  id: string;
  kind: LayerKind;
  heads?: number;
  kvHeads?: number;
  window?: number;
  kernel?: number;
  depthwise?: boolean;
  dState?: number;
  expand?: number;
  hidden?: number;
  experts?: number;
  topK?: number;
}

export type NormKind = 'layernorm' | 'rmsnorm' | 'none';
export type PosKind = 'learned' | 'rope' | 'none';

export interface Design {
  name: string;
  modality: Modality;
  d: number;
  depth: number;
  block: Layer[];
  residual: boolean;
  norm: NormKind;
  pos: PosKind;
  bias: boolean;
  vocab: number;
  tied: boolean;
  inputDim: number;
  outputDim: number;
  maxLen: number;
}

export type Precision = 'fp32' | 'bf16' | 'fp8' | 'int4';
export type GpuId = 'mcu' | 'laptop' | 't4' | 'rtx4090' | 'a100' | 'h100' | 'b200';
export type Mode = 'inference' | 'training';

export interface Workload {
  seqLen: number;
  batch: number;
  precision: Precision;
  gpu: GpuId;
  mode: Mode;
  fused: boolean;
  causal: boolean;
  streaming: boolean;
  trainTokens: number;
  avgDegree: number;
}

export interface GpuSpec {
  id: GpuId;
  name: string;
  memGB: number;
  tflops: number;
  bandwidthGBs: number;
}

export const GPUS: GpuSpec[] = [
  { id: 'mcu', name: 'Microcontroller (512 KB)', memGB: 0.0005, tflops: 0.0002, bandwidthGBs: 0.4 },
  { id: 'laptop', name: 'Laptop GPU · 8 GB', memGB: 8, tflops: 22, bandwidthGBs: 256 },
  { id: 't4', name: 'T4 · 16 GB', memGB: 16, tflops: 65, bandwidthGBs: 320 },
  { id: 'rtx4090', name: 'RTX 4090 · 24 GB', memGB: 24, tflops: 165, bandwidthGBs: 1008 },
  { id: 'a100', name: 'A100 · 80 GB', memGB: 80, tflops: 312, bandwidthGBs: 2039 },
  { id: 'h100', name: 'H100 · 80 GB', memGB: 80, tflops: 989, bandwidthGBs: 3350 },
  { id: 'b200', name: 'B200 · 192 GB', memGB: 192, tflops: 2250, bandwidthGBs: 8000 },
];

export const PRECISION_BYTES: Record<Precision, number> = {
  fp32: 4,
  bf16: 2,
  fp8: 1,
  int4: 0.5,
};

export interface ModalityInfo {
  id: Modality;
  label: string;
  unit: string;
  blurb: string;
  defaultInputDim: number;
  defaultOutputDim: number;
}

export const MODALITIES: ModalityInfo[] = [
  { id: 'text', label: 'Text', unit: 'tokens', blurb: 'Ordered tokens from a vocabulary', defaultInputDim: 0, defaultOutputDim: 0 },
  { id: 'image', label: 'Image', unit: 'patches', blurb: 'A 2D grid. Neighbours matter most', defaultInputDim: 768, defaultOutputDim: 1000 },
  { id: 'audio', label: 'Audio', unit: 'frames', blurb: 'Spectrogram frames over time', defaultInputDim: 80, defaultOutputDim: 32 },
  { id: 'timeseries', label: 'Time series', unit: 'steps', blurb: 'Sensor readings, possibly endless', defaultInputDim: 16, defaultOutputDim: 1 },
  { id: 'graph', label: 'Graph', unit: 'nodes', blurb: 'Nodes + edges. No natural order', defaultInputDim: 64, defaultOutputDim: 1 },
  { id: 'set', label: 'Set', unit: 'elements', blurb: 'Unordered bag of items', defaultInputDim: 32, defaultOutputDim: 10 },
];

export interface KindInfo {
  kind: LayerKind;
  label: string;
  short: string;
  color: string;
  mixes: 'tokens' | 'channels' | 'both';
  cost: string;
  blurb: string;
}

export const KINDS: Record<LayerKind, KindInfo> = {
  attention: {
    kind: 'attention',
    label: 'Attention',
    short: 'ATTN',
    color: '#ff3b6b',
    mixes: 'tokens',
    cost: 'O(N²)',
    blurb: 'Every position looks at every other. Great recall, quadratic cost.',
  },
  window_attention: {
    kind: 'window_attention',
    label: 'Sliding-window attention',
    short: 'SWA',
    color: '#ff6b8f',
    mixes: 'tokens',
    cost: 'O(N·W)',
    blurb: 'Attention limited to the last W positions. Reach grows with depth.',
  },
  linear_attention: {
    kind: 'linear_attention',
    label: 'Linear attention',
    short: 'LIN',
    color: '#f472b6',
    mixes: 'tokens',
    cost: 'O(N)',
    blurb: 'Kernelised attention with a running d×d state. Cheap, weaker recall.',
  },
  ssm: {
    kind: 'ssm',
    label: 'State-space (Mamba)',
    short: 'SSM',
    color: '#8b5cf6',
    mixes: 'both',
    cost: 'O(N)',
    blurb: 'Input-dependent recurrence with a fixed-size state. Linear time.',
  },
  conv: {
    kind: 'conv',
    label: 'Convolution',
    short: 'CONV',
    color: '#00a86b',
    mixes: 'tokens',
    cost: 'O(N·k)',
    blurb: 'Same small filter slid across positions. Local and translation-aware.',
  },
  gnn: {
    kind: 'gnn',
    label: 'Message passing',
    short: 'GNN',
    color: '#00b8d9',
    mixes: 'both',
    cost: 'O(E)',
    blurb: 'Each node sums messages from its neighbours. Order-free.',
  },
  mlp: {
    kind: 'mlp',
    label: 'MLP (GELU)',
    short: 'MLP',
    color: '#3346ff',
    mixes: 'channels',
    cost: 'O(N)',
    blurb: 'Per-position expand → nonlinearity → project back.',
  },
  swiglu: {
    kind: 'swiglu',
    label: 'SwiGLU',
    short: 'GLU',
    color: '#4f6bff',
    mixes: 'channels',
    cost: 'O(N)',
    blurb: 'Gated MLP used by Llama, Mistral, PaLM. Three matrices instead of two.',
  },
  moe: {
    kind: 'moe',
    label: 'Mixture of experts',
    short: 'MoE',
    color: '#ffb800',
    mixes: 'channels',
    cost: 'O(N·k/E)',
    blurb: 'Many SwiGLU experts; a router sends each token to the top-k.',
  },
};

export const KIND_ORDER: LayerKind[] = [
  'attention',
  'window_attention',
  'linear_attention',
  'ssm',
  'conv',
  'gnn',
  'mlp',
  'swiglu',
  'moe',
];

let idCounter = 0;
export const uid = () => `l${Date.now().toString(36)}${(idCounter++).toString(36)}`;

export function defaultLayer(kind: LayerKind, d: number): Layer {
  const heads = Math.max(1, Math.min(32, Math.round(d / 64)));
  switch (kind) {
    case 'attention':
      return { id: uid(), kind, heads, kvHeads: heads };
    case 'window_attention':
      return { id: uid(), kind, heads, kvHeads: heads, window: 1024 };
    case 'linear_attention':
      return { id: uid(), kind, heads };
    case 'ssm':
      return { id: uid(), kind, dState: 16, expand: 2, kernel: 4 };
    case 'conv':
      return { id: uid(), kind, kernel: 7, depthwise: true };
    case 'gnn':
      return { id: uid(), kind };
    case 'mlp':
      return { id: uid(), kind, hidden: d * 4 };
    case 'swiglu':
      return { id: uid(), kind, hidden: Math.round((d * 8) / 3 / 64) * 64 || d * 2 };
    case 'moe':
      return { id: uid(), kind, hidden: Math.round((d * 8) / 3 / 64) * 64 || d * 2, experts: 8, topK: 2 };
  }
}

export const DEFAULT_WORKLOAD: Workload = {
  seqLen: 4096,
  batch: 1,
  precision: 'bf16',
  gpu: 'rtx4090',
  mode: 'inference',
  fused: true,
  causal: true,
  streaming: false,
  trainTokens: 20e9,
  avgDegree: 3,
};

/* ─────────────────────────── Presets ─────────────────────────── */

export interface Preset {
  id: string;
  name: string;
  year: number;
  note: string;
  design: Design;
  workload?: Partial<Workload>;
}

const L = (kind: LayerKind, extra: Omit<Layer, 'id' | 'kind'> = {}): Layer => ({ id: uid(), kind, ...extra });

export const PRESETS: Preset[] = [
  {
    id: 'gpt2',
    name: 'GPT-2 small',
    year: 2019,
    note: 'The classic decoder: learned positions, LayerNorm, GELU MLP, biases everywhere.',
    design: {
      name: 'GPT-2 small',
      modality: 'text',
      d: 768,
      depth: 12,
      block: [L('attention', { heads: 12, kvHeads: 12 }), L('mlp', { hidden: 3072 })],
      residual: true,
      norm: 'layernorm',
      pos: 'learned',
      bias: true,
      vocab: 50257,
      tied: true,
      inputDim: 0,
      outputDim: 0,
      maxLen: 1024,
    },
    workload: { seqLen: 1024 },
  },
  {
    id: 'llama3-8b',
    name: 'Llama 3 8B',
    year: 2024,
    note: 'RoPE, RMSNorm, SwiGLU and grouped-query attention (8 KV heads for 32 query heads).',
    design: {
      name: 'Llama 3 8B',
      modality: 'text',
      d: 4096,
      depth: 32,
      block: [L('attention', { heads: 32, kvHeads: 8 }), L('swiglu', { hidden: 14336 })],
      residual: true,
      norm: 'rmsnorm',
      pos: 'rope',
      bias: false,
      vocab: 128256,
      tied: false,
      inputDim: 0,
      outputDim: 0,
      maxLen: 8192,
    },
    workload: { seqLen: 8192, gpu: 'h100' },
  },
  {
    id: 'mixtral',
    name: 'Mixtral 8×7B',
    year: 2023,
    note: '8 SwiGLU experts per layer, 2 active per token. ~47B stored, ~13B used per token.',
    design: {
      name: 'Mixtral 8×7B',
      modality: 'text',
      d: 4096,
      depth: 32,
      block: [L('attention', { heads: 32, kvHeads: 8 }), L('moe', { hidden: 14336, experts: 8, topK: 2 })],
      residual: true,
      norm: 'rmsnorm',
      pos: 'rope',
      bias: false,
      vocab: 32000,
      tied: false,
      inputDim: 0,
      outputDim: 0,
      maxLen: 32768,
    },
    workload: { seqLen: 32768, gpu: 'h100' },
  },
  {
    id: 'mamba',
    name: 'Mamba 2.8B',
    year: 2023,
    note: 'No attention at all. Each layer is one selective SSM block with a fixed-size state.',
    design: {
      name: 'Mamba 2.8B',
      modality: 'text',
      d: 2560,
      depth: 64,
      block: [L('ssm', { dState: 16, expand: 2, kernel: 4 })],
      residual: true,
      norm: 'rmsnorm',
      pos: 'none',
      bias: false,
      vocab: 50280,
      tied: true,
      inputDim: 0,
      outputDim: 0,
      maxLen: 0,
    },
    workload: { seqLen: 65536 },
  },
  {
    id: 'hybrid',
    name: 'Jamba-style hybrid',
    year: 2024,
    note: 'Approximation: mostly Mamba layers, one attention layer in eight, MoE on alternate layers.',
    design: {
      name: 'Jamba-style hybrid',
      modality: 'text',
      d: 4096,
      depth: 4,
      block: [
        L('ssm', { dState: 16, expand: 2, kernel: 4 }),
        L('swiglu', { hidden: 14336 }),
        L('ssm', { dState: 16, expand: 2, kernel: 4 }),
        L('moe', { hidden: 14336, experts: 16, topK: 2 }),
        L('ssm', { dState: 16, expand: 2, kernel: 4 }),
        L('swiglu', { hidden: 14336 }),
        L('ssm', { dState: 16, expand: 2, kernel: 4 }),
        L('moe', { hidden: 14336, experts: 16, topK: 2 }),
        L('attention', { heads: 32, kvHeads: 8 }),
        L('swiglu', { hidden: 14336 }),
        L('ssm', { dState: 16, expand: 2, kernel: 4 }),
        L('moe', { hidden: 14336, experts: 16, topK: 2 }),
        L('ssm', { dState: 16, expand: 2, kernel: 4 }),
        L('swiglu', { hidden: 14336 }),
        L('ssm', { dState: 16, expand: 2, kernel: 4 }),
        L('moe', { hidden: 14336, experts: 16, topK: 2 }),
      ],
      residual: true,
      norm: 'rmsnorm',
      pos: 'none',
      bias: false,
      vocab: 65536,
      tied: false,
      inputDim: 0,
      outputDim: 0,
      maxLen: 0,
    },
    workload: { seqLen: 262144, gpu: 'h100' },
  },
  {
    id: 'vit-b16',
    name: 'ViT-B/16',
    year: 2020,
    note: 'A 224px image cut into 196 patches (+1 class token), fed to a plain Transformer encoder.',
    design: {
      name: 'ViT-B/16',
      modality: 'image',
      d: 768,
      depth: 12,
      block: [L('attention', { heads: 12, kvHeads: 12 }), L('mlp', { hidden: 3072 })],
      residual: true,
      norm: 'layernorm',
      pos: 'learned',
      bias: true,
      vocab: 0,
      tied: false,
      inputDim: 768,
      outputDim: 1000,
      maxLen: 197,
    },
    workload: { seqLen: 197, causal: false, mode: 'training', batch: 64, trainTokens: 1.28e6 * 300 * 197, gpu: 'a100' },
  },
  {
    id: 'convnext',
    name: 'ConvNeXt (isotropic)',
    year: 2022,
    note: 'Approximation of isotropic ConvNeXt-S: depthwise 7×7 conv + 4× MLP, repeated at one width.',
    design: {
      name: 'ConvNeXt (isotropic)',
      modality: 'image',
      d: 384,
      depth: 18,
      block: [L('conv', { kernel: 7, depthwise: true }), L('mlp', { hidden: 1536 })],
      residual: true,
      norm: 'layernorm',
      pos: 'none',
      bias: true,
      vocab: 0,
      tied: false,
      inputDim: 768,
      outputDim: 1000,
      maxLen: 0,
    },
    workload: { seqLen: 196, causal: false, mode: 'training', batch: 64, trainTokens: 1.28e6 * 300 * 196, gpu: 'a100' },
  },
  {
    id: 'gnn',
    name: 'Residual GNN',
    year: 2019,
    note: 'Message passing with residuals and an MLP after each round. Typical for molecules.',
    design: {
      name: 'Residual GNN',
      modality: 'graph',
      d: 256,
      depth: 6,
      block: [L('gnn'), L('mlp', { hidden: 512 })],
      residual: true,
      norm: 'layernorm',
      pos: 'none',
      bias: true,
      vocab: 0,
      tied: false,
      inputDim: 64,
      outputDim: 1,
      maxLen: 0,
    },
    workload: { seqLen: 64, causal: false, avgDegree: 3, gpu: 'laptop' },
  },
];

export const BLANK_DESIGN: Design = {
  name: 'Untitled',
  modality: 'text',
  d: 512,
  depth: 8,
  block: [L('attention', { heads: 8, kvHeads: 8 }), L('swiglu', { hidden: 1408 })],
  residual: true,
  norm: 'rmsnorm',
  pos: 'rope',
  bias: false,
  vocab: 32000,
  tied: true,
  inputDim: 0,
  outputDim: 0,
  maxLen: 0,
};

/** Give every layer a fresh id (used when cloning presets). */
export function cloneDesign(d: Design): Design {
  return { ...d, block: d.block.map((l) => ({ ...l, id: uid() })) };
}
