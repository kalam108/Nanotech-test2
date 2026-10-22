import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import { Product, ProductCondition, ProductStatus } from '../../../types';
import { exportAdminProductsToExcel } from '../../../lib/excelAdmin';
import {
  Package,
  Search,
  Plus,
  Filter,
  FileSpreadsheet,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  X,
  Upload,
  Sparkles,
  Sliders,
} from 'lucide-react';

export function ProductsMasterSection() {
  const { logAdminAction, setAdminSubView, settings } = useAdmin();
  const { products, addProduct, updateProduct, deleteProduct, categories, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState('all');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Custom PCs');
  const [formBrand, setFormBrand] = useState('NanoTech Custom');
  const [formPrice, setFormPrice] = useState<number>(150000);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(165000);
  const [formStock, setFormStock] = useState<number>(10);
  const [formCondition, setFormCondition] = useState<ProductCondition>('New');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLocation, setFormLocation] = useState('Kathmandu, Nepal');
  const [formStatus, setFormStatus] = useState<ProductStatus>('published');
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesCond = selectedCondition === 'all' || p.condition === selectedCondition;
      const matchesStock =
        selectedStockStatus === 'all'
          ? true
          : selectedStockStatus === 'out'
          ? p.stock <= 0
          : selectedStockStatus === 'low'
          ? p.stock > 0 && p.stock < 5
          : p.stock >= 5;

      return matchesSearch && matchesCat && matchesCond && matchesStock;
    });
  }, [products, searchQuery, selectedCategory, selectedCondition, selectedStockStatus]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormCategory(categories[0]?.name || 'Custom PCs');
    setFormBrand('NanoTech Custom');
    setFormPrice(150000);
    setFormOriginalPrice(165000);
    setFormStock(10);
    setFormCondition('New');
    setFormDescription('High-performance gaming & workstation hardware, assembled and tested.');
    setFormImageUrl('https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800');
    setFormLocation('Kathmandu, Nepal');
    setFormStatus('published');
    setFormIsFeatured(false);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormCategory(p.category);
    setFormBrand(p.brand);
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice || p.price);
    setFormStock(p.stock);
    setFormCondition(p.condition);
    setFormDescription(p.description);
    setFormImageUrl(p.images?.[0] || '');
    setFormLocation(p.location);
    setFormStatus(p.status);
    setFormIsFeatured(p.isFeatured);
    setIsAddEditModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        title: formTitle,
        category: formCategory,
        brand: formBrand,
        price: formPrice,
        originalPrice: formOriginalPrice,
        stock: formStock,
        condition: formCondition,
        description: formDescription,
        images: formImageUrl ? [formImageUrl] : editingProduct.images,
        location: formLocation,
        status: formStatus,
        isFeatured: formIsFeatured,
      });
      logAdminAction('Updated Hardware Product', 'products', `Modified listing: ${formTitle} (${settings.currencySymbol} ${formPrice})`, editingProduct.id, formTitle);
      addToast('success', `Product "${formTitle}" updated.`);
    } else {
      const created = addProduct({
        title: formTitle,
        category: formCategory,
        brand: formBrand,
        price: formPrice,
        originalPrice: formOriginalPrice,
        stock: formStock,
        condition: formCondition,
        description: formDescription,
        images: [formImageUrl || 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800'],
        location: formLocation,
        status: formStatus,
        isFeatured: formIsFeatured,
        sellerId: 'nanotech-direct',
        sellerName: 'NanoTech Official Store',
        sellerRating: 4.9,
        sellerVerified: true,
      });
      logAdminAction('Created Hardware Product', 'products', `Added new listing: ${formTitle} (Stock: ${formStock})`, created.id, formTitle);
      addToast('success', `Product "${formTitle}" created.`);
    }
    setIsAddEditModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const p = products.find((prod) => prod.id === id);
    deleteProduct(id);
    logAdminAction('Deleted Hardware Product', 'products', `Removed product: ${p?.title || id}`, id, p?.title);
    addToast('info', 'Product removed from master catalog.');
    setDeleteConfirmId(null);
  };

  const handleAdjustStock = (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    updateProduct(p.id, {
      stock: newStock,
      status: newStock === 0 ? 'out_of_stock' : p.status === 'out_of_stock' ? 'published' : p.status,
    });
    logAdminAction('Adjusted Stock Level', 'inventory', `Adjusted ${p.title} stock to ${newStock} units`, p.id, p.title);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 admin-card-glass p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-5 h-5 text-amber-500" />
            Hardware Products Master Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Complete inventory, technical specifications, dynamic pricing, and stock controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportAdminProductsToExcel(products, settings.currencySymbol)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Catalog (XLSX)</span>
          </button>

          <button
            onClick={() => setAdminSubView('excel')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Excel Batch Import</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Hardware</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card-glass p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, brand, SKU..."
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Condition Filter */}
        <select
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          className="bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
        >
          <option value="all">All Conditions</option>
          <option value="New">Brand New</option>
          <option value="Refurbished">Refurbished / Certified</option>
          <option value="Used">Pre-Owned / Tested</option>
        </select>

        {/* Stock Level Filter */}
        <select
          value={selectedStockStatus}
          onChange={(e) => setSelectedStockStatus(e.target.value)}
          className="bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
        >
          <option value="all">All Stock Status</option>
          <option value="in">In Stock (5+ units)</option>
          <option value="low">Low Stock (&lt; 5 units)</option>
          <option value="out">Out of Stock (0 units)</option>
        </select>

        <span className="text-xs text-slate-500 font-mono ml-auto">
          {filteredProducts.length} listings found
        </span>
      </div>

      {/* Products Data Table */}
      <div className="admin-card-glass overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0e1015] text-[11px] font-bold text-slate-400 uppercase font-mono">
                <th className="py-3.5 px-4">Hardware Item</th>
                <th className="py-3.5 px-3">Category / Brand</th>
                <th className="py-3.5 px-3">Condition</th>
                <th className="py-3.5 px-3">Pricing ({settings.currencySymbol})</th>
                <th className="py-3.5 px-3">Stock Count</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No hardware products match the current filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock > 0 && p.stock < 5;
                  const isOut = p.stock <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-850/50 transition-colors group">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800'}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800';
                            }}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-900"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate max-w-xs group-hover:text-amber-400 transition-colors">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block truncate">
                              ID: #{p.id.slice(-6)} • {p.location}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-white block">{p.category}</span>
                        <span className="text-[10px] text-slate-400">{p.brand}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            p.condition === 'New'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : 'bg-blue-500/15 text-blue-300'
                          }`}
                        >
                          {p.condition}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">
                          {settings.currencySymbol} {p.price.toLocaleString()}
                        </div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="text-[10px] text-slate-500 line-through">
                            {settings.currencySymbol} {p.originalPrice.toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAdjustStock(p, -1)}
                            className="w-5 h-5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-mono text-xs"
                            title="Decrease stock"
                          >
                            -
                          </button>
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                              isOut
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : isLow
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'text-slate-200'
                            }`}
                          >
                            {p.stock}
                          </span>
                          <button
                            onClick={() => handleAdjustStock(p, 1)}
                            className="w-5 h-5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-mono text-xs"
                            title="Increase stock"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            p.status === 'published'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : p.status === 'out_of_stock'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {p.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-amber-400 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete Product"
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
      </div>

      {/* Add / Edit Product Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#12141a] border border-amber-500/30 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                {editingProduct ? 'Edit Hardware Listing' : 'Add New Hardware Product'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Nanotech Apex RTX 4090 Gaming Rig"
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Brand / OEM</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="e.g. ASUS / MSI / Custom"
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">
                    Selling Price ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">
                    Original Price ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Condition</label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value as ProductCondition)}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="New">Brand New Sealed</option>
                    <option value="Refurbished">Factory Refurbished</option>
                    <option value="Used">Pre-Owned &amp; Tested</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Publish Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="published">Published (Live)</option>
                    <option value="draft">Draft (Unlisted)</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Mark as Featured Product</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20"
                  >
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12141a] border border-rose-500/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Delete Hardware Product?</h4>
              <p className="text-xs text-slate-400 mt-1">
                This action will permanently remove this item from the storefront catalog.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
