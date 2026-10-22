import { Router } from 'express';
import { PORT, getGoogleApiKey, SUPABASE_CONFIG } from '../config';
import { SERVER_PRODUCTS, SERVER_ORDERS, SERVER_CATEGORIES, USERS, SESSIONS } from '../store';

const router = Router();

// Server Health Check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    online: true,
    app: 'nanotech-itahari6.ai.studio | NanoTech Marketplace & Hardware Studio',
    architecture: 'Full-Stack Express + Vite SPA (Modular Architecture)',
    port: PORT,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    productsCount: SERVER_PRODUCTS.length,
    ordersCount: SERVER_ORDERS.length,
    rolesSupported: ['customer', 'admin', 'superadmin'],
    superAdmin: 'Kalam — Superadmin',
    deployment: 'Cloud & Localhost Ready',
  });
});

// Ping endpoint
router.get(['/server/ping', '/ping'], (_req, res) => {
  res.json({ status: 'ok', online: true, timestamp: new Date().toISOString() });
});

// Full Connectivity & Telemetry Diagnostics Report
router.get('/server/status', (_req, res) => {
  const activeApiKey = getGoogleApiKey();
  res.json({
    status: 'online',
    connected: true,
    server: 'NanoTech Enterprise Express Server',
    urlName: 'nanotech-itahari6.ai.studio',
    port: PORT,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    productsCount: SERVER_PRODUCTS.length,
    ordersCount: SERVER_ORDERS.length,
    categoriesCount: SERVER_CATEGORIES.length,
    usersCount: USERS.length,
    activeSessions: SESSIONS.size,
    superAdmin: 'Kalam (Superadmin)',
    geminiConfigured: Boolean(activeApiKey),
    googleCloudConfigured: Boolean(activeApiKey),
    endpoints: [
      { path: '/api/health', method: 'GET', status: 'active', desc: 'Server health check' },
      { path: '/api/server/status', method: 'GET', status: 'active', desc: 'Full connectivity diagnostics' },
      { path: '/api/server/ping', method: 'POST', status: 'active', desc: 'Instant round-trip latency' },
      { path: '/api/products', method: 'GET / POST', status: 'active', desc: 'Product catalog CRUD' },
      { path: '/api/orders', method: 'GET / POST', status: 'active', desc: 'Order tracking & management' },
      { path: '/api/sync', method: 'POST', status: 'active', desc: 'Bi-directional state synchronization' },
      { path: '/api/auth/login', method: 'POST', status: 'active', desc: 'User & admin authentication' },
      { path: '/api/auth/me', method: 'GET', status: 'active', desc: 'Session token validation' },
      { path: '/api/ai-advisor', method: 'POST', status: 'active', desc: 'Hardware AI advisor engine' },
      { path: '/api/generate-description', method: 'POST', status: 'active', desc: 'AI description copywriter' },
      { path: '/api/weather', method: 'GET', status: 'active', desc: 'Nepal live weather telemetry' },
    ],
  });
});

// High-Speed Ping Endpoint
router.post('/server/ping', (_req, res) => {
  res.json({
    pong: true,
    serverTime: Date.now(),
    receivedAt: new Date().toISOString(),
  });
});

// Live Store Location Weather via OpenWeather API (with Nepal Valley Fallback)
router.get('/weather', async (req, res) => {
  const city = req.query.city || 'Itahari';
  const lat = req.query.lat || '26.6632';
  const lon = req.query.lon || '87.2785';
  const apiKey = process.env.OPENWEATHER_API_KEY || '';

  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const response = await fetch(weatherUrl);

    if (response.ok) {
      const data = await response.json();
      return res.json(data);
    }
  } catch {
    // Fallback below
  }

  // Accurate Local Nepal Valley Meteorological Fallback
  const fallbackData = {
    coord: { lon: Number(lon), lat: Number(lat) },
    weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
    main: {
      temp: 26.5,
      feels_like: 27.2,
      temp_min: 24.0,
      temp_max: 29.0,
      pressure: 1012,
      humidity: 65,
    },
    visibility: 10000,
    wind: { speed: 3.2, deg: 120 },
    clouds: { all: 20 },
    dt: Math.floor(Date.now() / 1000),
    sys: { country: 'NP', sunrise: 1718064000, sunset: 1718112000 },
    timezone: 20700, // UTC+5:45 (Nepal Time)
    id: 1283285,
    name: String(city),
    cod: 200,
    isFallback: true,
  };
  return res.json(fallbackData);
});

// Supabase Status Check
router.get('/supabase/status', (_req, res) => {
  res.json({
    configured: true,
    projectId: SUPABASE_CONFIG.projectId,
    supabaseUrl: SUPABASE_CONFIG.url,
    hasPublishableKey: Boolean(SUPABASE_CONFIG.anonKey),
    hasSecretKey: Boolean(SUPABASE_CONFIG.serviceRoleKey),
    superAdminEmail: SUPABASE_CONFIG.superAdminEmail,
    connectedTime: new Date().toISOString(),
  });
});

export default router;
