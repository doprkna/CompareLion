/**
 * useKeyboardNavigation Hook
 * v0.34.5 - Global keyboard shortcuts for navigation
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getNavigationAction,
  executeNavigationAction,
  type NavigationAction,
} from '@/lib/ux/navigation';

export interface UseKeyboardNavigationOptions {
  enabled?: boolean;
  onThemeToggle?: () => void;
  onCustomAction?: (action: NavigationAction) => void;
}

/**
 * Hook for global keyboard navigation
 */
export function useKeyboardNavigation(options: UseKeyboardNavigationOptions = {}): void {
  const { enabled = true, onThemeToggle, onCustomAction } = options;
  const router = useRouter();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const action = getNavigationAction(event);

      if (action) {
        event.preventDefault();

        // Handle theme toggle specially
        if (action === 'theme_toggle' && onThemeToggle) {
          onThemeToggle();
          return;
        }

        // Allow custom handler
        if (onCustomAction) {
          onCustomAction(action);
        }

        // Execute navigation action
        executeNavigationAction(action, router);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, router, onThemeToggle, onCustomAction]);
}



