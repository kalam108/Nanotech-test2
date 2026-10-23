import express from 'express';
import { authenticateToken } from './middleware/auth';
import { APP_URL } from './config';
import authRouter from './routes/auth.routes';
import adminRouter, { superAdminRouter } from './routes/admin.routes';
import customerRouter from './routes/customer.routes';
import productsRouter, { categoriesRouter } from './routes/products.routes';
import ordersRouter, { syncRouter } from './routes/orders.routes';
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
app.use('/api/sync', syncRouter);
app.use('/api', aiRouter);
app.use('/api', diagnosticsRouter);

export default app;
