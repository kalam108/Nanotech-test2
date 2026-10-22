import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SlidersHorizontal, RotateCcw, Check, ChevronDown, ChevronUp } from 'lucide-react';

export function ProductFilters() {
  const { filters, setFilters, resetFilters, categories, products, formatPricePrimary, currency, exchangeRate } = useApp();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const availableBrands = Array.from(new Set((products || []).map(p => p.brand).filter(Boolean))).sort();
  const availableLocations = Array.from(new Set((products || []).map(p => p.location).filter(Boolean))).sort();

  const activeFilterCount = (filters.category !== 'all' ? 1 : 0) +
    (filters.condition !== 'all' ? 1 : 0) +
    (filters.brand !== 'all' ? 1 : 0) +
    (filters.location !== 'all' ? 1 : 0) +
    (filters.searchQuery ? 1 : 0);

  return (
    <div className="bg-white rounded-3xl p-5 text-slate-800 border border-slate-200 shadow-xs">
      {/* Header with Mobile Collapse Toggle */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="flex items-center gap-2 text-left w-full lg:w-auto cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-600 shrink-0" />
          <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
            Filter System
            {activeFilterCount > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </h3>
          <span className="lg:hidden ml-auto text-slate-400">
            {isMobileExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        <button
          onClick={resetFilters}
          className="hidden sm:flex text-xs text-slate-500 hover:text-indigo-600 items-center gap-1 transition-colors shrink-0 ml-2 cursor-pointer font-semibold"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Filter Body */}
      <div className={`${isMobileExpanded ? 'block' : 'hidden lg:block'} space-y-6 pt-4`}>
        {/* Sort By */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Sort Order
          </label>
          <select
            value={filters.sortBy}
            onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="relevance">Featured & Relevant</option>
            <option value="newest">Newest Hardware</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="rating">Top Seller Rating</option>
          </select>
        </div>

        {/* Condition Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Hardware Condition
          </label>
          <div className="grid grid-cols-2 gap-2">
            {['all', 'New', 'Refurbished', 'Used'].map(cond => (
              <button
                key={cond}
                onClick={() => setFilters(prev => ({ ...prev, condition: cond }))}
                className={`px-3 py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                  filters.condition === cond
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cond === 'all' ? 'All Conditions' : cond}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Categories
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => setFilters(prev => ({ ...prev, category: 'all' }))}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                filters.category === 'all' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>All Hardware Types</span>
              {filters.category === 'all' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setFilters(prev => ({ ...prev, category: c.name }))}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                  filters.category === c.name ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{c.name}</span>
                {filters.category === c.name && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            <span>Budget Ceiling ({currency === 'NPR' ? 'NPR रु' : 'USD $'})</span>
            <span className="text-[#4f46e5] font-extrabold">{formatPricePrimary(filters.maxPrice)}</span>
          </div>
          <input
            type="range"
            min="10"
            max="3500"
            step="10"
            value={filters.maxPrice}
            onChange={e => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
            className="w-full accent-indigo-600 bg-slate-200 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
            <span>{formatPricePrimary(0)}</span>
            <span>{formatPricePrimary(1500)}</span>
            <span>{formatPricePrimary(3500)}+</span>
          </div>
        </div>

        {/* Brand Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Brand Manufacturer
          </label>
          <select
            value={filters.brand}
            onChange={e => setFilters(prev => ({ ...prev, brand: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Brands</option>
            {availableBrands.map(brand => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Seller Region
          </label>
          <select
            value={filters.location}
            onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Regions</option>
            {availableLocations.map(loc => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
