import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getProductById, getOrders, getSocialPosts, updateProduct, createProduct, deleteProduct } from "@/lib/db";
import type { Product } from "@/types/models";

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
