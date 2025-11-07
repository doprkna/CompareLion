'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console
    logger.error('Page error', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="bg-destructive/10 rounded-full p-6">
            <AlertTriangle className="h-24 w-24 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-text">
            Something Went Wrong
          </h1>
          <p className="text-subtle text-lg">
            We encountered an unexpected error. Don't worry, it's not your fault!
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mt-4">
              <p className="text-destructive text-sm font-mono text-left">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center pt-6">
          <Button
            onClick={reset}
            className="bg-accent text-white hover:opacity-90"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/main'}
            variant="outline"
            className="border-border text-text hover:bg-card/50"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Support */}
        <div className="pt-8 border-t border-border">
          <p className="text-subtle text-sm">
            If this error persists, please{' '}
            <a href="/info/contact" className="text-accent hover:underline">
              contact support
            </a>
            {error.digest && (
              <span className="block mt-2 text-xs text-muted">
                Error ID: {error.digest}
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
