import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { mockProducts, mockOrders } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, PencilLine } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

const IndustryProductStats = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== "industry") navigate("/login");
  }, [user, navigate]);

  const product = useMemo(() => mockProducts.find((p) => String(p.id) === id), [id]);
  const orders = useMemo(() => mockOrders.filter((o) => String(o.productId || "") === id), [id]);

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalOrders = orders.length;

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <h1 className="text-xl font-bold">Product Stats</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {!product ? (
          <GlassCard className="p-4">Product not found.</GlassCard>
        ) : (
          <>
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-lg sm:text-xl font-bold">{product.name}</h2>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => navigate(`/industry/products/${product.id}/edit`)}>
                    <PencilLine className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{product.category} • {product.location}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
                <GlassCard className="p-3 text-center"><p className="text-xs text-muted-foreground">Price</p><p className="text-xl font-bold text-primary">${product.price.toLocaleString()}</p></GlassCard>
                <GlassCard className="p-3 text-center"><p className="text-xs text-muted-foreground">Rating</p><p className="text-xl font-bold text-primary">{product.rating}</p></GlassCard>
                <GlassCard className="p-3 text-center"><p className="text-xs text-muted-foreground">Orders</p><p className="text-xl font-bold text-primary">{totalOrders}</p></GlassCard>
                <GlassCard className="p-3 text-center"><p className="text-xs text-muted-foreground">Revenue</p><p className="text-xl font-bold text-primary">${totalRevenue.toLocaleString()}</p></GlassCard>
              </div>
            </GlassCard>
          </>
        )}
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryProductStats;
