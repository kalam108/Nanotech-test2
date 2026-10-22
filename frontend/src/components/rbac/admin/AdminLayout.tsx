import React, { ReactNode } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { useApp } from '../../../context/AppContext';
import {
  Shield,
  LayoutDashboard,
  Cpu,
  Package,
  Users,
  BarChart3,
  Search,
  LogOut,
  ExternalLink,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { LiveDashboardHubModal } from '../../common/LiveDashboardHubModal';

export const AdminLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentPath, navigate, currentUser, logout, hasPermission } = useRBAC();
  const { openDashboardHub, isDashboardHubOpen, closeDashboardHub } = useApp();

  const navItems = [
    { label: 'Overview Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products Management', path: '/admin/products', icon: Cpu, permission: 'products.view' as const },
    { label: 'Orders Queue', path: '/admin/orders', icon: Package, permission: 'orders.view' as const },
    { label: 'Customer Accounts', path: '/admin/customers', icon: Users, permission: 'customers.view' as const },
    { label: 'Sales & Inventory Reports', path: '/admin/reports', icon: BarChart3, permission: 'reports.view' as const },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        {/* Admin Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-sm text-white tracking-wide">NanoTech Admin</div>
              <div className="text-[10px] text-purple-400 font-medium">Hardware Management</div>
            </div>
          </div>
        </div>

        {/* Admin Profile Chip */}
        <div className="p-4 mx-3 my-3 bg-slate-950/80 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
              {currentUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{currentUser?.name || 'Administrator'}</div>
              <div className="text-[10px] text-purple-400 truncate">{currentUser?.email}</div>
            </div>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Role: <strong className="text-purple-300">Staff Admin</strong>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 space-y-1 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            const isAllowed = !item.permission || hasPermission(item.permission);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                disabled={!isAllowed}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : isAllowed
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={() => navigate('/search')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs bg-sky-950/40 text-sky-300 border border-sky-800/40 hover:bg-sky-900/40 hover:text-white transition cursor-pointer"
            title="Switch to User Search URL (/search)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-sky-400" />
              <span>User Search</span>
            </div>
            <span className="font-mono text-[10px] text-sky-400">/search</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Storefront</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-950/40 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-10 z-30">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Admin Portal</span>
            <span className="text-slate-600">/</span>
            <span className="text-purple-400 font-semibold uppercase">{currentPath.replace('/admin/', '') || 'Dashboard'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openDashboardHub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
              title="Switch between live dashboards"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Live Dashboards</span>
            </button>

            <span className="hidden sm:inline text-[11px] text-slate-400 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
              Host: <code className="text-emerald-400">Single Domain RBAC</code>
            </span>
            <button
              onClick={() => navigate('/admin/products')}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              + Quick Action
            </button>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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
