'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, Flame, Clock, PlusCircle } from 'lucide-react';

export const StoriesBar: React.FC = () => {
  const { stories, openStory, selectedCityId, setIsPostModalOpen } = useApp();

  const filteredStories =
    selectedCityId === 'all'
      ? stories
      : stories.filter((s) => s.cityId === selectedCityId);

  const displayStories = filteredStories.length > 0 ? filteredStories : stories;

  return (
    <div className="bg-surface border-b border-border py-3 px-4 shadow-subtle">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <h2 className="font-serif font-bold text-xs uppercase tracking-wider text-emerald-950">
            Today's Fresh Drops & Pop-ups
          </h2>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full border border-amber-300">
            24h Flash
          </span>
        </div>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Weekend Thaali specials & limited launches
        </span>
      </div>

      {displayStories.length === 0 ? (
        <div className="py-2 flex items-center justify-between bg-surface-muted/50 rounded-2xl px-3 border border-border/70 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="text-[11px]">No active 24h flash drops in this city today.</span>
          </div>
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 transition"
          >
            <PlusCircle className="w-3 h-3 text-emerald-700" />
            <span>Post a Drop</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar pt-1">
          {displayStories.map((story, idx) => (
            <button
              key={story.id}
              onClick={() => openStory(idx)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group focus:outline-none"
            >
              {/* Story Ring Avatar */}
              <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-amber-500 via-gold-500 to-emerald-600 group-hover:scale-105 transition-transform duration-200">
                <div className="p-[2px] bg-surface rounded-full">
                  <img
                    src={story.businessAvatar}
                    alt={story.businessName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>

                {/* Fresh Drop Badge */}
                <div className="absolute -bottom-1 -right-0.5 bg-gradient-to-r from-emerald-900 to-emerald-800 text-gold-400 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-surface shadow-xs">
                  DROP
                </div>
              </div>

              {/* Story Label */}
              <div className="text-center w-16">
                <p className="text-[11px] font-semibold text-slate-800 truncate group-hover:text-emerald-900 transition">
                  {story.businessName}
                </p>
                <div className="flex items-center justify-center gap-0.5 text-[9px] text-amber-700 font-medium">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{story.expiresInHours}h left</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
