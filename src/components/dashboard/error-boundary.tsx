"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      "Dashboard Error Boundary caught an error:",
      error,
      errorInfo
    );
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-center mb-4">
            <div className="text-red-500 text-2xl mr-3">⚠️</div>
            <h2 className="text-lg font-semibold text-red-800">
              Something went wrong
            </h2>
          </div>

          <p className="text-red-600 mb-4">
            We encountered an error while loading this dashboard component.
          </p>

          {process.env.NODE_ENV === "development" && this.state.error && (
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-red-700 hover:text-red-800">
                Show error details
              </summary>
              <pre className="mt-2 p-3 bg-red-50 rounded text-xs text-red-800 overflow-auto">
                {this.state.error.message}
                {"\n"}
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping dashboard components with error boundary
export function withDashboardErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <DashboardErrorBoundary fallback={fallback}>
        <Component {...props} />
      </DashboardErrorBoundary>
    );
  };
}
