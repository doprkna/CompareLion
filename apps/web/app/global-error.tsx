"use client";

/**
 * Global Error Handler
 * 
 * Catches errors that bubble up from the entire application
 * This is the last resort error boundary
 */

import { logger } from '@/lib/logger';

export default function GlobalError({ error }: { error: Error }) {
  logger.error("GlobalError", error);
  
  const isDev = process.env.NODE_ENV !== "production";
  
  return (
    <html>
      <body className="p-8 text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-200 min-h-screen flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-red-900/20 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
            <p className="text-lg mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            {isDev && (
              <div className="mt-4">
                <h2 className="font-semibold mb-2">Error Details (Development Only):</h2>
                <pre className="text-xs bg-red-100 dark:bg-red-900/40 p-4 rounded overflow-auto max-h-64">
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </div>
            )}
            
            <div className="mt-6 space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-6 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

