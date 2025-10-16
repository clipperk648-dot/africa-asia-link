import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { getBalance, setBalance, addTransaction, getTransactions, type WalletTx } from "@/utils/wallet";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowDownCircle, ArrowUpRight, History, Wallet as WalletIcon, X, ChevronDown } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { useToast } from "@/hooks/use-toast";

const currencies = ["USD", "NGN"] as const;

type Currency = typeof currencies[number];

const Wallet = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currency, setCurrency] = useState<Currency>("USD");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");
  const [showPromo, setShowPromo] = useState(true);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const balance = useMemo(() => getBalance(user?.id, currency), [user?.id, currency]);
  const txs = useMemo(() => getTransactions(user?.id), [user?.id]);

  const deposit = () => {
    const amt = Number(amount);
    if (!user || !amt || amt <= 0) return;
    const newBal = balance + amt;
    setBalance(user.id, newBal, currency);
    addTransaction(user.id, { id: crypto.randomUUID(), type: "deposit", amount: amt, currency, note: note || "Deposit", date: new Date().toISOString() });
    setAmount("");
    setNote("");
    toast({ title: "Deposit successful", description: `${currency} ${amt.toLocaleString()} added to your wallet.` });
  };

  const withdraw = () => {
    const amt = Number(amount);
    if (!user || !amt || amt <= 0) return;
    if (amt > balance) {
      toast({ title: "Insufficient balance", description: "Add funds to complete this withdrawal.", variant: "destructive" });
      return;
    }
    const newBal = balance - amt;
    setBalance(user.id, newBal, currency);
    addTransaction(user.id, { id: crypto.randomUUID(), type: "payment", amount: amt, currency, note: note || "Withdrawal", date: new Date().toISOString() });
    setAmount("");
    setNote("");
    toast({ title: "Withdraw successful", description: `${currency} ${amt.toLocaleString()} withdrawn.` });
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-primary" />
            <h1 className="text-base sm:text-lg font-bold">Wallet</h1>
          </div>
          <div className="text-xs text-muted-foreground">{user?.name}</div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome pill */}
        <div className="w-fit bg-muted text-foreground/80 text-xs px-3 py-1 rounded-full shadow-sm">Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋</div>

        {/* Balance card */}
        <div className="relative">
          <div className="rounded-3xl p-5 sm:p-6 text-white bg-gradient-primary shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-xs">Total</p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight">{currency} {balance.toFixed(2)}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-full p-1 flex items-center gap-1">
                {currencies.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-2 py-1 rounded-full text-[11px] transition ${currency === c ? "bg-white text-foreground" : "text-white/80"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button onClick={() => document.getElementById("deposit")?.scrollIntoView({ behavior: "smooth" })} variant="glass" className="justify-start gap-3 bg-white/15 text-white border-white/20 hover:bg-white/25">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                  <ArrowDownCircle className="w-4 h-4" />
                </span>
                Deposit
              </Button>
              <Button onClick={() => document.getElementById("withdraw")?.scrollIntoView({ behavior: "smooth" })} variant="glass" className="justify-start gap-3 bg-white/15 text-white border-white/20 hover:bg-white/25">
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

        {/* Promo banner */}
        {showPromo && (
          <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-accent text-foreground shadow">
            <button aria-label="Close" className="absolute right-3 top-3 text-foreground/70 hover:text-foreground" onClick={() => setShowPromo(false)}>
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-extrabold">You're almost there!</h3>
            <p className="text-xs mt-1 opacity-90">Get a bonus on your first deposit. Earn weekly rewards on your savings.</p>
            <div className="mt-4">
              <Button variant="glass" className="bg-foreground text-background hover:opacity-90" onClick={() => document.getElementById("deposit")?.scrollIntoView({ behavior: "smooth" })}>Deposit</Button>
            </div>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <GlassCard className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <p className="text-xs text-muted-foreground">Current Balance</p>
            </div>
            <p className="mt-2 text-2xl font-extrabold">{currency} {balance.toLocaleString()}</p>
          </GlassCard>
          <GlassCard className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-secondary" />
              <p className="text-sm font-medium">Add Funds</p>
            </div>
            <Button size="sm" onClick={() => document.getElementById("deposit")?.scrollIntoView({ behavior: "smooth" })}>Deposit</Button>
          </GlassCard>
          <GlassCard className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-accent" />
              <p className="text-sm font-medium">Withdraw</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => document.getElementById("withdraw")?.scrollIntoView({ behavior: "smooth" })}>Withdraw</Button>
          </GlassCard>
        </div>

        {/* Deposit */}
        <section id="deposit" className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold">Deposit</h2>
          <GlassCard className="p-4 sm:p-6">
            <div className="grid sm:grid-cols-3 gap-3">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Amount (${currency})`} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="rounded-md border bg-background px-3 py-2 text-sm" />
              <Button onClick={deposit} className="w-full">Add Funds</Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Simulated deposit. Values are stored locally for demo.</p>
          </GlassCard>
        </section>

        {/* Withdraw */}
        <section id="withdraw" className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold">Withdraw</h2>
          <GlassCard className="p-4 sm:p-6">
            <div className="grid sm:grid-cols-3 gap-3">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Amount (${currency})`} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="rounded-md border bg-background px-3 py-2 text-sm" />
              <Button onClick={withdraw} variant="outline" className="w-full">Withdraw</Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Withdrawal is simulated; balance updates locally.</p>
          </GlassCard>
        </section>

        {/* Recent activity */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold flex items-center gap-2"><History className="w-4 h-4" /> Recent activity</h2>
            <Button size="xs" variant="ghost">View more</Button>
          </div>
          <GlassCard className="p-0">
            <div className="divide-y">
              {txs.length === 0 && (
                <p className="p-4 text-xs text-muted-foreground">No transactions yet.</p>
              )}
              {txs.map((t: WalletTx) => {
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
              })}
            </div>
          </GlassCard>
        </section>
      </main>
    </div>
  );
};

export default Wallet;
