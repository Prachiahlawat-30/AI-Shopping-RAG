import React, { useRef, useState } from "react";
import { ImagePlus, UploadCloud, AlertCircle } from "lucide-react";

interface DropzoneProps {
  onFilesSelected: (files: FileList) => void;
}

const MAX_FILES = 4;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const Dropzone: React.FC<DropzoneProps> = ({
  onFilesSelected,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList) => {
    setError("");

    if (files.length > MAX_FILES) {
      setError(`You can upload a maximum of ${MAX_FILES} images.`);
      return;
    }

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError(`${file.name} is not a supported image.`);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} exceeds the 10 MB limit.`);
        return;
      }
    }

    onFilesSelected(files);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files.length > 0) {
      validateFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files?.length) {
      validateFiles(e.target.files);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full rounded-3xl border-2 border-dashed p-10 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group ${
          isDragging
            ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
            : "border-gray-800/80 bg-[#111116] hover:border-indigo-500/50 hover:bg-[#14141c]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
          onChange={handleFileInput}
        />

        {/* Glow */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-teal-500/20 blur-xl transition-all duration-300 group-hover:bg-indigo-500/30" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-500/30 bg-[#1a1a24] text-teal-400 shadow-lg transition-all group-hover:border-indigo-500/50 group-hover:text-indigo-400">
            {isDragging ? (
              <UploadCloud className="h-8 w-8 animate-bounce" />
            ) : (
              <ImagePlus className="h-8 w-8" />
            )}
          </div>
        </div>

        <h3 className="mb-2 text-center text-xl font-bold text-white transition-colors group-hover:text-indigo-200">
          Drop images here or click to browse
        </h3>

        <p className="mb-6 max-w-sm text-center text-sm text-gray-400">
          Upload up to <strong>4 product images</strong> for the best AI
          analysis.
        </p>

        <div className="z-10 flex flex-wrap justify-center gap-2">
          {["PNG", "JPG", "JPEG", "WEBP"].map((format) => (
            <span
              key={format}
              className="rounded-lg border border-gray-800 bg-[#1a1a24] px-3 py-1 text-xs font-semibold tracking-wider text-purple-300/90"
            >
              {format}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
};