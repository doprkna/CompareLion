interface ForkResultToastProps {
    show: boolean;
    summary: string;
    choice: 'A' | 'B';
    onClose: () => void;
}
export declare function ForkResultToast({ show, summary, choice, onClose }: ForkResultToastProps): import("react").JSX.Element | null;
export {};
