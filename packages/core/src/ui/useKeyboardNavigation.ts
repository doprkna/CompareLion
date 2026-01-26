/**
 * useKeyboardNavigation Hook
 * v0.34.5 - Global keyboard shortcuts for navigation
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// TODO: resolve dependency injection after cleaning @parel/core/config
// These utilities need to be moved to @parel/core/config or injected as dependencies
// import {
//   getNavigationAction,
//   executeNavigationAction,
//   type NavigationAction,
// } from '@/lib/ux/navigation';

export type NavigationAction = 
  | 'home'
  | 'back'
  | 'forward'
  | 'refresh'
  | 'search'
  | 'theme_toggle'
  | 'help';

// Temporary implementation until navigation utilities are moved
function getNavigationAction(event: KeyboardEvent): NavigationAction | null {
  // TODO: Implement proper navigation action detection
  if (event.key === 'h' && event.ctrlKey) return 'home';
  if (event.key === 'ArrowLeft' && event.altKey) return 'back';
  if (event.key === 'ArrowRight' && event.altKey) return 'forward';
  if (event.key === 'r' && event.ctrlKey) return 'refresh';
  if (event.key === 'k' && event.ctrlKey) return 'search';
  if (event.key === 't' && event.ctrlKey && event.shiftKey) return 'theme_toggle';
  if (event.key === '?' && event.shiftKey) return 'help';
  return null;
}

function executeNavigationAction(action: NavigationAction, router: ReturnType<typeof useRouter>): void {
  // TODO: Implement proper navigation action execution
  switch (action) {
    case 'home':
      router.push('/');
      break;
    case 'back':
      router.back();
      break;
    case 'forward':
      router.forward();
      break;
    case 'refresh':
      window.location.reload();
      break;
    case 'search':
      // TODO: Open search modal
      break;
    case 'help':
      // TODO: Open help modal
      break;
    // theme_toggle is handled separately
  }
}

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

