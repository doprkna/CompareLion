/**
 * Modal Atom
 * v0.42.4 - C4 Step 5: Interaction atoms implementation
 * Overlay dialog for focused interactions with backdrop, focus trap, and scroll lock
 */
import React from 'react';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: ModalSize;
    closeOnBackdrop?: boolean;
    closeOnEsc?: boolean;
    header?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}
export declare function Modal({ open, onClose, children, title, size, closeOnBackdrop, closeOnEsc, header, footer, className, }: ModalProps): any;
