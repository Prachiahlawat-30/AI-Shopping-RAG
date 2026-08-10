import React from "react";
import { Sparkles, Check } from "lucide-react";

interface Props {
  score: number;
}

export default function SimilarityBadge({ score }: Props) {
  // Normalize score if it's passed as 0-1 or 0-100
  const percent = Math.round(score <= 1 ? score * 100 : score);

  // Dynamic style resolution based on match quality
  const getBadgeStyles = () => {
    if (percent >= 90) {
      return {
        bg: "bg-emerald-950/80 border-emerald-500/40 text-emerald-300",
        iconColor: "text-emerald-400",
        glow: "shadow-emerald-500/20",
        showPulse: true,
      };
    }
    if (percent >= 75) {
      return {
        bg: "bg-indigo-950/80 border-indigo-500/40 text-indigo-300",
        iconColor: "text-indigo-400",
        glow: "shadow-indigo-500/20",
        showPulse: false,
      };
    }
    return {
      bg: "bg-zinc-900/80 border-zinc-700/60 text-zinc-300",
      iconColor: "text-amber-400",
      glow: "shadow-black/40",
      showPulse: false,
    };
  };

  const style = getBadgeStyles();

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold
        border backdrop-blur-md shadow-lg transition-all duration-300 ${style.bg} ${style.glow}
      `}
    >
      <Sparkles className={`h-3.5 w-3.5 ${style.iconColor} ${style.showPulse ? "animate-pulse" : ""}`} />
      <span>{percent}% Match</span>
    </div>
  );
}