import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';

export const PriceTrackerPage: React.FC = () => {
  const { products, formatPrice, setSelectedProductId, setCurrentView, addToCart, openAddToCartModal } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Laptops', 'Graphics Cards (GPUs)', 'Processors (CPUs)', 'SSD & Storage', 'Monitors', 'RAM Memory', 'Keyboards'];

  const trackedProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nepalOfficialDistributor && p.nepalOfficialDistributor.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product_detail');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/20 mb-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <TrendingDown className="w-3.5 h-3.5" />
            Nepal Hardware Market Price Intelligence
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Nepal Computer & Hardware Price Tracker
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base">
            Real-time verified Nepal pricing, distributor vs imported market price gaps, official warranty validation, and historical price drops across Putalisadak and Kathmandu tech hubs.
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs text-indigo-200">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Last Market Verification: <strong>August 30, 2026</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>VAT & Importer Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search model, GPU, CPU, brand (e.g. RTX 4070, Ryzen 7800X3D)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tracked Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-bold">
                <th className="py-4 px-5">Product & Model</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Verified Nepal Price (NPR)</th>
                <th className="py-4 px-4">MRP / Original</th>
                <th className="py-4 px-4">Distributor / Channel</th>
                <th className="py-4 px-4">Stock Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {trackedProducts.map(product => {
                const discount = product.discountPercent || (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                    onClick={() => handleProductClick(product.id)}
                  >
                    {/* Title & Image */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150'}
                          alt={product.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {product.brand}
                            </span>
                            {product.nepalPriceStatus === 'verified' && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition truncate max-w-sm sm:max-w-md mt-0.5">
                            {product.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {product.warranty || 'Official Warranty'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-xs text-slate-600">
                      {product.category}
                    </td>

                    {/* Current Price */}
                    <td className="py-4 px-4">
                      <div className="font-black text-slate-900 text-sm sm:text-base">
                        {formatPrice(product.price)}
                      </div>
                      {product.minPriceNpr && product.maxPriceNpr && (
                        <div className="text-[10px] text-slate-400">
                          Range: NPR {product.minPriceNpr.toLocaleString()} - {product.maxPriceNpr.toLocaleString()}
                        </div>
                      )}
                    </td>

                    {/* MRP & Discount */}
                    <td className="py-4 px-4">
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <div>
                          <div className="line-through text-slate-400 text-xs">
                            {formatPrice(product.originalPrice)}
                          </div>
                          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600">
                            <TrendingDown className="w-3 h-3" />
                            {discount}% OFF
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Distributor */}
                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-slate-800">
                        {product.nepalOfficialDistributor || product.sellerName}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {product.nepalPriceSource || product.location}
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        product.stock > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openAddToCartModal(product, 1)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                        >
                          Buy / Cart
                        </button>
                        <button
                          onClick={() => handleProductClick(product.id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                          title="View Specs & Details"
                        >
                          <ArrowUpRight className="w-4 h-4" />
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
    </div>
  );
};
