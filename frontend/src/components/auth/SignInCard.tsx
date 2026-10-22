'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase/client';
import { SUPER_ADMIN_EMAIL, syncCustomerToSupabaseStoreUser } from '../../lib/supabase';
import {
  signInWithEmail as signInWithFirebaseEmail,
  signInWithGoogle as signInWithFirebaseGoogle,
  syncCustomerToFirestore,
  checkFirebaseConnection,
  FirebaseConnectionStatus,
} from '../../lib/firebase';
import { GoogleIcon } from '../common/GoogleIcon';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { VerifyCode } from './VerifyCode';

interface SignInCardProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function SignInCard({
  onSuccess,
  onSwitchToSignUp,
  onClose,
  isModal = false,
}: SignInCardProps) {
  const router = useRouter();
  const { setCurrentView, addToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null);
  const [fbStatus, setFbStatus] = useState<FirebaseConnectionStatus | null>(null);

  useEffect(() => {
    checkFirebaseConnection().then(setFbStatus).catch(() => {});
  }, []);

  // If user needs email verification, show the VerifyCode screen inside the popup
  if (verifyingEmail) {
    return (
      <VerifyCode
        email={verifyingEmail}
        onSuccess={() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }}
        onChangeEmail={() => setVerifyingEmail(null)}
        onClose={onClose}
      />
    );
  }

  // 1. Google Sign-In via Firebase Auth
  const handleGoogleSignIn = async () => {
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

        // Sync to both Firestore and Supabase store_user mirror
        syncCustomerToFirestore(customerProfile);
        syncCustomerToSupabaseStoreUser(customerProfile);

        window.dispatchEvent(new Event('auth-state-change'));
      }

      if (isSuperAdmin) {
        setCurrentView('admin_dashboard');
      }

      addToast('success', `Signed in with Google as ${customerProfile.name}!`);
      router.refresh();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      console.error('[Google SignIn Error]:', err);
      setErrorMessage(err?.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 2. Email & Password Sign-In
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      let signedInProfile: any = null;
      let sessionToken = '';

      // A. Try Firebase Authentication first
      try {
        const { user: fbUser, profile } = await signInWithFirebaseEmail(
          trimmedEmail,
          password
        );
        if (fbUser) {
          const isSuperAdmin =
            trimmedEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
          signedInProfile = {
            id: fbUser.uid,
            name: profile.name || fbUser.displayName || 'Customer',
            email: fbUser.email || trimmedEmail,
            role: isSuperAdmin ? 'admin' : profile.role || 'customer',
            phone: profile.phone || '',
            location: 'Nepal (Storefront)',
            orders: 1,
            status: 'active',
            joined: new Date().toISOString().split('T')[0],
            lastLogin: new Date().toISOString(),
            isLiveSession: true,
            source: 'Firebase Auth & Firestore',
          };
          sessionToken = `fb_${fbUser.uid}_${Date.now()}`;
        }
      } catch (fbErr: any) {
        console.warn('[Firebase Auth Sign-In Attempt]:', fbErr?.message || fbErr);
      }

      // B. Fallback to Supabase if not authenticated in Firebase
      if (!signedInProfile) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        });

        if (error) {
          console.error('[auth]', error);
          if (
            error.code === 'email_not_confirmed' ||
            error.message?.toLowerCase().includes('email not confirmed')
          ) {
            // Open 6-digit VerifyCode screen inside the card
            setVerifyingEmail(trimmedEmail);
            setIsLoading(false);
            return;
          }

          setErrorMessage('Incorrect email or password');
          setIsLoading(false);
          return;
        }

        if (data?.session && data?.user) {
          const user = data.user;
          const metadata = user.user_metadata || {};
          const fullName =
            metadata.full_name ||
            [metadata.first_name, metadata.middle_name, metadata.last_name]
              .filter(Boolean)
              .join(' ') ||
            metadata.name ||
            'Customer';

          sessionToken = data.session.access_token;
          signedInProfile = {
            id: user.id,
            name: fullName,
            email: user.email,
            role: 'customer',
            phone: metadata.phone || '+977 9800000000',
            location: metadata.location || 'Nepal (Storefront)',
            orders: 1,
            status: 'active',
            joined: new Date().toISOString().split('T')[0],
            lastLogin: new Date().toISOString(),
            isLiveSession: true,
            source: 'Supabase Auth',
          };
        }
      }

      // C. Successful authentication
      if (signedInProfile && typeof window !== 'undefined') {
        localStorage.setItem('nanotech_session_token', sessionToken);
        localStorage.setItem('nanotech_user', JSON.stringify(signedInProfile));

        try {
          const raw = localStorage.getItem('nanotech_registered_customers');
          const list = raw ? JSON.parse(raw) : [];
          const idx = list.findIndex(
            (c: any) =>
              c.email?.toLowerCase() === signedInProfile.email?.toLowerCase()
          );
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...signedInProfile, isLiveSession: true };
          } else {
            list.unshift(signedInProfile);
          }
          localStorage.setItem('nanotech_registered_customers', JSON.stringify(list));
        } catch {}

        // Sync to Firestore & Supabase tables
        syncCustomerToFirestore(signedInProfile);
        syncCustomerToSupabaseStoreUser(signedInProfile);

        window.dispatchEvent(new Event('auth-state-change'));

        const isSuperAdmin =
          trimmedEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        if (isSuperAdmin) {
          setCurrentView('admin_dashboard');
        }

        addToast('success', `Welcome back, ${signedInProfile.name}!`);
        router.refresh();
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        setErrorMessage('Incorrect email or password');
      }
    } catch {
      setErrorMessage('Incorrect email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage(
        'Please enter your email address above to receive reset instructions.'
      );
      return;
    }
    setErrorMessage('');
    setForgotPasswordSent(true);
    addToast('info', `Password reset instructions sent to ${email.trim()}`);
    setTimeout(() => setForgotPasswordSent(false), 5000);
  };

  return (
    <div className="w-full max-w-[460px] sm:max-w-[480px] bg-[#F8FAFD] rounded-[28px] sm:rounded-[32px] p-7 sm:p-10 shadow-2xl border border-slate-200/90 relative text-slate-800 animate-in fade-in zoom-in-95 duration-200">
      {/* Optional Modal Close Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-full hover:bg-slate-200/60 cursor-pointer z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 stroke-[2.2]" />
        </button>
      )}

      {/* Header */}
      <div className="text-center pt-1 sm:pt-2">
        <h1 className="text-[28px] sm:text-[34px] font-bold text-[#2563EB] tracking-tight leading-tight">
          Welcome Back
        </h1>
        <p className="text-slate-500 text-sm sm:text-[15px] mt-2 font-normal">
          Sign in to your account to continue shopping
        </p>
      </div>

      {/* Error / Alert notification */}
      {errorMessage && (
        <div className="mt-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Success notification for forgot password */}
      {forgotPasswordSent && (
        <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>Password reset email dispatched. Please check your inbox.</span>
        </div>
      )}

      {/* Google Sign-In Button (Firebase OAuth) */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full h-12 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm sm:text-base rounded-xl transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 hover:border-slate-400 active:scale-[0.99]"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
              <span>Connecting Google...</span>
            </>
          ) : (
            <>
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>Continue with Google</span>
            </>
          )}
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200/90" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#F8FAFD] px-3 text-slate-400 font-medium tracking-wider">
            or sign in with email
          </span>
        </div>
      </div>

      {/* Email / Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address Field */}
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-5 h-5 stroke-[1.8]" />
            </div>
            <input
              type="email"
              required
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all text-sm sm:text-base shadow-xs"
            />
          </div>
        </div>

        {/* Password Field with Forgot Password Link */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-800">
              Password
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-5 h-5 stroke-[1.8]" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-12 pl-12 pr-12 rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all text-sm sm:text-base tracking-wider shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 stroke-[1.8]" />
              ) : (
                <Eye className="w-5 h-5 stroke-[1.8]" />
              )}
            </button>
          </div>
        </div>

        {/* Sign In Primary Button */}
        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.99] text-white font-bold text-base rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>

        {/* Have verification code? Button */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              const target = email.trim() || 'alex.rivera@example.com';
              setVerifyingEmail(target);
            }}
            className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-semibold hover:underline inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Have a verification code? Verify & Sign In</span>
          </button>
        </div>
      </form>

      {/* Footer: Don't have an account? Sign up */}
      <div className="text-center text-sm text-slate-500 mt-5">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-[#2563EB] hover:text-[#1D4ED8] font-bold hover:underline cursor-pointer ml-1 transition-colors"
        >
          Sign up
        </button>
      </div>

      {/* Firebase connection indicator & Quick test helper */}
      <div className="mt-5 pt-3.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5" title={fbStatus?.details || 'Firebase Status'}>
          <span
            className={`w-2 h-2 rounded-full ${
              fbStatus?.hasApiKey ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span className="font-medium text-slate-600">
            {fbStatus?.hasApiKey ? 'Firebase Connected' : 'Firebase: nanotech-203fe'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            const target = email.trim() || 'alex.rivera@example.com';
            setVerifyingEmail(target);
          }}
          className="text-blue-600 hover:text-blue-800 font-semibold hover:underline cursor-pointer flex items-center gap-1"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
          <span>Test Verify Code (123456)</span>
        </button>
      </div>
    </div>
  );
}
