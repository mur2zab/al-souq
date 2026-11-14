'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { CITIES } from '@/data/cities';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CreditCard,
  Building,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  Building2,
  Utensils,
  Check,
  Phone,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useApp();

  const [mode, setMode] = useState<'SIGN_IN' | 'REGISTER'>('SIGN_IN');
  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [identifier, setIdentifier] = useState('murtuza.b@example.com');
  const [password, setPassword] = useState('Mumin@123');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [regPassword, setRegPassword] = useState('');
  const [itsNumber, setItsNumber] = useState('');
  const [cityId, setCityId] = useState('mumbai');
  const [mohalla, setMohalla] = useState('Mazgaon (Hasanabad / Saifee Park)');

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const currentCityObj = CITIES.find((c) => c.id === cityId);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password: authMethod === 'PASSWORD' ? password : undefined,
          otp: authMethod === 'OTP' ? otp : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      setCurrentUser(data.user);
      setSuccessMsg(`Welcome, ${data.user.fullName}! Redirecting to Al-Souq...`);
      setTimeout(() => {
        router.push('/');
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password: regPassword,
          itsNumber,
          cityId,
          cityName: currentCityObj?.name || 'Mumbai',
          mohallaName: mohalla,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setCurrentUser(data.user);
      setSuccessMsg('Account created successfully! Welcome to the Al-Souq community.');
      setTimeout(() => {
        router.push('/');
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'ADMIN' | 'CREATOR' | 'VERIFIED' | 'PENDING' | 'UNVERIFIED') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setSuccessMsg(`Logged in as ${data.user.fullName}`);
        setTimeout(() => {
          router.push('/');
        }, 500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between selection:bg-gold-500/30 font-sans">
      {/* Top Simple Navigation */}
      <header className="border-b border-border bg-surface/90 backdrop-blur-md px-4 py-3 sticky top-0 z-20 shadow-subtle">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-gold-400 font-serif font-black shadow-gold border border-gold-500/30">
              س
            </div>
            <div>
              <span className="font-serif font-black text-lg text-emerald-950 tracking-tight">
                Al-Souq
              </span>
              <span className="text-xs text-gold-600 font-serif font-semibold ml-1">السوق</span>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-950 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </Link>
        </div>
      </header>

      {/* Main Self Sign-In Portal Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl bg-surface rounded-3xl shadow-elevated border border-border overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
          {/* Left Decorative Community Column */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gold-500/20 relative overflow-hidden">
            {/* Subtle Gold Background Accent */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-400/30 flex items-center justify-center mb-6 shadow-gold font-serif font-black text-2xl">
                س
              </div>

              <div className="space-y-2">
                <span className="text-[11px] bg-gold-500/20 text-gold-300 font-mono font-bold px-2.5 py-0.5 rounded-full border border-gold-400/30">
                  ITS52 Trust Network
                </span>
                <h1 className="font-serif font-black text-2xl sm:text-3xl text-white leading-tight">
                  Dawoodi Bohra Self-Service Portal
                </h1>
                <p className="text-xs text-emerald-200/90 leading-relaxed pt-1">
                  Access verified community classifieds, zero-brokerage flat rentals in Mazgaon & Bhendi Bazaar, and artisanal culinary drops.
                </p>
              </div>

              {/* Trust Value Points */}
              <div className="mt-8 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-800/80 text-gold-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">8-Digit ITS Identity KYC</h4>
                    <p className="text-[11px] text-emerald-300/80">
                      Encrypted verification ensures high-trust, safe Mumineen transactions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-800/80 text-gold-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Strictly Zero Brokerage</h4>
                    <p className="text-[11px] text-emerald-300/80">
                      Direct owner listings for Masjid-proximate apartments and flatmates.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-emerald-800/80 text-gold-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Direct WhatsApp Ordering</h4>
                    <p className="text-[11px] text-emerald-300/80">
                      Instant connection to home bakers, Rida designers, and Bohra caterers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 text-[11px] text-emerald-300/70 flex items-center justify-between">
              <span>Al-Souq • Built for Mumineen</span>
              <span className="font-mono text-gold-400">v1.0 PWA</span>
            </div>
          </div>

          {/* Right Form Interactive Portal */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Portal Mode Switcher */}
              <div className="flex items-center justify-between border-b border-border pb-3 mb-5">
                <div className="flex items-center gap-2 bg-surface-muted p-1 rounded-2xl border border-border">
                  <button
                    onClick={() => {
                      setMode('SIGN_IN');
                      setErrorMsg('');
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      mode === 'SIGN_IN'
                        ? 'bg-emerald-900 text-white shadow-sm ring-1 ring-gold-500/40'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Self Sign-In
                  </button>
                  <button
                    onClick={() => {
                      setMode('REGISTER');
                      setErrorMsg('');
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                      mode === 'REGISTER'
                        ? 'bg-emerald-900 text-white shadow-sm ring-1 ring-gold-500/40'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    New Mumin Registration
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {mode === 'SIGN_IN' ? 'Access your dashboard' : 'Join the verified community'}
                </span>
              </div>

              {/* Status Notifications */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in">
                  ⚠️ {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* FORM A: SIGN IN */}
              {mode === 'SIGN_IN' ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 block">
                      Email, Phone, or 8-Digit ITS ID
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAuthMethod('PASSWORD')}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition ${
                          authMethod === 'PASSWORD'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'text-slate-500 border-transparent'
                        }`}
                      >
                        Password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMethod('OTP');
                          setOtp('123456');
                        }}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition ${
                          authMethod === 'OTP'
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'text-slate-500 border-transparent'
                        }`}
                      >
                        WhatsApp OTP
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. murtuza.b@example.com or 30491823"
                      className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800 shadow-2xs"
                    />
                  </div>

                  {authMethod === 'PASSWORD' ? (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-800">Password</label>
                        <span className="text-[10px] text-slate-400 font-mono">Demo: Mumin@123</span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-800">WhatsApp 6-Digit OTP</label>
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                          Pre-filled code: 123456
                        </span>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-emerald-700 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="123456"
                          className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-border bg-surface text-slate-900 text-xs font-mono font-bold tracking-widest focus:outline-none focus:border-emerald-800 shadow-2xs"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-gold transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    <span>{isLoading ? 'Signing In...' : 'Sign In to Al-Souq'}</span>
                    <ArrowRight className="w-4 h-4 text-gold-400" />
                  </button>
                </form>
              ) : (
                /* FORM B: REGISTER */
                <form onSubmit={handleRegister} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Full Name (as per ITS Card)
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Taher Merchant"
                      className="w-full px-3.5 py-2 rounded-2xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="taher@example.com"
                        className="w-full px-3.5 py-2 rounded-2xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        WhatsApp Phone
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98200 11223"
                        className="w-full px-3.5 py-2 rounded-2xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3.5 py-2 rounded-2xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        8-Digit ITS ID Number
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        value={itsNumber}
                        onChange={(e) => setItsNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g. 50294102"
                        className="w-full px-3.5 py-2 rounded-2xl border border-border bg-surface text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-800 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">City / Jamaat</label>
                      <select
                        value={cityId}
                        onChange={(e) => {
                          setCityId(e.target.value);
                          const sel = CITIES.find((c) => c.id === e.target.value);
                          if (sel && sel.localities.length > 1) {
                            setMohalla(sel.localities[1]);
                          }
                        }}
                        className="w-full px-3 py-2 rounded-2xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                      >
                        {CITIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.country})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">Mohalla</label>
                      <select
                        value={mohalla}
                        onChange={(e) => setMohalla(e.target.value)}
                        className="w-full px-3 py-2 rounded-2xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm shadow-gold transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                  >
                    <span>{isLoading ? 'Creating Account...' : 'Complete Self-Registration'}</span>
                    <ArrowRight className="w-4 h-4 text-gold-400" />
                  </button>
                </form>
              )}
            </div>

            {/* Quick 1-Click Evaluation Personas */}
            <div className="mt-6 pt-5 border-t border-border">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Or Self-Sign In as Test Persona (1-Click):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="p-2 rounded-xl border border-border bg-surface-muted/50 hover:bg-purple-50 text-slate-800 text-left transition"
                >
                  <div className="font-bold text-[11px] truncate">Murtuza (Admin)</div>
                  <div className="text-[10px] text-purple-700 font-semibold">ITS 30491823</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('CREATOR')}
                  className="p-2 rounded-xl border border-border bg-surface-muted/50 hover:bg-gold-50 text-slate-800 text-left transition"
                >
                  <div className="font-bold text-[11px] truncate">Fatema (Creator)</div>
                  <div className="text-[10px] text-gold-700 font-semibold">Raza Badge</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('VERIFIED')}
                  className="p-2 rounded-xl border border-border bg-surface-muted/50 hover:bg-emerald-50 text-slate-800 text-left transition"
                >
                  <div className="font-bold text-[11px] truncate">Huzefa (Owner)</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Verified Mumin</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('PENDING')}
                  className="p-2 rounded-xl border border-border bg-surface-muted/50 hover:bg-amber-50 text-slate-800 text-left transition"
                >
                  <div className="font-bold text-[11px] truncate">Shabbir (KYC)</div>
                  <div className="text-[10px] text-amber-700 font-semibold">Under Review</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 text-center text-xs text-slate-500">
        <p>Al-Souq • Visual Commerce & High-Trust Classifieds for the Dawoodi Bohra Community</p>
      </footer>
    </div>
  );
}
