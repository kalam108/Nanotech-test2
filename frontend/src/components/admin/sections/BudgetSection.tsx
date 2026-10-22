import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { BudgetPlan } from '../../../types/admin';
import { exportBudgetsToExcel } from '../../../lib/excelAdmin';
import {
  PiggyBank,
  Plus,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Edit2,
  Trash2,
  X,
  PieChart,
  Calendar,
  Layers,
} from 'lucide-react';

export function BudgetSection() {
  const { budgets, addBudget, updateBudget, deleteBudget, settings } = useAdmin();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [budgetName, setBudgetName] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('Inventory');
  const [allocatedAmount, setAllocatedAmount] = useState<number>(500000);
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [alertThreshold, setAlertThreshold] = useState<number>(80);

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedAmount, 0);
  const totalUsed = budgets.reduce((sum, b) => sum + b.usedAmount, 0);
  const totalRemaining = totalAllocated - totalUsed;
  const overallUtilization = totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0;

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetName.trim() || allocatedAmount <= 0) return;

    addBudget({
      name: budgetName.trim(),
      category: budgetCategory.trim(),
      allocatedAmount,
      period,
      year: 2026,
      month: 8,
      alertThresholdPercent: alertThreshold,
    });

    setIsAddModalOpen(false);
    setBudgetName('');
    setAllocatedAmount(500000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141a] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <PiggyBank className="w-5 h-5 text-amber-400" />
            Departmental Budget Planning &amp; Outlay Control
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Fiscal resource allocations, expenditure thresholds, budget burn rates, and alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportBudgetsToExcel(budgets, settings.currencySymbol)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Budget (XLSX)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Budget Plan</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            Total Capital Allocated (August 2026)
          </span>
          <div className="text-2xl font-black text-white font-mono">
            {settings.currencySymbol} {totalAllocated.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">{budgets.length} active department funds</span>
        </div>

        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            Disbursed &amp; Utilized
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {settings.currencySymbol} {totalUsed.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-300/80 font-bold font-mono">
            {overallUtilization}% burn rate
          </span>
        </div>

        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
            Remaining Available Cushion
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {settings.currencySymbol} {totalRemaining.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold">
            Within budgeted fiscal limits
          </span>
        </div>
      </div>

      {/* Budget Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {budgets.map((b) => {
          const usedPct = Math.round((b.usedAmount / (b.allocatedAmount || 1)) * 100);
          const isWarning = usedPct >= b.alertThresholdPercent;
          const isExceeded = usedPct >= 100;

          return (
            <div
              key={b.id}
              className={`bg-[#12141a] border rounded-3xl p-5 shadow-xl transition-all space-y-4 ${
                isExceeded
                  ? 'border-rose-500/50 bg-rose-500/5'
                  : isWarning
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{b.name}</h3>
                    {isWarning && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.2 rounded-full font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {usedPct}% Burn
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    Category: {b.category} • Period: {b.period.toUpperCase()}
                  </span>
                </div>

                <button
                  onClick={() => deleteBudget(b.id)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300 font-mono text-[11px]">
                  <span>
                    Used: {settings.currencySymbol} {b.usedAmount.toLocaleString()}
                  </span>
                  <span>
                    Total: {settings.currencySymbol} {b.allocatedAmount.toLocaleString()}
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, usedPct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Alert Trigger: &gt;{b.alertThresholdPercent}%</span>
                  <span className="text-slate-300 font-bold">
                    Remaining: {settings.currencySymbol}{' '}
                    {(b.allocatedAmount - b.usedAmount).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Budget Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12141a] border border-amber-500/30 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-amber-400" />
                Create New Budget Allocation
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-bold uppercase text-[10px]">
                  Budget Name / Department
                </label>
                <input
                  type="text"
                  required
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                  placeholder="e.g. Graphics Card Inventory Allocation"
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Category</label>
                  <input
                    type="text"
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    placeholder="e.g. Inventory / Logistics"
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">
                    Allocated ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    required
                    value={allocatedAmount}
                    onChange={(e) => setAllocatedAmount(Number(e.target.value))}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">Period</label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as any)}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase text-[10px]">
                    Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(Number(e.target.value))}
                    className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20"
                >
                  Save Budget Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
