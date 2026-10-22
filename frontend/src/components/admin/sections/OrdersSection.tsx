import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import { Order } from '../../../types';
import { exportAdminOrdersToExcel } from '../../../lib/excelAdmin';
import {
  ShoppingBag,
  Search,
  FileSpreadsheet,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  X,
  Printer,
  Calendar,
  CreditCard,
  MapPin,
  User as UserIcon,
} from 'lucide-react';

export function OrdersSection() {
  const {
    selectedAdminOrderId,
    setSelectedAdminOrderId,
    logAdminAction,
    settings,
  } = useAdmin();

  const { orders, updateOrderStatus, addToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(() => {
    if (selectedAdminOrderId) {
      return orders.find((o) => o.id === selectedAdminOrderId) || null;
    }
    return null;
  });

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || o.paymentMethod === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter]);

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatus(orderId, newStatus);
    logAdminAction('Updated Order Status', 'orders', `Order #${orderId.slice(-6)} set to ${newStatus.toUpperCase()}`, orderId);
    addToast('success', `Order #${orderId.slice(-6)} updated to ${newStatus}`);
    if (activeInvoiceOrder && activeInvoiceOrder.id === orderId) {
      setActiveInvoiceOrder({ ...activeInvoiceOrder, status: newStatus });
    }
  };

  const openInvoice = (order: Order) => {
    setActiveInvoiceOrder(order);
    setSelectedAdminOrderId(order.id);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141a] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            Orders, Shipments &amp; Invoices
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fulfillment lifecycle management, delivery tracking numbers, and invoice generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportAdminOrdersToExcel(orders, settings.currencySymbol)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Orders (XLSX)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#12141a] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Buyer Name, Email..."
            className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0a0b0e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60 font-medium"
        >
          <option value="all">All Order Statuses</option>
          <option value="pending">Pending Confirmation</option>
          <option value="processing">Processing &amp; Assembly</option>
          <option value="shipped">In Transit / Shipped</option>
          <option value="delivered">Delivered &amp; Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Payment Filter */}
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="bg-[#0a0b0e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60 font-medium"
        >
          <option value="all">All Payment Methods</option>
          <option value="eSewa / FonePay">eSewa / FonePay</option>
          <option value="Khalti Digital Wallet">Khalti Digital Wallet</option>
          <option value="Bank Wire">Bank Wire Transfer</option>
          <option value="Cash on Delivery">Cash on Delivery (COD)</option>
        </select>

        <span className="text-xs text-slate-500 font-mono ml-auto">
          {filteredOrders.length} orders
        </span>
      </div>

      {/* Orders Data Table */}
      <div className="bg-[#12141a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0e1015] text-[11px] font-bold text-slate-400 uppercase font-mono">
                <th className="py-3.5 px-4">Order ID &amp; Date</th>
                <th className="py-3.5 px-3">Customer Profile</th>
                <th className="py-3.5 px-3">Items Summary</th>
                <th className="py-3.5 px-3">Total ({settings.currencySymbol})</th>
                <th className="py-3.5 px-3">Payment Method</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No orders match your search parameters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-amber-400 block">
                        #{o.id.slice(-8)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(o.createdAt).toLocaleDateString()} at{' '}
                        {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{o.buyerName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                        {o.buyerEmail}
                      </div>
                      {o.shippingAddress?.phone && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          {o.shippingAddress.phone}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md font-mono text-[11px]">
                        {o.items.reduce((s, i) => s + i.quantity, 0)} Items
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1 truncate max-w-[180px]">
                        {o.items.map((i) => i.productTitle || i.title).join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-white">
                      {settings.currencySymbol} {o.total.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="text-[11px] font-mono text-slate-300">{o.paymentMethod}</span>
                    </td>

                    <td className="py-3.5 px-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as Order['status'])}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider focus:outline-none cursor-pointer border ${
                          o.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : o.status === 'shipped'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            : o.status === 'processing'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : o.status === 'cancelled'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="pending" className="bg-[#12141a] text-white">
                          Pending
                        </option>
                        <option value="processing" className="bg-[#12141a] text-white">
                          Processing
                        </option>
                        <option value="shipped" className="bg-[#12141a] text-white">
                          Shipped
                        </option>
                        <option value="delivered" className="bg-[#12141a] text-white">
                          Delivered
                        </option>
                        <option value="cancelled" className="bg-[#12141a] text-white">
                          Cancelled
                        </option>
                      </select>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => openInvoice(o)}
                        className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice & Order Details Modal */}
      {activeInvoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#12141a] border border-amber-500/30 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Order Invoice #{activeInvoiceOrder.id.slice(-8)}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Created on {new Date(activeInvoiceOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Print Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveInvoiceOrder(null)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Customer & Address Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Customer Information
                </span>
                <p className="font-bold text-white">{activeInvoiceOrder.buyerName}</p>
                <p className="text-slate-400">{activeInvoiceOrder.buyerEmail}</p>
                <p className="text-slate-400 font-mono">
                  {activeInvoiceOrder.shippingAddress?.phone || 'Phone: Not provided'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Delivery Destination
                </span>
                <p className="text-white font-medium">
                  {activeInvoiceOrder.shippingAddress?.street || 'Central Delivery Address'}
                </p>
                <p className="text-slate-400">
                  {activeInvoiceOrder.shippingAddress?.city || 'Kathmandu'},{' '}
                  {activeInvoiceOrder.shippingAddress?.state || 'Bagmati'}
                </p>
                <p className="text-amber-400 font-mono font-semibold">
                  Payment: {activeInvoiceOrder.paymentMethod}
                </p>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#0e1015] border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Unit Price</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-slate-300">
                  {activeInvoiceOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-white">{item.productTitle || item.title}</td>
                      <td className="py-2.5 px-3 font-mono">
                        {settings.currencySymbol} {item.price.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                        {settings.currencySymbol} {(item.price * item.quantity).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Calculation */}
            <div className="p-4 rounded-2xl bg-[#0a0b0e] border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal:</span>
                <span className="font-mono">
                  {settings.currencySymbol} {activeInvoiceOrder.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Express Courier Logistics:</span>
                <span className="font-mono">
                  {settings.currencySymbol} {activeInvoiceOrder.deliveryFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                <span>Grand Total (Paid):</span>
                <span className="font-mono text-amber-400">
                  {settings.currencySymbol} {activeInvoiceOrder.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Status Quick Control */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Update Status:</span>
                {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => handleStatusChange(activeInvoiceOrder.id, st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        activeInvoiceOrder.status === st
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => setActiveInvoiceOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
