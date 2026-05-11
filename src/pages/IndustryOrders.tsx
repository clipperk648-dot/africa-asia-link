
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrders, useUpdateProductMutation } from "@/hooks/useData";
import type { Order } from "@/types/models";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, ShoppingBag, Calendar, User as UserIcon, CheckCircle, Clock, Truck } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type SortOption = "newest" | "oldest" | "total-high" | "total-low" | "status";

const IndustryOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: orders = [], isLoading, refetch } = useOrders(user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!user || (user.role !== "industry" && user.role !== "sourcing-agent")) {
      navigate("/login");
    }
  }, [user, navigate]);

  const filteredOrders = useMemo(() => {
    const filtered = (orders as Order[]).filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        String(order.id || "").toLowerCase().includes(searchLower) ||
        String(order.productName || (order as any).product_name || "").toLowerCase().includes(searchLower) ||
        String(order.buyer_id || "").toLowerCase().includes(searchLower);
      const matchesStatus = !statusFilter || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "total-high":
          return (b.total || 0) - (a.total || 0);
        case "total-low":
          return (a.total || 0) - (b.total || 0);
        case "oldest":
          return new Date(a.created_at || a.date || "").getTime() - new Date(b.created_at || b.date || "").getTime();
        case "status":
          return a.status.localeCompare(b.status);
        case "newest":
        default:
          return new Date(b.created_at || b.date || "").getTime() - new Date(a.created_at || a.date || "").getTime();
      }
    });

    return filtered;
  }, [searchTerm, sortBy, statusFilter, orders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Order status updated to ${newStatus}`);
      refetch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "shipped":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-white/5 text-muted-foreground border-white/10";
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/industry")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Manage Orders</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-background/50"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="h-10 bg-background/50 border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 bg-background/50 border border-input rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="total-high">Price: High to Low</option>
                <option value="total-low">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-bold">No orders found</h3>
            <p className="text-muted-foreground">When buyers purchase your products, they will appear here.</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <GlassCard key={order.id} className="p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg truncate">
                        {order.productName || order.product_name || `Order #${order.id.slice(0, 8)}`}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <UserIcon className="w-3 h-3" /> {order.buyer_id || "Guest Buyer"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(order.created_at || order.date || "").toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold">Qty:</span> {order.quantity || 1}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-xl font-bold">
                        ¥{(order.total || 0).toLocaleString()}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      {order.status === "pending" && (
                        <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "shipped")} className="h-8 gap-1">
                          <Truck className="w-3 h-3" /> Mark Shipped
                        </Button>
                      )}
                      {order.status === "shipped" && (
                        <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "delivered")} className="h-8 gap-1">
                          <CheckCircle className="w-3 h-3" /> Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      <FooterNav dashboardType={user?.role as "industry" | "sourcing-agent"} />
    </div>
  );
};

export default IndustryOrders;
