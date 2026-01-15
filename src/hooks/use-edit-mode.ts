// ============================================
// Edit Mode Hook - Password protection for editing
// ============================================

import { useState, useCallback, useEffect } from 'react';
import { EDIT_PASSWORD } from '@/lib/constants';

const STORAGE_KEY = 'store-audit-edit-mode';
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 hours

interface EditModeState {
  isUnlocked: boolean;
  unlockedAt: number | null;
}

/**
 * Hook for managing edit mode state
 */
export function useEditMode() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Check session storage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const state: EditModeState = JSON.parse(stored);
        const now = Date.now();
        
        // Check if session is still valid
        if (state.isUnlocked && state.unlockedAt) {
          const elapsed = now - state.unlockedAt;
          if (elapsed < SESSION_TIMEOUT) {
            setIsUnlocked(true);
          } else {
            // Session expired
            sessionStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  /**
   * Unlock edit mode with password
   */
  const unlock = useCallback((password: string): boolean => {
    if (password === EDIT_PASSWORD) {
      const state: EditModeState = {
        isUnlocked: true,
        unlockedAt: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setIsUnlocked(true);
      setIsEditMode(true);
      return true;
    }
    return false;
  }, []);

  /**
   * Lock edit mode
   */
  const lock = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsUnlocked(false);
    setIsEditMode(false);
  }, []);

  /**
   * Toggle edit mode (only if unlocked)
   */
  const toggleEditMode = useCallback(() => {
    if (isUnlocked) {
      setIsEditMode((prev) => !prev);
    }
  }, [isUnlocked]);

  /**
   * Enable edit mode (only if unlocked)
   */
  const enableEditMode = useCallback(() => {
    if (isUnlocked) {
      setIsEditMode(true);
    }
  }, [isUnlocked]);

  /**
   * Disable edit mode
   */
  const disableEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

  return {
    isEditMode,
    isUnlocked,
    unlock,
    lock,
    toggleEditMode,
    enableEditMode,
    disableEditMode,
  };
}
