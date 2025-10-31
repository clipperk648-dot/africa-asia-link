import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { useOrders } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import FooterNav from "@/components/FooterNav";

const BuyerOrders = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { data: orders = [] } = useOrders(user?.id);

  useEffect(() => {
    if (!user || user.role !== "buyer") {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      {/* Header */}
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/buyer")}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">All Orders</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <section className="space-y-4">
          {orders.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No orders yet. Start shopping!</p>
              <Button variant="gradient" onClick={() => navigate("/buyer/products")}>
                Browse Products
              </Button>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
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
                        <p className="font-bold text-lg sm:text-xl">${order.total.toLocaleString()}</p>
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
          )}
        </section>
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default BuyerOrders;
