import React from "react";
import { PromptInput } from "./PromptInput";
import { AnalyzeButton } from "./AnalyzeButton";

interface UploadToolbarProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  loading: boolean;
  disabled: boolean;
  onAnalyze: () => void;
}

export const UploadToolbar: React.FC<UploadToolbarProps> = ({
  prompt,
  onPromptChange,
  loading,
  disabled,
  onAnalyze,
}) => {
  return (
    <div className="mt-10 w-full rounded-3xl border border-white/10 bg-[#111116] p-6">
      <PromptInput
        value={prompt}
        onChange={onPromptChange}
      />

      <div className="mt-6 flex justify-end">
        <AnalyzeButton
          loading={loading}
          disabled={disabled}
          onClick={onAnalyze}
        />
      </div>
    </div>
  );
};