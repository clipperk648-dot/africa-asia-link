import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { getBalance, setBalance, addTransaction, getTransactions } from "@/utils/wallet";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, ArrowDownCircle, Send, History, Grid2X2 } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { useToast } from "@/hooks/use-toast";

const currencies = ["USD", "NGN"] as const;

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

const WalletActions = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();

  const [currency, setCurrency] = useState<(typeof currencies)[number]>("USD");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);

  const balance = useMemo(() => getBalance(user?.id, currency), [user?.id, currency]);

  useEffect(() => {
    // Scroll to section if hash present
    const hash = location.hash.replace('#','');
    if (hash) document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
  }, [location.hash]);

  const deposit = () => {
    const amt = Number(amount);
    if (!user || !amt || amt <= 0) return;
    setBalance(user.id, balance + amt, currency);
    addTransaction(user.id, { id: crypto.randomUUID(), type: "deposit", amount: amt, currency, note: note || "Deposit", date: new Date().toISOString() });
    setAmount(""); setNote("");
    toast({ title: "Deposit successful", description: `${currency} ${amt.toLocaleString()} added.` });
  };

  const transfer = () => {
    const amt = Number(amount);
    if (!user || !recipient.trim() || !amt || amt <= 0) return;
    if (amt > balance) { toast({ title: "Insufficient balance", description: "Add funds to complete this transfer.", variant: "destructive" }); return; }
    setBalance(user.id, balance - amt, currency);
    addTransaction(user.id, { id: crypto.randomUUID(), type: "payment", amount: amt, currency, note: note || `To ${recipient}`, date: new Date().toISOString() });
    setAmount(""); setRecipient(""); setNote("");
    toast({ title: "Transfer sent", description: `${currency} ${amt.toLocaleString()} to ${recipient}.` });
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-primary" />
            <h1 className="text-base sm:text-lg font-bold">Wallet Actions</h1>
          </div>
          <select value={currency} onChange={(e) => setCurrency(e.target.value as any)} className="rounded-md border bg-background px-2 py-1 text-xs">
            {currencies.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <section id="deposit" className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold">Deposit</h2>
          <GlassCard className="p-4 sm:p-6">
            <div className="grid sm:grid-cols-3 gap-3">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Amount (${currency})`} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="rounded-md border bg-background px-3 py-2 text-sm" />
              <Button onClick={deposit} className="w-full">Add Funds</Button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Simulated deposit. Values are stored locally.</p>
          </GlassCard>
        </section>

        <section id="transfer" className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold">Transfer</h2>
          <GlassCard className="p-4 sm:p-6">
            <div className="grid sm:grid-cols-4 gap-3">
              <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient (email or ID)" className="rounded-md border bg-background px-3 py-2 text-sm sm:col-span-2" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Amount (${currency})`} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="rounded-md border bg-background px-3 py-2 text-sm" />
              <div className="sm:col-span-4">
                <Button onClick={transfer} variant="gradient" className="w-full">Send</Button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Transfers are simulated and update local balance and history.</p>
          </GlassCard>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2"><History className="w-4 h-4" /> Recent activity</h2>
          <GlassCard className="p-0">
            <div className="divide-y">
              {getTransactions(user?.id).length === 0 && (
                <p className="p-4 text-xs text-muted-foreground">No transactions yet.</p>
              )}
              {getTransactions(user?.id).map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div className="text-sm font-medium">{t.type === 'deposit' ? 'Deposit' : 'Payment'} • {t.currency} {t.amount.toLocaleString()}</div>
                  <div className="text-[11px] text-muted-foreground">{new Date(t.date).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      </main>

      <BottomNav active="pay" />
    </div>
  );
};

export default WalletActions;
