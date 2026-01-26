/**
 * XP Popup Store
 * Zustand store for XP popup UI state container
 * v0.41.20 - C3 Step 21: State Migration Batch #4
 */
export interface XpPopupProps {
    variant?: 'xp' | 'gold' | 'level';
}
export interface XpInstance {
    id: string;
    amount: number;
    offsetX: number;
    offsetY: number;
    variant: XpPopupProps['variant'];
}
export declare const useXpPopupStore: UseBoundStore<StoreApi<T>>;
