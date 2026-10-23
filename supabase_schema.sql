-- NanoTech: tables + roles + security (super admin: kalamchy88, admin: ntsolution68)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- ===== TABLES =====
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','seller','admin','super_admin')),
  phone TEXT, avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','suspended','pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.sellers (
  id TEXT PRIMARY KEY, user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL, bio TEXT, phone TEXT, whatsapp TEXT, facebook_url TEXT, location TEXT,
  status TEXT DEFAULT 'verified' CHECK (status IN ('verified','pending','suspended')),
  rating NUMERIC(3,2) DEFAULT 5.00, review_count INTEGER DEFAULT 0, verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, icon_name TEXT DEFAULT 'Cpu',
  description TEXT, product_count INTEGER DEFAULT 0, featured BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, slug TEXT, description TEXT,
  price NUMERIC(10,2) NOT NULL, original_price NUMERIC(10,2), category TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'brand_new' CHECK (condition IN ('brand_new','like_new','used_good','refurbished','New','Refurbished - Like New','Used - Good')),
  brand TEXT NOT NULL, images JSONB NOT NULL DEFAULT '[]'::jsonb, seller_id TEXT NOT NULL, seller_name TEXT NOT NULL,
  seller_rating NUMERIC(3,2) DEFAULT 5.00, seller_verified BOOLEAN DEFAULT true, stock INTEGER DEFAULT 1,
  is_featured BOOLEAN DEFAULT false, specifications JSONB DEFAULT '[]'::jsonb, location TEXT,
  delivery_options TEXT DEFAULT 'Standard Delivery & Pickup', views_count INTEGER DEFAULT 0, clicks_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('published','draft','archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY, buyer_id TEXT NOT NULL, buyer_name TEXT NOT NULL, buyer_email TEXT, buyer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, total_amount NUMERIC(10,2) NOT NULL, subtotal NUMERIC(10,2),
  tax NUMERIC(10,2) DEFAULT 0, shipping_fee NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'processing' CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  payment_method TEXT DEFAULT 'credit_card',
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  shipping_address JSONB DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY, product_id TEXT NOT NULL, user_id TEXT NOT NULL, user_name TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL, comment TEXT, verified_purchase BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY, product_id TEXT, product_title TEXT, buyer_id TEXT NOT NULL, buyer_name TEXT NOT NULL,
  seller_id TEXT NOT NULL, seller_name TEXT NOT NULL, last_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL, sender_id TEXT NOT NULL, sender_name TEXT NOT NULL,
  content TEXT NOT NULL, is_read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.tally_accounts (
  id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense')), sub_type TEXT NOT NULL,
  opening_balance NUMERIC(14,2) DEFAULT 0, current_balance NUMERIC(14,2) DEFAULT 0, description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.tally_vouchers (
  id TEXT PRIMARY KEY, voucher_number TEXT NOT NULL UNIQUE, date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('sales','purchase','payment','receipt','contra','journal')),
  debit_account TEXT NOT NULL REFERENCES public.tally_accounts(id), credit_account TEXT NOT NULL REFERENCES public.tally_accounts(id),
  amount NUMERIC(14,2) NOT NULL, reference TEXT, payment_method TEXT DEFAULT 'Bank Transfer', narration TEXT NOT NULL,
  status TEXT DEFAULT 'posted' CHECK (status IN ('draft','posted','cancelled')), approved_by TEXT DEFAULT 'Super Admin',
  created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.excel_workbooks (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT, active_sheet_id TEXT, created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.excel_sheets (
  id TEXT PRIMARY KEY, workbook_id TEXT REFERENCES public.excel_workbooks(id) ON DELETE CASCADE, name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0, cells JSONB NOT NULL DEFAULT '{}'::jsonb, row_count INTEGER DEFAULT 100, col_count INTEGER DEFAULT 26,
  column_widths JSONB DEFAULT '{}'::jsonb, row_heights JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.accounting_expenses (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, amount NUMERIC(12,2) NOT NULL, category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE, payment_method TEXT DEFAULT 'Bank Wire', vendor TEXT, receipt_url TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved','pending','rejected')), created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.accounting_revenues (
  id TEXT PRIMARY KEY, source TEXT NOT NULL, amount NUMERIC(12,2) NOT NULL, category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE, invoice_id TEXT, payment_channel TEXT DEFAULT 'Online Payment',
  status TEXT DEFAULT 'received', created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.accounting_transactions (
  id TEXT PRIMARY KEY, txn_number TEXT NOT NULL, date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('credit','debit')), amount NUMERIC(12,2) NOT NULL,
  description TEXT, category TEXT, account TEXT, balance NUMERIC(14,2), created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.budget_plans (
  id TEXT PRIMARY KEY, fiscal_year TEXT NOT NULL, quarter TEXT NOT NULL, category TEXT NOT NULL,
  allocated_amount NUMERIC(12,2) NOT NULL, spent_amount NUMERIC(12,2) DEFAULT 0, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.website_banners (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, subtitle TEXT, tag TEXT, image_url TEXT NOT NULL, link_url TEXT,
  position TEXT DEFAULT 'hero_slider', is_active BOOLEAN DEFAULT true, created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.website_offers (
  id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, discount_percent NUMERIC(5,2), discount_amount NUMERIC(10,2),
  description TEXT, min_spend NUMERIC(10,2) DEFAULT 0, valid_until TIMESTAMPTZ, is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.activity_audit_logs (
  id TEXT PRIMARY KEY, admin_email TEXT NOT NULL, action TEXT NOT NULL, category TEXT NOT NULL,
  details TEXT, ip_address TEXT, timestamp TIMESTAMPTZ DEFAULT NOW());

CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW());

-- ===== TIMESTAMP TRIGGERS =====
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===== ROLES BY EMAIL =====
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE LOWER(NEW.email)
      WHEN 'kalamchy88@gmail.com' THEN 'super_admin'
      WHEN 'ntsolution68@gmail.com' THEN 'admin'
      ELSE 'customer' END,
    'active')
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE v_role TEXT;
BEGIN
  IF LOWER(COALESCE(auth.jwt()->>'email', '')) = 'kalamchy88@gmail.com' THEN RETURN 'super_admin'; END IF;
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid()::text;
  RETURN COALESCE(v_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() = 'super_admin'; $$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin_or_super() RETURNS BOOLEAN AS $$
  SELECT public.get_current_user_role() IN ('admin','super_admin'); $$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Only super admin can change anyone's role
CREATE OR REPLACE FUNCTION public.enforce_role_update_superadmin_only()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.uid() IS NOT NULL AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only super_admin can change user roles.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_enforce_role_update ON public.profiles;
CREATE TRIGGER trg_enforce_role_update BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_role_update_superadmin_only();

-- ===== SECURITY (RLS) =====
DO $$
DECLARE t TEXT; p RECORD;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','sellers','categories','products','orders','reviews','conversations','messages',
    'tally_accounts','tally_vouchers','excel_workbooks','excel_sheets','accounting_expenses','accounting_revenues',
    'accounting_transactions','budget_plans','website_banners','website_offers','activity_audit_logs','system_settings']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    FOR p IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, t);
    END LOOP;
  END LOOP;

  -- Store items: everyone can view, only admins can change
  FOREACH t IN ARRAY ARRAY['products','categories','sellers','website_banners','website_offers'] LOOP
    EXECUTE format('CREATE POLICY "read_all" ON public.%I FOR SELECT USING (true)', t);
    EXECUTE format('CREATE POLICY "admin_write" ON public.%I FOR ALL USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super())', t);
  END LOOP;

  -- Business data: admins only
  FOREACH t IN ARRAY ARRAY['tally_accounts','tally_vouchers','excel_workbooks','excel_sheets','accounting_expenses',
    'accounting_revenues','accounting_transactions','budget_plans','activity_audit_logs'] LOOP
    EXECUTE format('CREATE POLICY "admin_only" ON public.%I FOR ALL USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super())', t);
  END LOOP;
END $$;

-- Profiles: users see themselves, admins see everyone
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (id = auth.uid()::text OR public.is_admin_or_super());
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (id = auth.uid()::text OR public.is_admin_or_super());
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE USING (public.is_super_admin());

-- Orders: customers see their own, admins see all
CREATE POLICY "orders_select" ON public.orders FOR SELECT USING (
  buyer_id = auth.uid()::text OR LOWER(buyer_email) = LOWER(COALESCE(auth.jwt()->>'email','')) OR public.is_admin_or_super());
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (buyer_id = auth.uid()::text OR public.is_admin_or_super());
CREATE POLICY "orders_update" ON public.orders FOR UPDATE USING (public.is_admin_or_super());
CREATE POLICY "orders_delete" ON public.orders FOR DELETE USING (public.is_super_admin());

-- Reviews: anyone can read, logged-in users write their own
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "reviews_admin" ON public.reviews FOR DELETE USING (public.is_admin_or_super());

-- Chat: only the people in the conversation, plus admins
CREATE POLICY "conv_access" ON public.conversations FOR ALL
  USING (buyer_id = auth.uid()::text OR seller_id = auth.uid()::text OR public.is_admin_or_super())
  WITH CHECK (buyer_id = auth.uid()::text OR public.is_admin_or_super());
CREATE POLICY "msg_access" ON public.messages FOR ALL
  USING (sender_id = auth.uid()::text OR public.is_admin_or_super() OR EXISTS (
    SELECT 1 FROM public.conversations c WHERE c.id = conversation_id
      AND (c.buyer_id = auth.uid()::text OR c.seller_id = auth.uid()::text)))
  WITH CHECK (sender_id = auth.uid()::text OR public.is_admin_or_super());

-- Settings: everyone reads, only super admin changes
CREATE POLICY "settings_read" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "settings_write" ON public.system_settings FOR ALL USING (public.is_super_admin()) WITH CHECK (public.is_super_admin());

-- Fix roles of accounts that already exist
UPDATE public.profiles SET role = 'super_admin' WHERE LOWER(email) = 'kalamchy88@gmail.com';
UPDATE public.profiles SET role = 'admin'       WHERE LOWER(email) = 'ntsolution68@gmail.com';