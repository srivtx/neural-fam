/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Trophy,
  Award,
  Zap,
  Split,
  Layers,
  Clock,
  Sparkles,
  Binary,
  Share2,
  Flame,
  Orbit,
  CheckCircle2,
  Code2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Star,
  RotateCcw,
  User,
  Check,
} from 'lucide-react';
import {
  BADGES,
  computeUserStats,
  BadgeDefinition,
} from '../data/badgesData';
import {
  useLearningProgress,
  USER_PROFILE,
  resetProgress,
  setDemoCompleted,
  markLabCompleted,
} from '../utils/progressStore';

interface BadgesMilestonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLab?: (labId: string) => void;
}

export const BadgesMilestonesModal: React.FC<BadgesMilestonesModalProps> = ({
  isOpen,
  onClose,
  onSelectLab,
}) => {
  const progress = useLearningProgress();
  const stats = computeUserStats(progress);

  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked' | 'architecture' | 'milestones'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3200);
  };

  const handleJumpToModule = (moduleId?: string) => {
    if (!moduleId || !onSelectLab) return;
    onSelectLab(moduleId);
    onClose();
  };

  const handleTestUnlock = (moduleId: string, name: string) => {
    markLabCompleted(moduleId);
    showToast(`Badge earned: ${name}`);
  };

  const handleUnlockAll = () => {
    setDemoCompleted([
      'perceptron',
      'mlp',
      'cnn_resnet',
      'rnn_lstm',
      'transformer',
      'ssm_mamba',
      'gnn',
      'generative',
      'specialized',
    ]);
    showToast('All nine modules marked complete. Every badge is now earned.');
  };

  const handleReset = () => {
    resetProgress();
    showToast('Progress reset. You are back at level 1.');
  };

  // Filter badges
  const filteredBadges = BADGES.filter((badge) => {
    const isUnlocked = badge.checkUnlocked(progress);
    if (activeFilter === 'unlocked') return isUnlocked;
    if (activeFilter === 'locked') return !isUnlocked;
    if (activeFilter === 'architecture') return badge.category === 'architecture';
    if (activeFilter === 'milestones') return badge.category !== 'architecture';
    return true;
  });

  const getBadgeIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Zap':
        return <Zap className={className} />;
      case 'Split':
        return <Split className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Clock':
        return <Clock className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Binary':
        return <Binary className={className} />;
      case 'Share2':
        return <Share2 className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Orbit':
        return <Orbit className={className} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={className} />;
      case 'Code2':
        return <Code2 className={className} />;
      case 'Trophy':
        return <Trophy className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const getTierColorClass = (tier: BadgeDefinition['tier']) => {
    switch (tier) {
      case 'Bronze':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30';
      case 'Silver':
        return 'bg-ink-500/10 text-ink-700 dark:text-ink-300 border-ink-400/40';
      case 'Gold':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/40';
      case 'Platinum':
        return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30';
      case 'Diamond':
        return 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/40';
      default:
        return 'bg-ink-500/10 text-ink-600 border-ink-300';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="badges-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:top-6 sm:right-6 z-60 bg-ink-900 dark:bg-ink-50 dark:text-ink-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-brand-300 dark:text-brand-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-surface dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-white/10 shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-ink-200 dark:border-white/10 bg-ink-50/70 dark:bg-ink-850/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="badges-modal-title" className="font-display tracking-tight text-lg font-bold text-ink-900 dark:text-white">
                  Badges and milestones
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-500/30">
                  {stats.unlockedBadgesCount} / {stats.totalBadgesCount} earned
                </span>
              </div>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                One badge per architecture family, plus a few for quizzes and code tests
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-400 hover:text-ink-700 dark:hover:text-white hover:bg-ink-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {/* Progress summary card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-ink-50 to-brand-50/30 dark:from-ink-850 dark:to-brand-950/30 border border-ink-200 dark:border-white/10 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-13 h-13 rounded-full bg-brand-600 text-white font-bold text-xl flex items-center justify-center shadow-md ring-4 ring-brand-500/20">
                    {USER_PROFILE.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div
                    title="Active"
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-ink-900 rounded-full"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-ink-900 dark:text-white">
                      {USER_PROFILE.displayName}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-500/20 px-2 py-0.5 rounded-full border border-brand-300 dark:border-brand-500/30">
                      <ShieldCheck className="w-3 h-3 text-brand-600 dark:text-brand-400" />
                      Level {stats.level}
                    </span>
                  </div>
                  <div className="text-xs text-ink-500 dark:text-ink-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    <span>{USER_PROFILE.note}</span>
                    <span>•</span>
                    <span className="font-medium text-brand-600 dark:text-brand-400">
                      {stats.rankTitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total XP and Next Level Progress */}
              <div className="w-full sm:w-64 space-y-1.5 bg-surface dark:bg-ink-950 p-3 rounded-xl border border-ink-200 dark:border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-500 dark:text-ink-400 font-medium flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Experience
                  </span>
                  <span className="font-mono font-bold text-ink-900 dark:text-white">
                    {stats.totalXp} XP
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-ink-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.levelProgressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-ink-400 dark:text-ink-500 font-mono">
                  <span>Level {stats.level}</span>
                  <span>
                    {stats.levelProgressPercent}% to level {stats.level + 1} ({stats.nextLevelXp} XP)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-ink-200/80 dark:border-white/10 text-xs">
              <div className="bg-surface/80 dark:bg-white/5 p-2.5 rounded-xl border border-ink-200/60 dark:border-white/5">
                <span className="text-ink-400 dark:text-ink-500 block text-[11px]">
                  Architectures
                </span>
                <span className="font-bold text-base text-ink-900 dark:text-white">
                  {stats.completedModulesCount} / {stats.totalModulesCount}
                </span>
              </div>
              <div className="bg-surface/80 dark:bg-white/5 p-2.5 rounded-xl border border-ink-200/60 dark:border-white/5">
                <span className="text-ink-400 dark:text-ink-500 block text-[11px]">
                  Quizzes
                </span>
                <span className="font-bold text-base text-ink-900 dark:text-white">
                  {stats.solvedQuizzesCount} solved
                </span>
              </div>
              <div className="bg-surface/80 dark:bg-white/5 p-2.5 rounded-xl border border-ink-200/60 dark:border-white/5">
                <span className="text-ink-400 dark:text-ink-500 block text-[11px]">
                  Code tests
                </span>
                <span className="font-bold text-base text-ink-900 dark:text-white">
                  {stats.runCodeTestsCount} passed
                </span>
              </div>
              <div className="bg-surface/80 dark:bg-white/5 p-2.5 rounded-xl border border-ink-200/60 dark:border-white/5">
                <span className="text-ink-400 dark:text-ink-500 block text-[11px]">
                  Badges
                </span>
                <span className="font-bold text-base text-brand-600 dark:text-brand-400">
                  {stats.unlockedBadgesCount} / {stats.totalBadgesCount}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Filters & Demo Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 max-w-full text-xs whitespace-nowrap">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-brand-600 text-white'
                    : 'bg-ink-100 dark:bg-white/5 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-white/10'
                }`}
              >
                All ({BADGES.length})
              </button>
              <button
                onClick={() => setActiveFilter('unlocked')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeFilter === 'unlocked'
                    ? 'bg-brand-600 text-white'
                    : 'bg-ink-100 dark:bg-white/5 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-white/10'
                }`}
              >
                Earned ({stats.unlockedBadgesCount})
              </button>
              <button
                onClick={() => setActiveFilter('locked')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeFilter === 'locked'
                    ? 'bg-brand-600 text-white'
                    : 'bg-ink-100 dark:bg-white/5 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-white/10'
                }`}
              >
                Not yet ({stats.totalBadgesCount - stats.unlockedBadgesCount})
              </button>
              <button
                onClick={() => setActiveFilter('architecture')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeFilter === 'architecture'
                    ? 'bg-brand-600 text-white'
                    : 'bg-ink-100 dark:bg-white/5 text-ink-600 dark:text-ink-300 hover:bg-ink-200 dark:hover:bg-white/10'
                }`}
              >
                Modules (9)
              </button>
            </div>

            {/* Demo controls */}
            <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto text-xs shrink-0">
              <button
                onClick={() => handleTestUnlock('perceptron', 'Synapse Pioneer')}
                title="Mark the perceptron module (module 0) as complete"
                className="px-2.5 py-1 text-ink-600 dark:text-ink-300 hover:text-brand-600 dark:hover:text-brand-400 bg-ink-100 dark:bg-white/5 hover:bg-ink-200 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Complete module 0
              </button>
              <button
                onClick={handleUnlockAll}
                title="Mark every module complete, for trying out the badges"
                className="px-2.5 py-1 text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 border border-brand-200 dark:border-brand-500/20 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Complete all (demo)
              </button>
              <button
                onClick={handleReset}
                title="Reset progress"
                aria-label="Reset progress"
                className="p-1 text-ink-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBadges.map((badge) => {
              const isUnlocked = badge.checkUnlocked(progress);
              const progressInfo = badge.getProgress(progress);

              return (
                <div
                  key={badge.id}
                  className={`relative p-5 rounded-2xl border transition-all ${
                    isUnlocked
                      ? 'bg-surface dark:bg-ink-850 border-green-500/40 shadow-sm ring-1 ring-green-500/10'
                      : 'bg-ink-50/70 dark:bg-ink-950 border-ink-200 dark:border-white/5 opacity-85'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Badge Emblem Icon */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
                          isUnlocked
                            ? 'text-white shadow-md'
                            : 'bg-ink-200 dark:bg-ink-800 text-ink-400 dark:text-ink-500'
                        }`}
                        style={{
                          backgroundColor: isUnlocked ? badge.accentColor : undefined,
                        }}
                      >
                        {getBadgeIcon(badge.iconName, 'w-6 h-6')}
                      </div>

                      {/* Small Status Indicator */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                          isUnlocked
                            ? 'bg-green-500 text-white shadow-xs'
                            : 'bg-ink-300 dark:bg-ink-700 text-ink-500 dark:text-ink-400'
                        }`}
                      >
                        {isUnlocked ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <Lock className="w-2.5 h-2.5" />
                        )}
                      </div>
                    </div>

                    {/* Badge Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="font-display tracking-tight font-bold text-sm text-ink-900 dark:text-white truncate">
                            {badge.title}
                          </h3>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${getTierColorClass(
                              badge.tier
                            )}`}
                          >
                            {badge.tier}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-semibold text-brand-600 dark:text-brand-400 shrink-0">
                          +{badge.xpReward} XP
                        </span>
                      </div>

                      {badge.moduleLabel && (
                        <div className="text-[11px] font-mono text-ink-500 dark:text-ink-400">
                          {badge.moduleLabel}
                        </div>
                      )}

                      <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
                        {badge.description}
                      </p>

                      {/* Requirement & Jump button */}
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-ink-100 dark:border-white/5">
                        <div className="text-[11px] text-ink-400 dark:text-ink-500 truncate">
                          {isUnlocked ? (
                            <span className="text-green-700 dark:text-green-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Earned
                            </span>
                          ) : (
                            <span>{progressInfo.label}</span>
                          )}
                        </div>

                        {/* If locked and has moduleId, link to the module */}
                        {!isUnlocked && badge.moduleId && onSelectLab && (
                          <button
                            onClick={() => handleJumpToModule(badge.moduleId)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline cursor-pointer shrink-0"
                          >
                            <span>Go to module</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {isUnlocked && badge.moduleId && onSelectLab && (
                          <button
                            onClick={() => handleJumpToModule(badge.moduleId)}
                            className="text-[11px] text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors cursor-pointer shrink-0"
                          >
                            Revisit lab →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-ink-200 dark:border-white/10 bg-ink-50/50 dark:bg-ink-950/50 flex items-center justify-between gap-3 text-xs text-ink-500 dark:text-ink-400">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-500 shrink-0" />
            <span>Saved in this browser's local storage.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
