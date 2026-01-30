interface PreloadData {
    user?: any;
    ready: boolean;
}
export declare function useAppPreload(): {
    preloadData: PreloadData;
    preloadApp: () => Promise<void>;
    isPreloading: boolean;
    isReady: boolean;
};
export {};
