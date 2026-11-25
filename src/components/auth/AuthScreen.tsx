'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { CITIES } from '@/data/cities';
import {
  validateEmail,
  validatePhone,
  validateItsNumber,
  validatePassword,
} from '@/utils/validators';
import {
  Lock,
  User as UserIcon,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Camera,
  CreditCard,
  Upload,
  X,
  ShieldCheck,
  AlertCircle,
  Mail,
  KeyRound,
  Building2,
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const router = useRouter();
  const { setCurrentUser } = useApp();

  const [mode, setMode] = useState<'SIGN_IN' | 'REGISTER' | 'FORGOT_PASSWORD'>('SIGN_IN');
  const [authMethod, setAuthMethod] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Forgot Password Form State
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'RESET'>('EMAIL');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [regPassword, setRegPassword] = useState('');
  const [itsNumber, setItsNumber] = useState('');
  const [cityId, setCityId] = useState('mumbai');
  const [jamaat, setJamaat] = useState(
    CITIES.find((c) => c.id === 'mumbai')?.jamaats[0] || 'Mazgaon Jamaat (Hasanabad / Saifee Park)'
  );
  const [mohalla, setMohalla] = useState('Mazgaon (Hasanabad / Saifee Park)');

  // KYC Proofs (ITS Card & Live Photo)
  const [itsCardProof, setItsCardProof] = useState<string>('');
  const [livePhoto, setLivePhoto] = useState<string>('');

  // Camera State for Live Photo
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Status & Alerts
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const currentCityObj = CITIES.find((c) => c.id === cityId);

  // Clean up camera stream on unmount
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Start Webcam Video Stream
  const startCamera = async () => {
    setCameraError('');
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(
        'Camera permission is required for Live Photo verification. Please allow camera access in your browser settings and try again.'
      );
      setIsCameraActive(false);
    }
  };

  // Capture Live Photo Snapshot from Video Feed
  const captureLivePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setLivePhoto(dataUrl);
      stopCamera();
    }
  };

  // Handle ITS Card File Upload
  const handleItsCardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('ITS card image size should be under 8MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setItsCardProof(reader.result as string);
        setErrorMsg('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleForgotPasswordSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailCheck = validateEmail(forgotEmail);
    if (!emailCheck.valid) {
      setErrorMsg(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailCheck.normalized }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Could not send reset code.');
      }
      setSuccessMsg(data.message);
      setForgotStep('RESET');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailCheck = validateEmail(forgotEmail);
    if (!emailCheck.valid) {
      setErrorMsg(emailCheck.error || 'Invalid email address.');
      return;
    }
    if (!/^\d{6}$/.test(forgotOtp.trim())) {
      setErrorMsg('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    const passCheck = validatePassword(forgotNewPassword);
    if (!passCheck.valid) {
      setErrorMsg(passCheck.error || 'Please choose a stronger password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailCheck.normalized,
          otp: forgotOtp.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Password reset failed.');
      }

      setSuccessMsg(data.message || 'Password reset! Please sign in with your new password.');
      setMode('SIGN_IN');
      setForgotStep('EMAIL');
      setIdentifier(emailCheck.normalized);
      setForgotOtp('');
      setForgotNewPassword('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

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

      // Check if user is pending admin approval
      if (data.user.verificationStatus === 'PENDING' && data.user.role !== 'ADMIN') {
        router.push('/onboard-waiting');
        return;
      }

      setSuccessMsg(`Welcome back, ${data.user.fullName}!`);
      if (onSuccess) onSuccess();
      else router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      setErrorMsg(emailCheck.error || 'Please enter a valid email address.');
      return;
    }

    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.valid) {
      setErrorMsg(phoneCheck.error || 'Please enter a valid phone number.');
      return;
    }

    const itsCheck = validateItsNumber(itsNumber);
    if (!itsCheck.valid) {
      setErrorMsg(itsCheck.error || 'Please enter a valid 8-digit ITS ID.');
      return;
    }

    const passCheck = validatePassword(regPassword);
    if (!passCheck.valid) {
      setErrorMsg(passCheck.error || 'Please choose a stronger password.');
      return;
    }

    if (!itsCardProof) {
      setErrorMsg('Please upload a clear photo of your ITS smart card.');
      return;
    }

    if (!livePhoto) {
      setErrorMsg('Please capture a live camera snapshot for verification.');
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
          email: emailCheck.normalized,
          phone: phoneCheck.normalized,
          password: regPassword,
          itsNumber: itsCheck.normalized,
          cityId,
          cityName: currentCityObj?.name || 'Mumbai',
          jamaatName: jamaat,
          mohallaName: jamaat || mohalla,
          itsCardProofUrl: itsCardProof,
          livePhotoUrl: livePhoto,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setCurrentUser(data.user);
      setSuccessMsg('KYC submitted! Redirecting to onboarding waiting room...');

      // Route immediately to Onboard Waiting Section
      setTimeout(() => {
        router.push('/onboard-waiting');
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-6 animate-in fade-in duration-200">
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
            Dawoodi Bohra Community Verified Commerce Platform
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-surface-muted p-1 rounded-2xl border border-border text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('SIGN_IN');
              setErrorMsg('');
              stopCamera();
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
            Create Account & Verify ITS
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
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
                      setOtp('');
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
                  placeholder="Enter email, phone, or ITS ID"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>
            </div>

            {authMethod === 'PASSWORD' ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('FORGOT_PASSWORD');
                      setForgotStep('EMAIL');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
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
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  6-Digit WhatsApp OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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
        ) : mode === 'FORGOT_PASSWORD' ? (
          /* FORM: FORGOT PASSWORD WITH EMAIL OTP (REDIS-BACKED) */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-sm text-emerald-950">
                Reset Your Password
              </h2>
              <button
                type="button"
                onClick={() => {
                  setMode('SIGN_IN');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-emerald-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Sign In</span>
              </button>
            </div>

            {forgotStep === 'EMAIL' ? (
              <form onSubmit={handleForgotPasswordSend} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your registered email address. We will send a 6-digit verification code (valid for 10 minutes).
                </p>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-gold transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span>{isLoading ? 'Sending OTP...' : 'Send Email Reset OTP'}</span>
                  <ArrowRight className="w-4 h-4 text-gold-400" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    6-Digit Email OTP
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-emerald-700 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs font-mono tracking-widest font-bold focus:outline-none focus:border-emerald-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Min 8 chars (letters + numbers)"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-gold transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span>{isLoading ? 'Updating Password...' : 'Verify OTP & Reset Password'}</span>
                  <CheckCircle2 className="w-4 h-4 text-gold-400" />
                </button>
              </form>
            )}
          </div>
        ) : (
          /* FORM 2: REGISTRATION WITH ITS CARD & LIVE PHOTO CLICK */
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Section 1: Basic Information */}
            <div className="space-y-3">
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
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
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
                    8-Digit ITS ID <span className="text-emerald-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="30491823"
                    value={itsNumber}
                    onChange={(e) => setItsNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs font-mono tracking-wider font-bold focus:outline-none focus:border-emerald-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    City
                  </label>
                  <select
                    value={cityId}
                    onChange={(e) => {
                      const nextCityId = e.target.value;
                      setCityId(nextCityId);
                      const c = CITIES.find((ci) => ci.id === nextCityId);
                      if (c?.jamaats?.length) setJamaat(c.jamaats[0]);
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
                <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Jamaat ({currentCityObj?.name || 'City'})</span>
                </label>
                <select
                  value={jamaat}
                  onChange={(e) => {
                    setJamaat(e.target.value);
                    setMohalla(e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                >
                  {(currentCityObj?.jamaats || []).map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Password <span className="text-[10px] font-normal text-slate-500">(min 8 chars, letters + numbers)</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Choose a strong password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border bg-surface text-slate-900 text-xs focus:outline-none focus:border-emerald-800"
                />
              </div>
            </div>

            {/* Section 2: KYC Proofs (ITS Card + Live Photo Click) */}
            <div className="pt-2 border-t border-border space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                <ShieldCheck className="w-4 h-4 text-emerald-800" />
                <span>Mandatory KYC: ITS Card & Live Photo</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Admins verify your card and selfie before granting access to community trade.
              </p>

              {/* Upload ITS Card */}
              <div className="bg-surface-muted rounded-2xl p-3 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Upload ITS Smart Card</span>
                  </label>
                  {itsCardProof && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Attached
                    </span>
                  )}
                </div>

                {itsCardProof ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={itsCardProof}
                      alt="ITS Card Preview"
                      className="w-20 h-14 object-cover rounded-xl border border-border shadow-xs"
                    />
                    <label className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold cursor-pointer underline">
                      Change Card
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleItsCardUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-border rounded-xl hover:border-emerald-800 cursor-pointer transition bg-surface">
                    <Upload className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-xs font-medium text-slate-700">Click to upload ITS Card image</span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, or photo of physical/digital ITS</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleItsCardUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Live Photo Click (Webcam with Fallback) */}
              <div className="bg-surface-muted rounded-2xl p-3 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Live Photo Snapshot</span>
                  </label>
                  {livePhoto && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Captured
                    </span>
                  )}
                </div>

                {/* If photo captured already */}
                {livePhoto ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={livePhoto}
                      alt="Live Selfie Preview"
                      className="w-16 h-16 object-cover rounded-xl border-2 border-emerald-700 shadow-xs"
                    />
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-800">
                        Live photo captured
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setLivePhoto('');
                          startCamera();
                        }}
                        className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold underline block"
                      >
                        Retake Photo
                      </button>
                    </div>
                  </div>
                ) : isCameraActive ? (
                  /* Active Live Camera Stream */
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-48 flex items-center justify-center border border-border">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Face guide overlay */}
                      <div className="absolute inset-0 border-2 border-white/40 border-dashed rounded-full m-4 pointer-events-none" />
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={captureLivePhoto}
                      className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-gold-400" />
                      <span>Take Live Photo</span>
                    </button>
                  </div>
                ) : (
                  /* Camera Inactive: Button to Start Camera (Live Capture Only) */
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
                    >
                      <Camera className="w-4 h-4 text-gold-400" />
                      <span>Click Live Photo (Open Camera)</span>
                    </button>

                    <p className="text-[10px] text-slate-500 text-center">
                      Live camera snapshot required — file uploads are disabled for identity security.
                    </p>

                    {cameraError && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        {cameraError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submission notice & button */}
            <div className="pt-2">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed mb-3">
                <strong>Admin Review Required:</strong> After submitting, your account will enter the onboard waiting queue until an Al-Souq Admin verifies your documents and activates your account.
              </div>

              <button
                type="submit"
                disabled={isLoading || !itsCardProof || !livePhoto}
                className="w-full bg-emerald-900 hover:bg-emerald-950 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-gold transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span>
                  {isLoading
                    ? 'Submitting for Admin Verification...'
                    : 'Submit Registration for Admin Approval'}
                </span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </button>

              {(!itsCardProof || !livePhoto) && (
                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 rounded-lg p-2 text-center mt-2 font-medium">
                  {!itsCardProof && !livePhoto
                    ? '⚠️ Please upload your ITS card and capture a live snapshot above to submit.'
                    : !itsCardProof
                    ? '⚠️ Please upload your ITS card above to proceed.'
                    : '⚠️ Please capture a live selfie snapshot above to proceed.'}
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
