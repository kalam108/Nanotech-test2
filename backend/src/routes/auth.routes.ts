import { Router } from 'express';
import { AuthenticatedRequest } from '../types';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Current Authenticated User Session (Protected with Supabase Token)
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  return res.json({
    user: {
      id: req.user!.id,
      name: req.user!.name,
      email: req.user!.email,
      role: req.user!.role,
      status: req.user!.status,
      phone: req.user!.phone,
      department: req.user!.department,
      permissions: req.user!.permissions,
      createdAt: req.user!.createdAt,
      lastLogin: req.user!.lastLogin,
    },
  });
});

// Logout Session Endpoint
router.post('/logout', (_req: AuthenticatedRequest, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
