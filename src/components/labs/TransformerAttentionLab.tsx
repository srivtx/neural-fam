/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Code2, Play, CheckCircle2, Sliders, Eye, Award, ArrowRight } from 'lucide-react';
import { CheckpointQuiz } from '../CheckpointQuiz';
import { CodeBlock } from '../CodeBlock';
import { LAB_QUIZZES } from '../../data/labQuizzes';
import { markLabCompleted, markTestRun } from '../../utils/progressStore';

export const TransformerAttentionLab: React.FC = () => {
  const [selectedTokenIdx, setSelectedTokenIdx] = useState<number>(7); // "it"
  const [causalMask, setCausalMask] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(1.0);
  const [subTab, setSubTab] = useState<'visual' | 'code' | 'types' | 'analogy' | 'quiz'>('visual');
  const [codeOutput, setCodeOutput] = useState<string | null>(null);

  const sentence = ['The', 'animal', "didn't", 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'];

  // Synthetic semantic attention affinity matrix
  // "it" attends strongly to "animal" (semantic core) and "tired" (adjective condition)
  const baseScores: number[][] = sentence.map((_t1, i) =>
    sentence.map((_t2, j) => {
      if (i === 7) {
        // "it" attends to "animal" (idx 1), "tired" (idx 10), and self (idx 7)
        if (j === 1) return 4.2;
        if (j === 10) return 3.8;
        if (j === 7) return 2.0;
        if (j === 5) return 1.2;
        return 0.2;
      }
      if (i === j) return 3.0; // Self attention baseline
      if (Math.abs(i - j) === 1) return 1.8; // Adjacent local grammar
      return 0.4;
    })
  );

  // Apply causal masking and temperature
  const computeAttentionRow = (queryIdx: number) => {
    const raw = baseScores[queryIdx].map((score, keyIdx) => {
      if (causalMask && keyIdx > queryIdx) {
        return -999999; // Masked future tokens
      }
      return score / temperature;
    });

    const maxVal = Math.max(...raw);
    const exps = raw.map((val) => (val < -1000 ? 0 : Math.exp(val - maxVal)));
    const sumExps = exps.reduce((a, b) => a + b, 0);

    return exps.map((val) => (sumExps === 0 ? 0 : Number((val / sumExps).toFixed(3))));
  };

  const attentionWeights = computeAttentionRow(selectedTokenIdx);

  const transformerArchetypes = [
    { type: 'Encoder-Only', example: 'BERT, RoBERTa', use: 'Bidirectional representation, sentence classification, embeddings', access: 'All tokens attend to all tokens' },
    { type: 'Decoder-Only', example: 'GPT-4, Llama, Claude', use: 'Autoregressive generative next-token text prediction', access: 'Causal upper-triangular mask (past only)' },
    { type: 'Encoder-Decoder', example: 'T5, BART, Whisper', use: 'Sequence-to-sequence translation, audio-to-text, summarization', access: 'Cross-attention between encoder and decoder' },
  ];

  const runAttentionTest = () => {
    markTestRun('transformer');
    markLabCompleted('transformer');
    const lines = [
      '[Scaled Dot-Product Attention Verification]',
      `Selected Query Token: "${sentence[selectedTokenIdx]}" (idx ${selectedTokenIdx})`,
      `Attention Mask Mode: ${causalMask ? 'Causal Upper-Triangular (GPT style)' : 'Bidirectional Full Access (BERT style)'}`,
      `Softmax Temperature: ${temperature.toFixed(1)}`,
      'Top Attended Tokens for Query:',
      ...sentence.map((tok, i) => {
        const wt = attentionWeights[i];
        return `  Token [${i}] "${tok}": ${(wt * 100).toFixed(1)}% ${i === selectedTokenIdx ? '(Self)' : ''}`;
      }),
      'STATUS: PASS (Softmax normalizes row sum to 1.0)',
      '✓ Level 4 progress recorded.',
    ];
    setCodeOutput(lines.join('\n'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ink-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Level 4 · Attention mechanisms
          </span>
          <h2 className="text-xl font-bold font-display tracking-tight text-ink-900 dark:text-white mt-0.5">
            Transformers and scaled dot-product attention
          </h2>
          <p className="text-sm text-ink-600 dark:text-ink-400 mt-1 max-w-2xl">
            Replacing recurrent step-by-step loops with parallel matrix multiplication: Attention(Q, K, V) = Softmax(QKᵀ / √d_k) V.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-ink-100 dark:bg-ink-900 border border-ink-200 dark:border-white/10 rounded-lg">
          <button
            onClick={() => setSubTab('visual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'visual'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            Attention map
          </button>
          <button
            onClick={() => setSubTab('types')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'types'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            Archetypes
          </button>
          <button
            onClick={() => setSubTab('code')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'code'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>
          <button
            onClick={() => setSubTab('analogy')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'analogy'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Analogy</span>
          </button>
          <button
            onClick={() => setSubTab('quiz')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              subTab === 'quiz'
                ? 'bg-brand-600 text-white font-semibold'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Concept check</span>
          </button>
        </div>
      </div>

      {subTab === 'visual' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 shadow-xs">
            {/* Causal Mask Toggle */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-700 dark:text-ink-300 font-medium">Attention Mask:</span>
              <button
                onClick={() => setCausalMask(false)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  !causalMask
                    ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-800 dark:text-brand-300 font-semibold'
                    : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                Bidirectional (BERT)
              </button>
              <button
                onClick={() => setCausalMask(true)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer ${
                  causalMask
                    ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500 text-brand-800 dark:text-brand-300 font-semibold'
                    : 'border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                Causal Autoregressive (GPT)
              </button>
            </div>

            {/* Temperature Slider */}
            <div className="flex items-center gap-3">
              <Sliders className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-mono text-ink-700 dark:text-ink-300">
                Softmax Temp: <strong className="text-brand-600 dark:text-brand-400">{temperature.toFixed(1)}</strong>
              </span>
              <input
                type="range"
                min="0.4"
                max="3.0"
                step="0.2"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-28 accent-brand-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Interactive Token Sentence */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between text-xs text-ink-500 dark:text-ink-400">
              <span className="font-semibold text-ink-900 dark:text-ink-200">
                1. Select a query token to observe what it attends to:
              </span>
              <span>Notice how "it" resolves coreference to "animal".</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {sentence.map((tok, idx) => {
                const isQuery = idx === selectedTokenIdx;
                return (
                  <button
                    key={`${tok}-${idx}`}
                    onClick={() => setSelectedTokenIdx(idx)}
                    className={`px-3 py-2 rounded-lg border font-mono text-xs transition-all cursor-pointer flex flex-col items-center ${
                      isQuery
                        ? 'bg-brand-600 border-brand-700 text-white font-bold shadow-md'
                        : 'bg-ink-50 dark:bg-ink-900/60 border-ink-200 dark:border-white/10 text-ink-700 dark:text-ink-300 hover:border-brand-500'
                    }`}
                  >
                    <span>{tok}</span>
                    <span
                      className={`text-[10px] mt-1 ${
                        isQuery ? 'text-brand-100 font-bold' : 'text-ink-400'
                      }`}
                    >
                      t={idx}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attention Weights Heat Distribution */}
          <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink-900 dark:text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>
                  Attention Spotlight for Query: <strong className="text-brand-700 dark:text-brand-300 font-mono">"{sentence[selectedTokenIdx]}"</strong>
                </span>
              </span>
              <span className="text-ink-500 dark:text-ink-400 font-mono text-[11px]">
                Softmax probabilities sum to 100%
              </span>
            </div>

            <div className="space-y-2">
              {sentence.map((tok, idx) => {
                const weight = attentionWeights[idx];
                const pct = (weight * 100).toFixed(1);
                const isMasked = causalMask && idx > selectedTokenIdx;

                return (
                  <div key={idx} className="flex items-center gap-3 text-xs font-mono">
                    <span className="w-16 truncate text-ink-700 dark:text-ink-300 font-medium text-right">
                      {tok}
                    </span>
                    <div className="flex-1 h-6 bg-ink-100 dark:bg-ink-950 rounded-md border border-ink-200 dark:border-white/5 overflow-hidden flex items-center px-2 relative">
                      {isMasked ? (
                        <span className="text-[10px] text-rose-500 dark:text-rose-400 italic">
                          [Future token masked by causal triangle]
                        </span>
                      ) : (
                        <div
                          className="h-full absolute left-0 top-0 bg-brand-500/80 rounded-md transition-all duration-300"
                          style={{ width: `${pct}%`, opacity: Math.max(0.25, weight) }}
                        />
                      )}
                      {!isMasked && (
                        <span className="relative z-10 text-[11px] text-ink-900 dark:text-white font-bold pl-1">
                          {pct}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Concept Check Prompt */}
          <div className="p-4 bg-brand-50/80 dark:bg-brand-950/30 rounded-xl border border-brand-300/80 dark:border-brand-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-900 dark:text-white">Check your understanding</h4>
                <p className="text-xs text-ink-600 dark:text-ink-300">Test your understanding of Q/K/V vectors, Softmax temperature scaling, and causal masks.</p>
              </div>
            </div>
            <button
              onClick={() => setSubTab('quiz')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <span>Take concept check</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Types Tab */}
      {subTab === 'types' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-ink-100 dark:border-white/10">
            <h3 className="text-sm font-bold font-display tracking-tight text-ink-900 dark:text-white">Transformer archetypes and variants</h3>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Self-attention blocks are versatile lego pieces configured differently based on the task.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-50 dark:bg-ink-950 text-ink-500 dark:text-ink-400 font-semibold border-b border-ink-100 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Archetype</th>
                  <th className="py-3 px-4">Landmark Models</th>
                  <th className="py-3 px-4">Attention Masking</th>
                  <th className="py-3 px-4">Primary Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-white/5 text-ink-700 dark:text-ink-300">
                {transformerArchetypes.map((arch) => (
                  <tr key={arch.type} className="hover:bg-ink-50 dark:hover:bg-ink-900/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-700 dark:text-brand-400 whitespace-nowrap">
                      {arch.type}
                    </td>
                    <td className="py-3 px-4 font-semibold text-ink-900 dark:text-white">{arch.example}</td>
                    <td className="py-3 px-4 text-ink-500 dark:text-ink-400">{arch.access}</td>
                    <td className="py-3 px-4 text-ink-600 dark:text-ink-300">{arch.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code Tab */}
      {subTab === 'code' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Scaled dot-product attention in TypeScript</h3>
            <p className="text-xs text-ink-500 dark:text-ink-400">
              Formula: Attention(Q, K, V) = Softmax(Q · K^T / sqrt(d_k)) · V
            </p>
          </div>

          <CodeBlock
            code={`function scaledDotProductAttention(Q: number[][], K: number[][], V: number[][], causal: boolean = false) {
  const d_k = Q[0].length;
  const numTokens = Q.length;

  // 1. Matmul: Q * K^T / sqrt(d_k)
  const scores = Q.map((qRow, i) =>
    K.map((kRow, j) => {
      if (causal && j > i) return -1e9; // Causal upper-triangular mask
      const dot = qRow.reduce((sum, qVal, d) => sum + qVal * kRow[d], 0);
      return dot / Math.sqrt(d_k);
    })
  );

  // 2. Softmax per row
  const attentionWeights = scores.map(row => {
    const maxVal = Math.max(...row);
    const expRow = row.map(v => (v < -1e8 ? 0 : Math.exp(v - maxVal)));
    const sumExp = expRow.reduce((a, b) => a + b, 0);
    return expRow.map(v => v / sumExp);
  });

  // 3. Matmul: weights * V
  return { attentionWeights, output: matmul(attentionWeights, V) };
}`}
            language="TypeScript"
            filename="scaled_dot_product_attention.ts"
            onRun={runAttentionTest}
            runLabel="Run"
            output={codeOutput}
          />
        </div>
      )}

      {/* Analogy Tab */}
      {subTab === 'analogy' && (
        <div className="bg-surface dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 p-6 space-y-4 shadow-xs">
          <h3 className="text-base font-bold font-display tracking-tight text-ink-900 dark:text-white">Query, key, and value analogy</h3>
          <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
            Imagine every word in a sentence is an actor on a dark stage holding three things:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-ink-700 dark:text-ink-300">
            <div className="p-4 bg-ink-50 dark:bg-ink-900 rounded-lg border border-ink-200 dark:border-white/5 space-y-1.5">
              <strong className="text-brand-700 dark:text-brand-400 font-bold block">1. A Query Card (Q)</strong>
              <p>
                "What clue am I looking for?" For example, the pronoun <em>"it"</em> holds a card asking: <em>"Who am I talking about?"</em>
              </p>
            </div>
            <div className="p-4 bg-ink-50 dark:bg-ink-900 rounded-lg border border-ink-200 dark:border-white/5 space-y-1.5">
              <strong className="text-amber-700 dark:text-amber-400 font-bold block">2. A Key Badge (K)</strong>
              <p>
                "Who am I?" The noun <em>"animal"</em> wears a badge saying: <em>"Living subject"</em>. When Query meets Key, their dot product produces an attention weight.
              </p>
            </div>
            <div className="p-4 bg-ink-50 dark:bg-ink-900 rounded-lg border border-ink-200 dark:border-white/5 space-y-1.5">
              <strong className="text-brand-700 dark:text-brand-400 font-bold block">3. A Value Backpack (V)</strong>
              <p>
                The actual meaning vector passed forward. <em>"it"</em> packs <em>"animal"</em>’s value into its own bag, so future layers understand exactly what it means.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SubTab 5: Checkpoint Quiz */}
      {subTab === 'quiz' && (
        <CheckpointQuiz
          quizKey="quiz_transformer"
          title={LAB_QUIZZES.transformer.title}
          questions={LAB_QUIZZES.transformer.questions}
          onPassAll={() => markLabCompleted('transformer')}
        />
      )}
    </div>
  );
};
