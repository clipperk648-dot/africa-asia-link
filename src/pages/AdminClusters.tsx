/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useClusters, useUpdateClusterMutation } from "@/hooks/useData";
import type { Cluster } from "@/types/models";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Package, Clock, Truck, Play, Square, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/AdminLayout";

const AdminClusters = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: clusters = [], refetch, isLoading } = useClusters();
  const updateClusterMutation = useUpdateClusterMutation();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleStatusChange = async (clusterId: string, status: string) => {
    try {
      const updateData: Partial<Cluster> = { shipping_status: status };
      
      if (status === "in transit") {
        updateData.shipping_started_at = new Date().toISOString();
        updateData.stop_counting = false;
      }

      await updateClusterMutation.mutateAsync({
        id: clusterId,
        data: updateData
      });
      toast.success(`Cluster status updated to ${status}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleCounting = async (clusterId: string, stopCounting: boolean) => {
    try {
      await updateClusterMutation.mutateAsync({
        id: clusterId,
        data: { stop_counting: stopCounting }
      });
      toast.success(stopCounting ? "Countdown stopped" : "Countdown resumed");
      refetch();
    } catch (error) {
      toast.error("Failed to update countdown");
    }
  };

  const getCountdown = (startedAt: string, method: string) => {
    if (!startedAt) return null;
    
    let days = 0;
    switch (method?.toLowerCase()) {
      case "sea":
      case "sea freight":
        days = 60;
        break;
      case "fedex":
        days = 5;
        break;
      case "air freight":
        days = 18;
        break;
      case "express":
        days = 12;
        break;
      default:
        days = 10;
    }

    const start = new Date(startedAt).getTime();
    const now = new Date().getTime();
    const end = start + days * 24 * 60 * 60 * 1000;
    const diff = end - now;

    if (diff <= 0) return "Expired";

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${d}d ${h}h remaining`;
  };

  const filteredClusters = (clusters as Cluster[]).filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.targetProductName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clusters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-background/50 border-white/10"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 hover:bg-white/5">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredClusters.length === 0 ? (
          <GlassCard className="p-12 text-center border-white/5">
            <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-bold text-white">No clusters found</h3>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {filteredClusters.map((cluster) => (
              <GlassCard key={cluster.id} className="p-6 border-white/5 hover:bg-white/5 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{cluster.name}</h3>
                      <p className="text-sm text-muted-foreground">Product: <span className="text-primary/80">{cluster.targetProductName || cluster.target_product_name || "General Trade"}</span></p>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
                        <Users className="w-3.5 h-3.5 text-blue-400" />
                        <span>{cluster.current_members || cluster.currentMembers || cluster.cluster_members?.length || 0} / {cluster.max_members || cluster.maxMembers || 5} Members</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
                        <Package className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{cluster.quantity || 0} units</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
                        <Truck className="w-3.5 h-3.5 text-amber-400" />
                        <span className="uppercase font-bold tracking-tighter">{cluster.preferredShippingMethod || cluster.preferred_shipping_method || "Standard"}</span>
                      </div>
                    </div>

                    {(cluster.shipping_status === "in transit" || cluster.shippingStatus === "in transit") && (cluster.shipping_started_at || cluster.shippingStartedAt) && (
                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-lg animate-pulse">
                              <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Arrival Estimate</p>
                              <p className="font-mono font-bold text-primary">
                                {(cluster.stop_counting || cluster.stopCounting) ? "PAUSED" : getCountdown((cluster.shipping_started_at || cluster.shippingStartedAt)!, (cluster.preferredShippingMethod || cluster.preferred_shipping_method || ''))}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full border border-white/10 hover:bg-white/5"
                            onClick={() => handleToggleCounting(cluster.id, !!(cluster.stop_counting || cluster.stopCounting))}
                          >
                            {(cluster.stop_counting || cluster.stopCounting) ? <Play className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-amber-400" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-64 space-y-3 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Admin Workflow</p>
                    <Select 
                      value={cluster.shipping_status || cluster.shippingStatus || "shipping not started yet"} 
                      onValueChange={(val) => handleStatusChange(cluster.id, val)}
                    >
                      <SelectTrigger className="bg-background/50 border-white/10 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 backdrop-blur-xl border-white/10">
                        <SelectItem value="shipping not started yet">Not Started</SelectItem>
                        <SelectItem value="in transit" disabled={(cluster.current_members || cluster.currentMembers || cluster.cluster_members?.length || 0) < (cluster.max_members || cluster.maxMembers || 5)}>
                          In Transit {((cluster.current_members || cluster.currentMembers || cluster.cluster_members?.length || 0) < (cluster.max_members || cluster.maxMembers || 5)) && " (Need members)"}
                        </SelectItem>
                        <SelectItem value="in warehouse">In Warehouse</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>

                    <p className="text-[9px] text-muted-foreground italic leading-relaxed">
                      "In Transit" triggers the automatic countdown timer based on shipping method.
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default AdminClusters;
