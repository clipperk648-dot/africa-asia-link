import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Users, TrendingUp, Target, Clock, Copy, Check, BarChart3, Settings, MessageCircle, Truck } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { getSafeAvatarUrl } from "@/utils/imageOptimization";

import type { Cluster } from "@/types/models";

const ClusterDetails = () => {
  const navigate = useNavigate();
  const { clusterId } = useParams<{ clusterId: string }>();
  const user = getCurrentUser();
  
  const [copied, setCopied] = useState(false);
  const [showMoreMembers, setShowMoreMembers] = useState(false);

  const [clusterData, setClusterData] = useState<Cluster>({
    id: clusterId || "cluster-1",
    name: "Cluster",
    description: "A group pooling orders together",
    targetProductId: "prod-1",
    targetProductName: "Target Product",
    targetPrice: 0,
    currentFunded: 0,
    minOrderAmount: 100,
    quantity: 100,
    maxMembers: 50,
    currentMembers: 0,
    preferredShippingMethod: "Standard",
    deadline: new Date().toISOString(),
    creatorId: "user1",
    creatorName: "Creator",
    members: [],
    status: "active",
    createdDate: new Date().toISOString(),
  });

  const handleCopyInvite = () => {
    const inviteText = `Join my cluster: "${clusterData.name}" - Let's order together! Code: ${clusterData.id}`;
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getProgressPercentage = () => {
    return Math.min(100, Math.round((clusterData.currentFunded / clusterData.targetPrice) * 100));
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const deadlineDate = new Date(clusterData.deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const progress = getProgressPercentage();
  const daysLeft = getDaysRemaining();

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/cluster")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">{clusterData.name}</h1>
              <p className="text-xs text-muted-foreground">{clusterData.currentMembers || clusterData.members.length} members</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Cluster Info Card */}
        <GlassCard className="p-6 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 border-accent/20">
          <div className="space-y-4">
            {/* Target Product */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-accent" />
                <p className="text-sm font-semibold text-muted-foreground">Target Product</p>
              </div>
              <p className="text-lg font-bold">{clusterData.targetProductName}</p>
            </div>

            {/* Quantity Progress */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <p className="text-sm font-semibold">Quantity Ordered</p>
              </div>
              <p className="font-bold text-primary">{clusterData.quantity} units</p>
            </div>

            {/* Shipping Method */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <p className="text-sm font-semibold">Shipping Method</p>
              </div>
              <p className="font-bold text-primary uppercase tracking-wider">{clusterData.preferredShippingMethod || "Standard"}</p>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-sm font-semibold">
                  ${clusterData.currentFunded.toLocaleString()} / ${clusterData.targetPrice.toLocaleString()}
                </p>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress}% funded</p>
            </div>

            {/* Time Remaining */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Time Remaining</p>
                <p className="font-semibold">{daysLeft} days left</p>
              </div>
            </div>

            {/* Copy Invite */}
            <Button
              onClick={handleCopyInvite}
              variant="outline"
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Invite Link
                </>
              )}
            </Button>
          </div>
        </GlassCard>

        {/* Members Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Members ({clusterData.members.length})</h2>
          </div>
          <div className="space-y-3">
            {(showMoreMembers ? clusterData.members : clusterData.members.slice(0, 3)).map((member) => (
              <GlassCard key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getSafeAvatarUrl(member.username)}
                    alt={member.username}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.src = "/placeholder.svg";
                    }}
                  />
                  <div>
                    <p className="font-semibold">{member.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent">{member.joinedQuantity || 0} units</p>
                  <p className="text-xs text-muted-foreground">
                    ${(member.joinedAmount || 0).toLocaleString()}
                  </p>
                </div>
              </GlassCard>
            ))}
            {clusterData.members.length > 3 && !showMoreMembers && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowMoreMembers(true)}
              >
                View More Members ({clusterData.members.length - 3} more)
              </Button>
            )}
            {showMoreMembers && clusterData.members.length > 3 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowMoreMembers(false)}
              >
                Show Less
              </Button>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Cluster Chat</h2>
          <GlassCard className="p-6 text-center bg-gradient-to-br from-primary/10 via-transparent to-accent/10 border-primary/20 h-64 flex flex-col items-center justify-center">
            <div className="space-y-4">
              <MessageCircle className="w-12 h-12 text-primary mx-auto opacity-50" />
              <h3 className="text-lg font-semibold">Join the Cluster Chat</h3>
              <p className="text-muted-foreground max-w-sm">
                Discuss orders, share updates, and coordinate with {clusterData.members.length} other members.
              </p>
              <Button
                onClick={() => navigate(`/cluster/${clusterData.id}/chat`)}
                className="bg-accent hover:bg-accent/90 text-black font-semibold mt-4"
              >
                Open Chat
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Contribution History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">Recent Orders</h2>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-2">
            {clusterData.members.map((member, idx) => (
              <GlassCard key={idx} className="p-3 flex items-center justify-between bg-card/50 border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm font-bold text-white">
                    {idx + 1}
                  </div>
                  <p className="text-sm font-semibold">{member.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-accent">{member.joinedQuantity || 0} units</p>
                  <p className="text-xs text-muted-foreground">
                    ${(member.joinedAmount || 0).toLocaleString()}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-12 flex items-center justify-center gap-2"
            onClick={() => navigate(`/cluster/${clusterData.id}/analytics`)}
          >
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Button>
          <Button
            variant="outline"
            className="h-12 flex items-center justify-center gap-2"
            onClick={() => navigate(`/cluster/${clusterData.id}/settings`)}
          >
            <Settings className="w-4 h-4" />
            Cluster Settings
          </Button>
        </div>
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default ClusterDetails;