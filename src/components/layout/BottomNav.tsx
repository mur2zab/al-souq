'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Compass,
  Home,
  PlusCircle,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'FEED' | 'CLASSIFIEDS' | 'SELLER_STUDIO' | 'ADMIN_TRUST';
  setActiveTab: (tab: 'FEED' | 'CLASSIFIEDS' | 'SELLER_STUDIO' | 'ADMIN_TRUST') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { setIsPostModalOpen, currentUser } = useApp();

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden">
        <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
          <button
            onClick={() => setActiveTab('FEED')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition active:scale-95 ${
              activeTab === 'FEED'
                ? 'text-emerald-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className={`w-5 h-5 ${activeTab === 'FEED' ? 'stroke-[2.5px] text-emerald-800' : ''}`} />
            <span className="text-[10px]">Souq</span>
          </button>

          <button
            onClick={() => setActiveTab('CLASSIFIEDS')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition active:scale-95 ${
              activeTab === 'CLASSIFIEDS'
                ? 'text-emerald-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'CLASSIFIEDS' ? 'stroke-[2.5px] text-emerald-800' : ''}`} />
            <span className="text-[10px]">Classifieds</span>
          </button>

          {/* Center Action */}
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex flex-col items-center -mt-5 transition transform active:scale-90"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-900 to-emerald-800 text-gold-400 flex items-center justify-center shadow-gold border-2 border-surface">
              <PlusCircle className="w-6 h-6 stroke-[2.2px]" />
            </div>
            <span className="text-[10px] font-bold text-emerald-950 mt-0.5">Post</span>
          </button>

          <button
            onClick={() => setActiveTab('SELLER_STUDIO')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition active:scale-95 ${
              activeTab === 'SELLER_STUDIO'
                ? 'text-emerald-900 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${activeTab === 'SELLER_STUDIO' ? 'stroke-[2.5px] text-emerald-800' : ''}`} />
            <span className="text-[10px]">Seller Hub</span>
          </button>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('ADMIN_TRUST')}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition active:scale-95 ${
                activeTab === 'ADMIN_TRUST'
                  ? 'text-emerald-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className={`w-5 h-5 ${activeTab === 'ADMIN_TRUST' ? 'stroke-[2.5px] text-emerald-800' : ''}`} />
              <span className="text-[10px]">Admin</span>
            </button>
          )}
        </div>
      </nav>

      {/* Desktop Navigation Pill Menu */}
      <div className="hidden md:flex justify-center bg-surface border-b border-border py-2 sticky top-[57px] z-20 shadow-xs">
        <div className="flex items-center gap-2 bg-surface-muted p-1 rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab('FEED')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'FEED'
                ? 'bg-surface text-emerald-950 shadow-sm border border-border font-bold'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-800" />
            <span>Visual Souq</span>
          </button>

          <button
            onClick={() => setActiveTab('CLASSIFIEDS')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'CLASSIFIEDS'
                ? 'bg-surface text-emerald-950 shadow-sm border border-border font-bold'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-800" />
            <span>Classifieds</span>
          </button>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-950 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 text-gold-400" />
            <span>+ Post Ad</span>
          </button>

          <button
            onClick={() => setActiveTab('SELLER_STUDIO')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'SELLER_STUDIO'
                ? 'bg-surface text-emerald-950 shadow-sm border border-border font-bold'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-800" />
            <span>Seller Hub</span>
          </button>

          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setActiveTab('ADMIN_TRUST')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'ADMIN_TRUST'
                  ? 'bg-surface text-emerald-950 shadow-sm border border-border font-bold'
                  : 'text-slate-600 hover:text-emerald-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
              <span>Admin Desk</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
