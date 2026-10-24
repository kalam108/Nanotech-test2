'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useApp } from '../../../context/AppContext';
import {
  Users,
  Search,
  Edit2,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  Phone,
  MapPin,
  Mail,
  User,
} from 'lucide-react';

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  status: 'active' | 'suspended';
  role?: string;
  joined: string;
}

export function CustomersSection() {
  const { addToast } = useApp();

  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'block' | 'unblock' | 'delete';
    customer: CustomerItem | null;
  }>({
    isOpen: false,
    type: 'block',
    customer: null,
  });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await fetch(`/api/admin/customers?${params.toString()}`, { headers });
      if (!res.ok) {
        throw new Error(`Failed to load customers (${res.status})`);
      }
      const data = await res.json();
      setCustomers(data.customers || []);
      setTotalCount(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      console.warn('Error fetching customers:', err);
      // Fallback: show empty list with no fake numbers
      setCustomers([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, searchQuery]);

  // Open Edit Form Modal
  const openEditModal = (c: CustomerItem) => {
    if (c.role === 'admin' || c.role === 'super_admin' || c.role === 'superadmin') {
      addToast('error', 'Admins cannot edit admin or superadmin accounts.');
      return;
    }
    setEditingCustomer(c);
    setEditForm({
      name: c.name || '',
      phone: c.phone === 'No phone' ? '' : c.phone,
      address: c.address === 'Nepal' ? '' : c.address,
    });
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsSavingEdit(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const res = await fetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to update customer');
      }

      addToast('success', `Customer profile updated successfully`);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err: any) {
      addToast('error', err?.message || 'Error updating customer');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Trigger Confirmation Modal for Block/Unblock or Delete
  const triggerConfirm = (type: 'block' | 'unblock' | 'delete', customer: CustomerItem) => {
    if (customer.role === 'admin' || customer.role === 'super_admin' || customer.role === 'superadmin') {
      addToast('error', 'Admins cannot edit, block, or delete admin or superadmin accounts.');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      type,
      customer,
    });
  };

  // Execute Confirmed Action
  const handleConfirmAction = async () => {
    const { type, customer } = confirmDialog;
    if (!customer) return;
    setIsProcessingAction(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      if (type === 'block' || type === 'unblock') {
        const nextStatus = type === 'block' ? 'suspended' : 'active';
        const res = await fetch(`/api/admin/customers/${customer.id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to update status');

        addToast('success', `${customer.name} is now ${nextStatus === 'suspended' ? 'blocked' : 'active'}`);
      } else if (type === 'delete') {
        const res = await fetch(`/api/admin/customers/${customer.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to delete customer');

        addToast('success', `Customer ${customer.name} was permanently deleted`);
      }

      setConfirmDialog({ isOpen: false, type: 'block', customer: null });
      fetchCustomers();
    } catch (err: any) {
      addToast('error', err?.message || 'Action failed');
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0F766E]" />
            Customers Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View registered shopper profiles, update contact details, and manage account statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#0F766E] bg-[#0F766E]/10 px-3 py-1.5 rounded-xl border border-[#0F766E]/20">
            Total Customers: {totalCount}
          </span>
          <button
            type="button"
            onClick={fetchCustomers}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs cursor-pointer"
            title="Refresh customer list"
          >
            <RefreshCw className={`w-4 h-4 text-[#0F766E] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No data yet
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const isBlocked = c.status === 'suspended';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {c.name}
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {c.email}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {c.phone || 'No phone'}
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-[180px] truncate" title={c.address}>
                        {c.address || 'Nepal'}
                      </td>

                      {/* Total Orders */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {c.totalOrders}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isBlocked
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isBlocked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          {isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                        {new Date(c.joined).toLocaleDateString()}
                      </td>

                      {/* Actions: Edit, Block/Unblock, Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#0F766E] hover:text-white text-slate-600 transition-colors cursor-pointer"
                            title="Edit customer details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Block / Unblock */}
                          <button
                            type="button"
                            onClick={() => triggerConfirm(isBlocked ? 'unblock' : 'block', c)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isBlocked
                                ? 'bg-emerald-100 hover:bg-emerald-600 text-emerald-700 hover:text-white'
                                : 'bg-amber-100 hover:bg-amber-600 text-amber-800 hover:text-white'
                            }`}
                            title={isBlocked ? 'Unblock customer' : 'Block customer'}
                          >
                            {isBlocked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => triggerConfirm('delete', c)}
                            className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-600 text-rose-700 hover:text-white transition-colors cursor-pointer"
                            title="Delete customer permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (20 per page) */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <span>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (20 per page)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-2xs cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-2xs cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-poppins">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Customer Profile</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{editingCustomer.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+977 9800000000"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shipping / Home Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <textarea
                    rows={2}
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="e.g. Main Road, Itahari-4, Sunsari"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0b5c56] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG (Are you sure?) */}
      {confirmDialog.isOpen && confirmDialog.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 font-poppins text-center">
            <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 ${
              confirmDialog.type === 'delete'
                ? 'bg-rose-100 text-rose-600'
                : confirmDialog.type === 'block'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {confirmDialog.type === 'delete' ? (
                <Trash2 className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900">Are you sure?</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {confirmDialog.type === 'delete' && (
                <>
                  This will permanently delete customer{' '}
                  <strong className="text-slate-900">{confirmDialog.customer.name}</strong> ({confirmDialog.customer.email}) and remove their profile from the database.
                </>
              )}
              {confirmDialog.type === 'block' && (
                <>
                  Are you sure you want to block{' '}
                  <strong className="text-slate-900">{confirmDialog.customer.name}</strong>? They will be unable to log in to the storefront.
                </>
              )}
              {confirmDialog.type === 'unblock' && (
                <>
                  Are you sure you want to unblock{' '}
                  <strong className="text-slate-900">{confirmDialog.customer.name}</strong>? Their account access will be restored immediately.
                </>
              )}
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog({ isOpen: false, type: 'block', customer: null })}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingAction}
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 ${
                  confirmDialog.type === 'delete'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : confirmDialog.type === 'block'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-[#0F766E] hover:bg-[#0b5c56]'
                }`}
              >
                {isProcessingAction ? 'Processing...' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
