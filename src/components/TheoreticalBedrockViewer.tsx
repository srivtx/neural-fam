/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TheoreticalBedrockViewer
 * Renders mathematical first-principles theory and pedagogical bedrock
 * as an exquisite, richly styled dossier with interactive formulas,
 * semantic typography, mathematical symbols, and physical insight callouts.
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Compass,
  Sparkles,
  Scale,
  Flame,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MathView } from './MathView';

interface TheoreticalBedrockViewerProps {
  content: string;
  className?: string;
}

// ============================================================================
// BALANCED BRACE PARSER & LATEX UNICODE CLEANER
// ============================================================================

function extractBracedArg(
  str: string,
  startIndex: number
): { content: string; endIndex: number } | null {
  const openIdx = str.indexOf('{', startIndex);
  if (openIdx === -1) return null;
  let depth = 1;
  let i = openIdx + 1;
  while (i < str.length && depth > 0) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') depth--;
    i++;
  }
  if (depth === 0) {
    return {
      content: str.slice(openIdx + 1, i - 1),
      endIndex: i,
    };
  }
  return null;
}

function replaceCommandWithArg(
  str: string,
  command: string,
  replacer: (inner: string) => string
): string {
  let res = str;
  let safety = 0;
  while (res.includes(command) && safety < 100) {
    safety++;
    const idx = res.indexOf(command);
    const braceIdx = res.indexOf('{', idx + command.length);
    if (braceIdx === -1) break;
    const between = res.slice(idx + command.length, braceIdx);
    if (between.trim() !== '') break;
    const arg = extractBracedArg(res, braceIdx);
    if (!arg) break;

    const replacement = replacer(arg.content);
    res = res.slice(0, idx) + replacement + res.slice(arg.endIndex);
  }
  return res;
}

function replaceFractions(input: string): string {
  let str = input;
  let safety = 0;
  while (str.includes('\\frac') && safety < 100) {
    safety++;
    const idx = str.indexOf('\\frac');
    const firstBrace = str.indexOf('{', idx + 5);
    if (firstBrace === -1) break;
    const arg1 = extractBracedArg(str, firstBrace);
    if (!arg1) break;
    const secondBrace = str.indexOf('{', arg1.endIndex);
    if (secondBrace === -1) break;
    const arg2 = extractBracedArg(str, secondBrace);
    if (!arg2) break;

    const num = arg1.content.trim();
    const den = arg2.content.trim();
    let replacement = '';
    if (num === '1' && den === '2') {
      replacement = '½';
    } else if (num === '1' && den === '4') {
      replacement = '¼';
    } else {
      const needsNumParens =
        num.includes(' ') && !num.startsWith('(') && !num.startsWith('\\partial');
      const needsDenParens =
        den.includes(' ') && !den.startsWith('(') && !den.startsWith('\\partial');
      const cleanNum = needsNumParens ? `(${num})` : num;
      const cleanDen = needsDenParens ? `(${den})` : den;
      replacement = `${cleanNum} / ${cleanDen}`;
    }

    str = str.slice(0, idx) + replacement + str.slice(arg2.endIndex);
  }
  return str;
}

export function cleanLatex(input: string): string {
  if (!input) return '';
  let s = input;

  // Unescape backslashes if escaped
  s = s.replace(/\\\\/g, '\\');

  // Fractions first (with balanced braces)
  s = replaceFractions(s);

  // Command wrappers
  s = replaceCommandWithArg(s, '\\text', (inner) => inner);
  s = replaceCommandWithArg(s, '\\mathrm', (inner) => inner);
  s = replaceCommandWithArg(s, '\\operatorname', (inner) => inner);
  s = replaceCommandWithArg(s, '\\mathbf', (inner) => inner);
  s = replaceCommandWithArg(s, '\\boldsymbol', (inner) => inner);
  s = replaceCommandWithArg(s, '\\bm', (inner) => inner);
  s = replaceCommandWithArg(s, '\\sqrt', (inner) => `√(${inner})`);

  // MathBB sets
  s = replaceCommandWithArg(s, '\\mathbb', (inner) => {
    switch (inner.trim()) {
      case 'R':
        return 'ℝ';
      case 'Z':
        return 'ℤ';
      case 'N':
        return 'ℕ';
      case 'C':
        return 'ℂ';
      case 'Q':
        return 'ℚ';
      default:
        return inner;
    }
  });

  // MathCal script
  s = replaceCommandWithArg(s, '\\mathcal', (inner) => {
    switch (inner.trim()) {
      case 'L':
        return 'ℒ';
      case 'F':
        return 'ℱ';
      case 'H':
        return 'ℋ';
      case 'T':
        return '𝒯';
      case 'W':
        return '𝒲';
      case 'E':
        return 'ℰ';
      case 'N':
        return '𝒩';
      case 'O':
        return '𝒪';
      default:
        return inner;
    }
  });

  // Spacing macros
  s = s.replace(/\\qquad/g, '    ');
  s = s.replace(/\\quad/g, '   ');
  s = s.replace(/\\[,;!]/g, ' ');

  // Delimiters
  s = s.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
  s = s.replace(/\\left\[/g, '[').replace(/\\right\]/g, ']');
  s = s.replace(/\\left\\\{/g, '{').replace(/\\right\\\}/g, '}');
  s = s.replace(/\\left\|/g, '‖').replace(/\\right\|/g, '‖');
  s = s.replace(/\\\{/g, '{').replace(/\\\}/g, '}');
  s = s.replace(/\\\|/g, '‖');

  // Greek letters
  s = s.replace(/\\alpha/g, 'α');
  s = s.replace(/\\beta/g, 'β');
  s = s.replace(/\\gamma/g, 'γ');
  s = s.replace(/\\Gamma/g, 'Γ');
  s = s.replace(/\\delta/g, 'δ');
  s = s.replace(/\\Delta/g, 'Δ');
  s = s.replace(/\\epsilon/g, 'ε');
  s = s.replace(/\\varepsilon/g, 'ε');
  s = s.replace(/\\zeta/g, 'ζ');
  s = s.replace(/\\eta/g, 'η');
  s = s.replace(/\\theta/g, 'θ');
  s = s.replace(/\\Theta/g, 'Θ');
  s = s.replace(/\\iota/g, 'ι');
  s = s.replace(/\\kappa/g, 'κ');
  s = s.replace(/\\lambda/g, 'λ');
  s = s.replace(/\\Lambda/g, 'Λ');
  s = s.replace(/\\mu/g, 'μ');
  s = s.replace(/\\nu/g, 'ν');
  s = s.replace(/\\xi/g, 'ξ');
  s = s.replace(/\\pi/g, 'π');
  s = s.replace(/\\Pi/g, 'Π');
  s = s.replace(/\\rho/g, 'ρ');
  s = s.replace(/\\sigma/g, 'σ');
  s = s.replace(/\\Sigma/g, 'Σ');
  s = s.replace(/\\tau/g, 'τ');
  s = s.replace(/\\phi/g, 'ϕ');
  s = s.replace(/\\Phi/g, 'Φ');
  s = s.replace(/\\chi/g, 'χ');
  s = s.replace(/\\psi/g, 'ψ');
  s = s.replace(/\\Psi/g, 'Ψ');
  s = s.replace(/\\omega/g, 'ω');
  s = s.replace(/\\Omega/g, 'Ω');

  // Mathematical Operators & Relations
  s = s.replace(/\\partial/g, '∂');
  s = s.replace(/\\nabla/g, '∇');
  s = s.replace(/\\sum/g, '∑');
  s = s.replace(/\\prod/g, '∏');
  s = s.replace(/\\int/g, '∫');
  s = s.replace(/\\odot/g, '⊙');
  s = s.replace(/\\otimes/g, '⊗');
  s = s.replace(/\\oplus/g, '⊕');
  s = s.replace(/\\bigoplus/g, '⨁');
  s = s.replace(/\\cdot/g, '·');
  s = s.replace(/\\times/g, '×');
  s = s.replace(/\\le(q)?(?![a-zA-Z])/g, '≤');
  s = s.replace(/\\ge(q)?(?![a-zA-Z])/g, '≥');
  s = s.replace(/\\ne(q)?(?![a-zA-Z])/g, '≠');
  s = s.replace(/\\approx/g, '≈');
  s = s.replace(/\\equiv/g, '≡');
  s = s.replace(/\\sim/g, '∼');
  s = s.replace(/\\propto/g, '∝');
  s = s.replace(/\\pm/g, '±');
  s = s.replace(/\\mp/g, '∓');
  s = s.replace(/\\to/g, '→');
  s = s.replace(/\\implies/g, '⟹');
  s = s.replace(/\\iff/g, '⟺');
  s = s.replace(/\\mapsto/g, '↦');
  s = s.replace(/\\forall/g, '∀');
  s = s.replace(/\\exists/g, '∃');
  s = s.replace(/\\in(?![a-zA-Z])/g, '∈');
  s = s.replace(/\\notin/g, '∉');
  s = s.replace(/\\infty/g, '∞');
  s = s.replace(/\\(c|l)?dots/g, '…');
  s = s.replace(/\\prime/g, '′');
  s = s.replace(/\\star/g, '★');
  s = s.replace(/\\circ/g, '∘');
  s = s.replace(/\\hbar/g, 'ℏ');
  s = s.replace(/\\hslash/g, 'ℏ');
  s = s.replace(/\\top/g, '⊤');
  s = s.replace(/\\bot/g, '⊥');
  s = s.replace(/\\ell/g, 'ℓ');

  // Clean spacing around ∂ and Δ
  s = s.replace(/∂\s+/g, '∂');
  s = s.replace(/Δ\s+([a-zA-Z])/g, 'Δ$1');

  // Superscripts
  s = s.replace(/\^T\b|\^\{T\}/g, 'ᵀ');
  s = s.replace(/\^\{-1\}/g, '⁻¹');
  s = s.replace(/\^2\b|\^\{2\}/g, '²');
  s = s.replace(/\^3\b|\^\{3\}/g, '³');
  s = s.replace(/\^n\b|\^\{n\}/g, 'ⁿ');
  s = s.replace(/\^L\b|\^\{L\}/g, 'ᴸ');
  s = s.replace(/\^\{\(l\)\}/g, '⁽ˡ⁾');
  s = s.replace(/\^\{\(L\)\}/g, '⁽ᴸ⁾');
  s = s.replace(/\^\{\(l-1\)\}/g, '⁽ˡ⁻¹⁾');
  s = s.replace(/\^\{\(l\+1\)\}/g, '⁽ˡ⁺¹⁾');
  s = s.replace(/\^\{(.*?)\}/g, '^($1)');

  // Subscripts
  s = s.replace(/_i\b|_\{i\}/g, 'ᵢ');
  s = s.replace(/_j\b|_\{j\}/g, 'ⱼ');
  s = s.replace(/_k\b|_\{k\}/g, 'ₖ');
  s = s.replace(/_m\b|_\{m\}/g, 'ₘ');
  s = s.replace(/_n\b|_\{n\}/g, 'ₙ');
  s = s.replace(/_p\b|_\{p\}/g, 'ₚ');
  s = s.replace(/_t\b|_\{t\}/g, 'ₜ');
  s = s.replace(/_\{t-1\}/g, 'ₜ₋₁');
  s = s.replace(/_\{t\+1\}/g, 'ₜ₊₁');
  s = s.replace(/_\{ij\}/g, 'ᵢⱼ');
  s = s.replace(/_\{ji\}/g, 'ⱼᵢ');
  s = s.replace(/_1\b|_\{1\}/g, '₁');
  s = s.replace(/_2\b|_\{2\}/g, '₂');
  s = s.replace(/_0\b|_\{0\}/g, '₀');
  s = s.replace(/_\{(.*?)\}/g, '_$1');

  // Remaining braces and backslashes
  s = s.replace(/\{([^{}]+)\}/g, '$1');
  s = s.replace(/\\([a-zA-Z]+)/g, '$1');

  return s;
}

// ============================================================================
// INLINE TOKENIZER & RENDERER
// ============================================================================

type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'code'; value: string };

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let remaining = text;

  // Prioritize $...$ math tokens so internal asterisks like $W^*$ aren't broken by bold/italic
  const pattern = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$|\*\*[^*]+?\*\*|`[^`]+?`|\*[^*]+?\*)/;

  while (remaining.length > 0) {
    const match = remaining.match(pattern);
    if (!match || match.index === undefined) {
      tokens.push({ type: 'text', value: remaining });
      break;
    }

    if (match.index > 0) {
      tokens.push({ type: 'text', value: remaining.slice(0, match.index) });
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
      tokens.push({ type: 'math', value: matchedStr.slice(2, -2) });
    } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$')) {
      tokens.push({ type: 'math', value: matchedStr.slice(1, -1) });
    } else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      tokens.push({ type: 'bold', value: matchedStr.slice(2, -2) });
    } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      tokens.push({ type: 'code', value: matchedStr.slice(1, -1) });
    } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
      tokens.push({ type: 'italic', value: matchedStr.slice(1, -1) });
    } else {
      tokens.push({ type: 'text', value: matchedStr });
    }

    remaining = remaining.slice(match.index + matchedStr.length);
  }

  return tokens;
}

export function renderInlineContent(text: string): React.ReactNode {
  const tokens = tokenizeInline(text);

  return tokens.map((token, idx) => {
    switch (token.type) {
      case 'math': {
        return (
          <span
            key={idx}
            className="px-1 py-0.5 mx-0.5 rounded bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold border border-brand-500/15 inline-block select-all"
          >
            <MathView math={token.value} display={false} />
          </span>
        );
      }
      case 'bold': {
        // If bold itself contains math, tokenize the inner content
        return (
          <strong key={idx} className="font-bold text-ink-900 dark:text-white font-sans">
            {renderInlineContent(token.value)}
          </strong>
        );
      }
      case 'italic': {
        return (
          <em key={idx} className="italic text-ink-800 dark:text-ink-200">
            {renderInlineContent(token.value)}
          </em>
        );
      }
      case 'code': {
        return (
          <code
            key={idx}
            className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-ink-100 dark:bg-ink-800/80 text-ink-800 dark:text-ink-200 border border-ink-200/80 dark:border-white/5"
          >
            {token.value}
          </code>
        );
      }
      case 'text':
      default: {
        return <span key={idx}>{token.value}</span>;
      }
    }
  });
}

// ============================================================================
// CONTENT BLOCK DATA STRUCTURES & PARSER
// ============================================================================

type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'display_math'; formula: string; label?: string }
  | { type: 'callout'; tag: string; text: string; variant: 'amber' | 'cyan' }
  | { type: 'bullet_list'; items: string[] }
  | { type: 'numbered_list'; items: { num: string; text: string; formula?: string }[] }
  | { type: 'subheading'; text: string };

interface Section {
  id: string;
  index: number;
  title: string;
  blocks: ContentBlock[];
}

function parseBlocks(lines: string[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Display math $$...$$
    if (trimmed.startsWith('$$')) {
      if (trimmed.endsWith('$$') && trimmed.length > 2) {
        // Single-line display math
        const formula = trimmed.slice(2, -2).trim();
        const labelMatch = formula.match(/\[(Eq\.\s*\d+[^\]]*)\]/i);
        blocks.push({
          type: 'display_math',
          formula,
          label: labelMatch ? labelMatch[1] : undefined,
        });
        i++;
        continue;
      } else {
        // Multi-line display math
        let formula = trimmed.slice(2);
        i++;
        while (i < lines.length && !lines[i].trim().endsWith('$$')) {
          formula += '\n' + lines[i];
          i++;
        }
        if (i < lines.length) {
          formula += '\n' + lines[i].trim().slice(0, -2);
          i++;
        }
        const labelMatch = formula.match(/\[(Eq\.\s*\d+[^\]]*)\]/i);
        blocks.push({
          type: 'display_math',
          formula: formula.trim(),
          label: labelMatch ? labelMatch[1] : undefined,
        });
        continue;
      }
    }

    // 2. Highlighted Insight / Alert Callouts
    // e.g. *Critical Physical Insight*: ... or **The Full Algebraic Contradiction Proof**:
    const calloutMatch =
      trimmed.match(/^\*([^*]+)\*:\s*(.*)$/) ||
      trimmed.match(/^\*\*([^*]+)\*\*:\s*(.*)$/);

    if (calloutMatch) {
      const tag = calloutMatch[1].trim();
      const text = calloutMatch[2].trim();
      const lowerTag = tag.toLowerCase();
      const isAmber =
        lowerTag.includes('insight') ||
        lowerTag.includes('physical') ||
        lowerTag.includes('distinction') ||
        lowerTag.includes('crisis') ||
        lowerTag.includes('warning') ||
        lowerTag.includes('catastrophe');

      blocks.push({
        type: 'callout',
        tag,
        text,
        variant: isAmber ? 'amber' : 'cyan',
      });
      i++;
      continue;
    }

    // 3. Subheadings like **Step 1: ...** or **1. Inputs ...**
    const stepHeadingMatch = trimmed.match(/^\*\*(Step\s*\d+[^:]*)\*\*:?$/i);
    if (stepHeadingMatch) {
      blocks.push({
        type: 'subheading',
        text: stepHeadingMatch[1].trim(),
      });
      i++;
      continue;
    }

    // 4. Numbered Lists: 1. ...
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const items: { num: string; text: string; formula?: string }[] = [];
      while (i < lines.length) {
        const line = lines[i].trim();
        const m = line.match(/^(\d+)\.\s+(.*)$/);
        if (m) {
          let itemText = m[2];
          let itemFormula: string | undefined = undefined;

          // Check if the next line is an indented formula
          if (i + 1 < lines.length && lines[i + 1].trim().startsWith('$$')) {
            const formulaLine = lines[i + 1].trim();
            if (formulaLine.endsWith('$$') && formulaLine.length > 2) {
              itemFormula = formulaLine.slice(2, -2).trim();
              i++;
            }
          }

          items.push({ num: m[1], text: itemText, formula: itemFormula });
          i++;
        } else if (!line) {
          // Check if next non-empty line continues numbered list
          let nextIdx = i + 1;
          while (nextIdx < lines.length && !lines[nextIdx].trim()) nextIdx++;
          if (nextIdx < lines.length && lines[nextIdx].trim().match(/^(\d+)\.\s+/)) {
            i = nextIdx;
            continue;
          }
          break;
        } else {
          break;
        }
      }
      blocks.push({ type: 'numbered_list', items });
      continue;
    }

    // 5. Bullet Lists: - ... or * ... (not bold **)
    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch && !trimmed.startsWith('**')) {
      const items: string[] = [];
      while (i < lines.length) {
        const line = lines[i].trim();
        const bm = line.match(/^[-*•]\s+(.*)$/);
        if (bm && !line.startsWith('**')) {
          items.push(bm[1]);
          i++;
        } else if (!line) {
          // Check if next non-empty line continues bullets
          let nextIdx = i + 1;
          while (nextIdx < lines.length && !lines[nextIdx].trim()) nextIdx++;
          if (
            nextIdx < lines.length &&
            nextIdx < lines.length &&
            lines[nextIdx].trim().match(/^[-*•]\s+/) &&
            !lines[nextIdx].trim().startsWith('**')
          ) {
            i = nextIdx;
            continue;
          }
          break;
        } else {
          break;
        }
      }
      blocks.push({ type: 'bullet_list', items });
      continue;
    }

    // 6. Regular Paragraph
    let para = trimmed;
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('$$') &&
      !lines[i].trim().startsWith('### ') &&
      !lines[i].trim().match(/^[-*•]\s+/) &&
      !lines[i].trim().match(/^(\d+)\.\s+/) &&
      !lines[i].trim().match(/^\*([^*]+)\*:\s*/)
    ) {
      para += ' ' + lines[i].trim();
      i++;
    }

    blocks.push({ type: 'paragraph', text: para });
  }

  return blocks;
}

function parseSections(raw: string): Section[] {
  if (!raw || !raw.trim()) return [];

  const lines = raw.trim().split('\n');
  const sections: Section[] = [];
  let currentTitle = '';
  let currentLines: string[] = [];
  let sectionIndex = 1;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('### ')) {
      if (currentLines.some((l) => l.trim().length > 0)) {
        sections.push({
          id: `sec-${sectionIndex}`,
          index: sectionIndex,
          title: currentTitle || 'Theoretical Foundations & Axioms',
          blocks: parseBlocks(currentLines),
        });
        sectionIndex++;
        currentLines = [];
      }
      currentTitle = trimmed.replace(/^###\s+/, '').trim();
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.some((l) => l.trim().length > 0)) {
    sections.push({
      id: `sec-${sectionIndex}`,
      index: sectionIndex,
      title: currentTitle || 'Theoretical Foundations & Axioms',
      blocks: parseBlocks(currentLines),
    });
  }

  return sections;
}

// ============================================================================
// THEME & ICON DISPATCHER
// ============================================================================

function getSectionTheme(title: string, index: number) {
  const t = title.toLowerCase();

  if (
    t.includes('physical') ||
    t.includes('sensory') ||
    t.includes('origin') ||
    t.includes('crisis') ||
    t.includes('catastrophe') ||
    t.includes('degradation') ||
    t.includes('wall')
  ) {
    return {
      Icon: Flame,
      iconColor: 'text-amber-500',
      badgeClass:
        'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
      accentBorder: 'border-l-amber-500',
      tag: 'PHYSICAL PHENOMENON',
    };
  }

  if (
    t.includes('math') ||
    t.includes('abstraction') ||
    t.includes('algebra') ||
    t.includes('proof') ||
    t.includes('matrix') ||
    t.includes('toeplitz') ||
    t.includes('equivariance') ||
    t.includes('derivation') ||
    t.includes('adjoint')
  ) {
    return {
      Icon: Scale,
      iconColor: 'text-indigo-500',
      badgeClass:
        'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20',
      accentBorder: 'border-l-indigo-500',
      tag: 'ALGEBRAIC PROOF',
    };
  }

  if (
    t.includes('breakthrough') ||
    t.includes('insight') ||
    t.includes('highway') ||
    t.includes('solution') ||
    t.includes('relu') ||
    t.includes('resnet') ||
    t.includes('cec')
  ) {
    return {
      Icon: Sparkles,
      iconColor: 'text-brand-500',
      badgeClass:
        'bg-brand-500/10 text-brand-700 dark:text-brand-300 border-brand-500/20',
      accentBorder: 'border-l-brand-500',
      tag: 'FIRST-PRINCIPLES BREAKTHROUGH',
    };
  }

  if (
    t.includes('receptive') ||
    t.includes('spatial') ||
    t.includes('architecture') ||
    t.includes('layer') ||
    t.includes('state') ||
    t.includes('growth') ||
    t.includes('complexity')
  ) {
    return {
      Icon: Compass,
      iconColor: 'text-emerald-500',
      badgeClass:
        'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      accentBorder: 'border-l-emerald-500',
      tag: 'GEOMETRIC INVARIANT',
    };
  }

  // Fallback cycling among BookOpen, Compass, Sparkles, Scale, Flame
  const iconCycle = [BookOpen, Compass, Sparkles, Scale, Flame];
  const ChosenIcon = iconCycle[index % iconCycle.length];

  return {
    Icon: ChosenIcon,
    iconColor: 'text-sky-500',
    badgeClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
    accentBorder: 'border-l-sky-500',
    tag: `FOUNDATION 0${index + 1}`,
  };
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const FormulaCallout: React.FC<{ formula: string; label?: string }> = ({
  formula,
  label,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const cleaned = useMemo(() => cleanLatex(formula), [formula]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(cleaned);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl bg-ink-950 border border-ink-800 text-brand-300 shadow-xs overflow-hidden transition-all group">
      <div className="flex items-center justify-between px-3 py-1.5 bg-ink-900/90 border-b border-ink-800/80 text-[10px] font-mono">
        <span className="flex items-center gap-1.5 text-ink-400 font-sans uppercase tracking-wider font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
          <span>{label || 'MATHEMATICAL INVARIANT'}</span>
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-ink-400 hover:text-brand-300 hover:bg-ink-800 transition-colors cursor-pointer"
          title="Copy formula"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3 sm:p-4 text-center overflow-x-auto text-xs sm:text-[13px] font-semibold tracking-wide text-brand-200 select-all leading-relaxed">
        <MathView math={formula} display={true} className="text-brand-200" />
      </div>
    </div>
  );
};

const CalloutAlert: React.FC<{
  tag: string;
  text: string;
  variant: 'amber' | 'cyan';
}> = ({ tag, text, variant }) => {
  const isAmber = variant === 'amber';

  return (
    <div
      className={`my-3 p-3.5 sm:p-4 rounded-xl border-l-4 shadow-xs transition-colors ${
        isAmber
          ? 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-500 border-y border-r border-amber-500/20 text-amber-950 dark:text-amber-200'
          : 'bg-cyan-500/10 dark:bg-cyan-950/20 border-cyan-500 border-y border-r border-cyan-500/20 text-cyan-950 dark:text-cyan-200'
      }`}
    >
      <div
        className={`flex items-center gap-1.5 font-display font-bold uppercase tracking-wider text-xs mb-1.5 ${
          isAmber ? 'text-amber-700 dark:text-amber-400' : 'text-cyan-700 dark:text-cyan-400'
        }`}
      >
        {isAmber ? (
          <Flame className="w-3.5 h-3.5 text-amber-500" />
        ) : (
          <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
        )}
        <span>{tag}</span>
      </div>
      <div className="text-xs sm:text-[13px] leading-relaxed text-ink-800 dark:text-ink-200">
        {renderInlineContent(text)}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT: TheoreticalBedrockViewer
// ============================================================================

export const TheoreticalBedrockViewer: React.FC<TheoreticalBedrockViewerProps> = ({
  content,
  className = '',
}) => {
  const sections = useMemo(() => parseSections(content), [content]);

  // All sections expanded by default for smooth reading, with toggle capability
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((sec) => {
      initial[sec.id] = true;
    });
    return initial;
  });

  if (!sections.length) {
    return null;
  }

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isAllExpanded = sections.every((s) => expandedSections[s.id]);

  const toggleAll = () => {
    const nextState = !isAllExpanded;
    const updated: Record<string, boolean> = {};
    sections.forEach((s) => {
      updated[s.id] = nextState;
    });
    setExpandedSections(updated);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dossier Master Header Bar */}
      <div className="p-4 sm:p-5 bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
              FIRST-PRINCIPLES DOSSIER
            </span>
            <span className="text-xs text-ink-400 font-mono">
              · {sections.length} Foundational {sections.length === 1 ? 'Pillar' : 'Pillars'}
            </span>
          </div>

          {sections.length > 1 && (
            <button
              onClick={toggleAll}
              className="flex items-center gap-1.5 text-xs font-mono font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>{isAllExpanded ? 'Collapse All' : 'Expand All'}</span>
              {isAllExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        <div>
          <h3 className="text-sm sm:text-base font-bold font-display tracking-tight text-ink-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Theoretical Bedrock</span>
          </h3>
          <p className="text-xs text-ink-600 dark:text-ink-400 mt-0.5 leading-relaxed">
            Exhaustive physical origins, mathematical formulations, and invariant proofs.
          </p>
        </div>
      </div>

      {/* Render Each Section as a Distinct Card Block */}
      <div className="space-y-3.5">
        {sections.map((section, idx) => {
          const theme = getSectionTheme(section.title, idx);
          const SectionIcon = theme.Icon;
          const isExpanded = expandedSections[section.id] ?? true;

          return (
            <div
              key={section.id}
              className={`bg-surface dark:bg-ink-900/90 rounded-2xl border border-ink-200 dark:border-white/10 overflow-hidden shadow-xs transition-all ${
                isExpanded ? 'ring-1 ring-black/5 dark:ring-white/5' : ''
              }`}
            >
              {/* Section Header Card */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 sm:p-4.5 flex items-start sm:items-center justify-between gap-3 text-left hover:bg-ink-50/70 dark:hover:bg-ink-850/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.badgeClass} border`}
                  >
                    <SectionIcon className={`w-4 h-4 ${theme.iconColor}`} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-400">
                        PILLAR 0{section.index}
                      </span>
                      <span className="text-ink-300 dark:text-ink-700">·</span>
                      <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${theme.iconColor}`}>
                        {theme.tag}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold font-display text-ink-900 dark:text-white tracking-tight mt-0.5 truncate">
                      {section.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 pt-1 sm:pt-0">
                  <div className="w-6 h-6 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center text-ink-500 dark:text-ink-400">
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              </button>

              {/* Section Content Body */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-ink-100 dark:border-white/5 space-y-3 animate-fade-in">
                  {section.blocks.map((block, bIdx) => {
                    switch (block.type) {
                      case 'display_math': {
                        return (
                          <FormulaCallout
                            key={bIdx}
                            formula={block.formula}
                            label={block.label}
                          />
                        );
                      }

                      case 'callout': {
                        return (
                          <CalloutAlert
                            key={bIdx}
                            tag={block.tag}
                            text={block.text}
                            variant={block.variant}
                          />
                        );
                      }

                      case 'subheading': {
                        return (
                          <div
                            key={bIdx}
                            className="pt-2 pb-0.5 flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                            <h5 className="text-xs font-bold font-display uppercase tracking-wider text-ink-900 dark:text-white font-mono">
                              {block.text}
                            </h5>
                          </div>
                        );
                      }

                      case 'numbered_list': {
                        return (
                          <ol key={bIdx} className="space-y-2.5 my-2">
                            {block.items.map((item, itmIdx) => (
                              <li
                                key={itmIdx}
                                className="flex items-start gap-2.5 text-xs sm:text-[13px] text-ink-700 dark:text-ink-300"
                              >
                                <span className="flex-shrink-0 w-5 h-5 rounded-md bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 text-brand-700 dark:text-brand-300 font-mono text-[10px] font-bold flex items-center justify-center mt-0.5">
                                  {item.num}
                                </span>
                                <div className="flex-1 min-w-0 leading-relaxed">
                                  <div>{renderInlineContent(item.text)}</div>
                                  {item.formula && (
                                    <FormulaCallout formula={item.formula} />
                                  )}
                                </div>
                              </li>
                            ))}
                          </ol>
                        );
                      }

                      case 'bullet_list': {
                        return (
                          <ul key={bIdx} className="space-y-1.5 my-2">
                            {block.items.map((itemText, itmIdx) => (
                              <li
                                key={itmIdx}
                                className="flex items-start gap-2.5 text-xs sm:text-[13px] text-ink-700 dark:text-ink-300"
                              >
                                <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-brand-400 mt-1.5"></span>
                                <div className="flex-1 min-w-0 leading-relaxed">
                                  {renderInlineContent(itemText)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        );
                      }

                      case 'paragraph':
                      default: {
                        return (
                          <p
                            key={bIdx}
                            className="text-xs sm:text-[13px] text-ink-700 dark:text-ink-300 leading-relaxed font-sans"
                          >
                            {renderInlineContent(block.text)}
                          </p>
                        );
                      }
                    }
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
