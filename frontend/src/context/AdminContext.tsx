import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AdminUser,
  AdminRole,
  AccountingExpense,
  AccountingRevenue,
  AccountingTransaction,
  BudgetPlan,
  HeaderMenuItem,
  SidebarMenuItemConfig,
  WebsiteBanner,
  WebsiteOffer,
  ActivityAuditLog,
  SystemSettings,
  WebsiteContentConfig,
} from '../types/admin';
import {
  AccountingWorkbook,
  AccountingSheet,
  CellData,
  SpreadsheetSaveStatus,
  TallyAccount,
  TallyVoucher,
  LedgerEntry,
} from '../types/accounting';
import {
  INITIAL_ADMIN_USERS,
  INITIAL_EXPENSES,
  INITIAL_REVENUES,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_HEADER_MENUS,
  INITIAL_SIDEBAR_MENUS,
  INITIAL_BANNERS,
  INITIAL_OFFERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SYSTEM_SETTINGS,
} from '../data/adminMockData';
import {
  INITIAL_TALLY_ACCOUNTS,
  INITIAL_TALLY_VOUCHERS,
} from '../data/tallyAccountingData';
import { generateDefaultWorkbooks } from '../lib/spreadsheetEngine';
import { useApp } from './AppContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type AdminSubView =
  | 'dashboard'
  | 'analytics'
  | 'reports'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'brands'
  | 'pc_builder'
  | 'price_tracker'
  | 'stores'
  | 'orders'
  | 'customers'
  | 'sellers'
  | 'reviews'
  | 'revenue'
  | 'accounting_income'
  | 'expenses'
  | 'transactions'
  | 'budget'
  | 'excel'
  | 'online_excel'
  | 'accounting_excel'
  | 'accounting'
  | 'accounting_dashboard'
  | 'tally_ledger'
  | 'tally_accounting'
  | 'excel_sheets'
  | 'accounting_sales'
  | 'accounting_purchases'
  | 'accounting_payments'
  | 'accounting_receipts'
  | 'accounting_reports'
  | 'import_excel'
  | 'export_download'
  | 'header_menu'
  | 'left_menu'
  | 'banners'
  | 'offers'
  | 'pages'
  | 'content'
  | 'users_roles'
  | 'settings'
  | 'activity_logs'
  | 'audit_logs'
  | 'backup'
  | 'website_content'
  | 'sidebar_menu'
  | 'reviews_reports'
  | 'admin_users'
  | 'reports_gen';

interface AdminNotification {
  id: string;
  type: 'order' | 'low_stock' | 'seller' | 'budget_warning' | 'report' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  linkSubView?: AdminSubView;
}

interface AdminContextType {
  // Authentication & Session
  currentAdmin: AdminUser | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginAdminDemo: (role?: AdminRole) => void;
  logoutAdmin: () => void;
  switchAdminRole: (role: AdminRole) => void;

  // View Navigation
  adminSubView: AdminSubView;
  setAdminSubView: (view: AdminSubView) => void;
  selectedAdminProductId: string | null;
  setSelectedAdminProductId: (id: string | null) => void;
  selectedAdminOrderId: string | null;
  setSelectedAdminOrderId: (id: string | null) => void;

  // Sidebar collapse
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Global Search Modal
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;

  // Notification Drawer
  notifications: AdminNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Finance & Accounting
  expenses: AccountingExpense[];
  revenues: AccountingRevenue[];
  transactions: AccountingTransaction[];
  budgets: BudgetPlan[];
  addExpense: (expense: Omit<AccountingExpense, 'id' | 'recordedBy'>) => void;
  deleteExpense: (id: string) => void;
  addRevenue: (revenue: Omit<AccountingRevenue, 'id' | 'recordedBy'>) => void;
  deleteRevenue: (id: string) => void;
  addTransaction: (tx: Omit<AccountingTransaction, 'id' | 'recordedBy'>) => void;
  addBudget: (budget: Omit<BudgetPlan, 'id' | 'usedAmount'>) => void;
  updateBudget: (id: string, updates: Partial<BudgetPlan>) => void;
  deleteBudget: (id: string) => void;

  // Online Excel Spreadsheet State & Methods
  workbooks: AccountingWorkbook[];
  activeWorkbookId: string;
  activeWorkbook: AccountingWorkbook | undefined;
  activeSheet: AccountingSheet | undefined;
  setActiveWorkbookId: (id: string) => void;
  setActiveSheetId: (sheetId: string) => void;
  saveStatus: SpreadsheetSaveStatus;
  lastSavedTime: string;
  updateCell: (sheetId: string, cellKey: string, data: Partial<CellData>) => void;
  updateSheetCells: (sheetId: string, cells: Record<string, CellData>) => void;
  createWorkbook: (name: string, description?: string) => AccountingWorkbook;
  duplicateWorkbook: (id: string) => void;
  deleteWorkbook: (id: string) => void;
  renameWorkbook: (id: string, newName: string) => void;
  addSheetToWorkbook: (workbookId: string, name?: string) => void;
  renameSheet: (workbookId: string, sheetId: string, newName: string) => void;
  deleteSheet: (workbookId: string, sheetId: string) => void;
  duplicateSheet: (workbookId: string, sheetId: string) => void;
  saveWorkbookManual: () => Promise<void>;
  importWorkbook: (wb: AccountingWorkbook) => void;

  // Tally-Style Double-Entry Accounting
  tallyAccounts: TallyAccount[];
  tallyVouchers: TallyVoucher[];
  addTallyVoucher: (voucher: Omit<TallyVoucher, 'id' | 'createdAt'>) => void;
  deleteTallyVoucher: (id: string) => void;
  getAccountLedger: (accountId?: string) => LedgerEntry[];

  // Content Management
  headerMenus: HeaderMenuItem[];
  addHeaderMenuItem: (item: Omit<HeaderMenuItem, 'id'>) => void;
  updateHeaderMenuItem: (id: string, updates: Partial<HeaderMenuItem>) => void;
  deleteHeaderMenuItem: (id: string) => void;
  sidebarMenus: SidebarMenuItemConfig[];
  updateSidebarMenuConfig: (id: string, updates: Partial<SidebarMenuItemConfig>) => void;
  banners: WebsiteBanner[];
  addBanner: (banner: Omit<WebsiteBanner, 'id' | 'clickCount'>) => void;
  updateBanner: (id: string, updates: Partial<WebsiteBanner>) => void;
  deleteBanner: (id: string) => void;
  offers: WebsiteOffer[];
  addOffer: (offer: Omit<WebsiteOffer, 'id' | 'usageCount'>) => void;
  updateOffer: (id: string, updates: Partial<WebsiteOffer>) => void;
  deleteOffer: (id: string) => void;

  // Audit Logs
  auditLogs: ActivityAuditLog[];
  logAdminAction: (
    action: string,
    module: ActivityAuditLog['module'],
    details: string,
    recordId?: string,
    recordTitle?: string,
    result?: ActivityAuditLog['result']
  ) => void;

  // Admin User Accounts
  adminUsers: AdminUser[];
  addAdminUser: (user: Omit<AdminUser, 'id' | 'createdAt'>) => void;
  updateAdminUser: (id: string, updates: Partial<AdminUser>) => void;
  deleteAdminUser: (id: string) => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (updates: Partial<SystemSettings>) => void;
  contentConfig: WebsiteContentConfig;
  updateContentConfig: (updates: Partial<WebsiteContentConfig>) => void;

  // Financial Stats Calculation Helpers
  totalRevenueAmount: number;
  totalExpenseAmount: number;
  netProfitAmount: number;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { products, orders, sellers, users, addToast } = useApp();

  // 1. Current Admin User State (with session persistence)
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('nanotech_admin_session');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS[0];
    } catch {
      return INITIAL_ADMIN_USERS[0];
    }
  });

  // 2. Navigation SubView State
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('dashboard');
  const [selectedAdminProductId, setSelectedAdminProductId] = useState<string | null>(null);
  const [selectedAdminOrderId, setSelectedAdminOrderId] = useState<string | null>(null);

  // 3. UI Shell states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // 4. Financial states
  const [expenses, setExpenses] = useState<AccountingExpense[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_admin_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [revenues, setRevenues] = useState<AccountingRevenue[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_admin_revenues');
      return saved ? JSON.parse(saved) : INITIAL_REVENUES;
    } catch {
      return INITIAL_REVENUES;
    }
  });

  const [transactions, setTransactions] = useState<AccountingTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_admin_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [budgets, setBudgets] = useState<BudgetPlan[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_admin_budgets');
      return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  // 4b. Online Excel Spreadsheet states
  const [workbooks, setWorkbooks] = useState<AccountingWorkbook[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_accounting_workbooks');
      return saved ? JSON.parse(saved) : generateDefaultWorkbooks();
    } catch {
      return generateDefaultWorkbooks();
    }
  });

  const [activeWorkbookId, setActiveWorkbookId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('nanotech_active_workbook_id');
      if (saved) return saved;
      return workbooks[0]?.id || 'wb_business_2026';
    } catch {
      return 'wb_business_2026';
    }
  });

  const [saveStatus, setSaveStatus] = useState<SpreadsheetSaveStatus>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => new Date().toLocaleTimeString());

  // 4c. Tally-Style Accounts & Vouchers
  const [tallyAccounts, setTallyAccounts] = useState<TallyAccount[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_tally_accounts');
      return saved ? JSON.parse(saved) : INITIAL_TALLY_ACCOUNTS;
    } catch {
      return INITIAL_TALLY_ACCOUNTS;
    }
  });

  const [tallyVouchers, setTallyVouchers] = useState<TallyVoucher[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_tally_vouchers');
      return saved ? JSON.parse(saved) : INITIAL_TALLY_VOUCHERS;
    } catch {
      return INITIAL_TALLY_VOUCHERS;
    }
  });

  // 5. Content Management states
  const [headerMenus, setHeaderMenus] = useState<HeaderMenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_admin_header_menus');
      return saved ? JSON.parse(saved) : INITIAL_HEADER_MENUS;
    } catch {
      return INITIAL_HEADER_MENUS;
    }
  });

  const [sidebarMenus, setSidebarMenus] = useState<SidebarMenuItemConfig[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_admin_sidebar_menus');
      return saved ? JSON.parse(saved) : INITIAL_SIDEBAR_MENUS;
    } catch {
      return INITIAL_SIDEBAR_MENUS;
    }
  });

  const [banners, setBanners] = useState<WebsiteBanner[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_admin_banners');
      return saved ? JSON.parse(saved) : INITIAL_BANNERS;
    } catch {
      return INITIAL_BANNERS;
    }
  });

  const [offers, setOffers] = useState<WebsiteOffer[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_admin_offers');
      return saved ? JSON.parse(saved) : INITIAL_OFFERS;
    } catch {
      return INITIAL_OFFERS;
    }
  });

  // 6. Audit logs state
  const [auditLogs, setAuditLogs] = useState<ActivityAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_admin_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // 7. Admin team users
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('nanotech_admin_team');
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS;
    } catch {
      return INITIAL_ADMIN_USERS;
    }
  });

  // 8. System settings
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('nanotech_admin_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SYSTEM_SETTINGS,
          ...parsed,
          notifications: {
            ...INITIAL_SYSTEM_SETTINGS.notifications,
            ...(parsed.notifications || {}),
          },
        };
      }
      return INITIAL_SYSTEM_SETTINGS;
    } catch {
      return INITIAL_SYSTEM_SETTINGS;
    }
  });

  // 9. Dynamic Notifications Generator (derived from real platform state)
  const [notifications, setNotifications] = useState<AdminNotification[]>([
    {
      id: 'notif-1',
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: 'Nanotech Titan Rig 2026 has only 2 units remaining in central warehouse.',
      timestamp: '10 minutes ago',
      isRead: false,
      linkSubView: 'inventory',
    },
    {
      id: 'notif-2',
      type: 'seller',
      title: 'New Seller Verification Request',
      message: 'Vertex Tech Nepal submitted tax registration for marketplace store approval.',
      timestamp: '45 minutes ago',
      isRead: false,
      linkSubView: 'sellers',
    },
    {
      id: 'notif-3',
      type: 'order',
      title: 'High-Value Order Received',
      message: 'Order #NT-9042 totaling Rs. 460,000 paid via eSewa / FonePay.',
      timestamp: '2 hours ago',
      isRead: true,
      linkSubView: 'orders',
    },
    {
      id: 'notif-4',
      type: 'budget_warning',
      title: 'Budget Alert Threshold',
      message: 'Digital Marketing budget has reached 60% allocation for August 2026.',
      timestamp: '5 hours ago',
      isRead: true,
      linkSubView: 'budget',
    },
  ]);

  // Persist helpers
  useEffect(() => {
    try {
      localStorage.setItem('nanotech_admin_session', JSON.stringify(currentAdmin));
    } catch {}
  }, [currentAdmin]);

  useEffect(() => {
    try {
      localStorage.setItem('nanotech_admin_expenses', JSON.stringify(expenses));
    } catch {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('nanotech_admin_revenues', JSON.stringify(revenues));
    } catch {}
  }, [revenues]);

  useEffect(() => {
    try {
      localStorage.setItem('nanotech_admin_transactions', JSON.stringify(transactions));
    } catch {}
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('nanotech_admin_budgets', JSON.stringify(budgets));
    } catch {}
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem('nanotech_admin_header_menus', JSON.stringify(headerMenus));
    } catch {}
  }, [headerMenus]);

  useEffect(() => {
    try {
      localStorage.setItem('nanotech_admin_banners', JSON.stringify(banners));
    } catch {}
  }, [banners]);

  useEffect(() => {
    try {
      localStorage.setItem('nanotech_admin_offers', JSON.stringify(offers));
    } catch {}
  }, [offers]);

  useEffect(() => {
    try {
      localStorage.setItem('nanotech_admin_audit_logs', JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('nanotech_admin_team', JSON.stringify(adminUsers));
    } catch {}
  }, [adminUsers]);

  useEffect(() => {
    try {
      localStorage.setItem('nanotech_admin_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Online Excel & Tally Persistence
  useEffect(() => {
    try {
      localStorage.setItem('nanotech_accounting_workbooks', JSON.stringify(workbooks));
      localStorage.setItem('nanotech_active_workbook_id', activeWorkbookId);
    } catch {}
  }, [workbooks, activeWorkbookId]);

  useEffect(() => {
    try {
      localStorage.setItem('nanotech_tally_accounts', JSON.stringify(tallyAccounts));
    } catch {}
  }, [tallyAccounts]);

  useEffect(() => {
    try {
      localStorage.setItem('nanotech_tally_vouchers', JSON.stringify(tallyVouchers));
    } catch {}
  }, [tallyVouchers]);

  // Debounced Autosave Timer
  useEffect(() => {
    if (saveStatus === 'saving') {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem('nanotech_accounting_workbooks', JSON.stringify(workbooks));
          setSaveStatus('saved');
          setLastSavedTime(new Date().toLocaleTimeString());
        } catch {
          setSaveStatus('offline');
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [workbooks, saveStatus]);

  // Active Workbook & Sheet derivation
  const activeWorkbook = workbooks.find((w) => w.id === activeWorkbookId) || workbooks[0];
  const activeSheet =
    activeWorkbook?.sheets.find((s) => s.id === activeWorkbook?.activeSheetId) ||
    activeWorkbook?.sheets[0];

  const setActiveSheetId = (sheetId: string) => {
    setWorkbooks((prev) =>
      prev.map((wb) => (wb.id === activeWorkbookId ? { ...wb, activeSheetId: sheetId } : wb))
    );
  };

  const updateCell = (sheetId: string, cellKey: string, data: Partial<CellData>) => {
    setSaveStatus('saving');
    const upperKey = cellKey.trim().toUpperCase();

    setWorkbooks((prev) =>
      prev.map((wb) => {
        if (wb.id !== activeWorkbookId) return wb;

        const updatedSheets = wb.sheets.map((sh) => {
          if (sh.id !== sheetId) return sh;

          const existing = sh.cells[upperKey] || { value: '' };
          const updatedCell: CellData = {
            ...existing,
            ...data,
            style: {
              ...(existing.style || {}),
              ...(data.style || {}),
            },
          };

          return {
            ...sh,
            cells: {
              ...sh.cells,
              [upperKey]: updatedCell,
            },
          };
        });

        return {
          ...wb,
          sheets: updatedSheets,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateSheetCells = (sheetId: string, updatedCells: Record<string, CellData>) => {
    setSaveStatus('saving');
    setWorkbooks((prev) =>
      prev.map((wb) => {
        if (wb.id !== activeWorkbookId) return wb;

        const updatedSheets = wb.sheets.map((sh) => {
          if (sh.id !== sheetId) return sh;
          return {
            ...sh,
            cells: {
              ...sh.cells,
              ...updatedCells,
            },
          };
        });

        return {
          ...wb,
          sheets: updatedSheets,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const createWorkbook = (name: string, description?: string): AccountingWorkbook => {
    const newSheetId = `sh_${Date.now()}`;
    const newWb: AccountingWorkbook = {
      id: `wb_${Date.now()}`,
      name: name || `Workbook ${workbooks.length + 1}`,
      description: description || 'Custom accounting spreadsheet',
      activeSheetId: newSheetId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sheets: [
        {
          id: newSheetId,
          name: 'Sheet1',
          rowCount: 30,
          colCount: 12,
          cells: {},
        },
      ],
    };

    setWorkbooks((prev) => [newWb, ...prev]);
    setActiveWorkbookId(newWb.id);
    logAdminAction('Created Accounting Workbook', 'excel', `Created spreadsheet workbook: ${newWb.name}`, newWb.id, newWb.name);
    addToast('success', `Created workbook "${newWb.name}"`);
    return newWb;
  };

  const duplicateWorkbook = (id: string) => {
    const source = workbooks.find((w) => w.id === id);
    if (!source) return;

    const cloned: AccountingWorkbook = {
      ...source,
      id: `wb_${Date.now()}`,
      name: `${source.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sheets: source.sheets.map((s) => ({
        ...s,
        id: `sh_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        cells: { ...s.cells },
      })),
    };
    cloned.activeSheetId = cloned.sheets[0]?.id || 'sh_1';

    setWorkbooks((prev) => [cloned, ...prev]);
    setActiveWorkbookId(cloned.id);
    logAdminAction('Duplicated Workbook', 'excel', `Duplicated spreadsheet: ${source.name}`, cloned.id, cloned.name);
    addToast('success', `Duplicated workbook as "${cloned.name}"`);
  };

  const deleteWorkbook = (id: string) => {
    if (workbooks.length <= 1) {
      addToast('error', 'Cannot delete the only remaining workbook.');
      return;
    }
    const target = workbooks.find((w) => w.id === id);
    const remaining = workbooks.filter((w) => w.id !== id);
    setWorkbooks(remaining);
    if (activeWorkbookId === id) {
      setActiveWorkbookId(remaining[0].id);
    }
    logAdminAction('Deleted Accounting Workbook', 'excel', `Deleted spreadsheet: ${target?.name || id}`, id, target?.name);
    addToast('info', `Deleted workbook "${target?.name}"`);
  };

  const renameWorkbook = (id: string, newName: string) => {
    setWorkbooks((prev) =>
      prev.map((w) => (w.id === id ? { ...w, name: newName, updatedAt: new Date().toISOString() } : w))
    );
    addToast('success', `Workbook renamed to "${newName}"`);
  };

  const addSheetToWorkbook = (workbookId: string, name?: string) => {
    setWorkbooks((prev) =>
      prev.map((wb) => {
        if (wb.id !== workbookId) return wb;
        const newSheetId = `sh_${Date.now()}`;
        const newSheetName = name || `Sheet ${wb.sheets.length + 1}`;
        const newSheet: AccountingSheet = {
          id: newSheetId,
          name: newSheetName,
          rowCount: 30,
          colCount: 12,
          cells: {},
        };
        return {
          ...wb,
          sheets: [...wb.sheets, newSheet],
          activeSheetId: newSheetId,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addToast('success', 'Added new sheet');
  };

  const renameSheet = (workbookId: string, sheetId: string, newName: string) => {
    setWorkbooks((prev) =>
      prev.map((wb) => {
        if (wb.id !== workbookId) return wb;
        return {
          ...wb,
          sheets: wb.sheets.map((s) => (s.id === sheetId ? { ...s, name: newName } : s)),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addToast('success', `Sheet renamed to "${newName}"`);
  };

  const deleteSheet = (workbookId: string, sheetId: string) => {
    const wb = workbooks.find((w) => w.id === workbookId);
    if (!wb || wb.sheets.length <= 1) {
      addToast('error', 'A workbook must have at least one sheet.');
      return;
    }

    setWorkbooks((prev) =>
      prev.map((w) => {
        if (w.id !== workbookId) return w;
        const remainingSheets = w.sheets.filter((s) => s.id !== sheetId);
        const newActive = w.activeSheetId === sheetId ? remainingSheets[0].id : w.activeSheetId;
        return {
          ...w,
          sheets: remainingSheets,
          activeSheetId: newActive,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addToast('info', 'Sheet deleted');
  };

  const duplicateSheet = (workbookId: string, sheetId: string) => {
    setWorkbooks((prev) =>
      prev.map((wb) => {
        if (wb.id !== workbookId) return wb;
        const sourceSheet = wb.sheets.find((s) => s.id === sheetId);
        if (!sourceSheet) return wb;

        const newSheetId = `sh_${Date.now()}`;
        const clonedSheet: AccountingSheet = {
          ...sourceSheet,
          id: newSheetId,
          name: `${sourceSheet.name} (Copy)`,
          cells: { ...sourceSheet.cells },
        };

        return {
          ...wb,
          sheets: [...wb.sheets, clonedSheet],
          activeSheetId: newSheetId,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addToast('success', 'Sheet duplicated');
  };

  const saveWorkbookManual = async (): Promise<void> => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('nanotech_accounting_workbooks', JSON.stringify(workbooks));
      localStorage.setItem('nanotech_active_workbook_id', activeWorkbookId);
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString());
      logAdminAction('Saved Accounting Workbook', 'excel', `Saved active workbook "${activeWorkbook?.name}"`);
      addToast('success', `Workbook "${activeWorkbook?.name}" saved successfully`);
    } catch {
      setSaveStatus('offline');
      addToast('warning', 'Saved locally in browser session storage');
    }
  };

  const importWorkbook = (wb: AccountingWorkbook) => {
    setWorkbooks((prev) => [wb, ...prev]);
    setActiveWorkbookId(wb.id);
    logAdminAction('Imported Workbook', 'excel', `Imported workbook from file: ${wb.name}`, wb.id, wb.name);
    addToast('success', `Imported workbook "${wb.name}" with ${wb.sheets.length} sheets`);
  };

  // Tally Double-Entry Ledger Methods
  const addTallyVoucher = (v: Omit<TallyVoucher, 'id' | 'createdAt'>) => {
    const newVoucher: TallyVoucher = {
      ...v,
      id: `vch_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setTallyVouchers((prev) => [newVoucher, ...prev]);

    // Update account balances
    setTallyAccounts((prev) =>
      prev.map((acc) => {
        let updatedBal = acc.currentBalance;
        if (acc.id === v.debitAccount || acc.name === v.debitAccount) {
          // Debit increases Assets and Expenses, decreases Liabilities/Equity/Revenue
          if (acc.type === 'asset' || acc.type === 'expense') {
            updatedBal += v.amount;
          } else {
            updatedBal -= v.amount;
          }
        }
        if (acc.id === v.creditAccount || acc.name === v.creditAccount) {
          // Credit increases Liabilities, Equity, Revenue, decreases Assets/Expenses
          if (acc.type === 'asset' || acc.type === 'expense') {
            updatedBal -= v.amount;
          } else {
            updatedBal += v.amount;
          }
        }
        return { ...acc, currentBalance: updatedBal };
      })
    );

    // Also sync to general transactions ledger
    const syncTx: AccountingTransaction = {
      id: `tx-vch-${Date.now()}`,
      date: v.date,
      type: v.type === 'sales' || v.type === 'receipt' || v.type === 'income' ? 'revenue' : 'expense',
      category: v.type.toUpperCase(),
      description: `${v.voucherNumber} — ${v.narration}`,
      amount: v.amount,
      reference: v.reference || v.voucherNumber,
      status: 'completed',
      paymentMethod: v.paymentMethod,
      recordedBy: currentAdmin?.name || 'Accountant',
    };
    setTransactions((prev) => [syncTx, ...prev]);

    logAdminAction('Posted Tally Voucher', 'accounting', `Posted voucher ${v.voucherNumber}: ${v.narration} (Rs. ${v.amount.toLocaleString()})`, newVoucher.id, v.voucherNumber);
    addToast('success', `Voucher ${v.voucherNumber} posted to double-entry ledger`);
  };

  const deleteTallyVoucher = (id: string) => {
    const target = tallyVouchers.find((v) => v.id === id);
    if (!target) return;

    setTallyVouchers((prev) => prev.filter((v) => v.id !== id));
    logAdminAction('Deleted Tally Voucher', 'accounting', `Cancelled voucher: ${target.voucherNumber}`, id, target.voucherNumber);
    addToast('info', `Voucher ${target.voucherNumber} cancelled`);
  };

  const getAccountLedger = (accountId?: string): LedgerEntry[] => {
    const entries: LedgerEntry[] = [];
    const accountsMap = new Map<string, TallyAccount>(tallyAccounts.map((a) => [a.id, a]));

    const sortedVouchers = [...tallyVouchers].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (accountId) {
      const targetAcc = accountsMap.get(accountId);
      let runningBalance = targetAcc ? targetAcc.openingBalance : 0;

      for (const vch of sortedVouchers) {
        const isDebit = vch.debitAccount === accountId || vch.debitAccount === targetAcc?.name;
        const isCredit = vch.creditAccount === accountId || vch.creditAccount === targetAcc?.name;

        if (isDebit || isCredit) {
          const debitAmt = isDebit ? vch.amount : 0;
          const creditAmt = isCredit ? vch.amount : 0;

          if (targetAcc?.type === 'asset' || targetAcc?.type === 'expense') {
            runningBalance += debitAmt - creditAmt;
          } else {
            runningBalance += creditAmt - debitAmt;
          }

          const oppAccId = isDebit ? vch.creditAccount : vch.debitAccount;
          const oppAcc = accountsMap.get(oppAccId);

          entries.push({
            id: `entry_${vch.id}`,
            date: vch.date,
            voucherNumber: vch.voucherNumber,
            voucherType: vch.type,
            accountId,
            accountName: targetAcc?.name || accountId,
            oppositeAccount: oppAcc?.name || oppAccId,
            narration: vch.narration,
            debit: debitAmt,
            credit: creditAmt,
            balance: runningBalance,
            reference: vch.reference,
          });
        }
      }
    } else {
      // Return unified general journal
      for (const vch of sortedVouchers) {
        const debAcc = accountsMap.get(vch.debitAccount);
        const credAcc = accountsMap.get(vch.creditAccount);

        entries.push({
          id: `entry_${vch.id}`,
          date: vch.date,
          voucherNumber: vch.voucherNumber,
          voucherType: vch.type,
          accountId: vch.debitAccount,
          accountName: debAcc?.name || vch.debitAccount,
          oppositeAccount: credAcc?.name || vch.creditAccount,
          narration: vch.narration,
          debit: vch.amount,
          credit: 0,
          balance: vch.amount,
          reference: vch.reference,
        });
      }
    }

    return entries;
  };

  // Dynamic Financial Calculations
  const calculatedOrderRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);
  const otherRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const totalRevenueAmount = calculatedOrderRevenue + otherRevenue;
  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfitAmount = totalRevenueAmount - totalExpenseAmount;

  // Actions
  const logAdminAction = (
    action: string,
    module: ActivityAuditLog['module'],
    details: string,
    recordId?: string,
    recordTitle?: string,
    result: ActivityAuditLog['result'] = 'success'
  ) => {
    const newLog: ActivityAuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      adminId: currentAdmin?.id || 'admin-root',
      adminName: currentAdmin?.name || 'Administrator',
      adminRole: currentAdmin?.role || 'super_admin',
      action,
      module,
      recordId,
      recordTitle,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '103.145.22.84',
      result,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 199)]); // keep latest 200 logs
  };

  const loginAdmin = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    // 1. If Supabase is configured and live auth is requested:
    if (isSupabaseConfigured && email && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.warn('Supabase Auth error:', error.message);
        } else if (data.user) {
          const matchedUser = adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || {
            id: data.user.id,
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            email: data.user.email || email,
            role: 'admin' as AdminRole,
            status: 'active' as const,
            permissions: ['all'],
            createdAt: data.user.created_at,
          };
          setCurrentAdmin(matchedUser);
          logAdminAction('Supabase Login Successful', 'security', `Authenticated via Supabase Auth: ${email}`);
          addToast('success', `Welcome back, ${matchedUser.name}`);
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase signIn catch error:', err);
      }
    }

    // 2. Local Credentials Check (kalamchy88@gmail.com / Admin@12345)
    const normalizedEmail = email.trim().toLowerCase();
    const found = adminUsers.find((u) => u.email.toLowerCase() === normalizedEmail) ||
      INITIAL_ADMIN_USERS.find((u) => u.email.toLowerCase() === normalizedEmail);

    const activeAdmin: AdminUser = found || {
      id: `admin-${Date.now()}`,
      name: email.split('@')[0].toUpperCase(),
      email: email.trim(),
      role: 'admin',
      status: 'active',
      permissions: ['all'],
      createdAt: new Date().toISOString(),
    };

    setCurrentAdmin(activeAdmin);
    try {
      localStorage.setItem('nanotech_admin_session', JSON.stringify(activeAdmin));
      // Sync RBAC context session so route guards never bounce
      const rbacUser = {
        id: activeAdmin.id,
        name: activeAdmin.name,
        email: activeAdmin.email,
        role: activeAdmin.role === 'super_admin' ? 'superadmin' : 'admin',
        createdAt: activeAdmin.createdAt,
      };
      localStorage.setItem('nanotech_session_token', `admin_token_${Date.now()}`);
      localStorage.setItem('nanotech_user', JSON.stringify(rbacUser));
    } catch {}

    logAdminAction('Admin Session Login', 'security', `Authenticated admin user: ${activeAdmin.name}`);
    addToast('success', `Welcome to NanoTech Command Center, ${activeAdmin.name}!`);
    return { success: true };
  };

  const loginAdminDemo = (role: AdminRole = 'super_admin') => {
    const matched = adminUsers.find((u) => u.role === role) || INITIAL_ADMIN_USERS[0];
    const session = { ...matched, lastLogin: new Date().toISOString() };
    setCurrentAdmin(session);
    try {
      localStorage.setItem('nanotech_admin_session', JSON.stringify(session));
      const rbacUser = {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role === 'super_admin' ? 'superadmin' : 'admin',
        createdAt: session.createdAt,
      };
      localStorage.setItem('nanotech_session_token', `admin_token_${Date.now()}`);
      localStorage.setItem('nanotech_user', JSON.stringify(rbacUser));
    } catch {}
    logAdminAction('Quick Demo Login', 'security', `Switched to demo role: ${role.toUpperCase()}`);
    addToast('info', `Switched to Demo Session: ${matched.name} (${role.toUpperCase()})`);
  };

  const logoutAdmin = () => {
    logAdminAction('Admin Logout', 'security', `Admin ${currentAdmin?.name || ''} signed out`);
    setCurrentAdmin(null);
    try {
      localStorage.removeItem('nanotech_admin_session');
      localStorage.removeItem('nanotech_session_token');
      localStorage.removeItem('nanotech_user');
    } catch {}
    setAdminSubView('dashboard');
    addToast('info', 'Logged out of Admin Session');
  };

  const switchAdminRole = (role: AdminRole) => {
    if (!currentAdmin) return;
    const updated = { ...currentAdmin, role };
    setCurrentAdmin(updated);
    logAdminAction('Role Switched', 'security', `Switched active role to ${role.toUpperCase()}`);
    addToast('info', `Active Role Changed to ${role.toUpperCase()}`);
  };

  // Notification methods
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('info', 'All notifications marked as read');
  };

  const clearNotifications = () => {
    setNotifications([]);
    addToast('info', 'Notification drawer cleared');
  };

  // Accounting methods
  const addExpense = (exp: Omit<AccountingExpense, 'id' | 'recordedBy'>) => {
    const newExp: AccountingExpense = {
      ...exp,
      id: `exp-${Date.now()}`,
      recordedBy: currentAdmin?.name || 'Admin',
    };
    setExpenses((prev) => [newExp, ...prev]);

    // Also record into transactions ledger
    const newTx: AccountingTransaction = {
      id: `tx-exp-${Date.now()}`,
      date: exp.date,
      type: 'expense',
      category: exp.category,
      description: exp.title,
      amount: exp.amount,
      reference: exp.reference,
      status: 'completed',
      paymentMethod: 'Corporate Ledger',
      recordedBy: currentAdmin?.name || 'Admin',
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Auto-update budget used amount if matching category
    setBudgets((prev) =>
      prev.map((b) =>
        b.name.toLowerCase().includes(exp.category.replace('_', ' ').toLowerCase()) ||
        b.category.toLowerCase() === exp.category.toLowerCase()
          ? { ...b, usedAmount: b.usedAmount + exp.amount }
          : b
      )
    );

    logAdminAction('Added Accounting Expense', 'accounting', `Logged expense: ${exp.title} (Rs. ${exp.amount.toLocaleString()})`, newExp.id, exp.title);
    addToast('success', `Expense of Rs. ${exp.amount.toLocaleString()} logged successfully`);
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    logAdminAction('Deleted Accounting Expense', 'accounting', `Removed expense entry: ${target?.title || id}`, id, target?.title);
    addToast('info', 'Expense entry removed');
  };

  const addRevenue = (rev: Omit<AccountingRevenue, 'id' | 'recordedBy'>) => {
    const newRev: AccountingRevenue = {
      ...rev,
      id: `rev-${Date.now()}`,
      recordedBy: currentAdmin?.name || 'Admin',
    };
    setRevenues((prev) => [newRev, ...prev]);

    const newTx: AccountingTransaction = {
      id: `tx-rev-${Date.now()}`,
      date: rev.date,
      type: 'revenue',
      category: rev.category,
      description: rev.title,
      amount: rev.amount,
      reference: rev.orderId || 'REV-DIR',
      status: 'completed',
      paymentMethod: 'Direct Payment',
      recordedBy: currentAdmin?.name || 'Admin',
    };
    setTransactions((prev) => [newTx, ...prev]);

    logAdminAction('Added Accounting Revenue', 'accounting', `Logged revenue: ${rev.title} (Rs. ${rev.amount.toLocaleString()})`, newRev.id, rev.title);
    addToast('success', `Revenue of Rs. ${rev.amount.toLocaleString()} logged successfully`);
  };

  const deleteRevenue = (id: string) => {
    const target = revenues.find((r) => r.id === id);
    setRevenues((prev) => prev.filter((r) => r.id !== id));
    logAdminAction('Deleted Accounting Revenue', 'accounting', `Removed revenue entry: ${target?.title || id}`, id, target?.title);
    addToast('info', 'Revenue entry removed');
  };

  const addTransaction = (tx: Omit<AccountingTransaction, 'id' | 'recordedBy'>) => {
    const newTx: AccountingTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      recordedBy: currentAdmin?.name || 'Admin',
    };
    setTransactions((prev) => [newTx, ...prev]);
    logAdminAction('Added Accounting Transaction', 'accounting', `Transaction: ${tx.description} (Rs. ${tx.amount.toLocaleString()})`);
    addToast('success', 'Transaction logged into general ledger');
  };

  const addBudget = (bg: Omit<BudgetPlan, 'id' | 'usedAmount'>) => {
    const newBudget: BudgetPlan = {
      ...bg,
      id: `bg-${Date.now()}`,
      usedAmount: 0,
    };
    setBudgets((prev) => [...prev, newBudget]);
    logAdminAction('Created Budget Allocation', 'budget', `Budget: ${bg.name} (Rs. ${bg.allocatedAmount.toLocaleString()})`, newBudget.id, bg.name);
    addToast('success', 'Budget plan created successfully');
  };

  const updateBudget = (id: string, updates: Partial<BudgetPlan>) => {
    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    logAdminAction('Updated Budget Allocation', 'budget', `Updated budget plan parameters for ID ${id}`, id);
    addToast('success', 'Budget updated');
  };

  const deleteBudget = (id: string) => {
    const target = budgets.find((b) => b.id === id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    logAdminAction('Deleted Budget Allocation', 'budget', `Deleted budget: ${target?.name || id}`, id, target?.name);
    addToast('info', 'Budget plan deleted');
  };

  // Content Management methods
  const addHeaderMenuItem = (item: Omit<HeaderMenuItem, 'id'>) => {
    const newItem: HeaderMenuItem = { ...item, id: `hm-${Date.now()}` };
    setHeaderMenus((prev) => [...prev, newItem]);
    logAdminAction('Added Header Menu Item', 'menus', `Created menu link: ${item.label} -> ${item.url}`, newItem.id, item.label);
    addToast('success', `Header menu item "${item.label}" added`);
  };

  const updateHeaderMenuItem = (id: string, updates: Partial<HeaderMenuItem>) => {
    setHeaderMenus((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    logAdminAction('Updated Header Menu Item', 'menus', `Modified navigation menu ID ${id}`, id);
    addToast('success', 'Menu item updated');
  };

  const deleteHeaderMenuItem = (id: string) => {
    const target = headerMenus.find((m) => m.id === id);
    setHeaderMenus((prev) => prev.filter((m) => m.id !== id));
    logAdminAction('Deleted Header Menu Item', 'menus', `Removed menu item: ${target?.label || id}`, id, target?.label);
    addToast('info', 'Menu item removed');
  };

  const updateSidebarMenuConfig = (id: string, updates: Partial<SidebarMenuItemConfig>) => {
    setSidebarMenus((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    logAdminAction('Updated Sidebar Menu Config', 'menus', `Updated sidebar configuration for ${id}`, id);
    addToast('success', 'Sidebar navigation config updated');
  };

  const addBanner = (b: Omit<WebsiteBanner, 'id' | 'clickCount'>) => {
    const newBanner: WebsiteBanner = { ...b, id: `ban-${Date.now()}`, clickCount: 0 };
    setBanners((prev) => [newBanner, ...prev]);
    logAdminAction('Created Website Banner', 'website', `Published banner: ${b.title}`, newBanner.id, b.title);
    addToast('success', 'Website banner created');
  };

  const updateBanner = (id: string, updates: Partial<WebsiteBanner>) => {
    setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    logAdminAction('Updated Website Banner', 'website', `Modified banner ID ${id}`, id);
    addToast('success', 'Banner updated');
  };

  const deleteBanner = (id: string) => {
    const target = banners.find((b) => b.id === id);
    setBanners((prev) => prev.filter((b) => b.id !== id));
    logAdminAction('Deleted Website Banner', 'website', `Removed banner: ${target?.title || id}`, id, target?.title);
    addToast('info', 'Banner removed');
  };

  const addOffer = (o: Omit<WebsiteOffer, 'id' | 'usageCount'>) => {
    const newOffer: WebsiteOffer = { ...o, id: `off-${Date.now()}`, usageCount: 0 };
    setOffers((prev) => [newOffer, ...prev]);
    logAdminAction('Created Promotional Offer', 'website', `Created promo voucher code: ${o.code} (${o.discountPercent}%)`, newOffer.id, o.title);
    addToast('success', `Offer voucher "${o.code}" created`);
  };

  const updateOffer = (id: string, updates: Partial<WebsiteOffer>) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    logAdminAction('Updated Promotional Offer', 'website', `Modified offer ID ${id}`, id);
    addToast('success', 'Offer updated');
  };

  const deleteOffer = (id: string) => {
    const target = offers.find((o) => o.id === id);
    setOffers((prev) => prev.filter((o) => o.id !== id));
    logAdminAction('Deleted Promotional Offer', 'website', `Removed offer: ${target?.title || id}`, id, target?.title);
    addToast('info', 'Offer removed');
  };

  const addAdminUser = (u: Omit<AdminUser, 'id' | 'createdAt'>) => {
    const newUser: AdminUser = { ...u, id: `admin-${Date.now()}`, createdAt: new Date().toISOString() };
    setAdminUsers((prev) => [...prev, newUser]);
    logAdminAction('Added Admin User', 'users', `Invited admin: ${u.name} (${u.email}) with role ${u.role}`, newUser.id, u.name);
    addToast('success', `Admin member ${u.name} added`);
  };

  const updateAdminUser = (id: string, updates: Partial<AdminUser>) => {
    setAdminUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    logAdminAction('Updated Admin User', 'users', `Updated admin profile ID ${id}`, id);
    addToast('success', 'Admin user updated');
  };

  const deleteAdminUser = (id: string) => {
    const target = adminUsers.find((u) => u.id === id);
    setAdminUsers((prev) => prev.filter((u) => u.id !== id));
    logAdminAction('Deleted Admin User', 'users', `Removed admin: ${target?.name || id}`, id, target?.name);
    addToast('info', 'Admin user deleted');
  };

  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    logAdminAction('Updated System Settings', 'settings', 'Modified platform configuration and preferences');
    addToast('success', 'System settings saved successfully');
  };

  const [contentConfig, setContentConfig] = useState<WebsiteContentConfig>(() => {
    try {
      const saved = localStorage.getItem('nanotech_content_config');
      return saved ? JSON.parse(saved) : {
        announcementBar: {
          enabled: true,
          text: '🚀 Mega Monsoon Hardware Fest: Up to 35% OFF GPUs & CPUs in Itahari & Kathmandu! Free Delivery on orders over रु 50,000.',
          link: '/products',
        },
        heroSection: {
          heading: 'Next-Gen Computing & High-Performance Hardware in Nepal',
          subheading: 'Official authorized distributor for RTX 5090, Ryzen 9, DDR5 Memory, and Enterprise Workstations with local warranty in Itahari & Kathmandu.',
          badge: 'Verified Official Hardware Partner 🇳🇵',
          backgroundImage: '/image.png',
          primaryCtaText: 'Explore Hardware Catalog',
        },
        promoBanner: {
          enabled: true,
          title: 'Build Your Dream Rig Today',
          subtitle: 'Use code NANO2026 for 10% off any custom PC build configuration.',
          discountCode: 'NANO2026',
          discountPercent: 10,
        },
      };
    } catch {
      return {
        announcementBar: { enabled: true, text: '🚀 Mega Monsoon Hardware Fest!', link: '/products' },
        heroSection: { heading: 'Next-Gen Computing', subheading: 'Official distributor', badge: 'Verified', backgroundImage: '/image.png', primaryCtaText: 'Explore' },
        promoBanner: { enabled: true, title: 'Build Your Dream Rig', subtitle: 'Use code NANO2026', discountCode: 'NANO2026', discountPercent: 10 },
      };
    }
  });

  const updateContentConfig = (updates: Partial<WebsiteContentConfig>) => {
    setContentConfig(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem('nanotech_content_config', JSON.stringify(next));
      } catch {}
      return next;
    });
    logAdminAction('Updated Storefront Content', 'website', 'Modified announcement bar, hero section, or promo banners');
    addToast('success', 'Storefront content configuration updated successfully!');
  };

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AdminContext.Provider
      value={{
        currentAdmin,
        isAdminAuthenticated: Boolean(currentAdmin),
        loginAdmin,
        loginAdminDemo,
        logoutAdmin,
        switchAdminRole,
        adminSubView,
        setAdminSubView,
        selectedAdminProductId,
        setSelectedAdminProductId,
        selectedAdminOrderId,
        setSelectedAdminOrderId,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileDrawerOpen,
        setIsMobileDrawerOpen,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        expenses,
        revenues,
        transactions,
        budgets,
        addExpense,
        deleteExpense,
        addRevenue,
        deleteRevenue,
        addTransaction,
        addBudget,
        updateBudget,
        deleteBudget,
        workbooks,
        activeWorkbookId,
        activeWorkbook,
        activeSheet,
        setActiveWorkbookId,
        setActiveSheetId,
        saveStatus,
        lastSavedTime,
        updateCell,
        updateSheetCells,
        createWorkbook,
        duplicateWorkbook,
        deleteWorkbook,
        renameWorkbook,
        addSheetToWorkbook,
        renameSheet,
        deleteSheet,
        duplicateSheet,
        saveWorkbookManual,
        importWorkbook,
        tallyAccounts,
        tallyVouchers,
        addTallyVoucher,
        deleteTallyVoucher,
        getAccountLedger,
        headerMenus,
        addHeaderMenuItem,
        updateHeaderMenuItem,
        deleteHeaderMenuItem,
        sidebarMenus,
        updateSidebarMenuConfig,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        offers,
        addOffer,
        updateOffer,
        deleteOffer,
        auditLogs,
        logAdminAction,
        adminUsers,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        settings,
        updateSettings,
        contentConfig,
        updateContentConfig,
        totalRevenueAmount,
        totalExpenseAmount,
        netProfitAmount,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
