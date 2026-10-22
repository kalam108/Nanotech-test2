import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import { SellerProfile } from '../../../types';
import {
  Store,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Star,
  MapPin,
  Phone,
  Building,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export function SellersSection() {
  const { logAdminAction } = useAdmin();
  const { sellers, updateSellerStatus, addToast, products } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState<SellerProfile | null>(null);

  const filteredSellers = sellers.filter((s) => {
    const matchesSearch =
      s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleApprove = (s: SellerProfile) => {
    updateSellerStatus(s.id, 'approved');
    logAdminAction('Approved Hardware Seller', 'sellers', `Verified and approved merchant: ${s.storeName}`, s.id, s.storeName);
    addToast('success', `Seller store "${s.storeName}" has been approved.`);
  };

  const handleRejectOrSuspend = (s: SellerProfile) => {
    const newStatus = s.status === 'suspended' ? 'approved' : 'suspended';
    updateSellerStatus(s.id, newStatus);
    logAdminAction('Updated Seller Status', 'sellers', `Merchant ${s.storeName} set to ${newStatus.toUpperCase()}`, s.id, s.storeName);
    addToast('info', `Seller store "${s.storeName}" is now ${newStatus}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141a] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Store className="w-5 h-5 text-amber-400" />
            Verified Hardware Sellers &amp; Stores
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Commercial merchant vetting, tax registration auditing, seller metrics, and marketplace compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs bg-slate-900 border border-slate-800 text-amber-400 px-3 py-1.5 rounded-xl font-mono font-bold">
            Total Sellers: {sellers.length}
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
            placeholder="Search by store name, location, contact..."
            className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0a0b0e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60 font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved &amp; Verified</option>
          <option value="pending">Pending Approval</option>
          <option value="suspended">Suspended</option>
        </select>

        <span className="text-xs text-slate-500 font-mono ml-auto">
          {filteredSellers.length} merchants
        </span>
      </div>

      {/* Sellers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSellers.map((s) => {
          const sellerProducts = products.filter((p) => p.sellerId === s.id);

          return (
            <div
              key={s.id}
              className="bg-[#12141a] border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={s.logoUrl || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=120'}
                      alt={s.storeName}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-white text-sm">{s.storeName}</h3>
                        {s.verified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{s.location}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      s.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : s.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {s.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {s.description || 'Verified technology vendor and parts supplier.'}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850 text-xs">
                  <div className="bg-[#0a0b0e] p-2 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 block">Rating Score</span>
                    <span className="font-bold text-amber-400 flex items-center gap-1 font-mono">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {s.rating} / 5.0
                    </span>
                  </div>
                  <div className="bg-[#0a0b0e] p-2 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-500 block">Listed Inventory</span>
                    <span className="font-bold text-white font-mono">
                      {sellerProducts.length} Items
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-850 flex items-center gap-2">
                {s.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleApprove(s)}
                      className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Store</span>
                    </button>
                    <button
                      onClick={() => handleRejectOrSuspend(s)}
                      className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold transition-all"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRejectOrSuspend(s)}
                    className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                      s.status === 'approved'
                        ? 'bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40'
                    }`}
                  >
                    {s.status === 'approved' ? 'Suspend Merchant' : 'Re-Activate Store'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
