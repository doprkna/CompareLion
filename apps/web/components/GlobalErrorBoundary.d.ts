import React from 'react';
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}
export declare class GlobalErrorBoundary extends React.Component<{
    children: React.ReactNode;
}, ErrorBoundaryState> {
    constructor(props: {
        children: React.ReactNode;
    });
    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState>;
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
    logErrorToService(error: Error, errorInfo: React.ErrorInfo): void;
    handleReset: () => void;
    handleReload: () => void;
    handleGoHome: () => void;
    render(): string | number | bigint | boolean | React.JSX.Element | Iterable<React.ReactNode> | Promise<React.AwaitedReactNode> | null | undefined;
}
/**
 * Smaller error boundary for feature sections
 */
export declare class FeatureErrorBoundary extends React.Component<{
    children: React.ReactNode;
    featureName?: string;
}, ErrorBoundaryState> {
    constructor(props: {
        children: React.ReactNode;
        featureName?: string;
    });
    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState>;
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void;
    handleRetry: () => void;
    render(): string | number | bigint | boolean | React.JSX.Element | Iterable<React.ReactNode> | Promise<React.AwaitedReactNode> | null | undefined;
}
export {};
