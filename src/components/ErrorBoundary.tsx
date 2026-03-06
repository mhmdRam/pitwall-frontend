import React from "react";

type Props = { children: React.ReactNode };
type State = { error?: Error };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("UI crashed:", error);
    console.error("Component stack:", info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, color: "white", background: "black", minHeight: "100vh" }}>
          <h2 style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>Race page crashed</h2>
          <pre style={{ whiteSpace: "pre-wrap", opacity: 0.85 }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <pre style={{ whiteSpace: "pre-wrap", opacity: 0.65, marginTop: 12 }}>
            {String(this.state.error?.stack || "")}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
