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

export interface ServerStoreSettings {
  id: string;
  store_name: string;
  phone: string;
  email: string;
  address: string;
  delivery_fee: number;
  free_delivery_above: number;
  low_stock_threshold: number;
  updated_at?: string;
}

export const SERVER_SETTINGS: ServerStoreSettings = {
  id: 'default',
  store_name: 'NanoTech Computers & Solutions',
  phone: '+977 9852055346',
  email: 'ntsolution68@gmail.com',
  address: 'Main Road, Itahari-4, Sunsari, Nepal',
  delivery_fee: 150,
  free_delivery_above: 5000,
  low_stock_threshold: 3,
  updated_at: new Date().toISOString(),
};

export const SERVER_BANNERS: any[] = [];
export const SERVER_DISCOUNTS: any[] = [];

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
