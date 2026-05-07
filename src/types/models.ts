export interface Product {
  id: string;
  name: string;
  nameZH?: string;
  category?: string;
  price: number;
  company?: string;
  location?: string;
  image?: string;
  images?: string[];
  videoUrl?: string;
  rating?: number;
  reviews?: number;
  hsCode?: string;
  brand?: string;
  model?: string;
  originCountry?: string;
  province?: string;
  city?: string;
  unit?: string;
  unitPrice?: number;
  currency?: "CNY" | "USD" | "NGN";
  moq?: number;
  supplyAbilityPerMonth?: number;
  quantityAvailable?: number;
  leadTimeDays?: number;
  incoterm?: string;
  portOfShipment?: string;
  description?: string;
  specifications?: string[];
  brochureUrl?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  wechat?: string;
  whatsapp?: string;
  oemAvailable?: boolean;
  odmAvailable?: boolean;
  customPackaging?: boolean;
  sampleAvailable?: boolean;
  certifications?: string[];
  warrantyMonths?: number;
  inquiries?: number;
}

export interface Order {
  id: string;
  product_id?: string;
  buyer_id?: string;
  seller_id?: string;
  quantity?: number;
  total: number;
  status: "pending" | "shipped" | "delivered" | string;
  created_at?: string;
  date?: string;
  productName?: string;
}

export type SocialPostType = "text" | "image" | "video";

export interface SocialPost {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  role?: string;
  type: SocialPostType;
  content?: string;
  mediaUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

export interface ClusterMember {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  joinedQuantity: number;
  joinedAmount: number;
  joinedDate: string;
}

export interface Cluster {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  targetProductId: string;
  targetProductName: string;
  targetPrice: number;
  currentFunded: number;
  minOrderAmount: number;
  quantity: number;
  maxMembers: number;
  currentMembers: number;
  deadline: string;
  status: "active" | "completed" | "closed";
  members: ClusterMember[];
  createdDate: string;
  icon?: string;
  preferredShippingMethod?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "admin" | "buyer" | "industry" | string;
  isAdmin?: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: "deposit" | "payment";
  amount: number;
  currency: string;
  note: string;
  created_at: string;
}
