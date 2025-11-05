// Frontend API client for database operations
// Currently using MOCK DATA - Backend is unavailable
// All functions return mock data for development/testing

import { 
  MOCK_PRODUCTS, 
  MOCK_ORDERS, 
  MOCK_CLANS, 
  MOCK_SOCIAL_POSTS, 
  MOCK_WALLET, 
  MOCK_TRANSACTIONS,
  MOCK_USERS,
  delay 
} from '@/utils/mockData';

interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  [key: string]: any;
}

// ============ MOCK API IMPLEMENTATION ============
// All functions return mock data with a slight delay to simulate network calls

export const isDatabaseConfigured = (): boolean => {
  return true;
};

// ============ USERS ============

export const createUser = async (
  email: string,
  passwordHash: string,
  name: string,
  phone: string,
  role: "industry" | "buyer"
): Promise<{ id: string; email: string; name: string; role: "industry" | "buyer" }> => {
  await delay();
  return {
    id: `user_${Date.now()}`,
    email,
    name,
    role,
  };
};

export const getUserByEmail = async (email: string): Promise<any> => {
  await delay();
  return Object.values(MOCK_USERS).find(u => u.email === email) || null;
};

export const getUserById = async (id: string): Promise<any> => {
  await delay();
  return Object.values(MOCK_USERS).find(u => u.id === id) || null;
};

// ============ PRODUCTS ============

export const getProducts = async (limit = 20, offset = 0): Promise<any[]> => {
  await delay();
  return MOCK_PRODUCTS.slice(offset, offset + limit);
};

export const getProductById = async (id: string): Promise<any> => {
  await delay();
  return MOCK_PRODUCTS.find(p => p.id === id) || null;
};

export const createProduct = async (productData: any): Promise<any> => {
  await delay();
  const newProduct = {
    id: `prod_${Date.now()}`,
    created_at: new Date().toISOString(),
    ...productData,
  };
  MOCK_PRODUCTS.push(newProduct);
  return newProduct;
};

export const updateProduct = async (id: string, productData: any): Promise<any> => {
  await delay();
  const productIndex = MOCK_PRODUCTS.findIndex(p => p.id === id);
  if (productIndex !== -1) {
    MOCK_PRODUCTS[productIndex] = {
      ...MOCK_PRODUCTS[productIndex],
      ...productData,
      updated_at: new Date().toISOString(),
    };
    return MOCK_PRODUCTS[productIndex];
  }
  return null;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  await delay();
  const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
  if (index !== -1) {
    MOCK_PRODUCTS.splice(index, 1);
    return true;
  }
  return false;
};

// ============ ORDERS ============

export const getOrders = async (userId: string): Promise<any[]> => {
  await delay();
  return MOCK_ORDERS.filter(o => o.buyer_id === userId || o.seller_id === userId);
};

export const createOrder = async (
  buyerId: string,
  sellerId: string,
  productId: string,
  quantity: number,
  total: number
): Promise<any> => {
  await delay();
  const newOrder = {
    id: `order_${Date.now()}`,
    buyer_id: buyerId,
    seller_id: sellerId,
    product_id: productId,
    quantity,
    total,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
  };
  MOCK_ORDERS.push(newOrder);
  return newOrder;
};

// ============ SOCIAL POSTS ============

export const getSocialPosts = async (limit = 20): Promise<any[]> => {
  await delay();
  return MOCK_SOCIAL_POSTS.slice(0, limit);
};

export const createSocialPost = async (
  userId: string,
  content: string,
  imageUrl?: string
): Promise<any> => {
  await delay();
  const newPost = {
    id: `post_${Date.now()}`,
    user_id: userId,
    username: MOCK_USERS[Object.keys(MOCK_USERS).find(k => MOCK_USERS[k as keyof typeof MOCK_USERS].id === userId) as keyof typeof MOCK_USERS]?.name || 'Unknown',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
    type: 'text' as const,
    content,
    media_url: imageUrl || null,
    likes: 0,
    comments: 0,
    created_at: new Date().toISOString(),
  };
  MOCK_SOCIAL_POSTS.push(newPost);
  return newPost;
};

// ============ CLANS ============

export const getClans = async (limit = 20, offset = 0): Promise<any[]> => {
  await delay();
  return MOCK_CLANS.slice(offset, offset + limit);
};

export const getClanById = async (id: string): Promise<any> => {
  await delay();
  return MOCK_CLANS.find(c => c.id === id) || null;
};

export const createClan = async (clanData: any): Promise<any> => {
  await delay();
  const newClan = {
    id: `clan_${Date.now()}`,
    status: 'active' as const,
    members: [],
    current_funded: 0,
    created_at: new Date().toISOString(),
    ...clanData,
  };
  MOCK_CLANS.push(newClan);
  return newClan;
};

export const joinClan = async (
  clanId: string,
  userId: string,
  username: string,
  contributionAmount: number
): Promise<any> => {
  await delay();
  const clan = MOCK_CLANS.find(c => c.id === clanId);
  if (clan) {
    clan.members.push({
      id: `member_${Date.now()}`,
      user_id: userId,
      username,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      contributed_amount: contributionAmount,
      joined_date: new Date().toISOString(),
    });
    clan.current_funded += contributionAmount;
    return clan;
  }
  return null;
};

export const leaveClan = async (clanId: string, userId: string): Promise<any> => {
  await delay();
  const clan = MOCK_CLANS.find(c => c.id === clanId);
  if (clan) {
    const memberIndex = clan.members.findIndex(m => m.user_id === userId);
    if (memberIndex !== -1) {
      const member = clan.members[memberIndex];
      clan.current_funded -= member.contributed_amount;
      clan.members.splice(memberIndex, 1);
    }
    return clan;
  }
  return null;
};

// ============ WALLET ============

export const getWalletBalance = async (
  userId: string,
  currency = "USD"
): Promise<{ balance: number; currency: string }> => {
  await delay();
  // Return mock wallet for the current user
  if (userId === MOCK_WALLET.user_id) {
    return {
      balance: MOCK_WALLET.balance,
      currency: currency || MOCK_WALLET.currency,
    };
  }
  // Return default wallet for other users
  return {
    balance: 0,
    currency,
  };
};

export const setWalletBalance = async (
  userId: string,
  amount: number,
  currency = "USD"
): Promise<any> => {
  await delay();
  if (userId === MOCK_WALLET.user_id) {
    MOCK_WALLET.balance = amount;
    MOCK_WALLET.updated_at = new Date().toISOString();
    return MOCK_WALLET;
  }
  return {
    user_id: userId,
    balance: amount,
    currency,
    updated_at: new Date().toISOString(),
  };
};

export const getWalletTransactions = async (userId: string): Promise<any[]> => {
  await delay();
  return MOCK_TRANSACTIONS.filter(t => t.user_id === userId);
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
  await delay();
  const newTransaction = {
    id: `txn_${Date.now()}`,
    user_id: userId,
    type: tx.type,
    amount: tx.amount,
    currency: tx.currency || 'USD',
    note: tx.note || '',
    created_at: new Date().toISOString(),
  };
  MOCK_TRANSACTIONS.push(newTransaction);

  // Update wallet balance
  if (tx.type === 'deposit') {
    const currentWallet = await getWalletBalance(userId);
    await setWalletBalance(userId, currentWallet.balance + tx.amount);
  } else if (tx.type === 'payment') {
    const currentWallet = await getWalletBalance(userId);
    await setWalletBalance(userId, Math.max(0, currentWallet.balance - tx.amount));
  }

  return newTransaction;
};

// ============ MESSAGING ============

const MOCK_CONVERSATIONS: any[] = [];
const MOCK_MESSAGES: any[] = [];

export const getConversations = async (userId: string): Promise<any[]> => {
  await delay();
  const uniquePeers = new Set<string>();
  MOCK_MESSAGES.forEach(msg => {
    if (msg.sender_id === userId) uniquePeers.add(msg.recipient_id);
    if (msg.recipient_id === userId) uniquePeers.add(msg.sender_id);
  });

  const conversations = Array.from(uniquePeers).map(peerId => ({
    id: `conv_${userId}_${peerId}`,
    peer_id: peerId,
    peer_name: Object.values(MOCK_USERS).find(u => u.id === peerId)?.name || 'Unknown',
    last_message: MOCK_MESSAGES
      .filter(m => (m.sender_id === userId && m.recipient_id === peerId) || 
                   (m.sender_id === peerId && m.recipient_id === userId))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0],
    created_at: new Date().toISOString(),
  }));

  return conversations;
};

export const getMessages = async (
  userId: string,
  peerId: string
): Promise<any[]> => {
  await delay();
  return MOCK_MESSAGES
    .filter(m => (m.sender_id === userId && m.recipient_id === peerId) || 
                 (m.sender_id === peerId && m.recipient_id === userId))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
};

export const sendMessage = async (
  senderId: string,
  recipientId: string,
  content?: string,
  mediaUrl?: string
): Promise<any> => {
  await delay();
  const newMessage = {
    id: `msg_${Date.now()}`,
    sender_id: senderId,
    recipient_id: recipientId,
    content: content || '',
    media_url: mediaUrl || null,
    created_at: new Date().toISOString(),
  };
  MOCK_MESSAGES.push(newMessage);
  return newMessage;
};
