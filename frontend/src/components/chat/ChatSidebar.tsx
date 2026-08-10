import React from 'react';
import { Plus } from 'lucide-react';

export interface Conversation {
  id: string;
  title: string;
  date: string;
  active?: boolean;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  onSelectConversation,
  onNewChat,
}) => {
  return (
    <aside className="w-72 border-r border-gray-900/80 bg-[#08080a] p-4 flex flex-col shrink-0">
      {/* Sidebar Header with + New Button */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
          Conversations
        </span>
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex flex-col gap-2 overflow-y-auto flex-1">
        {conversations.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectConversation(chat.id)}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              chat.active
                ? 'bg-[#181822] border-indigo-500/40 text-white shadow-sm'
                : 'bg-transparent border-transparent text-gray-400 hover:bg-[#121217] hover:text-gray-200'
            }`}
          >
            <h4 className="text-sm font-medium leading-snug truncate">
              {chat.title}
            </h4>
            <span className="text-xs text-gray-500 block mt-1 font-normal">
              {chat.date}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
};