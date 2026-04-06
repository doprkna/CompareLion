/**
 * Region/theme store - minimal stub for build resolution.
 */
interface RegionState {
    region: string;
    setTheme: (name: string) => void;
}
export declare const useRegionStore: import("zustand").UseBoundStore<import("zustand").StoreApi<RegionState>>;
export {};
