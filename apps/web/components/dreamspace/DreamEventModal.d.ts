interface DreamEventModalProps {
    open: boolean;
    onClose: () => void;
    dream: {
        id: string;
        dreamId: string;
        title: string;
        description: string;
        flavorTone: string;
        effect: any;
    };
    onResolved?: () => void;
}
export declare function DreamEventModal({ open, onClose, dream, onResolved }: DreamEventModalProps): import("react").JSX.Element;
export {};
