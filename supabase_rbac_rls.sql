-- ==============================================================================
-- NanoTech Role-Based Access Control (RBAC) & Row Level Security (RLS) Policies
-- Roles: 'customer', 'admin', 'super_admin'
-- Supabase Project: zovjbvddiimvxragxxni (https://zovjbvddiimvxragxxni.supabase.co)
-- ==============================================================================

-- 1. UPDATE CHECK CONSTRAINT ON PROFILES TABLE
-- Ensure the role column only allows 'customer', 'admin', and 'super_admin'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'super_admin'));

-- Set default role to 'customer'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'customer';

-- 2. SECURITY DEFINER HELPER FUNCTIONS FOR ROLE VERIFICATION
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
  v_email TEXT;
BEGIN
  -- Check user email first for master super admin / admin overrides
  v_email := LOWER(COALESCE(auth.jwt()->>'email', ''));
  IF v_email = 'kalamchy88@gmail.com' THEN
    RETURN 'super_admin';
  ELSIF v_email = 'ntsolution68@gmail.com' THEN
    RETURN 'admin';
  END IF;

  -- Look up role from public.profiles table
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid()::text;

  RETURN COALESCE(v_role, 'customer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Check if current authenticated user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_current_user_role() = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Check if current authenticated user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_current_user_role() IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 3. PROFILES ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop legacy/previous policies
DROP POLICY IF EXISTS "Public Read Profiles" ON public.profiles;
DROP POLICY IF EXISTS "All Access Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;

-- RLS: Customers can only read their own profile; Admins & Super Admins can read all profiles
CREATE POLICY "Profiles select policy"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid()::text
  OR public.is_admin_or_super()
);

-- RLS: Authenticated users can insert their initial profile
CREATE POLICY "Profiles insert policy"
ON public.profiles
FOR INSERT
WITH CHECK (
  id = auth.uid()::text
  OR public.is_admin_or_super()
);

-- RLS: Profile updates (users can update own profile, but ONLY super_admin can change role)
CREATE POLICY "Profiles update policy"
ON public.profiles
FOR UPDATE
USING (
  id = auth.uid()::text
  OR public.is_admin_or_super()
)
WITH CHECK (
  -- If super_admin, can update anything including roles
  public.is_super_admin()
  OR (
    -- If standard user or admin updating self, role must NOT be modified
    id = auth.uid()::text
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid()::text)
  )
);

-- RLS: Only super_admin can delete profile records
CREATE POLICY "Profiles delete policy"
ON public.profiles
FOR DELETE
USING (
  public.is_super_admin()
);

-- 4. HARD DATABASE TRIGGER: ONLY SUPER_ADMIN CAN UPDATE ROLES
CREATE OR REPLACE FUNCTION public.enforce_role_update_superadmin_only()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Access Denied: Only super_admin accounts can change user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_enforce_role_update ON public.profiles;
CREATE TRIGGER trg_enforce_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_role_update_superadmin_only();

-- 5. ORDERS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop legacy/previous policies
DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
DROP POLICY IF EXISTS "All Access Orders" ON public.orders;
DROP POLICY IF EXISTS "Orders select policy" ON public.orders;
DROP POLICY IF EXISTS "Orders insert policy" ON public.orders;
DROP POLICY IF EXISTS "Orders update policy" ON public.orders;
DROP POLICY IF EXISTS "Orders delete policy" ON public.orders;

-- RLS: Customers can only read their own orders; Admins & Super Admins can read all orders
CREATE POLICY "Orders select policy"
ON public.orders
FOR SELECT
USING (
  buyer_id = auth.uid()::text
  OR LOWER(buyer_email) = LOWER(COALESCE(auth.jwt()->>'email', ''))
  OR public.is_admin_or_super()
);

-- RLS: Customers can create orders for themselves
CREATE POLICY "Orders insert policy"
ON public.orders
FOR INSERT
WITH CHECK (
  buyer_id = auth.uid()::text
  OR public.is_admin_or_super()
  OR auth.uid() IS NULL -- Allow guest checkout if unauthenticated
);

-- RLS: Admins and Super Admins can update orders (e.g., status, tracking numbers)
CREATE POLICY "Orders update policy"
ON public.orders
FOR UPDATE
USING (
  public.is_admin_or_super()
)
WITH CHECK (
  public.is_admin_or_super()
);

-- RLS: Only super_admin can delete orders
CREATE POLICY "Orders delete policy"
ON public.orders
FOR DELETE
USING (
  public.is_super_admin()
);

-- 6. PRODUCTS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Products" ON public.products;
DROP POLICY IF EXISTS "All Access Products" ON public.products;
DROP POLICY IF EXISTS "Products select policy" ON public.products;
DROP POLICY IF EXISTS "Products insert policy" ON public.products;
DROP POLICY IF EXISTS "Products update policy" ON public.products;
DROP POLICY IF EXISTS "Products delete policy" ON public.products;

-- Public can view all products
CREATE POLICY "Products select policy"
ON public.products
FOR SELECT
USING (true);

-- Admins and Super Admins can manage products, prices, and stock
CREATE POLICY "Products insert policy"
ON public.products
FOR INSERT
WITH CHECK (
  public.is_admin_or_super()
);

CREATE POLICY "Products update policy"
ON public.products
FOR UPDATE
USING (
  public.is_admin_or_super()
)
WITH CHECK (
  public.is_admin_or_super()
);

CREATE POLICY "Products delete policy"
ON public.products
FOR DELETE
USING (
  public.is_admin_or_super()
);

-- 7. SYSTEM SETTINGS ROW LEVEL SECURITY (RLS)
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read System Settings" ON public.system_settings;
DROP POLICY IF EXISTS "All Access System Settings" ON public.system_settings;
DROP POLICY IF EXISTS "Settings select policy" ON public.system_settings;
DROP POLICY IF EXISTS "Settings insert policy" ON public.system_settings;
DROP POLICY IF EXISTS "Settings update policy" ON public.system_settings;
DROP POLICY IF EXISTS "Settings delete policy" ON public.system_settings;

-- Public/authenticated can read system settings
CREATE POLICY "Settings select policy"
ON public.system_settings
FOR SELECT
USING (true);

-- ONLY super_admin can modify store settings
CREATE POLICY "Settings insert policy"
ON public.system_settings
FOR INSERT
WITH CHECK (
  public.is_super_admin()
);

CREATE POLICY "Settings update policy"
ON public.system_settings
FOR UPDATE
USING (
  public.is_super_admin()
)
WITH CHECK (
  public.is_super_admin()
);

CREATE POLICY "Settings delete policy"
ON public.system_settings
FOR DELETE
USING (
  public.is_super_admin()
);

-- 8. INITIAL SEED / PROFILE UPDATE
-- Ensure master super admin profiles have the 'super_admin' role
UPDATE public.profiles
SET role = 'super_admin'
WHERE LOWER(email) IN ('kalamchy88@gmail.com');