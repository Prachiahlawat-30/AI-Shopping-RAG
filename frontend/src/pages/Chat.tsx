import React, { useState } from 'react';
import { Header } from "../components/layout/Header";
import { ChatSidebar, Conversation } from '../components/chat/ChatSidebar';
import { ChatMessage, Message } from '../components/chat/ChatMessage';
import { Bot, Send, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useChat } from '../hooks/useChat';

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  sender: 'ai',
  text: "Hello! I'm your AI shopping assistant. Ask me anything about the products you've uploaded — I'll pull relevant context and answer.",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTIONS = [
  'Is this product original?',
  'What material is this made from?',
  'Find cheaper alternatives',
  'Compare with similar products',
];

const timeNow = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const AIChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', title: 'New Conversation', date: 'Today', active: true },
  ]);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({
    '1': [WELCOME_MESSAGE],
  });
  const [activeChatId, setActiveChatId] = useState<string>('1');
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  const { ask, loading, error } = useChat();

  const handleSelectConversation = (id: string) => {
    setActiveChatId(id);
    setConversations((prev) =>
      prev.map((c) => ({ ...c, active: c.id === id }))
    );
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newChat: Conversation = {
      id: newId,
      title: 'New Conversation',
      date: 'Just now',
      active: true,
    };

    setConversations((prev) => [newChat, ...prev.map((c) => ({ ...c, active: false }))]);
    setMessagesMap((prev) => ({ ...prev, [newId]: [WELCOME_MESSAGE] }));
    setActiveChatId(newId);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: timeNow(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId && c.title === 'New Conversation'
          ? { ...c, title: query.slice(0, 28) + (query.length > 28 ? '...' : '') }
          : c
      )
    );

    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), userMsg],
    }));

    setInputText('');

    const response = await ask(query);

    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: response?.answer || 'Sorry, something went wrong answering that — please try again.',
      timestamp: timeNow(),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), aiMsg],
    }));
  };

  const currentMessages = messagesMap[activeChatId] || [];
  const currentChatTitle = conversations.find((c) => c.id === activeChatId)?.title || 'AI Product Assistant';

  return (
    <div className="h-screen bg-[#08080a] text-gray-200 flex flex-col font-sans overflow-hidden">
      <Header/>

      <div className="flex flex-1 overflow-hidden relative">
        <div
          className={`transition-all duration-300 ease-in-out flex shrink-0 ${
            isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden pointer-events-none'
          }`}
        >
          <ChatSidebar
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            onNewChat={handleNewChat}
          />
        </div>

        <main className="flex-1 flex flex-col justify-between bg-[#08080a] relative">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-900/80 bg-[#08080a]">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#121217] transition-colors"
              title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>

            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Bot className="w-4 h-4" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white leading-tight">{currentChatTitle}</h3>
              <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                RAG + Qdrant
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center">
            <div className="w-full max-w-3xl flex flex-col gap-6">
              {currentMessages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {loading && (
                <ChatMessage
                  message={{
                    id: 'typing',
                    sender: 'ai',
                    text: 'Thinking…',
                    timestamp: '',
                  }}
                />
              )}
            </div>
          </div>

          <div className="px-6 pb-4 pt-2 flex flex-col items-center w-full max-w-3xl mx-auto">
            {error && (
              <p className="text-xs text-red-400 mb-2 w-full text-center">{error}</p>
            )}

            <div className="flex flex-wrap justify-center gap-2 mb-4 w-full">
              {SUGGESTIONS.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(pill)}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-[#121217] border border-gray-800 text-gray-300 hover:text-white hover:border-gray-700 transition-all text-xs font-medium disabled:opacity-50"
                >
                  {pill}
                </button>
              ))}
            </div>

            <div className="w-full relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                rows={1}
                disabled={loading}
                placeholder="Ask about your products... (Enter to send, Shift+Enter for newline)"
                className="w-full bg-[#121217] border border-gray-800/80 rounded-2xl py-4 pl-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm resize-none disabled:opacity-60"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading}
                className="absolute right-3 top-3 p-2 rounded-xl bg-[#1a1a24] text-gray-400 hover:text-white hover:bg-indigo-600 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <span className="text-[11px] text-gray-600 mt-3 font-medium">
              Powered by your RAG pipeline · Qdrant vector store
            </span>
          </div>
        </main>
      </div>
    </div>
  );
};