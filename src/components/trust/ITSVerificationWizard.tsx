'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CITIES } from '@/data/cities';
import {
  X,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Lock,
  CreditCard,
  Building,
  UserCheck,
  FileCheck,
} from 'lucide-react';

export const ITSVerificationWizard: React.FC = () => {
  const {
    isVerificationModalOpen,
    setIsVerificationModalOpen,
    currentUser,
    submitVerificationRequest,
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [phone, setPhone] = useState(currentUser.phone || '+91 ');
  const [email, setEmail] = useState(currentUser.email || '');
  const [cityId, setCityId] = useState(currentUser.cityId || 'mumbai');
  const [mohalla, setMohalla] = useState(currentUser.mohallaName || 'Mazgaon (Hasanabad / Saifee Park)');
  const [itsNumber, setItsNumber] = useState(currentUser.itsNumber || '30491823');
  const [cardImage, setCardImage] = useState<string>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isVerificationModalOpen) return null;

  const currentCityObj = CITIES.find((c) => c.id === cityId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCardImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForAdminReview = async () => {
    setIsSubmitting(true);
    try {
      // Submit to repository and backend API strictly as PENDING for admin review
      submitVerificationRequest({
        userId: currentUser.id,
        fullName,
        email,
        phone,
        itsNumber,
        jamaatCity: currentCityObj?.name || 'Mumbai',
        mohalla,
        idCardImageUrl: cardImage,
        ocrExtractedIts: itsNumber,
        ocrExtractedName: fullName.toUpperCase(),
        ocrConfidence: 100,
        ocrMatches: false,
        adminNotes: 'Submitted for manual Jamaat Admin Desk verification.',
      });

      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setIsVerificationModalOpen(false)}
    >
      <div
        className="bg-surface w-full max-w-lg rounded-3xl shadow-elevated border border-border overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-muted/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-gold-400 shadow-gold border border-gold-500/30">
              <ShieldCheck className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                ITS Trust Verification
              </h3>
              <p className="text-[11px] text-slate-500">
                Admin manual verification desk for Dawoodi Bohra Mumineen
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVerificationModalOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Progress Indicator */}
        <div className="px-5 py-2.5 bg-emerald-950 text-gold-300 text-[11px] font-semibold flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step >= 1 ? 'bg-gold-500 text-slate-950 font-bold' : 'bg-emerald-900 text-slate-400'
              }`}
            >
              1
            </span>
            <span>Profile</span>
          </div>
          <span className="text-emerald-700">→</span>
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step >= 2 ? 'bg-gold-500 text-slate-950 font-bold' : 'bg-emerald-900 text-slate-400'
              }`}
            >
              2
            </span>
            <span>Mohalla</span>
          </div>
          <span className="text-emerald-700">→</span>
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step >= 3 ? 'bg-gold-500 text-slate-950 font-bold' : 'bg-emerald-900 text-slate-400'
              }`}
            >
              3
            </span>
            <span>Card Upload</span>
          </div>
          <span className="text-emerald-700">→</span>
          <div className="flex items-center gap-2">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 4 ? 'bg-gold-500 text-slate-950 font-bold' : 'bg-emerald-900 text-slate-400'
              }`}
            >
              4
            </span>
            <span>Admin Queue</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* STEP 1: Basic Profile */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name (as per ITS Card)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Murtuza Bagasrawala"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  WhatsApp Contact Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200 11223"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="murtuza.b@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>
            </div>
          )}

          {/* STEP 2: City & Mohalla */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Primary Jamaat / City
                </label>
                <select
                  value={cityId}
                  onChange={(e) => {
                    setCityId(e.target.value);
                    const sel = CITIES.find((c) => c.id === e.target.value);
                    if (sel && sel.localities.length > 1) {
                      setMohalla(sel.localities[1]);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.country})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mohalla / Locality
                </label>
                <select
                  value={mohalla}
                  onChange={(e) => setMohalla(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
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
          )}

          {/* STEP 3: ITS Card Upload */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  8-Digit ITS ID Number
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-emerald-800 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    maxLength={8}
                    value={itsNumber}
                    onChange={(e) => setItsNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 30491823"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 font-mono text-sm tracking-widest font-bold focus:outline-none focus:border-emerald-800"
                  />
                </div>
              </div>

              {/* Upload Card Image */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Upload Photo of ITS Card or Business Letterhead
                </label>
                <div className="border-2 border-dashed border-emerald-800/30 hover:border-emerald-800 rounded-2xl p-4 text-center bg-surface-muted/30 transition">
                  {cardImage ? (
                    <div className="relative aspect-[16/9] max-w-xs mx-auto rounded-xl overflow-hidden shadow-sm border border-border">
                      <img src={cardImage} alt="Card preview" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/40 text-white text-xs font-bold flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer">
                        Change Card Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-4">
                      <Upload className="w-8 h-8 text-emerald-800 mx-auto mb-2" />
                      <span className="text-xs font-bold text-slate-800 block">
                        Tap to take photo or choose file
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Ensure ITS ID and name are clearly legible for admin review
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Manual Admin Review:</span> Once submitted, your card
                  proof will be queued for manual inspection by our community admin desk.
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Submission Confirmation (Strictly Pending Review) */}
          {step === 4 && (
            <div className="space-y-4 animate-in zoom-in-95 duration-300">
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-sm animate-pulse">
                  <Clock className="w-9 h-9 text-amber-600" />
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  ITS Card Submitted for Admin Review
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Your verification proof has been queued for manual review by the Jamaat Admin Desk.
                  Submissions are reviewed within 24 hours.
                </p>
              </div>

              {/* Submission Queue Summary Card */}
              <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-2xl p-4 border border-gold-400/40 shadow-elevated space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-serif font-bold text-gold-400 text-xs">
                    Verification Queue Receipt
                  </span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Pending Admin Approval
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={cardImage}
                    alt="Card proof"
                    className="w-16 h-12 rounded-xl object-cover border border-white/20 shadow-xs"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-white">{fullName}</h4>
                    <div className="text-xs font-mono text-gold-300 font-bold">ITS ID: {itsNumber}</div>
                    <div className="text-[11px] text-emerald-200">
                      {mohalla}, {currentCityObj?.name}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 text-[11px] text-emerald-200/90 leading-snug">
                  🛡️ You can continue browsing public feeds in the meantime. As soon as an admin
                  approves your card, your account will be upgraded with the golden Verified Mumin badge.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3 border-t border-border bg-surface-muted/30 flex items-center justify-between">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              disabled={!fullName.trim()}
              className="ml-auto flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
            >
              <span>Next: Mohalla</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={() => setStep(3)}
              className="ml-auto flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition"
            >
              <span>Next: Upload ITS Card</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
            </button>
          )}

          {step === 3 && (
            <button
              onClick={handleSubmitForAdminReview}
              disabled={isSubmitting || itsNumber.length !== 8}
              className="ml-auto flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-gold transition active:scale-95 disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4 text-gold-400" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit ITS Card for Admin Review'}</span>
            </button>
          )}

          {step === 4 && (
            <button
              onClick={() => setIsVerificationModalOpen(false)}
              className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition"
            >
              Done & Return to Marketplace
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
