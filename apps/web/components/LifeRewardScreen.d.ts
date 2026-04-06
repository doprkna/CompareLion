import { type DropItem } from './RewardModal';
export interface LifeRewardData {
    hearts: number;
    food: number;
    xpLost?: number;
    goldLost?: number;
    questionsAttempted?: number;
    timeSpent?: number;
    drops?: DropItem[];
    onBuyHearts?: () => void;
    onBuyFood?: () => void;
    onReturnHome?: () => void;
}
export interface LifeRewardScreenProps {
    open: boolean;
    onClose: () => void;
    data: LifeRewardData;
}
export declare function LifeRewardScreen({ open, onClose, data }: LifeRewardScreenProps): import("react").JSX.Element;
