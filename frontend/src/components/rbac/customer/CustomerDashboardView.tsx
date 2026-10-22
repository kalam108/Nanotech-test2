import React from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { ShoppingCart, Package, Sparkles, ArrowRight, Clock, ShieldCheck, Heart, Award } from 'lucide-react';

export const CustomerDashboardView: React.FC = () => {
  const { currentUser, navigate } = useRBAC();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-blue-800/40 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs px-2.5 py-1 rounded-full font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            NanoTech Verified Customer
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, {currentUser?.name || 'Customer'}!
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Browse genuine computer hardware, track your custom PC orders, manage your delivery address, and redeem loyalty points on all purchases.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/customer/products')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/30 transition"
            >
              Browse Hardware Catalog
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/customer/orders')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition"
            >
              Track Active Orders
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Orders Placed</span>
            <Package className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">4</div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 1 in transit
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Items in Cart</span>
            <ShoppingCart className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">2 Items</div>
          <button
            onClick={() => navigate('/customer/cart')}
            className="mt-1 text-xs text-cyan-400 hover:underline flex items-center gap-1"
          >
            Review Cart →
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>NanoTech Points</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-300">450 Pts</div>
          <div className="mt-1 text-xs text-slate-400">Worth NPR 450 discount</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Hardware Warranty</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-300">3 Years</div>
          <div className="mt-1 text-xs text-slate-400">Official Nepal Warranty</div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Recent Orders
          </h2>
          <button
            onClick={() => navigate('/customer/orders')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
          >
            View All ({'>'})
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          <div className="py-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-white text-sm">#ORD-9021 — AMD Ryzen 7 7800X3D + MSI B650</div>
              <div className="text-xs text-slate-400">Placed on Sep 2, 2026 • Delivery: Itahari, Ward-6</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white">NPR 118,500</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                Processing
              </span>
            </div>
          </div>

          <div className="py-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-white text-sm">#ORD-8742 — Kingston FURY Beast 32GB DDR5 6000MHz</div>
              <div className="text-xs text-slate-400">Placed on Aug 18, 2026 • Delivered via Express Courier</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white">NPR 18,500</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                Delivered
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
