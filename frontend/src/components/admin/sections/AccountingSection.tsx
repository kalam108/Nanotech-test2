import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import {
  AccountingExpense,
  AccountingRevenue,
  AccountingTransaction,
  ExpenseCategory,
  RevenueCategory,
} from '../../../types/admin';
import {
  exportExpensesToExcel,
  exportRevenuesToExcel,
  exportTransactionsToExcel,
} from '../../../lib/excelAdmin';
import {
  Receipt,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  FileSpreadsheet,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  X,
  CreditCard,
  Building,
} from 'lucide-react';

export function AccountingSection() {
  const {
    expenses,
    revenues,
    transactions,
    addExpense,
    deleteExpense,
    addRevenue,
    deleteRevenue,
    totalRevenueAmount,
    totalExpenseAmount,
    netProfitAmount,
    settings,
    setAdminSubView,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'expenses' | 'revenues' | 'transactions'>('expenses');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('hardware_purchase');
  const [expAmount, setExpAmount] = useState<number>(50000);
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expVendor, setExpVendor] = useState('Taiwan Microelectronics');
  const [expReference, setExpReference] = useState('');
  const [expStatus, setExpStatus] = useState<'paid' | 'pending' | 'approved'>('paid');
  const [expNotes, setExpNotes] = useState('');

  // Add Revenue Modal
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [revTitle, setRevTitle] = useState('');
  const [revCategory, setRevCategory] = useState<RevenueCategory>('product_sales');
  const [revAmount, setRevAmount] = useState<number>(100000);
  const [revDate, setRevDate] = useState(new Date().toISOString().slice(0, 10));
  const [revSource, setRevSource] = useState('Direct Hardware Storefront');
  const [revOrderId, setRevOrderId] = useState('');
  const [revNotes, setRevNotes] = useState('');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(
      (e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [expenses, searchQuery]);

  const filteredRevenues = useMemo(() => {
    return revenues.filter(
      (r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [revenues, searchQuery]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount <= 0) return;

    addExpense({
      title: expTitle.trim(),
      category: expCategory,
      amount: expAmount,
      date: expDate,
      vendor: expVendor.trim(),
      reference: expReference.trim() || `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      status: expStatus,
      notes: expNotes.trim(),
    });

    setIsExpenseModalOpen(false);
    setExpTitle('');
    setExpAmount(50000);
  };

  const handleCreateRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revTitle.trim() || revAmount <= 0) return;

    addRevenue({
      title: revTitle.trim(),
      category: revCategory,
      amount: revAmount,
      date: revDate,
      source: revSource.trim(),
      orderId: revOrderId.trim() || undefined,
      notes: revNotes.trim(),
    });

    setIsRevenueModalOpen(false);
    setRevTitle('');
    setRevAmount(100000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 admin-card-glass p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-amber-500" />
            Financial Accounting &amp; General Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Standard double-entry journal tracking, revenue streams, operational outlays, and ledger exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              if (activeTab === 'expenses') exportExpensesToExcel(expenses, settings.currencySymbol);
              else if (activeTab === 'revenues') exportRevenuesToExcel(revenues, settings.currencySymbol);
              else exportTransactionsToExcel(transactions, settings.currencySymbol);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center gap-2 transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Ledger (XLSX)</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </button>

          <button
            onClick={() => setIsRevenueModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Revenue</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards (Exact User Card Spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="admin-metric-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Gross Total Inflow
          </span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {settings.currencySymbol} {totalRevenueAmount.toLocaleString()}
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Online checkout + Custom services
          </p>
        </div>

        <div className="admin-metric-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Operating Expenses Outflow
          </span>
          <h3 className="text-2xl font-bold text-rose-600 mt-1 font-mono">
            {settings.currencySymbol} {totalExpenseAmount.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> {expenses.length} audited procurement receipts
          </p>
        </div>

        <div className="admin-metric-card">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Net Operating Margin
          </span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            {settings.currencySymbol} {netProfitAmount.toLocaleString()}
          </h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {totalRevenueAmount > 0
              ? Math.round((netProfitAmount / totalRevenueAmount) * 100)
              : 0}% Net Retained Capital
          </p>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="admin-card-glass p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200/80 rounded-xl p-1 text-xs">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'expenses'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expenses Ledger ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('revenues')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'revenues'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Revenues Ledger ({revenues.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Transactions ({transactions.length})
          </button>
        </div>

        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries..."
            className="w-full bg-white/80 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Ledger Tables */}
      <div className="admin-card-glass overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {activeTab === 'expenses' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0e1015] text-[11px] font-bold text-slate-400 uppercase font-mono">
                  <th className="py-3.5 px-4">Date &amp; ID</th>
                  <th className="py-3.5 px-3">Expense Title / Description</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Vendor / Payee</th>
                  <th className="py-3.5 px-3">Amount ({settings.currencySymbol})</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-white block">{exp.date}</span>
                      <span className="text-[10px] text-slate-500">#{exp.id.slice(-6)}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-white block">{exp.title}</span>
                      <span className="text-[10px] text-slate-400">{exp.notes}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded uppercase font-mono text-slate-300">
                        {exp.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-white font-medium">{exp.vendor}</td>
                    <td className="py-3.5 px-3 font-mono font-bold text-rose-400 text-sm">
                      - {settings.currencySymbol} {exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 uppercase">
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'revenues' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0e1015] text-[11px] font-bold text-slate-400 uppercase font-mono">
                  <th className="py-3.5 px-4">Date &amp; ID</th>
                  <th className="py-3.5 px-3">Revenue Title / Source</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Amount ({settings.currencySymbol})</th>
                  <th className="py-3.5 px-3">Recorded By</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
                {filteredRevenues.map((rev) => (
                  <tr key={rev.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-white block">{rev.date}</span>
                      <span className="text-[10px] text-slate-500">#{rev.id.slice(-6)}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-white block">{rev.title}</span>
                      <span className="text-[10px] text-slate-400">{rev.source}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded uppercase font-mono text-amber-400">
                        {rev.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-emerald-400 text-sm">
                      + {settings.currencySymbol} {rev.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">{rev.recordedBy}</td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => deleteRevenue(rev.id)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete Revenue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'transactions' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0e1015] text-[11px] font-bold text-slate-400 uppercase font-mono">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3">Transaction Description</th>
                  <th className="py-3.5 px-3">Payment Channel</th>
                  <th className="py-3.5 px-3">Amount ({settings.currencySymbol})</th>
                  <th className="py-3.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{tx.date}</td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono ${
                          tx.type === 'revenue'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-white block">{tx.description}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Ref: {tx.reference}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">{tx.paymentMethod}</td>
                    <td
                      className={`py-3.5 px-3 font-mono font-bold text-sm ${
                        tx.type === 'revenue' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.type === 'revenue' ? '+' : '-'} {settings.currencySymbol}{' '}
                      {tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded uppercase font-bold">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12141a] border border-rose-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-400" />
                Record Procurement Expense Outlay
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Expense Title
                </label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Batch RTX 4090 Purchase"
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500/60"
                  >
                    <option value="hardware_purchase">Hardware Purchase</option>
                    <option value="shipping">Logistics &amp; Courier</option>
                    <option value="marketing">Marketing &amp; Sponsorship</option>
                    <option value="server_cloud">Cloud Servers &amp; Ingress</option>
                    <option value="packaging">Packaging &amp; Crates</option>
                    <option value="salary">Staff Salaries</option>
                    <option value="operations">Workshop Operations</option>
                    <option value="refund">Customer Refund</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">
                    Amount ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    required
                    value={expAmount}
                    onChange={(e) => setExpAmount(Number(e.target.value))}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500/60 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Vendor</label>
                  <input
                    type="text"
                    value={expVendor}
                    onChange={(e) => setExpVendor(e.target.value)}
                    placeholder="Vendor / Company"
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Date</label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500/60 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Reference / Invoice #
                </label>
                <input
                  type="text"
                  value={expReference}
                  onChange={(e) => setExpReference(e.target.value)}
                  placeholder="PO-2026-XXXX"
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-rose-500/60 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black shadow-lg shadow-rose-500/20"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Revenue Modal */}
      {isRevenueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12141a] border border-amber-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Record Revenue Inflow
              </h3>
              <button
                onClick={() => setIsRevenueModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRevenue} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Revenue Title / Description
                </label>
                <input
                  type="text"
                  required
                  value={revTitle}
                  onChange={(e) => setRevTitle(e.target.value)}
                  placeholder="e.g. Custom Rig Tuning Fee"
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Category</label>
                  <select
                    value={revCategory}
                    onChange={(e) => setRevCategory(e.target.value as RevenueCategory)}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="product_sales">Product Direct Sales</option>
                    <option value="custom_rig_build">Custom PC Assembly</option>
                    <option value="seller_commission">Seller Commission</option>
                    <option value="sponsored_listing">Sponsored Listing</option>
                    <option value="other">Other Income</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">
                    Amount ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    required
                    value={revAmount}
                    onChange={(e) => setRevAmount(Number(e.target.value))}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">Source</label>
                <input
                  type="text"
                  value={revSource}
                  onChange={(e) => setRevSource(e.target.value)}
                  placeholder="e.g. Studio Assembly Walk-In"
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRevenueModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20"
                >
                  Record Revenue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
