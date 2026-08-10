import React, { useMemo, useState } from 'react';
import { Header } from '../components/layout/Header';
import { HistoryFilter } from '../components/history/HistoryFilter';
import { HistoryItem, HistoryEvent } from '../components/history/HistoryItem';
import { useActivity } from '../hooks/useActivity';
import { ActivityType } from '../types/history';

const ALL_TYPES: ActivityType[] = ['upload', 'search', 'chat'];

export const HistoryPage: React.FC = () => {
  const { data, isLoading, isError } = useActivity(20);
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>(ALL_TYPES);

  const events: HistoryEvent[] = useMemo(() => {
    return (data?.events || [])
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
  }, [data, selectedTypes]);

  return (
    <div className="min-h-screen bg-[#08080a] text-gray-200 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2 block">
              Activity Log
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              History
            </h1>
          </div>

          <HistoryFilter selected={selectedTypes} onChange={setSelectedTypes} />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-semibold text-gray-400">Recent Activity</span>
            <span className="text-xs text-gray-600 font-mono">
              {events.length} {events.length === 1 ? 'event' : 'events'}
            </span>
          </div>

          {isLoading && (
            <p className="text-sm text-gray-500">Loading activity…</p>
          )}

          {isError && (
            <p className="text-sm text-red-400">
              Couldn't load activity — please try again.
            </p>
          )}

          {!isLoading && !isError && events.length === 0 && (
            <p className="text-sm text-gray-500">
              Nothing here yet — upload a product, run a search, or ask the assistant something.
            </p>
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