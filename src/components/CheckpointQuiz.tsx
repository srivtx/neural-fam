/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, XCircle, Sparkles, Check, RotateCcw } from 'lucide-react';
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
    <div className="bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
            Concept Checkpoint
          </span>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{title}</h3>
        </div>
        {submitted && (
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isPassed
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                : 'bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-300 border border-red-200 dark:border-red-500/30'
            }`}
          >
            Score: {correctCount} / {questions.length}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const userAns = selectedAnswers[qIdx];
          const isCorrect = userAns === q.correctIndex;

          return (
            <div key={qIdx} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200/80 dark:border-white/5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-200">
                {qIdx + 1}. {q.question}
              </h4>

              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isOptionSelected = userAns === oIdx;
                  let optStyle = 'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20';

                  if (submitted) {
                    if (oIdx === q.correctIndex) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold';
                    } else if (isOptionSelected) {
                      optStyle = 'border-red-400 bg-red-50 text-red-900 dark:bg-red-500/20 dark:text-red-300';
                    } else {
                      optStyle = 'border-slate-100 dark:border-white/5 bg-slate-100/50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500';
                    }
                  } else if (isOptionSelected) {
                    optStyle = 'border-emerald-600 bg-emerald-50/50 text-emerald-950 dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300 font-semibold';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelect(qIdx, oIdx)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center justify-between ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {submitted && oIdx === q.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {submitted && isOptionSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div
                  className={`p-3 rounded-lg text-xs leading-relaxed ${
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/20'
                      : 'bg-red-50 text-red-900 dark:bg-red-500/10 dark:text-red-200 border border-red-200 dark:border-red-500/20'
                  }`}
                >
                  <strong className="block mb-0.5">{isCorrect ? '✓ Concept Mastered' : '✗ Explanation:'}</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Check Answers
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry Quiz</span>
            </button>
            {isPassed && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Concept Check Passed! Progress Recorded</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
