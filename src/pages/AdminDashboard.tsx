import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts, useOrders, useAllUsers } from "@/hooks/useData";
import type { Product, Order, User } from "@/types/models";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { 
  Package, DollarSign, Users, Plus, Truck, ShoppingCart, User as UserIcon
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const AdminDashboard = () => {
  const { data: products = [] } = useProducts(20, 0);
  const { data: orders = [] } = useOrders('admin'); 
  const { data: users = [] } = useAllUsers();

  const stats = useMemo(() => {
    const ordersList = orders as Order[];
    const productsList = products as Product[];
    const activeOrders = Array.isArray(ordersList) ? ordersList.filter((o) => o.status === 'pending').length : 0;
    const totalRevenue = Array.isArray(ordersList) ? ordersList.reduce((sum, o) => sum + (o.total || 0), 0) : 0;
    const totalUsers = Array.isArray(users) ? users.length : 0;

    return [
      { label: "Products", value: String(Array.isArray(productsList) ? productsList.length : 0), icon: Package, color: "text-blue-400" },
      { label: "Active Orders", value: String(activeOrders), icon: ShoppingCart, color: "text-emerald-400" },
      { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-400" },
      { label: "Total Users", value: String(totalUsers), icon: Users, color: "text-purple-400" },
    ];
  }, [products, orders, users]);

  return (
    <AdminLayout>
      <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Welcome & Quick Action */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Real-time overview of your trade operations.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/products/add">
              <Button className="rounded-full shadow-lg shadow-primary/20 gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            </Link>
            <Link to="/admin/clusters">
              <Button variant="outline" className="rounded-full gap-2 border-white/10 hover:bg-white/5">
                <Truck className="w-4 h-4" /> Manage Clusters
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="p-6 border-white/5 hover:border-white/10 transition-all duration-300 group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={100} />
              </div>
              <div className="relative z-10 flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</span>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold text-white tracking-tight">{stat.value}</span>
                  <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" /> Recent Orders
              </h3>
              <Link to="/admin/orders">
                <Button variant="link" className="text-primary text-xs uppercase font-bold tracking-widest p-0 h-auto">View All</Button>
              </Link>
            </div>
            
            <div className="space-y-3">
              {orders.length === 0 ? (
                <GlassCard className="p-12 text-center text-muted-foreground text-sm">No orders yet.</GlassCard>
              ) : (
                (orders as Order[]).slice(0, 5).map((order) => (
                  <GlassCard key={order.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate">{order.productName || `Order #${order.id.slice(0,8)}`}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Order ID: {order.id.slice(0,16)}...</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div className="hidden sm:block">
                        <p className="text-sm font-bold text-white">${order.total?.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(order.created_at || '').toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions & Recent Users */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                 Quick Controls
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/admin/products/add" className="block">
                  <GlassCard className="p-4 text-center hover:bg-primary/10 transition-colors border-white/5 hover:border-primary/20 cursor-pointer">
                    <Plus className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">New Product</span>
                  </GlassCard>
                </Link>
                <Link to="/admin/clusters" className="block">
                  <GlassCard className="p-4 text-center hover:bg-secondary/10 transition-colors border-white/5 hover:border-secondary/20 cursor-pointer">
                    <Truck className="w-6 h-6 mx-auto mb-2 text-secondary" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Clusters</span>
                  </GlassCard>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" /> Recent Users
                </h3>
                <Link to="/admin/users">
                  <Button variant="link" className="text-purple-400 text-xs uppercase font-bold tracking-widest p-0 h-auto">View All</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {(users as User[]).slice(0, 4).map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <Avatar className="h-8 w-8 border border-white/10">
                      <AvatarFallback className="bg-purple-500/10 text-purple-400 text-[10px]">
                        <UserIcon className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{u.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate uppercase font-medium tracking-wider">{u.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminDashboard;
