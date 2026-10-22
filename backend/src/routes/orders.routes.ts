import { Router } from 'express';
import { AuthenticatedRequest } from '../types';
import { SERVER_ORDERS, SERVER_PRODUCTS, addAuditLog } from '../store';

const router = Router();

// Orders List
router.get('/', (_req, res) => {
  res.json({ success: true, total: SERVER_ORDERS.length, orders: SERVER_ORDERS });
});

// Place Order
router.post('/', (req: AuthenticatedRequest, res) => {
  const newOrder = {
    id: req.body.id || `ord-${Date.now()}`,
    ...req.body,
    createdAt: req.body.createdAt || new Date().toISOString(),
  };
  SERVER_ORDERS.unshift(newOrder);
  addAuditLog(req.user || null, 'ORDER_CREATED', newOrder.id, `New order placed for NPR ${newOrder.totalAmount || 0}`);
  res.status(201).json({ success: true, order: newOrder });
});

// Update Order Status
router.patch('/:id/status', (req, res) => {
  const order = SERVER_ORDERS.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  order.status = req.body.status || order.status;
  order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
  res.json({ success: true, order });
});

// State Synchronization Router
export const syncRouter = Router();

syncRouter.post('/', (req, res) => {
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

  res.json({
    success: true,
    syncedAt: new Date().toISOString(),
    syncedProductsCount: syncedProducts,
    syncedOrdersCount: syncedOrders,
    totalServerProducts: SERVER_PRODUCTS.length,
    totalServerOrders: SERVER_ORDERS.length,
  });
});

export default router;
