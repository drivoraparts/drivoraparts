"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export default class AdminErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[admin:error-boundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-[50vh] items-center justify-center px-6 py-16 text-white">
          <div className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur">
            <h2 className="text-xl font-semibold">Dashboard temporarily unavailable</h2>
            <p className="mt-3 text-sm text-zinc-400">
              We hit an unexpected error while loading admin data. The storefront and checkout
              are unaffected.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="mt-6 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-500"
            >
              Retry
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
