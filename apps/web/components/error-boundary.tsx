/**
 * Error Boundary Component (v0.14.0)
 * Catches React errors and reports to Sentry + error API
 */

'use client';

import React from 'react';
import { captureError } from '@/lib/sentry/client-config';
import { getRuntimeInfo } from '@/lib/build-info';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { logger } from '@/lib/logger';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('[ErrorBoundary] Caught error', { error, errorInfo });

    // Capture in Sentry
    captureError(error, {
      componentStack: errorInfo.componentStack,
      page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    });

    // Report to our error API
    try {
      const buildInfo = getRuntimeInfo();
      const sessionId = sessionStorage.getItem('analytics_session_id') || 'unknown';

      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorType: error.name || 'UnknownError',
          message: error.message,
          stack: error.stack,
          page: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
          userAgent: navigator.userAgent,
          sessionId,
          severity: 'error',
          metadata: {
            componentStack: errorInfo.componentStack?.slice(0, 500),
            buildId: buildInfo.commit,
          },
        }),
      });
    } catch (reportError) {
      logger.error('[ErrorBoundary] Failed to report error', reportError);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-bg">
          <div className="max-w-md p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-text-secondary mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
                className="w-full"
              >
                Reload Page
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.href = '/';
                }}
                className="w-full"
              >
                Go Home
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-text-secondary">
                  Error Details (dev only)
                </summary>
                <pre className="mt-2 p-4 bg-bg-secondary rounded text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

