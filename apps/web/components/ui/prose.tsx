import { cn } from "@/lib/utils";
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
export function Prose({ 
  children, 
  className,
  maxWidth = "none" 
}: ProseProps) {
  return (
    <div 
      className={cn(
        "prose prose-slate dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-li:text-gray-700 dark:prose-li:text-gray-300",
        `max-w-${maxWidth}`,
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * A specialized prose component for changelog content
 */
export function ChangelogProse({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Prose className={cn("mt-2 ml-4", className)}>
      {children}
    </Prose>
  );
}

/**
 * A prose component for documentation content
 */
export function DocsProse({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Prose maxWidth="4xl" className={cn("mx-auto", className)}>
      {children}
    </Prose>
  );
}

/**
 * A prose component for blog post content
 */
export function BlogProse({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Prose maxWidth="3xl" className={cn("mx-auto", className)}>
      {children}
    </Prose>
  );
}
