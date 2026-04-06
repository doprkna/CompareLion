import React, { Component, ErrorInfo, ReactNode } from 'react';
interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}
export declare class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props);
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    handleRetry: () => void;
    render(): string | number | bigint | boolean | React.JSX.Element | Iterable<React.ReactNode> | Promise<React.AwaitedReactNode> | null | undefined;
}
export declare function withErrorBoundary<P extends object>(Component: React.ComponentType<P>, fallback?: ReactNode, onError?: (error: Error, errorInfo: ErrorInfo) => void): {
    (props: P): React.JSX.Element;
    displayName: string;
};
export declare function useErrorHandler(): (error: Error, context?: Record<string, unknown>) => void;
export {};
