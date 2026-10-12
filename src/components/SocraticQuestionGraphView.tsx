/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SocraticQuestionGraphView:
 * An interactive, connected graph of 30 first-principles inquiries linking
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
  GitCommit,
  CornerDownRight,
  FileText,
  Sigma,
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

export const SocraticQuestionGraphView: React.FC<SocraticQuestionGraphViewProps> = ({
  onOpenLab,
  onOpenView,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('q_wigner_math');
  const [activeRealmFilter, setActiveRealmFilter] = useState<'all' | QuestionRealm>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isGuidedMode, setIsGuidedMode] = useState<boolean>(false);
  const [historyTrail, setHistoryTrail] = useState<string[]>(['q_wigner_math']);
  const [dossierTab, setDossierTab] = useState<'cot' | 'dossier'>('cot');

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
        n.firstPrinciplesReality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.chainOfThought.unaskedQuestion.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRealm && matchesSearch;
    });
  }, [activeRealmFilter, searchQuery]);

  const realmCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    QUESTION_REALMS.forEach((r) => {
      counts[r.id] = SOCRATIC_QUESTION_NODES.filter((n) => n.realm === r.id).length;
    });
    return counts;
  }, []);

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

  // Landmark checkpoints for rapid navigation across the cognitive journey
  const landmarkCheckpoints = [
    { id: 'q_wigner_math', label: '1. Physics & Symmetry', realm: 'physics' },
    { id: 'q_program_vm', label: '4. Python VM & Bytecode', realm: 'computation' },
    { id: 'q_layer_math', label: '10. Origami Layers', realm: 'geometry' },
    { id: 'q_gradient_random', label: '16. High-Dim Gradients', realm: 'optimization' },
    { id: 'q_language_nature', label: '20. Language & Attention', realm: 'language' },
    { id: 'q_memory_bus', label: '25. Silicon Bus Wall', realm: 'hardware' },
  ];

  // SVG Dimensions & Graph Layout coordinates
  const svgWidth = 920;
  const svgHeight = 740;

  // Render curved edge between two nodes
  const renderEdge = (source: SocraticQuestionNode, target: SocraticQuestionNode) => {
    const isOutFromActive = selectedNodeId === source.id && target.originQuestionIds.includes(source.id);
    const isInToActive = selectedNodeId === target.id && source.connectedQuestionIds.includes(target.id);
    const isTraversed = isOutFromActive || isInToActive;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const cx1 = source.x + dx * 0.5;
    const cy1 = source.y;
    const cx2 = source.x + dx * 0.5;
    const cy2 = target.y;

    const strokeColor = isOutFromActive
      ? '#10b981' // glowing emerald outgoing
      : isInToActive
      ? '#0284c7' // sky blue incoming
      : '#64748b'; // standard edge

    return (
      <g key={`${source.id}-${target.id}`}>
        <path
          d={`M ${source.x} ${source.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x} ${target.y}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth={isTraversed ? 2.8 : 1.2}
          strokeDasharray={isTraversed ? 'none' : '4 3'}
          className={`transition-all duration-300 ${isTraversed ? 'opacity-95' : 'opacity-25'}`}
        />
        {/* Direction marker dot */}
        <circle
          cx={(source.x + target.x) / 2}
          cy={(source.y + target.y) / 2}
          r={isTraversed ? 3.5 : 2}
          fill={strokeColor}
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
              {SOCRATIC_QUESTION_NODES.length} Interconnected Inquiries
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-ink-900 dark:text-white">
            The Ontological Inquiry Web: From Electron to Language & Memory Bus
          </h1>

          <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
            Every question in artificial intelligence connects unbroken to physical reality: why electrons in silicon potential wells necessitate discrete bits, why Python VM bytecode differs from matrix weights, why vertical layers fold manifolds exponentially better than wide horizontal layers, why high-dimensional gradients defeat the curse of dimensionality, why human language is a serial bottleneck, and why the GPU memory bus bandwidth dictates LLM inference.
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
                      className="hover:text-emerald-500 underline truncate max-w-[130px] cursor-pointer"
                    >
                      #{node?.stepNumber}: {node?.question.split('?')[0]}?
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Landmark Fast-Jump Pills */}
          <div className="pt-2 border-t border-ink-200/60 dark:border-white/5 flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="text-ink-400 font-semibold">Fast Jump:</span>
            {landmarkCheckpoints.map((landmark) => (
              <button
                key={landmark.id}
                onClick={() => handleSelectNode(landmark.id)}
                className={`px-2.5 py-1 rounded-md border text-[11px] transition-all cursor-pointer ${
                  selectedNodeId === landmark.id
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                    : 'bg-ink-50 dark:bg-ink-800/60 text-ink-600 dark:text-ink-400 border-ink-200 dark:border-white/10 hover:border-emerald-500'
                }`}
              >
                {landmark.label}
              </button>
            ))}
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
            All Realms ({SOCRATIC_QUESTION_NODES.length})
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
              <span>
                {realm.label} ({realmCounts[realm.id] || 0})
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions or unasked inquiries..."
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
            <span className="font-bold text-ink-800 dark:text-ink-200">Interactive DAG Topology (30 Nodes)</span>
            <span>Click any node to explore reasoning chain</span>
          </div>

          <div className="w-full overflow-x-auto no-scrollbar border border-ink-200/60 dark:border-white/5 rounded-xl bg-ink-950 p-2 relative">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto min-w-[680px] select-none"
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
                    <title>{`#${node.stepNumber}: ${node.question}`}</title>

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

                    {/* Node Step Number inside circle */}
                    <text
                      x={node.x}
                      y={node.y + 4}
                      textAnchor="middle"
                      fill={isSelected ? '#ffffff' : node.realmColor}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {node.stepNumber}
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
                      {node.question.length > 24 ? `${node.question.slice(0, 23)}...` : node.question}
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
                Question {SOCRATIC_QUESTION_NODES.findIndex((n) => n.id === selectedNodeId) + 1} of{' '}
                {SOCRATIC_QUESTION_NODES.length}
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

        {/* Right 6 cols: Deep Socratic Dossier & Chain of Thought Card */}
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
                {activeNode.realmLabel} • Step {activeNode.stepNumber} of 30
              </span>

              <span className="text-[11px] font-mono text-ink-400">
                Node: {activeNode.id}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-display text-ink-900 dark:text-white">
              {activeNode.question}
            </h2>

            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 italic">
              "{activeNode.oneLiner}"
            </p>
          </div>

          {/* Dossier Mode Toggle Tabs */}
          <div className="flex items-center p-1 bg-ink-100 dark:bg-ink-950 rounded-xl border border-ink-200 dark:border-white/10">
            <button
              onClick={() => {
                setDossierTab('cot');
                soundFX.playTap();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dossierTab === 'cot'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chain of Thought & Unasked Derivations</span>
            </button>

            <button
              onClick={() => {
                setDossierTab('dossier');
                soundFX.playTap();
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                dossierTab === 'dossier'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>First-Principles Dossier & Silicon</span>
            </button>
          </div>

          {/* TAB 1: CHAIN OF THOUGHT & UNASKED DERIVATIONS */}
          {dossierTab === 'cot' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* 1. Foundational Axiom */}
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5 font-mono">
                  <Atom className="w-3.5 h-3.5" />
                  Foundational Physical / Epistemic Axiom
                </span>
                <p className="text-xs sm:text-sm text-cyan-950 dark:text-cyan-200 leading-relaxed font-medium">
                  {activeNode.chainOfThought.axiom}
                </p>
              </div>

              {/* 2. The Unasked Question: The Overlooked Truth */}
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1.5 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5 font-mono">
                  <HelpCircle className="w-3.5 h-3.5" />
                  The Unasked Question (What Researchers Overlook)
                </span>
                <p className="text-xs sm:text-sm text-purple-950 dark:text-purple-100 font-bold leading-relaxed">
                  "{activeNode.chainOfThought.unaskedQuestion}"
                </p>
              </div>

              {/* 3. Step-by-Step Derivation Chain */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-ink-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Sigma className="w-3.5 h-3.5 text-emerald-500" />
                  Mathematical & Mechanical Derivation Chain
                </h3>

                <div className="space-y-3">
                  {activeNode.chainOfThought.stepByStepDerivation.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-ink-50 dark:bg-ink-800/40 border border-ink-200/70 dark:border-white/5 space-y-2"
                    >
                      <div className="text-xs font-bold text-ink-900 dark:text-white flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold">
                          {idx + 1}
                        </span>
                        <span>{step.title}</span>
                      </div>

                      <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
                        {step.description}
                      </p>

                      {step.formula && (
                        <div className="bg-ink-950 border border-ink-800 rounded-lg p-2.5 text-center font-mono my-1 overflow-x-auto no-scrollbar">
                          <MathView math={step.formula} display={true} className="text-brand-300 text-xs sm:text-sm" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Silicon Register & Hardware Execution */}
              <div className="p-4 rounded-xl bg-ink-950 border border-ink-800 text-ink-300 space-y-1.5 font-mono text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Hardware Register & Memory Bus Reality
                </span>
                <p className="leading-relaxed text-ink-200">
                  {activeNode.chainOfThought.siliconRegisterDetail}
                </p>
              </div>

              {/* 5. Deep Intuition Quote */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-mono">
                  <Flame className="w-3.5 h-3.5" />
                  Core Intuitive Epiphany
                </span>
                <blockquote className="text-xs sm:text-sm text-ink-900 dark:text-amber-100 italic font-medium leading-relaxed">
                  "{activeNode.chainOfThought.deepIntuitionQuote}"
                </blockquote>
              </div>
            </div>
          )}

          {/* TAB 2: FIRST-PRINCIPLES DOSSIER & SILICON */}
          {dossierTab === 'dossier' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Naive Misconception */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  The Common Naive Misconception
                </span>
                <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed font-medium">
                  {activeNode.naiveMisconception}
                </p>
              </div>

              {/* First-Principles Mathematical Reality */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-ink-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  First-Principles Physical & Mathematical Reality
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

              {/* Silicon Reality: What Electrons & Buses Are Doing */}
              <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950/70 border border-ink-200 dark:border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-mono">
                  <Cpu className="w-3.5 h-3.5" />
                  Inside Silicon: Physical Transistors, Cache Lines & DRAM Buses
                </span>
                <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                  {activeNode.siliconReality}
                </p>
              </div>

              {/* Prerequisites (Origin Questions) */}
              {activeNode.originQuestionIds.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-ink-200/60 dark:border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500 font-mono flex items-center gap-1.5">
                    <ArrowLeft className="w-3 h-3 text-sky-500" />
                    Prerequisites in the Causal Reasoning Web:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeNode.originQuestionIds.map((originId) => {
                      const originNode = SOCRATIC_QUESTION_NODES.find((n) => n.id === originId);
                      if (!originNode) return null;
                      return (
                        <button
                          key={originId}
                          onClick={() => handleSelectNode(originId)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-500/30 text-ink-900 dark:text-white hover:bg-sky-100 dark:hover:bg-sky-500/20 text-xs font-semibold transition-all cursor-pointer shadow-2xs group"
                        >
                          <ArrowLeft className="w-3 h-3 text-sky-500 group-hover:-translate-x-0.5 transition-transform" />
                          <span>#{originNode.stepNumber}: {originNode.question}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Frontier Research Reflection Prompt */}
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
          )}

          {/* Connected Outgoing Next Questions (Always Available) */}
          <div className="space-y-2.5 pt-3 border-t border-ink-200/60 dark:border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1.5">
              <CornerDownRight className="w-3.5 h-3.5" />
              Connected Next Inquiries in the Reasoning Chain:
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
                    <span>
                      #{targetNode.stepNumber}: {targetNode.question}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
