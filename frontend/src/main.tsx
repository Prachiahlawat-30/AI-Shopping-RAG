import React from "react";
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

const clerkPubKey = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

function Root() {
  if (!clerkPubKey) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-200 flex flex-col items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#12141e] border border-zinc-800 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-white">Missing Clerk Publishable Key</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Please add <code className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-indigo-300 font-mono text-[11px]">VITE_CLERK_PUBLISHABLE_KEY</code> in your deployment Environment Variables (e.g. Vercel Dashboard $\rightarrow$ Settings $\rightarrow$ Environment Variables).
          </p>
          <div className="pt-2">
            <a
              href="https://dashboard.clerk.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
            >
              Open Clerk Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);