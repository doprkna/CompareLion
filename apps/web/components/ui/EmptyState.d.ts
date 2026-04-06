import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
interface EmptyStateProps {
    icon?: LucideIcon;
    emoji?: string;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}
export declare function EmptyState({ icon: Icon, emoji, title, description, action, className }: EmptyStateProps): import("react").JSX.Element;
export default EmptyState;
