import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminLogin } from './AdminLogin';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { AdminGlobalSearchModal } from './AdminGlobalSearchModal';
import { AdminNotificationDrawer } from './AdminNotificationDrawer';

// Dynamic Sub-views
import { DashboardOverviewSection } from './sections/DashboardOverviewSection';
import { AnalyticsSection } from './sections/AnalyticsSection';
import { ReportsSection } from './sections/ReportsSection';
import { ProductsMasterSection } from './sections/ProductsMasterSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { InventorySection } from './sections/InventorySection';
import { BrandsSection } from './sections/BrandsSection';
import { PCBuilderAdminSection } from './sections/PCBuilderAdminSection';
import { PriceTrackerAdminSection } from './sections/PriceTrackerAdminSection';
import { StoresAdminSection } from './sections/StoresAdminSection';
import { OrdersSection } from './sections/OrdersSection';
import { CustomersSection } from './sections/CustomersSection';
import { SellersSection } from './sections/SellersSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { AccountingSection } from './sections/AccountingSection';
import { BudgetSection } from './sections/BudgetSection';
import { ExcelCenterSection } from './sections/ExcelCenterSection';
import { OnlineExcelWorkspace } from './accounting/OnlineExcelWorkspace';
import { TallyAccountingWorkspace } from './accounting/TallyAccountingWorkspace';
import { ContentManagementSection } from './sections/ContentManagementSection';
import { UsersRolesSection } from './sections/UsersRolesSection';
import { AdminSettingsSection } from './sections/AdminSettingsSection';
import { AuditLogsSection } from './sections/AuditLogsSection';
import { BackupSection } from './sections/BackupSection';

export function AdminDashboard() {
  const { currentAdmin, adminSubView } = useAdmin();
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // If not logged in as Admin, show the authentication portal
  if (!currentAdmin) {
    return <AdminLogin />;
  }

  const renderActiveSection = () => {
    switch (adminSubView) {
      case 'dashboard':
        return <DashboardOverviewSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'reports':
      case 'reports_gen':
        return <ReportsSection />;
      case 'products':
        return <ProductsMasterSection />;
      case 'categories':
        return <CategoriesSection />;
      case 'inventory':
        return <InventorySection />;
      case 'brands':
        return <BrandsSection />;
      case 'pc_builder':
        return <PCBuilderAdminSection />;
      case 'price_tracker':
        return <PriceTrackerAdminSection />;
      case 'stores':
        return <StoresAdminSection />;
      case 'orders':
        return <OrdersSection />;
      case 'customers':
        return <CustomersSection />;
      case 'sellers':
        return <SellersSection />;
      case 'reviews':
      case 'reviews_reports':
        return <ReviewsSection />;
      case 'excel_sheets':
      case 'accounting_excel':
        return <OnlineExcelWorkspace />;
      case 'tally_accounting':
      case 'accounting_dashboard':
      case 'tally_ledger':
      case 'accounting_sales':
      case 'accounting_purchases':
      case 'accounting_payments':
      case 'accounting_receipts':
      case 'accounting_reports':
        return <TallyAccountingWorkspace />;
      case 'revenue':
      case 'expenses':
      case 'transactions':
      case 'accounting':
      case 'accounting_income':
        return <AccountingSection />;
      case 'budget':
        return <BudgetSection />;
      case 'excel':
      case 'import_excel':
      case 'export_download':
        return <ExcelCenterSection />;
      case 'header_menu':
      case 'left_menu':
      case 'banners':
      case 'offers':
      case 'pages':
      case 'content':
      case 'website_content':
        return <ContentManagementSection />;
      case 'users_roles':
      case 'admin_users':
        return <UsersRolesSection />;
      case 'settings':
        return <AdminSettingsSection />;
      case 'activity_logs':
      case 'audit_logs':
        return <AuditLogsSection />;
      case 'backup':
        return <BackupSection />;
      default:
        return <DashboardOverviewSection />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white relative">
      {/* Top App Header - Fixed Top Bar */}
      <AdminHeader />

      {/* Main Workspace with Fixed Left Sidebar & Scrolling Right Content */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative bg-white">
        {/* Left Control Sidebar - Fixed in place */}
        <AdminSidebar />

        {/* Dynamic Content Panel - ONLY the right part scrolls */}
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
