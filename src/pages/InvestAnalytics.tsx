import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/utils/mockAuth";
import ThreeBackground from "@/components/ThreeBackground";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ArrowLeft, TrendingUp, PieChart as PieChartIcon, BarChart3, Calendar } from "lucide-react";

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

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316"];

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

  // Chart Data: Funding by Category
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
    return Object.values(grouped).sort((a, b) => b.amount - a.amount);
  }, [projects]);

  // Chart Data: Investment Trend (Last 30 days)
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

  // Chart Data: Return Distribution
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

    return ranges;
  }, [projects]);

  // Chart Data: Project Status Distribution
  const statusData = useMemo(() => {
    const statusCounts = {
      pending: { name: "Pending", value: 0, color: "#f59e0b" },
      approved: { name: "Live", value: 0, color: "#10b981" },
      funded: { name: "Fully Funded", value: 0, color: "#3b82f6" },
    };

    projects.forEach((p) => {
      const status = p.status || "pending";
      if (statusCounts[status as keyof typeof statusCounts]) {
        statusCounts[status as keyof typeof statusCounts].value++;
      }
    });

    return Object.values(statusCounts).filter((s) => s.value > 0);
  }, [projects]);

  // Statistics
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

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/invest")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-base sm:text-lg font-bold">Analytics Dashboard</h1>
          </div>
          <div className="flex gap-2">
            {["7d", "30d", "90d", "all"].map((t) => (
              <Button key={t} variant={timeframe === t ? "gradient" : "outline"} size="sm" onClick={() => setTimeframe(t as any)} className="capitalize">
                {t === "all" ? "All" : t}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Key Metrics */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Platform Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Projects</p>
              <p className="text-2xl sm:text-3xl font-bold mt-2">{stats.totalProjects}</p>
              <p className="text-xs text-muted-foreground mt-3">{projects.filter((p) => p.status === "approved").length} Active</p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Funded</p>
              <p className="text-2xl sm:text-3xl font-bold mt-2">{format(stats.totalFunded)}</p>
              <p className="text-xs text-muted-foreground mt-3">{stats.successRate}% of target</p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-muted-foreground">Avg Return Rate</p>
              <p className="text-2xl sm:text-3xl font-bold mt-2 text-primary">{stats.avgReturn}%</p>
              <p className="text-xs text-muted-foreground mt-3">Across {stats.totalProjects} projects</p>
            </GlassCard>

            <GlassCard className="p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-muted-foreground">Total Investors</p>
              <p className="text-2xl sm:text-3xl font-bold mt-2">{stats.totalInvestors}</p>
              <p className="text-xs text-muted-foreground mt-3">Avg: {format(stats.avgInvestment)}</p>
            </GlassCard>
          </div>
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Investment Trend */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Investment Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={investmentTrendData} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="amount" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Funding by Category */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Funding by Category</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData} margin={{ left: 0, right: 8, top: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }} />
                <Bar dataKey="amount" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Return Distribution */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Return Distribution</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={returnDistribution} margin={{ left: 0, right: 8, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }} />
                <Bar dataKey="count" fill="hsl(var(--accent))" />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Project Status */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Project Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </section>

        {/* Detailed Tables */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Top Performers</h2>

          {/* Top Projects by Funding */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-4">Top Projects by Funding</h3>
            <div className="space-y-3">
              {projects
                .sort((a, b) => b.funded - a.funded)
                .slice(0, 5)
                .map((project, idx) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">{idx + 1}</div>
                      <div>
                        <p className="font-semibold text-sm">{project.title}</p>
                        <p className="text-xs text-muted-foreground">{project.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{format(project.funded)}</p>
                      <p className="text-xs text-muted-foreground">{Math.round((project.funded / project.target) * 100)}% funded</p>
                    </div>
                  </div>
                ))}
            </div>
          </GlassCard>

          {/* Top Investors */}
          {investments.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="font-bold text-lg mb-4">Most Active Investors</h3>
              <div className="space-y-3">
                {Object.entries(
                  investments.reduce(
                    (acc, inv) => {
                      if (!acc[inv.userId]) {
                        acc[inv.userId] = { userId: inv.userId, count: 0, total: 0 };
                      }
                      acc[inv.userId].count += 1;
                      acc[inv.userId].total += inv.amount;
                      return acc;
                    },
                    {} as Record<string, { userId: string; count: number; total: number }>
                  )
                )
                  .sort((a, b) => b[1].total - a[1].total)
                  .slice(0, 5)
                  .map(([userId, data], idx) => (
                    <div key={userId} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary font-bold flex items-center justify-center text-sm">{idx + 1}</div>
                        <div>
                          <p className="font-semibold text-sm">Investor #{userId.slice(0, 6)}</p>
                          <p className="text-xs text-muted-foreground">{data.count} investments</p>
                        </div>
                      </div>
                      <p className="font-bold">{format(data.total)}</p>
                    </div>
                  ))}
              </div>
            </GlassCard>
          )}
        </section>
      </main>
    </div>
  );
};

export default InvestAnalytics;
