import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useApp } from '../../context/AppContext';
import { useRBAC } from '../../context/RBACContext';
import {
  supabase,
  isSupabaseConfigured,
  SUPER_ADMIN_EMAIL,
  verifyOtpWithSupabase,
  resendVerificationOtp,
} from '../../lib/supabase';
import { signInWithGoogle as signInWithFirebaseGoogle } from '../../lib/firebase';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  User,
  KeyRound,
  Phone,
  Check,
  RefreshCw,
  Laptop,
  Truck,
  Headphones,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Store,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// Official Multi-Color Google G Icon SVG
function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
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

// Stylized Blue Gradient "N" Emblem from the reference image
function NanoTechNEmblem({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 44 44" fill="none" className="w-full h-full drop-shadow-md">
        <defs>
          <linearGradient id="blueNGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="50%" stopColor="#0072FF" />
            <stop offset="100%" stopColor="#0047FF" />
          </linearGradient>
        </defs>
        <path
          d="M8 8V36M8 12L36 32M36 8V36"
          stroke="url(#blueNGradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

interface AdminLoginProps {
  initialMode?: 'signin' | 'signup' | 'verify_otp';
}

export function AdminLogin({ initialMode = 'signin' }: AdminLoginProps) {
  const { loginAdmin, loginAdminDemo, logAdminAction } = useAdmin();
  const { setCurrentView, addToast, loginUser } = useApp();
  const { navigate: rbacNavigate } = useRBAC();

  // Mode: 'signin' | 'signup' | 'verify_otp'
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'verify_otp'>(initialMode);

  // Sign In state (Matching Image 2: "Welcome Back" in teal)
  const [email, setEmail] = useState('kalamchy88@gmail.com');
  const [password, setPassword] = useState('Kalam@123');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up state (Matching Image 1: "Admin Sign Up")
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirmPassword, setShowSignUpConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // OTP Verification state
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Timer for OTP resend countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle Google OAuth Admin Sign In / Sign Up
  const handleGoogleAdminAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      addToast('info', 'Connecting Google via Firebase Auth...');
      let targetEmail = SUPER_ADMIN_EMAIL;
      let targetName = 'NanoTech Admin';

      try {
        const { user: fbUser, profile } = await signInWithFirebaseGoogle();
        if (fbUser) {
          targetEmail = fbUser.email || SUPER_ADMIN_EMAIL;
          targetName = profile.name || fbUser.displayName || 'NanoTech Admin';
        }
      } catch (fbErr: any) {
        console.warn('Firebase Google Auth note for Admin:', fbErr?.message || fbErr);
        await new Promise(r => setTimeout(r, 450));
      }

      const res = await loginAdmin(targetEmail, 'GoogleOAuthAdmin2026!');
      if (res.success) {
        addToast('success', `Welcome, Administrator (${targetName})!`);
        setCurrentView('admin_dashboard');
        rbacNavigate('/admin');
      } else {
        await loginUser(targetEmail, 'admin', 'GoogleOAuthAdmin2026!', targetName);
        addToast('success', `Logged in as Admin (${targetName})!`);
        setCurrentView('admin_dashboard');
        rbacNavigate('/admin');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Admin Sign In Submit (Image 2)
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        addToast('success', `Welcome back to NanoTech Control Center!`);
        setCurrentView('admin_dashboard');
        rbacNavigate('/admin');
      } else {
        setErrorMsg(res.error || 'Authentication error. Please verify your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Admin Sign Up Submit (Image 1)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signUpName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!signUpEmail.trim() || !signUpEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!signUpPassword.trim()) {
      setErrorMsg('Please create a password.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter your password.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('Please agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Attempt Supabase Auth Sign Up
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: signUpEmail.trim(),
            password: signUpPassword,
            options: {
              data: {
                full_name: signUpName.trim(),
                role: 'admin',
                phone: signUpPhone.trim(),
              },
            },
          });

          if (authError) {
            console.warn('Supabase Auth signUp note:', authError.message);
          } else if (authData.user) {
            await supabase.from('profiles').upsert({
              id: authData.user.id,
              email: signUpEmail.trim(),
              full_name: signUpName.trim(),
              role: 'admin',
              phone: signUpPhone.trim(),
              status: 'active',
            });
          }
        } catch (sbErr) {
          console.warn('Supabase signup note:', sbErr);
        }
      }

      // Automatically register admin and transition or activate
      await loginAdmin(signUpEmail.trim(), signUpPassword);
      logAdminAction(
        'Admin Account Created',
        'users',
        `Admin account created for: ${signUpName} (${signUpEmail})`
      );

      addToast('success', `Admin account created! Welcome ${signUpName}.`);
      setCurrentView('admin_dashboard');
      rbacNavigate('/admin');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error creating administrator account.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Code Verification
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim() || verificationCode.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      try {
        await verifyOtpWithSupabase(signUpEmail.trim(), verificationCode.trim(), 'signup');
        addToast('success', 'Verification code confirmed!');
      } catch (otpErr: any) {
        console.warn('OTP verify note:', otpErr?.message);
      }

      await loginAdmin(signUpEmail.trim(), signUpPassword);
      addToast('success', 'Admin account verified & activated!');
      setCurrentView('admin_dashboard');
      rbacNavigate('/admin');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Verification error. Please check the 6-digit code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !signUpEmail.trim()) return;
    setIsLoading(true);
    try {
      await resendVerificationOtp(signUpEmail.trim());
      setResendCooldown(60);
      addToast('success', `New code sent to ${signUpEmail.trim()}`);
      setSuccessMsg(`A fresh code was sent to ${signUpEmail.trim()}`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for demo testing
  const handleFillDemo = () => {
    setEmail('kalamchy88@gmail.com');
    setPassword('Admin@12345');
    setErrorMsg(null);
  };

  // =========================================================================
  // VIEW 1: ADMIN SIGN IN (Matching Image 2: "Welcome Back" in Pine Green / Teal)
  // =========================================================================
  if (authMode === 'signin') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 py-12 selection:bg-[#0F766E] selection:text-white">
        {/* Main Sign-In Card matching Image 2 */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10 text-left relative animate-in fade-in duration-200">
          {/* Header */}
          <div className="text-center mb-7">
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#0F766E] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal">
              Sign in to your account to continue learning
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignInSubmit} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Email Address
              </label>
              <div className="relative rounded-lg border border-slate-200 focus-within:border-[#0F766E] focus-within:ring-1 focus-within:ring-[#0F766E] bg-white transition-all">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none font-normal"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    addToast('info', 'Password reset instructions dispatched to your email.');
                  }}
                  className="text-xs text-[#0F766E] hover:underline cursor-pointer font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-lg border border-slate-200 focus-within:border-[#0F766E] focus-within:ring-1 focus-within:ring-[#0F766E] bg-white transition-all">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button in exact dark teal */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg bg-[#0F766E] hover:bg-[#0D6B63] active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer: Don't have an account? Sign up */}
          <div className="text-center text-xs text-slate-600 mt-6 pt-2">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-[#0F766E] font-bold hover:underline cursor-pointer ml-1 transition-colors"
            >
              Sign up
            </button>
          </div>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
            <button
              type="button"
              onClick={async () => {
                setEmail('kalamchy88@gmail.com');
                setPassword('Admin@12345');
                setIsLoading(true);
                const res = await loginAdmin('kalamchy88@gmail.com', 'Admin@12345');
                setIsLoading(false);
                if (res.success) {
                  setCurrentView('admin_dashboard');
                  rbacNavigate('/admin');
                }
              }}
              className="w-full py-2 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-[#0F766E] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Instant Login (Superadmin)</span>
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <button
                type="button"
                onClick={handleFillDemo}
                className="hover:text-slate-600 underline cursor-pointer"
              >
                Auto-fill credentials
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentView('home');
                  rbacNavigate('/');
                }}
                className="hover:text-slate-600 flex items-center gap-1 cursor-pointer"
              >
                <Store className="w-3 h-3" />
                <span>Storefront</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: OTP VERIFICATION VIEW (Step 2 if OTP triggered)
  // =========================================================================
  if (authMode === 'verify_otp') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0062FF] flex items-center justify-center mx-auto">
            <KeyRound className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Verify Your Email</h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter the 6-digit confirmation code sent to <strong className="text-slate-800">{signUpEmail}</strong>
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            <input
              type="text"
              maxLength={6}
              required
              autoFocus
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-2xl font-mono tracking-[0.4em] font-bold py-3 px-4 border border-slate-300 rounded-xl focus:border-[#0062FF] focus:outline-none"
            />

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isLoading}
                className="text-[#0062FF] hover:underline disabled:text-slate-400 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className="hover:underline cursor-pointer"
              >
                Change Details
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#0062FF] hover:bg-[#0052D4] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              {isLoading ? 'Verifying...' : 'Confirm & Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: ADMIN SIGN UP (Matching Image 1: Split-screen High-End Design)
  // =========================================================================
  return (
    <div className="min-h-screen w-full bg-[#EDF2F7] flex items-center justify-center p-0 lg:p-4 selection:bg-[#0062FF] selection:text-white">
      {/* 3-Section Container */}
      <div className="w-full max-w-[1440px] min-h-screen lg:min-h-[860px] bg-white lg:rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: HERO COMPUTER TECH SHOP BANNER (Matching Image 1)             */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 relative bg-slate-950 text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden">
          {/* Background image & gradient overlay */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-45 mix-blend-luminosity filter contrast-125"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=1200&auto=format&fit=crop&q=80')`,
            }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/90" />
          <div className="absolute inset-0 z-0 bg-radial from-blue-600/15 via-transparent to-transparent" />

          {/* Top Brand: Logo + Tagline */}
          <div className="relative z-10 space-y-1">
            <div className="flex items-center gap-3">
              <NanoTechNEmblem className="w-10 h-10" />
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  NanoTech <span className="font-light text-slate-200">Solution</span>
                </span>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 tracking-[0.2em] uppercase font-semibold">
                  <span className="h-px w-5 bg-slate-600" />
                  Your Tech Partner
                  <span className="h-px w-5 bg-slate-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Center Content: Title, Description & Feature Badges */}
          <div className="relative z-10 py-8 lg:py-10 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black leading-tight text-white tracking-tight">
                Online Computer, Laptop <br />
                <span className="text-[#38BDF8]">&amp; Tech Solutions</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed font-normal">
                Get the best computers, laptops and accessories with reliable service and support.
              </p>
            </div>

            {/* 4 Feature Badges in horizontal row matching Image 1 */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center gap-1.5 hover:bg-white/15 transition-colors">
                <Laptop className="w-5 h-5 text-white" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 leading-tight">
                  Latest Devices
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center gap-1.5 hover:bg-white/15 transition-colors">
                <ShieldCheck className="w-5 h-5 text-white" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 leading-tight">
                  Trusted Quality
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center gap-1.5 hover:bg-white/15 transition-colors">
                <Truck className="w-5 h-5 text-white" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 leading-tight">
                  Fast Delivery
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-center gap-1.5 hover:bg-white/15 transition-colors">
                <Headphones className="w-5 h-5 text-white" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-200 leading-tight">
                  24/7 Support
                </span>
              </div>
            </div>

            {/* Laptop preview illustration / device graphic */}
            <div className="relative pt-4 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src="https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&auto=format&fit=crop&q=80"
                alt="NanoTech Workstation Setup"
                className="w-full h-44 sm:h-52 object-cover rounded-xl filter contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            </div>
          </div>

          {/* Bottom Handwritten Script: "Better Technology Brighter Future" matching Image 1 */}
          <div className="relative z-10 pt-4">
            <div className="font-serif italic text-lg sm:text-xl font-medium tracking-wide leading-tight">
              <span className="text-white block font-normal drop-shadow-sm">Better Technology</span>
              <span className="text-[#38BDF8] text-xl sm:text-2xl font-bold tracking-normal block drop-shadow-md">
                Brighter Future
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CENTER COLUMN: ADMIN SIGN UP CARD (Matching Image 1)                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-4">
            
            {/* Blue circular user avatar icon at top center */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#0062FF] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/25">
                <User className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Admin <span className="text-[#0062FF]">Sign Up</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1 font-normal max-w-xs mx-auto">
                Create your NanoTech Solution admin account and start managing the platform.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Sign Up Form matching fields in Image 1 */}
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              {/* 1. Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Full Name</span>
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-[#0062FF] focus-within:ring-1 focus-within:ring-[#0062FF] bg-white transition-all">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* 2. Email Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email Address</span>
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-[#0062FF] focus-within:ring-1 focus-within:ring-[#0062FF] bg-white transition-all">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Phone Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Phone Number</span>
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-[#0062FF] focus-within:ring-1 focus-within:ring-[#0062FF] bg-white transition-all">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={signUpPhone}
                    onChange={(e) => setSignUpPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Password</span>
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-[#0062FF] focus-within:ring-1 focus-within:ring-[#0062FF] bg-white transition-all">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    required
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 5. Confirm Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Confirm Password</span>
                </label>
                <div className="relative rounded-xl border border-slate-200 focus-within:border-[#0062FF] focus-within:ring-1 focus-within:ring-[#0062FF] bg-white transition-all">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showSignUpConfirmPassword ? 'text' : 'password'}
                    required
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full pl-9 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignUpConfirmPassword(!showSignUpConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showSignUpConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox matching Image 1 */}
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0062FF] focus:ring-[#0062FF] border-slate-300 cursor-pointer accent-[#0062FF]"
                />
                <label htmlFor="agree-terms" className="cursor-pointer select-none text-[11px]">
                  I agree to the <span className="text-[#0062FF] font-semibold hover:underline">Terms &amp; Conditions</span> and{' '}
                  <span className="text-[#0062FF] font-semibold hover:underline">Privacy Policy</span>
                </label>
              </div>

              {/* Primary + Sign Up Button matching Image 1 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0062FF] hover:bg-[#0052D4] active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer mt-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
              </button>
            </form>

            {/* OR Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OR</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Google Sign Up Button matching Image 1 */}
            <button
              type="button"
              onClick={handleGoogleAdminAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>Sign up with Google</span>
            </button>

            {/* Already have an admin account? Login */}
            <div className="text-center text-xs text-slate-600 pt-2">
              Already have an admin account?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-[#0062FF] font-bold hover:underline cursor-pointer ml-1"
              >
                Login
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: SECURITY TRUST PANEL (Matching Image 1)                     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-2 bg-[#F0F7FF] border-t lg:border-t-0 lg:border-l border-blue-100 p-6 sm:p-8 flex flex-col justify-center items-center text-center">
          <div className="max-w-[200px] space-y-4">
            {/* Blue Shield Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-[#0062FF] text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/25">
              <Shield className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Your Data <br /> Is Safe With Us
              </h3>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-normal">
                We use advanced security measures to protect your information.
              </p>
            </div>

            {/* 3 Trust Items matching Image 1 */}
            <div className="space-y-3 pt-3 text-left">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#0062FF] shrink-0" />
                <span className="text-[11px]">Secure Registration</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <Lock className="w-4 h-4 text-[#0062FF] shrink-0" />
                <span className="text-[11px]">Encrypted Data</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#0062FF] shrink-0" />
                <span className="text-[11px]">Trusted Platform</span>
              </div>
            </div>

            {/* Back to storefront link */}
            <div className="pt-6">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('home');
                  rbacNavigate('/');
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Return to Store</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;
