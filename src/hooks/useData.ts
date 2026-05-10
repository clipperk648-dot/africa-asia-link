import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProductById,
  getOrders,
  getSocialPosts,
  updateProduct,
  createProduct,
  deleteProduct,
  getClusters,
  getClusterById,
  createCluster,
  joinCluster,
  getWalletBalance,
  getAllUsers,
  getAllOrders,
  getSupplierProducts,
  getSupplierProductById,
  createSupplierProduct,
  createSupplierProducts,
  updateSupplierProduct,
  deleteSupplierProduct,
  getAllSupplierProducts
} from "@/lib/db";
import type { Product, Cluster } from "@/types/models";

// Fetch all users (Admin only)
export const useAllUsers = () => {
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: () => getAllUsers(),
    staleTime: 5 * 60 * 1000,
  });
};

// Fetch all orders (Admin only)
export const useAllOrders = () => {
  return useQuery({
    queryKey: ["allOrders"],
    queryFn: () => getAllOrders(),
    staleTime: 5 * 60 * 1000,
  });
};

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

// Cluster queries and mutations
export const useClusters = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ["clusters", limit, offset],
    queryFn: () => getClusters(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCluster = (id: string | undefined) => {
  return useQuery({
    queryKey: ["cluster", id],
    queryFn: () => (id ? getClusterById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateClusterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clusterData: Partial<Cluster>) => createCluster(clusterData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
    },
  });
};

export const useJoinClusterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clusterId, userId, quantity, amount }: { clusterId: string; userId: string; quantity: number; amount: number }) =>
      joinCluster(clusterId, userId, quantity, amount),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["clusters"] });
        queryClient.invalidateQueries({ queryKey: ["cluster", data.cluster_id] });
      }
    },
  });
};

export const useLeaveClusterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ clusterId, userId }: { clusterId: string; userId: string }) =>
      leaveCluster(clusterId, userId),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["clusters"] });
        queryClient.invalidateQueries({ queryKey: ["cluster", data.id] });
      }
    },
  });
};

export const useUpdateClusterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      updateCluster(id, data),
    onSuccess: (data: any) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["clusters"] });
        queryClient.invalidateQueries({ queryKey: ["cluster", data.id] });
      }
    },
  });
};

import { updateCluster } from "@/lib/db";



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

// Supplier Products hooks
export const useSupplierProducts = (limit = 20, offset = 0, filters = {}) => {
  return useQuery({
    queryKey: ["supplierProducts", limit, offset, filters],
    queryFn: () => getSupplierProducts(limit, offset, filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useSupplierProduct = (id: string | undefined) => {
  return useQuery({
    queryKey: ["supplierProduct", id],
    queryFn: () => (id ? getSupplierProductById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAllSupplierProducts = () => {
  return useQuery({
    queryKey: ["allSupplierProducts"],
    queryFn: () => getAllSupplierProducts(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateSupplierProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: any) => createSupplierProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierProducts"] });
      queryClient.invalidateQueries({ queryKey: ["allSupplierProducts"] });
    },
  });
};

export const useCreateSupplierProductsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (products: any[]) => createSupplierProducts(products),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierProducts"] });
      queryClient.invalidateQueries({ queryKey: ["allSupplierProducts"] });
    },
  });
};

export const useUpdateSupplierProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSupplierProduct(id, data),
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["supplierProducts"] });
        queryClient.invalidateQueries({ queryKey: ["supplierProduct", (data as any).id] });
        queryClient.invalidateQueries({ queryKey: ["allSupplierProducts"] });
      }
    },
  });
};

export const useDeleteSupplierProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSupplierProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierProducts"] });
      queryClient.invalidateQueries({ queryKey: ["allSupplierProducts"] });
    },
  });
};
