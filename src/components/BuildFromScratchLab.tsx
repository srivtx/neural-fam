/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Interactive "Build It Yourself from Scratch" (DIY) Laboratory.
 * Empowers learners to construct foundational neural architectures from pure
 * elementary mathematical primitives without external library blackboxes.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Code2,
  Sparkles,
  Terminal,
  Trophy,
  Flame,
  ArrowRight,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { DiyProject, TestCase, ProjectMilestone } from '../types/project';
import { soundFX } from '../utils/audio';
import { markLabCompleted, markTestRun } from '../utils/progressStore';
import { copyTextToClipboard } from '../utils/clipboard';
import { runPythonTestSuite } from '../utils/pyodideRunner';
import { TheoreticalBedrockViewer } from './TheoreticalBedrockViewer';

interface BuildFromScratchLabProps {
  project: DiyProject;
}

interface TestResult {
  testId: string;
  passed: boolean;
  actual: any;
  error?: string;
}

export const BuildFromScratchLab: React.FC<BuildFromScratchLabProps> = ({ project }) => {
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [jsCode, setJsCode] = useState<string>(project.starterCode);
  const [pyCode, setPyCode] = useState<string>(project.pythonStarterCode || '');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeMilestone, setActiveMilestone] = useState<number>(1);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [allPassed, setAllPassed] = useState<boolean>(false);
  const [activeHintStep, setActiveHintStep] = useState<number | null>(null);

  const preRef = useRef<HTMLPreElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);

  // Sync starter code when project changes
  useEffect(() => {
    setJsCode(project.starterCode);
    setPyCode(project.pythonStarterCode || '');
    setTestResults(null);
    setConsoleLogs([]);
    setAllPassed(false);
    setShowSolution(false);
    setActiveMilestone(1);
    setActiveHintStep(null);
  }, [project.id]);

  const currentCode = language === 'python' ? pyCode : jsCode;

  // Synchronized scrolling for syntax highlighter overlay
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  };

  // Keyboard tab indentation handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const tabSpaces = language === 'python' ? '    ' : '  ';
      const value = textarea.value;
      const newValue = value.substring(0, start) + tabSpaces + value.substring(end);
      if (language === 'python') {
        setPyCode(newValue);
      } else {
        setJsCode(newValue);
      }
      setAllPassed(false);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + tabSpaces.length;
      });
    }
  };

  const handleCopyCode = async () => {
    const ok = await copyTextToClipboard(currentCode);
    if (ok) {
      setCopiedCode(true);
      soundFX.playTap();
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleResetCode = () => {
    if (language === 'python') {
      setPyCode(project.pythonStarterCode || '');
    } else {
      setJsCode(project.starterCode);
    }
    setTestResults(null);
    setConsoleLogs([]);
    setAllPassed(false);
    setShowSolution(false);
    soundFX.playTap();
  };

  const handleLoadSolution = () => {
    if (showSolution) {
      if (language === 'python') {
        setPyCode(project.pythonStarterCode || '');
      } else {
        setJsCode(project.starterCode);
      }
      setShowSolution(false);
    } else {
      if (language === 'python') {
        setPyCode(project.pythonSolutionCode || '');
      } else {
        setJsCode(project.solutionCode);
      }
      setShowSolution(true);
    }
    setTestResults(null);
    setConsoleLogs([]);
    setAllPassed(false);
    soundFX.playTap();
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    if (language === 'python') {
      setPyCode(newCode);
      if (showSolution && newCode !== (project.pythonSolutionCode || '')) {
        setShowSolution(false);
      }
    } else {
      setJsCode(newCode);
      if (showSolution && newCode !== project.solutionCode) {
        setShowSolution(false);
      }
    }
    setAllPassed(false);
  };

  // Safe client-side evaluator (JavaScript or Python Wasm)
  const handleRunTests = async () => {
    setIsRunning(true);
    soundFX.playTap();

    if (language === 'python') {
      const logs: string[] = [];
      logs.push(`>>> [Pyodide Wasm Runner] Initializing Python sandbox for ${project.architectureName}...`);
      logs.push(`>>> Constraint Check: Pure Python scalar math & list operations only.`);
      setConsoleLogs(logs);

      try {
        const outcome = await runPythonTestSuite(pyCode, project.testCases, (status) => {
          setConsoleLogs((prev) => [...prev, `>>> ${status}`]);
        });
        setTestResults(outcome.results);
        setConsoleLogs(outcome.logs);
        setAllPassed(outcome.allPassed);

        if (outcome.allPassed) {
          soundFX.playSuccess();
          markLabCompleted(project.id);
          markTestRun(project.id);
        }
      } catch (err: any) {
        logs.push(`>>> [PYTHON RUNTIME ERROR] ${err?.message || 'Execution failed'}`);
        setConsoleLogs(logs);
        setAllPassed(false);
      } finally {
        setIsRunning(false);
      }
      return;
    }

    // JavaScript / TypeScript Evaluation
    const logs: string[] = [];
    logs.push(`>>> [Neural Sandbox Runner] Initializing sandbox for ${project.architectureName}...`);
    logs.push(`>>> Constraint Check: ${project.axiomaticRule}`);

    setTimeout(() => {
      try {
        // Execute user code in a function scope to extract exported functions
        // eslint-disable-next-line no-new-func
        const evaluatedModule = new Function(`
          "use strict";
          const exports = {};
          ${jsCode}
          return typeof exports !== 'undefined' && Object.keys(exports).length > 0 ? exports : this;
        `)();

        const results: TestResult[] = [];
        let passedCount = 0;

        project.testCases.forEach((tc, idx) => {
          try {
            // Find function either in exports, window/global, or via direct evaluation
            let fn = evaluatedModule ? evaluatedModule[tc.testFn] : undefined;
            if (!fn) {
              // Try evaluating the function name directly from code scope
              // eslint-disable-next-line no-new-func
              fn = new Function(`
                ${jsCode}
                if (typeof ${tc.testFn} === 'function') return ${tc.testFn};
                return undefined;
              `)();
            }

            if (typeof fn !== 'function') {
              results.push({
                testId: tc.id,
                passed: false,
                actual: undefined,
                error: `Function '${tc.testFn}' is not defined or not a function. Check your function signature.`,
              });
              logs.push(`  [FAIL] Test ${idx + 1}: Function '${tc.testFn}' not found.`);
              return;
            }

            // Call function with test arguments
            const actual = fn(...tc.args);

            // Compare result
            let passed = false;
            const tol = tc.tolerance ?? 1e-4;

            if (typeof tc.expected === 'number' && typeof actual === 'number') {
              passed = Math.abs(tc.expected - actual) <= tol;
            } else if (Array.isArray(tc.expected) && Array.isArray(actual)) {
              if (tc.expected.length === actual.length) {
                passed = tc.expected.every((expVal: any, i: number) => {
                  if (typeof expVal === 'number' && typeof actual[i] === 'number') {
                    return Math.abs(expVal - actual[i]) <= tol;
                  }
                  if (Array.isArray(expVal) && Array.isArray(actual[i])) {
                    if (expVal.length !== actual[i].length) return false;
                    return expVal.every((ev: any, j: number) => {
                      if (typeof ev === 'number' && typeof actual[i][j] === 'number') {
                        return Math.abs(ev - actual[i][j]) <= tol;
                      }
                      return JSON.stringify(ev) === JSON.stringify(actual[i][j]);
                    });
                  }
                  return JSON.stringify(expVal) === JSON.stringify(actual[i]);
                });
              }
            } else if (typeof tc.expected === 'object' && tc.expected !== null && typeof actual === 'object' && actual !== null) {
              const expKeys = Object.keys(tc.expected);
              passed = expKeys.length > 0 && expKeys.every((k) => {
                const ev = tc.expected[k];
                const av = actual[k];
                if (typeof ev === 'number' && typeof av === 'number') {
                  return Math.abs(ev - av) <= tol;
                }
                if (Array.isArray(ev) && Array.isArray(av)) {
                  if (ev.length !== av.length) return false;
                  return ev.every((subEv: any, j: number) => {
                    if (typeof subEv === 'number' && typeof av[j] === 'number') {
                      return Math.abs(subEv - av[j]) <= tol;
                    }
                    return JSON.stringify(subEv) === JSON.stringify(av[j]);
                  });
                }
                return JSON.stringify(ev) === JSON.stringify(av);
              });
            } else {
              passed = tc.expected === actual;
            }

            if (passed) {
              passedCount++;
              results.push({ testId: tc.id, passed: true, actual });
              logs.push(`  [PASS] Test ${idx + 1}: ${tc.description}`);
            } else {
              results.push({
                testId: tc.id,
                passed: false,
                actual,
                error: `Expected ${JSON.stringify(tc.expected)}, but received ${JSON.stringify(actual)}`,
              });
              logs.push(`  [FAIL] Test ${idx + 1}: ${tc.description}`);
              logs.push(`         Expected: ${JSON.stringify(tc.expected)} | Got: ${JSON.stringify(actual)}`);
            }
          } catch (err: any) {
            results.push({
              testId: tc.id,
              passed: false,
              actual: undefined,
              error: err?.message || 'Runtime execution error',
            });
            logs.push(`  [ERROR] Test ${idx + 1}: ${err?.message || 'Execution failed'}`);
          }
        });

        setTestResults(results);
        const allPass = passedCount === project.testCases.length;
        setAllPassed(allPass);

        if (allPass) {
          logs.push(`>>> Summary: 100% SUITE PASSED (${passedCount}/${project.testCases.length}).`);
          logs.push(`>>> Axiomatic Invariant Confirmed: Architecture correctly derived from pure math!`);
          soundFX.playSuccess();
          markLabCompleted(project.id);
          markTestRun(project.id);
        } else {
          logs.push(`>>> Summary: ${passedCount}/${project.testCases.length} tests passing.`);
          logs.push(`>>> Hint: Review milestone equations and verify algebraic signs & array dimensions.`);
        }
      } catch (globalErr: any) {
        logs.push(`>>> Syntax / Evaluation Error: ${globalErr?.message}`);
        setTestResults(
          project.testCases.map((tc) => ({
            testId: tc.id,
            passed: false,
            actual: undefined,
            error: globalErr?.message,
          }))
        );
        setAllPassed(false);
      }

      setConsoleLogs(logs);
      setIsRunning(false);
    }, 250);
  };

  // Real-time syntax highlighter token renderer
  const renderHighlightedCode = (rawCode: string, lang: 'javascript' | 'python') => {
    const codeLines = rawCode.split('\n');
    return codeLines.map((line, lineIdx) => {
      if (line === '') {
        return (
          <div key={lineIdx} className="leading-6 h-6">
            &nbsp;
          </div>
        );
      }

      const isPyComment = lang === 'python' && line.trimStart().startsWith('#');
      const isJsComment =
        lang === 'javascript' &&
        (line.trimStart().startsWith('//') ||
          line.trimStart().startsWith('/*') ||
          line.trimStart().startsWith('*'));

      if (isPyComment || isJsComment) {
        return (
          <div key={lineIdx} className="leading-6 h-6">
            <span className="text-ink-400 dark:text-ink-500 italic">{line}</span>
          </div>
        );
      }

      const tokens = line.split(
        /(\b(?:const|let|var|function|return|import|from|export|class|def|if|elif|else|for|while|new|async|await|as|type|interface|self|super|lambda|in|is|not|and|or|pass|assert|try|except|finally|raise|with|yield)\b|\b(?:True|False|None|true|false|null|undefined)\b|\b(?:number|string|boolean|void|any|Array|int|float|str|list|dict|set|tuple|len|range|zip|enumerate|sum|min|max|abs|round|math|Math)\b|".*?"|'.*?'|`.*?`|\/\/.*|#.*|\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b|[=+\-*/@%<>!&|^~:]+)/g
      );

      return (
        <div key={lineIdx} className="leading-6 h-6">
          {tokens.map((token, tIdx) => {
            if (!token) return null;

            if (
              /^(const|let|var|function|return|import|from|export|class|def|if|elif|else|for|while|new|async|await|as|type|interface|self|super|lambda|in|is|not|and|or|pass|assert|try|except|finally|raise|with|yield)$/.test(
                token
              )
            ) {
              return (
                <span key={tIdx} className="text-purple-600 dark:text-purple-400 font-bold">
                  {token}
                </span>
              );
            }

            if (/^(True|False|None|true|false|null|undefined)$/.test(token)) {
              return (
                <span key={tIdx} className="text-amber-600 dark:text-amber-400 font-bold">
                  {token}
                </span>
              );
            }

            if (
              /^(number|string|boolean|void|any|Array|int|float|str|list|dict|set|tuple|len|range|zip|enumerate|sum|min|max|abs|round|math|Math)$/.test(
                token
              )
            ) {
              return (
                <span key={tIdx} className="text-blue-600 dark:text-blue-400 font-semibold">
                  {token}
                </span>
              );
            }

            if (
              (token.startsWith('"') && token.endsWith('"')) ||
              (token.startsWith("'") && token.endsWith("'")) ||
              (token.startsWith('`') && token.endsWith('`'))
            ) {
              return (
                <span key={tIdx} className="text-emerald-600 dark:text-emerald-400">
                  {token}
                </span>
              );
            }

            if (/^\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i.test(token)) {
              return (
                <span key={tIdx} className="text-amber-600 dark:text-amber-300 font-mono font-semibold">
                  {token}
                </span>
              );
            }

            if (token.startsWith('//') || token.startsWith('#')) {
              return (
                <span key={tIdx} className="text-ink-400 dark:text-ink-500 italic">
                  {token}
                </span>
              );
            }

            if (/^[=+\-*/@%<>!&|^~:]+$/.test(token)) {
              return (
                <span key={tIdx} className="text-rose-500 dark:text-rose-400">
                  {token}
                </span>
              );
            }

            return (
              <span key={tIdx} className="text-ink-900 dark:text-ink-100">
                {token}
              </span>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-full overflow-x-hidden">
      {/* Project Header Banner */}
      <div className="p-4 sm:p-5 rounded-xl border border-brand-500/30 bg-gradient-to-br from-brand-50/50 via-surface to-brand-50/20 dark:from-brand-950/20 dark:via-ink-900 dark:to-brand-900/10 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                Level {project.level} DIY Project
              </span>
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {project.difficulty}
              </span>
              <span className="text-[11px] font-medium text-ink-500 dark:text-ink-400 bg-ink-100 dark:bg-ink-800 px-2 py-0.5 rounded-full">
                ~{project.estimatedMinutes} mins
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white">
              {project.title}
            </h3>

            <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-300 max-w-3xl leading-relaxed">
              {project.tagline}
            </p>
          </div>

          {/* Axiomatic Badge */}
          <div className="p-3 bg-white/80 dark:bg-ink-950/80 rounded-lg border border-ink-200 dark:border-white/10 text-xs space-y-1 shrink-0 lg:max-w-xs shadow-2xs">
            <div className="font-semibold text-ink-900 dark:text-white flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Axiomatic Rule</span>
            </div>
            <p className="text-[11px] text-ink-600 dark:text-ink-400 leading-normal">
              {project.axiomaticRule}
            </p>
          </div>
        </div>
      </div>

      {/* Guided Milestones Accordion */}
      <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-ink-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h4 className="text-sm font-bold font-display text-ink-900 dark:text-white">
              Step-by-Step Implementation Milestones
            </h4>
          </div>
          <span className="text-xs text-ink-500 dark:text-ink-400">
            Click any step to inspect the mathematical requirement
          </span>
        </div>

        {/* Milestone Steps Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 max-w-full">
          {project.milestones.map((m) => {
            const isCurrent = activeMilestone === m.step;
            return (
              <button
                key={m.step}
                onClick={() => {
                  setActiveMilestone(m.step);
                  soundFX.playTap();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-brand-600 text-white font-semibold shadow-xs'
                    : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white/20 font-bold">
                  {m.step}
                </span>
                <span>{m.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Milestone Card */}
        {(() => {
          const m = project.milestones.find((x) => x.step === activeMilestone) || project.milestones[0];
          const isHintOpen = activeHintStep === m.step;
          return (
            <div className="p-4 bg-ink-50 dark:bg-ink-950/60 rounded-xl border border-ink-200/80 dark:border-white/5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-brand-700 dark:text-brand-400 font-mono">
                  MILESTONE {m.step} OF {project.milestones.length}: {m.title.toUpperCase()}
                </span>
                <button
                  onClick={() => {
                    setActiveHintStep(isHintOpen ? null : m.step);
                    soundFX.playTap();
                  }}
                  className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{isHintOpen ? 'Hide Hint' : 'Need a Hint?'}</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-ink-700 dark:text-ink-300 leading-relaxed">
                {m.guidance}
              </p>

              {/* First-Principles Intuition Box */}
              <div className="p-3 bg-brand-50/50 dark:bg-brand-950/30 rounded-lg border border-brand-200/40 dark:border-brand-800/20 text-xs space-y-1">
                <span className="font-semibold text-brand-800 dark:text-brand-300 block">
                  Why this way from First Principles?
                </span>
                <p className="text-ink-600 dark:text-ink-300 leading-relaxed">
                  {m.firstPrinciplesWhy}
                </p>
              </div>

              {/* Collapsible Hint */}
              {isHintOpen && (
                <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 animate-fade-in leading-relaxed">
                  <strong>Hint:</strong> {m.hint}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Main Coding & Diagnostics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Code Scratchpad (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 overflow-hidden shadow-xs">
            {/* Editor Top Bar with Language Toggle & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 bg-ink-100/90 dark:bg-ink-950/90 border-b border-ink-200 dark:border-white/10 text-xs">
              {/* Left: Language Toggle Pills & File Indicator */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 bg-ink-200/60 dark:bg-ink-900/90 p-0.5 rounded-lg border border-ink-300/40 dark:border-white/10 shadow-2xs">
                  <button
                    onClick={() => {
                      setLanguage('javascript');
                      setShowSolution(false);
                      setTestResults(null);
                      setConsoleLogs([]);
                      soundFX.playTap();
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      language === 'javascript'
                        ? 'bg-white dark:bg-ink-800 text-brand-600 dark:text-brand-400 font-semibold shadow-xs'
                        : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    <span>JavaScript / TS</span>
                  </button>

                  <button
                    onClick={() => {
                      setLanguage('python');
                      setShowSolution(false);
                      setTestResults(null);
                      setConsoleLogs([]);
                      soundFX.playTap();
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      language === 'python'
                        ? 'bg-white dark:bg-ink-800 text-amber-600 dark:text-amber-400 font-semibold shadow-xs'
                        : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Python (Pyodide Wasm)</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-ink-500 dark:text-ink-400 font-mono text-[11px]">
                  <Code2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span className="font-semibold text-ink-800 dark:text-ink-200">
                    {language === 'python' ? 'scratchpad.py' : 'scratchpad.js'}
                  </span>
                  <span>·</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {language === 'python' ? 'In-Browser Python 3.12 (Wasm)' : 'V8 Native JIT'}
                  </span>
                </div>
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Copy code to clipboard"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleResetCode}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Reset to starter template"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>

                <button
                  onClick={handleLoadSolution}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                    showSolution
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold'
                      : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white'
                  }`}
                  title={showSolution ? 'Revert to starter code' : 'Reveal complete reference implementation'}
                >
                  <Eye className="w-3 h-3" />
                  <span>{showSolution ? 'Solution Loaded' : 'Solution'}</span>
                </button>

                <button
                  onClick={handleRunTests}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>{language === 'python' ? 'Running Wasm...' : 'Running...'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-white" />
                      <span>{language === 'python' ? 'Run & Test (Python)' : 'Run & Test'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive Syntax-Highlighted Editor with Line Numbers */}
            <div className="relative flex bg-ink-50/70 dark:bg-ink-950/95 font-mono text-xs sm:text-[13px] overflow-hidden h-[500px]">
              {/* Left: Line Numbers Gutter */}
              <div
                ref={lineNumbersRef}
                aria-hidden="true"
                className="w-10 sm:w-12 shrink-0 py-4 px-2 text-right select-none text-ink-400 dark:text-ink-600 font-mono text-[11px] sm:text-xs leading-6 bg-ink-100/60 dark:bg-ink-950/90 border-r border-ink-200/50 dark:border-white/5 overflow-hidden"
              >
                {Array.from({ length: currentCode.split('\n').length }, (_, i) => (
                  <div key={i} className="h-6 leading-6">
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Right: Code Area with Overlaid Transparent Textarea */}
              <div className="relative flex-1 h-full overflow-hidden">
                {/* Underneath: Syntax Highlighting Preview */}
                <pre
                  ref={preRef}
                  aria-hidden="true"
                  className="absolute inset-0 m-0 p-4 font-mono text-xs sm:text-[13px] leading-6 whitespace-pre overflow-hidden pointer-events-none select-none text-ink-900 dark:text-ink-100 font-normal no-scrollbar"
                  style={{ tabSize: language === 'python' ? 4 : 2 }}
                >
                  <code>{renderHighlightedCode(currentCode, language)}</code>
                </pre>

                {/* Overlaid: Native Transparent Textarea */}
                <textarea
                  ref={textareaRef}
                  value={currentCode}
                  onChange={handleCodeChange}
                  onScroll={handleScroll}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  className="relative z-10 w-full h-full m-0 p-4 font-mono text-xs sm:text-[13px] leading-6 whitespace-pre overflow-auto resize-none bg-transparent text-transparent caret-brand-600 dark:caret-brand-400 focus:outline-none selection:bg-brand-500/25 dark:selection:bg-brand-500/35 border-none no-scrollbar"
                  style={{ tabSize: language === 'python' ? 4 : 2 }}
                />
              </div>
            </div>
          </div>

          {/* Test Runner Terminal Console */}
          <div className="bg-ink-950 text-white rounded-xl border border-ink-800 p-4 space-y-2 font-mono text-xs shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-ink-800/60">
              <div className="flex items-center gap-2 text-ink-400">
                <Terminal className="w-3.5 h-3.5 text-brand-400" />
                <span className="font-bold text-[11px] uppercase tracking-wider">
                  Test Execution Console
                </span>
              </div>
              <span className="text-[10px] text-ink-500">
                {isRunning ? 'Executing test suite...' : testResults ? `${testResults.filter((r) => r.passed).length}/${testResults.length} Passing` : 'Idle'}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto no-scrollbar space-y-1 text-ink-300 text-[11px] sm:text-xs leading-relaxed">
              {consoleLogs.length === 0 ? (
                <div className="text-ink-500 italic py-2">
                  Click 'Run & Test' to evaluate your implementation against the automated test suite.
                </div>
              ) : (
                consoleLogs.map((line, idx) => (
                  <div
                    key={idx}
                    className={
                      line.includes('[PASS]')
                        ? 'text-emerald-400 font-semibold'
                        : line.includes('[FAIL]') || line.includes('[ERROR]')
                        ? 'text-rose-400 font-semibold'
                        : line.includes('100% SUITE PASSED')
                        ? 'text-brand-300 font-bold bg-brand-950/40 py-1'
                        : 'text-ink-300'
                    }
                  >
                    {line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Diagnostic Verification & Live Feedback (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* All Tests Passed Celebratory Card */}
          {allPassed && (
            <div className="p-4 bg-gradient-to-br from-emerald-500/10 via-surface to-emerald-500/5 dark:from-emerald-950/30 dark:to-ink-900 border border-emerald-500/30 rounded-xl space-y-2 animate-fade-in shadow-xs">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Architectural Mastery Achieved!</span>
              </div>
              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                You have successfully derived and implemented {project.architectureName} from first principles. All mathematical test vectors passed.
              </p>
            </div>
          )}

          {/* Test Vectors Suite Breakdown */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100 dark:border-white/5">
              <h4 className="text-xs font-bold font-display uppercase tracking-wider text-ink-900 dark:text-white">
                Verification Test Vectors ({project.testCases.length})
              </h4>
              <span className="text-[11px] font-mono text-ink-500">
                Tolerances: ±1e-4
              </span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto no-scrollbar">
              {project.testCases.map((tc, idx) => {
                const res = testResults?.find((r) => r.testId === tc.id);
                return (
                  <div
                    key={tc.id}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 transition-colors ${
                      res
                        ? res.passed
                          ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10'
                          : 'border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/10'
                        : 'border-ink-200/60 dark:border-white/5 bg-ink-50/50 dark:bg-ink-950/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink-900 dark:text-white flex items-center gap-1.5">
                        {res ? (
                          res.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-ink-400 dark:border-ink-600 flex items-center justify-center text-[9px] font-mono shrink-0">
                            {idx + 1}
                          </span>
                        )}
                        <span>{tc.description}</span>
                      </span>

                      {res && (
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            res.passed
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {res.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-ink-500 dark:text-ink-400 space-y-0.5 font-mono">
                      <div>Input: {tc.inputDesc}</div>
                      <div>Target: {tc.expectedDesc}</div>
                      {res && !res.passed && res.error && (
                        <div className="text-rose-600 dark:text-rose-400 font-sans pt-1">
                          {res.error}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Live Visual Simulation Mapping */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-ink-100 dark:border-white/5">
              <h4 className="text-xs font-bold font-display uppercase tracking-wider text-ink-900 dark:text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Live Architectural Simulation ({project.visualFeedbackType})</span>
              </h4>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Axiomatic Runtime Active
              </span>
            </div>

            {project.visualFeedbackType === 'sequence_state' && (
              <SequenceStateSimulator />
            )}

            {project.visualFeedbackType === 'attention_matrix' && (
              <AttentionMatrixSimulator />
            )}

            {project.visualFeedbackType === 'ssm_state' && (
              <SsmStateSimulator />
            )}

            {project.visualFeedbackType === 'graph_nodes' && (
              <GraphNodesSimulator />
            )}

            {project.visualFeedbackType === 'diffusion_grid' && (
              <DiffusionGridSimulator />
            )}

            {project.visualFeedbackType === 'continuous_flow' && (
              <ContinuousFlowSimulator />
            )}
          </div>

          {/* First Principles Theoretical Bedrock Dossier */}
          <TheoreticalBedrockViewer content={project.firstPrinciplesBedrock} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// LIVE SIMULATION SUB-COMPONENTS
// ============================================================================

const SequenceStateSimulator: React.FC = () => {
  const [forgetGate, setForgetGate] = useState<number>(0.95);
  const tokens = ['The', 'detective', 'found', 'the', 'clue', 'safely'];

  let c = 0;
  let h = 0;
  const states = tokens.map((tok, idx) => {
    const x = idx === 1 ? 1.5 : 0.2; // Keyword at index 1
    const candidate = Math.tanh(x);
    c = forgetGate * c + 0.6 * candidate;
    h = Math.tanh(c);
    const gradientRetention = Math.pow(forgetGate, idx);
    return { tok, idx, c: c.toFixed(2), h: h.toFixed(2), gradientRetention: (gradientRetention * 100).toFixed(1) };
  });

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-ink-600 dark:text-ink-400 font-mono text-[11px]">
          Forget Gate Valve (f_t = σ(W_f · x + b_f)):
        </span>
        <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
          {forgetGate.toFixed(2)} {forgetGate < 0.7 ? '(Amnesia Risk)' : '(CEC Active)'}
        </span>
      </div>
      <input
        type="range"
        min={0.1}
        max={1.0}
        step={0.05}
        value={forgetGate}
        onChange={(e) => setForgetGate(parseFloat(e.target.value))}
        className="w-full accent-brand-600 cursor-pointer"
      />
      <div className="grid grid-cols-6 gap-1 pt-1">
        {states.map((s) => (
          <div
            key={s.idx}
            className={`p-1.5 rounded border text-center transition-all ${
              s.idx === 1
                ? 'border-amber-500/50 bg-amber-500/10'
                : 'border-ink-200 dark:border-white/5 bg-ink-50/50 dark:bg-ink-950/40'
            }`}
          >
            <div className="font-bold text-[10px] text-ink-900 dark:text-white truncate">
              {s.tok}
            </div>
            <div className="text-[9px] font-mono text-ink-500 mt-0.5">c: {s.c}</div>
            <div className="text-[9px] font-mono text-brand-600 dark:text-brand-400">
              ∂c: {s.gradientRetention}%
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 bg-ink-100/60 dark:bg-ink-950/60 rounded text-[11px] text-ink-600 dark:text-ink-400 font-mono">
        CEC Invariant: Initial keyword signal retention at step 5 is{' '}
        <span className="font-bold text-ink-900 dark:text-white">
          {states[5].gradientRetention}%
        </span>
        .
      </div>
    </div>
  );
};

const AttentionMatrixSimulator: React.FC = () => {
  const [isScaled, setIsScaled] = useState<boolean>(true);
  const [queryIdx, setQueryIdx] = useState<number>(5); // "it"
  const tokens = ['The', 'animal', 'didn\'t', 'cross', 'street', 'it', 'was', 'tired'];

  // Synthetic affinities to token 5 ("it")
  const rawAffinities = [1.2, 8.4, 0.4, 0.8, 4.2, 2.0, 0.5, 7.8];
  const d_k = 64;
  const scale = isScaled ? 1 / Math.sqrt(d_k) : 1.0;

  const scaledScores = rawAffinities.map((v) => v * (isScaled ? 1.0 : 3.0) * scale);
  const maxScore = Math.max(...scaledScores);
  const exps = scaledScores.map((s) => Math.exp(s - maxScore));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  const weights = exps.map((e) => e / sumExps);

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-ink-600 dark:text-ink-400 font-mono text-[11px]">
          Temperature Scaling Mode:
        </span>
        <button
          onClick={() => setIsScaled(!isScaled)}
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
            isScaled
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30'
          }`}
        >
          {isScaled ? 'Scaled by 1/√d_k (Var = 1.0)' : 'Unscaled (Var = 64.0 - Saturated!)'}
        </button>
      </div>

      <div className="space-y-1.5">
        <div className="text-[11px] font-mono text-ink-500">
          Query Token: <span className="font-bold text-ink-900 dark:text-white">"{tokens[queryIdx]}"</span> (resolves coreference)
        </div>
        <div className="space-y-1">
          {tokens.map((tok, idx) => {
            const w = weights[idx];
            return (
              <div key={idx} className="flex items-center gap-2 font-mono text-[11px]">
                <span className="w-14 truncate text-ink-700 dark:text-ink-300">
                  {tok}
                </span>
                <div className="flex-1 h-3 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      tok === 'animal' || tok === 'tired'
                        ? 'bg-brand-500'
                        : 'bg-ink-400 dark:bg-ink-600'
                    }`}
                    style={{ width: `${Math.round(w * 100)}%` }}
                  />
                </div>
                <span className="w-12 text-right text-ink-600 dark:text-ink-400 text-[10px]">
                  {(w * 100).toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-2 bg-ink-100/60 dark:bg-ink-950/60 rounded text-[11px] text-ink-600 dark:text-ink-400 font-mono">
        {isScaled ? (
          <span className="text-emerald-600 dark:text-emerald-400">
            ✓ Logit variance stabilized at 1.0. Softmax gradients remain in high-sensitivity linear slope.
          </span>
        ) : (
          <span className="text-rose-600 dark:text-rose-400 font-semibold">
            ⚠ Logit variance exploded (Var=64). Softmax derivative ||∂s/∂z|| &lt; 1e-7 (Gradient death)!
          </span>
        )}
      </div>
    </div>
  );
};

const SsmStateSimulator: React.FC = () => {
  const [isSelective, setIsSelective] = useState<boolean>(true);
  const sequence = [
    { tok: 'KEY_A', isKey: true },
    { tok: 'filler_1', isKey: false },
    { tok: 'filler_2', isKey: false },
    { tok: 'filler_3', isKey: false },
    { tok: 'KEY_A', isKey: true },
    { tok: 'query', isKey: false },
  ];

  let h = 0;
  const states = sequence.map((item, idx) => {
    // In Selective Mamba: Δ_t -> 0 for filler, Δ_t -> 1.0 for key
    const delta = isSelective ? (item.isKey ? 1.0 : 0.02) : 0.6; // constant for LTI
    const A_bar = Math.exp(delta * -1.0);
    const B_bar = (1 - A_bar) * (item.isKey ? 1.5 : 0.8);
    h = A_bar * h + B_bar * (item.isKey ? 1.0 : 0.1);
    return { ...item, delta: delta.toFixed(2), h: h.toFixed(2) };
  });

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-ink-600 dark:text-ink-400 font-mono text-[11px]">
          State Transition Mode:
        </span>
        <button
          onClick={() => setIsSelective(!isSelective)}
          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
            isSelective
              ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300 border-brand-500/30'
              : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
          }`}
        >
          {isSelective ? 'Selective Mamba (Dynamic Δ_t)' : 'Constant LTI S4 (Static Δ)'}
        </button>
      </div>

      <div className="grid grid-cols-6 gap-1 pt-1">
        {states.map((s, idx) => (
          <div
            key={idx}
            className={`p-1.5 rounded border text-center transition-all ${
              s.isKey
                ? 'border-brand-500/50 bg-brand-500/10'
                : 'border-ink-200 dark:border-white/5 bg-ink-50/50 dark:bg-ink-950/40'
            }`}
          >
            <div className="font-bold text-[10px] text-ink-900 dark:text-white truncate">
              {s.tok}
            </div>
            <div className="text-[9px] font-mono text-ink-500 mt-0.5">Δ: {s.delta}</div>
            <div className="text-[9px] font-mono text-brand-600 dark:text-brand-400 font-bold">
              h: {s.h}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 bg-ink-100/60 dark:bg-ink-950/60 rounded text-[11px] text-ink-600 dark:text-ink-400 font-mono">
        {isSelective ? (
          <span className="text-brand-700 dark:text-brand-300">
            ✓ Selective Discretization: Filler tokens clamp Δ → 0. Memory state h remains frozen and protected across noise.
          </span>
        ) : (
          <span className="text-amber-700 dark:text-amber-300">
            ⚠ LTI Failure: Static Δ forces filter to ingest filler noise into memory register, contaminating key recall.
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// LEVEL 6: GRAPH NEURAL NETWORKS SIMULATOR (graph_nodes)
// ============================================================================
const GraphNodesSimulator: React.FC = () => {
  const [rounds, setRounds] = useState<number>(1);
  const [isNormalized, setIsNormalized] = useState<boolean>(true);
  const [permuteIdx, setPermuteIdx] = useState<number>(0);

  // 5-node molecule: Carbon ring (0-1-2-3) + attached Oxygen (4)
  const baseNodes = [
    { id: 0, label: 'C0 (Hub)', x: 120, y: 130, feature: 1.0 },
    { id: 1, label: 'C1', x: 70, y: 80, feature: 1.0 },
    { id: 2, label: 'C2', x: 70, y: 180, feature: 1.0 },
    { id: 3, label: 'C3', x: 20, y: 130, feature: 1.0 },
    { id: 4, label: 'O4 (Hetero)', x: 190, y: 130, feature: 3.2 },
  ];

  // Adjacency edges
  const edges = [
    [0, 1], [1, 3], [3, 2], [2, 0], // ring
    [0, 4], // branch to oxygen
  ];

  // Permutation orders
  const permutations = [
    [0, 1, 2, 3, 4],
    [4, 2, 0, 3, 1],
    [2, 3, 1, 4, 0],
  ];

  const perm = permutations[permuteIdx % permutations.length];

  // Simulate GCN message passing
  let currentFeatures = baseNodes.map((n) => n.feature);
  const N = baseNodes.length;

  // Degrees with self-loops
  const degrees = [4, 3, 3, 3, 2]; // C0 has degree 3+1=4, C1 has 2+1=3, C2 has 2+1=3, C3 has 2+1=3, O4 has 1+1=2

  for (let r = 0; r < rounds; r++) {
    const nextFeatures = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      let sum = currentFeatures[i]; // self-loop
      let count = 1;

      edges.forEach(([u, v]) => {
        if (u === i) {
          sum += isNormalized ? currentFeatures[v] / Math.sqrt(degrees[u] * degrees[v]) : currentFeatures[v];
          count++;
        } else if (v === i) {
          sum += isNormalized ? currentFeatures[u] / Math.sqrt(degrees[u] * degrees[v]) : currentFeatures[u];
          count++;
        }
      });

      if (isNormalized) {
        nextFeatures[i] = Number(((currentFeatures[i] / degrees[i]) + (sum - currentFeatures[i])).toFixed(2));
      } else {
        nextFeatures[i] = Number(sum.toFixed(2));
      }
    }
    currentFeatures = nextFeatures;
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-ink-600 dark:text-ink-400">Message Passing Hops:</span>
          <span className="font-bold text-brand-600 dark:text-brand-400">{rounds} Hops</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsNormalized(!isNormalized)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
              isNormalized
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30'
            }`}
          >
            {isNormalized ? 'Symmetric D̃^{-1/2} Ã D̃^{-1/2}' : 'Unnormalized Sum'}
          </button>
          <button
            onClick={() => setPermuteIdx(permuteIdx + 1)}
            className="px-2 py-0.5 rounded text-[10px] font-mono border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300 hover:text-ink-900 cursor-pointer"
          >
            Permute Index (π)
          </button>
        </div>
      </div>

      <input
        type="range"
        min={1}
        max={4}
        step={1}
        value={rounds}
        onChange={(e) => setRounds(parseInt(e.target.value))}
        className="w-full accent-brand-600 cursor-pointer"
      />

      {/* SVG Molecular Graph Canvas */}
      <div className="p-3 bg-ink-950 rounded-lg border border-ink-800 flex flex-col items-center justify-center">
        <svg viewBox="0 0 220 220" className="w-full max-w-[210px] h-[160px]">
          {/* Edges */}
          {edges.map(([u, v], idx) => {
            const nodeU = baseNodes[u];
            const nodeV = baseNodes[v];
            return (
              <line
                key={idx}
                x1={nodeU.x}
                y1={nodeU.y}
                x2={nodeV.x}
                y2={nodeV.y}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={2}
                strokeDasharray={isNormalized ? 'none' : '3,3'}
              />
            );
          })}

          {/* Nodes */}
          {baseNodes.map((n, idx) => {
            const mappedIndex = perm[idx];
            const featVal = currentFeatures[idx];
            const radius = Math.min(22, Math.max(12, 10 + featVal * 3));
            const isHub = idx === 0;

            return (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={radius}
                  fill={isHub ? '#6366f1' : idx === 4 ? '#ec4899' : '#10b981'}
                  fillOpacity={0.85}
                  stroke="#ffffff"
                  strokeWidth={1.5}
                />
                <text
                  x={n.x}
                  y={n.y - 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="8"
                  fontWeight="bold"
                  fill="#ffffff"
                  fontFamily="monospace"
                >
                  {n.label.split(' ')[0]}
                </text>
                <text
                  x={n.x}
                  y={n.y + 8}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="7"
                  fill="#ffffff"
                  fontFamily="monospace"
                >
                  {featVal.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="text-[10px] font-mono text-ink-400 mt-1">
          {isNormalized ? (
            <span className="text-emerald-400">
              ✓ Symmetric Normalization: Hub C0 ({currentFeatures[0]}) remains balanced with neighbors.
            </span>
          ) : (
            <span className="text-rose-400">
              ⚠ Unnormalized Sum Explosion: Hub C0 explodes to {currentFeatures[0]} (degree runaway).
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// LEVEL 7: GENERATIVE DIFFUSION SIMULATOR (diffusion_grid)
// ============================================================================
const DiffusionGridSimulator: React.FC = () => {
  const [timestepT, setTimestepT] = useState<number>(8);
  const [viewMode, setViewMode] = useState<'noisy' | 'tweedie'>('noisy');

  // 8x8 Target Pattern: Digit 8
  const cleanGrid = [
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ];

  const totalSteps = 20;
  const alphaBar = Math.cos(((timestepT / totalSteps + 0.008) / 1.008) * (Math.PI / 2)) ** 2;
  const sqrtAlphaBar = Math.sqrt(alphaBar);
  const sqrtOneMinusAlphaBar = Math.sqrt(1 - alphaBar);

  // Compute SNR in dB
  const snrDb = (10 * Math.log10(alphaBar / Math.max(1e-5, 1 - alphaBar))).toFixed(1);

  // Deterministic pseudo-noise grid
  const pseudoNoise = (r: number, c: number) => {
    const val = Math.sin(r * 12.9898 + c * 78.233 + 42) * 43758.5453;
    return (val - Math.floor(val)) * 2 - 1; // [-1, 1]
  };

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-ink-600 dark:text-ink-400">Diffusion Step t:</span>
          <span className="font-bold text-brand-600 dark:text-brand-400">
            {timestepT} / {totalSteps} (ᾱ_t = {alphaBar.toFixed(3)})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode(viewMode === 'noisy' ? 'tweedie' : 'noisy')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
              viewMode === 'tweedie'
                ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300 border-brand-500/30'
                : 'bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 border-ink-200 dark:border-white/10'
            }`}
          >
            {viewMode === 'tweedie' ? 'Tweedie Reconstructed x̂₀' : 'Observed Noisy x_t'}
          </button>
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={totalSteps}
        step={1}
        value={timestepT}
        onChange={(e) => setTimestepT(parseInt(e.target.value))}
        className="w-full accent-brand-600 cursor-pointer"
      />

      {/* 8x8 Pixel Canvas Grid */}
      <div className="p-3 bg-ink-950 rounded-lg border border-ink-800 flex flex-col items-center">
        <div className="grid grid-cols-8 gap-0.5 w-36 h-36 border border-ink-800 p-0.5 bg-ink-900 rounded">
          {cleanGrid.flatMap((row, r) =>
            row.map((x0, c) => {
              const noise = pseudoNoise(r, c);
              const xt = sqrtAlphaBar * x0 + sqrtOneMinusAlphaBar * noise;

              // If Tweedie mode, recover x0
              let pixelVal = xt;
              if (viewMode === 'tweedie') {
                const recovered = (xt - sqrtOneMinusAlphaBar * noise) / Math.max(1e-4, sqrtAlphaBar);
                pixelVal = recovered;
              }

              const clamped = Math.max(0, Math.min(1, (pixelVal + 0.3) / 1.3));
              const brightness = Math.round(clamped * 255);

              return (
                <div
                  key={`${r}-${c}`}
                  style={{ backgroundColor: `rgb(${brightness}, ${brightness}, ${brightness})` }}
                  className="w-full h-full rounded-2xs"
                />
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between w-full max-w-[240px] mt-2 font-mono text-[10px] text-ink-400">
          <span>SNR: {snrDb} dB</span>
          <span>
            {viewMode === 'tweedie' ? 'Tweedie Score Inversion Active' : 'Forward Thermal Dissipation'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// LEVEL 8: CONTINUOUS NEURAL ODE SIMULATOR (continuous_flow)
// ============================================================================
const ContinuousFlowSimulator: React.FC = () => {
  const [stepSizeDt, setStepSizeDt] = useState<number>(0.2);
  const [solverMode, setSolverMode] = useState<'rk4' | 'euler'>('rk4');
  const [reverseFlow, setReverseFlow] = useState<boolean>(false);

  // Nonlinear 2D vector field: dh/dt = [tanh(0.8 h0 - 0.5 h1), tanh(0.5 h0 + 0.8 h1)]
  const f = (h: [number, number]): [number, number] => [
    Math.tanh(0.8 * h[0] - 0.5 * h[1]),
    Math.tanh(0.5 * h[0] + 0.8 * h[1]),
  ];

  const h0: [number, number] = [0.6, -0.6];
  const steps = Math.round(1.0 / stepSizeDt);
  const trajectory: [number, number][] = [h0];

  let current = [...h0] as [number, number];
  for (let i = 0; i < steps; i++) {
    if (solverMode === 'euler') {
      const v = f(current);
      current = [current[0] + stepSizeDt * v[0], current[1] + stepSizeDt * v[1]];
    } else {
      // RK4 step
      const k1 = f(current);
      const k2 = f([current[0] + 0.5 * stepSizeDt * k1[0], current[1] + 0.5 * stepSizeDt * k1[1]]);
      const k3 = f([current[0] + 0.5 * stepSizeDt * k2[0], current[1] + 0.5 * stepSizeDt * k2[1]]);
      const k4 = f([current[0] + stepSizeDt * k3[0], current[1] + stepSizeDt * k3[1]]);
      current = [
        current[0] + (stepSizeDt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
        current[1] + (stepSizeDt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
      ];
    }
    trajectory.push([...current]);
  }

  // Reverse trajectory to test O(1) reversibility
  let reconstructedH0 = current;
  if (reverseFlow) {
    let revCurrent = [...current] as [number, number];
    for (let i = 0; i < steps; i++) {
      const k1 = f(revCurrent);
      const k2 = f([revCurrent[0] - 0.5 * stepSizeDt * k1[0], revCurrent[1] - 0.5 * stepSizeDt * k1[1]]);
      const k3 = f([revCurrent[0] - 0.5 * stepSizeDt * k2[0], revCurrent[1] - 0.5 * stepSizeDt * k2[1]]);
      const k4 = f([revCurrent[0] - stepSizeDt * k3[0], revCurrent[1] - stepSizeDt * k3[1]]);
      revCurrent = [
        revCurrent[0] - (stepSizeDt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]),
        revCurrent[1] - (stepSizeDt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]),
      ];
    }
    reconstructedH0 = revCurrent;
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="text-ink-600 dark:text-ink-400">Step Size Δt:</span>
          <span className="font-bold text-brand-600 dark:text-brand-400">{stepSizeDt}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSolverMode(solverMode === 'rk4' ? 'euler' : 'rk4')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
              solverMode === 'rk4'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30'
            }`}
          >
            {solverMode === 'rk4' ? 'Runge-Kutta 4 (RK4)' : '1st-Order Euler'}
          </button>
          <button
            onClick={() => setReverseFlow(!reverseFlow)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors cursor-pointer ${
              reverseFlow
                ? 'bg-brand-500/20 text-brand-700 dark:text-brand-300 border-brand-500/30 font-bold'
                : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300'
            }`}
          >
            Reverse Adjoint Flow
          </button>
        </div>
      </div>

      <input
        type="range"
        min={0.05}
        max={0.4}
        step={0.05}
        value={stepSizeDt}
        onChange={(e) => setStepSizeDt(parseFloat(e.target.value))}
        className="w-full accent-brand-600 cursor-pointer"
      />

      {/* SVG Phase Portrait Canvas */}
      <div className="p-3 bg-ink-950 rounded-lg border border-ink-800 flex flex-col items-center">
        <svg viewBox="0 0 200 160" className="w-full max-w-[220px] h-[150px]">
          {/* Axis crosshair */}
          <line x1={100} y1={10} x2={100} y2={150} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <line x1={10} y1={80} x2={190} y2={80} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

          {/* Continuous Trajectory Line */}
          <polyline
            fill="none"
            stroke={solverMode === 'rk4' ? '#10b981' : '#f59e0b'}
            strokeWidth={2}
            points={trajectory
              .map((pt) => `${100 + pt[0] * 65},${80 - pt[1] * 65}`)
              .join(' ')}
          />

          {/* Trajectory checkpoints */}
          {trajectory.map((pt, idx) => (
            <circle
              key={idx}
              cx={100 + pt[0] * 65}
              cy={80 - pt[1] * 65}
              r={idx === 0 ? 4 : idx === trajectory.length - 1 ? 4 : 2}
              fill={idx === 0 ? '#3b82f6' : idx === trajectory.length - 1 ? '#ec4899' : '#10b981'}
            />
          ))}
        </svg>

        <div className="flex items-center justify-between w-full max-w-[240px] mt-1 font-mono text-[10px]">
          <span className="text-ink-400">h(0): [{h0[0]}, {h0[1]}]</span>
          <span className="text-emerald-400">
            h(1): [{current[0].toFixed(2)}, {current[1].toFixed(2)}]
          </span>
        </div>
        {reverseFlow && (
          <div className="text-[10px] font-mono text-brand-400 mt-1">
            Reconstructed h(0): [{reconstructedH0[0].toFixed(3)}, {reconstructedH0[1].toFixed(3)}] (Exact O(1) Memory)
          </div>
        )}
      </div>
    </div>
  );
};


