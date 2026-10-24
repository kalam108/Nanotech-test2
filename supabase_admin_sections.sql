-- ==============================================================================
-- NanoTech Admin Sections Schema (banners, discounts, store_settings)
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT NOT NULL DEFAULT 'NanoTech Computers & Solutions',
  phone TEXT DEFAULT '+977 9852055346',
  email TEXT DEFAULT 'ntsolution68@gmail.com',
  address TEXT DEFAULT 'Main Road, Itahari-4, Sunsari, Nepal',
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  free_delivery_above NUMERIC(10,2) NOT NULL DEFAULT 5000.00,
  low_stock_threshold INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default settings row if not exists
INSERT INTO public.store_settings (id, store_name, phone, email, address, delivery_fee, free_delivery_above, low_stock_threshold)
VALUES ('default', 'NanoTech Computers & Solutions', '+977 9852055346', 'ntsolution68@gmail.com', 'Main Road, Itahari-4, Sunsari, Nepal', 150.00, 5000.00, 3)
ON CONFLICT (id) DO NOTHING;

-- 2. BANNERS TABLE
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OFFERS & DISCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percent', 'fixed')),
  value NUMERIC(10,2) NOT NULL CHECK (value > 0),
  min_order_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  usage_limit INTEGER DEFAULT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current caller has admin or super_admin role
CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()::text
      AND role IN ('admin', 'super_admin', 'superadmin')
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- STORE SETTINGS POLICIES ---
-- Anyone (public and authenticated) can view store settings
DROP POLICY IF EXISTS "Public can view store settings" ON public.store_settings;
CREATE POLICY "Public can view store settings"
  ON public.store_settings
  FOR SELECT
  USING (true);

-- Only admin or superadmin can insert/update store settings
DROP POLICY IF EXISTS "Admin/Superadmin can modify store settings" ON public.store_settings;
CREATE POLICY "Admin/Superadmin can modify store settings"
  ON public.store_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_superadmin())
  WITH CHECK (public.is_admin_or_superadmin());

-- --- BANNERS POLICIES ---
-- Public can read active banners within their scheduled dates
DROP POLICY IF EXISTS "Public can view active banners" ON public.banners;
CREATE POLICY "Public can view active banners"
  ON public.banners
  FOR SELECT
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Admins and superadmins have full management access to all banners
DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;
CREATE POLICY "Admins can manage banners"
  ON public.banners
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_superadmin())
  WITH CHECK (public.is_admin_or_superadmin());

-- --- DISCOUNTS POLICIES ---
-- Admins and superadmins can manage all discounts
DROP POLICY IF EXISTS "Admins can manage discounts" ON public.discounts;
CREATE POLICY "Admins can manage discounts"
  ON public.discounts
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_superadmin())
  WITH CHECK (public.is_admin_or_superadmin());

-- Remove any general customer access to prevent listing discount codes in browser
DROP POLICY IF EXISTS "Authenticated can check active discounts" ON public.discounts;

-- Database function: redeem_discount
-- Atomically validates and redeems a single discount code for a given order amount
CREATE OR REPLACE FUNCTION public.redeem_discount(p_code TEXT, p_order_amount NUMERIC)
RETURNS TABLE (
  discount_id UUID,
  discount_type TEXT,
  discount_value NUMERIC
) AS $$
  UPDATE public.discounts
  SET used_count = used_count + 1,
      updated_at = NOW()
  WHERE UPPER(TRIM(code)) = UPPER(TRIM(p_code))
    AND is_active = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
    AND (usage_limit IS NULL OR used_count < usage_limit)
    AND (min_order_amount <= p_order_amount)
  RETURNING id AS discount_id, type AS discount_type, value AS discount_value;
$$ LANGUAGE sql SECURITY DEFINER;

ALTER FUNCTION public.redeem_discount(TEXT, NUMERIC) SET search_path = public;
REVOKE ALL ON FUNCTION public.redeem_discount(TEXT, NUMERIC) FROM PUBLIC, anon, authenticated;

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION FOR BANNERS
-- ==============================================================================
-- Create the 'banners' storage bucket if it does not already exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public read access for banner images
DROP POLICY IF EXISTS "Public can view banner images" ON storage.objects;
CREATE POLICY "Public can view banner images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

-- Storage RLS: Admin/Superadmin upload & manage banner images
DROP POLICY IF EXISTS "Admin can upload banner images" ON storage.objects;
CREATE POLICY "Admin can upload banner images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'banners' AND public.is_admin_or_superadmin());

DROP POLICY IF EXISTS "Admin can update banner images" ON storage.objects;
CREATE POLICY "Admin can update banner images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'banners' AND public.is_admin_or_superadmin());

DROP POLICY IF EXISTS "Admin can delete banner images" ON storage.objects;
CREATE POLICY "Admin can delete banner images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'banners' AND public.is_admin_or_superadmin());
