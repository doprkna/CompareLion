import { Quest } from '@parel/core/hooks/useQuests';
import { QuestLore } from '@parel/core/hooks/useQuestLore';
interface QuestCompletionModalProps {
    quest: Quest | null;
    lore: QuestLore | null;
    isOpen: boolean;
    onClose: () => void;
    rewards: {
        xp: number;
        gold: number;
        karma: number;
        badge?: string | null;
        item?: string | null;
    };
}
export declare function QuestCompletionModal({ quest, lore, isOpen, onClose, rewards, }: QuestCompletionModalProps): import("react").JSX.Element | null;
export {};
