export interface Product {
  id: string;
  name: string;
  nameZH?: string;
  category: string;
  price: number;
  company: string;
  location: string;
  image: string;
  images?: string[];
  videoUrl?: string;
  rating: number;
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
  productName: string;
  quantity: number;
  total: number;
  status: "pending" | "shipped" | "delivered";
  date: string;
}

export interface SocialPost {
  id: string;
  username: string;
  avatar: string;
  image: string;
  likes: number;
  comments: number;
  caption: string;
  timestamp: string;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Industrial Machinery",
    category: "Manufacturing",
    price: 45000,
    company: "Shanghai Heavy Industries",
    location: "Shanghai, China",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837",
    rating: 4.8,
  },
  {
    id: "2",
    name: "Electronics Components",
    category: "Electronics",
    price: 12000,
    company: "Shenzhen Tech Ltd",
    location: "Shenzhen, China",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475",
    rating: 4.5,
  },
  {
    id: "3",
    name: "Textile Materials",
    category: "Textiles",
    price: 8500,
    company: "Guangzhou Fabrics",
    location: "Guangzhou, China",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea3c8f64",
    rating: 4.7,
  },
  {
    id: "4",
    name: "Construction Equipment",
    category: "Construction",
    price: 67000,
    company: "Beijing Build Co",
    location: "Beijing, China",
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122",
    rating: 4.9,
  },
];

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    productName: "Industrial Machinery",
    quantity: 2,
    total: 90000,
    status: "shipped",
    date: "2025-09-15",
  },
  {
    id: "ORD-002",
    productName: "Electronics Components",
    quantity: 10,
    total: 120000,
    status: "delivered",
    date: "2025-09-01",
  },
  {
    id: "ORD-003",
    productName: "Textile Materials",
    quantity: 5,
    total: 42500,
    status: "pending",
    date: "2025-10-01",
  },
];

export const mockSocialPosts: SocialPost[] = [
  {
    id: "1",
    username: "chen_industries",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chen",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
    likes: 1240,
    comments: 89,
    caption: "New factory opening in Shanghai! 🏭 Ready to serve global partners.",
    timestamp: "2h ago",
  },
  {
    id: "2",
    username: "lagos_trading",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lagos",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec",
    likes: 856,
    comments: 42,
    caption: "Just received our latest shipment! Quality products from China 🚢",
    timestamp: "5h ago",
  },
  {
    id: "3",
    username: "shenzhen_tech",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tech",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    likes: 2341,
    comments: 156,
    caption: "Innovation meets tradition. Our new product line launching soon! 💡",
    timestamp: "1d ago",
  },
  {
    id: "4",
    username: "abuja_imports",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abuja",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
    likes: 654,
    comments: 31,
    caption: "Building bridges between continents 🌍 #TradeSuccess",
    timestamp: "2d ago",
  },
];
