import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { mockProducts, mockOrders } from "@/utils/mockData";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
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
  const orders = useMemo(() => mockOrders.filter((o) => (product ? o.productName === product.name : false)), [product]);

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalOrders = orders.length;

  const revenueByMonth = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const d = new Date(o.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + (o.total || 0));
    });
    return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0])).map(([month, revenue]) => ({ month, revenue }));
  }, [orders]);

  const qtyByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [orders]);

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

            <GlassCard className="p-4">
              <h3 className="font-semibold mb-3">Revenue Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByMonth} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorProductRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#colorProductRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <h3 className="font-semibold mb-3">Orders by Status</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={qtyByStatus} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
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
