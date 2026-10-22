import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { exportAuditLogsToExcel } from '../../../lib/excelAdmin';
import {
  History,
  Shield,
  Search,
  FileSpreadsheet,
  Terminal,
  Clock,
  User,
  Filter,
} from 'lucide-react';

export function AuditLogsSection() {
  const { auditLogs } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((log.adminEmail || '')).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetName && log.targetName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;

    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141a] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <History className="w-5 h-5 text-amber-400" />
            Security &amp; Administrative Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable tracking log of administrative actions, data exports, inventory edits, and status changes.
          </p>
        </div>

        <button
          onClick={() => exportAuditLogsToExcel(auditLogs)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Export Audit Trail (XLSX)</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-[#12141a] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action logs by keyword, admin, or target..."
            className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="bg-[#0a0b0e] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500/60 font-medium"
        >
          <option value="all">All Modules</option>
          <option value="auth">Authentication &amp; Security</option>
          <option value="products">Products Master</option>
          <option value="orders">Orders &amp; Invoices</option>
          <option value="finance">Finance &amp; Accounting</option>
          <option value="inventory">Warehouse Inventory</option>
          <option value="excel">Excel Operations</option>
          <option value="cms">Content Management</option>
        </select>

        <span className="text-xs text-slate-500 font-mono ml-auto">
          {filteredLogs.length} logged events
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-[#12141a] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0e1015] text-[11px] font-bold text-slate-400 uppercase font-mono">
                <th className="py-3.5 px-4">Timestamp (UTC/NPT)</th>
                <th className="py-3.5 px-3">Administrator</th>
                <th className="py-3.5 px-3">Module</th>
                <th className="py-3.5 px-3">Action Description</th>
                <th className="py-3.5 px-3">Details / Target</th>
                <th className="py-3.5 px-3 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-white block">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-bold text-white block">{log.adminName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.adminEmail}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="text-[10px] uppercase font-mono bg-slate-900 border border-slate-800 text-amber-400 px-2 py-0.5 rounded font-bold">
                      {log.module}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-white">{log.action}</td>

                  <td className="py-3.5 px-3 text-slate-400">
                    <div>{log.details}</div>
                    {log.targetName && (
                      <span className="text-[10px] text-amber-400/80 font-mono">
                        Target: {log.targetName}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-[11px] text-slate-500">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
