import { useEffect, useState, Fragment, useMemo, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { useProducts, useOrders } from "@/hooks/useData";
import type { Product } from "@/types/models";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { LogOut, TrendingUp, Package, DollarSign, Users, Settings, Bell, BarChart3, LineChart, Pencil, Wallet as WalletIcon, Bot, Menu, Box, Music2, Palette, ChevronLeft, ChevronRight } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { getSafeImageUrl, getSafeAvatarUrl, createImageErrorHandler } from "@/utils/imageOptimization";

const ProductCard = ({ product }: { product: Product }) => (
  <GlassCard className="p-2 sm:p-3 min-w-[280px] sm:min-w-0">
    <div className="flex gap-2 sm:gap-3">
      <img
        src={getSafeImageUrl(product.image)}
        alt={product.name}
        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
        loading="lazy"
        onError={createImageErrorHandler()}
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-xs sm:text-sm truncate">{product.name}</h3>
        <p className="text-[10px] sm:text-xs text-cyan-300 truncate">{product.category}</p>
        <div className="flex items-center justify-between mt-1 gap-2">
          <p className="text-sm sm:text-base font-bold text-primary">${product.price.toLocaleString()}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-accent">★</span>
            <span className="text-[10px] sm:text-xs font-medium">{product.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Link to={`/admin/products/${product.id}/edit`} aria-label={`Edit ${product.name}`}>
            <Button variant="glass" size="xs" className="px-2">
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Button>
          </Link>
          <Link to={`/admin/products/${product.id}/stats`} aria-label={`View stats for ${product.name}`}>
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [showBotTooltip, setShowBotTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState("Hi there!");

  const { data: products = [] } = useProducts(20, 0);
  const { data: orders = [] } = useOrders(user?.id);

  // Collection slideshow state
  const [currentCollectionSlide, setCurrentCollectionSlide] = useState(0);

  const collections = useMemo(() => [
    {
      id: "admin_collection_1",
      title: "Featured Products",
      videoUrl: "https://cdn.builder.io/o/assets%2F7afe82ec80e94b858c506425dab51b31%2F0c96833d8ac746ba8f8470e123ec57ad?alt=media&token=8a70877c-77a0-4213-8746-6ef633920336&apiKey=7afe82ec80e94b858c506425dab51b31",
    },
    {
      id: "admin_collection_2",
      title: "New Arrivals",
      videoUrl: "https://cdn.builder.io/o/assets%2F7afe82ec80e94b858c506425dab51b31%2Fccdd0f1ff47e4a4b8ae298baaa00d7b7?alt=media&token=9e96055e-e92d-46c9-867e-6c60173a0368&apiKey=7afe82ec80e94b858c506425dab51b31",
    },
    {
      id: "admin_collection_3",
      title: "Best Sellers",
      videoUrl: "https://cdn.builder.io/o/assets%2F7afe82ec80e94b858c506425dab51b31%2F5dd74dacbecf494da443c829c72a582a?alt=media&token=001f7917-e224-4ee3-a9ab-45a5f7e4206b&apiKey=7afe82ec80e94b858c506425dab51b31",
    },
    {
      id: "admin_collection_4",
      title: "Trending Now",
      videoUrl: "https://cdn.builder.io/o/assets%2F7afe82ec80e94b858c506425dab51b31%2F5a9580b4a2f84dfda83978faceed0619?alt=media&token=6cb3868d-5c56-4159-96bd-78602c3edd9d&apiKey=7afe82ec80e94b858c506425dab51b31",
    },
  ], []);

  const ctaTexts = [
    "Hi there! 👋",
    "Need help? I'm here!",
    "Managing clusters? Let's go!",
    "Check out new orders 📦",
    "Review user activity 👥",
  ];

  const tooltipIndexRef = useRef(0);
  const collectionVideoRef = useRef<HTMLVideoElement>(null);

  const cycleBotTooltip = useCallback(() => {
    setShowBotTooltip(true);
    setTooltipText(ctaTexts[tooltipIndexRef.current]);
    tooltipIndexRef.current = (tooltipIndexRef.current + 1) % ctaTexts.length;
    setTimeout(() => setShowBotTooltip(false), 2000);
  }, [ctaTexts]);

  const nextCollection = useCallback(() => {
    setCurrentCollectionSlide((prev) => (prev + 1) % collections.length);
  }, [collections.length]);

  const prevCollection = useCallback(() => {
    setCurrentCollectionSlide((prev) => (prev - 1 + collections.length) % collections.length);
  }, [collections.length]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(cycleBotTooltip, 5000);
    return () => clearInterval(interval);
  }, [cycleBotTooltip]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = useMemo(() => {
    const activeOrders = Array.isArray(orders) ? orders.filter((o: { status: string }) => o.status === 'pending').length : 0;
    const totalRevenue = Array.isArray(orders) ? orders.reduce((sum: number, o: { total?: number }) => sum + (o.total || 0), 0) : 0;
    const uniqueBuyers = Array.isArray(orders) ? new Set(orders.map((o: { buyer_id?: string }) => o.buyer_id)).size : 0;

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
        <div className="max-w-7xl mx-auto px-3 py-0.5">
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
                  <SheetTitle className="text-2xl">Admin Menu</SheetTitle>
                </SheetHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-widest px-3 mb-3">Navigation</h3>
                    <Link to="/admin/users" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-xs text-white group-hover:translate-x-1 transition-transform duration-300">User Management</span>
                      </div>
                    </Link>
                    <Link to="/profile" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer">
                        <span className="font-semibold text-xs text-white group-hover:translate-x-1 transition-transform duration-300">Profile</span>
                      </div>
                    </Link>
                    <Link to="/admin/settings" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer">
                        <span className="font-semibold text-xs text-white group-hover:translate-x-1 transition-transform duration-300">Settings</span>
                      </div>
                    </Link>
                    <Link to="/wallet" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer">
                        <span className="font-semibold text-xs text-white group-hover:translate-x-1 transition-transform duration-300">Wallet</span>
                      </div>
                    </Link>
                    <Link to="/notifications" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer">
                        <span className="font-semibold text-xs text-white group-hover:translate-x-1 transition-transform duration-300">Notifications</span>
                      </div>
                    </Link>
                  </div>
                  <div className="pt-3 border-t border-border/50">
                    <Link to="/social" className="block">
                      <div className="p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-white/10 border border-white/20 group-hover:bg-white/20 transition-colors">
                          <Music2 className="w-3 h-3 text-primary" />
                        </div>
                        <span className="font-semibold text-xs text-white group-hover:translate-x-1 transition-transform duration-300">Social</span>
                      </div>
                    </Link>
                  </div>
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
          <div className="mt-1 flex items-center justify-between">
            <h1 className="text-sm font-bold">Welcome back, {user?.name ? user.name.split(' ')[0] : 'Admin'}!</h1>
            <div className="flex items-center gap-3">
              <Link to="/notifications" aria-label="Open Notifications">
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Bell className="w-5 h-5" />
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1 rounded-md">
                    <div className="h-8 w-8 rounded-full border-2 border-border/60 overflow-hidden flex items-center justify-center">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "admin"}`} alt={user?.name || "Profile"} />
                        <AvatarFallback>{user?.name?.[0] || "A"}</AvatarFallback>
                      </Avatar>
                    </div>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-cyan-300">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>My Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>Account Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/notifications')}>Notifications</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to="/wallet" aria-label="Open Wallet">
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <WalletIcon className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-3 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2 animate-fade-in">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="text-center p-2 sm:p-3">
              <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1 ${stat.color}`} />
              <p className="text-sm sm:text-base font-bold">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-cyan-300">{stat.label}</p>
            </GlassCard>
          ))}
        </div>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold">Collection Showcase</h2>
          </div>
          <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
            <video
              ref={collectionVideoRef}
              src={collections[currentCollectionSlide].videoUrl}
              className="w-full aspect-video object-cover"
              autoPlay
              loop
              muted
              onError={(e) => {
                console.warn('Video failed to load:', e);
                e.currentTarget.poster = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23111" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="18" fill="%23ccc"%3EVideo unavailable%3C/text%3E%3C/svg%3E';
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold text-white">{collections[currentCollectionSlide].title}</h3>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">Slide {currentCollectionSlide + 1} of {collections.length}</p>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 z-10">
              <button
                onClick={prevCollection}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                aria-label="Previous collection"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 z-10">
              <button
                onClick={nextCollection}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
                aria-label="Next collection"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {collections.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentCollectionSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentCollectionSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold">Your Products</h2>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Link to="/analytics" aria-label="Open Analytics">
                <Button variant="outline" size="xs" className="gap-2 px-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </Button>
              </Link>
              <Link to="/admin/settings" aria-label="Open Settings">
                <Button variant="gradient" size="xs" className="gap-2 px-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </Link>
              <Link to="/admin/products" aria-label="View all products">
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

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold">Recent Orders</h2>
            <Link to="/admin/orders" aria-label="View all orders">
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
                <GlassCard key={order.id} className="p-2 sm:p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-xs sm:text-sm truncate">{order.productName}</p>
                      <p className="text-[10px] sm:text-xs text-cyan-300">Order #{order.id} • {order.date}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-sm sm:text-base">${order.total.toLocaleString()}</p>
                      </div>
                      <span className={`text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium whitespace-nowrap ${
                        order.status === "delivered"
                          ? "bg-secondary/20 text-secondary"
                          : order.status === "shipped"
                          ? "bg-primary/20 text-primary"
                          : "bg-accent/20 text-accent"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </section>

        <section className="pt-1 pb-4 text-xs text-cyan-300 text-center">
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

      <FooterNav dashboardType="admin" />
    </div>
  );
};

export default AdminDashboard;
