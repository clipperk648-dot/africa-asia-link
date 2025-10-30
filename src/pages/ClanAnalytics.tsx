import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, TrendingUp, Users, Target, Calendar, BarChart3, PieChart as PieChartIcon } from "lucide-react";

const ClanAnalytics = () => {
  const navigate = useNavigate();
  const { clanId } = useParams<{ clanId: string }>();

  // Mock clan analytics data
  const clanData = {
    id: clanId || "clan-1",
    name: "Premium Electronics Collective",
    targetPrice: 15000,
    currentFunded: 8500,
    members: 4,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const analyticsData = {
    fundingVelocity: [
      { date: "Day 1", amount: 2000 },
      { date: "Day 2", amount: 1500 },
      { date: "Day 3", amount: 2000 },
      { date: "Day 4", amount: 1000 },
      { date: "Day 5", amount: 2000 },
    ],
    memberContributions: [
      { member: "Sarah Johnson", amount: 2500, percentage: 29.4 },
      { member: "Michael Chen", amount: 3000, percentage: 35.3 },
      { member: "Emily Davis", amount: 2000, percentage: 23.5 },
      { member: "John Smith", amount: 1000, percentage: 11.8 },
    ],
    statistics: {
      avgContribution: 2125,
      largestContribution: 3000,
      smallestContribution: 1000,
      daysRemaining: 25,
      fundingPercentage: 56.7,
      projectedDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    },
  };

  const progress = Math.min(100, Math.round((clanData.currentFunded / clanData.targetPrice) * 100));

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/clan/${clanId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Clan Analytics</h1>
              <p className="text-sm text-muted-foreground">{clanData.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-4 bg-gradient-to-br from-primary/10 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Funding Progress</p>
                <p className="text-2xl font-bold">{progress}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary opacity-50" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-gradient-to-br from-accent/10 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Funded</p>
                <p className="text-2xl font-bold">${(clanData.currentFunded / 1000).toFixed(1)}K</p>
              </div>
              <Target className="w-8 h-8 text-accent opacity-50" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-gradient-to-br from-secondary/10 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Active Members</p>
                <p className="text-2xl font-bold">{clanData.members}</p>
              </div>
              <Users className="w-8 h-8 text-secondary opacity-50" />
            </div>
          </GlassCard>

          <GlassCard className="p-4 bg-gradient-to-br from-destructive/10 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Days Left</p>
                <p className="text-2xl font-bold">{analyticsData.statistics.daysRemaining}</p>
              </div>
              <Calendar className="w-8 h-8 text-destructive opacity-50" />
            </div>
          </GlassCard>
        </div>

        {/* Funding Progress */}
        <GlassCard className="p-6 bg-card/50 border-border/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Funding Progress
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-sm font-semibold">${clanData.currentFunded.toLocaleString()} / ${clanData.targetPrice.toLocaleString()}</p>
              </div>
              <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Daily Funding */}
            <div className="mt-6">
              <p className="text-sm font-semibold mb-3">Daily Contributions</p>
              <div className="space-y-2">
                {analyticsData.fundingVelocity.map((day, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{day.date}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${(day.amount / 2000) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold min-w-12 text-right">${day.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Member Contributions */}
        <GlassCard className="p-6 bg-card/50 border-border/50">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-accent" />
            Member Contributions
          </h2>
          <div className="space-y-3">
            {analyticsData.memberContributions.map((contrib, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">{contrib.member}</p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${contrib.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${contrib.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{contrib.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Statistics */}
        <GlassCard className="p-6 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 border-primary/20">
          <h2 className="text-xl font-bold mb-4">Key Statistics</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Average Contribution</p>
              <p className="text-2xl font-bold text-primary">${analyticsData.statistics.avgContribution.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Largest Contribution</p>
              <p className="text-2xl font-bold text-accent">${analyticsData.statistics.largestContribution.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Smallest Contribution</p>
              <p className="text-2xl font-bold">${analyticsData.statistics.smallestContribution.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Projected Completion</p>
              <p className="text-lg font-bold">{analyticsData.statistics.projectedDate}</p>
            </div>
          </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-12"
            onClick={() => navigate(`/clan/${clanId}`)}
          >
            Back to Clan Details
          </Button>
          <Button 
            className="h-12 bg-accent hover:bg-accent/90 text-black font-semibold"
            onClick={() => navigate(`/clan/${clanId}`)}
          >
            Contribute Now
          </Button>
        </div>
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default ClanAnalytics;
