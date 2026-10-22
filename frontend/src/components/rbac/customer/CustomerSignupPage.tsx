'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRBAC } from '../../../context/RBACContext';
import { supabase, syncCustomerToSupabaseStoreUser } from '../../../lib/supabase';
import { User, Mail, Lock, Phone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

function CustomerSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { navigate } = useRBAC();

  const verifyParam = searchParams.get('verify');
  const emailParam = searchParams.get('email');

  const [step, setStep] = useState<'signup' | 'verify'>(
    verifyParam === '1' && emailParam ? 'verify' : 'signup'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState(emailParam || '');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync if URL query parameters change (e.g. from sign-in redirect /signup?verify=1&email=...)
  useEffect(() => {
    const v = searchParams.get('verify');
    const em = searchParams.get('email');
    if (v === '1' && em) {
      setEmail(em);
      setStep('verify');
    }
  }, [searchParams]);

  // Focus the first OTP box when entering verify step
  useEffect(() => {
    if (step === 'verify') {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  // 60-second cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const nameParts = name.trim().split(' ').filter(Boolean);
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ');

    const { data: _data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: first_name || undefined,
          last_name: last_name || undefined,
          phone: phone.trim() || undefined,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      console.error('[auth]', signUpError);
      setError(signUpError.message);
      return;
    }

    setStep('verify');
  };

  const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numOnly = rawVal.replace(/\D/g, '');

    if (!numOnly) {
      const nextOtp = [...otp];
      nextOtp[index] = '';
      setOtp(nextOtp);
      return;
    }

    if (numOnly.length === 1) {
      const nextOtp = [...otp];
      nextOtp[index] = numOnly;
      setOtp(nextOtp);
      setVerifyError('');

      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
      fillPastedCode(numOnly);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const nextOtp = [...otp];
        nextOtp[index - 1] = '';
        setOtp(nextOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const nextOtp = [...otp];
        nextOtp[index] = '';
        setOtp(nextOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const fillPastedCode = (codeStr: string) => {
    const nextOtp = ['', '', '', '', '', ''];
    for (let i = 0; i < codeStr.length && i < 6; i++) {
      nextOtp[i] = codeStr[i];
    }
    setOtp(nextOtp);
    setVerifyError('');
    const targetIdx = Math.min(codeStr.length, 5);
    inputRefs.current[targetIdx]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const numbers = pasted.replace(/\D/g, '').slice(0, 6);
    if (numbers) {
      fillPastedCode(numbers);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return;

    setVerifying(true);
    setVerifyError('');

    const { data, error: otpError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: 'email',
    });

    if (otpError) {
      console.error('[auth]', otpError);
      setVerifyError('Invalid or expired code');
      setVerifying(false);
      return;
    }

    setVerifying(false);
    if (typeof window !== 'undefined' && data?.session) {
      localStorage.setItem('nanotech_session_token', data.session.access_token);
      if (data.user) {
        const meta = data.user.user_metadata || {};
        const fullName =
          meta.full_name ||
          [meta.first_name, meta.middle_name, meta.last_name].filter(Boolean).join(' ') ||
          meta.name ||
          name.trim() ||
          'Customer';
        const customerProfile = {
          id: data.user.id,
          name: fullName,
          email: data.user.email,
          role: 'customer',
          phone: phone.trim() || '+977 9800000000',
          location: 'Nepal (Storefront)',
          orders: 0,
          status: 'active',
          joined: new Date().toISOString().split('T')[0],
          lastLogin: new Date().toISOString(),
          isLiveSession: true,
          source: 'Supabase Auth (OTP Verified)',
        };
        localStorage.setItem('nanotech_user', JSON.stringify(customerProfile));

        try {
          const raw = localStorage.getItem('nanotech_registered_customers');
          const list = raw ? JSON.parse(raw) : [];
          const idx = list.findIndex((c: any) => c.email?.toLowerCase() === data.user.email?.toLowerCase());
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...customerProfile, isLiveSession: true };
          } else {
            list.unshift(customerProfile);
          }
          localStorage.setItem('nanotech_registered_customers', JSON.stringify(list));
        } catch {}

        // Sync directly to Supabase store_users table
        syncCustomerToSupabaseStoreUser(customerProfile);
      }
      window.dispatchEvent(new Event('auth-state-change'));
    }
    router.push('/dashboard');
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setResendError('');

    const { error: resendErr } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
    });

    setResending(false);

    if (resendErr) {
      console.error('[auth]', resendErr);
      setResendError(resendErr.message);
      return;
    }

    setResendCooldown(60);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        {step === 'signup' ? (
          <>
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Create Customer Account</h2>
              <p className="text-xs text-slate-400 mt-1">
                Join NanoTech to track orders, build custom PCs, and earn rewards
              </p>
            </div>

            {error && (
              <div className="bg-red-950/70 border border-red-800 text-red-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Raju Khadka"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone (Nepal)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="+977 98XXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Sign Up as Customer'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/customer/login')}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Sign in
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Verify Your Email</h2>
              <p className="text-xs text-slate-400 mt-1">
                We sent a 6-digit code to <span className="text-white font-semibold break-all">{email}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    disabled={verifying}
                    onChange={(e) => handleOtpChange(idx, e)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="w-11 h-12 sm:w-12 sm:h-12 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg sm:text-xl font-bold font-mono text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  />
                ))}
              </div>

              {verifyError && (
                <p className="text-xs text-red-400 text-center font-medium">
                  {verifyError}
                </p>
              )}

              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={verifying || otp.join('').length < 6}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify</span>
                )}
              </button>

              <div className="text-center text-xs text-slate-400 pt-2 space-y-1">
                <div>
                  {resendCooldown > 0 ? (
                    <span>Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="text-cyan-400 hover:underline font-semibold disabled:opacity-50"
                    >
                      {resending ? 'Resending...' : 'Resend code'}
                    </button>
                  )}
                </div>
                {resendError && (
                  <p className="text-red-400 text-xs">{resendError}</p>
                )}
              </div>

              <div className="text-center text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep('signup');
                    setVerifyError('');
                    setResendError('');
                  }}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  ← Back to Sign Up
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const CustomerSignupPage: React.FC = () => {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-slate-400 text-xs">Loading...</div>}>
      <CustomerSignupContent />
    </Suspense>
  );
};
