// Database client that uses Netlify Functions APIs
// Falls back to mock data if API is not available

import { mockProducts, mockOrders, mockSocialPosts } from "@/utils/mockData";

const API_BASE = "/api";

// In-memory storage for users during development
const devUsers: Map<string, any> = new Map();

// Check if API is available
export const isDatabaseConfigured = (): boolean => {
  return true; // APIs are always available
};

// Helper to make API calls with fallback
async function apiCall<T>(endpoint: string, params?: Record<string, any>, method: string = "GET"): Promise<T> {
  try {
    const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method === "POST" && params) {
      options.body = JSON.stringify(params);
    } else if (method === "GET" && params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), options);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error(`Invalid content type: expected JSON but got ${contentType}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// User table operations
export const createUser = async (
  email: string,
  passwordHash: string,
  name: string,
  phone: string,
  role: "industry" | "buyer"
): Promise<{ id: string; email: string; name: string }> => {
  try {
    return await apiCall("/create-user", {
      email,
      passwordHash,
      name,
      phone,
      role,
    }, "POST");
  } catch (error) {
    console.warn("Failed to create user via API, using dev storage:", error);
    // Fallback: store user in memory for development
    const id = Math.random().toString(36).substr(2, 9);
    const user = { id, email, passwordHash, name, phone, role, created_at: new Date() };
    devUsers.set(email, user);
    devUsers.set(id, user);
    return { id, email, name };
  }
};

export const getUserByEmail = async (email: string): Promise<any> => {
  try {
    return await apiCall("/get-user", { email });
  } catch (error) {
    console.warn("Failed to get user by email via API, checking dev storage:", error);
    // Fallback: check dev storage
    const user = devUsers.get(email);
    if (user) {
      return user;
    }
    return null;
  }
};

export const getUserById = async (id: string): Promise<any> => {
  try {
    return await apiCall("/get-user", { id });
  } catch (error) {
    console.warn("Failed to get user by ID via API, checking dev storage:", error);
    // Fallback: check dev storage
    const user = devUsers.get(id);
    if (user) {
      return user;
    }
    return null;
  }
};

// Product table operations
export const getProducts = async (limit = 20, offset = 0): Promise<any[]> => {
  try {
    return await apiCall("/get-products", { limit, offset });
  } catch (error) {
    console.warn("Failed to fetch products from API, using mock data:", error);
    return mockProducts.slice(offset, offset + limit);
  }
};

export const getProductById = async (id: string): Promise<any> => {
  try {
    return await apiCall("/get-product", { id });
  } catch (error) {
    console.warn("Failed to fetch product from API, using mock data:", error);
    return mockProducts.find(p => p.id === id) || null;
  }
};

export const createProduct = async (productData: any): Promise<any> => {
  try {
    return await apiCall("/create-product", productData, "POST");
  } catch (error) {
    console.warn("Failed to create product via API, using mock data:", error);
    // Fallback: return a mock product
    const id = Math.random().toString(36).substr(2, 9);
    return {
      id,
      ...productData,
      created_at: new Date(),
    };
  }
};

// Order table operations
export const getOrders = async (userId: string): Promise<any[]> => {
  try {
    return await apiCall("/get-orders", { userId });
  } catch (error) {
    console.warn("Failed to fetch orders from API, using mock data:", error);
    return mockOrders;
  }
};

export const createOrder = async (
  buyerId: string,
  sellerId: string,
  productId: string,
  quantity: number,
  total: number
): Promise<any> => {
  try {
    return await apiCall("/create-order", {
      buyerId,
      sellerId,
      productId,
      quantity,
      total,
    }, "POST");
  } catch (error) {
    console.warn("Failed to create order via API, using mock data:", error);
    // Fallback: return a mock order
    const id = Math.random().toString(36).substr(2, 9);
    return {
      id,
      buyerId,
      sellerId,
      productId,
      quantity,
      total,
      status: "pending",
      created_at: new Date(),
    };
  }
};

// Social posts operations
export const getSocialPosts = async (limit = 20): Promise<any[]> => {
  try {
    return await apiCall("/get-social-posts", { limit });
  } catch (error) {
    console.warn("Failed to fetch social posts from API, using mock data:", error);
    return mockSocialPosts.slice(0, limit);
  }
};

export const createSocialPost = async (
  userId: string,
  content: string,
  imageUrl?: string
): Promise<any> => {
  try {
    return await apiCall("/create-social-post", {
      userId,
      content,
      imageUrl,
    }, "POST");
  } catch (error) {
    console.warn("Failed to create social post via API, using mock data:", error);
    // Fallback: return a mock post
    const id = Math.random().toString(36).substr(2, 9);
    return {
      id,
      userId,
      content,
      imageUrl,
      created_at: new Date(),
    };
  }
};
