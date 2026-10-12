/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Cpu, Network, Sliders, Code2, ArrowRight, CornerDownLeft, Sparkles, BookOpen } from 'lucide-react';
import { NETWORK_NODES } from '../data/familyTreeData';
import { LAB_QUIZZES } from '../data/labQuizzes';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: 'home' | 'atlas' | 'labs' | 'taxonomy' | 'code' | 'synthesis' | 'epistemology') => void;
  onSelectLab: (labId: string) => void;
  onOpenGlossary: () => void;
  onOpenBadges: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'lab' | 'architecture' | 'feature' | 'quiz';
  action: () => void;
  badge?: string;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectView,
  onSelectLab,
  onOpenGlossary,
  onOpenBadges,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = useMemo<SearchItem[]>(() => {
    const list: SearchItem[] = [
      // Navigation items
      {
        id: 'nav-home',
        title: 'Home Overview',
        subtitle: 'Main hub, architectural hierarchy & learning stats',
        category: 'feature',
        action: () => {
          onSelectView('home');
          onClose();
        },
      },
      {
        id: 'nav-atlas',
        title: 'Interactive Tree Atlas',
        subtitle: 'P-027 evolutionary lineage graph with live SVG connections',
        category: 'feature',
        action: () => {
          onSelectView('atlas');
          onClose();
        },
      },
      {
        id: 'nav-matrix',
        title: '3-Question Selection Matrix',
        subtitle: 'Data structure, sequence length & compute requirements decision grid',
        category: 'feature',
        action: () => {
          onSelectView('taxonomy');
          onClose();
        },
      },
      {
        id: 'nav-synthesis',
        title: 'Architecture Synthesis Studio',
        subtitle: 'Invent new hybrid architectures from first principles (Beyond Memorization)',
        category: 'feature',
        badge: 'Invent Studio',
        action: () => {
          onSelectView('synthesis');
          onClose();
        },
      },
      {
        id: 'nav-code',
        title: 'Code Workshop',
        subtitle: 'PyTorch & JAX implementation reference and tensor verification',
        category: 'feature',
        action: () => {
          onSelectView('code');
          onClose();
        },
      },
      {
        id: 'nav-epistemology',
        title: 'Theory Thinking & Epistemology',
        subtitle: 'How to think like a theory inventor: from quantum electron mechanics to AI breakthroughs',
        category: 'feature',
        badge: 'First Principles',
        action: () => {
          onSelectView('epistemology');
          onClose();
        },
      },
      {
        id: 'feature-badges',
        title: 'Badges & Milestones',
        subtitle: 'View architectural achievements and level progress',
        category: 'feature',
        badge: 'Profile',
        action: () => {
          onOpenBadges();
          onClose();
        },
      },
      {
        id: 'feature-glossary',
        title: 'Architectural Glossary',
        subtitle: 'Searchable dictionary of deep learning terminology',
        category: 'feature',
        badge: 'Dictionary',
        action: () => {
          onOpenGlossary();
          onClose();
        },
      },

      // Project Labs (9 Levels)
      {
        id: 'lab-perceptron',
        title: 'Level 0: Single Neuron & Perceptron',
        subtitle: 'Linear boundary hyperplanes, weights, bias and step/sigmoid activations',
        category: 'lab',
        badge: 'Level 0',
        action: () => {
          onSelectLab('perceptron');
          onClose();
        },
      },
      {
        id: 'lab-mlp',
        title: 'Level 1: Multilayer Perceptron (MLP)',
        subtitle: 'Universal function approximation & non-linear geometric space warping',
        category: 'lab',
        badge: 'Level 1',
        action: () => {
          onSelectLab('mlp');
          onClose();
        },
      },
      {
        id: 'lab-cnn',
        title: 'Level 2: CNN & ResNet Identity Highways',
        subtitle: 'Convolutional feature maps, translation invariance & residual skip math',
        category: 'lab',
        badge: 'Level 2',
        action: () => {
          onSelectLab('cnn_resnet');
          onClose();
        },
      },
      {
        id: 'lab-rnn',
        title: 'Level 3: RNN & LSTM Memory Gates',
        subtitle: 'Recurrence loops, exploding gradients & forget/input/output valves',
        category: 'lab',
        badge: 'Level 3',
        action: () => {
          onSelectLab('rnn_lstm');
          onClose();
        },
      },
      {
        id: 'lab-transformer',
        title: 'Level 4: Transformer & Attention Matrix',
        subtitle: 'Query-Key-Value scaled dot products, causal masking & multi-head mixing',
        category: 'lab',
        badge: 'Level 4',
        action: () => {
          onSelectLab('transformer');
          onClose();
        },
      },
      {
        id: 'lab-ssm',
        title: 'Level 5: State-Space Models (Mamba & S4)',
        subtitle: 'Selective SSM continuous-state evolution, linear time complexity O(N)',
        category: 'lab',
        badge: 'Level 5',
        action: () => {
          onSelectLab('ssm_mamba');
          onClose();
        },
      },
      {
        id: 'lab-gnn',
        title: 'Level 6: Graph Neural Networks (GNN & GAT)',
        subtitle: 'Message passing, topological permutation invariance & adjacency aggregations',
        category: 'lab',
        badge: 'Level 6',
        action: () => {
          onSelectLab('gnn');
          onClose();
        },
      },
      {
        id: 'lab-generative',
        title: 'Level 7: Generative Models (Diffusion & GAN)',
        subtitle: 'Forward noise schedule, reverse step denoising & U-Net skip paths',
        category: 'lab',
        badge: 'Level 7',
        action: () => {
          onSelectLab('generative');
          onClose();
        },
      },
      {
        id: 'lab-specialized',
        title: 'Level 8: Specialized Paradigms (Neural ODEs & KANs)',
        subtitle: 'Continuous depth dynamics, learnable edge splines & modern architectures',
        category: 'lab',
        badge: 'Level 8',
        action: () => {
          onSelectLab('specialized');
          onClose();
        },
      },
    ];

    // Add nodes from NETWORK_NODES
    NETWORK_NODES.forEach((node) => {
      // Map node to lab ID
      let targetLab = 'perceptron';
      if (node.id === 'perceptron') targetLab = 'perceptron';
      else if (node.id === 'mlp') targetLab = 'mlp';
      else if (node.family === 'feedforward') targetLab = 'cnn_resnet';
      else if (node.family === 'sequence') targetLab = 'rnn_lstm';
      else if (node.family === 'attention') targetLab = 'transformer';
      else if (node.family === 'ssm') targetLab = 'ssm_mamba';
      else if (node.family === 'graph') targetLab = 'gnn';
      else if (node.family === 'generative') targetLab = 'generative';
      else if (node.family === 'specialized') targetLab = 'specialized';

      list.push({
        id: `arch-${node.id}`,
        title: `${node.title} (${node.familyName})`,
        subtitle: `${node.oneLiner} · ${node.mathFormula}`,
        category: 'architecture',
        badge: node.familyName,
        action: () => {
          onSelectLab(targetLab);
          onClose();
        },
      });
    });

    return list;
  }, [onSelectLab, onSelectView, onOpenBadges, onOpenGlossary, onClose]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items.slice(0, 10);
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        (item.badge && item.badge.toLowerCase().includes(q))
    ).slice(0, 12);
  }, [items, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-24 px-3 sm:px-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 max-w-xl w-full shadow-2xl overflow-hidden space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-ink-200 dark:border-white/10">
          <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search any architecture, formula, lab, or quiz (e.g. ResNet, Attention, Mamba, KAN)..."
            className="flex-1 bg-transparent text-sm text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-ink-100 dark:bg-ink-800 text-ink-500 border border-ink-200 dark:border-white/10">
            ESC
          </span>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto no-scrollbar p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-10 text-center text-ink-400 text-xs">
              No matching neural architectures found for "{query}".
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50 dark:bg-brand-500/20 text-ink-900 dark:text-white border border-brand-200 dark:border-brand-500/30'
                      : 'text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        item.category === 'lab'
                          ? 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300'
                          : item.category === 'architecture'
                          ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {item.category === 'lab' ? (
                        <Cpu className="w-3.5 h-3.5" />
                      ) : item.category === 'architecture' ? (
                        <Network className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate">{item.title}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ink-200/60 dark:bg-ink-800 text-ink-700 dark:text-ink-300 font-medium shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-400 dark:text-ink-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-opacity ${
                      isSelected ? 'opacity-100 text-brand-600 dark:text-brand-400' : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 bg-ink-50 dark:bg-ink-950 border-t border-ink-200 dark:border-white/10 text-[11px] text-ink-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-white/10 font-mono text-[9px]">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-white/10 font-mono text-[9px]">↵</kbd>
              <span>Select</span>
            </span>
          </div>
          <span className="text-[10px] font-mono text-brand-600 dark:text-brand-400">
            Quick Jump (Ctrl+K)
          </span>
        </div>
      </div>
    </div>
  );
};
