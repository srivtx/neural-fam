/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Network, ArrowRight, BookOpen, Cpu, Sparkles, Filter, ChevronRight, GitFork, LayoutGrid } from 'lucide-react';
import { NETWORK_NODES } from '../data/familyTreeData';
import { NetworkFamilyNode, FamilyCategory } from '../types';
import { InteractiveTreeCanvas } from './InteractiveTreeCanvas';

interface TreeAtlasProps {
  onOpenLab: (labId: string) => void;
}

export const TreeAtlas: React.FC<TreeAtlasProps> = ({ onOpenLab }) => {
  const [atlasMode, setAtlasMode] = useState<'both' | 'graph_only' | 'cards_only'>('both');
  const [activeFilter, setActiveFilter] = useState<'all' | FamilyCategory>('all');
  const [selectedNode, setSelectedNode] = useState<NetworkFamilyNode | null>(NETWORK_NODES[0]);

  const filteredNodes = activeFilter === 'all'
    ? NETWORK_NODES
    : NETWORK_NODES.filter((n) => n.family === activeFilter);

  const filterTabs: { id: 'all' | FamilyCategory; label: string }[] = [
    { id: 'all', label: 'All 7 Families' },
    { id: 'feedforward', label: 'Feedforward (MLP/CNN)' },
    { id: 'sequence', label: 'Sequence (RNN/LSTM)' },
    { id: 'attention', label: 'Transformers' },
    { id: 'ssm', label: 'State-Space (Mamba)' },
    { id: 'graph', label: 'Graph (GNN)' },
    { id: 'generative', label: 'Generative (Diffusion/VAE)' },
    { id: 'specialized', label: 'Frontiers (ODE/KAN)' },
  ];

  const getFamilyColor = (family: FamilyCategory) => {
    switch (family) {
      case 'feedforward':
        return 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10';
      case 'sequence':
        return 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10';
      case 'attention':
        return 'text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10';
      case 'ssm':
        return 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10';
      case 'graph':
        return 'text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-500/30 bg-pink-50 dark:bg-pink-500/10';
      case 'generative':
        return 'text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10';
      case 'specialized':
        return 'text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10';
      default:
        return 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 md:p-8 bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs relative overflow-hidden transition-colors">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
            <Sparkles className="w-4 h-4" />
            <span>Taxonomic Atlas of Neural Architectures</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            The Neural Network Family Tree
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            There is no single rigid taxonomy in AI research. Topologies, structural mechanisms, and training paradigms cross-pollinate. Explore every branch below—from the single neuron to modern Mamba and Diffusion—and jump into hands-on interactive labs.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>7 Core Architectural Families</span>
            <span>·</span>
            <span>Live Mathematical Simulators</span>
            <span>·</span>
            <span>Client-Side Code Scratchpads</span>
          </div>
        </div>

        {/* Atlas View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-white/10 text-xs mt-4 md:mt-6">
          <button
            onClick={() => setAtlasMode('both')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              atlasMode === 'both' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Full Atlas
          </button>
          <button
            onClick={() => setAtlasMode('graph_only')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              atlasMode === 'graph_only' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Graph View
          </button>
          <button
            onClick={() => setAtlasMode('cards_only')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              atlasMode === 'cards_only' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Card Catalog
          </button>
        </div>
      </div>

      {/* Render SVG Tree Graph */}
      {(atlasMode === 'both' || atlasMode === 'graph_only') && (
        <InteractiveTreeCanvas onSelectLab={onOpenLab} />
      )}

      {/* Filter Tabs & Cards if not graph_only */}
      {(atlasMode === 'both' || atlasMode === 'cards_only') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Architecture Catalog & Deep Profiles</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{filteredNodes.length} Models Loaded</span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1 bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs">
            <Filter className="w-4 h-4 text-slate-400 ml-2 mr-1 shrink-0" />
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Grid of Architecture Family Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const badgeClass = getFamilyColor(node.family);

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-xs ${
                    isSelected
                      ? 'bg-emerald-50/50 dark:bg-[#10192e] border-emerald-500 shadow-md'
                      : 'bg-white dark:bg-[#0c1220] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-[#0f172a]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${badgeClass}`}>
                        {node.familyName}
                      </span>
                      {node.labAvailable && (
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                          <Cpu className="w-3 h-3" />
                          <span>Lab Available</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {node.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {node.oneLiner}
                      </p>
                    </div>

                    {/* Mathematical Formula Banner */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950/90 rounded-lg border border-slate-200/60 dark:border-white/5 font-mono text-xs text-emerald-700 dark:text-emerald-300 truncate">
                      {node.mathFormula}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {node.threeQuestions.coreArchitecture}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLab(node.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-xs"
                    >
                      <span>Open Lab</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Node Detailed Flyout / Inspector */}
          {selectedNode && (
            <div className="p-6 bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 space-y-5 shadow-xs transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
                <div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
                    Architecture Blueprint Profile
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{selectedNode.title}</h2>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <span>{selectedNode.familyName}</span>
                    <span>·</span>
                    <span>{selectedNode.historicalContext}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenLab(selectedNode.id)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Launch Interactive Project Lab</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Analogy & Intuition */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-white/5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-sans">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Physical Mental Model (Intuitive Analogy)</span>
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedNode.analogy}
                  </p>
                </div>

                {/* Mathematical Breakdown */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-white/5 space-y-2 font-mono text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-sans">
                    Mathematical Symbols & Definitions
                  </h4>
                  <div className="text-emerald-800 dark:text-emerald-300 font-bold mb-2">
                    {selectedNode.mathFormula}
                  </div>
                  <div className="space-y-1">
                    {selectedNode.mathBreakdown.map((item, idx) => (
                      <div key={idx} className="text-slate-600 dark:text-slate-300 text-[11px]">
                        <strong className="text-slate-900 dark:text-white">{item.symbol}:</strong> {item.meaning}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Ideas & Real World Examples */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1 text-xs">
                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Key Architectural Invariants:</span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {selectedNode.keyIdeas.map((idea, idx) => (
                      <li key={idx}>{idea}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Real-World Landmark Implementations:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.examples.map((ex, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-mono text-[11px]"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
