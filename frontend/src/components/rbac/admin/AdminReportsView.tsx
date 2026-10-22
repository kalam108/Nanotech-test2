import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Cpu, ArrowUpRight } from 'lucide-react';

export const AdminReportsView: React.FC = () => {
  const monthlySales = [
    { month: 'Apr', revenue: 820000 },
    { month: 'May', revenue: 950000 },
    { month: 'Jun', revenue: 1120000 },
    { month: 'Jul', revenue: 1250000 },
    { month: 'Aug', revenue: 1390000 },
    { month: 'Sep', revenue: 1485000 },
  ];

  const categoryDistribution = [
    { name: 'Graphics Cards', value: 45, color: '#8b5cf6' },
    { name: 'Processors', value: 25, color: '#06b6d4' },
    { name: 'Laptops', value: 15, color: '#3b82f6' },
    { name: 'Motherboards & RAM', value: 15, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Sales & Hardware Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Revenue performance, component sales distribution, and hardware demand trends
        </p>
      </div>

      {/* Top Stat Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-xs text-slate-400">Total H1 Revenue</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">NPR 7,015,000</div>
          <span className="text-[11px] text-emerald-300 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24.8% growth vs last semester
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-xs text-slate-400">Average Order Value (AOV)</span>
          <div className="text-2xl font-black text-purple-400 mt-1">NPR 62,400</div>
          <span className="text-[11px] text-slate-400 mt-1">Driven by custom gaming builds</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-xs text-slate-400">Top Selling Category</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">RTX & Radeon GPUs</div>
          <span className="text-[11px] text-slate-400 mt-1">45% of total revenue share</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Monthly Revenue (NPR)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                  formatter={(value: any) => [`NPR ${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Component Category Share
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: 8, fontSize: 12 }}
                  formatter={(value: any) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800 text-xs">
            {categoryDistribution.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                <span className="text-slate-300">{cat.name}: <strong className="text-white">{cat.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
