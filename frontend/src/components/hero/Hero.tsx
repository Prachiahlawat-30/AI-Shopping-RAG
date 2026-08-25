import React from "react";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Zap,
  Search,
  UploadCloud,
  MessageSquare,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  GitCompare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Header } from "../layout/Header";

export default function HeroSection() {
  const navigate = useNavigate();

  const stats = [
    { value: "<150ms", label: "Search Latency", desc: "Qdrant HNSW vector index" },
    { value: "98.4%", label: "Vision Accuracy", desc: "GPT-4o Multimodal Analysis" },
    { value: "2-Stage", label: "Neural Re-ranker", desc: "RRF + Cross-Attribute Scoring" },
    { value: "100%", label: "Multi-Tenant", desc: "User payload vector isolation" },
  ];

  const features = [
    {
      icon: UploadCloud,
      title: "Multimodal Vision Fusion",
      description:
        "Upload multi-angle product photos. Vision AI extracts brand, specs, colors, and materials, merging them into a unified catalog record.",
      color: "from-blue-500/20 to-indigo-500/20",
      border: "hover:border-blue-500/50",
      iconColor: "text-blue-400",
    },
    {
      icon: Search,
      title: "Hybrid Dense + Sparse Search",
      description:
        "Combines 1536-dim vector embeddings with lexical keyword matching via Reciprocal Rank Fusion (RRF) for unmatched search accuracy.",
      color: "from-purple-500/20 to-pink-500/20",
      border: "hover:border-purple-500/50",
      iconColor: "text-purple-400",
    },
    {
      icon: GitCompare,
      title: "2-Stage Relevance Re-Ranking",
      description:
        "Evaluates token matches across brand, category, and review priors to eliminate false positives before rendering results.",
      color: "from-emerald-500/20 to-teal-500/20",
      border: "hover:border-emerald-500/50",
      iconColor: "text-emerald-400",
    },
    {
      icon: MessageSquare,
      title: "Grounded Conversational RAG",
      description:
        "Ask free-form questions in natural language. Answers are strictly grounded in your product catalog with interactive citation cards.",
      color: "from-amber-500/20 to-orange-500/20",
      border: "hover:border-amber-500/50",
      iconColor: "text-amber-400",
    },
  ];

  const pipelineSteps = [
    { title: "Image Upload & Preprocessing", subtitle: "Multi-angle photo capture", active: true },
    { title: "GPT-4o Vision Perception", subtitle: "Extract brand, color, materials, specs", active: true },
    { title: "Deterministic Metadata Fusion", subtitle: "Canonical schema synthesis", active: true },
    { title: "Vector Embedding Generation", subtitle: "1536-dim dense vector embedding", active: true },
    { title: "Qdrant Hybrid Retrieval", subtitle: "Dense similarity + SQL keyword match", active: true },
    { title: "Two-Stage Relevance Re-ranking", subtitle: "Lexical alignment + quality priors", active: true },
    { title: "Grounded RAG Generation", subtitle: "Catalog citations + follow-up suggestions", active: true, pulse: true },
  ];

  return (
    <div className="min-h-screen bg-[#06070a] text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Ambient Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent blur-[120px] pointer-events-none -z-10" />

      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading & CTA */}
          <div className="space-y-8 lg:col-span-7">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-lg shadow-indigo-500/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Next-Gen Multimodal Product RAG Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
              Explore Products with{" "}
              <span className="text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-teal-300 bg-clip-text">
                Vision AI
              </span>{" "}
              & Semantic RAG
            </h1>

            {/* Subtext */}
            <p className="max-w-2xl text-base sm:text-lg text-zinc-400 leading-relaxed">
              Upload product photos to extract fine-grained attributes, search by image or text with 
              <strong className="text-zinc-200"> hybrid vector retrieval</strong>, and converse with an AI shopping assistant grounded directly in your catalog.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate("/visual-search")}
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all duration-200"
              >
                Try Visual Search
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate("/upload")}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm hover:border-zinc-700 transition-all duration-200"
              >
                <UploadCloud className="w-4 h-4 text-indigo-400" />
                Upload Catalog Items
              </button>

              <button
                onClick={() => navigate("/chat")}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-800/70 text-zinc-300 font-medium text-sm transition-all"
              >
                <MessageSquare className="w-4 h-4 text-purple-400" />
                AI Assistant
              </button>
            </div>

            {/* Stats Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-zinc-800/80">
              {stats.map((s, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{s.value}</div>
                  <div className="text-xs font-semibold text-indigo-400">{s.label}</div>
                  <div className="text-[11px] text-zinc-500 truncate">{s.desc}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column: Live Interactive Architecture Pipeline */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-teal-500/10 blur-2xl -z-10" />

            <div className="rounded-3xl border border-zinc-800/90 bg-[#0c0e15]/95 p-6 backdrop-blur-2xl shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Live RAG Pipeline Execution
                  </span>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                  v2.0 Active
                </span>
              </div>

              {/* Pipeline Steps List */}
              <div className="space-y-2.5">
                {pipelineSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                      step.pulse
                        ? "border-purple-500/50 bg-purple-950/25 shadow-lg shadow-purple-500/10"
                        : "border-zinc-800/70 bg-[#12141e]/70 hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-zinc-100 truncate">{step.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{step.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tech Stack Badges */}
              <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap gap-2 items-center justify-center">
                {["FastAPI", "Qdrant", "OpenAI", "PostgreSQL", "Clerk", "React 18"].map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>

            </div>
          </div>

        </div>

        {/* Feature Cards Grid */}
        <section className="mt-28 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Engineered for Production
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              End-to-End Multimodal Intelligence
            </h2>
            <p className="text-sm text-zinc-400">
              An enterprise-grade shopping pipeline with multi-tenant data isolation, fast vector search, and strict LLM catalog grounding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-3xl border border-zinc-800/80 bg-[#0d0f18]/60 backdrop-blur-xl ${feat.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between group`}
                >
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} border border-white/10 flex items-center justify-center ${feat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}