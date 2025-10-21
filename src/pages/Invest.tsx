import React, { useEffect, useMemo, useState } from "react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { getCurrentUser } from "@/utils/mockAuth";

type Project = {
  id: string;
  ownerId: string | null;
  title: string;
  description: string;
  target: number;
  funded: number;
  category?: string;
  returnPercent?: number;
  durationMonths?: number;
  status?: "pending" | "approved" | "funded";
  pitchUrl?: string;
  documents?: string[];
};

type Tx = { id: string; type: "deposit" | "withdraw" | "invest"; amount: number; date: string; note?: string };

const PROJECTS_KEY = "echina_projects_v1";
const WALLET_KEY = "echina_wallet_v1";
const TX_KEY = "echina_txs_v1";

const loadProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};
const saveProjects = (items: Project[]) => localStorage.setItem(PROJECTS_KEY, JSON.stringify(items));

const loadWallet = (): number => {
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    return raw ? Number(raw) : 0;
  } catch (e) {
    return 0;
  }
};
const saveWallet = (amt: number) => localStorage.setItem(WALLET_KEY, String(amt));

const loadTxs = (): Tx[] => {
  try {
    const raw = localStorage.getItem(TX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};
const saveTxs = (txs: Tx[]) => localStorage.setItem(TX_KEY, JSON.stringify(txs));

const format = (n: number) => `₦${n.toLocaleString()}`;

const Invest = () => {
  const user = getCurrentUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [wallet, setWallet] = useState<number>(0);
  const [txs, setTxs] = useState<Tx[]>([]);

  // form state for creating campaigns
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [returnPercent, setReturnPercent] = useState<number | "">(10);
  const [durationMonths, setDurationMonths] = useState<number | "">(12);
  const [pitchUrl, setPitchUrl] = useState("");

  // browsing filters
  const [filterCategory, setFilterCategory] = useState("");
  const [minReturn, setMinReturn] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setProjects(loadProjects());
    setWallet(loadWallet());
    setTxs(loadTxs());
  }, []);

  useEffect(() => saveProjects(projects), [projects]);
  useEffect(() => saveWallet(wallet), [wallet]);
  useEffect(() => saveTxs(txs), [txs]);

  const createProject = () => {
    if (!title || !description || !target || Number(target) <= 0) {
      toast.error("Please provide valid project details");
      return;
    }
    const p: Project = {
      id: Date.now().toString(36),
      ownerId: user?.id ?? null,
      title,
      description,
      target: Number(target),
      funded: 0,
      category: category || "General",
      returnPercent: Number(returnPercent) || 10,
      durationMonths: Number(durationMonths) || 12,
      status: "pending",
      pitchUrl: pitchUrl || undefined,
      documents: [],
    };
    setProjects((s) => [p, ...s]);
    setTitle("");
    setDescription("");
    setTarget("");
    setCategory("");
    setReturnPercent(10);
    setDurationMonths(12);
    setPitchUrl("");
    toast.success("Project submitted for approval");
  };

  const deposit = () => {
    const amountStr = prompt("Enter deposit amount (₦)");
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return toast.error("Invalid amount");
    setWallet((w) => w + amount);
    const tx: Tx = { id: Date.now().toString(36), type: "deposit", amount, date: new Date().toISOString(), note: "Wallet deposit" };
    setTxs((s) => [tx, ...s]);
    toast.success(`Deposited ${format(amount)}`);
  };

  const withdraw = () => {
    const amountStr = prompt("Enter withdraw amount (₦)");
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return toast.error("Invalid amount");
    if (amount > wallet) return toast.error("Insufficient balance");
    setWallet((w) => w - amount);
    const tx: Tx = { id: Date.now().toString(36), type: "withdraw", amount, date: new Date().toISOString(), note: "Wallet withdrawal" };
    setTxs((s) => [tx, ...s]);
    toast.success(`Withdrew ${format(amount)}`);
  };

  const investInProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    const amountStr = prompt(`Enter amount to invest in ${project.title} (₦)`);
    if (!amountStr) return;
    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) return toast.error("Invalid amount");
    if (amount > wallet) return toast.error("Insufficient wallet balance. Please deposit funds.");
    // deduct
    setWallet((w) => w - amount);
    const tx: Tx = { id: Date.now().toString(36), type: "invest", amount, date: new Date().toISOString(), note: `Invested in ${project.title}` };
    setTxs((s) => [tx, ...s]);
    // update project
    setProjects((s) => s.map((p) => (p.id === projectId ? { ...p, funded: p.funded + amount } : p)));
    toast.success(`Invested ${format(amount)} in ${project.title}`);
  };

  const approveProject = (id: string) => {
    setProjects((s) => s.map((p) => (p.id === id ? { ...p, status: "approved" } : p)));
    toast.success("Project approved");
  };

  const categories = useMemo(() => Array.from(new Set(projects.map((p) => p.category || "General"))), [projects]);

  const filtered = projects.filter((p) => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (statusFilter && p.status !== (statusFilter as any)) return false;
    if (minReturn && Number(p.returnPercent || 0) < Number(minReturn)) return false;
    return true;
  });

  const totalFunded = projects.reduce((a, b) => a + b.funded, 0);
  const totalTarget = projects.reduce((a, b) => a + b.target, 0);

  return (
    <div className="min-h-screen pb-24 relative">
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <h1 className="text-2xl font-bold">Investment Platform</h1>

            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Wallet balance</p>
                  <p className="text-2xl font-extrabold">{format(wallet)}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={deposit}>Deposit</Button>
                  <Button variant="ghost" onClick={withdraw}>Withdraw</Button>
                </div>
              </div>
            </GlassCard>

            <section>
              <h2 className="text-lg font-semibold mb-2">Create fundraising campaign</h2>
              <GlassCard className="p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                  <Input placeholder="Target amount (₦)" value={target as any} onChange={(e) => setTarget(e.target.value ? Number(e.target.value) : "")} />
                  <Input placeholder="Return % (e.g., 12)" value={returnPercent as any} onChange={(e) => setReturnPercent(e.target.value ? Number(e.target.value) : "")} />
                </div>
                <Textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Input placeholder="Pitch video URL (optional)" value={pitchUrl} onChange={(e) => setPitchUrl(e.target.value)} />
                <div className="flex gap-2">
                  <Button variant="gradient" onClick={createProject}>Submit for approval</Button>
                  <Button variant="outline" onClick={() => { setTitle(""); setDescription(""); setTarget(""); setCategory(""); setReturnPercent(10); setDurationMonths(12); setPitchUrl(""); }}>Reset</Button>
                </div>
              </GlassCard>
            </section>

            <section>
              <h2 className="text-lg font-semibold">Browse opportunities</h2>
              <GlassCard className="p-4 mb-3">
                <div className="flex flex-wrap gap-2 mb-3">
                  <select className="px-2 py-1 border rounded" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select className="px-2 py-1 border rounded" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="funded">Funded</option>
                  </select>

                  <Input placeholder="Min return %" value={minReturn as any} onChange={(e) => setMinReturn(e.target.value ? Number(e.target.value) : "")} />
                </div>

                {filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No opportunities match your filters.</p>
                ) : (
                  filtered.map((p) => {
                    const percent = Math.min(100, Math.round((p.funded / p.target) * 100));
                    return (
                      <div key={p.id} className="mb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{p.title} {p.status === "pending" && <span className="text-xs text-muted-foreground">(Pending)</span>}</h3>
                            <p className="text-xs text-muted-foreground">{p.category} • {p.returnPercent}% • {p.durationMonths} months</p>
                            <p className="text-sm mt-1">{p.description}</p>
                            <p className="text-xs mt-2">{format(p.funded)} raised of {format(p.target)}</p>
                            <div className="w-full bg-muted h-2 rounded mt-2 overflow-hidden">
                              <div style={{ width: `${percent}%` }} className="h-2 bg-primary" />
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                              <p className="text-lg font-bold">{format(p.target)}</p>
                              <p className="text-xs text-muted-foreground">Target</p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => investInProject(p.id)}>Invest</Button>
                              {p.ownerId === user?.id && p.status === "pending" && (
                                <Button size="sm" variant="gradient" onClick={() => approveProject(p.id)}>Approve</Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </GlassCard>
            </section>

          </div>

          <aside className="space-y-4">
            <GlassCard className="p-4">
              <p className="text-sm text-muted-foreground">Overview</p>
              <p className="text-xl font-bold mt-1">Total funded: {format(totalFunded)}</p>
              <p className="text-sm text-muted-foreground">Across {projects.length} projects</p>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Funding progress</p>
                <div className="w-full bg-muted h-2 rounded mt-2 overflow-hidden">
                  <div style={{ width: `${totalTarget ? Math.min(100, Math.round((totalFunded / totalTarget) * 100)) : 0}%` }} className="h-2 bg-accent" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <p className="text-sm text-muted-foreground">Transactions</p>
              <div className="mt-2 space-y-2 max-h-56 overflow-auto">
                {txs.length === 0 ? <p className="text-xs text-muted-foreground">No transactions</p> : txs.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium">{t.type.toUpperCase()}</p>
                      <p className="text-muted-foreground">{t.note}</p>
                    </div>
                    <div className={`font-semibold ${t.type === "deposit" ? "text-green-600" : t.type === "withdraw" ? "text-red-600" : "text-primary"}`}>{format(t.amount)}</div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <p className="text-sm text-muted-foreground">Quick Actions</p>
              <div className="mt-3 flex flex-col gap-2">
                <Button variant="outline" onClick={() => { const amt = prompt('Quick deposit amount (₦)'); if (!amt) return; const a=Number(amt); if (isNaN(a)||a<=0) return toast.error('Invalid'); setWallet(w=>w+a); setTxs(s=>[{id:Date.now().toString(36), type:'deposit', amount:a, date:new Date().toISOString(), note:'Quick deposit'}, ...s]); toast.success(`Deposited ${format(a)}`); }}>Quick deposit</Button>
                <Button variant="ghost" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied'); }}>Share platform</Button>
              </div>
            </GlassCard>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Invest;
