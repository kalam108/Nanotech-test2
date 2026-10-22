import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import {
  TallyAccount,
  TallyVoucher,
  TallyAccountType,
  TallyVoucherType,
} from '../../../types/accounting';
import {
  BookOpen,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  CheckCircle2,
  Calendar,
  Building2,
  CreditCard,
  Layers,
  Scale,
  TrendingUp,
  FileText,
  DollarSign,
  Briefcase,
  X,
  FileSpreadsheet,
  HelpCircle,
} from 'lucide-react';

export function TallyAccountingWorkspace() {
  const {
    tallyAccounts,
    tallyVouchers,
    addTallyVoucher,
    deleteTallyVoucher,
    getAccountLedger,
    setAdminSubView,
    createWorkbook,
    settings,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<
    'gateway' | 'vouchers' | 'ledgers' | 'trial_balance' | 'profit_loss' | 'balance_sheet'
  >('gateway');

  // Voucher Creation Modal
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherType, setVoucherType] = useState<TallyVoucherType>('payment');
  const [voucherDate, setVoucherDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [debitAccountId, setDebitAccountId] = useState<string>('');
  const [creditAccountId, setCreditAccountId] = useState<string>('');
  const [voucherAmount, setVoucherAmount] = useState<string>('');
  const [voucherNarration, setVoucherNarration] = useState<string>('');
  const [voucherRef, setVoucherRef] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<TallyVoucher['paymentMethod']>('Bank Transfer');

  // Filters & Search
  const [voucherSearch, setVoucherSearch] = useState('');
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<string>('all');
  const [selectedLedgerId, setSelectedLedgerId] = useState<string>(
    tallyAccounts[0]?.id || ''
  );

  // Financial aggregates
  const totals = useMemo(() => {
    let assets = 0;
    let liabilities = 0;
    let equity = 0;
    let revenue = 0;
    let expenses = 0;

    for (const acc of tallyAccounts) {
      if (acc.type === 'asset') assets += acc.currentBalance;
      else if (acc.type === 'liability') liabilities += acc.currentBalance;
      else if (acc.type === 'equity') equity += acc.currentBalance;
      else if (acc.type === 'revenue') revenue += acc.currentBalance;
      else if (acc.type === 'expense') expenses += acc.currentBalance;
    }

    const netProfit = revenue - expenses;
    return { assets, liabilities, equity, revenue, expenses, netProfit };
  }, [tallyAccounts]);

  // Filtered Vouchers
  const filteredVouchers = useMemo(() => {
    return tallyVouchers.filter((v) => {
      const matchesSearch =
        v.narration.toLowerCase().includes(voucherSearch.toLowerCase()) ||
        v.voucherNumber.toLowerCase().includes(voucherSearch.toLowerCase()) ||
        (v.reference && v.reference.toLowerCase().includes(voucherSearch.toLowerCase()));

      const matchesType = voucherTypeFilter === 'all' || v.type === voucherTypeFilter;

      return matchesSearch && matchesType;
    });
  }, [tallyVouchers, voucherSearch, voucherTypeFilter]);

  // Selected account ledger
  const selectedLedgerEntries = useMemo(() => {
    if (!selectedLedgerId) return [];
    return getAccountLedger(selectedLedgerId);
  }, [selectedLedgerId, getAccountLedger, tallyVouchers]);

  const activeAccountObj = useMemo(() => {
    return tallyAccounts.find((a) => a.id === selectedLedgerId);
  }, [tallyAccounts, selectedLedgerId]);

  // Trial Balance calculation
  const trialBalanceData = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;

    const rows = tallyAccounts.map((acc) => {
      let debit = 0;
      let credit = 0;

      // In double-entry: Normal debit balances = Asset, Expense
      // Normal credit balances = Liability, Equity, Revenue
      if (acc.type === 'asset' || acc.type === 'expense') {
        if (acc.currentBalance >= 0) debit = acc.currentBalance;
        else credit = Math.abs(acc.currentBalance);
      } else {
        if (acc.currentBalance >= 0) credit = acc.currentBalance;
        else debit = Math.abs(acc.currentBalance);
      }

      totalDebit += debit;
      totalCredit += credit;

      return {
        ...acc,
        debit,
        credit,
      };
    });

    return { rows, totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 };
  }, [tallyAccounts]);

  // Voucher submission
  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(voucherAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid positive transaction amount.');
      return;
    }
    if (!debitAccountId || !creditAccountId) {
      alert('Please select both Debit and Credit ledger accounts.');
      return;
    }
    if (debitAccountId === creditAccountId) {
      alert('Debit and Credit accounts cannot be the same.');
      return;
    }

    const typePrefix = voucherType.toUpperCase().slice(0, 3);
    const voucherNumber = `${typePrefix}-${Date.now().toString().slice(-4)}`;

    addTallyVoucher({
      voucherNumber,
      date: voucherDate,
      type: voucherType,
      debitAccount: debitAccountId,
      creditAccount: creditAccountId,
      amount: amt,
      narration: voucherNarration || `${voucherType.toUpperCase()} voucher entry`,
      reference: voucherRef,
      paymentMethod,
      status: 'posted',
    });

    setIsVoucherModalOpen(false);
    setVoucherAmount('');
    setVoucherNarration('');
    setVoucherRef('');
  };

  const getAccountName = (accIdOrName: string) => {
    const found = tallyAccounts.find((a) => a.id === accIdOrName || a.name === accIdOrName);
    return found ? found.name : accIdOrName;
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header & Tab Navigation ─────────────────────────── */}
      <div className="admin-card-glass p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-xl shadow-md font-black flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Tally Accounting Center</h2>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-bold text-xs rounded-full">
                Double-Entry GAAP
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Voucher posting, automated day-book, real-time ledgers, and trial balance
            </p>
          </div>
        </div>

        {/* Quick Voucher Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setVoucherType('payment');
              setIsVoucherModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> F5: Payment
          </button>

          <button
            onClick={() => {
              setVoucherType('receipt');
              setIsVoucherModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> F6: Receipt
          </button>

          <button
            onClick={() => {
              setVoucherType('sales');
              setIsVoucherModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" /> F8: Sales
          </button>

          <button
            onClick={() => {
              setVoucherType('purchase');
              setIsVoucherModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" /> F9: Purchase
          </button>

          <button
            onClick={() => setAdminSubView('excel_sheets')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Open Excel Grid
          </button>
        </div>
      </div>

      {/* ── Sub Navigation Tabs ──────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('gateway')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'gateway'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" /> Gateway Summary
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'vouchers'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Day Book & Vouchers ({tallyVouchers.length})
        </button>

        <button
          onClick={() => setActiveTab('ledgers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'ledgers'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Ledger Accounts ({tallyAccounts.length})
        </button>

        <button
          onClick={() => setActiveTab('trial_balance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'trial_balance'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" /> Trial Balance
        </button>

        <button
          onClick={() => setActiveTab('profit_loss')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'profit_loss'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Profit & Loss
        </button>

        <button
          onClick={() => setActiveTab('balance_sheet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'balance_sheet'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Balance Sheet
        </button>
      </div>

      {/* ── TAB 1: GATEWAY SUMMARY ───────────────────────────────── */}
      {activeTab === 'gateway' && (
        <div className="space-y-6">
          {/* Top Metric Cards (Exact match to User Image: glass-transparent, rounded-2xl, crisp typography) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="admin-metric-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Liquid Assets</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {settings?.currencySymbol || 'Rs.'} {totals.assets.toLocaleString()}
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Cash, Bank & Receivables
              </p>
            </div>

            <div className="admin-metric-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Liabilities</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {settings?.currencySymbol || 'Rs.'} {totals.liabilities.toLocaleString()}
              </h3>
              <p className="text-xs text-rose-500 font-semibold mt-1">Vendor payables & GST</p>
            </div>

            <div className="admin-metric-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Sales & Revenue</span>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {settings?.currencySymbol || 'Rs.'} {totals.revenue.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Hardware & support sales</p>
            </div>

            <div className="admin-metric-card">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Net Profit (Fiscal YTD)</span>
              <h3
                className={`text-2xl font-bold mt-1 ${
                  totals.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {settings?.currencySymbol || 'Rs.'} {totals.netProfit.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Revenues minus expenses</p>
            </div>
          </div>

          {/* Chart of Accounts Quick Matrix */}
          <div className="admin-card-glass p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Chart of Accounts Matrix</h3>
                <p className="text-xs text-slate-500">Live ledger balances across all standard categories</p>
              </div>
              <button
                onClick={() => {
                  setVoucherType('journal');
                  setIsVoucherModalOpen(true);
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors"
              >
                + Journal Voucher
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['asset', 'liability', 'expense'].map((cat) => {
                const accs = tallyAccounts.filter((a) => a.type === cat);
                return (
                  <div key={cat} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        {cat.toUpperCase()} Accounts ({accs.length})
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {accs.map((acc) => (
                        <div
                          key={acc.id}
                          onClick={() => {
                            setSelectedLedgerId(acc.id);
                            setActiveTab('ledgers');
                          }}
                          className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 hover:border-amber-400 cursor-pointer text-xs transition-colors"
                        >
                          <span className="font-semibold text-slate-800 truncate pr-2">{acc.name}</span>
                          <span className="font-mono font-bold text-slate-900 whitespace-nowrap">
                            Rs. {acc.currentBalance.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: DAY BOOK & VOUCHERS ─────────────────────────────── */}
      {activeTab === 'vouchers' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={voucherSearch}
                  onChange={(e) => setVoucherSearch(e.target.value)}
                  placeholder="Search voucher number, narration, reference..."
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <select
                value={voucherTypeFilter}
                onChange={(e) => setVoucherTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none cursor-pointer"
              >
                <option value="all">All Voucher Types</option>
                <option value="payment">Payment (F5)</option>
                <option value="receipt">Receipt (F6)</option>
                <option value="sales">Sales (F8)</option>
                <option value="purchase">Purchase (F9)</option>
                <option value="journal">Journal (F7)</option>
                <option value="contra">Contra (F4)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsVoucherModalOpen(true)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> New Voucher Entry
              </button>
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="p-3">Date</th>
                  <th className="p-3">Vch No.</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Debit Ledger (Dr.)</th>
                  <th className="p-3">Credit Ledger (Cr.)</th>
                  <th className="p-3">Narration & Reference</th>
                  <th className="p-3 text-right">Amount (NPR)</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No matching vouchers found. Create a voucher to record transactions.
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((vch) => {
                    const typeBadgeColors: Record<string, string> = {
                      payment: 'bg-rose-100 text-rose-800',
                      receipt: 'bg-emerald-100 text-emerald-800',
                      sales: 'bg-blue-100 text-blue-800',
                      purchase: 'bg-indigo-100 text-indigo-800',
                      journal: 'bg-amber-100 text-amber-900',
                      contra: 'bg-purple-100 text-purple-800',
                    };

                    return (
                      <tr key={vch.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="p-3 font-mono text-slate-600 whitespace-nowrap">{vch.date}</td>
                        <td className="p-3 font-mono font-bold text-slate-900">{vch.voucherNumber}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              typeBadgeColors[vch.type] || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {vch.type}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-emerald-800">{getAccountName(vch.debitAccount)}</td>
                        <td className="p-3 font-bold text-rose-800">{getAccountName(vch.creditAccount)}</td>
                        <td className="p-3 text-slate-700 max-w-xs truncate">
                          <span>{vch.narration}</span>
                          {vch.reference && (
                            <span className="block text-[10px] text-slate-400 font-mono">Ref: {vch.reference}</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {settings?.currencySymbol || 'Rs.'} {vch.amount.toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => deleteTallyVoucher(vch.id)}
                            title="Cancel / Rollback Voucher"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: LEDGER ACCOUNTS ───────────────────────────────── */}
      {activeTab === 'ledgers' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Account Selector Sidebar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Select Ledger Account</h3>
            <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
              {tallyAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedLedgerId(acc.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedLedgerId === acc.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className="truncate pr-2">{acc.name}</span>
                  <span className="font-mono text-[11px] opacity-90">
                    Rs. {acc.currentBalance.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Ledger Detailed Statement */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            {activeAccountObj ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{activeAccountObj.name}</h3>
                    <p className="text-xs text-slate-500">
                      Group: <strong className="text-slate-800">{activeAccountObj.group || activeAccountObj.subType}</strong> • Type:{' '}
                      <span className="uppercase font-bold text-amber-700">{activeAccountObj.type}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-semibold block">Closing Balance</span>
                    <span className="text-xl font-bold font-mono text-emerald-700">
                      {settings?.currencySymbol || 'Rs.'} {activeAccountObj.currentBalance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Ledger Register Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                        <th className="p-3">Date</th>
                        <th className="p-3">Vch No.</th>
                        <th className="p-3">Particulars (Opposite Account)</th>
                        <th className="p-3">Narration</th>
                        <th className="p-3 text-right">Debit (Dr.)</th>
                        <th className="p-3 text-right">Credit (Cr.)</th>
                        <th className="p-3 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {/* Opening balance row */}
                      <tr className="bg-slate-50/50 font-bold text-slate-700">
                        <td className="p-3">2026-01-01</td>
                        <td className="p-3">—</td>
                        <td className="p-3 font-sans">Opening Balance B/F</td>
                        <td className="p-3 font-sans text-slate-400">Initial ledger balance</td>
                        <td className="p-3 text-right">
                          {activeAccountObj.openingBalance >= 0 ? activeAccountObj.openingBalance.toLocaleString() : '0.00'}
                        </td>
                        <td className="p-3 text-right">
                          {activeAccountObj.openingBalance < 0 ? Math.abs(activeAccountObj.openingBalance).toLocaleString() : '0.00'}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {activeAccountObj.openingBalance.toLocaleString()}
                        </td>
                      </tr>

                      {selectedLedgerEntries.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400 font-sans">
                            No posted voucher entries for this account.
                          </td>
                        </tr>
                      ) : (
                        selectedLedgerEntries.map((entry) => (
                          <tr key={entry.id} className="hover:bg-amber-50/30">
                            <td className="p-3 text-slate-600">{entry.date}</td>
                            <td className="p-3 font-bold text-slate-900">{entry.voucherNumber}</td>
                            <td className="p-3 font-sans font-bold text-slate-800">{entry.oppositeAccount}</td>
                            <td className="p-3 font-sans text-slate-600 max-w-xs truncate">{entry.narration}</td>
                            <td className="p-3 text-right text-emerald-700">
                              {entry.debit > 0 ? entry.debit.toLocaleString() : '—'}
                            </td>
                            <td className="p-3 text-right text-rose-700">
                              {entry.credit > 0 ? entry.credit.toLocaleString() : '—'}
                            </td>
                            <td className="p-3 text-right font-bold text-slate-900">
                              {entry.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Select an account from the left list.</p>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: TRIAL BALANCE ─────────────────────────────────── */}
      {activeTab === 'trial_balance' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Trial Balance Statement</h3>
              <p className="text-xs text-slate-500">
                Double-entry verification as of {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {trialBalanceData.isBalanced ? (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Books Perfectly Balanced
                </span>
              ) : (
                <span className="px-3 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-full">
                  Discrepancy Detected
                </span>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                  <th className="p-3">Ledger Account Name</th>
                  <th className="p-3">Group Category</th>
                  <th className="p-3">Account Type</th>
                  <th className="p-3 text-right">Debit Balance (Dr.)</th>
                  <th className="p-3 text-right">Credit Balance (Cr.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialBalanceData.rows.map((row) => (
                  <tr key={row.id} className="hover:bg-amber-50/30">
                    <td className="p-3 font-bold text-slate-800">{row.name}</td>
                    <td className="p-3 text-slate-600">{row.group || row.subType}</td>
                    <td className="p-3 uppercase font-semibold text-[10px] text-slate-500">{row.type}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {row.debit > 0 ? `Rs. ${row.debit.toLocaleString()}` : '—'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {row.credit > 0 ? `Rs. ${row.credit.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-sm">
                  <td colSpan={3} className="p-3 uppercase tracking-wider">
                    Total Trial Balance
                  </td>
                  <td className="p-3 text-right font-mono text-amber-400">
                    Rs. {trialBalanceData.totalDebit.toLocaleString()}
                  </td>
                  <td className="p-3 text-right font-mono text-amber-400">
                    Rs. {trialBalanceData.totalCredit.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 5: PROFIT & LOSS ──────────────────────────────────── */}
      {activeTab === 'profit_loss' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Statement of Profit & Loss</h3>
              <p className="text-xs text-slate-500">For the period ended {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block font-semibold">Net Operating Result</span>
              <span
                className={`text-xl font-bold font-mono ${
                  totals.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {settings?.currencySymbol || 'Rs.'} {totals.netProfit.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Expenses */}
            <div className="p-5 bg-rose-50/40 rounded-2xl border border-rose-200 space-y-4">
              <h4 className="text-sm font-bold text-rose-900 uppercase">Operating Expenses</h4>
              <div className="space-y-2">
                {tallyAccounts
                  .filter((a) => a.type === 'expense')
                  .map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-xs py-1 border-b border-rose-100">
                      <span className="font-semibold text-slate-800">{a.name}</span>
                      <span className="font-mono font-bold text-slate-900">Rs. {a.currentBalance.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
              <div className="flex items-center justify-between pt-2 font-bold text-sm text-rose-950 border-t-2 border-rose-300">
                <span>Total Expenditure</span>
                <span className="font-mono">Rs. {totals.expenses.toLocaleString()}</span>
              </div>
            </div>

            {/* Right: Revenues */}
            <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-4">
              <h4 className="text-sm font-bold text-emerald-900 uppercase">Operating Revenues</h4>
              <div className="space-y-2">
                {tallyAccounts
                  .filter((a) => a.type === 'revenue')
                  .map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-xs py-1 border-b border-emerald-100">
                      <span className="font-semibold text-slate-800">{a.name}</span>
                      <span className="font-mono font-bold text-slate-900">Rs. {a.currentBalance.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
              <div className="flex items-center justify-between pt-2 font-bold text-sm text-emerald-950 border-t-2 border-emerald-300">
                <span>Total Incomes</span>
                <span className="font-mono">Rs. {totals.revenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: BALANCE SHEET ─────────────────────────────────── */}
      {activeTab === 'balance_sheet' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Company Balance Sheet</h3>
              <p className="text-xs text-slate-500">As of {new Date().toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block font-semibold">Total Capital & Liabilities</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {settings?.currencySymbol || 'Rs.'}{' '}
                {(totals.liabilities + totals.equity + totals.netProfit).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Liabilities & Equity */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase">Liabilities & Equities</h4>
              <div className="space-y-2 text-xs">
                {tallyAccounts
                  .filter((a) => a.type === 'liability' || a.type === 'equity')
                  .map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-1 border-b border-slate-200">
                      <span className="font-semibold text-slate-800">{a.name}</span>
                      <span className="font-mono font-bold text-slate-900">Rs. {a.currentBalance.toLocaleString()}</span>
                    </div>
                  ))}
                <div className="flex items-center justify-between py-1 border-b border-slate-200 font-bold text-emerald-800">
                  <span>Current Period Net Profit B/F</span>
                  <span className="font-mono">Rs. {totals.netProfit.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 font-bold text-sm text-slate-950 border-t-2 border-slate-400">
                <span>Total Liabilities & Equity</span>
                <span className="font-mono">
                  Rs. {(totals.liabilities + totals.equity + totals.netProfit).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Right: Assets */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase">Assets & Receivables</h4>
              <div className="space-y-2 text-xs">
                {tallyAccounts
                  .filter((a) => a.type === 'asset')
                  .map((a) => (
                    <div key={a.id} className="flex items-center justify-between py-1 border-b border-slate-200">
                      <span className="font-semibold text-slate-800">{a.name}</span>
                      <span className="font-mono font-bold text-slate-900">Rs. {a.currentBalance.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
              <div className="flex items-center justify-between pt-2 font-bold text-sm text-slate-950 border-t-2 border-slate-400">
                <span>Total Assets</span>
                <span className="font-mono">Rs. {totals.assets.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Create Voucher Entry ──────────────────────────── */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Post Tally Accounting Voucher</h3>
                  <p className="text-xs text-slate-500">Double-entry ledger debit and credit posting</p>
                </div>
              </div>
              <button onClick={() => setIsVoucherModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
              {/* Voucher Type & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Voucher Type</label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value as TallyVoucherType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:outline-none focus:border-amber-500"
                  >
                    <option value="payment">Payment (F5) — Outflow</option>
                    <option value="receipt">Receipt (F6) — Inflow</option>
                    <option value="sales">Sales (F8) — Invoice</option>
                    <option value="purchase">Purchase (F9) — Inventory</option>
                    <option value="journal">Journal (F7) — Adjustment</option>
                    <option value="contra">Contra (F4) — Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Voucher Date</label>
                  <input
                    type="date"
                    value={voucherDate}
                    onChange={(e) => setVoucherDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Debit & Credit Accounts */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-emerald-800 font-bold uppercase mb-1">
                    Debit Account (Dr. Receiving / Increasing)
                  </label>
                  <select
                    value={debitAccountId}
                    onChange={(e) => setDebitAccountId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-emerald-300 rounded-lg font-bold text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Select Debit Ledger --</option>
                    {tallyAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.group || acc.subType}) [Bal: Rs. {acc.currentBalance.toLocaleString()}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-rose-800 font-bold uppercase mb-1">
                    Credit Account (Cr. Giving / Decreasing)
                  </label>
                  <select
                    value={creditAccountId}
                    onChange={(e) => setCreditAccountId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-rose-300 rounded-lg font-bold text-slate-900 bg-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Select Credit Ledger --</option>
                    {tallyAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.group || acc.subType}) [Bal: Rs. {acc.currentBalance.toLocaleString()}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Amount & Payment Method */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Amount (Rs. NPR)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 45000"
                    value={voucherAmount}
                    onChange={(e) => setVoucherAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-semibold focus:outline-none focus:border-amber-500"
                  >
                    <option value="Bank Transfer">Bank Transfer (HBL / Nabil)</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="eSewa">eSewa Wallet</option>
                    <option value="Khalti">Khalti Wallet</option>
                    <option value="Credit / Card">Corporate Card</option>
                    <option value="Cheque">Cheque Clearing</option>
                  </select>
                </div>
              </div>

              {/* Narration & Reference */}
              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Narration / Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Being payment made against Invoice #INV-8891 for Dell motherboards"
                  value={voucherNarration}
                  onChange={(e) => setVoucherNarration(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold uppercase mb-1">Invoice / Reference No. (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. BILL-9923"
                  value={voucherRef}
                  onChange={(e) => setVoucherRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-sm"
                >
                  Post Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
