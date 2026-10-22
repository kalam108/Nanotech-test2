import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
} from 'lucide-react';
import { exportAdminOrdersToExcel } from '../../../lib/excelAdmin';

export function ReportsSection() {
  const { totalRevenueAmount, totalExpenseAmount, netProfitAmount, settings } = useAdmin();
  const { orders, products } = useApp();
  const [selectedReport, setSelectedReport] = useState('sales_summary');
  const [dateRange, setDateRange] = useState('Aug 1, 2026 - Aug 14, 2026');

  const reportCards = [
    {
      id: 'sales_summary',
      title: 'Executive Sales & Revenue Report',
      desc: 'Complete overview of gross turnover, payment gateway clearances, tax collections, and profit.',
      icon: DollarSign,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'inventory_health',
      title: 'Warehouse & Inventory Valuation',
      desc: 'Stock buffer status, replacement cost valuations, turnover speed, and SKU health.',
      icon: Package,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'fulfillment_log',
      title: 'Order Fulfillment & Delivery Timelines',
      desc: 'Courier performance, delivery latency, return rates, and customer fulfillment records.',
      icon: ShoppingBag,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'tax_statement',
      title: 'Quarterly VAT & Tax Statement',
      desc: 'Audited tax breakdown for tax filing, deductible expenses, and invoice records.',
      icon: FileText,
      color: 'bg-purple-100 text-purple-700',
    },
  ];

  const handleExport = () => {
    exportAdminOrdersToExcel(orders, settings.currencySymbol);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-5 shadow-xs border border-slate-100">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Executive Financial &amp; Operations Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download auditable spreadsheets, executive briefs, and ledger rollups.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-xl bg-[#FDD835] hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export All Data (Excel)</span>
        </button>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportCards.map((rc) => {
          const Icon = rc.icon;
          const isSelected = selectedReport === rc.id;
          return (
            <div
              key={rc.id}
              onClick={() => setSelectedReport(rc.id)}
              className={`bg-white rounded-2xl p-5 border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'border-amber-400 shadow-md ring-2 ring-amber-300/40'
                  : 'border-slate-100 hover:border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${rc.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{rc.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rc.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-[11px] font-semibold text-slate-500">Period: {dateRange}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport();
                  }}
                  className="px-3 py-1 bg-slate-50 hover:bg-amber-100 font-bold rounded-lg text-slate-900 flex items-center gap-1.5 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download .xlsx</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
