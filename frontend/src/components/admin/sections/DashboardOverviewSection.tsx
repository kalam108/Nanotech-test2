import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Calendar,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Headphones,
  Watch,
  Speaker,
  Mouse,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function DashboardOverviewSection() {
  const { setAdminSubView, setSelectedAdminOrderId, settings } = useAdmin();
  const { orders, products } = useApp();

  const [revenueTimeframe, setRevenueTimeframe] = useState<'This Week' | 'This Month' | 'This Year'>('This Month');
  const [salesTimeframe, setSalesTimeframe] = useState<'This Week' | 'This Month' | 'This Year'>('This Month');

  // Revenue chart data matching the mockup line curve
  const revenueChartData = [
    { day: 'Aug 1', revenue: 190000 },
    { day: 'Aug 2', revenue: 140000 },
    { day: 'Aug 3', revenue: 160000 },
    { day: 'Aug 4', revenue: 290000 },
    { day: 'Aug 5', revenue: 340000 },
    { day: 'Aug 6', revenue: 320000 },
    { day: 'Aug 7', revenue: 280000 },
    { day: 'Aug 8', revenue: 260000 },
    { day: 'Aug 9', revenue: 310000 },
    { day: 'Aug 10', revenue: 420000 },
    { day: 'Aug 11', revenue: 390000 },
    { day: 'Aug 12', revenue: 350000 },
    { day: 'Aug 13', revenue: 420000 },
    { day: 'Aug 14', revenue: 250000 },
  ];

  // Sales by Category data matching the mockup donut chart
  const categoryData = [
    { name: 'Electronics', value: 35, color: '#FDD835' }, // Yellow
    { name: 'Accessories', value: 25, color: '#9333EA' }, // Purple
    { name: 'Clothing', value: 20, color: '#FB923C' },    // Orange
    { name: 'Home & Living', value: 15, color: '#60A5FA' }, // Blue
    { name: 'Others', value: 5, color: '#34D399' },        // Green
  ];

  // Mock Orders matching the exact items in mockup image
  const recentOrders = [
    { id: 'ORD-001458', customer: 'John Doe', status: 'Completed', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-500' },
    { id: 'ORD-001457', customer: 'Jane Smith', status: 'Processing', statusColor: 'bg-blue-50 text-blue-700 border-blue-500' },
    { id: 'ORD-001456', customer: 'Robert Brown', status: 'Pending', statusColor: 'bg-amber-50 text-amber-700 border-amber-500' },
    { id: 'ORD-001455', customer: 'Emily Davis', status: 'Completed', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-500' },
  ];

  // Top Selling Products matching mockup image
  const topSellingProducts = [
    {
      name: 'Wireless Headphones',
      price: 'Rs. 2,499',
      sold: '256 Sold',
      icon: Headphones,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Smart Watch',
      price: 'Rs. 3,999',
      sold: '189 Sold',
      icon: Watch,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Bluetooth Speaker',
      price: 'Rs. 1,999',
      sold: '156 Sold',
      icon: Speaker,
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=120&auto=format&fit=crop&q=80',
    },
    {
      name: 'Gaming Mouse',
      price: 'Rs. 1,299',
      sold: '134 Sold',
      icon: Mouse,
      imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=120&auto=format&fit=crop&q=80',
    },
  ];

  // Recent Transactions matching mockup image
  const recentTransactions = [
    {
      title: 'Payment from John Doe',
      date: 'Aug 14, 2026',
      amount: '+ Rs. 2,560',
      type: 'income',
    },
    {
      title: 'Payment to Supplier',
      date: 'Aug 14, 2026',
      amount: '- Rs. 15,000',
      type: 'expense',
    },
    {
      title: 'Payment from Jane Smith',
      date: 'Aug 13, 2026',
      amount: '+ Rs. 1,299',
      type: 'income',
    },
    {
      title: 'Marketing Expense',
      date: 'Aug 13, 2026',
      amount: '- Rs. 5,000',
      type: 'expense',
    },
  ];

  return (
    <div className="space-y-5 select-none font-sans">
      {/* Top Header: Title, Breadcrumb & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-0.5">
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => setAdminSubView('dashboard')}>
              Home
            </span>
            <span>&gt;</span>
            <span className="text-slate-800 font-bold">Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-white/70 px-3.5 py-1.5 rounded-full border border-amber-300/60 shadow-xs self-start sm:self-auto">
          <span>Today :</span>
          <span className="font-extrabold text-slate-900">Aug 14, 2026</span>
          <Calendar className="w-3.5 h-3.5 text-slate-600 ml-1" />
        </div>
      </div>

      {/* Row 1: 5 KPI Cards (Exact User Card Spec: Glass-transparent, rounded-2xl, crisp typography) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Revenue */}
        <div className="admin-metric-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total Revenue
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            Rs. 1,250,000
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>12.5% from last month</span>
          </p>
        </div>

        {/* 2. Total Orders */}
        <div className="admin-metric-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total Orders
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            1,458
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>8.3% from last month</span>
          </p>
        </div>

        {/* 3. Total Customers */}
        <div className="admin-metric-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Total Customers
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            3,254
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>15.7% from last month</span>
          </p>
        </div>

        {/* 4. Total Products */}
        <div className="admin-metric-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Catalog Hardware
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">
            456
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>28 categories live</span>
          </p>
        </div>

        {/* 5. Net Profit */}
        <div className="admin-metric-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block truncate">
            Net Profit (Fiscal YTD)
          </span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">
            Rs. 320,000
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Revenues minus expenses
          </p>
        </div>
      </div>

      {/* Row 2: 2 Charts (Revenue Overview & Sales by Category) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Revenue Overview (2 Cols) */}
        <div className="lg:col-span-2 admin-card-glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Revenue Overview</h2>
            <div className="relative">
              <select
                value={revenueTimeframe}
                onChange={(e) => setRevenueTimeframe(e.target.value as any)}
                className="bg-slate-50/80 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
              >
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </select>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="yellowAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FDD835" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FDD835" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `Rs. ${v >= 1000 ? `${v / 1000}K` : v}`}
                />
                <Tooltip
                  formatter={(val: number) => [`Rs. ${val.toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#fef08a',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#FDD835"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#yellowAreaGradient)"
                  dot={{ r: 4, fill: '#FDD835', stroke: '#ffffff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#EAB308', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Sales by Category Donut Chart */}
        <div className="admin-card-glass p-6 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Sales by Category</h2>
            <select
              value={salesTimeframe}
              onChange={(e) => setSalesTimeframe(e.target.value as any)}
              className="bg-slate-50/80 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            >
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
            {/* Donut graphic */}
            <div className="h-44 w-44 relative shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Legend list */}
            <div className="space-y-1.5 text-xs w-full sm:w-auto">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-700 font-medium text-[11px]">{cat.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 text-[11px]">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: 3 Column List Cards (Recent Orders, Top Selling Products, Recent Transactions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card 1: Recent Orders */}
        <div className="admin-card-glass p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Orders</h2>
            <button
              onClick={() => setAdminSubView('orders')}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {recentOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => {
                  setSelectedAdminOrderId(ord.id);
                  setAdminSubView('orders');
                }}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 border border-slate-100/90 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 font-mono">#{ord.id}</div>
                    <div className="text-[11px] text-slate-500">{ord.customer}</div>
                  </div>
                </div>

                <div
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border-l-3 ${ord.statusColor}`}
                >
                  {ord.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Top Selling Products */}
        <div className="admin-card-glass p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Top Selling Products</h2>
            <button
              onClick={() => setAdminSubView('products')}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {topSellingProducts.map((prod, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50/80 border border-slate-100/90 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{prod.name}</div>
                    <div className="text-[11px] font-extrabold text-slate-800">{prod.price}</div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  {prod.sold}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Recent Transactions */}
        <div className="admin-card-glass p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
            <button
              onClick={() => setAdminSubView('accounting')}
              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.map((tx, idx) => {
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50/80 border border-slate-100/90 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{tx.title}</div>
                      <div className="text-[10px] text-slate-400">{tx.date}</div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-extrabold ${
                      isIncome ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {tx.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 4: Budget Overview Card (Full Width) */}
      <div className="admin-card-glass p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Budget Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Monthly Budget */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Monthly Budget</span>
              <span className="font-bold text-slate-900">50%</span>
            </div>
            <div className="text-xs font-extrabold text-slate-900">
              Rs. 250,000 <span className="text-slate-400 font-normal">/ Rs. 500,000</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#FDD835] h-full rounded-full w-1/2" />
            </div>
          </div>

          {/* Yearly Budget */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold">Yearly Budget</span>
              <span className="font-bold text-slate-900">50%</span>
            </div>
            <div className="text-xs font-extrabold text-slate-900">
              Rs. 2,500,000 <span className="text-slate-400 font-normal">/ Rs. 5,000,000</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-[#FDD835] h-full rounded-full w-1/2" />
            </div>
          </div>

          {/* Remaining Budget Summary */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50/60 border border-purple-100">
            <div>
              <div className="text-[11px] text-slate-500 font-semibold">Remaining Budget</div>
              <div className="text-lg font-black text-slate-900">Rs. 2,500,000</div>
              <div className="text-[10px] font-bold text-purple-700">50% Remaining</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
