interface LoreToneSelectorProps {
    currentTone: 'serious' | 'comedic' | 'poetic' | null;
    onToneChange: (tone: 'serious' | 'comedic' | 'poetic') => void;
    loading?: boolean;
}
export declare function LoreToneSelector({ currentTone, onToneChange, loading }: LoreToneSelectorProps): import("react").JSX.Element;
export {};
