import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { useEffect, useState } from "react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Zap, Gamepad2, DollarSign, Gift } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

const BottomNav = ({ active }: { active: "wallet" | "pay" | "apps" }) => {
  const items = [
    { key: "wallet" as const, to: "/wallet", label: "Wallet", Icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h10m4 0a1 1 0 11-2 0m2 0a1 1 0 10-2 0m0-5a1 1 0 111 1m-1-1a1 1 0 10-1-1m6 0a1 1 0 111 1m-1-1a1 1 0 10-1-1m6 0a1 1 0 111 1m-1-1a1 1 0 10-1-1" /></svg> },
    { key: "pay" as const, to: "/wallet/pay", label: "Pay", Icon: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8m0 8l-9-2m9 2l9-2m-9-8l9 18m-9-18l-9 18m18-18l-9-2m-9 2l9-2" /></svg> },
    { key: "apps" as const, to: "/wallet/apps", label: "Apps", Icon: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="6" height="6"/><rect x="13" y="3" width="6" height="6"/><rect x="3" y="13" width="6" height="6"/><rect x="13" y="13" width="6" height="6"/></svg> },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50">
      <div className="max-w-3xl mx-auto px-8">
        <div className="grid grid-cols-3 h-16">
          {items.map(({ key, to, label, Icon }) => (
            <a key={key} href={to} className={`flex flex-col items-center justify-center gap-1 ${active === key ? "text-primary" : "text-muted-foreground"}`}>
              <Icon />
              <span className="text-[11px] font-medium">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

const WalletApps = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const categories = ["All", "Payments & Utilities", "Finance"];

  const featuredApps = [
    {
      title: "Daily Rewards",
      subtitle: "MiniPay Claim",
      description: "Get rewarded for coming back everyday",
      gradient: "from-green-500 to-emerald-600",
      icon: "🎁"
    },
    {
      title: "Buy Airtime",
      subtitle: "Get 1% bonus",
      description: "Purchase airtime instantly",
      gradient: "from-green-500 to-emerald-600",
      icon: "📞"
    }
  ];

  const apps = [
    {
      icon: "📱",
      title: "Airtime",
      description: "Every recharge gives you more",
      category: "Payments & Utilities",
      isNew: true
    },
    {
      icon: "💰",
      title: "Deposit with Daimo",
      description: "Bring your funds to MiniPay!",
      category: "Finance",
      isNew: true
    },
    {
      icon: "⚽",
      title: "Fantasy Football",
      description: "Set Your Squad",
      category: "Finance",
      isNew: true
    }
  ];

  const filteredApps = selectedCategory === "All" 
    ? apps 
    : apps.filter(app => app.category === selectedCategory);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-base sm:text-lg font-bold">Mini Apps</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Featured Apps Carousel */}
        <section className="space-y-3">
          <div className="-mx-4 px-4 pb-2 overflow-x-auto snap-x snap-mandatory flex gap-3">
            {featuredApps.map((app, index) => (
              <div key={index} className="snap-start shrink-0 w-[80%] sm:w-full">
                <GlassCard className={`p-6 bg-gradient-to-br ${app.gradient} text-white rounded-3xl min-h-[180px] flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-2xl font-bold">{app.title}</h3>
                    <p className="text-white/80 text-sm mt-1">{app.subtitle}</p>
                  </div>
                  <p className="text-sm opacity-90">{app.description}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </section>

        {/* Category Filter */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-foreground text-background"
                    : "bg-card border border-border/50 text-foreground hover:border-border"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Apps List */}
        <section className="space-y-3">
          {filteredApps.map((app, index) => (
            <GlassCard key={index} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-2xl">
                  {app.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{app.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{app.description}</p>
                </div>
              </div>
              {app.isNew && (
                <span className="bg-secondary text-white text-[10px] px-2.5 py-1 rounded-full font-medium">New</span>
              )}
            </GlassCard>
          ))}
        </section>
      </main>

      <BottomNav active="apps" />
    </div>
  );
};

export default WalletApps;
