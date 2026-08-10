import React from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";

interface AnalyzeButtonProps {
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({
  loading,
  disabled,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Analyze with Vision AI
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
};