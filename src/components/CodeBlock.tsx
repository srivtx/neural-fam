/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, Play, Terminal } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { copyTextToClipboard } from '../utils/clipboard';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  onRun?: () => void;
  runLabel?: string;
  output?: string | null;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'TypeScript',
  filename,
  onRun,
  runLabel = 'Run',
  output,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(code);
    if (ok) {
      setCopied(true);
      soundFX.playTap();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRun = () => {
    if (onRun) {
      soundFX.playTap();
      onRun();
    }
  };

  // Comprehensive tokenizer for crisp syntax highlighting in both TS and Python
  const highlightSyntax = (rawCode: string) => {
    const lines = rawCode.split('\n');
    return lines.map((line, lineIdx) => {
      // Check for single line comments
      const commentMatch = line.match(/^(\s*)(\/\/.*|#.*)$/);
      if (commentMatch) {
        return (
          <div key={lineIdx} className="table-row">
            <span className="table-cell select-none pr-4 text-right text-ink-400 dark:text-ink-600 text-[11px] font-mono whitespace-nowrap">
              {lineIdx + 1}
            </span>
            <span className="table-cell text-ink-500 dark:text-ink-400 italic whitespace-pre font-mono">
              {commentMatch[1]}{commentMatch[2]}
            </span>
          </div>
        );
      }

      // Tokenize line elements
      const tokens = line.split(/(\b(?:const|let|var|function|return|import|from|export|class|def|if|else|for|while|new|async|await|as|type|interface|self|super|lambda|in|is|not|and|or|pass|assert|None|True|False)\b|\b(?:number|string|boolean|void|any|Tensor|nn|Module|torch|np|math|int|float|tuple|list|dict)\b|".*?"|'.*?'|`.*?`|\/\/.*|#.*|\b\d+(?:\.\d+)?\b|[=+\-*/@%<>!&|^~]+|\b(?:__init__|forward|shape|squeeze|unsqueeze|transpose|contiguous|view|chunk|sum|mean|softmax|relu|tanh|sigmoid|linear|matmul|zeros|randn|ones|where)\b)/g);

      return (
        <div key={lineIdx} className="table-row hover:bg-ink-200/30 dark:hover:bg-ink-900/40 transition-colors">
          <span className="table-cell select-none pr-4 text-right text-ink-400 dark:text-ink-600 text-[11px] font-mono whitespace-nowrap">
            {lineIdx + 1}
          </span>
          <span className="table-cell whitespace-pre font-mono">
            {tokens.map((token, tIdx) => {
              if (!token) return null;

              // Keywords
              if (/^(const|let|var|function|return|import|from|export|class|def|if|else|for|while|new|async|await|as|type|interface|self|super|lambda|in|is|not|and|or|pass|assert)$/.test(token)) {
                return (
                  <span key={tIdx} className="text-purple-600 dark:text-purple-400 font-bold">
                    {token}
                  </span>
                );
              }

              // Literals (True, False, None)
              if (/^(None|True|False)$/.test(token)) {
                return (
                  <span key={tIdx} className="text-amber-600 dark:text-amber-400 font-bold">
                    {token}
                  </span>
                );
              }

              // Types & Frameworks
              if (/^(number|string|boolean|void|any|Tensor|nn|Module|torch|np|math|int|float|tuple|list|dict)$/.test(token)) {
                return (
                  <span key={tIdx} className="text-blue-600 dark:text-blue-400 font-semibold">
                    {token}
                  </span>
                );
              }

              // Builtin methods & tensor operations
              if (/^(__init__|forward|shape|squeeze|unsqueeze|transpose|contiguous|view|chunk|sum|mean|softmax|relu|tanh|sigmoid|linear|matmul|zeros|randn|ones|where)$/.test(token)) {
                return (
                  <span key={tIdx} className="text-brand-700 dark:text-brand-400 font-medium">
                    {token}
                  </span>
                );
              }

              // Strings
              if (/^["'`].*["'`]$/.test(token)) {
                return (
                  <span key={tIdx} className="text-brand-600 dark:text-brand-300">
                    {token}
                  </span>
                );
              }

              // Numbers
              if (/^\d+(?:\.\d+)?$/.test(token)) {
                return (
                  <span key={tIdx} className="text-amber-600 dark:text-amber-300 font-mono font-semibold">
                    {token}
                  </span>
                );
              }

              // Trailing comment
              if (token.startsWith('//') || token.startsWith('#')) {
                return (
                  <span key={tIdx} className="text-ink-500 dark:text-ink-400 italic">
                    {token}
                  </span>
                );
              }

              // Operators
              if (/^[=+\-*/@%<>!&|^~]+$/.test(token)) {
                return (
                  <span key={tIdx} className="text-pink-600 dark:text-pink-400 font-semibold">
                    {token}
                  </span>
                );
              }

              // Default code text
              return (
                <span key={tIdx} className="text-ink-800 dark:text-ink-200">
                  {token}
                </span>
              );
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="rounded-xl border border-ink-200 dark:border-white/10 overflow-hidden bg-ink-50 dark:bg-ink-950 shadow-xs text-xs font-mono">
      {/* Header Bar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-ink-100 dark:bg-ink-900 border-b border-ink-200 dark:border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span className="font-semibold text-ink-700 dark:text-ink-300">
            {filename || language}
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-ink-200 dark:bg-ink-800 text-ink-600 dark:text-ink-400">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRun && (
            <button
              onClick={handleRun}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-[11px] transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{runLabel}</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface dark:bg-ink-800 border border-ink-200 dark:border-white/10 text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                <span className="text-[11px] text-green-600 dark:text-green-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-ink-500" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-4 overflow-x-auto leading-relaxed min-w-0">
        <div className="table min-w-full">{highlightSyntax(code)}</div>
      </div>

      {/* Execution Output if any */}
      {output && (
        <div className="p-3.5 bg-ink-900 dark:bg-ink-950 border-t border-ink-200 dark:border-white/10 text-brand-400 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
            Runtime Output:
          </div>
          <pre className="text-xs font-mono text-brand-300 dark:text-brand-400 whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};
