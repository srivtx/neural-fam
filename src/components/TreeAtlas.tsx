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
        return 'text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/30 bg-brand-50 dark:bg-brand-500/10';
      case 'sequence':
        return 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10';
      case 'attention':
        return 'text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-500/10';
      case 'ssm':
        return 'text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-500/30 bg-brand-50 dark:bg-brand-500/10';
      case 'graph':
        return 'text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-500/30 bg-pink-50 dark:bg-pink-500/10';
      case 'generative':
        return 'text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-500/10';
      case 'specialized':
        return 'text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-500/10';
      default:
        return 'text-ink-600 dark:text-ink-400 border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 md:p-8 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-xs relative overflow-hidden transition-colors">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 font-mono">
            <Sparkles className="w-4 h-4" />
            <span>Taxonomy and lineage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-ink-900 dark:text-white">
            Neural network family tree
          </h1>
          <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
            Neural network architectures evolve through cross-pollination across topologies, structural mechanisms, and training paradigms. Explore each family below and inspect its mathematical formulation and hands-on laboratory.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-ink-500 dark:text-ink-400 font-mono">
            <span>7 architectural families</span>
            <span>·</span>
            <span>Interactive simulations</span>
            <span>·</span>
            <span>Runnable code examples</span>
          </div>
        </div>

        {/* Atlas View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-ink-100 dark:bg-ink-900/90 rounded-xl border border-ink-200 dark:border-white/10 text-xs mt-4 md:mt-6">
          <button
            onClick={() => setAtlasMode('both')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              atlasMode === 'both' ? 'bg-brand-600 text-white font-bold shadow-xs' : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            Full Atlas
          </button>
          <button
            onClick={() => setAtlasMode('graph_only')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              atlasMode === 'graph_only' ? 'bg-brand-600 text-white font-bold shadow-xs' : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            Graph View
          </button>
          <button
            onClick={() => setAtlasMode('cards_only')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              atlasMode === 'cards_only' ? 'bg-brand-600 text-white font-bold shadow-xs' : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
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
            <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Architecture catalog</h3>
            <span className="text-xs text-ink-500 dark:text-ink-400 font-mono">{filteredNodes.length} Models Loaded</span>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1 bg-surface dark:bg-ink-900/90 rounded-xl border border-ink-200 dark:border-white/10 shadow-xs">
            <Filter className="w-4 h-4 text-ink-400 ml-2 mr-1 shrink-0" />
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-brand-600 text-white font-bold shadow-xs'
                    : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
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
                      ? 'bg-brand-50/50 dark:bg-ink-850 border-brand-500 shadow-md'
                      : 'bg-surface dark:bg-ink-900 border-ink-200 dark:border-white/10 hover:border-ink-300 dark:hover:border-white/20 hover:bg-ink-50 dark:hover:bg-ink-850'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-brand-600 dark:text-brand-400">
                        {node.familyName}
                      </span>
                      {node.labAvailable && (
                        <span className="text-[11px] font-mono text-brand-600 dark:text-brand-400 flex items-center gap-1 font-semibold">
                          <Cpu className="w-3 h-3" />
                          <span>Interactive Lab</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {node.title}
                      </h3>
                      <p className="text-xs text-ink-600 dark:text-ink-300 mt-1 line-clamp-2 leading-relaxed">
                        {node.oneLiner}
                      </p>
                    </div>

                    {/* Mathematical Formula Banner */}
                    <div className="p-2.5 bg-ink-50 dark:bg-ink-950/90 rounded-lg border border-ink-200/60 dark:border-white/5 font-mono text-xs text-brand-700 dark:text-brand-300 truncate">
                      {node.mathFormula}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-ink-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-ink-500 dark:text-ink-400 line-clamp-1">
                      {node.threeQuestions.coreArchitecture}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLab(node.id);
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-md transition-colors whitespace-nowrap cursor-pointer shrink-0 shadow-xs"
                    >
                      <span>Open lab</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Node Detailed Flyout / Inspector */}
          {selectedNode && (
            <div className="p-6 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 space-y-5 shadow-xs transition-colors">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-ink-100 dark:border-white/10">
                <div>
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider font-mono">
                    Architecture profile
                  </span>
                  <h2 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white mt-0.5">{selectedNode.title}</h2>
                  <div className="text-xs text-ink-500 dark:text-ink-400 mt-1 flex items-center gap-2">
                    <span>{selectedNode.familyName}</span>
                    <span>·</span>
                    <span>{selectedNode.historicalContext}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenLab(selectedNode.id)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Open lab</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Analogy & Intuition */}
                <div className="p-4 bg-ink-50 dark:bg-ink-950/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-sans">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Intuitive analogy</span>
                  </h4>
                  <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
                    {selectedNode.analogy}
                  </p>
                </div>

                {/* Mathematical Breakdown */}
                <div className="p-4 bg-ink-50 dark:bg-ink-950/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2 font-mono text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400 font-sans">
                    Mathematical notation
                  </h4>
                  <div className="text-brand-800 dark:text-brand-300 font-bold mb-2">
                    {selectedNode.mathFormula}
                  </div>
                  <div className="space-y-1">
                    {selectedNode.mathBreakdown.map((item, idx) => (
                      <div key={idx} className="text-ink-600 dark:text-ink-300 text-[11px]">
                        <strong className="text-ink-900 dark:text-white">{item.symbol}:</strong> {item.meaning}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Key Ideas & Real World Examples */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1 text-xs">
                <div className="space-y-1.5">
                  <span className="font-semibold text-ink-800 dark:text-ink-200">Key architectural properties:</span>
                  <ul className="space-y-1 text-ink-600 dark:text-ink-400 list-disc list-inside">
                    {selectedNode.keyIdeas.map((idea, idx) => (
                      <li key={idx}>{idea}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <span className="font-semibold text-ink-800 dark:text-ink-200">Landmark implementations:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNode.examples.map((ex, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-ink-100 dark:bg-ink-900 border border-ink-200 dark:border-white/10 text-ink-700 dark:text-ink-300 font-mono text-[11px]"
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
