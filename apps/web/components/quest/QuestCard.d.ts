import { Quest } from '@parel/core/hooks/useQuests';
interface QuestCardProps {
    quest: Quest;
    onClaim?: () => void;
    claiming?: boolean;
}
export declare function QuestCard({ quest, onClaim, claiming }: QuestCardProps): import("react").JSX.Element;
export {};
