interface ModerationActionsProps {
    targetType: string;
    targetId: string;
    authorId: string;
    onActionComplete: () => void;
}
export declare function ModerationActions({ targetType, targetId, authorId, onActionComplete }: ModerationActionsProps): import("react").JSX.Element;
export {};
