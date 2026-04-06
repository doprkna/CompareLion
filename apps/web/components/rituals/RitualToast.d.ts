interface RitualToastProps {
    show: boolean;
    rewards: {
        xp: number;
        karma: number;
    };
    streakCount: number;
    onClose: () => void;
}
export declare function RitualToast({ show, rewards, streakCount, onClose, }: RitualToastProps): import("react").JSX.Element | null;
export {};
