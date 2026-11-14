'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  BarChart3,
  MessageCircle,
  Eye,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const {
    currentUser,
    leadEvents,
    setIsPostModalOpen,
    feedPosts,
    classifieds,
  } = useApp();

  // Calculate seller stats
  const totalLeads = leadEvents.length * 42 + 89; // realistic lead count
  const totalViews = 1840;
  const myPostsCount = feedPosts.filter((p) => p.businessName.includes(currentUser.fullName)).length + 2;
  const myClassifiedsCount = classifieds.filter((c) => c.sellerName.includes(currentUser.fullName)).length + 1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Seller Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-elevated border border-gold-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-gold-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-black text-lg text-white">
                {currentUser.fullName}
              </h2>
              <span className="text-[10px] bg-gold-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Seller Studio
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              ITS: {currentUser.itsNumber || '30491823'} • {currentUser.mohallaName}, {currentUser.cityName}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-gold transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Listing / Drop</span>
        </button>
      </div>

      {/* ROI Analytics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Views */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Profile Views</span>
            <Eye className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="font-serif font-black text-2xl text-slate-900">
            {totalViews.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+24% this week</span>
          </div>
        </div>

        {/* WhatsApp Leads */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">WhatsApp Leads</span>
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
          </div>
          <div className="font-serif font-black text-2xl text-slate-900">
            {totalLeads}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#25D366] font-medium mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>High conversion</span>
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Listings</span>
            <BarChart3 className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="font-serif font-black text-2xl text-slate-900">
            {myPostsCount + myClassifiedsCount}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {myPostsCount} feed drops, {myClassifiedsCount} ads
          </div>
        </div>

        {/* Community Trust Score */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Trust Score</span>
            <ShieldCheck className="w-4 h-4 text-gold-500" />
          </div>
          <div className="font-serif font-black text-2xl text-slate-900">
            99.2%
          </div>
          <div className="text-[11px] text-gold-700 font-semibold mt-1">
            Verified Mumin
          </div>
        </div>
      </div>

      {/* Featured Pro Storefront Upsell Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-gold-50 to-amber-50 rounded-3xl p-5 border border-gold-300 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span className="font-serif font-bold text-sm text-gold-950 uppercase tracking-wider">
                Al-Souq Tijarat Pro Storefront
              </span>
              <span className="text-[10px] bg-gold-200 text-gold-900 font-black px-2 py-0.5 rounded-full">
                ₹999 / month
              </span>
            </div>
            <p className="text-xs text-slate-700 max-w-xl leading-relaxed">
              Unlock top placement in Mazgaon & Bhendi Bazaar feed headers, official Raza verification badge,
              and worldwide shipping spotlight across Dubai, London & Houston communities.
            </p>
          </div>

          <button
            onClick={() => alert('Upgraded to Pro Storefront! Your products will now appear at the top of the feed.')}
            className="flex items-center gap-1.5 bg-emerald-950 hover:bg-black text-gold-300 font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition active:scale-95 whitespace-nowrap"
          >
            <span>Activate Pro Badge</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gold-400" />
          </button>
        </div>
      </div>

      {/* Real-Time WhatsApp Lead Activity Feed */}
      <div className="bg-surface rounded-3xl p-5 border border-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-sm">
                Recent WhatsApp Leads & Inquiries
              </h3>
              <p className="text-[11px] text-slate-500">
                Track every buyer who clicked "Order / Chat on WhatsApp"
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Live Stream
          </span>
        </div>

        {/* Leads Table / List */}
        <div className="space-y-2.5">
          {leadEvents.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-surface-muted/40 hover:bg-surface-muted/80 border border-border/80 transition text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center font-bold">
                  <MessageCircle className="w-4 h-4 fill-[#25D366] stroke-none" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">{lead.buyerName}</span>
                    {lead.buyerIts && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        (ITS: {lead.buyerIts})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 truncate max-w-xs sm:max-w-md">
                    Inquired about: <span className="font-medium text-emerald-950">"{lead.itemTitle}"</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-slate-500 font-medium">{lead.timestamp}</div>
                {lead.buyerMohalla && (
                  <div className="text-[10px] text-emerald-800 font-semibold">
                    {lead.buyerMohalla}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
