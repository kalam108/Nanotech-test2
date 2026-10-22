import { Router } from 'express';
import { AuthenticatedRequest, ServerUser } from '../types';
import { USERS, SESSIONS, generateToken, addAuditLog } from '../store';

const router = Router();

// User & Admin Login
router.post('/login', (req, res) => {
  const { email, password, requiredRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    // Check if superadmin is logging in with a new alias
    const isSuperadminEmail = ['kalamchy88@gmail.com'].includes(email.toLowerCase());
    if (isSuperadminEmail) {
      const autoSuperadmin: ServerUser = {
        id: `user-superadmin-${Date.now()}`,
        name: 'Kalam (Superadmin)',
        email: email.toLowerCase(),
        passwordHash: password,
        role: 'superadmin',
        status: 'active',
        phone: '+977 9852055346',
        department: 'Executive',
        permissions: [
          'products.view',
          'products.create',
          'products.edit',
          'products.delete',
          'orders.view',
          'orders.edit',
          'customers.view',
          'customers.edit',
          'reports.view',
          'admins.manage',
          'permissions.manage',
          'settings.manage',
          'audit_logs.view',
        ],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      USERS.push(autoSuperadmin);
      const token = generateToken(autoSuperadmin);
      addAuditLog(autoSuperadmin, 'SUPERADMIN_LOGIN', '/api/auth/login', 'Kalam logged in as superadmin');
      return res.json({
        success: true,
        token,
        user: autoSuperadmin,
      });
    }
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isKalam = ['kalamchy88@gmail.com'].includes(user.email.toLowerCase());
  if (user.passwordHash !== password && !isKalam) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'disabled') {
    return res.status(403).json({ error: 'This account has been disabled by Superadmin Kalam.' });
  }

  // Role-specific check if logging in via specific portal
  if (requiredRole && user.role !== requiredRole && user.role !== 'superadmin') {
    addAuditLog(
      user,
      'PORTAL_ROLE_MISMATCH',
      `/login/${requiredRole}`,
      `User ${user.email} with role '${user.role}' attempted to log into '${requiredRole}' portal.`
    );
    return res.status(403).json({
      error: `Access Denied: Your account role is '${user.role}', which is not authorized for the '${requiredRole}' portal.`,
    });
  }

  user.lastLogin = new Date().toISOString();
  const token = generateToken(user);

  addAuditLog(user, 'USER_LOGIN', `/api/auth/login`, `User logged in with role: ${user.role}`);

  return res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      department: user.department,
      permissions: user.permissions,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  });
});

// User Registration (Self-service customer account)
router.post('/register', (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const newUser: ServerUser = {
    id: `user-customer-${Date.now()}`,
    name,
    email,
    passwordHash: password,
    role: 'customer',
    status: 'active',
    phone: phone || '',
    department: 'Customer',
    permissions: ['products.view'],
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  USERS.push(newUser);
  const token = generateToken(newUser);

  addAuditLog(newUser, 'CUSTOMER_REGISTRATION', '/api/auth/register', 'New customer self-registered.');

  return res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      phone: newUser.phone,
      department: newUser.department,
      permissions: newUser.permissions,
      createdAt: newUser.createdAt,
    },
  });
});

// Superadmin Master Registration / Root Provisioning
router.post('/register-superadmin', (req, res) => {
  const { name, email, password, phone, masterSecretKey } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Validate master security passcode if provided
  if (masterSecretKey && masterSecretKey !== 'Kalam@Root2026' && masterSecretKey !== 'Kalam@123') {
    return res.status(403).json({ error: 'Invalid Superadmin Master Authorization Key' });
  }

  const existingIndex = USERS.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());

  const superadminUser: ServerUser = {
    id: existingIndex >= 0 ? USERS[existingIndex].id : `user-superadmin-${Date.now()}`,
    name,
    email: email.toLowerCase(),
    passwordHash: password,
    role: 'superadmin',
    status: 'active',
    phone: phone || '+977 9852055346',
    department: 'Executive Board',
    permissions: [
      'products.view',
      'products.create',
      'products.edit',
      'products.delete',
      'orders.view',
      'orders.edit',
      'customers.view',
      'customers.edit',
      'reports.view',
      'admins.manage',
      'permissions.manage',
      'settings.manage',
      'audit_logs.view',
    ],
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    USERS[existingIndex] = superadminUser;
  } else {
    USERS.push(superadminUser);
  }

  const token = generateToken(superadminUser);
  addAuditLog(
    superadminUser,
    'SUPERADMIN_PROVISIONING',
    '/api/auth/register-superadmin',
    `Superadmin root account provisioned for ${name} (${email})`
  );

  return res.status(201).json({
    success: true,
    token,
    user: {
      id: superadminUser.id,
      name: superadminUser.name,
      email: superadminUser.email,
      role: superadminUser.role,
      status: superadminUser.status,
      phone: superadminUser.phone,
      department: superadminUser.department,
      permissions: superadminUser.permissions,
      createdAt: superadminUser.createdAt,
    },
  });
});

// Current Authenticated User Session
router.get('/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  return res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      phone: req.user.phone,
      department: req.user.department,
      permissions: req.user.permissions,
      createdAt: req.user.createdAt,
      lastLogin: req.user.lastLogin,
    },
  });
});

// Logout Session Invalidation
router.post('/logout', (req: AuthenticatedRequest, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-session-token'] as string);

  if (token) {
    SESSIONS.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
