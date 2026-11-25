'use client';

import React, { useState } from 'react';
import { FeedPost } from '@/types';
import { SmartDescription } from '@/components/common/SmartDescription';
import { useApp } from '@/context/AppContext';
import {
  Heart,
  Bookmark,
  Share2,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Video,
  Check,
} from 'lucide-react';

interface FeedCardProps {
  post: FeedPost;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post }) => {
  const {
    toggleLikePost,
    toggleSavePost,
    handleWhatsAppInquiry,
    isVerified,
    setIsVerificationModalOpen,
  } = useApp();

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleWhatsAppClick = () => {
    if (!isVerified) {
      setIsVerificationModalOpen(true);
      return;
    }
    handleWhatsAppInquiry({
      recipientPhone: post.whatsappNumber,
      itemType: 'POST',
      title: post.caption.split('\n')[0].replace(/[^a-zA-Z0-9 ]/g, '').trim(),
      price: post.priceInr,
      location: `${post.cityName} (${post.mohallaName})`,
      itemId: post.id,
      sellerId: post.authorId || post.businessId,
      sellerName: post.businessName,
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <article className="bg-surface rounded-2xl border border-border shadow-subtle overflow-hidden mb-5 transition hover:shadow-elevated">
      {/* Business Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={post.businessAvatar}
              alt={post.businessName}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80';
              }}
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
            {post.hasRazaBadge && (
              <div
                className="absolute -bottom-1 -right-1 bg-gold-500 text-slate-950 p-0.5 rounded-full border border-surface shadow-xs"
                title="Raza Verified Community Business"
              >
                <ShieldCheck className="w-3 h-3 fill-slate-950 stroke-gold-400" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif font-bold text-slate-900 text-sm leading-tight hover:text-emerald-900 cursor-pointer">
                {post.businessName}
              </h3>
              {post.hasRazaBadge && (
                <span className="text-[10px] bg-gold-50 text-gold-800 font-bold px-1.5 py-0.5 rounded border border-gold-200">
                  Raza Badge
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-700" />
              <span className="truncate max-w-[200px]">
                {post.cityName} • {post.mohallaName}
              </span>
            </div>
          </div>
        </div>

        {/* Available Today / Deadline Indicator */}
        {post.isAvailableToday && (
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-full text-[11px] font-semibold">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span className="hidden sm:inline">
              {post.todayDropDeadline || 'Fresh Today'}
            </span>
            <span className="sm:hidden">Today</span>
          </div>
        )}
      </div>

      {/* Media Carousel / Reel Video */}
      <div className="relative bg-slate-950 aspect-square sm:aspect-[4/3] w-full overflow-hidden select-none">
        <img
          src={post.mediaUrls[activeMediaIndex] || post.mediaUrls[0]}
          alt={post.caption.slice(0, 30)}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1080&q=80';
          }}
          className="w-full h-full object-cover transition-all duration-300"
        />

        {/* Post Type Badge */}
        {post.postType === 'REEL_VIDEO' && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Video className="w-3 h-3 text-gold-400" />
            <span>Video Reel</span>
          </div>
        )}

        {/* Price Tag Overlay */}
        {post.priceInr && (
          <div className="absolute top-3 right-3 bg-emerald-950/85 backdrop-blur-md text-gold-300 font-extrabold text-xs px-3 py-1 rounded-full border border-gold-500/40 shadow-gold">
            ₹{post.priceInr.toLocaleString('en-IN')}
          </div>
        )}

        {/* Carousel Arrows (if multi-image) */}
        {post.mediaUrls.length > 1 && (
          <>
            {activeMediaIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaIndex((prev) => prev - 1);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {activeMediaIndex < post.mediaUrls.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMediaIndex((prev) => prev + 1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {/* Carousel Dots */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {post.mediaUrls.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === activeMediaIndex ? 'bg-gold-400 w-3' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            onClick={() => toggleLikePost(post.id)}
            className="flex items-center gap-1.5 text-slate-700 hover:text-red-500 transition active:scale-90 group"
          >
            <Heart
              className={`w-5 h-5 transition ${
                post.isLiked ? 'fill-red-500 text-red-500 scale-110' : 'group-hover:text-red-500'
              }`}
            />
            <span className="text-xs font-semibold text-slate-600">
              {post.likesCount}
            </span>
          </button>

          {/* Save / Bookmark */}
          <button
            onClick={() => toggleSavePost(post.id)}
            className="text-slate-700 hover:text-emerald-900 transition active:scale-90"
            title="Save for Later"
          >
            <Bookmark
              className={`w-5 h-5 ${
                post.isSaved ? 'fill-emerald-800 text-emerald-800' : ''
              }`}
            />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:text-emerald-900 transition active:scale-90 rounded-full hover:bg-slate-100"
            title={copiedLink ? 'Link copied!' : 'Share Link'}
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-700" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* WhatsApp Lead Counter */}
        <div className="text-[11px] text-slate-500 font-medium">
          <span className="font-bold text-emerald-950">{post.whatsappClicksCount}</span> inquiries
        </div>
      </div>

      {/* Caption & Tags */}
      <div className="px-4 py-3 space-y-2.5">
        <SmartDescription content={post.caption} className="text-sm" />

        {/* Category Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-surface-muted text-emerald-950 px-2 py-0.5 rounded-md font-medium border border-border/80"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Prominent WhatsApp CTA Button */}
        <div className="pt-2">
          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95 group"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950 stroke-none" />
            <span className="text-xs">
              {isVerified
                ? 'Order / Inquire on WhatsApp'
                : 'Verify ITS to Inquire on WhatsApp'}
            </span>
          </button>
          {!isVerified && (
            <p className="text-[10px] text-slate-400 text-center mt-1">
              🔒 Privacy guardrail: Verified ITS Mumineen can connect directly with community makers.
            </p>
          )}
        </div>
      </div>
    </article>
  );
};
