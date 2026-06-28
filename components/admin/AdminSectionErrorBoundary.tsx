"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { adminUi } from "./admin-ui";

type Props = {
  children: ReactNode;
  title: string;
};

type State = {
  hasError: boolean;
};

export default class AdminSectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[admin:section:${this.props.title}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className={`mt-8 ${adminUi.card}`}>
          <h2 className="text-lg font-semibold text-zinc-900">{this.props.title}</h2>
          <p className={`mt-2 ${adminUi.muted}`}>
            This section failed to render. Other dashboard areas still work.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className={`mt-4 ${adminUi.buttonSecondary}`}
          >
            Try again
          </button>
        </section>
      );
    }

    return this.props.children;
  }
}
