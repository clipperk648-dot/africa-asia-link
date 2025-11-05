// Mock data for development when backend is unavailable
import { Product, Order, Clan, User } from '@/types/models';

// Mock users
export const MOCK_USERS: Record<string, User> = {
  buyer: {
    id: 'user_buyer_001',
    email: 'buyer@echina.com',
    name: 'John Buyer',
    phone: '+234 801 234 5678',
    role: 'buyer',
    createdAt: new Date().toISOString(),
  },
  industry: {
    id: 'user_industry_001',
    email: 'seller@echina.com',
    name: 'Chen Wei',
    phone: '+86 138 1234 5678',
    role: 'industry',
    createdAt: new Date().toISOString(),
  },
};

// Mock products
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    name: 'High-Quality Ceramic Tiles',
    category: 'Building Materials',
    price: 12500,
    company: 'Jiangxi Ceramics Co.',
    location: 'Jiangxi, China',
    image: 'https://images.unsplash.com/photo-1564181286556-403733b1f86d?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1564181286556-403733b1f86d?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1565655109821-7bb385188e98?w=500&h=500&fit=crop',
    ],
    rating: 4.8,
    description: 'Premium ceramic tiles suitable for residential and commercial applications. High durability and aesthetic appeal.',
    seller_id: 'user_industry_001',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod_002',
    name: 'Steel Reinforcing Bars',
    category: 'Steel & Metal',
    price: 18000,
    company: 'Baosteel Group',
    location: 'Shanghai, China',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&h=500&fit=crop',
    ],
    rating: 4.9,
    description: 'High-strength steel rebars meeting international standards. Perfect for construction projects.',
    seller_id: 'user_industry_001',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod_003',
    name: 'Industrial Machinery Parts',
    category: 'Machinery',
    price: 45000,
    company: 'Siemens Manufacturing',
    location: 'Beijing, China',
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=500&fit=crop',
    ],
    rating: 4.7,
    description: 'Precision-engineered machinery parts for industrial applications.',
    seller_id: 'user_industry_001',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod_004',
    name: 'Textile Fabrics',
    category: 'Textiles',
    price: 8500,
    company: 'Zhejiang Textile Mills',
    location: 'Hangzhou, China',
    image: 'https://images.unsplash.com/photo-1535634066-b4ad7b57efb5?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1535634066-b4ad7b57efb5?w=500&h=500&fit=crop',
    ],
    rating: 4.6,
    description: 'High-quality textiles for apparel and industrial use.',
    seller_id: 'user_industry_001',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod_005',
    name: 'Electronic Components',
    category: 'Electronics',
    price: 32000,
    company: 'Shenzhen Tech Electronics',
    location: 'Shenzhen, China',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop',
    ],
    rating: 4.9,
    description: 'State-of-the-art electronic components for modern devices.',
    seller_id: 'user_industry_001',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock orders
export const MOCK_ORDERS: Order[] = [
  {
    id: 'order_001',
    buyer_id: 'user_buyer_001',
    seller_id: 'user_industry_001',
    product_id: 'prod_001',
    quantity: 100,
    total: 1250000,
    status: 'delivered',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order_002',
    buyer_id: 'user_buyer_001',
    seller_id: 'user_industry_001',
    product_id: 'prod_002',
    quantity: 50,
    total: 900000,
    status: 'shipped',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order_003',
    buyer_id: 'user_buyer_001',
    seller_id: 'user_industry_001',
    product_id: 'prod_003',
    quantity: 5,
    total: 225000,
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock clans
export const MOCK_CLANS: Clan[] = [
  {
    id: 'clan_001',
    name: 'Builders United',
    description: 'A community of construction material suppliers',
    creator_id: 'user_buyer_001',
    creator_name: 'John Buyer',
    target_product_id: 'prod_001',
    target_product_name: 'High-Quality Ceramic Tiles',
    target_price: 500000,
    current_funded: 250000,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    members: [
      {
        id: 'member_001',
        user_id: 'user_buyer_001',
        username: 'John Buyer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        contributed_amount: 250000,
        joined_date: new Date().toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock social posts
export const MOCK_SOCIAL_POSTS = [
  {
    id: 'post_001',
    user_id: 'user_industry_001',
    username: 'Chen Wei',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen',
    type: 'text',
    content: 'Just launched our new ceramic tile collection! Premium quality at competitive prices.',
    media_url: null,
    likes: 234,
    comments: 12,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post_002',
    user_id: 'user_buyer_001',
    username: 'John Buyer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    type: 'text',
    content: 'Great experience trading on Echina! Found high-quality products at excellent prices.',
    media_url: null,
    likes: 156,
    comments: 8,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock wallet data
export const MOCK_WALLET = {
  user_id: 'user_buyer_001',
  balance: 5000000,
  currency: 'NGN',
  updated_at: new Date().toISOString(),
};

// Mock transactions
export const MOCK_TRANSACTIONS = [
  {
    id: 'txn_001',
    user_id: 'user_buyer_001',
    type: 'deposit' as const,
    amount: 2000000,
    currency: 'NGN',
    note: 'Initial deposit',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn_002',
    user_id: 'user_buyer_001',
    type: 'payment' as const,
    amount: 1250000,
    currency: 'NGN',
    note: 'Payment for order #order_001',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn_003',
    user_id: 'user_buyer_001',
    type: 'deposit' as const,
    amount: 5000000,
    currency: 'NGN',
    note: 'Additional deposit',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Simulate API delay (optional, makes it feel more real)
export const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));
