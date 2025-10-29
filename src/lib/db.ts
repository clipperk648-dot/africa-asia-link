// In-memory mock database to remove external DB dependency

import type { Product, Order, SocialPost, Clan, ClanMember } from "@/types/models";

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

let mockClans: Clan[] = [
  {
    id: "c1",
    name: "Sneaker Collectors",
    description: "A group of sneaker enthusiasts pooling resources together",
    creatorId: "u1",
    creatorName: "John Collector",
    targetProductId: "p1",
    targetProductName: "Limited Edition Air Max",
    targetPrice: 5000,
    currentFunded: 3200,
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    status: "active",
    members: [
      { id: "m1", userId: "u1", username: "John Collector", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john", contributedAmount: 1200, joinedDate: new Date().toISOString() },
      { id: "m2", userId: "u2", username: "Sneaker Fan", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fan", contributedAmount: 800, joinedDate: new Date().toISOString() },
      { id: "m3", userId: "u3", username: "Collector Pro", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pro", contributedAmount: 500, joinedDate: new Date().toISOString() },
      { id: "m4", userId: "u4", username: "Hype Beast", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hype", contributedAmount: 700, joinedDate: new Date().toISOString() },
    ],
    createdDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
  {
    id: "c2",
    name: "Tech Enthusiasts",
    description: "Bulk purchasing of the latest tech equipment",
    creatorId: "u5",
    creatorName: "Tech Lead",
    targetProductId: "p2",
    targetProductName: "Gaming Laptop Bundle",
    targetPrice: 8000,
    currentFunded: 6500,
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    status: "active",
    members: [
      { id: "m5", userId: "u5", username: "Tech Lead", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech", contributedAmount: 2000, joinedDate: new Date().toISOString() },
      { id: "m6", userId: "u6", username: "Gamer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gamer", contributedAmount: 1500, joinedDate: new Date().toISOString() },
      { id: "m7", userId: "u7", username: "Dev", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dev", contributedAmount: 3000, joinedDate: new Date().toISOString() },
    ],
    createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
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
