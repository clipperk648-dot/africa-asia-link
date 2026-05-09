import { useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useProduct, useOrders } from "@/hooks/useData";
import type { Product, Order } from "@/types/models";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, PencilLine, DollarSign, ShoppingCart, Star, Package } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

const AdminProductStats = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: product } = useProduct(id!);
  const { data: allOrders = [] } = useOrders('admin'); 
  const orders = useMemo(() => (allOrders as Order[]).filter((o) => String(o.product_id || (o as any).productId) === String(id)), [allOrders, id]);

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalOrders = orders.length;

  const revenueByMonth = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o) => {
      const d = new Date(o.created_at || (o as any).date);
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

  const p = product as Product;

  return (
    <AdminLayout>
      <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
        {!product ? (
          <GlassCard className="p-12 text-center border-white/5 text-muted-foreground">Product not found.</GlassCard>
        ) : (
          <>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="rounded-full border-white/10" onClick={() => navigate(-1)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">{p.name}</h1>
                  <p className="text-muted-foreground mt-1 text-sm">{p.category} • {p.company}</p>
                </div>
              </div>
              <Link to={`/admin/products/${p.id}/edit`}>
                <Button className="rounded-full gap-2 shadow-lg shadow-primary/20">
                  <PencilLine className="w-4 h-4" /> Edit Product
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                { label: "Price", value: `$${p.price.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
                { label: "Rating", value: p.rating || 0, icon: Star, color: "text-amber-400" },
                { label: "Total Orders", value: totalOrders, icon: ShoppingCart, color: "text-blue-400" },
                { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: Package, color: "text-purple-400" },
              ].map((stat, i) => (
                <GlassCard key={i} className="p-6 border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-1.5 rounded-lg bg-white/5 ${stat.color}`}>
                      <stat.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </GlassCard>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard className="p-6 border-white/5 flex flex-col h-[400px]">
                <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Revenue Over Time
                </h3>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueByMonth}>
                      <defs>
                        <linearGradient id="colorProdRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="month" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProdRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <GlassCard className="p-6 border-white/5 flex flex-col h-[400px]">
                <h3 className="text-lg font-bold text-white mb-8">Orders by Status</h3>
                <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={qtyByStatus}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="status" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                      />
                      <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </main>
    </AdminLayout>
  );
};

export default AdminProductStats;
