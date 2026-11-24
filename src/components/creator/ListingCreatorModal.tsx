'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { BusinessCategory, ClassifiedCategory, ClassifiedCondition } from '@/types';
import { compressImageClientSide, CompressionResult } from '@/utils/imageCompression';
import { CITIES } from '@/data/cities';
import {
  X,
  PlusCircle,
  Upload,
  Compass,
  Home,
  Clock,
  Sparkles,
  Building2,
  Utensils,
  Check,
  Zap,
} from 'lucide-react';

export const ListingCreatorModal: React.FC = () => {
  const {
    isPostModalOpen,
    setIsPostModalOpen,
    currentUser,
    addNewPost,
    addNewClassified,
    isVerified,
    setIsVerificationModalOpen,
  } = useApp();

  const [creatorMode, setCreatorMode] = useState<'VISUAL_FEED' | 'CLASSIFIED'>('VISUAL_FEED');

  // Common Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [cityId, setCityId] = useState(currentUser.cityId || 'mumbai');
  const [mohalla, setMohalla] = useState(currentUser.mohallaName || 'Mazgaon (Hasanabad / Saifee Park)');
  const [whatsappNumber, setWhatsappNumber] = useState(currentUser.phone || '+91 98200 11223');

  // Visual Feed Specific Fields
  const [businessCategory, setBusinessCategory] = useState<BusinessCategory>('FOOD_CATERING');
  const [isAvailableToday, setIsAvailableToday] = useState(true);
  const [todayDropDeadline, setTodayDropDeadline] = useState('Order before 5:00 PM');
  const [tags, setTags] = useState('Thaali, Special, Mazgaon');

  // Classified Specific Fields
  const [classifiedCategory, setClassifiedCategory] = useState<ClassifiedCategory>('REAL_ESTATE_RENT');
  const [condition, setCondition] = useState<ClassifiedCondition>('LIKE_NEW');
  const [bhk, setBhk] = useState('2 BHK');
  const [carpetArea, setCarpetArea] = useState('780');
  const [nearMasjid, setNearMasjid] = useState('Uzri Masjid (3 mins walk)');
  const [thaaliFriendly, setThaaliFriendly] = useState(true);
  const [deposit, setDeposit] = useState('100000');
  const [furnishing, setFurnishing] = useState<'Fully Furnished' | 'Semi-Furnished' | 'Unfurnished'>('Semi-Furnished');

  // Image Upload & Client-Side Compression
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [compressedResult, setCompressedResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(
    'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1080&q=80'
  );

  if (!isPostModalOpen) return null;

  const currentCityObj = CITIES.find((c) => c.id === cityId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImageFile(file);
    setIsCompressing(true);

    try {
      const result = await compressImageClientSide(file, 1080, 1080, 0.82);
      setCompressedResult(result);
      setPreviewUrl(result.dataUrl);
    } catch (err) {
      console.error('Compression failed:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      setIsVerificationModalOpen(true);
      return;
    }

    if (creatorMode === 'VISUAL_FEED') {
      addNewPost({
        businessId: currentUser.id,
        businessName: currentUser.fullName,
        businessAvatar: currentUser.avatarUrl,
        hasRazaBadge: true,
        authorId: currentUser.id,
        postType: 'PHOTO_CAROUSEL',
        mediaUrls: [previewUrl],
        caption: `${title}\n\n${description}`,
        priceInr: price ? Number(price) : undefined,
        isAvailableToday,
        todayDropDeadline: isAvailableToday ? todayDropDeadline : undefined,
        cityId,
        cityName: currentCityObj?.name || 'Mumbai',
        mohallaName: mohalla,
        category: businessCategory,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        whatsappNumber,
      });
    } else {
      addNewClassified({
        sellerId: currentUser.id,
        sellerName: currentUser.fullName,
        sellerAvatar: currentUser.avatarUrl,
        sellerPhone: whatsappNumber,
        cityId,
        cityName: currentCityObj?.name || 'Mumbai',
        mohallaName: mohalla,
        category: classifiedCategory,
        title,
        description,
        price: Number(price) || 0,
        isNegotiable: true,
        condition,
        mediaUrls: [previewUrl],
        status: 'ACTIVE',
        realEstateMeta:
          classifiedCategory === 'REAL_ESTATE_RENT' ||
          classifiedCategory === 'REAL_ESTATE_SALE' ||
          classifiedCategory === 'PG_FLATMATE'
            ? {
                bhk,
                carpetArea: Number(carpetArea) || 600,
                nearMasjid,
                thaaliFriendly,
                brokerage: 'ZERO_BROKERAGE',
                deposit: Number(deposit) || 0,
                furnishing,
              }
            : undefined,
      });
    }

    setIsPostModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsPostModalOpen(false)}
    >
      <div
        className="bg-surface w-full max-w-xl rounded-3xl shadow-elevated border border-border overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-muted/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-900 text-gold-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">
                1-Minute Community Listing Creator
              </h3>
              <p className="text-[11px] text-slate-500">
                Direct WhatsApp inquiries with zero brokerage
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPostModalOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Creator Mode Switcher Tabs */}
        <div className="p-3 bg-surface-muted/60 border-b border-border">
          <div className="grid grid-cols-2 gap-2 bg-surface p-1 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setCreatorMode('VISUAL_FEED')}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition ${
                creatorMode === 'VISUAL_FEED'
                  ? 'bg-emerald-900 text-white shadow-sm ring-1 ring-gold-500/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className={`w-4 h-4 ${creatorMode === 'VISUAL_FEED' ? 'text-gold-300' : ''}`} />
              <span className={creatorMode === 'VISUAL_FEED' ? 'text-white font-bold' : ''}>Post to Visual Souq</span>
            </button>

            <button
              type="button"
              onClick={() => setCreatorMode('CLASSIFIED')}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition ${
                creatorMode === 'CLASSIFIED'
                  ? 'bg-emerald-900 text-white shadow-sm ring-1 ring-gold-500/40'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className={`w-4 h-4 ${creatorMode === 'CLASSIFIED' ? 'text-gold-300' : ''}`} />
              <span className={creatorMode === 'CLASSIFIED' ? 'text-white font-bold' : ''}>Post a Classified Ad</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Client-Side Image Compression & Preview Box */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Listing Image (Auto-compressed to WebP &lt;200KB)
            </label>
            <div className="border-2 border-dashed border-emerald-800/30 rounded-2xl p-3 bg-surface-muted/30">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative aspect-[4/3] w-36 rounded-xl overflow-hidden border border-border shadow-xs bg-slate-900 flex-shrink-0">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  {isCompressing && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-gold-300 text-[10px] font-bold">
                      Compressing...
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <label className="inline-block cursor-pointer bg-surface hover:bg-emerald-50 text-emerald-950 font-bold px-3 py-1.5 rounded-xl border border-border text-xs transition shadow-xs">
                    Choose Photo from Device
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {/* Live Compression Metrics */}
                  {compressedResult ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-[11px] text-emerald-900">
                      <div className="flex items-center gap-1 font-bold">
                        <Zap className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Client Compression Complete</span>
                      </div>
                      <div className="text-[10px] text-emerald-800 mt-0.5">
                        {compressedResult.originalSizeKb} KB → {compressedResult.compressedSizeKb} KB
                        (Reduced by {compressedResult.savingsPercent}%) • WebP {compressedResult.width}x{compressedResult.height}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500">
                      Images are instantly converted to high-speed WebP and scaled to 1080px client-side before upload.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Title & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {creatorMode === 'VISUAL_FEED' ? 'Post Headline / Product Name' : 'Listing Title'}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  creatorMode === 'VISUAL_FEED'
                    ? 'e.g. Weekend Bohra Thaali Box with Smoked Samosas'
                    : 'e.g. Spacious 2BHK Flat – 3 Mins to Uzri Masjid (Zero Brokerage)'
                }
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Price (₹ INR)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 2200"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
              />
            </div>
          </div>

          {/* Category Dropdowns */}
          {creatorMode === 'VISUAL_FEED' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Feed Category</label>
                <select
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                >
                  <option value="FOOD_CATERING">Today's Food Pop-ups & Thaali</option>
                  <option value="RIDA_FASHION">Ridas & Community Apparel</option>
                  <option value="KHATT_ART">Khatt & Calligraphy</option>
                  <option value="GIFTING_DECOR">Gifting & Decor</option>
                  <option value="B2B_TRADE">B2B & Wholesale</option>
                </select>
              </div>

              {/* Today's Flash Drop settings */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Flash Drop Option</label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id="dropCheck"
                    checked={isAvailableToday}
                    onChange={(e) => setIsAvailableToday(e.target.checked)}
                    className="w-4 h-4 text-emerald-800 rounded accent-emerald-800"
                  />
                  <label htmlFor="dropCheck" className="text-xs text-slate-800 font-medium">
                    Mark as Today's Fresh Batch Drop
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Classified Category</label>
                <select
                  value={classifiedCategory}
                  onChange={(e) => setClassifiedCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                >
                  <option value="REAL_ESTATE_RENT">NoBroker Real Estate (Rental)</option>
                  <option value="REAL_ESTATE_SALE">Property for Sale</option>
                  <option value="PG_FLATMATE">PG / Room Sharing</option>
                  <option value="HOME_CLEARANCE_FURNITURE">Home Clearance & Furniture</option>
                  <option value="COMMERCIAL_EQUIPMENT">Commercial & Catering Gear</option>
                  <option value="JOBS">Community Job</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                >
                  <option value="NEW">Brand New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good Condition</option>
                  <option value="FAIR">Fair Condition</option>
                  <option value="NOT_APPLICABLE">Not Applicable</option>
                </select>
              </div>
            </div>
          )}

          {/* Real Estate Specific Specs */}
          {creatorMode === 'CLASSIFIED' &&
            (classifiedCategory === 'REAL_ESTATE_RENT' ||
              classifiedCategory === 'REAL_ESTATE_SALE' ||
              classifiedCategory === 'PG_FLATMATE') && (
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-emerald-800" />
                  <span>Community Real Estate Details (NoBroker)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">BHK</label>
                    <input
                      type="text"
                      value={bhk}
                      onChange={(e) => setBhk(e.target.value)}
                      placeholder="2 BHK"
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-surface text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Carpet Area</label>
                    <input
                      type="number"
                      value={carpetArea}
                      onChange={(e) => setCarpetArea(e.target.value)}
                      placeholder="840"
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-surface text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Deposit (₹)</label>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="100000"
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-surface text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Furnishing</label>
                    <select
                      value={furnishing}
                      onChange={(e) => setFurnishing(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-surface text-xs"
                    >
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Fully Furnished">Fully Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">
                      Proximity to Masjid
                    </label>
                    <input
                      type="text"
                      value={nearMasjid}
                      onChange={(e) => setNearMasjid(e.target.value)}
                      placeholder="e.g. Uzri Masjid (3 mins walk) / Hasanabad"
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-surface text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="thaaliCheck"
                      checked={thaaliFriendly}
                      onChange={(e) => setThaaliFriendly(e.target.checked)}
                      className="w-4 h-4 text-emerald-800 rounded accent-emerald-800"
                    />
                    <label htmlFor="thaaliCheck" className="text-xs text-slate-800 font-semibold">
                      FMB Thaali Delivery Friendly Setup
                    </label>
                  </div>
                </div>
              </div>
            )}

          {/* Location & Mohalla Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">City / Jamaat</label>
              <select
                value={cityId}
                onChange={(e) => {
                  setCityId(e.target.value);
                  const sel = CITIES.find((c) => c.id === e.target.value);
                  if (sel && sel.localities.length > 1) {
                    setMohalla(sel.localities[1]);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
              >
                {CITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mohalla</label>
              <select
                value={mohalla}
                onChange={(e) => setMohalla(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
              >
                {currentCityObj?.localities
                  .filter((l) => l !== 'All Localities')
                  .map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Full Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide complete details, dimensions, ingredients, availability timings..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-gold transition active:scale-95 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-gold-400" />
              <span className="text-white font-bold">
                {creatorMode === 'VISUAL_FEED' ? 'Publish to Visual Souq' : 'Publish Classified Ad'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
