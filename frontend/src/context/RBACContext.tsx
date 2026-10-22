import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, RBACUser, AuditLog, SystemSettings, Permission } from '../types/rbac';
import { INITIAL_RBAC_USERS, INITIAL_AUDIT_LOGS, INITIAL_SYSTEM_SETTINGS } from '../data/rbacSeed';

interface RBACContextType {
  currentUser: RBACUser | null;
  role: Role | 'guest';
  isAuthenticated: boolean;
  token: string | null;
  currentPath: string;
  navigate: (path: string) => void;
  setCurrentUser: React.Dispatch<React.SetStateAction<RBACUser | null>>;
  setSessionUser: (user: RBACUser, token?: string) => void;
  login: (email: string, password: string, requiredRole?: Role) => Promise<{ success: boolean; error?: string }>;
  registerCustomer: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  registerSuperadmin: (name: string, email: string, password: string, phone?: string, masterSecretKey?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  quickLoginAs: (targetRole: Role) => Promise<void>;
  admins: RBACUser[];
  addAdmin: (adminData: { name: string; email: string; password: string; phone?: string; department?: string; permissions: Permission[] }) => Promise<{ success: boolean; error?: string }>;
  toggleAdminStatus: (adminId: string) => Promise<void>;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, target: string, details: string) => void;
  systemSettings: SystemSettings;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  settings: SystemSettings;
  updateSettings: (settings: Partial<SystemSettings>) => void;
  updateAdminPermissions: (adminId: string, permissions: Permission[]) => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  securityNotice: string | null;
  clearSecurityNotice: () => void;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Read initial path safely
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );

  const [currentUser, setCurrentUser] = useState<RBACUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [admins, setAdmins] = useState<RBACUser[]>(INITIAL_RBAC_USERS.filter((u) => u.role === 'admin'));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(INITIAL_SYSTEM_SETTINGS);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  // Sync with browser history and handle popstate (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Restore stored session if exists
  useEffect(() => {
    const storedToken = localStorage.getItem('nanotech_session_token');
    const storedUser = localStorage.getItem('nanotech_user');

    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.name?.toLowerCase().includes('ramesh')) {
          parsed.name = 'Raju Khadka';
          if (parsed.id === 'user-admin-ramesh') parsed.id = 'user-admin-raju';
          localStorage.setItem('nanotech_user', JSON.stringify(parsed));
        }
        setCurrentUser(parsed);
        setToken(storedToken);
      } catch (err) {
        localStorage.removeItem('nanotech_session_token');
        localStorage.removeItem('nanotech_user');
      }
    } else {
      const storedAdminSession = localStorage.getItem('nanotech_admin_session');
      if (storedAdminSession) {
        try {
          const parsedAdmin = JSON.parse(storedAdminSession);
          if (parsedAdmin && parsedAdmin.email) {
            if (parsedAdmin.name && parsedAdmin.name.toLowerCase().includes('ramesh')) {
              parsedAdmin.name = 'Raju Khadka';
              localStorage.setItem('nanotech_admin_session', JSON.stringify(parsedAdmin));
            }
            const role = (parsedAdmin.role === 'super_admin' ? 'superadmin' : 'admin') as Role;
            const rbacAdmin: RBACUser = {
              id: parsedAdmin.id || 'admin-root',
              name: parsedAdmin.name || 'Admin',
              email: parsedAdmin.email,
              role,
              status: 'active',
              permissions: [
                'products.view',
                'products.create',
                'products.edit',
                'products.delete',
                'orders.view',
                'orders.edit',
                'customers.view',
                'customers.edit',
                'reports.view',
                'admins.manage',
                'permissions.manage',
                'settings.manage',
                'audit_logs.view',
              ],
              createdAt: parsedAdmin.createdAt || new Date().toISOString(),
            };
            setCurrentUser(rbacAdmin);
            setToken(`admin_session_token_${Date.now()}`);
          }
        } catch {}
      }
    }
  }, []);

  // Route Navigation Helper
  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearSecurityNotice = () => setSecurityNotice(null);

  const addAuditLog = (action: string, target: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorName: currentUser ? (currentUser.role === 'superadmin' ? 'Kalam' : currentUser.name) : 'Anonymous Guest',
      actorEmail: currentUser ? currentUser.email : 'guest@client',
      actorRole: currentUser ? currentUser.role : 'customer',
      action,
      target,
      timestamp: new Date().toISOString(),
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // ROUTE GUARD ENFORCEMENT
  // Runs whenever currentPath or currentUser changes
  useEffect(() => {
    const path = currentPath;

    // 1. SUPERADMIN ROUTES PROTECTION
    if (path.startsWith('/superadmin')) {
      if (path === '/superadmin/login') {
        // If already logged in as superadmin, go to dashboard
        if (currentUser && currentUser.role === 'superadmin') {
          navigate('/superadmin/dashboard');
        }
        return;
      }

      // If not logged in, redirect to superadmin login
      if (!currentUser) {
        setSecurityNotice('Authentication required. Please log in with Superadmin credentials.');
        navigate('/superadmin/login');
        return;
      }

      // If logged in as customer, STRICTLY FORBIDDEN!
      if (currentUser.role === 'customer') {
        addAuditLog('FORBIDDEN_SUPERADMIN_ACCESS', path, `Customer ${currentUser.email} blocked from accessing ${path}`);
        setSecurityNotice('Access Denied: Customer accounts are strictly prohibited from accessing the Superadmin console.');
        navigate('/customer/dashboard');
        return;
      }

      // If logged in as admin, STRICTLY FORBIDDEN!
      if (currentUser.role === 'admin') {
        addAuditLog('FORBIDDEN_SUPERADMIN_ACCESS', path, `Admin ${currentUser.email} blocked from accessing ${path}`);
        setSecurityNotice('Access Denied: Standard administrators cannot access the Superadmin console (Reserved for Kalam).');
        navigate('/admin/dashboard');
        return;
      }
    }

    // 2. ADMIN ROUTES PROTECTION
    if (path.startsWith('/admin')) {
      if (path === '/admin/login' || path === '/admin/signup' || path === '/admin/register') {
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin')) {
          navigate('/admin/dashboard');
        }
        return;
      }

      // Check if admin is authenticated either via RBAC currentUser or stored admin session
      const storedAdminSession = typeof window !== 'undefined' ? localStorage.getItem('nanotech_admin_session') : null;

      // If not logged in at all, redirect to admin login
      if (!currentUser && !storedAdminSession) {
        setSecurityNotice('Authentication required. Please log into the Admin portal.');
        navigate('/admin/login');
        return;
      }

      // If logged in as customer, STRICTLY FORBIDDEN!
      if (currentUser && currentUser.role === 'customer' && !storedAdminSession) {
        addAuditLog('FORBIDDEN_ADMIN_ACCESS', path, `Customer ${currentUser.email} blocked from accessing ${path}`);
        setSecurityNotice('Access Denied: Customer accounts cannot access administrative routes.');
        navigate('/customer/dashboard');
        return;
      }
    }

    // 3. CUSTOMER PROTECTED ROUTES
    if (path.startsWith('/customer')) {
      const publicCustomerRoutes = ['/customer/login', '/customer/signup', '/customer/products'];
      if (publicCustomerRoutes.includes(path)) {
        if (currentUser && (path === '/customer/login' || path === '/customer/signup')) {
          navigate('/customer/dashboard');
        }
        return;
      }

      // Protected customer views (e.g. /customer/dashboard, /customer/cart, /customer/orders, /customer/profile)
      if (!currentUser) {
        setSecurityNotice('Please log in or sign up to access your customer dashboard.');
        navigate('/customer/login');
        return;
      }
    }
  }, [currentPath, currentUser]);

  const setSessionUser = (user: RBACUser, tokenStr?: string) => {
    const userToken = tokenStr || `sess_${user.id}_${Date.now()}`;
    setCurrentUser(user);
    setToken(userToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nanotech_session_token', userToken);
      localStorage.setItem('nanotech_user', JSON.stringify(user));
      localStorage.setItem(
        'nanotech_admin_session',
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role === 'superadmin' ? 'super_admin' : user.role,
          createdAt: user.createdAt,
        })
      );
      window.dispatchEvent(new Event('auth-state-change'));
    }
  };

  const login = async (
    email: string,
    password: string,
    requiredRole?: Role
  ): Promise<{ success: boolean; error?: string }> => {
    const normEmail = email.trim().toLowerCase();
    const isSuperadminTarget = requiredRole === 'superadmin' || normEmail === 'kalamchy88@gmail.com';

    try {
      let data: any = null;

      // 1. If superadmin, try /api/superadmin/login first
      if (isSuperadminTarget) {
        try {
          const saRes = await fetch('/api/superadmin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim(), password }),
          });
          const saJson = await saRes.json();
          if (saRes.ok && saJson.success && saJson.user) {
            data = saJson;
          }
        } catch {}
      }

      // 2. Otherwise or as fallback: try /api/auth/login
      if (!data || !data.user) {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password, requiredRole }),
        });
        const json = await response.json();
        if (response.ok && json.success && json.user) {
          data = json;
        } else if (!data) {
          data = json;
        }
      }

      // 3. Fallback to seed user if server response was unsuccessful for demo accounts
      if (!data || !data.user || !data.success) {
        const seedUser = INITIAL_RBAC_USERS.find(
          (u) => u.email.toLowerCase() === normEmail
        );
        if (seedUser && (isSuperadminTarget || seedUser.role === requiredRole || !requiredRole)) {
          const simToken = `sess_seed_${seedUser.id}_${Date.now()}`;
          setSessionUser(seedUser, simToken);
          addAuditLog('LOGIN_SUCCESS_SEED', '/api/auth/login', `Logged in via seed as ${seedUser.role} (${seedUser.name})`);
          if (seedUser.role === 'superadmin') {
            navigate('/superadmin/dashboard');
          } else if (seedUser.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/customer/dashboard');
          }
          return { success: true };
        }

        return { success: false, error: data?.error || 'Invalid email or password' };
      }

      setSessionUser(data.user, data.token);

      addAuditLog('LOGIN_SUCCESS', '/api/auth/login', `Logged in as ${data.user.role} (${data.user.name})`);

      // Route to respective dashboard
      if (data.user.role === 'superadmin') {
        navigate('/superadmin/dashboard');
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }

      return { success: true };
    } catch (err) {
      // Fallback for offline seed verification
      const seedUser = INITIAL_RBAC_USERS.find(
        (u) => u.email.toLowerCase() === normEmail
      );

      if (!seedUser) {
        return { success: false, error: 'User not found' };
      }

      if (requiredRole && seedUser.role !== requiredRole && seedUser.role !== 'superadmin') {
        return { success: false, error: `Unauthorized: Account role is ${seedUser.role}` };
      }

      const simToken = `fallback_${seedUser.id}_${Date.now()}`;
      setSessionUser(seedUser, simToken);

      if (seedUser.role === 'superadmin') {
        navigate('/superadmin/dashboard');
      } else if (seedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/dashboard');
      }

      return { success: true };
    }
  };

  const registerCustomer = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('nanotech_session_token', data.token);
      localStorage.setItem('nanotech_user', JSON.stringify(data.user));

      navigate('/customer/dashboard');
      return { success: true };
    } catch (err) {
      // Local fallback
      const newUser: RBACUser = {
        id: `user-customer-${Date.now()}`,
        name,
        email,
        role: 'customer',
        status: 'active',
        phone: phone || '',
        permissions: ['products.view'],
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(newUser);
      setToken(`fallback_${newUser.id}`);
      navigate('/customer/dashboard');
      return { success: true };
    }
  };

  const registerSuperadmin = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    masterSecretKey?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register-superadmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, masterSecretKey }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Superadmin registration failed' };
      }

      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('nanotech_session_token', data.token);
      localStorage.setItem('nanotech_user', JSON.stringify(data.user));

      const adminSession = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: 'super_admin',
        createdAt: data.user.createdAt,
      };
      localStorage.setItem('nanotech_admin_session', JSON.stringify(adminSession));

      navigate('/superadmin/dashboard');
      return { success: true };
    } catch (err: any) {
      // Local fallback in case backend is offline
      const newSuperadmin: RBACUser = {
        id: `user-superadmin-${Date.now()}`,
        name,
        email,
        role: 'superadmin',
        status: 'active',
        phone: phone || '+977 9852055346',
        department: 'Executive Board',
        permissions: [
          'products.view',
          'products.create',
          'products.edit',
          'products.delete',
          'orders.view',
          'orders.edit',
          'customers.view',
          'customers.edit',
          'reports.view',
          'admins.manage',
          'permissions.manage',
          'settings.manage',
          'audit_logs.view',
        ],
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(newSuperadmin);
      setToken(`fallback_${newSuperadmin.id}`);
      localStorage.setItem('nanotech_session_token', `fallback_${newSuperadmin.id}`);
      localStorage.setItem('nanotech_user', JSON.stringify(newSuperadmin));
      localStorage.setItem('nanotech_admin_session', JSON.stringify({
        id: newSuperadmin.id,
        name: newSuperadmin.name,
        email: newSuperadmin.email,
        role: 'super_admin',
      }));

      navigate('/superadmin/dashboard');
      return { success: true };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      if (currentUser) {
        addAuditLog('LOGOUT', '/logout', `User ${currentUser.email} logged out`);
      }
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem('nanotech_session_token');
      localStorage.removeItem('nanotech_user');
      navigate('/');
    }
  };

  // Quick Switcher for testing and verifying roles
  const quickLoginAs = async (targetRole: Role) => {
    if (targetRole === 'superadmin') {
      await login('kalamchy88@gmail.com', 'Kalam@123');
    } else if (targetRole === 'admin') {
      await login('admin@nanotech.com', 'Admin@123');
    } else {
      await login('customer@nanotech.com', 'Customer@123');
    }
  };

  const addAdmin = async (adminData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    department?: string;
    permissions: Permission[];
  }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'superadmin') {
      return { success: false, error: 'Only Kalam (Superadmin) can create administrators.' };
    }

    try {
      const response = await fetch('/api/superadmin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adminData),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to create admin' };
      }

      setAdmins((prev) => [data.admin, ...prev]);
      addAuditLog('ADMIN_CREATED', adminData.email, `Superadmin created admin "${adminData.name}"`);
      return { success: true };
    } catch {
      // Local state fallback
      const newAdmin: RBACUser = {
        id: `user-admin-${Date.now()}`,
        name: adminData.name,
        email: adminData.email,
        role: 'admin',
        status: 'active',
        phone: adminData.phone || '',
        permissions: adminData.permissions,
        createdAt: new Date().toISOString(),
      };
      setAdmins((prev) => [newAdmin, ...prev]);
      addAuditLog('ADMIN_CREATED', adminData.email, `Superadmin created admin "${adminData.name}"`);
      return { success: true };
    }
  };

  const toggleAdminStatus = async (adminId: string) => {
    if (!currentUser || currentUser.role !== 'superadmin') return;

    try {
      await fetch(`/api/superadmin/admins/${adminId}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Fallback
    }

    setAdmins((prev) =>
      prev.map((adm) => {
        if (adm.id === adminId) {
          const nextStatus = adm.status === 'active' ? 'disabled' : 'active';
          addAuditLog('ADMIN_STATUS_CHANGED', adm.email, `Admin "${adm.name}" changed to ${nextStatus}`);
          return { ...adm, status: nextStatus };
        }
        return adm;
      })
    );
  };

  const updateSystemSettings = (updates: Partial<SystemSettings>) => {
    if (!currentUser || currentUser.role !== 'superadmin') return;
    setSystemSettings((prev) => ({ ...prev, ...updates }));
    addAuditLog('SYSTEM_SETTINGS_UPDATED', 'Global Configuration', 'Updated store/maintenance configuration');
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'superadmin') return true;
    return currentUser.permissions.includes(permission);
  };

  return (
    <RBACContext.Provider
      value={{
        currentUser,
        role: currentUser ? currentUser.role : 'guest',
        isAuthenticated: !!currentUser,
        token,
        currentPath,
        navigate,
        setCurrentUser,
        setSessionUser,
        login,
        registerCustomer,
        registerSuperadmin,
        logout,
        quickLoginAs,
        admins,
        addAdmin,
        toggleAdminStatus,
        auditLogs,
        addAuditLog,
        systemSettings,
        updateSystemSettings,
        settings: systemSettings,
        updateSettings: updateSystemSettings,
        updateAdminPermissions: async (adminId: string, permissions: Permission[]) => {
          setAdmins((prev) => prev.map((a) => (a.id === adminId ? { ...a, permissions } : a)));
          addAuditLog('PERMISSIONS_UPDATE', `Admin ${adminId}`, `Updated permissions matrix.`);
        },
        hasPermission,
        securityNotice,
        clearSecurityNotice,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
};

const defaultRBACContext: RBACContextType = {
  currentUser: null,
  role: 'customer',
  isAuthenticated: false,
  token: null,
  currentPath: typeof window !== 'undefined' ? window.location.pathname || '/' : '/',
  navigate: (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  },
  setCurrentUser: () => {},
  setSessionUser: () => {},
  login: async () => ({ success: false, error: 'Context initializing' }),
  registerCustomer: async () => ({ success: false, error: 'Context initializing' }),
  registerSuperadmin: async () => ({ success: false, error: 'Context initializing' }),
  logout: async () => {},
  quickLoginAs: async () => {},
  admins: INITIAL_RBAC_USERS.filter((u) => u.role === 'admin'),
  addAdmin: async () => ({ success: false }),
  toggleAdminStatus: async () => {},
  auditLogs: INITIAL_AUDIT_LOGS,
  addAuditLog: () => {},
  systemSettings: INITIAL_SYSTEM_SETTINGS,
  updateSystemSettings: () => {},
  settings: INITIAL_SYSTEM_SETTINGS,
  updateSettings: () => {},
  updateAdminPermissions: async () => {},
  hasPermission: () => true,
  securityNotice: null,
  clearSecurityNotice: () => {},
};

export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  return context || defaultRBACContext;
};
