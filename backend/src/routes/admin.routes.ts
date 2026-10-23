import { Router } from 'express';
import { AuthenticatedRequest } from '../types';
import { SERVER_PRODUCTS, SERVER_ORDERS, AUDIT_LOGS, addAuditLog } from '../store';
import { requireRole } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

// Protect ALL /api/admin routes: requires 'admin' or 'superadmin'
router.use(requireRole(['admin', 'superadmin', 'super_admin']));

// -------------------------------------------------------------
// ADMIN OVERVIEW (admin, superadmin)
// -------------------------------------------------------------
router.get('/overview', async (_req, res) => {
  let totalCustomers = 0;
  try {
    const { count } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');
    totalCustomers = count || 0;
  } catch {
    totalCustomers = 0;
  }

  return res.json({
    totalProducts: SERVER_PRODUCTS.length,
    activeOrders: SERVER_ORDERS.filter((o) => o.status === 'processing' || o.status === 'pending').length,
    totalCustomers,
    revenueMonthNPR: 1485000,
    lowStockAlerts: SERVER_PRODUCTS.filter((p) => (p.stock || 0) <= 3).length,
    recentOrders: SERVER_ORDERS.slice(0, 5),
  });
});

// -------------------------------------------------------------
// SUPERADMIN ROUTES (Strictly superadmin only)
// -------------------------------------------------------------
export const superAdminRouter = Router();

// Protect ALL /api/superadmin routes: requires 'superadmin' only
superAdminRouter.use(requireRole(['superadmin', 'super_admin']));

superAdminRouter.get('/overview', async (_req, res) => {
  let totalAdmins = 0;
  let totalCustomers = 0;

  try {
    const { count: adminCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['admin', 'super_admin', 'superadmin']);
    totalAdmins = adminCount || 0;

    const { count: customerCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');
    totalCustomers = customerCount || 0;
  } catch {
    // fallback
  }

  return res.json({
    systemMaster: 'Superadmin Console',
    totalAdmins,
    totalCustomers,
    totalAuditLogs: AUDIT_LOGS.length,
    securityStatus: 'Enforced (Supabase RBAC Active)',
    serverUptime: process.uptime(),
    nodeVersion: process.version,
  });
});

superAdminRouter.get('/admins', async (_req, res) => {
  try {
    const { data: admins, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .in('role', ['admin', 'super_admin', 'superadmin']);

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json({ admins: admins || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to fetch admins' });
  }
});

superAdminRouter.post('/admins', async (req: AuthenticatedRequest, res) => {
  const { name, email, password, phone, department } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name, phone: phone || '' },
    });

    if (authErr || !authData.user) {
      return res.status(400).json({ error: authErr?.message || 'Failed to create admin in Supabase' });
    }

    const { data: profile, error: profErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        full_name: name,
        role: 'admin',
        status: 'active',
        phone: phone || null,
        department: department || 'General Admin',
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (profErr) {
      return res.status(400).json({ error: profErr.message });
    }

    addAuditLog(
      req.user!,
      'ADMIN_CREATED',
      email,
      `Superadmin created new Admin account "${name}" (${email})`
    );

    return res.status(201).json({ success: true, admin: profile });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Server error creating admin' });
  }
});

superAdminRouter.patch('/admins/:id/toggle-status', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const { data: admin, error: fetchErr } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !admin) {
      return res.status(404).json({ error: 'Admin account not found' });
    }

    const nextStatus = admin.status === 'active' ? 'suspended' : 'active';
    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (updateErr) {
      return res.status(400).json({ error: updateErr.message });
    }

    addAuditLog(
      req.user!,
      'ADMIN_STATUS_CHANGED',
      admin.email,
      `Superadmin changed Admin "${admin.full_name || admin.email}" status to "${nextStatus}".`
    );

    return res.json({ success: true, admin: updated });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to update admin status' });
  }
});

superAdminRouter.get('/audit-logs', (_req, res) => {
  return res.json({ logs: AUDIT_LOGS });
});

export default router;
