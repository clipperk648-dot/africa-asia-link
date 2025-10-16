import { useEffect, Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { mockProducts, mockOrders, type Product } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { LogOut, TrendingUp, Package, DollarSign, Users, Music2, Bell, BarChart3, LineChart, Pencil } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ProductCard = ({ product }: { product: Product }) => (
  <GlassCard className="p-4 sm:p-6 min-w-[280px] sm:min-w-0">
    <div className="flex gap-3 sm:gap-4">
      <img
        src={product.image}
        alt={product.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{product.category}</p>
        <div className="flex items-center justify-between mt-2 gap-2">
          <p className="text-base sm:text-lg font-bold text-primary">¥{product.price.toLocaleString()}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-accent">★</span>
            <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Link to={`/industry/products/${product.id}/edit`} aria-label={`Edit ${product.name}`}>
            <Button variant="glass" size="xs" className="px-2">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          </Link>
          <Link to={`/industry/products/${product.id}/stats`} aria-label={`View stats for ${product.name}`}>
            <Button variant="outline" size="xs" className="px-2">
              <LineChart className="w-3.5 h-3.5" />
              Stats
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </GlassCard>
);

const IndustryDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== "industry") {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = [
    { label: "Total Products", value: "24", icon: Package, color: "text-primary" },
    { label: "Active Orders", value: "18", icon: TrendingUp, color: "text-secondary" },
    { label: "Revenue", value: "¥450K", icon: DollarSign, color: "text-accent" },
    { label: "Buyers", value: "156", icon: Users, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">{user?.name}</h1>
            <p className="text-xs text-muted-foreground">Industry Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/notifications" aria-label="Open Notifications">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/profile" aria-label="Open Profile">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "user"}`} alt={user?.name || "Profile"} />
                <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 animate-fade-in">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="text-center p-4">
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 ${stat.color}`} />
              <p className="text-base sm:text-lg font-bold">{stat.value}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold">Your Products</h2>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Link to="/analytics" aria-label="Open Analytics">
                <Button variant="outline" size="xs" className="gap-2 px-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </Button>
              </Link>
              <Link to="/social" aria-label="Open TradeSocial">
                <Button variant="gradient" size="xs" className="gap-2 px-2">
                  <Music2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Social</span>
                </Button>
              </Link>
              <Link to="/industry/products" aria-label="View all products">
                <Button variant="ghost" size="xs">View All</Button>
              </Link>
              <Link to="/notifications" aria-label="Open Notifications">
                <Button variant="ghost" size="icon">
                  <Bell className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden -mx-4 px-4 pb-2 overflow-x-auto snap-x snap-mandatory flex gap-3">
            {mockProducts.map((p) => (
              <div key={p.id} className="snap-start shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          <div className="hidden md:grid md:grid-cols-2 gap-4">
            {mockProducts.map((p) => (
              <Fragment key={p.id}>
                <ProductCard product={p} />
              </Fragment>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold">Recent Orders</h2>
          <div className="space-y-3">
            {mockOrders.map((order) => (
              <GlassCard key={order.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-base sm:text-lg truncate">{order.productName}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Order #{order.id} • {order.date}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-lg sm:text-xl">¥{order.total.toLocaleString()}</p>
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
            ))}
          </div>
        </section>

        <section className="pt-2 pb-4 text-xs text-muted-foreground text-center">
          <span className="font-medium">Rates:</span> 1 USD ≈ ¥7.1 • 1 CNY ≈ ₦220
        </section>
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryDashboard;
