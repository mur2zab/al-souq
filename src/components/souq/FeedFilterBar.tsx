'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, Utensils, Scissors, Palette, Package, Gift } from 'lucide-react';

const CATEGORIES = [
  { id: 'ALL', label: 'All Souq', icon: Sparkles },
  { id: 'FOOD_CATERING', label: "Today's Food Pop-ups", icon: Utensils },
  { id: 'RIDA_FASHION', label: 'Ridas & Apparel', icon: Scissors },
  { id: 'KHATT_ART', label: 'Khatt & Calligraphy', icon: Palette },
  { id: 'B2B_TRADE', label: 'B2B & Wholesale', icon: Package },
  { id: 'GIFTING_DECOR', label: 'Gifting & Decor', icon: Gift },
];

export const FeedFilterBar: React.FC = () => {
  const { activeFeedCategory, setActiveFeedCategory } = useApp();

  return (
    <div className="bg-surface/80 backdrop-blur-sm border-b border-border px-4 py-2 sticky top-[105px] z-10">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeFeedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveFeedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                isActive
                  ? 'bg-emerald-900 text-white shadow-sm ring-1 ring-gold-500/50'
                  : 'bg-surface-muted text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 border border-border'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gold-300' : 'text-slate-500'}`} />
              <span className={isActive ? 'text-white font-bold' : ''}>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
