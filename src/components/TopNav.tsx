/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Network,
  Cpu,
  Sliders,
  Code2,
  BookOpen,
  Home,
  Sun,
  Moon,
  Trophy,
  Search,
  EyeOff,
  Volume2,
  VolumeX,
  Share2,
  Compass,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLearningProgress, USER_PROFILE } from '../utils/progressStore';
import { computeUserStats } from '../data/badgesData';

interface TopNavProps {
  activeView: 'home' | 'atlas' | 'labs' | 'taxonomy' | 'code' | 'synthesis';
  onSelectView: (view: 'home' | 'atlas' | 'labs' | 'taxonomy' | 'code' | 'synthesis') => void;
  activeLabId: string;
  onSelectLab: (labId: string) => void;
  onOpenGlossary: () => void;
  onOpenShare: () => void;
  onOpenBadges: () => void;
  onOpenSearch: () => void;
  hideScrollbars: boolean;
  onToggleHideScrollbars: () => void;
  onToggleHideNav: () => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  onSelectView,
  activeLabId: _activeLabId,
  onSelectLab: _onSelectLab,
  onOpenGlossary,
  onOpenShare,
  onOpenBadges,
  onOpenSearch,
  hideScrollbars,
  onToggleHideScrollbars,
  onToggleHideNav,
  isSoundMuted,
  onToggleSound,
}) => {
  const { theme, toggleTheme } = useTheme();
  const progress = useLearningProgress();
  const stats = computeUserStats(progress);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors shadow-2xs">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-6 xl:px-8 py-2 flex items-center justify-between gap-1.5 sm:gap-3 xl:gap-4 overflow-visible">
        {/* Zone 1: Brand wordmark & Quick Search */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={() => onSelectView('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
              <Network className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Neural Family
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono -mt-1 hidden sm:block">
                Architecture Lab
              </span>
            </div>
          </button>

          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            title="Search architectures, labs, or formulas (Ctrl+K)"
            className="hidden md:flex items-center gap-2 px-2.5 py-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/80 dark:hover:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-white/10 transition-colors cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Search</span>
            <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Responsive compact labels on lg, full on xl) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 shrink min-w-0">
          <button
            onClick={() => onSelectView('home')}
            className={`px-2 xl:px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'home'
                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onSelectView('atlas')}
            className={`px-2 xl:px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'atlas'
                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="xl:hidden">Atlas</span>
            <span className="hidden xl:inline">Tree Atlas</span>
          </button>

          <button
            onClick={() => onSelectView('labs')}
            className={`px-2 xl:px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'labs'
                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="xl:hidden">Labs</span>
            <span className="hidden xl:inline">Project Labs</span>
          </button>

          <button
            onClick={() => onSelectView('taxonomy')}
            className={`px-2 xl:px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'taxonomy'
                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="xl:hidden">Matrix</span>
            <span className="hidden xl:inline">3-Question Matrix</span>
          </button>

          {/* Architecture Synthesis Studio Tab */}
          <button
            onClick={() => onSelectView('synthesis')}
            className={`flex items-center gap-1 px-2 xl:px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'synthesis'
                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30'
                : 'hover:text-slate-900 dark:hover:text-white text-emerald-600 dark:text-emerald-400'
            }`}
            title="Invent New Architectures from First Principles"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="xl:hidden">Synthesis</span>
            <span className="hidden xl:inline">Synthesis Studio</span>
          </button>

          <button
            onClick={() => onSelectView('code')}
            className={`px-2 xl:px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeView === 'code'
                ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-500/30'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="xl:hidden">Code</span>
            <span className="hidden xl:inline">Code Workshop</span>
          </button>
        </nav>

        {/* Zone 3: Utility Controls & User Profile (Never cut off at any desktop breakpoint) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1">
          {/* Hide Nav / Focus Mode Button */}
          <button
            onClick={onToggleHideNav}
            title="Hide navigation bar for full-screen focus (Esc)"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <EyeOff className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>

          {/* Hide Scrollbars Toggle */}
          <button
            onClick={onToggleHideScrollbars}
            title={hideScrollbars ? 'Scrollbars Hidden (Click to restore)' : 'Hide scrollbars for clean desktop view'}
            className={`px-2 py-1 text-xs rounded-lg border transition-colors cursor-pointer hidden 2xl:flex items-center gap-1 font-mono shrink-0 ${
              hideScrollbars
                ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px]">{hideScrollbars ? 'Bars: Off' : 'Bars: On'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={isSoundMuted ? 'Audio Feedback Muted' : 'Audio Feedback Active'}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden sm:flex shrink-0"
          >
            {isSoundMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>

          {/* Glossary Trigger */}
          <button
            onClick={onOpenGlossary}
            title="Open Architectural Glossary"
            className="hidden md:flex p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
          </button>

          {/* Share Button */}
          <button
            onClick={onOpenShare}
            title="Share & Project Links"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Profile & Badges Trigger - Padded with guaranteed clearance from screen edge */}
          <button
            onClick={onOpenBadges}
            title="View Badges & Architecture Milestones"
            className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 py-1 bg-emerald-50/70 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 border border-emerald-300/80 dark:border-emerald-500/30 rounded-xl transition-all cursor-pointer group shadow-2xs hover:scale-[1.02] shrink-0"
          >
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {USER_PROFILE.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-white dark:border-[#090d16]" />
            </div>

            <div className="flex flex-col text-left shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors max-w-[70px] sm:max-w-none truncate">
                  <span className="lg:hidden xl:inline">{USER_PROFILE.displayName}</span>
                  <span className="hidden lg:inline xl:hidden">Learner</span>
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-200/60 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold shrink-0">
                  Lv.{stats.level}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                <Trophy className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                <span>
                  {stats.unlockedBadgesCount}/{stats.totalBadgesCount}
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">Badges</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
