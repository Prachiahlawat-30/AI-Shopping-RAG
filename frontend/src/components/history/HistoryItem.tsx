import React from 'react';
import { Upload, Search, MessageSquare, Eye } from 'lucide-react';

export type HistoryType = 'upload' | 'search' | 'chat' | 'viewed';

export interface HistoryEvent {
  id: string;
  type: HistoryType;
  title: string;
  subtitle: string;
  time: string;
  image?: string;
  tags?: string[];
}

interface HistoryItemProps {
  item: HistoryEvent;
  isLast?: boolean;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({ item, isLast = false }) => {
  // Config for icon styles based on event type
  const iconConfig = {
    upload: {
      icon: <Upload className="w-4 h-4 text-indigo-400" />,
      bg: 'bg-indigo-950/80 border-indigo-500/30',
    },
    search: {
      icon: <Search className="w-4 h-4 text-purple-400" />,
      bg: 'bg-purple-950/80 border-purple-500/30',
    },
    chat: {
      icon: <MessageSquare className="w-4 h-4 text-amber-400" />,
      bg: 'bg-amber-950/80 border-amber-500/30',
    },
    viewed: {
      icon: <Eye className="w-4 h-4 text-emerald-400" />,
      bg: 'bg-emerald-950/80 border-emerald-500/30',
    },
  };

  const currentConfig = iconConfig[item.type];

  return (
    <div className="relative flex gap-6 items-start group">
      {/* Timeline Node & Line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${currentConfig.bg} z-10`}
        >
          {currentConfig.icon}
        </div>
        {!isLast && (
          <div className="w-[1px] bg-gray-800/80 flex-1 my-2 min-h-[40px]" />
        )}
      </div>

      {/* Event Card */}
      <div className="flex-1 bg-[#121217] border border-gray-800/80 rounded-2xl p-4 transition-all hover:border-gray-700/80">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Optional Thumbnail */}
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-12 h-12 rounded-xl object-cover border border-gray-800 shrink-0"
              />
            )}

            <div>
              <h4 className="text-white font-medium text-base leading-snug">
                {item.title}
              </h4>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                {item.subtitle}
              </p>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-[#1c1c24] border border-gray-800 text-indigo-300 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Time Stamp */}
          <span className="text-xs text-gray-500 font-medium shrink-0 pt-0.5">
            {item.time}
          </span>
        </div>
      </div>
    </div>
  );
};