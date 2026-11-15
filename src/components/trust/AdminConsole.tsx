'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  MapPin,
  Building,
  Phone,
  Mail,
  ZoomIn,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

export const AdminConsole: React.FC = () => {
  const {
    verificationRequests,
    refreshVerifications,
    adminApproveVerification,
    adminRejectVerification,
    businesses,
    toggleBusinessFeatured,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'VERIFICATIONS' | 'TIJARAT_BUSINESSES'>('VERIFICATIONS');
  const [selectedProofImg, setSelectedProofImg] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Card photo blurry or illegible');
  const [customReason, setCustomReason] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  // Load and poll verifications in real-time
  useEffect(() => {
    refreshVerifications();
    const interval = setInterval(() => {
      refreshVerifications();
    }, 4000);
    return () => clearInterval(interval);
  }, [refreshVerifications]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshVerifications();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const pendingRequests = verificationRequests.filter((r) => r.status === 'PENDING');
  const processedRequests = verificationRequests.filter((r) => r.status !== 'PENDING');

  const handleConfirmReject = (requestId: string) => {
    const reason = rejectionReason === 'Other' ? (customReason.trim() || 'Manual verification failed') : rejectionReason;
    adminRejectVerification(requestId, reason);
    setRejectingId(null);
    setCustomReason('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Console Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-elevated border border-gold-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-black text-lg text-white">
                Admin Trust & Moderation Console
              </h2>
              <span className="text-[10px] bg-purple-500/90 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Manual Review Desk
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Strict Manual KYC Verification: Inspect uploaded ITS cards & grant Verified Mumin status
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 bg-emerald-900/90 hover:bg-emerald-850 border border-gold-500/40 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition active:scale-95 disabled:opacity-50 shadow-sm"
          title="Refresh Queue"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gold-400 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Syncing...' : 'Refresh Queue'}</span>
        </button>
      </div>

      {/* Tabs & Live Sync Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('VERIFICATIONS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'VERIFICATIONS'
                ? 'bg-emerald-900 text-white shadow-sm ring-1 ring-gold-500/40'
                : 'text-slate-600 hover:text-slate-900 bg-surface-muted'
            }`}
          >
            <CreditCard className={`w-4 h-4 ${activeTab === 'VERIFICATIONS' ? 'text-gold-300' : ''}`} />
            <span className={activeTab === 'VERIFICATIONS' ? 'text-white font-bold' : ''}>
              Pending Review Queue ({pendingRequests.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('TIJARAT_BUSINESSES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'TIJARAT_BUSINESSES'
                ? 'bg-emerald-900 text-white shadow-sm ring-1 ring-gold-500/40'
                : 'text-slate-600 hover:text-slate-900 bg-surface-muted'
            }`}
          >
            <Building className={`w-4 h-4 ${activeTab === 'TIJARAT_BUSINESSES' ? 'text-gold-300' : ''}`} />
            <span className={activeTab === 'TIJARAT_BUSINESSES' ? 'text-white font-bold' : ''}>
              Tijarat Storefronts & Raza Badges ({businesses.length})
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live sync active • {lastRefreshed}</span>
        </div>
      </div>

      {/* TAB 1: Verification Queue */}
      {activeTab === 'VERIFICATIONS' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-surface rounded-3xl p-8 border border-border text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-serif font-bold text-slate-800 text-base">
                Queue is All Caught Up!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All submitted ITS cards have been reviewed by community administrators.
              </p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-surface rounded-3xl p-5 border border-border shadow-subtle hover:shadow-elevated transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
                  <div className="flex items-center gap-3">
                    {/* Proof Images: ITS Card + Live Photo Click */}
                    <div className="flex items-center gap-2">
                      <div
                        className="relative group cursor-pointer flex flex-col items-center"
                        onClick={() => setSelectedProofImg(req.idCardImageUrl)}
                        title="Click to inspect ITS Card"
                      >
                        <img
                          src={req.idCardImageUrl}
                          alt="ITS Card Proof"
                          className="w-16 h-14 rounded-xl object-cover border-2 border-slate-200 group-hover:border-emerald-600 transition shadow-sm"
                        />
                        <span className="text-[9px] font-bold text-slate-500 mt-0.5">ITS Card</span>
                        <div className="absolute inset-0 h-14 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                          <ZoomIn className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {req.livePhotoUrl && (
                        <div
                          className="relative group cursor-pointer flex flex-col items-center"
                          onClick={() => setSelectedProofImg(req.livePhotoUrl!)}
                          title="Click to inspect Live Photo"
                        >
                          <img
                            src={req.livePhotoUrl}
                            alt="Live Photo Click"
                            className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-300 group-hover:border-emerald-700 transition shadow-sm"
                          />
                          <span className="text-[9px] font-bold text-emerald-800 mt-0.5">Live Photo</span>
                          <div className="absolute inset-0 h-14 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white">
                            <ZoomIn className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-sm text-slate-900">
                          {req.fullName}
                        </h4>
                        <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          ITS: {req.itsNumber}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {req.mohalla}, {req.jamaatCity}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono text-slate-600">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {req.phone}
                        </span>
                        {req.email && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-slate-600">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {req.email}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Manual Review Status Badge */}
                  <div className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold">
                    <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                    <span>Awaiting Admin Review</span>
                  </div>
                </div>

                {/* Submitted KYC Inspection Card */}
                <div className="bg-surface-muted/70 rounded-2xl p-3.5 border border-border grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Submitted Full Name
                    </span>
                    <div className="font-semibold text-slate-900 mt-0.5">
                      {req.fullName}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Submitted ITS ID (8 Digits)
                    </span>
                    <div className="font-mono font-bold text-emerald-950 mt-0.5">
                      {req.itsNumber}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Submitted At
                    </span>
                    <div className="text-slate-600 mt-0.5 font-mono text-[11px]">
                      {new Date(req.submittedAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Rejection Form Drawer (if active) */}
                {rejectingId === req.id ? (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Specify Rejection Reason for {req.fullName}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        'Card photo blurry or illegible',
                        'Name does not match card photo',
                        'ITS number does not match card',
                        'Non-ITS document uploaded',
                        'Other',
                      ].map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => setRejectionReason(reason)}
                          className={`text-left p-2 rounded-xl border text-xs font-medium transition ${
                            rejectionReason === reason
                              ? 'bg-rose-600 text-white border-rose-700 font-bold'
                              : 'bg-white border-rose-200 text-rose-950 hover:bg-rose-100/70'
                          }`}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>

                    {rejectionReason === 'Other' && (
                      <input
                        type="text"
                        placeholder="Enter specific rejection reason..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-rose-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setRejectingId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmReject(req.id)}
                        className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-sm transition active:scale-95"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Action Buttons */
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedProofImg(req.idCardImageUrl)}
                      className="text-xs font-semibold text-slate-600 hover:text-emerald-900 flex items-center gap-1.5 transition"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Inspect Card Image</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRejectingId(req.id)}
                        className="flex items-center gap-1.5 text-rose-700 hover:bg-rose-50 border border-rose-300 font-bold px-3 py-2 rounded-xl text-xs transition active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => adminApproveVerification(req.id)}
                        className="flex items-center gap-1.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4 text-gold-400" />
                        <span className="text-white font-bold">Approve & Allow Member</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Processed Verifications */}
          {processedRequests.length > 0 && (
            <div className="mt-8">
              <h3 className="font-serif font-bold text-slate-700 text-xs uppercase tracking-wider mb-3">
                Processed Records ({processedRequests.length})
              </h3>
              <div className="space-y-2">
                {processedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-surface rounded-2xl p-3 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck
                        className={`w-4 h-4 ${
                          req.status === 'VERIFIED' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      />
                      <span className="font-bold text-slate-900">{req.fullName}</span>
                      <span className="text-slate-500 font-mono">(ITS: {req.itsNumber})</span>
                      <span className="text-[10px] text-slate-400">{req.mohalla}, {req.jamaatCity}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.adminNotes && (
                        <span className="text-[10px] text-slate-500 italic max-w-xs truncate">
                          Reason: {req.adminNotes}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Business Management & Raza Badges */}
      {activeTab === 'TIJARAT_BUSINESSES' && (
        <div className="space-y-3">
          {businesses.map((biz) => (
            <div
              key={biz.id}
              className="bg-surface rounded-2xl p-4 border border-border shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                  {biz.businessName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-sm text-slate-900">
                      {biz.businessName}
                    </h4>
                    {biz.hasRazaBadge && (
                      <span className="text-[10px] bg-gold-100 text-gold-900 font-bold px-1.5 py-0.2 rounded border border-gold-300">
                        Raza Badge
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {biz.category.replace(/_/g, ' ')} • {biz.cityName} ({biz.mohallaName})
                  </div>
                </div>
              </div>

              {/* Pro Storefront Toggle */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Tier</div>
                  <span
                    className={`text-xs font-bold ${
                      biz.subscriptionTier === 'PRO_FEATURED' ? 'text-gold-700' : 'text-slate-600'
                    }`}
                  >
                    {biz.subscriptionTier === 'PRO_FEATURED' ? '★ PRO FEATURED' : 'Standard'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleBusinessFeatured(biz.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${
                    biz.subscriptionTier === 'PRO_FEATURED'
                      ? 'bg-gold-50 border-gold-400 text-gold-950 hover:bg-gold-100'
                      : 'bg-surface border-border text-slate-700 hover:bg-surface-muted'
                  }`}
                >
                  {biz.subscriptionTier === 'PRO_FEATURED' ? 'Demote to Free' : 'Promote to Pro (₹999)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox for Card Proof */}
      {selectedProofImg && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedProofImg(null)}
        >
          <div className="max-w-2xl max-h-[85vh] bg-surface rounded-3xl p-4 shadow-elevated border border-border space-y-3 cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-800" />
                Submitted ITS Card Document
              </span>
              <button
                type="button"
                onClick={() => setSelectedProofImg(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded-lg"
              >
                Close (ESC)
              </button>
            </div>
            <div className="overflow-hidden rounded-2xl bg-black/5 flex items-center justify-center max-h-[70vh]">
              <img src={selectedProofImg} alt="ITS Card Proof" className="max-h-[68vh] w-auto object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
