/* eslint-disable @typescript-eslint/no-explicit-any */
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

export const updateUserRole = async (userId: string, role: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const suspendUser = async (userId: string, suspended: boolean): Promise<unknown> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ suspended })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  return !error;
};

// ============ PRODUCTS ============

export const getProducts = async (limit = 20, offset = 0, filters: { category?: string, search?: string, shippingMethod?: string } = {}): Promise<unknown[]> => {
  // Fetch from regular products
  let pQuery = supabase
    .from('products')
    .select('*');
  
  if (filters.category) {
    pQuery = pQuery.eq('category', filters.category);
  }

  if (filters.search) {
    pQuery = pQuery.ilike('name', `%${filters.search}%`);
  }

  // Regular products might not have shipping_method yet in this schema
  
  const { data: pData } = await pQuery;
  
  // Fetch from supplier products
  let sQuery = supabase
    .from('supplier_products')
    .select('*')
    .eq('status', 'active');

  if (filters.category) {
    sQuery = sQuery.eq('category', filters.category);
  }

  if (filters.search) {
    sQuery = sQuery.ilike('title', `%${filters.search}%`);
  }

  const { data: sData } = await sQuery;

  // Unify the data
  const unifiedProducts = [
    ...(pData || []),
    ...(sData || []).map(s => ({
      ...s,
      name: s.title,
      price: s.price_min, // Use min price as primary price
      image: s.image_url,
      company: s.supplier_name,
      rating: 4.5, // Default rating for supplier products
      location: "China", // Default location
      is_supplier_product: true
    }))
  ];

  // Sort by created_at descending
  unifiedProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Apply pagination
  return unifiedProducts.slice(offset, offset + limit);
};

export const searchProducts = async (query: string, filters: any = {}): Promise<unknown[]> => {
  return getProducts(20, 0, { search: query, ...filters });
};

export const getProductsByCategory = async (categoryId: string): Promise<unknown[]> => {
  return getProducts(20, 0, { category: categoryId });
};

export const getProductById = async (id: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (!error && data) return data;

  // Try supplier_products
  const { data: sData, error: sError } = await supabase
    .from('supplier_products')
    .select('*')
    .eq('id', id)
    .single();

  if (!sError && sData) {
    return {
      ...sData,
      name: sData.title,
      price: sData.price_min,
      image: sData.image_url,
      company: sData.supplier_name,
      rating: 4.5,
      location: "China",
      is_supplier_product: true
    };
  }
  
  return null;
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

// ============ SUPPLIER PRODUCTS ============

export const getSupplierProducts = async (limit = 20, offset = 0, filters: { category?: string; status?: string; search?: string } = {}): Promise<unknown[]> => {
  let query = supabase
    .from('supplier_products')
    .select('*')
    .eq('status', filters.status || 'active')
    .range(offset, offset + limit - 1);

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) return [];
  return data;
};

export const getSupplierProductById = async (id: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('supplier_products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
};

export const createSupplierProduct = async (productData: unknown): Promise<unknown> => {
  const { data, error } = await supabase
    .from('supplier_products')
    .insert([{ ...(productData as object), status: 'active', created_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createSupplierProducts = async (products: unknown[]): Promise<unknown[]> => {
  const productsWithTimestamps = (products as { [key: string]: any }[]).map(p => ({
    ...p,
    status: 'active',
    created_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('supplier_products')
    .insert(productsWithTimestamps)
    .select();

  if (error) throw error;
  return data || [];
};

export const updateSupplierProduct = async (id: string, productData: unknown): Promise<unknown> => {
  const { data, error } = await supabase
    .from('supplier_products')
    .update(productData as object)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data;
};

export const deleteSupplierProduct = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('supplier_products')
    .delete()
    .eq('id', id);

  return !error;
};

export const getAllSupplierProducts = async (): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('supplier_products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
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

// ============ SHIPPING METHODS ============

export const getShippingMethods = async (): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('shipping_methods')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) return [];
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

export const getClustersByProduct = async (productId: string): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('clusters')
    .select('*, products(*)')
    .eq('target_product_id', productId)
    .eq('status', 'active');
  
  if (error) return [];
  return data;
};

export const autoCreateClusterForProduct = async (productId: string, userId: string, userName: string): Promise<unknown> => {
  const product = await getProductById(productId) as any;
  if (!product) throw new Error("Product not found");

  return createCluster({
    name: `${product.name} Buying Group`,
    description: `A new cluster for ${product.name}`,
    targetProductId: productId,
    targetProductName: product.name,
    targetPrice: product.price,
    quantity: product.moq || 1,
    maxMembers: 5,
    preferredShippingMethod: 'Standard',
    creatorId: userId,
    creatorName: userName
  });
};

export const getClusterMembers = async (clusterId: string): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('cluster_members')
    .select('*, profiles(name, avatar)')
    .eq('cluster_id', clusterId);
  
  if (error) return [];
  return data;
};

export const getClusterMemberRole = async (clusterId: string, userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('cluster_members')
    .select('role')
    .eq('cluster_id', clusterId)
    .eq('user_id', userId)
    .single();
  
  if (error) return null;
  return (data as any).role;
};

export const getClustersForAdmin = async (): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('clusters')
    .select('*, products(*), profiles!creator_id(name)')
    .order('created_at', { ascending: false });
  
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

export const createCluster = async (clusterData: any): Promise<unknown> => {
  const mappedData = {
    name: clusterData.name,
    description: clusterData.description,
    creator_id: clusterData.creatorId || clusterData.creator_id,
    target_product_id: clusterData.targetProductId || clusterData.target_product_id,
    target_product_name: clusterData.targetProductName || clusterData.target_product_name,
    target_price: clusterData.targetPrice || clusterData.target_price || 0,
    quantity: clusterData.quantity || 0,
    max_members: clusterData.maxMembers || clusterData.max_members || 5,
    preferred_shipping_method: clusterData.preferredShippingMethod || clusterData.preferred_shipping_method,
    shipping_mode: clusterData.shipping_mode || 'sea',
    destination: clusterData.destination || 'lagos',
    target_qty: clusterData.target_qty || 100,
    total_cbm: 0,
    status: 'active',
    current_funded: 0,
    current_members: 1, // Creator is the first member
    created_at: new Date().toISOString(),
    shipping_status: 'shipping not started yet',
    stop_counting: false
  };

  const { data, error } = await supabase
    .from('clusters')
    .insert([mappedData])
    .select()
    .single();
  
  if (error) throw error;

  // Also add the creator as a member in cluster_members table
  if (data) {
    await supabase.from('cluster_members').insert([{
      cluster_id: data.id,
      user_id: mappedData.creator_id,
      joined_quantity: 0, // Creator might not have specified quantity yet
      joined_amount: 0,
      joined_at: new Date().toISOString()
    }]);
  }

  return data;
};

export const joinCluster = async (
  clusterId: string,
  userId: string,
  quantity: number,
  amount: number
): Promise<unknown> => {
  // Check if cluster is locked or full
  const { data: clusterData, error: clusterFetchError } = await supabase
    .from('clusters')
    .select('status, current_members, max_members')
    .eq('id', clusterId)
    .single();
  
  if (clusterFetchError) throw clusterFetchError;
  const cluster = clusterData as { status: string, current_members: number, max_members: number };

  if (cluster.status === 'locked') {
    throw new Error("This cluster is locked and cannot be joined.");
  }
  
  if (cluster.current_members >= cluster.max_members) {
    throw new Error("This cluster is already full.");
  }

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
  const { data: latestClusterData } = await supabase.from('clusters').select('current_funded, current_members, target_product_id').eq('id', clusterId).single();
  if (latestClusterData) {
    const clusterStats = latestClusterData as { current_funded: number, current_members: number, target_product_id: string };
    
    // Fetch product to calculate CBM
    const { data: productData } = await supabase.from('products').select('length_cm, width_cm, height_cm, merchant_id').eq('id', clusterStats.target_product_id).single();
    let newCbm = 0;
    if (productData) {
      const product = productData as any;
      const unitCbm = (product.length_cm * product.width_cm * product.height_cm) / 1000000;
      const addedCbm = unitCbm * quantity;
      
      const { data: currentCluster } = await supabase.from('clusters').select('total_cbm').eq('id', clusterId).single();
      newCbm = ((currentCluster as any)?.total_cbm || 0) + addedCbm;
      
      // Feature 6: Upsert into merchant_customers
      const { data: userData } = await supabase.from('profiles').select('email, phone, name').eq('id', userId).single();
      if (userData && product.merchant_id) {
        const user = userData as any;
        await supabase.from("merchant_customers").upsert({
          merchant_id: product.merchant_id,
          cluster_id: clusterId,
          buyer_id: userId,
          email: user.email,
          phone: user.phone,
          username: user.name,
        }, { onConflict: "merchant_id,cluster_id,buyer_id" });
      }
    }

    await supabase.from('clusters').update({
      current_funded: (clusterStats.current_funded || 0) + amount,
      current_members: (clusterStats.current_members || 0) + 1,
      total_cbm: newCbm
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

export const checkoutCluster = async (clusterId: string): Promise<boolean> => {
  // 1. Get cluster details
  const { data: clusterData, error: clusterError } = await supabase
    .from('clusters')
    .select('*, cluster_members(*)')
    .eq('id', clusterId)
    .single();

  if (clusterError || !clusterData) throw clusterError || new Error("Cluster not found");
  const cluster = clusterData as any;

  // Fetch product info (could be from products or supplier_products)
  let productLink = "";
  const { data: sProduct } = await supabase.from('supplier_products').select('alibaba_link').eq('id', cluster.target_product_id).single();
  if (sProduct) {
    productLink = (sProduct as any).alibaba_link;
  } else {
    const { data: pProduct } = await supabase.from('products').select('image').eq('id', cluster.target_product_id).single();
    if (pProduct) {
      // If it's a regular product, maybe it doesn't have an alibaba link
      productLink = ""; 
    }
  }

  // 2. Lock the cluster
  await supabase
    .from('clusters')
    .update({ status: 'locked' })
    .eq('id', clusterId);

  // 3. Create order record
  const { error: orderError } = await supabase
    .from('orders')
    .insert([{
      cluster_id: clusterId,
      product_id: cluster.target_product_id,
      product_name: cluster.target_product_name,
      product_link: productLink,
      quantity: cluster.quantity,
      total: cluster.current_funded,
      status: 'Pending Manual Purchase',
      created_at: new Date().toISOString()
    }]);

  if (orderError) throw orderError;

  // 4. Send notification to admin (simulated here by creating a notification in the table)
  const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
  if (admins) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "Cluster Ready for Purchase",
        `Cluster "${cluster.name}" is complete and ready for manual purchase on Alibaba.`,
        "info"
      );
    }
  }

  return true;
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

export const getWalletTransactions = async (userId: string): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
};

export const setWalletBalance = async (userId: string, amount: number, currency: string = 'USD'): Promise<unknown> => {
  const { data, error } = await supabase
    .from('wallets')
    .update({ balance: amount, currency })
    .eq('user_id', userId)
    .select()
    .single();

  if (error && error.code === 'PGRST116') {
    // Create wallet if not exists
    const { data: newWallet } = await supabase.from('wallets').insert([{ user_id: userId, balance: amount, currency }]).select().single();
    return newWallet;
  }
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

// ============ CATEGORIES ============

export const getCategories = async (): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) return [];
  return data;
};

export const createCategory = async (name: string, description?: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{
      name,
      description,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateCategory = async (id: string, name: string, description?: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('categories')
    .update({ name, description })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  return !error;
};

// ============ CONTENT MANAGEMENT ============

export const getContentPages = async (): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('content_pages')
    .select('*')
    .order('title', { ascending: true });

  if (error) return [];
  return data;
};

export const createContentPage = async (title: string, slug: string, content: string, published: boolean = false): Promise<unknown> => {
  const { data, error } = await supabase
    .from('content_pages')
    .insert([{
      title,
      slug,
      content,
      published,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateContentPage = async (id: string, title: string, slug: string, content: string, published: boolean): Promise<unknown> => {
  const { data, error } = await supabase
    .from('content_pages')
    .update({ title, slug, content, published })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteContentPage = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('content_pages')
    .delete()
    .eq('id', id);

  return !error;
};

// ============ ANNOUNCEMENTS ============

export const getAnnouncements = async (): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
};

export const createAnnouncement = async (title: string, message: string, type: string = 'info'): Promise<unknown> => {
  const { data, error } = await supabase
    .from('announcements')
    .insert([{
      title,
      message,
      type,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteAnnouncement = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  return !error;
};

// ============ REPORTS ============

export const generateSalesReport = async (startDate: string, endDate: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) return null;
  return data;
};

export const generateUserReport = async (): Promise<unknown> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, name, role, created_at, suspended');

  if (error) return null;
  return data;
};

export const generateProductReport = async (): Promise<unknown> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return null;
  return data;
};

// ============ SHIPPING MANAGEMENT ============

export const updateClusterShippingStatus = async (clusterId: string, status: string): Promise<unknown> => {
  const updateData: any = { 
    shipping_status: status,
    updated_at: new Date().toISOString()
  };
  
  if (status === 'in_transit') {
    updateData.shipping_started_at = new Date().toISOString();
  }
  
  return updateCluster(clusterId, updateData);
};

// ============ CUSTOMER SERVICE / SUPPORT ============

export const createSupportTicket = async (userId: string, subject: string, description: string, priority: string = 'normal'): Promise<unknown> => {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert([{
      user_id: userId,
      subject,
      description,
      status: 'open',
      priority,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getSupportTickets = async (userId: string): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) return [];
  return data;
};

export const getAllSupportTickets = async (): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*, profiles(name, email)')
    .order('created_at', { ascending: false });
  
  if (error) return [];
  return data;
};

export const updateSupportTicketStatus = async (ticketId: string, status: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', ticketId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// ============ CLUSTER MESSAGING & POLLS ============

export const sendClusterMessage = async (clusterId: string, userId: string, message: string, type: string = 'text'): Promise<unknown> => {
  const { data, error } = await supabase
    .from('cluster_messages')
    .insert([{
      cluster_id: clusterId,
      user_id: userId,
      content: message,
      type,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getClusterMessages = async (clusterId: string): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('cluster_messages')
    .select('*, profiles(name, avatar)')
    .eq('cluster_id', clusterId)
    .order('created_at', { ascending: true });
  
  if (error) return [];
  return data;
};

export const createClusterPoll = async (clusterId: string, userId: string, question: string, options: string[]): Promise<unknown> => {
  const { data: poll, error: pollError } = await supabase
    .from('cluster_polls')
    .insert([{
      cluster_id: clusterId,
      created_by: userId,
      question,
      is_active: true,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (pollError) throw pollError;

  if (poll && options.length > 0) {
    const pollOptions = options.map(opt => ({
      poll_id: poll.id,
      option_text: opt
    }));
    await supabase.from('cluster_poll_options').insert(pollOptions);
  }

  return poll;
};

export const getClusterPolls = async (clusterId: string): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('cluster_polls')
    .select('*, cluster_poll_options(*)')
    .eq('cluster_id', clusterId)
    .eq('is_active', true);
  
  if (error) return [];
  return data;
};

export const voteOnPoll = async (pollId: string, optionId: string, userId: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('cluster_poll_votes')
    .insert([{
      poll_id: pollId,
      option_id: optionId,
      voter_id: userId,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) throw error;

  // Increment vote count on option (trigger would be better but let's do it here for simplicity)
  const { data: option } = await supabase.from('cluster_poll_options').select('vote_count').eq('id', optionId).single();
  if (option) {
    await supabase.from('cluster_poll_options').update({ vote_count: (option.vote_count || 0) + 1 }).eq('id', optionId);
  }

  return data;
};

export const getNotifications = async (userId: string): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
};

export const createNotification = async (userId: string, title: string, message: string, type: string = 'info'): Promise<unknown> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{
      user_id: userId,
      title,
      message,
      type,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (id: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteNotification = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  return !error;
};

// ============ SUPPORT MESSAGES ============

export const getSupportMessages = async (userId: string): Promise<unknown[]> => {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data;
};

export const createSupportMessage = async (senderId: string, recipientId: string | null, text: string, senderRole?: string): Promise<unknown> => {
  const { data, error } = await supabase
    .from('support_messages')
    .insert([{
      sender_id: senderId,
      recipient_id: recipientId,
      text,
      sender_role: senderRole,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
