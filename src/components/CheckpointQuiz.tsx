/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Check, RotateCcw } from 'lucide-react';
import { markQuizSolved } from '../utils/progressStore';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface CheckpointQuizProps {
  quizKey: string;
  title: string;
  questions: QuizQuestion[];
  onPassAll?: () => void;
}

export const CheckpointQuiz: React.FC<CheckpointQuizProps> = ({
  quizKey,
  title,
  questions,
  onPassAll,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSelect = (qIdx: number, oIdx: number) => {
    if (submitted) return;
    setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx });
  };

  const allAnswered = questions.every((_, i) => selectedAnswers[i] !== undefined);
  const correctCount = questions.filter((q, i) => selectedAnswers[i] === q.correctIndex).length;
  const isPassed = submitted && correctCount === questions.length;

  const handleSubmit = () => {
    setSubmitted(true);
    if (correctCount === questions.length) {
      markQuizSolved(quizKey);
      if (onPassAll) onPassAll();
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setSelectedAnswers({});
  };

  return (
    <div className="bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 p-4 sm:p-6 space-y-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-ink-100 dark:border-white/10">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 font-mono">
            Check your understanding
          </span>
          <h3 className="font-display tracking-tight text-base font-bold text-ink-900 dark:text-white mt-0.5">{title}</h3>
        </div>
        {submitted && (
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isPassed
                ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 border border-green-200 dark:border-green-500/30'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
            }`}
          >
            {correctCount} of {questions.length} correct
          </span>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const userAns = selectedAnswers[qIdx];
          const isCorrect = userAns === q.correctIndex;

          return (
            <div key={qIdx} className="space-y-3 p-3 sm:p-4 bg-ink-50 dark:bg-ink-950/70 rounded-xl border border-ink-200/80 dark:border-white/5">
              <h4 className="text-sm font-semibold leading-snug text-ink-900 dark:text-ink-200">
                {qIdx + 1}. {q.question}
              </h4>

              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isOptionSelected = userAns === oIdx;
                  let optStyle = 'border-ink-200 dark:border-white/10 bg-surface dark:bg-ink-900 text-ink-700 dark:text-ink-300 hover:border-ink-300 dark:hover:border-white/20';

                  if (submitted) {
                    if (oIdx === q.correctIndex) {
                      optStyle = 'border-green-500 bg-green-50 text-green-900 dark:bg-green-500/15 dark:text-green-300 font-semibold';
                    } else if (isOptionSelected) {
                      optStyle = 'border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-500/15 dark:text-rose-300';
                    } else {
                      optStyle = 'border-ink-100 dark:border-white/5 bg-ink-100/50 dark:bg-ink-900/40 text-ink-400 dark:text-ink-500';
                    }
                  } else if (isOptionSelected) {
                    optStyle = 'border-brand-600 bg-brand-50/50 text-brand-950 dark:border-brand-400 dark:bg-brand-500/20 dark:text-brand-300 font-semibold';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelect(qIdx, oIdx)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-between gap-3 ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {submitted && oIdx === q.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                      )}
                      {submitted && isOptionSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div
                  className={`p-3 rounded-lg text-xs leading-relaxed ${
                    isCorrect
                      ? 'bg-green-50 text-green-900 dark:bg-green-500/10 dark:text-green-200 border border-green-200 dark:border-green-500/20'
                      : 'bg-rose-50 text-rose-900 dark:bg-rose-500/10 dark:text-rose-200 border border-rose-200 dark:border-rose-500/20'
                  }`}
                >
                  <strong className="block mb-0.5">{isCorrect ? 'Correct.' : 'Not quite.'}</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-ink-100 dark:border-white/10">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Check answers
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white rounded-lg border border-ink-200 dark:border-white/10 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Try again</span>
            </button>
            {isPassed && (
              <span className="text-xs text-green-700 dark:text-green-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>All correct. Progress saved.</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
