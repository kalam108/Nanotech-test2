import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CATEGORIES } from './data/mockData';
import { ServerUser, ServerRole, ServerAuditLog } from './types';

// In-Memory Database Store with Pre-Seeded Users
export const USERS: ServerUser[] = [
  {
    id: 'user-superadmin-kalam',
    name: 'Kalam (Superadmin)',
    email: 'kalamchy88@gmail.com',
    passwordHash: 'Kalam@123',
    role: 'superadmin',
    status: 'active',
    phone: '+977 9810448398',
    department: 'Executive',
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
    createdAt: '2025-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'user-admin-raju',
    name: 'Raju Khadka',
    email: 'ntsolution68@gmail.com',
    passwordHash: 'Admin@123',
    role: 'admin',
    status: 'active',
    phone: '+977 9852055346',
    department: 'Hardware Operations',
    permissions: [
      'products.view',
      'products.create',
      'products.edit',
      'orders.view',
      'orders.edit',
      'customers.view',
      'reports.view',
    ],
    createdAt: '2025-03-15T09:00:00.000Z',
    lastLogin: new Date().toISOString(),
  },
 
];

export const AUDIT_LOGS: ServerAuditLog[] = [
  {
    id: 'log-001',
    actorName: 'Kalam',
    actorEmail: 'kalamchy88@gmail.com',
    actorRole: 'superadmin',
    action: 'SYSTEM_BOOT',
    target: 'NanoTech Enterprise Core',
    timestamp: new Date().toISOString(),
    details: 'Role-Based Access Control initialized with Superadmin "Kalam" as root authority.',
  },
];

// Active sessions token map: token -> ServerUser
export const SESSIONS = new Map<string, ServerUser>();

// In-Memory Persistent Products, Orders & Categories Store on Server
export const SERVER_PRODUCTS: any[] = [...INITIAL_PRODUCTS];
export const SERVER_ORDERS: any[] = [...INITIAL_ORDERS];
export const SERVER_CATEGORIES: any[] = [...INITIAL_CATEGORIES];

export function generateToken(user: ServerUser): string {
  const token = `nt_sess_${user.role}_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  SESSIONS.set(token, user);
  return token;
}

export function addAuditLog(actor: ServerUser | null, action: string, target: string, details: string) {
  const log: ServerAuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorName: actor?.name || 'Anonymous Guest',
    actorEmail: actor?.email || 'unauthenticated',
    actorRole: actor?.role || 'customer',
    action,
    target,
    timestamp: new Date().toISOString(),
    details,
  };
  AUDIT_LOGS.unshift(log);
  if (AUDIT_LOGS.length > 200) AUDIT_LOGS.pop();
}
