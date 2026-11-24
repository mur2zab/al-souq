'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { maskPhoneNumber } from '@/utils/whatsapp';
import {
  X,
  MapPin,
  ShieldCheck,
  Building2,
  Bookmark,
  Share2,
  MessageCircle,
  Phone,
  CheckCircle2,
  Lock,
  Utensils,
  Layers,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Check,
} from 'lucide-react';

export const ClassifiedDetailModal: React.FC = () => {
  const {
    selectedClassifiedDetail,
    setSelectedClassifiedDetail,
    toggleSaveClassified,
    handleWhatsAppInquiry,
    isVerified,
    setIsVerificationModalOpen,
  } = useApp();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!selectedClassifiedDetail) return null;
  const listing = selectedClassifiedDetail;

  const isRealEstate =
    listing.category === 'REAL_ESTATE_RENT' ||
    listing.category === 'REAL_ESTATE_SALE' ||
    listing.category === 'PG_FLATMATE';

  const handleWhatsAppChat = () => {
    if (!isVerified) {
      setIsVerificationModalOpen(true);
      return;
    }
    handleWhatsAppInquiry({
      recipientPhone: listing.sellerPhone,
      itemType: 'CLASSIFIED',
      title: listing.title,
      price: listing.price,
      location: `${listing.cityName} (${listing.mohallaName})`,
      itemId: listing.id,
      sellerName: listing.sellerName,
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setSelectedClassifiedDetail(null)}
    >
      <div
        className="bg-surface w-full max-w-2xl rounded-3xl shadow-elevated border border-border overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-surface-muted/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {listing.category.replace(/_/g, ' ')}
            </span>
            {isRealEstate && (
              <span className="text-xs font-bold text-gold-800 bg-gold-100 px-2 py-0.5 rounded-full border border-gold-300">
                Zero Brokerage
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:text-emerald-900 hover:bg-slate-200/50 transition"
              title={copiedLink ? 'Link copied!' : 'Share listing'}
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-700" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => toggleSaveClassified(listing.id)}
              className="p-1.5 rounded-full text-slate-500 hover:text-emerald-900 hover:bg-slate-200/50 transition"
              title="Save listing"
            >
              <Bookmark
                className={`w-4 h-4 ${listing.isSaved ? 'fill-emerald-800 text-emerald-800' : ''}`}
              />
            </button>
            <button
              onClick={() => setSelectedClassifiedDetail(null)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Main Photo Gallery */}
          <div className="space-y-2">
            <div className="relative aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden shadow-sm">
              <img
                src={listing.mediaUrls[activePhotoIdx] || listing.mediaUrls[0]}
                alt={listing.title}
                className="w-full h-full object-cover transition-all duration-200"
              />

              {listing.mediaUrls.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : listing.mediaUrls.length - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActivePhotoIdx((prev) => (prev < listing.mediaUrls.length - 1 ? prev + 1 : 0))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {listing.mediaUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {listing.mediaUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition ${
                      activePhotoIdx === idx ? 'border-emerald-800 scale-105' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={url} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Title Header */}
          <div>
            <div className="flex items-baseline justify-between flex-wrap gap-2">
              <div className="font-serif font-black text-2xl text-emerald-950">
                ₹{listing.price.toLocaleString('en-IN')}
                {listing.category === 'REAL_ESTATE_RENT' && (
                  <span className="text-sm font-normal text-slate-500"> / month</span>
                )}
                {listing.category === 'PG_FLATMATE' && (
                  <span className="text-sm font-normal text-slate-500"> / month</span>
                )}
              </div>
              {listing.isNegotiable && (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                  Negotiable
                </span>
              )}
            </div>

            <h2 className="font-serif font-bold text-lg text-slate-900 mt-1 leading-snug">
              {listing.title}
            </h2>

            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-medium">
                {listing.cityName} • {listing.mohallaName}
              </span>
            </div>
          </div>

          {/* Real Estate Specific Highlights Table */}
          {listing.realEstateMeta && (
            <div className="bg-surface-muted/60 rounded-2xl p-4 border border-border space-y-3">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-800" />
                <span>Community Real Estate Details</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-surface p-2.5 rounded-xl border border-border">
                  <span className="text-slate-400 block text-[10px] uppercase">Configuration</span>
                  <span className="font-bold text-slate-900">{listing.realEstateMeta.bhk}</span>
                </div>

                <div className="bg-surface p-2.5 rounded-xl border border-border">
                  <span className="text-slate-400 block text-[10px] uppercase">Carpet Area</span>
                  <span className="font-bold text-slate-900">{listing.realEstateMeta.carpetArea} sq.ft</span>
                </div>

                <div className="bg-surface p-2.5 rounded-xl border border-border">
                  <span className="text-slate-400 block text-[10px] uppercase">Brokerage</span>
                  <span className="font-bold text-emerald-800">{listing.realEstateMeta.brokerage}</span>
                </div>

                <div className="bg-surface p-2.5 rounded-xl border border-border sm:col-span-2">
                  <span className="text-slate-400 block text-[10px] uppercase">Masjid Proximity</span>
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{listing.realEstateMeta.nearMasjid}</span>
                  </span>
                </div>

                <div className="bg-surface p-2.5 rounded-xl border border-border">
                  <span className="text-slate-400 block text-[10px] uppercase">Thaali Friendly</span>
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-emerald-700" />
                    <span>{listing.realEstateMeta.thaaliFriendly ? 'Yes (FMB Ready)' : 'No'}</span>
                  </span>
                </div>

                {listing.realEstateMeta.deposit > 0 && (
                  <div className="bg-surface p-2.5 rounded-xl border border-border">
                    <span className="text-slate-400 block text-[10px] uppercase">Deposit</span>
                    <span className="font-bold text-slate-900">₹{listing.realEstateMeta.deposit.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {listing.realEstateMeta.furnishing && (
                  <div className="bg-surface p-2.5 rounded-xl border border-border">
                    <span className="text-slate-400 block text-[10px] uppercase">Furnishing</span>
                    <span className="font-bold text-slate-900">{listing.realEstateMeta.furnishing}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Job Specific Highlights */}
          {listing.jobMeta && (
            <div className="bg-surface-muted/60 rounded-2xl p-4 border border-border space-y-3">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-emerald-800" />
                <span>Job Specification</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-surface p-2.5 rounded-xl border border-border">
                  <span className="text-slate-400 block text-[10px] uppercase">Company</span>
                  <span className="font-bold text-slate-900">{listing.jobMeta.company}</span>
                </div>
                <div className="bg-surface p-2.5 rounded-xl border border-border">
                  <span className="text-slate-400 block text-[10px] uppercase">Work Timing</span>
                  <span className="font-bold text-slate-900">{listing.jobMeta.timing}</span>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Description & Highlights
            </h4>
            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-surface-muted/30 p-3.5 rounded-xl border border-border/60">
              {listing.description}
            </p>
          </div>

          {/* Seller Trust Profile & Contact Box */}
          <div className="bg-gradient-to-br from-emerald-950 to-emerald-900 text-white rounded-2xl p-4 shadow-elevated border border-gold-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <img
                  src={listing.sellerAvatar}
                  alt={listing.sellerName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gold-400 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-sm text-white">
                      {listing.sellerName}
                    </span>
                    {listing.sellerItsVerified && (
                      <ShieldCheck className="w-4 h-4 text-gold-400 fill-gold-400/20" />
                    )}
                  </div>
                  <div className="text-[11px] text-emerald-200">
                    Verified ITS Member since {listing.sellerVerifiedYear}
                  </div>
                  <div className="text-[10px] text-emerald-300/80">
                    {listing.mohallaName}, {listing.cityName}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-gold-300 font-bold uppercase tracking-wider">
                  Trust Status
                </div>
                <div className="text-xs text-emerald-100 font-medium">100% Verified</div>
              </div>
            </div>

            {/* Privacy Guardrail Phone Display */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400" />
                <span>
                  {isVerified
                    ? listing.sellerPhone
                    : maskPhoneNumber(listing.sellerPhone)}
                </span>
              </div>
              {!isVerified && (
                <span className="text-[10px] text-gold-300 font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Hidden for Unverified</span>
                </span>
              )}
            </div>

            {/* Direct CTA */}
            <button
              onClick={handleWhatsAppChat}
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-slate-950 stroke-none" />
              <span className="text-xs sm:text-sm">
                {isVerified
                  ? 'Chat with Owner on WhatsApp (Zero Brokerage)'
                  : 'Verify ITS to Chat on WhatsApp'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
