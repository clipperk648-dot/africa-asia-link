import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { mockProducts, mockOrders } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { LogOut, ShoppingCart, Clock, CheckCircle, TrendingUp } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

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
    { label: "Saved", value: "$78K", icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {user?.name}
            </h1>
            <p className="text-sm text-muted-foreground">Buyer Dashboard</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="text-center">
              <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Discover Products</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {mockProducts.map((product) => (
              <GlassCard key={product.id}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.company}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-accent">★</span>
                      <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{product.location}</p>
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-2xl font-bold text-primary">
                      ${product.price.toLocaleString()}
                    </p>
                    <Button variant="gradient" size="sm">
                      Inquire
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">My Orders</h2>
          <div className="space-y-3">
            {mockOrders.map((order) => (
              <GlassCard key={order.id}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-lg">{order.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.id} • Qty: {order.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-xl">${order.total.toLocaleString()}</p>
                    </div>
                    <span
                      className={`text-xs px-4 py-2 rounded-full font-medium whitespace-nowrap ${
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
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default BuyerDashboard;
