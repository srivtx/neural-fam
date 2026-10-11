/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Search, BookOpen, Sparkles } from 'lucide-react';
import { GLOSSARY_TERMS, GlossaryTerm } from '../data/glossaryData';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedCat, setSelectedCat] = useState<'all' | 'core' | 'mechanisms' | 'math' | 'paradigms'>('all');

  if (!isOpen) return null;

  const filteredTerms = GLOSSARY_TERMS.filter((t: GlossaryTerm) => {
    const matchesCat = selectedCat === 'all' || t.category === selectedCat;
    const matchesSearch =
      t.term.toLowerCase().includes(search.toLowerCase()) ||
      t.definition.toLowerCase().includes(search.toLowerCase()) ||
      t.analogy.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden shadow-2xl transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ink-200 dark:border-white/10 bg-ink-50/70 dark:bg-ink-850/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display tracking-tight text-base font-bold text-ink-900 dark:text-white">Neural architecture glossary</h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">Definitions and physical analogies for core machine learning concepts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-ink-400 hover:text-ink-700 dark:hover:text-white rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-ink-100 dark:border-white/5 bg-ink-50/50 dark:bg-ink-950/60 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search concepts, mechanisms, analogies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:border-brand-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pb-0.5">
            {(['all', 'core', 'mechanisms', 'math', 'paradigms'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap capitalize cursor-pointer font-medium ${
                  selectedCat === cat
                    ? 'bg-brand-600 text-white font-bold shadow-xs'
                    : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
              >
                {cat === 'all' ? 'All concepts' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filteredTerms.length === 0 ? (
            <div className="py-12 text-center text-xs text-ink-500 dark:text-ink-400">
              No matching terms found. Try searching for "residual", "attention", "mamba", or "gradient".
            </div>
          ) : (
            filteredTerms.map((term, i) => (
              <div
                key={i}
                className="p-4 bg-ink-50 dark:bg-ink-950 rounded-xl border border-ink-200/80 dark:border-white/5 space-y-2 hover:border-ink-300 dark:hover:border-white/15 transition-colors shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-ink-900 dark:text-white flex items-center gap-2">
                    <span>{term.term}</span>
                  </h4>
                  <span className="text-[10px] font-mono text-brand-700 dark:text-brand-400 uppercase px-2 py-0.5 rounded bg-brand-100/60 dark:bg-brand-500/10 border border-brand-300/60 dark:border-brand-500/20 font-semibold">
                    {term.category}
                  </span>
                </div>

                <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                  {term.definition}
                </p>

                <div className="p-2.5 bg-amber-50/60 dark:bg-ink-900/80 rounded-lg border border-amber-200/60 dark:border-white/5 text-xs text-amber-900 dark:text-amber-300/90 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">
                    <strong className="text-amber-800 dark:text-amber-400 font-semibold">Analogy: </strong>
                    {term.analogy}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
