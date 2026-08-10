import React from "react";
import { Sparkles, TrendingUp, Search } from "lucide-react";
import { motion } from "framer-motion";

interface SuggestionPillsProps {
  suggestions?: string[];
  onSelect: (value: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  "Nike Running Shoes",
  "Wireless Headphones",
  "Gaming Laptop",
  "Smart Watch",
  "Protein Powder",
  "Bluetooth Speaker",
  "Apple iPhone",
  "Samsung Galaxy",
];

export default function SuggestionPills({
  suggestions = DEFAULT_SUGGESTIONS,
  onSelect,
}: SuggestionPillsProps) {
  if (!suggestions.length) return null;

  return (
    <div className="w-full space-y-3.5 my-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-indigo-400" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Popular Searches
        </h3>
      </div>

      {/* Pills Container */}
      <div className="flex flex-wrap gap-2.5">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={`${suggestion}-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.04,
              duration: 0.2,
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(suggestion)}
              className="
                group flex items-center gap-1.5
                rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium
                bg-zinc-900/80 text-zinc-300 border border-zinc-800/80
                hover:border-indigo-500/50 hover:bg-zinc-800/90 hover:text-white
                transition-all duration-200
                active:scale-95 cursor-pointer shadow-sm
              "
            >
              <Search className="w-3 h-3 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
              <span>{suggestion}</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}