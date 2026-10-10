/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export interface LearningProgress {
  completedLabs: string[];
  solvedQuizzes: string[];
  runCodeTests: string[];
  unlockedBadges: string[];
  lastUpdated?: number;
}

const STORAGE_KEY = 'neural_family_progress_v2';
const PROGRESS_EVENT = 'neural_family_progress_changed';

export const USER_PROFILE = {
  email: 'crypticcc101@gmail.com',
  displayName: 'crypticcc101',
  role: 'AI Architecture Researcher',
  organization: 'Neural Systems Lab',
  memberSince: 'October 2026',
};

export function getProgress(): LearningProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate from old key if exists
      const oldRaw = localStorage.getItem('neural_family_progress_v1');
      if (oldRaw) {
        const oldData = JSON.parse(oldRaw);
        return {
          completedLabs: Array.isArray(oldData.completedLabs) ? oldData.completedLabs : [],
          solvedQuizzes: Array.isArray(oldData.solvedQuizzes) ? oldData.solvedQuizzes : [],
          runCodeTests: Array.isArray(oldData.runCodeTests) ? oldData.runCodeTests : [],
          unlockedBadges: [],
          lastUpdated: Date.now(),
        };
      }
      return {
        completedLabs: [],
        solvedQuizzes: [],
        runCodeTests: [],
        unlockedBadges: [],
        lastUpdated: Date.now(),
      };
    }
    const parsed = JSON.parse(raw);
    return {
      completedLabs: Array.isArray(parsed.completedLabs) ? parsed.completedLabs : [],
      solvedQuizzes: Array.isArray(parsed.solvedQuizzes) ? parsed.solvedQuizzes : [],
      runCodeTests: Array.isArray(parsed.runCodeTests) ? parsed.runCodeTests : [],
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
      lastUpdated: parsed.lastUpdated || Date.now(),
    };
  } catch {
    return { completedLabs: [], solvedQuizzes: [], runCodeTests: [], unlockedBadges: [], lastUpdated: Date.now() };
  }
}

function saveAndNotify(progress: LearningProgress): LearningProgress {
  progress.lastUpdated = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT, { detail: progress }));
  }
  return progress;
}

export function markLabCompleted(labId: string): LearningProgress {
  const current = getProgress();
  if (!current.completedLabs.includes(labId)) {
    current.completedLabs.push(labId);
    return saveAndNotify(current);
  }
  return current;
}

export function markQuizSolved(quizKey: string): LearningProgress {
  const current = getProgress();
  let changed = false;
  if (!current.solvedQuizzes.includes(quizKey)) {
    current.solvedQuizzes.push(quizKey);
    changed = true;
  }
  // Also mark lab as completed if quiz is solved
  if (!current.completedLabs.includes(quizKey)) {
    current.completedLabs.push(quizKey);
    changed = true;
  }
  if (changed) {
    return saveAndNotify(current);
  }
  return current;
}

export function markTestRun(labId: string = 'general'): LearningProgress {
  const current = getProgress();
  if (!current.runCodeTests.includes(labId)) {
    current.runCodeTests.push(labId);
    return saveAndNotify(current);
  }
  return current;
}

export function resetProgress(): LearningProgress {
  const empty: LearningProgress = {
    completedLabs: [],
    solvedQuizzes: [],
    runCodeTests: [],
    unlockedBadges: [],
    lastUpdated: Date.now(),
  };
  return saveAndNotify(empty);
}

export function setDemoCompleted(labIds: string[]): LearningProgress {
  const current = getProgress();
  labIds.forEach((id) => {
    if (!current.completedLabs.includes(id)) current.completedLabs.push(id);
    if (!current.solvedQuizzes.includes(id)) current.solvedQuizzes.push(id);
    if (!current.runCodeTests.includes(id)) current.runCodeTests.push(id);
  });
  return saveAndNotify(current);
}

/**
 * Custom React hook for subscribing to live learning progress updates
 */
export function useLearningProgress(): LearningProgress {
  const [progress, setProgress] = useState<LearningProgress>(getProgress);

  useEffect(() => {
    const handleUpdate = () => {
      setProgress(getProgress());
    };

    window.addEventListener(PROGRESS_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(PROGRESS_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return progress;
}
