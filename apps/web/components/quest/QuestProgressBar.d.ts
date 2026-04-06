interface QuestProgressBarProps {
    progress: number;
    max: number;
    requirementType: 'xp' | 'reflections' | 'gold' | 'missions' | 'custom';
}
export declare function QuestProgressBar({ progress, max, requirementType }: QuestProgressBarProps): import("react").JSX.Element;
export {};
