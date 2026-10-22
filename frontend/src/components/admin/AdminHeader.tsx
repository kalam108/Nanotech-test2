import React, { useState } from 'react';
import { useAdmin, AdminSubView } from '../../context/AdminContext';
import { useApp } from '../../context/AppContext';
import { NanoTechLogo } from '../brand/NanoTechLogo';
import {
  Shield,
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  Settings,
  Store,
  Sparkles,
  UserCheck,
  Globe,
  Sliders,
  DollarSign,
  User,
  LayoutDashboard,
} from 'lucide-react';
import { AdminRole } from '../../types/admin';
import { CurrencySwitcher } from '../layout/CurrencySwitcher';

export function AdminHeader() {
  const {
    currentAdmin,
    adminSubView,
    setAdminSubView,
    unreadNotificationCount,
    logoutAdmin,
    switchAdminRole,
    settings,
    updateSettings,
    setIsGlobalSearchOpen,
    setIsMobileDrawerOpen,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useAdmin();

  const { setCurrentView, openDashboardHub } = useApp();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleRoleChange = (role: AdminRole) => {
    switchAdminRole(role);
    setIsProfileDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGlobalSearchOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 shrink-0 bg-white admin-glass-header px-4 sm:px-6 h-16 text-slate-800 flex items-center justify-between gap-4 select-none">
      {/* Left: Brand Identity & Toggle */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Logo */}
        <div
          onClick={() => setAdminSubView('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <NanoTechLogo size="sm" variant="emblem" glow={false} />
          <div className="hidden sm:block">
            <div className="text-sm font-black tracking-tight text-slate-900 leading-tight">
              NanoTech <span className="text-indigo-600">Admin</span>
            </div>
            <div className="text-[10px] font-semibold text-slate-500 leading-tight">
              Control Center
            </div>
          </div>
        </div>

        {/* Sidebar Collapse Toggle Button */}
        <button
          id="admin-sidebar-toggle-btn"
          onClick={() => {
            if (window.innerWidth < 768) {
              setIsMobileDrawerOpen(true);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
          className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-all cursor-pointer ml-1"
          title="Toggle Navigation Menu"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: Search Pill */}
      <div className="flex-1 max-w-md mx-2 sm:mx-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            id="admin-global-search-bar"
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={() => setIsGlobalSearchOpen(true)}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-10 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all cursor-pointer"
          />
          <button
            type="button"
            onClick={() => setIsGlobalSearchOpen(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Switcher */}
        <div className="hidden md:block">
          <CurrencySwitcher />
        </div>

        {/* Switch to Storefront */}
        <button
          onClick={() => setCurrentView('home')}
          className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
          title="Return to Customer Storefront"
        >
          <Store className="w-3.5 h-3.5 text-slate-600" />
          <span>Storefront</span>
        </button>

        {/* Live Dashboards Hub Launcher */}
        <button
          onClick={openDashboardHub}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-sky-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 text-slate-800 border border-amber-300/60 text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
          title="Switch between live dashboards"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span className="hidden sm:inline">Live Dashboards</span>
        </button>

        {/* Notification Bell with Badge */}
        <button
          id="admin-notification-bell-btn"
          onClick={() => setIsMobileDrawerOpen(false)}
          className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-xs transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-slate-700" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white font-black text-[9px] flex items-center justify-center shadow-xs">
            5
          </span>
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            id="admin-profile-menu-trigger"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-xs transition-all cursor-pointer"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Admin Profile"
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentAdmin?.name || 'Admin User'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-tight">
                {currentAdmin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-slate-800 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setIsProfileDropdownOpen(false)}
            >
              <div className="px-4 py-2.5">
                <p className="text-xs font-bold text-slate-900">{currentAdmin?.name || 'Admin User'}</p>
                <p className="text-[11px] text-slate-500 font-mono">{currentAdmin?.email || 'admin@gmail.com'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                  {currentAdmin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setAdminSubView('settings');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-amber-50 flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>System Settings</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-amber-50 flex items-center gap-2"
                >
                  <Store className="w-3.5 h-3.5 text-slate-500" />
                  <span>Go to Storefront</span>
                </button>
              </div>

              <div className="py-1">
                <button
                  onClick={logoutAdmin}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
