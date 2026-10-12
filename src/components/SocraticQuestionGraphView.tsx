/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SocraticQuestionGraphView:
 * An interactive, connected graph of 50 first-principles inquiries linking
 * quantum electrons and physical bits to Python VMs, geometric manifolds,
 * gradients, language, memory buses, and frontier AI architectures.
 *
 * Supports pan, zoom, split/full-canvas view modes, and deep chain-of-thought derivations.
 */

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
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
  const [exploredNodeIds, setExploredNodeIds] = useState<Set<string>>(() => new Set(['q_wigner_math']));
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [dossierTab, setDossierTab] = useState<'cot' | 'dossier' | 'python'>('cot');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');

  // Canvas Viewport Ref
  const canvasContainerRef = useRef<HTMLDivElement>(null);

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
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1.0);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const activeNode = useMemo(() => {
    return SOCRATIC_QUESTION_NODES.find((n) => n.id === selectedNodeId) || SOCRATIC_QUESTION_NODES[0];
  }, [selectedNodeId]);

  // Focused causal neighborhood (active node + its immediate prerequisites and consequences)
  const activeNeighborIds = useMemo(() => {
    const focusId = hoveredNodeId || selectedNodeId;
    const node = SOCRATIC_QUESTION_NODES.find((n) => n.id === focusId);
    if (!node) return new Set<string>();
    return new Set<string>([
      ...node.connectedQuestionIds,
      ...node.originQuestionIds,
      node.id,
    ]);
  }, [selectedNodeId, hoveredNodeId]);

  const proofNodes = useMemo(() => {
    return SOCRATIC_QUESTION_NODES.filter((n) => !!n.runnablePythonVerification);
  }, []);

  const explorationPercentage = useMemo(() => {
    return Math.round((exploredNodeIds.size / SOCRATIC_QUESTION_NODES.length) * 100);
  }, [exploredNodeIds]);

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
    setExploredNodeIds((prev) => new Set([...prev, nodeId]));
    soundFX.playTap();
  };

  const handleUndoPath = () => {
    if (historyTrail.length > 1) {
      const newTrail = historyTrail.slice(0, -1);
      setHistoryTrail(newTrail);
      const prevId = newTrail[newTrail.length - 1];
      setSelectedNodeId(prevId);
      soundFX.playTap();
    }
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
    setZoom((prev) => Math.min(2.5, parseFloat((prev + 0.15).toFixed(2))));
    soundFX.playTap();
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.45, parseFloat((prev - 0.15).toFixed(2))));
    soundFX.playTap();
  };

  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    soundFX.playTap();
  };

  // Native wheel listener on canvas container: perfectly differentiates two-finger pan vs pinch zoom
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();

      // If user is pinching on trackpad (Mac sends e.ctrlKey = true on pinch) or holding Ctrl/Meta key:
      if (e.ctrlKey || e.metaKey) {
        const zoomSensitivity = 0.0035;
        const zoomDelta = -e.deltaY * zoomSensitivity;
        const clampedDelta = Math.max(-0.06, Math.min(0.06, zoomDelta));
        const factor = 1 + clampedDelta;

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setZoom((prevZoom) => {
          const nextZoom = Math.min(2.5, Math.max(0.45, parseFloat((prevZoom * factor).toFixed(3))));
          const ratio = nextZoom / prevZoom;
          setPan((prevPan) => ({
            x: Math.min(600, Math.max(-1000, mouseX - (mouseX - prevPan.x) * ratio)),
            y: Math.min(600, Math.max(-1000, mouseY - (mouseY - prevPan.y) * ratio)),
          }));
          return nextZoom;
        });
      } else {
        // Natural two-finger trackpad drag or wheel: Smooth, buttery Pan!
        const panSpeed = 0.75;
        setPan((prev) => ({
          x: Math.min(600, Math.max(-1000, prev.x - e.deltaX * panSpeed)),
          y: Math.min(600, Math.max(-1000, prev.y - e.deltaY * panSpeed)),
        }));
      }
    };

    container.addEventListener('wheel', onWheelNative, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheelNative);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: Math.min(600, Math.max(-1000, e.clientX - dragStartRef.current.x)),
      y: Math.min(600, Math.max(-1000, e.clientY - dragStartRef.current.y)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
      touchStartDistRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: Math.min(600, Math.max(-1000, e.touches[0].clientX - dragStartRef.current.x)),
        y: Math.min(600, Math.max(-1000, e.touches[0].clientY - dragStartRef.current.y)),
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = currentDist / touchStartDistRef.current;
      const targetZoom = Math.min(2.5, Math.max(0.45, parseFloat((touchStartZoomRef.current * scale).toFixed(2))));
      setZoom(targetZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
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
    { id: 'q_high_dim_geometry', label: '8. High-Dim Manifolds', realm: 'geometry' },
    { id: 'q_layer_math', label: '10. Origami Layers', realm: 'geometry' },
    { id: 'q_gradient_random', label: '16. High-Dim Gradients', realm: 'optimization' },
    { id: 'q_language_nature', label: '20. Language & Attention', realm: 'language' },
    { id: 'q_memory_bus', label: '25. Silicon Bus Wall', realm: 'hardware' },
    { id: 'q_diffusion_tweedie', label: '31. Tweedie Score', realm: 'physics' },
    { id: 'q_grokking_phase', label: '33. Grokking Transition', realm: 'optimization' },
    { id: 'q_rope_rotary', label: '34. Rotary Complex Plane', realm: 'language' },
    { id: 'q_speculative_decoding', label: '36. Speculative Invariance', realm: 'computation' },
    { id: 'q_double_descent_ntk', label: '40. Double Descent & NTK', realm: 'optimization' },
    { id: 'q_mu_transfer_maximal_update', label: '41. µP Scaling Invariance', realm: 'optimization' },
    { id: 'q_adam_second_moment_outliers', label: '42. AdamW Decoupled Decay', realm: 'optimization' },
    { id: 'q_circuit_complexity_tc0', label: '43. TC⁰ Scratchpad Barrier', realm: 'computation' },
    { id: 'q_the_grand_unification', label: '50. Grand Unification', realm: 'physics' },
  ];

  // SVG Canvas dimensions with ample margins to prevent clipping
  const svgWidth = 1100;
  const svgHeight = 1140;

  // Minimap dimensions
  const minimapWidth = 170;
  const minimapHeight = 176;

  const handleMinimapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const normX = Math.max(0, Math.min(1, clickX / rect.width));
    const normY = Math.max(0, Math.min(1, clickY / rect.height));
    const targetSvgX = normX * svgWidth;
    const targetSvgY = normY * svgHeight;

    const container = canvasContainerRef.current;
    const cw = container ? container.clientWidth : 600;
    const ch = container ? container.clientHeight : 500;

    setPan({
      x: cw / 2 - targetSvgX * zoom,
      y: ch / 2 - targetSvgY * zoom,
    });
    soundFX.playTap();
  };

  // Render curved edge between two nodes with Focal Spotlight filtering
  const renderEdge = (source: SocraticQuestionNode, target: SocraticQuestionNode) => {
    const focusId = hoveredNodeId || selectedNodeId;
    const isOutFromFocus = focusId === source.id && target.originQuestionIds.includes(source.id);
    const isInToFocus = focusId === target.id && source.connectedQuestionIds.includes(target.id);
    const isTraversed = isOutFromFocus || isInToFocus;
    const isConnectedToFocus = activeNeighborIds.has(source.id) && activeNeighborIds.has(target.id);

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const cx1 = source.x + dx * 0.5;
    const cy1 = source.y;
    const cx2 = source.x + dx * 0.5;
    const cy2 = target.y;

    const strokeColor = isOutFromFocus
      ? '#10b981' // glowing emerald outgoing
      : isInToFocus
      ? '#0284c7' // sky blue incoming
      : isConnectedToFocus
      ? '#64748b' // soft slate for neighbor edge
      : '#334155'; // faint ambient background edge

    const strokeWidth = isTraversed ? 2.5 : isConnectedToFocus ? 1.2 : 0.75;
    const opacity = isTraversed ? 0.95 : isConnectedToFocus ? 0.3 : 0.06;
    const edgePath = `M ${source.x} ${source.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${target.x} ${target.y}`;

    return (
      <g key={`${source.id}-${target.id}`}>
        <path
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={isTraversed ? 'none' : '3 3'}
          className="transition-all duration-300"
          opacity={opacity}
        />
        {/* Traversal Signal Marker and Flowing Particle */}
        {isTraversed && (
          <>
            <circle
              cx={(source.x + target.x) / 2}
              cy={(source.y + target.y) / 2}
              r={3}
              fill={strokeColor}
              className="animate-pulse"
            />
            <circle r="3.2" fill={strokeColor} opacity="0.9">
              <animateMotion path={edgePath} dur="2.2s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </g>
    );
  };

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-xs relative overflow-hidden transition-colors">
        <div className="max-w-full space-y-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
              <Network className="w-4 h-4 shrink-0" />
              <span>Socratic First-Principles Graph</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                {SOCRATIC_QUESTION_NODES.length} Interconnected Inquiries
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold hidden sm:inline">
                {proofNodes.length} Python Wasm Proofs
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
            The Ontological Inquiry Web: From Electron to Language, TC⁰ & Thermodynamic Unity
          </h1>

          <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed max-w-4xl">
            Every question in artificial intelligence connects unbroken to physical reality: why electrons in silicon potential wells necessitate discrete bits, why Python VM bytecode differs from continuous weights, why vertical layers fold manifolds exponentially better than wide horizontal layers, why high-dimensional gradients defeat the curse of dimensionality, why human language is a serial bottleneck, why the GPU memory bus bandwidth dictates LLM inference, and how non-equilibrium thermodynamics unifies predictive models of reality.
          </p>

          {/* Exploration Progress Meter Bar */}
          <div className="p-3 rounded-xl bg-ink-100/70 dark:bg-ink-950/70 border border-ink-200 dark:border-white/10 space-y-2">
            <div className="flex flex-wrap items-center justify-between text-xs font-mono gap-2">
              <span className="flex items-center gap-2 text-ink-700 dark:text-ink-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Exploration Trajectory:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {exploredNodeIds.size} of {SOCRATIC_QUESTION_NODES.length} Inquiries Explored
                </span>
              </span>
              <span className="text-ink-500 font-bold">{explorationPercentage}% Synthesized</span>
            </div>
            {/* Progress Bar Track */}
            <div className="w-full h-1.5 bg-ink-200 dark:bg-ink-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${explorationPercentage}%` }}
              />
            </div>
          </div>

          {/* Quick Stats & Controls Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
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

            {/* Breadcrumb Trail with Undo Button */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink-500 dark:text-ink-400 overflow-x-auto no-scrollbar py-1 max-w-full">
              <span className="font-bold text-ink-700 dark:text-ink-300 shrink-0">Curiosity Path:</span>
              {historyTrail.length > 1 && (
                <button
                  onClick={handleUndoPath}
                  className="px-1.5 py-0.5 rounded bg-ink-200 dark:bg-ink-800 hover:text-emerald-500 text-[10px] font-bold text-ink-600 dark:text-ink-300 cursor-pointer shrink-0"
                  title="Step Back in Curiosity Path"
                >
                  ↩ Step Back
                </button>
              )}
              {historyTrail.slice(-4).map((id, idx) => {
                const node = SOCRATIC_QUESTION_NODES.find((n) => n.id === id);
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="shrink-0 text-ink-400">→</span>}
                    <button
                      onClick={() => handleSelectNode(id)}
                      className={`hover:text-emerald-500 underline truncate max-w-[130px] cursor-pointer shrink-0 ${
                        selectedNodeId === id ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''
                      }`}
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
            <span className="text-ink-400 font-semibold shrink-0">Landmark Jumps:</span>
            {landmarkCheckpoints.map((landmark) => (
              <button
                key={landmark.id}
                onClick={() => handleSelectNode(landmark.id)}
                className={`px-2.5 py-1 rounded-md border text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                  selectedNodeId === landmark.id
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
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
                  Interactive DAG Topology ({SOCRATIC_QUESTION_NODES.length} Nodes)
                </span>
                <span className="text-[11px] text-ink-400 hidden sm:inline">
                  • Drag to pan • Scroll to zoom • Radar to navigate
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
                  onClick={() => setShowMinimap((prev) => !prev)}
                  className={`p-1 rounded cursor-pointer ${
                    showMinimap
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-800'
                  }`}
                  title={showMinimap ? 'Hide Radar Navigator' : 'Show Radar Navigator'}
                >
                  <Compass className="w-3.5 h-3.5" />
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
              ref={canvasContainerRef}
              className={`w-full overflow-hidden border border-ink-200/60 dark:border-white/5 rounded-xl bg-ink-950 relative select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              } ${layoutMode === 'graph' ? 'h-[620px] sm:h-[700px]' : 'h-[520px] sm:h-[600px]'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
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
                  <radialGradient id="realmGlowPhysics" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="realmGlowComputation" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="realmGlowGeometry" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="realmGlowOptimization" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="realmGlowLanguage" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="realmGlowHardware" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
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
                  style={{ transformOrigin: '550px 570px', transition: isDragging ? 'none' : 'transform 0.15s ease-out' }}
                >
                  {/* Constellation Realm Ambient Hulls */}
                  <ellipse cx="280" cy="100" rx="260" ry="90" fill="url(#realmGlowPhysics)" opacity="0.4" />
                  <ellipse cx="720" cy="100" rx="240" ry="90" fill="url(#realmGlowComputation)" opacity="0.4" />
                  <ellipse cx="500" cy="220" rx="460" ry="90" fill="url(#realmGlowGeometry)" opacity="0.35" />
                  <ellipse cx="500" cy="360" rx="460" ry="90" fill="url(#realmGlowOptimization)" opacity="0.35" />
                  <ellipse cx="500" cy="500" rx="460" ry="90" fill="url(#realmGlowLanguage)" opacity="0.35" />
                  <ellipse cx="500" cy="640" rx="460" ry="90" fill="url(#realmGlowHardware)" opacity="0.35" />
                  <ellipse cx="500" cy="780" rx="460" ry="90" fill="url(#realmGlowOptimization)" opacity="0.35" />
                  <ellipse cx="500" cy="920" rx="460" ry="90" fill="url(#realmGlowHardware)" opacity="0.35" />
                  <ellipse cx="530" cy="1040" rx="260" ry="80" fill="url(#realmGlowPhysics)" opacity="0.5" />

                  {/* Realm Typographic Faint Watermarks in Background */}
                  <text x="60" y="55" fill="rgba(6,182,212,0.07)" fontSize="16" fontFamily="monospace" fontWeight="bold" letterSpacing="4">PHYSICAL SUBSTRATE & POTENTIAL WELLS</text>
                  <text x="560" y="55" fill="rgba(59,130,246,0.07)" fontSize="16" fontFamily="monospace" fontWeight="bold" letterSpacing="4">BYTECODE & COMPUTATION</text>
                  <text x="60" y="195" fill="rgba(139,92,246,0.07)" fontSize="16" fontFamily="monospace" fontWeight="bold" letterSpacing="4">MANIFOLD GEOMETRY & TOPOLOGY</text>
                  <text x="60" y="335" fill="rgba(245,158,11,0.07)" fontSize="16" fontFamily="monospace" fontWeight="bold" letterSpacing="4">HIGH-DIM DYNAMICS & LOSS SURFACES</text>
                  <text x="60" y="475" fill="rgba(236,72,153,0.07)" fontSize="16" fontFamily="monospace" fontWeight="bold" letterSpacing="4">SEMANTIC TOPOLOGY & ATTENTION</text>
                  <text x="60" y="615" fill="rgba(16,185,129,0.07)" fontSize="16" fontFamily="monospace" fontWeight="bold" letterSpacing="4">SILICON BUS & HARDWARE WALL</text>
                  <text x="60" y="755" fill="rgba(245,158,11,0.07)" fontSize="16" fontFamily="monospace" fontWeight="bold" letterSpacing="4">OVERPARAMETERIZATION & NTK MANIFOLD</text>
                  <text x="60" y="895" fill="rgba(59,130,246,0.07)" fontSize="16" fontFamily="monospace" fontWeight="bold" letterSpacing="4">TC0 BOUNDS, REUSE & REVERSIBILITY</text>
                  <text x="240" y="1015" fill="rgba(6,182,212,0.12)" fontSize="18" fontFamily="monospace" fontWeight="bold" letterSpacing="6">THE GRAND UNIFICATION INVARIANT</text>

                  {/* Render All Graph Edges */}
                  {SOCRATIC_QUESTION_NODES.map((sourceNode) => {
                    return sourceNode.connectedQuestionIds.map((targetId) => {
                      const targetNode = SOCRATIC_QUESTION_NODES.find((n) => n.id === targetId);
                      if (!targetNode) return null;
                      return renderEdge(sourceNode, targetNode);
                    });
                  })}

                  {/* Render All Question Nodes with Focal Spotlight */}
                  {SOCRATIC_QUESTION_NODES.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const isHovered = hoveredNodeId === node.id;
                    const isNeighbor = activeNeighborIds.has(node.id) && !isSelected;
                    const isMatch = filteredNodes.some((fn) => fn.id === node.id);
                    const isExplored = exploredNodeIds.has(node.id);

                    const nodeRadius = isSelected ? 22 : isHovered ? 20 : isNeighbor ? 17 : 14;
                    const nodeOpacity = isMatch
                      ? isSelected || isHovered
                        ? 1
                        : isNeighbor
                        ? 0.9
                        : 0.4
                      : 0.12;

                    return (
                      <g
                        key={node.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectNode(node.id);
                        }}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer transition-all duration-300"
                        opacity={nodeOpacity}
                      >
                        <title>{`#${node.stepNumber}: ${node.question}`}</title>

                        {/* Active Halo Pulse */}
                        {(isSelected || isHovered) && (
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={nodeRadius + 14}
                            fill="url(#nodeGlow)"
                            className="animate-pulse opacity-70"
                          />
                        )}

                        {/* Node Core Circle */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={nodeRadius}
                          fill={isSelected ? node.realmColor : isHovered ? '#1e293b' : isNeighbor ? '#1e293b' : isExplored ? '#101726' : '#070b14'}
                          stroke={node.realmColor}
                          strokeWidth={isSelected ? 3 : isHovered ? 2.2 : isNeighbor ? 1.8 : 1}
                          className="transition-all duration-200"
                        />

                        {/* Node Step Number inside circle */}
                        <text
                          x={node.x}
                          y={node.y + 4}
                          textAnchor="middle"
                          fill={isSelected ? '#ffffff' : node.realmColor}
                          fontSize={isSelected ? '10' : '9'}
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {node.stepNumber}
                        </text>

                        {/* Node Label Below */}
                        <text
                          x={node.x}
                          y={node.y + (isSelected ? 34 : 28)}
                          textAnchor="middle"
                          fill={isSelected ? '#ffffff' : isNeighbor || isHovered ? '#e2e8f0' : '#64748b'}
                          fontSize={isSelected ? '9.5' : '8.5'}
                          fontFamily="sans-serif"
                          fontWeight={isSelected ? 'bold' : isNeighbor || isHovered ? '600' : 'normal'}
                          className="pointer-events-none select-none transition-all duration-200"
                        >
                          {node.question.length > 22 ? `${node.question.slice(0, 21)}...` : node.question}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* Interactive Radar Minimap Navigator Overlay */}
              {showMinimap && (
                <div className="absolute top-3 right-3 z-20 bg-ink-950/85 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-2xl space-y-1.5 pointer-events-auto">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-ink-300 px-0.5">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Compass className="w-3 h-3" />
                      <span>Radar Navigator</span>
                    </span>
                    <button
                      onClick={() => setShowMinimap(false)}
                      className="text-ink-500 hover:text-white px-1 cursor-pointer"
                      title="Minimize Radar"
                    >
                      ✕
                    </button>
                  </div>

                  <svg
                    width={minimapWidth}
                    height={minimapHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    onClick={handleMinimapClick}
                    className="rounded-lg bg-black/80 border border-ink-800 cursor-crosshair block"
                  >
                    {/* Simplified Minimap Edges */}
                    {SOCRATIC_QUESTION_NODES.map((sourceNode) => {
                      return sourceNode.connectedQuestionIds.map((targetId) => {
                        const targetNode = SOCRATIC_QUESTION_NODES.find((n) => n.id === targetId);
                        if (!targetNode) return null;
                        return (
                          <line
                            key={`mm-${sourceNode.id}-${targetId}`}
                            x1={sourceNode.x}
                            y1={sourceNode.y}
                            x2={targetNode.x}
                            y2={targetNode.y}
                            stroke="#475569"
                            strokeWidth="1.2"
                            opacity="0.35"
                          />
                        );
                      });
                    })}

                    {/* Minimap Node Dots */}
                    {SOCRATIC_QUESTION_NODES.map((n) => {
                      const isSel = n.id === selectedNodeId;
                      const isExplored = exploredNodeIds.has(n.id);
                      return (
                        <circle
                          key={`mm-dot-${n.id}`}
                          cx={n.x}
                          cy={n.y}
                          r={isSel ? 18 : isExplored ? 10 : 7}
                          fill={isSel ? '#ffffff' : n.realmColor}
                          stroke={isSel ? n.realmColor : 'none'}
                          strokeWidth={isSel ? 4 : 0}
                          opacity={isSel ? 1 : isExplored ? 0.9 : 0.45}
                        />
                      );
                    })}

                    {/* Real-time Viewport Camera Box */}
                    <rect
                      x={Math.max(0, -pan.x / zoom)}
                      y={Math.max(0, -pan.y / zoom)}
                      width={Math.min(svgWidth, (canvasContainerRef.current?.clientWidth || 600) / zoom)}
                      height={Math.min(svgHeight, (canvasContainerRef.current?.clientHeight || 500) / zoom)}
                      fill="rgba(16, 185, 129, 0.12)"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray="6 4"
                      className="pointer-events-none"
                    />
                  </svg>

                  <div className="flex items-center justify-between text-[9px] font-mono text-ink-400 px-0.5">
                    <span>Click anywhere to center</span>
                    <button
                      onClick={handleResetView}
                      className="text-emerald-400 hover:underline cursor-pointer"
                    >
                      Reset View
                    </button>
                  </div>
                </div>
              )}

              {/* Minimized Radar Toggle Button */}
              {!showMinimap && (
                <button
                  onClick={() => setShowMinimap(true)}
                  className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ink-950/80 backdrop-blur-md border border-white/10 text-[10px] font-mono font-bold text-emerald-400 hover:text-white cursor-pointer shadow-lg"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Radar</span>
                </button>
              )}

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
                  {activeNode.realmLabel} • Step {activeNode.stepNumber} of {SOCRATIC_QUESTION_NODES.length}
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
                  Python Proofs ({proofNodes.length}){activeNode.runnablePythonVerification ? ' •' : ''}
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
                          <div className="space-y-1.5 my-2">
                            <div className="bg-ink-950/90 border border-ink-800/80 rounded-xl p-3 text-center font-mono overflow-x-auto no-scrollbar max-w-full shadow-inner">
                              <MathView math={step.formula} display={true} className="text-brand-300 text-xs sm:text-sm" />
                            </div>
                            <div className="px-2 text-[10.5px] text-ink-400 font-sans flex items-start gap-1.5 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1" />
                              <span>
                                <strong className="text-ink-200">First-Principles Mandate:</strong> This mathematical step preserves metric scale and unbroken causal flow, preventing numerical saturation across layers.
                              </span>
                            </div>
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

                  {/* Formula Box with First-Principles Anatomy */}
                  {activeNode.mathematicalEquation && (
                    <div className="rounded-2xl border border-ink-800 bg-ink-950/85 p-4.5 space-y-3 font-mono text-xs shadow-lg">
                      <div className="flex items-center justify-between border-b border-ink-800/80 pb-2.5">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          Axiomatic Governing Invariant
                        </span>
                        <span className="text-[10px] text-ink-500 font-mono">Mathematical Bedrock</span>
                      </div>

                      <div className="text-brand-300 text-sm sm:text-base font-bold py-2 overflow-x-auto no-scrollbar text-center">
                        <MathView math={activeNode.mathematicalEquation} display={true} className="text-brand-300" />
                      </div>

                      {/* Deep First-Principles Intuition Breakdown */}
                      <div className="p-3.5 rounded-xl bg-ink-900/90 border border-ink-800/80 text-[11px] font-sans space-y-2 leading-relaxed text-ink-300">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[11px] uppercase tracking-wider">
                          <Sigma className="w-3.5 h-3.5" />
                          <span>Reading the Equation Through Physical Eyes</span>
                        </div>
                        <p className="text-ink-200 text-xs">
                          This equation is not arbitrary software syntax. It is the exact geometric conservation law required to preserve continuous dynamics across discrete physical registers:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                          <div className="p-2.5 rounded-lg bg-black/60 border border-ink-800 space-y-1">
                            <span className="text-cyan-400 font-bold block">1. The Dynamic Numerator:</span>
                            <span className="text-ink-300 font-sans">Drives directional signal accumulation along the steepest descent manifold or token attention affinity.</span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-black/60 border border-ink-800 space-y-1">
                            <span className="text-amber-400 font-bold block">2. The Scale Normalizer:</span>
                            <span className="text-ink-300 font-sans">Divides by dimension or variance to prevent softmax saturation, gradient explosion, and FP16 register overflow.</span>
                          </div>
                        </div>
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
                        This node does not have a dedicated landmark verification script. Select one of the {proofNodes.length} fundamental inquiries equipped with live in-browser WebAssembly proofs:
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
