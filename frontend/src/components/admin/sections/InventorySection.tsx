import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import { Product } from '../../../types';
import { exportAdminProductsToExcel } from '../../../lib/excelAdmin';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Plus,
  Minus,
  RefreshCw,
  Sliders,
  DollarSign,
} from 'lucide-react';

export function InventorySection() {
  const { logAdminAction, settings } = useAdmin();
  const { products, updateProduct, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'healthy'>('all');
  const [restockQuantities, setRestockQuantities] = useState<Record<string, number>>({});

  // Inventory stats
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalInventoryValuation = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 5).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;
  const healthyStockCount = products.filter((p) => p.stock >= 5).length;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStock =
        stockFilter === 'all'
          ? true
          : stockFilter === 'out'
          ? p.stock <= 0
          : stockFilter === 'low'
          ? p.stock > 0 && p.stock < 5
          : p.stock >= 5;

      return matchesSearch && matchesStock;
    });
  }, [products, searchQuery, stockFilter]);

  const handleAdjust = (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    updateProduct(p.id, {
      stock: newStock,
      status: newStock === 0 ? 'out_of_stock' : p.status === 'out_of_stock' ? 'published' : p.status,
    });
    logAdminAction('Stock Adjusted', 'inventory', `Adjusted ${p.title} stock to ${newStock} units`, p.id, p.title);
  };

  const handleApplyRestock = (p: Product) => {
    const qty = restockQuantities[p.id] || 0;
    if (qty <= 0) return;
    const newStock = p.stock + qty;
    updateProduct(p.id, {
      stock: newStock,
      status: 'published',
    });
    logAdminAction('Restocked Inventory', 'inventory', `Added +${qty} units to ${p.title} (New Total: ${newStock})`, p.id, p.title);
    addToast('success', `Restocked +${qty} units for "${p.title}"`);
    setRestockQuantities((prev) => ({ ...prev, [p.id]: 0 }));
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141a] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Boxes className="w-5 h-5 text-amber-400" />
            Inventory Stock &amp; Warehouse Control
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time buffer units, low-stock threshold triggers, and warehouse replenishment.
          </p>
        </div>

        <button
          onClick={() => exportAdminProductsToExcel(products, settings.currencySymbol)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Stock Sheet (XLSX)</span>
        </button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            Total Inventory Units
          </span>
          <div className="text-2xl font-black text-white font-mono">
            {totalStockUnits.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">{products.length} catalog items</span>
        </div>

        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            Warehouse Valuation
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono truncate">
            {settings.currencySymbol} {totalInventoryValuation.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Asset replacement value</span>
        </div>

        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            Low Stock (&lt; 5 Units)
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono flex items-center gap-2">
            <span>{lowStockCount}</span>
            {lowStockCount > 0 && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          </div>
          <span className="text-[11px] text-slate-500">Replenishment needed</span>
        </div>

        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-4 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            Out of Stock (0 Units)
          </span>
          <div className="text-2xl font-black text-rose-400 font-mono flex items-center gap-2">
            <span>{outOfStockCount}</span>
            {outOfStockCount > 0 && <XCircle className="w-4 h-4 text-rose-400" />}
          </div>
          <span className="text-[11px] text-slate-500">Listing paused on front</span>
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
            placeholder="Search warehouse inventory..."
            className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#0a0b0e] border border-slate-800 rounded-xl p-1 text-xs">
          {(['all', 'healthy', 'low', 'out'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStockFilter(st)}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all capitalize ${
                stockFilter === st ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              {st === 'healthy' ? 'In Stock' : st === 'low' ? 'Low Stock' : st === 'out' ? 'Out of Stock' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#12141a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0e1015] text-[11px] font-bold text-slate-400 uppercase font-mono">
                <th className="py-3.5 px-4">Hardware Item</th>
                <th className="py-3.5 px-3">Unit Price</th>
                <th className="py-3.5 px-3">Total Value</th>
                <th className="py-3.5 px-3">Stock Units</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Quick Replenish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
              {filteredProducts.map((p) => {
                const isLow = p.stock > 0 && p.stock < 5;
                const isOut = p.stock <= 0;
                const addQty = restockQuantities[p.id] || 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
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
                        <div>
                          <span className="font-bold text-white block">{p.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {p.category} • {p.brand}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-white">
                      {settings.currencySymbol} {p.price.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-amber-400 font-bold">
                      {settings.currencySymbol} {(p.price * p.stock).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAdjust(p, -1)}
                          className="w-5 h-5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-mono"
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
                          onClick={() => handleAdjust(p, 1)}
                          className="w-5 h-5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-mono"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isOut
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : isLow
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          min={1}
                          placeholder="+Qty"
                          value={addQty > 0 ? addQty : ''}
                          onChange={(e) =>
                            setRestockQuantities((prev) => ({
                              ...prev,
                              [p.id]: Math.max(0, parseInt(e.target.value, 10) || 0),
                            }))
                          }
                          className="w-16 bg-[#0a0b0e] border border-slate-800 rounded-lg px-2 py-1 text-xs text-white text-center font-mono focus:outline-none focus:border-amber-500/60"
                        />
                        <button
                          onClick={() => handleApplyRestock(p)}
                          disabled={addQty <= 0}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-black transition-all"
                        >
                          Add
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
}
