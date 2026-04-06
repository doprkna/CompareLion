interface MirrorRewardModalProps {
    open: boolean;
    onClose: () => void;
    rewards: {
        xp: number;
        badgeGranted?: boolean;
        badgeName?: string;
    };
    message?: string;
}
export declare function MirrorRewardModal({ open, onClose, rewards, message }: MirrorRewardModalProps): import("react").JSX.Element;
export {};
