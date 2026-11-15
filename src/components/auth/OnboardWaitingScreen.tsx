'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  LogOut,
  CreditCard,
  Camera,
  MapPin,
  Lock,
  ZoomIn,
  X,
  AlertCircle,
} from 'lucide-react';

export const OnboardWaitingScreen: React.FC = () => {
  const router = useRouter();
  const { currentUser, setCurrentUser, logout } = useApp();

  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>('Just now');
  const [selectedProofImg, setSelectedProofImg] = useState<{ url: string; title: string } | null>(null);
  const [approvedNotification, setApprovedNotification] = useState(false);

  // Poll server verification status every 5 seconds
  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (isMounted && data.authenticated && data.user) {
          if (data.user.verificationStatus === 'VERIFIED') {
            setApprovedNotification(true);
            setCurrentUser(data.user);
            setTimeout(() => {
              router.push('/');
            }, 1500);
          } else {
            setCurrentUser(data.user);
          }
          setLastCheckedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      } catch (err) {
        // silent background check
      }
    };

    const interval = setInterval(checkStatus, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [router, setCurrentUser]);

  const handleManualCheck = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setCurrentUser(data.user);
        if (data.user.verificationStatus === 'VERIFIED') {
          setApprovedNotification(true);
          setTimeout(() => {
            router.push('/');
          }, 1200);
        }
      }
      setLastCheckedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      // silent
    } finally {
      setTimeout(() => setIsChecking(false), 600);
    }
  };

  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="bg-surface rounded-3xl shadow-elevated border border-border p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-gold-400 font-serif font-black text-2xl mx-auto shadow-gold border border-gold-500/30">
            س
          </div>
          <h1 className="font-serif font-black text-2xl text-emerald-950 tracking-tight">
            Al-Souq <span className="text-gold-600 font-serif font-semibold text-lg ml-1">السوق</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Dawoodi Bohra Community Verified Commerce
          </p>
        </div>

        {/* Approval Celebration Banner */}
        {approvedNotification ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2 text-center animate-in zoom-in-95">
            <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
            <h3 className="font-serif font-bold text-base text-emerald-900">
              Mabrook! Your Account is Verified & Allowed
            </h3>
            <p className="text-xs text-emerald-800">
              The Jamaat Admin Desk has approved your registration. Redirecting to the marketplace...
            </p>
          </div>
        ) : (
          /* Waiting Status Banner */
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-950 space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 bg-amber-200/60 text-amber-950 px-3 py-1 rounded-full text-xs font-bold font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
              <span>Awaiting Jamaat Admin Approval</span>
            </div>
            <h2 className="font-serif font-bold text-lg text-amber-950 pt-1">
              Onboarding Review in Progress
            </h2>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              Your registration has been submitted to the central Jamaat Admin Desk. For safety and authenticated community trade, an admin must verify your ITS card and live photo before full marketplace access is granted.
            </p>
          </div>
        )}

        {/* User Identity Details Card */}
        <div className="bg-surface-muted rounded-2xl p-4 border border-border space-y-3">
          <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Applicant Name
              </span>
              <div className="font-serif font-bold text-sm text-slate-900">
                {currentUser.fullName}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                ITS Number
              </span>
              <div className="font-mono font-bold text-xs text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 inline-block">
                {currentUser.itsNumber || 'Pending'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[200px]">
                {currentUser.mohallaName}, {currentUser.cityName}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {currentUser.email}
            </span>
          </div>
        </div>

        {/* Submitted Proofs Preview */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-800 block">
            Submitted KYC Documents
          </span>
          <div className="grid grid-cols-2 gap-3">
            {/* ITS Card Proof */}
            <div className="bg-surface-muted rounded-2xl p-3 border border-border flex flex-col items-center text-center space-y-2 group">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <CreditCard className="w-3.5 h-3.5 text-emerald-800" />
                <span>ITS Smart Card</span>
              </div>
              {currentUser.itsCardProofUrl ? (
                <div
                  onClick={() =>
                    setSelectedProofImg({
                      url: currentUser.itsCardProofUrl!,
                      title: 'Submitted ITS Smart Card',
                    })
                  }
                  className="relative cursor-pointer w-full h-24 rounded-xl overflow-hidden border border-border group-hover:border-emerald-700 transition"
                >
                  <img
                    src={currentUser.itsCardProofUrl}
                    alt="ITS Card Proof"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs gap-1 transition">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>View</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-24 rounded-xl bg-slate-200 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                  Card Attached
                </div>
              )}
              <span className="text-[10px] text-emerald-800 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Uploaded</span>
              </span>
            </div>

            {/* Live Selfie Proof */}
            <div className="bg-surface-muted rounded-2xl p-3 border border-border flex flex-col items-center text-center space-y-2 group">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                <Camera className="w-3.5 h-3.5 text-emerald-800" />
                <span>Live Photo Click</span>
              </div>
              {currentUser.livePhotoUrl || currentUser.avatarUrl ? (
                <div
                  onClick={() =>
                    setSelectedProofImg({
                      url: currentUser.livePhotoUrl || currentUser.avatarUrl,
                      title: 'Captured Live Photo',
                    })
                  }
                  className="relative cursor-pointer w-full h-24 rounded-xl overflow-hidden border border-border group-hover:border-emerald-700 transition"
                >
                  <img
                    src={currentUser.livePhotoUrl || currentUser.avatarUrl}
                    alt="Live Photo Click"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs gap-1 transition">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>View</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-24 rounded-xl bg-slate-200 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs">
                  Photo Attached
                </div>
              )}
              <span className="text-[10px] text-emerald-800 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Captured</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3-Step Verification Pipeline */}
        <div className="bg-surface-muted/60 rounded-2xl p-3.5 border border-border space-y-2.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Onboarding Verification Status
          </span>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-emerald-900 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Registration & KYC Upload</span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Completed
              </span>
            </div>

            <div className="flex items-center justify-between text-amber-950 font-bold">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 animate-spin flex-shrink-0" />
                <span>Jamaat Admin Desk Approval</span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full animate-pulse">
                Under Review
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-300 flex-shrink-0" />
                <span>Full Marketplace Access</span>
              </div>
              <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                Locked
              </span>
            </div>
          </div>
        </div>

        {/* Actions & Auto-refresh status */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Auto-checking status every 5s...</span>
            <span className="font-mono text-[10px]">Checked: {lastCheckedTime}</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="flex-1 bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-gold transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-gold-400 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Check Approval Status'}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-2.5 rounded-xl border border-border text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5"
              title="Sign out and check back later"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Proof Image Viewer Modal */}
      {selectedProofImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedProofImg(null)}
        >
          <div
            className="bg-surface rounded-2xl max-w-lg w-full overflow-hidden p-4 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-sm text-slate-900">
                {selectedProofImg.title}
              </h4>
              <button
                type="button"
                onClick={() => setSelectedProofImg(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={selectedProofImg.url}
              alt="Proof Document"
              className="w-full max-h-[70vh] object-contain rounded-xl border border-border"
            />
          </div>
        </div>
      )}
    </div>
  );
};
