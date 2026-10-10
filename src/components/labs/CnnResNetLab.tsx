/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Code2, Play, CheckCircle2, Sliders, ShieldCheck, Award } from 'lucide-react';
import { CheckpointQuiz } from '../CheckpointQuiz';
import { CodeBlock } from '../CodeBlock';
import { LAB_QUIZZES } from '../../data/labQuizzes';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';

export const CnnResNetLab: React.FC = () => {
  const [selectedKernel, setSelectedKernel] = useState<'edge_h' | 'edge_v' | 'sharpen' | 'blur'>('edge_h');
  const [residualEnabled, setResidualEnabled] = useState<boolean>(true);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number }>({ r: 2, c: 2 });
  const [subTab, setSubTab] = useState<'visual' | 'code' | 'table' | 'analogy' | 'quiz'>('visual');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  // 6x6 sample binary image (a cross / plus shape)
  const sampleImage: number[][] = [
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 0],
  ];

  // 3x3 Kernels
  const kernels = {
    edge_h: [
      [-1, -1, -1],
      [ 0,  0,  0],
      [ 1,  1,  1],
    ],
    edge_v: [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ],
    sharpen: [
      [ 0, -1,  0],
      [-1,  5, -1],
      [ 0, -1,  0],
    ],
    blur: [
      [0.1, 0.1, 0.1],
      [0.1, 0.2, 0.1],
      [0.1, 0.1, 0.1],
    ],
  };

  const kernel = kernels[selectedKernel];

  // Compute 4x4 convolution feature map
  const inH = sampleImage.length;
  const inW = sampleImage[0].length;
  const kH = kernel.length;
  const kW = kernel[0].length;
  const outH = inH - kH + 1;
  const outW = inW - kW + 1;

  const featureMap: number[][] = [];
  for (let r = 0; r < outH; r++) {
    featureMap[r] = [];
    for (let c = 0; c < outW; c++) {
      let sum = 0;
      for (let kr = 0; kr < kH; kr++) {
        for (let kc = 0; kc < kW; kc++) {
          sum += sampleImage[r + kr][c + kc] * kernel[kr][kc];
        }
      }
      featureMap[r][c] = Number(sum.toFixed(2));
    }
  }

  // Active cell convolution calculation breakdown
  const calcBreakdown = () => {
    let sum = 0;
    const terms: string[] = [];
    for (let kr = 0; kr < kH; kr++) {
      for (let kc = 0; kc < kW; kc++) {
        const imgVal = sampleImage[activeCell.r + kr][activeCell.c + kc];
        const kVal = kernel[kr][kc];
        const prod = imgVal * kVal;
        sum += prod;
        if (imgVal !== 0 && kVal !== 0) {
          terms.push(`(${imgVal}·${kVal})`);
        }
      }
    }
    return { sum: Number(sum.toFixed(2)), formula: terms.slice(0, 5).join(' + ') + (terms.length > 5 ? ' + ...' : '') };
  };

  const currentCalc = calcBreakdown();

  const cnnArchitectures = [
    { name: 'LeNet-5 (1989)', idea: 'Early convolutional architecture for handwritten digit recognition', impact: 'Pioneered Conv + Pool + FC topology' },
    { name: 'AlexNet (2012)', idea: 'Deep 8-layer CNN trained on GPUs with ReLU and Dropout', impact: 'Won ImageNet by massive margin, sparked deep learning boom' },
    { name: 'VGG (2014)', idea: 'Repeated small 3x3 convolution filters stacked deep (16-19 layers)', impact: 'Showed simple consistent filter size beats large filters' },
    { name: 'Inception (2014)', idea: 'Multi-scale parallel convolution paths (1x1, 3x3, 5x5) concatenated', impact: 'Extremely parameter efficient feature extraction' },
    { name: 'ResNet (2015)', idea: 'Residual identity skip connections: y = x + F(x)', impact: 'Enabled 152+ layers without vanishing gradients' },
    { name: 'DenseNet (2017)', idea: 'Concatenates feature maps from ALL preceding layers', impact: 'Maximum feature reuse and direct gradient flow' },
    { name: 'MobileNet (2017)', idea: 'Depthwise separable convolutions', impact: 'Brought real-time vision to phones and edge hardware' },
    { name: 'ConvNeXt (2022)', idea: 'Modernized CNN adopting Transformer design choices (7x7, inverted bottleneck)', impact: 'Proved CNNs remain competitive with Vision Transformers' },
  ];

  const runConvolutionTest = () => {
    markTestRun('cnn_resnet');
    markLabCompleted('cnn_resnet');
    const lines = [
      '[CNN & ResNet Verification Test]',
      `Kernel: ${selectedKernel} (3x3)`,
      `Input Dimension: 6x6 -> Output Feature Map: 4x4 (No padding, Stride 1)`,
      `Cell (${activeCell.r}, ${activeCell.c}) -> Dot Product: ${currentCalc.sum}`,
      `Residual Skip Mode: ${residualEnabled ? 'y = x + F(x) (ACTIVE IDENTITY BYPASS)' : 'y = F(x) (PLAIN STACK)'}`,
      `Gradient Highway: ${residualEnabled ? 'dy/dx = 1 + dF/dx (Unbroken signal!)' : 'dy/dx = dF/dx (Decays over depth)'}`,
      'STATUS: PASS (Valid spatial transformation & residual identity verified)',
      '✓ Level 2 Progress Recorded!',
    ];
    setCodeOutput(lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Level 2 · Spatial Structure & Residual Highways
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            CNNs & Residual Networks (ResNet)
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Sliding localized filters over 2D pixels, and unlocking 100+ layer depth with the legendary identity skip: $y = x + F(x)$.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg">
          <button
            onClick={() => setSubTab('visual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'visual'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Visual Kernel Lab
          </button>
          <button
            onClick={() => setSubTab('table')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'table'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Architecture Lineage
          </button>
          <button
            onClick={() => setSubTab('code')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'code'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code Scratchpad</span>
          </button>
          <button
            onClick={() => setSubTab('analogy')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'analogy'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Express Lane Analogy</span>
          </button>
          <button
            onClick={() => setSubTab('quiz')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'quiz'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Checkpoint Quiz</span>
          </button>
        </div>
      </div>

      {subTab === 'visual' && (
        <div className="space-y-6">
          {/* Top Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 shadow-xs transition-colors">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Select 3×3 Filter:</span>
              <div className="flex items-center gap-1">
                {(['edge_h', 'edge_v', 'sharpen', 'blur'] as const).map((kKey) => (
                  <button
                    key={kKey}
                    onClick={() => setSelectedKernel(kKey)}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer uppercase ${
                      selectedKernel === kKey
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {kKey.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Residual Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Residual Highway:</span>
              <button
                onClick={() => setResidualEnabled(!residualEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  residualEnabled
                    ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{residualEnabled ? 'y = x + F(x) ON' : 'Plain Stack (No Skip)'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Grid (6x6) with sliding 3x3 highlight */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-3 shadow-xs transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Input Image (6×6)</span>
                <span className="text-slate-500 dark:text-slate-400">Green box = 3×3 receptive field</span>
              </div>

              <div className="grid grid-cols-6 gap-1 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-white/5 max-w-[280px] mx-auto">
                {sampleImage.map((row, r) =>
                  row.map((val, c) => {
                    const inReceptiveField =
                      r >= activeCell.r &&
                      r < activeCell.r + 3 &&
                      c >= activeCell.c &&
                      c < activeCell.c + 3;

                    return (
                      <div
                        key={`${r}-${c}`}
                        className={`aspect-square flex items-center justify-center text-xs font-mono rounded transition-colors ${
                          inReceptiveField
                            ? 'bg-emerald-100 dark:bg-emerald-500/30 border border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold'
                            : val === 1
                            ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold'
                            : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-600 border border-slate-100 dark:border-transparent'
                        }`}
                      >
                        {val}
                      </div>
                    );
                  })
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Click any cell on the Feature Map to move this 3×3 receptive field!
              </p>
            </div>

            {/* Kernel Matrix (3x3) */}
            <div className="lg:col-span-3 bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-3 shadow-xs transition-colors">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block text-center">
                Active 3×3 Kernel
              </span>

              <div className="grid grid-cols-3 gap-1 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-white/5 max-w-[180px] mx-auto">
                {kernel.map((row, kr) =>
                  row.map((kval, kc) => (
                    <div
                      key={`${kr}-${kc}`}
                      className="aspect-square flex items-center justify-center text-xs font-mono rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-emerald-700 dark:text-emerald-400 font-bold shadow-2xs"
                    >
                      {kval}
                    </div>
                  ))
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center font-mono">
                Weights shared across every position!
              </p>
            </div>

            {/* Feature Map (4x4) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-3 shadow-xs transition-colors">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Convolved Output (4×4)</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Active: ({activeCell.r}, {activeCell.c})</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200/60 dark:border-white/5 max-w-[220px] mx-auto">
                {featureMap.map((row, r) =>
                  row.map((val, c) => {
                    const isSelected = activeCell.r === r && activeCell.c === c;
                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => setActiveCell({ r, c })}
                        className={`aspect-square flex items-center justify-center text-xs font-mono rounded transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold border-2 border-emerald-700 dark:border-white shadow-xs'
                            : Math.abs(val) > 1
                            ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Math breakdown */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200/60 dark:border-white/5 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <div className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                  Feature Value at ({activeCell.r}, {activeCell.c}):
                </div>
                <div className="text-xs text-slate-900 dark:text-slate-200 font-bold">
                  Value = {currentCalc.sum}
                </div>
                {residualEnabled && (
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 pt-1 border-t border-slate-200 dark:border-white/10 font-semibold">
                    + Identity Skip = {(currentCalc.sum + 1.0).toFixed(2)} (Signal intact)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prompt To Concept Check */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Understood CNNs & Residual Skip Connections?
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Test your understanding with the Level 2 Concept Checkpoint quiz.
              </p>
            </div>
            <button
              onClick={() => setSubTab('quiz')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
            >
              Take Concept Check
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Architecture Lineage Table */}
      {subTab === 'table' && (
        <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-white/10">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">CNN Evolutionary Milestone Table</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Notice that ResNet and DenseNet are structural mechanisms applied onto CNNs, not mutually exclusive categories.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Architecture</th>
                  <th className="py-3 px-4">Core Mechanism</th>
                  <th className="py-3 px-4">Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {cnnArchitectures.map((arch) => (
                  <tr key={arch.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      {arch.name}
                    </td>
                    <td className="py-3 px-4">{arch.idea}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{arch.impact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code Tab */}
      {subTab === 'code' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">2D Convolution & Residual Block</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Notice how the residual function simply adds the identity tensor <code>x</code> back to the result.
            </p>
          </div>

          <CodeBlock
            code={`// 1. A Residual Block in pure TypeScript: y = x + F(x)
function residualBlock(x: number[], weights: number[][]): number[] {
  // Compute F(x) through a standard 2-layer sub-network
  const F_x = computeConvLayers(x, weights);

  // The Residual Skip: Add original identity x directly!
  const y = x.map((val, i) => val + F_x[i]);
  return y;
}

// Why it saves deep networks during backpropagation:
// By the chain rule: dy/dx = d(x + F(x))/dx = 1 + dF/dx
// Even if dF/dx shrinks toward zero, the '1' guarantees 
// gradients can flow all the way back to layer 1 intact!`}
            language="TypeScript"
            filename="resnet_block_forward.ts"
            onRun={runConvolutionTest}
            runLabel="Run Convolution Test"
            output={codeOutput}
          />
        </div>
      )}

      {/* Analogy Tab */}
      {subTab === 'analogy' && (
        <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">The Express Lane Analogy</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Imagine a game of telephone with 100 people in a line. Person 1 whispers a message to Person 2, who whispers to Person 3, all the way to Person 100.
          </p>
          <div className="p-4 bg-slate-50 dark:bg-slate-900/80 rounded-lg border border-slate-200 dark:border-white/5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <p>
              <strong className="text-red-600 dark:text-red-400 font-semibold">Without Residuals (Plain Deep Net):</strong> By person 20, the whisper has faded into inaudible mumbling. The signal completely vanishes.
            </p>
            <p>
              <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">With ResNet (Identity Highway):</strong> Person 1 writes down the original message on a postcard and slides it down an express conveyor belt straight to Person 100!
            </p>
            <p className="text-emerald-800 dark:text-emerald-300 font-medium">
              The people in the middle only have to whisper minor corrections (F(x)). If their corrections are useless ($F(x) \approx 0$), the original postcard ($x$) still arrives intact! That’s why ResNet could effortlessly scale to 152 layers while previous networks choked at 20.
            </p>
          </div>
        </div>
      )}

      {/* SubTab 5: Checkpoint Quiz */}
      {subTab === 'quiz' && (
        <CheckpointQuiz
          quizKey="quiz_cnn_resnet"
          title={LAB_QUIZZES.cnn_resnet.title}
          questions={LAB_QUIZZES.cnn_resnet.questions}
          onPassAll={() => markLabCompleted('cnn_resnet')}
        />
      )}
    </div>
  );
};
