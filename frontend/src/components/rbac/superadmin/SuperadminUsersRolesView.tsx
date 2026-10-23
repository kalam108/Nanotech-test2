'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { useRBAC } from '../../../context/RBACContext';
import { useApp } from '../../../context/AppContext';
import {
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  Mail,
  Calendar,
  Lock,
} from 'lucide-react';

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'super_admin';
  status: 'active' | 'suspended';
  createdAt: string;
  phone?: string;
}

const DEFAULT_USERS: PlatformUser[] = [
  {
    id: 'usr_super_1',
    name: 'Kalam Kumar',
    email: 'kalamchy88@gmail.com',
    role: 'super_admin',
    status: 'active',
    createdAt: '2025-01-01',
    phone: '+977 9852055346',
  },
  {
    id: 'usr_admin_0',
    name: 'NT Solution Admin',
    email: 'ntsolution68@gmail.com',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-10',
    phone: '+977 9852055346',
  },
  {
    id: 'usr_admin_1',
    name: 'Raju Khadka',
    email: 'admin@nanotech.com',
    role: 'admin',
    status: 'active',
    createdAt: '2025-02-15',
    phone: '+977 9845012345',
  },
  {
    id: 'usr_admin_2',
    name: 'Prakash Sharma',
    email: 'inventory@nanotech.com',
    role: 'admin',
    status: 'active',
    createdAt: '2025-03-01',
    phone: '+977 9812345678',
  },
  {
    id: 'usr_cust_1',
    name: 'Sita Sharma',
    email: 'customer@nanotech.com',
    role: 'customer',
    status: 'active',
    createdAt: '2025-04-12',
    phone: '+977 9812345678',
  },
  {
    id: 'usr_cust_2',
    name: 'Bikram Thapa',
    email: 'bikram.thapa@gmail.com',
    role: 'customer',
    status: 'active',
    createdAt: '2025-05-20',
    phone: '+977 9845012345',
  },
];

export const SuperadminUsersRolesView: React.FC = () => {
  const { addAuditLog } = useRBAC();
  const { addToast } = useApp();

  const [users, setUsers] = useState<PlatformUser[]>(DEFAULT_USERS);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'admin' | 'super_admin'>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load all users from Supabase profiles table
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, status, created_at, phone')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase profiles query notice:', error.message);
      } else if (profiles && profiles.length > 0) {
        const mapped: PlatformUser[] = profiles.map((p: any) => {
          let normalizedRole: 'customer' | 'admin' | 'super_admin' = 'customer';
          const r = String(p.role || '').toLowerCase();
          if (r === 'super_admin') normalizedRole = 'super_admin';
          else if (r === 'admin') normalizedRole = 'admin';
          else normalizedRole = 'customer';

          // Master email overrides
          if (p.email?.toLowerCase() === 'kalamchy88@gmail.com') {
            normalizedRole = 'super_admin';
          } else if (p.email?.toLowerCase() === 'ntsolution68@gmail.com') {
            normalizedRole = 'admin';
          }

          return {
            id: p.id,
            name: p.full_name || p.email.split('@')[0],
            email: p.email,
            role: normalizedRole,
            status: p.status === 'suspended' ? 'suspended' : 'active',
            createdAt: p.created_at || new Date().toISOString(),
            phone: p.phone || '',
          };
        });

        // Merge with DEFAULT_USERS if not present
        const map = new Map<string, PlatformUser>();
        mapped.forEach((u) => map.set(u.email.toLowerCase(), u));
        DEFAULT_USERS.forEach((u) => {
          if (!map.has(u.email.toLowerCase())) {
            map.set(u.email.toLowerCase(), u);
          }
        });

        setUsers(Array.from(map.values()));
      }
    } catch (err) {
      console.warn('Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Role Change
  const handleRoleChange = async (targetUser: PlatformUser, newRole: 'customer' | 'admin' | 'super_admin') => {
    if (targetUser.role === newRole) return;

    setUpdatingId(targetUser.id);
    setFeedback(null);

    try {
      // 1. Update Supabase profiles table
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', targetUser.id);

      if (error) {
        console.warn('Supabase role update note:', error.message);
      }

      // Also try update by email in case id is client-generated
      await supabase
        .from('profiles')
        .update({ role: newRole })
        .ilike('email', targetUser.email);

      // 2. Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );

      // 3. Update localStorage if modifying logged in or stored admin
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('nanotech_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.email?.toLowerCase() === targetUser.email.toLowerCase()) {
              parsed.role = newRole;
              localStorage.setItem('nanotech_user', JSON.stringify(parsed));
              window.dispatchEvent(new Event('auth-state-change'));
            }
          }
        } catch {}
      }

      // 4. Audit Log
      addAuditLog(
        'USER_ROLE_CHANGED',
        targetUser.email,
        `Role for "${targetUser.name}" changed from ${targetUser.role} to ${newRole} by Kalam`
      );

      const msg = `Role for "${targetUser.name}" (${targetUser.email}) successfully updated to "${newRole}".`;
      setFeedback({ type: 'success', message: msg });
      addToast('success', msg);
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to update role in Supabase.';
      setFeedback({ type: 'error', message: errMsg });
      addToast('error', errMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            Super Admin Exclusive Control
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            User Roles &amp; Access Permissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Assign and modify account roles across all users in the Supabase <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-amber-700">profiles</code> table.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Profiles'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="all">All Roles ({users.length})</option>
          <option value="super_admin">Super Admins ({users.filter((u) => u.role === 'super_admin').length})</option>
          <option value="admin">Administrators ({users.filter((u) => u.role === 'admin').length})</option>
          <option value="customer">Customers ({users.filter((u) => u.role === 'customer').length})</option>
        </select>

        <span className="text-xs text-slate-500 font-mono ml-auto">
          {filteredUsers.length} users matched
        </span>
      </div>

      {/* Users Role Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] font-mono">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-3">Email Address</th>
                <th className="py-3.5 px-3">Signup Date</th>
                <th className="py-3.5 px-3">Account Status</th>
                <th className="py-3.5 px-3">Current Role</th>
                <th className="py-3.5 px-3 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredUsers.map((u) => {
                const isSuper = u.role === 'super_admin';
                const isAdmin = u.role === 'admin';
                const isPending = updatingId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                            isSuper
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : isAdmin
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: #{u.id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-500 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                          isSuper
                            ? 'bg-amber-100 text-amber-900 border-amber-300/80'
                            : isAdmin
                            ? 'bg-purple-100 text-purple-900 border-purple-300/80'
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}
                      >
                        {isSuper && <ShieldCheck className="w-3 h-3 text-amber-600" />}
                        {isAdmin && <Shield className="w-3 h-3 text-purple-600" />}
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPending && <Loader2 className="w-4 h-4 animate-spin text-amber-600" />}
                        <select
                          disabled={isPending}
                          value={u.role}
                          onChange={(e) =>
                            handleRoleChange(u, e.target.value as 'customer' | 'admin' | 'super_admin')
                          }
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                            isSuper
                              ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                              : isAdmin
                              ? 'bg-purple-50 border-purple-300 text-purple-900 hover:bg-purple-100'
                              : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
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
