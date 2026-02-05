export type NavigationAction = 'home' | 'back' | 'forward' | 'refresh' | 'search' | 'theme_toggle' | 'help';
export declare function getNavigationAction(event: KeyboardEvent): NavigationAction | null;
export declare function executeNavigationAction(action: NavigationAction, router: {
    push: (path: string) => void;
    back: () => void;
    forward: () => void;
}): void;
