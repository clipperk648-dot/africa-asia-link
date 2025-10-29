import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getProductById, getOrders, getSocialPosts, updateProduct, createProduct, deleteProduct, getClans, getClanById, createClan, joinClan, leaveClan } from "@/lib/db";
import type { Product, Clan } from "@/types/models";

// Fetch all products
export const useProducts = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ["products", limit, offset],
    queryFn: () => getProducts(limit, offset),
    refetchInterval: 5000, // Refetch every 5 seconds for better real-time sync
  });
};

// Fetch a single product by ID
export const useProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => (id ? getProductById(id) : null),
    enabled: !!id,
  });
};

// Fetch orders for a user
export const useOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: () => (userId ? getOrders(userId) : []),
    enabled: !!userId,
    refetchInterval: 5000,
  });
};

// Fetch social posts
export const useSocialPosts = (limit = 20) => {
  return useQuery({
    queryKey: ["socialPosts", limit],
    queryFn: () => getSocialPosts(limit),
    refetchInterval: 5000,
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
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
};

export const useClan = (id: string | undefined) => {
  return useQuery({
    queryKey: ["clan", id],
    queryFn: () => (id ? getClanById(id) : null),
    enabled: !!id,
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
