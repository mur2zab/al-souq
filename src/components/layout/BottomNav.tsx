'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Compass,
  Home,
  PlusCircle,
  BarChart3,
  Shield,
  Sparkles,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'FEED' | 'CLASSIFIEDS' | 'SELLER_STUDIO' | 'ADMIN_TRUST';
  setActiveTab: (tab: 'FEED' | 'CLASSIFIEDS' | 'SELLER_STUDIO' | 'ADMIN_TRUST') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { setIsPostModalOpen, currentUser } = useApp();

  return (
    <>
      {/* Mobile Bottom Navigation Bar (fixed at bottom, z-40) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
          {/* Feed Tab */}
          <button
            onClick={() => setActiveTab('FEED')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition active:scale-95 ${
              activeTab === 'FEED'
                ? 'text-emerald-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className={`w-5 h-5 ${activeTab === 'FEED' ? 'stroke-[2.5px] text-emerald-800' : ''}`} />
            <span className="text-[10px] tracking-tight">Souq Feed</span>
          </button>

          {/* Classifieds Tab */}
          <button
            onClick={() => setActiveTab('CLASSIFIEDS')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition active:scale-95 ${
              activeTab === 'CLASSIFIEDS'
                ? 'text-emerald-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'CLASSIFIEDS' ? 'stroke-[2.5px] text-emerald-800' : ''}`} />
            <span className="text-[10px] tracking-tight">Classifieds</span>
          </button>

          {/* Center Action: + Post / List */}
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex flex-col items-center -mt-5 transition transform active:scale-90 group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-900 via-emerald-800 to-emerald-700 text-gold-400 flex items-center justify-center shadow-gold border-2 border-surface group-hover:scale-105 transition">
              <PlusCircle className="w-6 h-6 stroke-[2.2px]" />
            </div>
            <span className="text-[10px] font-bold text-emerald-950 mt-0.5">Post Ad</span>
          </button>

          {/* Seller Studio / ROI Analytics Tab */}
          <button
            onClick={() => setActiveTab('SELLER_STUDIO')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition active:scale-95 ${
              activeTab === 'SELLER_STUDIO'
                ? 'text-emerald-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${activeTab === 'SELLER_STUDIO' ? 'stroke-[2.5px] text-emerald-800' : ''}`} />
            <span className="text-[10px] tracking-tight">Seller Hub</span>
          </button>

          {/* Trust / Admin Console Tab */}
          <button
            onClick={() => setActiveTab('ADMIN_TRUST')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition active:scale-95 ${
              activeTab === 'ADMIN_TRUST'
                ? 'text-emerald-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className={`w-5 h-5 ${activeTab === 'ADMIN_TRUST' ? 'stroke-[2.5px] text-emerald-800' : ''}`} />
            <span className="text-[10px] tracking-tight">
              {currentUser.role === 'ADMIN' ? 'Admin Hub' : 'ITS Trust'}
            </span>
          </button>
        </div>
      </nav>

      {/* Desktop Navigation Header Bar / Pill Menu */}
      <div className="hidden md:flex justify-center bg-surface border-b border-border py-2 sticky top-[57px] z-20 shadow-xs">
        <div className="flex items-center gap-2 bg-surface-muted p-1 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab('FEED')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'FEED'
                ? 'bg-surface text-emerald-950 shadow-sm border border-border'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-800" />
            <span>The Visual Souq</span>
          </button>

          <button
            onClick={() => setActiveTab('CLASSIFIEDS')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'CLASSIFIEDS'
                ? 'bg-surface text-emerald-950 shadow-sm border border-border'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-800" />
            <span>Classifieds & Homes</span>
          </button>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-800 to-emerald-950 text-gold-400 hover:text-gold-200 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ Create Listing / Post</span>
          </button>

          <button
            onClick={() => setActiveTab('SELLER_STUDIO')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'SELLER_STUDIO'
                ? 'bg-surface text-emerald-950 shadow-sm border border-border'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-800" />
            <span>Seller Studio & Leads</span>
          </button>

          <button
            onClick={() => setActiveTab('ADMIN_TRUST')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'ADMIN_TRUST'
                ? 'bg-surface text-emerald-950 shadow-sm border border-border'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-800" />
            <span>{currentUser.role === 'ADMIN' ? 'Admin Moderation' : 'ITS Trust & KYC'}</span>
          </button>
        </div>
      </div>
    </>
  );
};
