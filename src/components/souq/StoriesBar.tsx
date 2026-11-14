'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Flame, Clock, Plus } from 'lucide-react';

export const StoriesBar: React.FC = () => {
  const { stories, openStory, selectedCityId, setIsPostModalOpen } = useApp();

  const filteredStories =
    selectedCityId === 'all'
      ? stories
      : stories.filter((s) => s.cityId === selectedCityId);

  const displayStories = filteredStories.length > 0 ? filteredStories : stories;

  return (
    <div className="bg-surface border-b border-border py-2.5 px-4 shadow-subtle">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <h2 className="font-serif font-bold text-xs uppercase tracking-wider text-emerald-950">
            24h Fresh Drops
          </h2>
        </div>
        <button
          onClick={() => setIsPostModalOpen(true)}
          className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 hover:text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 transition"
        >
          <Plus className="w-3 h-3" />
          <span>Add Drop</span>
        </button>
      </div>

      {displayStories.length === 0 ? (
        <div className="py-2 text-center text-xs text-slate-400 bg-surface-muted/40 rounded-xl border border-dashed border-border">
          No active 24h drops right now.
        </div>
      ) : (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar pt-1">
          {displayStories.map((story, idx) => (
            <button
              key={story.id}
              onClick={() => openStory(idx)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
            >
              <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-amber-500 via-gold-500 to-emerald-600 group-hover:scale-105 transition-transform duration-200">
                <div className="p-[2px] bg-surface rounded-full">
                  <img
                    src={story.businessAvatar}
                    alt={story.businessName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center w-14">
                <p className="text-[10px] font-semibold text-slate-800 truncate group-hover:text-emerald-900 transition">
                  {story.businessName}
                </p>
                <div className="flex items-center justify-center gap-0.5 text-[9px] text-amber-700">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{story.expiresInHours}h</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
