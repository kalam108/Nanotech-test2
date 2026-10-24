import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

/**
 * POST /api/discounts/check
 * Authenticated logged-in users only.
 * Checks ONE discount code using supabaseAdmin without increasing used_count.
 * Returns only { valid, type, value, min_order_amount }.
 * Never returns the list of codes to the browser.
 */
router.post('/check', requireAuth, async (req, res) => {
  const code = (req.body.code || req.body.couponCode || req.body.discountCode || '').trim();

  if (!code) {
    return res.status(400).json({ valid: false, error: 'Discount code is required' });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('discounts')
      .select('code, type, value, min_order_amount, start_date, end_date, usage_limit, used_count, is_active')
      .ilike('code', code)
      .maybeSingle();

    if (error || !data || !data.is_active) {
      return res.status(400).json({ valid: false, error: 'Invalid or expired discount code' });
    }

    const now = new Date();
    if (data.start_date && new Date(data.start_date) > now) {
      return res.status(400).json({ valid: false, error: 'Discount code is not active yet' });
    }
    if (data.end_date && new Date(data.end_date) < now) {
      return res.status(400).json({ valid: false, error: 'Discount code has expired' });
    }
    if (data.usage_limit && (data.used_count || 0) >= data.usage_limit) {
      return res.status(400).json({ valid: false, error: 'Discount code usage limit reached' });
    }

    // Returns ONLY { valid, type, value, min_order_amount }
    return res.json({
      valid: true,
      type: data.type,
      value: Number(data.value),
      min_order_amount: Number(data.min_order_amount) || 0,
    });
  } catch (err: any) {
    return res.status(400).json({ valid: false, error: 'Invalid or expired discount code' });
  }
});

export default router;
