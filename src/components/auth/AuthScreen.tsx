'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CITIES } from '@/data/cities';
import {
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  CreditCard,
  MapPin,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { setCurrentUser } = useApp();

  const [mode, setMode] = useState<'SIGN_IN' | 'REGISTER'>('SIGN_IN');
  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

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
    if (!identifier.trim()) {
      setErrorMsg('Please enter your email, phone, or 8-digit ITS number.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: authMethod === 'PASSWORD' ? password : undefined,
          otp: authMethod === 'OTP' ? otp : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      setCurrentUser(data.user);
      setSuccessMsg(`Welcome, ${data.user.fullName}!`);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !regPassword.trim()) {
      setErrorMsg('Please enter your full name, email, and a password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: regPassword,
          itsNumber: itsNumber.trim(),
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
      setSuccessMsg('Account created successfully!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'ADMIN' | 'VERIFIED') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setSuccessMsg(`Logged in as ${data.user.fullName}`);
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-surface rounded-3xl shadow-elevated border border-border p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-gold-400 font-serif font-black text-2xl mx-auto shadow-gold border border-gold-500/30">
            س
          </div>
          <h1 className="font-serif font-black text-2xl text-emerald-950 tracking-tight">
            Al-Souq <span className="text-gold-600 font-serif font-semibold text-lg ml-1">السوق</span>
          </h1>
          <p className="text-xs text-slate-500">
            Community Visual Souq & Classifieds Platform
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-surface-muted p-1 rounded-2xl border border-border text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('SIGN_IN');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition ${
              mode === 'SIGN_IN'
                ? 'bg-emerald-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl transition ${
              mode === 'REGISTER'
                ? 'bg-emerald-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-in fade-in">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORM 1: SIGN IN */}
        {mode === 'SIGN_IN' ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Email, Phone, or ITS ID
                </label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setAuthMethod('PASSWORD')}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                      authMethod === 'PASSWORD'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'text-slate-400'
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
                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                      authMethod === 'OTP'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'text-slate-400'
                    }`}
                  >
                    WhatsApp OTP
                  </button>
                </div>
              </div>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="admin@alsouq.community or 10000001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>
            </div>

            {authMethod === 'PASSWORD' ? (
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    6-Digit WhatsApp OTP
                  </label>
                  <span className="text-[10px] text-emerald-700 font-mono">Default: 123456</span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs font-mono tracking-widest text-center font-bold focus:outline-none focus:border-emerald-800"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-gold transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </button>
          </form>
        ) : (
          /* FORM 2: REGISTRATION */
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Murtuza Bagasrawala"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98200..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  8-Digit ITS ID
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="30491823"
                  value={itsNumber}
                  onChange={(e) => setItsNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs font-mono tracking-wider focus:outline-none focus:border-emerald-800"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  City
                </label>
                <select
                  value={cityId}
                  onChange={(e) => {
                    setCityId(e.target.value);
                    const c = CITIES.find((ci) => ci.id === e.target.value);
                    if (c?.localities?.length) setMohalla(c.localities[0]);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                >
                  {CITIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Choose a password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-gold transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 pt-1"
            >
              <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </button>
          </form>
        )}

        {/* Quick Demo Access (Compact & Clean) */}
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px]">Quick Access:</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 transition"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('VERIFIED')}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 transition"
            >
              Verified Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
