import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import { Category } from '../../../types';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';

export function CategoriesSection() {
  const { logAdminAction, setAdminSubView } = useAdmin();
  const { categories, addCategory, addToast, products } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Cpu');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600');

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCategory({
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      icon: icon.trim(),
      imageUrl: imageUrl.trim(),
      productCount: 0,
      featured: true,
    });

    logAdminAction('Added Category', 'products', `Created category taxonomy: ${name}`);
    addToast('success', `Category "${name}" created.`);
    setName('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 admin-card-glass p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-5 h-5 text-amber-500" />
            Hardware Category Hierarchy &amp; Taxonomy
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage storefront component classifications, navigation tags, and catalog grouping.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="admin-card-glass p-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {filteredCategories.length} categories
        </span>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((c) => {
          const liveProductCount = products.filter((p) => p.category === c.name).length;

          return (
            <div
              key={c.id}
              className="admin-card-glass p-6 hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-bold group-hover:scale-105 transition-transform overflow-hidden">
                    {c.imageUrl ? (
                      <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <FolderTree className="w-6 h-6" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-full font-bold">
                    {liveProductCount} Active Products
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">slug: /{c.slug}</span>
                <button
                  onClick={() => setAdminSubView('products')}
                  className="text-amber-600 hover:text-amber-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <span>Filter Products →</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12141a] border border-amber-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                Add New Hardware Category
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Liquid Cooling &amp; Modding"
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of hardware types included in this category..."
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Representative Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
