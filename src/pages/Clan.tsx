import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { useClans, useCreateClanMutation, useJoinClanMutation } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThreeBackground } from "@/components/ThreeBackground";
import { Crown, MessageCircle, Users, Clock, Target, TrendingUp } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { getSafeImageUrl, getSafeAvatarUrl } from "@/utils/imageOptimization";

const Clan = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { data: clans = [] } = useClans(20, 0);
  const createClanMutation = useCreateClanMutation();
  const joinClanMutation = useJoinClanMutation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedClanId, setSelectedClanId] = useState<string | null>(null);

  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    targetProductId: "",
    targetProductName: "",
    targetPrice: "",
  });

  const [joinFormData, setJoinFormData] = useState({
    amount: "",
  });

  useEffect(() => {
    if (!user || user.role !== "buyer") {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleCreateClan = async () => {
    if (!createFormData.name || !createFormData.targetProductName || !createFormData.targetPrice) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createClanMutation.mutateAsync({
        name: createFormData.name,
        description: createFormData.description,
        targetProductId: createFormData.targetProductId,
        targetProductName: createFormData.targetProductName,
        targetPrice: parseFloat(createFormData.targetPrice),
        creatorId: user.id,
        creatorName: user.name || "Creator",
      });

      setCreateFormData({
        name: "",
        description: "",
        targetProductId: "",
        targetProductName: "",
        targetPrice: "",
      });
      setCreateDialogOpen(false);
      toast.success("Clan created successfully!");
    } catch (error) {
      toast.error("Failed to create clan");
    }
  };

  const handleJoinClan = async () => {
    if (!joinFormData.amount || !selectedClanId) {
      toast.error("Please enter a contribution amount");
      return;
    }

    try {
      await joinClanMutation.mutateAsync({
        clanId: selectedClanId,
        userId: user.id,
        username: user.name || "Buyer",
        amount: parseFloat(joinFormData.amount),
      });

      setJoinFormData({ amount: "" });
      setJoinDialogOpen(false);
      toast.success("Joined clan successfully!");
    } catch (error) {
      toast.error("Failed to join clan");
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
          <h1 className="text-3xl font-bold mb-2">Clan Buying</h1>
          <p className="text-muted-foreground">Team up to buy together</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Start a Clan Section */}
        <GlassCard className="p-6 sm:p-8 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 border-accent/20">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Start a Clan</h2>
              <p className="text-muted-foreground mb-6">Pool funds with friends and get better prices on bulk purchases</p>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto h-12 px-8 rounded-full bg-accent hover:bg-accent/90 text-black font-semibold text-lg">
                    Create New Clan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create a New Clan</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clan-name">Clan Name</Label>
                      <Input
                        id="clan-name"
                        placeholder="e.g., Sneaker Collectors"
                        value={createFormData.name}
                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                        className="h-10 bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clan-description">Description (Optional)</Label>
                      <Textarea
                        id="clan-description"
                        placeholder="What's your clan about?"
                        value={createFormData.description}
                        onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                        className="bg-background/50 min-h-20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target-product">Target Product</Label>
                      <Input
                        id="target-product"
                        placeholder="Product name"
                        value={createFormData.targetProductName}
                        onChange={(e) => setCreateFormData({ ...createFormData, targetProductName: e.target.value })}
                        className="h-10 bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target-price">Target Price ($)</Label>
                      <Input
                        id="target-price"
                        type="number"
                        placeholder="0"
                        value={createFormData.targetPrice}
                        onChange={(e) => setCreateFormData({ ...createFormData, targetPrice: e.target.value })}
                        className="h-10 bg-background/50"
                      />
                    </div>
                    <Button
                      onClick={handleCreateClan}
                      className="w-full bg-accent hover:bg-accent/90 text-black font-semibold"
                      disabled={createClanMutation.isPending}
                    >
                      {createClanMutation.isPending ? "Creating..." : "Create Clan"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </GlassCard>

        {/* Active Clans Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Clans</h2>
          <div className="space-y-4">
            {clans.length === 0 ? (
              <GlassCard className="p-6 text-center text-muted-foreground">
                No active clans yet. Create the first one!
              </GlassCard>
            ) : (
              clans.map((clan) => {
                const progress = getProgressPercentage(clan.currentFunded, clan.targetPrice);
                const daysLeft = getDaysRemaining(clan.deadline);

                return (
                  <GlassCard key={clan.id} className="p-4 sm:p-6 bg-gradient-to-br from-card/50 to-card/20 border-border/50">
                    <div className="space-y-4">
                      {/* Clan Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl font-bold">{clan.name}</h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{clan.members.length} members</span>
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
                          <p className="font-semibold text-sm sm:text-base truncate">{clan.targetProductName}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-muted-foreground">Progress</p>
                          <p className="text-sm font-semibold">
                            ${clan.currentFunded.toLocaleString()} / ${clan.targetPrice.toLocaleString()}
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
                          {clan.members.slice(0, 3).map((member) => (
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
                          {clan.members.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-semibold">
                              +{clan.members.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">{clan.members.length} contributors</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-col sm:flex-row">
                        <Dialog open={joinDialogOpen && selectedClanId === clan.id} onOpenChange={(open) => {
                          setJoinDialogOpen(open);
                          if (open) setSelectedClanId(clan.id);
                        }}>
                          <DialogTrigger asChild>
                            <Button className="flex-1 h-11 bg-accent hover:bg-accent/90 text-black font-semibold">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Contribute & Join
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Contribute to {clan.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="contribution-amount">Contribution Amount ($)</Label>
                                <Input
                                  id="contribution-amount"
                                  type="number"
                                  placeholder="0.00"
                                  value={joinFormData.amount}
                                  onChange={(e) => setJoinFormData({ ...joinFormData, amount: e.target.value })}
                                  className="h-10 bg-background/50"
                                />
                              </div>
                              <Button
                                onClick={handleJoinClan}
                                className="w-full bg-accent hover:bg-accent/90 text-black font-semibold"
                                disabled={joinClanMutation.isPending}
                              >
                                {joinClanMutation.isPending ? "Contributing..." : "Contribute"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="icon" className="h-11 w-11 flex-shrink-0">
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

export default Clan;
