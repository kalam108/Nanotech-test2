import React from 'react';
import { useAdmin, AdminSubView } from '../../context/AdminContext';
import { useApp } from '../../context/AppContext';
import AccountMenu from './AccountMenu';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Package,
  FolderTree,
  Boxes,
  Bookmark,
  ShoppingBag,
  Users,
  Store,
  Star,
  DollarSign,
  Receipt,
  ArrowLeftRight,
  PiggyBank,
  FileSpreadsheet,
  BookOpen,
  Scale,
  Menu as MenuIcon,
  PanelLeft,
  Image,
  Tag,
  FileCode,
  Shield,
  Settings,
  History,
  Database,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wrench,
  TrendingDown,
  MapPin,
  Building2,
} from 'lucide-react';

interface NavItem {
  id: AdminSubView;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function AdminSidebar() {
  const {
    adminSubView,
    setAdminSubView,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    currentAdmin,
    logoutAdmin,
  } = useAdmin();

  const { products, orders, sellers, reviews } = useApp();

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const pendingSellersCount = sellers.filter((s) => s.status === 'pending').length;
  const lowStockCount = products.filter((p) => p.stock < 5).length;

  // Exact Sidebar Structure with PC Builder, Price Tracker, Brands & Stores Included
  const navSections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'reports', label: 'Reports', icon: FileText },
      ],
    },
    {
      title: 'HARDWARE & CATALOG',
      items: [
        { id: 'products', label: 'Products', icon: Package, badge: products.length },
        { id: 'categories', label: 'Categories', icon: FolderTree },
        {
          id: 'inventory',
          label: 'Inventory',
          icon: Boxes,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-900 border border-rose-400/40 font-bold',
        },
        { id: 'brands', label: 'Brands', icon: Bookmark, badge: 'Official' },
        { id: 'pc_builder', label: 'PC Builder', icon: Wrench, badge: 'AM5/LGA' },
        { id: 'price_tracker', label: 'Price Tracker', icon: TrendingDown, badge: 'NPR Live' },
        { id: 'stores', label: 'Stores', icon: MapPin, badge: 'Hubs' },
      ],
    },
    {
      title: 'ORDERS & USERS',
      items: [
        {
          id: 'orders',
          label: 'Orders',
          icon: ShoppingBag,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          badgeColor: 'bg-amber-500/25 text-amber-950 border border-amber-500/40 font-bold',
        },
        { id: 'customers', label: 'Customers', icon: Users },
        {
          id: 'sellers',
          label: 'Sellers',
          icon: Store,
          badge: pendingSellersCount > 0 ? `${pendingSellersCount}` : undefined,
          badgeColor: 'bg-indigo-500/20 text-indigo-950 border border-indigo-400/40 font-bold',
        },
        { id: 'reviews', label: 'Reviews', icon: Star },
      ],
    },
    {
      title: 'ACCOUNTING & SHEETS',
      items: [
        {
          id: 'excel_sheets',
          label: 'Online Excel',
          icon: FileSpreadsheet,
          badge: 'Live',
          badgeColor: 'bg-emerald-500/20 text-emerald-950 border border-emerald-400/40 font-bold text-[10px]',
        },
        {
          id: 'tally_accounting',
          label: 'Tally Accounting',
          icon: BookOpen,
          badge: 'GAAP',
          badgeColor: 'bg-amber-500/25 text-amber-950 border border-amber-400/40 font-bold text-[10px]',
        },
        { id: 'revenue', label: 'Revenue', icon: DollarSign },
        { id: 'expenses', label: 'Expenses', icon: Receipt },
        { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
        { id: 'budget', label: 'Budget', icon: PiggyBank },
        { id: 'excel', label: 'Excel Import/Export', icon: FileSpreadsheet },
      ],
    },
    {
      title: 'CONTENT',
      items: [
        { id: 'header_menu', label: 'Header Menu', icon: MenuIcon },
        { id: 'left_menu', label: 'Left Menu', icon: PanelLeft },
        { id: 'banners', label: 'Banners', icon: Image },
        { id: 'offers', label: 'Offers', icon: Tag },
        { id: 'pages', label: 'Pages', icon: FileCode },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'users_roles', label: 'Users & Roles', icon: Shield },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'activity_logs', label: 'Activity Logs', icon: History },
        { id: 'backup', label: 'Backup', icon: Database },
      ],
    },
  ];

  const handleNavClick = (view: AdminSubView) => {
    setAdminSubView(view);
    setIsMobileDrawerOpen(false);
  };

  const sidebarContent = (
    <div className="relative flex flex-col h-full text-[#1A1A1A] select-none overflow-hidden bg-white">
      {/* Top Status & Hub Indicator (when expanded) */}
      {!isSidebarCollapsed && (
        <div className="relative z-10 px-3.5 pt-3 pb-2.5 border-b border-[#EDEDED] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1A1A1A]"></span>
            </span>
            <span className="text-[11px] font-medium text-[#1A1A1A] tracking-tight">Itahari Control Hub</span>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-[6px] bg-[#F3F3F3] text-[#1A1A1A] border border-[#EDEDED]">
            Live
          </span>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="relative z-10 flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300 scrollbar-track-transparent bg-white">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isSidebarCollapsed ? (
              <div className="flex items-center justify-between px-2.5 mb-1 mt-1">
                <h3 className="text-[11px] font-normal uppercase tracking-wider text-[#A0A0A0]">
                  {section.title}
                </h3>
              </div>
            ) : (
              <div className="h-px bg-[#EDEDED] my-2 mx-2" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  adminSubView === item.id ||
                  (item.id === 'excel_sheets' && (adminSubView === 'online_excel' || adminSubView === 'excel_sheets')) ||
                  (item.id === 'revenue' && adminSubView === 'accounting') ||
                  (item.id === 'expenses' && adminSubView === 'accounting') ||
                  (item.id === 'transactions' && adminSubView === 'accounting') ||
                  (item.id === 'users_roles' && adminSubView === 'admin_users') ||
                  (item.id === 'reports' && adminSubView === 'reports_gen');

                return (
                  <button
                    key={item.id}
                    id={`admin-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`group w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-[8px] text-[13px] transition-colors relative cursor-pointer ${
                      isActive
                        ? 'bg-[#F3F3F3] text-[#1A1A1A] font-medium'
                        : 'text-[#1A1A1A] hover:bg-[#F5F5F5]'
                    } ${isSidebarCollapsed ? 'justify-center px-1.5' : 'justify-between'}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-[17px] h-[17px] shrink-0 text-[#6B6B6B]`}
                      />
                      {!isSidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!isSidebarCollapsed && item.badge !== undefined && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-[6px] font-medium bg-[#F0F0F0] text-[#6B6B6B]"
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer with AccountMenu */}
      <div className="relative z-30 shrink-0 p-2 border-t border-[#EDEDED] bg-white">
        <AccountMenu
          adminName={currentAdmin?.name || 'Raju Khadka'}
          adminRole={currentAdmin?.role ? (currentAdmin.role.charAt(0).toUpperCase() + currentAdmin.role.slice(1)) : 'Admin'}
          avatarInitials={
            currentAdmin?.name
              ? currentAdmin.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
              : 'RK'
          }
          isCollapsed={isSidebarCollapsed}
          onLogout={logoutAdmin}
          onNavigate={(target) => {
            if (target === 'settings' || target === 'profile') {
              setAdminSubView('settings');
            } else if (target === 'personalization') {
              setAdminSubView('content');
            } else if (target === 'help') {
              setAdminSubView('reports');
            }
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 transition-all duration-300 z-20 h-full max-h-full bg-white border-r border-[#EDEDED] select-none ${
          isSidebarCollapsed ? 'w-16' : 'w-[220px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-64 max-w-[80vw] bg-white border-r border-[#EDEDED] h-full shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
