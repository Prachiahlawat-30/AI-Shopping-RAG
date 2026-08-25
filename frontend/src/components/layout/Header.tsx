import { Link, useLocation } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { UserButton } from "@clerk/clerk-react";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Visual Search", path: "/visual-search" },
  { label: "Upload", path: "/upload" },
  { label: "History", path: "/history" },
  { label: "AI Chat", path: "/chat" },
];

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08080a]/80 backdrop-blur-md border-b border-gray-900/80">
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-white text-lg tracking-wide">
            AI Shopping RAG
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-[#121217] p-1.5 rounded-xl border border-gray-800/60">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 text-sm transition-all rounded-lg font-medium ${
                  isActive
                    ? "text-white bg-[#22222b] shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>

          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />



          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 text-gray-400 hover:text-white md:hidden transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1e1e28] bg-[#0d0d12] px-6 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#23232b] text-white font-semibold"
                    : "text-zinc-400 hover:bg-[#16161f] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}