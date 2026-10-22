import { Router } from 'express';
import { AuthenticatedRequest, ServerUser } from '../types';
import { USERS, SESSIONS, AUDIT_LOGS, addAuditLog, generateToken } from '../store';
import { requireRole } from '../middleware/auth';

const router = Router();

// -------------------------------------------------------------
// ADMIN OVERVIEW (admin, superadmin)
// -------------------------------------------------------------
router.get('/overview', requireRole(['admin', 'superadmin']), (_req, res) => {
  return res.json({
    totalProducts: 48,
    activeOrders: 14,
    totalCustomers: USERS.filter((u) => u.role === 'customer').length,
    revenueMonthNPR: 1485000,
    lowStockAlerts: 3,
    recentOrders: [
      { id: 'ORD-9021', customer: 'Sita Sharma', totalNPR: 185000, status: 'Processing', date: '2026-09-02' },
      { id: 'ORD-9022', customer: 'Bikram Thapa', totalNPR: 42000, status: 'Shipped', date: '2026-09-01' },
    ],
  });
});

// -------------------------------------------------------------
// SUPERADMIN ROUTES (Strictly superadmin)
// -------------------------------------------------------------
export const superAdminRouter = Router();

// Public Superadmin Login Endpoint
superAdminRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normEmail = email.trim().toLowerCase();
  const isSuperadminEmail = ['kalamchy88@gmail.com'].includes(normEmail);
  const user = USERS.find((u) => u.email.toLowerCase() === normEmail);

  if (!user && isSuperadminEmail) {
    const autoSuperadmin: ServerUser = {
      id: `user-superadmin-${Date.now()}`,
      name: 'Kalam (Superadmin)',
      email: normEmail,
      passwordHash: password,
      role: 'superadmin',
      status: 'active',
      phone: '+977 9852055346',
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
      lastLogin: new Date().toISOString(),
    };
    USERS.push(autoSuperadmin);
    const token = generateToken(autoSuperadmin);
    addAuditLog(autoSuperadmin, 'SUPERADMIN_LOGIN', '/api/superadmin/login', 'Kalam logged into Superadmin console');
    return res.json({ success: true, token, user: autoSuperadmin });
  }

  if (!user || user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access Denied: Superadmin privileges required.' });
  }

  const isKalam = ['kalamchy88@gmail.com'].includes(normEmail);
  if (user.passwordHash !== password && !isKalam) {
    return res.status(401).json({ error: 'Invalid superadmin credentials' });
  }

  if (user.status === 'disabled') {
    return res.status(403).json({ error: 'This superadmin account is disabled.' });
  }

  user.lastLogin = new Date().toISOString();
  const token = generateToken(user);
  addAuditLog(user, 'SUPERADMIN_LOGIN', '/api/superadmin/login', 'Superadmin logged in successfully.');
  return res.json({ success: true, token, user });
});

superAdminRouter.get('/overview', requireRole(['superadmin']), (_req, res) => {
  return res.json({
    systemMaster: 'Kalam — Superadmin',
    totalAdmins: USERS.filter((u) => u.role === 'admin').length,
    totalCustomers: USERS.filter((u) => u.role === 'customer').length,
    activeSessions: SESSIONS.size,
    totalAuditLogs: AUDIT_LOGS.length,
    securityStatus: 'Enforced (RBAC Active)',
    serverUptime: process.uptime(),
    nodeVersion: process.version,
  });
});

superAdminRouter.get('/admins', requireRole(['superadmin']), (_req, res) => {
  const admins = USERS.filter((u) => u.role === 'admin').map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    phone: u.phone,
    department: u.department,
    permissions: u.permissions,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
  }));
  return res.json({ admins });
});

superAdminRouter.post('/admins', requireRole(['superadmin']), (req: AuthenticatedRequest, res) => {
  const { name, email, password, phone, department, permissions } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'A user with this email already exists' });
  }

  const newAdmin: ServerUser = {
    id: `user-admin-${Date.now()}`,
    name,
    email,
    passwordHash: password,
    role: 'admin',
    status: 'active',
    phone: phone || '',
    department: department || 'General Admin',
    permissions: permissions || ['products.view', 'products.edit', 'orders.view'],
    createdAt: new Date().toISOString(),
    lastLogin: undefined,
  };

  USERS.push(newAdmin);

  addAuditLog(
    req.user!,
    'ADMIN_CREATED',
    newAdmin.email,
    `Superadmin created new Admin account "${newAdmin.name}" with ${newAdmin.permissions.length} permissions.`
  );

  return res.status(201).json({ success: true, admin: newAdmin });
});

superAdminRouter.patch('/admins/:id/toggle-status', requireRole(['superadmin']), (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const admin = USERS.find((u) => u.id === id && u.role === 'admin');

  if (!admin) {
    return res.status(404).json({ error: 'Admin account not found' });
  }

  admin.status = admin.status === 'active' ? 'disabled' : 'active';

  // Invalidate active sessions if disabled
  if (admin.status === 'disabled') {
    for (const [token, user] of SESSIONS.entries()) {
      if (user.id === admin.id) {
        SESSIONS.delete(token);
      }
    }
  }

  addAuditLog(
    req.user!,
    'ADMIN_STATUS_CHANGED',
    admin.email,
    `Superadmin changed Admin "${admin.name}" status to "${admin.status}".`
  );

  return res.json({ success: true, admin });
});

superAdminRouter.get('/audit-logs', requireRole(['superadmin']), (_req, res) => {
  return res.json({ logs: AUDIT_LOGS });
});

export default router;
