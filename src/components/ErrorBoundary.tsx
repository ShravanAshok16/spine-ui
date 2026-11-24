import { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from "@sentry/react";

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };
  public static getDerivedStateFromError(_: Error): State { return { hasError: true }; }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error("Uncaught error:", error, errorInfo); Sentry.captureException(error, { extra: { componentStack: errorInfo.componentStack } });}
  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg text-text p-6">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">Oops! Something went wrong.</h1>
            <p className="text-text-muted mb-6">The app encountered an unexpected error.</p>
            <button onClick={() => window.location.reload()} className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover">Refresh Page</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}