'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ClassifiedCategory } from '@/types';
import {
  LayoutGrid,
  Building,
  KeyRound,
  Users,
  Armchair,
  Briefcase,
  Store,
  Baby,
} from 'lucide-react';

const CATEGORIES: { id: ClassifiedCategory | 'ALL'; label: string; icon: any }[] = [
  { id: 'ALL', label: 'All', icon: LayoutGrid },
  { id: 'REAL_ESTATE_RENT', label: 'Rentals', icon: Building },
  { id: 'REAL_ESTATE_SALE', label: 'Sales', icon: KeyRound },
  { id: 'PG_FLATMATE', label: 'PG / Flatmates', icon: Users },
  { id: 'HOME_CLEARANCE_FURNITURE', label: 'Furniture', icon: Armchair },
  { id: 'COMMERCIAL_EQUIPMENT', label: 'Equipment', icon: Store },
  { id: 'BABY_KIDS', label: 'Kids', icon: Baby },
  { id: 'JOBS', label: 'Jobs', icon: Briefcase },
];

export const ClassifiedFilterBar: React.FC = () => {
  const { activeClassifiedCategory, setActiveClassifiedCategory } = useApp();

  return (
    <div className="bg-surface/90 backdrop-blur-sm border-b border-border px-4 py-2 sticky top-[57px] z-10">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-7xl mx-auto">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeClassifiedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveClassifiedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition active:scale-95 ${
                isActive
                  ? 'bg-emerald-900 text-white shadow-xs'
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
