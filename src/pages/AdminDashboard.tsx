import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { useProducts, useOrders, useAllUsers } from "@/hooks/useData";
import type { Product } from "@/types/models";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { 
  LogOut, TrendingUp, Package, DollarSign, Users, Settings, 
  Bell, BarChart3, LineChart, Pencil, Bot, Menu, Box, 
  LayoutDashboard, ShoppingCart, User as UserIcon, HelpCircle,
  Truck, ShieldCheck, Search, Plus
} from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getSafeImageUrl, createImageErrorHandler } from "@/utils/imageOptimization";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [showBotTooltip, setShowBotTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState("Hi there!");

  const { data: products = [] } = useProducts(20, 0);
  const { data: orders = [] } = useOrders(user?.id);
  const { data: users = [] } = useAllUsers();

  const ctaTexts = useMemo(() => [
    "Manage clusters here 👋",
    "New orders pending 📦",
    "User activity updated 👥",
  ], []);

  const tooltipIndexRef = useRef(0);

  const cycleBotTooltip = useCallback(() => {
    setShowBotTooltip(true);
    setTooltipText(ctaTexts[tooltipIndexRef.current]);
    tooltipIndexRef.current = (tooltipIndexRef.current + 1) % ctaTexts.length;
    setTimeout(() => setShowBotTooltip(false), 3000);
  }, [ctaTexts]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(cycleBotTooltip, 8000);
    return () => clearInterval(interval);
  }, [cycleBotTooltip]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = useMemo(() => {
    const activeOrders = Array.isArray(orders) ? orders.filter((o) => o.status === 'pending').length : 0;
    const totalRevenue = Array.isArray(orders) ? orders.reduce((sum: number, o) => sum + (o.total || 0), 0) : 0;
    const totalUsers = Array.isArray(users) ? users.length : 0;

    return [
      { label: "Products", value: String(Array.isArray(products) ? products.length : 0), icon: Package, color: "text-blue-400" },
      { label: "Active Orders", value: String(activeOrders), icon: ShoppingCart, color: "text-emerald-400" },
      { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-400" },
      { label: "Total Users", value: String(totalUsers), icon: Users, color: "text-purple-400" },
    ];
  }, [products, orders, users]);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Users", icon: Users, path: "/admin/users" },
    { label: "Products", icon: Package, path: "/admin/products" },
    { label: "Clusters", icon: Truck, path: "/admin/clusters" },
    { label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { label: "Analytics", icon: BarChart3, path: "/analytics" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden">
      <ThreeBackground />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/30 backdrop-blur-xl z-50">
        <div className="p-6 flex items-center gap-2">
          <div className="h-8 w-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">E</div>
          <span className="text-xl font-bold tracking-tight text-white">china Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-all duration-200 group">
                <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 mb-4">
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary">
                <UserIcon className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10">
        {/* Header - Mobile */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card/30 backdrop-blur-xl border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">E</div>
            <span className="text-lg font-bold text-white">china</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-background/90 backdrop-blur-2xl">
              <SheetHeader className="text-left mb-6">
                <SheetTitle>Admin Menu</SheetTitle>
              </SheetHeader>
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <item.icon className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{item.label}</span>
                    </div>
                  </Link>
                ))}
                <div className="pt-4 mt-4 border-t border-border/50">
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        {/* Top bar desktop */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-border/50 bg-card/10">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest opacity-70">Control Panel</h2>
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </Link>
            <div className="h-8 w-px bg-border/50"></div>
            <Link to="/admin/settings" className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome & Quick Action */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Overview of your trade link operations.</p>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/products/add">
                <Button className="rounded-full shadow-lg shadow-primary/20 gap-2">
                  <Plus className="w-4 h-4" /> Add Product
                </Button>
              </Link>
              <Link to="/admin/clusters">
                <Button variant="outline" className="rounded-full gap-2">
                  <Truck className="w-4 h-4" /> Manage Clusters
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <GlassCard key={i} className="p-6 border-white/5 hover:border-white/20 transition-all duration-300 group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <stat.icon size={100} />
                </div>
                <div className="relative z-10 flex flex-col">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</span>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-white tracking-tighter">{stat.value}</span>
                    <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
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
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-primary" /> Recent Orders
                </h3>
                <Link to="/admin/orders">
                  <Button variant="link" className="text-primary text-xs uppercase font-bold tracking-widest">View All</Button>
                </Link>
              </div>
              
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <GlassCard className="p-12 text-center text-muted-foreground">No orders yet.</GlassCard>
                ) : (
                  orders.slice(0, 5).map((order) => (
                    <GlassCard key={order.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{order.productName || `Order #${order.id.slice(0,8)}`}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Order ID: {order.id.slice(0,16)}...</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <div className="hidden sm:block">
                          <p className="text-sm font-bold text-white">${order.total?.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
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
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                   Quick Controls
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/admin/products/add" className="block">
                    <GlassCard className="p-4 text-center hover:bg-primary/10 transition-colors border-white/5 hover:border-primary/20 cursor-pointer">
                      <Plus className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <span className="text-xs font-bold text-white uppercase tracking-tighter">New Product</span>
                    </GlassCard>
                  </Link>
                  <Link to="/admin/clusters" className="block">
                    <GlassCard className="p-4 text-center hover:bg-secondary/10 transition-colors border-white/5 hover:border-secondary/20 cursor-pointer">
                      <Truck className="w-6 h-6 mx-auto mb-2 text-secondary" />
                      <span className="text-xs font-bold text-white uppercase tracking-tighter">Clusters</span>
                    </GlassCard>
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" /> Recent Users
                  </h3>
                  <Link to="/admin/users">
                    <Button variant="link" className="text-purple-400 text-xs uppercase font-bold tracking-widest">View All</Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {users.slice(0, 4).map((u) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarFallback className="bg-purple-500/10 text-purple-400">
                          <UserIcon className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate">{u.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate uppercase font-medium tracking-wider">{u.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-auto p-8 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TradeLink Admin. All rights reserved.</p>
        </footer>
      </div>

      {/* Bot Chat Access */}
      <Link to="/support-chat" className="fixed right-6 bottom-6 z-[100]">
        <div className="relative group">
          {showBotTooltip && (
            <div className="absolute right-16 bottom-2 bg-primary text-white text-xs px-3 py-1.5 rounded-xl shadow-xl animate-in fade-in slide-in-from-right-2 whitespace-nowrap font-medium">
              {tooltipText}
            </div>
          )}
          <Button
            size="icon"
            className="rounded-full shadow-2xl h-14 w-14 hover:scale-110 transition-transform bg-primary"
            onClick={(e) => {
              e.preventDefault();
              cycleBotTooltip();
              setTimeout(() => navigate("/support-chat"), 300);
            }}
          >
            <Bot className="w-6 h-6" />
          </Button>
        </div>
      </Link>
    </div>
  );
};

export default AdminDashboard;
