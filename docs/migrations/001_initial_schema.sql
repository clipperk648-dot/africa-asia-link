-- ============================================================
-- TradeLink Database Schema - Complete Setup
-- ============================================================
-- This migration creates all necessary tables for the TradeLink platform

-- ============================================================
-- 1. PROFILES (Users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  role TEXT DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================================
-- 2. PRODUCT CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_categories_name ON product_categories(name);

-- Insert predefined categories
INSERT INTO product_categories (name, description) VALUES
  ('Inverters', 'Power inverters and related equipment'),
  ('iPhone', 'Apple iPhone devices'),
  ('Samsung Ultra', 'Samsung Galaxy Ultra series'),
  ('Clothes', 'Clothing and apparel'),
  ('Electric Bike', 'Electric bicycles and e-bikes'),
  ('Cars', 'Automobiles and vehicles'),
  ('Electronics', 'General electronics and gadgets'),
  ('Home Appliances', 'Home appliances and equipment'),
  ('Fashion', 'Fashion items and accessories')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  price DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_created_by ON products(created_by);
CREATE INDEX idx_products_active ON products(is_active);

-- ============================================================
-- 4. SHIPPING METHODS
-- ============================================================
CREATE TABLE IF NOT EXISTS shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  delivery_days INTEGER NOT NULL,
  cost_per_unit DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert predefined shipping methods
INSERT INTO shipping_methods (name, delivery_days) VALUES
  ('Sea Shipping', 60),
  ('FedEx', 5),
  ('Air Freight', 18),
  ('Express', 12)
ON CONFLICT DO NOTHING;

CREATE INDEX idx_shipping_methods_active ON shipping_methods(is_active);

-- ============================================================
-- 5. CLUSTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_quantity INTEGER NOT NULL,
  current_quantity INTEGER DEFAULT 0,
  current_members INTEGER DEFAULT 1,
  max_members INTEGER DEFAULT 5,
  price_per_unit DECIMAL(12, 2) NOT NULL,
  total_cost DECIMAL(15, 2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  shipping_method_id UUID REFERENCES shipping_methods(id) ON DELETE SET NULL,
  shipping_status TEXT DEFAULT 'not_started' CHECK (shipping_status IN ('not_started', 'in_transit', 'in_warehouse', 'delivered')),
  shipping_started_at TIMESTAMP,
  expected_delivery_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_clusters_product ON clusters(product_id);
CREATE INDEX idx_clusters_creator ON clusters(creator_id);
CREATE INDEX idx_clusters_status ON clusters(status);
CREATE INDEX idx_clusters_shipping_status ON clusters(shipping_status);

-- ============================================================
-- 6. CLUSTER MEMBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS cluster_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(cluster_id, user_id)
);

CREATE INDEX idx_cluster_members_cluster ON cluster_members(cluster_id);
CREATE INDEX idx_cluster_members_user ON cluster_members(user_id);
CREATE INDEX idx_cluster_members_role ON cluster_members(role);

-- ============================================================
-- 7. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'order', 'cluster', 'message', 'shipping')),
  related_cluster_id UUID REFERENCES clusters(id) ON DELETE CASCADE,
  related_order_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================================
-- 8. CUSTOMER SERVICE / SUPPORT TICKETS
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP
);

CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- ============================================================
-- 9. SUPPORT MESSAGES (Messages in Support Tickets)
-- ============================================================
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  attachments JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_support_messages_ticket ON support_messages(ticket_id);
CREATE INDEX idx_support_messages_sender ON support_messages(sender_id);
CREATE INDEX idx_support_messages_created ON support_messages(created_at);

-- ============================================================
-- 10. CLUSTER MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS cluster_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cluster_messages_cluster ON cluster_messages(cluster_id);
CREATE INDEX idx_cluster_messages_sender ON cluster_messages(sender_id);
CREATE INDEX idx_cluster_messages_created ON cluster_messages(created_at);

-- ============================================================
-- 11. CLUSTER POLLS
-- ============================================================
CREATE TABLE IF NOT EXISTS cluster_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  poll_type TEXT DEFAULT 'single' CHECK (poll_type IN ('single', 'multiple')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ends_at TIMESTAMP
);

CREATE INDEX idx_cluster_polls_cluster ON cluster_polls(cluster_id);
CREATE INDEX idx_cluster_polls_active ON cluster_polls(is_active);

-- ============================================================
-- 12. CLUSTER POLL OPTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS cluster_poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES cluster_polls(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0
);

CREATE INDEX idx_cluster_poll_options_poll ON cluster_poll_options(poll_id);

-- ============================================================
-- 13. CLUSTER POLL VOTES
-- ============================================================
CREATE TABLE IF NOT EXISTS cluster_poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES cluster_polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES cluster_poll_options(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(poll_id, voter_id)
);

CREATE INDEX idx_cluster_poll_votes_poll ON cluster_poll_votes(poll_id);
CREATE INDEX idx_cluster_poll_votes_voter ON cluster_poll_votes(voter_id);

-- ============================================================
-- 14. ORDERS (Orders in Clusters)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_cluster ON orders(cluster_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================================
-- 15. WALLETS
-- ============================================================
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance DECIMAL(15, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_user ON wallets(user_id);

-- ============================================================
-- 16. TRANSACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('deposit', 'payment', 'refund', 'transfer')),
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  note TEXT,
  related_order_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at);

-- ============================================================
-- 17. MESSAGES (General Messaging)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_is_read ON messages(is_read);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================================
-- 18. AUDIT LOG (For admin actions)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  changes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================
-- RLS (Row Level Security) Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Triggers
-- ============================================================

-- Update updated_at on profile changes
CREATE OR REPLACE FUNCTION update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profile_timestamp BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_profile_timestamp();

-- Update updated_at on product changes
CREATE OR REPLACE FUNCTION update_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_timestamp BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_product_timestamp();

-- Update updated_at on cluster changes
CREATE OR REPLACE FUNCTION update_cluster_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cluster_timestamp BEFORE UPDATE ON clusters
FOR EACH ROW EXECUTE FUNCTION update_cluster_timestamp();
