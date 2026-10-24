'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useApp } from '../../../context/AppContext';
import {
  Settings,
  Store,
  Phone,
  Mail,
  MapPin,
  Truck,
  Gift,
  AlertTriangle,
  Save,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export function AdminSettingsSection() {
  const { addToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settingsForm, setSettingsForm] = useState({
    store_name: 'NanoTech Computers & Solutions',
    phone: '+977 9852055346',
    email: 'ntsolution68@gmail.com',
    address: 'Main Road, Itahari-4, Sunsari, Nepal',
    delivery_fee: 150,
    free_delivery_above: 5000,
    low_stock_threshold: 3,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/settings', { headers });
      if (!res.ok) throw new Error('Failed to fetch store settings');
      const data = await res.json();
      if (data.settings) {
        setSettingsForm({
          store_name: data.settings.store_name || 'NanoTech Computers & Solutions',
          phone: data.settings.phone || '+977 9852055346',
          email: data.settings.email || 'ntsolution68@gmail.com',
          address: data.settings.address || 'Main Road, Itahari-4, Sunsari, Nepal',
          delivery_fee: Number(data.settings.delivery_fee) || 150,
          free_delivery_above: Number(data.settings.free_delivery_above) || 5000,
          low_stock_threshold: Number(data.settings.low_stock_threshold) || 3,
        });
      }
    } catch (err: any) {
      console.warn('Settings fetch note:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingsForm),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save store settings');

      addToast('success', 'Store settings updated in Supabase store_settings');
    } catch (err: any) {
      addToast('error', err?.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-poppins max-w-4xl animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#0F766E]" />
            Store Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure contact info, delivery fees, and order parameters saved to the Supabase store_settings table.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          disabled={loading}
          className="self-start sm:self-center p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs cursor-pointer"
          title="Reload settings"
        >
          <RefreshCw className={`w-4 h-4 text-[#0F766E] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Store Contact & Identity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Store className="w-4 h-4 text-[#0F766E]" />
            <h2 className="text-sm font-bold text-slate-900">Store Profile &amp; Contact Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Store Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Store Name *
              </label>
              <input
                type="text"
                required
                value={settingsForm.store_name}
                onChange={(e) => setSettingsForm({ ...settingsForm, store_name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact Phone *</span>
              </label>
              <input
                type="text"
                required
                value={settingsForm.phone}
                onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Official Email *</span>
              </label>
              <input
                type="email"
                required
                value={settingsForm.email}
                onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Physical Store Address *</span>
              </label>
              <input
                type="text"
                required
                value={settingsForm.address}
                onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Delivery & Shipping Parameters */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Truck className="w-4 h-4 text-[#0F766E]" />
            <h2 className="text-sm font-bold text-slate-900">Delivery Fees &amp; Thresholds</h2>
          </div>

          <p className="text-xs text-slate-500">
            The backend orders route reads delivery fees strictly from this table during order calculation.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Standard Delivery Fee */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-400" />
                <span>Standard Delivery Fee (NPR) *</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={settingsForm.delivery_fee}
                onChange={(e) => setSettingsForm({ ...settingsForm, delivery_fee: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Default: Rs. 150</span>
            </div>

            {/* Free Delivery Threshold */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-slate-400" />
                <span>Free Delivery Above (NPR) *</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={settingsForm.free_delivery_above}
                onChange={(e) => setSettingsForm({ ...settingsForm, free_delivery_above: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Orders equal or exceeding this amount receive free delivery.
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Inventory Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-[#0F766E]" />
            <h2 className="text-sm font-bold text-slate-900">Inventory Alert Threshold</h2>
          </div>

          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Low Stock Warning Threshold (Units) *
            </label>
            <input
              type="number"
              min="1"
              required
              value={settingsForm.low_stock_threshold}
              onChange={(e) => setSettingsForm({ ...settingsForm, low_stock_threshold: parseInt(e.target.value, 10) || 3 })}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Products with stock at or below this value will trigger dashboard warnings.
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0b5c56] text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
