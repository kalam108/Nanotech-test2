import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Globe2,
  Smartphone,
  Laptop,
  Users,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4'];

export function AnalyticsSection() {
  const { totalRevenueAmount, totalExpenseAmount, netProfitAmount, settings } = useAdmin();
  const { products, orders } = useApp();
  const [metricMode, setMetricMode] = useState<'revenue' | 'volume' | 'profit'>('revenue');

  // Multi-Month Financial Growth Data
  const monthlyGrowthData = [
    { month: 'Jan', revenue: 950000, profit: 320000, orders: 42 },
    { month: 'Feb', revenue: 1100000, profit: 390000, orders: 55 },
    { month: 'Mar', revenue: 1450000, profit: 510000, orders: 68 },
    { month: 'Apr', revenue: 1800000, profit: 640000, orders: 84 },
    { month: 'May', revenue: 2250000, profit: 820000, orders: 112 },
    { month: 'Jun', revenue: 2750000, profit: 990000, orders: 138 },
    { month: 'Jul', revenue: 3100000, profit: 1150000, orders: 156 },
    { month: 'Aug', revenue: totalRevenueAmount, profit: netProfitAmount, orders: orders.length + 120 },
  ];

  // Top Hardware Products by Sales
  const topHardwarePerformance = [
    { name: 'Nanotech Titan RTX 4090 Rig', sales: 18, revenue: 8280000, growth: '+24%' },
    { name: 'Custom Hardline Dual Loop', sales: 12, revenue: 5400000, growth: '+18%' },
    { name: 'ASUS ROG Strix RTX 4080 Super', sales: 24, revenue: 4080000, growth: '+32%' },
    { name: 'AMD Ryzen 9 7950X3D Processor', sales: 30, revenue: 2550000, growth: '+15%' },
    { name: 'Corsair Dominator 64GB DDR5', sales: 45, revenue: 1800000, growth: '+40%' },
  ];

  // Geographic Sales Distribution (Nepal)
  const regionalSalesData = [
    { region: 'Kathmandu Valley', value: 58, revenue: 'Rs. 4.2M' },
    { region: 'Pokhara & Gandaki', value: 18, revenue: 'Rs. 1.3M' },
    { region: 'Lalitpur & Bhaktapur', value: 12, revenue: 'Rs. 890K' },
    { region: 'Biratnagar & East', value: 7, revenue: 'Rs. 520K' },
    { region: 'Chitwan & Narayangarh', value: 5, revenue: 'Rs. 380K' },
  ];

  // Device Platforms Traffic
  const platformTraffic = [
    { name: 'Desktop Workstations', value: 62 },
    { name: 'Mobile Devices', value: 32 },
    { name: 'Tablets / iPad', value: 6 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141a] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Graphical Analytics & Intelligence Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Deep fiscal visualizations, cohort growth, component market share, and regional telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Print Analytics Deck</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Metric Trend Chart */}
      <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">
              2026 Fiscal Year Trajectory & Order Volume
            </h3>
            <p className="text-[11px] text-slate-400">Monthly compounded performance comparison</p>
          </div>

          <div className="flex items-center gap-1 bg-[#0a0b0e] border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setMetricMode('revenue')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                metricMode === 'revenue' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              Revenue & Profit
            </button>
            <button
              onClick={() => setMetricMode('volume')}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all ${
                metricMode === 'volume' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400'
              }`}
            >
              Orders Volume
            </button>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {metricMode === 'revenue' ? (
              <AreaChart data={monthlyGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2430" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0b0e',
                    borderColor: '#f59e0b',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${settings.currencySymbol} ${val.toLocaleString()}`, '']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fill="url(#areaRev)"
                  name="Gross Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#areaProf)"
                  name="Net Profit"
                />
              </AreaChart>
            ) : (
              <BarChart data={monthlyGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2430" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a0b0e',
                    borderColor: '#3b82f6',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Orders Count" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Column: Top Hardware Leaderboard & Regional / Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Hardware Items Table */}
        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">
                Top Selling Hardware Rigs & Parts
              </h3>
              <p className="text-[11px] text-slate-400">Ranked by gross sales volume and revenue</p>
            </div>
            <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full font-bold">
              Q3 2026
            </span>
          </div>

          <div className="space-y-3">
            {topHardwarePerformance.map((item, idx) => (
              <div
                key={item.name}
                className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0 font-mono">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {item.sales} Units Sold • {settings.currencySymbol} {item.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg shrink-0">
                  {item.growth}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Nepal Delivery Footprint */}
        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">
                Nationwide Geographic Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Express delivery fulfillment destinations</p>
            </div>
            <Globe2 className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="space-y-3">
            {regionalSalesData.map((reg, idx) => (
              <div key={reg.region} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="font-semibold text-white">{reg.region}</span>
                  <span className="font-mono text-amber-400 font-bold">{reg.value}% ({reg.revenue})</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${reg.value}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
