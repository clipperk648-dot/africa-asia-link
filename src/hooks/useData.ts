/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
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
  leaveCluster,
  updateCluster,
  getWalletBalance,
  getAllUsers,
  getAllOrders,
  getSupplierProducts,
  getSupplierProductById,
  createSupplierProduct,
  createSupplierProducts,
  updateSupplierProduct,
  deleteSupplierProduct,
  getAllSupplierProducts,
  checkoutCluster,
  getShippingMethods,
  getClustersByProduct,
  autoCreateClusterForProduct,
  getClusterMembers,
  getClusterMemberRole,
  getClustersForAdmin,
  updateClusterShippingStatus,
  createSupportTicket,
  getSupportTickets,
  getAllSupportTickets,
  updateSupportTicketStatus,
  sendClusterMessage,
  getClusterMessages,
  createClusterPoll,
  getClusterPolls,
  voteOnPoll
} from "@/lib/db";
import type { Product, Cluster } from "@/types/models";

// Fetch all users (Admin only) with realtime updates
export const useAllUsers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => getAllUsers(),
    staleTime: 5 * 60 * 1000,
  });

  // Subscribe to realtime changes on the profiles table
  useEffect(() => {
    const channel = supabase
      .channel('profiles-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          // Invalidate the query to refetch fresh data
          queryClient.invalidateQueries({ queryKey: ["allUsers"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

// Fetch all orders (Admin only) with realtime updates
export const useAllOrders = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["allOrders"],
    queryFn: () => getAllOrders(),
    staleTime: 5 * 60 * 1000,
  });

  // Subscribe to realtime changes on the orders table
  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["allOrders"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

// Fetch all products with realtime updates
export const useProducts = (limit = 20, offset = 0) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["products", limit, offset],
    queryFn: () => getProducts(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });

  // Subscribe to realtime changes on products tables
  useEffect(() => {
    const channel = supabase
      .channel('products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplier_products'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["products"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
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

// Fetch social posts with realtime updates
export const useSocialPosts = (limit = 20) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["socialPosts", limit],
    queryFn: () => getSocialPosts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Subscribe to realtime changes on social posts
  useEffect(() => {
    const channel = supabase
      .channel('social-posts-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'social_posts'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["socialPosts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
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
        queryClient.invalidateQueries({ queryKey: ["product", (data as any).id] });
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

// Cluster queries and mutations with realtime updates
export const useClusters = (limit = 20, offset = 0) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["clusters", limit, offset],
    queryFn: () => getClusters(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Subscribe to realtime changes on clusters tables
  useEffect(() => {
    const channel = supabase
      .channel('clusters-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clusters'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["clusters"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cluster_members'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["clusters"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useCluster = (id: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["cluster", id],
    queryFn: () => (id ? getClusterById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Subscribe to realtime changes for this specific cluster
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`cluster-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cluster_members'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["cluster", id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  return query;
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
    onSuccess: (data: any) => {
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
    onSuccess: (data: any) => {
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

export const useCheckoutClusterMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clusterId: string) => checkoutCluster(clusterId),
    onSuccess: (_, clusterId) => {
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      queryClient.invalidateQueries({ queryKey: ["cluster", clusterId] });
      queryClient.invalidateQueries({ queryKey: ["allOrders"] });
    },
  });
};

// Fetch wallet balance for a user
export const useWalletBalance = (userId: string | undefined, currency = "USD") => {
  return useQuery({
    queryKey: ["walletBalance", userId, currency],
    queryFn: () => (userId ? getWalletBalance(userId) : { balance: 0, currency }),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - more frequent for sensitive data
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Supplier Products hooks with realtime updates
export const useSupplierProducts = (limit = 20, offset = 0, filters = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["supplierProducts", limit, offset, filters],
    queryFn: () => getSupplierProducts(limit, offset, filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Subscribe to realtime changes on supplier_products
  useEffect(() => {
    const channel = supabase
      .channel('supplier-products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplier_products'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["supplierProducts"] });
          queryClient.invalidateQueries({ queryKey: ["allSupplierProducts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useSupplierProduct = (id: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["supplierProduct", id],
    queryFn: () => (id ? getSupplierProductById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Subscribe to realtime changes for this specific product
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`supplier-product-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplier_products'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["supplierProduct", id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  return query;
};

export const useAllSupplierProducts = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["allSupplierProducts"],
    queryFn: () => getAllSupplierProducts(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Subscribe to realtime changes on supplier_products
  useEffect(() => {
    const channel = supabase
      .channel('all-supplier-products-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'supplier_products'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["allSupplierProducts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
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
    onSuccess: (data: any) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ["supplierProducts"] });
        queryClient.invalidateQueries({ queryKey: ["supplierProduct", data.id] });
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

export const useShippingMethods = () => {
  return useQuery({
    queryKey: ["shippingMethods"],
    queryFn: () => getShippingMethods(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export const useSupportTickets = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["supportTickets", userId],
    queryFn: () => (userId ? getSupportTickets(userId) : []),
    enabled: !!userId,
  });
};

export const useAllSupportTickets = () => {
  return useQuery({
    queryKey: ["allSupportTickets"],
    queryFn: () => getAllSupportTickets(),
  });
};

export const useClusterMessages = (clusterId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["clusterMessages", clusterId],
    queryFn: () => (clusterId ? getClusterMessages(clusterId) : []),
    enabled: !!clusterId,
  });

  useEffect(() => {
    if (!clusterId) return;

    const channel = supabase
      .channel(`cluster-messages-${clusterId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cluster_messages',
          filter: `cluster_id=eq.${clusterId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["clusterMessages", clusterId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clusterId, queryClient]);

  return query;
};

export const useClusterPolls = (clusterId: string | undefined) => {
  return useQuery({
    queryKey: ["clusterPolls", clusterId],
    queryFn: () => (clusterId ? getClusterPolls(clusterId) : []),
    enabled: !!clusterId,
  });
};

export const useSendClusterMessageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clusterId, userId, message }: { clusterId: string; userId: string; message: string }) =>
      sendClusterMessage(clusterId, userId, message),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clusterMessages", variables.clusterId] });
    },
  });
};

export const useVoteOnPollMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pollId, optionId, userId, clusterId }: { pollId: string; optionId: string; userId: string; clusterId: string }) =>
      voteOnPoll(pollId, optionId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clusterPolls", variables.clusterId] });
    },
  });
};
