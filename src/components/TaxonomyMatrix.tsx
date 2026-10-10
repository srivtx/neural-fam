/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sliders, Sparkles, Check, ArrowRight, BookOpen, Layers } from 'lucide-react';
import { LANDMARK_MODELS } from '../data/familyTreeData';
import { LandmarkModel } from '../types';

export const TaxonomyMatrix: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('p027_experiment');
  const [customArch, setCustomArch] = useState<string>('Transformer');
  const [customMechanisms, setCustomMechanisms] = useState<string[]>([
    'Self-Attention',
    'Residual Connections',
    'LayerNorm / RMSNorm',
  ]);
  const [customObjective, setCustomObjective] = useState<string>('Autoregressive Next-Token Prediction');
  const [activeTab, setActiveTab] = useState<'presets' | 'builder'>('presets');

  const selectedModel = LANDMARK_MODELS.find((m) => m.id === selectedPresetId) || LANDMARK_MODELS[0];

  const architectures = [
    'Multilayer Perceptron (MLP)',
    'Convolutional Neural Network (CNN)',
    'Recurrent Network (RNN/LSTM)',
    'Transformer',
    'State-Space Model (SSM/Mamba)',
    'Graph Neural Network (GNN)',
    'Continuous Neural ODE',
  ];

  const availableMechanisms = [
    'Residual Connections (y = x + F(x))',
    'Self-Attention / Cross-Attention',
    'Dense Skip Concatenation',
    'Multiplicative Gating (LSTM/Mamba)',
    'LayerNorm / RMSNorm',
    'Mixture of Experts (MoE Routing)',
    'Encoder-Decoder U-Net Bridges',
    'Constrained State Update Law (P-027)',
  ];

  const objectives = [
    'Supervised Image Classification',
    'Autoregressive Next-Token Prediction',
    'Bidirectional Masked Language Modeling',
    'Denoising Diffusion Generation',
    'Latent Space Reconstruction (VAE)',
    'Non-Euclidean Graph Link Prediction',
    'Physics-Informed PDE Residual Minimization',
  ];

  const toggleMechanism = (mech: string) => {
    if (customMechanisms.includes(mech)) {
      setCustomMechanisms(customMechanisms.filter((m) => m !== mech));
    } else {
      setCustomMechanisms([...customMechanisms, mech]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            The Researcher's Lens · 3-Question Framework
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
            The Neural Network Taxonomy Matrix
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Never get confused by buzzwords again. Every AI model is uniquely categorized by answering three separate questions: <strong>Core Architecture</strong>, <strong>Structural Mechanisms</strong>, and <strong>Training Objective</strong>.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Landmark Models & P-027
          </button>
          <button
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'builder'
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Model Builder</span>
          </button>
        </div>
      </div>

      {activeTab === 'presets' && (
        <div className="space-y-6">
          {/* Preset Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {LANDMARK_MODELS.map((model: LandmarkModel) => {
              const isSelected = model.id === selectedPresetId;
              const isP027 = model.id === 'p027_experiment';

              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedPresetId(model.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? isP027
                        ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-400 text-amber-800 dark:text-amber-300 font-bold shadow-xs'
                        : 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/30'
                  }`}
                >
                  {isP027 && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                  <span>{model.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">({model.year})</span>
                </button>
              );
            })}
          </div>

          {/* Model 3-Question Profile Card */}
          <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-white/10">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{selectedModel.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    · {selectedModel.authorOrOrg} ({selectedModel.year})
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{selectedModel.whyItMatters}</p>
              </div>

              {selectedModel.id === 'p027_experiment' && (
                <div className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-mono font-medium">
                  Target Research Focus
                </div>
              )}
            </div>

            {/* The 3 Questions Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Question 1 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">
                  <span>Question 1</span>
                  <span>·</span>
                  <span>Core Architecture</span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedModel.coreArchitecture}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Defines the topological medium: grids, continuous vectors, ordered tokens, or graphs.
                </p>
              </div>

              {/* Question 2 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider font-mono">
                  <span>Question 2</span>
                  <span>·</span>
                  <span>Structural Mechanisms</span>
                </div>
                <div className="space-y-1">
                  {selectedModel.mechanisms.map((mech, i) => (
                    <div key={i} className="text-xs text-slate-700 dark:text-slate-200 flex items-start gap-1.5 font-medium">
                      <span className="text-teal-600 dark:text-teal-400 mt-0.5">›</span>
                      <span>{mech}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  The internal plumbing: shortcuts, routing, normalizations, and gates.
                </p>
              </div>

              {/* Question 3 */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">
                  <span>Question 3</span>
                  <span>·</span>
                  <span>Training Objective</span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedModel.trainingTask}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  What the loss function penalizes: classification error, next-token entropy, or noise residual.
                </p>
              </div>
            </div>

            {/* Direct Side-by-Side Comparison from Prompt */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>The Definitive Research Distinction (ResNet vs GPT-4 vs P-027)</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-white/10">
                    <tr>
                      <th className="py-2 px-3">Model</th>
                      <th className="py-2 px-3">Core Architecture</th>
                      <th className="py-2 px-3">Mechanisms</th>
                      <th className="py-2 px-3">Training Task</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300 font-mono">
                    <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-amber-700 dark:text-amber-400">P-027 Experiment</td>
                      <td className="py-2.5 px-3">CNN-based residual network</td>
                      <td className="py-2.5 px-3">Proposed constrained state update</td>
                      <td className="py-2.5 px-3">CIFAR-10 image classification</td>
                    </tr>
                    <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-emerald-700 dark:text-emerald-400">Typical GPT-style LLM</td>
                      <td className="py-2.5 px-3">Decoder-only Transformer</td>
                      <td className="py-2.5 px-3">Self-attention, residuals, norm, MLP</td>
                      <td className="py-2.5 px-3">Next-token prediction</td>
                    </tr>
                    <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-teal-700 dark:text-teal-400">ResNet-50</td>
                      <td className="py-2.5 px-3">Convolutional Network (CNN)</td>
                      <td className="py-2.5 px-3">Residual identity skip: y = x + F(x)</td>
                      <td className="py-2.5 px-3">1000-class classification</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Model Builder Tab */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Core Architecture */}
            <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-3 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-800 dark:text-emerald-300">1</span>
                <span>Select Core Architecture</span>
              </div>
              <div className="space-y-1.5">
                {architectures.map((arch) => (
                  <button
                    key={arch}
                    onClick={() => setCustomArch(arch)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                      customArch === arch
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <span>{arch}</span>
                    {customArch === arch && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 2: Structural Mechanisms */}
            <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-3 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider font-mono">
                <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-500/20 flex items-center justify-center text-teal-800 dark:text-teal-300">2</span>
                <span>Combine Mechanisms</span>
              </div>
              <div className="space-y-1.5">
                {availableMechanisms.map((mech) => {
                  const isChecked = customMechanisms.includes(mech);
                  return (
                    <button
                      key={mech}
                      onClick={() => toggleMechanism(mech)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-teal-50 dark:bg-teal-500/20 border-teal-500 text-teal-800 dark:text-teal-300 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <span>{mech}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Training Objective */}
            <div className="bg-white dark:bg-[#0c1220] rounded-xl border border-slate-200 dark:border-white/10 p-5 space-y-3 shadow-xs transition-colors">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-mono">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-800 dark:text-emerald-300">3</span>
                <span>Select Training Objective</span>
              </div>
              <div className="space-y-1.5">
                {objectives.map((obj) => (
                  <button
                    key={obj}
                    onClick={() => setCustomObjective(obj)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                      customObjective === obj
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <span>{obj}</span>
                    {customObjective === obj && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Synthesized Research Architecture Card */}
          <div className="p-6 bg-white dark:bg-[#0c1220] rounded-xl border border-emerald-500/30 space-y-4 shadow-xs transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Your Synthesized Architecture Recipe:</span>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Novel Combination</span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-white/10 space-y-2 text-xs font-mono">
              <div className="text-slate-700 dark:text-slate-300">
                <strong className="text-emerald-700 dark:text-emerald-400">Core:</strong> {customArch}
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                <strong className="text-teal-700 dark:text-teal-400">Mechanisms:</strong> {customMechanisms.length > 0 ? customMechanisms.join(', ') : 'Pure baseline (no mechanisms)'}
              </div>
              <div className="text-slate-700 dark:text-slate-300">
                <strong className="text-emerald-700 dark:text-emerald-400">Objective:</strong> {customObjective}
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              <strong>Architectural Assessment:</strong> Combining <span className="font-semibold text-emerald-700 dark:text-emerald-300">{customArch}</span> with <span className="font-semibold text-teal-700 dark:text-teal-300">{customMechanisms.join(' and ') || 'baseline features'}</span> for <span className="font-semibold text-emerald-700 dark:text-emerald-300">{customObjective}</span> demonstrates how researchers invent new models. For instance, putting attention mechanisms on a CNN gave birth to Vision Transformers, while applying diffusion training objectives to U-Nets sparked modern visual generative AI!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
