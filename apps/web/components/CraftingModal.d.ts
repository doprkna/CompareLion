interface CraftingModalProps {
    show: boolean;
    onClose: () => void;
    onCraftComplete?: () => void;
}
export default function CraftingModal({ show, onClose, onCraftComplete }: CraftingModalProps): import("react").JSX.Element;
export {};
