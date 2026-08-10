import React from 'react';
import { Bot } from 'lucide-react';

export interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === 'ai';

  return (
    <div className={`flex gap-3 max-w-3xl ${isAI ? 'justify-start' : 'justify-end'}`}>
      {/* AI Bot Avatar */}
      {isAI && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md">
          <Bot className="w-5 h-5" />
        </div>
      )}

      {/* Message Bubble */}
      <div className="flex flex-col">
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isAI
              ? 'bg-[#121217] border border-gray-800/80 text-gray-200 rounded-tl-sm'
              : 'bg-indigo-600 text-white rounded-tr-sm'
          }`}
        >
          {message.text}
        </div>
        
        {/* Timestamp */}
        <span
          className={`text-[11px] text-gray-500 mt-1.5 px-1 ${
            isAI ? 'text-left' : 'text-right'
          }`}
        >
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};