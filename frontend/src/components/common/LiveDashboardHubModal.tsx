import React, { useState } from 'react';
import { useRBAC } from '../../context/RBACContext';
import { useAdmin } from '../../context/AdminContext';
import { useApp } from '../../context/AppContext';
import { useServer } from '../../context/ServerContext';
import {
  X,
  LayoutDashboard,
  Shield,
  Lock,
  Store,
  User,
  Activity,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  Server,
  KeyRound,
  RotateCcw,
} from 'lucide-react';

interface LiveDashboardHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LiveDashboardHubModal({ isOpen, onClose }: LiveDashboardHubModalProps) {
  const { role, currentUser, navigate: rbacNavigate, logout } = useRBAC();
  const { setCurrentView, addToast } = useApp();
  const { setAdminSubView } = useAdmin();
  const { serverOnline, serverLatency, openDiagnosticsModal } = useServer();
  const [switching, setSwitching] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLaunchDashboard = async (dashboardId: string) => {
    setSwitching(dashboardId);
    try {
      switch (dashboardId) {
        case 'super_admin':
          rbacNavigate('/super-admin');
          break;
        case 'admin_portal':
          rbacNavigate('/admin');
          break;
        case 'admin_erp':
          setCurrentView('admin_dashboard');
          setAdminSubView('dashboard');
          addToast('success', 'Launched Full Enterprise ERP & Tally Dashboard');
          break;
        case 'seller':
          setCurrentView('seller_dashboard');
          addToast('info', 'Opened Seller / Vendor Marketplace Studio');
          break;
        case 'customer':
          rbacNavigate('/dashboard');
          break;
        case 'price_tracker':
          rbacNavigate('/');
          setCurrentView('price_tracker');
          addToast('info', 'Opened Nepal Hardware Price Tracker & Analytics');
          break;
        case 'server_telemetry':
          openDiagnosticsModal();
          break;
        default:
          break;
      }
      onClose();
    } catch {
      addToast('error', 'Failed to launch dashboard');
    } finally {
      setSwitching(null);
    }
  };

  const dashboards = [
    {
      id: 'super_admin',
      title: 'Superadmin Enterprise Console',
      badge: 'Root Authority',
      badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      icon: Lock,
      iconColor: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
      route: '/super-admin',
      role: 'Superadmin (Kalam)',
      description: 'Total control over administrative staff, user privilege tiers, security audit logs, system-wide lockdown, and global platform configuration.',
      features: ['Admin Accounts CRUD', 'Live Security Audit Logs', 'RBAC Permissions Matrix', 'Node/Server Telemetry'],
    },
    {
      id: 'admin_erp',
      title: 'Admin ERP & Tally Accounting Dashboard',
      badge: 'Enterprise Operations',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      icon: Shield,
      iconColor: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20',
      route: '/admin/dashboard & ERP',
      role: 'Admin (Raju Khadka)',
      description: 'Full-featured enterprise console with hardware catalog inventory, order fulfillment, customers, Nepal Bank ledgers, and Tally accounting vouchers.',
      features: ['70+ Products Master CRUD', 'Order & Invoice Dispatch', 'Nepal Banks & Tally Ledger', 'Supabase SQL Schema Sync'],
    },
    {
      id: 'seller',
      title: 'Seller Marketplace Studio',
      badge: 'Merchant Portal',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: Store,
      iconColor: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
      route: 'In-App: seller_dashboard',
      role: 'Vendors & Merchants',
      description: 'Dedicated studio for sellers to list products, track orders, inspect store performance, manage customer reviews, and view payout analytics.',
      features: ['Vendor Product Listings', 'Sales & Revenue Graphs', 'Customer Inquiries & Chat', 'Payout Ledger & Analytics'],
    },
    {
      id: 'customer',
      title: 'Customer Account Dashboard',
      badge: 'Shopper Portal',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      icon: User,
      iconColor: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
      route: '/customer/dashboard',
      role: 'Shoppers (Sita)',
      description: 'Personal customer portal for tracking live parcel shipments, viewing recent invoices, managing shipping addresses, and saved wishlist items.',
      features: ['Live Order Shipment Tracker', 'Digital Invoice Downloads', 'Saved Delivery Addresses', 'Hardware Wishlist'],
    },
    {
      id: 'server_telemetry',
      title: 'Full-Stack Server & Cloud Telemetry',
      badge: 'DevOps & System Live',
      badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
      icon: Activity,
      iconColor: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20',
      route: 'Modal: /api/server/status',
      role: 'Engineers & Superadmins',
      description: 'Live telemetry diagnostics showing Express backend uptime, active API endpoints, instant round-trip ping latency, Gemini AI engine, and Supabase sync.',
      features: ['Instant Ping Latency Check', '11 Active API Endpoints', 'Gemini 3.6/3.8 Flash Status', 'Supabase Cloud Sync Health'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">NanoTech Live Dashboards</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {dashboards.length} Active Dashboards Live
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Switch instantly between role-specific enterprise consoles and system telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Server Latency Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>{serverOnline ? `${serverLatency}ms` : 'Offline'}</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1-Click Quick Persona Simulator Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-semibold">
            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>1-Click Switch Persona:</span>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => handleLaunchDashboard('super_admin')}
              className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Superadmin (Kalam)</span>
            </button>
            <button
              onClick={() => handleLaunchDashboard('admin_erp')}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-300 hover:bg-indigo-100 font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Shield className="w-3 h-3 text-indigo-600" />
              <span>Admin (Raju Khadka)</span>
            </button>
            <button
              onClick={() => {
                logout();
                rbacNavigate('/');
                setCurrentView('home');
                onClose();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-200/80 text-slate-700 hover:bg-slate-300 font-medium transition-all cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Public Store</span>
            </button>
          </div>
        </div>

        {/* Scrollable Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {dashboards.map((dash, index) => {
            const IconComponent = dash.icon;
            const isBusy = switching === dash.id;

            return (
              <div
                key={dash.id}
                className="group relative bg-white rounded-2xl border border-slate-200 hover:border-indigo-400/80 hover:shadow-xl p-5 flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  {/* Top Bar with Number & Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${dash.iconColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono font-black text-slate-400">
                        0{index + 1}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${dash.badgeColor}`}>
                      {dash.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                    {dash.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                    {dash.description}
                  </p>

                  {/* Target Route & Role */}
                  <div className="mt-3 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-600">
                    <span className="font-semibold text-slate-800">{dash.role}</span>
                    <span className="text-slate-400 text-[10px] truncate max-w-[120px]">{dash.route}</span>
                  </div>

                  {/* Highlights */}
                  <ul className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                    {dash.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Launch Button */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleLaunchDashboard(dash.id)}
                    disabled={isBusy}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-900 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                  >
                    <span>{isBusy ? 'Switching...' : 'Launch Live Dashboard'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>All dashboards are running live on the same full-stack server instance with real-time state synchronization.</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer underline"
          >
            Close Hub
          </button>
        </div>

      </div>
    </div>
  );
}
