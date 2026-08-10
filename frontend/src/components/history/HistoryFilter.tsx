import React from 'react';
import { Upload, Search, MessageSquare } from 'lucide-react';
import { ActivityType } from '@/types/history';

interface FilterOption {
  type: ActivityType;
  label: string;
  icon: React.ReactNode;
  activeClasses: string;
}

interface HistoryFilterProps {
  selected: ActivityType[];
  onChange: (selected: ActivityType[]) => void;
}

const OPTIONS: FilterOption[] = [
  {
    type: 'upload',
    label: 'Upload',
    icon: <Upload className="w-3.5 h-3.5" />,
    activeClasses: 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300',
  },
  {
    type: 'search',
    label: 'Search',
    icon: <Search className="w-3.5 h-3.5" />,
    activeClasses: 'bg-purple-950/60 border-purple-500/50 text-purple-300',
  },
  {
    type: 'chat',
    label: 'AI Chat',
    icon: <MessageSquare className="w-3.5 h-3.5" />,
    activeClasses: 'bg-amber-950/60 border-amber-500/50 text-amber-300',
  },
];

const inactiveClasses =
  'bg-[#121217] border-gray-800 text-gray-500 hover:text-gray-300 hover:border-gray-700';

export const HistoryFilter: React.FC<HistoryFilterProps> = ({ selected, onChange }) => {
  const toggle = (type: ActivityType) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {OPTIONS.map((opt) => {
        const isActive = selected.includes(opt.type);
        return (
          <button
            key={opt.type}
            onClick={() => toggle(opt.type)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              isActive ? opt.activeClasses : inactiveClasses
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};