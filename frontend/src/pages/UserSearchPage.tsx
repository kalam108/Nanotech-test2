import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useRBAC } from '../context/RBACContext';
import { ProductGrid } from '../components/products/ProductGrid';
import { Search, ArrowLeft, SlidersHorizontal, Sparkles, Tag, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { LiveDashboardHubModal } from '../components/common/LiveDashboardHubModal';

export function UserSearchPage() {
  const { filters, setFilters, products, resetFilters, openDashboardHub, isDashboardHubOpen, closeDashboardHub } = useApp();
  const { navigate: rbacNavigate } = useRBAC();

  // Read search query parameter from URL on mount and popstate
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q');
      const cat = urlParams.get('category');
      if (query !== null) {
        setFilters(prev => ({ ...prev, searchQuery: query }));
      }
      if (cat !== null) {
        setFilters(prev => ({ ...prev, category: cat }));
      }
    }
  }, [setFilters]);

  // Sync URL search param as query changes
  const handleQueryChange = (val: string) => {
    setFilters(prev => ({ ...prev, searchQuery: val }));
    if (typeof window !== 'undefined') {
      const currentUrl = new URL(window.location.href);
      if (val.trim()) {
        currentUrl.searchParams.set('q', val);
      } else {
        currentUrl.searchParams.delete('q');
      }
      window.history.replaceState({}, '', currentUrl.pathname + currentUrl.search);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/40 py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => rbacNavigate('/')}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                title="Back to Home Storefront"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Storefront</span>
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    Dedicated URL: /search
                  </span>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    {window.location.origin}/search
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-400" />
                  User Search Portal
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={openDashboardHub}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 text-amber-300 border border-amber-400/40 font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                title="View live dashboards and switch active console"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Live Dashboards</span>
              </button>

              <button
                onClick={() => rbacNavigate('/admin')}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Switch to Admin URL (/admin)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Switch to Admin Portal (/admin)
              </button>
            </div>
          </div>

          {/* Interactive Search Bar Input for User Search URL */}
          <div className="max-w-3xl">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder="Search GPUs, CPUs, Motherboards, RAM, Laptops, Cabinets, Peripherals..."
                className="w-full bg-white text-slate-900 placeholder-slate-400 pl-11 pr-24 py-3 rounded-2xl text-sm font-medium shadow-lg border border-slate-200 focus:outline-none focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-600 transition-all"
                autoFocus
              />
              {filters.searchQuery && (
                <button
                  onClick={() => handleQueryChange('')}
                  className="absolute right-3 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick search suggestions */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs text-slate-300">
              <span className="text-slate-400 text-[11px] font-semibold">Popular Searches:</span>
              {['RTX 4080', 'Ryzen 7', 'Mechanical Keyboard', 'OLED Monitor', 'DDR5 32GB', 'Gaming Laptop', 'Corsair PSU'].map(term => (
                <button
                  key={term}
                  onClick={() => handleQueryChange(term)}
                  className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Search Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <ProductGrid />
      </div>

      <LiveDashboardHubModal
        isOpen={isDashboardHubOpen}
        onClose={closeDashboardHub}
      />
    </div>
  );
}
