import React, { useState } from 'react';
import { NEPAL_STORES_DIRECTORY } from '../data/nepalStoresData';
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Building2,
  Search,
  Star,
  ExternalLink,
  Award,
} from 'lucide-react';

export const StoresPage: React.FC = () => {
  const [selectedHub, setSelectedHub] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const hubs = ['All', 'Itahari', 'Putalisadak', 'New Road', 'Kamaladi', 'Pokhara', 'Chitwan', 'Banepa', 'Biratnagar'];

  const filteredStores = NEPAL_STORES_DIRECTORY.filter(store => {
    const matchesHub = selectedHub === 'All' || store.hub === selectedHub;
    const matchesSearch =
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.authorizedBrands.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesHub && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20 mb-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <MapPin className="w-3.5 h-3.5" />
            Kathmandu & Nationwide Physical Tech Hubs
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Nepal Verified Computer & Laptop Stores Directory
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base">
            Find physical authorized tech stores across Putalisadak (Star Mall, Triveni Complex), New Road (CTC Mall), Kamaladi, Pokhara, and major Nepal cities with direct WhatsApp inquiry and genuine warranty claims.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search store name, street, brand (e.g. Star Mall, ASUS, Apple)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Hub:</span>
          {hubs.map(hub => (
            <button
              key={hub}
              onClick={() => setSelectedHub(hub)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                selectedHub === hub
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {hub}
            </button>
          ))}
        </div>
      </div>

      {/* Store Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredStores.map(store => (
          <div
            key={store.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Store Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                    <MapPin className="w-3 h-3" />
                    {store.hub} Hub
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {store.name}
                  </h2>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 font-bold px-2 py-1 rounded-lg text-xs shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{store.rating.toFixed(1)}</span>
                  <span className="text-slate-400 font-normal">({store.reviewsCount})</span>
                </div>
              </div>

              {/* Physical Address */}
              <p className="text-xs text-slate-600 mb-4 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{store.address}</span>
              </p>

              {/* Opening Hours */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-xl">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{store.openingHours}</span>
              </div>

              {/* Warranty Policy */}
              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 mb-4 text-xs text-emerald-950">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Warranty & Inspection Policy:
                </div>
                <p className="text-[11px] opacity-90">{store.warrantyPolicy}</p>
              </div>

              {/* Authorized Brands */}
              <div className="mb-5">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Authorized Brands & Service
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {store.authorizedBrands.map((b, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact & WhatsApp Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <a
                href={`tel:${store.phone}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>{store.phone}</span>
              </a>

              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/977${store.whatsapp}?text=Hello%2C%20I%20found%20your%20store%20on%20Nepal%20Computer%20Marketplace.%20I%20have%20an%20inquiry.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Chat</span>
                </a>

                {store.website && (
                  <a
                    href={store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                    title="Visit website"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
