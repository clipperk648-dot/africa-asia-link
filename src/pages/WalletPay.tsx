import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { useEffect } from "react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, DollarSign } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import WalletBottomNav from "@/components/WalletBottomNav";

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
            <Link key={key} to={to} className={`flex flex-col items-center justify-center gap-1 ${active === key ? "text-primary" : "text-muted-foreground"}`}>
              <Icon />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

const WalletPay = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-3xl font-bold">Pay via</h1>

        <div className="space-y-3">
          <button className="w-full p-5 rounded-3xl bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors text-left flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center flex-shrink-0 mt-1">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Phone number</h3>
              <p className="text-sm text-muted-foreground mt-1">To any MiniPay user</p>
            </div>
          </button>

          <button className="w-full p-5 rounded-3xl bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors text-left flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center flex-shrink-0 mt-1">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base">Shareable Cash Link</h3>
              <p className="text-sm text-muted-foreground mt-1">To anyone not on MiniPay yet</p>
            </div>
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-56 h-56 rounded-full bg-gradient-to-br from-secondary/20 via-primary/10 to-secondary/20 flex items-center justify-center mb-6 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full opacity-60">
                <circle cx="100" cy="100" r="80" fill="url(#grad)" stroke="none"/>
                <defs>
                  <radialGradient id="grad">
                    <stop offset="0%" stopColor="hsl(var(--primary))"/>
                    <stop offset="100%" stopColor="hsl(var(--secondary))"/>
                  </radialGradient>
                </defs>
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl">🌍</div>
          </div>
          <p className="text-center text-muted-foreground text-sm max-w-xs">
            Keep an eye here for local payment<br />methods coming soon!
          </p>
        </div>
      </main>

      <WalletBottomNav active="pay" />
    </div>
  );
};

export default WalletPay;
