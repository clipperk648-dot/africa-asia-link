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
