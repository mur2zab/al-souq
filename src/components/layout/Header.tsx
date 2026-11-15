'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { CITIES } from '@/data/cities';
import {
  MapPin,
  ShieldCheck,
  Clock,
  ChevronDown,
  LogOut,
  User as UserIcon,
  PlusCircle,
  Shield,
} from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const {
    currentUser,
    selectedCityId,
    selectedLocality,
    setIsCityModalOpen,
    setIsVerificationModalOpen,
    setIsPostModalOpen,
    logout,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentCity = CITIES.find((c) => c.id === selectedCityId);
  const locationLabel =
    selectedCityId === 'all'
      ? 'All Cities'
      : `${currentCity?.name || 'Mumbai'}${
          selectedLocality && selectedLocality !== 'All Localities'
            ? ` • ${selectedLocality.split('(')[0].trim()}`
            : ''
        }`;

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border shadow-subtle transition-all">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-gold-400 shadow-gold border border-gold-500/30">
            <span className="font-serif font-black text-base">س</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-black text-xl tracking-tight text-emerald-950">
              Al-Souq
            </span>
            <span className="text-xs text-gold-600 font-serif font-semibold">السوق</span>
          </div>
        </Link>

        {/* Location Filter Pill */}
        <button
          onClick={() => setIsCityModalOpen(true)}
          className="flex items-center gap-1.5 bg-surface-muted hover:bg-emerald-50/70 border border-border text-emerald-950 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition active:scale-95"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-800" />
          <span className="max-w-[120px] sm:max-w-[180px] truncate">{locationLabel}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {/* Right Section: Actions & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Link if Admin */}
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1.5 rounded-xl border border-purple-200 transition"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Desk</span>
            </Link>
          )}

          {/* Verification Status Pill */}
          {currentUser.verificationStatus === 'VERIFIED' ? (
            <div
              className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-900 px-2.5 py-1 rounded-full text-xs font-medium"
              title={`ITS Verified: ${currentUser.itsNumber || ''}`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-semibold">Verified</span>
            </div>
          ) : currentUser.verificationStatus === 'PENDING' ? (
            <div
              onClick={() => setIsVerificationModalOpen(true)}
              className="flex items-center gap-1 bg-amber-50 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer"
            >
              <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
              <span>Pending</span>
            </div>
          ) : (
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="flex items-center gap-1 bg-gold-400 hover:bg-gold-500 text-emerald-950 px-2.5 py-1 rounded-full text-xs font-bold transition active:scale-95 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify ITS</span>
            </button>
          )}

          {/* Quick Post Button */}
          <button
            onClick={() => setIsPostModalOpen(true)}
            className="flex items-center gap-1 bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5 text-gold-400" />
            <span className="hidden sm:inline">Post</span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-gold-500/50 transition focus:outline-none"
            >
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-800 shadow-xs"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface text-slate-800 rounded-2xl shadow-elevated border border-border p-2.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs space-y-2">
                <div className="px-2 py-1.5 border-b border-border">
                  <div className="font-bold text-slate-900 truncate">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
                  {currentUser.itsNumber && (
                    <div className="text-[10px] text-emerald-800 font-mono font-bold mt-0.5">
                      ITS: {currentUser.itsNumber}
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-muted flex items-center justify-between text-slate-700 font-medium transition"
                  >
                    <span>My Profile & Listings</span>
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-purple-50 flex items-center justify-between text-purple-900 font-medium transition"
                    >
                      <span>Admin Verification Desk</span>
                      <Shield className="w-3.5 h-3.5 text-purple-700" />
                    </Link>
                  )}

                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                      router.replace('/login');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-700 flex items-center justify-between font-medium transition"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
