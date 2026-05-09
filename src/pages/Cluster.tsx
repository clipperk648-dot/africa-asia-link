import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { useClusters, useCreateClusterMutation, useJoinClusterMutation } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ThreeBackground from "@/components/ThreeBackground";
import { Crown, MessageCircle, Users, Clock, Target, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { getSafeImageUrl, getSafeAvatarUrl } from "@/utils/imageOptimization";

const Cluster = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { data: clusters = [] } = useClusters(20, 0);
  const createClusterMutation = useCreateClusterMutation();
  const joinClusterMutation = useJoinClusterMutation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);

  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    maxMembers: "5",
    preferredShippingMethod: "Standard",
  });

  const shippingMethods = ["FedEx", "Sea Freight", "Air Freight", "Express", "Standard"];

  const [joinFormData, setJoinFormData] = useState({
    quantity: "",
    amount: "",
  });

  useEffect(() => {
    if (!user || user.role !== "buyer" && user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleCreateCluster = async () => {
    const clusterName = createFormData.name || `New Cluster`;
    
    try {
      await createClusterMutation.mutateAsync({
        name: clusterName,
        description: createFormData.description,
        maxMembers: parseInt(createFormData.maxMembers) || 5,
        preferredShippingMethod: createFormData.preferredShippingMethod,
        creatorId: user.id,
        creatorName: user.name || "Creator",
        targetProductId: "", // Removed from UI
        targetProductName: "", // Removed from UI
        targetPrice: 0, // Removed from UI
        minOrderAmount: 0, // Removed from UI
        quantity: 0, // Removed from UI
      });

      setCreateFormData({
        name: "",
        description: "",
        maxMembers: "5",
        preferredShippingMethod: "Standard",
      });
      setCreateDialogOpen(false);
      toast.success("Cluster created successfully!");
    } catch (error) {
      toast.error("Failed to create cluster");
    }
  };

  const handleJoinCluster = async () => {
    if (!joinFormData.quantity || !selectedClusterId) {
      toast.error("Please enter quantity");
      return;
    }

    try {
      await joinClusterMutation.mutateAsync({
        clusterId: selectedClusterId,
        userId: user.id,
        username: user.name || "Buyer",
        quantity: parseInt(joinFormData.quantity),
        amount: parseFloat(joinFormData.amount) || 0,
      });

      setJoinFormData({ quantity: "", amount: "" });
      setJoinDialogOpen(false);
      toast.success("Joined cluster successfully!");
    } catch (error) {
      toast.error("Failed to join cluster");
    }
  };

  const getProgressPercentage = (funded: number, target: number) => {
    return Math.min(100, Math.round((funded / target) * 100));
  };

  const getDaysRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Cluster Buying</h1>
          <p className="text-muted-foreground">Team up to buy together</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Start a Cluster Section */}
        <GlassCard className="p-6 sm:p-8 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 border-accent/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Start a Cluster</h2>
              <p className="text-muted-foreground mb-6">Pool orders with others to get better bulk prices</p>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto h-12 px-8 rounded-full bg-accent hover:bg-accent/90 text-black font-semibold text-lg">
                    Create New Cluster
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create a New Cluster</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cluster-name">Cluster Name (Optional)</Label>
                      <Input
                        id="cluster-name"
                        placeholder="Auto-generated if left blank"
                        value={createFormData.name}
                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                        className="h-10 bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping-method">Shipping Method</Label>
                      <select
                        id="shipping-method"
                        className="w-full h-10 bg-background/50 rounded-md border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={createFormData.preferredShippingMethod}
                        onChange={(e) => setCreateFormData({ ...createFormData, preferredShippingMethod: e.target.value })}
                      >
                        {shippingMethods.map((method) => (
                          <option key={method} value={method}>{method}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cluster-description">Description (Optional)</Label>
                      <Textarea
                        id="cluster-description"
                        placeholder="What's your cluster about?"
                        value={createFormData.description}
                        onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                        className="bg-background/50 min-h-20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-members">Max Members</Label>
                      <Input
                        id="max-members"
                        type="number"
                        placeholder="5"
                        value={createFormData.maxMembers}
                        onChange={(e) => setCreateFormData({ ...createFormData, maxMembers: e.target.value })}
                        className="h-10 bg-background/50"
                      />
                    </div>
                    <Button
                      onClick={handleCreateCluster}
                      className="w-full bg-accent hover:bg-accent/90 text-black font-semibold"
                      disabled={createClusterMutation.isPending}
                    >
                      {createClusterMutation.isPending ? "Creating..." : "Create Cluster"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </GlassCard>

        {/* Active Clusters Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Clusters</h2>
          <div className="space-y-4">
            {clusters.length === 0 ? (
              <GlassCard className="p-6 text-center text-muted-foreground">
                No active clusters yet. Create the first one!
              </GlassCard>
            ) : (
              clusters.map((cluster) => {
                const progress = getProgressPercentage(cluster.currentFunded, cluster.targetPrice);
                const daysLeft = getDaysRemaining(cluster.deadline);

                return (
                  <GlassCard key={cluster.id} className="p-4 sm:p-6 bg-gradient-to-br from-card/50 to-card/20 border-border/50">
                    <div className="space-y-4">
                      {/* Cluster Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl sm:text-2xl font-bold">{cluster.name}</h3>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                cluster.shipping_status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                                cluster.shipping_status === 'in transit' ? 'bg-blue-500/20 text-blue-500' :
                                'bg-amber-500/20 text-amber-500'
                              }`}>
                                {cluster.shipping_status || 'not started'}
                              </span>
                            </div>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{cluster.currentMembers || cluster.members.length} / {cluster.maxMembers} joined</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{daysLeft} days left</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Target Product */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Target className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Target Product</p>
                          <p className="font-semibold text-sm sm:text-base truncate">{cluster.targetProductName}</p>
                        </div>
                      </div>

                      {/* Quantity Progress */}
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground">Quantity Ordered</p>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm sm:text-base">{cluster.quantity}</p>
                            <span className="text-xs text-muted-foreground">units target</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-muted-foreground">Progress</p>
                          <p className="text-sm font-semibold">
                            ${(cluster.currentFunded ?? 0).toLocaleString()} / ${(cluster.targetPrice ?? 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{progress}% funded</p>
                      </div>

                      {/* Members Preview */}
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {cluster.members.slice(0, 3).map((member) => (
                            <img
                              key={member.id}
                              src={getSafeAvatarUrl(member.username)}
                              alt={member.username}
                              className="w-8 h-8 rounded-full border-2 border-background"
                              onError={(e) => {
                                const img = e.currentTarget;
                                img.src = "/placeholder.svg";
                              }}
                            />
                          ))}
                          {(cluster.currentMembers || cluster.members.length) > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold">
                              +{(cluster.currentMembers || cluster.members.length) - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">{cluster.currentMembers || cluster.members.length} buyers joined</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <Dialog open={joinDialogOpen && selectedClusterId === cluster.id} onOpenChange={(open) => {
                          setJoinDialogOpen(open);
                          if (open) setSelectedClusterId(cluster.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button className="flex-1 h-11 bg-accent hover:bg-accent/90 text-black font-semibold">
                              <Users className="w-4 h-4 mr-2" />
                              Join Cluster
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Join {cluster.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="join-quantity">Quantity (units)</Label>
                                <Input
                                  id="join-quantity"
                                  type="number"
                                  placeholder="0"
                                  value={joinFormData.quantity}
                                  onChange={(e) => setJoinFormData({ ...joinFormData, quantity: e.target.value })}
                                  className="h-10 bg-background/50"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="join-amount">Amount ($)</Label>
                                <Input
                                  id="join-amount"
                                  type="number"
                                  placeholder="0.00"
                                  value={joinFormData.amount}
                                  onChange={(e) => setJoinFormData({ ...joinFormData, amount: e.target.value })}
                                  className="h-10 bg-background/50"
                                />
                              </div>
                              {cluster.minOrderAmount && (
                                <p className="text-xs text-muted-foreground">Minimum order: ${cluster.minOrderAmount}</p>
                              )}
                              <Button
                                onClick={handleJoinCluster}
                                className="w-full bg-accent hover:bg-accent/90 text-black font-semibold"
                                disabled={joinClusterMutation.isPending}
                              >
                                {joinClusterMutation.isPending ? "Joining..." : "Join Cluster"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 flex-shrink-0"
                          onClick={() => navigate(`/cluster/${cluster.id}`)}
                        >
                          <MessageCircle className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default Cluster;