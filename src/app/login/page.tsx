'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { LogOut, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, authChecked, currentUser, logout } = useApp();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-gold-500/30">
      {authChecked && isAuthenticated && (
        <div className="w-full max-w-md mx-auto mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
          <div>
            <span className="text-slate-500 block text-[10px] font-medium">Currently signed in as:</span>
            <div className="flex items-center gap-1 font-bold text-emerald-950">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{currentUser.fullName}</span>
              {currentUser.role === 'ADMIN' && (
                <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-bold ml-1">
                  Admin
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(currentUser.verificationStatus === 'PENDING' ? '/onboard-waiting' : '/')}
              className="px-2.5 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold rounded-xl text-[11px] shadow-sm transition active:scale-95 flex items-center gap-1"
            >
              <span>{currentUser.verificationStatus === 'PENDING' ? 'Waiting Room' : 'Go to App'}</span>
              <ArrowRight className="w-3 h-3 text-gold-400" />
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-200 text-[11px] transition active:scale-95 flex items-center gap-1"
            >
              <LogOut className="w-3 h-3 text-rose-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      <AuthScreen onSuccess={() => router.push('/')} />
    </div>
  );
}
