import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { getCurrentUser } from "@/utils/mockAuth";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, TrendingUp, Target, Clock, CheckCircle, AlertCircle, Percent, Download } from "lucide-react";

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
  }, [user?.id]);

  const userInvestments = useMemo(() => investments.filter((inv) => inv.userId === user?.id), [investments, user?.id]);

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
      roiPercentage: totalInvested > 0 ? Math.round((totalExpectedReturn / totalInvested) * 100) : 0,
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
        message: `Completed ${daysPassed}d ago`,
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
      message: `${daysRemaining}d remaining`,
    };
  };

  const handleGoBack = useCallback(() => {
    navigate("/invest");
  }, [navigate]);

  const handleClaimReturns = useCallback((investment: Investment) => {
    toast.success(`Claimed ${format(investment.expectedReturn)} returns! 🎉`);
  }, []);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={handleGoBack} className="flex-shrink-0" aria-label="Go back">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <h1 className="text-sm sm:text-lg font-bold truncate">Portfolio</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <GlassCard className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-sm text-muted-foreground">Total Invested</p>
                <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 truncate">{format(stats.totalInvested)}</p>
              </div>
              <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-sm text-muted-foreground">Expected Returns</p>
                <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 text-green-600 truncate">{format(stats.totalExpectedReturn)}</p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-sm text-muted-foreground">ROI</p>
                <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2 text-primary">{stats.roiPercentage}%</p>
              </div>
              <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                <Percent className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-sm text-muted-foreground">Active</p>
                <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2">{stats.activeInvestments}</p>
              </div>
              <div className="p-2 bg-secondary/20 rounded-lg flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-3 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-sm text-muted-foreground">Completed</p>
                <p className="text-lg sm:text-3xl font-bold mt-1 sm:mt-2">{stats.completedInvestments}</p>
              </div>
              <div className="p-2 bg-accent/20 rounded-lg flex-shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
              </div>
            </div>
          </GlassCard>
        </section>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", "active", "completed"].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "gradient" : "outline"}
              onClick={() => setFilter(f as any)}
              className="capitalize text-xs sm:text-sm whitespace-nowrap"
            >
              {f === "all" ? "All" : f === "active" ? "Active" : "Completed"}
            </Button>
          ))}
        </div>

        {/* Investments List */}
        {filteredInvestments.length === 0 ? (
          <GlassCard className="p-8 sm:p-12 text-center">
            <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-50" />
            <p className="text-xs sm:text-base text-muted-foreground mb-4">
              {filter === "all"
                ? "No investments yet."
                : filter === "active"
                ? "No active investments."
                : "No completed investments yet."}
            </p>
            <Button variant="outline" size="sm" onClick={() => navigate("/invest")} className="text-xs sm:text-sm">
              Explore Opportunities
            </Button>
          </GlassCard>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredInvestments.map((investment) => {
              const statusInfo = getInvestmentStatus(investment);
              return (
                <GlassCard key={investment.id} className="p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm sm:text-lg truncate">{investment.projectTitle}</h3>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                          {new Date(investment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-[11px] sm:text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${
                          statusInfo.status === "active" ? "bg-secondary/20 text-secondary" : "bg-green-500/20 text-green-600"
                        }`}
                      >
                        {statusInfo.status === "active" ? "Active" : "Completed"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                      <div>
                        <p className="text-muted-foreground text-[10px] sm:text-xs">Amount</p>
                        <p className="font-bold text-sm sm:text-base">{format(investment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] sm:text-xs">Return Rate</p>
                        <p className="font-bold text-sm sm:text-base text-primary">{investment.returnPercent}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] sm:text-xs">Expected Return</p>
                        <p className="font-bold text-sm sm:text-base text-green-600">{format(investment.expectedReturn)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] sm:text-xs">Duration</p>
                        <p className="font-bold text-sm sm:text-base">{investment.durationMonths}m</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] sm:text-xs">
                        <span className="text-muted-foreground">{statusInfo.message}</span>
                        <span className="font-semibold">{statusInfo.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${statusInfo.progressPercent}%` }}
                          className="h-2 bg-gradient-to-r from-primary to-accent transition-all duration-300"
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs sm:text-sm"
                      onClick={() => handleClaimReturns(investment)}
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      {statusInfo.status === "completed" ? "Claim Returns" : "View Details"}
                    </Button>
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
