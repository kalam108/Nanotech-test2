-- ==============================================================================
-- NanoTech: Customer Login & Sign-Up Emails Collection SQL (FIXED)
-- Schema: customer_emails
-- Table: Store_user
-- Project: yjidtfznzmfhjtbrjnjo
-- ==============================================================================
-- WHY THE ERROR HAPPENED:
-- If an empty "Store_user" table was created manually in the Supabase UI first,
-- it only had default columns (id, created_at) and lacked the "email" column.
-- Because "CREATE TABLE IF NOT EXISTS" skips existing tables, subsequent
-- statements trying to index or insert into "email" threw:
-- ERROR: 42703: column "email" does not exist.
--
-- THIS SCRIPT SAFELY DROPS ANY EMPTY/BROKEN PREVIOUS TABLE AND RE-CREATES
-- THE EXACT SCHEMA WITH ALL COLUMNS, CONSTRAINTS, AND AUTOMATED TRIGGERS.
-- ==============================================================================

-- 1. Ensure Schema customer_emails exists
CREATE SCHEMA IF NOT EXISTS customer_emails;
GRANT USAGE ON SCHEMA customer_emails TO postgres, anon, authenticated, service_role;

-- 2. Drop existing triggers, functions, views, and partial tables cleanly
DROP TRIGGER IF EXISTS on_auth_user_customer_sync ON auth.users;
DROP FUNCTION IF EXISTS public.handle_customer_login_sync() CASCADE;

DROP VIEW IF EXISTS customer_emails.store_user CASCADE;
DROP VIEW IF EXISTS customer_emails."Store_user" CASCADE;
DROP TABLE IF EXISTS customer_emails."Store_user" CASCADE;
DROP TABLE IF EXISTS customer_emails.store_user CASCADE;
DROP TABLE IF EXISTS public.store_users CASCADE;

-- 3. Create customer_emails."Store_user" table with email and all necessary columns
CREATE TABLE customer_emails."Store_user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT DEFAULT 'Customer',
  phone TEXT DEFAULT '',
  login_provider TEXT DEFAULT 'email',
  login_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  role TEXT DEFAULT 'customer',
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fast lookup indexes
CREATE INDEX idx_customer_emails_store_user_email ON customer_emails."Store_user" (email);
CREATE INDEX idx_customer_emails_store_user_last_login ON customer_emails."Store_user" (last_sign_in_at DESC);

-- View so lowercase customer_emails.store_user also works seamlessly
CREATE OR REPLACE VIEW customer_emails.store_user AS 
  SELECT * FROM customer_emails."Store_user";

-- Row Level Security (RLS)
ALTER TABLE customer_emails."Store_user" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select Store_user"
  ON customer_emails."Store_user" FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

CREATE POLICY "Allow insert Store_user"
  ON customer_emails."Store_user" FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

CREATE POLICY "Allow update Store_user"
  ON customer_emails."Store_user" FOR UPDATE
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

GRANT ALL ON customer_emails."Store_user" TO postgres, anon, authenticated, service_role;
GRANT ALL ON customer_emails.store_user TO postgres, anon, authenticated, service_role;

-- 4. Create public.store_users (mirror table for frontend client SDK)
CREATE TABLE public.store_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT DEFAULT 'Customer',
  phone TEXT DEFAULT '',
  login_provider TEXT DEFAULT 'email',
  login_count INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  role TEXT DEFAULT 'customer',
  last_sign_in_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_public_store_users_email ON public.store_users (email);
CREATE INDEX idx_public_store_users_last_login ON public.store_users (last_sign_in_at DESC);

ALTER TABLE public.store_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select public store_users"
  ON public.store_users FOR SELECT
  TO anon, authenticated, service_role
  USING (true);

CREATE POLICY "Allow insert public store_users"
  ON public.store_users FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

CREATE POLICY "Allow update public store_users"
  ON public.store_users FOR UPDATE
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

GRANT ALL ON public.store_users TO postgres, anon, authenticated, service_role;

-- 5. Trigger Function to automatically capture customer logins into Store_user
CREATE OR REPLACE FUNCTION public.handle_customer_login_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, customer_emails, auth, pg_temp
AS $$
DECLARE
  v_name TEXT;
  v_phone TEXT;
  v_provider TEXT;
BEGIN
  -- If user has no email, skip
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RETURN NEW;
  END IF;

  v_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    CONCAT_WS(' ', NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name'),
    NEW.raw_user_meta_data->>'name',
    'Customer'
  );
  v_phone := COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone, '');
  v_provider := COALESCE(NEW.raw_app_meta_data->>'provider', 'email');

  -- 1. Sync into customer_emails."Store_user"
  INSERT INTO customer_emails."Store_user" AS su (
    user_id,
    email,
    full_name,
    phone,
    login_provider,
    login_count,
    last_sign_in_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_phone,
    v_provider,
    1,
    COALESCE(NEW.last_sign_in_at, NOW()),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    last_sign_in_at = COALESCE(NEW.last_sign_in_at, NOW()),
    login_count = su.login_count + 1,
    full_name = CASE WHEN EXCLUDED.full_name <> 'Customer' THEN EXCLUDED.full_name ELSE su.full_name END,
    phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE su.phone END,
    updated_at = NOW();

  -- 2. Sync into public.store_users
  INSERT INTO public.store_users AS psu (
    user_id,
    email,
    full_name,
    phone,
    login_provider,
    login_count,
    last_sign_in_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_phone,
    v_provider,
    1,
    COALESCE(NEW.last_sign_in_at, NOW()),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET
    last_sign_in_at = COALESCE(NEW.last_sign_in_at, NOW()),
    login_count = psu.login_count + 1,
    full_name = CASE WHEN EXCLUDED.full_name <> 'Customer' THEN EXCLUDED.full_name ELSE psu.full_name END,
    phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE psu.phone END,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_customer_sync
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_customer_login_sync();

-- 6. Backfill existing registered users from auth.users
INSERT INTO customer_emails."Store_user" (user_id, email, full_name, phone, login_provider, last_sign_in_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Customer'),
  COALESCE(raw_user_meta_data->>'phone', ''),
  COALESCE(raw_app_meta_data->>'provider', 'email'),
  COALESCE(last_sign_in_at, created_at, NOW())
FROM auth.users
WHERE email IS NOT NULL AND email <> ''
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.store_users (user_id, email, full_name, phone, login_provider, last_sign_in_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Customer'),
  COALESCE(raw_user_meta_data->>'phone', ''),
  COALESCE(raw_app_meta_data->>'provider', 'email'),
  COALESCE(last_sign_in_at, created_at, NOW())
FROM auth.users
WHERE email IS NOT NULL AND email <> ''
ON CONFLICT (email) DO NOTHING;
