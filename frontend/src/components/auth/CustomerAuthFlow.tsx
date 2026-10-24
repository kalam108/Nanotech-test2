import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';
import { useRBAC } from '../../context/RBACContext';
import { NanoTechLogo } from '../brand/NanoTechLogo';
import {
  X,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Check,
} from 'lucide-react';

// Official Multi-Color Google G Icon SVG
function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.94 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
        fill="#EA4335"
      />
    </svg>
  );
}

export type CustomerAuthScreen =
  | 'signup'        // 1) Sign Up
  | 'verify_gmail'  // 2) Verify Your Gmail
  | 'signin'        // 3) Sign In
  | 'forgot1'       // 4) Forgot Password 1
  | 'forgot2'       // 5) Forgot Password 2
  | 'forgot3'       // 6) Forgot Password 3
  | 'success'       // 7) Success
  | 'signin_reset'; // 8) Sign In after reset

export interface CustomerAuthFlowProps {
  initialScreen?: CustomerAuthScreen;
  initialEmail?: string;
  onClose?: () => void;
  onSuccess?: () => void;
  isModal?: boolean;
}

export function CustomerAuthFlow({
  initialScreen = 'signin',
  initialEmail = '',
  onClose,
  onSuccess,
  isModal = false,
}: CustomerAuthFlowProps) {
  const { setCurrentView } = useApp();
  const { navigate: rbacNavigate } = useRBAC();

  // Active Screen
  const [screen, setScreen] = useState<CustomerAuthScreen>(initialScreen);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // 6-digit OTP array
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password reset fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Sync initial screen when prop changes
  useEffect(() => {
    if (initialScreen) {
      setScreen(initialScreen);
    }
  }, [initialScreen]);

  // 60-second countdown timer for OTP resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-focus first digit box on verification screens
  useEffect(() => {
    if (screen === 'verify_gmail' || screen === 'forgot2') {
      const t = setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
      return () => clearTimeout(t);
    }
  }, [screen]);

  // Handle digit box change
  const handleDigitChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (!rawVal) {
      const updated = [...otp];
      updated[index] = '';
      setOtp(updated);
      return;
    }

    if (rawVal.length === 1) {
      const updated = [...otp];
      updated[index] = rawVal;
      setOtp(updated);

      if (index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else {
      // Pasted characters
      handlePastedOtp(rawVal);
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const updated = [...otp];
        updated[index - 1] = '';
        setOtp(updated);
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const cleaned = pasted.replace(/\D/g, '').slice(0, 6);
    if (cleaned) {
      handlePastedOtp(cleaned);
    }
  };

  const handlePastedOtp = (cleanedDigits: string) => {
    const updated = ['', '', '', '', '', ''];
    for (let i = 0; i < cleanedDigits.length && i < 6; i++) {
      updated[i] = cleanedDigits[i];
    }
    setOtp(updated);

    const nextIndex = Math.min(cleanedDigits.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // Google OAuth Handler (Screens 1, 3, 8)
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setNoticeMsg(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google Sign In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1) SCREEN 1: SIGN UP SUBMIT
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNoticeMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Gmail address.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);
    try {
      // New users always get role 'customer' by database trigger; never send role from frontend
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      setNoticeMsg(null);
      setScreen('verify_gmail');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2) SCREEN 2: VERIFY GMAIL OTP SUBMIT
  const handleVerifyGmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNoticeMsg(null);

    const token = otp.join('');
    if (token.length < 6) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token,
        type: 'email',
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // Success -> store home, signed in!
      setCurrentView('home');
      rbacNavigate('/');
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification failed. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendSignupCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg(null);
    setNoticeMsg(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setResendCooldown(60);
      setNoticeMsg('Verification code resent! Please check your Gmail.');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  // 3) SCREEN 3 & 8: SIGN IN SUBMIT
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNoticeMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Gmail address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        const msg = error.message || '';
        // If "Email not confirmed": resend code and open screen 2
        if (
          msg.toLowerCase().includes('email not confirmed') ||
          (error.status === 400 && msg.toLowerCase().includes('confirm'))
        ) {
          try {
            await supabase.auth.resend({
              type: 'signup',
              email: email.trim().toLowerCase(),
            });
          } catch {
            // ignore
          }
          setOtp(['', '', '', '', '', '']);
          setResendCooldown(60);
          setNoticeMsg('Please confirm your email address. A new code was sent.');
          setScreen('verify_gmail');
          return;
        }

        setErrorMsg(error.message);
        return;
      }

      // Remember me handling:
      // On sign in with "Remember me" OFF: set localStorage 'nt_session_only' = '1'
      // and sessionStorage 'nt_tab_alive' = '1'.
      // On sign in with "Remember me" ON: remove 'nt_session_only'.
      if (!rememberMe) {
        localStorage.setItem('nt_session_only', '1');
        sessionStorage.setItem('nt_tab_alive', '1');
      } else {
        localStorage.removeItem('nt_session_only');
      }

      // Verify customer role from profiles table (never decide role from email in code)
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        const role = profile?.role || 'customer';
        if (role === 'customer') {
          setCurrentView('home');
          rbacNavigate('/');
        }
      }

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sign in failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4) SCREEN 4: FORGOT PASSWORD 1 SUBMIT
  const handleForgotStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNoticeMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Gmail address.');
      return;
    }

    setIsLoading(true);
    try {
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    } catch {
      // Ignored to prevent email enumeration
    } finally {
      setIsLoading(false);
    }

    // ALWAYS show the same message: "If an account exists for this Gmail, we sent a 6-digit code." Then step 2.
    setNoticeMsg('If an account exists for this Gmail, we sent a 6-digit code.');
    setOtp(['', '', '', '', '', '']);
    setResendCooldown(60);
    setScreen('forgot2');
  };

  // 5) SCREEN 5: FORGOT PASSWORD 2 SUBMIT (VERIFY RECOVERY CODE)
  const handleVerifyRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNoticeMsg(null);

    const token = otp.join('');
    if (token.length < 6) {
      setErrorMsg('Please enter all 6 digits of the code.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token,
        type: 'recovery',
      });

      if (error) {
        // Wrong: "Invalid or expired code."
        setErrorMsg('Invalid or expired code.');
        return;
      }

      setNewPassword('');
      setConfirmPassword('');
      setNoticeMsg(null);
      setScreen('forgot3');
    } catch {
      setErrorMsg('Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendRecoveryCode = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg(null);
    setNoticeMsg(null);

    try {
      await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
      setResendCooldown(60);
      setNoticeMsg('If an account exists for this Gmail, we sent a 6-digit code.');
    } catch {
      setNoticeMsg('If an account exists for this Gmail, we sent a 6-digit code.');
    } finally {
      setIsResending(false);
    }
  };

  // 6) SCREEN 6: FORGOT PASSWORD 3 SUBMIT (SET NEW PASSWORD)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setNoticeMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      // updateUser({ password }), then signOut().
      await supabase.auth.signOut();

      setScreen('success');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  // 7) SCREEN 7: SUCCESS -> SCREEN 8
  const handleGoToSignInAfterReset = () => {
    setPassword('');
    setErrorMsg(null);
    setNoticeMsg('Password updated! You can now sign in with your new password.');
    setScreen('signin_reset');
  };

  // Common Card Wrapper
  return (
    <div className="w-full max-w-[420px] bg-white rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-slate-100 p-6 sm:p-8 relative selection:bg-[#2563EB] selection:text-white">
      {/* Close Button (X) Top-Right */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* NanoTech Solutions Logo on top */}
      <div className="flex items-center justify-center mb-3">
        <NanoTechLogo size="sm" variant="horizontal" glow={false} />
      </div>

      {/* Global Error Banner inside Card */}
      {errorMsg && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-150"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <span className="leading-relaxed">{errorMsg}</span>
        </div>
      )}

      {/* Global Notice / Success Banner inside Card */}
      {noticeMsg && (
        <div
          role="status"
          className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-150"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
          <span className="leading-relaxed">{noticeMsg}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 1: SIGN UP                                                     */}
      {/* ===================================================================== */}
      {screen === 'signup' && (
        <div>
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Create an Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Join NanoTech to buy &amp; sell verified computer hardware
            </p>
          </div>

          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="signup-fullname"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="signup-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                autoComplete="name"
                className="w-full px-3.5 py-2.5 sm:py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-slate-400 font-normal"
              />
            </div>

            {/* Gmail Address */}
            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Gmail Address
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 sm:py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-slate-400 font-normal"
              />
            </div>

            {/* Password with eye toggle & hint */}
            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-3.5 pr-10 py-2.5 sm:py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-slate-400 font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-normal">
                At least 8 characters
              </p>
            </div>

            {/* Create Account Primary Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Divider "or" */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 uppercase font-medium">or</span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <GoogleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Continue with Google</span>
          </button>

          {/* Already have an account? Sign In */}
          <div className="text-center text-xs text-slate-500 mt-5 pt-1">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setNoticeMsg(null);
                setScreen('signin');
              }}
              className="text-[#2563EB] font-bold hover:underline cursor-pointer ml-1 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 2: VERIFY YOUR GMAIL                                           */}
      {/* ===================================================================== */}
      {screen === 'verify_gmail' && (
        <div>
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Verify Your Gmail
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
              We've sent a 6-digit verification code to{' '}
              <strong className="text-slate-800 break-all">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyGmailSubmit} className="space-y-5">
            {/* 6 Digit Input Boxes */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 my-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={otp[idx]}
                  aria-label={`Digit ${idx + 1}`}
                  onChange={(e) => handleDigitChange(idx, e)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  onPaste={handleDigitPaste}
                  className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                />
              ))}
            </div>

            {/* Verify Email Primary Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join('').length < 6}
              className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify Email</span>
              )}
            </button>
          </form>

          {/* Action Row: Resend Code (00:60) & Change Email */}
          <div className="flex items-center justify-between text-xs mt-5 pt-1 text-slate-600">
            <button
              type="button"
              onClick={handleResendSignupCode}
              disabled={resendCooldown > 0 || isResending}
              className={`font-semibold transition-colors cursor-pointer ${
                resendCooldown > 0
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-[#2563EB] hover:underline'
              }`}
            >
              {isResending ? (
                'Resending...'
              ) : resendCooldown > 0 ? (
                `Resend Code (00:${resendCooldown.toString().padStart(2, '0')})`
              ) : (
                'Resend Code'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setNoticeMsg(null);
                setScreen('signup');
              }}
              className="text-[#2563EB] font-semibold hover:underline cursor-pointer"
            >
              Change Email
            </button>
          </div>

          {/* Check spam folder note */}
          <p className="text-[11px] sm:text-xs text-slate-400 text-center mt-4">
            Check your spam folder if you do not receive the email in your inbox.
          </p>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 3 & 8: SIGN IN (AND SIGN IN AFTER RESET)                        */}
      {/* ===================================================================== */}
      {(screen === 'signin' || screen === 'signin_reset') && (
        <div>
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              {screen === 'signin_reset'
                ? 'Sign in with your newly reset password'
                : 'Welcome back! Sign in to your customer account'}
            </p>
          </div>

          <form onSubmit={handleSignInSubmit} className="space-y-4">
            {/* Gmail Address */}
            <div>
              <label
                htmlFor="signin-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Gmail Address
              </label>
              <input
                id="signin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 sm:py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-slate-400 font-normal"
              />
            </div>

            {/* Password with eye toggle */}
            <div>
              <label
                htmlFor="signin-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-3.5 pr-10 py-2.5 sm:py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-slate-400 font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Controls: Remember me + Forgot password? */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setNoticeMsg(null);
                  setScreen('forgot1');
                }}
                className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Primary Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Divider "or" */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 uppercase font-medium">or</span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 sm:py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <GoogleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Continue with Google</span>
          </button>

          {/* Create an account link */}
          <div className="text-center text-xs text-slate-500 mt-5 pt-1">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setNoticeMsg(null);
                setScreen('signup');
              }}
              className="text-[#2563EB] font-bold hover:underline cursor-pointer ml-1 transition-colors"
            >
              Create an account
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 4: FORGOT PASSWORD 1 (ENTER GMAIL)                             */}
      {/* ===================================================================== */}
      {screen === 'forgot1' && (
        <div>
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Forgot Password
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Enter your registered Gmail to receive a 6-digit verification code.
            </p>
          </div>

          <form onSubmit={handleForgotStep1Submit} className="space-y-4">
            {/* Gmail Address */}
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Gmail Address
              </label>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 sm:py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-slate-400 font-normal"
              />
            </div>

            {/* Send Verification Code Primary Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                <span>Send Verification Code</span>
              )}
            </button>

            {/* Back to Sign In Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setNoticeMsg(null);
                  setScreen('signin');
                }}
                className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 5: FORGOT PASSWORD 2 (VERIFY RECOVERY CODE)                    */}
      {/* ===================================================================== */}
      {screen === 'forgot2' && (
        <div>
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Verify Recovery Code
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
              Enter the 6-digit recovery code sent to{' '}
              <strong className="text-slate-800 break-all">{email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyRecoverySubmit} className="space-y-5">
            {/* 6 Digit Input Boxes */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 my-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={otp[idx]}
                  aria-label={`Digit ${idx + 1}`}
                  onChange={(e) => handleDigitChange(idx, e)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  onPaste={handleDigitPaste}
                  className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                />
              ))}
            </div>

            {/* Verify Code Primary Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join('').length < 6}
              className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify Code</span>
              )}
            </button>
          </form>

          {/* Action Row: Resend Code (00:60) & Change Email */}
          <div className="flex items-center justify-between text-xs mt-5 pt-1 text-slate-600">
            <button
              type="button"
              onClick={handleResendRecoveryCode}
              disabled={resendCooldown > 0 || isResending}
              className={`font-semibold transition-colors cursor-pointer ${
                resendCooldown > 0
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-[#2563EB] hover:underline'
              }`}
            >
              {isResending ? (
                'Resending...'
              ) : resendCooldown > 0 ? (
                `Resend Code (00:${resendCooldown.toString().padStart(2, '0')})`
              ) : (
                'Resend Code'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setNoticeMsg(null);
                setScreen('forgot1');
              }}
              className="text-[#2563EB] font-semibold hover:underline cursor-pointer"
            >
              Change Email
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 6: FORGOT PASSWORD 3 (NEW + CONFIRM PASSWORD)                  */}
      {/* ===================================================================== */}
      {screen === 'forgot3' && (
        <div>
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Create a new secure password for your account
            </p>
          </div>

          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label
                htmlFor="reset-new-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="reset-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-3.5 pr-10 py-2.5 sm:py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-slate-400 font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-normal">
                At least 8 characters
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full pl-3.5 pr-10 py-2.5 sm:py-3 text-sm text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all placeholder:text-slate-400 font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Reset Password Primary Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SCREEN 7: SUCCESS                                                     */}
      {/* ===================================================================== */}
      {screen === 'success' && (
        <div className="text-center py-4">
          {/* Big Green Check Circle */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm animate-in zoom-in-95 duration-200">
            <Check className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Password Reset Successfully!
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal leading-relaxed max-w-xs mx-auto">
            Your password has been securely updated. You can now sign in with your new credentials.
          </p>

          <button
            type="button"
            onClick={handleGoToSignInAfterReset}
            className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2 mt-6"
          >
            <span>Go to Sign In</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default CustomerAuthFlow;
