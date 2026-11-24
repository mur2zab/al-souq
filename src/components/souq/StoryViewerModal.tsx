'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Flame,
} from 'lucide-react';

export const StoryViewerModal: React.FC = () => {
  const {
    stories,
    activeStoryIndex,
    closeStory,
    openStory,
    handleWhatsAppInquiry,
    isVerified,
    setIsVerificationModalOpen,
  } = useApp();

  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  // Auto-advance story timer
  useEffect(() => {
    if (activeStoryIndex === null || isPaused) return;

    setProgress(0);
    const interval = 50; // update every 50ms
    const totalDuration = 6000; // 6 seconds per story
    const increment = (interval / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          // Advance to next or close
          if (activeStoryIndex < stories.length - 1) {
            openStory(activeStoryIndex + 1);
          } else {
            closeStory();
          }
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeStoryIndex, isPaused, stories.length]);

  if (activeStoryIndex === null || !currentStory) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex > 0) {
      openStory(activeStoryIndex - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeStoryIndex < stories.length - 1) {
      openStory(activeStoryIndex + 1);
    } else {
      closeStory();
    }
  };

  const handleOrder = () => {
    if (!isVerified) {
      setIsVerificationModalOpen(true);
      return;
    }
    handleWhatsAppInquiry({
      recipientPhone: currentStory.whatsappNumber,
      itemType: 'STORY',
      title: `${currentStory.businessName} - ${currentStory.caption.slice(0, 40)}`,
      price: currentStory.priceInr,
      location: `${currentStory.cityName} (${currentStory.mohallaName})`,
      itemId: currentStory.id,
      sellerId: currentStory.businessId,
      sellerName: currentStory.businessName,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none"
      onClick={closeStory}
    >
      <div
        className="relative w-full max-w-sm h-[92vh] sm:h-[85vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-white/10"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Progress Bars for all stories */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {stories.map((s, idx) => (
            <div
              key={s.id}
              className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-gold-400 transition-all duration-75"
                style={{
                  width:
                    idx < activeStoryIndex
                      ? '100%'
                      : idx === activeStoryIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Top Business Bar */}
        <div className="absolute top-7 left-3 right-3 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/15">
            <img
              src={currentStory.businessAvatar}
              alt={currentStory.businessName}
              className="w-7 h-7 rounded-full object-cover border border-gold-400"
            />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-white text-xs font-bold leading-tight">
                  {currentStory.businessName}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-gold-400 fill-gold-400/20" />
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/80">
                <MapPin className="w-2.5 h-2.5 text-gold-300" />
                <span className="truncate max-w-[120px]">
                  {currentStory.cityName} • {currentStory.mohallaName}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={closeStory}
            className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:text-white flex items-center justify-center border border-white/15 transition active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Main Image */}
        <div className="relative flex-1 w-full h-full">
          <img
            src={currentStory.mediaUrl}
            alt="Story Drop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

          {/* Left/Right Tap Hotspots */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-16 bottom-28 w-1/3 z-20 flex items-center justify-start pl-2 text-white/40 hover:text-white/80 transition"
          >
            {activeStoryIndex > 0 && <ChevronLeft className="w-8 h-8" />}
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-16 bottom-28 w-1/3 z-20 flex items-center justify-end pr-2 text-white/40 hover:text-white/80 transition"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>

        {/* Bottom Details & CTA Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-30 p-4 space-y-3 bg-gradient-to-t from-black via-black/80 to-transparent">
          {/* Availability & Price Tag */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 bg-amber-500/90 text-slate-950 font-bold px-2.5 py-1 rounded-full text-xs shadow-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{currentStory.orderDeadline}</span>
            </div>
            {currentStory.priceInr && (
              <div className="bg-emerald-950/80 border border-gold-400/50 text-gold-300 font-bold px-3 py-1 rounded-full text-xs">
                ₹{currentStory.priceInr.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          {/* Caption */}
          <p className="text-white text-xs leading-relaxed line-clamp-3 font-normal drop-shadow-sm">
            {currentStory.caption}
          </p>

          {/* Order on WhatsApp CTA */}
          <button
            onClick={handleOrder}
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-slate-950 stroke-none" />
            <span className="text-xs">
              {isVerified ? 'Order Flash Drop on WhatsApp' : 'Verify ITS to Order on WhatsApp'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
