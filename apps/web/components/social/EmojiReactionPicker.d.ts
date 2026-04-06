interface EmojiReactionPickerProps {
    targetType: 'reflection' | 'comment' | 'message' | 'user_reflection';
    targetId: string;
}
export declare function EmojiReactionPicker({ targetType, targetId }: EmojiReactionPickerProps): import("react").JSX.Element;
export {};
