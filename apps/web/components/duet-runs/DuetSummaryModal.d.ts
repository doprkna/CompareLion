interface DuetSummaryModalProps {
    show: boolean;
    rewards: {
        xp: number;
        karma: number;
        synergyBonus: boolean;
        finishedOnTime: boolean;
    };
    partner: {
        id: string;
        name: string;
        image: string | null;
    };
    onClose: () => void;
}
export declare function DuetSummaryModal({ show, rewards, partner, onClose, }: DuetSummaryModalProps): import("react").JSX.Element | null;
export {};
