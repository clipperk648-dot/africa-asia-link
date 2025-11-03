import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { getBalance, getTransactions, type WalletTx } from "@/utils/wallet";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowDownCircle, ArrowUpRight, History, Wallet as WalletIcon, X, ChevronDown, Grid2X2, Send, ArrowLeft, TrendingUp } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import WalletBottomNav from "@/components/WalletBottomNav";
import SlideshowBanner from "@/components/SlideshowBanner";
import { APP_NAME } from "@/config/app";

const currencies = ["USD", "NGN"] as const;

type Currency = typeof currencies[number];

const BottomNav = ({ active }: { active: "wallet" | "pay" | "apps" }) => {
  const items = [
    { key: "wallet" as const, to: "/wallet", label: "Wallet", Icon: WalletIcon },
    { key: "pay" as const, to: "/wallet/pay", label: "Pay", Icon: Send },
    { key: "apps" as const, to: "/wallet/apps", label: "Apps", Icon: Grid2X2 },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50">
      <div className="max-w-3xl mx-auto px-8">
        <div className="grid grid-cols-3 h-16">
          {items.map(({ key, to, label, Icon }) => (
            <Link key={key} to={to} className={`flex flex-col items-center justify-center gap-1 ${active === key ? "text-primary" : "text-muted-foreground"}`}>
              <Icon className={`w-6 h-6 ${active === key ? "scale-110" : ""}`} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

const Wallet = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [currency, setCurrency] = useState<Currency>("USD");

  const goBack = () => {
    const dest = user?.role === "industry" ? "/industry" : "/buyer";
    navigate(dest);
  };

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const balance = useMemo(() => getBalance(user?.id, currency), [user?.id, currency]);
  const txs = useMemo(() => getTransactions(user?.id), [user?.id]);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack} aria-label="Go back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <WalletIcon className="w-5 h-5 text-primary" />
            <h1 className="text-base sm:text-lg font-bold">Wallet</h1>
          </div>
          <div className="text-xs text-muted-foreground">{APP_NAME}</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="w-fit bg-muted text-foreground/80 text-xs px-3 py-1 rounded-full shadow-sm">Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋</div>

        <div className="relative">
          <div className="rounded-3xl p-5 sm:p-6 text-white bg-gradient-primary shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-xs">Total</p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight">{currency} {balance.toFixed(2)}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-full p-1 flex items-center gap-1">
                {currencies.map((c) => (
                  <button key={c} onClick={() => setCurrency(c)} className={`px-2 py-1 rounded-full text-[11px] transition ${currency === c ? "bg-white text-foreground" : "text-white/80"}`}>{c}</button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button onClick={() => navigate("/wallet/deposit")} variant="glass" className="justify-start gap-3 bg-white/15 text-white border-white/20 hover:bg-white/25">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                  <ArrowDownCircle className="w-4 h-4" />
                </span>
                Deposit
              </Button>
              <Button onClick={() => navigate("/wallet/withdraw")} variant="glass" className="justify-start gap-3 bg-white/15 text-white border-white/20 hover:bg-white/25">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
                Withdraw
              </Button>
            </div>
          </div>
          <div className="absolute left-1/2 -bottom-3 -translate-x-1/2">
            <div className="w-14 h-6 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-sm">
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>


        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2"><History className="w-4 h-4" /> Recent activity</h2>
            <Button size="xs" variant="ghost">View more</Button>
          </div>
          <GlassCard className="p-0">
            <div className="divide-y">
              {txs.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                txs.map((t: WalletTx) => {
                  const positive = t.type === "deposit";
                  return (
                    <div key={t.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${positive ? "bg-secondary/20 text-secondary" : "bg-destructive/10 text-destructive"}`}>
                          {positive ? <ArrowDownCircle className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{positive ? "Deposit" : (t.note?.includes("Withdrawal") ? "Withdrawal" : "Payment")}</p>
                          {t.note && <p className="text-xs text-muted-foreground mt-0.5">{t.note}</p>}
                        </div>
                      </div>
                      <div className={`text-sm font-semibold ${positive ? "text-green-600" : "text-red-600"}`}>
                        {positive ? "+" : "-"}{t.currency} {t.amount.toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </GlassCard>
        </section>
      </main>

      <WalletBottomNav active="wallet" />
    </div>
  );
};

export default Wallet;
