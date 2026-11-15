'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { AdminConsole } from '@/components/trust/AdminConsole';
import {
  ArrowLeft,
  ShieldCheck,
  Building2,
  Lock,
  AlertCircle,
  Users,
} from 'lucide-react';

export default function AdminPage() {
  const { currentUser } = useApp();

  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-background text-slate-800 flex flex-col font-sans selection:bg-gold-500/30 pb-16">
      {/* Top Header */}
      <header className="border-b border-border bg-surface/90 backdrop-blur-md px-4 py-3 sticky top-0 z-20 shadow-subtle">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-gold-400 font-serif font-black shadow-gold border border-gold-500/30">
              س
            </div>
            <div>
              <span className="font-serif font-black text-lg text-emerald-950 tracking-tight">
                Al-Souq
              </span>
              <span className="text-xs text-purple-700 font-bold ml-1.5 bg-purple-100 px-2 py-0.5 rounded-full uppercase text-[10px]">
                Admin Desk
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-950 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Console Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {!isAdmin ? (
          <div className="bg-surface rounded-3xl p-8 border border-border shadow-subtle text-center max-w-md mx-auto mt-12 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="font-serif font-bold text-lg text-slate-900">
              Admin Authentication Required
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              This verification desk is restricted to authorized community administrators.
            </p>
            <Link
              href="/login"
              className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-gold transition active:scale-95 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Sign In as Admin</span>
            </Link>
          </div>
        ) : (
          <AdminConsole />
        )}
      </main>
    </div>
  );
}
