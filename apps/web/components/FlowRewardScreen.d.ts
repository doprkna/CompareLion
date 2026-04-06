import { type DropItem } from './RewardModal';
export interface FlowRewardData {
    xp: number;
    gold: number;
    diamonds: number;
    hearts?: number;
    food?: number;
    questionsAnswered: number;
    accuracy?: number;
    time?: number;
    drops?: DropItem[];
    onNextFlow?: () => void;
    onReviewAnswers?: () => void;
    onBackToMain?: () => void;
}
export interface FlowRewardScreenProps {
    open: boolean;
    onClose: () => void;
    data: FlowRewardData;
}
export declare function FlowRewardScreen({ open, onClose, data }: FlowRewardScreenProps): import("react").JSX.Element;
