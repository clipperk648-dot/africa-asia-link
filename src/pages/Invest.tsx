import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { getCurrentUser } from "@/utils/mockAuth";
import { getBalance } from "@/utils/wallet";
import ThreeBackground from "@/components/ThreeBackground";
import { TrendingUp, Target, Users, ArrowRight, Star, Clock, Zap, Plus, ArrowDown, Search, Filter } from "lucide-react";

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

const ProjectCard = ({ project, onInvest }: { project: Project; onInvest: (id: string) => void }) => {
  const percent = Math.min(100, Math.round((project.funded / project.target) * 100));
  const daysLeft = Math.max(0, Math.floor(Math.random() * 30) + 5);

  return (
    <GlassCard className="p-4 sm:p-5 flex flex-col h-full hover:shadow-2xl transition-all duration-300">
      <div className="relative mb-4 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 bg-gradient-to-br from-primary/40 to-accent/40 rounded-t-2xl h-40 flex items-center justify-center overflow-hidden">
        {project.image ? (
          <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/40 text-5xl">📊</div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-sm sm:text-base line-clamp-2 flex-1">{project.title}</h3>
          <span className={`px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${project.status === "approved" ? "bg-green-500/20 text-green-600" : project.status === "pending" ? "bg-yellow-500/20 text-yellow-600" : "bg-primary/20 text-primary"}`}>
            {project.status === "pending" ? "Pending" : project.status === "approved" ? "Live" : "Funded"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>

        <div className="flex items-center gap-3 text-xs mb-4">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-primary">{project.returnPercent}%</span>
            <span className="text-muted-foreground">Returns</span>
          </div>
          <div className="h-1 w-px bg-border"></div>
          <div className="flex items-center gap-1">
            <span className="font-semibold">{project.durationMonths}</span>
            <span className="text-muted-foreground">Months</span>
          </div>
        </div>

        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{percent}%</span>
          </div>
          <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
            <div style={{ width: `${percent}%` }} className="h-2 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300" />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{format(project.funded)}</span>
            <span>{format(project.target)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
          <Clock className="w-3 h-3" />
          <span>{daysLeft} days left</span>
        </div>
      </div>

      <Button onClick={() => onInvest(project.id)} disabled={project.status === "pending"} className="w-full" variant={project.status === "approved" ? "gradient" : "outline"}>
        <ArrowRight className="w-4 h-4 mr-2" />
        {project.status === "pending" ? "Pending Approval" : "Invest Now"}
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
  }, [user, navigate]);

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

  const investInProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const amountStr = prompt(`Enter investment amount in ₦ for "${project.title}":\n\nMax available: ${format(walletBalance)}`);
    if (!amountStr) return;

    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }
    if (amount > walletBalance) {
      toast.error("Insufficient wallet balance. Please deposit funds.");
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

    toast.success(`Successfully invested ${format(amount)} in ${project.title}! 🎉`);
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h1 className="text-base sm:text-lg font-bold">Investment Hub</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/invest/analytics">
              <Button variant="outline" size="sm">Analytics</Button>
            </Link>
            {userRole === "investor" && (
              <Link to="/invest/portfolio">
                <Button variant="outline" size="sm">Portfolio</Button>
              </Link>
            )}
            {userRole === "fundraiser" && (
              <Link to="/invest/create">
                <Button variant="gradient" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Create Campaign
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold">Welcome, {user?.name?.split(" ")[0]}! 👋</h2>
            <p className="text-muted-foreground">Discover investment opportunities and grow your wealth</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-2">{format(walletBalance)}</p>
                </div>
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </div>
              <Link to="/wallet">
                <Button variant="ghost" size="sm" className="mt-4 w-full">
                  Manage Wallet
                </Button>
              </Link>
            </GlassCard>

            {userRole === "investor" && (
              <>
                <GlassCard className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Invested</p>
                      <p className="text-2xl sm:text-3xl font-bold mt-2">{format(totalInvested)}</p>
                    </div>
                    <div className="p-2 bg-secondary/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-secondary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">In {userInvestments.length} projects</p>
                </GlassCard>

                <GlassCard className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Expected Returns</p>
                      <p className="text-2xl sm:text-3xl font-bold mt-2 text-green-600">{format(totalExpectedReturn)}</p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Estimated earnings</p>
                </GlassCard>

                <GlassCard className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Active Projects</p>
                      <p className="text-2xl sm:text-3xl font-bold mt-2">{projects.filter((p) => p.status === "approved").length}</p>
                    </div>
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <Star className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Ready to invest</p>
                </GlassCard>
              </>
            )}

            {userRole === "fundraiser" && (
              <>
                <GlassCard className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Funded</p>
                      <p className="text-2xl sm:text-3xl font-bold mt-2">{format(totalProjectsFunded)}</p>
                    </div>
                    <div className="p-2 bg-secondary/20 rounded-lg">
                      <ArrowDown className="w-5 h-5 text-secondary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">From {userProjects.length} campaigns</p>
                </GlassCard>

                <GlassCard className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Active Campaigns</p>
                      <p className="text-2xl sm:text-3xl font-bold mt-2">{userProjects.filter((p) => p.status === "approved").length}</p>
                    </div>
                    <div className="p-2 bg-accent/20 rounded-lg">
                      <Zap className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Seeking investors</p>
                </GlassCard>

                <GlassCard className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Investors</p>
                      <p className="text-2xl sm:text-3xl font-bold mt-2">{new Set(investments.filter((inv) => userProjects.map((p) => p.id).includes(inv.projectId)).map((inv) => inv.userId)).size}</p>
                    </div>
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Backing your campaigns</p>
                </GlassCard>
              </>
            )}
          </div>
        </section>

        {/* Browse/Filter Section */}
        {userRole === "investor" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-bold">Discover Opportunities</h3>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-1" />
                Advanced
              </Button>
            </div>

            <GlassCard className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
                <select className="px-3 py-2 border border-border rounded-lg bg-background text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select className="px-3 py-2 border border-border rounded-lg bg-background text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="approved">Live</option>
                  <option value="pending">Pending</option>
                  <option value="funded">Fully Funded</option>
                </select>
              </div>
            </GlassCard>

            {filtered.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No opportunities match your filters.</p>
                <Button variant="outline" onClick={() => { setFilterCategory(""); setFilterStatus(""); setSearchTerm(""); }}>
                  Clear filters
                </Button>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((p) => (
                  <ProjectCard key={p.id} project={p} onInvest={investInProject} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Fundraiser Section */}
        {userRole === "fundraiser" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-bold">Your Campaigns</h3>
              <Link to="/invest/create">
                <Button variant="gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </Link>
            </div>

            {userProjects.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">You haven't created any campaigns yet.</p>
                <Link to="/invest/create">
                  <Button variant="gradient">Create Your First Campaign</Button>
                </Link>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} onInvest={() => {}} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Featured Section */}
        {userRole === "investor" && (
          <section className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold">Featured Opportunities</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects
                .filter((p) => p.status === "approved")
                .sort((a, b) => (b.funded / b.target) - (a.funded / a.target))
                .slice(0, 2)
                .map((p) => (
                  <GlassCard key={p.id} className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-2">{p.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4">{p.description}</p>
                        <div className="flex items-center gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Return Rate</p>
                            <p className="text-lg font-bold text-primary">{p.returnPercent}%</p>
                          </div>
                          <div className="h-8 w-px bg-border" />
                          <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="text-lg font-bold">{p.durationMonths}m</p>
                          </div>
                          <div className="h-8 w-px bg-border" />
                          <div>
                            <p className="text-xs text-muted-foreground">Progress</p>
                            <p className="text-lg font-bold">{Math.round((p.funded / p.target) * 100)}%</p>
                          </div>
                        </div>
                        <Button onClick={() => investInProject(p.id)} className="w-full" variant="gradient">
                          Invest Now
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Invest;
