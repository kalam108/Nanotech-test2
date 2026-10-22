import { Router } from 'express';
import { AuthenticatedRequest } from '../types';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Customer Profile Endpoint
router.get('/profile', requireAuth, (req: AuthenticatedRequest, res) => {
  return res.json({
    profile: {
      userId: req.user!.id,
      name: req.user!.name,
      email: req.user!.email,
      phone: req.user!.phone || '+977 9812345678',
      address: 'National Galli, Ward-6',
      city: 'Itahari, Sunsari',
      country: 'Nepal',
      rewardPoints: 450,
    },
  });
});

export default router;
