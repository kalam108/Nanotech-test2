import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { useApp } from '../../../context/AppContext';
import { Search, Plus, Edit2, Trash2, Check, X, ShieldAlert, Cpu } from 'lucide-react';

export const AdminProductsView: React.FC = () => {
  const { hasPermission } = useRBAC();
  const { products, updateProduct, deleteProduct, addProduct } = useApp();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('ASUS');
  const [newCategory, setNewCategory] = useState('Graphics Cards');
  const [newPrice, setNewPrice] = useState(45000);
  const [newStock, setNewStock] = useState(10);

  const canEdit = hasPermission('products.edit');
  const canDelete = hasPermission('products.delete');
  const canCreate = hasPermission('products.create');

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (prod: any) => {
    setEditingId(prod.id);
    setEditPrice(prod.price);
    setEditStock(prod.stock || 12);
  };

  const saveEdit = (id: string) => {
    updateProduct(id, { price: editPrice, stock: editStock });
    setEditingId(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    addProduct({
      title: newTitle,
      brand: newBrand,
      category: newCategory,
      price: newPrice,
      stock: newStock,
      condition: 'New',
      status: 'published',
      images: ['https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500&q=80'],
      description: 'Brand new high performance computer hardware with official Nepal warranty.',
    });

    setIsAddModalOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Catalog & Stock Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time price adjustments, inventory tracking, and component specs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!canCreate}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              canCreate
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            Add Hardware
          </button>
        </div>
      </div>

      {!canEdit && (
        <div className="bg-amber-950/50 border border-amber-800 text-amber-300 p-3 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Notice: Your admin account has View-Only access to products. Modifications require 'products.edit' permission from Kalam (Superadmin).</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-4">Component / Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price (NPR)</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((prod) => {
                const isEditing = editingId === prod.id;
                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 flex items-center gap-3 max-w-xs">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=80&q=80'}
                        alt={prod.title}
                        className="w-10 h-10 object-contain rounded-lg bg-slate-950 p-1 border border-slate-800 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-purple-400 font-bold uppercase">{prod.brand}</span>
                        <div className="font-semibold text-white truncate">{prod.title}</div>
                      </div>
                    </td>

                    <td className="p-4 text-slate-300">
                      <span className="bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-[11px]">
                        {prod.category}
                      </span>
                    </td>

                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-950 border border-purple-500 rounded text-white text-xs font-bold"
                        />
                      ) : (
                        <span className="font-bold text-white">NPR {prod.price.toLocaleString()}</span>
                      )}
                    </td>

                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editStock}
                          onChange={(e) => setEditStock(Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-slate-950 border border-purple-500 rounded text-white text-xs font-bold"
                        />
                      ) : (
                        <span
                          className={`font-semibold ${
                            (prod.stock || 12) < 5 ? 'text-red-400 font-bold' : 'text-slate-300'
                          }`}
                        >
                          {prod.stock || 12} units
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                        Published
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => saveEdit(prod.id)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(prod)}
                            disabled={!canEdit}
                            className={`p-1.5 rounded-lg transition ${
                              canEdit
                                ? 'text-purple-400 hover:bg-slate-800'
                                : 'text-slate-600 cursor-not-allowed'
                            }`}
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${prod.title}?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            disabled={!canDelete}
                            className={`p-1.5 rounded-lg transition ${
                              canDelete
                                ? 'text-red-400 hover:bg-red-950/40'
                                : 'text-slate-600 cursor-not-allowed'
                            }`}
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Add New Component
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ASUS ROG Strix GeForce RTX 5080 16GB"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Brand</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Graphics Cards">Graphics Cards</option>
                    <option value="Processors">Processors</option>
                    <option value="Motherboards">Motherboards</option>
                    <option value="RAM">RAM</option>
                    <option value="Storage">Storage</option>
                    <option value="Laptops">Laptops</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Price (NPR)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
