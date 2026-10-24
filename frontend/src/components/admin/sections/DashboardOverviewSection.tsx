'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { supabase } from '../../../lib/supabase';
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardData {
  ordersToday: number;
  salesTodayNPR: number;
  lowStockCount: number;
  pendingOrdersCount: number;
  salesLast7Days: { date: string; day: string; sales: number }[];
  tasks: {
    paymentsToVerify: number;
    productsRunningLow: number;
    ordersPendingOver2Days: number;
  };
  recentOrders: {
    id: string;
    customerName: string;
    customerEmail?: string;
    amount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }[];
}

export function DashboardOverviewSection() {
  const { setAdminSubView, setSelectedAdminOrderId } = useAdmin();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || localStorage.getItem('nanotech_session_token') || '';

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/admin/dashboard', { headers });
      if (!res.ok) {
        throw new Error(`Failed to fetch dashboard data (${res.status})`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.warn('Dashboard fetch error:', err);
      // Fallback zeroed structure (strict rule: no fake/sample numbers)
      setData({
        ordersToday: 0,
        salesTodayNPR: 0,
        lowStockCount: 0,
        pendingOrdersCount: 0,
        salesLast7Days: [
          { day: 'Day 1', date: '', sales: 0 },
          { day: 'Day 2', date: '', sales: 0 },
          { day: 'Day 3', date: '', sales: 0 },
          { day: 'Day 4', date: '', sales: 0 },
          { day: 'Day 5', date: '', sales: 0 },
          { day: 'Day 6', date: '', sales: 0 },
          { day: 'Today', date: '', sales: 0 },
        ],
        tasks: {
          paymentsToVerify: 0,
          productsRunningLow: 0,
          ordersPendingOver2Days: 0,
        },
        recentOrders: [],
      });
      setError(err?.message || 'Could not connect to dashboard API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered' || s === 'completed') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Delivered
        </span>
      );
    }
    if (s === 'processing' || s === 'shipped') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </span>
      );
    }
    if (s === 'cancelled') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Cancelled
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Pending
      </span>
    );
  };

  return (
    <div className="space-y-6 font-poppins animate-in fade-in duration-150">
      {/* Header bar with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time store operations, inventory status, and pending fulfillment tasks.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          title="Refresh dashboard metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#0F766E] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 1. 4 METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Orders Today */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Orders Today</span>
            <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">
            {loading ? '...' : (data?.ordersToday ?? 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Received today
          </div>
        </div>

        {/* Card 2: Sales Today in NPR (paid orders only) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Sales Today (NPR)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-700">
            {loading ? '...' : `Rs. ${(data?.salesTodayNPR ?? 0).toLocaleString()}`}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Paid orders only
          </div>
        </div>

        {/* Card 3: Low Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Low Stock</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-600">
            {loading ? '...' : (data?.lowStockCount ?? 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Stock ≤ low stock threshold
          </div>
        </div>

        {/* Card 4: Pending Orders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Orders</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-amber-700">
            {loading ? '...' : (data?.pendingOrdersCount ?? 0)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Awaiting processing
          </div>
        </div>
      </div>

      {/* 2. GRID: SALES OF LAST 7 DAYS (BAR CHART) + "YOUR TASKS" BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Sales of last 7 days (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">
                  Sales of Last 7 Days (NPR)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Daily revenue generated from fulfilled & paid orders.
                </p>
              </div>
            </div>

            <div className="h-64 mt-4 w-full">
              {loading ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading chart...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.salesLast7Days || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748B', fontSize: 11 }}
                      tickFormatter={(v) => `Rs. ${v >= 1000 ? `${v / 1000}k` : v}`}
                    />
                    <Tooltip
                      formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`, 'Paid Sales']}
                      labelFormatter={(label) => `Day: ${label}`}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="#0F766E"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* "Your Tasks" Box (1 Column) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                Your Tasks
              </h2>
              <span className="text-[10px] font-bold text-[#0F766E] bg-[#0F766E]/10 px-2 py-0.5 rounded-full">
                Action Required
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Row 1: Payments to verify */}
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900">
                    Payments to verify
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {data?.tasks.paymentsToVerify ?? 0} pending payment confirmations
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminSubView('orders')}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[#0F766E] text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-2xs"
                >
                  Review Orders
                </button>
              </div>

              {/* Row 2: Products running low */}
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900">
                    Products running low
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {data?.tasks.productsRunningLow ?? 0} items at or below threshold
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminSubView('products')}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[#0F766E] text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-2xs"
                >
                  View Inventory
                </button>
              </div>

              {/* Row 3: Orders pending > 2 days */}
              <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900">
                    Orders pending &gt; 2 days
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {data?.tasks.ordersPendingOver2Days ?? 0} delayed dispatches
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminSubView('orders')}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[#0F766E] text-xs font-bold shrink-0 transition-colors cursor-pointer shadow-2xs"
                >
                  Check Pending
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Completing tasks keeps store fulfillment speed optimal.
          </div>
        </div>
      </div>

      {/* 3. RECENT ORDERS TABLE (LAST 5 ORDERS) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Recent Orders</h2>
            <p className="text-[11px] text-slate-500">
              Last 5 orders placed across the store.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAdminSubView('orders')}
            className="text-xs text-[#0F766E] hover:text-[#0b5c56] font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Loading recent orders...
                  </td>
                </tr>
              ) : !data?.recentOrders || data.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No data yet
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      {order.customerEmail && (
                        <div className="text-[11px] text-slate-400 font-mono">
                          {order.customerEmail}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      Rs. {order.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAdminOrderId(order.id);
                          setAdminSubView('orders');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0F766E] hover:text-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="View Order Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
