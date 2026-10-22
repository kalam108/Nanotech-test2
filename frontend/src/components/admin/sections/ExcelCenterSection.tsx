import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import {
  exportAdminProductsToExcel,
  exportAdminOrdersToExcel,
  exportExpensesToExcel,
  exportRevenuesToExcel,
  exportTransactionsToExcel,
  exportBudgetsToExcel,
  exportAuditLogsToExcel,
  parseExcelFile,
  ExcelImportResult,
} from '../../../lib/excelAdmin';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  Package,
  ShoppingBag,
  Receipt,
  PiggyBank,
  History,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Product } from '../../../types';

export function ExcelCenterSection() {
  const {
    expenses,
    revenues,
    transactions,
    budgets,
    auditLogs,
    addExpense,
    addRevenue,
    logAdminAction,
    settings,
  } = useAdmin();

  const { products, orders, addProduct, addToast } = useApp();

  const [importType, setImportType] = useState<'products' | 'expenses' | 'revenues'>('products');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ExcelImportResult<any> | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  // Exporters List
  const exportCards = [
    {
      title: 'Products Master Catalog',
      desc: 'All hardware SKUs, technical specs, pricing, stock levels & categories.',
      icon: Package,
      count: `${products.length} Products`,
      action: () => exportAdminProductsToExcel(products, settings.currencySymbol),
      color: 'amber',
    },
    {
      title: 'Orders & Fulfillment Ledger',
      desc: 'Customer purchase orders, shipping destinations, status & invoice totals.',
      icon: ShoppingBag,
      count: `${orders.length} Orders`,
      action: () => exportAdminOrdersToExcel(orders, settings.currencySymbol),
      color: 'blue',
    },
    {
      title: 'Expenses & Procurement',
      desc: 'Component purchases, logistics, cloud servers, and operating outlays.',
      icon: Receipt,
      count: `${expenses.length} Expenses`,
      action: () => exportExpensesToExcel(expenses, settings.currencySymbol),
      color: 'rose',
    },
    {
      title: 'Revenues & Marketplace Fees',
      desc: 'Direct hardware sales, custom liquid assembly labor, and seller commissions.',
      icon: Receipt,
      count: `${revenues.length} Revenues`,
      action: () => exportRevenuesToExcel(revenues, settings.currencySymbol),
      color: 'emerald',
    },
    {
      title: 'Departmental Budget Plans',
      desc: 'Fiscal budget allocations, department burn rates, and safety thresholds.',
      icon: PiggyBank,
      count: `${budgets.length} Budgets`,
      action: () => exportBudgetsToExcel(budgets, settings.currencySymbol),
      color: 'purple',
    },
    {
      title: 'Security & Audit Logs',
      desc: 'Immutable administrator audit trail with timestamps and IP addresses.',
      icon: History,
      count: `${auditLogs.length} Records`,
      action: () => exportAuditLogsToExcel(auditLogs),
      color: 'cyan',
    },
  ];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setIsParsing(true);
    setParseResult(null);

    const result = await parseExcelFile(file, importType);
    setParseResult(result);
    setIsParsing(false);
  };

  const handleCommitImport = () => {
    if (!parseResult || parseResult.validRecords.length === 0) return;

    setIsCommitting(true);
    let count = 0;

    try {
      if (importType === 'products') {
        parseResult.validRecords.forEach((item: Partial<Product>) => {
          addProduct(item);
          count++;
        });
        logAdminAction('Batch Imported Products', 'excel', `Imported ${count} hardware products via Excel`, undefined, selectedFile?.name);
        addToast('success', `Successfully imported ${count} products into live catalog!`);
      } else if (importType === 'expenses') {
        parseResult.validRecords.forEach((item: any) => {
          addExpense(item);
          count++;
        });
        logAdminAction('Batch Imported Expenses', 'excel', `Imported ${count} expenses via Excel`, undefined, selectedFile?.name);
        addToast('success', `Successfully imported ${count} expenses into ledger!`);
      } else if (importType === 'revenues') {
        parseResult.validRecords.forEach((item: any) => {
          addRevenue(item);
          count++;
        });
        logAdminAction('Batch Imported Revenues', 'excel', `Imported ${count} revenues via Excel`, undefined, selectedFile?.name);
        addToast('success', `Successfully imported ${count} revenues into ledger!`);
      }

      setParseResult(null);
      setSelectedFile(null);
    } catch (err: any) {
      addToast('error', `Import error: ${err?.message || 'Failed to save records'}`);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleDownloadSampleTemplate = (type: 'products' | 'expenses' | 'revenues') => {
    let sampleData: any[] = [];
    let fileName = '';

    if (type === 'products') {
      sampleData = [
        {
          'Product Name': 'Nanotech Vortex RTX 4080 Super Rig',
          Category: 'Custom PCs',
          Brand: 'ASUS ROG',
          Condition: 'New',
          Price: 285000,
          Stock: 8,
          Description: 'Liquid cooled gaming rig with 64GB DDR5 and Gen5 NVMe.',
          Location: 'Kathmandu, Nepal',
          'Image URL': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800',
        },
      ];
      fileName = 'Nanotech_Sample_Products_Template.xlsx';
    } else if (type === 'expenses') {
      sampleData = [
        {
          'Title / Description': 'Batch Procured DDR5 Memory Modules (x20 Kits)',
          Category: 'hardware_purchase',
          Amount: 480000,
          Date: '2026-08-15',
          Vendor: 'Corsair APAC Direct',
          Reference: 'PO-2026-9901',
          Notes: 'Low latency CL30 memory kits',
        },
      ];
      fileName = 'Nanotech_Sample_Expenses_Template.xlsx';
    } else if (type === 'revenues') {
      sampleData = [
        {
          'Title / Source': 'Studio Custom Loop Assembly Service',
          Category: 'custom_rig_build',
          Amount: 45000,
          Date: '2026-08-15',
          Source: 'In-Store Walk-In',
          Notes: 'Dual loop hardline acrylic tube bending',
        },
      ];
      fileName = 'Nanotech_Sample_Revenues_Template.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, fileName);
    addToast('info', `Downloaded ${fileName}`);
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141a] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            Excel &amp; CSV Data Import &amp; Export Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard XLSX spreadsheets with formatted headers, auto-validation, error detection, and bulk ingestion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-mono font-bold">
            SheetJS Engine (v0.20+)
          </span>
        </div>
      </div>

      {/* Section 1: Formatted XLSX Exporters Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">
              1-Click Formatted XLSX Data Exporters
            </h3>
            <p className="text-[11px] text-slate-400">Download formatted workbooks for audit and reporting</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-[#12141a] border border-slate-800 hover:border-amber-500/40 rounded-3xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full font-bold">
                      {card.count}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {card.desc}
                  </p>
                </div>

                <button
                  onClick={card.action}
                  className="w-full py-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-slate-700 hover:border-amber-500 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .XLSX</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Interactive Excel & CSV Batch Importer */}
      <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-400" />
              Batch Excel &amp; CSV Data Importer
            </h3>
            <p className="text-[11px] text-slate-400">
              Upload spreadsheets to bulk-create or update records with live validation
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Target Module:</span>
            <select
              value={importType}
              onChange={(e) => {
                setImportType(e.target.value as any);
                setParseResult(null);
                setSelectedFile(null);
              }}
              className="bg-[#0a0b0e] border border-slate-800 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-amber-500/60"
            >
              <option value="products">Products Master Catalog</option>
              <option value="expenses">Accounting Expenses</option>
              <option value="revenues">Accounting Revenues</option>
            </select>
          </div>
        </div>

        {/* Dropzone Container */}
        <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-3xl p-8 text-center transition-all bg-[#0a0b0e]/60 space-y-3 relative">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {selectedFile ? selectedFile.name : 'Drag & drop Excel file here or click to browse'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports Microsoft Excel (.xlsx, .xls) and CSV spreadsheets
            </p>
          </div>

          {/* Download Sample Template link */}
          <div className="pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadSampleTemplate(importType);
              }}
              className="text-[11px] font-bold text-amber-400 hover:underline inline-flex items-center gap-1 z-10 relative"
            >
              <Download className="w-3 h-3" />
              <span>Download sample {importType} template (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Parsing Indicator */}
        {isParsing && (
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-center gap-3 text-xs text-amber-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Analyzing rows and validating column schemas...</span>
          </div>
        )}

        {/* Validation Result Box */}
        {parseResult && (
          <div className="space-y-4 pt-2">
            {/* Stats Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Total Rows</span>
                <p className="text-base font-black text-white">{parseResult.totalRows}</p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 uppercase font-mono">Valid Rows</span>
                <p className="text-base font-black text-emerald-300">
                  {parseResult.validRecords.length}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <span className="text-[10px] text-rose-400 uppercase font-mono">Error Rows</span>
                <p className="text-base font-black text-rose-300">{parseResult.errorCount}</p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-[10px] text-amber-400 uppercase font-mono">Ready to Ingest</span>
                <p className="text-base font-black text-amber-300">
                  {parseResult.validRecords.length > 0 ? 'YES' : 'NO'}
                </p>
              </div>
            </div>

            {/* Error List if any */}
            {parseResult.errors.length > 0 && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Spreadsheet Format Errors ({parseResult.errors.length}):</span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 text-[11px] text-rose-200/90 pl-6">
                  {parseResult.errors.map((err, i) => (
                    <p key={i}>
                      • Row {err.row}: {err.column ? `[${err.column}] ` : ''}
                      {err.message}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Data Preview Table */}
            {parseResult.validRecords.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Data Preview (First 5 Parsed Records)
                </h4>
                <div className="border border-slate-800 rounded-2xl overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#0e1015] border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                        <th className="py-2.5 px-3">Title / Name</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Amount / Price</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-slate-300">
                      {parseResult.validRecords.slice(0, 5).map((rec: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-bold text-white">{rec.title}</td>
                          <td className="py-2.5 px-3 font-mono">{rec.category}</td>
                          <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">
                            {settings.currencySymbol}{' '}
                            {(rec.price || rec.amount || 0).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                              VALID
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Commit Action Button */}
                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    onClick={() => {
                      setParseResult(null);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleCommitImport}
                    disabled={isCommitting || parseResult.validRecords.length === 0}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isCommitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Commit {parseResult.validRecords.length} Records to Database</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
