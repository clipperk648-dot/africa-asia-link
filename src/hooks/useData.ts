import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getProductById, getOrders, getSocialPosts, updateProduct, createProduct, deleteProduct, getClans, getClanById, createClan, joinClan, leaveClan, getWalletBalance } from "@/lib/db";
import type { Product, Clan } from "@/types/models";

// Fetch all products
export const useProducts = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ["products", limit, offset],
    queryFn: () => getProducts(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Fetch a single product by ID
export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => (id ? getProductById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch orders for a user
export const useOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => (userId ? getOrders(userId) : []),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes - more frequent for orders
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch social posts
export const useSocialPosts = (limit = 20) => {
  return useQuery({
    queryKey: ["socialPosts", limit],
    queryFn: () => getSocialPosts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutations for product management
export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: Partial<Product>) => createProduct(productData),
    onSuccess: () => {
      // Invalidate and refetch all product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      updateProduct(id, data),
    onSuccess: (data) => {
      if (data) {
        // Invalidate product-related queries
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["product", data.id] });
      }
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      // Invalidate all product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Clan queries and mutations
export const useClans = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ["clans", limit, offset],
    queryFn: () => getClans(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useClan = (id: string | undefined) => {
  return useQuery({
    queryKey: ["clan", id],
    queryFn: () => (id ? getClanById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateClanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clanData: Partial<Clan>) => createClan(clanData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clans"] });
    },
  });
};

export const useJoinClanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clanId, userId, username, amount }: { clanId: string; userId: string; username: string; amount: number }) =>
      joinClan(clanId, userId, username, amount),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["clans"] });
        queryClient.invalidateQueries({ queryKey: ["clan", data.id] });
      }
    },
  });
};

export const useLeaveClanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clanId, userId }: { clanId: string; userId: string }) =>
      leaveClan(clanId, userId),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["clans"] });
        queryClient.invalidateQueries({ queryKey: ["clan", data.id] });
      }
    },
  });
};

// Fetch wallet balance for a user
export const useWalletBalance = (userId: string | undefined, currency = "USD") => {
  return useQuery({
    queryKey: ["walletBalance", userId, currency],
    queryFn: () => (userId ? getWalletBalance(userId, currency) : { balance: 0, currency }),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent for sensitive data
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
