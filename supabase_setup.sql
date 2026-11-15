-- Lakhani Collection Supabase Database Schema
-- Run this in your Supabase SQL Editor (1-Click Run)

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'women',
  "categoryLabel" TEXT DEFAULT 'Collection',
  badge TEXT DEFAULT 'New Arrival',
  "badgeColor" TEXT DEFAULT 'bg-amber-900/90 text-amber-300 border-amber-700',
  price NUMERIC NOT NULL,
  "originalPrice" NUMERIC DEFAULT 0,
  "aiImage" TEXT DEFAULT 'assets/hero_banner.webp',
  gallery JSONB DEFAULT '[]'::jsonb,
  video TEXT DEFAULT '',
  "colorsImage" TEXT DEFAULT '',
  "flyerImage" TEXT DEFAULT '',
  fabric TEXT DEFAULT 'Premium Pakistani Fabric',
  description TEXT DEFAULT '',
  specs JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  stock INTEGER DEFAULT 25,
  "createdAt" TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')),
  "updatedAt" TEXT DEFAULT (to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  date TEXT,
  "createdAt" TEXT,
  "customerName" TEXT,
  "customerPhone" TEXT,
  "customerCity" TEXT,
  "customerAddress" TEXT,
  "paymentMethod" TEXT,
  "paymentStatus" TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  subtotal NUMERIC DEFAULT 0,
  "deliveryFee" NUMERIC DEFAULT 0,
  "grandTotal" NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Pending Verification',
  "updatedAt" TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  data JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to products & settings
DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can insert products" ON products;
CREATE POLICY "Public can insert products" ON products FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can view settings" ON settings;
CREATE POLICY "Public can view settings" ON settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can update settings" ON settings;
CREATE POLICY "Public can update settings" ON settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage orders" ON orders;
CREATE POLICY "Public can manage orders" ON orders FOR ALL USING (true);
