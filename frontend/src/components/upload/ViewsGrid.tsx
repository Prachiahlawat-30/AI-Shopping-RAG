import React from 'react';
import { ViewCard, ViewSlot } from './ViewCard';

interface ViewsGridProps {
  slots: ViewSlot[];
  onImageUpload: (slotId: string, file: File) => void;
  onImageRemove: (slotId: string) => void;
}

export const ViewsGrid: React.FC<ViewsGridProps> = ({
  slots,
  onImageUpload,
  onImageRemove,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-6">
      {slots.map((slot, index) => (
        <ViewCard
          key={slot.id}
          slot={slot}
          onImageUpload={onImageUpload}
          onImageRemove={onImageRemove}
        />
      ))}
    </div>
  );
};