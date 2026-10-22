import React from 'react';
import { useRBAC } from '../../../context/RBACContext';
import {
  ShieldCheck,
  UserCheck,
  Users,
  Lock,
  Cpu,
  PackageCheck,
  Activity,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const SuperadminDashboardView: React.FC = () => {
  const { navigate, admins, auditLogs } = useRBAC();

  const activeAdmins = admins.filter((a) => a.status === 'active').length;
  const disabledAdmins = admins.filter((a) => a.status === 'disabled').length;

  return (
    <div className="space-y-6">
      {/* Kalam Master Banner - White-Transparent Glassmorphism */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-400/10 via-sky-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs px-3 py-1 rounded-full font-black tracking-wide uppercase mb-3 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            Root System Controller
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Kalam — Superadmin Control Center
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Welcome, Kalam. You hold absolute system authority across NanoTech: manage and provision staff administrators, enable or revoke permissions, enforce role-based route policies, and review audit trail activity.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/superadmin/admins')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md shadow-slate-900/10 transition"
            >
              <UserCheck className="w-4 h-4 text-amber-400" />
              Manage Staff Administrators ({admins.length})
            </button>
            <button
              onClick={() => navigate('/superadmin/permissions')}
              className="bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition border border-slate-200 shadow-xs"
            >
              Configure RBAC Permissions Matrix
            </button>
            <button
              onClick={() => navigate('/superadmin/settings')}
              className="bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition border border-slate-200 shadow-xs"
            >
              Inspect Security Audit Logs
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats - Developer Clean Frosted Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/75 backdrop-blur-md border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Staff Admins</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{admins.length} Accounts</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> {activeAdmins} active, {disabledAdmins} disabled
          </div>
        </div>

        <div className="bg-white/75 backdrop-blur-md border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Customer Base</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-sky-600" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">1,420 Users</div>
          <div className="mt-1 text-xs text-slate-500">Strictly isolated from /admin</div>
        </div>

        <div className="bg-white/75 backdrop-blur-md border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>System Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">NPR 7,015,000</div>
          <div className="mt-1 text-xs text-slate-500">Lifetime catalog sales</div>
        </div>

        <div className="bg-white/75 backdrop-blur-md border border-slate-200/80 p-5 rounded-2xl shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>RBAC Security Status</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-800">Active (L-0)</div>
          <div className="mt-1 text-xs text-emerald-600 font-medium">Zero route breaches detected</div>
        </div>
      </div>

      {/* Grid: Admin Accounts Overview & Live Security Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Administrator Accounts */}
        <div className="bg-white/75 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              Subordinate Administrators
            </h3>
            <button
              onClick={() => navigate('/superadmin/admins')}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold"
            >
              Manage All ({admins.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {admins.map((adm) => (
              <div
                key={adm.id}
                className="p-3.5 bg-white/90 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs hover:border-slate-300 transition shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center border border-purple-200/60">
                    {adm.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{adm.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{adm.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {adm.permissions.length} perms
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      adm.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {adm.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Audit Feed */}
        <div className="bg-white/75 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              Live Security & Audit Trail
            </h3>
            <button
              onClick={() => navigate('/superadmin/settings')}
              className="text-xs text-sky-700 hover:text-sky-800 font-bold"
            >
              Full Logs ({auditLogs.length}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {auditLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-3 bg-white/90 rounded-xl border border-slate-200/70 text-xs space-y-1 hover:border-slate-300 transition shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{log.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Actor: <strong className="text-amber-800 font-semibold">{log.actorName}</strong> ({log.actorRole}) • Target: <code className="text-sky-700 font-mono bg-sky-50 px-1 py-0.5 rounded">{log.target}</code>
                </div>
                <div className="text-[11px] text-slate-500 truncate">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
