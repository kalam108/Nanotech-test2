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

  const [selectedCustomerForOrders, setSelectedCustomerForOrders] = useState<User | null>(null);
  const { updateOrderStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleStatusToggle = (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    updateUserStatus(user.id, nextStatus);
    logAdminAction('update_user_status', 'users', `Changed status for ${user.email} to ${nextStatus}`, user.id);
    addToast('success', `${user.name} is now ${nextStatus}`);
  };

  const customerOrdersList = React.useMemo(() => {
    if (!selectedCustomerForOrders) return [];
    return orders.filter(
      (o) =>
        o.buyerId === selectedCustomerForOrders.id ||
        o.buyerEmail?.toLowerCase() === selectedCustomerForOrders.email.toLowerCase()
    );
  }, [selectedCustomerForOrders, orders]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141a] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-5 h-5 text-amber-400" />
            Customer Accounts &amp; Lifetime Orders
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registered customer emails, signup dates, and individual order history with status fulfillment.
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
          <option value="customer">Customer / Buyer</option>
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
        </select>

        <span className="text-xs text-slate-500 font-mono ml-auto">
          {filteredUsers.length} customers
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-[#12141a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0e1015] text-[11px] font-bold text-slate-400 uppercase font-mono">
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-3">Email Address</th>
                <th className="py-3.5 px-3">Signup Date</th>
                <th className="py-3.5 px-3">Total Orders</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
              {filteredUsers.map((u) => {
                const userOrders = orders.filter((o) => o.buyerId === u.id || o.buyerEmail?.toLowerCase() === u.email.toLowerCase());
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
                      <div className="text-white flex items-center gap-1.5 font-mono">
                        <Mail className="w-3.5 h-3.5 text-amber-400" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-slate-600" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-slate-300 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <button
                        onClick={() => setSelectedCustomerForOrders(u)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        title="View all orders for this customer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                        <span>{userOrders.length} Orders</span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          ({settings.currencySymbol} {totalSpent.toLocaleString()})
                        </span>
                      </button>
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

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomerForOrders(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-[11px] font-bold border border-slate-700 transition"
                        >
                          View Orders
                        </button>
                        <button
                          onClick={() => handleStatusToggle(u)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            u.status === 'active'
                              ? 'bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300'
                              : 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Activate'}
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

      {/* Customer All Orders Modal */}
      {selectedCustomerForOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#12141a] border border-amber-500/30 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  Customer Orders: {selectedCustomerForOrders.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Email: <span className="text-amber-300 font-mono">{selectedCustomerForOrders.email}</span> • Signup Date:{' '}
                  <span className="text-slate-300 font-mono">
                    {new Date(selectedCustomerForOrders.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomerForOrders(null)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800 text-xs font-bold"
              >
                Close
              </button>
            </div>

            {customerOrdersList.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No orders recorded yet for {selectedCustomerForOrders.email}.
              </div>
            ) : (
              <div className="space-y-3">
                {customerOrdersList.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">#{ord.id.slice(-8)}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-slate-400">• Payment: {ord.paymentMethod}</span>
                      </div>
                      <div className="text-slate-300 mt-1 font-medium">
                        {ord.items.map((i) => `${i.quantity}x ${i.productTitle || i.title}`).join(', ')}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Total: <strong className="text-white">{settings.currencySymbol} {ord.total.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400">Order Status:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => {
                          const nextStatus = e.target.value as any;
                          updateOrderStatus(ord.id, nextStatus);
                          logAdminAction('Updated Customer Order Status', 'orders', `Order #${ord.id.slice(-8)} set to ${nextStatus}`, ord.id);
                          addToast('success', `Order #${ord.id.slice(-8)} status changed to ${nextStatus}`);
                        }}
                        className="bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs rounded-lg px-2.5 py-1 focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
