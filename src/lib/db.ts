// Neon Database Client
// This utility handles all database connections and queries using Neon PostgreSQL
// Falls back to mock data if database is not configured

import { mockProducts, mockOrders, mockSocialPosts } from "@/utils/mockData";

const NEON_API_URL = import.meta.env.VITE_NEON_API_URL || "https://console.neon.tech/api/v1";
const NEON_DB_URL = import.meta.env.VITE_DATABASE_URL;
const NEON_API_KEY = import.meta.env.VITE_NEON_API_KEY;

// Check if database URL is configured
export const isDatabaseConfigured = (): boolean => {
  return !!NEON_DB_URL;
};

// Execute a database query using Neon API
export const executeQuery = async (
  query: string,
  params: (string | number | boolean | null)[] = []
): Promise<any> => {
  if (!NEON_DB_URL) {
    console.warn("Database not configured. Using mock data fallback.");
    return [];
  }

  try {
    const response = await fetch(NEON_API_URL + "/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NEON_API_KEY}`,
      },
      body: JSON.stringify({ query, params }),
    });

    if (!response.ok) {
      throw new Error(`Database error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.rows || [];
  } catch (error) {
    console.error("Database query failed:", error);
    throw error;
  }
};

// User table operations
export const createUser = async (
  email: string,
  passwordHash: string,
  name: string,
  phone: string,
  role: "industry" | "buyer"
): Promise<{ id: string; email: string; name: string }> => {
  const query = `
    INSERT INTO users (email, password_hash, name, phone, role, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id, email, name, role
  `;
  const result = await executeQuery(query, [email, passwordHash, name, phone, role]);
  return result[0];
};

export const getUserByEmail = async (email: string): Promise<any> => {
  const query = `
    SELECT id, email, password_hash, name, phone, role, created_at
    FROM users
    WHERE email = $1
  `;
  const result = await executeQuery(query, [email]);
  return result[0] || null;
};

export const getUserById = async (id: string): Promise<any> => {
  const query = `
    SELECT id, email, name, phone, role, created_at
    FROM users
    WHERE id = $1
  `;
  const result = await executeQuery(query, [id]);
  return result[0] || null;
};

// Product table operations
export const getProducts = async (limit = 20, offset = 0): Promise<any[]> => {
  if (!isDatabaseConfigured()) {
    // Return mock data when database not configured
    return mockProducts.slice(offset, offset + limit);
  }

  const query = `
    SELECT *
    FROM products
    LIMIT $1
    OFFSET $2
  `;
  return executeQuery(query, [limit, offset]);
};

export const getProductById = async (id: string): Promise<any> => {
  if (!isDatabaseConfigured()) {
    // Return mock data when database not configured
    return mockProducts.find(p => p.id === id) || null;
  }

  const query = `
    SELECT *
    FROM products
    WHERE id = $1
  `;
  const result = await executeQuery(query, [id]);
  return result[0] || null;
};

export const createProduct = async (productData: any): Promise<any> => {
  const {
    name,
    category,
    price,
    company,
    location,
    image,
    description,
    sellerId,
  } = productData;

  const query = `
    INSERT INTO products (
      name, category, price, company, location, image, description,
      seller_id, created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING *
  `;

  const result = await executeQuery(query, [
    name,
    category,
    price,
    company,
    location,
    image,
    description,
    sellerId,
  ]);

  return result[0];
};

// Order table operations
export const getOrders = async (userId: string): Promise<any[]> => {
  const query = `
    SELECT *
    FROM orders
    WHERE buyer_id = $1 OR seller_id = $1
    ORDER BY created_at DESC
  `;
  return executeQuery(query, [userId]);
};

export const createOrder = async (
  buyerId: string,
  sellerId: string,
  productId: string,
  quantity: number,
  total: number
): Promise<any> => {
  const query = `
    INSERT INTO orders (buyer_id, seller_id, product_id, quantity, total, status, created_at)
    VALUES ($1, $2, $3, $4, $5, 'pending', NOW())
    RETURNING *
  `;

  const result = await executeQuery(query, [
    buyerId,
    sellerId,
    productId,
    quantity,
    total,
  ]);

  return result[0];
};

// Social posts operations
export const getSocialPosts = async (limit = 20): Promise<any[]> => {
  const query = `
    SELECT *
    FROM social_posts
    ORDER BY created_at DESC
    LIMIT $1
  `;
  return executeQuery(query, [limit]);
};

export const createSocialPost = async (
  userId: string,
  content: string,
  imageUrl?: string
): Promise<any> => {
  const query = `
    INSERT INTO social_posts (user_id, content, image_url, created_at)
    VALUES ($1, $2, $3, NOW())
    RETURNING *
  `;

  const result = await executeQuery(query, [userId, content, imageUrl || null]);
  return result[0];
};
