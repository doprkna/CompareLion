import { ReactNode } from "react";
interface ProseProps {
    children: ReactNode;
    className?: string;
    maxWidth?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
}
/**
 * A wrapper component for markdown content that applies neutral prose styling
 * with proper dark mode support. Uses prose-neutral to prevent inheritance
 * of random brand colors and ensures consistent typography.
 */
export declare function Prose({ children, className, maxWidth }: ProseProps): import("react").JSX.Element;
/**
 * A specialized prose component for changelog content
 */
export declare function ChangelogProse({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react").JSX.Element;
/**
 * A prose component for documentation content
 */
export declare function DocsProse({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react").JSX.Element;
/**
 * A prose component for blog post content
 */
export declare function BlogProse({ children, className }: {
    children: ReactNode;
    className?: string;
}): import("react").JSX.Element;
export {};
