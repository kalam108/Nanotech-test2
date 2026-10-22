import express from 'express';
import { authenticateToken } from './middleware/auth';
import authRouter from './routes/auth.routes';
import adminRouter, { superAdminRouter } from './routes/admin.routes';
import customerRouter from './routes/customer.routes';
import productsRouter, { categoriesRouter } from './routes/products.routes';
import ordersRouter, { syncRouter } from './routes/orders.routes';
import aiRouter from './routes/ai.routes';
import diagnosticsRouter from './routes/diagnostics.routes';

export const app = express();

// CORS and Global Preflight
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-session-token');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
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
app.use('/api/sync', syncRouter);
app.use('/api', aiRouter);
app.use('/api', diagnosticsRouter);

export default app;
