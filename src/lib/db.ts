import { supabase } from './supabase';

export const isDatabaseConfigured = (): boolean => {
  return true;
};

// ============ USERS / PROFILES ============

export const createUserProfile = async (
  id: string,
  email: string,
  name: string,
  phone: string,
  role: string = 'buyer'
): Promise<unknown> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      { id, email, name, phone, role, created_at: new Date().toISOString() }
    ])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getUserByEmail = async (email: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error && error.code !== 'PGRST116') return null; // PGRST116 is not found
  return data;
};

export const getUserById = async (id: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error && error.code !== 'PGRST116') return null;
  return data;
};

export const getAllUsers = async (): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');
  
  if (error) return [];
  return data;
};

// ============ PRODUCTS ============

export const getProducts = async (limit = 20, offset = 0, filters: { category?: string, search?: string } = {}): Promise<unknown[]> => {
  let query = supabase
    .from('products')
    .select('*')
    .range(offset, offset + limit - 1);
  
  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  const { data, error } = await query;
  
  if (error) return [];
  return data;
};

export const getProductById = async (id: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
};

export const createProduct = async (productData: unknown): Promise<unknown> => {
  const { data, error } = await supabase
    .from('products')
    .insert([{ ...(productData as object), created_at: new Date().toISOString() }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateProduct = async (id: string, productData: unknown): Promise<unknown> => {
  const { data, error } = await supabase
    .from('products')
    .update(productData as object)
    .eq('id', id)
    .select()
    .single();
  
  if (error) return null;
  return data;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  return !error;
};

// ============ ORDERS ============

export const getOrders = async (userId: string): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, products(*)')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
  
  if (error) return [];
  return data;
};

export const getAllOrders = async (): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, products(*), profiles!buyer_id(name)');
  
  if (error) return [];
  return data;
};

export const createOrder = async (
  buyerId: string,
  sellerId: string,
  productId: string,
  quantity: number,
  total: number
): Promise<unknown> => {
  const { data, error } = await supabase
    .from('orders')
    .insert([{
      buyer_id: buyerId,
      seller_id: sellerId,
      product_id: productId,
      quantity,
      total,
      status: 'pending',
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ============ SOCIAL POSTS ============

export const getSocialPosts = async (limit = 20): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('social_posts')
    .select('*, profiles(name, avatar)')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) return [];
  return data;
};

export const createSocialPost = async (
  userId: string,
  content: string,
  imageUrl?: string,
  type: string = 'text'
): Promise<unknown> => {
  const { data, error } = await supabase
    .from('social_posts')
    .insert([{
      user_id: userId,
      content,
      media_url: imageUrl,
      type,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ============ CLUSTERS ============

export const getClusters = async (limit = 20, offset = 0): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('clusters')
    .select('*, products(*)')
    .range(offset, offset + limit - 1);
  
  if (error) return [];
  return data;
};

export const getClusterById = async (id: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('clusters')
    .select('*, products(*), cluster_members(*, profiles(name, avatar))')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data;
};

export const createCluster = async (clusterData: unknown): Promise<unknown> => {
  const { data, error } = await supabase
    .from('clusters')
    .insert([{
      ...(clusterData as object),
      status: 'active',
      current_funded: 0,
      current_members: 0,
      created_at: new Date().toISOString(),
      shipping_status: 'shipping not started yet'
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const joinCluster = async (
  clusterId: string,
  userId: string,
  quantity: number,
  amount: number
): Promise<unknown> => {
  const { data: member, error: memberError } = await supabase
    .from('cluster_members')
    .insert([{
      cluster_id: clusterId,
      user_id: userId,
      joined_quantity: quantity,
      joined_amount: amount,
      joined_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (memberError) throw memberError;

  // Update cluster stats (in a real app, this should be a trigger or RPC)
  const { data: clusterData } = await supabase.from('clusters').select('current_funded, current_members').eq('id', clusterId).single();
  if (clusterData) {
    const cluster = clusterData as { current_funded: number, current_members: number };
    await supabase.from('clusters').update({
      current_funded: (cluster.current_funded || 0) + amount,
      current_members: (cluster.current_members || 0) + 1
    }).eq('id', clusterId);
  }

  return member;
};

export const leaveCluster = async (clusterId: string, userId: string): Promise<unknown> => {
  const { data: memberData, error: fetchError } = await supabase
    .from('cluster_members')
    .select('*')
    .eq('cluster_id', clusterId)
    .eq('user_id', userId)
    .single();
  
  if (fetchError) return null;

  const member = memberData as { joined_amount: number };

  const { error: deleteError } = await supabase
    .from('cluster_members')
    .delete()
    .eq('cluster_id', clusterId)
    .eq('user_id', userId);
  
  if (deleteError) throw deleteError;

  // Update cluster stats
  const { data: clusterData } = await supabase.from('clusters').select('current_funded, current_members').eq('id', clusterId).single();
  if (clusterData) {
    const cluster = clusterData as { current_funded: number, current_members: number };
    await supabase.from('clusters').update({
      current_funded: Math.max(0, (cluster.current_funded || 0) - member.joined_amount),
      current_members: Math.max(0, (cluster.current_members || 0) - 1)
    }).eq('id', clusterId);
  }

  return { id: clusterId };
};

export const updateCluster = async (id: string, data: unknown): Promise<unknown> => {
  const { data: updated, error } = await supabase
    .from('clusters')
    .update(data as object)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return updated;
};

// ============ WALLET ============

export const getWalletBalance = async (userId: string): Promise<{ balance: number; currency: string }> => {
  const { data, error } = await supabase
    .from('wallets')
    .select('balance, currency')
    .eq('user_id', userId)
    .single();
  
  if (error && error.code === 'PGRST116') {
    // Create wallet if not exists
    const { data: newWallet } = await supabase.from('wallets').insert([{ user_id: userId, balance: 0, currency: 'USD' }]).select().single();
    return (newWallet as { balance: number, currency: string }) || { balance: 0, currency: 'USD' };
  }
  return (data as { balance: number, currency: string }) || { balance: 0, currency: 'USD' };
};

export const addWalletTransaction = async (
  userId: string,
  tx: { type: "deposit" | "payment"; amount: number; currency?: string; note?: string }
): Promise<unknown> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      user_id: userId,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency || 'USD',
      note: tx.note || '',
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;

  // Update wallet balance
  const currentWallet = await getWalletBalance(userId);
  const newBalance = tx.type === 'deposit' 
    ? currentWallet.balance + tx.amount 
    : currentWallet.balance - tx.amount;
  
  await supabase.from('wallets').update({ balance: newBalance }).eq('user_id', userId);

  return data;
};

// ============ MESSAGING ============

export const sendMessage = async (
  senderId: string,
  recipientId: string | null,
  content: string,
  mediaUrl?: string
): Promise<unknown> => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      sender_id: senderId,
      recipient_id: recipientId,
      content,
      media_url: mediaUrl,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getMessages = async (userId: string, peerId: string): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},recipient_id.eq.${peerId}),and(sender_id.eq.${peerId},recipient_id.eq.${userId})`)
    .order('created_at', { ascending: true });
  
  if (error) return [];
  return data;
};
