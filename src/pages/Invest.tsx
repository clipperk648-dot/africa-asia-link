import React, { useEffect, useMemo, useState } from "react";
import ThreeBackground from "@/components/ThreeBackground";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { toast } from "@/components/ui/sonner";
import { getCurrentUser } from "@/utils/mockAuth";
import {
  Wallet as WalletIcon,
  TrendingUp,
  PiggyBank,
  Timer,
  Filter as FilterIcon,
  PlusCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search as SearchIcon,
  Rocket,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";

// Types

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

// Storage keys
const PROJECTS_KEY = "echina_projects_v1";
const WALLET_KEY = "echina_wallet_v1";
const TX_KEY = "echina_txs_v1";

// Persistence helpers
const loadProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const saveProjects = (items: Project[]) => localStorage.setItem(PROJECTS_KEY, JSON.stringify(items));

const loadWallet = (): number => {
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    return raw ? Number(raw) : 0;
  } catch {
    return 0;
  }
};
const saveWallet = (amt: number) => localStorage.setItem(WALLET_KEY, String(amt));

const loadTxs = (): Tx[] => {
  try {
    const raw = localStorage.getItem(TX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const saveTxs = (txs: Tx[]) => localStorage.setItem(TX_KEY, JSON.stringify(txs));

// Utils
const formatCurrency = (n: number) => `₦${n.toLocaleString()}`;
const toDay = (iso: string) => iso.slice(0, 10);

const Invest = () => {
  const user = getCurrentUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [wallet, setWallet] = useState<number>(0);
  const [txs, setTxs] = useState<Tx[]>([]);

  // Create campaign form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [returnPercent, setReturnPercent] = useState<number | "">(12);
  const [durationMonths, setDurationMonths] = useState<number | "">(12);
  const [pitchUrl, setPitchUrl] = useState("");

  // Overlays
  const [showCreate, setShowCreate] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [depositAmt, setDepositAmt] = useState<number | "">("");
  const [withdrawAmt, setWithdrawAmt] = useState<number | "">("");
  const [investOpen, setInvestOpen] = useState(false);
  const [investAmt, setInvestAmt] = useState<number | "">("");
  const [investProjectId, setInvestProjectId] = useState<string | null>(null);

  // Browsing/filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [minReturn, setMinReturn] = useState<number>(0);

  useEffect(() => {
    setProjects(loadProjects());
    setWallet(loadWallet());
    setTxs(loadTxs());
  }, []);

  useEffect(() => saveProjects(projects), [projects]);
  useEffect(() => saveWallet(wallet), [wallet]);
  useEffect(() => saveTxs(txs), [txs]);

  // Actions
  const handleCreateProject = () => {
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

    // reset and close
    setTitle("");
    setDescription("");
    setTarget("");
    setCategory("");
    setReturnPercent(12);
    setDurationMonths(12);
    setPitchUrl("");
    setShowCreate(false);

    toast.success("Project submitted for approval");
  };

  const handleDeposit = () => {
    if (depositAmt === "" || isNaN(Number(depositAmt)) || Number(depositAmt) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const amount = Number(depositAmt);
    setWallet((w) => w + amount);
    const tx: Tx = { id: Date.now().toString(36), type: "deposit", amount, date: new Date().toISOString(), note: "Wallet deposit" };
    setTxs((s) => [tx, ...s]);
    setDepositAmt("");
    setShowDeposit(false);
    toast.success(`Deposited ${formatCurrency(amount)}`);
  };

  const handleWithdraw = () => {
    if (withdrawAmt === "" || isNaN(Number(withdrawAmt)) || Number(withdrawAmt) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const amount = Number(withdrawAmt);
    if (amount > wallet) {
      toast.error("Insufficient balance");
      return;
    }
    setWallet((w) => w - amount);
    const tx: Tx = { id: Date.now().toString(36), type: "withdraw", amount, date: new Date().toISOString(), note: "Wallet withdrawal" };
    setTxs((s) => [tx, ...s]);
    setWithdrawAmt("");
    setShowWithdraw(false);
    toast.success(`Withdrew ${formatCurrency(amount)}`);
  };

  const openInvestFor = (projectId: string) => {
    setInvestProjectId(projectId);
    setInvestAmt("");
    setInvestOpen(true);
  };

  const handleInvest = () => {
    if (!investProjectId) return;
    if (investAmt === "" || isNaN(Number(investAmt)) || Number(investAmt) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const amount = Number(investAmt);
    if (amount > wallet) {
      toast.error("Insufficient wallet balance. Please deposit funds.");
      return;
    }

    const project = projects.find((p) => p.id === investProjectId);
    if (!project) return;

    setWallet((w) => w - amount);
    const tx: Tx = {
      id: Date.now().toString(36),
      type: "invest",
      amount,
      date: new Date().toISOString(),
      note: `Invested in ${project.title}`,
    };
    setTxs((s) => [tx, ...s]);
    setProjects((s) => s.map((p) => (p.id === investProjectId ? { ...p, funded: p.funded + amount } : p)));
    setInvestOpen(false);
    toast.success(`Invested ${formatCurrency(amount)} in ${project.title}`);
  };

  const approveProject = (id: string) => {
    setProjects((s) => s.map((p) => (p.id === id ? { ...p, status: "approved" } : p)));
    toast.success("Project approved");
  };

  // Derived values
  const categories = useMemo(() => Array.from(new Set(projects.map((p) => p.category || "General"))), [projects]);

  const filtered = projects.filter((p) => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (statusFilter && p.status !== (statusFilter as any)) return false;
    if (minReturn && Number(p.returnPercent || 0) < Number(minReturn)) return false;
    if (search && !`${p.title} ${p.description}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalFunded = projects.reduce((a, b) => a + b.funded, 0);
  const totalTarget = projects.reduce((a, b) => a + b.target, 0);
  const totalInvested = txs.filter((t) => t.type === "invest").reduce((a, b) => a + b.amount, 0);
  const activeProjects = projects.filter((p) => p.status !== "funded").length;
  const avgReturn = projects.length
    ? Math.round(
        projects.reduce((a, b) => a + Number(b.returnPercent || 0), 0) / projects.length,
      )
    : 0;

  const investByDate = useMemo(() => {
    const map = new Map<string, number>();
    txs
      .filter((t) => t.type === "invest")
      .forEach((t) => {
        const d = toDay(t.date);
        map.set(d, (map.get(d) || 0) + t.amount);
      });
    return Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, amount]) => ({ date, label: date.slice(5), amount }));
  }, [txs]);

  const statusDistribution = useMemo(() => {
    const counts = { pending: 0, approved: 0, funded: 0 } as Record<NonNullable<Project["status"]>, number>;
    projects.forEach((p) => {
      const key = (p.status || "pending") as NonNullable<Project["status"]>;
      counts[key] += 1;
    });
    return [
      { name: "Pending", value: counts.pending, color: "hsl(var(--muted-foreground))" },
      { name: "Approved", value: counts.approved, color: "hsl(var(--accent))" },
      { name: "Funded", value: counts.funded, color: "hsl(var(--primary))" },
    ];
  }, [projects]);

  return (
    <div className="min-h-screen relative pb-24">
      <ThreeBackground />
      <main className="relative max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Hero */}
        <section className="rounded-3xl overflow-hidden border bg-gradient-hero shadow-[var(--shadow-soft)]">
          <div className="p-6 md:p-10 grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Beta</Badge>
                <span className="text-xs text-muted-foreground">Secure • Transparent • High-ROI</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Invest with confidence in vetted opportunities
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                Discover, fund, and track real projects with clear return timelines and fast wallet flows.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Dialog open={showCreate} onOpenChange={setShowCreate}>
                  <DialogTrigger asChild>
                    <Button variant="gradient" size="lg" className="gap-2">
                      <Rocket className="size-4" /> Launch a campaign
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Launch a fundraising campaign</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input aria-label="Title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          aria-label="Category"
                          placeholder="Category (e.g., Agriculture)"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        />
                        <Input
                          aria-label="Target amount"
                          placeholder="Target amount (₦)"
                          value={target as any}
                          onChange={(e) => setTarget(e.target.value ? Number(e.target.value) : "")}
                        />
                        <Input
                          aria-label="Return percent"
                          placeholder="Return % (e.g., 12)"
                          value={returnPercent as any}
                          onChange={(e) => setReturnPercent(e.target.value ? Number(e.target.value) : "")}
                        />
                        <Input
                          aria-label="Duration months"
                          placeholder="Duration (months)"
                          value={durationMonths as any}
                          onChange={(e) => setDurationMonths(e.target.value ? Number(e.target.value) : "")}
                        />
                      </div>
                      <Textarea aria-label="Short description" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
                      <Input aria-label="Pitch video URL" placeholder="Pitch video URL (optional)" value={pitchUrl} onChange={(e) => setPitchUrl(e.target.value)} />
                    </div>
                    <DialogFooter>
                      <div className="flex w-full justify-end gap-2">
                        <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                        <Button variant="gradient" onClick={handleCreateProject}>Submit for approval</Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showDeposit} onOpenChange={setShowDeposit}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="gap-2"><ArrowDownToLine className="size-4" /> Deposit</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Deposit funds</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input aria-label="Deposit amount" placeholder="Amount (₦)" value={depositAmt as any} onChange={(e) => setDepositAmt(e.target.value ? Number(e.target.value) : "")} />
                    </div>
                    <DialogFooter>
                      <div className="flex w-full justify-end gap-2">
                        <Button variant="ghost" onClick={() => setShowDeposit(false)}>Cancel</Button>
                        <Button variant="gradient" onClick={handleDeposit}>Deposit</Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="lg" className="gap-2"><ArrowUpFromLine className="size-4" /> Withdraw</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw funds</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input aria-label="Withdraw amount" placeholder="Amount (₦)" value={withdrawAmt as any} onChange={(e) => setWithdrawAmt(e.target.value ? Number(e.target.value) : "")} />
                    </div>
                    <DialogFooter>
                      <div className="flex w-full justify-end gap-2">
                        <Button variant="ghost" onClick={() => setShowWithdraw(false)}>Cancel</Button>
                        <Button variant="gradient" onClick={handleWithdraw}>Withdraw</Button>
                      </div>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="md:col-span-1">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <WalletIcon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs text-muted-foreground">Wallet balance</p>
                      <p className="text-xl md:text-2xl font-extrabold">{formatCurrency(wallet)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowDeposit(true)}>Deposit</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowWithdraw(true)}>Withdraw</Button>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total invested</p>
                <p className="text-xl font-bold">{formatCurrency(totalInvested)}</p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground">
                <TrendingUp className="size-5" />
              </span>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total funded</p>
                <p className="text-xl font-bold">{formatCurrency(totalFunded)}</p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <PiggyBank className="size-5" />
              </span>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active projects</p>
                <p className="text-xl font-bold">{activeProjects}</p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15 text-secondary-foreground">
                <Timer className="size-5" />
              </span>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg. return</p>
                <p className="text-xl font-bold">{avgReturn}%</p>
              </div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground/70">
                <LineChartIcon className="size-5" />
              </span>
            </div>
          </GlassCard>
        </section>

        {/* Insights */}
        <section className="grid lg:grid-cols-3 gap-4">
          <GlassCard className="p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <LineChartIcon className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Investment activity</h2>
              </div>
              <span className="text-xs text-muted-foreground">by day</span>
            </div>
            <ChartContainer
              className="h-56"
              config={{ amount: { label: "Invested", color: "hsl(var(--primary))" } }}
            >
              {() => (
                <BarChart data={investByDate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={[6, 6, 0, 0]} />
                </BarChart>
              )}
            </ChartContainer>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChartIcon className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Project statuses</h2>
            </div>
            <div className="h-56">
              <PieChart>
                <Pie data={statusDistribution} dataKey="value" nameKey="name" outerRadius={80} innerRadius={50}>
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="mt-2 flex justify-center gap-4 text-xs text-muted-foreground">
              {statusDistribution.map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: s.color }} />
                  {s.name} ({s.value})
                </div>
              ))}
            </div>
          </GlassCard>
        </section>

        {/* Discover */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FilterIcon className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Discover opportunities</h2>
            </div>
            <span className="text-xs text-muted-foreground">{filtered.length} result{filtered.length === 1 ? "" : "s"}</span>
          </div>

          <GlassCard className="p-4">
            <div className="grid md:grid-cols-5 gap-3 items-center">
              <div className="md:col-span-2">
                <div className="relative">
                  <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input aria-label="Search" placeholder="Search by title or description" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>

              <div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger aria-label="Category"><SelectValue placeholder="All categories" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      <SelectItem value="">All</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger aria-label="Status"><SelectValue placeholder="All statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="funded">Funded</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-1">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Min return</span>
                    <span>{minReturn}%</span>
                  </div>
                  <Slider value={[minReturn]} max={40} step={1} onValueChange={(v) => setMinReturn(v[0] ?? 0)} />
                </div>
              </div>
            </div>
          </GlassCard>

          {filtered.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No opportunities match your filters. Try adjusting filters or <button className="underline" onClick={() => setShowCreate(true)}>launch a campaign</button>.</p>
            </GlassCard>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => {
                const percent = Math.min(100, Math.round((p.funded / p.target) * 100));
                return (
                  <GlassCard key={p.id} className="p-4 group">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold leading-tight">
                          {p.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          {p.status && (
                            <Badge variant={p.status === "approved" ? "secondary" : p.status === "funded" ? "default" : "outline"}>{p.status}</Badge>
                          )}
                          {p.category && <Badge variant="outline">{p.category}</Badge>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{p.returnPercent}%</div>
                        <div className="text-xs text-muted-foreground">ROI • {p.durationMonths ?? 12}m</div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{p.description}</p>

                    <div className="mt-4">
                      <Progress value={percent} />
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{formatCurrency(p.funded)} raised</span>
                        <span className="font-medium">{formatCurrency(p.target)}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {percent}% funded
                      </div>
                      <div className="flex gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => openInvestFor(p.id)}>Invest</Button>
                            </TooltipTrigger>
                            <TooltipContent>Invest from your wallet</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {p.ownerId === user?.id && p.status === "pending" && (
                          <Button size="sm" variant="gradient" onClick={() => approveProject(p.id)}>Approve</Button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent activity */}
        <section>
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <WalletIcon className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Recent activity</h2>
            </div>
            <div className="space-y-2 max-h-64 overflow-auto scrollbar-hide">
              {txs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No transactions yet</p>
              ) : (
                txs.slice(0, 10).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium">{t.type.toUpperCase()}</p>
                      <p className="text-muted-foreground">{t.note}</p>
                    </div>
                    <div
                      className={
                        t.type === "deposit"
                          ? "font-semibold text-green-600"
                          : t.type === "withdraw"
                            ? "font-semibold text-red-600"
                            : "font-semibold text-primary"
                      }
                    >
                      {formatCurrency(t.amount)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </section>
      </main>

      {/* Invest dialog */}
      <Dialog open={investOpen} onOpenChange={setInvestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invest in project</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input aria-label="Investment amount" placeholder="Amount (₦)" value={investAmt as any} onChange={(e) => setInvestAmt(e.target.value ? Number(e.target.value) : "")} />
            <p className="text-xs text-muted-foreground">Available: {formatCurrency(wallet)}</p>
          </div>
          <DialogFooter>
            <div className="flex w-full justify-end gap-2">
              <Button variant="ghost" onClick={() => setInvestOpen(false)}>Cancel</Button>
              <Button variant="gradient" onClick={handleInvest}>Invest</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invest;
