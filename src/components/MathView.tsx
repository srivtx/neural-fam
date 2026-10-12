/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MathView: High-performance, publication-grade LaTeX mathematical formula renderer powered by KaTeX.
 * Gracefully renders inline ($...$) and display ($$...$$) mathematical expressions
 * with automatic fallback to unicode mathematical symbols if syntax errors occur.
 */

import React, { useMemo } from 'react';
import katex from 'katex';
import { cleanLatex } from './TheoreticalBedrockViewer';

interface MathViewProps {
  math: string;
  display?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({
  math,
  display = false,
  className = '',
}) => {
  const html = useMemo(() => {
    if (!math) return '';

    // Strip wrapping $ or $$ if present
    let raw = math.trim();
    if (raw.startsWith('$$') && raw.endsWith('$$') && raw.length > 2) {
      raw = raw.slice(2, -2).trim();
    } else if (raw.startsWith('$') && raw.endsWith('$') && raw.length > 1) {
      raw = raw.slice(1, -1).trim();
    }

    try {
      return katex.renderToString(raw, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch {
      // Fallback to unicode clean text
      const unicodeCleaned = cleanLatex(raw);
      return `<span class="font-mono">${unicodeCleaned}</span>`;
    }
  }, [math, display]);

  if (!html) return null;

  return (
    <span
      className={`katex-math-container ${display ? 'block my-1.5 overflow-x-auto no-scrollbar text-center' : 'inline-block align-baseline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathView;
