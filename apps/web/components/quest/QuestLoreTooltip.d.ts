import { QuestLore } from '@parel/core/hooks/useQuestLore';
interface QuestLoreTooltipProps {
    lore: QuestLore | null;
    children: React.ReactNode;
}
export declare function QuestLoreTooltip({ lore, children }: QuestLoreTooltipProps): import("react").JSX.Element;
export {};
