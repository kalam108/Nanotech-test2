import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Role, RBACUser, AuditLog, SystemSettings, Permission } from '../types/rbac';
import { INITIAL_RBAC_USERS, INITIAL_AUDIT_LOGS, INITIAL_SYSTEM_SETTINGS } from '../data/rbacSeed';
import { supabase } from '../lib/supabase/client';

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

// Helper function to resolve role ONLY from Supabase profiles table
export async function resolveSupabaseRole(userId: string, _email?: string): Promise<Role> {
  // Read role strictly from Supabase profiles table
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.role) {
      const r = String(profile.role).toLowerCase().trim();
      if (r === 'super_admin' || r === 'superadmin') return 'super_admin';
      if (r === 'admin') return 'admin';
      return 'customer';
    }
  } catch (err) {
    console.warn('Error reading role from profiles table:', err);
  }

  return 'customer';
}

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

  // ROLE ONLY FROM SUPABASE: Read user session strictly from supabase.auth.getSession() + profiles table
  // Do NOT trust localStorage keys "nanotech_admin_session" or "nanotech_user" to decide the role.
  useEffect(() => {
    let isMounted = true;

    const syncSupabaseAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          if (isMounted) {
            setCurrentUser(null);
            setToken(null);
          }
          return;
        }

        const authUser = session.user;
        const resolvedRole = await resolveSupabaseRole(authUser.id, authUser.email || '');

        if (!isMounted) return;

        const rbacUser: RBACUser = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: resolvedRole,
          status: 'active',
          permissions: resolvedRole === 'super_admin' ? [
            'products.view', 'products.create', 'products.edit', 'products.delete',
            'orders.view', 'orders.edit', 'customers.view', 'customers.edit',
            'reports.view', 'admins.manage', 'permissions.manage', 'settings.manage',
            'audit_logs.view',
          ] : resolvedRole === 'admin' ? [
            'products.view', 'products.create', 'products.edit',
            'orders.view', 'orders.edit', 'customers.view', 'reports.view',
          ] : ['products.view'],
          createdAt: authUser.created_at || new Date().toISOString(),
        };

        setCurrentUser(rbacUser);
        setToken(session.access_token);
      } catch (err) {
        console.error('Error synchronizing Supabase session:', err);
        if (isMounted) {
          setCurrentUser(null);
          setToken(null);
        }
      }
    };

    syncSupabaseAuth();

    // Listen to real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const authUser = session.user;
        const resolvedRole = await resolveSupabaseRole(authUser.id, authUser.email || '');
        const rbacUser: RBACUser = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: resolvedRole,
          status: 'active',
          permissions: resolvedRole === 'super_admin' ? [
            'products.view', 'products.create', 'products.edit', 'products.delete',
            'orders.view', 'orders.edit', 'customers.view', 'customers.edit',
            'reports.view', 'admins.manage', 'permissions.manage', 'settings.manage',
            'audit_logs.view',
          ] : resolvedRole === 'admin' ? [
            'products.view', 'products.create', 'products.edit',
            'orders.view', 'orders.edit', 'customers.view', 'reports.view',
          ] : ['products.view'],
          createdAt: authUser.created_at || new Date().toISOString(),
        };
        setCurrentUser(rbacUser);
        setToken(session.access_token);
      } else {
        setCurrentUser(null);
        setToken(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
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
      actorName: currentUser ? (currentUser.role === 'super_admin' ? 'Kalam' : currentUser.name) : 'Anonymous Guest',
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
  // Requirement 6: If a customer opens /admin or /superadmin, redirect to the homepage.
  // Admin must not see any option to change user roles; only super_admin can.
  useEffect(() => {
    const path = currentPath;

    // 1. SUPERADMIN ROUTES PROTECTION (/super-admin and /superadmin)
    if (path === '/super-admin' || path.startsWith('/super-admin') || path === '/superadmin' || path.startsWith('/superadmin')) {
      if (currentUser && currentUser.role !== 'super_admin') {
        addAuditLog('FORBIDDEN_SUPERADMIN_ACCESS', path, `Unauthorized user blocked from accessing ${path}`);
        setSecurityNotice('Access Denied: /super-admin is accessible only to super_admin.');
        navigate('/');
        return;
      }
    }

    // 2. ADMIN ROUTES PROTECTION (/admin)
    // Requirement 6: If a customer opens /admin or /superadmin, redirect to the homepage.
    if (path === '/admin' || path.startsWith('/admin')) {
      if (currentUser && currentUser.role === 'customer') {
        addAuditLog('FORBIDDEN_ADMIN_ACCESS', path, `Customer blocked from accessing ${path}`);
        setSecurityNotice('Access Denied: /admin is accessible only to administrators.');
        navigate('/');
        return;
      }
    }
  }, [currentPath, currentUser]);

  const setSessionUser = (user: RBACUser, tokenStr?: string) => {
    const userToken = tokenStr || `sess_${user.id}_${Date.now()}`;
    setCurrentUser(user);
    setToken(userToken);
  };

  // REMOVE FAKE LOGIN: Authenticate strictly via Supabase. Never log anyone in without Supabase confirming it.
  const login = async (
    email: string,
    password: string,
    requiredRole?: Role
  ): Promise<{ success: boolean; error?: string }> => {
    const normEmail = email.trim().toLowerCase();

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normEmail,
        password,
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Invalid email or password' };
      }

      // 2. Resolve role strictly from Supabase profiles table
      const resolvedRole = await resolveSupabaseRole(data.user.id, normEmail);

      // Verify portal requirement if provided
      if (requiredRole && resolvedRole !== requiredRole && resolvedRole !== 'super_admin') {
        await supabase.auth.signOut();
        return { success: false, error: `Unauthorized: Account role is ${resolvedRole}` };
      }

      const rbacUser: RBACUser = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        email: data.user.email || normEmail,
        role: resolvedRole,
        status: 'active',
        permissions: resolvedRole === 'super_admin' ? [
          'products.view', 'products.create', 'products.edit', 'products.delete',
          'orders.view', 'orders.edit', 'customers.view', 'customers.edit',
          'reports.view', 'admins.manage', 'permissions.manage', 'settings.manage',
          'audit_logs.view',
        ] : resolvedRole === 'admin' ? [
          'products.view', 'products.create', 'products.edit',
          'orders.view', 'orders.edit', 'customers.view', 'reports.view',
        ] : ['products.view'],
        createdAt: data.user.created_at || new Date().toISOString(),
      };

      setCurrentUser(rbacUser);
      setToken(data.session?.access_token || null);

      if (typeof document !== 'undefined') {
        document.cookie = `nanotech_role=${resolvedRole}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `nanotech_uid=${data.user.id}; path=/; max-age=604800; SameSite=Lax`;
      }

      addAuditLog('LOGIN_SUCCESS', '/login', `Logged in via Supabase as ${resolvedRole} (${rbacUser.name})`);

      // Route to respective page
      if (resolvedRole === 'super_admin') {
        navigate('/super-admin');
      } else if (resolvedRole === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Supabase authentication failed' };
    }
  };

  const registerCustomer = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normEmail = email.trim().toLowerCase();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: normEmail,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone || '',
          },
        },
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Registration failed' };
      }

      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: normEmail,
          full_name: name,
          phone: phone || '',
          status: 'active',
          updated_at: new Date().toISOString(),
        });
      } catch (upsertErr) {
        console.warn('Profile upsert notice:', upsertErr);
      }

      const role = await resolveSupabaseRole(data.user.id, normEmail);

      const newUser: RBACUser = {
        id: data.user.id,
        name,
        email: normEmail,
        role,
        status: 'active',
        phone: phone || '',
        permissions: ['products.view'],
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(newUser);
      setToken(data.session?.access_token || null);
      navigate('/');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed' };
    }
  };

  const registerSuperadmin = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    _masterSecretKey?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const normEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normEmail,
        password,
        options: {
          data: {
            full_name: name,
            phone: phone || '',
          },
        },
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Superadmin registration failed' };
      }

      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: normEmail,
          full_name: name,
          phone: phone || '',
          status: 'active',
          updated_at: new Date().toISOString(),
        });
      } catch (upsertErr) {
        console.warn('Profile upsert notice:', upsertErr);
      }

      const role = await resolveSupabaseRole(data.user.id, normEmail);

      const newSuperadmin: RBACUser = {
        id: data.user.id,
        name,
        email: normEmail,
        role,
        status: 'active',
        phone: phone || '+977 9852055346',
        department: 'Executive Board',
        permissions: role === 'super_admin' ? [
          'products.view', 'products.create', 'products.edit', 'products.delete',
          'orders.view', 'orders.edit', 'customers.view', 'customers.edit',
          'reports.view', 'admins.manage', 'permissions.manage', 'settings.manage',
          'audit_logs.view',
        ] : ['products.view'],
        createdAt: new Date().toISOString(),
      };

      setCurrentUser(newSuperadmin);
      setToken(data.session?.access_token || null);

      navigate(role === 'super_admin' ? '/super-admin' : '/');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Superadmin registration failed' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut notice:', err);
    }
    setCurrentUser(null);
    setToken(null);
    if (typeof document !== 'undefined') {
      document.cookie = 'nanotech_role=; path=/; max-age=0';
      document.cookie = 'nanotech_uid=; path=/; max-age=0';
    }
    try {
      localStorage.removeItem('nanotech_session_token');
      localStorage.removeItem('nanotech_user');
      localStorage.removeItem('nanotech_admin_session');
    } catch {}
    navigate('/');
  };

  const addAdmin = async (adminData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    department?: string;
    permissions: Permission[];
  }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || currentUser.role !== 'super_admin') {
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
      return { success: false, error: 'Network error creating administrator.' };
    }
  };

  const toggleAdminStatus = async (adminId: string) => {
    if (!currentUser || currentUser.role !== 'super_admin') return;

    try {
      await fetch(`/api/superadmin/admins/${adminId}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}

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
    if (!currentUser || currentUser.role !== 'super_admin') return;
    setSystemSettings((prev) => ({ ...prev, ...updates }));
    addAuditLog('SYSTEM_SETTINGS_UPDATED', 'Global Configuration', 'Updated store/maintenance configuration');
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;
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
