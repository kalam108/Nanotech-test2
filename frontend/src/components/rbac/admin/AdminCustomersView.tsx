import React, { useState } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { Users, Search, Mail, Phone, MapPin, Award, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  ordersCount: number;
  totalSpentNPR: number;
  loyaltyPoints: number;
  joinedDate: string;
  status: 'active' | 'suspended';
}

export const AdminCustomersView: React.FC = () => {
  const [customers] = useState<CustomerRecord[]>([
    {
      id: 'cust-01',
      name: 'Sita Sharma',
      email: 'customer@nanotech.com',
      phone: '+977 9812345678',
      location: 'Itahari, Sunsari',
      ordersCount: 4,
      totalSpentNPR: 182000,
      loyaltyPoints: 450,
      joinedDate: 'April 2025',
      status: 'active',
    },
    {
      id: 'cust-02',
      name: 'Bikram Thapa',
      email: 'bikram.thapa@gmail.com',
      phone: '+977 9845012345',
      location: 'Biratnagar, Morang',
      ordersCount: 3,
      totalSpentNPR: 94000,
      loyaltyPoints: 220,
      joinedDate: 'May 2025',
      status: 'active',
    },
    {
      id: 'cust-03',
      name: 'Deepak Pokhrel',
      email: 'deepak.pokhrel@yahoo.com',
      phone: '+977 9803322114',
      location: 'Dharan, Sunsari',
      ordersCount: 6,
      totalSpentNPR: 310000,
      loyaltyPoints: 890,
      joinedDate: 'February 2025',
      status: 'active',
    },
    {
      id: 'cust-04',
      name: 'Anjali Rai',
      email: 'anjali.rai@gmail.com',
      phone: '+977 9811223344',
      location: 'Damak, Jhapa',
      ordersCount: 2,
      totalSpentNPR: 52000,
      loyaltyPoints: 110,
      joinedDate: 'June 2025',
      status: 'active',
    },
  ]);

  const [search, setSearch] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customer Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered customer accounts, lifetime hardware spend, and loyalty points
          </p>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customers..."
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
                <th className="p-4">Customer Name & Contact</th>
                <th className="p-4">Location</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4">NanoTech Points</th>
                <th className="p-4">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[11px]">
                        {customer.name.charAt(0)}
                      </div>
                      {customer.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{customer.email}</div>
                    <div className="text-[10px] text-slate-500">{customer.phone}</div>
                  </td>

                  <td className="p-4 text-slate-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-400" />
                      {customer.location}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-semibold text-white">{customer.ordersCount} orders</span>
                  </td>

                  <td className="p-4 font-black text-cyan-400">
                    NPR {customer.totalSpentNPR.toLocaleString()}
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full font-bold">
                      <Award className="w-3 h-3" />
                      {customer.loyaltyPoints} Pts
                    </span>
                  </td>

                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                      <ShieldCheck className="w-3 h-3" />
                      Active
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
