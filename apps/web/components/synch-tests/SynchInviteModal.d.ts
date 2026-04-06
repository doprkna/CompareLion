interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (userId: string) => void;
    loading?: boolean;
}
export declare function SynchInviteModal({ isOpen, onClose, onInvite, loading }: InviteModalProps): import("react").JSX.Element | null;
export {};
