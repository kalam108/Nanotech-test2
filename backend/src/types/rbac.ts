export type Role = 'customer' | 'admin' | 'superadmin';

export type Permission =
  | 'products.view'
  | 'products.create'
  | 'products.edit'
  | 'products.delete'
  | 'orders.view'
  | 'orders.edit'
  | 'customers.view'
  | 'customers.edit'
  | 'reports.view'
  | 'admins.manage'
  | 'permissions.manage'
  | 'settings.manage'
  | 'audit_logs.view';

export interface RBACUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'disabled';
  permissions: Permission[];
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface CustomerProfile {
  userId: string;
  phone: string;
  address: string;
  city: string;
  rewardPoints: number;
  totalOrders: number;
  totalSpent: number;
}

export interface AdminProfile {
  userId: string;
  department: string;
  assignedBy: string;
  permissions: Permission[];
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  actorName: string;
  actorEmail: string;
  actorRole: Role;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}

export interface SystemSettings {
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  address: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  defaultCurrency: 'NPR' | 'USD';
  freeShippingThreshold: number;
}
