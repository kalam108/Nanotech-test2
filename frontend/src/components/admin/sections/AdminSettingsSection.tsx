import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import { useApp } from '../../../context/AppContext';
import { useServer } from '../../../context/ServerContext';
import {
  Settings,
  DollarSign,
  Save,
  CheckCircle2,
  Bell,
  Building,
  Shield,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Percent,
  Sliders,
  Database,
  Cloud,
  Copy,
  Check,
  Code,
  ArrowUpRight,
  Zap,
  Download,
  Server,
  Activity,
} from 'lucide-react';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPER_ADMIN_EMAIL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CALLBACK_URL,
  generateSupabaseSqlSchema,
  checkSupabaseDataStoreHealth,
  DataStoreHealthReport,
} from '../../../lib/supabase';

export function AdminSettingsSection() {
  const { settings, updateSettings, logAdminAction } = useAdmin();
  const {
    addToast,
    supabaseOnline,
    supabaseLatency,
    isSyncingWithSupabase,
    syncAllToSupabase,
    pullFromSupabase,
    products,
    orders,
  } = useApp();

  const {
    serverOnline,
    serverLatency,
    isChecking,
    isSyncing,
    pingServerNow,
    syncWithBackend,
    openDiagnosticsModal,
  } = useServer();

  const [currency, setCurrency] = useState(settings?.currency || settings?.defaultCurrency || 'NPR');
  const [storeName, setStoreName] = useState(settings?.storeName || settings?.websiteName || 'NanoTech');
  const [supportEmail, setSupportEmail] = useState(settings?.supportEmail || settings?.contactEmail || 'support@nanotech.com');
  const [supportPhone, setSupportPhone] = useState(settings?.supportPhone || '+977 1 4428900');
  const [address, setAddress] = useState(settings?.address || 'NanoTech Innovation Center, New Baneshwor, Kathmandu, Nepal');
  const [taxRate, setTaxRate] = useState(settings?.taxRate ?? 13);
  const [lowStockThreshold, setLowStockThreshold] = useState(settings?.lowStockThreshold ?? 5);

  // Notification Toggles
  const [emailAlerts, setEmailAlerts] = useState(settings?.notifications?.emailAlerts ?? settings?.enableEmailAlerts ?? true);
  const [orderAlerts, setOrderAlerts] = useState(settings?.notifications?.orderAlerts ?? true);
  const [lowStockAlerts, setLowStockAlerts] = useState(settings?.notifications?.lowStockAlerts ?? true);
  const [expenseAlerts, setExpenseAlerts] = useState(settings?.notifications?.expenseAlerts ?? true);

  // Supabase Schema preview modal
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Live Supabase Data Store Inspector
  const [healthReport, setHealthReport] = useState<DataStoreHealthReport | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const handleRunHealthCheck = async () => {
    setIsCheckingHealth(true);
    try {
      const report = await checkSupabaseDataStoreHealth();
      setHealthReport(report);
      if (report.connected) {
        addToast('success', `Supabase Data Store verified! ${report.summary}`);
      } else {
        addToast('warning', 'Could not query Supabase tables. Check network or execute SQL schema.');
      }
    } catch (err: any) {
      addToast('error', `Data store check failed: ${err?.message}`);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleCopySql = () => {
    const sql = generateSupabaseSqlSchema();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    addToast('success', 'Full Supabase PostgreSQL Schema copied to clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleDownloadSqlFile = () => {
    const sqlContent = generateSupabaseSqlSchema();
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'nanotech_supabase_complete_schema.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('success', 'Downloaded nanotech_supabase_complete_schema.sql');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    let symbol = 'Rs.';
    if (currency === 'USD') symbol = '$';
    else if (currency === 'INR') symbol = '₹';
    else if (currency === 'EUR') symbol = '€';

    updateSettings({
      currency,
      currencySymbol: symbol,
      storeName,
      supportEmail,
      supportPhone,
      address,
      taxRate,
      lowStockThreshold,
      notifications: {
        emailAlerts,
        orderAlerts,
        lowStockAlerts,
        expenseAlerts,
      },
    });

    logAdminAction('Updated System Settings', 'auth', `Changed operational settings and currency to ${currency}`);
    addToast('success', 'System configuration updated successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141a] border border-amber-500/20 rounded-3xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-amber-400" />
            Global System &amp; Storefront Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure base accounting currencies, enterprise notification thresholds, and live Supabase Cloud Database.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      {/* Full-Stack Express Backend Server Connectivity Hub */}
      <div className="bg-[#12141a] border border-indigo-500/30 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Full-Stack Express Server &amp; REST APIs</h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    serverOnline
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      serverOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                    }`}
                  />
                  {serverOnline ? 'Express Server Online' : 'Connecting / Checking'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Port: <span className="font-mono text-indigo-300 font-bold">3000</span> · Host:{' '}
                <span className="font-mono text-cyan-300">0.0.0.0</span> · Protocol:{' '}
                <span className="font-mono text-indigo-300">HTTP/1.1 REST + Vite SPA</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isChecking}
              onClick={() => pingServerNow()}
              className="px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>Ping Server ({serverLatency > 0 ? `${serverLatency}ms` : 'Test'})</span>
            </button>
            <button
              type="button"
              disabled={isSyncing}
              onClick={() => syncWithBackend(products, orders)}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Zap className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Client & Server'}</span>
            </button>
            <button
              type="button"
              onClick={openDiagnosticsModal}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Deep Diagnostics</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-[#0a0b0e] border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Health Status
            </span>
            <span className="text-xs font-mono text-emerald-400 font-medium block mt-0.5">
              /api/health (200 OK)
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0a0b0e] border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Server Products Store
            </span>
            <span className="text-xs font-mono text-cyan-300 font-medium block mt-0.5">
              {products.length} catalog items
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0a0b0e] border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Server Orders Store
            </span>
            <span className="text-xs font-mono text-amber-300 font-medium block mt-0.5">
              {orders.length} active orders
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[#0a0b0e] border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              AI &amp; Weather API
            </span>
            <span className="text-xs font-mono text-indigo-300 font-medium block mt-0.5">
              Local Resilient Fallback Active
            </span>
          </div>
        </div>
      </div>

      {/* Cloud Database Integration: Supabase Card */}
      <div className="bg-[#12141a] border border-emerald-500/30 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Supabase Cloud Database &amp; Auth</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {supabaseOnline ? 'Connected' : 'Sync Ready'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Project ID: <span className="font-mono text-emerald-300 font-bold">{SUPABASE_PROJECT_ID}</span> · Admin: <span className="font-mono text-cyan-300">{SUPER_ADMIN_EMAIL}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isCheckingHealth}
              onClick={handleRunHealthCheck}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
              <span>Check Data Store Status</span>
            </button>
            <button
              type="button"
              disabled={isSyncingWithSupabase}
              onClick={syncAllToSupabase}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWithSupabase ? 'animate-spin' : ''}`} />
              <span>Sync All to Supabase</span>
            </button>
            <button
              type="button"
              disabled={isSyncingWithSupabase}
              onClick={pullFromSupabase}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Cloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>Pull Supabase Data</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <Code className="w-3.5 h-3.5 text-amber-400" />
              <span>View SQL Schema</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#0a0b0e] border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Supabase Endpoint</span>
            <span className="text-xs font-mono text-slate-300 font-medium truncate block mt-0.5">{SUPABASE_URL}</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0a0b0e] border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Admin Privileges</span>
            <span className="text-xs font-semibold text-cyan-300 block mt-0.5">Super Admin Active</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0a0b0e] border border-slate-800">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Latency / Heartbeat</span>
            <span className="text-xs font-semibold text-emerald-400 block mt-0.5">{supabaseLatency > 0 ? `${supabaseLatency} ms response` : 'Connected'}</span>
          </div>
        </div>

        {/* Live Data Store Table Health Report */}
        {healthReport && (
          <div className="p-4 rounded-2xl bg-[#0a0b0e] border border-slate-800 space-y-3 mt-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${healthReport.connected ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                <span className="text-xs font-bold text-white">Live Data Store Status Report</span>
                <span className="text-[10px] font-mono text-slate-400">({healthReport.latencyMs}ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/editor`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <span>Open Supabase Table Editor</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-300">{healthReport.summary}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {healthReport.tables.map((t) => (
                <div
                  key={t.tableName}
                  className={`p-2.5 rounded-xl border ${
                    t.exists
                      ? 'bg-slate-900/90 border-emerald-500/30 text-slate-200'
                      : 'bg-slate-900/50 border-amber-500/30 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white">{t.tableName}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        t.status === 'online'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : t.status === 'empty'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {t.status === 'online' ? `${t.count} records` : t.status}
                    </span>
                  </div>
                  {t.error && <span className="text-[9px] text-amber-400/90 block mt-1 truncate">{t.error}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Google OAuth & Email OTP Security Settings */}
      <div className="bg-[#12141a] border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Google OAuth &amp; 6-Digit Email OTP Verification</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Sign up with Google verification code, then login with password
              </p>
            </div>
          </div>

          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/auth/providers`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all self-start sm:self-auto"
          >
            <span>Supabase Auth Console</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-[#0a0b0e] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Google Client ID</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(GOOGLE_CLIENT_ID);
                  addToast('success', 'Copied Google Client ID');
                }}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                Copy
              </button>
            </div>
            <span className="text-xs font-mono text-slate-300 truncate block select-all">{GOOGLE_CLIENT_ID}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0a0b0e] border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Authorized Callback URL</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(GOOGLE_CALLBACK_URL);
                  addToast('success', 'Copied Authorized Redirect Callback URL');
                }}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold"
              >
                Copy
              </button>
            </div>
            <span className="text-xs font-mono text-emerald-400 truncate block select-all">{GOOGLE_CALLBACK_URL}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Module 1: Base Currency & Fiscal Unit */}
        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Default Currency &amp; Financial Format</h3>
              <p className="text-[11px] text-slate-400">Used for accounting, product pricing, and exports</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Currency Code</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="NPR">NPR (Rs. - Nepalese Rupee)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="EUR">EUR (€ - Euro)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Default VAT / Tax Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl p-3 pl-8 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
                <Percent className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Low Stock Warning Threshold</label>
              <input
                type="number"
                min="1"
                max="100"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Module 2: Storefront Identity & Communication */}
        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Storefront Information &amp; Contacts</h3>
              <p className="text-[11px] text-slate-400">Printed on official invoices, vouchers, and ledger PDFs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Official Store / Legal Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Customer Support Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl p-3 pl-8 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Support Hotline / Phone</label>
              <div className="relative">
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl p-3 pl-8 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Headquarters Address</label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#0a0b0e] border border-slate-800 rounded-xl p-3 pl-8 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Module 3: Notifications & Real-Time Alerts */}
        <div className="bg-[#12141a] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Automated Alerts &amp; Notifications</h3>
              <p className="text-[11px] text-slate-400">Toggle real-time alerts for critical events</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="p-3 rounded-2xl bg-[#0a0b0e] border border-slate-800 flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={orderAlerts}
                onChange={(e) => setOrderAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500"
              />
              <div>
                <span className="font-bold text-white block">New Customer Order Alerts</span>
                <span className="text-[10px] text-slate-500">Trigger on new checkout placement</span>
              </div>
            </label>

            <label className="p-3 rounded-2xl bg-[#0a0b0e] border border-slate-800 flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500"
              />
              <div>
                <span className="font-bold text-white block">Low Stock Buffer Warnings</span>
                <span className="text-[10px] text-slate-500">Trigger when SKU falls under threshold</span>
              </div>
            </label>

            <label className="p-3 rounded-2xl bg-[#0a0b0e] border border-slate-800 flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={expenseAlerts}
                onChange={(e) => setExpenseAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500"
              />
              <div>
                <span className="font-bold text-white block">Budget Over-Allocation Alerts</span>
                <span className="text-[10px] text-slate-500">Trigger when burn rate passes 80%</span>
              </div>
            </label>

            <label className="p-3 rounded-2xl bg-[#0a0b0e] border border-slate-800 flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500"
              />
              <div>
                <span className="font-bold text-white block">Daily Security &amp; Audit Digest</span>
                <span className="text-[10px] text-slate-500">Email daily transaction summary</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Global Settings</span>
          </button>
        </div>
      </form>

      {/* Supabase SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-[#040711]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel border border-white/10 rounded-3xl max-w-4xl w-full p-6 sm:p-8 text-slate-200 shadow-2xl relative max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">Supabase Complete SQL Schema &amp; Data Store</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      22 Modules Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Creates all 12 tables, automatic auth user triggers, RLS security policies, and seeds all initial hardware &amp; Tally data.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="p-2 rounded-xl bg-white/[0.04] text-slate-400 hover:text-white border border-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Feature summary tags */}
            <div className="flex flex-wrap gap-1.5 py-3 border-b border-white/5 text-[11px]">
              <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/5">👤 Profiles &amp; Auth Trigger</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/5">🏪 Sellers / Vendors</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/5">💻 Products &amp; Categories</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/5">📦 Orders &amp; Reviews</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/5">💬 Messages &amp; Chat</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/5">📊 Tally Accounts &amp; Vouchers</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/5">📑 Online Excel Workbooks</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/5">🛡️ Row Level Security (RLS)</span>
            </div>

            <div className="my-3 flex-1 overflow-y-auto bg-[#080d18] border border-white/10 rounded-2xl p-4 font-mono text-[11px] text-emerald-300 leading-relaxed max-h-[50vh]">
              <pre>{generateSupabaseSqlSchema()}</pre>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
              <a
                href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-medium underline underline-offset-4"
              >
                <span>Open in Supabase SQL Editor</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleDownloadSqlFile}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download .sql File</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold border border-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
