'use client';

import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminLogin } from './AdminLogin';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminGlobalSearchModal } from './AdminGlobalSearchModal';
import { AdminNotificationDrawer } from './AdminNotificationDrawer';

// The 9 Active Admin Sub-views
import { DashboardOverviewSection } from './sections/DashboardOverviewSection';
import { ProductsMasterSection } from './sections/ProductsMasterSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { OrdersSection } from './sections/OrdersSection';
import { CustomersSection } from './sections/CustomersSection';
import { ReportsSection } from './sections/ReportsSection';
import { BannersSection } from './sections/BannersSection';
import { OffersDiscountsSection } from './sections/OffersDiscountsSection';
import { AdminSettingsSection } from './sections/AdminSettingsSection';

export function AdminDashboard() {
  const { currentAdmin, adminSubView } = useAdmin();
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // If not logged in as Admin, show the authentication portal
  if (!currentAdmin) {
    return <AdminLogin />;
  }

  // Exactly 9 sections in router
  const renderActiveSection = () => {
    switch (adminSubView) {
      case 'dashboard':
        return <DashboardOverviewSection />;
      case 'products':
        return <ProductsMasterSection />;
      case 'categories':
        return <CategoriesSection />;
      case 'orders':
        return <OrdersSection />;
      case 'customers':
        return <CustomersSection />;
      case 'reports':
      case 'reports_gen':
        return <ReportsSection />;
      case 'banners':
        return <BannersSection />;
      case 'offers':
        return <OffersDiscountsSection />;
      case 'settings':
        return <AdminSettingsSection />;
      default:
        return <DashboardOverviewSection />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white text-slate-900 flex flex-col font-poppins antialiased selection:bg-[#0F766E] selection:text-white relative">
      {/* Top App Header - Fixed Top Bar */}
      <AdminHeader />

      {/* Main Workspace with Left Sidebar & Scrolling Right Content */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative bg-white">
        {/* Left Control Sidebar - 9 items & Account Menu */}
        <AdminSidebar />

        {/* Dynamic Content Panel - Right part scrolls */}
        <main
          id="admin-main-scroll-container"
          className="flex-1 h-full overflow-y-auto min-w-0 p-4 sm:p-6 lg:p-7 bg-[#f8fafc]/80 scrollbar-thin scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400"
        >
          <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-150 pb-16">
            {renderActiveSection()}
          </div>
        </main>
      </div>

      {/* Global Search Modal */}
      <AdminGlobalSearchModal />

      {/* Real-time Alert Notification Drawer */}
      <AdminNotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
      />
    </div>
  );
}
