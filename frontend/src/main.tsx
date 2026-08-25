import React, { Component, ErrorInfo, ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/clerk-react";

import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Sanitize publishable key: trim spaces, newlines, and surrounding quotes
const rawClerkKey = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkPubKey = typeof rawClerkKey === "string"
  ? rawClerkKey.trim().replace(/^["']|["']$/g, "").replace(/[\r\n\t ]+/g, "")
  : "";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message || "An unexpected error occurred." };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08080a] text-zinc-200 flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#12141e] border border-zinc-800 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto text-xl font-bold">
              !
            </div>
            <h2 className="text-xl font-bold text-white">Authentication Configuration Alert</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {this.state.errorMessage}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
              >
                Reload Application
              </button>
              <a
                href="https://dashboard.clerk.com"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-all"
              >
                Open Clerk Dashboard (API Keys)
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Root() {
  const isValidClerkKey =
    clerkPubKey && (clerkPubKey.startsWith("pk_test_") || clerkPubKey.startsWith("pk_live_"));

  if (!isValidClerkKey) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-200 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#12141e] border border-zinc-800 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-white">Invalid Clerk Publishable Key</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Your <code className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-indigo-300 font-mono text-[11px]">VITE_CLERK_PUBLISHABLE_KEY</code> must start with <code className="font-mono text-white">pk_test_</code> or <code className="font-mono text-white">pk_live_</code> without leading or trailing spaces.
          </p>
          <div className="pt-2">
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
            >
              Get Key from Clerk Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={clerkPubKey}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);