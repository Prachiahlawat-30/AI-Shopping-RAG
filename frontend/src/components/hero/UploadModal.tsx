import React, { useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, X, FileImage, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (file: File) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onImageSelected,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Validate file type & size
  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // Max size: 10MB
    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setErrorMessage('File size exceeds the 10MB limit.');
      return;
    }

    onImageSelected(file);
    onClose();
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Standard File Input Change Handler
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
      <div 
        className="bg-[#0F1018] border border-white/10 rounded-2xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FileImage className="w-5 h-5 text-purple-400" />
            Upload Product Image
          </h3>
          <p className="text-xs text-gray-400">
            Drag and drop or browse an image to perform visual semantic search.
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer group ${
            isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/20 hover:border-purple-500/50 bg-white/[0.02] hover:bg-purple-500/[0.02]'
          }`}
        >
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />

          <div className="w-12 h-12 rounded-full bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6" />
          </div>

          <p className="text-sm font-medium text-white mb-1 text-center">
            {isDragging ? 'Drop image here' : 'Click to upload or drag & drop'}
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, or WEBP (max 10MB)</p>
        </div>

        {/* Error Message Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2.5 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};