/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Hardware-Aware Roofline Model & KV-Cache OOM Profiler:
 * Visualizes Arithmetic Intensity (FLOPs/Byte) vs Attainable TFLOPS across
 * accelerators (H100, A100, B200, 4090), categorizes compute-bound vs memory-bound layers,
 * and plots KV-cache VRAM saturation curves with explicit Out-Of-Memory (OOM) horizons.
 */

import React, { useState } from 'react';
import {
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Activity,
  Layers,
  HardDrive,
  Info,
  Sparkles,
} from 'lucide-react';
import { Design, Workload, GpuSpec, GPUS } from '../../studio/model';
import { Analysis } from '../../studio/calculator';

interface RooflineOomProfilerProps {
  design: Design;
  workload: Workload;
  analysis: Analysis;
}

export const RooflineOomProfiler: React.FC<RooflineOomProfilerProps> = ({
  design,
  workload,
  analysis,
}) => {
  const [selectedContextLen, setSelectedContextLen] = useState<number>(workload.seqLen);

  const gpu = analysis.gpu;
  const peakTflops = gpu.tflops; // Peak FP16/BF16 TFLOPS
  const bandwidthGBs = gpu.bandwidthGBs; // GB/s
  const kneeIntensity = (peakTflops * 1000) / bandwidthGBs; // FLOPs per Byte

  // Arithmetic Intensity of the active design
  const totalFlops = analysis.compute.forwardFlopsPerToken;
  const totalBytes = Math.max(1, analysis.memory.weightsMB * 1024 * 1024 + analysis.memory.kvCacheMB * 1024 * 1024);
  const modelIntensity = Math.min(2000, Math.max(0.5, totalFlops / Math.max(1, (totalBytes / workload.seqLen))));

  const isComputeBound = modelIntensity >= kneeIntensity;
  const attainableTflops = Math.min(peakTflops, (modelIntensity * bandwidthGBs) / 1000);
  const hardwareUtilizationPct = Math.min(100, Math.round((attainableTflops / peakTflops) * 100));

  // Compute KV Cache across sequence lengths: 1k, 4k, 16k, 32k, 64k, 128k
  const contextLengths = [1024, 4096, 16384, 32768, 65536, 131072];

  const hasAttention = design.block.some((l) => l.kind === 'attention' || l.kind === 'window_attention');
  const d = design.d;
  const numLayers = design.depth;

  // KV heads across attention layers
  const firstAttn = design.block.find((l) => l.kind === 'attention');
  const kvHeads = firstAttn?.kvHeads || firstAttn?.heads || 8;
  const totalHeads = firstAttn?.heads || 8;
  const headDim = Math.floor(d / totalHeads);
  const kvElementsPerToken = 2 * numLayers * kvHeads * headDim;

  const calculateKvRamGB = (seqLen: number, precBytes: number) => {
    if (!hasAttention) return 0;
    const bytes = kvElementsPerToken * seqLen * workload.batch * precBytes;
    return bytes / (1024 * 1024 * 1024);
  };

  const weightsGB = (analysis.memory.weightsMB || 0) / 1024;
  const gpuVramGB = gpu.memGB;

  // Find exact OOM threshold sequence length
  const oomThresholdTokens = hasAttention
    ? Math.floor(((gpuVramGB * 0.85 - weightsGB) * 1024 * 1024 * 1024) / (kvElementsPerToken * workload.batch * 2))
    : 1000000;

  const isOOM = (analysis.memory.totalInferenceMB / 1024) > gpuVramGB;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      {/* Top Banner Alert */}
      <div
        className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
          isOOM
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
            : isComputeBound
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isOOM ? (
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          ) : isComputeBound ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm">
              {isOOM
                ? `CRITICAL HARDWARE OOM: Architecture exceeds ${gpu.name} VRAM limit`
                : isComputeBound
                ? `COMPUTE-BOUND REGIME: Saturating ${gpu.name} Tensor Cores`
                : `MEMORY-BANDWIDTH BOUND REGIME: Execution limited by ${bandwidthGBs} GB/s Memory Bus`}
            </div>
            <p className="text-[11px] opacity-90 mt-0.5">
              {isOOM
                ? `Total memory requirement (${(analysis.memory.totalInferenceMB / 1024).toFixed(1)} GB) exceeds physical accelerator memory (${gpuVramGB} GB).`
                : isComputeBound
                ? `Arithmetic Intensity (${modelIntensity.toFixed(1)} FLOPs/Byte) exceeds the hardware knee (${kneeIntensity.toFixed(1)} FLOPs/Byte). Peak throughput achieved.`
                : `Arithmetic Intensity (${modelIntensity.toFixed(1)} FLOPs/Byte) is below the hardware saturation knee (${kneeIntensity.toFixed(1)} FLOPs/Byte). Memory latency dominates.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-black/20 font-bold">
            Efficiency: {hardwareUtilizationPct}% Peak
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): The Visual Roofline Model Curve */}
        <div className="lg:col-span-7 bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-ink-900 dark:text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Williams Roofline Model Chart ({gpu.name})
              </h3>
              <p className="text-[11px] text-ink-500">
                Log-Log plot: Arithmetic Intensity (FLOPs/Byte) vs Attainable TFLOPS
              </p>
            </div>
            <span className="text-[10px] font-mono text-ink-400">
              Knee $I^* = {Math.round(kneeIntensity)}$ FLOPs/B
            </span>
          </div>

          {/* SVG Roofline Chart */}
          <div className="relative bg-ink-950 rounded-xl p-3 border border-ink-800">
            <svg viewBox="0 0 500 240" className="w-full h-56 block">
              {/* Grid Lines */}
              <line x1="50" y1="20" x2="480" y2="20" stroke="#374151" strokeDasharray="3 3" />
              <line x1="50" y1="80" x2="480" y2="80" stroke="#374151" strokeDasharray="3 3" />
              <line x1="50" y1="140" x2="480" y2="140" stroke="#374151" strokeDasharray="3 3" />
              <line x1="50" y1="200" x2="480" y2="200" stroke="#4b5563" />

              {/* Y-Axis */}
              <line x1="50" y1="20" x2="50" y2="200" stroke="#4b5563" />
              <text x="45" y="24" fill="#9ca3af" fontSize="9" textAnchor="end" fontFamily="monospace">
                {peakTflops}T
              </text>
              <text x="45" y="84" fill="#9ca3af" fontSize="9" textAnchor="end" fontFamily="monospace">
                {Math.round(peakTflops * 0.5)}T
              </text>
              <text x="45" y="144" fill="#9ca3af" fontSize="9" textAnchor="end" fontFamily="monospace">
                {Math.round(peakTflops * 0.1)}T
              </text>

              {/* X-Axis Labels */}
              <text x="70" y="215" fill="#9ca3af" fontSize="9" fontFamily="monospace">1</text>
              <text x="170" y="215" fill="#9ca3af" fontSize="9" fontFamily="monospace">10</text>
              <text x="270" y="215" fill="#9ca3af" fontSize="9" fontFamily="monospace">100</text>
              <text x="370" y="215" fill="#9ca3af" fontSize="9" fontFamily="monospace">1000</text>
              <text x="460" y="215" fill="#9ca3af" fontSize="9" fontFamily="monospace">FLOPs/B</text>

              {/* Sloped Memory Bandwidth Line */}
              {/* Log scale mapping: x=50 + log10(I)*100 */}
              {/* Knee point coordinate */}
              {(() => {
                const kneeX = Math.min(450, Math.max(100, 70 + Math.log10(Math.max(1, kneeIntensity)) * 100));
                const kneeY = 30; // peak roof

                // User point mapping
                const userX = Math.min(460, Math.max(60, 70 + Math.log10(Math.max(0.5, modelIntensity)) * 100));
                const userY = isComputeBound ? kneeY : Math.min(190, Math.max(30, 200 - (userX - 50) * 0.65));

                return (
                  <>
                    {/* The Roofline Shape */}
                    <path
                      d={`M 50 200 L ${kneeX} ${kneeY} L 480 ${kneeY}`}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                    />

                    {/* Shaded Area Under Roofline */}
                    <path
                      d={`M 50 200 L ${kneeX} ${kneeY} L 480 ${kneeY} L 480 200 Z`}
                      fill="rgba(59, 130, 246, 0.08)"
                    />

                    {/* Knee Marker */}
                    <line x1={kneeX} y1={kneeY} x2={kneeX} y2="200" stroke="#f59e0b" strokeDasharray="2 2" />
                    <text x={kneeX} y="15" fill="#f59e0b" fontSize="9" textAnchor="middle" fontFamily="monospace">
                      Knee ({Math.round(kneeIntensity)})
                    </text>

                    {/* User Architecture Point */}
                    <circle cx={userX} cy={userY} r="7" fill={isComputeBound ? '#10b981' : '#f59e0b'} />
                    <circle cx={userX} cy={userY} r="12" fill={isComputeBound ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'} />

                    <text
                      x={userX}
                      y={userY - 14}
                      fill={isComputeBound ? '#34d399' : '#fbbf24'}
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {design.name} ({modelIntensity.toFixed(1)} FLOPs/B)
                    </text>
                  </>
                );
              })()}
            </svg>
          </div>

          {/* Layer-by-Layer Regime Diagnostics */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
              Layer-by-Layer Arithmetic Intensity Breakdown
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold text-rose-500">Attention QK^T</span>
                <div className="text-ink-900 dark:text-white font-bold">~{(workload.seqLen / 20).toFixed(0)} FLOPs/B</div>
                <p className="text-[10px] text-ink-500">Memory-bound at short context; compute-bound at long context.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-500">SwiGLU / MLP</span>
                <div className="text-ink-900 dark:text-white font-bold">~140 FLOPs/B</div>
                <p className="text-[10px] text-ink-500">Pure dense GEMM contraction. Heavily compute-bound.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-500">RMSNorm / Softmax</span>
                <div className="text-ink-900 dark:text-white font-bold">~2 FLOPs/B</div>
                <p className="text-[10px] text-ink-500">Elementwise scan. Severely memory-bandwidth bottlenecked.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): The KV-Cache Scaling & OOM Horizon Curve */}
        <div className="lg:col-span-5 bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-ink-900 dark:text-white flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              KV-Cache Memory Scaling & OOM Horizon
            </h3>
            <p className="text-[11px] text-ink-500">
              VRAM footprint as sequence length scales from 1K to 128K+ tokens
            </p>
          </div>

          {/* Context Length Matrix Table */}
          <div className="overflow-x-auto no-scrollbar border border-ink-200/60 dark:border-white/5 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-ink-100 dark:bg-ink-950 text-ink-500 text-[10px] uppercase">
                <tr>
                  <th className="py-2 px-2.5">Context</th>
                  <th className="py-2 px-2.5 text-right">FP16 (2B)</th>
                  <th className="py-2 px-2.5 text-right">FP8 (1B)</th>
                  <th className="py-2 px-2.5 text-right">INT4 (0.5B)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-white/5">
                {contextLengths.map((len) => {
                  const fp16 = calculateKvRamGB(len, 2);
                  const fp8 = calculateKvRamGB(len, 1);
                  const int4 = calculateKvRamGB(len, 0.5);
                  const totalFp16 = weightsGB + fp16;
                  const isExceeded = totalFp16 > gpuVramGB;

                  return (
                    <tr
                      key={len}
                      className={len === workload.seqLen ? 'bg-brand-50/70 dark:bg-brand-950/40 font-bold' : ''}
                    >
                      <td className="py-2 px-2.5">
                        {len >= 1024 ? `${len / 1024}K` : len}
                        {len === workload.seqLen && <span className="ml-1 text-brand-600">★</span>}
                      </td>
                      <td className={`py-2 px-2.5 text-right ${isExceeded ? 'text-rose-600 font-bold' : ''}`}>
                        {fp16 < 0.1 ? `${Math.round(fp16 * 1024)}M` : `${fp16.toFixed(1)}G`}
                      </td>
                      <td className="py-2 px-2.5 text-right text-ink-600 dark:text-ink-400">
                        {fp8 < 0.1 ? `${Math.round(fp8 * 1024)}M` : `${fp8.toFixed(1)}G`}
                      </td>
                      <td className="py-2 px-2.5 text-right text-emerald-600">
                        {int4 < 0.1 ? `${Math.round(int4 * 1024)}M` : `${int4.toFixed(1)}G`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* OOM Horizon Gauge */}
          <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-950 border border-ink-200/60 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-ink-500">
                Single GPU OOM Horizon ({gpu.name})
              </span>
              <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                N = {hasAttention ? oomThresholdTokens.toLocaleString() : '∞ (Constant O(1))'} tokens
              </span>
            </div>

            {hasAttention && (
              <div className="w-full bg-ink-200 dark:bg-ink-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    workload.seqLen > oomThresholdTokens ? 'bg-rose-500' : 'bg-brand-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((workload.seqLen / oomThresholdTokens) * 100))}%`,
                  }}
                />
              </div>
            )}

            <p className="text-[10px] text-ink-500 leading-relaxed">
              {hasAttention
                ? `Beyond ${oomThresholdTokens.toLocaleString()} tokens, weights + KV-cache will overflow the physical ${gpuVramGB} GB VRAM buffer. Mitigate by adopting GQA (Grouped-Query Attention), DeepSeek MLA, or Mamba SSM hybrid layers.`
                : 'Constant O(1) state footprint: This architecture has no KV cache and will never OOM on sequence length alone.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
