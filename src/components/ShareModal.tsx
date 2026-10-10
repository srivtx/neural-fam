/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Globe, Shield, Sparkles, Smartphone, Laptop } from 'lucide-react';
import { copyTextToClipboard } from '../utils/clipboard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  // Primary deployed production Cloud Run URL
  const deployedUrl = 'https://ais-pre-wtquidnmwlynjc3xzujcc6-371726331409.asia-southeast1.run.app';
  
  // Current active browser URL
  const currentBrowserUrl = typeof window !== 'undefined' && window.location && window.location.href
    ? window.location.href
    : deployedUrl;

  const copyToClipboard = async (text: string, key: string) => {
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 max-w-lg w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Live Project Link (Open Outside This Frame)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Test and share this learning platform in any regular browser tab or mobile device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links */}
        <div className="space-y-4 text-xs">
          {/* Main Public URL */}
          <div className="space-y-2 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-500/30">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Public Shareable Web URL</span>
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded">
                Live Cloud Run App
              </span>
            </div>
            
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={deployedUrl}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 font-mono text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none select-all"
              />
              <button
                onClick={() => copyToClipboard(deployedUrl, 'deployed')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                {copiedKey === 'deployed' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-[11px] text-slate-600 dark:text-slate-400 pt-0.5 leading-relaxed">
              Paste this URL in a new browser tab in <strong>Google Chrome, Safari, Firefox, or Edge</strong> to enjoy the full responsive experience with zero iframe constraints!
            </p>
          </div>

          {/* Current Frame URL if different */}
          {currentBrowserUrl !== deployedUrl && (
            <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-white/5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Current Session URL
                </span>
                <span className="text-[10px] font-mono text-slate-400">Direct Session</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  readOnly
                  value={currentBrowserUrl}
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 font-mono text-[11px] text-slate-600 dark:text-slate-300 focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(currentBrowserUrl, 'session')}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium text-xs hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
                >
                  {copiedKey === 'session' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'session' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Device guide */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/5 flex items-start gap-2.5">
              <Laptop className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block text-[11px]">Desktop Tab</strong>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Full widescreen canvas & code scratchpad</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/5 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block text-[11px]">Mobile Phone</strong>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Responsive touch sliders & concept quizzes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between">
          <a
            href={deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span>Open in New Browser Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
