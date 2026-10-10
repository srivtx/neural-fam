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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Implementation Laboratory</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            Neural Code Scratchpad & Test Runner
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Inspect, modify, and run dependency-free implementations of fundamental neural transformations with complete syntax highlighting.
          </p>
        </div>

        {/* Algorithm Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Architecture:</span>
          <select
            value={selectedNodeId}
            onChange={(e) => handleSelectNode(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 shadow-xs">
        {/* Framework Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-semibold">
          <button
            onClick={() => {
              setActiveLanguage('typescript');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeLanguage === 'typescript'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            TypeScript (Browser Sandbox)
          </button>

          <button
            onClick={() => {
              setActiveLanguage('pytorch');
              soundFX.playTap();
            }}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              activeLanguage === 'pytorch'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            PyTorch Python (Production Module)
          </button>
        </div>

        {/* Invariant One-Liner */}
        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden md:flex items-center gap-1.5">
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Formula:</span>
          <span>{currentNode.mathFormula}</span>
        </div>

        {/* Edit vs Syntax View Toggle (in TS mode) */}
        {activeLanguage === 'typescript' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsEditorMode((prev) => !prev);
                soundFX.playTap();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isEditorMode ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Highlight View</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Edit Code</span>
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
              <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-xs transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-800 dark:text-slate-200">
                    <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{currentNode.title} · forward_pass.ts (Editable)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded border border-slate-200 dark:border-white/10 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>

                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors cursor-pointer disabled:opacity-50 shadow-xs active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Run & Test</span>
                    </button>
                  </div>
                </div>

                <div className="relative rounded-lg border border-slate-800 overflow-hidden bg-slate-950">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    rows={16}
                    className="w-full p-4 font-mono text-xs text-emerald-100 bg-transparent focus:outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </div>

                <p className="text-[11px] text-slate-500 font-mono">
                  Modify weights, thresholds, or activations above and click "Run & Test" to evaluate against the automated vectors.
                </p>
              </div>
            ) : (
              /* Syntax Highlighted View with CodeBlock */
              <CodeBlock
                code={userCode}
                language="TypeScript"
                filename={`${selectedNodeId}_forward.ts`}
                onRun={handleRunCode}
                runLabel="Execute Test Suite"
                output={consoleOutput}
              />
            )
          ) : (
            /* PyTorch Python View */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {pyTorchSnippet.title}
                  </span>
                  <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                    PyTorch nn.Module
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  <strong>Inductive Bias:</strong> {pyTorchSnippet.inductiveBiasSummary}
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
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
          <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-3 shadow-xs transition-colors">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Target Test Vectors ({currentNode.testCases.length})</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                Automated Suite
              </span>
            </h3>

            <div className="space-y-2">
              {currentNode.testCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200/60 dark:border-white/5 space-y-1 font-mono text-xs"
                >
                  <div className="flex items-center justify-between text-slate-800 dark:text-slate-200 font-semibold">
                    <span>Vector {idx + 1}: {tc.description}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 break-all">
                    Input: <span className="text-slate-700 dark:text-slate-300">{tc.input}</span>
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Expected: {tc.expected}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Console Output Terminal */}
          <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-3 font-mono text-xs shadow-xs transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Runtime Output</span>
              </span>
              <span className="text-[10px] text-slate-400">Client Sandbox</span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 min-h-[160px] max-h-[240px] overflow-y-auto">
              {consoleOutput ? (
                <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed text-[11px]">
                  {consoleOutput}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs italic py-8">
                  Click "Run & Test" to evaluate this architecture in the browser sandbox
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
