import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { getCurrentUser } from "@/utils/mockAuth";
import { getBalance } from "@/utils/wallet";
import ThreeBackground from "@/components/ThreeBackground";
import { TrendingUp, Target, Users, ArrowRight, Star, Clock, Zap, Plus, ArrowDown, Search, Filter, ArrowLeft, Shield, AlertCircle } from "lucide-react";

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
  createdAt?: string;
  image?: string;
  riskLevel?: "low" | "medium" | "high";
  verified?: boolean;
};

type Investment = {
  id: string;
  userId: string;
  projectId: string;
  projectTitle: string;
  amount: number;
  returnPercent: number;
  durationMonths: number;
  date: string;
  expectedReturn: number;
};

const PROJECTS_KEY = "echina_projects_v1";
const INVESTMENTS_KEY = "echina_investments_v1";

const loadProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveProjects = (items: Project[]) => localStorage.setItem(PROJECTS_KEY, JSON.stringify(items));

const loadInvestments = (): Investment[] => {
  try {
    const raw = localStorage.getItem(INVESTMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveInvestments = (items: Investment[]) => localStorage.setItem(INVESTMENTS_KEY, JSON.stringify(items));

const format = (n: number) => `₦${n.toLocaleString()}`;

const getRiskColor = (risk?: string) => {
  switch (risk) {
    case "low":
      return "text-green-600 bg-green-500/20";
    case "medium":
      return "text-yellow-600 bg-yellow-500/20";
    case "high":
      return "text-red-600 bg-red-500/20";
    default:
      return "text-blue-600 bg-blue-500/20";
  }
};

const ProjectCard = ({ project, onInvest }: { project: Project; onInvest: (id: string) => void }) => {
  const percent = Math.min(100, Math.round((project.funded / project.target) * 100));
  const daysLeft = Math.max(0, Math.floor(Math.random() * 30) + 5);

  return (
    <GlassCard className="p-3 sm:p-4 flex flex-col h-full hover:shadow-2xl transition-all duration-300">
      <div className="relative mb-3 -mx-3 -mt-3 sm:-mx-4 sm:-mt-4 bg-gradient-to-br from-primary/40 to-accent/40 rounded-t-2xl h-32 sm:h-40 flex items-center justify-center overflow-hidden">
        {project.image ? (
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-3xl sm:text-5xl">📊</div>
        )}
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xs sm:text-sm line-clamp-2">{project.title}</h3>
            {project.verified && (
              <div className="flex items-center gap-1 mt-1">
                <Shield className="w-3 h-3 text-green-600" />
                <span className="text-[10px] text-green-600 font-semibold">Verified</span>
              </div>
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${project.status === "approved" ? "bg-green-500/20 text-green-600" : project.status === "pending" ? "bg-yellow-500/20 text-yellow-600" : "bg-primary/20 text-primary"}`}>
            {project.status === "pending" ? "Pending" : project.status === "approved" ? "Live" : "Funded"}
          </span>
        </div>

        <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-2">{project.description}</p>

        <div className="flex items-center gap-2 text-[11px] sm:text-xs flex-wrap">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-primary">{project.returnPercent}%</span>
            <span className="text-muted-foreground">Return</span>
          </div>
          <div className="h-1 w-px bg-border"></div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">{project.durationMonths}m</span>
          </div>
          {project.riskLevel && (
            <>
              <div className="h-1 w-px bg-border"></div>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${getRiskColor(project.riskLevel)}`}>{project.riskLevel}</span>
            </>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{percent}%</span>
          </div>
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
            <div style={{ width: `${percent}%` }} className="h-1.5 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{format(project.funded)}</span>
            <span>{format(project.target)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{daysLeft}d left</span>
        </div>
      </div>

      <Button onClick={() => onInvest(project.id)} disabled={project.status === "pending"} className="w-full text-xs sm:text-sm mt-3" variant={project.status === "approved" ? "gradient" : "outline"}>
        <ArrowRight className="w-3 h-3 mr-1" />
        {project.status === "pending" ? "Pending" : "Invest"}
      </Button>
    </GlassCard>
  );
};

const Invest = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [userRole, setUserRole] = useState<"investor" | "fundraiser" | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setProjects(loadProjects());
    setInvestments(loadInvestments());
    setWalletBalance(getBalance(user.id, "NGN"));
    setUserRole(user.role === "industry" ? "fundraiser" : "investor");
  }, [user?.id]);

  useEffect(() => saveProjects(projects), [projects]);
  useEffect(() => saveInvestments(investments), [investments]);

  const categories = useMemo(() => Array.from(new Set(projects.map((p) => p.category || "General"))), [projects]);

  const filtered = projects.filter((p) => {
    if (filterCategory && p.category !== filterCategory) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    if (searchTerm && !p.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const userInvestments = investments.filter((inv) => inv.userId === user?.id);
  const userProjects = projects.filter((p) => p.ownerId === user?.id);

  const totalInvested = userInvestments.reduce((a, b) => a + b.amount, 0);
  const totalExpectedReturn = userInvestments.reduce((a, b) => a + b.expectedReturn, 0);
  const totalProjectsFunded = userProjects.reduce((a, b) => a + b.funded, 0);

  const investInProject = useCallback((projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const amountStr = prompt(`Invest in "${project.title}"\n\nMax available: ${format(walletBalance)}`);
    if (!amountStr) return;

    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }
    if (amount > walletBalance) {
      toast.error("Insufficient wallet balance");
      return;
    }

    const investment: Investment = {
      id: Date.now().toString(36),
      userId: user!.id,
      projectId,
      projectTitle: project.title,
      amount,
      returnPercent: project.returnPercent || 10,
      durationMonths: project.durationMonths || 12,
      date: new Date().toISOString(),
      expectedReturn: Math.round((amount * (project.returnPercent || 10)) / 100),
    };

    setInvestments((s) => [investment, ...s]);
    setProjects((s) => s.map((p) => (p.id === projectId ? { ...p, funded: p.funded + amount } : p)));
    setWalletBalance((w) => w - amount);

    toast.success(`Invested ${format(amount)}! 🎉`);
  }, [projects, user?.id, walletBalance]);

  const handleGoBack = useCallback(() => {
    navigate(userRole === "fundraiser" ? "/industry" : "/buyer");
  }, [userRole, navigate]);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button variant="ghost" size="icon" onClick={handleGoBack} className="flex-shrink-0" aria-label="Go back">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <h1 className="text-sm sm:text-lg font-bold truncate">Investment Hub</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Link to="/invest/analytics">
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">Analytics</Button>
              </Link>
              {userRole === "investor" && (
                <Link to="/invest/portfolio">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">Portfolio</Button>
                </Link>
              )}
              {userRole === "fundraiser" && (
                <Link to="/invest/create">
                  <Button variant="gradient" size="sm" className="text-xs sm:text-sm">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Create</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <section className="space-y-3 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-2xl sm:text-4xl font-bold">Welcome, {user?.name?.split(" ")[0]}! 👋</h2>
            <p className="text-xs sm:text-base text-muted-foreground">Grow your wealth with investment opportunities</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <GlassCard className="p-3 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] sm:text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 truncate">{format(walletBalance)}</p>
                </div>
                <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
              </div>
              <Link to="/wallet">
                <Button variant="ghost" size="sm" className="mt-3 sm:mt-4 w-full text-xs">
                  Manage
                </Button>
              </Link>
            </GlassCard>

            {userRole === "investor" && (
              <>
                <GlassCard className="p-3 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-sm text-muted-foreground">Total Invested</p>
                      <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 truncate">{format(totalInvested)}</p>
                    </div>
                    <div className="p-2 bg-secondary/20 rounded-lg flex-shrink-0">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">{userInvestments.length} projects</p>
                </GlassCard>

                <GlassCard className="p-3 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-sm text-muted-foreground">Expected Returns</p>
                      <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 text-green-600 truncate">{format(totalExpectedReturn)}</p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">Estimated earnings</p>
                </GlassCard>

                <GlassCard className="p-3 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-sm text-muted-foreground">Active Projects</p>
                      <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2">{projects.filter((p) => p.status === "approved").length}</p>
                    </div>
                    <div className="p-2 bg-accent/20 rounded-lg flex-shrink-0">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">Ready to invest</p>
                </GlassCard>
              </>
            )}

            {userRole === "fundraiser" && (
              <>
                <GlassCard className="p-3 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-sm text-muted-foreground">Total Funded</p>
                      <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 truncate">{format(totalProjectsFunded)}</p>
                    </div>
                    <div className="p-2 bg-secondary/20 rounded-lg flex-shrink-0">
                      <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">{userProjects.length} campaigns</p>
                </GlassCard>

                <GlassCard className="p-3 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-sm text-muted-foreground">Active Campaigns</p>
                      <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2">{userProjects.filter((p) => p.status === "approved").length}</p>
                    </div>
                    <div className="p-2 bg-accent/20 rounded-lg flex-shrink-0">
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">Seeking investors</p>
                </GlassCard>

                <GlassCard className="p-3 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-sm text-muted-foreground">Total Investors</p>
                      <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2">{new Set(investments.filter((inv) => userProjects.map((p) => p.id).includes(inv.projectId)).map((inv) => inv.userId)).size}</p>
                    </div>
                    <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">Backing you</p>
                </GlassCard>
              </>
            )}
          </div>
        </section>

        {/* Browse/Filter Section */}
        {userRole === "investor" && (
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg sm:text-2xl font-bold truncate">Opportunities</h3>
              <Button variant="outline" size="sm" className="text-xs sm:text-sm flex-shrink-0">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </div>

            <GlassCard className="p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 text-xs sm:text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select className="px-3 py-2 border border-border rounded-lg bg-background text-xs sm:text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select className="px-3 py-2 border border-border rounded-lg bg-background text-xs sm:text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="approved">Live</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </GlassCard>

            {filtered.length === 0 ? (
              <GlassCard className="p-8 sm:p-12 text-center">
                <p className="text-xs sm:text-base text-muted-foreground mb-4">No opportunities match your filters.</p>
                <Button variant="outline" size="sm" onClick={() => { setFilterCategory(""); setFilterStatus(""); setSearchTerm(""); }}>
                  Clear
                </Button>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} onInvest={investInProject} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Fundraiser Section */}
        {userRole === "fundraiser" && (
          <section className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg sm:text-2xl font-bold truncate">Your Campaigns</h3>
              <Link to="/invest/create">
                <Button variant="gradient" size="sm" className="text-xs sm:text-sm flex-shrink-0">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </Link>
            </div>

            {userProjects.length === 0 ? (
              <GlassCard className="p-8 sm:p-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-xs sm:text-base text-muted-foreground mb-4">No campaigns yet.</p>
                <Link to="/invest/create">
                  <Button variant="gradient" size="sm">Create Campaign</Button>
                </Link>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {userProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} onInvest={() => {}} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Risk Warning */}
        {userRole === "investor" && filtered.length > 0 && (
          <GlassCard className="p-3 sm:p-4 bg-yellow-500/10 border-yellow-500/30 flex gap-3">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs text-yellow-600">
              <strong>Risk Warning:</strong> Investment carries risk. Review each project's risk level and verified status before investing.
            </p>
          </GlassCard>
        )}
      </main>
    </div>
  );
};

export default Invest;
