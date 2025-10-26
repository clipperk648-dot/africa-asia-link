// Shared database connection for Netlify Functions
const postgres = require('postgres');

let sql = null;
let initialized = false;

async function ensureSchema(client) {
  if (initialized) return;
  // Create required extension and tables if they do not exist
  await client`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await client`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      phone VARCHAR(20),
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`;

  await client`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      price DECIMAL(12, 2),
      company VARCHAR(255),
      location VARCHAR(255),
      image TEXT,
      description TEXT,
      seller_id UUID NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`;
  await client`CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id)`;

  await client`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      buyer_id UUID NOT NULL,
      seller_id UUID NOT NULL,
      product_id UUID NOT NULL,
      quantity INTEGER NOT NULL,
      total DECIMAL(12, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`;
  await client`CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id)`;
  await client`CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id)`;
  await client`CREATE INDEX IF NOT EXISTS idx_orders_product ON orders(product_id)`;

  await client`
    CREATE TABLE IF NOT EXISTS social_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      content TEXT,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`;
  await client`CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts(user_id)`;
  await client`CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_posts(created_at)`;

  await client`
    CREATE TABLE IF NOT EXISTS wallet (
      user_id UUID NOT NULL,
      balance DECIMAL(14,2) NOT NULL DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'USD',
      updated_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (user_id, currency)
    )`;

  await client`
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      type VARCHAR(20) NOT NULL,
      amount DECIMAL(14,2) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'USD',
      note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`;
  await client`CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)`;
  await client`CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at)`;

  await client`
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id UUID NOT NULL,
      recipient_id UUID NOT NULL,
      content TEXT,
      media_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`;
  await client`CREATE INDEX IF NOT EXISTS idx_messages_participants ON messages(sender_id, recipient_id)`;
  await client`CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at)`;

  initialized = true;
}

const getConnection = () => {
  if (!sql) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Remove channel_binding (not supported by postgres.js) and rely on SSL option
    let cleanedUrl = dbUrl;
    try {
      const u = new URL(dbUrl);
      if (u.searchParams.has('channel_binding')) {
        u.searchParams.delete('channel_binding');
      }
      // Optional: drop sslmode as we pass ssl option explicitly
      if (u.searchParams.has('sslmode')) {
        u.searchParams.delete('sslmode');
      }
      cleanedUrl = u.toString();
    } catch {}

    sql = postgres(cleanedUrl, {
      connect_timeout: 10,
      idle_timeout: 30,
      max_lifetime: 60 * 60, // 1 hour
      // SSL is required by Neon
      ssl: 'require',
    });

    // Kick off schema initialization without blocking subsequent calls
    ensureSchema(sql).catch((e) => {
      console.error('Schema initialization failed:', e);
    });
  }

  return sql;
};

const closeConnection = async () => {
  if (sql) {
    await sql.end();
    sql = null;
    initialized = false;
  }
};

module.exports = { getConnection, closeConnection };
