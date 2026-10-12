/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SocraticQuestionGraphView:
 * An interactive, connected graph of first-principles inquiries linking
 * quantum electrons and physical bits to Python VMs, geometric manifolds,
 * gradients, language, memory buses, and frontier AI architectures.
 */

import React, { useState, useMemo } from 'react';
import {
  Network,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Compass,
  Cpu,
  Layers,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Share2,
  Atom,
  Flame,
  Activity,
  Zap,
} from 'lucide-react';
import {
  SOCRATIC_QUESTION_NODES,
  QUESTION_REALMS,
  SocraticQuestionNode,
  QuestionRealm,
} from '../data/socraticQuestionGraphData';
import { MathView } from './MathView';
import { soundFX } from '../utils/audio';

interface SocraticQuestionGraphViewProps {
  onOpenLab?: (labId: string) => void;
  onOpenView?: (view: string) => void;
}

export const SocraticQuestionGraphView: React.FC<SocraticQuestionGraphViewProps> = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('q_electron');
  const [activeRealmFilter, setActiveRealmFilter] = useState<'all' | QuestionRealm>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGuidedMode, setIsGuidedMode] = useState<boolean>(false);
  const [historyTrail, setHistoryTrail] = useState<string[]>(['q_electron']);

  const activeNode = useMemo(() => {
    return SOCRATIC_QUESTION_NODES.find((n) => n.id === selectedNodeId) || SOCRATIC_QUESTION_NODES[0];
  }, [selectedNodeId]);

  const filteredNodes = useMemo(() => {
    return SOCRATIC_QUESTION_NODES.filter((n) => {
      const matchesRealm = activeRealmFilter === 'all' || n.realm === activeRealmFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        n.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.oneLiner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.firstPrinciplesReality.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRealm && matchesSearch;
    });
  }, [activeRealmFilter, searchQuery]);

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setHistoryTrail((prev) => (prev[prev.length - 1] === nodeId ? prev : [...prev, nodeId]));
    soundFX.playTap();
  };

  const handleNextInGuided = () => {
    const currentIndex = SOCRATIC_QUESTION_NODES.findIndex((n) => n.id === selectedNodeId);
    if (currentIndex < SOCRATIC_QUESTION_NODES.length - 1) {
      handleSelectNode(SOCRATIC_QUESTION_NODES[currentIndex + 1].id);
    }
  };

  const handlePrevInGuided = () => {
    const currentIndex = SOCRATIC_QUESTION_NODES.findIndex((n) => n.id === selectedNodeId);
    if (currentIndex > 0) {
      handleSelectNode(SOCRATIC_QUESTION_NODES[currentIndex - 1].id);
    }
  };

  // SVG Dimensions & Graph Layout coordinates
  const svgWidth = 900;
  const svgHeight = 720;

  // Render curved edge between two nodes
  const renderEdge = (source: SocraticQuestionNode, target: SocraticQuestionNode) => {
    const isTraversed = selectedNodeId === source.id || selectedNodeId === target.id;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const cx1 = source.x + dx * 0.5;
    const cy1 = source.y;
    const cx2 = source.x + dx * 0.5;
    const cy2 = target.y;

    return (
      <g key={`${source.id}-${target.id}`}>
        <path
          d={`M ${source.x} ${source.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x} ${target.y}`}
          fill="none"
          stroke={isTraversed ? '#10b981' : '#64748b'}
          strokeWidth={isTraversed ? 2.5 : 1.2}
          strokeDasharray={isTraversed ? 'none' : '4 3'}
          className={`transition-all duration-300 ${isTraversed ? 'opacity-90' : 'opacity-25'}`}
        />
        {/* Direction marker dot */}
        <circle
          cx={(source.x + target.x) / 2}
          cy={(source.y + target.y) / 2}
          r={isTraversed ? 3.5 : 2}
          fill={isTraversed ? '#10b981' : '#64748b'}
          className={isTraversed ? 'animate-pulse' : 'opacity-30'}
        />
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-xs relative overflow-hidden transition-colors">
        <div className="max-w-4xl space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
            <Network className="w-4 h-4" />
            <span>Socratic First-Principles Graph</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              18 Interconnected Inquiries
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-ink-900 dark:text-white">
            The Ontological Inquiry Web: From Electron to Language & Memory Bus
          </h1>

          <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
            Every question in artificial intelligence connects unbroken to physical reality. Why do we need layers? Why vertical depth instead of horizontal width? What is a weight physically? What is language? Why is the memory bus the real bottleneck? Navigate the graph below to trace the exact chain of truth.
          </p>

          {/* Quick Stats & Controls Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <button
              onClick={() => setIsGuidedMode((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                isGuidedMode
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 border-ink-200 dark:border-white/10 hover:border-emerald-500/50'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isGuidedMode ? 'Guided Tour Active (Step-by-Step)' : 'Start Guided Golden Thread'}</span>
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-1 text-[11px] font-mono text-ink-500 dark:text-ink-400 overflow-x-auto no-scrollbar py-1">
              <span className="font-bold text-ink-700 dark:text-ink-300">Curiosity Path:</span>
              {historyTrail.slice(-4).map((id, idx) => {
                const node = SOCRATIC_QUESTION_NODES.find((n) => n.id === id);
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span>→</span>}
                    <button
                      onClick={() => handleSelectNode(id)}
                      className="hover:text-emerald-500 underline truncate max-w-[120px] cursor-pointer"
                    >
                      {node?.question.split('?')[0]}?
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 shadow-xs">
        {/* Realm Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveRealmFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeRealmFilter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            All Realms (18)
          </button>
          {QUESTION_REALMS.map((realm) => (
            <button
              key={realm.id}
              onClick={() => setActiveRealmFilter(realm.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeRealmFilter === realm.id
                  ? 'bg-ink-900 dark:bg-white text-white dark:text-ink-900'
                  : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: realm.color }} />
              <span>{realm.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions or physical concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-ink-200 dark:border-white/10 bg-ink-50 dark:bg-ink-950 text-ink-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
          />
        </div>
      </div>

      {/* Main Grid: Left Interactive SVG Graph Canvas | Right Deep Inquiry Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 6 cols: SVG Graph Map Canvas */}
        <div className="lg:col-span-6 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 p-4 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-ink-500 font-mono">
            <span className="font-bold text-ink-800 dark:text-ink-200">Interactive DAG Topology</span>
            <span>Click any node to explore reasoning chain</span>
          </div>

          <div className="w-full overflow-x-auto no-scrollbar border border-ink-200/60 dark:border-white/5 rounded-xl bg-ink-950 p-2 relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[650px] select-none"
            >
              <defs>
                <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Render All Graph Edges */}
              {SOCRATIC_QUESTION_NODES.map((sourceNode) => {
                return sourceNode.connectedQuestionIds.map((targetId) => {
                  const targetNode = SOCRATIC_QUESTION_NODES.find((n) => n.id === targetId);
                  if (!targetNode) return null;
                  return renderEdge(sourceNode, targetNode);
                });
              })}

              {/* Render All Question Nodes */}
              {SOCRATIC_QUESTION_NODES.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isMatch = filteredNodes.some((fn) => fn.id === node.id);

                return (
                  <g
                    key={node.id}
                    onClick={() => handleSelectNode(node.id)}
                    className="cursor-pointer transition-all duration-300"
                    opacity={isMatch ? 1 : 0.25}
                  >
                    {/* Active Halo Pulse */}
                    {isSelected && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="34"
                        fill="url(#nodeGlow)"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node Core Circle */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 22 : 17}
                      fill={isSelected ? node.realmColor : '#1e293b'}
                      stroke={node.realmColor}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="transition-all"
                    />

                    {/* Node Number or Icon representation */}
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : node.realmColor}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {node.id.replace('q_', '').slice(0, 3).toUpperCase()}
                    </text>

                    {/* Node Label Below */}
                    <text
                      x={node.x}
                      y={node.y + 32}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                      className="pointer-events-none"
                    >
                      {node.question.length > 25 ? `${node.question.slice(0, 24)}...` : node.question}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Guided Mode Stepper Bar */}
          {isGuidedMode && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <button
                onClick={handlePrevInGuided}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-ink-800 text-ink-800 dark:text-white font-bold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev Question</span>
              </button>
              <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                Question {SOCRATIC_QUESTION_NODES.findIndex((n) => n.id === selectedNodeId) + 1} of {SOCRATIC_QUESTION_NODES.length}
              </span>
              <button
                onClick={handleNextInGuided}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 text-white font-bold cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right 6 cols: Deep Socratic Dossier Card */}
        <div className="lg:col-span-6 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 p-6 shadow-xs space-y-6">
          {/* Header & Realm */}
          <div className="border-b border-ink-200/60 dark:border-white/10 pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                style={{
                  color: activeNode.realmColor,
                  borderColor: `${activeNode.realmColor}40`,
                  backgroundColor: `${activeNode.realmColor}10`,
                }}
              >
                {activeNode.realmLabel}
              </span>

              <span className="text-[11px] font-mono text-ink-400">
                Node ID: {activeNode.id}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-display text-ink-900 dark:text-white">
              {activeNode.question}
            </h2>

            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 italic">
              "{activeNode.oneLiner}"
            </p>
          </div>

          {/* Section 1: The Naive Misconception */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              The Common Naive Misconception
            </span>
            <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
              {activeNode.naiveMisconception}
            </p>
          </div>

          {/* Section 2: Ground-Truth First-Principles Reality */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-ink-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              First-Principles Mathematical Reality
            </h3>

            <p className="text-xs sm:text-sm text-ink-700 dark:text-ink-300 leading-relaxed bg-ink-50 dark:bg-ink-800/40 p-4 rounded-xl border border-ink-200/60 dark:border-white/5">
              {activeNode.firstPrinciplesReality}
            </p>

            {/* Formula Box if Present */}
            {activeNode.mathematicalEquation && (
              <div className="bg-ink-950 border border-ink-800 rounded-xl p-4 text-center font-mono space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-ink-400 tracking-wider">
                  Governing Formal Invariant
                </div>
                <div className="text-brand-300 text-sm sm:text-base font-bold py-1 overflow-x-auto no-scrollbar">
                  <MathView math={activeNode.mathematicalEquation} display={true} className="text-brand-300" />
                </div>
              </div>
            )}
          </div>

          {/* Section 3: The Silicon Reality (Electrons & Memory Buses) */}
          <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950/70 border border-ink-200 dark:border-white/5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-mono">
              <Cpu className="w-3.5 h-3.5" />
              Inside the Silicon: What Electrons & Memory Buses Are Doing
            </span>
            <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
              {activeNode.siliconReality}
            </p>
          </div>

          {/* Section 4: Outgoing Links (Follow the Inquiry Thread) */}
          <div className="space-y-2.5 pt-2 border-t border-ink-200/60 dark:border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 font-mono block">
              Connected Next Questions in the Reasoning Chain:
            </span>

            <div className="flex flex-wrap gap-2">
              {activeNode.connectedQuestionIds.map((targetId) => {
                const targetNode = SOCRATIC_QUESTION_NODES.find((n) => n.id === targetId);
                if (!targetNode) return null;
                return (
                  <button
                    key={targetId}
                    onClick={() => handleSelectNode(targetId)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/30 text-ink-900 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-xs font-semibold transition-all cursor-pointer shadow-2xs group"
                  >
                    <span>{targetNode.question}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Researcher Reflection Sandbox */}
          <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              Open Frontier Reflection Prompt
            </span>
            <p className="text-xs text-ink-800 dark:text-ink-200 leading-relaxed italic">
              "{activeNode.researcherReflectionPrompt}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
