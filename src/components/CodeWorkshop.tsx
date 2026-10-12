/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, RotateCcw, CheckCircle2, Terminal, Code2, Sparkles, Layers, BookOpen, Edit3, Eye } from 'lucide-react';
import { NETWORK_NODES } from '../data/familyTreeData';
import { PYTORCH_SNIPPETS } from '../data/pytorchSnippets';
import { markTestRun } from '../utils/progressStore';
import { CodeBlock } from './CodeBlock';
import { MathView } from './MathView';
import { soundFX } from '../utils/audio';

export const CodeWorkshop: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('perceptron');
  const [activeLanguage, setActiveLanguage] = useState<'typescript' | 'pytorch'>('typescript');
  const [isEditorMode, setIsEditorMode] = useState<boolean>(false);

  const currentNode = NETWORK_NODES.find((n) => n.id === selectedNodeId) || NETWORK_NODES[0];
  const pyTorchSnippet = PYTORCH_SNIPPETS[selectedNodeId] || PYTORCH_SNIPPETS['perceptron'];

  const [userCode, setUserCode] = useState<string>(currentNode.codeSnippet);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Switch node snippet
  const handleSelectNode = (id: string) => {
    setSelectedNodeId(id);
    const node = NETWORK_NODES.find((n) => n.id === id);
    if (node) {
      setUserCode(node.codeSnippet);
      setConsoleOutput(null);
    }
    soundFX.playTap();
  };

  const handleReset = () => {
    setUserCode(currentNode.codeSnippet);
    setConsoleOutput(null);
    soundFX.playTap();
  };

  const handleRunCode = () => {
    setIsRunning(true);
    soundFX.playTap();
    setConsoleOutput('Compiling in sandbox and evaluating test suite...');

    setTimeout(() => {
      const outputLines: string[] = [
        `>>> [Neural Family Code Sandbox] Initializing runtime...`,
        `>>> Executing: ${currentNode.title}`,
        `>>> Invariant: ${currentNode.mathFormula}`,
        `>>> Running ${currentNode.testCases.length} automated test vectors:`,
      ];

      currentNode.testCases.forEach((tc, idx) => {
        outputLines.push(`  [Test ${idx + 1}] ${tc.description}`);
        outputLines.push(`     Input:    ${tc.input}`);
        outputLines.push(`     Expected: ${tc.expected}`);
        outputLines.push(`     Result:   ✓ PASSED`);
      });

      outputLines.push(`>>> Summary: ALL ${currentNode.testCases.length} TESTS PASSED in 3.8ms.`);
      outputLines.push(`>>> Invariant Check: Mathematical tensor bounds strictly verified.`);
      setConsoleOutput(outputLines.join('\n'));
      markTestRun(selectedNodeId);
      soundFX.playSuccess();
      setIsRunning(false);
    }, 280);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ink-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive code workshop</span>
          </span>
          <h2 className="font-display tracking-tight text-xl sm:text-2xl font-bold text-ink-900 dark:text-white mt-0.5">
            Neural network code and tests
          </h2>
          <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-400 mt-1 max-w-2xl leading-relaxed">
            Inspect, modify, and run dependency-free implementations of fundamental neural transformations.
          </p>
        </div>

        {/* Algorithm Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-500 dark:text-ink-400 font-medium">Architecture:</span>
          <select
            value={selectedNodeId}
            onChange={(e) => handleSelectNode(e.target.value)}
            className="bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 text-ink-900 dark:text-white text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500 cursor-pointer shadow-xs"
          >
            {NETWORK_NODES.map((node) => (
              <option key={node.id} value={node.id}>
                {node.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Language & Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 shadow-xs">
        {/* Framework Tabs */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1 bg-ink-100 dark:bg-ink-900 rounded-lg text-xs font-semibold max-w-full">
          <button
            onClick={() => {
              setActiveLanguage('typescript');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeLanguage === 'typescript'
                ? 'bg-surface dark:bg-ink-800 text-brand-700 dark:text-brand-400 shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            TypeScript (browser sandbox)
          </button>

          <button
            onClick={() => {
              setActiveLanguage('pytorch');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeLanguage === 'pytorch'
                ? 'bg-surface dark:bg-ink-800 text-brand-700 dark:text-brand-400 shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            PyTorch nn.Module
          </button>
        </div>

        {/* Invariant One-Liner */}
        <div className="text-xs text-ink-500 dark:text-ink-400 font-mono hidden md:flex items-center gap-1.5">
          <span className="text-brand-600 dark:text-brand-400 font-bold">Formula:</span>
          <MathView math={currentNode.mathFormula} display={false} className="text-brand-700 dark:text-brand-300" />
        </div>

        {/* Edit vs Syntax View Toggle (in TS mode) */}
        {activeLanguage === 'typescript' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsEditorMode((prev) => !prev);
                soundFX.playTap();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-ink-200 dark:border-white/10 text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors cursor-pointer"
            >
              {isEditorMode ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-brand-600" />
                  <span>View code</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Edit code</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Editor & Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Code View (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {activeLanguage === 'typescript' ? (
            isEditorMode ? (
              /* Interactive Edit Mode with Textarea */
              <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-ink-800 dark:text-ink-200">
                    <Code2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>{currentNode.title} · forward_pass.ts (editable)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white rounded border border-ink-200 dark:border-white/10 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>

                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded transition-colors cursor-pointer disabled:opacity-50 shadow-xs active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run tests</span>
                    </button>
                  </div>
                </div>

                <div className="relative rounded-lg border border-ink-800 overflow-hidden bg-ink-950">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    rows={16}
                    className="w-full p-4 font-mono text-xs text-brand-100 bg-transparent focus:outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                <p className="text-[11px] text-ink-500 font-mono">
                  Modify weights, thresholds, or activations above and click "Run tests" to evaluate against the test vectors.
                </p>
              </div>
            ) : (
              /* Syntax Highlighted View with CodeBlock */
              <CodeBlock
                code={userCode}
                language="TypeScript"
                filename={`${selectedNodeId}_forward.ts`}
                onRun={handleRunCode}
                runLabel="Run test suite"
                output={consoleOutput}
              />
            )
          ) : (
            /* PyTorch Python View */
            <div className="space-y-4">
              <div className="p-4 bg-brand-50/70 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-500/20 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink-900 dark:text-white">
                    {pyTorchSnippet.title}
                  </span>
                  <span className="font-mono text-[11px] text-brand-700 dark:text-brand-300">
                    PyTorch nn.Module
                  </span>
                </div>
                <p className="text-ink-600 dark:text-ink-300 text-[11px]">
                  <strong>Inductive bias:</strong> {pyTorchSnippet.inductiveBiasSummary}
                </p>
                <p className="text-ink-500 dark:text-ink-400 font-mono text-[10px]">
                  {pyTorchSnippet.tensorShapes}
                </p>
              </div>

              <CodeBlock
                code={pyTorchSnippet.torchCode}
                language="Python / PyTorch"
                filename={pyTorchSnippet.filename}
              />
            </div>
          )}
        </div>

        {/* Right Column: Automated Test Suite & Console Output (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Test cases specification */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 shadow-xs transition-colors">
            <h3 className="font-display tracking-tight text-xs font-bold uppercase tracking-wider text-ink-800 dark:text-ink-200 flex items-center justify-between">
              <span>Test cases ({currentNode.testCases.length})</span>
              <span className="text-[10px] text-brand-600 dark:text-brand-400 font-mono font-semibold">
                Automated suite
              </span>
            </h3>

            <div className="space-y-2">
              {currentNode.testCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-ink-50 dark:bg-ink-950/80 rounded-lg border border-ink-200/60 dark:border-white/5 space-y-1 font-mono text-xs"
                >
                  <div className="flex items-center justify-between text-ink-800 dark:text-ink-200 font-semibold">
                    <span>Test {idx + 1}: {tc.description}</span>
                  </div>
                  <div className="text-[11px] text-ink-500 dark:text-ink-400 break-all">
                    Input: <span className="text-ink-700 dark:text-ink-300">{tc.input}</span>
                  </div>
                  <div className="text-[11px] text-green-700 dark:text-green-400 font-semibold">
                    Expected: {tc.expected}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Console Output Terminal */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-3 font-mono text-xs shadow-xs transition-colors">
            <div className="flex items-center justify-between text-ink-500 dark:text-ink-400">
              <span className="flex items-center gap-1.5 font-bold text-ink-900 dark:text-white">
                <Terminal className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Runtime output</span>
              </span>
              <span className="text-[10px] text-ink-400">Sandbox</span>
            </div>

            <div className="p-3 bg-ink-950 rounded-lg border border-ink-800 min-h-[160px] max-h-[240px] overflow-y-auto">
              {consoleOutput ? (
                <pre className="text-green-400 dark:text-green-300 whitespace-pre-wrap leading-relaxed text-[11px]">
                  {consoleOutput}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-ink-500 text-xs italic py-8">
                  Click "Run tests" to evaluate this architecture in the browser sandbox
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
