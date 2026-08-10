import React, { ChangeEvent } from 'react';
import { Plus, X } from 'lucide-react';

export interface ViewSlot {
  id: string;
  title: string;
  label: string;
  description: string;

  imagePreview?: string;
  file?: File;
}
interface ViewCardProps {
  slot: ViewSlot;
  onImageUpload: (slotId: string, file: File) => void;
  onImageRemove: (slotId: string) => void;
}

export const ViewCard: React.FC<ViewCardProps> = ({
  slot,
  onImageUpload,
  onImageRemove,
}) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onImageUpload(slot.id, e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* Upload Slot Box */}
      <div className="relative aspect-[4/5] rounded-xl bg-[#0D0E15] border border-white/10 hover:border-white/20 transition-all flex flex-col items-center justify-center overflow-hidden group">
        {slot.imagePreview ? (
          <>
            <img
              src={slot.imagePreview}
              alt={slot.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => onImageRemove(slot.id)}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-500 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
            />
            <Plus className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors mb-2" />
            <span className="text-xs font-medium text-gray-400 group-hover:text-white transition-colors">
              Add {slot.title}
            </span>
          </label>
        )}
      </div>

      {/* Bottom Labels */}
      <div className="text-center">
        <h4 className="text-xs font-semibold text-white">{slot.label}</h4>
        <p className="text-[11px] text-gray-500">{slot.description}</p>
      </div>
    </div>
  );
};