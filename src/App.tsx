/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { HomePage } from './components/HomePage';
import { TreeAtlas } from './components/TreeAtlas';
import { ProjectLabsHub } from './components/ProjectLabsHub';
import { TaxonomyMatrix } from './components/TaxonomyMatrix';
import { CodeWorkshop } from './components/CodeWorkshop';
import { GlossaryModal } from './components/GlossaryModal';
import { ShareModal } from './components/ShareModal';
import { BadgesMilestonesModal } from './components/BadgesMilestonesModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { ArchitectureSynthesisStudio } from './components/ArchitectureSynthesisStudio';
import { TheoryThinkingSanctuary } from './components/TheoryThinkingSanctuary';
import { SocraticQuestionGraphView } from './components/SocraticQuestionGraphView';
import { SubstrateRealityGraphView } from './components/SubstrateRealityGraphView';
import { RoboticsHardwareLabView } from './components/RoboticsHardwareLabView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { soundFX } from './utils/audio';
import { Eye, Search, Sliders, Trophy, BookOpen, ExternalLink, ChevronUp } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'home' | 'atlas' | 'labs' | 'taxonomy' | 'code' | 'synthesis' | 'epistemology' | 'questions_graph' | 'reality_graph' | 'robotics'>('home');
  const [activeLabId, setActiveLabId] = useState<string>('perceptron');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNavHidden, setIsNavHidden] = useState<boolean>(false);
  const [hideScrollbars, setHideScrollbars] = useState<boolean>(true);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundFX.getMuted());

  // Apply hide-scrollbars class to body
  useEffect(() => {
    if (hideScrollbars) {
      document.body.classList.add('hide-scrollbars');
    } else {
      document.body.classList.remove('hide-scrollbars');
    }
  }, [hideScrollbars]);

  // Global keyboard shortcuts (Ctrl+K for search, 1-7 for views, Esc/F for nav toggle, ? for glossary)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputFocused =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        if (isSearchOpen) setIsSearchOpen(false);
        else if (isGlossaryOpen) setIsGlossaryOpen(false);
        else if (isShareOpen) setIsShareOpen(false);
        else if (isBadgesOpen) setIsBadgesOpen(false);
        else if (isNavHidden) setIsNavHidden(false);
        return;
      }

      // Quick hotkeys when not typing
      if (!isInputFocused && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === '1') {
          setActiveView('home');
          soundFX.playTap();
        } else if (e.key === '2') {
          setActiveView('atlas');
          soundFX.playTap();
        } else if (e.key === '3') {
          setActiveView('labs');
          soundFX.playTap();
        } else if (e.key === '4') {
          setActiveView('taxonomy');
          soundFX.playTap();
        } else if (e.key === '5') {
          setActiveView('synthesis');
          soundFX.playTap();
        } else if (e.key === '6') {
          setActiveView('code');
          soundFX.playTap();
        } else if (e.key === '7') {
          setActiveView('epistemology');
          soundFX.playTap();
        } else if (e.key === '8') {
          setActiveView('questions_graph');
          soundFX.playTap();
        } else if (e.key === '9') {
          setActiveView('reality_graph');
          soundFX.playTap();
        } else if (e.key === '0') {
          setActiveView('robotics');
          soundFX.playTap();
        } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
          e.preventDefault();
          setIsGlossaryOpen((prev) => !prev);
          soundFX.playTap();
        } else if (e.key === 'f' || e.key === 'F') {
          setIsNavHidden((prev) => !prev);
          soundFX.playTap();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, isGlossaryOpen, isShareOpen, isBadgesOpen, isNavHidden]);

  const handleOpenLab = (labId: string) => {
    setActiveLabId(labId);
    setActiveView('labs');
    soundFX.playTap();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSound = () => {
    const muted = soundFX.toggleMute();
    setIsSoundMuted(muted);
    if (!muted) soundFX.playSuccess();
  };

  const handleToggleHideNav = () => {
    setIsNavHidden((prev) => !prev);
    soundFX.playTap();
  };

  const handleToggleScrollbars = () => {
    setHideScrollbars((prev) => !prev);
    soundFX.playTap();
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-ink-50 dark:bg-ink-950 text-ink-800 dark:text-ink-100 flex flex-col font-sans transition-colors selection:bg-brand-500/20 selection:text-brand-800 dark:selection:text-brand-200">
      {/* Universal Top Bar - Can be toggled / hidden for desktop immersion */}
      {!isNavHidden && (
        <>
          <TopNav
            activeView={activeView}
            onSelectView={(v) => {
              setActiveView(v);
              soundFX.playTap();
            }}
            activeLabId={activeLabId}
            onSelectLab={handleOpenLab}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenBadges={() => setIsBadgesOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            hideScrollbars={hideScrollbars}
            onToggleHideScrollbars={handleToggleScrollbars}
            onToggleHideNav={handleToggleHideNav}
            isSoundMuted={isSoundMuted}
            onToggleSound={handleToggleSound}
          />
          {/* Fixed Nav Spacer: Reserves header space so page content is not occluded */}
          <div className="h-[88px] lg:h-[54px] shrink-0 pointer-events-none" aria-hidden="true" />
        </>
      )}

      {/* Floating Zen Mode Trigger when Nav is Hidden */}
      {isNavHidden && (
        <aside
          aria-label="Focus mode controls"
          className="fixed top-3 right-4 z-50 flex items-center gap-2 p-1.5 bg-white/95 dark:bg-ink-950/95 backdrop-blur-md rounded-xl border border-ink-200 dark:border-white/10 shadow-lg text-xs"
        >
          <button
            onClick={() => setIsNavHidden(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium cursor-pointer transition-colors shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show Nav (Esc)</span>
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            title="Search architectures (Ctrl+K)"
            className="p-1.5 rounded-lg text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 cursor-pointer transition-colors"
          >
            <Search className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </button>

          <button
            onClick={handleToggleScrollbars}
            title={hideScrollbars ? 'Scrollbars Hidden' : 'Scrollbars Visible'}
            className="px-2 py-1 rounded-lg text-[11px] font-mono border border-ink-200 dark:border-white/10 text-ink-600 dark:text-ink-300 cursor-pointer"
          >
            {hideScrollbars ? 'No Bars' : 'Bars On'}
          </button>
        </aside>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full min-w-0 mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 space-y-6">
        <ErrorBoundary key={activeView} onReset={() => setActiveView('home')}>
          {/* View Switcher Content */}
          {activeView === 'home' && (
            <HomePage
              onSelectView={(v) => {
                setActiveView(v);
                soundFX.playTap();
              }}
              onSelectLab={handleOpenLab}
              onOpenGlossary={() => setIsGlossaryOpen(true)}
              onOpenBadges={() => setIsBadgesOpen(true)}
            />
          )}

          {activeView === 'atlas' && <TreeAtlas onOpenLab={handleOpenLab} />}

          {activeView === 'labs' && (
            <ProjectLabsHub
              activeLabId={activeLabId}
              onSelectLab={(id) => {
                setActiveLabId(id);
                soundFX.playTap();
              }}
            />
          )}

          {activeView === 'taxonomy' && <TaxonomyMatrix />}

          {activeView === 'synthesis' && <ArchitectureSynthesisStudio />}

          {activeView === 'code' && <CodeWorkshop />}

          {activeView === 'epistemology' && <TheoryThinkingSanctuary />}

          {activeView === 'questions_graph' && (
            <SocraticQuestionGraphView
              onOpenLab={handleOpenLab}
              onOpenView={(v) => setActiveView(v as any)}
            />
          )}

          {activeView === 'reality_graph' && (
            <SubstrateRealityGraphView
              onOpenLab={handleOpenLab}
              onOpenView={(v) => setActiveView(v as any)}
            />
          )}

          {activeView === 'robotics' && <RoboticsHardwareLabView />}
        </ErrorBoundary>
      </main>

      {/* Floating Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      {/* Share / Project Links Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Badges & Milestones Modal */}
      <BadgesMilestonesModal
        isOpen={isBadgesOpen}
        onClose={() => setIsBadgesOpen(false)}
        onSelectLab={handleOpenLab}
      />

      {/* Quick Search & Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectView={(v) => {
          setActiveView(v);
          soundFX.playTap();
        }}
        onSelectLab={handleOpenLab}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenBadges={() => setIsBadgesOpen(true)}
      />

      {/* Subtle Footer */}
      <footer className="mt-auto border-t border-ink-200 dark:border-white/10 bg-white dark:bg-ink-950 py-4 px-6 text-xs text-ink-500 dark:text-ink-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink-700 dark:text-ink-300">Neural Family</span>
            <span>·</span>
            <span>Interactive Architecture Laboratory</span>
            <span>·</span>
            <button
              onClick={() => setIsShareOpen(true)}
              className="text-brand-600 dark:text-brand-400 hover:underline cursor-pointer font-medium ml-1 flex items-center gap-1"
            >
              <span>Share Application</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-ink-500 dark:text-ink-400 font-mono text-[11px]">
            <button
              onClick={handleToggleHideNav}
              className="hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
            >
              {isNavHidden ? 'Exit Focus Mode' : 'Focus Mode (Hide Nav)'}
            </button>
            <span>·</span>
            <button
              onClick={handleToggleScrollbars}
              className="hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
            >
              {hideScrollbars ? 'Scrollbars: Off' : 'Scrollbars: On'}
            </button>
            <span>·</span>
            <span>Pure Tensor Math</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
