import React, { useRef, useState } from 'react';
import { Search, Upload, Image as ImageIcon, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  onImageSelect?: (file: File) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center py-12 px-4 text-center">
      
      {/* Icon Badge with Glow */}
      <div className="relative mb-6 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500" />
        <div className="relative w-20 h-20 rounded-full bg-zinc-900/90 border border-zinc-800 flex items-center justify-center shadow-2xl">
          <Sparkles className="w-9 h-9 text-indigo-400 animate-pulse" />
        </div>
      </div>

      {/* Main Heading & Subtitle */}
      <h3 className="text-xl sm:text-2xl font-semibold text-zinc-100 mb-2">
        Start with a Visual Search
      </h3>
      <p className="text-sm text-zinc-400 max-w-md mb-8 leading-relaxed">
        Type a natural language prompt, pick a popular term above, or upload an image to find matching products.
      </p>

      {/* Interactive Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          w-full p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-500/10 scale-102' 
            : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-zinc-700'
          }
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="p-3 bg-zinc-800/80 rounded-xl text-zinc-400">
          <Upload className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-zinc-300">
            Drag & drop an image here, or <span className="text-indigo-400 underline">browse</span>
          </p>
          <p className="text-[11px] text-zinc-500">
            Supports PNG, JPG, WEBP up to 10MB
          </p>
        </div>
      </div>

    </div>
  );
};