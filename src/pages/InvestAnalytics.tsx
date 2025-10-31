import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { ArrowLeft, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { getCurrentUser } from "@/utils/mockAuth";

const PROJECTS_KEY = "echina_projects_v1";
const WALLET_KEY = "echina_wallet_v1";
const TX_KEY = "echina_txs_v1";

const format = (n: number) => `$${n.toLocaleString()}`;

const InvestAnalytics = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const projects = useMemo(() => {
    try {
      const raw = localStorage.getItem(PROJECTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const txs = useMemo(() => {
    try {
      const raw = localStorage.getItem(TX_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const wallet = useMemo(() => {
    try {
      const raw = localStorage.getItem(WALLET_KEY);
      return raw ? Number(raw) : 0;
    } catch {
      return 0;
    }
  }, []);

  const userInvestments = useMemo(() => {
    return projects.flatMap((p: any) =>
      (p.investors || [])
        .filter((inv: any) => inv.userId === user?.id)
        .map((inv: any) => ({
          projectId: p.id,
          projectTitle: p.title,
          amount: inv.amount,
          returnPercent: p.returnPercent || 10,
          riskLevel: p.riskLevel || "medium",
          category: p.category || "General",
          status: p.status,
        }))
    );
  }, [projects, user?.id]);

  const totalInvested = userInvestments.reduce((a, b) => a + b.amount, 0);
  const totalExpectedReturn = userInvestments.reduce((a, b) => a + (b.amount * b.returnPercent / 100), 0);

  const investmentsByCategory = useMemo(() => {
    const map: { [key: string]: number } = {};
    userInvestments.forEach((inv) => {
      map[inv.category] = (map[inv.category] || 0) + inv.amount;
    });
    return Object.entries(map).map(([category, amount]) => ({ category, amount }));
  }, [userInvestments]);

  const investmentsByRisk = useMemo(() => {
    const map: { [key: string]: number } = {};
    userInvestments.forEach((inv) => {
      map[inv.riskLevel] = (map[inv.riskLevel] || 0) + inv.amount;
    });
    return Object.entries(map).map(([risk, amount]) => ({ risk, amount }));
  }, [userInvestments]);

  const monthlyActivity = useMemo(() => {
    const months: { [key: string]: number } = {};
    txs.forEach((tx: any) => {
      if (tx.type === "invest") {
        const date = new Date(tx.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        months[key] = (months[key] || 0) + tx.amount;
      }
    });
    return Object.entries(months).slice(-6).map(([month, amount]) => ({ month, amount }));
  }, [txs]);

  return (
    <div className="min-h-screen pb-32 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/invest")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Investment Analytics</h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-3 gap-4">
          <GlassCard className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Invested</p>
                <p className="text-3xl font-bold">{format(totalInvested)}</p>
                <p className="text-xs text-muted-foreground mt-2">{userInvestments.length} active investments</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Expected Returns</p>
                <p className="text-3xl font-bold text-green-600">{format(totalExpectedReturn)}</p>
                <p className="text-xs text-muted-foreground mt-2">{((totalExpectedReturn / totalInvested) * 100).toFixed(1)}% average return</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
                <p className="text-3xl font-bold">{format(wallet)}</p>
                <p className="text-xs text-muted-foreground mt-2">Ready to invest</p>
              </div>
              <PieChart className="w-8 h-8 text-accent opacity-50" />
            </div>
          </GlassCard>
        </div>

        {/* Breakdown Charts */}
        <div className="grid md:grid-cols-2 gap-4">
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4">Investments by Category</h2>
            {investmentsByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No category data available</p>
            ) : (
              <div className="space-y-3">
                {investmentsByCategory.map(({ category, amount }) => {
                  const percentage = (amount / totalInvested) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{category}</span>
                        <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded overflow-hidden">
                        <div style={{ width: `${percentage}%` }} className="h-2 bg-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{format(amount)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4">Investments by Risk Level</h2>
            {investmentsByRisk.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No risk data available</p>
            ) : (
              <div className="space-y-3">
                {investmentsByRisk.map(({ risk, amount }) => {
                  const percentage = (amount / totalInvested) * 100;
                  const colors = {
                    low: "bg-green-600",
                    medium: "bg-yellow-600",
                    high: "bg-red-600",
                  };
                  return (
                    <div key={risk}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{risk} Risk</span>
                        <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded overflow-hidden">
                        <div style={{ width: `${percentage}%` }} className={`h-2 ${colors[risk as keyof typeof colors]}`} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{format(amount)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Monthly Activity */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4">Monthly Investment Activity</h2>
          {monthlyActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity data available</p>
          ) : (
            <div className="space-y-3">
              {monthlyActivity.map(({ month, amount }) => (
                <div key={month}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{month}</span>
                    <span className="text-sm font-semibold">{format(amount)}</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded overflow-hidden">
                    <div style={{ width: "100%" }} className="h-2 bg-accent" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Investment Details */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4">Your Active Investments</h2>
          {userInvestments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No active investments</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-2 font-semibold">Project</th>
                    <th className="text-left py-2 px-2 font-semibold">Amount</th>
                    <th className="text-left py-2 px-2 font-semibold">Return %</th>
                    <th className="text-left py-2 px-2 font-semibold">Expected Return</th>
                    <th className="text-left py-2 px-2 font-semibold">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {userInvestments.map((inv) => (
                    <tr key={`${inv.projectId}-${inv.amount}`} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">{inv.projectTitle}</td>
                      <td className="py-3 px-2 font-medium">{format(inv.amount)}</td>
                      <td className="py-3 px-2">{inv.returnPercent}%</td>
                      <td className="py-3 px-2 text-green-600">{format((inv.amount * inv.returnPercent) / 100)}</td>
                      <td className="py-3 px-2 capitalize">{inv.riskLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
};

export default InvestAnalytics;
