// Frontend API client for database operations
// These functions call the Netlify backend functions which interact with MongoDB

const API_BASE = "/.netlify/functions";

interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  [key: string]: any;
}

async function apiCall<T>(endpoint: string, method: string = "GET", data?: any): Promise<T> {
  try {
    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

export const isDatabaseConfigured = (): boolean => {
  return true; // Always consider it configured since we have API endpoints
};

// Users
export const createUser = async (
  email: string,
  passwordHash: string,
  name: string,
  phone: string,
  role: "industry" | "buyer"
): Promise<{ id: string; email: string; name: string; role: "industry" | "buyer" }> => {
  return await apiCall("/create-user", "POST", {
    email,
    passwordHash,
    name,
    phone,
    role,
  });
};

export const getUserByEmail = async (email: string): Promise<any> => {
  try {
    return await apiCall(`/get-user?email=${encodeURIComponent(email)}`, "GET");
  } catch {
    return null;
  }
};

export const getUserById = async (id: string): Promise<any> => {
  try {
    return await apiCall(`/get-user?id=${encodeURIComponent(id)}`, "GET");
  } catch {
    return null;
  }
};

// Products
export const getProducts = async (limit = 20, offset = 0): Promise<any[]> => {
  try {
    const result = await apiCall(
      `/get-products?limit=${limit}&offset=${offset}`,
      "GET"
    );
    return Array.isArray(result) ? result : result.data || [];
  } catch {
    return [];
  }
};

export const getProductById = async (id: string): Promise<any> => {
  try {
    return await apiCall(`/get-product?id=${encodeURIComponent(id)}`, "GET");
  } catch {
    return null;
  }
};

export const createProduct = async (productData: any): Promise<any> => {
  return await apiCall("/create-product", "POST", productData);
};

export const updateProduct = async (id: string, productData: any): Promise<any> => {
  try {
    return await apiCall("/update-product", "POST", {
      id,
      ...productData,
    });
  } catch {
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await apiCall("/delete-product", "POST", { id });
    return true;
  } catch {
    return false;
  }
};

// Orders
export const getOrders = async (userId: string): Promise<any[]> => {
  try {
    const result = await apiCall(
      `/get-orders?userId=${encodeURIComponent(userId)}`,
      "GET"
    );
    return Array.isArray(result) ? result : result.data || [];
  } catch {
    return [];
  }
};

export const createOrder = async (
  buyerId: string,
  sellerId: string,
  productId: string,
  quantity: number,
  total: number
): Promise<any> => {
  return await apiCall("/create-order", "POST", {
    buyerId,
    sellerId,
    productId,
    quantity,
    total,
  });
};

// Social posts
export const getSocialPosts = async (limit = 20): Promise<any[]> => {
  try {
    const result = await apiCall(`/get-social-posts?limit=${limit}`, "GET");
    return Array.isArray(result) ? result : result.data || [];
  } catch {
    return [];
  }
};

export const createSocialPost = async (
  userId: string,
  content: string,
  imageUrl?: string
): Promise<any> => {
  return await apiCall("/create-social-post", "POST", {
    userId,
    content,
    imageUrl,
  });
};

// Clans
export const getClans = async (limit = 20, offset = 0): Promise<any[]> => {
  try {
    const result = await apiCall(
      `/get-clans?limit=${limit}&offset=${offset}`,
      "GET"
    );
    return Array.isArray(result) ? result : result.data || [];
  } catch {
    return [];
  }
};

export const getClanById = async (id: string): Promise<any> => {
  try {
    return await apiCall(`/get-clan?id=${encodeURIComponent(id)}`, "GET");
  } catch {
    return null;
  }
};

export const createClan = async (clanData: any): Promise<any> => {
  return await apiCall("/create-clan", "POST", clanData);
};

export const joinClan = async (
  clanId: string,
  userId: string,
  username: string,
  contributionAmount: number
): Promise<any> => {
  return await apiCall("/join-clan", "POST", {
    clanId,
    userId,
    username,
    contributionAmount,
  });
};

export const leaveClan = async (clanId: string, userId: string): Promise<any> => {
  return await apiCall("/leave-clan", "POST", {
    clanId,
    userId,
  });
};

// Wallet
export const getWalletBalance = async (
  userId: string,
  currency = "USD"
): Promise<{ balance: number; currency: string }> => {
  try {
    const result = await apiCall(
      `/get-wallet-balance?userId=${encodeURIComponent(userId)}&currency=${currency}`,
      "GET"
    );
    return result;
  } catch {
    return { balance: 0, currency };
  }
};

export const setWalletBalance = async (
  userId: string,
  amount: number,
  currency = "USD"
): Promise<any> => {
  return await apiCall("/set-wallet-balance", "POST", {
    userId,
    amount,
    currency,
  });
};

export const getWalletTransactions = async (userId: string): Promise<any[]> => {
  try {
    const result = await apiCall(
      `/get-transactions?userId=${encodeURIComponent(userId)}`,
      "GET"
    );
    return Array.isArray(result) ? result : result.data || [];
  } catch {
    return [];
  }
};

export const addWalletTransaction = async (
  userId: string,
  tx: {
    type: "deposit" | "payment";
    amount: number;
    currency?: string;
    note?: string;
  }
): Promise<any> => {
  return await apiCall("/add-transaction", "POST", {
    userId,
    ...tx,
  });
};

// Messaging
export const getConversations = async (userId: string): Promise<any[]> => {
  try {
    const result = await apiCall(
      `/get-conversations?userId=${encodeURIComponent(userId)}`,
      "GET"
    );
    return Array.isArray(result) ? result : result.data || [];
  } catch {
    return [];
  }
};

export const getMessages = async (
  userId: string,
  peerId: string
): Promise<any[]> => {
  try {
    const result = await apiCall(
      `/get-messages?userId=${encodeURIComponent(userId)}&peerId=${encodeURIComponent(peerId)}`,
      "GET"
    );
    return Array.isArray(result) ? result : result.data || [];
  } catch {
    return [];
  }
};

export const sendMessage = async (
  senderId: string,
  recipientId: string,
  content?: string,
  mediaUrl?: string
): Promise<any> => {
  return await apiCall("/send-message", "POST", {
    senderId,
    recipientId,
    content,
    mediaUrl,
  });
};
