interface PostcardSendModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSend: (receiverId: string, message: string) => Promise<void>;
    receiverId?: string;
    receiverName?: string;
    loading?: boolean;
}
export declare function PostcardSendModal({ isOpen, onClose, onSend, receiverId, receiverName, loading, }: PostcardSendModalProps): import("react").JSX.Element | null;
export {};
