-- ==============================================================================
-- NanoTech Multi-Vendor Marketplace & Enterprise ERP Database
-- Project ID: zovjbvddiimvxragxxni
-- Supabase URL: https://zovjbvddiimvxragxxni.supabase.co
-- Super Admin: nenotech108@gmail.com
-- ==============================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/zovjbvddiimvxragxxni/sql/new
-- ==============================================================================

-- 0. EXTENSIONS & UTILITIES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Automatic updated_at timestamp function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 1. PROFILES & USERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'seller', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. HARDWARE SELLERS / VENDORS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.sellers (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  bio TEXT,
  phone TEXT,
  whatsapp TEXT,
  facebook_url TEXT,
  location TEXT DEFAULT 'San Jose, CA',
  status TEXT DEFAULT 'verified' CHECK (status IN ('verified', 'pending', 'suspended')),
  rating NUMERIC(3,2) DEFAULT 5.00,
  review_count INTEGER DEFAULT 0,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. PRODUCT CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_name TEXT DEFAULT 'Cpu',
  description TEXT,
  product_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. HARDWARE PRODUCTS CATALOG TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  category TEXT NOT NULL,
  condition TEXT NOT NULL DEFAULT 'brand_new' CHECK (condition IN ('brand_new', 'like_new', 'used_good', 'refurbished', 'New', 'Refurbished - Like New', 'Used - Good')),
  brand TEXT NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  seller_rating NUMERIC(3,2) DEFAULT 5.00,
  seller_verified BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 1,
  is_featured BOOLEAN DEFAULT false,
  specifications JSONB DEFAULT '[]'::jsonb,
  location TEXT DEFAULT 'San Jose, CA',
  delivery_options TEXT DEFAULT 'Standard Delivery & Pickup',
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. CUSTOMER ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT,
  buyer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2),
  tax NUMERIC(10,2) DEFAULT 0,
  shipping_fee NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'processing' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT DEFAULT 'credit_card',
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  shipping_address JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. PRODUCT RATINGS & REVIEWS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. CONVERSATIONS & CHAT MESSAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  product_id TEXT,
  product_title TEXT,
  buyer_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  last_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. TALLY ACCOUNTING: CHART OF ACCOUNTS (LEDGERS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tally_accounts (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  sub_type TEXT NOT NULL,
  opening_balance NUMERIC(14,2) DEFAULT 0,
  current_balance NUMERIC(14,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 9. TALLY ACCOUNTING: DOUBLE-ENTRY VOUCHERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.tally_vouchers (
  id TEXT PRIMARY KEY,
  voucher_number TEXT NOT NULL UNIQUE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('sales', 'purchase', 'payment', 'receipt', 'contra', 'journal')),
  debit_account TEXT NOT NULL REFERENCES public.tally_accounts(id),
  credit_account TEXT NOT NULL REFERENCES public.tally_accounts(id),
  amount NUMERIC(14,2) NOT NULL,
  reference TEXT,
  payment_method TEXT DEFAULT 'Bank Transfer',
  narration TEXT NOT NULL,
  status TEXT DEFAULT 'posted' CHECK (status IN ('draft', 'posted', 'cancelled')),
  approved_by TEXT DEFAULT 'Super Admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 10. ONLINE EXCEL WORKBOOKS & SPREADSHEETS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.excel_workbooks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  active_sheet_id TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.excel_sheets (
  id TEXT PRIMARY KEY,
  workbook_id TEXT REFERENCES public.excel_workbooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  cells JSONB NOT NULL DEFAULT '{}'::jsonb,
  row_count INTEGER DEFAULT 100,
  col_count INTEGER DEFAULT 26,
  column_widths JSONB DEFAULT '{}'::jsonb,
  row_heights JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 11. FINANCE: EXPENSES, REVENUES, TRANSACTIONS & BUDGETS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.accounting_expenses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'Bank Wire',
  vendor TEXT,
  receipt_url TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.accounting_revenues (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  invoice_id TEXT,
  payment_channel TEXT DEFAULT 'Online Payment',
  status TEXT DEFAULT 'received',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.accounting_transactions (
  id TEXT PRIMARY KEY,
  txn_number TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount NUMERIC(12,2) NOT NULL,
  description TEXT,
  category TEXT,
  account TEXT,
  balance NUMERIC(14,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budget_plans (
  id TEXT PRIMARY KEY,
  fiscal_year TEXT NOT NULL,
  quarter TEXT NOT NULL,
  category TEXT NOT NULL,
  allocated_amount NUMERIC(12,2) NOT NULL,
  spent_amount NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 12. STOREFRONT BANNERS, OFFERS & SYSTEM SETTINGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.website_banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  tag TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT DEFAULT 'hero_slider',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.website_offers (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent NUMERIC(5,2),
  discount_amount NUMERIC(10,2),
  description TEXT,
  min_spend NUMERIC(10,2) DEFAULT 0,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activity_audit_logs (
  id TEXT PRIMARY KEY,
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  category TEXT NOT NULL,
  details TEXT,
  ip_address TEXT DEFAULT '127.0.0.1',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 13. TRIGGERS & TIMESTAMP HANDLERS
-- ==============================================================================
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-link Supabase Auth Users to Profiles
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN LOWER(NEW.email) = 'nenotech108@gmail.com' THEN 'admin' ELSE COALESCE(NEW.raw_user_meta_data->>'role', 'customer') END,
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      role = CASE WHEN LOWER(EXCLUDED.email) = 'nenotech108@gmail.com' THEN 'admin' ELSE public.profiles.role END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ==============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tally_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excel_workbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excel_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Permissive policies for full seamless functionality
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "All Access Profiles" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Public Read Sellers" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "All Access Sellers" ON public.sellers FOR ALL USING (true);

CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "All Access Categories" ON public.categories FOR ALL USING (true);

CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);
CREATE POLICY "All Access Products" ON public.products FOR ALL USING (true);

CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "All Access Orders" ON public.orders FOR ALL USING (true);

CREATE POLICY "Public Read Reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "All Access Reviews" ON public.reviews FOR ALL USING (true);

CREATE POLICY "Public Read Conversations" ON public.conversations FOR SELECT USING (true);
CREATE POLICY "All Access Conversations" ON public.conversations FOR ALL USING (true);

CREATE POLICY "Public Read Messages" ON public.messages FOR SELECT USING (true);
CREATE POLICY "All Access Messages" ON public.messages FOR ALL USING (true);

CREATE POLICY "Public Read Tally Accounts" ON public.tally_accounts FOR SELECT USING (true);
CREATE POLICY "All Access Tally Accounts" ON public.tally_accounts FOR ALL USING (true);

CREATE POLICY "Public Read Tally Vouchers" ON public.tally_vouchers FOR SELECT USING (true);
CREATE POLICY "All Access Tally Vouchers" ON public.tally_vouchers FOR ALL USING (true);

CREATE POLICY "Public Read Excel Workbooks" ON public.excel_workbooks FOR SELECT USING (true);
CREATE POLICY "All Access Excel Workbooks" ON public.excel_workbooks FOR ALL USING (true);

CREATE POLICY "Public Read Excel Sheets" ON public.excel_sheets FOR SELECT USING (true);
CREATE POLICY "All Access Excel Sheets" ON public.excel_sheets FOR ALL USING (true);

CREATE POLICY "Public Read Expenses" ON public.accounting_expenses FOR SELECT USING (true);
CREATE POLICY "All Access Expenses" ON public.accounting_expenses FOR ALL USING (true);

CREATE POLICY "Public Read Revenues" ON public.accounting_revenues FOR SELECT USING (true);
CREATE POLICY "All Access Revenues" ON public.accounting_revenues FOR ALL USING (true);

CREATE POLICY "Public Read Transactions" ON public.accounting_transactions FOR SELECT USING (true);
CREATE POLICY "All Access Transactions" ON public.accounting_transactions FOR ALL USING (true);

CREATE POLICY "Public Read Budget" ON public.budget_plans FOR SELECT USING (true);
CREATE POLICY "All Access Budget" ON public.budget_plans FOR ALL USING (true);

CREATE POLICY "Public Read Banners" ON public.website_banners FOR SELECT USING (true);
CREATE POLICY "All Access Banners" ON public.website_banners FOR ALL USING (true);

CREATE POLICY "Public Read Offers" ON public.website_offers FOR SELECT USING (true);
CREATE POLICY "All Access Offers" ON public.website_offers FOR ALL USING (true);

CREATE POLICY "Public Read Audit Logs" ON public.activity_audit_logs FOR SELECT USING (true);
CREATE POLICY "All Access Audit Logs" ON public.activity_audit_logs FOR ALL USING (true);

CREATE POLICY "Public Read System Settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "All Access System Settings" ON public.system_settings FOR ALL USING (true);

-- ==============================================================================
-- 15. SEED DATA STORE: PROFILES & SUPER ADMIN
-- ==============================================================================
INSERT INTO public.profiles (id, email, full_name, role, phone, status)
VALUES
  ('user-super-admin-01', 'nenotech108@gmail.com', 'NanoTech Super Admin', 'admin', '+1 (800) 555-0199', 'active'),
  ('user-seller-1', 'contact@apextech.com', 'Apex Tech Solutions', 'seller', '+1 (555) 234-5678', 'active'),
  ('user-seller-2', 'sales@cyberbyte.io', 'CyberByte Refurbished', 'seller', '+1 (555) 876-5432', 'active'),
  ('user-customer-1', 'alex.rivera@example.com', 'Alex Rivera', 'customer', '+1 (555) 998-1122', 'active')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, role = EXCLUDED.role;

-- Ensure Super Admin email always has admin role
UPDATE public.profiles SET role = 'admin' WHERE LOWER(email) = LOWER('nenotech108@gmail.com');

-- ==============================================================================
-- 16. SEED DATA STORE: HARDWARE SELLERS
-- ==============================================================================
INSERT INTO public.sellers (id, user_id, store_name, bio, phone, location, status, rating, review_count)
VALUES
  ('seller-1', 'user-seller-1', 'Apex Tech Solutions', 'Verified hardware reseller offering high-performance GPUs, custom liquid builds, and pristine used electronics with warranty.', '+1 (555) 234-5678', 'San Jose, CA', 'verified', 4.90, 128),
  ('seller-2', 'user-seller-2', 'CyberByte Refurbished', 'Certified computer refurbishment specialist. Rigorous 30-point inspection on all pre-owned laptops, PCs, and components.', '+1 (555) 876-5432', 'Austin, TX', 'verified', 4.70, 84)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 17. SEED DATA STORE: CATEGORIES
-- ==============================================================================
INSERT INTO public.categories (id, name, slug, icon_name, description, product_count, featured)
VALUES
  ('cat-1', 'Laptops', 'laptops', 'Laptop', 'Gaming, business, and ultrabook laptops', 42, true),
  ('cat-2', 'Desktop PCs', 'desktop-pcs', 'Monitor', 'Custom rigs, prebuilts, and workstations', 28, true),
  ('cat-3', 'Monitors', 'monitors', 'Tv', 'High refresh rate, 4K, and curved displays', 35, true),
  ('cat-4', 'Keyboards', 'keyboards', 'Keyboard', 'Mechanical, wireless, and custom keyboards', 56, true),
  ('cat-5', 'Mouse & Pads', 'mouse-pads', 'Mouse', 'Ergonomic, gaming mouse and desk mats', 49, true),
  ('cat-6', 'Headphones & Audio', 'headphones', 'Headphones', 'Noise cancelling headsets, studio monitors', 38, true),
  ('cat-7', 'Graphics Cards (GPUs)', 'gpus', 'Cpu', 'NVIDIA RTX & AMD Radeon GPUs', 31, true),
  ('cat-8', 'Processors (CPUs)', 'cpus', 'Zap', 'Intel Core & AMD Ryzen CPUs', 24, true),
  ('cat-9', 'SSD & Storage', 'ssd-storage', 'HardDrive', 'NVMe M.2 SSDs, HDDs, and external drives', 45, true),
  ('cat-10', 'RAM Memory', 'ram', 'Server', 'DDR4 and DDR5 desktop and laptop RAM', 30, true),
  ('cat-11', 'Webcams & Streaming', 'webcams', 'Camera', '4K webcams, ring lights, and capture cards', 22, false),
  ('cat-12', 'Microphones', 'microphones', 'Mic', 'USB and XLR podcasting & gaming mics', 19, false),
  ('cat-13', 'Motherboards', 'motherboards', 'LayoutGrid', 'ATX, Micro-ATX, and Mini-ITX boards', 26, false),
  ('cat-14', 'Gaming Accessories', 'gaming-acc', 'Gamepad2', 'Controllers, flight sticks, and VR gear', 33, false),
  ('cat-15', 'Networking', 'networking', 'Wifi', 'Wi-Fi 6 Routers, switches, and mesh nodes', 18, false),
  ('cat-16', 'Cables & Hubs', 'cables-hubs', 'Usb', 'Thunderbolt docks, USB-C hubs, HDMI 2.1', 41, false)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 18. SEED DATA STORE: HARDWARE PRODUCTS CATALOG
-- ==============================================================================
INSERT INTO public.products (id, title, slug, description, price, original_price, category, condition, brand, images, seller_id, seller_name, seller_rating, seller_verified, stock, is_featured, specifications, location)
VALUES
  ('prod-1', 'MacBook Pro 16" M3 Max (36GB / 1TB SSD)', 'macbook-pro-16-m3-max', 'Pristine condition flagship MacBook Pro with 14-core CPU, 30-core GPU, Liquid Retina XDR display.', 2899.00, 3199.00, 'Laptops', 'brand_new', 'Apple', '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800"]'::jsonb, 'seller-1', 'Apex Tech Solutions', 4.90, true, 4, true, '[{"name": "Processor", "value": "Apple M3 Max 14-Core"}, {"name": "Memory", "value": "36GB Unified RAM"}, {"name": "Storage", "value": "1TB PCIe NVMe Gen4"}, {"name": "Display", "value": "16.2-inch Liquid Retina XDR 120Hz"}]'::jsonb, 'San Jose, CA'),
  ('prod-2', 'Alienware Aurora R16 Gaming Desktop (RTX 4090 / i9-14900KF)', 'alienware-aurora-r16-rtx4090', 'Extreme 4K gaming powerhouse. Liquid cooled Intel Core i9, 64GB DDR5, 2TB Gen4 SSD, GeForce RTX 4090 24GB.', 3499.00, 3899.00, 'Desktop PCs', 'brand_new', 'Alienware', '["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800"]'::jsonb, 'seller-1', 'Apex Tech Solutions', 4.90, true, 3, true, '[{"name": "GPU", "value": "NVIDIA GeForce RTX 4090 24GB"}, {"name": "CPU", "value": "Intel Core i9-14900KF 24-Core"}, {"name": "RAM", "value": "64GB DDR5 5600MHz"}]'::jsonb, 'San Jose, CA'),
  ('prod-3', 'ASUS ROG Swift OLED PG32UCDM 32" 4K 240Hz Gaming Monitor', 'asus-rog-swift-oled-32-4k', '3rd Gen QD-OLED panel, 0.03ms response time, Dolby Vision, custom heatsink.', 1299.00, 1399.00, 'Monitors', 'brand_new', 'ASUS ROG', '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800"]'::jsonb, 'seller-1', 'Apex Tech Solutions', 4.90, true, 8, true, '[{"name": "Resolution", "value": "3840 x 2160 (4K UHD)"}, {"name": "Refresh Rate", "value": "240Hz QD-OLED"}]'::jsonb, 'San Jose, CA'),
  ('prod-4', 'Keychron Q1 Pro Wireless Custom Mechanical Keyboard', 'keychron-q1-pro-wireless', 'Full CNC aluminum body, double-gasket design, QMK/VIA programmable with K Pro Banana switches.', 199.00, 229.00, 'Keyboards', 'brand_new', 'Keychron', '["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800"]'::jsonb, 'seller-1', 'Apex Tech Solutions', 4.90, true, 15, true, '[{"name": "Switches", "value": "Gateron Jupiter Banana Hot-Swap"}, {"name": "Connectivity", "value": "Bluetooth 5.1 & Type-C"}]'::jsonb, 'San Jose, CA'),
  ('prod-5', 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse', 'logitech-g-pro-x-superlight-2', '60g ultra-lightweight esports icon with HERO 2 Sensor 32,000 DPI and LIGHTFORCE hybrid switches.', 149.00, 159.00, 'Mouse & Pads', 'brand_new', 'Logitech G', '["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800"]'::jsonb, 'seller-1', 'Apex Tech Solutions', 4.90, true, 22, true, '[{"name": "Sensor", "value": "HERO 2 32K DPI 4K Polling"}, {"name": "Weight", "value": "60 grams"}]'::jsonb, 'San Jose, CA'),
  ('prod-6', 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', 'sony-wh-1000xm5-noise-canceling', 'Industry-leading active noise canceling with 8 microphones, Auto NC Optimizer, and 30hr battery.', 329.00, 399.00, 'Headphones & Audio', 'like_new', 'Sony', '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"]'::jsonb, 'seller-2', 'CyberByte Refurbished', 4.70, true, 9, true, '[{"name": "Battery", "value": "30 Hours with Fast Charge"}, {"name": "Codecs", "value": "LDAC, AAC, SBC"}]'::jsonb, 'Austin, TX'),
  ('prod-7', 'NVIDIA GeForce RTX 4080 Super Founders Edition 16GB', 'nvidia-rtx-4080-super-16gb', 'Ada Lovelace architecture with DLSS 3.5 Frame Generation and 10,240 CUDA Cores.', 999.00, 1149.00, 'Graphics Cards (GPUs)', 'brand_new', 'NVIDIA', '["https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800"]'::jsonb, 'seller-1', 'Apex Tech Solutions', 4.90, true, 6, true, '[{"name": "VRAM", "value": "16GB GDDR6X 256-bit"}, {"name": "Boost Clock", "value": "2550 MHz"}]'::jsonb, 'San Jose, CA'),
  ('prod-8', 'AMD Ryzen 7 7800X3D Desktop Processor (8-Core 16-Thread)', 'amd-ryzen-7-7800x3d', 'The undisputed champion of gaming processors featuring 3D V-Cache Technology and 104MB Cache.', 389.00, 449.00, 'Processors (CPUs)', 'brand_new', 'AMD', '["https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800"]'::jsonb, 'seller-1', 'Apex Tech Solutions', 4.90, true, 18, true, '[{"name": "Socket", "value": "AM5 (Zen 4)"}, {"name": "L3 Cache", "value": "96MB 3D V-Cache"}]'::jsonb, 'San Jose, CA'),
  ('prod-9', 'Samsung 990 PRO 2TB PCIe 4.0 NVMe M.2 SSD with Heatsink', 'samsung-990-pro-2tb-heatsink', 'Blistering fast 7450 MB/s sequential read, 6900 MB/s sequential write speed. PS5 compatible.', 179.00, 209.00, 'SSD & Storage', 'brand_new', 'Samsung', '["https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800"]'::jsonb, 'seller-1', 'Apex Tech Solutions', 4.90, true, 25, true, '[{"name": "Form Factor", "value": "M.2 2280 NVMe 2.0"}, {"name": "Read Speed", "value": "7,450 MB/s"}]'::jsonb, 'San Jose, CA'),
  ('prod-10', 'Corsair Dominator Titanium RGB DDR5 64GB (2x32GB) 6000MHz', 'corsair-dominator-titanium-ddr5-64gb', 'Premium forged aluminum construction, patented DHX cooling, and customizable RGB top bars.', 299.00, 349.00, 'RAM Memory', 'brand_new', 'Corsair', '["https://images.unsplash.com/photo-1562976540-1502c2145186?w=800"]'::jsonb, 'seller-1', 'Apex Tech Solutions', 4.90, true, 12, false, '[{"name": "Speed", "value": "DDR5-6000 CL30"}, {"name": "Profile", "value": "Intel XMP 3.0 & AMD EXPO"}]'::jsonb, 'San Jose, CA')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 19. SEED DATA STORE: TALLY CHART OF ACCOUNTS (LEDGER)
-- ==============================================================================
INSERT INTO public.tally_accounts (id, code, name, type, sub_type, opening_balance, current_balance, description)
VALUES
  ('acc_cash', '1001', 'Cash in Hand (Showroom Till)', 'asset', 'cash', 150000.00, 195000.00, 'Physical cash on premises in showroom safe'),
  ('acc_bank', '1002', 'Commercial Checking Account #0192', 'asset', 'bank', 850000.00, 1420500.00, 'Primary corporate checking account'),
  ('acc_receivable', '1003', 'Accounts Receivable (Trade Debtors)', 'asset', 'receivable', 220000.00, 185000.00, 'Outstanding customer balances on 30-day net terms'),
  ('acc_inventory', '1004', 'Hardware Inventory Stock Valuation', 'asset', 'inventory', 1400000.00, 1850000.00, 'Warehoused GPUs, CPUs, Motherboards, and Custom Systems'),
  ('acc_payable', '2001', 'Accounts Payable (Trade Creditors)', 'liability', 'payable', 350000.00, 280000.00, 'Supplier vendor bills due within 45 days'),
  ('acc_vat_payable', '2002', 'Output VAT 13% Payable', 'liability', 'tax', 48000.00, 96500.00, 'Collected sales tax for periodic revenue deposit'),
  ('acc_capital', '3001', 'Capital & Owner Equity', 'equity', 'capital', 2000000.00, 2000000.00, 'Initial paid-up equity capital'),
  ('acc_sales', '4001', 'Direct Hardware Sales', 'revenue', 'sales', 0.00, 1850000.00, 'Revenue from retail and enterprise component sales'),
  ('acc_assembly_rev', '4002', 'Custom Liquid Rig Assembly Labor', 'revenue', 'sales', 0.00, 145000.00, 'Technical design and precision tubing labor fees'),
  ('acc_cogs', '5001', 'Hardware Procurement & COGS', 'expense', 'purchases', 0.00, 920000.00, 'Direct component purchase cost from OEMs'),
  ('acc_cloud_ops', '5002', 'Cloud Server & Database Infrastructure', 'expense', 'operating_expense', 0.00, 32400.00, 'Hosting infrastructure, AI accelerators, and database'),
  ('acc_shipping', '5003', 'Express Logistics & Freight', 'expense', 'operating_expense', 0.00, 41200.00, 'Air cargo insurance and door-to-door delivery'),
  ('acc_rent', '5004', 'Showroom Rent & Utilities', 'expense', 'operating_expense', 0.00, 120000.00, 'Commercial premises lease & commercial electric power'),
  ('acc_payroll', '5005', 'Staff Payroll & Engineering Labor', 'expense', 'operating_expense', 0.00, 280000.00, 'Technicians, sales staff, and customer support engineers')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 20. SEED DATA STORE: TALLY DOUBLE-ENTRY VOUCHERS
-- ==============================================================================
INSERT INTO public.tally_vouchers (id, voucher_number, date, type, debit_account, credit_account, amount, reference, payment_method, narration, status, approved_by)
VALUES
  ('vch_001', 'VCH-2026-0801-01', '2026-08-01', 'sales', 'acc_bank', 'acc_sales', 361600.00, 'INV-2026-001', 'Bank Transfer', 'Sold RTX 4090 OC + i9-14900KS build to enterprise client via direct wire', 'posted', 'Super Admin'),
  ('vch_002', 'VCH-2026-0802-02', '2026-08-02', 'purchase', 'acc_cogs', 'acc_payable', 1260000.00, 'PO-2026-881', 'Bank Transfer', 'Procured 5x RTX 4090 GPUs batch from OEM Direct Distribution', 'posted', 'Super Admin'),
  ('vch_003', 'VCH-2026-0804-03', '2026-08-04', 'receipt', 'acc_bank', 'acc_sales', 163850.00, 'INV-2026-002', 'Online Pay', 'Received payment for Corsair RAM & Samsung SSD bulk order', 'posted', 'Super Admin'),
  ('vch_004', 'VCH-2026-0806-04', '2026-08-06', 'payment', 'acc_payable', 'acc_bank', 350000.00, 'TXN-PAY-4412', 'Bank Transfer', 'Settled trade creditor invoice to Corsair Taiwan', 'posted', 'Super Admin'),
  ('vch_005', 'VCH-2026-0808-05', '2026-08-08', 'contra', 'acc_bank', 'acc_cash', 100000.00, 'CHQ-882910', 'Cash Deposit', 'Deposited excess weekend showroom cash receipts into bank account', 'posted', 'Super Admin')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 21. SEED DATA STORE: ONLINE EXCEL WORKBOOKS & TEMPLATES
-- ==============================================================================
INSERT INTO public.excel_workbooks (id, title, description, active_sheet_id, created_by)
VALUES
  ('wb_cashflow_01', 'Cash Flow Forecast & Working Capital', 'Monthly inflows, outflows, burn-rate calculations and liquidity runway modeling', 'sheet_cf_01', 'Super Admin'),
  ('wb_pnl_02', 'Quarterly Hardware Profit & Loss', 'Itemized hardware gross margins, operational overheads, and net margins', 'sheet_pnl_01', 'Chief Accountant'),
  ('wb_inv_03', 'Inventory Stock Valuation & COGS', 'SKU-level units, unit costs, real-time markup percentages, and low stock warnings', 'sheet_inv_01', 'Catalog Lead')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.excel_sheets (id, workbook_id, name, order_index, cells, row_count, col_count)
VALUES
  ('sheet_cf_01', 'wb_cashflow_01', 'Cash Flow Model', 0, '{"A1":{"value":"MONTHLY CASH FLOW & REVENUE PROJECTIONS"},"A3":{"value":"Metric"},"B3":{"value":"Month 1"},"C3":{"value":"Month 2"},"D3":{"value":"Month 3"},"E3":{"value":"Q1 Total"},"A4":{"value":"Hardware Sales"},"B4":{"value":1850000},"C4":{"value":2100000},"D4":{"value":2450000},"E4":{"value":6400000,"formula":"=SUM(B4:D4)"},"A5":{"value":"Assembly Labor"},"B5":{"value":145000},"C5":{"value":160000},"D5":{"value":190000},"E5":{"value":495000,"formula":"=SUM(B5:D5)"},"A7":{"value":"Total Inflow"},"B7":{"value":1995000,"formula":"=SUM(B4:B5)"},"C7":{"value":2260000,"formula":"=SUM(C4:C5)"},"D7":{"value":2640000,"formula":"=SUM(D4:D5)"},"E7":{"value":6895000,"formula":"=SUM(B7:D7)"}}'::jsonb, 100, 26)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 22. SEED DATA STORE: PROMOTIONAL BANNERS & STORE OFFERS
-- ==============================================================================
INSERT INTO public.website_banners (id, title, subtitle, tag, image_url, link_url, position, is_active)
VALUES
  ('banner-1', 'Next-Gen RTX 40-Series & Liquid Rigs', 'Experience unprecedented ray tracing & AI performance', 'Featured Flagship', 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1600', '/products?category=gpus', 'hero_slider', true),
  ('banner-2', 'Custom Mechanical Keyboards & Studio Audio', 'Craft your ultimate dream desk battlestation', 'Creator Gear', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1600', '/products?category=keyboards', 'hero_slider', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.website_offers (id, code, discount_percent, description, min_spend, is_active)
VALUES
  ('offer-1', 'NANO10', 10.00, '10% instant discount on all gaming accessories and peripherals', 100.00, true),
  ('offer-2', 'SUPERSALE', 15.00, '15% discount on custom liquid cooled workstation orders', 2500.00, true)
ON CONFLICT (id) DO NOTHING;

-- Verification summary output
SELECT 
  (SELECT COUNT(*) FROM public.profiles) AS total_profiles,
  (SELECT COUNT(*) FROM public.products) AS total_products,
  (SELECT COUNT(*) FROM public.categories) AS total_categories,
  (SELECT COUNT(*) FROM public.tally_accounts) AS total_tally_accounts,
  (SELECT COUNT(*) FROM public.tally_vouchers) AS total_tally_vouchers,
  (SELECT COUNT(*) FROM public.excel_workbooks) AS total_excel_workbooks;
