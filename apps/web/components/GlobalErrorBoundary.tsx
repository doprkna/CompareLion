'use client';

import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('[ErrorBoundary] Caught error', { error, errorInfo });
    
    this.setState({
      error,
      errorInfo,
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (Sentry, etc.)
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // Placeholder for error tracking
    fetch('/api/errors/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          message: error.message,
          stack: error.stack,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => logger.error('Failed to log error to API', err));
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/main';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-center mb-4">
              Oops! Something Went Wrong
            </h1>

            {/* Message */}
            <p className="text-center text-purple-200 mb-6">
              We're sorry, but something unexpected happened. Our team has been notified and we're working on a fix.
            </p>

            {/* Error Details (Dev Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-black/30 rounded-lg overflow-auto max-h-48">
                <p className="text-sm font-mono text-red-300 mb-2">
                  {this.state.error.message}
                </p>
                <pre className="text-xs text-gray-400 overflow-x-auto">
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCcw size={18} />
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCcw size={18} />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Go Home
              </button>
            </div>

            {/* Support */}
            <div className="mt-6 text-center text-sm text-purple-300">
              <p>
                If this problem persists, please{' '}
                <a
                  href="/info/contact"
                  className="underline hover:text-white transition-colors"
                >
                  contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Smaller error boundary for feature sections
 */
export class FeatureErrorBoundary extends React.Component<
  { children: React.ReactNode; featureName?: string },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; featureName?: string }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(`[FeatureErrorBoundary:${this.props.featureName}]`, { error, errorInfo });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-text mb-1">
                {this.props.featureName || 'This feature'} encountered an error
              </h3>
              <p className="text-sm text-subtle">
                Something went wrong. Please try again.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <p className="text-xs text-red-400 mt-2 font-mono">
                  {this.state.error.message}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

