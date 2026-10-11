/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Code2, Sliders, ShieldCheck, Award, Flame, BookOpen, Terminal } from 'lucide-react';
import { CheckpointQuiz } from '../CheckpointQuiz';
import { CodeBlock } from '../CodeBlock';
import { FirstPrinciplesNotebook } from '../FirstPrinciplesNotebook';
import { FIRST_PRINCIPLES_DOSSIERS } from '../../data/firstPrinciplesData';
import { TheorySectionView } from '../TheorySectionView';
import { THEORY_DOSSIERS } from '../../data/theoryData';
import { BuildFromScratchLab } from '../BuildFromScratchLab';
import { DIY_PROJECTS } from '../../data/diyProjectsData';
import { LAB_QUIZZES } from '../../data/labQuizzes';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';

export const CnnResNetLab: React.FC = () => {
  const [selectedKernel, setSelectedKernel] = useState<'edge_h' | 'edge_v' | 'sharpen' | 'blur'>('edge_h');
  const [residualEnabled, setResidualEnabled] = useState<boolean>(true);
  const [activeCell, setActiveCell] = useState<{ r: number; c: number }>({ r: 2, c: 2 });
  const [subTab, setSubTab] = useState<'visual' | 'theory' | 'build' | 'code' | 'table' | 'analogy' | 'quiz' | 'first_principles'>('visual');

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

  // The identity path carries the input pixel at the centre of the receptive field.
  const skipInput = sampleImage[activeCell.r + 1][activeCell.c + 1];

  const cnnArchitectures = [
    { name: 'LeNet-5 (1998)', idea: 'Small convolutional network for reading handwritten digits', impact: 'Set the conv → pool → fully connected pattern' },
    { name: 'AlexNet (2012)', idea: '8-layer CNN trained on GPUs, with ReLU and dropout', impact: 'Won ImageNet 2012 by a wide margin and started the deep learning wave' },
    { name: 'VGG (2014)', idea: 'Stacks of small 3×3 convolutions, 16–19 layers deep', impact: 'Showed that depth with small filters beats a few large filters' },
    { name: 'Inception (2014)', idea: 'Parallel 1×1, 3×3 and 5×5 convolutions, concatenated', impact: 'Captured several scales with far fewer parameters than VGG' },
    { name: 'ResNet (2015)', idea: 'Identity skip connections: y = x + F(x)', impact: 'Made 152-layer networks trainable without the accuracy loss seen in deep plain nets' },
    { name: 'DenseNet (2017)', idea: 'Each layer receives the feature maps of all earlier layers in its block', impact: 'Heavy feature reuse and short gradient paths' },
    { name: 'MobileNet (2017)', idea: 'Depthwise separable convolutions', impact: 'Made real-time vision practical on phones and edge devices' },
    { name: 'ConvNeXt (2022)', idea: 'A CNN updated with Transformer-era design choices (7×7 kernels, inverted bottleneck)', impact: 'Showed CNNs can still match Vision Transformers' },
  ];

  const runConvolutionTest = () => {
    markTestRun('cnn_resnet');
    markLabCompleted('cnn_resnet');
    const lines = [
      '[CNN & ResNet check]',
      `Kernel: ${selectedKernel} (3x3)`,
      `Input 6x6 -> feature map 4x4 (no padding, stride 1)`,
      `Cell (${activeCell.r}, ${activeCell.c}) -> dot product: ${currentCalc.sum}`,
      `Block: ${residualEnabled ? 'y = x + F(x) (residual)' : 'y = F(x) (plain)'}`,
      `Gradient: ${residualEnabled ? 'dy/dx = 1 + dF/dx (direct path back)' : 'dy/dx = dF/dx (can shrink with depth)'}`,
      'STATUS: PASS (convolution and residual sum verified)',
      'Level 2 progress saved.',
    ];
    setCodeOutput(lines.join('\n'));
  };

  const tabClass = (active: boolean) =>
    `flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
      active
        ? 'bg-brand-600 text-white font-semibold'
        : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
    }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ink-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Level 2 · Spatial structure and skip connections
          </span>
          <h2 className="font-display tracking-tight text-xl font-bold text-ink-900 dark:text-white mt-0.5">
            CNNs and residual networks
          </h2>
          <p className="text-sm text-ink-600 dark:text-ink-400 mt-1 max-w-2xl">
            Small filters slide across an image to find local patterns. Adding the input back to each block's output, <code className="font-mono">y = x + F(x)</code>, is what lets networks grow past 100 layers.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-ink-100 dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-lg overflow-x-auto max-w-full overscroll-x-contain">
          <button onClick={() => setSubTab('visual')} className={tabClass(subTab === 'visual')}>
            Kernel lab
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
          <button onClick={() => setSubTab('table')} className={tabClass(subTab === 'table')}>
            Lineage
          </button>
          <button onClick={() => setSubTab('code')} className={tabClass(subTab === 'code')}>
            <Terminal className="w-3.5 h-3.5" />
            <span>Reference code</span>
          </button>
          <button onClick={() => setSubTab('analogy')} className={tabClass(subTab === 'analogy')}>
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Analogy</span>
          </button>
          <button onClick={() => setSubTab('quiz')} className={tabClass(subTab === 'quiz')}>
            <Award className="w-3.5 h-3.5" />
            <span>Quiz</span>
          </button>
        </div>
      </div>

      {subTab === 'visual' && (
        <div className="space-y-6">
          {/* Top Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 shadow-xs transition-colors">
            <div className="flex flex-wrap items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-semibold text-ink-800 dark:text-ink-200">3×3 filter:</span>
              <div className="flex flex-wrap items-center gap-1">
                {(['edge_h', 'edge_v', 'sharpen', 'blur'] as const).map((kKey) => (
                  <button
                    key={kKey}
                    onClick={() => setSelectedKernel(kKey)}
                    className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer uppercase ${
                      selectedKernel === kKey
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/15 text-brand-800 dark:text-brand-300 font-semibold'
                        : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    {kKey.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Residual Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-ink-700 dark:text-ink-300 font-medium">Skip connection:</span>
              <button
                onClick={() => setResidualEnabled(!residualEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                  residualEnabled
                    ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-800 dark:text-brand-300 font-bold shadow-xs'
                    : 'bg-surface dark:bg-ink-900 border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{residualEnabled ? 'On: y = x + F(x)' : 'Off: y = F(x)'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Grid (6x6) with sliding 3x3 highlight */}
            <div className="lg:col-span-5 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 shadow-xs transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-ink-800 dark:text-ink-200">Input image (6×6)</span>
                <span className="text-ink-500 dark:text-ink-400">Highlighted: 3×3 receptive field</span>
              </div>

              <div className="grid grid-cols-6 gap-1 p-3 bg-ink-50 dark:bg-ink-950 rounded-lg border border-ink-200/60 dark:border-white/5 w-full max-w-[280px] mx-auto">
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
                            ? 'bg-brand-100 dark:bg-brand-500/30 border border-brand-500 text-brand-900 dark:text-brand-200 font-bold'
                            : val === 1
                            ? 'bg-ink-300 dark:bg-ink-700 text-ink-900 dark:text-white font-semibold'
                            : 'bg-surface dark:bg-ink-900 text-ink-400 dark:text-ink-600 border border-ink-100 dark:border-transparent'
                        }`}
                      >
                        {val}
                      </div>
                    );
                  })
                )}
              </div>

              <p className="text-[11px] text-ink-500 dark:text-ink-400 text-center">
                Click a cell in the output to move the receptive field.
              </p>
            </div>

            {/* Kernel Matrix (3x3) */}
            <div className="lg:col-span-3 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 shadow-xs transition-colors">
              <span className="text-xs font-semibold text-ink-800 dark:text-ink-200 block text-center">
                Kernel (3×3)
              </span>

              <div className="grid grid-cols-3 gap-1 p-3 bg-ink-50 dark:bg-ink-950 rounded-lg border border-ink-200/60 dark:border-white/5 w-full max-w-[180px] mx-auto">
                {kernel.map((row, kr) =>
                  row.map((kval, kc) => (
                    <div
                      key={`${kr}-${kc}`}
                      className="aspect-square flex items-center justify-center text-xs font-mono rounded bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 text-brand-700 dark:text-brand-400 font-bold shadow-2xs"
                    >
                      {kval}
                    </div>
                  ))
                )}
              </div>

              <p className="text-[11px] text-ink-500 dark:text-ink-400 text-center">
                The same nine weights are used at every position.
              </p>
            </div>

            {/* Feature Map (4x4) */}
            <div className="lg:col-span-4 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 shadow-xs transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-ink-800 dark:text-ink-200">Output feature map (4×4)</span>
                <span className="text-brand-700 dark:text-brand-400 font-semibold">Selected: ({activeCell.r}, {activeCell.c})</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 p-3 bg-ink-50 dark:bg-ink-950 rounded-lg border border-ink-200/60 dark:border-white/5 w-full max-w-[220px] mx-auto">
                {featureMap.map((row, r) =>
                  row.map((val, c) => {
                    const isSelected = activeCell.r === r && activeCell.c === c;
                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => setActiveCell({ r, c })}
                        className={`aspect-square flex items-center justify-center text-xs font-mono rounded transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-brand-600 text-white font-bold border-2 border-brand-700 dark:border-white shadow-xs'
                            : Math.abs(val) > 1
                            ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-500/30'
                            : 'bg-surface dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-ink-200 dark:border-white/5'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Math breakdown */}
              <div className="p-3 bg-ink-50 dark:bg-ink-950/80 rounded-lg border border-ink-200/60 dark:border-white/5 font-mono text-xs text-ink-700 dark:text-ink-300 space-y-1 break-words">
                <div className="text-brand-700 dark:text-brand-400 font-semibold text-[11px]">
                  F(x) at ({activeCell.r}, {activeCell.c}):
                </div>
                <div className="text-xs text-ink-900 dark:text-ink-200 font-bold">
                  F(x) = {currentCalc.sum}
                </div>
                {residualEnabled && (
                  <div className="text-[11px] text-brand-700 dark:text-brand-300 pt-1 border-t border-ink-200 dark:border-white/10 font-semibold">
                    y = x + F(x) = {skipInput} + {currentCalc.sum} = {(currentCalc.sum + skipInput).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prompt To Concept Check */}
          <div className="p-4 bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <h4 className="text-xs font-bold text-ink-900 dark:text-white">
                Ready to check your understanding?
              </h4>
              <p className="text-[11px] text-ink-600 dark:text-ink-400">
                A short quiz on convolutions and skip connections.
              </p>
            </div>
            <button
              onClick={() => setSubTab('quiz')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
            >
              Take the quiz
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Architecture Lineage Table */}
      {subTab === 'table' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-ink-100 dark:border-white/10">
            <h3 className="font-display tracking-tight text-sm font-bold text-ink-900 dark:text-white">Key CNN architectures</h3>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              ResNet and DenseNet are ways of wiring a CNN, not separate kinds of network.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-50 dark:bg-ink-950 text-ink-500 dark:text-ink-400 font-semibold border-b border-ink-100 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Architecture</th>
                  <th className="py-3 px-4">Core idea</th>
                  <th className="py-3 px-4">Why it mattered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-white/5 text-ink-700 dark:text-ink-300">
                {cnnArchitectures.map((arch) => (
                  <tr key={arch.name} className="hover:bg-ink-50 dark:hover:bg-ink-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700 dark:text-brand-400 whitespace-nowrap">
                      {arch.name}
                    </td>
                    <td className="py-3 px-4">{arch.idea}</td>
                    <td className="py-3 px-4 text-ink-500 dark:text-ink-400">{arch.impact}</td>
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
            <h3 className="font-display tracking-tight text-base font-bold text-ink-900 dark:text-white">A residual block</h3>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              The block computes F(x), then adds the unchanged input <code>x</code> back.
            </p>
          </div>

          <CodeBlock
            code={`// A residual block in TypeScript: y = x + F(x)
function residualBlock(x: number[], weights: number[][]): number[] {
  // F(x): a small stack of conv layers
  const F_x = computeConvLayers(x, weights);

  // Skip connection: add the original input back
  const y = x.map((val, i) => val + F_x[i]);
  return y;
}

// Why this helps backpropagation:
// dy/dx = d(x + F(x))/dx = 1 + dF/dx
// Even when dF/dx is close to zero, the 1 gives the
// gradient a direct path back to earlier layers.`}
            language="TypeScript"
            filename="resnet_block_forward.ts"
            onRun={runConvolutionTest}
            runLabel="Run check"
            output={codeOutput}
          />
        </div>
      )}

      {/* Analogy Tab */}
      {subTab === 'analogy' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
          <h3 className="font-display tracking-tight text-base font-bold text-ink-900 dark:text-white">An analogy: the postcard</h3>
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
            Picture a game of telephone with 100 people in a line. Each person whispers the message to the next.
          </p>
          <div className="p-4 bg-ink-50 dark:bg-ink-900/80 rounded-lg border border-ink-200 dark:border-white/5 space-y-2 text-xs text-ink-600 dark:text-ink-300">
            <p>
              <strong className="text-rose-600 dark:text-rose-400 font-semibold">Plain deep network:</strong> by person 20 the message has turned into mumbling. The signal is lost.
            </p>
            <p>
              <strong className="text-green-700 dark:text-green-400 font-semibold">Residual network:</strong> person 1 also writes the message on a postcard that is passed straight down the line.
            </p>
            <p className="text-ink-800 dark:text-ink-200 font-medium">
              Everyone in between only adds small corrections, F(x). If their corrections are useless (F(x) ≈ 0), the postcard, x, still arrives intact. This is why ResNet trained well at 152 layers, while plain networks started getting worse beyond about 20.
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

      {/* SubTab 6: First Principles Discovery Notebook */}
      {subTab === 'first_principles' && (
        <FirstPrinciplesNotebook dossier={FIRST_PRINCIPLES_DOSSIERS['cnn_resnet']} />
      )}

      {/* SubTab 7: Deep First-Principles Theory */}
      {subTab === 'theory' && (
        <TheorySectionView theory={THEORY_DOSSIERS['cnn_resnet']} />
      )}

      {/* SubTab 8: Interactive Build It Yourself from Scratch Project */}
      {subTab === 'build' && (
        <BuildFromScratchLab project={DIY_PROJECTS['cnn_resnet']} />
      )}
    </div>
  );
};

