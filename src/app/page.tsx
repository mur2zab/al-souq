'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { OnboardWaitingScreen } from '@/components/auth/OnboardWaitingScreen';
import {
  Compass,
  Home,
  PlusCircle,
  Clock,
  ShieldCheck,
  Building,
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
    isAuthenticated,
    authChecked,
    setIsPostModalOpen,
    setIsVerificationModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'FEED' | 'CLASSIFIEDS' | 'SELLER_STUDIO' | 'ADMIN_TRUST'>('FEED');

  const router = useRouter();

  useEffect(() => {
    if (authChecked && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authChecked, isAuthenticated, router]);

  // Loading state while checking session or redirecting
  if (!authChecked || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-emerald-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Pending user gate: Must wait for Jamaat Admin approval before accessing marketplace
  if (currentUser.verificationStatus === 'PENDING' && currentUser.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-gold-500/30">
        <OnboardWaitingScreen />
      </div>
    );
  }

  // Filter feed posts
  const filteredFeedPosts = feedPosts.filter((post) => {
    if (selectedCityId !== 'all' && post.cityId !== selectedCityId) return false;
    if (
      selectedLocality &&
      selectedLocality !== 'All Localities' &&
      !post.mohallaName.toLowerCase().includes(selectedLocality.split('(')[0].trim().toLowerCase())
    ) {
      return false;
    }
    if (activeFeedCategory !== 'ALL' && post.category !== activeFeedCategory) return false;
    return true;
  });

  // Filter classified listings
  const filteredClassifieds = classifieds.filter((item) => {
    if (selectedCityId !== 'all' && item.cityId !== selectedCityId) return false;
    if (
      selectedLocality &&
      selectedLocality !== 'All Localities' &&
      !item.mohallaName.toLowerCase().includes(selectedLocality.split('(')[0].trim().toLowerCase())
    ) {
      return false;
    }
    if (activeClassifiedCategory !== 'ALL' && item.category !== activeClassifiedCategory) return false;
    return true;
  });

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
      {/* Sleek Header */}
      <Header />

      {/* Navigation Tabs */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Verification Notice (Compact single line) */}
      {currentUser.verificationStatus === 'PENDING' && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-amber-900">
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              ITS verification card submitted — pending admin review.
            </span>
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="text-xs font-bold text-amber-950 underline hover:no-underline"
            >
              View Status
            </button>
          </div>
        </div>
      )}

      {currentUser.verificationStatus === 'UNVERIFIED' && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-emerald-950">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Verify your 8-digit ITS card to get the Verified Mumin badge.
            </span>
            <button
              onClick={() => setIsVerificationModalOpen(true)}
              className="text-xs font-bold bg-emerald-900 text-white px-3 py-1 rounded-full shadow-xs transition active:scale-95"
            >
              Verify ITS →
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEW */}
      <main className="flex-1 w-full max-w-7xl mx-auto">
        {/* TAB 1: VISUAL SOUQ */}
        {activeTab === 'FEED' && (
          <div className="animate-in fade-in duration-150">
            <StoriesBar />
            <FeedFilterBar />

            <div className="max-w-xl mx-auto px-4 py-4">
              {filteredFeedPosts.length === 0 ? (
                <div className="bg-surface rounded-2xl p-8 border border-border text-center space-y-3 mt-3 shadow-subtle">
                  <Compass className="w-9 h-9 text-emerald-800 mx-auto opacity-40" />
                  <h3 className="font-serif font-bold text-slate-800 text-sm">
                    No posts in this category yet
                  </h3>
                  <button
                    onClick={() => setIsPostModalOpen(true)}
                    className="text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-white px-4 py-2 rounded-xl transition shadow-xs inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-gold-400" />
                    <span>+ Create First Post</span>
                  </button>
                </div>
              ) : (
                filteredFeedPosts.map((post) => <FeedCard key={post.id} post={post} />)
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CLASSIFIEDS */}
        {activeTab === 'CLASSIFIEDS' && (
          <div className="animate-in fade-in duration-150">
            <ClassifiedFilterBar />

            <div className="px-4 py-4 max-w-6xl mx-auto space-y-6">
              {/* Real Estate Section */}
              {(activeClassifiedCategory === 'ALL' ||
                activeClassifiedCategory === 'REAL_ESTATE_RENT' ||
                activeClassifiedCategory === 'REAL_ESTATE_SALE' ||
                activeClassifiedCategory === 'PG_FLATMATE') &&
                realEstateListings.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-emerald-800" />
                        <h2 className="font-serif font-bold text-slate-900 text-base">
                          Properties & Rentals
                        </h2>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {realEstateListings.length} listings
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {realEstateListings.map((item) => (
                        <ClassifiedCard key={item.id} listing={item} />
                      ))}
                    </div>
                  </section>
                )}

              {/* General Classifieds */}
              {(activeClassifiedCategory === 'ALL' ||
                activeClassifiedCategory === 'HOME_CLEARANCE_FURNITURE' ||
                activeClassifiedCategory === 'COMMERCIAL_EQUIPMENT' ||
                activeClassifiedCategory === 'BABY_KIDS' ||
                activeClassifiedCategory === 'JOBS') &&
                generalClassifieds.length > 0 && (
                  <section className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-emerald-800" />
                        <h2 className="font-serif font-bold text-slate-900 text-base">
                          Classifieds & Jobs
                        </h2>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {generalClassifieds.length} listings
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {generalClassifieds.map((item) => (
                        <ClassifiedCard key={item.id} listing={item} />
                      ))}
                    </div>
                  </section>
                )}

              {/* Empty state */}
              {filteredClassifieds.length === 0 && (
                <div className="bg-surface rounded-2xl p-8 border border-border text-center space-y-3 max-w-sm mx-auto shadow-subtle mt-4">
                  <Home className="w-9 h-9 text-emerald-800 mx-auto opacity-40" />
                  <h3 className="font-serif font-bold text-slate-800 text-sm">
                    No classified listings in this category
                  </h3>
                  <button
                    onClick={() => setIsPostModalOpen(true)}
                    className="text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-white px-4 py-2 rounded-xl transition shadow-xs inline-flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-gold-400" />
                    <span>+ Post First Ad</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SELLER STUDIO */}
        {activeTab === 'SELLER_STUDIO' && (
          <div className="animate-in fade-in duration-150">
            <SellerDashboard />
          </div>
        )}

        {/* TAB 4: ADMIN CONSOLE */}
        {activeTab === 'ADMIN_TRUST' && (
          <div className="animate-in fade-in duration-150">
            <AdminConsole />
          </div>
        )}
      </main>

      {/* Modals */}
      <StoryViewerModal />
      <ClassifiedDetailModal />
      <ListingCreatorModal />
      <ITSVerificationWizard />
      <CitySelectorModal />
    </div>
  );
}
