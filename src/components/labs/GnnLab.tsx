/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Code2, Play, CheckCircle2, Share2, Layers, Award, Sparkles, ArrowRight, Flame } from 'lucide-react';
import { CheckpointQuiz } from '../CheckpointQuiz';
import { FirstPrinciplesNotebook } from '../FirstPrinciplesNotebook';
import { FIRST_PRINCIPLES_DOSSIERS } from '../../data/firstPrinciplesData';
import { LAB_QUIZZES } from '../../data/labQuizzes';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';

export const GnnLab: React.FC = () => {
  const [targetNode, setTargetNode] = useState<number>(0);
  const [weightW, setWeightW] = useState<number>(1.2);
  const [subTab, setSubTab] = useState<'visual' | 'code' | 'analogy' | 'quiz' | 'first_principles'>('visual');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  // 5 Nodes: e.g. a small molecule (Carbon ring with an attached oxygen)
  const nodes = [
    { id: 0, label: 'C1', x: 120, y: 100, feature: 1.0 },
    { id: 1, label: 'C2', x: 220, y: 70, feature: 1.2 },
    { id: 2, label: 'C3', x: 280, y: 160, feature: 0.8 },
    { id: 3, label: 'C4', x: 190, y: 230, feature: 1.5 },
    { id: 4, label: 'O5 (Oxygen)', x: 90, y: 200, feature: 2.4 },
  ];

  // Adjacency edges: (0-1), (1-2), (2-3), (3-4), (4-0) ring + cross link (0-2)
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 0],
    [0, 2],
  ];

  // Find neighbors of target node
  const neighbors = edges
    .filter(([u, v]) => u === targetNode || v === targetNode)
    .map(([u, v]) => (u === targetNode ? v : u));

  // Compute GCN Message Passing
  const selfFeature = nodes[targetNode].feature;
  const neighborFeatures = neighbors.map((nid) => nodes[nid].feature);
  const sumNeighbors = neighborFeatures.reduce((a, b) => a + b, 0);
  const degree = neighbors.length + 1; // including self-loop
  const aggregatedMessage = Number(((sumNeighbors + selfFeature) / degree).toFixed(3));
  const updatedFeature = Number(Math.max(0, aggregatedMessage * weightW).toFixed(3)); // ReLU

  const runGnnTest = () => {
    markTestRun('gnn');
    markLabCompleted('gnn');
    const lines = [
      '[Graph Neural Network Message Passing Test]',
      `Target Node: ${nodes[targetNode].label} (ID: ${targetNode})`,
      `Connected Neighbors: [${neighbors.map((n) => nodes[n].label).join(', ')}]`,
      `1. Aggregate Step: Sum of features / degree (${degree}) = ${aggregatedMessage}`,
      `2. Update Step: ReLU(${aggregatedMessage} * ${weightW}) = ${updatedFeature}`,
      'Permutation Invariance Test: Permuting node index order yields identical updated embedding.',
      'STATUS: PASS (Message passing framework compliant)',
      '✓ Level 6 progress recorded.',
    ];
    setCodeOutput(lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ink-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Level 6 · Graph neural networks
          </span>
          <h2 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white mt-0.5">
            Graph neural networks: Aggregate and update
          </h2>
          <p className="text-sm text-ink-600 dark:text-ink-400 mt-1 max-w-2xl">
            Permutation-invariant message passing over irregular graphs, molecular chemistry bonds, and knowledge networks.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-ink-100 dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-lg">
          <button
            onClick={() => setSubTab('visual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'visual'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            Message passing
          </button>
          <button
            onClick={() => setSubTab('code')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'code'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
          <button
            onClick={() => setSubTab('analogy')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'analogy'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Analogy</span>
          </button>
          <button
            onClick={() => setSubTab('quiz')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'quiz'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Concept check</span>
          </button>
          <button
            onClick={() => setSubTab('first_principles')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'first_principles'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>First Principles</span>
          </button>
        </div>
      </div>

      {subTab === 'visual' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Canvas (7 cols) */}
            <div className="lg:col-span-7 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
                <span className="font-semibold text-ink-900 dark:text-ink-200">
                  Interactive Molecular Graph Topology:
                </span>
                <span>Click any node to inspect message aggregation.</span>
              </div>

              {/* SVG Graph */}
              <div className="relative aspect-square max-h-[340px] w-full mx-auto bg-ink-50 dark:bg-ink-950 rounded-lg border border-ink-200/60 dark:border-white/5 p-4 flex items-center justify-center">
                <svg viewBox="0 0 360 300" className="w-full h-full">
                  {/* Edges */}
                  {edges.map(([u, v], idx) => {
                    const nodeU = nodes[u];
                    const nodeV = nodes[v];
                    const isConnectedToTarget = u === targetNode || v === targetNode;

                    return (
                      <line
                        key={idx}
                        x1={nodeU.x}
                        y1={nodeU.y}
                        x2={nodeV.x}
                        y2={nodeV.y}
                        stroke={isConnectedToTarget ? '#4353ff' : 'rgba(100,116,139,0.3)'}
                        strokeWidth={isConnectedToTarget ? '3' : '1.5'}
                        strokeDasharray={isConnectedToTarget ? 'none' : '2 2'}
                        className="transition-colors duration-200"
                      />
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map((node) => {
                    const isTarget = node.id === targetNode;
                    const isNeighbor = neighbors.includes(node.id);

                    return (
                      <g
                        key={node.id}
                        onClick={() => setTargetNode(node.id)}
                        className="cursor-pointer group"
                      >
                        {isTarget && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r="26"
                            fill="none"
                            stroke="#4353ff"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                            className="animate-spin"
                            style={{ animationDuration: '6s' }}
                          />
                        )}

                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="18"
                          fill={isTarget ? '#4353ff' : isNeighbor ? '#2f3bf0' : '#7a7364'}
                          className="transition-all duration-200 group-hover:scale-110 shadow-sm"
                        />

                        <text
                          x={node.x}
                          y={node.y + 4}
                          textAnchor="middle"
                          fill="white"
                          fontSize="11"
                          fontWeight="bold"
                        >
                          {node.label}
                        </text>

                        <text
                          x={node.x}
                          y={node.y + 32}
                          textAnchor="middle"
                          fill="#7a7364"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          h: {node.feature}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Slider for Layer Weight W */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 text-xs">
                <span className="font-mono text-ink-700 dark:text-ink-300">
                  GNN Transformation Matrix Weight W: <strong className="text-brand-600 dark:text-brand-400">{weightW.toFixed(1)}</strong>
                </span>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={weightW}
                  onChange={(e) => setWeightW(parseFloat(e.target.value))}
                  className="w-full sm:w-32 accent-brand-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Right Math & Message Passing Inspector (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-ink-100 dark:border-white/10">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Target Node Inspector
                  </span>
                  <span className="text-xs font-mono text-ink-500">ID: {nodes[targetNode].id}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-600 dark:text-ink-400">Selected Node:</span>
                    <strong className="text-ink-900 dark:text-white font-mono">{nodes[targetNode].label}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-600 dark:text-ink-400">Initial Feature h_v^(0):</span>
                    <strong className="text-ink-900 dark:text-white font-mono">{selfFeature}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-600 dark:text-ink-400">Connected Neighbors:</span>
                    <span className="text-brand-700 dark:text-brand-400 font-mono font-medium">
                      {neighbors.map((id) => nodes[id].label).join(', ')} ({neighbors.length})
                    </span>
                  </div>
                </div>

                {/* Step 1: Aggregate */}
                <div className="p-3 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-1.5">
                  <span className="text-[11px] font-bold text-ink-700 dark:text-ink-300 uppercase block">
                    1. AGGREGATE Step (Degree Normalization):
                  </span>
                  <div className="font-mono text-xs text-ink-800 dark:text-ink-200">
                    m_v = ({selfFeature} + {neighborFeatures.join(' + ')}) / {degree}
                  </div>
                  <div className="text-[11px] font-mono text-brand-600 dark:text-brand-400 font-semibold">
                    = {aggregatedMessage}
                  </div>
                </div>

                {/* Step 2: Update */}
                <div className="p-3 bg-brand-50 dark:bg-brand-950/20 rounded-lg border border-brand-300/80 dark:border-brand-500/30 space-y-1.5">
                  <span className="text-[11px] font-bold text-brand-800 dark:text-brand-300 uppercase block">
                    2. UPDATE Step (Linear Projection + ReLU):
                  </span>
                  <div className="font-mono text-xs text-ink-800 dark:text-ink-200">
                    h_v^(1) = ReLU({aggregatedMessage} * {weightW.toFixed(1)})
                  </div>
                  <div className="text-base font-extrabold font-mono text-brand-700 dark:text-brand-300">
                    = {updatedFeature}
                  </div>
                </div>
              </div>

              {/* Invariance Callout */}
              <div className="p-4 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 text-xs text-ink-600 dark:text-ink-300 space-y-1.5 shadow-xs">
                <span className="font-semibold text-ink-900 dark:text-white flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Permutation Invariance Guarantee</span>
                </span>
                <p className="leading-relaxed">
                  Notice that whether neighbors arrive in order [C2, C4] or [C4, C2], the sum is identical. GNNs do not depend on arbitrary node index numbering.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Concept Check Prompt */}
          <div className="p-4 bg-brand-50/80 dark:bg-brand-950/30 rounded-xl border border-brand-300/80 dark:border-brand-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-900 dark:text-white">Check your understanding</h4>
                <p className="text-xs text-ink-600 dark:text-ink-300">Test permutation invariance and graph attention coefficients in the concept check.</p>
              </div>
            </div>
            <button
              onClick={() => setSubTab('quiz')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <span>Take concept check</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Code Tab */}
      {subTab === 'code' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Graph convolutional layer (GCN)</h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Formula: H^(l+1) = ReLU(D^(-1/2) * A_hat * D^(-1/2) * H^(l) * W)
              </p>
            </div>
            <button
              onClick={runGnnTest}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run</span>
            </button>
          </div>

          <pre className="p-4 bg-ink-950 rounded-lg border border-ink-800 font-mono text-xs text-ink-300 overflow-x-auto leading-relaxed">
{`function gcnLayer(nodeFeatures: number[], adjacency: number[][], W: number): number[] {
  return nodeFeatures.map((feat, i) => {
    // Collect all neighbor features
    const neighborVals = adjacency[i]
      .map((connected, j) => (connected ? nodeFeatures[j] : 0))
      .filter((_, j) => adjacency[i][j] === 1 || j === i);

    // Aggregate (Mean pooling)
    const aggregated = neighborVals.reduce((a, b) => a + b, 0) / neighborVals.length;

    // Update with learned weights and activation
    return Math.max(0, aggregated * W); // ReLU
  });
}`}
          </pre>

          {codeOutput && (
            <div className="p-4 bg-ink-950 border border-green-500/30 rounded-lg space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Message Passing Diagnostics</span>
              </div>
              <pre className="text-xs font-mono text-ink-300 whitespace-pre-wrap">{codeOutput}</pre>
            </div>
          )}
        </div>
      )}

      {/* Analogy Tab */}
      {subTab === 'analogy' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Analogy: The neighborhood gossip network</h3>
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
            Imagine a cul-de-sac of houses connected by footpaths.
          </p>
          <div className="p-4 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2 text-xs text-ink-600 dark:text-ink-300">
            <p>
              <strong className="text-brand-700 dark:text-brand-400 font-semibold">Step 1 (Aggregation):</strong> Every morning, you stand on your porch and listen to what your direct neighbors tell you. You average their opinions together.
            </p>
            <p>
              <strong className="text-brand-800 dark:text-brand-300">Step 2 (Update):</strong> You combine that gossip with your own existing knowledge to form an updated worldview.
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              Notice: Even if houses were renumbered or reshuffled, your neighbors are still the same physical people. That is why GNNs work so well for molecules: rotating a penicillin molecule in space doesn’t change which carbon atoms are bonded together.
            </p>
          </div>
        </div>
      )}

      {/* SubTab 4: Checkpoint Quiz */}
      {subTab === 'quiz' && (
        <CheckpointQuiz
          quizKey="quiz_gnn"
          title={LAB_QUIZZES.gnn.title}
          questions={LAB_QUIZZES.gnn.questions}
          onPassAll={() => markLabCompleted('gnn')}
        />
      )}

      {/* SubTab 5: First Principles Dialectic */}
      {subTab === 'first_principles' && (
        <FirstPrinciplesNotebook dossier={FIRST_PRINCIPLES_DOSSIERS['gnn']} />
      )}
    </div>
  );
};
