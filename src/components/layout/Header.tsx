'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { CITIES } from '@/data/cities';
import {
  MapPin,
  ShieldCheck,
  Clock,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Users,
  Compass,
  LogIn,
  LogOut,
  UserCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentUser,
    selectedCityId,
    selectedLocality,
    setIsCityModalOpen,
    setIsVerificationModalOpen,
    setIsAuthModalOpen,
    switchPersona,
    logout,
  } = useApp();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentCity = CITIES.find((c) => c.id === selectedCityId);
  const locationLabel =
    selectedCityId === 'all'
      ? 'Global Jamaat (All)'
      : `${currentCity?.name || 'Mumbai'}${
          selectedLocality && selectedLocality !== 'All Localities'
            ? ` • ${selectedLocality.split('(')[0].trim()}`
            : ''
        }`;

  const isGuest =
    currentUser.verificationStatus === 'UNVERIFIED' && currentUser.id.startsWith('guest');

  return (
    <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border shadow-subtle transition-all">
      {/* Top micro bar for quick persona switching & trust indicator */}
      <div className="bg-emerald-950 text-emerald-100 text-[11px] px-3 py-1.5 flex items-center justify-between border-b border-emerald-900/50">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-emerald-200 truncate">
            Dawoodi Bohra High-Trust Community Platform
          </span>
          <span className="hidden sm:inline text-emerald-400">• Zero Brokerage</span>
          <span className="hidden md:inline text-emerald-400">• Verified ITS Mumineen</span>
        </div>

        {/* Persona quick-switch trigger */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-1 bg-emerald-900/80 hover:bg-emerald-800 text-gold-400 hover:text-gold-200 px-2 py-0.5 rounded text-[11px] font-medium transition"
            title="Switch Persona to test different permission states"
          >
            <Users className="w-3 h-3 text-gold-400" />
            <span className="truncate max-w-[120px]">
              Role: {currentUser.role === 'ADMIN' ? 'Admin' : currentUser.verificationStatus}
            </span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-surface text-slate-800 rounded-xl shadow-elevated border border-border py-1.5 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
              <div className="px-3 py-1 font-semibold text-[10px] text-slate-400 uppercase tracking-wider">
                Test Platform Roles
              </div>
              <button
                onClick={() => {
                  switchPersona('VERIFIED');
                  setShowPersonaMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-muted transition ${
                  currentUser.verificationStatus === 'VERIFIED' && currentUser.role === 'MEMBER'
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : ''
                }`}
              >
                <span>Murtuza (Verified Mumin)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                  Full Access
                </span>
              </button>
              <button
                onClick={() => {
                  switchPersona('CREATOR');
                  setShowPersonaMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-muted transition ${
                  currentUser.role === 'CREATOR_BUSINESS'
                    ? 'bg-emerald-50 text-emerald-900 font-semibold'
                    : ''
                }`}
              >
                <span>Fatema (Verified Tijarat Page)</span>
                <span className="text-[10px] bg-gold-100 text-gold-800 px-1.5 py-0.5 rounded">
                  Creator Pro
                </span>
              </button>
              <button
                onClick={() => {
                  switchPersona('ADMIN');
                  setShowPersonaMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-muted transition ${
                  currentUser.role === 'ADMIN' ? 'bg-emerald-50 text-emerald-900 font-semibold' : ''
                }`}
              >
                <span>Admin Console (Review Queue)</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">
                  Admin
                </span>
              </button>
              <button
                onClick={() => {
                  switchPersona('PENDING');
                  setShowPersonaMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-muted transition ${
                  currentUser.verificationStatus === 'PENDING'
                    ? 'bg-amber-50 text-amber-900 font-semibold'
                    : ''
                }`}
              >
                <span>Shabbir (Pending KYC)</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                  Reviewing
                </span>
              </button>
              <button
                onClick={() => {
                  switchPersona('UNVERIFIED');
                  setShowPersonaMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-muted transition ${
                  currentUser.verificationStatus === 'UNVERIFIED'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : ''
                }`}
              >
                <span>Guest Visitor (Unverified)</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                  Masked Phone
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-gold-400 shadow-gold border border-gold-500/30">
            <span className="font-serif font-black text-lg">س</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-extrabold text-xl tracking-tight text-emerald-950">
                Al-Souq
              </span>
              <span className="text-xs text-gold-600 font-serif font-semibold">السوق</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
              Visual Souq & High-Trust Classifieds
            </p>
          </div>
        </div>

        {/* Global Location Switcher Button */}
        <button
          onClick={() => setIsCityModalOpen(true)}
          className="flex items-center gap-1.5 bg-surface-muted hover:bg-emerald-50/70 border border-border hover:border-emerald-700/30 text-emerald-950 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition active:scale-95 group"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-800 group-hover:text-emerald-700 transition" />
          <span className="max-w-[130px] sm:max-w-[200px] truncate">{locationLabel}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-800 transition" />
        </button>

        {/* Auth & Verification Section */}
        <div className="flex items-center gap-2">
          {currentUser.verificationStatus === 'VERIFIED' ? (
            <div
              className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 text-emerald-900 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer"
              title={`Verified ITS: ${currentUser.itsNumber}`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700 fill-emerald-100" />
              <span className="hidden sm:inline font-semibold">Verified Mumin</span>
              <span className="text-[11px] text-emerald-700 bg-emerald-200/60 px-1.5 rounded font-mono">
                •••{currentUser.itsNumber?.slice(-4) || '1823'}
              </span>
            </div>
          ) : currentUser.verificationStatus === 'PENDING' ? (
            <div
              onClick={() => setIsVerificationModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer animate-pulse"
              title="Verification under review"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline font-medium">ITS Pending</span>
            </div>
          ) : (
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-emerald-950 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm transition active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-950" />
              <span>Verify ITS</span>
            </button>
          )}

          {/* User Profile / Login Button with Dropdown */}
          <div className="relative">
            {isGuest ? (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-3.5 py-1.5 rounded-full text-xs shadow-sm transition active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-gold-400" />
                <span>Self Sign-In</span>
              </Link>
            ) : (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1 p-0.5 rounded-full hover:ring-2 hover:ring-gold-500/50 transition focus:outline-none"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gold-500/60 shadow-sm"
                />
              </button>
            )}

            {showUserMenu && !isGuest && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-surface text-slate-800 rounded-2xl shadow-elevated border border-border p-3 z-50 animate-in fade-in slide-in-from-top-1 text-xs space-y-2.5">
                <div className="border-b border-border pb-2">
                  <div className="font-serif font-bold text-slate-900 text-sm">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                  <div className="text-[11px] text-emerald-800 font-medium mt-0.5">
                    ITS: {currentUser.itsNumber || 'Not set'} • {currentUser.mohallaName}
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-muted flex items-center justify-between text-slate-700"
                  >
                    <span>My Account & Identity Portal</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                  </Link>

                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-muted flex items-center justify-between text-slate-700"
                  >
                    <span>Switch Account / Sign In</span>
                    <LogIn className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-700 flex items-center justify-between font-medium"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3.5 h-3.5" />
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
