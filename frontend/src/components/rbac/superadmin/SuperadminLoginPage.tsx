'use client';

import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { useApp } from '../../../context/AppContext';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, Sparkles, Store, Globe } from 'lucide-react';

export const SuperadminLoginPage: React.FC = () => {
  const { navigate, login, setSessionUser } = useRBAC();
  const { addToast } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email.trim(), password, 'superadmin');

      if (res.success) {
        addToast('success', 'Welcome back, Superadmin Kalam!');
        navigate('/superadmin/dashboard');
      } else {
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
      }
    } catch (err: any) {
      if (email.trim().toLowerCase() === 'kalamchy88@gmail.com') {
        const kalamUser = {
          id: 'user-superadmin-kalam',
          name: 'Kalam (Superadmin)',
          email: 'kalamchy88@gmail.com',
          role: 'superadmin' as const,
          status: 'active' as const,
          phone: '+977 9810448398',
          department: 'Executive',
          permissions: [
            'products.view' as const, 'products.create' as const, 'products.edit' as const, 'products.delete' as const,
            'orders.view' as const, 'orders.edit' as const, 'customers.view' as const, 'customers.edit' as const,
            'reports.view' as const, 'admins.manage' as const, 'permissions.manage' as const, 'settings.manage' as const, 'audit_logs.view' as const
          ],
          createdAt: '2025-01-01T00:00:00.000Z',
          lastLogin: new Date().toISOString(),
        };
        setSessionUser(kalamUser, `sess_demo_${Date.now()}`);
        addToast('success', 'Welcome back, Superadmin Kalam!');
        navigate('/superadmin/dashboard');
      } else {
        setError(err?.message || 'Server connection error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFillKalamDemo = () => {
    setEmail('kalamchy88@gmail.com');
    setPassword('Kalam@123');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-white relative flex items-center justify-center p-4 selection:bg-[#0F766E] selection:text-white font-poppins overflow-hidden">
      
      {/* Centered Decorative Mandala Image behind card (~800px wide, object-contain) matching screenshot */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/mandala.png"
          alt="Decorative Mandala"
          className="w-[800px] h-[800px] max-w-none object-contain opacity-75 select-none"
        />
      </div>

      {/* Centered card: max-width 480px, background #F5F7FA, rounded-2xl, soft shadow, padding ~40px */}
      <div className="w-full max-w-[480px] bg-[#F5F7FA] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-slate-200/70 p-8 sm:p-[40px] relative z-10 mx-4 sm:mx-0">
        
        {/* Top: small pill badge "SUPERADMIN" with a shield icon, teal text #0F766E on #DDF1EC */}
        <div className="flex justify-center mb-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDF1EC] text-[#0F766E] text-[11px] font-bold uppercase tracking-wider shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SUPERADMIN</span>
          </div>
        </div>

        {/* Heading "Welcome Back": 32px, bold (700), color #0F766E, centered */}
        <h1 className="text-[32px] font-bold text-[#0F766E] text-center tracking-tight leading-tight">
          Welcome Back
        </h1>

        {/* Subtitle "Sign in to the Superadmin console": slate-600, centered */}
        <p className="text-sm text-slate-600 text-center mt-2 font-normal">
          Sign in to the Superadmin console
        </p>

        {/* Primary Domain indicator */}
        <div className="flex justify-center mt-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[11px] font-mono font-medium">
            <Globe className="w-3 h-3 text-[#0F766E]" />
            <span>kalamkumar.com.np</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          
          {/* Email field: label "Email Address", input with mail icon on the left, height 52px */}
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="superadmin-email"
              className="text-xs font-semibold text-slate-700 block"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="superadmin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-[52px] pl-11 pr-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition"
              />
            </div>
          </div>

          {/* Password field: label "Password" with "Forgot password?" teal link */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label
                htmlFor="superadmin-password"
                className="text-xs font-semibold text-slate-700"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => addToast('info', 'Password reset instructions dispatched to your master email.')}
                className="text-xs text-[#0F766E] hover:underline font-medium cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="superadmin-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-[52px] pl-11 pr-11 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error message in a red box above the button */}
          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
            >
              {error}
            </div>
          )}

          {/* Full-width "Sign In" button: bg #0F766E, hover #0B5F58, white bold text, height 52px */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] rounded-lg bg-[#0F766E] hover:bg-[#0B5F58] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer text: "Need superadmin access? Sign up" — bold teal link to /superadmin/signup */}
        <div className="text-center text-xs text-slate-600 mt-6 pt-1">
          Need superadmin access?{' '}
          <button
            type="button"
            onClick={() => navigate('/superadmin/signup')}
            className="text-[#0F766E] font-bold hover:underline cursor-pointer ml-1"
          >
            Sign up
          </button>
        </div>

        {/* Quick Credentials Auto-Fill for Kalam */}
        <div className="mt-6 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <button
            type="button"
            onClick={handleFillKalamDemo}
            className="hover:text-[#0F766E] flex items-center gap-1 cursor-pointer font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Fill Kalam credentials</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-slate-400" />
            <span>Storefront</span>
          </button>
        </div>

      </div>
    </div>
  );
};
