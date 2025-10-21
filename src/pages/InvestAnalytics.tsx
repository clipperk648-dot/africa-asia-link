import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/utils/mockAuth";
import ThreeBackground from "@/components/ThreeBackground";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ArrowLeft, TrendingUp, PieChartIcon, BarChart3 } from "lucide-react";

type Project = {
  id: string;
  ownerId: string | null;
  title: string;
  target: number;
  funded: number;
  category?: string;
  returnPercent?: number;
  status?: "pending" | "approved" | "funded";
  createdAt?: string;
};

type Investment = {
  id: string;
  userId: string;
  projectId: string;
  projectTitle: string;
  amount: number;
  returnPercent: number;
  date: string;
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

const loadInvestments = (): Investment[] => {
  try {
    const raw = localStorage.getItem(INVESTMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const format = (n: number) => `₦${n.toLocaleString()}`;

const InvestAnalytics = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "90d" | "all">("30d");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setProjects(loadProjects());
    setInvestments(loadInvestments());
  }, [user?.id]);

  const categoryData = useMemo(() => {
    const grouped: Record<string, { category: string; amount: number; count: number }> = {};
    projects.forEach((p) => {
      const cat = p.category || "Other";
      if (!grouped[cat]) {
        grouped[cat] = { category: cat, amount: 0, count: 0 };
      }
      grouped[cat].amount += p.funded;
      grouped[cat].count += 1;
    });
    return Object.values(grouped).sort((a, b) => b.amount - a.amount).slice(0, 6);
  }, [projects]);

  const investmentTrendData = useMemo(() => {
    const days: Record<string, { date: string; investments: number; amount: number }> = {};
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days[dateStr] = { date: dateStr, investments: 0, amount: 0 };
    }

    investments.forEach((inv) => {
      const invDate = new Date(inv.date);
      const dateStr = invDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (days[dateStr]) {
        days[dateStr].investments += 1;
        days[dateStr].amount += inv.amount;
      }
    });

    return Object.values(days);
  }, [investments]);

  const returnDistribution = useMemo(() => {
    const ranges = [
      { range: "0-5%", count: 0 },
      { range: "5-10%", count: 0 },
      { range: "10-15%", count: 0 },
      { range: "15-20%", count: 0 },
      { range: "20%+", count: 0 },
    ];

    projects.forEach((p) => {
      const ret = p.returnPercent || 0;
      if (ret <= 5) ranges[0].count++;
      else if (ret <= 10) ranges[1].count++;
      else if (ret <= 15) ranges[2].count++;
      else if (ret <= 20) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges.filter((r) => r.count > 0);
  }, [projects]);

  const statusData = useMemo(() => {
    const statusCounts = {
      pending: { name: "Pending", value: 0, color: "#f59e0b" },
      approved: { name: "Live", value: 0, color: "#10b981" },
      funded: { name: "Funded", value: 0, color: "#3b82f6" },
    };

    projects.forEach((p) => {
      const status = p.status || "pending";
      if (statusCounts[status as keyof typeof statusCounts]) {
        statusCounts[status as keyof typeof statusCounts].value++;
      }
    });

    return Object.values(statusCounts).filter((s) => s.value > 0);
  }, [projects]);

  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalFunded = projects.reduce((a, b) => a + b.funded, 0);
    const totalTarget = projects.reduce((a, b) => a + b.target, 0);
    const avgReturn = projects.length > 0 ? Math.round(projects.reduce((a, b) => a + (b.returnPercent || 0), 0) / projects.length) : 0;
    const successRate = totalTarget > 0 ? Math.round((totalFunded / totalTarget) * 100) : 0;
    const totalInvestors = new Set(investments.map((i) => i.userId)).size;
    const avgInvestment = investments.length > 0 ? Math.round(investments.reduce((a, b) => a + b.amount, 0) / investments.length) : 0;

    return { totalProjects, totalFunded, totalTarget, avgReturn, successRate, totalInvestors, avgInvestment };
  }, [projects, investments]);

  const handleGoBack = useCallback(() => {
    navigate("/invest");
  }, [navigate]);

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
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
              <h1 className="text-sm sm:text-lg font-bold truncate">Analytics</h1>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-0.5 flex-shrink-0">
              {["7d", "30d", "90d", "all"].map((t) => (
                <Button
                  key={t}
                  variant={timeframe === t ? "gradient" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(t as any)}
                  className="capitalize text-[11px] sm:text-xs whitespace-nowrap"
                >
                  {t === "all" ? "All" : t}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Key Metrics */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-2xl font-bold">Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
            <GlassCard className="p-3 sm:p-6">
              <p className="text-[11px] sm:text-sm text-muted-foreground">Projects</p>
              <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2">{stats.totalProjects}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">{projects.filter((p) => p.status === "approved").length} Active</p>
            </GlassCard>

            <GlassCard className="p-3 sm:p-6">
              <p className="text-[11px] sm:text-sm text-muted-foreground">Funded</p>
              <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 truncate">{format(stats.totalFunded)}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">{stats.successRate}% goal</p>
            </GlassCard>

            <GlassCard className="p-3 sm:p-6">
              <p className="text-[11px] sm:text-sm text-muted-foreground">Avg Return</p>
              <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 text-primary">{stats.avgReturn}%</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">Across projects</p>
            </GlassCard>

            <GlassCard className="p-3 sm:p-6">
              <p className="text-[11px] sm:text-sm text-muted-foreground">Investors</p>
              <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2">{stats.totalInvestors}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">Avg: {format(stats.avgInvestment)}</p>
            </GlassCard>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {investmentTrendData.length > 0 && (
            <GlassCard className="p-3 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="font-bold text-xs sm:text-lg truncate">Investment Trend</h3>
              </div>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={investmentTrendData} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {categoryData.length > 0 && (
            <GlassCard className="p-3 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="font-bold text-xs sm:text-lg truncate">By Category</h3>
              </div>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryData} margin={{ left: -20, right: 8, top: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="amount" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {returnDistribution.length > 0 && (
            <GlassCard className="p-3 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="font-bold text-xs sm:text-lg truncate">Return Distribution</h3>
              </div>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={returnDistribution} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="count" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}

          {statusData.length > 0 && (
            <GlassCard className="p-3 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <h3 className="font-bold text-xs sm:text-lg truncate">Status</h3>
              </div>
              <div className="overflow-x-auto">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          )}
        </section>

        {/* Top Performers */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-2xl font-bold">Top Projects</h2>
          <GlassCard className="p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {projects
                .sort((a, b) => b.funded - a.funded)
                .slice(0, 5)
                .map((project, idx) => (
                  <div key={project.id} className="flex items-center justify-between p-2 sm:p-3 bg-background/50 rounded text-xs sm:text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[11px] sm:text-xs">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{project.title}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{project.category}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-bold truncate">{format(project.funded)}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{Math.round((project.funded / project.target) * 100)}%</p>
                    </div>
                  </div>
                ))}
            </div>
          </GlassCard>
        </section>
      </main>
    </div>
  );
};

export default InvestAnalytics;
