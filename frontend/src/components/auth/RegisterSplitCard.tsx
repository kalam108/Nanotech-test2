'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NanoTechLogo } from '../brand/NanoTechLogo';
import { supabase } from '../../lib/supabase/client';
import { SUPER_ADMIN_EMAIL, syncCustomerToSupabaseStoreUser } from '../../lib/supabase';
import {
  signUpWithEmail as signUpWithFirebaseEmail,
  signInWithGoogle as signInWithFirebaseGoogle,
  syncCustomerToFirestore,
} from '../../lib/firebase';
import { GoogleIcon } from '../common/GoogleIcon';
import { VerifyCode } from './VerifyCode';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ChevronDown,
  ArrowRight,
  Laptop,
  Truck,
  ShieldCheck,
  CreditCard,
  X,
  Loader2,
  AlertCircle,
  Maximize2,
} from 'lucide-react';

interface RegisterSplitCardProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function RegisterSplitCard({
  onSuccess,
  onSwitchToLogin,
  onClose,
  isModal = false,
}: RegisterSplitCardProps) {
  const { addToast } = useApp();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+977');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null);

  // 1. Google One-Click Registration via Firebase OAuth
  const handleGoogleSignUp = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);

    try {
      const { user: fbUser, profile } = await signInWithFirebaseGoogle();
      const isSuperAdmin =
        (fbUser.email || '').toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

      const customerProfile = {
        id: fbUser.uid,
        name: profile.name || fbUser.displayName || 'Google Customer',
        email: fbUser.email,
        role: isSuperAdmin ? 'admin' : 'customer',
        phone: fbUser.phoneNumber || '',
        location: 'Nepal (Storefront)',
        orders: 1,
        status: 'active',
        joined: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString(),
        isLiveSession: true,
        source: 'Firebase Google Auth & Firestore',
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('nanotech_session_token', `fb_${fbUser.uid}_${Date.now()}`);
        localStorage.setItem('nanotech_user', JSON.stringify(customerProfile));

        try {
          const raw = localStorage.getItem('nanotech_registered_customers');
          const list = raw ? JSON.parse(raw) : [];
          const idx = list.findIndex(
            (c: any) => c.email?.toLowerCase() === fbUser.email?.toLowerCase()
          );
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...customerProfile, isLiveSession: true };
          } else {
            list.unshift(customerProfile);
          }
          localStorage.setItem('nanotech_registered_customers', JSON.stringify(list));
        } catch {}

        syncCustomerToFirestore(customerProfile);
        syncCustomerToSupabaseStoreUser(customerProfile);

        window.dispatchEvent(new Event('auth-state-change'));
      }

      addToast('success', `Welcome to NanoTech, ${customerProfile.name}!`);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      console.error('[Google SignUp Error]:', err);
      setErrorMessage(err?.message || 'Google sign-up failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 2. Email & Password Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage('Please enter your last name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMessage('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      const fullPhone = phone.trim() ? `${countryCode}${phone.trim()}` : '';
      const fullName = [firstName.trim(), middleName.trim(), lastName.trim()]
        .filter(Boolean)
        .join(' ');

      if (typeof window !== 'undefined' && fullName) {
        localStorage.setItem('nanotech_pending_fullname', fullName);
      }

      // A. Try Firebase Authentication and Firestore first
      try {
        const { user: fbUser, profile } = await signUpWithFirebaseEmail(
          email.trim(),
          password,
          fullName,
          fullPhone
        );

        if (fbUser) {
          const customerProfile = {
            id: fbUser.uid,
            name: fullName,
            email: fbUser.email || email.trim(),
            role: profile.role,
            phone: fullPhone || '',
            location: 'Nepal (Storefront)',
            orders: 0,
            status: 'active',
            joined: new Date().toISOString().split('T')[0],
            lastLogin: new Date().toISOString(),
            isLiveSession: true,
            source: 'Firebase Auth & Firestore',
          };

          if (typeof window !== 'undefined') {
            localStorage.setItem('nanotech_session_token', `fb_${fbUser.uid}_${Date.now()}`);
            localStorage.setItem('nanotech_user', JSON.stringify(customerProfile));

            try {
              const raw = localStorage.getItem('nanotech_registered_customers');
              const list = raw ? JSON.parse(raw) : [];
              list.unshift(customerProfile);
              localStorage.setItem('nanotech_registered_customers', JSON.stringify(list));
            } catch {}

            syncCustomerToFirestore(customerProfile);
            syncCustomerToSupabaseStoreUser(customerProfile);

            window.dispatchEvent(new Event('auth-state-change'));
          }

          addToast('success', `Welcome to NanoTech, ${fullName}! Account created.`);
          if (onSuccess) onSuccess();
          if (onClose) onClose();
          return;
        }
      } catch (fbErr: any) {
        console.warn('[Firebase Auth SignUp Note]:', fbErr?.message || fbErr);
        if (fbErr?.code === 'auth/email-already-in-use') {
          setErrorMessage('This email is already registered. Sign in instead.');
          setIsLoading(false);
          return;
        }
      }

      // B. Fallback to Supabase Auth if needed
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            first_name: firstName.trim(),
            middle_name: middleName.trim(),
            last_name: lastName.trim(),
            full_name: fullName,
            name: fullName,
            phone: fullPhone || undefined,
          },
        },
      });

      if (error) {
        console.error('[auth]', error);
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (data?.user?.identities && data.user.identities.length === 0) {
        setErrorMessage('This email is already registered. Sign in instead.');
        setIsLoading(false);
        return;
      }

      setVerifyingEmail(email.trim());
    } catch {
      setErrorMessage('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[960px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative border border-slate-200/80 animate-in fade-in zoom-in-95 duration-200">
      {/* =========================================================================
          LEFT SIDE: Setup Artwork matching user reference image
      ========================================================================= */}
      <div className="w-full md:w-[45%] lg:w-[44%] relative min-h-[340px] md:min-h-auto p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between overflow-hidden select-none shrink-0 bg-slate-950">
        <img
          src="/image.png"
          alt="Nanotech Solution Setup"
          className="absolute inset-0 w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-slate-950/70 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-6 sm:space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center p-1 shadow-lg shrink-0 border border-white/20">
              <NanoTechLogo size="sm" variant="emblem" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white drop-shadow-md block leading-tight">
                Nanotech Solution
              </span>
              <span className="text-[11px] text-amber-300 font-medium tracking-wide">
                Hardware & Gaming Hub
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-2 sm:pt-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-lg">
              Shop the latest computers and accessories
            </h2>
            <p className="text-white/85 text-xs sm:text-sm drop-shadow">
              Your trusted computer and gaming store online
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md rounded-xl p-2.5 border border-white/10 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-teal-500/80 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Laptop className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-sm">
                Laptops, desktops & custom rigs
              </span>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md rounded-xl p-2.5 border border-white/10 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-blue-500/80 flex items-center justify-center text-white shrink-0 shadow-sm">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-sm">
                Express nationwide delivery
              </span>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md rounded-xl p-2.5 border border-white/10 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/80 flex items-center justify-center text-white shrink-0 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-sm">
                100% Genuine with warranty
              </span>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/60 backdrop-blur-md rounded-xl p-2.5 border border-white/10 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-amber-500/80 flex items-center justify-center text-white shrink-0 shadow-sm">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-white drop-shadow-sm">
                Secure checkout & easy returns
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-6 flex items-center justify-between text-[11px] text-white/70">
          <span>© 2026 Nanotech Solution</span>
          <button
            type="button"
            onClick={() => setShowImagePreview(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[11px] font-medium backdrop-blur-md transition-colors cursor-pointer border border-white/15"
            title="View full setup image"
          >
            <Maximize2 className="w-3 h-3" />
            <span>Full Image</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE: Pure White Sign Up Form
      ========================================================================= */}
      <div className="w-full md:w-[58%] lg:w-[60%] p-6 sm:p-8 lg:p-10 bg-white flex flex-col justify-between text-slate-800 relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-100 cursor-pointer z-20"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}

        {verifyingEmail ? (
          <div className="w-full flex-1 flex items-center justify-center py-2 animate-in fade-in duration-200">
            <VerifyCode
              email={verifyingEmail}
              onSuccess={() => {
                if (onSuccess) onSuccess();
                if (onClose) onClose();
              }}
              onChangeEmail={() => setVerifyingEmail(null)}
              onClose={onClose}
            />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Header Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Create Account
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Sign up to start shopping on Nanotech Solution
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Google Sign-Up Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full h-11 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 hover:border-slate-400 active:scale-[0.99]"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                      <span>Connecting Google...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon className="w-4 h-4 shrink-0" />
                      <span>Sign up with Google</span>
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2.5 text-slate-400 font-medium text-[11px] tracking-wider">
                    or register with email
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="John"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className="w-full h-10.5 pl-10 pr-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Doe"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className="w-full h-10.5 pl-10 pr-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Middle Name (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Middle Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={middleName}
                      onChange={e => setMiddleName(e.target.value)}
                      className="w-full h-10.5 pl-10 pr-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* Row 3: Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full h-10.5 pl-10 pr-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                </div>

                {/* Row 4: Phone Number (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="flex rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <div className="flex items-center gap-1.5 px-3 bg-slate-50 border-r border-slate-200 text-xs font-semibold text-slate-700 select-none shrink-0">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{countryCode}</span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      placeholder="1234567890"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="flex-1 h-10.5 px-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* Row 5: Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full h-10.5 pl-10 pr-10 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full h-10.5 pl-10 pr-10 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms of Service & Privacy Policy Agreement */}
                <div className="flex items-center gap-2.5 pt-0.5">
                  <input
                    type="checkbox"
                    id="agree-terms-checkbox"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb] cursor-pointer"
                  />
                  <label htmlFor="agree-terms-checkbox" className="text-xs text-slate-600 cursor-pointer select-none">
                    I agree to the{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563eb] hover:underline font-medium"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563eb] hover:underline font-medium"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full h-11 bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer Link */}
            <div className="text-center text-xs text-slate-500 pt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#2563eb] hover:text-[#1d4ed8] font-bold hover:underline cursor-pointer ml-1"
              >
                Sign in
              </button>
            </div>
          </>
        )}
      </div>

      {/* Full Image Preview Lightbox */}
      {showImagePreview && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setShowImagePreview(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-white/10 text-white select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                  NT
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white/90">
                  Nanotech Studio Setup Artwork
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowImagePreview(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative overflow-auto flex items-center justify-center bg-black/50 p-2">
              <img
                src="/image.png"
                alt="Nanotech Solution Setup Artwork"
                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
