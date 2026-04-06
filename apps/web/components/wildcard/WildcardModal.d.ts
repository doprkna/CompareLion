interface WildcardModalProps {
    open: boolean;
    onClose: () => void;
    onRedeem: () => void;
    wildcard: {
        id: string;
        wildcardId: string;
        title: string;
        description: string;
        flavorText: string;
        rewardXP: number;
        rewardKarma: number;
    };
    loading?: boolean;
}
export declare function WildcardModal({ open, onClose, onRedeem, wildcard, loading }: WildcardModalProps): import("react").JSX.Element;
export {};
