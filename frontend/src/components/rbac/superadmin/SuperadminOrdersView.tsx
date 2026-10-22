import React, { useState } from 'react';
import { PackageCheck, Search, DollarSign, Download, Filter } from 'lucide-react';

export const SuperadminOrdersView: React.FC = () => {
  const [orders] = useState([
    { id: 'ORD-9021', customer: 'Sita Sharma', total: 118500, status: 'Processing', date: '2026-09-02', payment: 'Khalti Digital Wallet', courier: 'AirCargo Nepal' },
    { id: 'ORD-9022', customer: 'Bikram Thapa', total: 24500, status: 'Shipped', date: '2026-09-01', payment: 'eSewa Pay', courier: 'Nepal Can Move' },
    { id: 'ORD-9020', customer: 'Deepak Pokhrel', total: 95000, status: 'Processing', date: '2026-08-31', payment: 'Bank Wire (Nabil)', courier: 'Express Courier' },
    { id: 'ORD-9018', customer: 'Kishor Gurung', total: 38000, status: 'Delivered', date: '2026-08-30', payment: 'Cash On Delivery', courier: 'Local Messenger' },
    { id: 'ORD-8742', customer: 'Sita Sharma', total: 18500, status: 'Delivered', date: '2026-08-18', payment: 'ConnectIPS', courier: 'Nepal Can Move' },
  ]);

  const [search, setSearch] = useState('');

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.payment.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Master Orders & Financial Audit</h1>
          <p className="text-xs text-slate-400 mt-1">
            Superadmin transaction log, payment settlement auditing, and fulfillment oversight
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search orders, payment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={() => alert('Exporting fiscal audit CSV for Kalam...')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 shrink-0"
          >
            <Download className="w-4 h-4" />
            Export Audit CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-4">Transaction / Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Gross Revenue</th>
                <th className="p-4">Courier Service</th>
                <th className="p-4 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <PackageCheck className="w-3.5 h-3.5 text-amber-400" />
                      {ord.id}
                    </div>
                    <div className="text-[11px] text-slate-400">{ord.date}</div>
                  </td>

                  <td className="p-4 font-medium text-white">{ord.customer}</td>

                  <td className="p-4 text-slate-300">
                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px] font-mono">
                      {ord.payment}
                    </span>
                  </td>

                  <td className="p-4 font-black text-emerald-400">
                    NPR {ord.total.toLocaleString()}
                  </td>

                  <td className="p-4 text-slate-300">{ord.courier}</td>

                  <td className="p-4 text-right">
                    <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      Settled & Verified
                    </span>
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
