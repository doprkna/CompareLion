interface BetaInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare function BetaInfoModal({ isOpen, onClose }: BetaInfoModalProps): import("react").JSX.Element;
export declare function useBetaInfoModal(): {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
};
export {};
