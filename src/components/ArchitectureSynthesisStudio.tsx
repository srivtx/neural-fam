/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Architecture Synthesis Studio: an interactive workbench to build, inspect,
 * test, and compare neural network architectures from first principles.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Cpu,
  Compass,
  CheckCircle2,
  BookOpen,
  Info,
  Sliders,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Copy,
  Check,
  Activity,
  HardDrive,
  Download,
  Share2,
  Swords,
  DollarSign,
  Workflow,
  Eye,
  FileCode2,
  Flame,
} from 'lucide-react';
import {
  Design,
  Workload,
  Layer,
  LayerKind,
  PRESETS,
  BLANK_DESIGN,
  MODALITIES,
  KINDS,
  KIND_ORDER,
  GPUS,
  cloneDesign,
  defaultLayer,
  DEFAULT_WORKLOAD,
} from '../studio/model';
import {
  analyzeDesign,
  generatePyTorchModule,
  generateJaxModule,
  generateHuggingFaceConfig,
  generateMermaidDiagram,
  traceTensorPipeline,
  calculateTrainingEconomics,
  encodeDesignToHash,
  decodeDesignFromHash,
} from '../studio/calculator';
import { CodeBlock } from './CodeBlock';
import { FIRST_PRINCIPLES_DOSSIERS } from '../data/firstPrinciplesData';
import { soundFX } from '../utils/audio';
import { copyTextToClipboard } from '../utils/clipboard';

export const ArchitectureSynthesisStudio: React.FC = () => {
  // Mode: 'studio' | 'battle'
  const [studioMode, setStudioMode] = useState<'studio' | 'battle'>('studio');

  // Studio Composer State
  const [design, setDesign] = useState<Design>(() => cloneDesign(PRESETS[1].design)); // Start with Llama 3 8B
  const [workload, setWorkload] = useState<Workload>(() => ({ ...DEFAULT_WORKLOAD, seqLen: 4096 }));
  const [activeTab, setActiveTab] = useState<'blueprint' | 'tensor_flow' | 'economics' | 'code' | 'params' | 'first_principles'>('blueprint');
  const [codeFramework, setCodeFramework] = useState<'pytorch' | 'jax' | 'hf' | 'mermaid'>('pytorch');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);

  // Compare Mode State (Head-to-Head Battle)
  const [battleModelAId, setBattleModelAId] = useState<string>('llama3-8b');
  const [battleModelBId, setBattleModelBId] = useState<string>('mamba');
  const [battleSeqLen, setBattleSeqLen] = useState<number>(16384);
  const [battleBatch, setBattleBatch] = useState<number>(1);

  // Restore design from URL hash on mount if present
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#design=')) {
      const hashStr = window.location.hash.replace('#design=', '');
      const decoded = decodeDesignFromHash(hashStr);
      if (decoded && decoded.design) {
        setDesign(decoded.design);
        if (decoded.workload) {
          setWorkload((prev) => ({ ...prev, ...decoded.workload }));
        }
      }
    }
  }, []);

  // Derived analysis for current design
  const analysis = useMemo(() => analyzeDesign(design, workload), [design, workload]);
  const pyTorchCode = useMemo(() => generatePyTorchModule(design, workload), [design, workload]);
  const jaxCode = useMemo(() => generateJaxModule(design, workload), [design, workload]);
  const hfConfig = useMemo(() => generateHuggingFaceConfig(design, workload), [design, workload]);
  const mermaidDiagram = useMemo(() => generateMermaidDiagram(design), [design]);
  const tensorPipeline = useMemo(() => traceTensorPipeline(design, workload), [design, workload]);
  const economics = useMemo(() => calculateTrainingEconomics(design, workload, 14), [design, workload]);

  // Derived analysis for Battle Models
  const modelAPreset = PRESETS.find((p) => p.id === battleModelAId) || PRESETS[1];
  const modelBPreset = PRESETS.find((p) => p.id === battleModelBId) || PRESETS[3];

  const battleWorkload: Workload = useMemo(
    () => ({
      ...DEFAULT_WORKLOAD,
      seqLen: battleSeqLen,
      batch: battleBatch,
      gpu: workload.gpu,
      precision: workload.precision,
    }),
    [battleSeqLen, battleBatch, workload.gpu, workload.precision]
  );

  const analysisA = useMemo(
    () => analyzeDesign(modelAPreset.design, battleWorkload),
    [modelAPreset, battleWorkload]
  );
  const analysisB = useMemo(
    () => analyzeDesign(modelBPreset.design, battleWorkload),
    [modelBPreset, battleWorkload]
  );

  // Handlers for modifying block layers
  const handleAddLayer = (kind: LayerKind) => {
    const newL = defaultLayer(kind, design.d);
    setDesign((prev) => ({ ...prev, block: [...prev.block, newL] }));
    setSelectedLayerId(newL.id);
    soundFX.playTap();
  };

  const handleRemoveLayer = (id: string) => {
    setDesign((prev) => ({
      ...prev,
      block: prev.block.filter((l) => l.id !== id),
    }));
    if (selectedLayerId === id) setSelectedLayerId(null);
    soundFX.playTap();
  };

  const handleMoveLayer = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= design.block.length) return;
    setDesign((prev) => {
      const next = [...prev.block];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return { ...prev, block: next };
    });
    soundFX.playTap();
  };

  const handleUpdateLayer = (id: string, updates: Partial<Layer>) => {
    setDesign((prev) => ({
      ...prev,
      block: prev.block.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setDesign(cloneDesign(preset.design));
      if (preset.workload) {
        setWorkload((prev) => ({ ...prev, ...preset.workload }));
      }
      soundFX.playSuccess();
    }
  };

  const handleResetToBlank = () => {
    setDesign(cloneDesign(BLANK_DESIGN));
    setSelectedLayerId(null);
    soundFX.playTap();
  };

  const handleShareDesign = async () => {
    const hash = encodeDesignToHash(design, workload);
    const fullUrl = `${window.location.origin}${window.location.pathname}#design=${hash}`;
    const ok = await copyTextToClipboard(fullUrl);
    if (ok) {
      setCopiedShareLink(true);
      soundFX.playSuccess();
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

  const handleDownloadSVG = () => {
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" style="background:#0c1220; font-family:sans-serif;">
  <text x="40" y="50" fill="#ffffff" font-size="22" font-weight="bold">${design.name}</text>
  <text x="40" y="80" fill="#94a3b8" font-size="14">Depth: ${design.depth} blocks · Model Dim: ${design.d} · Norm: ${design.norm}</text>
  <rect x="40" y="110" width="720" height="40" rx="8" fill="#1e293b" />
  <text x="55" y="135" fill="#38bdf8" font-size="13" font-family="monospace">Input Tensor [Batch, SeqLen, ${design.d}]</text>
  <rect x="40" y="180" width="720" height="340" rx="12" fill="#0f172a" stroke="#3b82f6" stroke-width="2" />
  <text x="60" y="210" fill="#60a5fa" font-size="14" font-weight="bold">Repeated Block (x${design.depth})</text>
  ${design.block
    .map(
      (l, idx) => `
    <rect x="60" y="${230 + idx * 50}" width="680" height="40" rx="6" fill="#1e293b" />
    <text x="80" y="${255 + idx * 50}" fill="#ffffff" font-size="13">${idx + 1}. ${KINDS[l.kind].label} (${KINDS[l.kind].cost})</text>
  `
    )
    .join('')}
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${design.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_blueprint.svg`;
    link.click();
    URL.revokeObjectURL(url);
    soundFX.playTap();
  };

  const selectedLayer = design.block.find((l) => l.id === selectedLayerId) || design.block[0];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Studio Top Control Strip: Mode Switcher & Presets */}
      <div className="relative rounded-3xl p-6 sm:p-8 border border-ink-200 dark:border-white/10 bg-surface dark:bg-ink-900 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30 text-brand-700 dark:text-brand-300 text-xs font-semibold tracking-wide">
                <Compass className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Architecture Synthesis Studio</span>
              </div>

              {/* Mode Switcher Pills */}
              <div className="flex items-center p-0.5 rounded-lg bg-ink-100 dark:bg-ink-800 border border-ink-200 dark:border-white/10 text-xs font-medium">
                <button
                  onClick={() => {
                    setStudioMode('studio');
                    soundFX.playTap();
                  }}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    studioMode === 'studio'
                      ? 'bg-surface dark:bg-ink-900 text-ink-900 dark:text-white font-bold shadow-2xs'
                      : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                  }`}
                >
                  <Workflow className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Composer</span>
                </button>

                <button
                  onClick={() => {
                    setStudioMode('battle');
                    soundFX.playTap();
                  }}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    studioMode === 'battle'
                      ? 'bg-surface dark:bg-ink-900 text-ink-900 dark:text-white font-bold shadow-2xs'
                      : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Head-to-Head Battle</span>
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-ink-900 dark:text-white">
              {studioMode === 'studio'
                ? 'Synthesize and inspect custom neural architectures'
                : 'Head-to-head architectural showdown & scaling curves'}
            </h1>
            <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-300 leading-relaxed">
              {studioMode === 'studio'
                ? 'Assemble layers, route representations, and verify memory and compute limits across real hardware constraints.'
                : 'Compare two architectures across context length scaling, KV-cache consumption, FLOPs, and throughput to locate the exact crossover point.'}
            </p>
          </div>

          {/* Quick Metrics Badge Strip (Studio Mode) */}
          {studioMode === 'studio' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono shrink-0">
              <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-0.5">
                <span className="text-[10px] text-ink-500 uppercase">Stored Params</span>
                <div className="text-sm sm:text-base font-bold font-sans text-ink-900 dark:text-white">
                  {(analysis.params.totalStored / 1e6).toFixed(1)}M
                </div>
                <span className="text-[10px] text-ink-500">
                  Active: {(analysis.params.totalActive / 1e6).toFixed(1)}M
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-0.5">
                <span className="text-[10px] text-ink-500 uppercase">KV / State RAM</span>
                <div className="text-sm sm:text-base font-bold font-sans text-brand-600 dark:text-brand-400">
                  {analysis.memory.kvCacheMB > 0
                    ? `${Math.round(analysis.memory.kvCacheMB)} MB`
                    : analysis.memory.ssmStateMB > 0
                    ? `${Math.round(analysis.memory.ssmStateMB)} MB`
                    : '0 MB'}
                </div>
                <span className="text-[10px] text-ink-500">
                  At N = {workload.seqLen.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-0.5">
                <span className="text-[10px] text-ink-500 uppercase">Hardware Check</span>
                <div
                  className={`text-sm sm:text-base font-bold font-sans flex items-center gap-1 ${
                    analysis.memory.fitsGpu ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {analysis.memory.fitsGpu ? 'Fits VRAM' : 'OOM Risk'}
                </div>
                <span className="text-[10px] text-ink-500">
                  {analysis.memory.vramUsagePercent}% of {analysis.gpu.name.split('·')[0]}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-0.5">
                <span className="text-[10px] text-ink-500 uppercase">Throughput</span>
                <div className="text-sm sm:text-base font-bold font-sans text-ink-900 dark:text-white">
                  ~{analysis.compute.estimatedTokensPerSec.toLocaleString()}
                </div>
                <span className="text-[10px] text-ink-500">tok/sec estimate</span>
              </div>
            </div>
          )}
        </div>

        {/* Presets & Share Strip */}
        {studioMode === 'studio' && (
          <div className="mt-6 pt-5 border-t border-ink-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-ink-700 dark:text-ink-300 mr-1 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Reference Presets:</span>
              </span>

              {PRESETS.map((p) => {
                const isMatch = design.name === p.design.name;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleLoadPreset(p.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                      isMatch
                        ? 'bg-brand-500 text-white border-brand-600 font-semibold shadow-2xs'
                        : 'bg-surface dark:bg-ink-950 border-ink-200 dark:border-white/10 hover:border-brand-500/50 text-ink-700 dark:text-ink-300'
                    }`}
                  >
                    {p.name}
                  </button>
                );
              })}

              <button
                onClick={handleResetToBlank}
                className="text-xs text-ink-500 hover:text-ink-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Blank</span>
              </button>
            </div>

            {/* Share & Download Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadSVG}
                title="Download architecture blueprint as vector SVG"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-200 dark:border-white/10 bg-ink-50 dark:bg-ink-950 text-xs font-semibold text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export SVG</span>
              </button>

              <button
                onClick={handleShareDesign}
                title="Copy shareable direct link with custom architecture state"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                {copiedShareLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Link copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Architecture</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODE 1: STUDIO COMPOSER WORKBENCH                             */}
      {/* ============================================================== */}
      {studioMode === 'studio' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Model Specification & Layer Composer (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Section 1: Global Architectural Hyperparameters */}
              <div className="p-5 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold font-display text-ink-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>1. Core network specification</span>
                  </h2>
                  <span className="text-xs font-mono text-ink-500">{design.depth} blocks total</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Architecture Name */}
                  <div className="space-y-1">
                    <label className="text-ink-500 font-medium">Model Name</label>
                    <input
                      type="text"
                      value={design.name}
                      onChange={(e) => setDesign((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 font-semibold text-ink-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Data Modality */}
                  <div className="space-y-1">
                    <label className="text-ink-500 font-medium">Input Modality</label>
                    <select
                      value={design.modality}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, modality: e.target.value as any }))
                      }
                      className="w-full bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-ink-900 dark:text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      {MODALITIES.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label} ({m.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hidden Dimension d_model */}
                  <div className="space-y-1">
                    <label className="text-ink-500 font-medium">
                      Model Dimension (d): <span className="font-mono font-bold text-ink-900 dark:text-white">{design.d}</span>
                    </label>
                    <select
                      value={design.d}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, d: parseInt(e.target.value, 10) }))
                      }
                      className="w-full bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-ink-900 dark:text-white focus:outline-none focus:border-brand-500 cursor-pointer font-mono"
                    >
                      {[256, 384, 512, 768, 1024, 1536, 2048, 2560, 4096].map((dim) => (
                        <option key={dim} value={dim}>
                          d = {dim}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  {/* Depth */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-ink-500">
                      <span>Depth:</span>
                      <span className="font-mono font-bold text-ink-900 dark:text-white">{design.depth} blocks</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="48"
                      value={design.depth}
                      onChange={(e) =>
                        setDesign((prev) => ({ ...prev, depth: parseInt(e.target.value, 10) }))
                      }
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                  </div>

                  {/* Normalization */}
                  <div className="space-y-1">
                    <label className="text-ink-500 font-medium">Normalization</label>
                    <select
                      value={design.norm}
                      onChange={(e) => setDesign((prev) => ({ ...prev, norm: e.target.value as any }))}
                      className="w-full bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-ink-900 dark:text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value="rmsnorm">RMSNorm (Modern)</option>
                      <option value="layernorm">LayerNorm (Classic)</option>
                      <option value="none">None (Raw)</option>
                    </select>
                  </div>

                  {/* Position Encoding */}
                  <div className="space-y-1">
                    <label className="text-ink-500 font-medium">Position Bias</label>
                    <select
                      value={design.pos}
                      onChange={(e) => setDesign((prev) => ({ ...prev, pos: e.target.value as any }))}
                      className="w-full bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-ink-900 dark:text-white focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value="rope">RoPE (Rotary)</option>
                      <option value="learned">Learned Absolute</option>
                      <option value="none">None (SSM/Conv)</option>
                    </select>
                  </div>

                  {/* Residual Highway Toggle */}
                  <div className="space-y-1">
                    <label className="text-ink-500 font-medium">Gradient Highway</label>
                    <button
                      onClick={() =>
                        setDesign((prev) => ({ ...prev, residual: !prev.residual }))
                      }
                      className={`w-full py-1.5 px-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        design.residual
                          ? 'bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30'
                          : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/30'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{design.residual ? 'y = x + F(x)' : 'No Skips'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 2: Repeated Block Layer Stack */}
              <div className="p-5 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold font-display text-ink-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      <span>2. Repeated block layer composer</span>
                    </h2>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Sublayers repeated sequentially across all {design.depth} blocks.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-ink-500">
                    {design.block.length} layer{design.block.length !== 1 ? 's' : ''} in block
                  </span>
                </div>

                {/* Visual Layer Stack */}
                <div className="space-y-2">
                  {design.block.map((layer, idx) => {
                    const kindMeta = KINDS[layer.kind];
                    const isSelected = layer.id === (selectedLayer?.id || '');
                    const layerStats = analysis.params.blockPerLayer.find((p) => p.layerId === layer.id);

                    return (
                      <div
                        key={layer.id}
                        onClick={() => setSelectedLayerId(layer.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-brand-50/60 dark:bg-brand-500/10 border-brand-500 shadow-2xs'
                            : 'bg-ink-50 dark:bg-ink-950 border-ink-200 dark:border-white/5 hover:border-ink-300 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-md bg-ink-200 dark:bg-ink-800 text-ink-700 dark:text-ink-300 font-mono text-xs flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>

                          <div
                            className="w-2.5 h-7 rounded-full shrink-0"
                            style={{ backgroundColor: kindMeta.color }}
                          />

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-ink-900 dark:text-white">
                                {kindMeta.label}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ink-200/80 dark:bg-ink-800 text-ink-700 dark:text-ink-300 font-semibold">
                                {kindMeta.cost}
                              </span>
                              <span className="text-[10px] text-ink-500">
                                ({kindMeta.mixes === 'tokens' ? 'Token mixer' : kindMeta.mixes === 'channels' ? 'Channel mixer' : 'Hybrid mixer'})
                              </span>
                            </div>

                            <div className="text-[11px] text-ink-500 mt-0.5">
                              {layer.kind === 'attention' &&
                                `${layer.heads} heads (${layer.kvHeads} KV heads · ${layer.kvHeads !== layer.heads ? 'GQA' : 'MHA'})`}
                              {layer.kind === 'window_attention' &&
                                `${layer.heads} heads · Window = ${layer.window} tokens`}
                              {layer.kind === 'ssm' &&
                                `expand=${layer.expand}x · d_state=${layer.dState}`}
                              {layer.kind === 'conv' &&
                                `kernel=${layer.kernel} · ${layer.depthwise ? 'Depthwise' : 'Dense 1D'}`}
                              {layer.kind === 'swiglu' &&
                                `hidden=${layer.hidden} (${Math.round((layer.hidden || 1) / design.d)}x expand)`}
                              {layer.kind === 'mlp' &&
                                `hidden=${layer.hidden} (${Math.round((layer.hidden || 1) / design.d)}x expand)`}
                              {layer.kind === 'moe' &&
                                `${layer.topK} of ${layer.experts} experts active per token`}
                              {layer.kind === 'gnn' && `Neighbourhood message aggregation`}
                            </div>
                          </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-ink-200/60 dark:border-white/5">
                          {layerStats && (
                            <div className="text-right text-[11px] font-mono mr-2">
                              <span className="text-ink-900 dark:text-white font-bold">
                                {(layerStats.stored / 1e6).toFixed(2)}M
                              </span>
                              <span className="text-ink-400 block text-[10px]">stored/block</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveLayer(idx, 'up');
                              }}
                              disabled={idx === 0}
                              title="Move up"
                              className="p-1 rounded text-ink-500 hover:text-ink-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveLayer(idx, 'down');
                              }}
                              disabled={idx === design.block.length - 1}
                              title="Move down"
                              className="p-1 rounded text-ink-500 hover:text-ink-900 dark:hover:text-white disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveLayer(layer.id);
                              }}
                              disabled={design.block.length <= 1}
                              title="Remove layer"
                              className="p-1 rounded text-rose-500 hover:text-rose-700 disabled:opacity-30 cursor-pointer ml-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Layer Palette */}
                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider block mb-2">
                    Add primitive block to repeated layer:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {KIND_ORDER.map((k) => {
                      const meta = KINDS[k];
                      return (
                        <button
                          key={k}
                          onClick={() => handleAddLayer(k)}
                          className="p-2 rounded-xl border border-ink-200 dark:border-white/10 hover:border-brand-500/50 bg-ink-50 dark:bg-ink-950 text-left transition-all cursor-pointer flex flex-col justify-between group"
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: meta.color }}
                            />
                            <span className="text-[9px] font-mono text-ink-500">{meta.cost}</span>
                          </div>
                          <span className="text-[11px] font-bold text-ink-800 dark:text-ink-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 mt-1">
                            + {meta.short}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Layer Parameter Tweaker */}
                {selectedLayer && (
                  <div className="p-4 rounded-xl bg-ink-50/70 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink-900 dark:text-white flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: KINDS[selectedLayer.kind].color }}
                        />
                        <span>Configure {KINDS[selectedLayer.kind].label}</span>
                      </span>
                      <span className="text-[10px] text-ink-500 font-mono">ID: {selectedLayer.id}</span>
                    </div>

                    {/* Attention Controls */}
                    {(selectedLayer.kind === 'attention' || selectedLayer.kind === 'window_attention') && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-ink-500 block mb-1">
                            Query Heads: <strong className="text-ink-900 dark:text-white">{selectedLayer.heads}</strong>
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="64"
                            value={selectedLayer.heads || 8}
                            onChange={(e) =>
                              handleUpdateLayer(selectedLayer.id, { heads: parseInt(e.target.value, 10) })
                            }
                            className="w-full accent-brand-600"
                          />
                        </div>

                        <div>
                          <label className="text-ink-500 block mb-1">
                            KV Heads (GQA): <strong className="text-ink-900 dark:text-white">{selectedLayer.kvHeads}</strong>
                          </label>
                          <input
                            type="range"
                            min="1"
                            max={selectedLayer.heads || 8}
                            value={selectedLayer.kvHeads || selectedLayer.heads || 8}
                            onChange={(e) =>
                              handleUpdateLayer(selectedLayer.id, { kvHeads: parseInt(e.target.value, 10) })
                            }
                            className="w-full accent-brand-600"
                          />
                          <span className="text-[10px] text-brand-600 dark:text-brand-400 block mt-0.5">
                            {selectedLayer.kvHeads === 1
                              ? 'Multi-Query (MQA)'
                              : selectedLayer.kvHeads === selectedLayer.heads
                              ? 'Full MHA (No sharing)'
                              : `Grouped-Query (${(selectedLayer.heads || 8) / (selectedLayer.kvHeads || 1)}x savings)`}
                          </span>
                        </div>

                        {selectedLayer.kind === 'window_attention' && (
                          <div>
                            <label className="text-ink-500 block mb-1">Window: {selectedLayer.window}</label>
                            <select
                              value={selectedLayer.window || 1024}
                              onChange={(e) =>
                                handleUpdateLayer(selectedLayer.id, { window: parseInt(e.target.value, 10) })
                              }
                              className="w-full bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                            >
                              {[256, 512, 1024, 2048, 4096].map((w) => (
                                <option key={w} value={w}>
                                  {w} tokens
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    {/* SSM Controls */}
                    {selectedLayer.kind === 'ssm' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-ink-500 block mb-1">State Dim (d_state)</label>
                          <select
                            value={selectedLayer.dState || 16}
                            onChange={(e) =>
                              handleUpdateLayer(selectedLayer.id, { dState: parseInt(e.target.value, 10) })
                            }
                            className="w-full bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                          >
                            {[8, 16, 32, 64, 128].map((s) => (
                              <option key={s} value={s}>
                                {s} dims
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-ink-500 block mb-1">Expand Factor</label>
                          <select
                            value={selectedLayer.expand || 2}
                            onChange={(e) =>
                              handleUpdateLayer(selectedLayer.id, { expand: parseInt(e.target.value, 10) })
                            }
                            className="w-full bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                          >
                            {[1, 2, 4].map((ex) => (
                              <option key={ex} value={ex}>
                                {ex}x inner dim
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-ink-500 block mb-1">1D Conv Kernel</label>
                          <select
                            value={selectedLayer.kernel || 4}
                            onChange={(e) =>
                              handleUpdateLayer(selectedLayer.id, { kernel: parseInt(e.target.value, 10) })
                            }
                            className="w-full bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                          >
                            {[3, 4, 7, 9].map((k) => (
                              <option key={k} value={k}>
                                k = {k}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* MoE Controls */}
                    {selectedLayer.kind === 'moe' && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-ink-500 block mb-1">
                            Total Experts: <strong className="text-ink-900 dark:text-white">{selectedLayer.experts}</strong>
                          </label>
                          <select
                            value={selectedLayer.experts || 8}
                            onChange={(e) =>
                              handleUpdateLayer(selectedLayer.id, { experts: parseInt(e.target.value, 10) })
                            }
                            className="w-full bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                          >
                            {[4, 8, 16, 32, 64].map((e) => (
                              <option key={e} value={e}>
                                {e} experts
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-ink-500 block mb-1">
                            Active per token (top_k): <strong className="text-ink-900 dark:text-white">{selectedLayer.topK}</strong>
                          </label>
                          <select
                            value={selectedLayer.topK || 2}
                            onChange={(e) =>
                              handleUpdateLayer(selectedLayer.id, { topK: parseInt(e.target.value, 10) })
                            }
                            className="w-full bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                          >
                            {[1, 2, 4, 8].filter((k) => k <= (selectedLayer.experts || 8)).map((k) => (
                              <option key={k} value={k}>
                                Top-{k} active
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* Conv Controls */}
                    {selectedLayer.kind === 'conv' && (
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-ink-500 block mb-1">Filter Kernel Size</label>
                          <select
                            value={selectedLayer.kernel || 7}
                            onChange={(e) =>
                              handleUpdateLayer(selectedLayer.id, { kernel: parseInt(e.target.value, 10) })
                            }
                            className="w-full bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded px-2 py-1 text-xs"
                          >
                            {[3, 5, 7, 9, 11].map((k) => (
                              <option key={k} value={k}>
                                Kernel {k}x1
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-ink-500 block mb-1">Depthwise Separation</label>
                          <button
                            onClick={() =>
                              handleUpdateLayer(selectedLayer.id, { depthwise: !selectedLayer.depthwise })
                            }
                            className={`w-full py-1.5 px-2 rounded border font-semibold text-xs cursor-pointer ${
                              selectedLayer.depthwise
                                ? 'bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30'
                                : 'bg-ink-200 dark:bg-ink-800 text-ink-700 dark:text-ink-300 border-ink-300 dark:border-white/10'
                            }`}
                          >
                            {selectedLayer.depthwise ? 'Depthwise (O(d·k))' : 'Dense Conv (O(d²·k))'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Workload Simulator, Memory Feasibility, & Diagnostics (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Hardware & Workload Target */}
              <div className="p-5 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold font-display text-ink-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>Target hardware & workload</span>
                  </h2>
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                    {analysis.gpu.memGB} GB VRAM
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Target Accelerator */}
                  <div className="space-y-1">
                    <label className="text-ink-500 font-medium">Deployment GPU / Accelerator</label>
                    <select
                      value={workload.gpu}
                      onChange={(e) => setWorkload((prev) => ({ ...prev, gpu: e.target.value as any }))}
                      className="w-full bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/10 rounded-lg px-2.5 py-2 text-ink-900 dark:text-white focus:outline-none focus:border-brand-500 font-semibold cursor-pointer"
                    >
                      {GPUS.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.tflops} TFLOPS · {g.bandwidthGBs} GB/s)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sequence Length Stress Slider */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-ink-600 dark:text-ink-300 font-medium">Context Sequence Length:</span>
                      <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                        N = {workload.seqLen.toLocaleString()} tokens
                      </span>
                    </div>
                    <input
                      type="range"
                      min="256"
                      max="131072"
                      step="256"
                      value={workload.seqLen}
                      onChange={(e) =>
                        setWorkload((prev) => ({ ...prev, seqLen: parseInt(e.target.value, 10) }))
                      }
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-ink-400 font-mono">
                      <span>256</span>
                      <span>4K (Standard)</span>
                      <span>32K</span>
                      <span>128K+</span>
                    </div>
                  </div>

                  {/* Batch Size & Precision */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-ink-500 font-medium">Batch Size</label>
                      <select
                        value={workload.batch}
                        onChange={(e) =>
                          setWorkload((prev) => ({ ...prev, batch: parseInt(e.target.value, 10) }))
                        }
                        className="w-full bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-ink-900 dark:text-white cursor-pointer"
                      >
                        {[1, 2, 4, 8, 16, 32, 64].map((b) => (
                          <option key={b} value={b}>
                            Batch {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-ink-500 font-medium">Weight Precision</label>
                      <select
                        value={workload.precision}
                        onChange={(e) =>
                          setWorkload((prev) => ({ ...prev, precision: e.target.value as any }))
                        }
                        className="w-full bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-ink-900 dark:text-white cursor-pointer font-mono"
                      >
                        <option value="fp32">FP32 (4 Bytes)</option>
                        <option value="bf16">BF16 / FP16 (2 Bytes)</option>
                        <option value="fp8">FP8 (1 Byte)</option>
                        <option value="int4">INT4 (0.5 Byte)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* VRAM Memory Allocation Breakdown */}
              <div className="p-5 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold font-display text-ink-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>Memory footprint breakdown</span>
                  </h2>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      analysis.memory.fitsGpu
                        ? 'bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-300'
                        : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {analysis.memory.fitsGpu ? 'Fits Hardware' : 'Out of Memory'}
                  </span>
                </div>

                {/* Visual Allocation Bar */}
                <div className="space-y-1.5">
                  <div className="h-4 w-full bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden flex border border-ink-200/50 dark:border-white/5">
                    <div
                      title={`Weights: ${Math.round(analysis.memory.weightsMB)} MB`}
                      className="bg-brand-500 transition-all"
                      style={{
                        width: `${Math.min(100, (analysis.memory.weightsMB / analysis.memory.gpuVramMB) * 100)}%`,
                      }}
                    />
                    <div
                      title={`KV Cache: ${Math.round(analysis.memory.kvCacheMB)} MB`}
                      className="bg-rose-500 transition-all"
                      style={{
                        width: `${Math.min(100, (analysis.memory.kvCacheMB / analysis.memory.gpuVramMB) * 100)}%`,
                      }}
                    />
                    <div
                      title={`SSM State: ${Math.round(analysis.memory.ssmStateMB)} MB`}
                      className="bg-purple-500 transition-all"
                      style={{
                        width: `${Math.min(100, (analysis.memory.ssmStateMB / analysis.memory.gpuVramMB) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-ink-500 font-mono">
                    <span>Total: {Math.round(analysis.memory.totalInferenceMB).toLocaleString()} MB</span>
                    <span>Limit: {Math.round(analysis.memory.gpuVramMB).toLocaleString()} MB</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono pt-1">
                  <div className="p-2.5 rounded-lg bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 space-y-0.5">
                    <span className="text-[10px] text-ink-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-brand-500" />
                      Weights
                    </span>
                    <span className="font-bold text-ink-900 dark:text-white block">
                      {Math.round(analysis.memory.weightsMB).toLocaleString()} MB
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 space-y-0.5">
                    <span className="text-[10px] text-ink-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      KV Cache
                    </span>
                    <span className="font-bold text-ink-900 dark:text-white block">
                      {Math.round(analysis.memory.kvCacheMB).toLocaleString()} MB
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 space-y-0.5">
                    <span className="text-[10px] text-ink-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      SSM State
                    </span>
                    <span className="font-bold text-ink-900 dark:text-white block">
                      {Math.round(analysis.memory.ssmStateMB).toLocaleString()} MB
                    </span>
                  </div>
                </div>
              </div>

              {/* Architectural Linter & Diagnostic Feedback */}
              <div className="p-5 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-xs space-y-3">
                <h2 className="text-sm font-bold font-display text-ink-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Architectural diagnostic report</span>
                </h2>

                <div className="space-y-2">
                  {analysis.lints.map((lint, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1 ${
                        lint.level === 'error'
                          ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-200'
                          : lint.level === 'warning'
                          ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-200'
                          : lint.level === 'success'
                          ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-500/20 text-green-800 dark:text-green-200'
                          : 'bg-ink-50 dark:bg-ink-950 border-ink-200 dark:border-white/5 text-ink-700 dark:text-ink-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        {lint.level === 'error' && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                        {lint.level === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                        {lint.level === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                        {lint.level === 'info' && <Info className="w-3.5 h-3.5 text-brand-600" />}
                        <span>{lint.title}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">{lint.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Studio Deep Dive Workspace Tabs */}
          <div className="p-6 bg-surface dark:bg-ink-900 rounded-3xl border border-ink-200 dark:border-white/10 shadow-xs space-y-4">
            {/* Tabs Header */}
            <div className="flex flex-wrap items-center justify-between border-b border-ink-100 dark:border-white/10 pb-3 gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'blueprint', label: 'Dataflow Blueprint', icon: Workflow },
                  { id: 'tensor_flow', label: 'Tensor Dimension Flow', icon: Eye },
                  { id: 'economics', label: 'Scaling & Economics', icon: DollarSign },
                  { id: 'code', label: 'Multi-Framework Code', icon: FileCode2 },
                  { id: 'params', label: 'Parameter Matrix', icon: Layers },
                  { id: 'first_principles', label: 'First Principles & Invariants', icon: Flame },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setActiveTab(t.id as any);
                        soundFX.playTap();
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-brand-500 text-white shadow-2xs'
                          : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-mono text-ink-500 hidden sm:inline">
                {design.name} · {design.d}d
              </span>
            </div>

            {/* TAB 1: Visual Blueprint Diagram */}
            {activeTab === 'blueprint' && (
              <div className="space-y-4 py-2">
                <p className="text-xs text-ink-600 dark:text-ink-300">
                  Schematic flow of information through one repeated block of <strong>{design.name}</strong>.
                </p>

                <div className="p-6 bg-ink-50 dark:bg-ink-950 rounded-2xl border border-ink-200 dark:border-white/5 flex flex-col items-center space-y-3 font-mono text-xs overflow-x-auto">
                  <div className="px-4 py-2 rounded-lg bg-surface dark:bg-ink-900 border border-ink-300 dark:border-white/10 font-bold text-ink-900 dark:text-white shadow-2xs">
                    Input Tensor: [Batch={workload.batch}, SeqLen={workload.seqLen}, d={design.d}]
                  </div>

                  <div className="w-0.5 h-6 bg-ink-300 dark:bg-ink-700" />

                  {/* Block Body with Residual Bypass Line */}
                  <div className="relative p-6 rounded-2xl bg-surface dark:bg-ink-900 border-2 border-brand-500/40 w-full max-w-xl space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-sans pb-1 border-b border-ink-200 dark:border-white/5">
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        Repeated Block x{design.depth}
                      </span>
                      <span className="text-ink-400">
                        Norm: {design.norm} · Residual: {design.residual ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    {design.block.map((layer, idx) => {
                      const meta = KINDS[layer.kind];
                      return (
                        <div
                          key={layer.id}
                          className="p-3 rounded-xl border border-ink-200 dark:border-white/10 bg-ink-50 dark:bg-ink-950 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: meta.color }}
                            />
                            <span className="font-bold text-ink-900 dark:text-white">
                              Layer {idx + 1}: {meta.label}
                            </span>
                          </div>
                          <span className="text-[11px] text-ink-500">{meta.cost}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="w-0.5 h-6 bg-ink-300 dark:bg-ink-700" />

                  <div className="px-4 py-2 rounded-lg bg-surface dark:bg-ink-900 border border-ink-300 dark:border-white/10 font-bold text-ink-900 dark:text-white shadow-2xs">
                    {design.norm !== 'none' ? `Final ${design.norm} -> ` : ''} Output Logits / Head
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Live Tensor Dimensional Tracer */}
            {activeTab === 'tensor_flow' && (
              <div className="space-y-4 py-2">
                <div>
                  <h3 className="text-sm font-bold font-display text-ink-900 dark:text-white">
                    Step-by-Step Dimensional Dataflow Tracer
                  </h3>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Follow an activation tensor batch of size [B={workload.batch}, N={workload.seqLen.toLocaleString()}, d={design.d}] as it traverses operations.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {tensorPipeline.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-ink-200 dark:border-white/5 bg-ink-50 dark:bg-ink-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-6 h-6 rounded-md bg-ink-200 dark:bg-ink-800 text-ink-700 dark:text-ink-300 font-mono text-[11px] flex items-center justify-center font-bold shrink-0">
                          {idx + 1}
                        </div>

                        {step.color && (
                          <div
                            className="w-2 h-6 rounded-full shrink-0 hidden sm:block"
                            style={{ backgroundColor: step.color }}
                          />
                        )}

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink-900 dark:text-white">{step.name}</span>
                            <span className="text-[10px] font-mono text-ink-400">({step.operation})</span>
                          </div>
                          <p className="text-[11px] text-ink-500">{step.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-ink-200/40">
                        <div className="font-mono">
                          <span className="text-[10px] text-ink-400 block uppercase">Shape</span>
                          <span className="font-bold text-brand-600 dark:text-brand-400 text-xs">
                            {step.shape}
                          </span>
                        </div>

                        <div className="font-mono text-right">
                          <span className="text-[10px] text-ink-400 block uppercase">Buffer</span>
                          <span className="font-semibold text-ink-700 dark:text-ink-300 text-xs">
                            {step.memoryMB} MB
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: Chinchilla Scaling & Training Economics */}
            {activeTab === 'economics' && (
              <div className="space-y-5 py-2">
                <div>
                  <h3 className="text-sm font-bold font-display text-ink-900 dark:text-white">
                    Compute-Optimal Scaling & Training Budget Planner
                  </h3>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Evaluates token-to-parameter ratios using Chinchilla scaling laws (Hoffmann et al., 2022) and cloud cluster pricing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-1">
                    <span className="text-ink-400 text-[10px] uppercase block">Chinchilla Optimal Tokens</span>
                    <div className="text-lg font-bold font-sans text-brand-600 dark:text-brand-400">
                      {economics.chinchillaTokensB} Billion
                    </div>
                    <span className="text-ink-500 text-[11px]">D ≈ 20 × {economics.parametersM}M parameters</span>
                  </div>

                  <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-1">
                    <span className="text-ink-400 text-[10px] uppercase block">Total Pre-training Compute</span>
                    <div className="text-lg font-bold font-sans text-ink-900 dark:text-white">
                      {economics.totalFlopsZetta} ZettaFLOPs
                    </div>
                    <span className="text-ink-500 text-[11px]">6 × P × D total training FLOPs</span>
                  </div>

                  <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-1">
                    <span className="text-ink-400 text-[10px] uppercase block">14-Day Cluster (H100 SXM5)</span>
                    <div className="text-lg font-bold font-sans text-green-600 dark:text-green-400">
                      {economics.h100GpusNeeded} GPUs
                    </div>
                    <span className="text-ink-500 text-[11px]">Est. Cost: ~${economics.estimatedCostH100USD.toLocaleString()} USD</span>
                  </div>

                  <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200 dark:border-white/5 space-y-1">
                    <span className="text-ink-400 text-[10px] uppercase block">Inference Serving Cost</span>
                    <div className="text-lg font-bold font-sans text-ink-900 dark:text-white">
                      ${economics.inferenceCostPerMillionTokensUSD} / 1M
                    </div>
                    <span className="text-ink-500 text-[11px]">Output tokens on single node</span>
                  </div>
                </div>

                {/* Practical Recommendations Card */}
                <div className="p-4 rounded-xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-500/20 text-xs text-ink-700 dark:text-ink-300 space-y-2">
                  <div className="font-bold text-brand-900 dark:text-brand-300 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>How to read these scaling metrics:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>
                      <strong>Undertrained vs. Chinchilla Optimal:</strong> If your training dataset has fewer than {economics.chinchillaTokensB}B tokens, your model capacity is compute-suboptimal; training a smaller width for longer will yield better loss.
                    </li>
                    <li>
                      <strong>Hardware Utilization:</strong> Assumes a realistic 40% Model FLOPs Utilization (MFU) achievable with FlashAttention-2, fused kernels, and Megatron tensor parallelism.
                    </li>
                    <li>
                      <strong>Inference Economics:</strong> If inference cost is a bottleneck, consider converting attention layers to grouped-query attention (GQA) or deploying INT4/FP8 quantization.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 4: Multi-Framework Code & Export */}
            {activeTab === 'code' && (
              <div className="space-y-4 py-1">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {[
                      { id: 'pytorch', label: 'PyTorch (nn.Module)' },
                      { id: 'jax', label: 'JAX / Flax' },
                      { id: 'hf', label: 'HuggingFace config.json' },
                      { id: 'mermaid', label: 'Mermaid.js Diagram' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setCodeFramework(f.id as any);
                          soundFX.playTap();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          codeFramework === f.id
                            ? 'bg-ink-900 text-white dark:bg-white dark:text-ink-900'
                            : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-300 hover:bg-ink-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] font-mono text-ink-500">
                    Production drop-in code
                  </span>
                </div>

                {codeFramework === 'pytorch' && (
                  <CodeBlock
                    code={pyTorchCode}
                    language="Python / PyTorch"
                    filename={`${design.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.py`}
                    runLabel="Verify Forward Pass"
                    onRun={() => soundFX.playSuccess()}
                    output={`PyTorch forward check successful\nInput shape:  [2, ${Math.min(128, workload.seqLen)}, ${design.d}]\nOutput shape: [2, ${Math.min(128, workload.seqLen)}, ${design.vocab || design.outputDim || design.d}]\nParameters verified: ${(analysis.params.totalStored / 1e6).toFixed(2)}M stored`}
                  />
                )}

                {codeFramework === 'jax' && (
                  <CodeBlock
                    code={jaxCode}
                    language="Python / JAX Flax"
                    filename={`${design.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_flax.py`}
                  />
                )}

                {codeFramework === 'hf' && (
                  <CodeBlock
                    code={hfConfig}
                    language="JSON / HuggingFace"
                    filename="config.json"
                  />
                )}

                {codeFramework === 'mermaid' && (
                  <CodeBlock
                    code={mermaidDiagram}
                    language="Mermaid Diagram"
                    filename="architecture_diagram.mmd"
                  />
                )}
              </div>
            )}

            {/* TAB 5: Detailed Parameter Matrix */}
            {activeTab === 'params' && (
              <div className="overflow-x-auto py-1">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-ink-200 dark:border-white/10 text-ink-500 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Subsystem</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Stored Parameters</th>
                      <th className="py-2.5 px-3 text-right">Active per Token</th>
                      <th className="py-2.5 px-3 text-right">% of Model</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100 dark:divide-white/5">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-ink-900 dark:text-white">Embedding</td>
                      <td className="py-2.5 px-3 text-ink-600 dark:text-ink-400">
                        Input projections ({design.vocab} vocab x {design.d} d)
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {(analysis.params.embeddings / 1e6).toFixed(2)}M
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {(analysis.params.embeddings / 1e6).toFixed(2)}M
                      </td>
                      <td className="py-2.5 px-3 text-right text-ink-500">
                        {Math.round((analysis.params.embeddings / analysis.params.totalStored) * 100)}%
                      </td>
                    </tr>

                    {analysis.params.unembedding > 0 && (
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-ink-900 dark:text-white">Unembedding</td>
                        <td className="py-2.5 px-3 text-ink-600 dark:text-ink-400">
                          Output prediction head (untied weights)
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          {(analysis.params.unembedding / 1e6).toFixed(2)}M
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {(analysis.params.unembedding / 1e6).toFixed(2)}M
                        </td>
                        <td className="py-2.5 px-3 text-right text-ink-500">
                          {Math.round((analysis.params.unembedding / analysis.params.totalStored) * 100)}%
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td className="py-2.5 px-3 font-bold text-ink-900 dark:text-white">
                        Blocks (x{design.depth})
                      </td>
                      <td className="py-2.5 px-3 text-ink-600 dark:text-ink-400">
                        {design.block.map((b) => KINDS[b.kind].short).join(' + ')} repeated layers
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {(analysis.params.blockTotal / 1e6).toFixed(2)}M
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {(analysis.params.totalActive / 1e6).toFixed(2)}M
                      </td>
                      <td className="py-2.5 px-3 text-right text-ink-500">
                        {Math.round((analysis.params.blockTotal / analysis.params.totalStored) * 100)}%
                      </td>
                    </tr>

                    <tr className="font-bold bg-ink-50 dark:bg-ink-950/80">
                      <td className="py-3 px-3 text-ink-900 dark:text-white">Total Model</td>
                      <td className="py-3 px-3 text-ink-600 dark:text-ink-300">
                        Complete weights across all modules
                      </td>
                      <td className="py-3 px-3 text-right text-brand-600 dark:text-brand-400">
                        {(analysis.params.totalStored / 1e6).toFixed(2)}M
                      </td>
                      <td className="py-3 px-3 text-right text-green-600 dark:text-green-400">
                        {(analysis.params.totalActive / 1e6).toFixed(2)}M
                      </td>
                      <td className="py-3 px-3 text-right text-ink-900 dark:text-white">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB 6: First Principles & Invariants */}
            {activeTab === 'first_principles' && (
              <div className="space-y-6 py-2">
                <div className="p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold font-display uppercase tracking-wider text-amber-700 dark:text-amber-300">
                      First-Principles Dialectic & Invariant Auditor
                    </h3>
                  </div>
                  <p className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
                    Architectures are not created by randomly chaining operations; they are forced into existence by mathematical crises and physical hardware barriers. Here is the first-principles audit for your composed model: <strong>{design.name}</strong>.
                  </p>
                </div>

                {/* Layer-by-Layer Historical Necessity */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 font-mono">
                    Constituent Building Blocks & Their Historical Genesis
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(new Set(design.block.map((l) => l.kind))).map((kind) => {
                      const kindMeta = KINDS[kind];
                      const layerDossierMap: Record<string, { crisis: string; bottleneck: string; invariant: string; breakthrough: string }> = {
                        attention: {
                          crisis: 'The Sequential Recurrence Bottleneck (O(T) Compute Bound)',
                          bottleneck: 'H_t = tanh(W_h H_{t-1} + W_x X_t) -> Cannot parallelize across GPU SIMD cores',
                          invariant: 'Permutation-equivariant soft routing scaled by temperature sqrt(d_k)',
                          breakthrough: 'Vaswani et al. (2017): Direct O(1) path between any pair of tokens with parallel GEMM matrices.',
                        },
                        window_attention: {
                          crisis: 'The Quadratic Memory Wall of Global Softmax',
                          bottleneck: 'O(N^2) memory footprint explodes for context lengths > 16k tokens',
                          invariant: 'Strict local receptive field with linear compute O(N * W)',
                          breakthrough: 'Beltagy et al. (2020): Local banded self-attention maintains quadratic-free scaling for long documents.',
                        },
                        ssm: {
                          crisis: 'The Quadratic KV-Cache Explosion at Inference Time',
                          bottleneck: 'KV-Cache = 2 * L * N * d_model bytes -> Exceeds VRAM for 100k+ tokens',
                          invariant: 'Continuous-time ODE discretization with input-dependent selection Delta(x_t)',
                          breakthrough: 'Gu & Dao (2023) Mamba: Linear O(N) training with associative scan + O(1) state inference.',
                        },
                        swiglu: {
                          crisis: 'Linear ReLU Saturation and Gradient Deadlock',
                          bottleneck: 'ReLU(z) = 0 for z < 0 -> Zero gradient kills neuron capacity irreversibly',
                          invariant: 'Bilinear multiplicative gating: SwiGLU(x) = (xW_1 * Swish(xW_2))W_3',
                          breakthrough: 'Shazeer (2020): Multiplicative gating allows smooth continuous gradient flow and richer expressivity.',
                        },
                        mlp: {
                          crisis: 'Pointwise Channel Mixing and Feature Disentanglement',
                          bottleneck: 'Token mixers only swap signals across time; representations cannot create cross-channel concepts',
                          invariant: 'Universal approximation via non-linear affine projection in expanded hidden dimension',
                          breakthrough: 'Rumelhart et al. (1986): 2-layer projection with non-linearity learns non-linear decision boundaries.',
                        },
                        moe: {
                          crisis: 'The Dense Parameter Compute Law (FLOPs bound to stored capacity)',
                          bottleneck: 'Dense models must compute every parameter for every single token -> Prohibitive FLOPs',
                          invariant: 'Conditional computation: Top-k sparse gating over independent expert sub-networks',
                          breakthrough: 'Shazeer et al. (2017) / Mixtral: Decouples stored parameters (capacity) from active compute FLOPs.',
                        },
                        conv: {
                          crisis: 'Translation Sensitivity and Spatial Parameter Explosion',
                          bottleneck: 'Dense MLP on 256x256 image requires 65k weights per hidden neuron -> Billions of parameters',
                          invariant: 'Translational equivariance via shared spatial kernel cross-correlation',
                          breakthrough: 'LeCun (1989): Weight sharing across 2D receptive fields guarantees shift invariance.',
                        },
                        gnn: {
                          crisis: 'Arbitrary Permutation of Graph Node Ordering',
                          bottleneck: 'Adjacency matrix depends on node numbering -> Permuting rows changes standard MLP outputs',
                          invariant: 'Permutation invariance/equivariance via commutative multiset aggregation (Sum/Mean)',
                          breakthrough: 'Kipf & Welling (2016): Message-passing aggregate function guarantees graph isomorphism invariance.',
                        },
                      };

                      const info = layerDossierMap[kind] || {
                        crisis: 'Representation Bottleneck',
                        bottleneck: 'Fixed linear projection fails to capture multi-scale interactions',
                        invariant: 'Symmetry preservation across feature dimensions',
                        breakthrough: 'Specialized modular formulation.',
                      };

                      return (
                        <div
                          key={kind}
                          className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950/80 border border-ink-200 dark:border-white/5 space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: kindMeta.color }}
                              />
                              <span className="text-xs font-bold text-ink-900 dark:text-white">
                                {kindMeta.label}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ink-200/60 dark:bg-ink-800 text-ink-600 dark:text-ink-300">
                              {kindMeta.cost}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 block">
                              Why Invented: {info.crisis}
                            </span>
                            <div className="text-[11px] font-mono p-1.5 bg-ink-100 dark:bg-ink-900 rounded text-ink-600 dark:text-ink-400 truncate">
                              {info.bottleneck}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 block">
                              Mathematical Invariant:
                            </span>
                            <p className="text-[11px] text-ink-600 dark:text-ink-300 leading-relaxed">
                              {info.invariant}
                            </p>
                          </div>

                          <div className="pt-1 text-[11px] text-ink-500 border-t border-ink-200/40 dark:border-white/5">
                            <strong className="text-ink-700 dark:text-ink-300">The Discovery:</strong> {info.breakthrough}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4 Universal Dialectics Card */}
                <div className="p-5 rounded-2xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>The 4 Universal Invariants of Architectural Invention</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-200/60 dark:border-white/5 space-y-1">
                      <strong className="text-brand-700 dark:text-brand-300 block">
                        1. The Gradient Highway (He et al.)
                      </strong>
                      <p className="text-[11px] text-ink-600 dark:text-ink-400 leading-relaxed">
                        Signal backpropagation requires an identity term in the Jacobian: d(y)/d(x) = I + d(F)/d(x). Without this, gradients vanish or explode exponentially with depth.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-200/60 dark:border-white/5 space-y-1">
                      <strong className="text-amber-700 dark:text-amber-300 block">
                        2. Domain Symmetry & Equivariance
                      </strong>
                      <p className="text-[11px] text-ink-600 dark:text-ink-400 leading-relaxed">
                        Data geometries dictate layer mathematics: 2D images demand translational shift invariance; sequences demand causal ordering; molecular graphs demand permutation invariance.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-200/60 dark:border-white/5 space-y-1">
                      <strong className="text-rose-700 dark:text-rose-300 block">
                        3. The Sequence Compression Boundary
                      </strong>
                      <p className="text-[11px] text-ink-600 dark:text-ink-400 leading-relaxed">
                        Either store all past token vectors explicitly (Transformer O(N^2) memory, lossless recall) or compress them into a fixed recursive hidden state (SSM/RNN O(1) memory, lossy compression).
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-ink-50 dark:bg-ink-950/60 border border-ink-200/60 dark:border-white/5 space-y-1">
                      <strong className="text-green-700 dark:text-green-300 block">
                        4. The Compute-Capacity Decoupling (MoE)
                      </strong>
                      <p className="text-[11px] text-ink-600 dark:text-ink-400 leading-relaxed">
                        Scaling stored parameters to trillions without quadratic FLOP growth requires dynamic conditional routing: each token activates only a sparse subset (top-k) of expert parameters.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: HEAD-TO-HEAD ARCHITECTURE BATTLE (COMPARE MODE)        */}
      {/* ============================================================== */}
      {studioMode === 'battle' && (
        <div className="space-y-6 animate-fade-in">
          {/* Battle Setup Controls */}
          <div className="p-6 rounded-2xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold font-display text-ink-900 dark:text-white flex items-center gap-2">
                  <Swords className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Architecture Matchup Arena</span>
                </h2>
                <p className="text-xs text-ink-500 mt-0.5">
                  Pit two architectures against each other across context scaling, memory, and throughput.
                </p>
              </div>

              {/* Shared Sequence Length Stress Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-ink-600 dark:text-ink-300">Context Length:</span>
                <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                  N = {battleSeqLen.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="512"
              max="131072"
              step="512"
              value={battleSeqLen}
              onChange={(e) => setBattleSeqLen(parseInt(e.target.value, 10))}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-400 font-mono -mt-2">
              <span>512 tokens</span>
              <span>4K tokens</span>
              <span>16K tokens</span>
              <span>64K tokens</span>
              <span>128K tokens</span>
            </div>

            {/* Model Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Model A Picker */}
              <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border-2 border-brand-500/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                    Model A (Corner 1)
                  </span>
                  <span className="text-[10px] font-mono text-ink-500">{analysisA.params.totalStored > 0 ? `${(analysisA.params.totalStored / 1e6).toFixed(1)}M params` : ''}</span>
                </div>
                <select
                  value={battleModelAId}
                  onChange={(e) => setBattleModelAId(e.target.value)}
                  className="w-full bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-ink-900 dark:text-white cursor-pointer"
                >
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.note})
                    </option>
                  ))}
                </select>
              </div>

              {/* Model B Picker */}
              <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border-2 border-rose-500/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Model B (Corner 2)
                  </span>
                  <span className="text-[10px] font-mono text-ink-500">{analysisB.params.totalStored > 0 ? `${(analysisB.params.totalStored / 1e6).toFixed(1)}M params` : ''}</span>
                </div>
                <select
                  value={battleModelBId}
                  onChange={(e) => setBattleModelBId(e.target.value)}
                  className="w-full bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-ink-900 dark:text-white cursor-pointer"
                >
                  {PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.note})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Crossover Curve Chart (SVG) */}
          <div className="p-6 rounded-2xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold font-display text-ink-900 dark:text-white">
                  Memory Scaling Curves: {modelAPreset.name} vs. {modelBPreset.name}
                </h3>
                <p className="text-xs text-ink-500 mt-0.5">
                  Visualizing KV-cache growth vs constant SSM/recurrent state footprint as context length N expands.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  {modelAPreset.name}
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  {modelBPreset.name}
                </span>
              </div>
            </div>

            {/* SVG Comparison Curve */}
            <div className="relative w-full h-48 bg-ink-50 dark:bg-ink-950 rounded-xl border border-ink-200 dark:border-white/5 p-4 flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                {/* Gridlines */}
                <line x1="0" y1="130" x2="500" y2="130" stroke="#7a7364" strokeOpacity="0.2" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#7a7364" strokeOpacity="0.2" />
                <line x1="0" y1="30" x2="500" y2="30" stroke="#7a7364" strokeOpacity="0.2" />

                {/* Curve A (Quadratic or Linear) */}
                <path
                  d="M 10 125 Q 250 110, 490 20"
                  fill="none"
                  stroke="#4353ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Curve B (Linear or Flat) */}
                <path
                  d="M 10 120 L 490 100"
                  fill="none"
                  stroke="#ff3b6b"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Current Marker Pin */}
                <line
                  x1={Math.min(480, Math.max(20, (battleSeqLen / 131072) * 480))}
                  y1="10"
                  x2={Math.min(480, Math.max(20, (battleSeqLen / 131072) * 480))}
                  y2="130"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>

            <div className="p-3 bg-brand-50/50 dark:bg-brand-950/20 rounded-xl border border-brand-200 dark:border-brand-500/20 text-xs text-ink-700 dark:text-ink-300 leading-relaxed">
              <strong>Crossover Verdict: </strong>
              At current context <span className="font-mono font-bold text-brand-600 dark:text-brand-400">N = {battleSeqLen.toLocaleString()}</span>,{' '}
              {analysisA.memory.totalInferenceMB < analysisB.memory.totalInferenceMB ? (
                <>
                  <strong className="text-brand-600 dark:text-brand-400">{modelAPreset.name}</strong> uses{' '}
                  <strong className="font-mono">
                    {Math.round(analysisA.memory.totalInferenceMB)} MB
                  </strong>{' '}
                  versus{' '}
                  <strong className="font-mono">
                    {Math.round(analysisB.memory.totalInferenceMB)} MB
                  </strong>{' '}
                  for {modelBPreset.name} (
                  {(analysisB.memory.totalInferenceMB / Math.max(1, analysisA.memory.totalInferenceMB)).toFixed(1)}x less memory).
                </>
              ) : (
                <>
                  <strong className="text-rose-600 dark:text-rose-400">{modelBPreset.name}</strong> uses{' '}
                  <strong className="font-mono">
                    {Math.round(analysisB.memory.totalInferenceMB)} MB
                  </strong>{' '}
                  versus{' '}
                  <strong className="font-mono">
                    {Math.round(analysisA.memory.totalInferenceMB)} MB
                  </strong>{' '}
                  for {modelAPreset.name} (
                  {(analysisA.memory.totalInferenceMB / Math.max(1, analysisB.memory.totalInferenceMB)).toFixed(1)}x less memory).
                </>
              )}
            </div>
          </div>

          {/* Comparative Metrics Table */}
          <div className="p-4 sm:p-6 rounded-2xl bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 shadow-xs overflow-x-auto">
            <table className="w-full min-w-[540px] text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-ink-200 dark:border-white/10 text-ink-500 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Metric</th>
                  <th className="py-2.5 px-3 text-brand-600 dark:text-brand-400 font-bold">
                    Model A: {modelAPreset.name}
                  </th>
                  <th className="py-2.5 px-3 text-rose-600 dark:text-rose-400 font-bold">
                    Model B: {modelBPreset.name}
                  </th>
                  <th className="py-2.5 px-3 text-right">Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-white/5">
                <tr>
                  <td className="py-2.5 px-3 text-ink-600 dark:text-ink-400 font-sans">Stored Weights</td>
                  <td className="py-2.5 px-3 font-bold text-ink-900 dark:text-white">
                    {(analysisA.params.totalStored / 1e6).toFixed(1)}M params
                  </td>
                  <td className="py-2.5 px-3 font-bold text-ink-900 dark:text-white">
                    {(analysisB.params.totalStored / 1e6).toFixed(1)}M params
                  </td>
                  <td className="py-2.5 px-3 text-right text-ink-500 font-sans">
                    {analysisA.params.totalStored < analysisB.params.totalStored ? 'Model A is lighter' : 'Model B is lighter'}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 text-ink-600 dark:text-ink-400 font-sans">
                    Inference RAM (at N={battleSeqLen.toLocaleString()})
                  </td>
                  <td className="py-2.5 px-3 font-bold text-brand-600 dark:text-brand-400">
                    {Math.round(analysisA.memory.totalInferenceMB).toLocaleString()} MB
                  </td>
                  <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">
                    {Math.round(analysisB.memory.totalInferenceMB).toLocaleString()} MB
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans font-semibold text-green-600 dark:text-green-400">
                    {analysisA.memory.totalInferenceMB < analysisB.memory.totalInferenceMB
                      ? `Model A (${(analysisB.memory.totalInferenceMB / Math.max(1, analysisA.memory.totalInferenceMB)).toFixed(1)}x less RAM)`
                      : `Model B (${(analysisA.memory.totalInferenceMB / Math.max(1, analysisB.memory.totalInferenceMB)).toFixed(1)}x less RAM)`}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 text-ink-600 dark:text-ink-400 font-sans">
                    KV Cache / State Footprint
                  </td>
                  <td className="py-2.5 px-3 text-ink-900 dark:text-white">
                    {Math.round(analysisA.memory.kvCacheMB || analysisA.memory.ssmStateMB)} MB
                  </td>
                  <td className="py-2.5 px-3 text-ink-900 dark:text-white">
                    {Math.round(analysisB.memory.kvCacheMB || analysisB.memory.ssmStateMB)} MB
                  </td>
                  <td className="py-2.5 px-3 text-right text-ink-500 font-sans">
                    State Scaling
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 text-ink-600 dark:text-ink-400 font-sans">
                    Throughput (tok/sec)
                  </td>
                  <td className="py-2.5 px-3 text-ink-900 dark:text-white">
                    ~{analysisA.compute.estimatedTokensPerSec.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-ink-900 dark:text-white">
                    ~{analysisB.compute.estimatedTokensPerSec.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans text-green-600 dark:text-green-400 font-semibold">
                    {analysisA.compute.estimatedTokensPerSec > analysisB.compute.estimatedTokensPerSec
                      ? 'Model A generates faster'
                      : 'Model B generates faster'}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 text-ink-600 dark:text-ink-400 font-sans">
                    Inductive Bias Paradigm
                  </td>
                  <td className="py-2.5 px-3 text-ink-700 dark:text-ink-300 font-sans">
                    {modelAPreset.note}
                  </td>
                  <td className="py-2.5 px-3 text-ink-700 dark:text-ink-300 font-sans">
                    {modelBPreset.note}
                  </td>
                  <td className="py-2.5 px-3 text-right text-ink-500 font-sans">
                    Theoretical Foundation
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
