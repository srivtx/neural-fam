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
  Download,
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
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-ink-950/95 backdrop-blur-md border-b border-ink-200 dark:border-white/10 transition-colors shadow-2xs">
      <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-2 flex items-center justify-between gap-2 lg:gap-3 xl:gap-4 overflow-visible">
        {/* Zone 1: Brand wordmark & Quick Search */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={() => onSelectView('home')}
            className="flex items-center gap-2 text-left group cursor-pointer focus:outline-none shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400 group-hover:scale-105 transition-transform shrink-0">
              <Network className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-bold tracking-tight text-ink-900 dark:text-white whitespace-nowrap group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                Neural Family
              </span>
              <span className="text-[10px] text-ink-400 dark:text-ink-500 font-mono -mt-1 hidden sm:block">
                Architecture Lab
              </span>
            </div>
          </button>

          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            title="Search architectures, labs, or formulas (Ctrl+K)"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs text-ink-500 dark:text-ink-400 bg-ink-100 hover:bg-ink-200/80 dark:bg-ink-800/80 dark:hover:bg-ink-800 rounded-lg border border-ink-200/60 dark:border-white/10 transition-colors cursor-pointer shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span className="hidden xl:inline">Search</span>
            <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-white dark:bg-ink-900 border border-ink-200 dark:border-white/10 text-ink-400">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Responsive compact labels on lg, full on 2xl) */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs font-semibold text-ink-600 dark:text-ink-300 shrink-0 p-0.5 bg-ink-100/70 dark:bg-ink-900/60 rounded-xl border border-ink-200/60 dark:border-white/5 no-scrollbar">
          <button
            onClick={() => onSelectView('home')}
            title="Home (Press 1)"
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'home'
                ? 'bg-white dark:bg-ink-800 text-ink-900 dark:text-white font-bold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onSelectView('atlas')}
            title="Tree Atlas (Press 2)"
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'atlas'
                ? 'bg-white dark:bg-ink-800 text-ink-900 dark:text-white font-bold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden 2xl:inline">Tree Atlas</span>
            <span className="2xl:hidden">Atlas</span>
          </button>

          <button
            onClick={() => onSelectView('labs')}
            title="Project Labs (Press 3)"
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'labs'
                ? 'bg-white dark:bg-ink-800 text-ink-900 dark:text-white font-bold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden 2xl:inline">Project Labs</span>
            <span className="2xl:hidden">Labs</span>
          </button>

          <button
            onClick={() => onSelectView('taxonomy')}
            title="Taxonomy Matrix (Press 4)"
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'taxonomy'
                ? 'bg-white dark:bg-ink-800 text-ink-900 dark:text-white font-bold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden 2xl:inline">3-Question Matrix</span>
            <span className="2xl:hidden">Matrix</span>
          </button>

          {/* Architecture Synthesis Studio Tab */}
          <button
            onClick={() => onSelectView('synthesis')}
            title="Synthesis Studio (Press 5)"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'synthesis'
                ? 'bg-white dark:bg-ink-800 text-brand-700 dark:text-brand-300 font-bold shadow-xs'
                : 'text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden 2xl:inline">Synthesis Studio</span>
            <span className="2xl:hidden">Synthesis</span>
          </button>

          <button
            onClick={() => onSelectView('code')}
            title="Code Workshop (Press 6)"
            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'code'
                ? 'bg-white dark:bg-ink-800 text-ink-900 dark:text-white font-bold shadow-xs'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
            }`}
          >
            <span className="hidden 2xl:inline">Code Workshop</span>
            <span className="2xl:hidden">Code</span>
          </button>
        </nav>

        {/* Zone 3: Utility Controls & User Profile (Never cut off at any desktop breakpoint) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 pl-1">
          {/* Hide Nav / Focus Mode Button */}
          <button
            onClick={onToggleHideNav}
            title="Hide navigation bar for full-screen focus (Esc)"
            className="p-1.5 rounded-lg border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors cursor-pointer shrink-0"
          >
            <EyeOff className="w-4 h-4 text-ink-500 dark:text-ink-400" />
          </button>

          {/* Hide Scrollbars Toggle */}
          <button
            onClick={onToggleHideScrollbars}
            title={hideScrollbars ? 'Scrollbars Hidden (Click to restore)' : 'Hide scrollbars for clean desktop view'}
            className={`px-2 py-1 text-xs rounded-lg border transition-colors cursor-pointer hidden 2xl:flex items-center gap-1 font-mono shrink-0 ${
              hideScrollbars
                ? 'bg-brand-50 dark:bg-brand-500/20 border-brand-300 dark:border-brand-500/30 text-brand-700 dark:text-brand-300'
                : 'border-ink-200 dark:border-white/10 text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800'
            }`}
          >
            <span className="text-[10px]">{hideScrollbars ? 'Bars: Off' : 'Bars: On'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={isSoundMuted ? 'Audio Feedback Muted' : 'Audio Feedback Active'}
            className="p-1.5 rounded-lg border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors cursor-pointer hidden sm:flex shrink-0"
          >
            {isSoundMuted ? (
              <VolumeX className="w-4 h-4 text-ink-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            )}
          </button>

          {/* Glossary Trigger */}
          <button
            onClick={onOpenGlossary}
            title="Open Architectural Glossary"
            className="hidden md:flex p-1.5 rounded-lg border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors cursor-pointer shrink-0"
          >
            <BookOpen className="w-4 h-4 text-amber-500" />
          </button>

          {/* PWA Install Button (renders when browser supports/fires beforeinstallprompt) */}
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              title="Install Neural Family as App"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/30 text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {/* Share Button */}
          <button
            onClick={onOpenShare}
            title="Share & Project Links"
            className="p-1.5 rounded-lg border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors cursor-pointer shrink-0"
          >
            <Share2 className="w-4 h-4 text-ink-600 dark:text-ink-300" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-1.5 rounded-lg border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors cursor-pointer shrink-0"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* User Profile & Badges Trigger - Padded with guaranteed clearance from screen edge */}
          <button
            onClick={onOpenBadges}
            title="View Badges & Architecture Milestones"
            className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 py-1 bg-brand-50/70 hover:bg-brand-100/80 dark:bg-brand-950/40 dark:hover:bg-brand-900/50 border border-brand-300/80 dark:border-brand-500/30 rounded-xl transition-all cursor-pointer group shadow-2xs hover:scale-[1.02] shrink-0"
          >
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-lg bg-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {USER_PROFILE.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-brand-400 rounded-full border border-white dark:border-ink-950" />
            </div>

            <div className="flex flex-col text-left shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-ink-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors max-w-[70px] sm:max-w-none truncate">
                  <span className="lg:hidden xl:inline">{USER_PROFILE.displayName}</span>
                  <span className="hidden lg:inline xl:hidden">Learner</span>
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-brand-200/60 dark:bg-brand-500/20 text-brand-800 dark:text-brand-300 font-bold shrink-0">
                  Lv.{stats.level}
                </span>
              </div>

              <div className="hidden sm:flex lg:hidden 2xl:flex items-center gap-1 text-[11px] text-ink-600 dark:text-ink-300 font-medium">
                <Trophy className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                <span>
                  {stats.unlockedBadgesCount}/{stats.totalBadgesCount}
                </span>
                <span className="text-[10px] text-ink-400">Badges</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Strip */}
      <nav aria-label="Mobile navigation" className="flex lg:hidden overflow-x-auto overscroll-x-contain no-scrollbar px-3 py-1.5 border-t border-ink-100 dark:border-white/5 gap-1.5 bg-ink-50/70 dark:bg-ink-950/70 text-xs">
        <button
          onClick={() => onSelectView('home')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors font-medium ${
            activeView === 'home'
              ? 'bg-brand-500 text-white font-bold shadow-2xs'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          Home
        </button>
        <button
          onClick={() => onSelectView('atlas')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors font-medium ${
            activeView === 'atlas'
              ? 'bg-brand-500 text-white font-bold shadow-2xs'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          Atlas
        </button>
        <button
          onClick={() => onSelectView('labs')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors font-medium ${
            activeView === 'labs'
              ? 'bg-brand-500 text-white font-bold shadow-2xs'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          Labs
        </button>
        <button
          onClick={() => onSelectView('taxonomy')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors font-medium ${
            activeView === 'taxonomy'
              ? 'bg-brand-500 text-white font-bold shadow-2xs'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          3-Question Matrix
        </button>
        <button
          onClick={() => onSelectView('synthesis')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg shrink-0 transition-colors font-medium ${
            activeView === 'synthesis'
              ? 'bg-brand-500 text-white font-bold shadow-2xs'
              : 'text-brand-600 dark:text-brand-400 hover:text-brand-700'
          }`}
        >
          <Compass className="w-3 h-3" />
          <span>Synthesis Studio</span>
        </button>
        <button
          onClick={() => onSelectView('code')}
          className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors font-medium ${
            activeView === 'code'
              ? 'bg-brand-500 text-white font-bold shadow-2xs'
              : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          Code
        </button>
      </nav>
    </header>
  );
};
