import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Cpu, Search, Plus, Trash2, Edit2, ShieldAlert, Check, X, ArrowUpRight } from 'lucide-react';

export const SuperadminProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New hardware
  const [newTitle, setNewTitle] = useState('');
  const [newBrand, setNewBrand] = useState('NVIDIA');
  const [newCategory, setNewCategory] = useState('Graphics Cards');
  const [newPrice, setNewPrice] = useState(145000);
  const [newStock, setNewStock] = useState(5);

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditPrice(p.price);
    setEditStock(p.stock || 10);
  };

  const saveEdit = (id: string) => {
    updateProduct(id, { price: editPrice, stock: editStock });
    setEditingId(null);
  };

  const handleAdd = (e: React.FormEvent) => {
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
      description: 'Superadmin master entry: Hardware catalog verified by Kalam.',
    });

    setIsAddOpen(false);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Global Product Inventory Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Superadmin override: Unlimited catalog modifications and pricing management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            Add Hardware
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-4">Component Title</th>
                <th className="p-4">Brand / Category</th>
                <th className="p-4">MSRP (NPR)</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Master Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((prod) => {
                const isEditing = editingId === prod.id;
                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 flex items-center gap-3 max-w-sm">
                      <img
                        src={prod.images?.[0] || 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=80&q=80'}
                        alt={prod.title}
                        className="w-10 h-10 object-contain rounded-lg bg-slate-950 p-1 border border-slate-800 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="truncate font-semibold text-white">{prod.title}</div>
                    </td>

                    <td className="p-4 text-slate-300">
                      <span className="text-amber-400 font-bold mr-2">{prod.brand}</span>
                      <span className="text-slate-400 text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {prod.category}
                      </span>
                    </td>

                    <td className="p-4">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-slate-950 border border-amber-500 rounded text-white text-xs font-bold"
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
                          className="w-16 px-2 py-1 bg-slate-950 border border-amber-500 rounded text-white text-xs font-bold"
                        />
                      ) : (
                        <span className="text-slate-300 font-semibold">{prod.stock || 10} units</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => saveEdit(prod.id)}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-800 text-slate-300 rounded-lg"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(prod)}
                            className="p-1.5 text-amber-400 hover:bg-slate-800 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Permanently delete ${prod.title}?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 text-red-400 hover:bg-red-950/40 rounded-lg"
                            title="Delete"
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

      {isAddOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              Add Hardware (Superadmin Root)
            </h3>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Intel Core i9-14900K Desktop Processor"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="Processors">Processors</option>
                    <option value="Graphics Cards">Graphics Cards</option>
                    <option value="Motherboards">Motherboards</option>
                    <option value="RAM">RAM</option>
                    <option value="Storage">Storage</option>
                    <option value="Laptops">Laptops</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price (NPR)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock</label>
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
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg"
                >
                  Authorize & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
