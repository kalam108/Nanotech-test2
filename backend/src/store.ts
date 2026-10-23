import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_CATEGORIES } from './data/mockData';
import { ServerUser, ServerAuditLog } from './types';

export const AUDIT_LOGS: ServerAuditLog[] = [
  {
    id: 'log-001',
    actorName: 'System',
    actorEmail: 'system@nanotech.com',
    actorRole: 'super_admin',
    action: 'SYSTEM_BOOT',
    target: 'NanoTech Enterprise Core',
    timestamp: new Date().toISOString(),
    details: 'Role-Based Access Control initialized with Supabase authentication authority.',
  },
];

// In-Memory Persistent Products, Orders & Categories Store on Server
export const SERVER_PRODUCTS: any[] = [...INITIAL_PRODUCTS];
export const SERVER_ORDERS: any[] = [...INITIAL_ORDERS];
export const SERVER_CATEGORIES: any[] = [...INITIAL_CATEGORIES];

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
