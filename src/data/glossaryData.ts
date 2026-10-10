/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GlossaryTerm {
  term: string;
  category: 'core' | 'mechanisms' | 'math' | 'paradigms';
  definition: string;
  analogy: string;
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Inductive Bias',
    category: 'core',
    definition: 'The architectural assumptions a network makes about data structure before seeing any training examples (e.g. CNNs assume translation invariance, RNNs assume temporal order, GNNs assume permutation invariance).',
    analogy: 'The shaped cookie cutter: a round cutter can never bake a star cookie no matter how much dough you give it.',
  },
  {
    term: 'Vanishing Gradient',
    category: 'math',
    definition: 'When backpropagated gradient signals shrink exponentially with network depth, causing early layers to stop updating and learn nothing.',
    analogy: 'A whisper traveling through 50 rooms until it becomes completely inaudible.',
  },
  {
    term: 'Residual Identity Connection (y = x + F(x))',
    category: 'mechanisms',
    definition: 'A skip connection that adds the input tensor directly to the output of a convolutional or attention sublayer, guaranteeing an uninterrupted gradient flow (dy/dx = 1 + dF/dx).',
    analogy: 'An express bypass highway that lets the original postcard travel straight to the destination intact.',
  },
  {
    term: 'Universal Approximation Theorem',
    category: 'math',
    definition: 'Mathematical proof that any continuous function on compact subsets of R^n can be approximated to arbitrary accuracy by a feedforward network with a single non-linear hidden layer.',
    analogy: 'Given enough small lego bricks (rectangles), you can build the curved silhouette of any sculpture.',
  },
  {
    term: 'KV-Cache',
    category: 'mechanisms',
    definition: 'In autoregressive Transformers, storing previously computed Key and Value matrices in GPU VRAM so earlier tokens do not need to be recomputed for every new generated token.',
    analogy: 'A blackboard keeping past lecture notes visible so the teacher doesn’t have to re-explain Chapter 1 on every slide.',
  },
  {
    term: 'Causal Masking',
    category: 'mechanisms',
    definition: 'An upper-triangular mask of -infinity applied to the attention logits, preventing future tokens from leaking information into past token representations during autoregressive text generation.',
    analogy: 'A reading blindfold that covers every word to the right of your finger as you read a mystery novel.',
  },
  {
    term: 'Selective State Space (Mamba)',
    category: 'mechanisms',
    definition: 'A mechanism in state-space models where transition parameters B and C are made dynamic functions of the current input token x_t, enabling content-based memory filtering.',
    analogy: 'An audio noise gate that automatically clamps shut during room static but opens wide when someone speaks a password.',
  },
  {
    term: 'Message Passing Neural Network (MPNN)',
    category: 'core',
    definition: 'A general algorithmic framework for Graph Neural Networks where node features are iteratively updated by aggregating messages from immediate neighboring nodes.',
    analogy: 'A neighborhood gossip circle where every person averages the opinions of their direct friends on each morning chat.',
  },
  {
    term: 'Permutation Invariance',
    category: 'math',
    definition: 'The property that reordering or relabeling the arbitrary index of nodes in a graph does not alter the output of the model.',
    analogy: 'Shuffling the names of players on a sports team roster doesn’t change which players pass the ball to each other on the field.',
  },
  {
    term: 'Denoising Score Matching',
    category: 'paradigms',
    definition: 'The training objective of diffusion models where a network learns to predict the gradient of the log-probability density (score function) by estimating the noise vector injected into a sample.',
    analogy: 'Looking at muddy footprints and guessing the exact direction and speed the runner was moving.',
  },
  {
    term: 'Mode Collapse',
    category: 'paradigms',
    definition: 'A pathology in Generative Adversarial Networks (GANs) where the Generator discovers one or two realistic samples that fool the Discriminator and repeatedly produces only those few samples.',
    analogy: 'A painter who only paints the exact same portrait of a golden retriever because the judge always gives it first prize.',
  },
  {
    term: 'Neural ODE (Ordinary Differential Equation)',
    category: 'paradigms',
    definition: 'A formulation that views network depth not as discrete stacked layers, but as a continuous time interval where hidden state dynamics are governed by dh(t)/dt = f(h(t), t, θ).',
    analogy: 'A smooth water slide where depth is continuous velocity rather than discrete floors in a building.',
  },
];
