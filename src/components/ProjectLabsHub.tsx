/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SingleNeuronLab } from './labs/SingleNeuronLab';
import { MlpLab } from './labs/MlpLab';
import { CnnResNetLab } from './labs/CnnResNetLab';
import { RnnLstmLaboratory } from './labs/RnnLstmLaboratory';
import { TransformerAttentionLab } from './labs/TransformerAttentionLab';
import { SsmMambaLab } from './labs/SsmMambaLab';
import { GnnLab } from './labs/GnnLab';
import { GenerativeLab } from './labs/GenerativeLab';
import { SpecializedLab } from './labs/SpecializedLab';
import { ErrorBoundary } from './ErrorBoundary';

interface ProjectLabsHubProps {
  activeLabId: string;
  onSelectLab: (labId: string) => void;
}

export const ProjectLabsHub: React.FC<ProjectLabsHubProps> = ({
  activeLabId,
  onSelectLab,
}) => {
  const labList = [
    { id: 'perceptron', level: '0', title: 'Single Neuron', tag: 'Perceptron' },
    { id: 'mlp', level: '1', title: 'MLP & XOR', tag: 'Feedforward' },
    { id: 'cnn_resnet', level: '2', title: 'CNN & ResNet', tag: 'Vision & Skips' },
    { id: 'rnn_lstm', level: '3', title: 'RNN & LSTM', tag: 'Sequence Memory' },
    { id: 'transformer', level: '4', title: 'Transformers', tag: 'Self-Attention' },
    { id: 'ssm_mamba', level: '5', title: 'SSM & Mamba', tag: 'State Spaces' },
    { id: 'gnn', level: '6', title: 'Graph Networks', tag: 'Message Passing' },
    { id: 'generative', level: '7', title: 'Diffusion & VAE', tag: 'Generative' },
    { id: 'specialized', level: '8', title: 'Neural ODEs', tag: 'Frontiers' },
  ];

  return (
    <div className="space-y-6">
      {/* Horizontal Level Stepper */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 p-1.5 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-white/10 shadow-xs transition-colors">
        {labList.map((lab) => {
          const isActive = activeLabId === lab.id;
          return (
            <button
              key={lab.id}
              onClick={() => onSelectLab(lab.id)}
              className={`flex-1 min-w-[130px] p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-500/50 text-ink-900 dark:text-white shadow-xs'
                  : 'bg-ink-50 dark:bg-ink-900/50 border-ink-200/60 dark:border-white/5 text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white hover:border-ink-300 dark:hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={isActive ? 'text-brand-700 dark:text-brand-400 font-bold' : 'text-ink-400 dark:text-ink-500'}>
                  LEVEL {lab.level}
                </span>
                <span className="text-ink-400 dark:text-ink-500">{lab.tag}</span>
              </div>
              <div className="text-xs font-bold text-ink-900 dark:text-ink-100 mt-1 truncate">
                {lab.title}
              </div>
            </button>
          );
        })}
      </div>

      {/* Render the Active Lab Component with Error Boundary Protection */}
      <ErrorBoundary
        key={activeLabId}
        fallbackTitle={`Interactive Lab: ${labList.find((l) => l.id === activeLabId)?.title || 'Neural Laboratory'}`}
      >
        <div className="transition-all">
          {activeLabId === 'perceptron' && <SingleNeuronLab />}
          {activeLabId === 'mlp' && <MlpLab />}
          {activeLabId === 'cnn_resnet' && <CnnResNetLab />}
          {activeLabId === 'rnn_lstm' && <RnnLstmLaboratory />}
          {activeLabId === 'transformer' && <TransformerAttentionLab />}
          {activeLabId === 'ssm_mamba' && <SsmMambaLab />}
          {activeLabId === 'gnn' && <GnnLab />}
          {activeLabId === 'generative' && <GenerativeLab />}
          {activeLabId === 'specialized' && <SpecializedLab />}
        </div>
      </ErrorBoundary>
    </div>
  );
};
