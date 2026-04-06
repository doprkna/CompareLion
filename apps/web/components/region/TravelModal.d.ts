import { Region } from '@parel/core/hooks/useRegions';
interface TravelModalProps {
    region: Region | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    traveling?: boolean;
}
export declare function TravelModal({ region, isOpen, onClose, onConfirm, traveling, }: TravelModalProps): import("react").JSX.Element | null;
export {};
