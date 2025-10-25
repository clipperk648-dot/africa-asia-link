// Database client that uses Netlify Functions APIs
// Falls back to mock data if API is not available

import { mockProducts, mockOrders, mockSocialPosts } from "@/utils/mockData";

const API_BASE = "/api";

// Check if API is available
export const isDatabaseConfigured = (): boolean => {
  return true; // APIs are always available
};

// Helper to make API calls
async function apiCall<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  try {
    const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
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
    });
  } catch (error) {
    console.error("Failed to create user:", error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<any> => {
  try {
    return await apiCall("/get-user", { email });
  } catch (error) {
    console.error("Failed to get user by email:", error);
    return null;
  }
};

export const getUserById = async (id: string): Promise<any> => {
  try {
    return await apiCall("/get-user", { id });
  } catch (error) {
    console.error("Failed to get user by ID:", error);
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
    return await apiCall("/create-product", productData);
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error;
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
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    throw error;
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
    });
  } catch (error) {
    console.error("Failed to create social post:", error);
    throw error;
  }
};
