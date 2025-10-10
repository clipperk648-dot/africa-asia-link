import { useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { mockOrders, mockProducts } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, PieChart as PieChartIcon, TrendingUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#6366F1", "#06B6D4", "#F59E0B", "#EF4444", "#10B981", "#8B5CF6", "#EC4899"];

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const IndustryAnalytics = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const query = useQuery();
  const productId = query.get("productId");
  const focusedProduct = mockProducts.find((p) => p.id === productId) || null;

  useEffect(() => {
    if (!user || user.role !== "industry") navigate("/login");
  }, [user, navigate]);

  // Orders over time (by date)
  const ordersOverTime = useMemo(() => {
    const map = new Map<string, number>();
    mockOrders.forEach((o) => {
      map.set(o.date, (map.get(o.date) || 0) + o.total);
    });
    const data = Array.from(map.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
    return data;
  }, []);

  // Revenue by product
  const revenueByProduct = useMemo(() => {
    const map = new Map<string, number>();
    mockOrders.forEach((o) => {
      map.set(o.productName, (map.get(o.productName) || 0) + o.total);
    });
    const data = Array.from(map.entries()).map(([name, revenue]) => ({ name, revenue }));
    // If focusing on a single product, filter to just that product
    return focusedProduct ? data.filter((d) => d.name === focusedProduct.name) : data;
  }, [focusedProduct]);

  // Category breakdown (count of products by category)
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    mockProducts.forEach((p) => {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, []);

  // KPI cards
  const kpis = useMemo(() => {
    const totalRevenue = ordersOverTime.reduce((sum, d) => sum + d.total, 0);
    const totalOrders = mockOrders.length;
    const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;

    const forProduct = focusedProduct
      ? mockOrders.filter((o) => o.productName === focusedProduct.name)
      : mockOrders;

    const productRevenue = forProduct.reduce((sum, o) => sum + o.total, 0);

    return [
      { label: focusedProduct ? "Product Revenue" : "Total Revenue", value: `¥${productRevenue.toLocaleString()}`, Icon: TrendingUp },
      { label: "Orders", value: `${forProduct.length}`, Icon: BarChart3 },
      { label: "Avg Order Value", value: `¥${avgOrder.toLocaleString()}`, Icon: PieChartIcon },
    ];
  }, [ordersOverTime, focusedProduct]);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">{focusedProduct ? `${focusedProduct.name} Analytics` : "Products Analytics"}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {kpis.map(({ label, value, Icon }, idx) => (
            <GlassCard key={idx} className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
                  <p className="text-lg sm:text-xl font-bold">{value}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Revenue Over Time</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordersOverTime}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Revenue by Product</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByProduct}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `¥${v.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </section>

        <section>
          <GlassCard className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Category Breakdown</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" outerRadius={90} label>
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </section>
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryAnalytics;
