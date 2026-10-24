import { Router } from 'express';
import { AuthenticatedRequest } from '../types';
import { SERVER_ORDERS, SERVER_PRODUCTS, SERVER_SETTINGS, SERVER_DISCOUNTS, addAuditLog } from '../store';
import { requireAuth, requireRole } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

// Orders List: Customers see only their own orders; admin/superadmin see all
router.get('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const role = (req.user?.role || '').toLowerCase();
  const isAdminOrSuper = role === 'admin' || role === 'super_admin' || role === 'superadmin';

  if (isAdminOrSuper) {
    return res.json({ success: true, total: SERVER_ORDERS.length, orders: SERVER_ORDERS });
  }

  // Customer: Filter to return only their own orders
  const currentUserId = req.user?.id;
  const currentUserEmail = (req.user?.email || '').toLowerCase();

  const userOrders = SERVER_ORDERS.filter((o) => {
    const buyerId = o.buyerId || o.userId || o.customerId;
    const buyerEmail = (o.buyerEmail || o.customerEmail || '').toLowerCase();
    return (
      (buyerId && buyerId === currentUserId) ||
      (buyerEmail && buyerEmail === currentUserEmail)
    );
  });

  return res.json({ success: true, total: userOrders.length, orders: userOrders });
});

// Single Order Lookup
router.get('/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const order = SERVER_ORDERS.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const role = (req.user?.role || '').toLowerCase();
  const isAdminOrSuper = role === 'admin' || role === 'super_admin' || role === 'superadmin';
  const isOwner =
    order.buyerId === req.user?.id ||
    order.buyerEmail?.toLowerCase() === req.user?.email?.toLowerCase();

  if (!isAdminOrSuper && !isOwner) {
    return res.status(403).json({ error: 'Forbidden: You cannot view orders that do not belong to you' });
  }

  return res.json({ success: true, order });
});

// Helper to fetch store settings from Supabase or fallback
async function getStoreSettings() {
  let delivery_fee = Number(SERVER_SETTINGS.delivery_fee) || 150;
  let free_delivery_above = Number(SERVER_SETTINGS.free_delivery_above) || 5000;
  let low_stock_threshold = Number(SERVER_SETTINGS.low_stock_threshold) || 3;

  try {
    const { data } = await supabaseAdmin
      .from('store_settings')
      .select('delivery_fee, free_delivery_above, low_stock_threshold')
      .eq('id', 'default')
      .maybeSingle();
    if (data) {
      if (data.delivery_fee !== null && data.delivery_fee !== undefined) {
        delivery_fee = Number(data.delivery_fee);
      }
      if (data.free_delivery_above !== null && data.free_delivery_above !== undefined) {
        free_delivery_above = Number(data.free_delivery_above);
      }
      if (data.low_stock_threshold !== null && data.low_stock_threshold !== undefined) {
        low_stock_threshold = Number(data.low_stock_threshold);
      }
    }
  } catch {
    // fallback
  }
  return {
    delivery_fee,
    free_delivery_above,
    low_stock_threshold,
  };
}

// Validate Discount endpoint (preview for client)
router.post('/validate-discount', async (req, res) => {
  const code = (req.body.code || req.body.couponCode || req.body.discountCode || '').trim();
  if (!code) {
    return res.status(400).json({ valid: false, error: 'Discount code is required' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('discounts')
      .select('code, type, value, min_order_amount, start_date, end_date, usage_limit, used_count, is_active')
      .ilike('code', code)
      .maybeSingle();

    if (error || !data || !data.is_active) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired discount code' });
    }

    const now = new Date();
    if (data.start_date && new Date(data.start_date) > now) {
      return res.status(400).json({ valid: false, error: 'Discount code is not active yet' });
    }
    if (data.end_date && new Date(data.end_date) < now) {
      return res.status(400).json({ valid: false, error: 'Discount code has expired' });
    }
    if (data.usage_limit && (data.used_count || 0) >= data.usage_limit) {
      return res.status(400).json({ valid: false, error: 'Discount code usage limit reached' });
    }

    return res.json({
      valid: true,
      type: data.type,
      value: Number(data.value),
      min_order_amount: Number(data.min_order_amount) || 0,
    });
  } catch {
    return res.status(400).json({ valid: false, error: 'Invalid or expired discount code' });
  }
});

// Place Order: Recalculate prices and total strictly on the server from product data, store_settings delivery fee, and server discounts
router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { items, shippingAddress, paymentMethod, couponCode, discountCode } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  let subtotal = 0;
  const recalculatedItems = [];

  for (const item of items) {
    const productId = item.productId || item.id;
    if (!productId) {
      return res.status(400).json({ error: 'Each item must have a valid productId' });
    }

    // Lookup in SERVER_PRODUCTS first
    let product = SERVER_PRODUCTS.find((p) => p.id === productId);

    // If not found in memory, query database
    if (!product) {
      try {
        const { data: dbProduct } = await supabaseAdmin
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle();
        if (dbProduct) {
          product = dbProduct;
        }
      } catch {
        // database error ignored
      }
    }

    if (!product) {
      return res.status(400).json({ error: `Product not found: ${productId}` });
    }

    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));

    // Check stock availability
    if (product.stock !== undefined && product.stock !== null && Number(product.stock) < quantity) {
      return res.status(400).json({ error: `Insufficient stock for product: ${product.title || productId}` });
    }
    if (product.nepalStockStatus === 'out_of_stock') {
      return res.status(400).json({ error: `Product is out of stock: ${product.title || productId}` });
    }

    // Force server catalog price - NEVER trust the price sent by the client!
    const serverPrice = Number(product.price);
    if (isNaN(serverPrice) || serverPrice < 0) {
      return res.status(500).json({ error: `Invalid price configuration for product: ${productId}` });
    }

    const itemTotal = serverPrice * quantity;
    subtotal += itemTotal;

    recalculatedItems.push({
      productId: product.id,
      productTitle: product.title || item.productTitle || '',
      productImage: (Array.isArray(product.images) && product.images[0]) || product.imageUrl || item.productImage || '',
      price: serverPrice,
      quantity,
      sellerId: product.sellerId || item.sellerId || '',
    });
  }

  // 1. READ DELIVERY FEE STRICTLY FROM STORE_SETTINGS (subtotal >= free_delivery_above ? 0 : delivery_fee)
  const settings = await getStoreSettings();
  const deliveryFee = subtotal >= settings.free_delivery_above ? 0 : settings.delivery_fee;

  // 2. ALL ORDER CHECKS PASSED: APPLY DISCOUNT RIGHT BEFORE SAVING ORDER
  const rawCode = (couponCode || discountCode || '').trim();
  let serverDiscountAmount = 0;
  let appliedDiscountCode: string | null = null;

  if (rawCode) {
    const { data, error } = await supabaseAdmin.rpc('redeem_discount', {
      p_code: rawCode,
      p_order_amount: subtotal,
    });

    const row = Array.isArray(data) ? data[0] : data;

    if (error || !row) {
      return res.status(400).json({ error: 'Invalid or expired discount code' });
    }

    const discountType = row.discount_type;
    const discountValue = Number(row.discount_value);

    if (discountType === 'percent') {
      serverDiscountAmount = Math.round((subtotal * discountValue) / 100);
    } else {
      serverDiscountAmount = Math.min(discountValue, subtotal);
    }
    appliedDiscountCode = rawCode.toUpperCase();
  }

  const total = Math.max(0, subtotal - serverDiscountAmount + deliveryFee);

  const buyerId = req.user!.id;
  const buyerName = shippingAddress?.fullName || req.user!.name;
  const buyerEmail = req.user!.email;

  const newOrder = {
    id: req.body.id || `ord-${Math.floor(100000 + Math.random() * 900000)}`,
    buyerId,
    buyerName,
    buyerEmail,
    items: recalculatedItems,
    subtotal,
    deliveryFee,
    discountAmount: serverDiscountAmount,
    discountCode: appliedDiscountCode,
    total,
    totalAmount: total,
    paymentMethod: paymentMethod || 'Cash on Delivery',
    shippingAddress: shippingAddress || {},
    status: 'pending',
    paymentStatus: req.body.paymentStatus || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    trackingNumber: `NT-${Math.floor(1000000 + Math.random() * 9000000)}-NP`,
  };

  SERVER_ORDERS.unshift(newOrder);
  addAuditLog(req.user || null, 'ORDER_CREATED', newOrder.id, `New order placed for NPR ${total} (Delivery: ${deliveryFee}, Discount: ${serverDiscountAmount})`);

  return res.status(201).json({ success: true, order: newOrder });
});

// Update Order Status (Admins and Superadmins only)
router.patch('/:id/status', requireRole(['admin', 'superadmin', 'super_admin']), (req, res) => {
  const order = SERVER_ORDERS.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  order.status = req.body.status || order.status;
  order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
  order.updatedAt = new Date().toISOString();
  return res.json({ success: true, order });
});

// State Synchronization Router (Admins and Superadmins only)
export const syncRouter = Router();

syncRouter.post('/', requireRole(['admin', 'superadmin', 'super_admin']), (req, res) => {
  const { products, orders } = req.body;
  let syncedProducts = 0;
  let syncedOrders = 0;

  if (Array.isArray(products) && products.length > 0) {
    const existingIds = new Set(SERVER_PRODUCTS.map((p) => p.id));
    for (const p of products) {
      if (!existingIds.has(p.id)) {
        SERVER_PRODUCTS.push(p);
        existingIds.add(p.id);
        syncedProducts++;
      } else {
        const idx = SERVER_PRODUCTS.findIndex((item) => item.id === p.id);
        SERVER_PRODUCTS[idx] = { ...SERVER_PRODUCTS[idx], ...p };
        syncedProducts++;
      }
    }
  }

  if (Array.isArray(orders) && orders.length > 0) {
    const existingIds = new Set(SERVER_ORDERS.map((o) => o.id));
    for (const o of orders) {
      if (!existingIds.has(o.id)) {
        SERVER_ORDERS.push(o);
        existingIds.add(o.id);
        syncedOrders++;
      }
    }
  }

  return res.json({
    success: true,
    syncedAt: new Date().toISOString(),
    syncedProductsCount: syncedProducts,
    syncedOrdersCount: syncedOrders,
    totalServerProducts: SERVER_PRODUCTS.length,
    totalServerOrders: SERVER_ORDERS.length,
  });
});

export default router;
