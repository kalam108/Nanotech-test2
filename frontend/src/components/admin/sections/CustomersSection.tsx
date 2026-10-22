import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import { User } from '../../../types';
import {
  Users,
  Search,
  Mail,
  Phone,
  Shield,
  ShoppingBag,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  UserCheck,
} from 'lucide-react';

export function CustomersSection() {
  const { logAdminAction, settings } = useAdmin();
  const { users, orders, updateUserStatus, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Merge any live logged in / registered customers from localStorage
  const allUsers = React.useMemo(() => {
    const list = [...users];
    if (typeof window !== 'undefined') {
      try {
        const storedCustomerRaw = localStorage.getItem('nanotech_user');
        if (storedCustomerRaw) {
          const stored = JSON.parse(storedCustomerRaw);
          if (stored && stored.email && stored.role === 'customer') {
            const exists = list.some(u => u.email.toLowerCase() === stored.email.toLowerCase());
            if (!exists) {
              list.unshift({
                id: stored.id || `usr-${Date.now()}`,
                name: stored.name || 'Store Customer',
                email: stored.email,
                role: 'customer',
                avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                status: 'active',
                createdAt: stored.joined || new Date().toISOString(),
                lastLogin: stored.lastLogin || new Date().toISOString(),
              });
            }
          }
        }
        const registeredRaw = localStorage.getItem('nanotech_registered_customers');
        if (registeredRaw) {
          const registeredList = JSON.parse(registeredRaw);
          if (Array.isArray(registeredList)) {
            registeredList.forEach(reg => {
              if (reg && reg.email && !list.some(u => u.email.toLowerCase() === reg.email.toLowerCase())) {
                list.unshift({
                  id: reg.id || `usr-${Date.now()}`,
                  name: reg.name || 'Store Customer',
                  email: reg.email,
                  role: 'customer',
                  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                  status: reg.status || 'active',
                  createdAt: reg.joined || new Date().toISOString(),
                  lastLogin: reg.lastLogin || new Date().toISOString(),
                });
              }
            });
          }
        }
      } catch {}
    }
    return list;
  }, [users]);

  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleStatusToggle = (u: User) => {
    const newStatus = u.status === 'active' ? 'suspended' : 'active';
    updateUserStatus(u.id, newStatus);
    logAdminAction('Updated User Status', 'users', `User ${u.name} set to ${newStatus.toUpperCase()}`, u.id, u.name);
    addToast(newStatus === 'active' ? 'success' : 'info', `User ${u.name} is now ${newStatus}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141a] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-5 h-5 text-amber-400" />
            Customer Accounts &amp; Lifetime Value
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registered customer profiles, transaction histories, access statuses, and permissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-900 border border-slate-800 text-amber-400 px-3 py-1.5 rounded-xl font-mono font-bold">
            Total Accounts: {users.length}
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#12141a] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email..."
            className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#0a0b0e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60 font-medium"
        >
          <option value="all">All Roles</option>
          <option value="buyer">Customer / Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0a0b0e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60 font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>

        <span className="text-xs text-slate-500 font-mono ml-auto">
          {filteredUsers.length} users
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-[#12141a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0e1015] text-[11px] font-bold text-slate-400 uppercase font-mono">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-3">Email &amp; Phone</th>
                <th className="py-3.5 px-3">Role</th>
                <th className="py-3.5 px-3">Lifetime Orders</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Joined Date</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
              {filteredUsers.map((u) => {
                const userOrders = orders.filter((o) => o.buyerId === u.id || o.buyerEmail === u.email);
                const totalSpent = userOrders.reduce((sum, o) => sum + o.total, 0);

                return (
                  <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block">{u.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: #{u.id.slice(-6)}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="text-white flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-600" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-amber-400 uppercase font-mono">
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">
                        {settings.currencySymbol} {totalSpent.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {userOrders.length} Orders
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          u.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-400 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleStatusToggle(u)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          u.status === 'active'
                            ? 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300'
                            : 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
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
}
