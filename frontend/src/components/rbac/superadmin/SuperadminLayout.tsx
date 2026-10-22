import React, { ReactNode } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { useApp } from '../../../context/AppContext';
import {
  Lock,
  LayoutDashboard,
  UserCheck,
  Users,
  Cpu,
  PackageCheck,
  KeyRound,
  Sliders,
  LogOut,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  Search,
  Globe,
} from 'lucide-react';
import { LiveDashboardHubModal } from '../../common/LiveDashboardHubModal';

export const SuperadminLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentPath, navigate, currentUser, logout } = useRBAC();
  const { openDashboardHub, isDashboardHubOpen, closeDashboardHub } = useApp();

  const navItems = [
    { label: 'Master Dashboard', path: '/super-admin', icon: LayoutDashboard },
    { label: 'Manage All User Roles', path: '/super-admin/users', icon: ShieldAlert },
    { label: 'Staff Administrators', path: '/super-admin/admins', icon: UserCheck },
    { label: 'Customer Accounts', path: '/super-admin/customers', icon: Users },
    { label: 'Global Products Control', path: '/super-admin/products', icon: Cpu },
    { label: 'Orders & Fulfillment', path: '/super-admin/orders', icon: PackageCheck },
    { label: 'Store & System Settings', path: '/super-admin/settings', icon: Sliders },
  ];

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-50 via-slate-100/80 to-sky-50/50 text-slate-900 flex flex-col md:flex-row font-sans relative overflow-hidden">
      {/* Subtle Developer Grid Backdrop */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 z-0" />

      {/* Superadmin Sidebar - Fixed/Sticky Height Ultra Glass Translucent Surface (Does not scroll with content) */}
      <aside className="w-full md:w-72 md:h-screen md:sticky md:top-0 bg-white/50 backdrop-blur-2xl border-r border-white/60 md:border-r md:border-slate-200/60 flex flex-col shrink-0 relative z-20 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.03)]">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/80 via-indigo-500/70 to-sky-400/80" />

        {/* Brand Banner */}
        <div className="p-5 border-b border-white/50 bg-white/30 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/superadmin/dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shadow-sm shadow-amber-500/10 transition-transform group-hover:scale-105">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-sm text-slate-900 tracking-wide flex items-center gap-1.5">
                <span>NanoTech</span>
                <span className="text-[9px] bg-gradient-to-r from-amber-500 to-amber-600 text-white px-1.5 py-0.2 rounded-full font-black shadow-xs tracking-wider">ROOT</span>
              </div>
              <div className="text-[11px] text-amber-700 font-bold tracking-tight">Kalam — Superadmin</div>
            </div>
          </div>
        </div>

        {/* Master Authority Badge */}
        <div className="p-3.5 mx-3.5 my-3.5 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:border-amber-400/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
              K
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-black text-slate-900 truncate">Kalam — Superadmin</div>
              <div className="text-[10px] text-slate-500 truncate font-mono">{currentUser?.email || 'kalamchy88@gmail.com'}</div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/50 text-[10px] text-slate-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Full Root Authority
            </span>
            <span className="text-amber-800 font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">Tier 0</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] bg-amber-500/10 text-amber-900 border border-amber-500/20 px-2 py-1 rounded-lg font-mono">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-700" />
              <span>Domain:</span>
            </span>
            <span className="font-bold text-amber-800">kalamkumar.com.np</span>
          </div>
        </div>

        {/* Section Navigation Header */}
        <div className="px-5 pt-1 pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 font-mono">System Navigation</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 space-y-1 py-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900/90 text-white font-bold shadow-md shadow-slate-900/15 backdrop-blur-md translate-x-0.5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 hover:backdrop-blur-md hover:border-white/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Quick Controls */}
        <div className="p-3.5 border-t border-white/50 bg-white/35 backdrop-blur-md space-y-1.5">
          <button
            onClick={() => navigate('/search')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-sky-500/10 text-sky-900 border border-sky-400/20 hover:bg-sky-500/15 transition cursor-pointer backdrop-blur-xs font-medium"
            title="Switch to User Search URL (/search)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-sky-600" />
              <span>User Search</span>
            </div>
            <span className="font-mono text-[10px] text-sky-700 font-bold bg-white/60 px-1.5 py-0.5 rounded">/search</span>
          </button>

          <button
            onClick={() => navigate('/admin/dashboard')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-purple-800 hover:bg-purple-500/10 transition border border-purple-300/30 font-medium cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
            <span>Switch to Admin View</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-900 hover:bg-white/70 transition border border-transparent cursor-pointer font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Customer Storefront</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-500/10 transition font-medium border border-transparent cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Superadmin Session</span>
          </button>
        </div>
      </aside>

      {/* Main Panel - Independently scrollable right side */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10 overflow-hidden">
        {/* Top Console Bar */}
        <header className="h-16 bg-white/75 border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 z-30 backdrop-blur-xl shadow-xs">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-700 font-bold">Kalam — Superadmin</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-semibold uppercase tracking-wider">{currentPath.replace('/superadmin/', '') || 'Dashboard'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openDashboardHub}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-sky-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 text-slate-800 border border-amber-300/60 text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              title="Switch between live dashboards"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Live Dashboards</span>
            </button>

            <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-mono font-medium flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Cluster Guard: Enforced
            </span>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1 rounded-full font-mono font-bold shadow-xs">
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>kalamkumar.com.np</span>
            </span>
          </div>
        </header>

        {/* Content - Dedicated Smooth Scroll Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto scroll-smooth">
          {children}
        </main>
      </div>

      <LiveDashboardHubModal
        isOpen={isDashboardHubOpen}
        onClose={closeDashboardHub}
      />
    </div>
  );
};
