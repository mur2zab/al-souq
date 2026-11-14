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
  { id: 'ALL', label: 'All Classifieds', icon: LayoutGrid },
  { id: 'REAL_ESTATE_RENT', label: 'NoBroker Rentals', icon: Building },
  { id: 'REAL_ESTATE_SALE', label: 'Properties for Sale', icon: KeyRound },
  { id: 'PG_FLATMATE', label: 'PG & Flatmates', icon: Users },
  { id: 'HOME_CLEARANCE_FURNITURE', label: 'Home Clearance & Furniture', icon: Armchair },
  { id: 'COMMERCIAL_EQUIPMENT', label: 'Commercial & Catering Gear', icon: Store },
  { id: 'BABY_KIDS', label: 'Baby & Kids Gear', icon: Baby },
  { id: 'JOBS', label: 'Community Jobs', icon: Briefcase },
];

export const ClassifiedFilterBar: React.FC = () => {
  const { activeClassifiedCategory, setActiveClassifiedCategory } = useApp();

  return (
    <div className="bg-surface/90 backdrop-blur-sm border-b border-border px-4 py-2 sticky top-[105px] z-10">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeClassifiedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveClassifiedCategory(cat.id)}
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
