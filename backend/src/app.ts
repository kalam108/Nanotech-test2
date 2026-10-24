import express from 'express';
import { authenticateToken } from './middleware/auth';
import { APP_URL } from './config';
import authRouter from './routes/auth.routes';
import adminRouter, { superAdminRouter } from './routes/admin.routes';
import customerRouter from './routes/customer.routes';
import productsRouter, { categoriesRouter } from './routes/products.routes';
import ordersRouter, { syncRouter } from './routes/orders.routes';
import discountsRouter from './routes/discounts.routes';
import aiRouter from './routes/ai.routes';
import diagnosticsRouter from './routes/diagnostics.routes';

export const app = express();

// CORS: Allow only the origin in APP_URL from .env
const allowedOrigin = process.env.APP_URL || APP_URL || 'http://localhost:3000';

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin === allowedOrigin) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    if (origin && origin !== allowedOrigin) {
      return res.status(403).json({ error: 'CORS origin not allowed' });
    }
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(authenticateToken);

// Mount Modular API Routers
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/superadmin', superAdminRouter);
app.use('/api/customer', customerRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/discounts', discountsRouter);
app.use('/api/sync', syncRouter);
app.use('/api', aiRouter);
app.use('/api', diagnosticsRouter);

import { supabaseAdmin } from './lib/supabaseAdmin';
import { SERVER_BANNERS, SERVER_SETTINGS } from './store';

// Public Active Banners (Only active banners within their scheduled dates)
app.get('/api/banners', async (_req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && Array.isArray(data)) {
      const now = new Date();
      const active = data.filter((b) => {
        const afterStart = !b.start_date || new Date(b.start_date) <= now;
        const beforeEnd = !b.end_date || new Date(b.end_date) >= now;
        return afterStart && beforeEnd;
      });
      return res.json({ success: true, banners: active });
    }
  } catch {
    // fallback
  }

  const now = new Date();
  const activeMem = SERVER_BANNERS.filter((b) => {
    if (!b.is_active) return false;
    const afterStart = !b.start_date || new Date(b.start_date) <= now;
    const beforeEnd = !b.end_date || new Date(b.end_date) >= now;
    return afterStart && beforeEnd;
  });
  return res.json({ success: true, banners: activeMem });
});

// Public Store Settings
app.get('/api/settings', async (_req, res) => {
  let settings = {
    store_name: SERVER_SETTINGS.store_name,
    phone: SERVER_SETTINGS.phone,
    email: SERVER_SETTINGS.email,
    address: SERVER_SETTINGS.address,
    delivery_fee: Number(SERVER_SETTINGS.delivery_fee) || 150,
    free_delivery_above: Number(SERVER_SETTINGS.free_delivery_above) || 5000,
  };

  try {
    const { data } = await supabaseAdmin
      .from('store_settings')
      .select('store_name, phone, email, address, delivery_fee, free_delivery_above')
      .eq('id', 'default')
      .maybeSingle();

    if (data) {
      settings = {
        ...settings,
        ...data,
        delivery_fee: Number(data.delivery_fee) >= 0 ? Number(data.delivery_fee) : settings.delivery_fee,
        free_delivery_above: Number(data.free_delivery_above) >= 0 ? Number(data.free_delivery_above) : settings.free_delivery_above,
      };
    }
  } catch {
    // fallback
  }

  return res.json({
    success: true,
    delivery_fee: settings.delivery_fee,
    free_delivery_above: settings.free_delivery_above,
    settings,
  });
});

export default app;
