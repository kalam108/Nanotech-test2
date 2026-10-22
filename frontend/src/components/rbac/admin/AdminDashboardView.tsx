import React from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { Cpu, Package, Users, DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { navigate, currentUser } = useRBAC();

  return (
    <div className="space-y-6">
      {/* Title & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Operations Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-purple-400 font-semibold">{currentUser?.name}</span> • Hardware catalog & order fulfillment
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/products')}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-md shadow-purple-600/20"
          >
            Manage Hardware
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
          >
            View Orders Queue
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Catalog Products</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">48</div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 6 new additions this week
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Orders to Fulfill</span>
            <Package className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">14</div>
          <div className="mt-1 text-xs text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> 3 express courier pickups
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registered Customers</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">1,420</div>
          <div className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% month-over-month
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>30-Day Sales Volume</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-300">NPR 1,485,000</div>
          <div className="mt-1 text-xs text-slate-400">Verified cash & digital payments</div>
        </div>
      </div>

      {/* Quick Action Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" />
              Orders Awaiting Dispatch
            </h3>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-xs text-purple-400 hover:underline font-semibold"
            >
              Full Queue →
            </button>
          </div>

          <div className="space-y-3">
            {[
              { id: 'ORD-9021', customer: 'Sita Sharma', total: 118500, item: 'Ryzen 7 7800X3D + MSI B650', status: 'Processing' },
              { id: 'ORD-9020', customer: 'Deepak Pokhrel', total: 95000, item: 'RTX 4070 SUPER Gaming OC', status: 'Awaiting Pickup' },
              { id: 'ORD-9019', customer: 'Anjali Rai', total: 32000, item: 'Corsair 850W PSU + Lian Li Case', status: 'Processing' },
            ].map((ord) => (
              <div
                key={ord.id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white">{ord.id}</span> • {ord.customer}
                  <div className="text-slate-400 text-[11px] truncate max-w-[200px]">{ord.item}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-cyan-400">NPR {ord.total.toLocaleString()}</div>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    {ord.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Inventory Warnings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Low Stock Warnings
            </h3>
            <button
              onClick={() => navigate('/admin/products')}
              className="text-xs text-purple-400 hover:underline font-semibold"
            >
              Restock Items →
            </button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'NVIDIA GeForce RTX 4080 Super', stock: 2, threshold: 5, category: 'GPU' },
              { name: 'AMD Ryzen 9 7950X Desktop Processor', stock: 1, threshold: 4, category: 'CPU' },
              { name: 'Corsair RM1000x Shift Gold Modular PSU', stock: 3, threshold: 6, category: 'Power' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-white">{item.name}</span>
                  <div className="text-[11px] text-slate-400">Category: {item.category}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded">
                    Only {item.stock} in stock
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5">Min threshold: {item.threshold}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
