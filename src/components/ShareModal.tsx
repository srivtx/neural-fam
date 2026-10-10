/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Globe, Laptop, Smartphone } from 'lucide-react';
import { copyTextToClipboard } from '../utils/clipboard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const repoUrl = 'https://github.com/srivtx/neural-fam';
  const vercelDeployUrl = 'https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsrivtx%2Fneural-fam';
  const currentBrowserUrl = typeof window !== 'undefined' && window.location && window.location.href
    ? window.location.href
    : repoUrl;

  const copyToClipboard = async (text: string, key: string) => {
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ink-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-ink-900 dark:text-white">
                Share & Deploy Neural Family
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Open in a clean browser tab, view the source code, or deploy your own copy.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-ink-400 hover:text-ink-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="space-y-4 text-xs">
          {/* Current URL */}
          <div className="space-y-2 p-3.5 bg-ink-50 dark:bg-ink-950 rounded-xl border border-ink-200 dark:border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink-800 dark:text-ink-200">
                Active Application URL
              </span>
              <span className="text-[10px] font-mono text-ink-400">Direct link</span>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="text"
                readOnly
                value={currentBrowserUrl}
                className="flex-1 bg-surface dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-lg px-3 py-2 font-mono text-[11px] text-ink-800 dark:text-ink-200 focus:outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(currentBrowserUrl, 'url')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                {copiedKey === 'url' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* GitHub Repository & Vercel Deploy */}
          <div className="p-4 bg-brand-50/50 dark:bg-brand-950/20 rounded-xl border border-brand-200 dark:border-brand-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink-900 dark:text-white flex items-center gap-1.5 text-xs">
                <Globe className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>GitHub & One-Click Deployment</span>
              </span>
              <span className="text-[10px] font-mono text-brand-700 dark:text-brand-300 font-bold bg-brand-100 dark:bg-brand-500/20 px-2 py-0.5 rounded">
                Vercel Ready
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-900 hover:bg-ink-800 text-white dark:bg-white dark:text-ink-950 font-semibold text-xs transition-colors"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={vercelDeployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black hover:bg-ink-800 text-white border border-white/20 font-semibold text-xs transition-colors"
              >
                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L2 19.7778H22L12 2Z" />
                </svg>
                <span>Deploy to Vercel</span>
              </a>
            </div>
          </div>

          {/* Device Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-ink-50 dark:bg-ink-900/60 rounded-xl border border-ink-200 dark:border-white/5 flex items-start gap-2.5">
              <Laptop className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-ink-800 dark:text-ink-200 block text-[11px]">Desktop Tab</strong>
                <span className="text-[10px] text-ink-500 dark:text-ink-400">Full widescreen canvas & code scratchpad</span>
              </div>
            </div>

            <div className="p-3 bg-ink-50 dark:bg-ink-900/60 rounded-xl border border-ink-200 dark:border-white/5 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-ink-800 dark:text-ink-200 block text-[11px]">Mobile Phone</strong>
                <span className="text-[10px] text-ink-500 dark:text-ink-400">Responsive touch sliders & concept quizzes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between">
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            <span>View README & Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-ink-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
