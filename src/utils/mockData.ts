// Mock data for development when backend is unavailable
import { Product, Order, Cluster, User, Transaction, SocialPost } from '@/types/models';

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
  admin: {
    id: 'user_admin_001',
    email: 'admin@echina.com',
    name: 'Admin User',
    phone: '+86 138 1234 5678',
    role: 'admin',
    isAdmin: true,
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
    image: 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    images: [
      'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
      'https://images.pexels.com/photos/262405/pexels-photo-262405.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    ],
    rating: 4.8,
    description: 'Premium ceramic tiles suitable for residential and commercial applications. High durability and aesthetic appeal.',
    seller_id: 'user_admin_001',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod_002',
    name: 'Steel Reinforcing Bars',
    category: 'Steel & Metal',
    price: 18000,
    company: 'Baosteel Group',
    location: 'Shanghai, China',
    image: 'https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    images: [
      'https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    ],
    rating: 4.9,
    description: 'High-strength steel rebars meeting international standards. Perfect for construction projects.',
    seller_id: 'user_admin_001',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod_003',
    name: 'Industrial Machinery Parts',
    category: 'Machinery',
    price: 45000,
    company: 'Siemens Manufacturing',
    location: 'Beijing, China',
    image: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    images: [
      'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    ],
    rating: 4.7,
    description: 'Precision-engineered machinery parts for industrial applications.',
    seller_id: 'user_admin_001',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod_004',
    name: 'Textile Fabrics',
    category: 'Textiles',
    price: 8500,
    company: 'Zhejiang Textile Mills',
    location: 'Hangzhou, China',
    image: 'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    images: [
      'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    ],
    rating: 4.6,
    description: 'High-quality textiles for apparel and industrial use.',
    seller_id: 'user_admin_001',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prod_005',
    name: 'Electronic Components',
    category: 'Electronics',
    price: 32000,
    company: 'Shenzhen Tech Electronics',
    location: 'Shenzhen, China',
    image: 'https://images.pexels.com/photos/3587477/pexels-photo-3587477.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    images: [
      'https://images.pexels.com/photos/3587477/pexels-photo-3587477.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop',
    ],
    rating: 4.9,
    description: 'State-of-the-art electronic components for modern devices.',
    seller_id: 'user_admin_001',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock orders
export const MOCK_ORDERS: Order[] = [
  {
    id: 'order_001',
    buyer_id: 'user_buyer_001',
    seller_id: 'user_admin_001',
    product_id: 'prod_001',
    quantity: 100,
    total: 1250000,
    status: 'delivered',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order_002',
    buyer_id: 'user_buyer_001',
    seller_id: 'user_admin_001',
    product_id: 'prod_002',
    quantity: 50,
    total: 900000,
    status: 'shipped',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'order_003',
    buyer_id: 'user_buyer_001',
    seller_id: 'user_admin_001',
    product_id: 'prod_003',
    quantity: 5,
    total: 225000,
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock clusters
export const MOCK_CLUSTERS: Cluster[] = [
  {
    id: 'cluster_001',
    name: 'Builders United',
    description: 'A community of construction material buyers pooling orders',
    creatorId: 'user_buyer_001',
    creatorName: 'John Buyer',
    targetProductId: 'prod_001',
    targetProductName: 'High-Quality Ceramic Tiles',
    targetPrice: 500000,
    currentFunded: 250000,
    minOrderAmount: 100,
    quantity: 1000,
    maxMembers: 50,
    currentMembers: 5,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    preferredShippingMethod: 'Sea Freight',
    members: [
      {
        id: 'member_001',
        userId: 'user_buyer_001',
        username: 'John Buyer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user_buyer_001',
        joinedQuantity: 100,
        joinedAmount: 12500,
        joinedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cluster_002',
    name: 'Tech Innovators',
    description: 'Electronics and tech component trading group',
    creatorId: 'user_buyer_001',
    creatorName: 'John Buyer',
    targetProductId: 'prod_005',
    targetProductName: 'Electronic Components',
    targetPrice: 320000,
    currentFunded: 180000,
    minOrderAmount: 200,
    quantity: 500,
    maxMembers: 30,
    currentMembers: 3,
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    preferredShippingMethod: 'Air Freight',
    members: [
      {
        id: 'member_002',
        userId: 'user_buyer_001',
        username: 'John Buyer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user_buyer_001',
        joinedQuantity: 50,
        joinedAmount: 16000,
        joinedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock wallet
export const MOCK_WALLET = {
  user_id: 'user_buyer_001',
  balance: 50000,
  currency: 'USD',
  updated_at: new Date().toISOString(),
};

// Mock transactions
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn_001',
    user_id: 'user_buyer_001',
    type: 'deposit',
    amount: 10000,
    currency: 'USD',
    note: 'Initial deposit',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'txn_002',
    user_id: 'user_buyer_001',
    type: 'payment',
    amount: 1250000,
    currency: 'USD',
    note: 'Order payment for prod_001',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock social posts
export const MOCK_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post_001',
    userId: 'user_buyer_001',
    username: 'John Buyer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user_buyer_001',
    type: 'text',
    content: 'Just discovered some amazing suppliers on Echina! The platform really makes international trade seamless.',
    likes: 125,
    comments: 8,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post_002',
    userId: 'user_admin_001',
    username: 'Admin User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user_admin_001',
    type: 'text',
    content: 'New batch of high-quality ceramic tiles ready for export. Meeting international standards. DM for bulk orders!',
    likes: 87,
    comments: 12,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Helper function to simulate network delay
export const delay = (ms = 100) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};