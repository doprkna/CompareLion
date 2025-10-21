/**
 * Global Loading Spinner
 * 
 * Shows a full-screen loading spinner for longer operations
 * - Delayed appearance (200ms) to avoid flash for quick loads
 * - Semi-transparent backdrop
 * - Accessible and keyboard-friendly
 */

"use client";

import { useEffect, useState } from "react";

interface GlobalSpinnerProps {
  delay?: number;
  message?: string;
}

export function GlobalSpinner({ delay = 200, message }: GlobalSpinnerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-2xl flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400" />
          <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-blue-600/20 dark:border-blue-400/20" />
        </div>
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Simple inline spinner
 */
export function InlineSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-3",
    lg: "h-8 w-8 border-4",
  };

  return (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Button spinner (for loading buttons)
 */
export function ButtonSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Loading dots animation
 */
export function LoadingDots() {
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

