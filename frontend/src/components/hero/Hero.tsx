import React from "react";
import {
  Sparkles,
  Check,
  ArrowRight,
  Menu,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  // Navigation Items
  const navItems = [
    { label: "Home", path: "/" },
    { label: "Visual Search", path: "/visual-search" },
    { label: "Upload", path: "/upload" },
    { label: "History", path: "/history" },
    { label: "AI Chat", path: "/chat" },
  ];

  // Stats
  const stats = [
    { value: "2.4K+", label: "Products Indexed" },
    { value: "98.2%", label: "Vision Accuracy" },
    { value: "<200ms", label: "Search Latency" },
  ];

  // Pipeline
  const pipelineSteps = [
    {
      title: "GPT-5 Vision",
      subtitle: "Visual understanding",
      status: "completed",
    },
    {
      title: "Metadata Fusion",
      subtitle: "Attribute extraction",
      status: "completed",
    },
    {
      title: "Product Summary",
      subtitle: "AI description gen",
      status: "completed",
    },
    {
      title: "Embedding Gen",
      subtitle: "OpenAI embeddings",
      status: "completed",
    },
    {
      title: "Qdrant Search",
      subtitle: "Semantic retrieval",
      status: "completed",
    },
    {
      title: "AI Response",
      subtitle: "RAG-powered answer",
      status: "active",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen bg-[#08080C] text-white font-sans selection:bg-purple-500 selection:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-5 border-b border-white/5 bg-[#08080C]/80 backdrop-blur-md">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-teal-400 shadow-lg shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          <span className="text-lg font-bold tracking-tight">
            AI Shopping RAG
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `px-5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live
          </div>

          <div className="flex items-center justify-center w-9 h-9 text-sm font-semibold bg-indigo-600 rounded-full shadow-md">
            A
          </div>

          <button className="text-gray-400 transition-colors hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="grid max-w-7xl grid-cols-1 gap-12 px-8 pt-12 pb-20 mx-auto lg:grid-cols-12 items-center">
        {/* Left */}
        <div className="space-y-8 lg:col-span-7">
          <h1 className="text-6xl font-extrabold leading-[1.05] tracking-tight sm:text-7xl">
            Search Products
            <br />
            with{" "}
            <span className="text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-teal-300 bg-clip-text">
              AI Vision
            </span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-gray-400">
            Upload multiple product images. Let AI understand, analyze, and
            retrieve visually similar items using semantic search powered by
            GPT-5 and Qdrant.
          </p>

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => navigate("/upload")}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 font-medium shadow-lg shadow-indigo-500/25 transition hover:opacity-95"
            >
              Upload Images
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate("/visual-search")}
              className="px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 font-medium text-gray-200 transition hover:bg-white/10"
            >
              Try Visual Search
            </button>
          </div>

          <div className="grid max-w-lg grid-cols-3 gap-6 pt-6 border-t border-white/5">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="relative lg:col-span-5">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-purple-500/10 via-teal-500/5 to-transparent blur-2xl"></div>

          <div className="relative rounded-2xl border border-white/10 bg-[#0C0E15]/90 p-6 backdrop-blur-xl shadow-2xl">
            <div className="relative space-y-3">
              <div className="absolute left-[39px] top-6 bottom-6 w-px bg-white/10"></div>

              {pipelineSteps.map((step) => {
                const StepIcon = step.icon;
                const completed = step.status === "completed";

                return (
                  <div
                    key={step.title}
                    className={`relative flex items-center justify-between rounded-xl border p-3.5 ${
                      completed
                        ? "border-teal-500/20 bg-[#111420]"
                        : "border-purple-500/40 bg-purple-950/20"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          completed
                            ? "border border-teal-500/30 bg-teal-950/50 text-teal-400"
                            : "border border-purple-500/40 bg-purple-900/40 text-purple-300"
                        }`}
                      >
                        {StepIcon ? (
                          <StepIcon className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-white">
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {step.subtitle}
                        </div>
                      </div>
                    </div>

                    {completed ? (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border border-teal-500/40 bg-teal-500/20">
                        <Check className="w-3 h-3 text-teal-400" />
                      </div>
                    ) : (
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}