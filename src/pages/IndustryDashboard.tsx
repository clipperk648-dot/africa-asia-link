import { useEffect, useState, Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { mockProducts, mockOrders, type Product } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { LogOut, TrendingUp, Package, DollarSign, Users, Music2, Bell, BarChart3, LineChart, Pencil, Wallet as WalletIcon, Bot, Menu, Twitter, Instagram, Facebook } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { APP_NAME, SOCIAL_LINKS } from "@/config/app";

const ProductCard = ({ product }: { product: Product }) => (
  <GlassCard className="p-4 sm:p-6 min-w-[280px] sm:min-w-0">
    <div className="flex gap-3 sm:gap-4">
      <img
        src={product.image}
        alt={product.name}
        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
        <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{product.category}</p>
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

  const stats = [
    { label: "Total Products", value: "24", icon: Package, color: "text-primary" },
    { label: "Active Orders", value: "18", icon: TrendingUp, color: "text-secondary" },
    { label: "Revenue", value: "¥450K", icon: DollarSign, color: "text-accent" },
    { label: "Buyers", value: "156", icon: Users, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 py-1">
          <div className="flex items-center justify-start">
            <div className="h-8 w-8 bg-primary text-white rounded-md flex items-center justify-center font-bold text-sm">E</div>
            <span className="text-lg font-bold -ml-1">china</span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold">Industry Dashboard</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Link to="/notifications" aria-label="Open Notifications">
                  <Button variant="ghost" size="icon">
                    <Bell className="w-5 h-5" />
                  </Button>
                </Link>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 leading-none">2</span>
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
                    <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
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

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 sm:w-80">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-2">
                    <Link to="/profile">
                      <Button variant="ghost" className="w-full justify-start">Profile</Button>
                    </Link>
                    <Link to="/industry/settings">
                      <Button variant="ghost" className="w-full justify-start">Settings</Button>
                    </Link>
                    <Link to="/wallet">
                      <Button variant="ghost" className="w-full justify-start">Wallet</Button>
                    </Link>
                    <Link to="/invest">
                      <Button variant="ghost" className="w-full justify-start">Invest</Button>
                    </Link>
                    <Link to="/notifications">
                      <Button variant="ghost" className="w-full justify-start">Notifications</Button>
                    </Link>

                    <div className="pt-2 border-t border-border/40 mt-2">
                      <p className="text-xs text-muted-foreground px-2 mb-2">Follow us</p>
                      <div className="flex gap-2 px-2">
                        <a href={SOCIAL_LINKS[0].href} target="_blank" rel="noreferrer">
                          <Button variant="ghost" className="p-2"><Twitter className="w-4 h-4" /></Button>
                        </a>
                        <a href={SOCIAL_LINKS[1].href} target="_blank" rel="noreferrer">
                          <Button variant="ghost" className="p-2"><Instagram className="w-4 h-4" /></Button>
                        </a>
                        <a href={SOCIAL_LINKS[2].href} target="_blank" rel="noreferrer">
                          <Button variant="ghost" className="p-2"><Facebook className="w-4 h-4" /></Button>
                        </a>
                      </div>
                    </div>

                    <Button className="w-full justify-start mt-4" variant="destructive" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 animate-fade-in">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="text-center p-4">
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1.5 ${stat.color}`} />
              <p className="text-base sm:text-lg font-bold">{stat.value}</p>
              <p className="text-[11px] sm:text-xs text-muted-foreground">{stat.label}</p>
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
              <Link to="/social" aria-label="Open TradeSocial">
                <Button variant="gradient" size="xs" className="gap-2 px-2">
                  <Music2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Social</span>
                </Button>
              </Link>
              <Link to="/industry/products" aria-label="View all products">
                <Button variant="ghost" size="xs">View All</Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden -mx-4 px-4 pb-2 overflow-x-auto snap-x snap-mandatory flex gap-3">
            {mockProducts.map((p) => (
              <div key={p.id} className="snap-start shrink-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          <div className="hidden md:grid md:grid-cols-2 gap-4">
            {mockProducts.map((p) => (
              <Fragment key={p.id}>
                <ProductCard product={p} />
              </Fragment>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold">Recent Orders</h2>
          <div className="space-y-3">
            {mockOrders.map((order) => (
              <GlassCard key={order.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-base sm:text-lg truncate">{order.productName}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Order #{order.id} • {order.date}</p>
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
            ))}
          </div>
        </section>

        <section className="pt-2 pb-4 text-xs text-muted-foreground text-center">
          <span className="font-medium">Rates:</span> 1 USD ≈ ¥7.1 • 1 CNY ≈ ₦220
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
