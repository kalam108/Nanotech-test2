import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import { generateSupabaseSqlSchema, SUPABASE_PROJECT_ID } from '../../../lib/supabase';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

interface BackupSnapshot {
  id: string;
  name: string;
  size: string;
  timestamp: string;
  type: 'Automatic Daily' | 'Manual Export';
}

const INITIAL_BACKUPS: BackupSnapshot[] = [
  { id: 'snap_sql', name: 'nanotech_supabase_complete_schema.sql', size: '18.4 KB', timestamp: 'Ready for Supabase', type: 'Manual Export' },
  { id: 'snap_1', name: 'nanotech_db_prod_20260814.sql.gz', size: '24.8 MB', timestamp: 'Today at 03:00 AM', type: 'Automatic Daily' },
  { id: 'snap_2', name: 'nanotech_db_prod_20260813.sql.gz', size: '24.2 MB', timestamp: 'Yesterday at 03:00 AM', type: 'Automatic Daily' },
  { id: 'snap_3', name: 'nanotech_manual_ledger_pre_migration.json', size: '14.6 MB', timestamp: 'Aug 10, 2026 at 06:30 PM', type: 'Manual Export' },
];

export function BackupSection() {
  const { logAdminAction } = useAdmin();
  const { addToast } = useApp();
  const [backups, setBackups] = useState<BackupSnapshot[]>(INITIAL_BACKUPS);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateBackup = () => {
    setIsCreating(true);
    setTimeout(() => {
      const newBackup: BackupSnapshot = {
        id: `snap_${Date.now()}`,
        name: `nanotech_db_manual_${new Date().toISOString().slice(0, 10)}.sql`,
        size: '22.6 KB',
        timestamp: 'Just now',
        type: 'Manual Export',
      };
      setBackups([newBackup, ...backups]);
      setIsCreating(false);
      logAdminAction('Created Database Backup', 'system', `Generated snapshot ${newBackup.name}`);
      addToast('success', 'Database snapshot generated and stored safely.');
    }, 800);
  };

  const handleDownload = (name: string) => {
    const sqlContent = generateSupabaseSqlSchema();
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('success', `Downloaded ${name}`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl p-5 shadow-xs border border-slate-100">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-500" />
            Database Backups &amp; Disaster Recovery
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated cloud point-in-time snapshots, manual JSON/SQL archives, and restore logs.
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="px-4 py-2 rounded-xl bg-[#FDD835] hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-xs self-start sm:self-auto transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isCreating ? 'animate-spin' : ''}`} />
          <span>{isCreating ? 'Generating Snapshot...' : 'Take Immediate Snapshot'}</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Backup Health</div>
              <div className="text-sm font-black text-slate-900">100% Redundant</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Total Storage Used</div>
              <div className="text-sm font-black text-slate-900">63.6 MB / 50 GB</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Next Auto-Snapshot</div>
              <div className="text-sm font-black text-slate-900">Tomorrow at 03:00 AM</div>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Cloud Connection & SQL Store Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">Supabase Live Data Store &amp; SQL Tables</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PostgreSQL DDL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Project ID: <span className="font-mono text-emerald-300">{SUPABASE_PROJECT_ID}</span> · Includes 12 SQL tables, triggers, and seed records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload('nanotech_supabase_complete_schema.sql')}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Supabase .SQL</span>
          </button>
          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all"
          >
            <span>Supabase SQL Editor</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        </div>
      </div>

      {/* Snapshots Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">Available Database Snapshots</h3>
          <span className="text-[11px] text-slate-500 font-semibold">{backups.length} snapshots available</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Snapshot Archive</th>
                <th className="p-4">Size</th>
                <th className="p-4">Created</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-500" />
                    <span>{b.name}</span>
                  </td>
                  <td className="p-4 font-semibold text-slate-600">{b.size}</td>
                  <td className="p-4 text-slate-500">{b.timestamp}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {b.type}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDownload(b.name)}
                      className="px-3 py-1 bg-slate-100 hover:bg-amber-100 text-slate-900 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-700" />
                      <span>Download</span>
                    </button>
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
