import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAdmin } from '../../context/AdminContext';
import {
  verifyEmailCode,
  sendEmailVerificationCode,
  getLatestPendingOtp,
} from '../../lib/supabaseOtp';
import { SixDigitOtpInput } from '../../components/auth/SixDigitOtpInput';
import { SUPER_ADMIN_EMAIL } from '../../lib/supabase';
import {
  ShieldCheck,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Sparkles,
  Loader2,
  KeyRound,
} from 'lucide-react';

interface AdminVerifyEmailPageProps {
  initialEmail?: string;
  onNavigate?: (view: string, params?: Record<string, string>) => void;
}

export function AdminVerifyEmailPage({ initialEmail, onNavigate }: AdminVerifyEmailPageProps) {
  const { setCurrentView, addToast } = useApp();
  const { loginAdmin } = useAdmin();

  const [email, setEmail] = useState<string>(() => {
    return initialEmail || localStorage.getItem('nanotech_verify_admin_email') || SUPER_ADMIN_EMAIL;
  });

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(45);
  const [copiedCode, setCopiedCode] = useState(false);

  // 10-minute expiration timer (600s)
  const [timeLeft, setTimeLeft] = useState(600);

  const pendingOtp = getLatestPendingOtp(email, 'admin_register') || getLatestPendingOtp(email, 'signup');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const cdTimer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(cdTimer);
  }, [resendCooldown]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navigate = (viewName: string) => {
    if (onNavigate) {
      onNavigate(viewName, { email });
    } else {
      setCurrentView(viewName);
    }
  };

  const handleVerify = async (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    const codeToVerify = customCode || code;

    if (codeToVerify.length !== 6) {
      setErrorMessage('Please enter all 6 digits of your administrator verification code.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMessage('This verification code has expired (10 minutes limit). Please request a new code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await verifyEmailCode(email, codeToVerify, 'admin_register');

      if (!result.success) {
        // Also check if verified under signup
        const fallback = await verifyEmailCode(email, codeToVerify, 'signup');
        if (!fallback.success) {
          setErrorMessage(result.message);
          return;
        }
      }

      setSuccessMessage('Admin email verified and authorized! Launching Admin Console...');
      addToast('success', 'Admin verification complete!');

      // Complete admin session login
      const rawPending = localStorage.getItem('nanotech_pending_admin_reg');
      if (rawPending) {
        try {
          const pending = JSON.parse(rawPending);
          await loginAdmin(pending.email, pending.password);
          localStorage.removeItem('nanotech_pending_admin_reg');
        } catch {}
      } else {
        await loginAdmin(email, 'Admin@12345');
      }

      setTimeout(() => {
        navigate('admin_dashboard');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    try {
      const res = await sendEmailVerificationCode(email, 'admin', 'admin_register');
      setResendCooldown(60);
      setTimeLeft(600);
      setCode('');
      setSuccessMessage(`New admin authorization code sent to ${email}`);
      addToast('success', `Admin OTP dispatched to ${email}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  const copySimulatedCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCode(codeStr);
    setCopiedCode(true);
    addToast('success', `Copied & autofilled: ${codeStr}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-[85vh] admin-glossy-bg flex items-center justify-center p-4 sm:p-6 py-12 relative">
      <div className="w-full max-w-md">
        {/* Step Progress Breadcrumb */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-400">
            1. Admin Auth
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20">
            <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[10px] flex items-center justify-center font-black">2</span>
            Verify OTP
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-400">
            3. Admin Console
          </span>
        </div>

        <div className="glass-panel border border-amber-500/30 rounded-3xl p-6 sm:p-8 text-slate-200 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 mx-auto mb-3 shadow-lg shadow-amber-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-amber-400" />
              </div>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight">Admin Email Verification</h1>
            <p className="text-xs text-slate-300 mt-2">
              We sent a 6-digit authorization code to
              <span className="block font-bold text-amber-300 font-mono mt-0.5">{email}</span>
            </p>
          </div>

          <div className="flex items-center justify-between bg-[#080d18] border border-white/10 rounded-2xl p-3 mb-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Admin token expires in:</span>
            </div>
            <span className={`font-mono font-bold text-sm ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
              {formatTimer(timeLeft)}
            </span>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-center text-xs font-bold text-slate-400 mb-1">
                Enter 6-Digit Admin Code
              </label>
              <SixDigitOtpInput
                value={code}
                onChange={setCode}
                onComplete={c => handleVerify(undefined, c)}
                disabled={isLoading}
                hasError={Boolean(errorMessage)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6 || timeLeft <= 0}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing Admin Console...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verify & Enter Admin Console</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-slate-400">Didn't receive it?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 disabled:text-slate-500 transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Verification Code'}
              </span>
            </button>
          </div>

          {/* Simulated Code Helper */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-amber-300 uppercase font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Simulated Code for Testing
                </span>
                <span className="font-mono font-bold text-white text-sm">
                  {pendingOtp?.code || '482913'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copySimulatedCode(pendingOtp?.code || '482913')}
                className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg text-xs font-bold border border-amber-400/30 flex items-center gap-1 transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Filled' : 'Auto Fill'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
