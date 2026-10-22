import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { Package, Search, Filter, CheckCircle2, Clock, Truck, XCircle } from 'lucide-react';

interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  destination: string;
  items: string;
  totalNPR: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
}

export const AdminOrdersView: React.FC = () => {
  const { hasPermission } = useRBAC();
  const [orders, setOrders] = useState<AdminOrder[]>([
    {
      id: 'ORD-9021',
      customerName: 'Sita Sharma',
      customerEmail: 'customer@nanotech.com',
      phone: '+977 9812345678',
      destination: 'National Galli, Ward-6, Itahari',
      items: 'AMD Ryzen 7 7800X3D + MSI MAG B650 (1x)',
      totalNPR: 118500,
      status: 'Processing',
      date: '2026-09-02',
    },
    {
      id: 'ORD-9022',
      customerName: 'Bikram Thapa',
      customerEmail: 'bikram.thapa@gmail.com',
      phone: '+977 9845012345',
      destination: 'Biratnagar Road, Morang',
      items: 'Corsair RM850x 850W Gold Modular Power Supply',
      totalNPR: 24500,
      status: 'Shipped',
      date: '2026-09-01',
    },
    {
      id: 'ORD-9018',
      customerName: 'Kishor Gurung',
      customerEmail: 'kishor.g@outlook.com',
      phone: '+977 9801122334',
      destination: 'Dharan-12, Chatara Line',
      items: 'Lian Li O11 Dynamic EVO RGB Case + Uni Fans (3x)',
      totalNPR: 38000,
      status: 'Pending',
      date: '2026-08-30',
    },
    {
      id: 'ORD-8742',
      customerName: 'Sita Sharma',
      customerEmail: 'customer@nanotech.com',
      phone: '+977 9812345678',
      destination: 'National Galli, Ward-6, Itahari',
      items: 'Kingston FURY Beast 32GB DDR5 6000MHz',
      totalNPR: 18500,
      status: 'Delivered',
      date: '2026-08-18',
    },
  ]);

  const [search, setSearch] = useState('');
  const canEditOrders = hasPermission('orders.edit');

  const updateStatus = (orderId: string, newStatus: AdminOrder['status']) => {
    if (!canEditOrders) return;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Orders Fulfillment Queue</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track deliveries, assign courier dispatches, and update customer order status
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Order ID or Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Components</th>
                <th className="p-4">Total (NPR)</th>
                <th className="p-4">Fulfillment Status</th>
                <th className="p-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-purple-400" />
                      {order.id}
                    </div>
                    <div className="text-[11px] text-slate-400">{order.date}</div>
                  </td>

                  <td className="p-4">
                    <div className="font-semibold text-white">{order.customerName}</div>
                    <div className="text-[11px] text-slate-400">{order.phone}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[160px]">{order.destination}</div>
                  </td>

                  <td className="p-4 text-slate-300 max-w-xs">
                    <div className="truncate">{order.items}</div>
                  </td>

                  <td className="p-4 font-black text-white">
                    NPR {order.totalNPR.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : order.status === 'Shipped'
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          : order.status === 'Processing'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <select
                      value={order.status}
                      disabled={!canEditOrders}
                      onChange={(e) => updateStatus(order.id, e.target.value as AdminOrder['status'])}
                      className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
