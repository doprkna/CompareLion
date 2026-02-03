import { Region } from '@parel/core/config/regions';
type RegionState = {
    region: Region;
    setRegion: (r: Region) => void;
    language: string;
    setLanguage: (l: string) => void;
    theme: string;
    setTheme: (t: string) => void;
};
export declare const useRegionStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<RegionState>, "setState" | "persist"> & {
    setState(partial: RegionState | Partial<RegionState> | ((state: RegionState) => RegionState | Partial<RegionState>), replace?: false | undefined): unknown;
    setState(state: RegionState | ((state: RegionState) => RegionState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<RegionState, RegionState, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: RegionState) => void) => () => void;
        onFinishHydration: (fn: (state: RegionState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<RegionState, RegionState, unknown>>;
    };
}>;
export {};
