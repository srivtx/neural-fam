/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowRight, Sparkles, Cpu, Layers } from 'lucide-react';
import { NETWORK_NODES } from '../data/familyTreeData';
import { useTheme } from '../context/ThemeContext';

interface InteractiveTreeCanvasProps {
  onSelectLab: (labId: string) => void;
}

interface TreeNode {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  color: string;
  parent?: string;
  labId?: string;
  formula: string;
  desc: string;
}

export const InteractiveTreeCanvas: React.FC<InteractiveTreeCanvasProps> = ({ onSelectLab }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeNodeId, setActiveNodeId] = useState<string>('perceptron');

  // Coordinates designed for a clean 1000 x 600 hierarchical SVG canvas
  const treeNodes: TreeNode[] = [
    // Root
    {
      id: 'root',
      name: 'Artificial Neural Networks',
      category: 'Root Paradigm',
      x: 100,
      y: 300,
      color: '#38bdf8',
      formula: 'y = f(W x + b)',
      desc: 'Trainable systems that learn mathematical transformations from empirical data.',
    },
    // Family Trunks (Level 1)
    {
      id: 'feedforward',
      name: 'Feedforward Networks',
      category: 'Family 1',
      x: 320,
      y: 110,
      color: '#10b981',
      parent: 'root',
      formula: 'No recurrent state loop',
      desc: 'Information flows unidirectionally from input to output.',
    },
    {
      id: 'sequence',
      name: 'Sequence & Recurrent',
      category: 'Family 2',
      x: 320,
      y: 220,
      color: '#f59e0b',
      parent: 'root',
      formula: 'h_t = f(h_{t-1}, x_t)',
      desc: 'Internal loops carry hidden state across ordered time-steps.',
    },
    {
      id: 'attention',
      name: 'Transformers & Attention',
      category: 'Family 3',
      x: 320,
      y: 330,
      color: '#06b6d4',
      parent: 'root',
      formula: 'Softmax(QKᵀ / √d) V',
      desc: 'Pairwise parallel self-attention replaces recurrent sequential bottlenecks.',
    },
    {
      id: 'ssm',
      name: 'State-Space Models',
      category: 'Family 4',
      x: 320,
      y: 430,
      color: '#fbbf24',
      parent: 'root',
      formula: 'h_(t+1) = Ah_t + Bx_t',
      desc: 'Discretized continuous dynamical systems with linear O(N) context scaling.',
    },
    {
      id: 'graph',
      name: 'Graph Neural Networks',
      category: 'Family 5',
      x: 320,
      y: 520,
      color: '#ec4899',
      parent: 'root',
      formula: 'UPDATE(AGGREGATE(N(v)))',
      desc: 'Permutation-invariant message passing across non-Euclidean topologies.',
    },

    // Specific Architecture Leaves (Level 2)
    // Under Feedforward
    {
      id: 'perceptron',
      name: 'Single Neuron / Perceptron',
      category: 'Level 0',
      x: 620,
      y: 70,
      color: '#10b981',
      parent: 'feedforward',
      labId: 'perceptron',
      formula: 'y = σ(Wx + b)',
      desc: 'Atomic unit with weights, bias spring, and 2D linear separation.',
    },
    {
      id: 'mlp',
      name: 'Multilayer Perceptron (MLP)',
      category: 'Level 1',
      x: 620,
      y: 110,
      color: '#10b981',
      parent: 'feedforward',
      labId: 'mlp',
      formula: 'h = ReLU(W₁x + b₁)',
      desc: 'Stacked hidden layers warp geometric space to solve non-linear XOR.',
    },
    {
      id: 'cnn_resnet',
      name: 'CNN & ResNet',
      category: 'Level 2',
      x: 620,
      y: 150,
      color: '#10b981',
      parent: 'feedforward',
      labId: 'cnn_resnet',
      formula: 'y = x + F(x)',
      desc: 'Sliding 2D convolution filters with residual skip express highways.',
    },

    // Under Sequence
    {
      id: 'rnn_lstm',
      name: 'RNN, LSTM & GRU',
      category: 'Level 3',
      x: 620,
      y: 220,
      color: '#f59e0b',
      parent: 'sequence',
      labId: 'rnn_lstm',
      formula: 'C_t = f_t · C_{t-1} + i_t · ~C_t',
      desc: 'Gated error carousels with forget/input/output valves.',
    },

    // Under Transformers
    {
      id: 'transformer',
      name: 'Decoder & Encoder Transformers',
      category: 'Level 4',
      x: 620,
      y: 330,
      color: '#06b6d4',
      parent: 'attention',
      labId: 'transformer',
      formula: 'GPT-4 / BERT / ViT / MoE',
      desc: 'Foundation of modern generative LLMs, multimodal, and vision transformers.',
    },

    // Under SSM
    {
      id: 'ssm_mamba',
      name: 'Mamba & Selective SSMs',
      category: 'Level 5',
      x: 620,
      y: 430,
      color: '#fbbf24',
      parent: 'ssm',
      labId: 'ssm_mamba',
      formula: 'B(x_t), C(x_t) + P-027 bounded state',
      desc: 'Input-dependent selective filtering with constant O(1) inference memory.',
    },

    // Under Graph
    {
      id: 'gnn',
      name: 'GCN, GAT & MPNN',
      category: 'Level 6',
      x: 620,
      y: 520,
      color: '#ec4899',
      parent: 'graph',
      labId: 'gnn',
      formula: 'H^(l+1) = σ(D^(-1/2) A D^(-1/2) H W)',
      desc: 'Molecular drug discovery, citation networks, and AlphaFold geometry.',
    },

    // Generative & Specialized (Level 3 Right Column)
    {
      id: 'generative',
      name: 'Diffusion, VAE & GAN',
      category: 'Level 7',
      x: 880,
      y: 260,
      color: '#c084fc',
      parent: 'transformer',
      labId: 'generative',
      formula: 'x_{t-1} = Denoise(x_t, ε_θ)',
      desc: 'Generative frameworks learning reverse entropy and score matching.',
    },
    {
      id: 'specialized',
      name: 'Neural ODEs & KANs',
      category: 'Level 8',
      x: 880,
      y: 420,
      color: '#38bdf8',
      parent: 'ssm_mamba',
      labId: 'specialized',
      formula: 'dh/dt = f(h, t, θ)',
      desc: 'Continuous depth vector fields, learnable edge splines, and neuromorphic spikes.',
    },
  ];

  const activeNode = treeNodes.find((n) => n.id === activeNodeId) || treeNodes[0];

  // Helper to draw smooth bezier curves between parent and child nodes
  const renderConnector = (parent: TreeNode, child: TreeNode) => {
    const midX = (parent.x + child.x) / 2;
    const path = `M ${parent.x} ${parent.y} C ${midX} ${parent.y}, ${midX} ${child.y}, ${child.x} ${child.y}`;
    const isActive = activeNodeId === child.id || activeNodeId === parent.id;

    return (
      <g key={`${parent.id}-${child.id}`}>
        <path
          d={path}
          fill="none"
          stroke={isActive ? child.color : 'rgba(255, 255, 255, 0.12)'}
          strokeWidth={isActive ? 2.5 : 1.2}
          strokeDasharray={isActive ? '6 6' : 'none'}
          className={isActive ? 'animate-synapse' : ''}
          opacity={isActive ? 1 : 0.6}
        />
      </g>
    );
  };

  return (
    <div className="bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Phylogenetic Map</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            Phylogenetic Tree of Neural Networks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click any node in the circuit below to trace its lineage, observe its governing transformation, and jump directly into its project lab.
          </p>
        </div>

        {activeNode.labId && (
          <button
            onClick={() => onSelectLab(activeNode.labId!)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Launch {activeNode.name} Lab</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full overflow-x-auto bg-slate-50 dark:bg-[#070b14] rounded-xl border border-slate-200/60 dark:border-white/5 p-4 flex items-center justify-center">
        <svg viewBox="0 0 1020 600" className="w-full min-w-[780px] max-w-[1020px] h-auto select-none">
          {/* Subtle background coordinate grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(100,116,139,0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1020" height="600" fill="url(#grid)" />

          {/* Connectors */}
          {treeNodes.map((child) => {
            if (!child.parent) return null;
            const parent = treeNodes.find((n) => n.id === child.parent);
            if (!parent) return null;
            return renderConnector(parent, child);
          })}

          {/* Tree Nodes */}
          {treeNodes.map((node) => {
            const isSelected = activeNodeId === node.id;
            const isLeaf = Boolean(node.labId);

            return (
              <g
                key={node.id}
                onClick={() => setActiveNodeId(node.id)}
                className="cursor-pointer group"
              >
                {/* Glow ring if selected */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isLeaf ? 22 : 28}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    className="animate-pulse"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isLeaf ? 14 : 18}
                  fill={isSelected ? node.color : (isDark ? '#0c1220' : '#ffffff')}
                  stroke={node.color}
                  strokeWidth={isSelected ? 2.5 : 2}
                  className="transition-all duration-200 shadow-sm"
                />

                {/* Node Label Card */}
                <text
                  x={node.x}
                  y={node.y - (isLeaf ? 18 : 24)}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize={isLeaf ? '11' : '12'}
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontWeight={isSelected ? 'bold' : '600'}
                  className="dark:fill-slate-100 transition-colors"
                >
                  {node.name}
                </text>

                <text
                  x={node.x}
                  y={node.y + (isLeaf ? 26 : 32)}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {node.category}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Summary Box */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: activeNode.color }} />
            <span className="font-bold text-slate-900 dark:text-white text-sm font-sans">{activeNode.name}</span>
            <span className="text-slate-500">[{activeNode.category}]</span>
          </div>
          <div className="text-slate-600 dark:text-slate-300 font-sans">{activeNode.desc}</div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs">
            {activeNode.formula}
          </div>
          {activeNode.labId && (
            <button
              onClick={() => onSelectLab(activeNode.labId!)}
              className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-sans transition-colors cursor-pointer shadow-xs"
            >
              Enter Lab
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
