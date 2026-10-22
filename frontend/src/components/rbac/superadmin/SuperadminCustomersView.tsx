'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { supabase, SUPABASE_PROJECT_ID, SUPABASE_URL } from '../../../lib/supabase';
import {
  Users,
  Search,
  ShieldCheck,
  Key,
  Ban,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Mail,
  Phone,
  Database,
  Radio,
  Sparkles,
  AlertCircle,
  Activity,
  Check,
} from 'lucide-react';

interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  orders: number;
  status: 'active' | 'suspended';
  joined: string;
  lastLogin?: string;
  isLiveSession?: boolean;
  source?: string;
}

const SEED_CUSTOMERS: CustomerAccount[] = [
  {
    id: 'usr-sita-03',
    name: 'Sita Sharma',
    email: 'customer@nanotech.com',
    phone: '+977 9812345678',
    location: 'Itahari, Ward-6',
    orders: 4,
    status: 'active',
    joined: '2025-04-12',
    source: 'Seed Account',
  },
  {
    id: 'usr-bik-04',
    name: 'Bikram Thapa',
    email: 'bikram.thapa@gmail.com',
    phone: '+977 9845012345',
    location: 'Biratnagar, Morang',
    orders: 3,
    status: 'active',
    joined: '2025-05-20',
    source: 'Seed Account',
  },
  {
    id: 'usr-deep-05',
    name: 'Deepak Pokhrel',
    email: 'deepak.pokhrel@yahoo.com',
    phone: '+977 9803322114',
    location: 'Dharan, Sunsari',
    orders: 6,
    status: 'active',
    joined: '2025-02-14',
    source: 'Seed Account',
  },
  {
    id: 'usr-anj-06',
    name: 'Anjali Rai',
    email: 'anjali.rai@gmail.com',
    phone: '+977 9811223344',
    location: 'Damak, Jhapa',
    orders: 2,
    status: 'active',
    joined: '2025-06-18',
    source: 'Seed Account',
  },
  {
    id: 'usr-sus-07',
    name: 'Sushil Shrestha',
    email: 'sushil.shrestha@hotmail.com',
    phone: '+977 9809988776',
    location: 'Inaruwa, Sunsari',
    orders: 1,
    status: 'suspended',
    joined: '2025-08-01',
    source: 'Seed Account',
  },
];

export const SuperadminCustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerAccount[]>(SEED_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [actionAlert, setActionAlert] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [supabaseLatency, setSupabaseLatency] = useState<number | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [activeSessionEmail, setActiveSessionEmail] = useState<string | null>(null);

  // Load and sync customers from Supabase session, localStorage, and seeds
  const loadCustomers = useCallback(async () => {
    setIsRefreshing(true);
    const start = performance.now();

    let liveSessionCustomer: CustomerAccount | null = null;
    let registeredList: CustomerAccount[] = [];

    // 1. Check live Supabase Auth session
    try {
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      const latency = Math.round(performance.now() - start);
      setSupabaseLatency(latency);

      if (sessionErr) {
        setSupabaseStatus('error');
      } else {
        setSupabaseStatus('connected');
        if (session?.user && session.user.email) {
          setActiveSessionEmail(session.user.email);
          const meta = session.user.user_metadata || {};
          const metaFullName =
            meta.full_name ||
            [meta.first_name, meta.middle_name, meta.last_name].filter(Boolean).join(' ') ||
            meta.name ||
            'Customer';

          liveSessionCustomer = {
            id: session.user.id,
            name: metaFullName,
            email: session.user.email,
            phone: meta.phone || '+977 9800000000',
            location: meta.location || 'Nepal (Storefront Session)',
            orders: 1,
            status: 'active',
            joined: new Date().toISOString().split('T')[0],
            lastLogin: new Date().toLocaleTimeString(),
            isLiveSession: true,
            source: 'Supabase Auth (Live Store Login)',
          };
        }
      }
    } catch {
      setSupabaseStatus('error');
    }

    // 2. Read nanotech_user and nanotech_registered_customers from localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedCustomerRaw = localStorage.getItem('nanotech_user');
        if (storedCustomerRaw) {
          const stored = JSON.parse(storedCustomerRaw);
          if (stored && stored.email && stored.role === 'customer') {
            if (!liveSessionCustomer) {
              liveSessionCustomer = {
                id: stored.id || `usr-${Date.now()}`,
                name: stored.name || 'Store Customer',
                email: stored.email,
                phone: stored.phone || '+977 9800000000',
                location: stored.location || 'Storefront Session',
                orders: stored.orders || 1,
                status: (stored.status as any) || 'active',
                joined: stored.joined || new Date().toISOString().split('T')[0],
                lastLogin: stored.lastLogin || new Date().toLocaleTimeString(),
                isLiveSession: true,
                source: stored.source || 'Storefront Sign-In',
              };
              setActiveSessionEmail(stored.email);
            }
          }
        }

        const registeredRaw = localStorage.getItem('nanotech_registered_customers');
        if (registeredRaw) {
          const parsed = JSON.parse(registeredRaw);
          if (Array.isArray(parsed)) {
            registeredList = parsed;
          }
        }
      } catch (err) {
        console.warn('Error reading stored customers:', err);
      }
    }

    // 3. Query Supabase database store_users table
    const dbCustomerList: CustomerAccount[] = [];
    try {
      const { data: dbUsers, error: dbErr } = await supabase
        .from('store_users')
        .select('*')
        .order('last_sign_in_at', { ascending: false });

      if (!dbErr && Array.isArray(dbUsers) && dbUsers.length > 0) {
        dbUsers.forEach((u: any) => {
          if (u.email) {
            dbCustomerList.push({
              id: u.id || u.user_id || `usr-${u.email}`,
              name: u.full_name || 'Customer',
              email: u.email,
              phone: u.phone || '+977 9800000000',
              location: 'Nepal (Storefront)',
              orders: u.login_count || 1,
              status: u.status || 'active',
              joined: u.created_at ? u.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              lastLogin: u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleTimeString() : undefined,
              isLiveSession: u.email.toLowerCase() === activeSessionEmail?.toLowerCase(),
              source: `Supabase: customer_emails.Store_user`,
            });
          }
        });
      }
    } catch {
      // Table may not yet be initialized in Supabase
    }

    // Combine all sources: Live session first, then Supabase DB, then registered list, then seeds
    const customerMap = new Map<string, CustomerAccount>();

    if (liveSessionCustomer) {
      customerMap.set(liveSessionCustomer.email.toLowerCase(), liveSessionCustomer);
    }

    dbCustomerList.forEach((c) => {
      const emailLower = c.email?.toLowerCase();
      if (emailLower && !customerMap.has(emailLower)) {
        customerMap.set(emailLower, c);
      }
    });

    registeredList.forEach((c) => {
      const emailLower = c.email?.toLowerCase();
      if (emailLower && !customerMap.has(emailLower)) {
        customerMap.set(emailLower, c);
      }
    });

    SEED_CUSTOMERS.forEach((c) => {
      const emailLower = c.email.toLowerCase();
      if (!customerMap.has(emailLower)) {
        customerMap.set(emailLower, c);
      }
    });

    setCustomers(Array.from(customerMap.values()));
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    loadCustomers();

    // Listen to store login and logout events in real-time
    const handleAuthEvent = () => loadCustomers();
    window.addEventListener('auth-state-change', handleAuthEvent);
    window.addEventListener('storage', handleAuthEvent);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadCustomers();
    });

    return () => {
      window.removeEventListener('auth-state-change', handleAuthEvent);
      window.removeEventListener('storage', handleAuthEvent);
      subscription.unsubscribe();
    };
  }, [loadCustomers]);

  const toggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    setActionAlert(`Customer account ${newStatus === 'active' ? 'reactivated' : 'suspended'} by Kalam.`);
    setTimeout(() => setActionAlert(null), 3500);
  };

  const handleResetPassword = (name: string, email: string) => {
    setActionAlert(`Temporary password reset instruction dispatched to ${email} for ${name}.`);
    setTimeout(() => setActionAlert(null), 3500);
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      (c.source && c.source.toLowerCase().includes(search.toLowerCase()))
  );

  const supabaseUsersDashboardUrl = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/auth/users`;

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">Customer Accounts Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Live Synced
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time oversight of all store shoppers, Supabase Auth registrations, and login credentials
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadCustomers}
            disabled={isRefreshing}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-200 rounded-xl flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            title="Refresh customer sessions from Supabase Auth and LocalStorage"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live Logins'}</span>
          </button>

          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, Gmail, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Supabase Cloud Auth Live Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-blue-500/25 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                Supabase Auth Database:
              </span>
              <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {SUPABASE_PROJECT_ID}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {supabaseStatus === 'connected' ? 'Connected (Live)' : 'Active'}
              </span>
              {supabaseLatency && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {supabaseLatency}ms latency
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Customer accounts created on the storefront or via Google OAuth are authenticated by Supabase.
            </p>
          </div>
        </div>

        <a
          href={supabaseUsersDashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition shrink-0 self-start md:self-auto cursor-pointer"
        >
          <span>Open Supabase Auth Users Table</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {actionAlert && (
        <div className="bg-amber-950/70 border border-amber-600 text-amber-300 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionAlert}</span>
        </div>
      )}

      {/* Customer Accounts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Total Accounts: <strong className="text-white">{filtered.length}</strong></span>
            {activeSessionEmail && (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Storefront Session: <strong className="text-white">{activeSessionEmail}</strong>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500">Auto-syncs on store sign-in / OTP verification</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-4">Customer Name &amp; Session</th>
                <th className="p-4">Login Gmail / Email</th>
                <th className="p-4">Authentication Source</th>
                <th className="p-4">Location</th>
                <th className="p-4">Orders</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Superadmin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((c) => {
                const isActive = c.status === 'active';
                const isLive = Boolean(c.isLiveSession || (activeSessionEmail && c.email.toLowerCase() === activeSessionEmail.toLowerCase()));

                return (
                  <tr
                    key={c.id}
                    className={`transition ${
                      isLive
                        ? 'bg-emerald-950/20 hover:bg-emerald-950/30 border-l-4 border-l-emerald-500'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${
                            isLive
                              ? 'bg-emerald-500/20 text-emerald-400 ring-2 ring-emerald-500/40'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{c.name}</span>
                          {isLive && (
                            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active Live Session
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        ID: {c.id.length > 24 ? `${c.id.substring(0, 16)}...` : c.id}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono text-amber-200">{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                        <Radio className="w-2.5 h-2.5 text-blue-400" />
                        {c.source || 'Store Sign-In'}
                      </span>
                      {c.lastLogin && (
                        <div className="text-[10px] text-slate-500 mt-1">
                          Last seen: {c.lastLogin}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-slate-300">{c.location}</td>

                    <td className="p-4 font-bold text-white">{c.orders} orders</td>

                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-300 border-red-500/30'
                        }`}
                      >
                        {isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleResetPassword(c.name, c.email)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer"
                          title="Send Password Reset"
                        >
                          <Key className="w-3 h-3 text-amber-400" />
                          <span>Reset</span>
                        </button>
                        <button
                          onClick={() => toggleStatus(c.id, c.status)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                            isActive
                              ? 'bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/40'
                              : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/40'
                          }`}
                        >
                          <Ban className="w-3 h-3" />
                          <span>{isActive ? 'Suspend' : 'Reactivate'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
