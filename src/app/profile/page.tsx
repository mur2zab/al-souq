'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  Sparkles,
  Bookmark,
  Building,
  CheckCircle2,
  LogOut,
  ExternalLink,
  PlusCircle,
  Home,
  MessageCircle,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const {
    currentUser,
    logout,
    setIsVerificationModalOpen,
    classifieds,
    feedPosts,
    leadEvents,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MY_LISTINGS' | 'SAVED'>('OVERVIEW');

  const myListings = classifieds.filter(
    (c) => c.sellerId === currentUser.id || c.sellerName === currentUser.fullName
  );
  const myPosts = feedPosts.filter(
    (p) => p.authorId === currentUser.id || p.businessName === currentUser.fullName
  );
  const savedClassifieds = classifieds.filter((c) => c.isSaved);
  const savedPosts = feedPosts.filter((p) => p.isSaved);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background text-slate-800 flex flex-col font-sans selection:bg-gold-500/30">
      {/* Top Header */}
      <header className="border-b border-border bg-surface/90 backdrop-blur-md px-4 py-3 sticky top-0 z-20 shadow-subtle">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-gold-400 font-serif font-black shadow-gold border border-gold-500/30">
              س
            </div>
            <div>
              <span className="font-serif font-black text-lg text-emerald-950 tracking-tight">
                Al-Souq
              </span>
              <span className="text-xs text-gold-600 font-serif font-semibold ml-1">السوق</span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-950 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </Link>
        </div>
      </header>

      {/* Main Profile Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* User Identity Card Banner */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-6 shadow-elevated border border-gold-500/40 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-gold-400 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif font-black text-xl text-white">
                    {currentUser.fullName}
                  </h1>
                  {currentUser.verificationStatus === 'VERIFIED' && (
                    <ShieldCheck className="w-5 h-5 text-gold-400 fill-gold-400/20" />
                  )}
                </div>
                <div className="text-xs font-mono text-gold-300 font-bold mt-0.5">
                  ITS ID: {currentUser.itsNumber || 'Not verified'}
                </div>
                <div className="text-[11px] text-emerald-200 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-gold-400" />
                  <span>
                    {currentUser.mohallaName}, {currentUser.cityName}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Status Card / CTA */}
            <div className="text-right flex flex-col items-start sm:items-end">
              <span
                className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 ${
                  currentUser.verificationStatus === 'VERIFIED'
                    ? 'bg-gold-500 text-slate-950 font-black shadow-gold'
                    : currentUser.verificationStatus === 'PENDING'
                    ? 'bg-amber-400 text-slate-950 font-bold animate-pulse'
                    : 'bg-slate-700 text-white font-medium'
                }`}
              >
                {currentUser.verificationStatus === 'VERIFIED'
                  ? 'Verified Mumin'
                  : currentUser.verificationStatus === 'PENDING'
                  ? 'KYC Under Review'
                  : 'Unverified Guest'}
              </span>

              {currentUser.verificationStatus !== 'VERIFIED' ? (
                <button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="text-xs bg-gold-400 hover:bg-gold-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition"
                >
                  Verify ITS Card Proof →
                </button>
              ) : (
                <span className="text-[10px] text-emerald-300">
                  Full Community Trust Unlocked
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs inside Profile Portal */}
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'OVERVIEW'
                ? 'bg-emerald-900 text-white font-bold shadow-sm ring-1 ring-gold-500/40'
                : 'text-slate-600 hover:text-slate-900 bg-surface-muted'
            }`}
          >
            Profile & Settings
          </button>
          <button
            onClick={() => setActiveTab('MY_LISTINGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'MY_LISTINGS'
                ? 'bg-emerald-900 text-white font-bold shadow-sm ring-1 ring-gold-500/40'
                : 'text-slate-600 hover:text-slate-900 bg-surface-muted'
            }`}
          >
            My Listings ({myListings.length + myPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('SAVED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'SAVED'
                ? 'bg-emerald-900 text-white font-bold shadow-sm ring-1 ring-gold-500/40'
                : 'text-slate-600 hover:text-slate-900 bg-surface-muted'
            }`}
          >
            Saved Items ({savedClassifieds.length + savedPosts.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & SETTINGS */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-2xl p-5 border border-border shadow-subtle space-y-4">
              <h3 className="font-serif font-bold text-sm text-slate-900 border-b border-border pb-2">
                Personal & Community Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Email Address
                  </span>
                  <div className="font-semibold text-slate-800 mt-0.5">{currentUser.email}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    WhatsApp Phone
                  </span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {currentUser.phone || '+91 98200 11223'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Jamaat / City
                  </span>
                  <div className="font-semibold text-slate-800 mt-0.5">{currentUser.cityName}</div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Mohalla
                  </span>
                  <div className="font-semibold text-slate-800 mt-0.5">{currentUser.mohallaName}</div>
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-rose-700 hover:bg-rose-50 border border-rose-200 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MY LISTINGS */}
        {activeTab === 'MY_LISTINGS' && (
          <div className="space-y-3">
            {myListings.length === 0 && myPosts.length === 0 ? (
              <div className="bg-surface rounded-2xl p-8 border border-border text-center space-y-2">
                <Home className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-serif font-bold text-slate-800 text-sm">
                  You haven't posted any listings yet
                </h4>
                <p className="text-xs text-slate-500">
                  Post a NoBroker flat rental, clearance furniture, or catering drops.
                </p>
                <Link
                  href="/"
                  className="inline-block mt-2 text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-white px-4 py-2 rounded-xl shadow-xs"
                >
                  + Create Ad
                </Link>
              </div>
            ) : (
              myListings.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface rounded-2xl p-3.5 border border-border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.mediaUrls[0]}
                      alt={item.title}
                      className="w-14 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <div className="text-[11px] text-emerald-900 font-extrabold mt-0.5">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: SAVED ITEMS */}
        {activeTab === 'SAVED' && (
          <div className="space-y-3">
            {savedClassifieds.length === 0 && savedPosts.length === 0 ? (
              <div className="bg-surface rounded-2xl p-8 border border-border text-center space-y-2">
                <Bookmark className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-serif font-bold text-slate-800 text-sm">
                  No saved bookmarks yet
                </h4>
                <p className="text-xs text-slate-500">
                  Tap the bookmark icon on any Mazgaon flat or fresh drop to save it for later.
                </p>
              </div>
            ) : (
              savedClassifieds.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface rounded-2xl p-3.5 border border-border flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.mediaUrls[0]}
                      alt={item.title}
                      className="w-14 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <div className="text-[11px] text-emerald-900 font-extrabold mt-0.5">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/"
                    className="text-emerald-800 font-bold hover:underline"
                  >
                    View Listing →
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
