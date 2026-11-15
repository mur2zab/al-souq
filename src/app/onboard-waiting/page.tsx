'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { OnboardWaitingScreen } from '@/components/auth/OnboardWaitingScreen';

export default function OnboardWaitingPage() {
  const router = useRouter();
  const { isAuthenticated, authChecked, currentUser } = useApp();

  useEffect(() => {
    if (authChecked) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (currentUser.verificationStatus === 'VERIFIED') {
        router.replace('/');
      }
    }
  }, [authChecked, isAuthenticated, currentUser, router]);

  if (!authChecked || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-emerald-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-gold-500/30">
      <OnboardWaitingScreen />
    </div>
  );
}
