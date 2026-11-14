'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { AuthScreen } from '@/components/auth/AuthScreen';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, authChecked } = useApp();

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authChecked, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 selection:bg-gold-500/30">
      <AuthScreen onSuccess={() => router.push('/')} />
    </div>
  );
}
