/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCluster, useUpdateClusterMutation, useCheckoutClusterMutation, useJoinClusterMutation } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Users, TrendingUp, Target, Clock, Copy, Check, BarChart3, Settings, MessageCircle, Truck, ShieldCheck, ShoppingBag, Ruler, Lock, Unlock, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { getSafeAvatarUrl } from "@/utils/imageOptimization";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { calculateExpectedDeliveryDate, formatCountdown } from "@/utils/shipping";
import { calculateUnitCBM, calculateTotalCBM } from "@/utils/cbm";
import { Progress } from "@/components/ui/progress";
import { useProduct } from "@/hooks/useData";

const ClusterDetails = () => {
  const navigate = useNavigate();
  const { clusterId } = useParams<{ clusterId: string }>();
  const { user } = useAuth();
  const { data: cluster, isLoading } = useCluster(clusterId);
  const { data: product } = useProduct(cluster?.targetProductId || "");
  const updateClusterMutation = useUpdateClusterMutation();
  const checkoutMutation = useCheckoutClusterMutation();
  const joinClusterMutation = useJoinClusterMutation();
  
  const [copied, setCopied] = useState(false);
  const [showMoreMembers, setShowMoreMembers] = useState(false);
  const [countdown, setCountdown] = useState<string>("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [proposedQty, setProposedQty] = useState("");
  const [showPoll, setShowPoll] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votes, setVotes] = useState({ yes: 0, no: 0 });
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinQty, setJoinQty] = useState("1");

  const currentTargetQty = cluster?.target_qty || 100;
  
  const isMember = cluster?.cluster_members?.some((m: any) => m.user_id === user?.id);

  const handleProposeChange = () => {
    if (!proposedQty || parseInt(proposedQty) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    setShowPoll(true);
    setVotes({ yes: 1, no: 0 }); // Proposer automatically votes yes
    setHasVoted(true);
    toast.success(`Poll started to change target quantity to ${proposedQty}`);
  };

  const handleVote = (vote: 'yes' | 'no') => {
    setVotes(prev => ({ ...prev, [vote]: prev[vote] + 1 }));
    setHasVoted(true);
    toast.success(`Vote cast: ${vote.toUpperCase()}`);
  };

  const totalVotes = votes.yes + votes.no;
  const membersCount = cluster?.cluster_members?.length || 0;
  const pollPassed = votes.yes > membersCount / 2;
  
  useEffect(() => {
    if (pollPassed && showPoll) {
      const updateTarget = async () => {
        try {
          await updateClusterMutation.mutateAsync({
            id: cluster.id,
            data: { target_qty: parseInt(proposedQty) }
          });
          toast.success(`Poll passed! Target quantity updated to ${proposedQty}`);
          setShowPoll(false);
        } catch (error) {
          toast.error("Failed to update target quantity");
        }
      };
      updateTarget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollPassed, showPoll]);

  const totalCBM = cluster?.total_cbm || 0;
  const minLockCBM = 0.1;
  const cbmProgress = Math.min(100, (totalCBM / minLockCBM) * 100);
  const isLockable = totalCBM >= minLockCBM;

  const handleLockCluster = async () => {
    if (!isLockable) {
      toast.error(`Minimum ${minLockCBM} m³ required to lock`);
      return;
    }
    try {
      await updateClusterMutation.mutateAsync({ 
        id: cluster.id, 
        data: { status: 'locked' } 
      });
      toast.success("Cluster locked successfully!");
    } catch (error) {
      toast.error("Failed to lock cluster");
    }
  };

  useEffect(() => {
    if (!cluster) return;

    let timer: NodeJS.Timeout;
    if (cluster.shipping_status === "in transit" && (cluster.shipping_started_at || cluster.shippingStartedAt)) {
      const startedAt = (cluster.shipping_started_at || cluster.shippingStartedAt) as string;
      const methodName = cluster.preferredShippingMethod || cluster.preferred_shipping_method || "Standard";
      const expectedDeliveryDate = calculateExpectedDeliveryDate(startedAt, methodName);
      
      const updateCountdown = () => {
        const formatted = formatCountdown(expectedDeliveryDate);
        setCountdown(formatted);
      };

      if (!(cluster.stop_counting || cluster.stopCounting)) {
        updateCountdown();
        timer = setInterval(updateCountdown, 1000);
      } else {
        setCountdown("Paused");
      }
    } else {
      setCountdown("");
    }

    return () => clearInterval(timer);
  }, [cluster]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><ThreeBackground /><p>Loading...</p></div>;
  if (!cluster) return <div className="min-h-screen flex items-center justify-center"><ThreeBackground /><p>Cluster not found</p></div>;

  const handleCheckout = async () => {
    if (!clusterId) return;
    setIsCheckingOut(true);
    try {
      await checkoutMutation.mutateAsync(clusterId);
      toast.success("Checkout successful! Admin has been notified.");
    } catch (error) {
      toast.error("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleCopyInvite = () => {
    const inviteText = `Join my cluster: "${cluster.name}" - Let's order together! Code: ${cluster.id}`;
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updateData: any = { shipping_status: newStatus };
      if (newStatus === "in transit") {
        updateData.shipping_started_at = new Date().toISOString();
      }
      await updateClusterMutation.mutateAsync({ id: cluster.id, data: updateData });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleCounting = async () => {
    try {
      await updateClusterMutation.mutateAsync({ 
        id: cluster.id, 
        data: { stop_counting: !cluster.stop_counting } 
      });
      toast.success(cluster.stop_counting ? "Timer resumed" : "Timer paused");
    } catch (error) {
      toast.error("Failed to toggle timer");
    }
  };

  const handleJoinCluster = async () => {
    if (!joinQty || parseInt(joinQty) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const qty = parseInt(joinQty);
    const effectivePrice = product?.moq && qty >= product.moq ? (product.moq_price || product.price) : (product.unitPrice || product.price);
    const amount = effectivePrice * qty;

    try {
      await joinClusterMutation.mutateAsync({
        clusterId: cluster.id,
        userId: user?.id || '',
        quantity: qty,
        amount: amount,
      });
      toast.success("Joined cluster successfully!");
      setJoinDialogOpen(false);
      setJoinQty("1");
    } catch (error) {
      toast.error("Failed to join cluster");
    }
  };

  const isCreator = user?.id === (cluster.creatorId || cluster.creator_id);
  const isAdmin = user?.role === "admin";

  const targetPrice = cluster.targetPrice || cluster.target_price || 1;
  const currentFunded = cluster.currentFunded || cluster.current_funded || 0;
  const progress = Math.min(100, Math.round((currentFunded / targetPrice) * 100));

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
              <h1 className="text-lg font-bold truncate">{cluster.name}</h1>
              <p className="text-xs text-muted-foreground">{cluster.current_members || cluster.currentMembers || cluster.cluster_members?.length || 0} members</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Cluster Info Card */}
        <GlassCard className="p-4 sm:p-6 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 border-accent/20">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1">Creator</p>
                <div className="flex items-center gap-2">
                  <p className="text-base sm:text-lg font-bold">{cluster.creatorName || cluster.creator_name || "Anonymous"}</p>
                  {isCreator && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-bold rounded-full uppercase">
                      <ShieldCheck className="w-3 h-3" />
                      Cluster Admin
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-1">Status</p>
                <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded uppercase">
                  {cluster.shipping_status || cluster.shippingStatus || "shipping not started yet"}
                </span>
              </div>
            </div>

            {/* Join Cluster Button for non-members */}
            {!isMember && !isCreator && (
              <div className="pt-2">
                <Button 
                  className="w-full gap-2 bg-primary hover:bg-primary/90 min-h-[44px]" 
                  onClick={() => setJoinDialogOpen(true)}
                >
                  <Users className="w-4 h-4" />
                  Join This Cluster
                </Button>
              </div>
            )}

            {countdown && (
              <div className="p-3 rounded-lg bg-black/40 border border-accent/30 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimated Delivery</p>
                <p className="text-2xl font-mono font-bold text-accent">{countdown}</p>
                {isAdmin && (
                  <Button variant="link" size="sm" onClick={handleToggleCounting} className="text-xs text-accent/70 hover:text-accent">
                    {(cluster.stop_counting || cluster.stopCounting) ? "Resume Timer" : "Pause Timer"}
                  </Button>
                )}
              </div>
            )}

            {isAdmin && (
              <div className="p-3 rounded-lg bg-card/50 border border-border/50">
                <p className="text-xs sm:text-sm font-semibold mb-2">Admin: Change Shipping Status</p>
                <Select onValueChange={handleStatusChange} defaultValue={cluster.shipping_status || cluster.shippingStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shipping not started yet">Shipping Not Started</SelectItem>
                    <SelectItem value="in transit">In Transit</SelectItem>
                    <SelectItem value="in warehouse">In Warehouse</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(cluster.targetProductName || cluster.target_product_name) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-accent" />
                  <p className="text-xs sm:text-sm font-semibold text-muted-foreground">Target Product</p>
                </div>
                <p className="text-base sm:text-lg font-bold">{cluster.targetProductName || cluster.target_product_name}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <p className="text-xs font-semibold">Quantity</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-sm sm:text-base">{cluster.quantity || 0} / {cluster.target_qty || cluster.targetQty || 100}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <p className="text-xs font-semibold">Method</p>
                </div>
                <p className="font-bold text-primary text-[10px] sm:text-xs uppercase">
                  {cluster.shipping_mode === 'air' ? 'Air' : 'Sea'}
                </p>
              </div>
            </div>

            {/* Poll System */}
            {!showPoll ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full gap-2 border-primary/30 hover:border-primary text-xs h-9">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Propose Target Quantity Change
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Propose New Target</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Proposed Quantity</Label>
                      <Input 
                        type="number" 
                        value={proposedQty} 
                        onChange={(e) => setProposedQty(e.target.value)}
                        placeholder={`Current: ${currentTargetQty}`}
                        className="bg-white/5 border-white/10"
                      />
                      <p className="text-[10px] text-muted-foreground italic">A poll will be started. Requires majority vote to pass.</p>
                    </div>
                    <Button onClick={handleProposeChange} className="w-full">Start Poll</Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <GlassCard className="p-4 bg-primary/5 border-primary/20 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <p className="text-xs font-bold uppercase tracking-wider">Active Poll: Target Qty → {proposedQty}</p>
                  </div>
                  <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold">VOTING</span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>YES ({votes.yes})</span>
                    <span>NO ({votes.no})</span>
                  </div>
                  <div className="w-full h-2 bg-black/20 rounded-full flex overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-500" 
                      style={{ width: `${totalVotes > 0 ? (votes.yes / totalVotes) * 100 : 0}%` }}
                    />
                    <div 
                      className="h-full bg-red-500 transition-all duration-500" 
                      style={{ width: `${totalVotes > 0 ? (votes.no / totalVotes) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-center text-muted-foreground">
                    {totalVotes} of {membersCount} members voted • Need {Math.floor(membersCount/2) + 1} YES to pass
                  </p>
                </div>

                {!hasVoted && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleVote('yes')} size="sm" className="flex-1 bg-green-600/20 text-green-400 hover:bg-green-600/40 border-green-500/20">YES</Button>
                    <Button onClick={() => handleVote('no')} size="sm" className="flex-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 border-red-500/20">NO</Button>
                  </div>
                )}
                {hasVoted && !pollPassed && (
                  <p className="text-[10px] text-center italic text-primary animate-pulse">Waiting for more votes...</p>
                )}
              </GlassCard>
            )}

            {/* CBM Progress Bar */}
            <div className="p-4 rounded-lg bg-black/20 border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-accent" />
                  <p className="text-xs font-bold uppercase tracking-wider">Total Volume (CBM)</p>
                </div>
                <span className="text-xs font-bold">{totalCBM.toFixed(4)} / {minLockCBM} m³</span>
              </div>
              <Progress value={cbmProgress} className="h-2" />
              
              {isLockable ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-green-400">
                    <Check className="w-4 h-4" />
                    <p className="text-[10px] font-medium italic">✅ Minimum volume reached! You can lock the cluster and start the order, or wait for more members to join.</p>
                  </div>
                  {(isCreator || isAdmin) && cluster.status !== 'locked' && (
                    <Button 
                      onClick={handleLockCluster}
                      className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 h-9 text-xs uppercase font-bold tracking-widest"
                    >
                      <Lock className="w-4 h-4" />
                      Lock & Start Order
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-[10px] font-medium italic">⏳ Need at least {minLockCBM} m³ total to lock. Currently at {Math.round(cbmProgress)}%. Invite more members.</p>
                </div>
              )}
            </div>

            {targetPrice > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs sm:text-sm text-muted-foreground">Progress</p>
                  <p className="text-xs sm:text-sm font-semibold">
                    ${(currentFunded).toLocaleString()} / ${(targetPrice).toLocaleString()}
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
            )}

            <Button onClick={handleCopyInvite} variant="outline" className="w-full min-h-[44px]">
              {copied ? <><Check className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy Invite Link</>}
            </Button>

            {((cluster.current_members || cluster.currentMembers || 0) >= (cluster.max_members || cluster.maxMembers || 5)) && cluster.status !== 'locked' && (
              <Button 
                onClick={handleCheckout} 
                className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20 min-h-[44px]"
                disabled={isCheckingOut}
              >
                <ShoppingBag className="w-4 h-4" />
                {isCheckingOut ? "Processing..." : "Activate Checkout"}
              </Button>
            )}

            {cluster.status === 'locked' && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-xs sm:text-sm font-bold text-emerald-400">Cluster Locked - Order Pending</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Members Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">Members ({(cluster.cluster_members || []).length})</h2>
          </div>
          <div className="space-y-3">
            {(showMoreMembers ? (cluster.cluster_members || []) : (cluster.cluster_members || []).slice(0, 5)).map((member: any) => (
              <GlassCard key={member.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={getSafeAvatarUrl(member.profiles?.name || "User")}
                    alt={member.profiles?.name}
                    className="w-10 h-10 rounded-full shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm truncate">{member.profiles?.name || "Unknown User"}</p>
                      {member.user_id === cluster.creatorId && (
                        <span className="text-[8px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-bold uppercase shrink-0">Cluster Admin</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-accent">{member.joined_quantity || 0} units</p>
                  <p className="text-xs text-muted-foreground">
                    ${(member.joined_amount || 0).toLocaleString()}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-12 min-h-[44px]"
            onClick={() => navigate(`/cluster/${cluster.id}/chat`)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Cluster </span>Chat
          </Button>
          <Button
            variant="outline"
            className="h-12 min-h-[44px]"
            onClick={() => navigate(`/cluster/${cluster.id}/analytics`)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </main>

      <FooterNav dashboardType={(user?.role as any) || 'buyer'} />

      {/* Join Cluster Dialog */}
      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Join Cluster</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Desired Quantity (Units)</Label>
              <Input
                type="number"
                value={joinQty}
                onChange={(e) => setJoinQty(e.target.value)}
                className="h-12 bg-white/5 border-white/10"
                min="1"
              />
              {product?.moq && (
                <p className="text-[10px] text-muted-foreground">
                  MOQ for discounted price: {product.moq} units
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unit CBM</span>
                <span className="font-bold">
                  {calculateUnitCBM(product?.length_cm || 0, product?.width_cm || 0, product?.height_cm || 0).toFixed(4)} m³
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total CBM</span>
                <span className="font-bold">
                  {calculateTotalCBM(
                    calculateUnitCBM(product?.length_cm || 0, product?.width_cm || 0, product?.height_cm || 0),
                    parseInt(joinQty) || 0
                  ).toFixed(4)} m³
                </span>
              </div>
              {product?.moq && parseInt(joinQty) >= product.moq && (
                <div className="text-xs text-green-400 font-bold">
                  ✅ MOQ reached! You qualify for discounted price.
                </div>
              )}
            </div>
          </div>
          <Button 
            className="w-full h-12 bg-primary font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20"
            onClick={handleJoinCluster}
            disabled={joinClusterMutation.isPending}
          >
            {joinClusterMutation.isPending ? "Joining..." : "Join Cluster"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClusterDetails;