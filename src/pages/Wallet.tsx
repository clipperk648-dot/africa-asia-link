import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { getBalance, setBalance, addTransaction, getTransactions, type WalletTx } from "@/utils/wallet";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowDownCircle, ArrowUpRight, History, Wallet as WalletIcon } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { useToast } from "@/hooks/use-toast";

const currencies = ["USD", "CNY", "NGN"] as const;

type Currency = typeof currencies[number];

const Wallet = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currency, setCurrency] = useState<Currency>("USD");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [note, setNote] = useState("");

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

  const pay = () => {
    const amt = Number(amount);
    if (!user || !recipient.trim() || !amt || amt <= 0) return;
    if (amt > balance) {
      toast({ title: "Insufficient balance", description: "Add funds to complete this payment.", variant: "destructive" });
      return;
    }
    const newBal = balance - amt;
    setBalance(user.id, newBal, currency);
    addTransaction(user.id, { id: crypto.randomUUID(), type: "payment", amount: amt, currency, note: note || `To ${recipient}` , date: new Date().toISOString() });
    setAmount("");
    setRecipient("");
    setNote("");
    toast({ title: "Payment sent", description: `${currency} ${amt.toLocaleString()} sent to ${recipient}.` });
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
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="rounded-md border bg-background px-2 py-1 text-xs">
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
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
              <p className="text-sm font-medium">Send Payment</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => document.getElementById("pay")?.scrollIntoView({ behavior: "smooth" })}>Send</Button>
          </GlassCard>
        </div>

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

        <section id="pay" className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold">Send Payment</h2>
          <GlassCard className="p-4 sm:p-6">
            <div className="grid sm:grid-cols-4 gap-3">
              <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient (email or ID)" className="rounded-md border bg-background px-3 py-2 text-sm sm:col-span-2" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Amount (${currency})`} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="rounded-md border bg-background px-3 py-2 text-sm" />
              <div className="sm:col-span-4">
                <Button onClick={pay} variant="gradient" className="w-full">Send</Button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Peer payment is simulated and updates your local balance and history.</p>
          </GlassCard>
        </section>

        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2"><History className="w-4 h-4" /> Recent Activity</h2>
          <GlassCard className="p-0">
            <div className="divide-y">
              {txs.length === 0 && (
                <p className="p-4 text-xs text-muted-foreground">No transactions yet.</p>
              )}
              {txs.map((t: WalletTx) => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t.type === "deposit" ? "Deposit" : "Payment"} • {t.currency} {t.amount.toLocaleString()}</p>
                    {t.note && <p className="text-xs text-muted-foreground mt-0.5">{t.note}</p>}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{new Date(t.date).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      </main>
    </div>
  );
};

export default Wallet;
