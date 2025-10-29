// In-memory mock database to remove external DB dependency

import type { Product, Order, SocialPost } from "@/types/models";

const mockProducts: Product[] = [
  {
    id: "p1",
    name: "Smart Industrial Pump",
    category: "Machinery",
    price: 12000,
    company: "SinoTech",
    location: "Shenzhen, CN",
    image: "https://images.unsplash.com/photo-1581090122493-8fd7d76b12b2?q=80&w=1200&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1581091870622-7c67cf02f37c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1581093588401-16ec8a1c4b3c?q=80&w=1200&auto=format&fit=crop",
    ],
    rating: 4.6,
  },
  {
    id: "p2",
    name: "Solar PV Panel 550W",
    category: "Energy",
    price: 210,
    company: "GreenRay",
    location: "Guangdong, CN",
    image: "https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=1200&auto=format&fit=crop",
    rating: 4.8,
  },
  {
    id: "p3",
    name: "EV Battery Pack",
    category: "Automotive",
    price: 5400,
    company: "VoltWorks",
    location: "Shanghai, CN",
    image: "https://images.unsplash.com/photo-1604668915840-580c30026e5b?q=80&w=1200&auto=format&fit=crop",
    rating: 4.4,
  },
];

let mockOrders: Order[] = [
  { id: "o1", productName: "Solar PV Panel 550W", total: 6500, status: "shipped", date: "2024-10-02" },
  { id: "o2", productName: "Smart Industrial Pump", total: 12000, status: "pending", date: "2024-10-06" },
  { id: "o3", productName: "EV Battery Pack", total: 10800, status: "delivered", date: "2024-10-12" },
];

let mockPosts: SocialPost[] = [
  {
    id: "sp1",
    userId: "u1",
    username: "echina_official",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=echina",
    type: "image",
    mediaUrl: mockProducts[0].image!,
    likes: 120,
    comments: 18,
    timestamp: new Date().toISOString(),
  },
];

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

export const isDatabaseConfigured = (): boolean => false;

// Users (minimal for app)
export const createUser = async (
  email: string,
  passwordHash: string,
  name: string,
  phone: string,
  role: "industry" | "buyer",
): Promise<{ id: string; email: string; name: string; role: "industry" | "buyer" }> => {
  await delay();
  return { id: crypto.randomUUID(), email, name, role };
};

export const getUserByEmail = async (email: string): Promise<any> => {
  await delay();
  return null;
};

export const getUserById = async (id: string): Promise<any> => {
  await delay();
  return null;
};

// Products
export const getProducts = async (limit = 20, offset = 0): Promise<Product[]> => {
  await delay();
  return mockProducts.slice(offset, offset + limit);
};

export const getProductById = async (id: string): Promise<Product | null> => {
  await delay();
  return mockProducts.find((p) => p.id === id) || null;
};

export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  await delay();
  const p: Product = {
    id: crypto.randomUUID(),
    name: productData.name || "New Product",
    price: productData.price || 0,
    ...productData,
  } as Product;
  mockProducts.unshift(p);
  return p;
};

export const updateProduct = async (id: string, productData: Partial<Product>): Promise<Product | null> => {
  await delay();
  const index = mockProducts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const updated: Product = {
    ...mockProducts[index],
    ...productData,
    id, // Ensure ID doesn't change
  } as Product;

  mockProducts[index] = updated;
  return updated;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  await delay();
  const index = mockProducts.findIndex((p) => p.id === id);
  if (index === -1) return false;
  mockProducts.splice(index, 1);
  return true;
};

// Orders
export const getOrders = async (userId: string): Promise<Order[]> => {
  await delay();
  return mockOrders;
};

export const createOrder = async (
  buyerId: string,
  sellerId: string,
  productId: string,
  quantity: number,
  total: number,
): Promise<Order> => {
  await delay();
  const order: Order = { id: crypto.randomUUID(), total, status: "pending", date: new Date().toISOString(), productName: productId };
  mockOrders.unshift(order);
  return order;
};

// Social posts
export const getSocialPosts = async (limit = 20): Promise<SocialPost[]> => {
  await delay();
  return mockPosts.slice(0, limit);
};

export const createSocialPost = async (
  userId: string,
  content: string,
  imageUrl?: string,
): Promise<SocialPost> => {
  await delay();
  const post: SocialPost = {
    id: crypto.randomUUID(),
    userId,
    username: "guest",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
    type: imageUrl ? "image" : "text",
    content,
    mediaUrl: imageUrl,
    likes: 0,
    comments: 0,
    timestamp: new Date().toISOString(),
  };
  mockPosts.unshift(post);
  return post;
};

// Wallet (placeholders consistent with existing API)
export const getWalletBalance = async (userId: string, currency = "USD"): Promise<{ balance: number; currency: string }> => {
  await delay();
  return { balance: 1250, currency };
};

export const setWalletBalance = async (userId: string, amount: number, currency = "USD"): Promise<any> => {
  await delay();
  return { success: true };
};

export const getWalletTransactions = async (userId: string): Promise<any[]> => {
  await delay();
  return [
    { id: "t1", type: "deposit", amount: 500, currency: "USD", note: "Initial deposit", date: new Date().toISOString() },
  ];
};

export const addWalletTransaction = async (
  userId: string,
  tx: { type: "deposit" | "payment"; amount: number; currency?: string; note?: string },
): Promise<any> => {
  await delay();
  return { success: true };
};

// Messaging
export const getConversations = async (userId: string): Promise<any[]> => {
  await delay();
  return [];
};

export const getMessages = async (userId: string, peerId: string): Promise<any[]> => {
  await delay();
  return [];
};

export const sendMessage = async (senderId: string, recipientId: string, content?: string, mediaUrl?: string): Promise<any> => {
  await delay();
  return { success: true };
};
