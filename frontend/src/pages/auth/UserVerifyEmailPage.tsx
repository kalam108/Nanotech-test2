import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  verifyEmailCode,
  sendEmailVerificationCode,
  getLatestPendingOtp,
} from '../../lib/supabaseOtp';
import { SixDigitOtpInput } from '../../components/auth/SixDigitOtpInput';
import {
  MailCheck,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Shield,
  Copy,
  Check,
  Edit3,
  Sparkles,
  Lock,
  Loader2,
} from 'lucide-react';

interface UserVerifyEmailPageProps {
  initialEmail?: string;
  onNavigate?: (view: string, params?: Record<string, string>) => void;
}

export function UserVerifyEmailPage({ initialEmail, onNavigate }: UserVerifyEmailPageProps) {
  const { setCurrentView, signupUser, loginUser, addToast } = useApp();

  const [email, setEmail] = useState<string>(() => {
    return initialEmail || localStorage.getItem('nanotech_verify_email') || 'user@example.com';
  });

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(45);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(email);

  // 10-Minute Expiration countdown (600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);

  // Lookup pending OTP for live demo testing helper
  const pendingOtp = getLatestPendingOtp(email, 'signup');

  // Timer countdown for expiration
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Timer countdown for resend button cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const cooldownTimer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(cooldownTimer);
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
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMessage('This verification code has expired (10 minutes limit). Please click "Resend Code".');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await verifyEmailCode(email, codeToVerify, 'signup');

      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      // Verification Succeeded!
      setSuccessMessage('Email verified successfully! Setting up your secure session...');
      addToast('success', 'Email confirmed! Your account is verified.');

      // Check if there is pending registration metadata to complete signup
      const rawPending = localStorage.getItem('nanotech_pending_registration');
      if (rawPending) {
        try {
          const pending = JSON.parse(rawPending);
          await signupUser(
            pending.name,
            pending.email,
            pending.role || 'customer',
            pending.phone,
            pending.password
          );
          localStorage.removeItem('nanotech_pending_registration');
        } catch (e) {
          console.warn('Auto signup notice:', e);
        }
      }

      setTimeout(() => {
        navigate('user_dashboard');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await sendEmailVerificationCode(email, 'customer', 'signup');
      setResendCooldown(60);
      setTimeLeft(600); // Reset 10-minute expiry
      setCode('');
      setSuccessMessage(`A fresh 6-digit code has been dispatched to ${email}!`);
      addToast('success', `New verification code sent to ${email}`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to resend verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = () => {
    if (!tempEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setEmail(tempEmail);
    localStorage.setItem('nanotech_verify_email', tempEmail);
    setIsEditingEmail(false);
    sendEmailVerificationCode(tempEmail, 'customer', 'signup');
    setTimeLeft(600);
    setResendCooldown(45);
    addToast('info', `Updated email to ${tempEmail} and sent new code.`);
  };

  const copySimulatedCode = (codeStr: string) => {
    navigator.clipboard.writeText(codeStr);
    setCode(codeStr);
    setCopiedCode(true);
    addToast('success', `Copied and auto-filled code: ${codeStr}`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-md">
        {/* Step Progress Breadcrumb */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-400">
            1. Register
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-3 py-1 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20">
            <span className="w-4 h-4 rounded-full bg-slate-950 text-cyan-400 text-[10px] flex items-center justify-center font-black">2</span>
            Verify Code
          </span>
          <span className="text-slate-600">→</span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-slate-400">
            3. Dashboard
          </span>
        </div>

        {/* Verification Card - Styled per user mockup */}
        <div className="glass-panel border border-white/10 rounded-3xl p-6 sm:p-8 text-slate-200 shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 mx-auto mb-3 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <MailCheck className="w-7 h-7 text-cyan-400" />
              </div>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight">Verify Your Email</h1>

            <div className="mt-2 text-xs text-slate-300">
              We sent a 6-digit verification code to
              {!isEditingEmail ? (
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="font-bold text-cyan-300 font-mono">{email}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setTempEmail(email);
                      setIsEditingEmail(true);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                    title="Change email"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-2 justify-center">
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={e => setTempEmail(e.target.value)}
                    className="bg-slate-900 border border-white/20 text-xs text-white rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleUpdateEmail}
                    className="px-2 py-1 bg-cyan-500 text-slate-950 rounded-lg text-xs font-bold"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(false)}
                    className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Expiration Timer & Security Banner */}
          <div className="flex items-center justify-between bg-[#080d18] border border-white/10 rounded-2xl p-3 mb-4 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Code expires in:</span>
            </div>
            <span
              className={`font-mono font-bold text-sm ${
                timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'
              }`}
            >
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

          {/* 6-Digit OTP Box Grid [ 4 8 2 9 1 3 ] */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-center text-xs font-bold text-slate-400 mb-1">
                Enter 6-Digit Code
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
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm py-3.5 rounded-2xl transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verify Email</span>
                </>
              )}
            </button>
          </form>

          {/* Resend Code Section with Cooldown */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-slate-400">Didn't receive it?</p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isLoading}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {resendCooldown > 0
                  ? `Resend Code (${resendCooldown}s)`
                  : 'Resend Verification Code'}
              </span>
            </button>
          </div>

          {/* Live Demo Quick-Fill Helper (Shows generated code in preview for effortless testing) */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="bg-purple-950/30 border border-purple-500/20 rounded-2xl p-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-purple-300 uppercase font-bold flex items-center gap-1">
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
                className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg text-xs font-bold border border-purple-400/30 flex items-center gap-1 transition-colors"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Filled' : 'Auto Fill'}</span>
              </button>
            </div>
          </div>

          {/* Back to Login Link */}
          <div className="mt-4 pt-3 border-t border-white/[0.06] text-center">
            <button
              type="button"
              onClick={() => navigate('user_login')}
              className="text-xs text-slate-400 hover:text-white font-medium hover:underline"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
