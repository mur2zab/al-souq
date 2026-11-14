'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { CitySelectorModal } from '@/components/layout/CitySelectorModal';
import { StoriesBar } from '@/components/souq/StoriesBar';
import { StoryViewerModal } from '@/components/souq/StoryViewerModal';
import { FeedFilterBar } from '@/components/souq/FeedFilterBar';
import { FeedCard } from '@/components/souq/FeedCard';
import { ClassifiedFilterBar } from '@/components/classifieds/ClassifiedFilterBar';
import { ClassifiedCard } from '@/components/classifieds/ClassifiedCard';
import { ClassifiedDetailModal } from '@/components/classifieds/ClassifiedDetailModal';
import { ListingCreatorModal } from '@/components/creator/ListingCreatorModal';
import { SellerDashboard } from '@/components/creator/SellerDashboard';
import { ITSVerificationWizard } from '@/components/trust/ITSVerificationWizard';
import { AdminConsole } from '@/components/trust/AdminConsole';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  Sparkles,
  Building2,
  ShieldCheck,
  Compass,
  Home,
  PlusCircle,
  Filter,
  Flame,
  ArrowRight,
} from 'lucide-react';

export default function HomeApp() {
  const {
    feedPosts,
    activeFeedCategory,
    setActiveFeedCategory,
    classifieds,
    activeClassifiedCategory,
    setActiveClassifiedCategory,
    selectedCityId,
    selectedLocality,
    currentUser,
    setIsPostModalOpen,
    setIsVerificationModalOpen,
    isAuthModalOpen,
    setIsAuthModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'FEED' | 'CLASSIFIEDS' | 'SELLER_STUDIO' | 'ADMIN_TRUST'>('FEED');

  // Filter feed posts by city, locality, and category
  const filteredFeedPosts = feedPosts.filter((post) => {
    // City filter
    if (selectedCityId !== 'all' && post.cityId !== selectedCityId) {
      return false;
    }
    // Locality filter (if selected and not "All Localities")
    if (
      selectedLocality &&
      selectedLocality !== 'All Localities' &&
      !post.mohallaName.toLowerCase().includes(selectedLocality.split('(')[0].trim().toLowerCase())
    ) {
      return false;
    }
    // Category filter
    if (activeFeedCategory !== 'ALL' && post.category !== activeFeedCategory) {
      return false;
    }
    return true;
  });

  // Filter classified listings by city, locality, and category
  const filteredClassifieds = classifieds.filter((item) => {
    if (selectedCityId !== 'all' && item.cityId !== selectedCityId) {
      return false;
    }
    if (
      selectedLocality &&
      selectedLocality !== 'All Localities' &&
      !item.mohallaName.toLowerCase().includes(selectedLocality.split('(')[0].trim().toLowerCase())
    ) {
      return false;
    }
    if (activeClassifiedCategory !== 'ALL' && item.category !== activeClassifiedCategory) {
      return false;
    }
    return true;
  });

  // Split classifieds into Real Estate & General Utility
  const realEstateListings = filteredClassifieds.filter(
    (c) =>
      c.category === 'REAL_ESTATE_RENT' ||
      c.category === 'REAL_ESTATE_SALE' ||
      c.category === 'PG_FLATMATE'
  );

  const generalClassifieds = filteredClassifieds.filter(
    (c) =>
      c.category !== 'REAL_ESTATE_RENT' &&
      c.category !== 'REAL_ESTATE_SALE' &&
      c.category !== 'PG_FLATMATE'
  );

  return (
    <div className="min-h-screen bg-background text-slate-800 flex flex-col font-sans pb-24 md:pb-12">
      {/* Persistent Global Header */}
      <Header />

      {/* Navigation Pills (Mobile bottom nav + desktop top pill) */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Verification Notice Banner for Unverified or Pending Users */}
      {currentUser.verificationStatus !== 'VERIFIED' && (
        <div className="bg-gradient-to-r from-amber-500/15 via-gold-500/20 to-amber-500/15 border-b border-amber-300/40 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
              <span>
                {currentUser.verificationStatus === 'PENDING'
                  ? 'Your ITS verification is currently awaiting manual review by the Jamaat Admin Desk.'
                  : 'You are browsing in guest mode. Verify your 8-digit ITS ID to view direct phone numbers and post listings.'}
              </span>
            </div>
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="text-xs font-bold text-emerald-950 bg-gold-400 hover:bg-gold-500 px-3 py-1 rounded-full transition active:scale-95 shadow-2xs whitespace-nowrap"
            >
              {currentUser.verificationStatus === 'PENDING' ? 'Check Status' : 'Start ITS Verification →'}
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {/* ======================================================== */}
        {/* TAB 1: THE VISUAL SOUQ (Instagram-style Discovery Feed)   */}
        {/* ======================================================== */}
        {activeTab === 'FEED' && (
          <div className="animate-in fade-in duration-150">
            {/* Top 24h Stories Bar */}
            <StoriesBar />

            {/* Category Filter Pills */}
            <FeedFilterBar />

            {/* Feed Cards Container */}
            <div className="max-w-xl mx-auto px-4 py-5">
              {filteredFeedPosts.length === 0 ? (
                <div className="bg-surface rounded-3xl p-8 border border-border text-center space-y-3 mt-4 shadow-subtle">
                  <Compass className="w-10 h-10 text-emerald-800 mx-auto opacity-40" />
                  <h3 className="font-serif font-bold text-slate-800 text-base">
                    No visual drops posted yet
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Be the first community creator, home baker, or rida designer to showcase your work in this city.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {activeFeedCategory !== 'ALL' && (
                      <button
                        onClick={() => setActiveFeedCategory('ALL')}
                        className="text-xs font-bold bg-surface-muted text-slate-800 px-4 py-2 rounded-xl border border-border"
                      >
                        View All Categories
                      </button>
                    )}
                    <button
                      onClick={() => setIsPostModalOpen(true)}
                      className="text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-white px-4 py-2 rounded-xl transition shadow-xs inline-flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-gold-400" />
                      <span>+ Post First Visual Drop</span>
                    </button>
                  </div>
                </div>
              ) : (
                filteredFeedPosts.map((post) => <FeedCard key={post.id} post={post} />)
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: MUMIN CLASSIFIEDS & NOBROKER (OLX-style High-Trust Utility) */}
        {/* ================================================================= */}
        {activeTab === 'CLASSIFIEDS' && (
          <div className="animate-in fade-in duration-150">
            {/* Classified Category Filter Pills */}
            <ClassifiedFilterBar />

            <div className="px-4 py-5 max-w-6xl mx-auto space-y-8">
              {/* SECTION A: NoBroker Community Real Estate Sub-section */}
              {(activeClassifiedCategory === 'ALL' ||
                activeClassifiedCategory === 'REAL_ESTATE_RENT' ||
                activeClassifiedCategory === 'REAL_ESTATE_SALE' ||
                activeClassifiedCategory === 'PG_FLATMATE') &&
                realEstateListings.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-900 text-gold-400 flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="font-serif font-black text-slate-900 text-base sm:text-lg">
                            NoBroker Community Real Estate
                          </h2>
                          <p className="text-xs text-slate-500">
                            Masjid-proximate flat rentals, sales & PG accommodations with zero brokerage
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                        {realEstateListings.length} Verified Properties
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {realEstateListings.map((item) => (
                        <ClassifiedCard key={item.id} listing={item} />
                      ))}
                    </div>
                  </section>
                )}

              {/* SECTION B: Relocation, Home Clearance & Commercial Gear */}
              {(activeClassifiedCategory === 'ALL' ||
                activeClassifiedCategory === 'HOME_CLEARANCE_FURNITURE' ||
                activeClassifiedCategory === 'COMMERCIAL_EQUIPMENT' ||
                activeClassifiedCategory === 'BABY_KIDS' ||
                activeClassifiedCategory === 'JOBS') &&
                generalClassifieds.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gold-600 text-slate-950 flex items-center justify-center font-bold">
                          <Home className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="font-serif font-black text-slate-900 text-base sm:text-lg">
                            Home Clearance, Commercial Gear & Jobs
                          </h2>
                          <p className="text-xs text-slate-500">
                            High-trust peer-to-peer clearance packages, catering degs & community careers
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 bg-surface-muted px-2.5 py-1 rounded-full border border-border">
                        {generalClassifieds.length} Listings
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {generalClassifieds.map((item) => (
                        <ClassifiedCard key={item.id} listing={item} />
                      ))}
                    </div>
                  </section>
                )}

              {/* Empty state if nothing matches */}
              {filteredClassifieds.length === 0 && (
                <div className="bg-surface rounded-3xl p-10 border border-border text-center space-y-3 max-w-md mx-auto">
                  <Home className="w-10 h-10 text-emerald-800 mx-auto opacity-40" />
                  <h3 className="font-serif font-bold text-slate-800 text-base">
                    No classified listings in this category
                  </h3>
                  <p className="text-xs text-slate-500">
                    Be the first to post a NoBroker flat rental or clearance package in {selectedLocality}.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setActiveClassifiedCategory('ALL')}
                      className="text-xs font-bold bg-surface-muted text-slate-800 px-4 py-2 rounded-xl border border-border"
                    >
                      Reset Category
                    </button>
                    <button
                      onClick={() => setIsPostModalOpen(true)}
                      className="text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-white px-4 py-2 rounded-xl shadow-xs"
                    >
                      + Post Classified Ad
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SELLER STUDIO & ROI ANALYTICS DASHBOARD           */}
        {/* ======================================================== */}
        {activeTab === 'SELLER_STUDIO' && (
          <div className="animate-in fade-in duration-150">
            <SellerDashboard />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ADMIN MODERATION & TRUST CONSOLE                  */}
        {/* ======================================================== */}
        {activeTab === 'ADMIN_TRUST' && (
          <div className="animate-in fade-in duration-150">
            <AdminConsole />
          </div>
        )}
      </main>

      {/* ALL INTERACTIVE MODALS */}
      <StoryViewerModal />
      <ClassifiedDetailModal />
      <ListingCreatorModal />
      <ITSVerificationWizard />
      <CitySelectorModal />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
