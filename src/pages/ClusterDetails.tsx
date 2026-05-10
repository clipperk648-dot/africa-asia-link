/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCluster, useUpdateClusterMutation, useCheckoutClusterMutation } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Users, TrendingUp, Target, Clock, Copy, Check, BarChart3, Settings, MessageCircle, Truck, ShieldCheck, ShoppingBag } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { getSafeAvatarUrl } from "@/utils/imageOptimization";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ClusterDetails = () => {
  const navigate = useNavigate();
  const { clusterId } = useParams<{ clusterId: string }>();
  const { user } = useAuth();
  const { data: cluster, isLoading } = useCluster(clusterId);
  const updateClusterMutation = useUpdateClusterMutation();
  const checkoutMutation = useCheckoutClusterMutation();
  
  const [copied, setCopied] = useState(false);
  const [showMoreMembers, setShowMoreMembers] = useState(false);
  const [countdown, setCountdown] = useState<string>("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    if (!cluster) return;

    let timer: NodeJS.Timeout;
    if (cluster.shipping_status === "in transit" && cluster.shipping_started_at) {
      const startedAt = new Date(cluster.shipping_started_at).getTime();
      let durationDays = 0;
      switch (cluster.preferredShippingMethod) {
        case "Sea Freight": durationDays = 60; break;
        case "FedEx": durationDays = 5; break;
        case "Air Freight": durationDays = 18; break;
        case "Express": durationDays = 12; break;
        default: durationDays = 14;
      }

      const endAt = startedAt + (durationDays * 24 * 60 * 60 * 1000);
      
      const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = endAt - now;
        
        if (distance < 0) {
          setCountdown("Delivered");
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      };

      if (!cluster.stop_counting) {
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
        <GlassCard className="p-6 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 border-accent/20">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Creator</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold">{cluster.creatorName || cluster.creator_name || "Anonymous"}</p>
                  {isCreator && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-bold rounded-full uppercase">
                      <ShieldCheck className="w-3 h-3" />
                      Cluster Admin
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-muted-foreground mb-1">Status</p>
                <span className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded uppercase">
                  {cluster.shipping_status || cluster.shippingStatus || "shipping not started yet"}
                </span>
              </div>
            </div>

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
                <p className="text-sm font-semibold mb-2">Admin: Change Shipping Status</p>
                <Select onValueChange={handleStatusChange} defaultValue={cluster.shipping_status || cluster.shippingStatus}>
                  <SelectTrigger>
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
                  <p className="text-sm font-semibold text-muted-foreground">Target Product</p>
                </div>
                <p className="text-lg font-bold">{cluster.targetProductName || cluster.target_product_name}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <p className="text-xs font-semibold">Quantity</p>
                </div>
                <p className="font-bold text-primary">{cluster.quantity || 0}</p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  <p className="text-xs font-semibold">Method</p>
                </div>
                <p className="font-bold text-primary text-[10px] uppercase">{cluster.preferredShippingMethod || cluster.preferred_shipping_method || "Standard"}</p>
              </div>
            </div>

            {targetPrice > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-sm font-semibold">
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

            <Button onClick={handleCopyInvite} variant="outline" className="w-full">
              {copied ? <><Check className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy Invite Link</>}
            </Button>

            {((cluster.current_members || cluster.currentMembers || 0) >= (cluster.max_members || cluster.maxMembers || 5)) && cluster.status !== 'locked' && (
              <Button 
                onClick={handleCheckout} 
                className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/20"
                disabled={isCheckingOut}
              >
                <ShoppingBag className="w-4 h-4" />
                {isCheckingOut ? "Processing..." : "Activate Checkout"}
              </Button>
            )}

            {cluster.status === 'locked' && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-sm font-bold text-emerald-400">Cluster Locked - Order Pending</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Members Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Members ({(cluster.cluster_members || []).length})</h2>
          </div>
          <div className="space-y-3">
            {(showMoreMembers ? (cluster.cluster_members || []) : (cluster.cluster_members || []).slice(0, 5)).map((member: any) => (
              <GlassCard key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getSafeAvatarUrl(member.profiles?.name || "User")}
                    alt={member.profiles?.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{member.profiles?.name || "Unknown User"}</p>
                      {member.user_id === cluster.creatorId && (
                        <span className="text-[8px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-bold uppercase">Cluster Admin</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
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
            className="h-12"
            onClick={() => navigate(`/cluster/${cluster.id}/chat`)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Cluster Chat
          </Button>
          <Button
            variant="outline"
            className="h-12"
            onClick={() => navigate(`/cluster/${cluster.id}/analytics`)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default ClusterDetails;
