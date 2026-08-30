import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { Sparkles, Eye, Zap, ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-transparent blur-[140px] pointer-events-none -z-10" />

      {/* Top Header / Back Link */}
      <div className="w-full max-w-5xl mb-8 flex items-center justify-between z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-base tracking-tight">AI Shopping RAG</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Side: Value proposition (Hidden on small screens) */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold w-fit">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Multimodal AI Search & Retrieval</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Sign in to your{" "}
            <span className="text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-300 bg-clip-text">
              AI Shopping Hub
            </span>
          </h1>

          <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
            Access visual product perception, hybrid dense-sparse vector search, two-stage re-ranking, and grounded conversational catalog assistance.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { icon: Eye, title: "Vision Perception", desc: "Extract brand, colors, and specs from photos" },
              { icon: Zap, title: "Instant Hybrid Search", desc: "Sub-150ms dense vector retrieval" },
              { icon: ShieldCheck, title: "Secure Multi-Tenancy", desc: "Isolated user catalog and history" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
                  <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Enhanced High-Contrast Clerk SignIn Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[440px] rounded-3xl p-1 bg-gradient-to-b from-indigo-500/30 via-zinc-800 to-zinc-900/80 shadow-2xl shadow-black/80">
            <div className="bg-[#0f111a] rounded-[22px] p-2 sm:p-4">
              <SignIn
                routing="path"
                path="/login"
                signUpUrl="/register"
                fallbackRedirectUrl="/"
                appearance={{
                  baseTheme: dark,
                  variables: {
                    colorPrimary: "#6366f1",
                    colorBackground: "#0f111a",
                    colorText: "#ffffff",
                    colorTextSecondary: "#94a3b8",
                    colorInputBackground: "#181b28",
                    colorInputText: "#ffffff",
                    colorNeutral: "#ffffff",
                    borderRadius: "0.75rem",
                  },
                  elements: {
                    card: "bg-transparent shadow-none border-none p-2 sm:p-4",
                    headerTitle: "text-white font-extrabold text-2xl tracking-tight text-center",
                    headerSubtitle: "text-zinc-300 text-sm text-center mt-1 font-medium",
                    socialButtonsBlockButton:
                      "bg-zinc-800/90 hover:bg-zinc-700 text-white font-semibold border border-zinc-700 hover:border-zinc-500 transition-all rounded-xl py-2.5",
                    socialButtonsBlockButtonText: "text-white font-medium text-sm",
                    dividerLine: "bg-zinc-700",
                    dividerText: "text-zinc-300 text-xs uppercase tracking-wider font-bold",
                    formFieldLabel: "text-zinc-200 font-semibold text-xs mb-1.5 block",
                    formFieldInput:
                      "bg-[#181b28] border border-zinc-600 text-white placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 rounded-xl px-3.5 py-2.5 text-sm",
                    formButtonPrimary:
                      "bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all py-3 text-sm",
                    footerActionText: "text-zinc-300 text-xs font-medium",
                    footerActionLink: "text-indigo-400 hover:text-indigo-300 font-bold transition-colors underline",
                    identityPreviewText: "text-white font-semibold",
                    identityPreviewEditButton: "text-indigo-400 hover:text-indigo-300 font-bold",
                  },
                }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}