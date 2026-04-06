interface PrestigeModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    seasonLevel: number;
    prestigeCount: number;
}
export declare function PrestigeModal({ open, onClose, onConfirm, loading, seasonLevel, prestigeCount, }: PrestigeModalProps): import("react").JSX.Element;
export {};
