import React from "react";
import { Sparkles } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="w-full">
      <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        Ask Vision AI (Optional)
      </label>

      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Examples:
• Describe this product.
• Extract all metadata.
• Find similar Nike shoes.
• Generate an SEO-friendly description."
        className="w-full rounded-2xl border border-white/10 bg-[#101118] px-4 py-4 text-sm text-white placeholder:text-gray-500 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
      />
    </div>
  );
};