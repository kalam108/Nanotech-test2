import React from 'react';
import { useRBAC } from '../../context/RBACContext';
import { Shield, User, Lock, ExternalLink, LogOut, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const {
    currentUser,
    role,
    currentPath,
    navigate,
    quickLoginAs,
    logout,
    securityNotice,
    clearSecurityNotice,
  } = useRBAC();

  return (
    <div className="bg-slate-950 text-slate-200 border-b border-slate-800 text-xs py-2 px-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Active Role & Path Indicator */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-semibold tracking-wide text-cyan-400">
            <Shield className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            NanoTech RBAC
          </span>

          <span className="hidden sm:inline text-slate-600">|</span>

          {/* Current Path */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono text-slate-300">
            <span className="text-slate-500">Route:</span>
            <span className="text-emerald-400 font-medium">{currentPath}</span>
          </div>

          {/* Role Pill */}
          <div className="flex items-center gap-1.5">
            {role === 'superadmin' ? (
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                <Lock className="w-3 h-3 text-amber-400" />
                Kalam — Superadmin
              </span>
            ) : role === 'admin' ? (
              <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-semibold uppercase">
                <Shield className="w-3 h-3 text-purple-400" />
                Admin: {currentUser?.name}
              </span>
            ) : role === 'customer' ? (
              <span className="inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded font-medium">
                <User className="w-3 h-3 text-blue-400" />
                Customer: {currentUser?.name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                Guest (Unauthenticated)
              </span>
            )}
          </div>
        </div>

        {/* Quick Testing Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="hidden md:inline text-slate-500">Quick Switch Role:</span>

          {/* Kalam (Superadmin) */}
          <button
            id="role-switch-kalam"
            onClick={() => quickLoginAs('superadmin')}
            className={`px-2.5 py-1 rounded transition text-xs font-semibold flex items-center gap-1 ${
              role === 'superadmin'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/50'
            }`}
          >
            👑 Kalam (Superadmin)
          </button>

          {/* Admin */}
          <button
            id="role-switch-admin"
            onClick={() => quickLoginAs('admin')}
            className={`px-2.5 py-1 rounded transition text-xs font-medium flex items-center gap-1 ${
              role === 'admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-900/50'
            }`}
          >
            🛡️ Admin (Raju Khadka)
          </button>

          {/* Customer */}
          <button
            id="role-switch-customer"
            onClick={() => quickLoginAs('customer')}
            className={`px-2.5 py-1 rounded transition text-xs font-medium flex items-center gap-1 ${
              role === 'customer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-900/50'
            }`}
          >
            🛍️ Customer (Sita)
          </button>

          {/* Portals Quick Links */}
          <div className="hidden lg:flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800"
              title="Storefront"
            >
              Storefront
            </button>
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="text-blue-400 hover:text-blue-300 px-1.5 py-0.5 rounded hover:bg-slate-800"
              title="Customer Dashboard"
            >
              /customer
            </button>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-purple-400 hover:text-purple-300 px-1.5 py-0.5 rounded hover:bg-slate-800"
              title="Admin Dashboard"
            >
              /admin
            </button>
            <button
              onClick={() => navigate('/superadmin/dashboard')}
              className="text-amber-400 hover:text-amber-300 px-1.5 py-0.5 rounded hover:bg-slate-800 font-medium"
              title="Superadmin Console"
            >
              /superadmin
            </button>
          </div>

          {/* Logout */}
          {currentUser && (
            <button
              id="role-bar-logout"
              onClick={logout}
              className="bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/60 px-2 py-1 rounded text-xs flex items-center gap-1 transition"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Security Alert Toast if unauthorized access was blocked */}
      {securityNotice && (
        <div className="mt-2 bg-red-950 border border-red-700 text-red-200 px-3 py-2 rounded-md flex items-center justify-between text-xs animate-shake">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-medium">{securityNotice}</span>
          </div>
          <button
            onClick={clearSecurityNotice}
            className="text-red-400 hover:text-red-100 font-bold ml-4 text-sm"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
