// Mock data emptied as requested to connect to real Supabase backend
import { Product, Order, Cluster, User, Transaction, SocialPost } from '@/types/models';

export const MOCK_USERS: Record<string, User> = {};
export const MOCK_PRODUCTS: Product[] = [];
export const MOCK_ORDERS: Order[] = [];
export const MOCK_CLUSTERS: Cluster[] = [];
export const MOCK_WALLET = {
  user_id: '',
  balance: 0,
  currency: 'NGN',
  updated_at: new Date().toISOString(),
};
export const MOCK_TRANSACTIONS: Transaction[] = [];
export const MOCK_SOCIAL_POSTS: SocialPost[] = [];

export const delay = (ms = 100) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};
