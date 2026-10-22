import React from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { Package, Truck, CheckCircle2, Clock, ShieldCheck, MapPin } from 'lucide-react';

export const CustomerOrdersView: React.FC = () => {
  const { currentUser, navigate } = useRBAC();

  const orders = [
    {
      id: 'ORD-9021',
      date: 'September 2, 2026',
      status: 'Processing',
      items: [
        { name: 'AMD Ryzen 7 7800X3D Desktop Processor (8-Core, 16-Thread)', price: 68500, qty: 1 },
        { name: 'MSI MAG B650 TOMAHAWK WIFI Motherboard', price: 50000, qty: 1 },
      ],
      totalNPR: 118500,
      courier: 'AirCargo Nepal / Express Itahari',
      trackingNumber: 'NT-EXP-9021-NP',
      destination: 'Itahari-6, Sunsari, Koshi Province',
    },
    {
      id: 'ORD-8742',
      date: 'August 18, 2026',
      status: 'Delivered',
      items: [
        { name: 'Kingston FURY Beast 32GB (2x16GB) DDR5 6000MHz CL30 AMD EXPO', price: 18500, qty: 1 },
      ],
      totalNPR: 18500,
      courier: 'Nepal Can Move',
      trackingNumber: 'NCM-8742-NP',
      destination: 'Biratnagar Road, Morang',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Order History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track hardware shipments and view past receipts
          </p>
        </div>
        <button
          onClick={() => navigate('/customer/products')}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition"
        >
          Browse More
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg"
          >
            {/* Order Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{order.id}</div>
                  <div className="text-xs text-slate-400">Ordered on {order.date}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {order.status === 'Delivered' ? '✓ Delivered' : '⏳ In Fulfillment'}
                </span>
                <span className="text-base font-black text-cyan-400">
                  NPR {order.totalNPR.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-300">
                    <strong className="text-white">{it.qty}x</strong> {it.name}
                  </span>
                  <span className="font-semibold text-slate-400">
                    NPR {it.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Courier Tracking */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Courier: <strong className="text-slate-200">{order.courier}</strong></span>
                <span className="text-slate-600">|</span>
                <span>Tracking: <code className="text-cyan-300 font-mono text-[11px]">{order.trackingNumber}</code></span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{order.destination}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
