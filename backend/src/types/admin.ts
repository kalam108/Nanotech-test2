export type AdminRole = 'super_admin' | 'admin' | 'manager' | 'accountant' | 'content_manager';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
  lastLogin?: string;
  status: 'active' | 'suspended';
  permissions: string[];
  createdAt: string;
}

export type TransactionType = 'revenue' | 'expense';

export type ExpenseCategory =
  | 'hardware_purchase'
  | 'operations'
  | 'marketing'
  | 'shipping'
  | 'server_cloud'
  | 'staff'
  | 'packaging'
  | 'other';

export type RevenueCategory =
  | 'product_sales'
  | 'seller_commission'
  | 'sponsored_listing'
  | 'custom_rig_build'
  | 'repairs_maintenance'
  | 'other';

export interface AccountingTransaction {
  id: string;
  date: string;
  type: TransactionType;
  category: ExpenseCategory | RevenueCategory | string;
  description: string;
  amount: number;
  reference?: string;
  status: 'completed' | 'pending' | 'reconciled';
  paymentMethod: string;
  recordedBy: string;
}

export interface AccountingExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  vendor: string;
  reference?: string;
  receiptUrl?: string;
  status: 'paid' | 'pending' | 'approved';
  notes?: string;
  recordedBy: string;
}

export interface AccountingRevenue {
  id: string;
  title: string;
  category: RevenueCategory;
  amount: number;
  date: string;
  source: string;
  orderId?: string;
  notes?: string;
  recordedBy: string;
}

export interface BudgetPlan {
  id: string;
  name: string;
  category: string;
  allocatedAmount: number;
  usedAmount: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  year: number;
  month?: number;
  alertThresholdPercent: number; // e.g. 80
}

export interface HeaderMenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
  isExternal?: boolean;
  icon?: string;
  subItems?: HeaderMenuItem[];
}

export interface SidebarMenuItemConfig {
  id: string;
  label: string;
  url: string;
  icon: string;
  order: number;
  isVisible: boolean;
  section: 'OVERVIEW' | 'COMMERCE' | 'FINANCE' | 'CONTENT' | 'MANAGEMENT' | 'SYSTEM';
  requiredRole?: AdminRole[];
}

export interface WebsiteBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl: string;
  position: 'hero' | 'promo_top' | 'middle_ad' | 'footer_banner';
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  clickCount: number;
}

export interface WebsiteOffer {
  id: string;
  title: string;
  code: string;
  discountPercent: number;
  maxDiscount?: number;
  minSpend?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount: number;
}

export interface ActivityAuditLog {
  id: string;
  adminId: string;
  adminName: string;
  adminRole: string;
  action: string;
  module:
    | 'dashboard'
    | 'products'
    | 'categories'
    | 'orders'
    | 'customers'
    | 'sellers'
    | 'inventory'
    | 'accounting'
    | 'budget'
    | 'website'
    | 'menus'
    | 'users'
    | 'settings'
    | 'excel'
    | 'security';
  recordId?: string;
  recordTitle?: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  result: 'success' | 'warning' | 'failed';
}

export interface SystemSettings {
  websiteName: string;
  storeName?: string;
  logoUrl?: string;
  defaultCurrency: string; // 'NPR' | 'USD' | 'EUR' | 'GBP'
  currency?: string;
  currencySymbol: string; // 'Rs.' | '$' | '€' | '£'
  timezone: string;
  contactEmail: string;
  supportEmail?: string;
  supportPhone: string;
  address: string;
  taxRate?: number;
  lowStockThreshold?: number;
  notifications?: {
    emailAlerts: boolean;
    orderAlerts: boolean;
    lowStockAlerts: boolean;
    expenseAlerts: boolean;
  };
  maintenanceMode: boolean;
  sessionTimeoutMinutes: number;
  enableAutoBackup: boolean;
  enableEmailAlerts: boolean;
  demoMode: boolean;
}

export interface WebsiteContentConfig {
  announcementBar: {
    enabled: boolean;
    text: string;
    link: string;
  };
  heroSection: {
    heading: string;
    subheading: string;
    badge: string;
    backgroundImage: string;
    primaryCtaText: string;
  };
  promoBanner: {
    enabled: boolean;
    title: string;
    subtitle: string;
    discountCode: string;
    discountPercent: number;
  };
}
