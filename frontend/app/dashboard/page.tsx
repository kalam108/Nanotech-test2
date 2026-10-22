'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../src/lib/supabase/client';
import {
  User,
  ShieldCheck,
  LogOut,
  Mail,
  Calendar,
  ShoppingBag,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local session
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nanotech_user');
        if (stored) {
          setCurrentUser(JSON.parse(stored));
        }
      } catch {}
    }

    // 2. Fetch Supabase authenticated user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser((prev: any) => ({
          ...prev,
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || prev?.name || user.email?.split('@')[0],
          createdAt: user.created_at || prev?.createdAt,
        }));
      }
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.removeItem('nanotech_session_token');
      localStorage.removeItem('nanotech_user');
      localStorage.removeItem('nanotech_current_user');
      window.dispatchEvent(new Event('auth-state-change'));
    }

    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
              N
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block leading-tight">
                NanoTech Dashboard
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                Supabase Authenticated
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700/80 hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Back to Store</span>
            </a>

            <button
              onClick={handleSignOut}
              className="text-xs sm:text-sm font-semibold text-rose-300 hover:text-rose-100 px-3 py-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/80 border border-blue-500/20 p-6 sm:p-8">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified with 6-Digit Email OTP</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back, {currentUser?.name || 'Customer'}!
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Your account is authenticated via Supabase Email OTP with live session tokens.
              </p>
            </div>
          </div>
        </div>

        {/* Profile & Account Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Account Email */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 text-slate-400 text-xs font-medium mb-2">
              <Mail className="w-4 h-4 text-blue-400" />
              <span>Email Address</span>
            </div>
            <p className="text-base font-semibold text-white break-all">
              {currentUser?.email || 'user@example.com'}
            </p>
            <span className="inline-block mt-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-medium">
              Email Verified
            </span>
          </div>

          {/* Card 2: Role & Privileges */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 text-slate-400 text-xs font-medium mb-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Account Role</span>
            </div>
            <p className="text-base font-semibold text-white uppercase tracking-wide">
              {currentUser?.role || 'Customer'}
            </p>
            <span className="inline-block mt-2 text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded font-medium">
              Standard Access
            </span>
          </div>

          {/* Card 3: Auth Provider */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-3 text-slate-400 text-xs font-medium mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Authentication Provider</span>
            </div>
            <p className="text-base font-semibold text-white">
              Supabase Auth (OTP)
            </p>
            <span className="inline-block mt-2 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-medium">
              signInWithOtp / verifyOtp
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
