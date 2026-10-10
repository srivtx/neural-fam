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
    showToast(`🎉 Achievement Unlocked: ${name}!`);
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
    showToast('🏆 All 9 Architecture Modules & Grandmaster Badges Unlocked!');
  };

  const handleReset = () => {
    resetProgress();
    showToast('Progress has been reset to Level 1.');
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
        return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-400/40';
      case 'Gold':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/40';
      case 'Platinum':
        return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30';
      case 'Diamond':
        return 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/40';
      default:
        return 'bg-slate-500/10 text-slate-600 border-slate-300';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="badges-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-60 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>{notification}</span>
        </div>
      )}

      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0c1220] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#0e1626]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="badges-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                  Badges & Architecture Milestones
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                  {stats.unlockedBadgesCount} / {stats.totalBadgesCount} Unlocked
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reward system honoring masteries across all 9 neural network architecture families
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* User Profile Card (Google-style clean identity card) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/30 dark:from-[#0f172a] dark:to-[#062419]/30 border border-slate-200 dark:border-white/10 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {/* Avatar with Google green halo */}
                <div className="relative">
                  <div className="w-13 h-13 rounded-full bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shadow-md ring-4 ring-emerald-500/20">
                    {USER_PROFILE.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div
                    title="Active Researcher"
                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#0c1220] rounded-full"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900 dark:text-white">
                      {USER_PROFILE.displayName}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-500/30">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      Level {stats.level}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{USER_PROFILE.email}</span>
                    <span>•</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {stats.rankTitle}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total XP and Next Level Progress */}
              <div className="w-full sm:w-64 space-y-1.5 bg-white dark:bg-[#080d17] p-3 rounded-xl border border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Experience Points
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {stats.totalXp} XP
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.levelProgressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  <span>Level {stats.level}</span>
                  <span>
                    {stats.levelProgressPercent}% to Lv. {stats.level + 1} ({stats.nextLevelXp} XP)
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-200/80 dark:border-white/10 text-xs">
              <div className="bg-white/80 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">
                  Architectures
                </span>
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {stats.completedModulesCount} / {stats.totalModulesCount}
                </span>
              </div>
              <div className="bg-white/80 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">
                  Concept Checks
                </span>
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {stats.solvedQuizzesCount} Solved
                </span>
              </div>
              <div className="bg-white/80 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">
                  Code Test Suites
                </span>
                <span className="font-bold text-base text-slate-900 dark:text-white">
                  {stats.runCodeTestsCount} Passed
                </span>
              </div>
              <div className="bg-white/80 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200/60 dark:border-white/5">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">
                  Badges Earned
                </span>
                <span className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                  {stats.unlockedBadgesCount} / {stats.totalBadgesCount}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Filters & Demo Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                All Badges ({BADGES.length})
              </button>
              <button
                onClick={() => setActiveFilter('unlocked')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeFilter === 'unlocked'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                Unlocked ({stats.unlockedBadgesCount})
              </button>
              <button
                onClick={() => setActiveFilter('locked')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeFilter === 'locked'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                In Progress ({stats.totalBadgesCount - stats.unlockedBadgesCount})
              </button>
              <button
                onClick={() => setActiveFilter('architecture')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeFilter === 'architecture'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                Modules (9)
              </button>
            </div>

            {/* Quick Demo Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto text-xs shrink-0">
              <button
                onClick={() => handleTestUnlock('perceptron', 'Synapse Pioneer')}
                title="Simulate completing Module 0 (Perceptron)"
                className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                + Test Module 0
              </button>
              <button
                onClick={handleUnlockAll}
                title="Unlock all badges for testing/demo"
                className="px-2.5 py-1 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 rounded-lg font-medium transition-colors cursor-pointer"
              >
                Unlock All (Demo)
              </button>
              <button
                onClick={handleReset}
                title="Reset progress to default"
                className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
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
                      ? 'bg-white dark:bg-[#0e1626] border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/10'
                      : 'bg-slate-50/70 dark:bg-[#0a0f1d] border-slate-200 dark:border-white/5 opacity-85'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Badge Emblem Icon */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform ${
                          isUnlocked
                            ? 'text-white shadow-md'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
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
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
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
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
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
                        <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                          +{badge.xpReward} XP
                        </span>
                      </div>

                      {badge.moduleLabel && (
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {badge.moduleLabel}
                        </div>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {badge.description}
                      </p>

                      {/* Requirement & Jump button */}
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-white/5">
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          {isUnlocked ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Milestone Achieved
                            </span>
                          ) : (
                            <span>{progressInfo.label}</span>
                          )}
                        </div>

                        {/* If locked and has moduleId, show Jump to Module */}
                        {!isUnlocked && badge.moduleId && onSelectLab && (
                          <button
                            onClick={() => handleJumpToModule(badge.moduleId)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline cursor-pointer shrink-0"
                          >
                            <span>Jump to Module</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}

                        {isUnlocked && badge.moduleId && onSelectLab && (
                          <button
                            onClick={() => handleJumpToModule(badge.moduleId)}
                            className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
                          >
                            Review Lab →
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
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0a0f1d]/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>Badges persist in local storage across sessions.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
