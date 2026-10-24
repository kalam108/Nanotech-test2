'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useApp } from '../../../context/AppContext';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Upload,
  Calendar,
  ExternalLink,
  Layers,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';

interface BannerItem {
  id: string;
  title: string;
  image_url: string;
  link?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

export function BannersSection() {
  const { addToast } = useApp();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link: '',
    start_date: '',
    end_date: '',
    is_active: true,
    display_order: 0,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/banners', { headers });
      if (!res.ok) throw new Error('Failed to fetch banners');
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (err: any) {
      console.warn('Banners fetch note:', err);
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      image_url: '',
      link: '',
      start_date: '',
      end_date: '',
      is_active: true,
      display_order: banners.length,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (b: BannerItem) => {
    setEditingBanner(b);
    setFormData({
      title: b.title,
      image_url: b.image_url,
      link: b.link || '',
      start_date: b.start_date ? b.start_date.slice(0, 10) : '',
      end_date: b.end_date ? b.end_date.slice(0, 10) : '',
      is_active: b.is_active,
      display_order: b.display_order,
    });
    setIsModalOpen(true);
  };

  // Upload image to Supabase Storage bucket "banners"
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('banners')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, image_url: publicUrlData.publicUrl }));
      addToast('success', 'Banner image uploaded to Supabase Storage');
    } catch (err: any) {
      addToast('error', err?.message || 'Storage upload error. You can also paste an image URL directly.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.image_url.trim()) {
      addToast('error', 'Please provide a title and image');
      return;
    }
    setIsSaving(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const method = editingBanner ? 'PATCH' : 'POST';
      const endpoint = editingBanner ? `/api/admin/banners/${editingBanner.id}` : '/api/admin/banners';

      const payload = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
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
      if (!res.ok) throw new Error(json.error || 'Failed to save banner');

      addToast('success', editingBanner ? 'Banner updated successfully' : 'Banner created successfully');
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to save banner');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (banner: BannerItem) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !banner.is_active }),
      });

      if (!res.ok) throw new Error('Status update failed');
      addToast('success', `Banner is now ${!banner.is_active ? 'active' : 'inactive'}`);
      fetchBanners();
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to update banner status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const res = await fetch(`/api/admin/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete banner');
      addToast('success', 'Banner removed');
      fetchBanners();
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-[#0F766E]" />
            Promotional Banners
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage promotional hero sliders and campaign graphic displays on the storefront homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchBanners}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-2xs cursor-pointer"
            title="Refresh banners"
          >
            <RefreshCw className={`w-4 h-4 text-[#0F766E] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0b5c56] text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Banner</span>
          </button>
        </div>
      </div>

      {/* Banners Grid / List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No data yet</p>
            <p className="text-xs text-slate-400 mt-1">Upload your first promotional banner to showcase on the homepage.</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Banner</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Banner Thumbnail & Info */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="w-32 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{banner.title}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        Order #{banner.display_order}
                      </span>
                    </div>

                    {banner.link && (
                      <div className="text-xs text-[#0F766E] font-medium flex items-center gap-1 mt-1 truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{banner.link}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1.5 font-mono">
                      <span>Start: {banner.start_date ? new Date(banner.start_date).toLocaleDateString() : 'Immediate'}</span>
                      <span>•</span>
                      <span>End: {banner.end_date ? new Date(banner.end_date).toLocaleDateString() : 'Continuous'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions & Active Toggle */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => toggleActive(banner)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer ${
                      banner.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${banner.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span>{banner.is_active ? 'Active' : 'Inactive'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(banner)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-[#0F766E] hover:text-white text-slate-600 transition cursor-pointer"
                    title="Edit banner"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition cursor-pointer"
                    title="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT BANNER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden font-poppins">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload promotional artwork to the Supabase "banners" bucket.
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Dashain Gaming Festival 2026"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                />
              </div>

              {/* Image Upload / URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Artwork *</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-slate-300 hover:border-[#0F766E] rounded-xl text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 hover:bg-white transition">
                      <Upload className="w-4 h-4 text-[#0F766E]" />
                      <span>{uploadingImage ? 'Uploading to Supabase...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    required
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="Or paste image URL (https://...)"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Link / URL (Optional)</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="e.g. /products?category=Graphics%20Cards"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
                <div className="pt-4 flex items-center gap-2">
                  <input
                    id="banner-active-checkbox"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#0F766E] rounded focus:ring-[#0F766E] accent-[#0F766E]"
                  />
                  <label htmlFor="banner-active-checkbox" className="text-xs font-bold text-slate-800 cursor-pointer">
                    Active on Storefront
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
                  disabled={isSaving || uploadingImage}
                  className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0b5c56] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
