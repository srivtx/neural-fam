/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-white dark:bg-ink-900 rounded-2xl border border-rose-200 dark:border-rose-900/40 shadow-sm space-y-4 text-left">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h3 className="text-base font-bold text-ink-900 dark:text-white">
                {this.props.fallbackTitle || 'Component Encountered a Calculation State'}
              </h3>
              <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                The visualizer encountered an edge case during tensor computation or rendering.
                Your learning progress and milestone badges remain completely safe.
              </p>
            </div>
          </div>

          {this.state.error && (
            <div className="p-3 bg-ink-50 dark:bg-ink-950/80 rounded-xl border border-ink-200 dark:border-white/5 font-mono text-[11px] text-ink-600 dark:text-ink-400 overflow-x-auto no-scrollbar">
              <code>{this.state.error.message || 'Unknown runtime error'}</code>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Reload View</span>
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.hash = '';
                window.location.reload();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-ink-200 dark:border-white/10 text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 text-xs font-medium cursor-pointer transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Full Page Refresh</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
