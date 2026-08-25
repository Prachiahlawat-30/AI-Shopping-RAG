import React, { useMemo, useState } from 'react';
import { Header } from '../components/layout/Header';
import { HistoryFilter } from '../components/history/HistoryFilter';
import { HistoryItem, HistoryEvent } from '../components/history/HistoryItem';
import { useActivity } from '../hooks/useActivity';
import { ActivityType } from '../types/history';
import { Activity, UploadCloud, Search, MessageSquare, Clock } from 'lucide-react';

const ALL_TYPES: ActivityType[] = ['upload', 'search', 'chat'];

export const HistoryPage: React.FC = () => {
  const { data, isLoading, isError } = useActivity(30);
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>(ALL_TYPES);

  const rawEvents = data?.events || [];

  const counts = useMemo(() => {
    const uploads = rawEvents.filter((e) => e.type === 'upload').length;
    const searches = rawEvents.filter((e) => e.type === 'search').length;
    const chats = rawEvents.filter((e) => e.type === 'chat').length;
    return { uploads, searches, chats, total: rawEvents.length };
  }, [rawEvents]);

  const events: HistoryEvent[] = useMemo(() => {
    return rawEvents
      .filter((event) => selectedTypes.includes(event.type))
      .map((event) => ({
        id: event.id,
        type: event.type,
        title: event.title,
        subtitle: event.subtitle || '',
        time: event.time,
        image: event.image,
        tags: event.tags,
      }));
  }, [rawEvents, selectedTypes]);

  return (
    <div className="min-h-screen bg-[#08080a] text-gray-200 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-900/10 via-purple-900/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Unified Activity Stream
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Audit & Search History
            </h1>
          </div>

          <HistoryFilter selected={selectedTypes} onChange={setSelectedTypes} />
        </div>

        {/* Quick Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{counts.uploads}</p>
              <p className="text-xs text-zinc-400 font-medium">Catalog Uploads</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{counts.searches}</p>
              <p className="text-xs text-zinc-400 font-medium">Vector Searches</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{counts.chats}</p>
              <p className="text-xs text-zinc-400 font-medium">Chat Inquiries</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{counts.total}</p>
              <p className="text-xs text-zinc-400 font-medium">Total Events</p>
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Activity Timeline</span>
            <span className="text-xs text-zinc-500 font-mono">
              Showing {events.length} of {counts.total} events
            </span>
          </div>

          {isLoading && (
            <div className="py-12 text-center text-zinc-500 text-sm">Loading activity records…</div>
          )}

          {isError && (
            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-400 text-sm text-center">
              Unable to load activity history. Please try refreshing.
            </div>
          )}

          {!isLoading && !isError && events.length === 0 && (
            <div className="py-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 text-zinc-400">
              <Activity className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
              <p className="text-sm font-medium">No activity recorded yet for the selected filters.</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {events.map((event, index) => (
              <HistoryItem
                key={event.id}
                item={event}
                isLast={index === events.length - 1}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};