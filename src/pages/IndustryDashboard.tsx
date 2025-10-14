import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { mockProducts, mockOrders } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { LogOut, TrendingUp, Package, DollarSign, Users, Share2, Bell, BarChart3 } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Link } from "react-router-dom";

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
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {user?.name}
            </h1>
            <p className="text-sm text-muted-foreground">Industry Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/analytics" aria-label="Open Analytics" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-2 px-3">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </Button>
            </Link>
            <Link to="/social" aria-label="Open TradeSocial">
              <Button variant="gradient" size="sm" className="gap-2 px-3">
                <Share2 className="w-4 h-4" />
                <span>Social</span>
              </Button>
            </Link>
            <Link to="/notifications" aria-label="Open Notifications">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="text-center p-4">
              <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${stat.color}`} />
              <p className="text-lg sm:text-xl font-bold">{stat.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold">Your Products</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {mockProducts.map((product) => (
              <GlassCard key={product.id} className="p-4 sm:p-6">
                <div className="flex gap-3 sm:gap-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.category}</p>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <p className="text-lg sm:text-xl font-bold text-primary">
                        ¥{product.price.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-accent">★</span>
                        <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
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
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Order #{order.id} • {order.date}
                    </p>
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
