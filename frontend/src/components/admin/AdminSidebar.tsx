'use client';

import React from 'react';
import { useAdmin, AdminSubView } from '../../context/AdminContext';
import { useApp } from '../../context/AppContext';
import AccountMenu from './AccountMenu';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  FileText,
  Image,
  Tag,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarItem {
  id: AdminSubView;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export function AdminSidebar() {
  const {
    adminSubView,
    setAdminSubView,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
  } = useAdmin();

  const { orders } = useApp();

  // Number of pending orders
  const pendingOrdersCount = orders.filter(
    (o) => (o.status || '').toLowerCase() === 'pending'
  ).length;

  // EXACTLY 9 ITEMS IN THIS EXACT ORDER:
  // 1. Dashboard
  // 2. Products
  // 3. Categories
  // 4. Orders (badge = number of pending orders)
  // 5. Customers
  // 6. Reports
  // 7. Banners
  // 8. Offers & Discounts
  // 9. Settings
  const navItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'banners', label: 'Banners', icon: Image },
    { id: 'offers', label: 'Offers & Discounts', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        id="admin-primary-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 bg-white border-r border-slate-200/90 flex flex-col shrink-0 transition-all duration-300 font-poppins shadow-xs ${
          isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Top Header / Brand in Teal */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          {!isSidebarCollapsed ? (
            <div
              onClick={() => setAdminSubView('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-base shadow-sm">
                N
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm tracking-tight">
                  NanoTech
                </span>
                <span className="ml-1 text-[11px] font-semibold text-[#0F766E] bg-[#0F766E]/10 px-1.5 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setAdminSubView('dashboard')}
              className="w-full flex justify-center cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-base shadow-sm">
                N
              </div>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* 9 Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminSubView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setAdminSubView(item.id);
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isSidebarCollapsed ? 'justify-center' : 'justify-between'
                } ${
                  isActive
                    ? 'bg-[#0F766E] text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-[#0F766E] hover:bg-[#0F766E]/5'
                }`}
                title={item.label}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-500 group-hover:text-[#0F766E]'
                    }`}
                  />
                  {!isSidebarCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>

                {!isSidebarCollapsed && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      isActive
                        ? 'bg-white text-[#0F766E]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Account Menu (Avatar initials, name, email + popup) */}
        <div className="p-3 border-t border-slate-100 bg-white shrink-0">
          <AccountMenu isCollapsed={isSidebarCollapsed} />
        </div>
      </aside>
    </>
  );
}
