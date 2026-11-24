'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CITIES } from '@/data/cities';
import {
  X,
  Lock,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CreditCard,
  Building,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentUser } = useApp();

  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'DEMO'>('LOGIN');
  const [authMode, setAuthMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regPassword, setRegPassword] = useState('');
  const [regIts, setRegIts] = useState('');
  const [regCityId, setRegCityId] = useState('mumbai');
  const [regMohalla, setRegMohalla] = useState('Mazgaon (Hasanabad / Saifee Park)');

  // Status & Error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentCityObj = CITIES.find((c) => c.id === regCityId);

  const handleLogin = async (e: React.FormEvent) => {
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
          password: authMode === 'PASSWORD' ? password : undefined,
          otp: authMode === 'OTP' ? otp : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setCurrentUser(data.user);
      setSuccessMsg(`Welcome back, ${data.user.fullName}!`);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate');
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
          fullName: regFullName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          itsNumber: regIts,
          cityId: regCityId,
          cityName: currentCityObj?.name || 'Mumbai',
          mohallaName: regMohalla,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setCurrentUser(data.user);
      setSuccessMsg('Account created successfully! Welcome to Al-Souq.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'ADMIN' | 'CREATOR' | 'VERIFIED' | 'PENDING' | 'UNVERIFIED') => {
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
        setSuccessMsg(`Switched active profile to ${data.user.fullName}`);
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo switch failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-md rounded-3xl shadow-elevated border border-border overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-surface-muted/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-gold-400 shadow-gold border border-gold-500/30 font-serif font-black text-lg">
              س
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                Community Access & Sign In
              </h3>
              <p className="text-[11px] text-slate-500">
                Al-Souq • Dawoodi Bohra High-Trust Marketplace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-3 bg-surface-muted/60 border-b border-border">
          <div className="grid grid-cols-3 gap-1 bg-surface p-1 rounded-2xl border border-border text-xs font-bold">
            <button
              onClick={() => {
                setTab('LOGIN');
                setErrorMsg('');
              }}
              className={`py-1.5 rounded-xl transition ${
                tab === 'LOGIN' ? 'bg-emerald-900 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab('REGISTER');
                setErrorMsg('');
              }}
              className={`py-1.5 rounded-xl transition ${
                tab === 'REGISTER' ? 'bg-emerald-900 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => {
                setTab('DEMO');
                setErrorMsg('');
              }}
              className={`py-1.5 rounded-xl transition ${
                tab === 'DEMO' ? 'bg-emerald-900 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1-Click Demo
            </button>
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mx-5 mt-4 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN */}
        {tab === 'LOGIN' && (
          <form onSubmit={handleLogin} className="p-5 overflow-y-auto space-y-4">
            {/* Toggle Password vs WhatsApp OTP */}
            <div className="flex items-center justify-between text-xs pb-1">
              <span className="font-semibold text-slate-700">Authentication Method:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('PASSWORD')}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                    authMode === 'PASSWORD'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'text-slate-500 border-transparent'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('OTP');
                    setOtpSent(true);
                  }}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                    authMode === 'OTP'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'text-slate-500 border-transparent'
                  }`}
                >
                  WhatsApp OTP
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email, Phone, or 8-Digit ITS ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter email, phone, or ITS"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>
            </div>

            {authMode === 'PASSWORD' ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">WhatsApp 6-Digit OTP</label>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-emerald-700 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs font-mono font-bold tracking-widest focus:outline-none focus:border-emerald-800"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-gold transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Al-Souq'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER */}
        {tab === 'REGISTER' && (
          <form onSubmit={handleRegister} className="p-5 overflow-y-auto space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Taher Merchant"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="taher@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98200 99887"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  8-Digit ITS ID (Optional)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={regIts}
                  onChange={(e) => setRegIts(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 50294102"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">City / Jamaat</label>
                <select
                  value={regCityId}
                  onChange={(e) => {
                    setRegCityId(e.target.value);
                    const sel = CITIES.find((c) => c.id === e.target.value);
                    if (sel && sel.localities.length > 1) {
                      setRegMohalla(sel.localities[1]);
                    }
                  }}
                  className="w-full px-2.5 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
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
                  value={regMohalla}
                  onChange={(e) => setRegMohalla(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
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
              className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-gold transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Register as Verified Mumin'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
            </button>
          </form>
        )}

        {/* TAB 3: 1-CLICK DEMO ACCOUNTS */}
        {tab === 'DEMO' && (
          <div className="p-5 overflow-y-auto space-y-2.5">
            <p className="text-[11px] text-slate-500 mb-2">
              Select any pre-configured persona below to test all platform permissions instantly:
            </p>

            <button
              onClick={() => handleDemoLogin('ADMIN')}
              className="w-full text-left p-3 rounded-2xl bg-surface-muted/50 hover:bg-emerald-50 border border-border flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                  M
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                    Murtuza Bagasrawala (Admin)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Mazgaon • ITS 30491823 • Trust & KYC Moderation Queue
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                Admin
              </span>
            </button>

            <button
              onClick={() => handleDemoLogin('CREATOR')}
              className="w-full text-left p-3 rounded-2xl bg-surface-muted/50 hover:bg-emerald-50 border border-border flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gold-100 text-gold-800 flex items-center justify-center font-bold text-xs">
                  F
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                    Fatema Chitalwala (Creator Pro)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Farida's Rida Atelier • Raza Badge • Seller Studio ROI
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-gold-100 text-gold-900 font-bold px-2 py-0.5 rounded-full">
                Tijarat Pro
              </span>
            </button>

            <button
              onClick={() => handleDemoLogin('VERIFIED')}
              className="w-full text-left p-3 rounded-2xl bg-surface-muted/50 hover:bg-emerald-50 border border-border flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  H
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-950">
                    Huzefa Taherbhai (Verified Mumin)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Bhendi Bazaar • NoBroker Flats & Catering Gear
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                Verified
              </span>
            </button>

            <button
              onClick={() => handleDemoLogin('PENDING')}
              className="w-full text-left p-3 rounded-2xl bg-surface-muted/50 hover:bg-amber-50 border border-border flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  S
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-950">
                    Shabbir Rampurawala (Pending KYC)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Marol • ITS 70281923 • Card under Vision OCR review
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                Pending
              </span>
            </button>

            <button
              onClick={() => handleDemoLogin('UNVERIFIED')}
              className="w-full text-left p-3 rounded-2xl bg-surface-muted/50 hover:bg-slate-100 border border-border flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                  G
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Guest Visitor (Unverified Mode)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Public Feed Browsing • Masked Phone Numbers
                  </div>
                </div>
              </div>
              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                Guest
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
