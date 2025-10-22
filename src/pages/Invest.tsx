import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { getCurrentUser } from "@/utils/mockAuth";
import { ArrowLeft, BarChart3, MessageCircle, FileText, Settings, History, Lock, TrendingUp, DollarSign, Target } from "lucide-react";

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
  status?: "pending" | "approved" | "funded" | "completed";
  pitchUrl?: string;
  documents?: string[];
  riskLevel?: "low" | "medium" | "high";
  startDate?: string;
  endDate?: string;
  completedPercent?: number;
  milestones?: { id: string; title: string; date: string; completed: boolean }[];
  investors?: { userId: string; amount: number; date: string }[];
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
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"home" | "create" | "browse">("home");
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
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("medium");

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
    const now = new Date();
    const endDate = new Date(now.getTime() + (Number(durationMonths) || 12) * 30 * 24 * 60 * 60 * 1000);
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
      riskLevel: riskLevel,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      completedPercent: 0,
      milestones: [
        { id: "m1", title: "Kickoff", date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), completed: false },
        { id: "m2", title: "Mid-project", date: new Date(now.getTime() + (Number(durationMonths) || 12) * 15 * 24 * 60 * 60 * 1000).toISOString(), completed: false },
        { id: "m3", title: "Final delivery", date: endDate.toISOString(), completed: false },
      ],
      investors: [],
    };
    setProjects((s) => [p, ...s]);
    setTitle("");
    setDescription("");
    setTarget("");
    setCategory("");
    setReturnPercent(10);
    setDurationMonths(12);
    setPitchUrl("");
    setRiskLevel("medium");
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
    setWallet((w) => w - amount);
    const tx: Tx = { id: Date.now().toString(36), type: "invest", amount, date: new Date().toISOString(), note: `Invested in ${project.title}` };
    setTxs((s) => [tx, ...s]);
    setProjects((s) => s.map((p) => (p.id === projectId ? {
      ...p,
      funded: p.funded + amount,
      investors: [...(p.investors || []), { userId: user?.id ?? "unknown", amount, date: new Date().toISOString() }]
    } : p)));
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

  const userPortfolio = useMemo(() => {
    const investments: { projectId: string; projectTitle: string; amount: number; returns: number; expectedReturn: number; status: string; riskLevel: string }[] = [];
    projects.forEach((p) => {
      const userInvestments = p.investors?.filter((inv) => inv.userId === user?.id) || [];
      userInvestments.forEach((inv) => {
        const expectedReturn = inv.amount * (p.returnPercent || 10) / 100;
        investments.push({
          projectId: p.id,
          projectTitle: p.title,
          amount: inv.amount,
          returns: 0,
          expectedReturn,
          status: p.status || "pending",
          riskLevel: p.riskLevel || "medium",
        });
      });
    });
    return investments;
  }, [projects, user?.id]);

  const totalInvested = userPortfolio.reduce((a, b) => a + b.amount, 0);
  const totalExpectedReturn = userPortfolio.reduce((a, b) => a + b.expectedReturn, 0);
  const portfolioValue = totalInvested + totalExpectedReturn;

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-muted-foreground";
    }
  };

  const handleNavigateBack = () => {
    if (user?.role === "industry") {
      navigate("/industry");
    } else {
      navigate("/buyer");
    }
  };

  const handleFooterButtonClick = (page: string) => {
    navigate(`/invest/${page}`);
  };

  return (
    <div className="min-h-screen pb-32 relative flex flex-col">
      {/* Header with Back Button */}
      <div className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNavigateBack}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold">Echina Investments</h1>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b sticky top-14 z-40 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCurrentView("home")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              currentView === "home"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setCurrentView("create")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              currentView === "create"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Create Campaign
          </button>
          <button
            onClick={() => setCurrentView("browse")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              currentView === "browse"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Browse
          </button>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6 flex-1">
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
                  <Input placeholder="Duration (months)" type="number" value={durationMonths as any} onChange={(e) => setDurationMonths(e.target.value ? Number(e.target.value) : "")} />
                  <select className="px-2 py-2 border rounded bg-background" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as "low" | "medium" | "high")}>
                    <option value="low">Risk: Low</option>
                    <option value="medium">Risk: Medium</option>
                    <option value="high">Risk: High</option>
                  </select>
                </div>
                <Textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Input placeholder="Pitch video URL (optional)" value={pitchUrl} onChange={(e) => setPitchUrl(e.target.value)} />
                <div className="flex gap-2">
                  <Button variant="gradient" onClick={createProject}>Submit for approval</Button>
                  <Button variant="outline" onClick={() => { setTitle(""); setDescription(""); setTarget(""); setCategory(""); setReturnPercent(10); setDurationMonths(12); setPitchUrl(""); setRiskLevel("medium"); }}>Reset</Button>
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
                    const investorCount = p.investors?.length || 0;
                    const completedMilestones = p.milestones?.filter((m) => m.completed).length || 0;
                    const totalMilestones = p.milestones?.length || 0;
                    return (
                      <div key={p.id} className="mb-4 pb-4 border-b last:border-b-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{p.title}</h3>
                              <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${getRiskColor(p.riskLevel || "medium")} opacity-70`}>
                                {p.riskLevel || "medium"} risk
                              </span>
                              {p.status === "pending" && <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Pending</span>}
                              {p.status === "approved" && <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">Approved</span>}
                              {p.status === "completed" && <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">Completed</span>}
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{p.category} • {p.returnPercent}% return • {p.durationMonths} months • {investorCount} investor{investorCount !== 1 ? "s" : ""}</p>
                            <p className="text-sm mb-2">{p.description}</p>
                            {totalMilestones > 0 && (
                              <div className="text-xs text-muted-foreground mb-2">
                                Milestones: {completedMilestones}/{totalMilestones} completed
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex-1 mr-4">
                                <p className="text-xs text-muted-foreground mb-1">{format(p.funded)} of {format(p.target)}</p>
                                <div className="w-full bg-muted h-2 rounded overflow-hidden">
                                  <div style={{ width: `${percent}%` }} className="h-2 bg-primary" />
                                </div>
                              </div>
                              <p className="text-sm font-bold whitespace-nowrap">{percent}%</p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button size="sm" variant="outline" onClick={() => investInProject(p.id)}>Invest</Button>
                            {p.ownerId === user?.id && p.status === "pending" && (
                              <Button size="sm" variant="gradient" onClick={() => approveProject(p.id)}>Approve</Button>
                            )}
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
              <p className="text-sm text-muted-foreground">Platform Overview</p>
              <p className="text-xl font-bold mt-1">Total funded: {format(totalFunded)}</p>
              <p className="text-sm text-muted-foreground">Across {projects.length} projects</p>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Funding progress</p>
                <div className="w-full bg-muted h-2 rounded mt-2 overflow-hidden">
                  <div style={{ width: `${totalTarget ? Math.min(100, Math.round((totalFunded / totalTarget) * 100)) : 0}%` }} className="h-2 bg-accent" />
                </div>
              </div>
            </GlassCard>

            {userPortfolio.length > 0 && (
              <GlassCard className="p-4">
                <p className="text-sm text-muted-foreground">Your Portfolio</p>
                <p className="text-xl font-bold mt-1">{format(portfolioValue)}</p>
                <p className="text-xs text-muted-foreground">Invested: {format(totalInvested)}</p>
                <p className="text-xs text-green-600">Expected returns: {format(totalExpectedReturn)}</p>
                <div className="mt-3 space-y-2 max-h-48 overflow-auto">
                  {userPortfolio.map((inv) => (
                    <div key={inv.projectId} className="text-xs p-2 bg-muted rounded">
                      <p className="font-medium truncate">{inv.projectTitle}</p>
                      <p className="text-muted-foreground">Investment: {format(inv.amount)}</p>
                      <p className={`${getRiskColor(inv.riskLevel)}`}>Risk: {inv.riskLevel}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

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
