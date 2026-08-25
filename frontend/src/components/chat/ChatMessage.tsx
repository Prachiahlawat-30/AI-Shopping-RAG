import React from 'react';
import { Bot, Sparkles, Tag, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ProductCard as ProductCardType } from '../../types/search';
import { getImageUrl } from '../../lib/utils';

export interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  products?: ProductCardType[];
}

interface ChatMessageProps {
  message: Message;
  onProductClick?: (product: ProductCardType) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onProductClick }) => {
  const isAI = message.sender === 'ai';

  return (
    <div className={`flex gap-3 w-full max-w-3xl ${isAI ? 'justify-start' : 'justify-end'}`}>
      {/* AI Avatar */}
      {isAI && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-purple-500/10">
          <Bot className="w-4 h-4" />
        </div>
      )}

      {/* Message Body */}
      <div className="flex flex-col max-w-[85%] sm:max-w-[78%]">
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isAI
              ? 'bg-[#121217] border border-gray-800/80 text-gray-200 rounded-tl-sm'
              : 'bg-indigo-600 text-white rounded-tr-sm'
          }`}
        >
          {isAI ? (
            <div className="prose prose-invert prose-sm max-w-none text-gray-200">
              <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.text}</p>
          )}

          {/* Render Grounded Product Citations */}
          {isAI && message.products && message.products.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-800/80">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-400 mb-2.5">
                <Sparkles className="w-3 h-3" />
                <span>Grounded Catalog Sources ({message.products.length})</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {message.products.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onProductClick?.(p)}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-[#191922] border border-gray-800/70 hover:border-indigo-500/50 hover:bg-[#20202c] transition-all cursor-pointer group"
                  >
                    <img
                      src={getImageUrl(p.thumbnail)}
                      alt={p.product_name}
                      className="w-10 h-10 rounded-lg object-cover bg-black/40 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {p.product_name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                        <span className="truncate">{p.brand}</span>
                        {p.price && (
                          <span className="font-semibold text-emerald-400">
                            {p.currency || '₹'}{p.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span
          className={`text-[10px] text-gray-500 mt-1 px-1 ${
            isAI ? 'text-left' : 'text-right'
          }`}
        >
          {message.timestamp}
        </span>
      </div>
    </div>
  );
};