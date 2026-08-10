import React, { useRef } from 'react';
import { Search, Camera, X, Image as ImageIcon } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onImageSelect?: (file: File) => void; // Optional handler for direct visual upload
}

export const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange,
  onImageSelect 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      onImageSelect(file);
    }
  };

  return (
    <div className="w-full relative max-w-2xl mx-auto mb-8 group">
      {/* Subtle Ambient Glow Effect on Focus/Hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition duration-300 pointer-events-none" />

      <div className="relative flex items-center bg-[#121217] border border-zinc-800/80 hover:border-zinc-700/80 focus-within:border-indigo-500/80 rounded-2xl shadow-xl transition-all">
        
        {/* Left Search Icon */}
        <Search className="absolute left-4 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-400 transition-colors" />

        {/* Input Field */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask naturally or upload an image..."
          className="w-full bg-transparent py-4 pl-12 pr-28 text-zinc-100 placeholder-zinc-500 text-sm sm:text-base focus:outline-none"
        />

        {/* Hidden File Input for Image Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Right Actions Container */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {/* Clear Button (Visible only when text is typed) */}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-lg transition-all"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Visual Search / Camera Action Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl transition-all active:scale-95 cursor-pointer"
            title="Search with an image"
          >
            <Camera className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Visual</span>
          </button>
        </div>
      </div>
    </div>
  );
};