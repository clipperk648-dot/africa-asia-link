import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAllOrders } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, ShoppingCart, Package, Calendar, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";

type SortOption = "newest" | "oldest" | "price-high" | "price-low" | "status";

interface Order {
  id: string;
  total?: number;
  status: string;
  created_at: string;
  product_id?: string;
  buyer_id?: string;
  seller_id?: string;
  productName?: string;
  product_name?: string;
  product_link?: string;
  quantity?: number;
  date?: string;
}

const AdminOrders = () => {
  const { data: orders = [], isLoading } = useAllOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    const filtered = (orders as Order[]).filter((order) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        String(order.id || "").toLowerCase().includes(searchLower) ||
        String(order.product_id || "").toLowerCase().includes(searchLower) ||
        String(order.productName || "").toLowerCase().includes(searchLower) ||
        String(order.buyer_id || "").toLowerCase().includes(searchLower);
      const matchesStatus = !statusFilter || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-high":
          return (b.total || 0) - (a.total || 0);
        case "price-low":
          return (a.total || 0) - (b.total || 0);
        case "oldest":
          return new Date(a.created_at || "").getTime() - new Date(b.created_at || "").getTime();
        case "status":
          return a.status.localeCompare(b.status);
        case "newest":
        default:
          return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
      }
    });

    setFilteredOrders(filtered);
  }, [searchTerm, sortBy, statusFilter, orders]);

  const statuses = Array.from(new Set((orders as Order[]).map((o) => o.status)));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "delivered":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "cancelled":
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "processing":
      case "shipped":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Pending Manual Purchase":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-white/5 text-muted-foreground border-white/10";
    }
  };

  return (
    <AdminLayout>
      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-background/50 border-white/10"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-white/10 hover:bg-white/5"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-white/10">
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  All Status
                </DropdownMenuItem>
                {statuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-40 h-10 bg-background/50 border-white/10">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <GlassCard className="p-12 text-center border-white/5">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-bold text-white">No orders found</h3>
          </GlassCard>
        ) : (
          <div className="grid gap-3">
            {filteredOrders.map((order) => (
              <GlassCard key={order.id} className="p-5 border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-base truncate">
                        {order.productName || order.product_name || `Order #${order.id.slice(0,8)}`}
                      </h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="w-3 h-3" /> {order.buyer_id || "Guest"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" /> {new Date(order.created_at || "").toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">QTY:</span> {order.quantity || 1}
                        </div>
                        {order.product_link && (
                          <div className="flex items-center gap-1.5">
                            <a 
                              href={order.product_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              Alibaba Link <ShoppingCart className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <p className="text-xl font-bold text-white tracking-tight">
                        ${(order.total || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5">Total Amount</p>
                    </div>
                    <span
                      className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-widest border ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default AdminOrders;
