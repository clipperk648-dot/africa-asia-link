import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAllOrders } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
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
  quantity?: number;
  date?: string;
}

const AdminOrders = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: orders = [] } = useAllOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    let filtered = (orders as Order[]).filter((order) => {
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
        return "bg-green-500/20 text-green-500";
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "cancelled":
      case "failed":
        return "bg-red-500/20 text-red-500";
      case "processing":
      case "shipped":
        return "bg-blue-500/20 text-blue-500";
      default:
        return "bg-gray-500/20 text-gray-500";
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">All Orders</h1>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 bg-background/50"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                  title="Filter by status"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setStatusFilter(null)}
                  className={!statusFilter ? "bg-accent" : ""}
                >
                  All Status
                </DropdownMenuItem>
                {statuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? "bg-accent" : ""}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-32 h-10">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <GlassCard key={order.id} className="p-4 sm:p-6 transition-all hover:shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-base sm:text-lg truncate">
                    Order #{order.id}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground mt-1">
                    <span>Qty: {order.quantity || 1}</span>
                    <span>Buyer: {order.buyer_id || "N/A"}</span>
                    <span>{new Date(order.created_at || "").toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-lg sm:text-xl">
                      ${(order.total || 0).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium whitespace-nowrap ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-semibold text-muted-foreground">No orders found</p>
            <p className="text-sm text-muted-foreground/60">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      <FooterNav dashboardType="admin" />
    </div>
  );
};

export default AdminOrders;
