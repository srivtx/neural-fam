/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * In-browser WebAssembly Python Execution Engine powered by Pyodide.
 * Enables zero-setup, zero-backend execution of neural network architectures
 * in pure Python directly within the learner's browser.
 */

import { TestCase } from '../types/project';

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
  }
}

export interface PyodideTestResult {
  testId: string;
  passed: boolean;
  actual: any;
  error?: string;
}

export interface PyodideRunOutcome {
  results: PyodideTestResult[];
  logs: string[];
  allPassed: boolean;
}

let pyodideInstance: any = null;
let pyodideLoadingPromise: Promise<any> | null = null;

const PYODIDE_CDN_SCRIPT = 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/pyodide.js';
const PYODIDE_INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.27.2/full/';

/**
 * Loads and initializes the Pyodide WebAssembly runtime.
 * Caches the initialized singleton instance for the session.
 */
export async function getPyodide(
  onStatus?: (status: string) => void
): Promise<any> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (pyodideLoadingPromise) {
    return pyodideLoadingPromise;
  }

  pyodideLoadingPromise = (async () => {
    // 1. Check if loadPyodide is already on window
    if (!window.loadPyodide) {
      onStatus?.('Loading Pyodide WebAssembly runtime from CDN...');
      await new Promise<void>((resolve, reject) => {
        const existingScript = document.querySelector<HTMLScriptElement>(
          `script[src="${PYODIDE_CDN_SCRIPT}"]`
        );
        if (existingScript) {
          existingScript.addEventListener('load', () => resolve());
          existingScript.addEventListener('error', () =>
            reject(new Error('Failed to load Pyodide script from CDN.'))
          );
          return;
        }

        const script = document.createElement('script');
        script.src = PYODIDE_CDN_SCRIPT;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(
            new Error(
              'Failed to load Pyodide WebAssembly engine from CDN. Please check your internet connection.'
            )
          );
        document.head.appendChild(script);
      });
    }

    onStatus?.('Initializing Python WebAssembly environment...');
    if (!window.loadPyodide) {
      throw new Error('window.loadPyodide not found after script injection.');
    }

    const pyodide = await window.loadPyodide({
      indexURL: PYODIDE_INDEX_URL,
    });

    pyodideInstance = pyodide;
    onStatus?.('Pyodide WebAssembly engine ready.');
    return pyodide;
  })();

  try {
    return await pyodideLoadingPromise;
  } catch (err) {
    pyodideLoadingPromise = null;
    throw err;
  }
}

/**
 * Converts a JS test case argument into an appropriate Python argument.
 */
function convertArgForPython(pyodide: any, arg: any, proxiesToDestroy: any[]): any {
  if (typeof arg === 'function') {
    return (...fnArgs: any[]) => {
      const convertedFnArgs = fnArgs.map((a) => {
        if (a && typeof a.toJs === 'function') {
          try {
            return a.toJs({ dict_converter: Object.fromEntries });
          } catch {
            return a;
          }
        }
        return a;
      });
      const res = arg(...convertedFnArgs);
      return res;
    };
  }

  if (
    arg === null ||
    arg === undefined ||
    typeof arg === 'number' ||
    typeof arg === 'string' ||
    typeof arg === 'boolean'
  ) {
    return arg;
  }

  try {
    const pyVal = pyodide.toPy(arg);
    if (pyVal && typeof pyVal.destroy === 'function') {
      proxiesToDestroy.push(pyVal);
    }
    return pyVal;
  } catch {
    return arg;
  }
}

/**
 * Converts a Python result (PyProxy or scalar) into a standard JavaScript object/value.
 */
function convertPyResultToJs(result: any): any {
  if (result === null || result === undefined) {
    return result;
  }

  if (typeof result.toJs === 'function') {
    try {
      const jsVal = result.toJs({ dict_converter: Object.fromEntries });
      return jsVal;
    } catch {
      return result;
    } finally {
      try {
        result.destroy();
      } catch {
        // no-op
      }
    }
  }

  return result;
}

/**
 * Deep equality and tolerance comparison between expected and actual test results.
 */
function compareResults(expected: any, actual: any, tol: number): boolean {
  if (typeof expected === 'number' && typeof actual === 'number') {
    return Math.abs(expected - actual) <= tol;
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) return false;
    return expected.every((expVal: any, i: number) => {
      if (typeof expVal === 'number' && typeof actual[i] === 'number') {
        return Math.abs(expVal - actual[i]) <= tol;
      }
      if (Array.isArray(expVal) && Array.isArray(actual[i])) {
        return compareResults(expVal, actual[i], tol);
      }
      if (typeof expVal === 'object' && expVal !== null && typeof actual[i] === 'object' && actual[i] !== null) {
        return compareResults(expVal, actual[i], tol);
      }
      return JSON.stringify(expVal) === JSON.stringify(actual[i]);
    });
  }

  if (
    typeof expected === 'object' &&
    expected !== null &&
    typeof actual === 'object' &&
    actual !== null
  ) {
    const expKeys = Object.keys(expected);
    if (expKeys.length === 0) return true;
    return expKeys.every((k) => {
      const ev = expected[k];
      const av = actual[k];
      if (av === undefined) return false;
      if (typeof ev === 'number' && typeof av === 'number') {
        return Math.abs(ev - av) <= tol;
      }
      if (Array.isArray(ev) && Array.isArray(av)) {
        return compareResults(ev, av, tol);
      }
      if (typeof ev === 'object' && ev !== null && typeof av === 'object' && av !== null) {
        return compareResults(ev, av, tol);
      }
      return JSON.stringify(ev) === JSON.stringify(av);
    });
  }

  return expected === actual;
}

/**
 * Executes user Python code and runs the verification test suite.
 */
export async function runPythonTestSuite(
  code: string,
  testCases: TestCase[],
  onStatus?: (status: string) => void
): Promise<PyodideRunOutcome> {
  const logs: string[] = [];
  logs.push('>>> [Pyodide Wasm Runner] Initializing Python sandbox in browser...');

  let pyodide: any;
  try {
    pyodide = await getPyodide((status) => {
      logs.push(`>>> ${status}`);
      onStatus?.(status);
    });
  } catch (err: any) {
    const errMsg = err?.message || 'Failed to initialize Pyodide WebAssembly.';
    logs.push(`>>> [ERROR] ${errMsg}`);
    return {
      results: testCases.map((tc) => ({
        testId: tc.id,
        passed: false,
        actual: undefined,
        error: errMsg,
      })),
      logs,
      allPassed: false,
    };
  }

  // Execute the user Python code in the sandbox
  try {
    await pyodide.runPythonAsync(code);
    logs.push('>>> Python code loaded and executed successfully in namespace.');
  } catch (err: any) {
    const errMsg = err?.message || 'Python execution error.';
    logs.push(`>>> [SYNTAX / RUNTIME ERROR] ${errMsg}`);
    return {
      results: testCases.map((tc) => ({
        testId: tc.id,
        passed: false,
        actual: undefined,
        error: errMsg,
      })),
      logs,
      allPassed: false,
    };
  }

  const results: PyodideTestResult[] = [];
  let passedCount = 0;

  for (let idx = 0; idx < testCases.length; idx++) {
    const tc = testCases[idx];
    const proxiesToDestroy: any[] = [];

    try {
      // Find function either with exact name or snake_case name
      let pyFn = pyodide.globals.get(tc.testFn);
      if (!pyFn) {
        const snakeName = tc.testFn.replace(/([A-Z])/g, '_$1').toLowerCase();
        pyFn = pyodide.globals.get(snakeName);
      }

      if (!pyFn || typeof pyFn !== 'function') {
        const errDesc = `Python function '${tc.testFn}' is not defined. Did you write 'def ${tc.testFn}(...):'?`;
        results.push({
          testId: tc.id,
          passed: false,
          actual: undefined,
          error: errDesc,
        });
        logs.push(`  [FAIL] Test ${idx + 1}: ${errDesc}`);
        continue;
      }

      // Convert arguments for Python execution
      const convertedArgs = tc.args.map((arg) =>
        convertArgForPython(pyodide, arg, proxiesToDestroy)
      );

      // Invoke target Python function
      const pyResult = pyFn(...convertedArgs);
      const actual = convertPyResultToJs(pyResult);

      const tol = tc.tolerance ?? 1e-4;
      const passed = compareResults(tc.expected, actual, tol);

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
        logs.push(
          `         Expected: ${JSON.stringify(tc.expected)} | Got: ${JSON.stringify(actual)}`
        );
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Python test evaluation exception.';
      results.push({
        testId: tc.id,
        passed: false,
        actual: undefined,
        error: errMsg,
      });
      logs.push(`  [ERROR] Test ${idx + 1}: ${errMsg}`);
    } finally {
      // Clean up any PyProxy arguments to avoid WebAssembly memory leaks
      proxiesToDestroy.forEach((p) => {
        try {
          p.destroy();
        } catch {
          // no-op
        }
      });
    }
  }

  const allPassed = passedCount === testCases.length;
  if (allPassed) {
    logs.push(`>>> Summary: 100% SUITE PASSED (${passedCount}/${testCases.length}).`);
    logs.push(`>>> Axiomatic Invariant Confirmed: Python WebAssembly derivation verified!`);
  } else {
    logs.push(`>>> Summary: ${passedCount}/${testCases.length} tests passing in Python sandbox.`);
  }

  return { results, logs, allPassed };
}
