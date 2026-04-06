import { Quest } from '@parel/core/hooks/useQuests';
interface QuestClaimPopupProps {
    quest: Quest | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    claiming?: boolean;
}
export declare function QuestClaimPopup({ quest, isOpen, onClose, onConfirm, claiming, }: QuestClaimPopupProps): import("react").JSX.Element | null;
export {};
