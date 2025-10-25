import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { useOrders } from "@/hooks/useData";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import GlassCard from "@/components/GlassCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortOption = "newest" | "oldest" | "price-high" | "price-low" | "status";

const IndustryRecentActivity = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { data: orders = [] } = useOrders(user?.id);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filteredOrders, setFilteredOrders] = useState(orders);

  useEffect(() => {
    if (!user || user.role !== "industry") {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    let filtered = orders.filter((order) => {
      const matchesSearch =
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm);
      const matchesStatus = !statusFilter || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-high":
          return b.total - a.total;
        case "price-low":
          return a.total - b.total;
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "status":
          return a.status.localeCompare(b.status);
        case "newest":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    setFilteredOrders(filtered);
  }, [searchTerm, sortBy, statusFilter]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const statuses = Array.from(new Set(mockOrders.map((o) => o.status)));

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/industry")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Recent Activity</h1>
          </div>

          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by product name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-background/50"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="glass"
                  size="icon"
                  className="h-11 w-11"
                  title="Filter by status"
                >
                  <Filter className="w-5 h-5" />
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="glass" size="sm" className="h-11 gap-2">
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setSortBy("newest")}
                  className={sortBy === "newest" ? "bg-accent" : ""}
                >
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("oldest")}
                  className={sortBy === "oldest" ? "bg-accent" : ""}
                >
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("price-high")}
                  className={sortBy === "price-high" ? "bg-accent" : ""}
                >
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("price-low")}
                  className={sortBy === "price-low" ? "bg-accent" : ""}
                >
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("status")}
                  className={sortBy === "status" ? "bg-accent" : ""}
                >
                  By Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                    {order.productName}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Order #{order.id} • {order.date}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-lg sm:text-xl">
                      ¥{order.total.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium whitespace-nowrap ${
                      order.status === "delivered"
                        ? "bg-secondary/20 text-secondary"
                        : order.status === "shipped"
                        ? "bg-primary/20 text-primary"
                        : "bg-accent/20 text-accent"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </GlassCard>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-lg font-semibold text-muted-foreground">
              No orders found
            </p>
            <p className="text-sm text-muted-foreground/60">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryRecentActivity;
