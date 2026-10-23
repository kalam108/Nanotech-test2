import { Router } from 'express';
import { AuthenticatedRequest } from '../types';
import { SERVER_ORDERS, SERVER_PRODUCTS, addAuditLog } from '../store';
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

// Place Order: Recalculate prices and total strictly on the server from product data
router.post('/', requireAuth, async (req: AuthenticatedRequest, res) => {
  const { items, shippingAddress, paymentMethod, deliveryFee: rawDeliveryFee } = req.body;

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

    // Force server catalog price - NEVER trust the price sent by the client!
    const serverPrice = Number(product.price);
    if (isNaN(serverPrice) || serverPrice < 0) {
      return res.status(500).json({ error: `Invalid price configuration for product: ${productId}` });
    }

    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
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

  const deliveryFee = typeof rawDeliveryFee === 'number' && rawDeliveryFee >= 0 ? rawDeliveryFee : 0;
  const total = subtotal + deliveryFee;

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
  addAuditLog(req.user || null, 'ORDER_CREATED', newOrder.id, `New order placed for NPR ${total}`);

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
