interface PrestigeClaimModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
    prestigeCount: number;
    seasonLevel: number;
    canPrestige: boolean;
}
export declare function PrestigeClaimModal({ open, onClose, onConfirm, loading, prestigeCount, seasonLevel, canPrestige, }: PrestigeClaimModalProps): import("react").JSX.Element;
export {};
