// Database client that uses Netlify Functions APIs
// No mock data - database required for all operations

const API_BASE = "/api";

// Check if API is available
export const isDatabaseConfigured = (): boolean => {
  return true; // APIs are always available
};

// Helper to make API calls
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
  return await apiCall("/create-user", {
    email,
    passwordHash,
    name,
    phone,
    role,
  }, "POST");
};

export const getUserByEmail = async (email: string): Promise<any> => {
  return await apiCall("/get-user", { email });
};

export const getUserById = async (id: string): Promise<any> => {
  return await apiCall("/get-user", { id });
};

// Product table operations
export const getProducts = async (limit = 20, offset = 0): Promise<any[]> => {
  return await apiCall("/get-products", { limit, offset });
};

export const getProductById = async (id: string): Promise<any> => {
  return await apiCall("/get-product", { id });
};

export const createProduct = async (productData: any): Promise<any> => {
  return await apiCall("/create-product", productData, "POST");
};

// Order table operations
export const getOrders = async (userId: string): Promise<any[]> => {
  return await apiCall("/get-orders", { userId });
};

export const createOrder = async (
  buyerId: string,
  sellerId: string,
  productId: string,
  quantity: number,
  total: number
): Promise<any> => {
  return await apiCall("/create-order", {
    buyerId,
    sellerId,
    productId,
    quantity,
    total,
  }, "POST");
};

// Social posts operations
export const getSocialPosts = async (limit = 20): Promise<any[]> => {
  return await apiCall("/get-social-posts", { limit });
};

export const createSocialPost = async (
  userId: string,
  content: string,
  imageUrl?: string
): Promise<any> => {
  return await apiCall("/create-social-post", {
    userId,
    content,
    imageUrl,
  }, "POST");
};

// Wallet operations
export const getWalletBalance = async (userId: string, currency = 'USD'): Promise<{ balance: number; currency: string }> => {
  return await apiCall("/get-wallet-balance", { userId, currency });
};

export const setWalletBalance = async (userId: string, amount: number, currency = 'USD'): Promise<any> => {
  return await apiCall("/set-wallet-balance", { userId, amount, currency }, "POST");
};

export const getWalletTransactions = async (userId: string): Promise<any[]> => {
  return await apiCall("/get-transactions", { userId });
};

export const addWalletTransaction = async (userId: string, tx: { type: 'deposit' | 'payment'; amount: number; currency?: string; note?: string }): Promise<any> => {
  return await apiCall("/add-transaction", { userId, ...tx }, "POST");
};

// Messaging operations
export const getConversations = async (userId: string): Promise<any[]> => {
  return await apiCall("/get-conversations", { userId });
};

export const getMessages = async (userId: string, peerId: string): Promise<any[]> => {
  return await apiCall("/get-messages", { userId, peerId });
};

export const sendMessage = async (senderId: string, recipientId: string, content?: string, mediaUrl?: string): Promise<any> => {
  return await apiCall("/send-message", { senderId, recipientId, content, mediaUrl }, "POST");
};
