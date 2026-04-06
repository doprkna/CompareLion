interface FeedbackFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}
export declare function FeedbackForm({ open, onClose, onSuccess }: FeedbackFormProps): import("react").JSX.Element;
export {};
