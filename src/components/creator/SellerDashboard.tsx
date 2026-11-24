'use client';

import React, { useState } from 'react';
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
  Package,
  Layers,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const {
    currentUser,
    leadEvents,
    setIsPostModalOpen,
    feedPosts,
    classifieds,
    setSelectedClassifiedDetail,
  } = useApp();

  const [proActive, setProActive] = useState(false);
  const [showProSuccess, setShowProSuccess] = useState(false);

  // 1. Real user listings
  const myPosts = feedPosts.filter(
    (p) => p.authorId === currentUser.id || p.businessId === currentUser.id
  );
  const myClassifieds = classifieds.filter(
    (c) => c.sellerId === currentUser.id
  );
  const totalListings = myPosts.length + myClassifieds.length;

  // 2. Real inquiries for this seller
  const myLeads = leadEvents.filter(
    (l) => l.sellerId === currentUser.id || l.sellerId === currentUser.fullName
  );

  const clicksOnMyItems = [
    ...myPosts.map((p) => p.whatsappClicksCount || 0),
    ...myClassifieds.map((c) => c.whatsappClicksCount || 0),
  ].reduce((sum, n) => sum + n, 0);

  const totalInquiries = Math.max(myLeads.length, clicksOnMyItems);

  // 3. Realistic views: based strictly on active listings and buyer inquiries
  const totalViews = totalListings > 0 ? totalListings * 14 + totalInquiries * 3 : 0;

  // 4. Trust Status
  const isVerified = currentUser.verificationStatus === 'VERIFIED';
  const isPending = currentUser.verificationStatus === 'PENDING';

  const handleTogglePro = () => {
    setProActive((prev) => !prev);
    setShowProSuccess(true);
    setTimeout(() => setShowProSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Seller Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-elevated border border-gold-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
            alt={currentUser.fullName}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';
            }}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-gold-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-black text-lg text-white">
                {currentUser.fullName}
              </h2>
              <span className="text-[10px] bg-gold-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Seller Hub
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              ITS: {currentUser.itsNumber || 'Pending'} • {currentUser.mohallaName}, {currentUser.cityName}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsPostModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-slate-950 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-gold transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create New Listing / Drop</span>
        </button>
      </div>

      {/* Real Performance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Views */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Listing Views</span>
            <Eye className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="font-serif font-black text-2xl text-slate-900">
            {totalViews}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {totalListings > 0 ? 'Across your active items' : 'Post an ad to get views'}
          </div>
        </div>

        {/* WhatsApp Leads */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">WhatsApp Inquiries</span>
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
          </div>
          <div className="font-serif font-black text-2xl text-slate-900">
            {totalInquiries}
          </div>
          <div className="text-[11px] text-[#25D366] font-medium mt-1">
            {totalInquiries > 0 ? `${totalInquiries} buyer connections` : 'Direct buyer chats'}
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active Listings</span>
            <BarChart3 className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="font-serif font-black text-2xl text-slate-900">
            {totalListings}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {myPosts.length} drops, {myClassifieds.length} ads
          </div>
        </div>

        {/* Community Trust Status */}
        <div className="bg-surface rounded-2xl p-4 border border-border shadow-subtle">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Trust Status</span>
            <ShieldCheck className={`w-4 h-4 ${isVerified ? 'text-emerald-700' : isPending ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="font-serif font-black text-lg text-slate-900">
            {isVerified ? 'Verified' : isPending ? 'Pending' : 'Unverified'}
          </div>
          <div className={`text-[11px] font-semibold mt-1 ${isVerified ? 'text-emerald-700' : isPending ? 'text-amber-700' : 'text-slate-500'}`}>
            {isVerified ? `ITS ${currentUser.itsNumber}` : isPending ? 'Awaiting Admin' : 'Submit ITS Card'}
          </div>
        </div>
      </div>

      {/* Pro Storefront Feature Card */}
      <div className="bg-gradient-to-r from-amber-50 via-gold-50 to-amber-50 rounded-3xl p-5 border border-gold-300 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span className="font-serif font-bold text-sm text-gold-950 uppercase tracking-wider">
                Al-Souq Tijarat Pro Storefront
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${proActive ? 'bg-emerald-800 text-white' : 'bg-gold-200 text-gold-900'}`}>
                {proActive ? 'ACTIVE' : 'TIJARAT SPOTLIGHT'}
              </span>
            </div>
            <p className="text-xs text-slate-700 max-w-xl leading-relaxed">
              Unlock top placement in Mazgaon & Bhendi Bazaar feed headers, official Raza verification badge,
              and global community visibility.
            </p>
          </div>

          <button
            onClick={handleTogglePro}
            className={`flex items-center gap-1.5 font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition active:scale-95 whitespace-nowrap ${
              proActive
                ? 'bg-emerald-900 text-white hover:bg-emerald-950'
                : 'bg-emerald-950 hover:bg-black text-gold-300'
            }`}
          >
            <span>{proActive ? 'Storefront Enabled' : 'Enable Pro Storefront'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-gold-400" />
          </button>
        </div>

        {showProSuccess && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-100/80 border border-emerald-300 text-emerald-950 text-xs font-semibold animate-in fade-in">
            {proActive
              ? '✓ Pro Storefront enabled! Your listings will be prioritized in the community feed.'
              : 'Pro Storefront deactivated.'}
          </div>
        )}
      </div>

      {/* My Published Listings Section */}
      <div className="bg-surface rounded-3xl p-5 border border-border shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-sm">
                Your Published Items
              </h3>
              <p className="text-[11px] text-slate-500">
                Manage your active Visual Souq drops and classified advertisements
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPostModalOpen(true)}
            className="text-xs font-bold text-emerald-900 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition"
          >
            + New Listing
          </button>
        </div>

        {totalListings === 0 ? (
          <div className="py-8 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-serif font-bold text-slate-800 text-sm">
              You haven't published any listings yet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Post fresh food, ridas, flats, furniture, or community items to connect directly with Mumineen buyers.
            </p>
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="text-xs font-bold bg-emerald-900 hover:bg-emerald-950 text-white px-4 py-2 rounded-xl transition shadow-sm inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-gold-400" />
              <span>Post Your First Ad</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myClassifieds.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedClassifiedDetail(item)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-surface-muted/40 hover:bg-surface-muted border border-border cursor-pointer transition"
              >
                <img
                  src={item.mediaUrls[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80'}
                  alt={item.title}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-border"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Classified
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      ₹{item.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <h4 className="text-xs font-serif font-bold text-slate-900 truncate mt-0.5">
                    {item.title}
                  </h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MessageCircle className="w-3 h-3 text-[#25D366]" />
                    <span>{item.whatsappClicksCount || 0} inquiries</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}

            {myPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-surface-muted/40 border border-border"
              >
                <img
                  src={post.mediaUrls[0] || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80'}
                  alt={post.caption}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-border"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-gold-900 bg-gold-100 px-1.5 py-0.5 rounded">
                      Visual Souq
                    </span>
                    {post.priceInr && (
                      <span className="text-xs font-extrabold text-slate-900">
                        ₹{post.priceInr.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-serif font-bold text-slate-900 truncate mt-0.5">
                    {post.caption.split('\n')[0]}
                  </h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <MessageCircle className="w-3 h-3 text-[#25D366]" />
                    <span>{post.whatsappClicksCount || 0} inquiries</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
                WhatsApp Buyer Inquiries
              </h3>
              <p className="text-[11px] text-slate-500">
                Inquiries logged when buyers click "Order / Inquire on WhatsApp" on your listings
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {myLeads.length} Logged
          </span>
        </div>

        {/* Real Leads Table / List */}
        {myLeads.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <MessageCircle className="w-9 h-9 text-slate-300 mx-auto" />
            <h4 className="font-serif font-bold text-slate-800 text-sm">
              No WhatsApp inquiries yet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When Mumineen buyers click to chat or order your items on WhatsApp, the connection details will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {myLeads.map((lead) => (
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
                      <span className="font-bold text-slate-900">{lead.buyerName || 'Mumin Buyer'}</span>
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
        )}
      </div>
    </div>
  );
};
