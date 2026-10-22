import React, { ReactNode } from 'react';
import { useRBAC } from '../../../context/RBACContext';
import { useApp } from '../../../context/AppContext';
import { ShoppingBag, LayoutDashboard, Cpu, ShoppingCart, Package, User, LogOut, Shield, Search } from 'lucide-react';
import { LiveDashboardHubModal } from '../../common/LiveDashboardHubModal';

export const CustomerLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentPath, navigate, currentUser, logout } = useRBAC();
  const { openDashboardHub, isDashboardHubOpen, closeDashboardHub } = useApp();

  const navItems = [
    { label: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/customer/products', icon: Cpu },
    { label: 'Cart', path: '/customer/cart', icon: ShoppingCart },
    { label: 'My Orders', path: '/customer/orders', icon: Package },
    { label: 'Profile', path: '/customer/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Customer Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-10 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/customer/dashboard')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-wider text-white">NanoTech</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Customer
                </span>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right User & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={openDashboardHub}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-blue-500/20 hover:from-amber-500/30 hover:to-blue-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
                title="Switch between live dashboards"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Live Dashboards</span>
              </button>

              <button
                onClick={() => navigate('/search')}
                className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition cursor-pointer"
                title="Search Hardware Catalog (/search)"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Search (/search)</span>
              </button>

              <button
                onClick={() => navigate('/admin')}
                className="hidden md:inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-slate-800 transition cursor-pointer"
                title="Admin Portal (/admin)"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="hidden sm:inline-flex text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-slate-800 cursor-pointer"
              >
                Storefront
              </button>

              <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-xs">
                  {currentUser?.name?.charAt(0) || 'C'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium text-white">{currentUser?.name || 'Customer'}</div>
                  <div className="text-[10px] text-slate-400">{currentUser?.email}</div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800 py-2 bg-slate-900/90 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 py-1 px-2 rounded-md ${
                  isActive ? 'text-blue-400 font-semibold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      <LiveDashboardHubModal
        isOpen={isDashboardHubOpen}
        onClose={closeDashboardHub}
      />
    </div>
  );
};
