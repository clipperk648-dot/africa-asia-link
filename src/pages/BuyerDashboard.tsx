import { useEffect, useState, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { mockProducts, mockOrders, type Product } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { LogOut, ShoppingCart, Clock, CheckCircle, TrendingUp, Music2, Bell, BarChart3, PlusCircle, Wallet as WalletIcon, Bot, Menu, Twitter, Instagram, Facebook } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { APP_NAME, SOCIAL_LINKS } from "@/config/app";
import RateButton from "@/components/RateButton";
import { addToCart } from "@/utils/cart";
import { toast } from "@/components/ui/sonner";

const ProductCard = ({ product, navigate }: { product: Product; navigate: any }) => (
  <GlassCard className="p-4 sm:p-6 min-w-[280px] sm:min-w-0">
    <img
      src={product.image}
      alt={product.name}
      className="w-full h-40 sm:h-48 object-cover rounded-lg mb-4"
    />
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.company}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-accent">★</span>
          <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
        </div>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.location}</p>
      <div className="flex items-center justify-between pt-2 gap-2">
        <p className="text-xl sm:text-2xl font-bold text-primary">
          ₦{product.price.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <RateButton productId={product.id} productName={product.name} size="xs" />
          <Button variant="accent" size="xs" className="flex-shrink-0" onClick={() => {
            addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, company: product.company });
            toast.success("Added to cart");
          }}>
            <PlusCircle className="w-4 h-4" />
            Add to cart
          </Button>
          <Button variant="gradient" size="xs" className="flex-shrink-0" onClick={() => navigate(`/messages?product=${product.id}`)}>
            Inquire
          </Button>
        </div>
      </div>
    </div>
  </GlassCard>
);

const BuyerDashboard = () => {
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
    if (!user || user.role !== "buyer") {
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
    { label: "Active Orders", value: "8", icon: ShoppingCart, color: "text-primary" },
    { label: "Pending", value: "3", icon: Clock, color: "text-accent" },
    { label: "Completed", value: "45", icon: CheckCircle, color: "text-secondary" },
    { label: "Saved", value: "₦78K", icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
              {APP_NAME}
            </h1>
            <p className="text-xs text-muted-foreground">Buyer Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/notifications" aria-label="Open Notifications">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/profile" aria-label="Open Profile">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`} alt={user?.name || 'Profile'} />
                <AvatarFallback>{(user?.name?.[0] || 'U')}</AvatarFallback>
              </Avatar>
            </Link>
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
                  <Link to="/buyer/settings">
                    <Button variant="ghost" className="w-full justify-start">Settings</Button>
                  </Link>
                  <Link to="/wallet">
                    <Button variant="ghost" className="w-full justify-start">Wallet</Button>
                  </Link>
                  <Link to="/notifications">
                    <Button variant="ghost" className="w-full justify-start">Notifications</Button>
                  </Link>
                  <Button className="w-full justify-start mt-4" variant="destructive" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
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
            <h2 className="text-base sm:text-lg font-bold">Discover Products</h2>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Link to="/buyer/analytics" aria-label="Open Insights">
                <Button variant="outline" size="xs" className="gap-2 px-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Insights</span>
                </Button>
              </Link>
              <Link to="/social" aria-label="Open TradeSocial">
                <Button variant="gradient" size="xs" className="gap-2 px-2">
                  <Music2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Social</span>
                </Button>
              </Link>
              <Link to="/buyer/products" aria-label="View all products">
                <Button variant="ghost" size="xs">View All</Button>
              </Link>
            </div>
          </div>

          <div className="md:hidden -mx-4 px-4 pb-2 overflow-x-auto snap-x snap-mandatory flex gap-3">
            {mockProducts.map((p) => (
              <div key={p.id} className="snap-start shrink-0">
                <ProductCard product={p} navigate={navigate} />
              </div>
            ))}
          </div>

          <div className="hidden md:grid md:grid-cols-2 gap-4">
            {mockProducts.map((p) => (
              <Fragment key={p.id}>
                <ProductCard product={p} navigate={navigate} />
              </Fragment>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold">My Orders</h2>
          <div className="space-y-3">
            {mockOrders.map((order) => (
              <GlassCard key={order.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-base sm:text-lg truncate">{order.productName}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Order #{order.id} • Qty: {order.quantity}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{order.date}</p>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-lg sm:text-xl">₦{order.total.toLocaleString()}</p>
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
          <span className="font-medium">Rates:</span> 1 USD ≈ ₦1,600 • 1 CNY ≈ ₦220
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

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default BuyerDashboard;
