import { Router } from 'express';
import { SERVER_PRODUCTS, SERVER_CATEGORIES } from '../store';
import { requireRole } from '../middleware/auth';

const router = Router();

// Products Catalog List & Filter (Public)
router.get('/', (req, res) => {
  const category = req.query.category as string;
  const condition = req.query.condition as string;
  const search = req.query.search as string;

  let filtered = [...SERVER_PRODUCTS];
  if (category && category !== 'all' && category !== 'All Categories') {
    filtered = filtered.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
  }
  if (condition && condition !== 'all') {
    filtered = filtered.filter((p) => p.condition?.toLowerCase() === condition.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    total: filtered.length,
    products: filtered,
  });
});

// Single Product Details (Public)
router.get('/:id', (req, res) => {
  const product = SERVER_PRODUCTS.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ success: true, product });
});

// Create Product (Needs 'admin' or 'superadmin')
router.post('/', requireRole(['admin', 'superadmin', 'super_admin']), (req, res) => {
  const newProd = {
    id: req.body.id || `prod-${Date.now()}`,
    ...req.body,
    createdAt: req.body.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  SERVER_PRODUCTS.unshift(newProd);
  res.status(201).json({ success: true, product: newProd });
});

// Update Product (Needs 'admin' or 'superadmin')
router.put('/:id', requireRole(['admin', 'superadmin', 'super_admin']), (req, res) => {
  const idx = SERVER_PRODUCTS.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  SERVER_PRODUCTS[idx] = { ...SERVER_PRODUCTS[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, product: SERVER_PRODUCTS[idx] });
});

// Delete Product (Needs 'admin' or 'superadmin')
router.delete('/:id', requireRole(['admin', 'superadmin', 'super_admin']), (req, res) => {
  const idx = SERVER_PRODUCTS.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const deleted = SERVER_PRODUCTS.splice(idx, 1)[0];
  res.json({ success: true, deletedId: req.params.id, product: deleted });
});

// Categories router (Public)
export const categoriesRouter = Router();

categoriesRouter.get('/', (_req, res) => {
  res.json({ success: true, total: SERVER_CATEGORIES.length, categories: SERVER_CATEGORIES });
});

export default router;
