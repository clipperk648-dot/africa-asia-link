import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { mockProducts, mockOrders } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { LogOut, ShoppingCart, Clock, CheckCircle, TrendingUp, Share2, Bell, BarChart3 } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import RateButton from "@/components/RateButton";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== "buyer") {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = [
    { label: "Active Orders", value: "8", icon: ShoppingCart, color: "text-primary" },
    { label: "Pending", value: "3", icon: Clock, color: "text-accent" },
    { label: "Completed", value: "45", icon: CheckCircle, color: "text-secondary" },
    { label: "Saved", value: "₦78K", icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              {user?.name}
            </h1>
            <p className="text-xs text-muted-foreground">Buyer Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/notifications" aria-label="Open Notifications">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/profile" aria-label="Open Profile">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`} alt={user?.name || 'Profile'} />
                <AvatarFallback>{(user?.name?.[0] || 'U')}</AvatarFallback>
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
            <h2 className="text-base sm:text-lg font-bold">Discover Products</h2>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Link to="/buyer/analytics" aria-label="Open Insights">
                <Button variant="outline" size="sm" className="gap-2 px-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Insights</span>
                </Button>
              </Link>
              <Link to="/social" aria-label="Open TradeSocial">
                <Button variant="gradient" size="sm" className="gap-2 px-2">
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Social</span>
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {mockProducts.map((product) => (
              <GlassCard key={product.id} className="p-4 sm:p-6">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 sm:h-48 object-cover rounded-lg mb-4"
                />
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.company}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-accent">★</span>
                      <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.location}</p>
                  <div className="flex items-center justify-between pt-2 gap-2">
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      ₦{product.price.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <RateButton productId={product.id} productName={product.name} />
                      <Button variant="gradient" size="sm" className="flex-shrink-0" onClick={() => navigate(`/messages?product=${product.id}`)}>
                        Inquire
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold">My Orders</h2>
          <div className="space-y-3">
            {mockOrders.map((order) => (
              <GlassCard key={order.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-base sm:text-lg truncate">{order.productName}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Order #{order.id} • Qty: {order.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-lg sm:text-xl">₦{order.total.toLocaleString()}</p>
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
          <span className="font-medium">Rates:</span> 1 USD ≈ ₦1,600 • 1 CNY ≈ ₦220
        </section>
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default BuyerDashboard;
