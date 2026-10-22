import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useApp } from '../../context/AppContext';
import {
  Search,
  X,
  Package,
  ShoppingBag,
  Users,
  Store,
  Receipt,
  FolderTree,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface SearchResultItem {
  id: string;
  type: 'product' | 'order' | 'customer' | 'seller' | 'transaction' | 'category';
  title: string;
  subtitle: string;
  badge?: string;
  actionSubView: any;
  actionId?: string;
}

export function AdminGlobalSearchModal() {
  const { isGlobalSearchOpen, setIsGlobalSearchOpen, setAdminSubView, setSelectedAdminProductId, setSelectedAdminOrderId, expenses, revenues, settings } = useAdmin();
  const { products, orders, users, sellers, categories } = useApp();
  const [query, setQuery] = useState('');

  const searchResults = useMemo<SearchResultItem[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: SearchResultItem[] = [];

    // 1. Search Products
    products.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) {
        results.push({
          id: p.id,
          type: 'product',
          title: p.title,
          subtitle: `${p.brand} • ${settings.currencySymbol} ${p.price.toLocaleString()} • Stock: ${p.stock}`,
          badge: p.status.toUpperCase(),
          actionSubView: 'products',
          actionId: p.id,
        });
      }
    });

    // 2. Search Orders
    orders.forEach((o) => {
      if (o.id.toLowerCase().includes(q) || o.buyerName.toLowerCase().includes(q) || o.buyerEmail.toLowerCase().includes(q)) {
        results.push({
          id: o.id,
          type: 'order',
          title: `Order #${o.id.slice(-6)} — ${o.buyerName}`,
          subtitle: `${settings.currencySymbol} ${o.total.toLocaleString()} • ${o.paymentMethod} • ${new Date(o.createdAt).toLocaleDateString()}`,
          badge: o.status.toUpperCase(),
          actionSubView: 'orders',
          actionId: o.id,
        });
      }
    });

    // 3. Search Customers
    users.forEach((u) => {
      if (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) {
        results.push({
          id: u.id,
          type: 'customer',
          title: u.name,
          subtitle: `${u.email} • Role: ${u.role}`,
          badge: u.status.toUpperCase(),
          actionSubView: 'customers',
        });
      }
    });

    // 4. Search Sellers
    sellers.forEach((s) => {
      if (s.storeName.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.phone.includes(q)) {
        results.push({
          id: s.id,
          type: 'seller',
          title: s.storeName,
          subtitle: `${s.location} • Phone: ${s.phone} • Rating: ${s.rating}★`,
          badge: s.status.toUpperCase(),
          actionSubView: 'sellers',
        });
      }
    });

    // 5. Search Expenses & Revenues
    expenses.forEach((e) => {
      if (e.title.toLowerCase().includes(q) || e.vendor.toLowerCase().includes(q)) {
        results.push({
          id: e.id,
          type: 'transaction',
          title: `Expense: ${e.title}`,
          subtitle: `Vendor: ${e.vendor} • ${settings.currencySymbol} ${e.amount.toLocaleString()} • ${e.date}`,
          badge: 'EXPENSE',
          actionSubView: 'accounting',
        });
      }
    });

    // 6. Search Categories
    categories.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
        results.push({
          id: c.id,
          type: 'category',
          title: `Category: ${c.name}`,
          subtitle: c.description,
          badge: `${c.productCount} Items`,
          actionSubView: 'categories',
        });
      }
    });

    // 7. Search Modules (PC Builder, Price Tracker, Brands, Stores)
    if ('pc builder custom rig configurator compatibility'.includes(q)) {
      results.push({
        id: 'mod-pc-builder',
        type: 'product',
        title: 'PC Builder Engine & Compatibility Rules',
        subtitle: 'AM5/LGA1700 Sockets, TDP equations, rig presets',
        badge: 'MODULE',
        actionSubView: 'pc_builder',
      });
    }
    if ('price tracker mrp nepal market street rates intelligence'.includes(q)) {
      results.push({
        id: 'mod-price-tracker',
        type: 'transaction',
        title: 'Price Tracker & Nepal MRP Control',
        subtitle: 'Distributor vs Street pricing, price drop broadcast',
        badge: 'MODULE',
        actionSubView: 'price_tracker',
      });
    }
    if ('brands importers nagmani megatech ocean gennext'.includes(q)) {
      results.push({
        id: 'mod-brands',
        type: 'seller',
        title: 'Hardware Brands & Importers Directory',
        subtitle: 'OEMs, authorized Nepal distributors & service centers',
        badge: 'MODULE',
        actionSubView: 'brands',
      });
    }
    if ('stores shops physical star mall ctc mall putalisadak new road'.includes(q)) {
      results.push({
        id: 'mod-stores',
        type: 'seller',
        title: 'Physical Tech Stores & Hubs Directory',
        subtitle: 'Putalisadak, New Road, Pokhara physical outlets',
        badge: 'MODULE',
        actionSubView: 'stores',
      });
    }

    return results.slice(0, 15);
  }, [query, products, orders, users, sellers, expenses, categories, settings.currencySymbol]);

  if (!isGlobalSearchOpen) return null;

  const handleSelectResult = (item: SearchResultItem) => {
    if (item.actionSubView === 'products' && item.actionId) {
      setSelectedAdminProductId(item.actionId);
    }
    if (item.actionSubView === 'orders' && item.actionId) {
      setSelectedAdminOrderId(item.actionId);
    }
    setAdminSubView(item.actionSubView);
    setIsGlobalSearchOpen(false);
    setQuery('');
  };

  const getTypeIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'product':
        return <Package className="w-4 h-4 text-amber-400" />;
      case 'order':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'customer':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'seller':
        return <Store className="w-4 h-4 text-purple-400" />;
      case 'transaction':
        return <Receipt className="w-4 h-4 text-rose-400" />;
      case 'category':
        return <FolderTree className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#12141a] border border-amber-500/30 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3 bg-[#0d0e12]">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, customers, sellers, transactions, categories..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg hover:bg-slate-700 font-mono"
          >
            ESC
          </button>
        </div>

        {/* Search Results List */}
        <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-850 space-y-1">
          {query.trim() === '' ? (
            <div className="p-8 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-amber-400/40 mx-auto" />
              <p className="text-xs text-slate-400">
                Type anything to search across the entire NanoTech database in real-time.
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-3">
                {['RTX 4090', 'Titan Rig', 'Pending Orders', 'Sellers', 'Expenses'].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setQuery(hint)}
                    className="text-[11px] bg-slate-850 hover:bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-800 transition-colors"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No matching records found for "{query}". Try checking the spelling or keywords.
            </div>
          ) : (
            searchResults.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                onClick={() => handleSelectResult(item)}
                className="w-full p-3 rounded-2xl hover:bg-slate-850/80 transition-colors flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0 uppercase">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-[#0a0b0e] border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between px-5">
          <span>Tip: Global search scans live products, orders, and finance ledgers.</span>
          <span className="font-mono text-amber-400/80">{searchResults.length} matches</span>
        </div>
      </div>
    </div>
  );
}
