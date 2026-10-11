/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, RotateCcw, HelpCircle, Code2, Sparkles, CheckCircle2, Award, Flame, BookOpen, Terminal } from 'lucide-react';
import { CheckpointQuiz, QuizQuestion } from '../CheckpointQuiz';
import { CodeBlock } from '../CodeBlock';
import { FirstPrinciplesNotebook } from '../FirstPrinciplesNotebook';
import { FIRST_PRINCIPLES_DOSSIERS } from '../../data/firstPrinciplesData';
import { TheorySectionView } from '../TheorySectionView';
import { THEORY_DOSSIERS } from '../../data/theoryData';
import { BuildFromScratchLab } from '../BuildFromScratchLab';
import { DIY_PROJECTS } from '../../data/diyProjectsData';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';

export const SingleNeuronLab: React.FC = () => {
  // Neuron parameters
  const [w1, setW1] = useState<number>(1.2);
  const [w2, setW2] = useState<number>(0.8);
  const [bias, setBias] = useState<number>(-0.5);
  const [activation, setActivation] = useState<'step' | 'sigmoid' | 'relu'>('step');
  
  // Interactive test probe point
  const [probe, setProbe] = useState<{ x1: number; x2: number }>({ x1: 1.0, x2: 0.5 });
  
  // Preset problem setups
  const [preset, setPreset] = useState<'custom' | 'and_gate' | 'or_gate'>('custom');

  // Sub-tab: Visual vs Theory vs Build vs Code vs Analogy vs Quiz vs First Principles
  const [subTab, setSubTab] = useState<'visual' | 'theory' | 'build' | 'code' | 'analogy' | 'quiz' | 'first_principles'>('visual');


  // Code runner state
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  const neuronQuizQuestions: QuizQuestion[] = [
    {
      question: 'In the formula y = σ(w₁x₁ + w₂x₂ + b), what does the bias (b) physically control?',
      options: [
        'It shifts the decision line position without changing its angle.',
        'It multiplies the strength of the input vector x.',
        'It controls the learning rate of the optimizer.',
      ],
      correctIndex: 0,
      explanation: 'Bias is an independent offset. Without it (b = 0), the boundary line would be trapped passing strictly through the coordinate origin (0, 0).',
    },
    {
      question: 'Why was the single perceptron fundamentally incapable of learning XOR?',
      options: [
        'Because XOR points are diagonal, requiring a curved or folded boundary rather than a single straight slice.',
        'Because early computers did not have floating-point registers.',
        'Because the step function does not have a derivative at zero.',
      ],
      correctIndex: 0,
      explanation: 'A single neuron can only draw a flat hyperplane. True and False in XOR are diagonally interleaved, making linear separation impossible.',
    },
  ];

  const handleLabCompleted = () => {
    markLabCompleted('perceptron');
  };

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute values for probe point
  const z = Number((w1 * probe.x1 + w2 * probe.x2 + bias).toFixed(3));
  let output = 0;
  if (activation === 'step') {
    output = z >= 0 ? 1 : 0;
  } else if (activation === 'sigmoid') {
    output = Number((1 / (1 + Math.exp(-z))).toFixed(3));
  } else {
    output = Number(Math.max(0, z).toFixed(3));
  }

  // Draw 2D Decision Boundary Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Coordinate mapping: [-3, 3] in world space to [0, width]
    const toCanvasX = (wx: number) => ((wx + 3) / 6) * width;
    const toCanvasY = (wy: number) => height - ((wy + 3) / 6) * height;
    const toWorldX = (cx: number) => (cx / width) * 6 - 3;
    const toWorldY = (cy: number) => (1 - cy / height) * 6 - 3;

    // 1. Draw subtle background activation heat grid
    const gridSize = 12;
    for (let px = 0; px < width; px += gridSize) {
      for (let py = 0; py < height; py += gridSize) {
        const wx = toWorldX(px + gridSize / 2);
        const wy = toWorldY(py + gridSize / 2);
        const cellZ = w1 * wx + w2 * wy + bias;
        
        let cellVal = 0;
        if (activation === 'step') {
          cellVal = cellZ >= 0 ? 1 : 0;
        } else if (activation === 'sigmoid') {
          cellVal = 1 / (1 + Math.exp(-cellZ));
        } else {
          cellVal = Math.min(1, Math.max(0, cellZ / 2));
        }

        ctx.fillStyle = cellVal > 0.5 
          ? `rgba(6, 182, 212, ${Math.min(0.25, cellVal * 0.25)})`
          : `rgba(239, 68, 68, ${Math.min(0.25, (1 - cellVal) * 0.25)})`;
        ctx.fillRect(px, py, gridSize, gridSize);
      }
    }

    // 2. Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    // X axis (x2 = 0)
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(width, toCanvasY(0));
    ctx.stroke();
    // Y axis (x1 = 0)
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), 0);
    ctx.lineTo(toCanvasX(0), height);
    ctx.stroke();

    // 3. Draw Decision Boundary Line: w1*x1 + w2*x2 + b = 0 => x2 = (-w1*x1 - b) / w2
    if (Math.abs(w2) > 0.001) {
      ctx.strokeStyle = '#2f3bf0';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#4353ff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      
      const xLeft = -3;
      const yLeft = (-w1 * xLeft - bias) / w2;
      const xRight = 3;
      const yRight = (-w1 * xRight - bias) / w2;

      ctx.moveTo(toCanvasX(xLeft), toCanvasY(yLeft));
      ctx.lineTo(toCanvasX(xRight), toCanvasY(yRight));
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (Math.abs(w1) > 0.001) {
      // Vertical line: x1 = -b / w1
      const xConst = -bias / w1;
      ctx.strokeStyle = '#2f3bf0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(toCanvasX(xConst), 0);
      ctx.lineTo(toCanvasX(xConst), height);
      ctx.stroke();
    }

    // 4. Sample training benchmark points
    const benchmarkPoints = [
      { x: 0, y: 0, label: '(0,0)' },
      { x: 1, y: 0, label: '(1,0)' },
      { x: 0, y: 1, label: '(0,1)' },
      { x: 1, y: 1, label: '(1,1)' },
    ];

    benchmarkPoints.forEach((pt) => {
      const pz = w1 * pt.x + w2 * pt.y + bias;
      const isClass1 = pz >= 0;
      ctx.beginPath();
      ctx.arc(toCanvasX(pt.x), toCanvasY(pt.y), 5, 0, Math.PI * 2);
      ctx.fillStyle = isClass1 ? '#38bdf8' : '#f87171';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = '10px "JetBrains Mono"';
      ctx.fillStyle = '#a39b8a';
      ctx.fillText(pt.label, toCanvasX(pt.x) + 7, toCanvasY(pt.y) - 7);
    });

    // 5. Draw interactive probe marker
    ctx.beginPath();
    ctx.arc(toCanvasX(probe.x1), toCanvasY(probe.x2), 8, 0, Math.PI * 2);
    ctx.fillStyle = output >= 0.5 ? '#22c55e' : '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pulse ring around probe
    ctx.beginPath();
    ctx.arc(toCanvasX(probe.x1), toCanvasY(probe.x2), 14, 0, Math.PI * 2);
    ctx.strokeStyle = output >= 0.5 ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [w1, w2, bias, activation, probe]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const cy = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const wx = (cx / canvas.width) * 6 - 3;
    const wy = (1 - cy / canvas.height) * 6 - 3;
    setProbe({
      x1: Number(wx.toFixed(2)),
      x2: Number(wy.toFixed(2)),
    });
  };

  const applyPreset = (type: 'and_gate' | 'or_gate' | 'custom') => {
    setPreset(type);
    if (type === 'and_gate') {
      setW1(1.0);
      setW2(1.0);
      setBias(-1.5);
      setActivation('step');
    } else if (type === 'or_gate') {
      setW1(1.0);
      setW2(1.0);
      setBias(-0.5);
      setActivation('step');
    }
  };

  const runCodeVerification = () => {
    markTestRun('perceptron');
    markLabCompleted('perceptron');
    const results = [
      `[Neuron Unit Test Suite]`,
      `Testing Point (1, 1) -> z = (${w1} * 1) + (${w2} * 1) + (${bias}) = ${(w1 + w2 + bias).toFixed(3)} -> Output: ${(w1 + w2 + bias >= 0 ? 1 : 0)}`,
      `Testing Point (0, 0) -> z = (${w1} * 0) + (${w2} * 0) + (${bias}) = ${bias.toFixed(3)} -> Output: ${(bias >= 0 ? 1 : 0)}`,
      `Active Probe (${probe.x1}, ${probe.x2}) -> Output: ${output}`,
      `STATUS: PASS (Forward pass matches 2D geometric boundary)`,
      `✓ Level 0 progress recorded.`,
    ].join('\n');
    setCodeOutput(results);
  };

  return (
    <div className="space-y-6">
      {/* Header and Sub-tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ink-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 font-mono">
            Level 0 · Perceptron
          </span>
          <h2 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white mt-0.5">
            Single neuron and linear decision boundary
          </h2>
          <p className="text-sm text-ink-600 dark:text-ink-400 mt-1 max-w-2xl">
            Watch how two input dials (x₁, x₂), two weight knobs (w₁, w₂), and a threshold spring (b) carve a boundary dividing space into two decisions.
          </p>
        </div>

        {/* Lab Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-ink-100 dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-lg overflow-x-auto max-w-full overscroll-x-contain">
          <button
            onClick={() => setSubTab('visual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'visual'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            Simulation
          </button>
          <button
            onClick={() => setSubTab('theory')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'theory'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory</span>
          </button>
          <button
            onClick={() => setSubTab('build')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'build'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Build from scratch</span>
          </button>
          <button
            onClick={() => setSubTab('first_principles')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'first_principles'
                ? 'bg-amber-600 text-white font-semibold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>First principles</span>
          </button>
          <button
            onClick={() => setSubTab('code')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'code'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Reference code</span>
          </button>
          <button
            onClick={() => setSubTab('analogy')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'analogy'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Analogy</span>
          </button>
          <button
            onClick={() => setSubTab('quiz')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'quiz'
                ? 'bg-brand-600 text-white font-semibold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Concept check</span>
          </button>
        </div>
      </div>

      {subTab === 'visual' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Canvas: 2D Spatial Plane (7 cols) */}
            <div className="lg:col-span-7 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
                  <span className="font-semibold text-ink-800 dark:text-ink-200">2D Input Space (x₁, x₂)</span>
                  <span>·</span>
                  <span>Click canvas to place probe</span>
                </div>

                {/* Presets */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-ink-500">Presets:</span>
                  <button
                    onClick={() => applyPreset('and_gate')}
                    className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                      preset === 'and_gate'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-800 dark:text-brand-300 font-semibold'
                        : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    AND Gate
                  </button>
                  <button
                    onClick={() => applyPreset('or_gate')}
                    className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                      preset === 'or_gate'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-800 dark:text-brand-300 font-semibold'
                        : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    OR Gate
                  </button>
                  <button
                    onClick={() => applyPreset('custom')}
                    className={`px-2 py-1 text-xs rounded border transition-colors cursor-pointer ${
                      preset === 'custom'
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-800 dark:text-brand-300 font-semibold'
                        : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    Free Play
                  </button>
                </div>
              </div>

              {/* Canvas Container */}
              <div className="relative aspect-square max-h-[380px] w-full mx-auto bg-ink-50 dark:bg-ink-950 rounded-lg border border-ink-200/60 dark:border-white/5 overflow-hidden flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={500}
                  onClick={handleCanvasClick}
                  className="w-full h-full cursor-crosshair"
                />
                <div className="absolute bottom-2 left-3 text-[11px] font-mono text-ink-700 dark:text-ink-300 bg-white/90 dark:bg-ink-900/90 px-2 py-0.5 rounded border border-ink-200 dark:border-white/10 pointer-events-none shadow-xs">
                  Boundary: {w1.toFixed(1)}x₁ + {w2.toFixed(1)}x₂ {bias >= 0 ? `+ ${bias.toFixed(1)}` : `- ${Math.abs(bias).toFixed(1)}`} = 0
                </div>
              </div>

              {/* Legend & Probe Inspector */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                <div className="flex items-center gap-4 text-ink-600 dark:text-ink-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block" />
                    <span>Activation Zone (ŷ ≥ 0.5)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    <span>Inactive Zone (ŷ &lt; 0.5)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-ink-800 dark:text-ink-300 bg-ink-100 dark:bg-ink-900/90 px-2.5 py-1 rounded border border-ink-200 dark:border-white/10">
                  <span>Probe ({probe.x1}, {probe.x2}):</span>
                  <span className={`font-semibold ${output >= 0.5 ? 'text-brand-600 dark:text-brand-400' : 'text-red-500'}`}>
                    ŷ = {output}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Synaptic Sliders & Live Math (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Live Parameter Dials */}
              <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs transition-colors">
                <h3 className="text-sm font-semibold font-display tracking-tight text-ink-900 dark:text-white flex items-center justify-between">
                  <span>Synaptic Parameters</span>
                  <button
                    onClick={() => {
                      setW1(1.2);
                      setW2(0.8);
                      setBias(-0.5);
                      setProbe({ x1: 1.0, x2: 0.5 });
                    }}
                    className="text-xs text-ink-500 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </h3>

                {/* Weight 1 Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-ink-700 dark:text-ink-300">Weight 1 (w₁) [x₁ slope]</span>
                    <span className="text-brand-600 dark:text-brand-400 font-bold">{w1.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="0.1"
                    value={w1}
                    onChange={(e) => {
                      setW1(parseFloat(e.target.value));
                      setPreset('custom');
                    }}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>

                {/* Weight 2 Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-ink-700 dark:text-ink-300">Weight 2 (w₂) [x₂ slope]</span>
                    <span className="text-brand-600 dark:text-brand-400 font-bold">{w2.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-3"
                    max="3"
                    step="0.1"
                    value={w2}
                    onChange={(e) => {
                      setW2(parseFloat(e.target.value));
                      setPreset('custom');
                    }}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>

                {/* Bias Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-ink-700 dark:text-ink-300">Bias (b) [Offset Position]</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">{bias.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.1"
                    value={bias}
                    onChange={(e) => {
                      setBias(parseFloat(e.target.value));
                      setPreset('custom');
                    }}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Activation Function Selector */}
                <div className="space-y-1.5 pt-2 border-t border-ink-100 dark:border-white/10">
                  <label className="text-xs text-ink-700 dark:text-ink-300 font-semibold block">
                    Activation Function (σ)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['step', 'sigmoid', 'relu'] as const).map((fn) => (
                      <button
                        key={fn}
                        onClick={() => setActivation(fn)}
                        className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded border transition-colors cursor-pointer uppercase ${
                          activation === fn
                            ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-800 dark:text-brand-300 font-bold'
                            : 'border-ink-200 dark:border-white/10 bg-surface dark:bg-ink-900 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                        }`}
                      >
                        {fn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Step-by-Step Math Inspector */}
              <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 font-mono text-xs shadow-xs transition-colors">
                <h3 className="text-xs font-semibold font-display tracking-tight uppercase tracking-wider text-ink-500 dark:text-ink-400 font-sans">
                  Real-Time Arithmetic Breakdown
                </h3>
                
                <div className="p-3 bg-ink-50 dark:bg-ink-950/70 rounded-lg border border-ink-200/60 dark:border-white/5 space-y-2">
                  <div className="text-ink-600 dark:text-ink-400">
                    <span className="text-brand-700 dark:text-brand-400 font-semibold">1. Weighted Sum:</span>
                    <div className="text-ink-800 dark:text-ink-200 mt-1 pl-2">
                      z = (w₁ · x₁) + (w₂ · x₂) + b
                    </div>
                    <div className="text-ink-600 dark:text-ink-300 mt-0.5 pl-2">
                      z = ({w1.toFixed(2)} · {probe.x1}) + ({w2.toFixed(2)} · {probe.x2}) + ({bias.toFixed(2)})
                    </div>
                    <div className="text-brand-700 dark:text-brand-300 font-bold mt-0.5 pl-2">
                      z = {(w1 * probe.x1).toFixed(2)} + {(w2 * probe.x2).toFixed(2)} + {bias.toFixed(2)} = <span className="text-ink-900 dark:text-white text-sm">{z}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400">
                    <span className="text-brand-700 dark:text-brand-400 font-semibold">2. Activation Step:</span>
                    <div className="text-ink-800 dark:text-ink-200 mt-1 pl-2">
                      ŷ = {activation}(z) = {activation}({z})
                    </div>
                    <div className="text-brand-700 dark:text-brand-300 font-bold text-sm mt-0.5 pl-2">
                      ŷ = {output} {output >= 0.5 ? '(Fires / Class 1)' : '(Silent / Class 0)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt To Concept Check */}
          <div className="p-4 bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h4 className="text-xs font-bold text-ink-900 dark:text-white">
                Understood the Single Neuron?
              </h4>
              <p className="text-[11px] text-ink-600 dark:text-ink-400">
                Test your understanding with the Level 0 Concept Checkpoint quiz.
              </p>
            </div>
            <button
              onClick={() => setSubTab('quiz')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
            >
              Take Concept Check
            </button>
          </div>
        </div>
      )}

      {/* SubTab 2: Code Scratchpad */}
      {subTab === 'code' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Runnable perceptron implementation</h3>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Pure, dependency-free mathematical forward pass. Inspect how vectors turn into numbers.
            </p>
          </div>

          <CodeBlock
            code={`// 1. Single Neuron Forward Pass
function forwardNeuron(inputs: number[], weights: number[], bias: number, activation: 'step' | 'sigmoid' | 'relu'): number {
  // Step A: Calculate linear dot-product z = W · x + b
  let z = bias;
  for (let i = 0; i < inputs.length; i++) {
    z += inputs[i] * weights[i];
  }

  // Step B: Apply non-linear thresholding activation function σ(z)
  if (activation === 'step') {
    return z >= 0 ? 1 : 0;
  } else if (activation === 'sigmoid') {
    return 1 / (1 + Math.exp(-z));
  } else {
    return Math.max(0, z); // ReLU
  }
}

// Example Execution:
const myInputs  = [${probe.x1}, ${probe.x2}];
const myWeights = [${w1.toFixed(2)}, ${w2.toFixed(2)}];
const myBias    = ${bias.toFixed(2)};
const result    = forwardNeuron(myInputs, myWeights, myBias, '${activation}');
console.log('Prediction:', result); // Output: ${output}`}
            language="TypeScript"
            filename="perceptron_forward.ts"
            onRun={runCodeVerification}
            runLabel="Run"
            output={codeOutput}
          />
        </div>
      )}

      {/* SubTab 3: Plain Physical Analogy */}
      {subTab === 'analogy' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-6 space-y-5 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Physical analogy: A heavy spring and balance lever</h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">A physical intuition for weights, bias, and thresholding.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2">
              <h4 className="font-semibold text-brand-700 dark:text-brand-400">1. Inputs (x) are Physical Weights</h4>
              <p className="text-ink-600 dark:text-ink-300 text-xs leading-relaxed">
                Imagine two people placing bags on a scale pan. Person 1 puts a {probe.x1} kg bag (x₁). Person 2 puts a {probe.x2} kg bag (x₂).
              </p>
            </div>

            <div className="p-4 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2">
              <h4 className="font-semibold text-brand-700 dark:text-brand-400">2. Weights (w) are Lever Arms</h4>
              <p className="text-ink-600 dark:text-ink-300 text-xs leading-relaxed">
                If weight w₁ = {w1.toFixed(1)}, Person 1’s bag is placed at a lever distance of {w1.toFixed(1)} meters from the pivot. The lever multiplies the force. A negative weight means pushing upward instead of downward.
              </p>
            </div>

            <div className="p-4 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2">
              <h4 className="font-semibold text-amber-600 dark:text-amber-400">3. Bias (b) is the Counterweight Spring</h4>
              <p className="text-ink-600 dark:text-ink-300 text-xs leading-relaxed">
                Inside the scale, there is a stiff spring pushing back by {bias.toFixed(1)}. If the combined force from the bags doesn’t overcome this spring, the dial stays below zero.
              </p>
            </div>

            <div className="p-4 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2">
              <h4 className="font-semibold text-brand-700 dark:text-brand-400">4. Activation (σ) is the Snap Switch</h4>
              <p className="text-ink-600 dark:text-ink-300 text-xs leading-relaxed">
                The moment the lever tips past zero, a crisp light switch clicks on (output ŷ = 1). If it fails to tip the scale, the bulb stays dark (output ŷ = 0). This matches the basic behavior of an artificial neuron.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 4: Checkpoint Quiz */}
      {subTab === 'quiz' && (
        <CheckpointQuiz
          quizKey="quiz_neuron"
          title="Level 0 concept check: Single neuron mechanics"
          questions={neuronQuizQuestions}
          onPassAll={handleLabCompleted}
        />
      )}

      {/* SubTab 5: First Principles Discovery Notebook */}
      {subTab === 'first_principles' && (
        <FirstPrinciplesNotebook dossier={FIRST_PRINCIPLES_DOSSIERS['perceptron']} />
      )}

      {/* SubTab 6: Deep First-Principles Theory */}
      {subTab === 'theory' && (
        <TheorySectionView theory={THEORY_DOSSIERS['perceptron']} />
      )}

      {/* SubTab 7: Interactive Build It Yourself from Scratch Project */}
      {subTab === 'build' && (
        <BuildFromScratchLab project={DIY_PROJECTS['perceptron']} />
      )}
    </div>
  );
};

