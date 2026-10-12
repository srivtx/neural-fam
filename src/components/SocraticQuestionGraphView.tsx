/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SocraticQuestionGraphView:
 * An interactive, connected graph of 30 first-principles inquiries linking
 * quantum electrons and physical bits to Python VMs, geometric manifolds,
 * gradients, language, memory buses, and frontier AI architectures.
 *
 * Supports pan, zoom, split/full-canvas view modes, and deep chain-of-thought derivations.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
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
  ZoomIn,
  ZoomOut,
  Maximize2,
  Columns2,
  Move,
  Play,
  Terminal,
  Copy,
  Check,
  Clock,
  Code2,
} from 'lucide-react';
import {
  SOCRATIC_QUESTION_NODES,
  QUESTION_REALMS,
  SocraticQuestionNode,
  QuestionRealm,
} from '../data/socraticQuestionGraphData';
import { MathView } from './MathView';
import { soundFX } from '../utils/audio';
import {
  executePythonVerification,
  PythonVerificationResult,
} from '../utils/pyodideRunner';

type LayoutMode = 'split' | 'graph' | 'dossier';

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
  const [dossierTab, setDossierTab] = useState<'cot' | 'dossier' | 'python'>('cot');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');

  // Python Verification Proof State
  const [editedCode, setEditedCode] = useState<Record<string, string>>({});
  const [verificationResults, setVerificationResults] = useState<Record<string, PythonVerificationResult | null>>({});
  const [isRunningVerification, setIsRunningVerification] = useState<boolean>(false);
  const [executionStatus, setExecutionStatus] = useState<string>('');
  const [copiedCodeNodeId, setCopiedCodeNodeId] = useState<string | null>(null);

  // Pan & Zoom State for Canvas
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

  const currentProofCode = useMemo(() => {
    if (!activeNode.runnablePythonVerification) return '';
    return editedCode[activeNode.id] ?? activeNode.runnablePythonVerification.code;
  }, [activeNode, editedCode]);

  const currentResult = verificationResults[activeNode.id] ?? null;

  const handleRunVerification = async () => {
    if (!activeNode.runnablePythonVerification) return;
    setIsRunningVerification(true);
    setExecutionStatus('Initializing Python WebAssembly environment...');
    soundFX.playTap();

    try {
      const result = await executePythonVerification(
        currentProofCode,
        activeNode.id,
        (status) => setExecutionStatus(status)
      );
      setVerificationResults((prev) => ({
        ...prev,
        [activeNode.id]: result,
      }));
      if (!result.error) {
        soundFX.playSuccess();
      }
    } catch (err: any) {
      setVerificationResults((prev) => ({
        ...prev,
        [activeNode.id]: {
          output: '',
          executionTimeMs: 0,
          isFallback: false,
          error: err?.message || 'Execution error occurred.',
        },
      }));
    } finally {
      setIsRunningVerification(false);
      setExecutionStatus('');
    }
  };

  const handleResetProofCode = () => {
    if (!activeNode.runnablePythonVerification) return;
    setEditedCode((prev) => {
      const next = { ...prev };
      delete next[activeNode.id];
      return next;
    });
    soundFX.playTap();
  };

  const handleCopyProofCode = async () => {
    if (!currentProofCode) return;
    try {
      await navigator.clipboard.writeText(currentProofCode);
      setCopiedCodeNodeId(activeNode.id);
      soundFX.playTap();
      setTimeout(() => setCopiedCodeNodeId(null), 2000);
    } catch {
      // no-op
    }
  };

  // Zoom and Pan Handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2.8, parseFloat((prev + 0.2).toFixed(2))));
    soundFX.playTap();
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.45, parseFloat((prev - 0.2).toFixed(2))));
    soundFX.playTap();
  };

  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    soundFX.playTap();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom toward cursor
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom((prev) => Math.min(2.8, Math.max(0.45, parseFloat((prev * zoomFactor).toFixed(2)))));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStartRef.current.x,
      y: e.touches[0].clientY - dragStartRef.current.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const renderPythonVerificationPanel = () => {
    if (!activeNode.runnablePythonVerification) return null;
    const proof = activeNode.runnablePythonVerification;
    const isCustom = editedCode[activeNode.id] !== undefined && editedCode[activeNode.id] !== proof.code;

    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-ink-950 p-5 space-y-4 shadow-lg text-ink-100 animate-in fade-in duration-200">
        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Terminal className="w-3 h-3 text-emerald-400" />
                Python 3.12 (Wasm)
              </span>
              {isCustom && (
                <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  Modified
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>{proof.title}</span>
            </h3>
          </div>

          {/* Action buttons on header */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyProofCode}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ink-900 border border-ink-700 hover:border-ink-500 text-ink-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
              title="Copy code to clipboard"
            >
              {copiedCodeNodeId === activeNode.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {isCustom && (
              <button
                onClick={handleResetProofCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ink-900 border border-ink-700 hover:border-amber-500/50 text-amber-300 text-xs font-mono transition-all cursor-pointer"
                title="Reset code to original proof"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Expected Mathematical Insight Badge */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-400 font-mono block">
              Axiomatic Invariant Under Proof
            </span>
            <p className="leading-relaxed font-medium">{proof.expectedInsight}</p>
          </div>
        </div>

        {/* Code Editor Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-ink-400 px-1">
            <span className="flex items-center gap-1 text-ink-300">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>verification_proof.py</span>
            </span>
            <span className="text-[10px] text-ink-400">Editable In-Browser</span>
          </div>

          <div className="relative rounded-xl overflow-hidden border border-ink-800 bg-black/90 focus-within:border-emerald-500/60 transition-colors">
            <textarea
              value={currentProofCode}
              onChange={(e) =>
                setEditedCode((prev) => ({
                  ...prev,
                  [activeNode.id]: e.target.value,
                }))
              }
              rows={Math.min(18, Math.max(10, currentProofCode.split('\n').length + 1))}
              className="w-full bg-transparent p-3.5 font-mono text-xs text-emerald-300 dark:text-emerald-300 focus:outline-none resize-y leading-relaxed selection:bg-emerald-800/60 selection:text-white"
              spellCheck={false}
              placeholder="# Enter Python verification code..."
            />
          </div>
        </div>

        {/* Execution Controls & Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            onClick={handleRunVerification}
            disabled={isRunningVerification}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md cursor-pointer ${
              isRunningVerification
                ? 'bg-ink-800 text-ink-400 cursor-not-allowed border border-ink-700'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40 hover:shadow-emerald-900/60 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isRunningVerification ? (
              <>
                <Activity className="w-4 h-4 animate-spin text-emerald-400" />
                <span>{executionStatus || 'Running Python WebAssembly Sandbox...'}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Execute Verification Proof</span>
              </>
            )}
          </button>

          {/* Metrics Pills */}
          {currentResult && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ink-900 border border-ink-700 text-cyan-300">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{currentResult.executionTimeMs} ms</span>
              </span>

              <span
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border ${
                  currentResult.isFallback
                    ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {currentResult.isFallback ? '⚙️ JS Fallback Engine' : '⚡ Pyodide Wasm Sandbox'}
              </span>

              <span
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold ${
                  currentResult.error
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                }`}
              >
                {currentResult.error ? (
                  <>
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Error</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Verified</span>
                  </>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Execution Output & Verification Badge */}
        {(currentResult || isRunningVerification) && (
          <div className="space-y-3 pt-2">
            <div className="rounded-xl border border-ink-800 bg-black/95 overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-ink-800/80 bg-ink-900/60 text-[10px] font-mono text-ink-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 font-bold text-ink-300">STDOUT & MATHEMATICAL OUTPUT</span>
                </div>
                <span>Wasm Execution Console</span>
              </div>

              <div className="p-4 font-mono text-xs overflow-x-auto max-h-80 leading-relaxed no-scrollbar">
                {isRunningVerification ? (
                  <div className="flex items-center gap-2 text-ink-400 py-4 animate-pulse">
                    <Activity className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>{executionStatus || 'Executing mathematical verification in Pyodide WebAssembly runtime...'}</span>
                  </div>
                ) : currentResult?.error ? (
                  <div className="text-rose-400 whitespace-pre-wrap">
                    {currentResult.output && (
                      <div className="text-ink-300 mb-2">{currentResult.output}</div>
                    )}
                    <div className="p-2 rounded bg-rose-950/40 border border-rose-900 text-rose-300">
                      [PYTHON ERROR]: {currentResult.error}
                    </div>
                  </div>
                ) : (
                  <pre className="text-emerald-300 whitespace-pre font-mono">
                    {currentResult?.output || '(No output produced)'}
                  </pre>
                )}
              </div>
            </div>

            {/* Invariant Confirmed Badge */}
            {currentResult && !currentResult.error && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/40 text-emerald-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">
                  Axiomatic Invariant Mathematically Confirmed in Browser WebAssembly!
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
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

  // SVG Canvas dimensions with ample margins to prevent clipping
  const svgWidth = 1000;
  const svgHeight = 780;

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
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-xs relative overflow-hidden transition-colors">
        <div className="max-w-full space-y-3 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
              <Network className="w-4 h-4 shrink-0" />
              <span>Socratic First-Principles Graph</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                {SOCRATIC_QUESTION_NODES.length} Interconnected Inquiries
              </span>
            </div>

            {/* Layout Mode Selector (Split / Full Graph / Full Dossier) */}
            <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-950 p-1 rounded-xl border border-ink-200 dark:border-white/10 shrink-0">
              <button
                onClick={() => {
                  setLayoutMode('split');
                  soundFX.playTap();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  layoutMode === 'split'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
                title="Split View (Side-by-Side Canvas & Dossier)"
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split View</span>
              </button>

              <button
                onClick={() => {
                  setLayoutMode('graph');
                  soundFX.playTap();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  layoutMode === 'graph'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
                title="Maximize Graph View (Full-Width Canvas)"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Graph</span>
              </button>

              <button
                onClick={() => {
                  setLayoutMode('dossier');
                  soundFX.playTap();
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  layoutMode === 'dossier'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
                title="Dossier Reader Focus (Full-Width Text & Math)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dossier Focus</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-ink-900 dark:text-white break-words">
            The Ontological Inquiry Web: From Electron to Language & Memory Bus
          </h1>

          <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed max-w-4xl">
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
            <div className="flex items-center gap-1 text-[11px] font-mono text-ink-500 dark:text-ink-400 overflow-x-auto no-scrollbar py-1 max-w-full">
              <span className="font-bold text-ink-700 dark:text-ink-300 shrink-0">Curiosity Path:</span>
              {historyTrail.slice(-4).map((id, idx) => {
                const node = SOCRATIC_QUESTION_NODES.find((n) => n.id === id);
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="shrink-0">→</span>}
                    <button
                      onClick={() => handleSelectNode(id)}
                      className="hover:text-emerald-500 underline truncate max-w-[130px] cursor-pointer shrink-0"
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
            <span className="text-ink-400 font-semibold shrink-0">Fast Jump:</span>
            {landmarkCheckpoints.map((landmark) => (
              <button
                key={landmark.id}
                onClick={() => handleSelectNode(landmark.id)}
                className={`px-2.5 py-1 rounded-md border text-[11px] transition-all cursor-pointer whitespace-nowrap ${
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 shadow-xs max-w-full overflow-hidden">
        {/* Realm Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 max-w-full">
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
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: realm.color }} />
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-full">
        {/* Left Column: Interactive Pan/Zoom SVG Graph Canvas (shown in 'split' or 'graph' modes) */}
        {layoutMode !== 'dossier' && (
          <div
            className={`${
              layoutMode === 'graph' ? 'lg:col-span-12' : 'lg:col-span-6'
            } min-w-0 max-w-full bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 p-4 shadow-xs space-y-3 relative overflow-hidden`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-500 font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink-800 dark:text-ink-200">
                  Interactive DAG Topology (30 Nodes)
                </span>
                <span className="text-[11px] text-ink-400 hidden sm:inline">
                  • Drag to pan • Scroll to zoom
                </span>
              </div>

              {/* Pan & Zoom On-Canvas Controls */}
              <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-950 p-1 rounded-lg border border-ink-200 dark:border-white/10">
                <button
                  onClick={handleZoomIn}
                  className="p-1 rounded text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-800 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1 rounded text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-800 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-[10px] font-mono font-bold text-ink-500">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={handleResetView}
                  className="p-1 rounded text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-800 cursor-pointer"
                  title="Reset View (100% Origin)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLayoutMode(layoutMode === 'graph' ? 'split' : 'graph')}
                  className="p-1 rounded text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-800 cursor-pointer"
                  title={layoutMode === 'graph' ? 'Restore Split View' : 'Maximize Graph'}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Pan/Zoom SVG Viewport */}
            <div
              className={`w-full overflow-hidden border border-ink-200/60 dark:border-white/5 rounded-xl bg-ink-950 relative select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              } ${layoutMode === 'graph' ? 'h-[620px] sm:h-[700px]' : 'h-[520px] sm:h-[600px]'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-full block"
              >
                <defs>
                  <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </radialGradient>
                  {/* Subtle Spatial Coordinate Grid */}
                  <pattern id="graphGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path
                      d="M 50 0 L 0 0 0 50"
                      fill="none"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>

                {/* Spatial Grid Backdrop */}
                <rect width="100%" height="100%" fill="url(#graphGrid)" />

                {/* Transformed Content Group (Pan + Zoom) */}
                <g
                  transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
                  style={{ transformOrigin: '500px 390px', transition: isDragging ? 'none' : 'transform 0.15s ease-out' }}
                >
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectNode(node.id);
                        }}
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
                </g>
              </svg>

              {/* Floating Pan/Zoom Indicator Badge */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-ink-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 text-[10px] text-ink-300 font-mono pointer-events-none">
                <Move className="w-3 h-3 text-emerald-400" />
                <span>Pan: ({Math.round(pan.x)}, {Math.round(pan.y)}) • Zoom: {Math.round(zoom * 100)}%</span>
              </div>
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

            {/* In 'graph' Maximize Mode: Sleek Floating Quick Drawer for Active Node */}
            {layoutMode === 'graph' && (
              <div className="p-4 rounded-xl bg-ink-100 dark:bg-ink-950 border border-ink-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border"
                      style={{
                        color: activeNode.realmColor,
                        borderColor: `${activeNode.realmColor}40`,
                        backgroundColor: `${activeNode.realmColor}10`,
                      }}
                    >
                      {activeNode.realmLabel} • #{activeNode.stepNumber}
                    </span>
                    <h3 className="text-sm font-bold text-ink-900 dark:text-white truncate">
                      {activeNode.question}
                    </h3>
                  </div>
                  <p className="text-xs text-ink-600 dark:text-ink-300 italic line-clamp-1">
                    "{activeNode.oneLiner}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setLayoutMode('split')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <span>Inspect Deep Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Column: Deep Socratic Dossier & Chain of Thought (shown in 'split' or 'dossier' modes) */}
        {layoutMode !== 'graph' && (
          <div
            className={`${
              layoutMode === 'dossier' ? 'lg:col-span-12' : 'lg:col-span-6'
            } min-w-0 max-w-full bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 p-6 shadow-xs space-y-6 overflow-hidden`}
          >
            {/* Header & Realm */}
            <div className="border-b border-ink-200/60 dark:border-white/10 pb-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
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

                <div className="flex items-center gap-2">
                  {activeNode.runnablePythonVerification && (
                    <button
                      onClick={() => {
                        setDossierTab('python');
                        soundFX.playTap();
                      }}
                      className="flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                      title="Switch to live runnable Python Wasm proof"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Wasm Proof Ready</span>
                    </button>
                  )}
                  <span className="text-[11px] font-mono text-ink-400">
                    Node: {activeNode.id}
                  </span>
                  {layoutMode === 'dossier' && (
                    <button
                      onClick={() => setLayoutMode('split')}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:text-emerald-500 cursor-pointer"
                    >
                      ← Back to Split View
                    </button>
                  )}
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-display text-ink-900 dark:text-white break-words">
                {activeNode.question}
              </h2>

              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 italic break-words">
                "{activeNode.oneLiner}"
              </p>
            </div>

            {/* Dossier Mode Toggle Tabs */}
            <div className="flex items-center p-1 bg-ink-100 dark:bg-ink-950 rounded-xl border border-ink-200 dark:border-white/10 max-w-full overflow-hidden">
              <button
                onClick={() => {
                  setDossierTab('cot');
                  soundFX.playTap();
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                  dossierTab === 'cot'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Chain of Thought</span>
              </button>

              <button
                onClick={() => {
                  setDossierTab('dossier');
                  soundFX.playTap();
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                  dossierTab === 'dossier'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">First-Principles Dossier</span>
              </button>

              <button
                onClick={() => {
                  setDossierTab('python');
                  soundFX.playTap();
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                  dossierTab === 'python'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : activeNode.runnablePythonVerification
                    ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-extrabold'
                    : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  Python Proof (Wasm){activeNode.runnablePythonVerification ? ' •' : ''}
                </span>
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
                  <p className="text-xs sm:text-sm text-cyan-950 dark:text-cyan-200 leading-relaxed font-medium break-words">
                    {activeNode.chainOfThought.axiom}
                  </p>
                </div>

                {/* 2. The Unasked Question: The Overlooked Truth */}
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1.5 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5 font-mono">
                    <HelpCircle className="w-3.5 h-3.5" />
                    The Unasked Question (What Researchers Overlook)
                  </span>
                  <p className="text-xs sm:text-sm text-purple-950 dark:text-purple-100 font-bold leading-relaxed break-words">
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
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="break-words">{step.title}</span>
                        </div>

                        <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed break-words">
                          {step.description}
                        </p>

                        {step.formula && (
                          <div className="bg-ink-950 border border-ink-800 rounded-lg p-2.5 text-center font-mono my-1 overflow-x-auto no-scrollbar max-w-full">
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
                  <p className="leading-relaxed text-ink-200 break-words">
                    {activeNode.chainOfThought.siliconRegisterDetail}
                  </p>
                </div>

                {/* 5. Deep Intuition Quote */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-mono">
                    <Flame className="w-3.5 h-3.5" />
                    Core Intuitive Epiphany
                  </span>
                  <blockquote className="text-xs sm:text-sm text-ink-900 dark:text-amber-100 italic font-medium leading-relaxed break-words">
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
                  <p className="text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed font-medium break-words">
                    {activeNode.naiveMisconception}
                  </p>
                </div>

                {/* First-Principles Mathematical Reality */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-ink-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    First-Principles Physical & Mathematical Reality
                  </h3>

                  <p className="text-xs sm:text-sm text-ink-700 dark:text-ink-300 leading-relaxed bg-ink-50 dark:bg-ink-800/40 p-4 rounded-xl border border-ink-200/60 dark:border-white/5 break-words">
                    {activeNode.firstPrinciplesReality}
                  </p>

                  {/* Formula Box if Present */}
                  {activeNode.mathematicalEquation && (
                    <div className="bg-ink-950 border border-ink-800 rounded-xl p-4 text-center font-mono space-y-1.5 overflow-x-auto no-scrollbar max-w-full">
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
                  <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed break-words">
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
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 border border-sky-500/30 text-ink-900 dark:text-white hover:bg-sky-100 dark:hover:bg-sky-500/20 text-xs font-semibold transition-all cursor-pointer shadow-2xs group max-w-full"
                          >
                            <ArrowLeft className="w-3 h-3 text-sky-500 group-hover:-translate-x-0.5 transition-transform shrink-0" />
                            <span className="truncate">#{originNode.stepNumber}: {originNode.question}</span>
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
                  <p className="text-xs text-ink-800 dark:text-ink-200 leading-relaxed italic break-words">
                    "{activeNode.researcherReflectionPrompt}"
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: RUNNABLE PYTHON VERIFICATION (WASM) */}
            {dossierTab === 'python' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {activeNode.runnablePythonVerification ? (
                  renderPythonVerificationPanel()
                ) : (
                  <div className="p-6 rounded-2xl bg-ink-950 border border-ink-800 space-y-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white">
                        Select a Landmark Inquiry for Python Wasm Proof
                      </h3>
                      <p className="text-xs text-ink-400 max-w-md mx-auto">
                        This node does not have a dedicated landmark verification script. Select one of the 6 fundamental inquiries equipped with live in-browser WebAssembly proofs:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                      {SOCRATIC_QUESTION_NODES.filter((n) => n.runnablePythonVerification).map((ln) => (
                        <button
                          key={ln.id}
                          onClick={() => {
                            handleSelectNode(ln.id);
                            soundFX.playTap();
                          }}
                          className="p-3 rounded-xl bg-ink-900 border border-ink-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-xs transition-all cursor-pointer group"
                        >
                          <div className="font-bold text-white group-hover:text-emerald-400 flex items-center justify-between">
                            <span>#{ln.stepNumber}: {ln.id}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-ink-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <p className="text-[11px] text-ink-400 truncate mt-0.5">
                            {ln.runnablePythonVerification?.title}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Python Verification Panel in Dossier (When Available on COT or Dossier Tabs) */}
            {activeNode.runnablePythonVerification && dossierTab !== 'python' && (
              <div className="pt-2">
                {renderPythonVerificationPanel()}
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
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/30 text-ink-900 dark:text-white hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-xs font-semibold transition-all cursor-pointer shadow-2xs group max-w-full"
                    >
                      <span className="truncate">
                        #{targetNode.stepNumber}: {targetNode.question}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
