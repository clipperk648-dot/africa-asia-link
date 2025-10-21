import React, { useEffect, useMemo, useState } from "react";
import GlassCard from "@/components/GlassCard";
import ThreeBackground from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { getCurrentUser } from "@/utils/mockAuth";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  TrendingUp,
  Wallet2,
  Target,
  Clock,
  Sparkles,
  LineChart as LineChartIcon,
  ShieldCheck,
  UsersRound,
  ArrowDownUp,
  PlayCircle,
} from "lucide-react";

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
  const [searchQuery, setSearchQuery] = useState("");

  // dialogs
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [investOpen, setInvestOpen] = useState(false);
  const [amountInput, setAmountInput] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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

  const handleDeposit = (amount: number) => {
    if (isNaN(amount) || amount <= 0) return toast.error("Invalid amount");
    setWallet((w) => w + amount);
    const tx: Tx = { id: Date.now().toString(36), type: "deposit", amount, date: new Date().toISOString(), note: "Wallet deposit" };
    setTxs((s) => [tx, ...s]);
    toast.success(`Deposited ${format(amount)}`);
  };

  const handleWithdraw = (amount: number) => {
    if (isNaN(amount) || amount <= 0) return toast.error("Invalid amount");
    if (amount > wallet) return toast.error("Insufficient balance");
    setWallet((w) => w - amount);
    const tx: Tx = { id: Date.now().toString(36), type: "withdraw", amount, date: new Date().toISOString(), note: "Wallet withdrawal" };
    setTxs((s) => [tx, ...s]);
    toast.success(`Withdrew ${format(amount)}`);
  };

  const investInProject = (projectId: string, amount: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    if (isNaN(amount) || amount <= 0) return toast.error("Invalid amount");
    if (amount > wallet) return toast.error("Insufficient wallet balance. Please deposit funds.");
    setWallet((w) => w - amount);
    const tx: Tx = { id: Date.now().toString(36), type: "invest", amount, date: new Date().toISOString(), note: `Invested in ${project.title}` };
    setTxs((s) => [tx, ...s]);
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
    if (searchQuery && !(`${p.title} ${p.description} ${p.category}`.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    return true;
  });

  const totalFunded = projects.reduce((a, b) => a + b.funded, 0);
  const totalTarget = projects.reduce((a, b) => a + b.target, 0);

  const avgReturn = projects.length
    ? Math.round(
        projects.reduce((acc, p) => acc + (p.returnPercent || 0), 0) / projects.length,
      )
    : 0;

  // derive investments per project from tx notes (demo data model)
  const investmentByProjectId = useMemo(() => {
    const map = new Map<string, number>();
    txs
      .filter((t) => t.type === "invest" && t.note?.startsWith("Invested in "))
      .forEach((t) => {
        const title = t.note?.replace("Invested in ", "").trim();
        const proj = projects.find((p) => p.title === title);
        if (proj) {
          map.set(proj.id, (map.get(proj.id) || 0) + t.amount);
        }
      });
    return map;
  }, [txs, projects]);

  const myPortfolioProjects = projects.filter((p) => investmentByProjectId.has(p.id));

  // build chart data of wallet balance and cumulative invested over time
  const chartData = useMemo(() => {
    const sorted = [...txs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningWallet = 0;
    let cumulativeInvested = 0;
    const data: { date: string; wallet: number; invested: number }[] = [];
    sorted.forEach((t) => {
      if (t.type === "deposit") runningWallet += t.amount;
      if (t.type === "withdraw") runningWallet -= t.amount;
      if (t.type === "invest") {
        runningWallet -= t.amount;
        cumulativeInvested += t.amount;
      }
      data.push({
        date: new Date(t.date).toLocaleDateString(),
        wallet: Math.max(0, runningWallet),
        invested: cumulativeInvested,
      });
    });
    return data.length ? data : [{ date: new Date().toLocaleDateString(), wallet, invested: 0 }];
  }, [txs, wallet]);

  const chartConfig = {
    wallet: {
      label: "Wallet",
      color: "hsl(var(--secondary))",
    },
    invested: {
      label: "Invested",
      color: "hsl(var(--primary))",
    },
  } as const;

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-md animate-fade-in">
                <Sparkles className="h-4 w-4" />
                Smart, secure and transparent
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">
                Invest with confidence
              </h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">
                Discover vetted opportunities, monitor performance, and grow your wealth with professional-grade tools.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gradient" size="lg"><Wallet2 /> Deposit</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deposit funds</DialogTitle>
                      <DialogDescription>Top up your wallet to invest instantly.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input inputMode="numeric" placeholder="Amount (₦)" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} />
                      <Button
                        onClick={() => {
                          const amt = Number(amountInput);
                          if (Number.isNaN(amt) || amt <= 0) return toast.error("Enter a valid amount");
                          handleDeposit(amt);
                          setAmountInput("");
                          setDepositOpen(false);
                        }}
                      >Confirm deposit</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg"><ArrowDownUp /> Withdraw</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw funds</DialogTitle>
                      <DialogDescription>Move money from your wallet to your bank.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input inputMode="numeric" placeholder="Amount (₦)" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} />
                      <Button
                        onClick={() => {
                          const amt = Number(amountInput);
                          if (Number.isNaN(amt) || amt <= 0) return toast.error("Enter a valid amount");
                          handleWithdraw(amt);
                          setAmountInput("");
                          setWithdrawOpen(false);
                        }}
                      >Confirm withdraw</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <GlassCard className="p-4 md:p-6 min-w-[260px] animate-slide-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Wallet balance</p>
                  <p className="text-2xl md:text-3xl font-extrabold">{format(wallet)}</p>
                </div>
                <Wallet2 className="h-8 w-8 text-primary animate-glow" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total funded</p>
                  <p className="font-semibold">{format(totalFunded)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Avg return</p>
                  <p className="font-semibold">{avgReturn}%</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-10 space-y-6">
        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Projects</p>
                <p className="text-xl font-bold">{projects.length}</p>
              </div>
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="mt-2">
              <Progress value={totalTarget ? Math.min(100, Math.round((totalFunded / totalTarget) * 100)) : 0} />
              <p className="mt-1 text-[11px] text-muted-foreground">{format(totalFunded)} of {format(totalTarget)} raised</p>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg ROI</p>
                <p className="text-xl font-bold">{avgReturn}%</p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Across all listed opportunities</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Your projects</p>
                <p className="text-xl font-bold">{myPortfolioProjects.length}</p>
              </div>
              <UsersRound className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">You hold positions in these</p>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Risk</p>
                <p className="text-xl font-bold">Moderate</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Diversify across categories</p>
          </GlassCard>
        </div>

        {/* Performance Chart */}
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Performance</h2>
            </div>
            <Badge variant="secondary">Live</Badge>
          </div>
          <div className="mt-3">
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Area type="monotone" dataKey="invested" stroke="var(--color-invested)" fill="var(--color-invested)" fillOpacity={0.2} />
                <Area type="monotone" dataKey="wallet" stroke="var(--color-wallet)" fill="var(--color-wallet)" fillOpacity={0.15} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </div>
        </GlassCard>

        {/* Content Tabs */}
        <Tabs defaultValue="marketplace">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
          </TabsList>

          {/* Marketplace */}
          <TabsContent value="marketplace" className="mt-4">
            <GlassCard className="p-4">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All categories</SelectItem>
                        {categories.map((c) => (
                          <SelectItem key={c} value={String(c)}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="funded">Funded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Min return %" value={minReturn as any} onChange={(e) => setMinReturn(e.target.value ? Number(e.target.value) : "")} />
                  </div>
                </div>
                <div className="flex-1">
                  <Input placeholder="Search by title, description" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground">No opportunities match your filters.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map((p) => {
                    const percent = Math.min(100, Math.round((p.funded / p.target) * 100));
                    return (
                      <GlassCard key={p.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm">{p.title}</h3>
                              {p.status && (
                                <Badge variant={p.status === "approved" ? "secondary" : p.status === "funded" ? "default" : "outline"}>
                                  {p.status}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[12px] text-muted-foreground">{p.category} • {p.durationMonths}m</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{p.returnPercent}%</p>
                            <p className="text-[11px] text-muted-foreground">Target ROI</p>
                          </div>
                        </div>
                        <p className="text-xs mt-2 line-clamp-2">{p.description}</p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[11px]">
                            <span>{format(p.funded)}</span>
                            <span>{format(p.target)}</span>
                          </div>
                          <div className="mt-1 w-full bg-muted h-2 rounded overflow-hidden">
                            <div style={{ width: `${percent}%` }} className="h-2 bg-primary" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedProjectId(p.id); setInvestOpen(true); }}>
                            Invest
                          </Button>
                          {p.ownerId === user?.id && p.status === "pending" && (
                            <Button size="sm" variant="gradient" onClick={() => approveProject(p.id)}>Approve</Button>
                          )}
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </TabsContent>

          {/* Portfolio */}
          <TabsContent value="portfolio" className="mt-4">
            {myPortfolioProjects.length === 0 ? (
              <GlassCard className="p-6 text-sm text-muted-foreground">
                You have no investments yet. Explore opportunities in the Marketplace.
              </GlassCard>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {myPortfolioProjects.map((p) => {
                  const myAmt = investmentByProjectId.get(p.id) || 0;
                  const percent = Math.min(100, Math.round((p.funded / p.target) * 100));
                  return (
                    <GlassCard key={p.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm">{p.title}</h3>
                        <Badge variant="outline">{p.category}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Your position: <span className="font-semibold">{format(myAmt)}</span></p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span>{format(p.funded)} raised</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="mt-1 w-full bg-muted h-2 rounded overflow-hidden">
                          <div style={{ width: `${percent}%` }} className="h-2 bg-accent" />
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Button size="xs" variant="outline" onClick={() => { setSelectedProjectId(p.id); setInvestOpen(true); }}>Add funds</Button>
                        <Button size="xs" variant="ghost" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied"); }}>Share</Button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity" className="mt-4">
            <GlassCard className="p-4">
              <p className="text-sm font-semibold">Recent activity</p>
              <div className="mt-2 space-y-2 max-h-80 overflow-auto">
                {txs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No transactions</p>
                ) : (
                  txs.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium uppercase">{t.type}</p>
                        <p className="text-muted-foreground">{t.note}</p>
                      </div>
                      <div className={`font-semibold ${t.type === "deposit" ? "text-green-600" : t.type === "withdraw" ? "text-red-600" : "text-primary"}`}>{format(t.amount)}</div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          </TabsContent>

          {/* Create Campaign */}
          <TabsContent value="create" className="mt-4">
            <GlassCard className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <PlayCircle className="h-4 w-4" />
                <h2 className="text-sm font-semibold">Create fundraising campaign</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
                <Input placeholder="Target amount (₦)" value={target as any} onChange={(e) => setTarget(e.target.value ? Number(e.target.value) : "")} />
                <Input placeholder="Return % (e.g., 12)" value={returnPercent as any} onChange={(e) => setReturnPercent(e.target.value ? Number(e.target.value) : "")} />
                <Input placeholder="Duration (months)" value={durationMonths as any} onChange={(e) => setDurationMonths(e.target.value ? Number(e.target.value) : "")} />
              </div>
              <Textarea placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
              <Input placeholder="Pitch video URL (optional)" value={pitchUrl} onChange={(e) => setPitchUrl(e.target.value)} />
              <div className="flex gap-2">
                <Button variant="gradient" onClick={createProject}>Submit for approval</Button>
                <Button variant="outline" onClick={() => { setTitle(""); setDescription(""); setTarget(""); setCategory(""); setReturnPercent(10); setDurationMonths(12); setPitchUrl(""); }}>Reset</Button>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>

        {/* Invest dialog */}
        <Dialog open={investOpen} onOpenChange={setInvestOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invest in project</DialogTitle>
              <DialogDescription>Enter an amount to invest from your wallet.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Select value={selectedProjectId ?? ""} onValueChange={(v) => setSelectedProjectId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input inputMode="numeric" placeholder="Amount (₦)" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Available</span>
                <span className="font-semibold">{format(wallet)}</span>
              </div>
              <Button
                disabled={!selectedProjectId}
                onClick={() => {
                  const amt = Number(amountInput);
                  if (!selectedProjectId) return;
                  if (Number.isNaN(amt) || amt <= 0) return toast.error("Enter a valid amount");
                  investInProject(selectedProjectId, amt);
                  setAmountInput("");
                  setInvestOpen(false);
                }}
              >Confirm investment</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Invest;
