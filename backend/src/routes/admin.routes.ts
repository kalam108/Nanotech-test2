import { Router } from 'express';
import { AuthenticatedRequest } from '../types';
import {
  SERVER_PRODUCTS,
  SERVER_ORDERS,
  SERVER_SETTINGS,
  SERVER_BANNERS,
  SERVER_DISCOUNTS,
  AUDIT_LOGS,
  addAuditLog,
} from '../store';
import { requireRole } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

// Protect ALL /api/admin routes: requires 'admin' or 'superadmin'
router.use(requireRole(['admin', 'superadmin', 'super_admin']));

// =============================================================
// 1. DASHBOARD ENDPOINT (GET /api/admin/dashboard)
// No sample numbers! Real numbers or 0.
// =============================================================
router.get('/dashboard', async (_req, res) => {
  try {
    // 1. Retrieve all orders (DB or in-memory fallback)
    let allOrders: any[] = [];
    try {
      const { data: dbOrders, error: orderErr } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!orderErr && Array.isArray(dbOrders) && dbOrders.length > 0) {
        allOrders = dbOrders;
      } else {
        allOrders = SERVER_ORDERS;
      }
    } catch {
      allOrders = SERVER_ORDERS;
    }

    // 2. Retrieve all products
    let allProducts: any[] = [];
    try {
      const { data: dbProducts, error: prodErr } = await supabaseAdmin
        .from('products')
        .select('*');
      if (!prodErr && Array.isArray(dbProducts) && dbProducts.length > 0) {
        allProducts = dbProducts;
      } else {
        allProducts = SERVER_PRODUCTS;
      }
    } catch {
      allProducts = SERVER_PRODUCTS;
    }

    // 3. Retrieve low_stock_threshold from store_settings (default 3)
    let lowStockThreshold = 3;
    try {
      const { data: settingsRow } = await supabaseAdmin
        .from('store_settings')
        .select('low_stock_threshold')
        .eq('id', 'default')
        .maybeSingle();
      if (settingsRow && typeof settingsRow.low_stock_threshold === 'number') {
        lowStockThreshold = settingsRow.low_stock_threshold;
      } else {
        lowStockThreshold = SERVER_SETTINGS.low_stock_threshold || 3;
      }
    } catch {
      lowStockThreshold = SERVER_SETTINGS.low_stock_threshold || 3;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Card 1: Orders today
    const ordersTodayList = allOrders.filter((o) => {
      const dateStr = (o.created_at || o.createdAt || '').slice(0, 10);
      return dateStr === todayStr;
    });
    const ordersToday = ordersTodayList.length;

    // Card 2: Sales today in NPR (paid orders only)
    const salesTodayNPR = ordersTodayList
      .filter((o) => {
        const pStatus = (o.payment_status || o.paymentStatus || '').toLowerCase();
        const oStatus = (o.status || '').toLowerCase();
        return pStatus === 'paid' || oStatus === 'delivered' || oStatus === 'completed';
      })
      .reduce((sum, o) => sum + (Number(o.total_amount ?? o.total ?? 0) || 0), 0);

    // Card 3: Low stock (stock <= threshold, default 3)
    const lowStockCount = allProducts.filter((p) => {
      const st = Number(p.stock ?? 0);
      return st <= lowStockThreshold;
    }).length;

    // Card 4: Pending orders
    const pendingOrdersCount = allOrders.filter(
      (o) => (o.status || '').toLowerCase() === 'pending'
    ).length;

    // Bar chart: Sales of last 7 days (paid orders only, exactly 7 days)
    const salesLast7Days: { date: string; day: string; sales: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = dayNames[d.getDay()];

      const daySales = allOrders
        .filter((o) => {
          const dateStr = (o.created_at || o.createdAt || '').slice(0, 10);
          if (dateStr !== dateKey) return false;
          const pStatus = (o.payment_status || o.paymentStatus || '').toLowerCase();
          const oStatus = (o.status || '').toLowerCase();
          return pStatus === 'paid' || oStatus === 'delivered' || oStatus === 'completed';
        })
        .reduce((sum, o) => sum + (Number(o.total_amount ?? o.total ?? 0) || 0), 0);

      salesLast7Days.push({
        date: dateKey,
        day: dayLabel,
        sales: daySales,
      });
    }

    // "Your tasks" box:
    // - payments to verify: unverified/pending payment status on active orders
    const paymentsToVerify = allOrders.filter((o) => {
      const pStatus = (o.payment_status || o.paymentStatus || '').toLowerCase();
      const oStatus = (o.status || '').toLowerCase();
      return pStatus === 'pending' && oStatus !== 'cancelled';
    }).length;

    // - products running low
    const productsRunningLow = lowStockCount;

    // - orders pending more than 2 days (48 hours)
    const twoDaysAgoMs = Date.now() - 48 * 60 * 60 * 1000;
    const ordersPendingOver2Days = allOrders.filter((o) => {
      const isPending = (o.status || '').toLowerCase() === 'pending';
      const orderTime = new Date(o.created_at || o.createdAt || 0).getTime();
      return isPending && orderTime > 0 && orderTime < twoDaysAgoMs;
    }).length;

    // Recent orders table: last 5 orders with order id, customer, amount, status badge
    const recentOrders = allOrders.slice(0, 5).map((o) => ({
      id: o.id,
      customerName: o.buyer_name || o.buyerName || o.customerName || 'Guest Shopper',
      customerEmail: o.buyer_email || o.buyerEmail || o.email || '',
      amount: Number(o.total_amount ?? o.total ?? 0) || 0,
      status: o.status || 'pending',
      paymentStatus: o.payment_status || o.paymentStatus || 'pending',
      createdAt: o.created_at || o.createdAt || new Date().toISOString(),
    }));

    return res.json({
      success: true,
      ordersToday,
      salesTodayNPR,
      lowStockCount,
      pendingOrdersCount,
      salesLast7Days,
      tasks: {
        paymentsToVerify,
        productsRunningLow,
        ordersPendingOver2Days,
      },
      recentOrders,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Error generating dashboard data' });
  }
});

// Legacy overview route (updated with 0 fake numbers)
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
    revenueMonthNPR: 0,
    lowStockAlerts: SERVER_PRODUCTS.filter((p) => (p.stock || 0) <= 3).length,
    recentOrders: SERVER_ORDERS.slice(0, 5),
  });
});

// =============================================================
// 2. CUSTOMERS ENDPOINTS (GET, PATCH, PATCH status, DELETE)
// Admins can NEVER edit, block, or delete admin or superadmin accounts.
// =============================================================
router.get('/customers', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
  const offset = (page - 1) * limit;

  try {
    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'customer')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: dbCustomers, count, error } = await query.range(offset, offset + limit - 1);

    if (!error && dbCustomers) {
      // Calculate total orders for each customer
      const customerIds = dbCustomers.map((c) => c.id);
      const customerEmails = dbCustomers.map((c) => (c.email || '').toLowerCase());

      let ordersMap: Record<string, number> = {};
      try {
        const { data: orders } = await supabaseAdmin
          .from('orders')
          .select('buyer_id, buyer_email');
        if (orders) {
          orders.forEach((ord) => {
            const bId = ord.buyer_id;
            const bEmail = (ord.buyer_email || '').toLowerCase();
            if (bId) ordersMap[bId] = (ordersMap[bId] || 0) + 1;
            if (bEmail) ordersMap[bEmail] = (ordersMap[bEmail] || 0) + 1;
          });
        }
      } catch {
        // fallback
      }

      const formatted = dbCustomers.map((c) => ({
        id: c.id,
        name: c.full_name || 'Customer',
        email: c.email || '',
        phone: c.phone || 'No phone',
        address: c.address || c.location || 'Nepal',
        totalOrders: ordersMap[c.id] || ordersMap[(c.email || '').toLowerCase()] || 0,
        status: c.status || 'active',
        role: c.role || 'customer',
        joined: c.created_at || new Date().toISOString(),
      }));

      return res.json({
        success: true,
        total: count ?? formatted.length,
        page,
        totalPages: Math.ceil((count ?? formatted.length) / limit) || 1,
        customers: formatted,
      });
    }
  } catch {
    // fallback
  }

  // In-memory fallback if database profiles table is empty
  const mockCustomers = [
    {
      id: 'cust-1',
      name: 'Sita Sharma',
      email: 'customer@nanotech.com',
      phone: '+977 9812345678',
      address: 'Itahari, Sunsari',
      totalOrders: SERVER_ORDERS.filter((o) => o.buyerEmail === 'customer@nanotech.com').length,
      status: 'active',
      role: 'customer',
      joined: '2026-01-10T10:00:00.000Z',
    },
  ];

  return res.json({
    success: true,
    total: mockCustomers.length,
    page: 1,
    totalPages: 1,
    customers: mockCustomers,
  });
});

// Helper: Ensure target user is NOT an admin or superadmin
async function verifyNotAdminOrSuperadmin(targetUserId: string): Promise<{ isAllowed: boolean; error?: string }> {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('id', targetUserId)
      .maybeSingle();

    if (profile) {
      const r = (profile.role || '').toLowerCase();
      if (r === 'admin' || r === 'super_admin' || r === 'superadmin') {
        return { isAllowed: false, error: 'Security Exception: Admins can never edit, block, or delete admin or superadmin accounts.' };
      }
    }
  } catch (err: any) {
    return { isAllowed: false, error: err?.message || 'Verification failed' };
  }
  return { isAllowed: true };
}

// Edit Customer
router.patch('/customers/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;

  const verification = await verifyNotAdminOrSuperadmin(id);
  if (!verification.isAllowed) {
    return res.status(403).json({ error: verification.error });
  }

  try {
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.full_name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    addAuditLog(req.user || null, 'CUSTOMER_UPDATED', id, `Admin updated customer profile (${name || id})`);
    return res.json({ success: true, customer: data });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to update customer' });
  }
});

// Block/Unblock Customer
router.patch('/customers/:id/status', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' | 'suspended'

  if (!status || !['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: 'Status must be active or suspended' });
  }

  const verification = await verifyNotAdminOrSuperadmin(id);
  if (!verification.isAllowed) {
    return res.status(403).json({ error: verification.error });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    addAuditLog(req.user || null, 'CUSTOMER_STATUS_CHANGED', id, `Admin set customer status to ${status}`);
    return res.json({ success: true, customer: data });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to update customer status' });
  }
});

// Delete Customer (uses supabaseAdmin.auth.admin.deleteUser)
router.delete('/customers/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const verification = await verifyNotAdminOrSuperadmin(id);
  if (!verification.isAllowed) {
    return res.status(403).json({ error: verification.error });
  }

  try {
    // 1. Delete from Supabase Auth
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authErr) {
      console.warn('[deleteCustomer] Auth deletion note:', authErr.message);
    }

    // 2. Delete from profiles table
    const { error: profErr } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);

    if (profErr) {
      return res.status(400).json({ error: profErr.message });
    }

    addAuditLog(req.user || null, 'CUSTOMER_DELETED', id, `Admin permanently deleted customer ID ${id}`);
    return res.json({ success: true, message: 'Customer successfully deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to delete customer' });
  }
});

// =============================================================
// 3. BANNERS ENDPOINTS (GET, POST, PATCH, DELETE)
// =============================================================
router.get('/banners', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      return res.json({ success: true, banners: data });
    }
  } catch {
    // fallback
  }
  return res.json({ success: true, banners: SERVER_BANNERS });
});

router.post('/banners', async (req: AuthenticatedRequest, res) => {
  const { title, image_url, link, start_date, end_date, is_active = true, display_order = 0 } = req.body;

  if (!title || !image_url) {
    return res.status(400).json({ error: 'Title and image_url are required' });
  }

  const newBanner = {
    title,
    image_url,
    link: link || null,
    start_date: start_date || null,
    end_date: end_date || null,
    is_active: Boolean(is_active),
    display_order: parseInt(display_order, 10) || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert(newBanner)
      .select('*')
      .single();

    if (!error && data) {
      addAuditLog(req.user || null, 'BANNER_CREATED', data.id, `Created banner: "${title}"`);
      return res.status(201).json({ success: true, banner: data });
    }
  } catch {
    // fallback
  }

  const memBanner = { id: `banner-${Date.now()}`, ...newBanner };
  SERVER_BANNERS.push(memBanner);
  addAuditLog(req.user || null, 'BANNER_CREATED', memBanner.id, `Created banner: "${title}"`);
  return res.status(201).json({ success: true, banner: memBanner });
});

router.patch('/banners/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const updates = { ...req.body, updated_at: new Date().toISOString() };

  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (!error && data) {
      addAuditLog(req.user || null, 'BANNER_UPDATED', id, `Updated banner ID ${id}`);
      return res.json({ success: true, banner: data });
    }
  } catch {
    // fallback
  }

  const idx = SERVER_BANNERS.findIndex((b) => b.id === id);
  if (idx !== -1) {
    SERVER_BANNERS[idx] = { ...SERVER_BANNERS[idx], ...updates };
    return res.json({ success: true, banner: SERVER_BANNERS[idx] });
  }

  return res.status(404).json({ error: 'Banner not found' });
});

router.delete('/banners/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('banners')
      .delete()
      .eq('id', id);

    if (!error) {
      addAuditLog(req.user || null, 'BANNER_DELETED', id, `Deleted banner ID ${id}`);
      return res.json({ success: true, message: 'Banner deleted' });
    }
  } catch {
    // fallback
  }

  const idx = SERVER_BANNERS.findIndex((b) => b.id === id);
  if (idx !== -1) {
    SERVER_BANNERS.splice(idx, 1);
    return res.json({ success: true, message: 'Banner deleted' });
  }

  return res.status(404).json({ error: 'Banner not found' });
});

// =============================================================
// 4. OFFERS & DISCOUNTS ENDPOINTS (GET, POST, PATCH, DELETE)
// =============================================================
router.get('/discounts', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('discounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return res.json({ success: true, discounts: data });
    }
  } catch {
    // fallback
  }
  return res.json({ success: true, discounts: SERVER_DISCOUNTS });
});

router.post('/discounts', async (req: AuthenticatedRequest, res) => {
  const {
    code,
    type,
    value,
    min_order_amount = 0,
    start_date,
    end_date,
    usage_limit,
    is_active = true,
  } = req.body;

  if (!code || !type || value === undefined) {
    return res.status(400).json({ error: 'Code, type (percent|fixed), and value are required' });
  }

  if (!['percent', 'fixed'].includes(type)) {
    return res.status(400).json({ error: 'Type must be "percent" or "fixed"' });
  }

  const cleanCode = code.trim().toUpperCase();

  const newDiscount = {
    code: cleanCode,
    type,
    value: Number(value),
    min_order_amount: Number(min_order_amount) || 0,
    start_date: start_date || null,
    end_date: end_date || null,
    usage_limit: usage_limit ? parseInt(usage_limit, 10) : null,
    used_count: 0,
    is_active: Boolean(is_active),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabaseAdmin
      .from('discounts')
      .insert(newDiscount)
      .select('*')
      .single();

    if (!error && data) {
      addAuditLog(req.user || null, 'DISCOUNT_CREATED', data.id, `Created discount code: ${cleanCode}`);
      return res.status(201).json({ success: true, discount: data });
    }
  } catch {
    // fallback
  }

  const memDiscount = { id: `disc-${Date.now()}`, ...newDiscount };
  SERVER_DISCOUNTS.unshift(memDiscount);
  addAuditLog(req.user || null, 'DISCOUNT_CREATED', memDiscount.id, `Created discount code: ${cleanCode}`);
  return res.status(201).json({ success: true, discount: memDiscount });
});

router.patch('/discounts/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const updates = { ...req.body, updated_at: new Date().toISOString() };
  if (updates.code) updates.code = updates.code.trim().toUpperCase();

  try {
    const { data, error } = await supabaseAdmin
      .from('discounts')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (!error && data) {
      addAuditLog(req.user || null, 'DISCOUNT_UPDATED', id, `Updated discount ID ${id}`);
      return res.json({ success: true, discount: data });
    }
  } catch {
    // fallback
  }

  const idx = SERVER_DISCOUNTS.findIndex((d) => d.id === id);
  if (idx !== -1) {
    SERVER_DISCOUNTS[idx] = { ...SERVER_DISCOUNTS[idx], ...updates };
    return res.json({ success: true, discount: SERVER_DISCOUNTS[idx] });
  }

  return res.status(404).json({ error: 'Discount not found' });
});

router.delete('/discounts/:id', async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabaseAdmin
      .from('discounts')
      .delete()
      .eq('id', id);

    if (!error) {
      addAuditLog(req.user || null, 'DISCOUNT_DELETED', id, `Deleted discount ID ${id}`);
      return res.json({ success: true, message: 'Discount deleted' });
    }
  } catch {
    // fallback
  }

  const idx = SERVER_DISCOUNTS.findIndex((d) => d.id === id);
  if (idx !== -1) {
    SERVER_DISCOUNTS.splice(idx, 1);
    return res.json({ success: true, message: 'Discount deleted' });
  }

  return res.status(404).json({ error: 'Discount not found' });
});

// =============================================================
// 5. STORE SETTINGS ENDPOINTS (GET, PATCH)
// =============================================================
router.get('/settings', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data) {
      return res.json({ success: true, settings: data });
    }
  } catch {
    // fallback
  }
  return res.json({ success: true, settings: SERVER_SETTINGS });
});

router.patch('/settings', async (req: AuthenticatedRequest, res) => {
  const {
    store_name,
    phone,
    email,
    address,
    delivery_fee,
    free_delivery_above,
    low_stock_threshold,
  } = req.body;

  const updates: Record<string, any> = { updated_at: new Date().toISOString() };
  if (store_name !== undefined) updates.store_name = store_name;
  if (phone !== undefined) updates.phone = phone;
  if (email !== undefined) updates.email = email;
  if (address !== undefined) updates.address = address;
  if (delivery_fee !== undefined) updates.delivery_fee = Number(delivery_fee);
  if (free_delivery_above !== undefined) updates.free_delivery_above = Number(free_delivery_above);
  if (low_stock_threshold !== undefined) updates.low_stock_threshold = parseInt(low_stock_threshold, 10);

  try {
    const { data, error } = await supabaseAdmin
      .from('store_settings')
      .upsert({ id: 'default', ...updates })
      .select('*')
      .single();

    if (!error && data) {
      // Sync in-memory store
      Object.assign(SERVER_SETTINGS, data);
      addAuditLog(req.user || null, 'STORE_SETTINGS_UPDATED', 'default', 'Updated store settings');
      return res.json({ success: true, settings: data });
    }
  } catch {
    // fallback
  }

  Object.assign(SERVER_SETTINGS, updates);
  addAuditLog(req.user || null, 'STORE_SETTINGS_UPDATED', 'default', 'Updated store settings (in-memory)');
  return res.json({ success: true, settings: SERVER_SETTINGS });
});

// Alias for PUT /settings
router.put('/settings', (req: AuthenticatedRequest, res) => {
  return (router as any).handle({ ...req, method: 'PATCH' }, res);
});

// =============================================================
// SUPERADMIN ROUTES (Strictly superadmin only)
// =============================================================
export const superAdminRouter = Router();
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
