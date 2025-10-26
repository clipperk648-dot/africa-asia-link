import { useQuery } from "@tanstack/react-query";
import { getProducts, getProductById, getOrders, getSocialPosts } from "@/lib/db";

// Fetch all products
export const useProducts = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ["products", limit, offset],
    queryFn: () => getProducts(limit, offset),
    refetchInterval: 10000,
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
