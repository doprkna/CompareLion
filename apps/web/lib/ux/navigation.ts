/**
 * Navigation Utilities
 * v0.34.5 - Keyboard shortcuts and gesture-based navigation
 */

export type NavigationAction = 'back' | 'forward' | 'home' | 'refresh' | 'theme_toggle';

export interface KeyboardShortcut {
  key: string;
  action: NavigationAction;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

/**
 * Default keyboard shortcuts
 */
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  { key: 'ArrowLeft', action: 'back' },
  { key: 'ArrowRight', action: 'forward' },
  { key: 'h', action: 'home', altKey: true },
  { key: 'r', action: 'refresh', ctrlKey: false }, // Just 'R' without Ctrl
  { key: 't', action: 'theme_toggle', altKey: true },
];

/**
 * Check if keyboard event matches a shortcut
 */
export function matchesShortcut(
  event: KeyboardEvent,
  shortcut: KeyboardShortcut
): boolean {
  const keyMatches = event.key === shortcut.key;
  const ctrlMatches = shortcut.ctrlKey === undefined || event.ctrlKey === shortcut.ctrlKey;
  const altMatches = shortcut.altKey === undefined || event.altKey === shortcut.altKey;
  const shiftMatches = shortcut.shiftKey === undefined || event.shiftKey === shortcut.shiftKey;

  return keyMatches && ctrlMatches && altMatches && shiftMatches;
}

/**
 * Get navigation action from keyboard event
 */
export function getNavigationAction(event: KeyboardEvent): NavigationAction | null {
  for (const shortcut of DEFAULT_SHORTCUTS) {
    if (matchesShortcut(event, shortcut)) {
      return shortcut.action;
    }
  }
  return null;
}

/**
 * Execute navigation action
 */
export function executeNavigationAction(
  action: NavigationAction,
  router?: { back: () => void; push: (path: string) => void; refresh: () => void }
): void {
  if (!router) {
    console.warn('No router available for navigation action');
    return;
  }

  switch (action) {
    case 'back':
      router.back();
      break;
    case 'forward':
      // Browser forward is handled by browser, not Next.js router
      if (typeof window !== 'undefined') {
        window.history.forward();
      }
      break;
    case 'home':
      router.push('/');
      break;
    case 'refresh':
      router.refresh();
      break;
    case 'theme_toggle':
      // Theme toggle handled by context
      break;
  }
}

/**
 * Mobile gesture detection
 */
export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  duration: number;
}

/**
 * Detect swipe gesture from touch events
 */
export class SwipeDetector {
  private startX: number = 0;
  private startY: number = 0;
  private startTime: number = 0;
  private threshold: number = 50; // Minimum distance to trigger swipe
  private maxDuration: number = 500; // Maximum duration for swipe (ms)

  onTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.startTime = Date.now();
  }

  onTouchEnd(event: TouchEvent, callback: (gesture: SwipeGesture) => void): void {
    const touch = event.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const endTime = Date.now();

    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const duration = endTime - this.startTime;

    // Check if duration is within threshold
    if (duration > this.maxDuration) {
      return;
    }

    // Check if swipe distance is sufficient
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < this.threshold && absY < this.threshold) {
      return;
    }

    // Determine direction (horizontal swipe takes precedence)
    let direction: 'left' | 'right' | 'up' | 'down';
    let distance: number;

    if (absX > absY) {
      direction = deltaX > 0 ? 'right' : 'left';
      distance = absX;
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
      distance = absY;
    }

    callback({ direction, distance, duration });
  }
}

/**
 * Page transition configurations
 */
export const PAGE_TRANSITIONS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  slide: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
};

/**
 * Get default transition for page type
 */
export function getPageTransition(pageType: 'default' | 'modal' | 'admin' = 'default') {
  switch (pageType) {
    case 'modal':
      return PAGE_TRANSITIONS.slideUp;
    case 'admin':
      return PAGE_TRANSITIONS.fade;
    default:
      return PAGE_TRANSITIONS.slide;
  }
}

