import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { getCurrentUser } from "@/utils/mockAuth";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, TrendingUp, Target, Clock, CheckCircle, AlertCircle, Percent } from "lucide-react";

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

const INVESTMENTS_KEY = "echina_investments_v1";

const loadInvestments = (): Investment[] => {
  try {
    const raw = localStorage.getItem(INVESTMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const format = (n: number) => `₦${n.toLocaleString()}`;

const InvestPortfolio = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "buyer") {
      navigate("/invest");
      return;
    }
    setInvestments(loadInvestments());
  }, [user, navigate]);

  const userInvestments = useMemo(() => investments.filter((inv) => inv.userId === user?.id), [investments, user]);

  const filteredInvestments = useMemo(() => {
    const now = new Date();
    return userInvestments.filter((inv) => {
      const investDate = new Date(inv.date);
      const endDate = new Date(investDate);
      endDate.setMonth(endDate.getMonth() + inv.durationMonths);
      const isCompleted = now > endDate;

      if (filter === "active") return !isCompleted;
      if (filter === "completed") return isCompleted;
      return true;
    });
  }, [userInvestments, filter]);

  const stats = useMemo(() => {
    const totalInvested = userInvestments.reduce((a, b) => a + b.amount, 0);
    const totalExpectedReturn = userInvestments.reduce((a, b) => a + b.expectedReturn, 0);
    const activeCount = userInvestments.filter((inv) => {
      const investDate = new Date(inv.date);
      const endDate = new Date(investDate);
      endDate.setMonth(endDate.getMonth() + inv.durationMonths);
      return new Date() <= endDate;
    }).length;

    return {
      totalInvested,
      totalExpectedReturn,
      totalProfit: totalExpectedReturn,
      activeInvestments: activeCount,
      completedInvestments: userInvestments.length - activeCount,
      averageReturn: userInvestments.length > 0 ? Math.round(userInvestments.reduce((a, b) => a + b.returnPercent, 0) / userInvestments.length) : 0,
    };
  }, [userInvestments]);

  const getInvestmentStatus = (investment: Investment) => {
    const investDate = new Date(investment.date);
    const endDate = new Date(investDate);
    endDate.setMonth(endDate.getMonth() + investment.durationMonths);
    const now = new Date();

    if (now > endDate) {
      const daysPassed = Math.floor((now.getTime() - investDate.getTime()) / (1000 * 60 * 60 * 24));
      return {
        status: "completed" as const,
        daysRemaining: 0,
        progressPercent: 100,
        message: `Completed ${daysPassed} days ago`,
      };
    }

    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = investment.durationMonths * 30;
    const daysPassed = totalDays - daysRemaining;
    const progressPercent = Math.min(100, Math.round((daysPassed / totalDays) * 100));

    return {
      status: "active" as const,
      daysRemaining,
      progressPercent,
      message: `${daysRemaining} days remaining`,
    };
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/invest")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <TrendingUp className="w-5 h-5 text-primary" />
            <h1 className="text-base sm:text-lg font-bold">My Portfolio</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <GlassCard className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2">{format(stats.totalInvested)}</p>
              </div>
              <div className="p-2 bg-primary/20 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Expected Returns</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2 text-green-600">{format(stats.totalExpectedReturn)}</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Investments</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2">{stats.activeInvestments}</p>
              </div>
              <div className="p-2 bg-secondary/20 rounded-lg">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2">{stats.completedInvestments}</p>
              </div>
              <div className="p-2 bg-accent/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-accent" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Avg Return</p>
                <p className="text-2xl sm:text-3xl font-bold mt-2 text-primary">{stats.averageReturn}%</p>
              </div>
              <div className="p-2 bg-primary/20 rounded-lg">
                <Percent className="w-5 h-5 text-primary" />
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {["all", "active", "completed"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "gradient" : "outline"}
              onClick={() => setFilter(f as any)}
              className="capitalize"
            >
              {f === "all" ? "All Investments" : f === "active" ? "Active" : "Completed"}
            </Button>
          ))}
        </div>

        {/* Investments List */}
        {filteredInvestments.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              {filter === "all"
                ? "You haven't made any investments yet."
                : filter === "active"
                ? "No active investments."
                : "No completed investments yet."}
            </p>
            <Button variant="outline" onClick={() => navigate("/invest")}>
              Explore Opportunities
            </Button>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {filteredInvestments.map((investment) => {
              const statusInfo = getInvestmentStatus(investment);
              return (
                <GlassCard key={investment.id} className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <h3 className="font-bold text-base sm:text-lg mb-1">{investment.projectTitle}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Invested {new Date(investment.date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="font-bold text-sm">{format(investment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Return</p>
                        <p className="font-bold text-sm text-primary">{investment.returnPercent}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expected</p>
                        <p className="font-bold text-sm text-green-600">{format(investment.expectedReturn)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{statusInfo.message}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo.status === "active" ? "bg-secondary/20 text-secondary" : "bg-green-500/20 text-green-600"}`}>
                          {statusInfo.status === "active" ? "Active" : "Completed"}
                        </span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div style={{ width: `${statusInfo.progressPercent}%` }} className="h-2 bg-gradient-to-r from-primary to-accent transition-all duration-300" />
                      </div>
                      <p className="text-xs text-muted-foreground">{statusInfo.progressPercent}% Complete</p>
                    </div>

                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          if (statusInfo.status === "completed") {
                            toast.success(`Claimed ${format(investment.expectedReturn)} returns! 🎉`);
                          } else {
                            toast.info("Your investment is maturing. Returns will be available soon.");
                          }
                        }}
                      >
                        {statusInfo.status === "completed" ? "Claim Returns" : "View Details"}
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default InvestPortfolio;
