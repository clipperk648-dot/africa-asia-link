import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { useClusters, useCreateClusterMutation, useJoinClusterMutation } from "@/hooks/useData";
import type { Cluster as ClusterType } from "@/types/models";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ThreeBackground from "@/components/ThreeBackground";
import { Crown, MessageCircle, Users, Clock, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Cluster = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { data: clusters = [], isLoading } = useClusters(50, 0);
  const createClusterMutation = useCreateClusterMutation();
  const joinClusterMutation = useJoinClusterMutation();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("discovery");

  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: "",
    maxMembers: "5",
    preferredShippingMethod: "Standard",
  });

  const [joinFormData, setJoinFormData] = useState({
    quantity: "",
    amount: "",
  });

  const shippingMethods = ["FedEx", "Sea Freight", "Air Freight", "Express", "Standard"];

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const filteredClusters = useMemo(() => {
    const list = clusters as ClusterType[];
    return list.filter((c) => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.targetProductName || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clusters, searchTerm]);

  const myClusters = useMemo(() => {
    if (!user) return [];
    return filteredClusters.filter((c) => 
      c.creatorId === user.id || 
      (c.cluster_members && c.cluster_members.some((m: any) => m.user_id === user.id))
    );
  }, [filteredClusters, user]);

  const handleCreateCluster = async () => {
    if (!createFormData.name.trim()) {
      toast.error("Cluster name is required");
      return;
    }
    
    try {
      await createClusterMutation.mutateAsync({
        name: createFormData.name,
        description: createFormData.description,
        maxMembers: parseInt(createFormData.maxMembers) || 5,
        preferredShippingMethod: createFormData.preferredShippingMethod,
        creatorId: user?.id,
        creatorName: user?.name || "Creator",
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
        userId: user?.id || '',
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

  const ClusterCard = ({ cluster }: { cluster: ClusterType }) => {
    const progress = Math.min(100, Math.round(((cluster.current_funded || 0) / (cluster.targetPrice || 1000)) * 100));
    const membersCount = cluster.current_members || (cluster.cluster_members?.length) || 0;
    const isMember = user && cluster.cluster_members?.some((m: any) => m.user_id === user.id);

    return (
      <GlassCard className="p-5 border-white/5 hover:border-primary/20 transition-all group">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-white truncate">{cluster.name}</h3>
                {isMember && <span className="text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase">Member</span>}
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                By {cluster.creatorName || "Anonymous"}
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
              cluster.shipping_status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              cluster.shipping_status === 'in transit' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {cluster.shipping_status || 'not started'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter mb-1">Members</p>
                <div className="flex items-center gap-1.5 text-white">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-sm font-bold">{membersCount} / {cluster.maxMembers || 5}</span>
                </div>
             </div>
             <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter mb-1">Shipping</p>
                <div className="flex items-center gap-1.5 text-white">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold uppercase truncate">{cluster.preferredShippingMethod || "Standard"}</span>
                </div>
             </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-white">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
             <Button 
               className="flex-1 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs"
               onClick={() => navigate(`/cluster/${cluster.id}`)}
             >
               View Details
             </Button>
             {!isMember && (
               <Button 
                 variant="outline" 
                 className="flex-1 h-10 rounded-xl border-white/10 hover:bg-white/5 text-xs font-bold"
                 onClick={() => {
                   setSelectedClusterId(cluster.id);
                   setJoinDialogOpen(true);
                 }}
               >
                 Join
               </Button>
             )}
          </div>
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col font-sans">
      <ThreeBackground />
      
      <header className="shrink-0 p-6 md:p-8 space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter italic">CLUSTER<span className="text-primary">HUB</span></h1>
            <p className="text-muted-foreground text-sm font-medium mt-1 uppercase tracking-widest">Pool orders. Save costs. Trade global.</p>
          </div>
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="rounded-full h-12 px-8 bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all font-bold text-sm uppercase tracking-widest"
          >
            <Crown className="w-4 h-4 mr-2" /> Start a Cluster
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search clusters or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white/5 border-white/10 rounded-2xl focus:ring-primary text-sm"
            />
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-white/10 shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 relative z-10 px-6 md:px-8 pb-32">
        <Tabs defaultValue="discovery" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl mb-8 w-full sm:w-auto h-11">
            <TabsTrigger value="discovery" className="rounded-xl px-8 text-xs font-bold uppercase tracking-widest">Discovery</TabsTrigger>
            <TabsTrigger value="my-clusters" className="rounded-xl px-8 text-xs font-bold uppercase tracking-widest">My Clusters</TabsTrigger>
          </TabsList>

          <TabsContent value="discovery" className="mt-0">
            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3].map(i => <div key={i} className="h-64 bg-white/5 animate-pulse rounded-3xl" />)}
               </div>
            ) : filteredClusters.length === 0 ? (
               <GlassCard className="p-12 text-center border-white/5">
                 <p className="text-muted-foreground text-lg mb-4">No clusters found matching your search.</p>
                 <Button variant="link" className="text-primary" onClick={() => setSearchTerm("")}>Clear Filters</Button>
               </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClusters.map((cluster) => (
                  <ClusterCard key={cluster.id} cluster={cluster} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-clusters" className="mt-0">
            {myClusters.length === 0 ? (
              <GlassCard className="p-12 text-center border-white/5">
                <p className="text-muted-foreground text-lg mb-6">You haven't joined or created any clusters yet.</p>
                <Button className="bg-primary" onClick={() => setActiveTab("discovery")}>Browse Clusters</Button>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClusters.map((cluster) => (
                  <ClusterCard key={cluster.id} cluster={cluster} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white max-w-md p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Create a Cluster</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cluster Name</Label>
              <Input
                placeholder="e.g., Electronics Bulk April"
                value={createFormData.name}
                onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                className="h-12 bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shipping Method</Label>
              <select
                value={createFormData.preferredShippingMethod}
                onChange={(e) => setCreateFormData({ ...createFormData, preferredShippingMethod: e.target.value })}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {shippingMethods.map((method) => (
                  <option key={method} value={method} className="bg-background">{method}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Max Members</Label>
              <Input
                type="number"
                value={createFormData.maxMembers}
                onChange={(e) => setCreateFormData({ ...createFormData, maxMembers: e.target.value })}
                className="h-12 bg-white/5 border-white/10"
              />
            </div>
          </div>
          <Button 
            className="w-full h-12 bg-primary font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20"
            onClick={handleCreateCluster}
            disabled={createClusterMutation.isPending}
          >
            {createClusterMutation.isPending ? "Creating..." : "Confirm Cluster Creation"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white max-w-md p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Join Cluster</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Desired Quantity (Units)</Label>
              <Input
                type="number"
                placeholder="How many items do you want?"
                value={joinFormData.quantity}
                onChange={(e) => setJoinFormData({ ...joinFormData, quantity: e.target.value })}
                className="h-12 bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Investment Amount ($)</Label>
              <Input
                type="number"
                placeholder="Total budget for this trade"
                value={joinFormData.amount}
                onChange={(e) => setJoinFormData({ ...joinFormData, amount: e.target.value })}
                className="h-12 bg-white/5 border-white/10"
              />
            </div>
          </div>
          <Button 
            className="w-full h-12 bg-primary font-bold uppercase tracking-widest text-sm shadow-lg shadow-primary/20"
            onClick={handleJoinCluster}
            disabled={joinClusterMutation.isPending}
          >
            {joinClusterMutation.isPending ? "Joining..." : "Join this Cluster"}
          </Button>
        </DialogContent>
      </Dialog>

      <FooterNav dashboardType={user?.role === 'admin' ? 'admin' : 'buyer'} />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Cluster;
