// sanity-fix: Minimal navigation utilities stub for packages/core
export type NavigationAction = 
  | 'home'
  | 'back'
  | 'forward'
  | 'refresh'
  | 'search'
  | 'theme_toggle'
  | 'help';

export function getNavigationAction(event: KeyboardEvent): NavigationAction | null {
  if (typeof window === 'undefined') return null; // sanity-fix
  if (event.key === 'h' && event.ctrlKey) return 'home';
  if (event.key === 'ArrowLeft' && event.altKey) return 'back';
  if (event.key === 'ArrowRight' && event.altKey) return 'forward';
  if (event.key === 'r' && event.ctrlKey) return 'refresh';
  if (event.key === 'k' && event.ctrlKey) return 'search';
  if (event.key === 't' && event.ctrlKey && event.shiftKey) return 'theme_toggle';
  if (event.key === '?' && event.shiftKey) return 'help';
  return null;
}

export function executeNavigationAction(
  action: NavigationAction,
  router: { push: (path: string) => void; back: () => void; forward: () => void }
): void {
  if (typeof window === 'undefined') return; // sanity-fix
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

