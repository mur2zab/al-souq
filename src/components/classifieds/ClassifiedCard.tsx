'use client';

import React from 'react';
import { ClassifiedListing } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  MapPin,
  ShieldCheck,
  Building2,
  Bookmark,
  Sparkles,
  Utensils,
  Eye,
  MessageCircle,
} from 'lucide-react';

interface ClassifiedCardProps {
  listing: ClassifiedListing;
}

export const ClassifiedCard: React.FC<ClassifiedCardProps> = ({ listing }) => {
  const { setSelectedClassifiedDetail, toggleSaveClassified } = useApp();

  const isRealEstate =
    listing.category === 'REAL_ESTATE_RENT' ||
    listing.category === 'REAL_ESTATE_SALE' ||
    listing.category === 'PG_FLATMATE';

  const categoryLabelMap: Record<string, string> = {
    REAL_ESTATE_RENT: 'Rental Flat',
    REAL_ESTATE_SALE: 'Property Sale',
    PG_FLATMATE: 'PG / Flatmate',
    HOME_CLEARANCE_FURNITURE: 'Home Clearance',
    COMMERCIAL_EQUIPMENT: 'Commercial & Degs',
    BABY_KIDS: 'Baby & Kids',
    JOBS: 'Community Job',
  };

  return (
    <div
      onClick={() => setSelectedClassifiedDetail(listing)}
      className="bg-surface rounded-2xl border border-border shadow-subtle hover:shadow-elevated transition-all duration-200 overflow-hidden flex flex-col cursor-pointer group hover:-translate-y-0.5"
    >
      {/* Image Preview & Badges */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={listing.mediaUrls[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {categoryLabelMap[listing.category] || listing.category}
        </div>

        {/* Real Estate Specific Badges */}
        {isRealEstate && (
          <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1">
            <span className="bg-emerald-950/90 backdrop-blur-md text-gold-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-gold-500/30">
              Zero Brokerage
            </span>
            {listing.realEstateMeta?.thaaliFriendly && (
              <span className="bg-emerald-900/90 backdrop-blur-md text-emerald-200 text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                <Utensils className="w-2.5 h-2.5" />
                <span>Thaali Friendly</span>
              </span>
            )}
          </div>
        )}

        {/* Save Bookmark button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveClassified(listing.id);
          }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-surface/80 backdrop-blur-md text-slate-700 hover:text-emerald-900 flex items-center justify-center transition active:scale-90"
        >
          <Bookmark
            className={`w-4 h-4 ${listing.isSaved ? 'fill-emerald-800 text-emerald-800' : ''}`}
          />
        </button>
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Condition */}
          <div className="flex items-center justify-between mb-1">
            <div className="font-serif font-extrabold text-base text-emerald-950">
              ₹{listing.price.toLocaleString('en-IN')}
              {listing.category === 'REAL_ESTATE_RENT' && (
                <span className="text-xs font-normal text-slate-500"> / month</span>
              )}
              {listing.category === 'PG_FLATMATE' && (
                <span className="text-xs font-normal text-slate-500"> / person</span>
              )}
            </div>

            {listing.condition !== 'NOT_APPLICABLE' && (
              <span className="text-[10px] font-bold bg-surface-muted text-slate-600 px-1.5 py-0.5 rounded border border-border">
                {listing.condition.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="font-serif font-bold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-900 transition mb-1.5">
            {listing.title}
          </h4>

          {/* Near Masjid Highlight */}
          {listing.realEstateMeta?.nearMasjid && (
            <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1 mb-2">
              <Building2 className="w-3 h-3 text-emerald-700" />
              <span className="truncate">{listing.realEstateMeta.nearMasjid}</span>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-2">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="truncate">{listing.cityName} • {listing.mohallaName}</span>
          </div>
        </div>

        {/* Seller Trust Bar */}
        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <img
              src={listing.sellerAvatar}
              alt={listing.sellerName}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-slate-700 font-medium truncate max-w-[110px]">
              {listing.sellerName}
            </span>
            {listing.sellerItsVerified && (
              <span title={`Verified ITS Member since ${listing.sellerVerifiedYear}`}>
                <ShieldCheck className="w-3.5 h-3.5 text-gold-500 fill-gold-100" />
              </span>
            )}
          </div>

          <span className="text-emerald-800 font-bold hover:underline">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
};
