interface AscendModalProps {
    open: boolean;
    onClose: () => void;
    currentGeneration: number;
    prestigeCount: number;
    canAscend: boolean;
    onAscended?: () => void;
}
export declare function AscendModal({ open, onClose, currentGeneration, prestigeCount, canAscend, onAscended, }: AscendModalProps): import("react").JSX.Element;
export {};
