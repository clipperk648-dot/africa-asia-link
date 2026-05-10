-- Migration: Add supplier_products table and update categories

-- Create supplier_products table
CREATE TABLE IF NOT EXISTS supplier_products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  price_min DECIMAL(10, 2) NOT NULL,
  price_max DECIMAL(10, 2) NOT NULL,
  moq INTEGER,
  description TEXT,
  supplier_name TEXT,
  alibaba_link TEXT UNIQUE,
  category TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage supplier products"
  ON supplier_products
  FOR ALL
  USING (auth.jwt() ->> 'email' = 'oluwafemiod7@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'oluwafemiod7@gmail.com');

CREATE POLICY "Anyone can view active supplier products"
  ON supplier_products
  FOR SELECT
  USING (status = 'active');

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  product_id UUID,
  cluster_id UUID REFERENCES clusters(id),
  product_name TEXT,
  product_link TEXT,
  quantity INTEGER DEFAULT 1,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update categories table with new categories
INSERT INTO categories (name, description, created_at)
VALUES 
  ('watches', 'Various types of watches', NOW()),
  ('inverters', 'Power inverters and converters', NOW()),
  ('bags', 'Backpacks, handbags, and luggage', NOW()),
  ('men''s shorts', 'Casual and athletic shorts for men', NOW()),
  ('shirt long sleeves', 'Long sleeve shirts for men', NOW()),
  ('baggy jeans', 'Loose fit and baggy jeans', NOW()),
  ('female shoes', 'Shoes and footwear for women', NOW()),
  ('male shoes', 'Shoes and footwear for men', NOW()),
  ('solar products', 'Solar panels, controllers, and accessories', NOW()),
  ('electronics', 'General electronic devices and accessories', NOW())
ON CONFLICT (name) DO NOTHING;
