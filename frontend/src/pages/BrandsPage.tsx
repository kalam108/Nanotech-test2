import React, { useState } from 'react';
import { NEPAL_BRANDS_DATABASE } from '../data/nepalBrandsData';
import { useApp } from '../context/AppContext';
import {
  Building2,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Search,
  CheckCircle2,
  Star,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const BrandsPage: React.FC = () => {
  const { setFilters, setCurrentView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');

  const countries = ['All', ...Array.from(new Set(NEPAL_BRANDS_DATABASE.map(b => b.country)))];

  const filteredBrands = NEPAL_BRANDS_DATABASE.filter(brand => {
    const matchesSearch =
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.authorizedDistributorsNepal.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
      brand.popularCategories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCountry = selectedCountry === 'All' || brand.country === selectedCountry;

    return matchesSearch && matchesCountry;
  });

  const handleViewBrandProducts = (brandName: string) => {
    setFilters(prev => ({
      ...prev,
      brand: brandName,
      searchQuery: '',
      category: '',
    }));
    setCurrentView('products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20 mb-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5" />
            Official Nepal Distributor & Warranty Network
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Nepal Computer & Tech Brands Directory
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base">
            Explore authorized distributors (Nagmani, Megatech, GenNext, Neoteric, Ocean), official warranty terms, and physical service center locations in Kathmandu, Pokhara, and across Nepal.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brand, distributor (e.g. Nagmani, Megatech), category..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Origin:</span>
          {countries.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                selectedCountry === c
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map(brand => (
          <div
            key={brand.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Brand Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {brand.name.slice(0, 4).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {brand.name}
                    </h2>
                    <span className="text-xs text-slate-500">{brand.country}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 font-bold px-2 py-1 rounded-lg text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{brand.brandRating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                {brand.marketPosition}
              </p>

              {/* Authorized Distributor Badge */}
              <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100/80 mb-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Official Nepal Distributor
                </div>
                <div className="text-xs font-semibold text-slate-900">
                  {brand.authorizedDistributorsNepal.join(', ')}
                </div>
              </div>

              {/* Warranty & Service */}
              <div className="space-y-2 mb-4 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Warranty in Nepal: </span>
                    <span>{brand.warrantyTermsNepal}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Service Center Hubs: </span>
                    <span>{brand.serviceCentersNepal[0]}</span>
                  </div>
                </div>
              </div>

              {/* Popular Categories Chips */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {brand.popularCategories.slice(0, 3).map((cat, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">
                {brand.priceRangeNpr}
              </span>

              <button
                onClick={() => handleViewBrandProducts(brand.name)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <span>View Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
