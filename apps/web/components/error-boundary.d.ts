/**
 * Error Boundary Component (v0.14.0)
 * Catches React errors and reports to Sentry + error API.
 * Uses only lazy client Sentry import; no @sentry/node or index.server.js from this file.
 */
import React from 'react';
interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}
interface State {
    hasError: boolean;
    error?: Error;
}
export declare class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props);
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): Promise<void>;
    render(): string | number | bigint | boolean | React.JSX.Element | Iterable<React.ReactNode> | Promise<React.AwaitedReactNode> | null | undefined;
}
export {};
