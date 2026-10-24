'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useApp } from '../../../context/AppContext';
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  Percent,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';

interface DiscountItem {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order_amount: number;
  start_date?: string;
  end_date?: string;
  usage_limit?: number | null;
  used_count: number;
  is_active: boolean;
  created_at?: string;
}

export function OffersDiscountsSection() {
  const { addToast } = useApp();
  const [discounts, setDiscounts] = useState<DiscountItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountItem | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percent' as 'percent' | 'fixed',
    value: 10,
    min_order_amount: 0,
    start_date: '',
    end_date: '',
    usage_limit: '',
    is_active: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/discounts', { headers });
      if (!res.ok) throw new Error('Failed to load discount codes');
      const data = await res.json();
      setDiscounts(data.discounts || []);
    } catch (err: any) {
      console.warn('Discounts fetch note:', err);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const openCreateModal = () => {
    setEditingDiscount(null);
    setFormData({
      code: '',
      type: 'percent',
      value: 10,
      min_order_amount: 0,
      start_date: '',
      end_date: '',
      usage_limit: '',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (d: DiscountItem) => {
    setEditingDiscount(d);
    setFormData({
      code: d.code,
      type: d.type,
      value: d.value,
      min_order_amount: d.min_order_amount,
      start_date: d.start_date ? d.start_date.slice(0, 10) : '',
      end_date: d.end_date ? d.end_date.slice(0, 10) : '',
      usage_limit: d.usage_limit ? String(d.usage_limit) : '',
      is_active: d.is_active,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || formData.value <= 0) {
      addToast('error', 'Please provide a valid code and discount value');
      return;
    }
    setIsSaving(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const method = editingDiscount ? 'PATCH' : 'POST';
      const endpoint = editingDiscount ? `/api/admin/discounts/${editingDiscount.id}` : '/api/admin/discounts';

      const payload = {
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        min_order_amount: Number(formData.min_order_amount) || 0,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit, 10) : null,
        is_active: formData.is_active,
      };

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save discount code');

      addToast('success', editingDiscount ? 'Discount code updated' : 'Discount code created');
      setIsModalOpen(false);
      fetchDiscounts();
    } catch (err: any) {
      addToast('error', err?.message || 'Error saving discount');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (d: DiscountItem) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const res = await fetch(`/api/admin/discounts/${d.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !d.is_active }),
      });

      if (!res.ok) throw new Error('Status update failed');
      addToast('success', `Discount code ${d.code} is now ${!d.is_active ? 'active' : 'inactive'}`);
      fetchDiscounts();
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to update discount status');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Are you sure you want to delete discount code "${code}"?`)) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const res = await fetch(`/api/admin/discounts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Delete failed');
      addToast('success', `Discount code ${code} deleted`);
      fetchDiscounts();
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to delete discount');
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#0F766E]" />
            Offers &amp; Discounts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create coupon codes. Discounts are strictly verified and calculated on the backend when orders are placed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchDiscounts}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs cursor-pointer"
            title="Refresh discounts"
          >
            <RefreshCw className={`w-4 h-4 text-[#0F766E] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0b5c56] text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Discount</span>
          </button>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-4">Type &amp; Value</th>
                <th className="py-3.5 px-4">Min Order</th>
                <th className="py-3.5 px-4">Valid Window</th>
                <th className="py-3.5 px-4">Usage Count</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading discount codes...
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No data yet
                  </td>
                </tr>
              ) : (
                discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Code */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tracking-wider">
                      <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                        {d.code}
                      </span>
                    </td>

                    {/* Type & Value */}
                    <td className="py-3.5 px-4 font-bold text-[#0F766E]">
                      {d.type === 'percent' ? `${d.value}% Off` : `Rs. ${d.value.toLocaleString()} Off`}
                    </td>

                    {/* Min Order */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {d.min_order_amount > 0 ? `Rs. ${d.min_order_amount.toLocaleString()}` : 'None'}
                    </td>

                    {/* Window */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {d.start_date ? new Date(d.start_date).toLocaleDateString() : 'Now'} —{' '}
                      {d.end_date ? new Date(d.end_date).toLocaleDateString() : 'No expiry'}
                    </td>

                    {/* Usage */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <strong>{d.used_count || 0}</strong>
                      {d.usage_limit ? ` / ${d.usage_limit} limit` : ' (Unlimited)'}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => toggleActive(d)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                          d.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${d.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{d.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(d)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#0F766E] hover:text-white text-slate-600 transition cursor-pointer"
                          title="Edit discount"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id, d.code)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition cursor-pointer"
                          title="Delete discount"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-poppins">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingDiscount ? 'Edit Discount Code' : 'Create Discount Code'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Coupon verified strictly on backend during order placement.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMER10, DASHAIN2026"
                  className="w-full px-3 py-2 text-xs font-mono font-bold uppercase border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percent' | 'fixed' })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E] bg-white font-medium"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (NPR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Value {formData.type === 'percent' ? '(%)' : '(Rs.)'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Order Amount (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.min_order_amount}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0 for no minimum"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Usage Limit (Max Uses)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="Leave blank for unlimited"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div className="pt-4 flex items-center gap-2">
                  <input
                    id="discount-active-checkbox"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#0F766E] rounded focus:ring-[#0F766E] accent-[#0F766E]"
                  />
                  <label htmlFor="discount-active-checkbox" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Active Code
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0b5c56] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Discount'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
