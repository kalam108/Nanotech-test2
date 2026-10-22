import { Product, Order } from '../types';

export interface EndpointTestResult {
  endpoint: string;
  method: string;
  status: number | string;
  latencyMs: number;
  ok: boolean;
  responseSnippet?: string;
}

export interface ServerStatusReport {
  status: string;
  connected: boolean;
  server: string;
  port: number;
  uptimeSeconds: number;
  timestamp: string;
  nodeVersion: string;
  productsCount: number;
  ordersCount: number;
  categoriesCount: number;
  usersCount: number;
  activeSessions: number;
  superAdmin: string;
  geminiConfigured: boolean;
  endpoints: Array<{ path: string; method: string; status: string; desc: string }>;
}

/**
 * High-precision server ping calculation
 */
export async function pingServer(): Promise<{ pong: boolean; latencyMs: number; error?: string }> {
  const start = performance.now();
  try {
    const res = await fetch('/api/server/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientTime: Date.now() }),
    });
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    if (!res.ok) {
      return { pong: false, latencyMs, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { pong: Boolean(data?.pong), latencyMs };
  } catch (err: any) {
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    return { pong: false, latencyMs, error: err?.message || 'Network error' };
  }
}

/**
 * Check backend health check status
 */
export async function checkServerHealth(): Promise<{
  online: boolean;
  latencyMs: number;
  data?: any;
  error?: string;
}> {
  const start = performance.now();
  try {
    const res = await fetch('/api/health');
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    if (!res.ok) {
      return { online: false, latencyMs, error: `Server returned HTTP ${res.status}` };
    }
    const data = await res.json();
    return { online: true, latencyMs, data };
  } catch (err: any) {
    const latencyMs = Math.max(1, Math.round(performance.now() - start));
    return { online: false, latencyMs, error: err?.message || 'Failed to reach server' };
  }
}

/**
 * Fetch detailed server diagnostics
 */
export async function fetchServerStatus(): Promise<{
  success: boolean;
  data?: ServerStatusReport;
  error?: string;
}> {
  try {
    const res = await fetch('/api/server/status');
    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Could not fetch status' };
  }
}

/**
 * Fetch products from backend server catalog
 */
export async function fetchServerProducts(params?: {
  category?: string;
  condition?: string;
  search?: string;
}): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.condition && params.condition !== 'all') query.set('condition', params.condition);
    if (params?.search) query.set('search', params.search);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`/api/products${qs}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

/**
 * Create a product on the backend server
 */
export async function createProductOnServer(
  productData: Partial<Product>
): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    const token = localStorage.getItem('nanotech_session_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/products', {
      method: 'POST',
      headers,
      body: JSON.stringify(productData),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Server rejected product' };
    }
    return { success: true, product: data.product };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network failure' };
  }
}

/**
 * Update a product on the backend server
 */
export async function updateProductOnServer(
  id: string,
  updates: Partial<Product>
): Promise<{ success: boolean; product?: Product; error?: string }> {
  try {
    const token = localStorage.getItem('nanotech_session_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Update failed' };
    }
    return { success: true, product: data.product };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network failure' };
  }
}

/**
 * Delete a product on the backend server
 */
export async function deleteProductOnServer(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('nanotech_session_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Delete failed' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network failure' };
  }
}

/**
 * Fetch orders from backend server
 */
export async function fetchServerOrders(): Promise<Order[]> {
  try {
    const token = localStorage.getItem('nanotech_session_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/orders', { headers });
    if (!res.ok) return [];
    const data = await res.json();
    return data.orders || [];
  } catch {
    return [];
  }
}

/**
 * Create an order on the backend server
 */
export async function createOrderOnServer(
  orderData: Partial<Order>
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const token = localStorage.getItem('nanotech_session_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Order creation failed' };
    }
    return { success: true, order: data.order };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network failure' };
  }
}

/**
 * Update order status on backend server
 */
export async function updateOrderStatusOnServer(
  id: string,
  status: string,
  paymentStatus?: string
): Promise<{ success: boolean; order?: Order; error?: string }> {
  try {
    const token = localStorage.getItem('nanotech_session_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status, paymentStatus }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Status update failed' };
    }
    return { success: true, order: data.order };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network failure' };
  }
}

/**
 * Bi-directional catalog and orders sync with backend server
 */
export async function syncAllWithServer(
  products: Product[],
  orders: Order[]
): Promise<{
  success: boolean;
  syncedProductsCount: number;
  syncedOrdersCount: number;
  totalServerProducts?: number;
  totalServerOrders?: number;
  error?: string;
}> {
  try {
    const token = localStorage.getItem('nanotech_session_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch('/api/sync', {
      method: 'POST',
      headers,
      body: JSON.stringify({ products, orders }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        syncedProductsCount: 0,
        syncedOrdersCount: 0,
        error: data.error || 'Sync rejected',
      };
    }

    return {
      success: true,
      syncedProductsCount: data.syncedProductsCount || 0,
      syncedOrdersCount: data.syncedOrdersCount || 0,
      totalServerProducts: data.totalServerProducts,
      totalServerOrders: data.totalServerOrders,
    };
  } catch (err: any) {
    return {
      success: false,
      syncedProductsCount: 0,
      syncedOrdersCount: 0,
      error: err?.message || 'Sync network failure',
    };
  }
}

/**
 * Live test of primary server API endpoints
 */
export async function testAllServerEndpoints(): Promise<EndpointTestResult[]> {
  const tests: Array<{ endpoint: string; method: string; body?: any }> = [
    { endpoint: '/api/health', method: 'GET' },
    { endpoint: '/api/server/status', method: 'GET' },
    { endpoint: '/api/server/ping', method: 'POST', body: { test: true } },
    { endpoint: '/api/products', method: 'GET' },
    { endpoint: '/api/orders', method: 'GET' },
    { endpoint: '/api/weather?city=Itahari', method: 'GET' },
  ];

  const results: EndpointTestResult[] = [];

  for (const t of tests) {
    const start = performance.now();
    try {
      const options: RequestInit = {
        method: t.method,
      };
      if (t.body) {
        options.headers = { 'Content-Type': 'application/json' };
        options.body = JSON.stringify(t.body);
      }
      const token = localStorage.getItem('nanotech_session_token');
      if (token) {
        options.headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
      }

      const res = await fetch(t.endpoint, options);
      const latencyMs = Math.max(1, Math.round(performance.now() - start));
      let snippet = '';
      try {
        const json = await res.json();
        snippet = JSON.stringify(json).slice(0, 100);
      } catch {
        snippet = res.statusText;
      }

      results.push({
        endpoint: t.endpoint,
        method: t.method,
        status: res.status,
        latencyMs,
        ok: res.ok,
        responseSnippet: snippet,
      });
    } catch (err: any) {
      const latencyMs = Math.max(1, Math.round(performance.now() - start));
      results.push({
        endpoint: t.endpoint,
        method: t.method,
        status: 'ERR',
        latencyMs,
        ok: false,
        responseSnippet: err?.message || 'Failed',
      });
    }
  }

  return results;
}

/**
 * Request AI hardware advisor recommendations from server
 */
export async function requestAIAdvice(prompt: string): Promise<{ success: boolean; result: string; error?: string }> {
  try {
    const res = await fetch('/api/ai-advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    return { success: true, result: data.result || '' };
  } catch (err: any) {
    return { success: false, result: '', error: err?.message || 'Failed to contact AI advisor endpoint' };
  }
}

/**
 * Generate AI product description from server
 */
export async function generateProductDescription(productInfo: {
  title: string;
  category?: string;
  brand?: string;
  specs?: any;
}): Promise<{ success: boolean; description: string; error?: string }> {
  try {
    const res = await fetch('/api/generate-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productInfo),
    });
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    return { success: true, description: data.description || '' };
  } catch (err: any) {
    return { success: false, description: '', error: err?.message || 'Failed to generate product description' };
  }
}

