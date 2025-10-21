/**
 * Error Placeholder Component
 * 
 * Displays user-friendly error messages with optional retry functionality
 * Shows additional debug info in development mode
 */

interface ErrorPlaceholderProps {
  title: string;
  message?: string;
  retry?: () => void;
}

export function ErrorPlaceholder({ title, message, retry }: ErrorPlaceholderProps) {
  const isDev = process.env.NODE_ENV !== "production";
  
  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-destructive">
      <p className="font-semibold">{title}</p>
      {message && <p className="text-sm mt-1">{message}</p>}
      {isDev && (
        <p className="text-xs text-muted-foreground mt-2">
          Check console for stack trace.
        </p>
      )}
      {retry && (
        <button
          onClick={retry}
          className="mt-3 rounded bg-destructive px-3 py-1.5 text-sm text-white hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Simple error message without retry
 */
export function ErrorMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4">
      <p className="text-red-800 dark:text-red-200 text-sm">{children}</p>
    </div>
  );
}

/**
 * Loading skeleton placeholder
 */
export function LoadingPlaceholder({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
      <div className="flex items-center space-x-3">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 dark:border-gray-100"></div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

