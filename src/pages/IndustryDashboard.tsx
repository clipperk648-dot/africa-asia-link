import { useEffect, useState, Fragment, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { useProducts, useOrders } from "@/hooks/useData";
import type { Product } from "@/types/models";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { LogOut, TrendingUp, Package, DollarSign, Users, Settings, Bell, BarChart3, LineChart, Pencil, Wallet as WalletIcon, Bot, Menu, Box, Music2, Palette } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { APP_NAME } from "@/config/app";
import GlassSlideshowFrame from "@/components/GlassSlideshowFrame";
import { getSafeImageUrl, getSafeAvatarUrl, createImageErrorHandler } from "@/utils/imageOptimization";

const ProductCard = ({ product }: { product: Product }) => (
  <GlassCard className="p-4 sm:p-6 min-w-[280px] sm:min-w-0">
    <div className="flex gap-3 sm:gap-4">
      <img
        src={getSafeImageUrl(product.image)}
        alt={product.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
        loading="lazy"
        onError={createImageErrorHandler()}
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
        <p className="text-[11px] sm:text-xs text-cyan-300 truncate">{product.category}</p>
        <div className="flex items-center justify-between mt-2 gap-2">
          <p className="text-base sm:text-lg font-bold text-primary">¥{product.price.toLocaleString()}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-accent">★</span>
            <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Link to={`/industry/products/${product.id}/edit`} aria-label={`Edit ${product.name}`}>
            <Button variant="glass" size="xs" className="px-2">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          </Link>
          <Link to={`/industry/products/${product.id}/stats`} aria-label={`View stats for ${product.name}`}>
            <Button variant="outline" size="xs" className="px-2">
              <LineChart className="w-3.5 h-3.5" />
              Stats
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </GlassCard>
);

const IndustryDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [showBotTooltip, setShowBotTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState("Hi there!");

  const { data: products = [] } = useProducts(20, 0);
  const { data: orders = [] } = useOrders(user?.id);

  const ctaTexts = ["Hi there!", "Need help?", "Chat with us!", "Ask anything!", "We're here!"];
  let tooltipIndex = 0;

  const cycleBotTooltip = () => {
    setShowBotTooltip(true);
    setTooltipText(ctaTexts[tooltipIndex]);
    tooltipIndex = (tooltipIndex + 1) % ctaTexts.length;
    setTimeout(() => setShowBotTooltip(false), 2000);
  };

  useEffect(() => {
    if (!user || user.role !== "industry") {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(cycleBotTooltip, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Calculate stats from real data
  const stats = useMemo(() => {
    const activeOrders = Array.isArray(orders) ? orders.filter((o: any) => o.status === 'pending').length : 0;
    const totalRevenue = Array.isArray(orders) ? orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0) : 0;
    const uniqueBuyers = Array.isArray(orders) ? new Set(orders.map((o: any) => o.buyer_id)).size : 0;

    return [
      { label: "Total Products", value: String(Array.isArray(products) ? products.length : 0), icon: Package, color: "text-primary" },
      { label: "Active Orders", value: String(activeOrders), icon: TrendingUp, color: "text-secondary" },
      { label: "Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-accent" },
      { label: "Buyers", value: String(uniqueBuyers), icon: Users, color: "text-primary" },
    ];
  }, [products, orders]);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-sm bg-transparent border-b border-transparent sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 py-1">
          {/* Row 1: brand + menu */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary text-white rounded-md flex items-center justify-center font-bold text-sm">E</div>
              <span className="text-lg font-bold -ml-1">china</span>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-80 bg-background/20 backdrop-blur-xl border-l border-border/30">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-2xl">Menu</SheetTitle>
                </SheetHeader>
                <div className="space-y-4">
                  {/* Menu Items with Glass Morphism */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-widest px-3 mb-3">Navigation</h3>
                    <Link to="/profile" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer">
                        <span className="font-semibold text-xs group-hover:translate-x-1 transition-transform duration-300">Profile</span>
                      </div>
                    </Link>
                    <Link to="/industry/settings" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer">
                        <span className="font-semibold text-xs group-hover:translate-x-1 transition-transform duration-300">Settings</span>
                      </div>
                    </Link>
                    <Link to="/industry/collections" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-white/10 border border-white/20 group-hover:bg-white/20 transition-colors">
                          <Box className="w-3 h-3 text-primary" />
                        </div>
                        <span className="font-semibold text-xs group-hover:translate-x-1 transition-transform duration-300">Collections</span>
                      </div>
                    </Link>
                    <Link to="/industry/showroom" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-white/10 border border-white/20 group-hover:bg-white/20 transition-colors">
                          <Box className="w-3 h-3 text-primary" />
                        </div>
                        <span className="font-semibold text-xs group-hover:translate-x-1 transition-transform duration-300">Showroom</span>
                      </div>
                    </Link>
                    <Link to="/theme" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-white/10 border border-white/20 group-hover:bg-white/20 transition-colors">
                          <Palette className="w-3 h-3 text-primary" />
                        </div>
                        <span className="font-semibold text-xs group-hover:translate-x-1 transition-transform duration-300">Theme</span>
                      </div>
                    </Link>
                    <Link to="/wallet" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer">
                        <span className="font-semibold text-xs group-hover:translate-x-1 transition-transform duration-300">Wallet</span>
                      </div>
                    </Link>
                    <Link to="/invest" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer">
                        <span className="font-semibold text-xs group-hover:translate-x-1 transition-transform duration-300">Invest</span>
                      </div>
                    </Link>
                    <Link to="/notifications" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer">
                        <span className="font-semibold text-xs group-hover:translate-x-1 transition-transform duration-300">Notifications</span>
                      </div>
                    </Link>
                  </div>

                  {/* Social Platform Link */}
                  <div className="pt-3 border-t border-border/50">
                    <Link to="/social" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-white/10 border border-white/20 group-hover:bg-white/20 transition-colors">
                          <Music2 className="w-3 h-3 text-primary" />
                        </div>
                        <span className="font-semibold text-xs group-hover:translate-x-1 transition-transform duration-300">Social</span>
                      </div>
                    </Link>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-3 border-t border-border/50">
                    <button onClick={handleLogout} className="w-full p-3 rounded-lg bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/30 hover:border-red-500/50 hover:from-red-500/20 hover:via-red-500/15 transition-all duration-300 group cursor-pointer flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-red-500/20 border border-red-500/40 group-hover:bg-red-500/30 transition-colors">
                        <LogOut className="w-3 h-3 text-red-500" />
                      </div>
                      <span className="font-semibold text-xs text-red-500 group-hover:translate-x-1 transition-transform duration-300">Log Out</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Row 2: welcome + actions */}
          <div className="mt-2 flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-white">Welcome back, {user?.name ? user.name.split(' ')[0] : 'Seller'}!</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Link to="/notifications" aria-label="Open Notifications">
                  <Button variant="ghost" size="icon">
                    <Bell className="w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1 rounded-md">
                    <div className="h-8 w-8 rounded-full border-2 border-border/60 overflow-hidden flex items-center justify-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "user"}`} alt={user?.name || "Profile"} />
                        <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    </div>
                    <svg className="w-4 h-4 text-cyan-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-cyan-300">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>My Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/industry/settings')}>Account Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/notifications')}>Notifications</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/wallet" aria-label="Open Wallet">
                <Button variant="ghost" size="icon">
                  <WalletIcon className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Glass Slideshow Frame - Video Banner */}
        <GlassSlideshowFrame
          videoUrl="https://cdn.builder.io/o/assets%2Fb6198669f4754d65b52a472eb983bf6a%2Fa1f93e869b6f419eac1c318985a39a15?alt=media&token=d5e5b0b8-9d79-47e0-bc70-caa9377302de&apiKey=b6198669f4754d65b52a472eb983bf6a"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 animate-fade-in">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="text-center p-4">
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 ${stat.color}`} />
              <p className="text-base sm:text-lg font-bold">{stat.value}</p>
              <p className="text-[11px] sm:text-xs text-cyan-300">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold">Your Products</h2>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Link to="/analytics" aria-label="Open Analytics">
                <Button variant="outline" size="xs" className="gap-2 px-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </Button>
              </Link>
              <Link to="/industry/settings" aria-label="Open Settings">
                <Button variant="gradient" size="xs" className="gap-2 px-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Link>
              <Link to="/industry/products" aria-label="View all products">
                <Button variant="ghost" size="xs">View All</Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden -mx-4 px-4 pb-2 overflow-x-auto snap-x snap-mandatory flex gap-3">
            {products.map((p) => (
              <div key={p.id} className="snap-start shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          <div className="hidden md:grid md:grid-cols-2 gap-4">
            {products.map((p) => (
              <Fragment key={p.id}>
                <ProductCard product={p} />
              </Fragment>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold">Recent Orders</h2>
            <Link to="/industry/recent-activity" aria-label="View all orders">
              <Button variant="ghost" size="xs">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-cyan-300">No orders yet.</p>
              </GlassCard>
            ) : (
              orders.slice(0, 2).map((order) => (
                <GlassCard key={order.id} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-base sm:text-lg truncate">{order.productName}</p>
                      <p className="text-xs sm:text-sm text-cyan-300">Order #{order.id} • {order.date}</p>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-lg sm:text-xl">¥{order.total.toLocaleString()}</p>
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
              ))
            )}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold">Collections Showcase</h2>
            <Link to="/industry/collections" aria-label="View Collections">
              <Button variant="gradient" size="xs" className="gap-2 px-2">
                <Box className="w-4 h-4" />
                <span className="hidden sm:inline">Browse Collections</span>
              </Button>
            </Link>
          </div>
          <div className="relative group">
            <GlassSlideshowFrame
              videoUrl="https://cdn.builder.io/o/assets%2Fb9ea758a2cc9497892cc75159293dfe9%2Faeec48a736fb4540a3829ed6d6db3ba8?alt=media&token=e5e75d1e-e61c-4c3d-a86c-f63a1b7b5162&apiKey=b9ea758a2cc9497892cc75159293dfe9"
              heightClassName="h-48 sm:h-64 lg:h-72"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl">
              <Link to="/industry/collections">
                <Button className="gap-2 shadow-lg text-base">
                  <Box className="w-5 h-5" />
                  <span>Browse Collections</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-2 text-xs text-cyan-300 text-center">
          <span className="font-medium">Rates:</span> 1 USD ≈ $7.1 • 1 CNY ≈ $220
        </section>
      </main>

      <Link to="/support-chat" aria-label="Open Support Chat" className="fixed right-4 bottom-24 sm:bottom-28 z-50">
        <div className="relative">
          {showBotTooltip && (
            <div className="absolute right-14 bottom-1.5 bg-gradient-primary text-white text-xs px-2.5 py-1 rounded-lg shadow-lg animate-fade-in whitespace-nowrap">
              {tooltipText}
              <div className="absolute left-[-3px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-3 border-b-3 border-r-3 border-t-transparent border-b-transparent" style={{ borderRightColor: "hsl(var(--primary))" }}></div>
            </div>
          )}
          <Button
            size="icon"
            variant="gradient"
            className="rounded-full shadow-lg hover:scale-110 transition-transform h-12 w-12"
            onClick={(e) => {
              e.preventDefault();
              cycleBotTooltip();
              setTimeout(() => navigate("/support-chat"), 300);
            }}
          >
            <Bot className="w-5 h-5" />
          </Button>
        </div>
      </Link>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryDashboard;
