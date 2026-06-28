"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { adminUi } from "./admin-ui";

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
        <main className="flex min-h-[50vh] items-center justify-center px-6 py-16">
          <div className={`max-w-lg text-center ${adminUi.card}`}>
            <h2 className="text-xl font-semibold text-zinc-900">
              Admin page error
            </h2>
            <p className={`mt-3 ${adminUi.muted}`}>
              Something went wrong while loading this admin page. Sidebar navigation
              should still work — try another section or reload.
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className={`mt-6 ${adminUi.buttonPrimary}`}
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
