import { useMemo } from "react";
import { mockProducts, mockOrders } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const navigate = useNavigate();
  const totals = useMemo(() => {
    const totalProducts = mockProducts.length;
    const totalOrders = mockOrders.length;
    const totalRevenue = mockOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const avgRating = mockProducts.reduce((a, p) => a + (p.rating || 0), 0) / (totalProducts || 1);
    return { totalProducts, totalOrders, totalRevenue, avgRating: Number(avgRating.toFixed(2)) };
  }, []);

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
            <h1 className="text-xl font-bold">Analytics</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <GlassCard className="text-center p-4"><p className="text-xs text-muted-foreground">Products</p><p className="text-xl font-bold text-primary">{totals.totalProducts}</p></GlassCard>
          <GlassCard className="text-center p-4"><p className="text-xs text-muted-foreground">Orders</p><p className="text-xl font-bold text-primary">{totals.totalOrders}</p></GlassCard>
          <GlassCard className="text-center p-4"><p className="text-xs text-muted-foreground">Revenue</p><p className="text-xl font-bold text-primary">${totals.totalRevenue.toLocaleString()}</p></GlassCard>
          <GlassCard className="text-center p-4"><p className="text-xs text-muted-foreground">Avg Rating</p><p className="text-xl font-bold text-primary">{totals.avgRating}</p></GlassCard>
        </div>

        <GlassCard className="p-4">
          <div className="flex flex-wrap gap-2">
            {mockProducts.slice(0, 8).map((p) => (
              <Button key={p.id} variant="outline" size="sm" onClick={() => navigate(`/industry/products/${p.id}/stats`)}>
                {p.name}
              </Button>
            ))}
          </div>
        </GlassCard>
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default Analytics;
