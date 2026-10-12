/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * SubstrateRealityGraphView:
 * A dedicated first-principles epistemological page and sparse knowledge graph
 * answering fundamental "why" inquiries: from quantum electrons and why metal vs clay,
 * to voltages, capacitor charge storage, DRAM refresh, circuits as closed loops,
 * how moving charges do arithmetic, registers, why microcontrollers exist,
 * why monolithic chips must be tiny, what Python really is, and what computation itself is.
 *
 * Includes "The Cosmic Ladder of Scale" interactive continuum ($10^0\text{ m} \to 10^{-9}\text{ m}$).
 */

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  Atom,
  Zap,
  Cpu,
  Layers,
  Network,
  Database,
  Box,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Lightbulb,
  Sliders,
  Flame,
  Activity,
  CornerDownRight,
  Maximize2,
  Columns2,
  FileText,
  Sigma,
  Scale,
  Compass,
  HelpCircle,
  Share2,
  ExternalLink,
  Gauge,
} from 'lucide-react';
import {
  SUBSTRATE_REALITY_NODES,
  SUBSTRATE_REALMS,
  COSMIC_SCALE_LEVELS,
  SubstrateNode,
  SubstrateRealm,
  CosmicScaleLevel,
} from '../data/substrateRealityGraphData';
import { MathView } from './MathView';
import { soundFX } from '../utils/audio';
import {
  SubstratePhysicsSimCanvas,
  SubstrateSimStation,
} from './SubstratePhysicsSimCanvas';

type LayoutMode = 'split' | 'graph' | 'dossier' | 'cosmic_ladder' | 'simulators';

interface SubstrateRealityGraphViewProps {
  onOpenLab?: (labId: string) => void;
  onOpenView?: (view: string) => void;
}

export const SubstrateRealityGraphView: React.FC<SubstrateRealityGraphViewProps> = ({
  onOpenLab: _onOpenLab,
  onOpenView: _onOpenView,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('sub_electron');
  const [activeRealmFilter, setActiveRealmFilter] = useState<'all' | SubstrateRealm>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
  const [historyTrail, setHistoryTrail] = useState<string[]>(['sub_electron']);
  const [exploredNodeIds, setExploredNodeIds] = useState<Set<string>>(() => new Set(['sub_electron']));
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [selectedCosmicIndex, setSelectedCosmicIndex] = useState<number>(0);
  const [inspectorTab, setInspectorTab] = useState<'dossier' | 'simulator'>('dossier');

  // Canvas Viewport Ref
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom State for Canvas
  const [zoom, setZoom] = useState<number>(0.65);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 60, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1.0);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const activeNode = useMemo(() => {
    return (
      SUBSTRATE_REALITY_NODES.find((n) => n.id === selectedNodeId) ||
      SUBSTRATE_REALITY_NODES[0]
    );
  }, [selectedNodeId]);

  const activeCosmicLevel = useMemo(() => {
    return COSMIC_SCALE_LEVELS[selectedCosmicIndex] || COSMIC_SCALE_LEVELS[0];
  }, [selectedCosmicIndex]);

  const defaultStationForNode = useMemo((): SubstrateSimStation => {
    if (
      selectedNodeId === 'sub_charges_doing_math' ||
      selectedNodeId === 'sub_alu_opcodes' ||
      selectedNodeId === 'sub_bus_tristate' ||
      selectedNodeId === 'sub_pipeline_branch_prediction' ||
      selectedNodeId === 'sub_virtual_memory_tlb'
    ) {
      return 'full_adder';
    }
    if (selectedNodeId === 'sub_dram_ram' || selectedNodeId === 'sub_charge_storage') {
      return 'dram_leakage';
    }
    if (
      selectedNodeId === 'sub_registers_latches' ||
      selectedNodeId === 'sub_why_binary' ||
      selectedNodeId === 'sub_pll_frequency' ||
      selectedNodeId === 'sub_fpga_reconfigurable'
    ) {
      return 'bistable_latch';
    }
    if (
      selectedNodeId === 'sub_why_not_clay' ||
      selectedNodeId === 'sub_metal_bonding' ||
      selectedNodeId === 'sub_silicon_bandgap' ||
      selectedNodeId === 'sub_why_silicon_not_diamond' ||
      selectedNodeId === 'sub_sand_to_czochralski_ingot' ||
      selectedNodeId === 'sub_euv_photolithography'
    ) {
      return 'bandgap_comparison';
    }
    if (
      selectedNodeId === 'sub_cmos_complementary' ||
      selectedNodeId === 'sub_mosfet_field_effect' ||
      selectedNodeId === 'sub_logic_gates_switches' ||
      selectedNodeId === 'sub_voltage_definition' ||
      selectedNodeId === 'sub_pn_junction'
    ) {
      return 'cmos_inverter';
    }
    if (
      selectedNodeId === 'sub_hbm_memory_wall' ||
      selectedNodeId === 'sub_von_neumann_bottleneck' ||
      selectedNodeId === 'sub_gpu_vs_cpu_silicon' ||
      selectedNodeId === 'sub_transformer_silicon_tiling' ||
      selectedNodeId === 'sub_quantization_energy_mechanics' ||
      selectedNodeId === 'sub_processing_in_memory' ||
      selectedNodeId === 'sub_silicon_photonics_optical_interconnect' ||
      selectedNodeId === 'sub_interconnect_speed_of_light' ||
      selectedNodeId === 'sub_landauer_limit'
    ) {
      return 'roofline_memory_wall';
    }
    return 'cosmic_scale';
  }, [selectedNodeId]);

  // Causal neighborhood: active node + prerequisites + consequences
  const activeNeighborIds = useMemo(() => {
    const focusId = hoveredNodeId || selectedNodeId;
    const node = SUBSTRATE_REALITY_NODES.find((n) => n.id === focusId);
    if (!node) return new Set<string>();
    return new Set<string>([
      ...node.connectedIds,
      ...node.prerequisiteIds,
      node.id,
    ]);
  }, [selectedNodeId, hoveredNodeId]);

  const explorationPercentage = useMemo(() => {
    return Math.round((exploredNodeIds.size / SUBSTRATE_REALITY_NODES.length) * 100);
  }, [exploredNodeIds]);

  const filteredNodes = useMemo(() => {
    return SUBSTRATE_REALITY_NODES.filter((n) => {
      const matchesRealm = activeRealmFilter === 'all' || n.realm === activeRealmFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        n.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.oneLiner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.firstPrinciplesReality.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.siliconReality.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRealm && matchesSearch;
    });
  }, [activeRealmFilter, searchQuery]);

  // Select node with sound and history
  const handleSelectNode = useCallback((id: string) => {
    setSelectedNodeId(id);
    setHistoryTrail((prev) => (prev[prev.length - 1] === id ? prev : [...prev, id]));
    setExploredNodeIds((prev) => new Set([...prev, id]));
    soundFX.playTap();
  }, []);

  // Guided step forward / backward in causal sequence
  const handleStepSequence = useCallback(
    (direction: 'next' | 'prev') => {
      const currentIndex = SUBSTRATE_REALITY_NODES.findIndex((n) => n.id === selectedNodeId);
      if (currentIndex === -1) return;
      const targetIndex =
        direction === 'next'
          ? Math.min(SUBSTRATE_REALITY_NODES.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);
      const targetNode = SUBSTRATE_REALITY_NODES[targetIndex];
      handleSelectNode(targetNode.id);

      // Pan canvas toward new node with comfortable offset
      setPan({
        x: -targetNode.x * zoom + 400,
        y: -targetNode.y * zoom + 280,
      });
    },
    [selectedNodeId, zoom, handleSelectNode]
  );

  // Pan canvas drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-node')) return;
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

  // Mobile Touch pan (1-finger) and pinch-zoom (2-finger)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if ((e.target as HTMLElement).closest('.interactive-node')) return;
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
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = currentDist / touchStartDistRef.current;
      const targetZoom = Math.min(1.8, Math.max(0.45, parseFloat((touchStartZoomRef.current * scale).toFixed(2))));
      setZoom(targetZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Damped trackpad wheel pan & pinch zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // Pinch to zoom
      const zoomFactor = -e.deltaY * 0.0012;
      const clampedDelta = Math.max(-0.025, Math.min(0.025, zoomFactor));
      setZoom((prev) => Math.min(1.8, Math.max(0.45, prev + clampedDelta)));
    } else {
      // Damped two-finger pan
      const panDamping = 0.38;
      const dx = Math.max(-40, Math.min(40, -e.deltaX * panDamping));
      const dy = Math.max(-40, Math.min(40, -e.deltaY * panDamping));
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    }
  }, []);

  const handleResetView = () => {
    setZoom(0.65);
    setPan({ x: 60, y: 30 });
    soundFX.playTap();
  };

  // SVG coordinate bounding box
  const graphBounds = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    SUBSTRATE_REALITY_NODES.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });
    return {
      minX: minX - 140,
      maxX: maxX + 260,
      minY: minY - 100,
      maxY: maxY + 220,
      width: maxX - minX + 400,
      height: maxY - minY + 320,
    };
  }, []);

  const handleFitView = useCallback(() => {
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const padding = 50;
    const scaleX = (rect.width - padding * 2) / graphBounds.width;
    const scaleY = (rect.height - padding * 2) / graphBounds.height;
    const fitZoom = Math.min(1.0, Math.max(0.32, Math.min(scaleX, scaleY)));
    const centerX = rect.width / 2 - (graphBounds.minX + graphBounds.width / 2) * fitZoom;
    const centerY = rect.height / 2 - (graphBounds.minY + graphBounds.height / 2) * fitZoom;
    setZoom(parseFloat(fitZoom.toFixed(2)));
    setPan({ x: Math.round(centerX), y: Math.round(centerY) });
    soundFX.playTap();
  }, [graphBounds]);

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* ========================================================= */}
      {/* TOP HERO BANNER: The Epistemic Reductionist Manifest      */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink-900 via-ink-950 to-brand-950/80 border border-ink-800 text-white p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider font-semibold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Atom className="w-3.5 h-3.5 animate-spin-slow" />
                Pure Scratch Epistemology
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Zap className="w-3.5 h-3.5" />
                Substrate & Reality Graph
              </span>
              <span className="text-xs text-ink-400 font-mono">
                {exploredNodeIds.size} / {SUBSTRATE_REALITY_NODES.length} Inquiries Grounded ({explorationPercentage}%)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              The Cosmic Substrate of Computation
            </h1>
            <p className="text-xs sm:text-sm text-ink-300 leading-relaxed">
              Information is physical. A thought in an LLM is not an ethereal abstraction; it is electrical charge flowing through sculpted silicon potential wells. From why metals conduct and clay cannot, to voltage as field work, capacitor leakage, and why monolithic chips must be nanometers small.
            </p>
          </div>

          {/* Quick Mode Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 bg-ink-950/80 p-1.5 rounded-xl border border-white/10 shrink-0">
            <button
              onClick={() => {
                setLayoutMode('split');
                soundFX.playTap();
              }}
              title="Split View: Graph Canvas & Socratic Dossier"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                layoutMode === 'split'
                  ? 'bg-brand-600 text-white font-bold shadow-xs'
                  : 'text-ink-400 hover:text-white'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>

            <button
              onClick={() => {
                setLayoutMode('graph');
                soundFX.playTap();
              }}
              title="Full Canvas Graph Mode"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                layoutMode === 'graph'
                  ? 'bg-brand-600 text-white font-bold shadow-xs'
                  : 'text-ink-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Graph</span>
            </button>

            <button
              onClick={() => {
                setLayoutMode('dossier');
                soundFX.playTap();
              }}
              title="Reading Dossier Mode"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                layoutMode === 'dossier'
                  ? 'bg-brand-600 text-white font-bold shadow-xs'
                  : 'text-ink-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>All Inquiries</span>
            </button>

            <button
              onClick={() => {
                setLayoutMode('cosmic_ladder');
                soundFX.playSuccess();
              }}
              title="The Cosmic Ladder of Scale (10⁰ m → 10⁻⁹ m)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                layoutMode === 'cosmic_ladder'
                  ? 'bg-gradient-to-r from-cyan-600 to-brand-600 text-white font-bold shadow-xs ring-1 ring-cyan-400'
                  : 'text-cyan-400 hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-cyan-300" />
              <span className="font-semibold">Cosmic Ladder (10⁰ → 10⁻⁹ m)</span>
            </button>

            <button
              onClick={() => {
                setLayoutMode('simulators');
                soundFX.playSuccess();
              }}
              title="Silicon Physics Laboratory Workbench"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                layoutMode === 'simulators'
                  ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold shadow-xs ring-1 ring-emerald-400'
                  : 'text-emerald-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-300" />
              <span className="font-semibold">Physics Lab</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* REALM FILTER TABS & SEARCH BAR                            */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-ink-900 p-2.5 rounded-xl border border-ink-200 dark:border-white/10 shadow-2xs">
        {/* Realm Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              setActiveRealmFilter('all');
              soundFX.playTap();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeRealmFilter === 'all'
                ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900 font-bold'
                : 'text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
            }`}
          >
            All Inquiries ({SUBSTRATE_REALITY_NODES.length})
          </button>

          {SUBSTRATE_REALMS.map((realm) => {
            const count = SUBSTRATE_REALITY_NODES.filter((n) => n.realm === realm.id).length;
            const isSelected = activeRealmFilter === realm.id;
            return (
              <button
                key={realm.id}
                onClick={() => {
                  setActiveRealmFilter(realm.id);
                  soundFX.playTap();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-ink-100 dark:bg-ink-800 text-ink-900 dark:text-white font-bold border-brand-500 shadow-2xs'
                    : 'border-transparent text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800/60'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: realm.color }}
                />
                <span>{realm.label}</span>
                <span className="text-[10px] opacity-60 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar & Causal Stepper */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reality, equations, silicon..."
              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/10 text-ink-900 dark:text-white placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStepSequence('prev')}
              title="Previous foundational inquiry"
              className="p-1.5 rounded-lg border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-ink-500 dark:text-ink-400 px-1">
              {activeNode.order} / {SUBSTRATE_REALITY_NODES.length}
            </span>
            <button
              onClick={() => handleStepSequence('next')}
              title="Next consequent inquiry"
              className="p-1.5 rounded-lg border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW MODE 1 & 2: SPLIT VIEW OR FULL GRAPH CANVAS          */}
      {/* ========================================================= */}
      {(layoutMode === 'split' || layoutMode === 'graph') && (
        <div
          className={`grid gap-4 ${
            layoutMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
          }`}
        >
          {/* LEFT / MAIN: SVG GRAPH CANVAS */}
          <div
            className={`relative rounded-2xl bg-ink-950 border border-ink-800/80 overflow-hidden shadow-lg flex flex-col ${
              layoutMode === 'split'
                ? 'lg:col-span-7 h-[460px] sm:h-[580px] lg:h-[680px]'
                : 'w-full h-[520px] sm:h-[640px] lg:h-[750px]'
            }`}
          >
            {/* Canvas Header & Pan/Zoom Controls HUD */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
              <div className="flex items-center gap-1 bg-ink-900/90 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 text-xs shadow-md">
                <button
                  onClick={() => setZoom((z) => Math.min(1.8, z + 0.15))}
                  title="Zoom In"
                  className="p-1 rounded text-ink-400 hover:text-white cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-ink-300 px-1">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((z) => Math.max(0.45, z - 0.15))}
                  title="Zoom Out"
                  className="p-1 rounded text-ink-400 hover:text-white cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleFitView}
                  title="Fit Entire Graph to View"
                  className="p-1 rounded text-ink-400 hover:text-white cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetView}
                  title="Reset Canvas Position"
                  className="p-1 rounded text-ink-400 hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-ink-400 bg-ink-900/80 px-2.5 py-1 rounded-lg border border-white/10 font-mono">
                <Move className="w-3 h-3 text-cyan-400" /> Drag or Trackpad Pan
              </span>
            </div>

            {/* Interactive SVG Canvas */}
            <div
              ref={canvasContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ touchAction: 'none' }}
              className="flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden select-none"
            >
              <svg
                width="100%"
                height="100%"
                className="w-full h-full pointer-events-auto"
              >
                <defs>
                  {/* Glowing Arrow Markers */}
                  <marker
                    id="substrate-arrow-default"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#475569" opacity="0.6" />
                  </marker>

                  <marker
                    id="substrate-arrow-active"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
                  </marker>

                  <marker
                    id="substrate-arrow-prereq"
                    viewBox="0 0 10 10"
                    refX="22"
                    refY="5"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 9 5 L 0 9 z" fill="#06b6d4" />
                  </marker>

                  {/* Radial Node Glow Filter */}
                  <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Transformed Canvas Plane */}
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                  {/* Background Grid Pattern */}
                  <g opacity="0.08">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <line
                        key={`grid-x-${i}`}
                        x1={i * 100 - 300}
                        y1={-200}
                        x2={i * 100 - 300}
                        y2={2300}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="2,6"
                      />
                    ))}
                    {Array.from({ length: 26 }).map((_, i) => (
                      <line
                        key={`grid-y-${i}`}
                        x1={-300}
                        y1={i * 100 - 200}
                        x2={2400}
                        y2={i * 100 - 200}
                        stroke="#94a3b8"
                        strokeWidth="1"
                        strokeDasharray="2,6"
                      />
                    ))}
                  </g>

                  {/* Realm Ambient Tier Horizontal Watermarks */}
                  <g opacity="0.16" className="select-none pointer-events-none" fontFamily="monospace" fontWeight="bold" fontSize="13" letterSpacing="3">
                    <text x="80" y="45" fill="#06b6d4">TIER 1: QUANTUM ATOMS & CONDENSED MATTER SUBSTRATE</text>
                    <text x="80" y="305" fill="#3b82f6">TIER 2: MAXWELL FIELDS & CAPACITIVE CHARGE STORAGE</text>
                    <text x="80" y="565" fill="#10b981">TIER 3: CLOSED CIRCUITS, SWITCHES & CLOCK SYNCHRONIZATION</text>
                    <text x="80" y="825" fill="#f59e0b">TIER 4: TOPOLOGICAL ARITHMETIC & BISTABLE REGISTERS</text>
                    <text x="80" y="1085" fill="#ec4899">TIER 5A: MONOLITHIC SCALING & INTERCONNECTS</text>
                    <text x="80" y="1345" fill="#ec4899">TIER 5B: ADVANCED FABRICATION, MEMORY WALL & PARALLEL SILICON</text>
                    <text x="80" y="1605" fill="#8b5cf6">TIER 6A: SOFTWARE TOWERS & OS MEMORY TRANSLATION</text>
                    <text x="80" y="1865" fill="#8b5cf6">TIER 6B: THERMODYNAMICS & PHILOSOPHICAL COMPUTATION</text>
                  </g>

                  {/* EDGES: Causal Interconnections between Inquiries */}
                  <g className="edges-layer">
                    {SUBSTRATE_REALITY_NODES.map((sourceNode) => {
                      return sourceNode.connectedIds.map((targetId) => {
                        const targetNode = SUBSTRATE_REALITY_NODES.find((n) => n.id === targetId);
                        if (!targetNode) return null;

                        const isFocusedEdge =
                          (selectedNodeId === sourceNode.id && targetNode.id === selectedNodeId) ||
                          (selectedNodeId === sourceNode.id && sourceNode.connectedIds.includes(targetNode.id)) ||
                          (selectedNodeId === targetNode.id && targetNode.prerequisiteIds.includes(sourceNode.id));

                        const isConsequence = selectedNodeId === sourceNode.id;
                        const isPrerequisite = selectedNodeId === targetNode.id;

                        // Curved bezier path
                        const dx = targetNode.x - sourceNode.x;
                        const dy = targetNode.y - sourceNode.y;
                        const cx1 = sourceNode.x + dx * 0.5;
                        const cy1 = sourceNode.y;
                        const cx2 = sourceNode.x + dx * 0.5;
                        const cy2 = targetNode.y;
                        const pathData = `M ${sourceNode.x} ${sourceNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${targetNode.x} ${targetNode.y}`;

                        return (
                          <g key={`edge-${sourceNode.id}-${targetNode.id}`}>
                            <path
                              d={pathData}
                              fill="none"
                              stroke={
                                isConsequence
                                  ? '#10b981'
                                  : isPrerequisite
                                  ? '#06b6d4'
                                  : '#334155'
                              }
                              strokeWidth={isFocusedEdge ? 2.5 : 1.2}
                              strokeDasharray={isPrerequisite ? '4,4' : undefined}
                              opacity={isFocusedEdge ? 0.95 : 0.35}
                              markerEnd={
                                isConsequence
                                  ? 'url(#substrate-arrow-active)'
                                  : isPrerequisite
                                  ? 'url(#substrate-arrow-prereq)'
                                  : 'url(#substrate-arrow-default)'
                              }
                            />
                          </g>
                        );
                      });
                    })}
                  </g>

                  {/* NODES: Epistemic Inquiries */}
                  <g className="nodes-layer">
                    {SUBSTRATE_REALITY_NODES.map((node) => {
                      const isSelected = selectedNodeId === node.id;
                      const isHovered = hoveredNodeId === node.id;
                      const isNeighbor = activeNeighborIds.has(node.id);
                      const isExplored = exploredNodeIds.has(node.id);
                      const isVisibleInFilter =
                        activeRealmFilter === 'all' || node.realm === activeRealmFilter;

                      const nodeOpacity =
                        isVisibleInFilter ? (isSelected || isNeighbor ? 1 : 0.45) : 0.15;

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${node.x}, ${node.y})`}
                          onClick={() => handleSelectNode(node.id)}
                          onMouseEnter={() => setHoveredNodeId(node.id)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          className="interactive-node cursor-pointer transition-transform"
                          style={{ opacity: nodeOpacity }}
                        >
                          {/* Selected Glow Ring */}
                          {isSelected && (
                            <circle
                              r={38}
                              fill="none"
                              stroke={node.realmColor}
                              strokeWidth={3}
                              opacity={0.8}
                              filter="url(#node-glow)"
                              className="animate-pulse"
                            />
                          )}

                          {/* Outer Base Circle */}
                          <circle
                            r={26}
                            fill="#090d16"
                            stroke={isSelected ? node.realmColor : isNeighbor ? '#64748b' : '#334155'}
                            strokeWidth={isSelected ? 3 : 1.5}
                          />

                          {/* Inner Realm Badge */}
                          <circle
                            r={18}
                            fill={node.realmColor}
                            opacity={isSelected ? 0.9 : 0.35}
                          />

                          {/* Order Step Number */}
                          <text
                            textAnchor="middle"
                            dy=".35em"
                            fill="#ffffff"
                            fontSize="11"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {node.order}
                          </text>

                          {/* Title Label Card below Node */}
                          <g transform="translate(0, 36)">
                            <rect
                              x={-85}
                              y={0}
                              width={170}
                              height={30}
                              rx={8}
                              fill="#0f172a"
                              stroke={isSelected ? node.realmColor : isNeighbor ? '#475569' : '#1e293b'}
                              strokeWidth={isSelected ? 2 : 1}
                              opacity={0.95}
                            />
                            <text
                              textAnchor="middle"
                              y={19}
                              fill={isSelected ? '#ffffff' : isNeighbor ? '#f1f5f9' : '#cbd5e1'}
                              fontSize="10"
                              fontFamily="sans-serif"
                              fontWeight={isSelected ? 'bold' : isNeighbor ? '600' : 'normal'}
                            >
                              {node.question.length > 25
                                ? `${node.question.slice(0, 24)}...`
                                : node.question}
                            </text>
                          </g>

                          {/* Scale pill above node */}
                          <g transform="translate(0, -34)">
                            <rect
                              x={-30}
                              y={0}
                              width={60}
                              height={14}
                              rx={4}
                              fill="#020617"
                              stroke="#334155"
                              strokeWidth={0.8}
                              opacity={0.85}
                            />
                            <text
                              textAnchor="middle"
                              y={10}
                              fill="#94a3b8"
                              fontSize="8"
                              fontFamily="monospace"
                            >
                              {node.cosmicScaleMeter}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </g>
                </g>
              </svg>
            </div>

            {/* Bottom Floating Minimap HUD */}
            {showMinimap && (
              <div className="absolute bottom-3 right-3 z-20 hidden md:flex flex-col items-end gap-1 bg-ink-950/90 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg text-xs">
                <div className="flex items-center justify-between w-full pb-1 border-b border-white/10 text-[10px] text-ink-400 font-mono">
                  <span>REALITY NETWORK MAP</span>
                  <button
                    onClick={() => setShowMinimap(false)}
                    className="hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="w-36 h-24 bg-ink-900 rounded border border-white/5 relative overflow-hidden">
                  {SUBSTRATE_REALITY_NODES.map((n) => {
                    const normX = ((n.x - graphBounds.minX) / graphBounds.width) * 100;
                    const normY = ((n.y - graphBounds.minY) / graphBounds.height) * 100;
                    const isSelected = selectedNodeId === n.id;
                    return (
                      <div
                        key={`mini-${n.id}`}
                        onClick={() => handleSelectNode(n.id)}
                        className={`absolute w-1.5 h-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform ${
                          isSelected ? 'scale-175 ring-1 ring-white' : ''
                        }`}
                        style={{
                          left: `${Math.max(5, Math.min(95, normX))}%`,
                          top: `${Math.max(5, Math.min(95, normY))}%`,
                          backgroundColor: n.realmColor,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT / SECONDARY: THE SOCRATIC DOSSIER INSPECTOR */}
          <div
            className={`flex flex-col space-y-4 overflow-y-auto pr-1 ${
              layoutMode === 'split' ? 'lg:col-span-5 h-[520px] sm:h-[600px] lg:h-[680px]' : 'w-full'
            }`}
          >
            {/* Active Inquiry Header Card */}
            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: activeNode.realmColor }}
                  />
                  <span className="text-xs font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider font-mono">
                    {activeNode.realmLabel} · Step {activeNode.order} of {SUBSTRATE_REALITY_NODES.length}
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 border border-ink-200 dark:border-white/5">
                  Spatial Scale: {activeNode.cosmicScaleMeter}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-ink-900 dark:text-white leading-snug">
                {activeNode.question}
              </h2>

              <p className="text-xs sm:text-sm font-medium text-brand-700 dark:text-brand-300 leading-relaxed bg-brand-50/70 dark:bg-brand-950/30 p-2.5 rounded-xl border border-brand-200 dark:border-brand-500/20">
                "{activeNode.oneLiner}"
              </p>
            </div>

            {/* Inspector Tab Switcher: Dossier vs Physical Simulator */}
            <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-800 p-1 rounded-xl border border-ink-200 dark:border-white/10 text-xs shrink-0">
              <button
                onClick={() => {
                  setInspectorTab('dossier');
                  soundFX.playTap();
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  inspectorTab === 'dossier'
                    ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white font-bold shadow-xs'
                    : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Epistemic Dossier</span>
              </button>
              <button
                onClick={() => {
                  setInspectorTab('simulator');
                  soundFX.playTap();
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-center transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  inspectorTab === 'simulator'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Live Physics Sandbox</span>
              </button>
            </div>

            {inspectorTab === 'simulator' ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  <strong>Hardware Sandbox:</strong> Testing physical dynamics for <em>"{activeNode.question}"</em>. Interact with real-time transistor channels, thermal leakage, or energy bandgaps.
                </div>
                <SubstratePhysicsSimCanvas
                  initialStation={defaultStationForNode}
                  cosmicScaleIndex={selectedCosmicIndex}
                  onScaleChange={setSelectedCosmicIndex}
                />
              </div>
            ) : (
              <>
                {/* NAIVE MISCONCEPTION VS FIRST-PRINCIPLES TRUTH */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Naive Misconception */}
                  <div className="bg-amber-500/5 dark:bg-amber-500/10 rounded-xl border border-amber-500/30 p-4 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide font-mono">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>The Naive Misconception</span>
                    </div>
                    <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
                      {activeNode.naiveMisconception}
                    </p>
                  </div>

                  {/* First-Principles Reality */}
                  <div className="bg-cyan-500/5 dark:bg-cyan-500/10 rounded-xl border border-cyan-500/30 p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-800 dark:text-cyan-400 uppercase tracking-wide font-mono">
                      <Atom className="w-3.5 h-3.5 shrink-0" />
                      <span>The Deep Physical Reality (Scratch Truth)</span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-800 dark:text-ink-200 leading-relaxed font-sans">
                      {activeNode.firstPrinciplesReality}
                    </p>
                  </div>
                </div>

                {/* GOVERNING EQUATION CARD */}
                <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-ink-700 dark:text-ink-300 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Sigma className="w-3.5 h-3.5 text-brand-500" />
                      <span>Governing Physical Law</span>
                    </div>
                    <span className="text-[10px] text-ink-400 uppercase font-mono">Exact Formulation</span>
                  </div>

                  <div className="bg-ink-50 dark:bg-ink-950 p-3 rounded-xl border border-ink-200/80 dark:border-white/5 overflow-x-auto text-center">
                    <MathView math={activeNode.governingEquation} display={true} />
                  </div>

                  <p className="text-[11px] text-ink-500 dark:text-ink-400 leading-relaxed italic">
                    {activeNode.equationExplanation}
                  </p>
                </div>

                {/* SILICON REALITY CHECK */}
                <div className="bg-emerald-500/5 dark:bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide font-mono">
                    <Cpu className="w-3.5 h-3.5 shrink-0" />
                    <span>Silicon & Hardware Reality</span>
                  </div>
                  <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
                    {activeNode.siliconReality}
                  </p>
                </div>

                {/* STEP-BY-STEP DEDUCTIVE DERIVATION */}
                <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 p-4 shadow-sm space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink-900 dark:text-white uppercase tracking-wide font-mono">
                    <CornerDownRight className="w-3.5 h-3.5 text-brand-500" />
                    <span>Axiomatic Deductive Derivation</span>
                  </div>

                  <div className="space-y-3 relative pl-3 border-l-2 border-brand-500/30 ml-2">
                    {activeNode.deductiveDerivation.map((step) => (
                      <div key={step.stepNumber} className="space-y-1 relative">
                        <div className="absolute -left-[19px] top-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-white dark:border-ink-900" />
                        <h4 className="text-xs font-bold text-ink-900 dark:text-white">
                          {step.title}
                        </h4>
                        <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                          {step.derivation}
                        </p>
                        {step.formula && (
                          <div className="bg-ink-50 dark:bg-ink-950 p-2 rounded-lg border border-ink-200/60 dark:border-white/5 my-1 text-center">
                            <MathView math={step.formula} display={false} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* THOUGHT EXPERIMENT CARD */}
                <div className="bg-purple-500/5 dark:bg-purple-500/10 rounded-xl border border-purple-500/30 p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800 dark:text-purple-400 uppercase tracking-wide font-mono">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                    <span>Gedankenexperiment (Thought Experiment)</span>
                  </div>
                  <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed italic">
                    "{activeNode.thoughtExperiment}"
                  </p>
                </div>

                {/* CAUSAL NAVIGATION BUTTONS */}
                <div className="bg-ink-50 dark:bg-ink-950/60 p-3 rounded-xl border border-ink-200 dark:border-white/5 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-ink-400 block">
                    Causal Links in the Epistemic Graph
                  </span>

                  {/* Prerequisites */}
                  {activeNode.prerequisiteIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-medium text-ink-500">Prerequisites:</span>
                      {activeNode.prerequisiteIds.map((pId) => {
                        const prereq = SUBSTRATE_REALITY_NODES.find((n) => n.id === pId);
                        if (!prereq) return null;
                        return (
                          <button
                            key={pId}
                            onClick={() => handleSelectNode(pId)}
                            className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs border border-cyan-500/30 cursor-pointer transition-colors"
                          >
                            ← {prereq.order}. {prereq.question.slice(0, 22)}...
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Consequences */}
                  {activeNode.connectedIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-medium text-ink-500">Consequences:</span>
                      {activeNode.connectedIds.map((cId) => {
                        const conseq = SUBSTRATE_REALITY_NODES.find((n) => n.id === cId);
                        if (!conseq) return null;
                        return (
                          <button
                            key={cId}
                            onClick={() => handleSelectNode(cId)}
                            className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs border border-emerald-500/30 cursor-pointer transition-colors"
                          >
                            → {conseq.order}. {conseq.question.slice(0, 22)}...
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 3: ALL INQUIRIES DOSSIER READING VIEW           */}
      {/* ========================================================= */}
      {layoutMode === 'dossier' && (
        <div className="space-y-6">
          <div className="p-4 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200 dark:border-brand-500/30 text-xs text-brand-800 dark:text-brand-200 leading-relaxed">
            <strong>Reading Mode:</strong> Here are all {filteredNodes.length} first-principles reductionist inquiries laid out sequentially from quantum mechanics to high-dimensional thought. Click any card to inspect or jump to it in the interactive graph.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNodes.map((node) => (
              <div
                key={node.id}
                onClick={() => {
                  handleSelectNode(node.id);
                  setLayoutMode('split');
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 bg-white dark:bg-ink-900 shadow-sm hover:shadow-md ${
                  selectedNodeId === node.id
                    ? 'border-brand-500 ring-2 ring-brand-500/30'
                    : 'border-ink-200 dark:border-white/10 hover:border-brand-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: node.realmColor }}
                    />
                    <span className="text-[11px] font-mono text-ink-500 uppercase">
                      {node.realmLabel} · #{node.order}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ink-100 dark:bg-ink-800 text-ink-500">
                    {node.cosmicScaleMeter}
                  </span>
                </div>

                <h3 className="text-base font-bold text-ink-900 dark:text-white leading-snug">
                  {node.question}
                </h3>

                <p className="text-xs text-brand-700 dark:text-brand-300 font-medium">
                  "{node.oneLiner}"
                </p>

                <div className="bg-ink-50 dark:bg-ink-950 p-2.5 rounded-xl border border-ink-200/60 dark:border-white/5 text-center">
                  <MathView math={node.governingEquation} display={true} />
                </div>

                <p className="text-xs text-ink-600 dark:text-ink-400 line-clamp-3 leading-relaxed">
                  {node.firstPrinciplesReality}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 4: THE COSMIC LADDER OF SCALE (10⁰ → 10⁻⁹ m)    */}
      {/* ========================================================= */}
      {layoutMode === 'cosmic_ladder' && (
        <div className="space-y-6">
          {/* Cosmic Ladder Header & Continuous Slider */}
          <div className="bg-gradient-to-br from-ink-900 via-ink-950 to-brand-950 rounded-2xl border border-cyan-500/30 p-6 text-white space-y-6 shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  CONTINUOUS MULTI-SCALE CONTINUUM
                </span>
                <span className="text-xs text-ink-400 font-mono">
                  9 Orders of Magnitude Spatial Zoom
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                The Cosmic Ladder: From Token to Transistor
              </h2>
              <p className="text-xs sm:text-sm text-ink-300 max-w-3xl leading-relaxed">
                Slide the logarithmic scale bar below to travel from the human mind typing a word (10⁰ m) down to an electron wave packet tunneling through a 3nm gate channel and emitting Landauer heat (10⁻⁹ m).
              </p>
            </div>

            {/* Continuous Logarithmic Scale Slider */}
            <div className="space-y-3 bg-black/40 p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                <span>Macroscopic (10⁰ m)</span>
                <span className="text-sm font-bold text-white bg-cyan-500/20 px-3 py-0.5 rounded-lg border border-cyan-400/40">
                  {activeCosmicLevel.scaleLabel}
                </span>
                <span>Quantum Scale (10⁻⁹ m)</span>
              </div>

              <input
                type="range"
                min="0"
                max={COSMIC_SCALE_LEVELS.length - 1}
                step="1"
                value={selectedCosmicIndex}
                onChange={(e) => {
                  setSelectedCosmicIndex(parseInt(e.target.value));
                  soundFX.playTap();
                }}
                className="w-full h-2.5 bg-ink-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              {/* 9 Scale Step Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 pt-2">
                {COSMIC_SCALE_LEVELS.map((level, idx) => {
                  const isSelected = selectedCosmicIndex === idx;
                  return (
                    <button
                      key={level.exponent}
                      onClick={() => {
                        setSelectedCosmicIndex(idx);
                        soundFX.playTap();
                      }}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-mono text-center transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-cyan-500 text-ink-950 font-bold border-cyan-300 shadow-md scale-105'
                          : 'bg-ink-900/80 text-ink-400 border-white/10 hover:text-white hover:bg-ink-800'
                      }`}
                    >
                      10^{level.exponent} m
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Real-time Procedural Physical Canvas for Current Scale */}
          <SubstratePhysicsSimCanvas
            initialStation="cosmic_scale"
            cosmicScaleIndex={selectedCosmicIndex}
            onScaleChange={setSelectedCosmicIndex}
          />

          {/* ACTIVE SCALE TIER CARD */}
          <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 p-6 shadow-md space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-ink-200 dark:border-white/10">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider font-bold">
                  Scale Tier: {activeCosmicLevel.scaleLabel}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-ink-900 dark:text-white">
                  {activeCosmicLevel.title}
                </h3>
                <p className="text-xs sm:text-sm text-brand-700 dark:text-brand-300 font-medium">
                  {activeCosmicLevel.tagline}
                </p>
              </div>

              {/* Physical Metrics HUD */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-ink-50 dark:bg-ink-950 px-3 py-1.5 rounded-xl border border-ink-200 dark:border-white/10 text-right">
                  <span className="text-[10px] text-ink-400 block font-mono">Characteristic Time</span>
                  <span className="text-xs font-bold text-ink-900 dark:text-white font-mono">
                    {activeCosmicLevel.characteristicTime}
                  </span>
                </div>

                <div className="bg-ink-50 dark:bg-ink-950 px-3 py-1.5 rounded-xl border border-ink-200 dark:border-white/10 text-right">
                  <span className="text-[10px] text-ink-400 block font-mono">Energy Scale</span>
                  <span className="text-xs font-bold text-ink-900 dark:text-white font-mono">
                    {activeCosmicLevel.energyScale}
                  </span>
                </div>
              </div>
            </div>

            {/* Governing Physics & Formula */}
            <div className="bg-ink-50 dark:bg-ink-950 p-4 rounded-xl border border-ink-200 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink-700 dark:text-ink-300 font-mono">
                <Sigma className="w-4 h-4 text-cyan-500" />
                <span>Governing Physical Law at {activeCosmicLevel.scaleLabel}</span>
              </div>
              <div className="p-3 bg-white dark:bg-ink-900 rounded-lg border border-ink-200 dark:border-white/5 text-center overflow-x-auto">
                <MathView math={activeCosmicLevel.governingEquation} display={true} />
              </div>
            </div>

            {/* Narrative: The Token-to-Transistor Story */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                What is Happening to the Token at This Exact Scale:
              </h4>
              <p className="text-xs sm:text-sm text-ink-700 dark:text-ink-300 leading-relaxed bg-brand-50/50 dark:bg-brand-950/20 p-4 rounded-xl border border-brand-200 dark:border-brand-500/20">
                {activeCosmicLevel.tokenToTransistorStory}
              </p>
            </div>

            {/* Deep Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink-900 dark:text-white uppercase font-mono tracking-wider">
                Physical Mechanics Breakdown:
              </h4>
              <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
                {activeCosmicLevel.description}
              </p>
            </div>

            {/* Hardware Component & Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-ink-200 dark:border-white/10 text-xs">
              <div className="text-ink-500 dark:text-ink-400 font-mono">
                Physical Substrate: <strong className="text-ink-800 dark:text-ink-200">{activeCosmicLevel.hardwareComponent}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={selectedCosmicIndex === 0}
                  onClick={() => {
                    setSelectedCosmicIndex((idx) => Math.max(0, idx - 1));
                    soundFX.playTap();
                  }}
                  className="px-3 py-1.5 rounded-lg border border-ink-200 dark:border-white/10 disabled:opacity-40 text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 cursor-pointer"
                >
                  ← Zoom Out (10x Larger)
                </button>
                <button
                  disabled={selectedCosmicIndex === COSMIC_SCALE_LEVELS.length - 1}
                  onClick={() => {
                    setSelectedCosmicIndex((idx) => Math.min(COSMIC_SCALE_LEVELS.length - 1, idx + 1));
                    soundFX.playTap();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-40 cursor-pointer transition-colors"
                >
                  Zoom In (10x Deeper) →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 5: SILICON PHYSICS LABORATORY WORKBENCH         */}
      {/* ========================================================= */}
      {layoutMode === 'simulators' && (
        <div className="space-y-6">
          <div className="p-5 bg-gradient-to-r from-emerald-950/60 via-ink-950 to-cyan-950/60 rounded-2xl border border-emerald-500/30 text-white space-y-2 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE HARDWARE WORKBENCH
              </span>
              <span className="text-xs text-ink-400 font-mono">
                Real-Time Physical Simulation Engines
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              The Silicon Physics Laboratory
            </h2>
            <p className="text-xs sm:text-sm text-ink-300 max-w-3xl leading-relaxed">
              Direct physical experimentation with the laws of computation: toggle CMOS conduction channels to watch adders calculate binary sums, simulate DRAM capacitor thermal leakage and refresh timings, perturb cross-coupled inverters across Lyapunov saddle points, and compare electronic bandgaps across metals, silicon, and clay.
            </p>
          </div>

          {/* Master Physical Canvas */}
          <SubstratePhysicsSimCanvas
            initialStation="full_adder"
            cosmicScaleIndex={selectedCosmicIndex}
            onScaleChange={setSelectedCosmicIndex}
          />

          {/* 4 Deep Physical Station Reference Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>1. CMOS Full Adder Conduction</span>
              </div>
              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                Arithmetic is not an abstract concept; it is physical potential barrier routing. When gate voltages open PMOS pull-up or NMOS pull-down channels, electrons flow along the path of least electrostatic action, physically forcing output wires to voltages corresponding to Boolean Sum and Carry.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">
                <Activity className="w-4 h-4 text-amber-500" />
                <span>2. DRAM 1T-1C Thermal Leakage</span>
              </div>
              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                A DRAM bit is 100,000 electrons in a 30 fF deep-trench capacitor. Subthreshold thermal junction hopping and quantum tunneling constantly drain charge. Raise the die temperature slider to watch the leakage rate accelerate exponentially under Arrhenius' law.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 font-mono">
                <Layers className="w-4 h-4 text-purple-500" />
                <span>3. Bistable Double-Well SRAM Latch</span>
              </div>
              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                Two back-to-back inverters create positive regenerative feedback. Perturb the voltage to the unstable saddle point (0.375V); within picoseconds, any infinitesimal fluctuation is amplified, violently snapping the node back into Lyapunov-stable 0V or 0.75V attractors.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 dark:text-cyan-400 font-mono">
                <Atom className="w-4 h-4 text-cyan-500" />
                <span>4. Why Metal and Why Not Clay?</span>
              </div>
              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                Copper has zero bandgap (Eg = 0): electrons form a permanent delocalized Fermi sea. Silicon (Eg = 1.12 eV) is modifiable by atomic dopants. Clay has an immense Eg &gt; 8 eV bandgap: thermal energy is 300× too weak to free a single electron, meaning mobile carrier density is strictly zero.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-400 font-mono">
                <Zap className="w-4 h-4 text-violet-500" />
                <span>5. CMOS Inverter Dynamics & Crowbar Current</span>
              </div>
              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                Why CMOS took over computing: when Vin is 0V or 1V, one transistor is completely cut off, so static leakage current is zero picoamperes! Power is ONLY dissipated during the nanosecond transition when both PMOS and NMOS conduct simultaneously, releasing a sharp crowbar current pulse.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">
                <Gauge className="w-4 h-4 text-amber-500" />
                <span>6. GPU Roofline Model & FlashAttention</span>
              </div>
              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                Why GPUs starve on naive attention: with an arithmetic intensity of only 2 FLOPs/byte, Tensor Cores achieve less than 1% utilization due to the HBM memory wall. Fusing attention inside 256 KB on-chip SRAM via FlashAttention catapults intensity past the ridge point into 100% compute saturation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
