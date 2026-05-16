-- Enable realtime on tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE clusters;
ALTER PUBLICATION supabase_realtime ADD TABLE cluster_members;
ALTER PUBLICATION supabase_realtime ADD TABLE supplier_products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Fix clusters table - add missing columns
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS target_product_id UUID;
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS target_product_name TEXT;
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS current_funded DECIMAL DEFAULT 0;
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS preferred_shipping_method TEXT;
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS shipping_status TEXT DEFAULT 'shipping not started yet';
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS stop_counting BOOLEAN DEFAULT false;
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS shipping_mode TEXT DEFAULT 'sea';
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS destination TEXT DEFAULT 'lagos';
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS total_cbm DECIMAL DEFAULT 0;

-- Fix profiles table - add missing columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false;

-- Create categories table if not exists
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure supplier_products columns exist
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS supplier_name TEXT;
ALTER TABLE supplier_products ADD COLUMN IF NOT EXISTS alibaba_link TEXT UNIQUE;
