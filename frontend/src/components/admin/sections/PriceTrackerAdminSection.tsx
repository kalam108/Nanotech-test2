import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useAdmin } from '../../../context/AdminContext';
import { Product } from '../../../types';
import {
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Sparkles,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Download,
  BellRing,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react';

export function PriceTrackerAdminSection() {
  const { products, formatPrice, addToast } = useApp();
  const { logAdminAction } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [newMrp, setNewMrp] = useState<number>(0);
  const [distributorNotes, setDistributorNotes] = useState('');

  const categories = [
    'All',
    'Laptops',
    'Graphics Cards (GPUs)',
    'Processors (CPUs)',
    'Motherboards',
    'RAM Memory',
    'SSD & Storage',
    'Power Supplies (PSUs)',
    'Gaming Monitors',
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nepalOfficialDistributor && p.nepalOfficialDistributor.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setNewPrice(p.price);
    setNewMrp(p.originalPrice || p.price);
    setDistributorNotes(p.nepalOfficialDistributor || '');
  };

  const handleSavePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Apply price modification in state
    editingProduct.price = Number(newPrice);
    editingProduct.originalPrice = Number(newMrp);
    if (distributorNotes) {
      editingProduct.nepalOfficialDistributor = distributorNotes;
    }

    logAdminAction(
      'Updated Product Price',
      'product',
      `Updated price of ${editingProduct.title} to NPR ${newPrice} (MRP: NPR ${newMrp})`
    );
    addToast('success', `Price updated for ${editingProduct.title} to ${formatPrice(newPrice)}`);
    setEditingProduct(null);
  };

  const handleTriggerPriceAlert = (p: Product) => {
    logAdminAction('Broadcast Price Drop Alert', 'marketing', `Triggered price drop notification for ${p.title}`);
    addToast('info', `Price drop alert broadcasted to 1,240 interested buyers for ${p.title}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <TrendingDown className="w-3.5 h-3.5" />
              Nepal Hardware Price Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Price Tracker & MRP Admin Control
            </h1>
            <p className="mt-1 text-slate-300 text-xs sm:text-sm max-w-2xl">
              Monitor street price gaps across Putalisadak & New Road distributors, update live NPR rates, and send price drop notifications to subscribed gamers and PC builders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Tracked Products</span>
              <span className="text-lg font-black text-emerald-400">{products.length} Items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search model, brand, distributor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {categories.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Price Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-black text-slate-900 text-sm">
            Live Hardware Price Matrix ({filteredProducts.length} Items)
          </h3>
          <span className="text-xs text-slate-500 font-medium">Auto-synced with Nepal Importer Feeds</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Product Name & Model</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Official Importer / Distributor</th>
                <th className="px-4 py-3">Official MRP</th>
                <th className="px-4 py-3">Current Street Price</th>
                <th className="px-4 py-3">Discount Margin</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProducts.map((product) => {
                const discount =
                  product.originalPrice && product.originalPrice > product.price
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0;

                return (
                  <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 max-w-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={product.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800';
                          }}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <span className="line-clamp-1">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{product.brand}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {product.nepalOfficialDistributor || 'Authorized Importer'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 line-through">
                      {product.originalPrice ? formatPrice(product.originalPrice) : formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 font-black text-slate-900">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      {discount > 0 ? (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          <TrendingDown className="w-3 h-3" />
                          {discount}% OFF
                        </span>
                      ) : (
                        <span className="text-slate-400">Regular</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <button
                        onClick={() => handleTriggerPriceAlert(product)}
                        title="Broadcast Price Drop Alert"
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEditClick(product)}
                        title="Edit Price & MRP"
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Price Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-black text-slate-900 mb-1">
              Update Live Price & MRP
            </h3>
            <p className="text-xs text-slate-500 mb-4 line-clamp-1 font-medium">
              {editingProduct.title}
            </p>

            <form onSubmit={handleSavePrice} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Current Selling Price (NPR)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Distributor MRP / Original Price (NPR)</label>
                <input
                  type="number"
                  value={newMrp}
                  onChange={(e) => setNewMrp(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Official Nepal Importer</label>
                <input
                  type="text"
                  value={distributorNotes}
                  onChange={(e) => setDistributorNotes(e.target.value)}
                  placeholder="e.g. Nagmani International Pvt. Ltd."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer shadow-xs"
                >
                  Save & Broadcast Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceTrackerAdminSection;
