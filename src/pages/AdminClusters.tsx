import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useClusters, useUpdateClusterMutation } from "@/hooks/useData";
import type { Cluster } from "@/types/models";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Package, Clock, CheckCircle, Truck, Warehouse, CheckCircle2, Play, Square } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminClusters = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: clusters = [], refetch } = useClusters();
  const updateClusterMutation = useUpdateClusterMutation();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleStatusChange = async (clusterId: string, status: string, shippingMethod: string) => {
    try {
      const data: Record<string, string | boolean | number | null> = { shipping_status: status };
      
      if (status === "in transit") {
        data.shipping_started_at = new Date().toISOString();
        data.stop_counting = false;
      }

      await updateClusterMutation.mutateAsync({
        id: clusterId,
        data
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
    c.targetProductName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Cluster Management</h1>
          </div>
          <div className="mt-3">
            <Input
              placeholder="Search clusters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background/50"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {filteredClusters.length === 0 ? (
          <GlassCard className="p-12 text-center text-muted-foreground">
            No clusters found.
          </GlassCard>
        ) : (
          filteredClusters.map((cluster) => (
            <GlassCard key={cluster.id} className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold">{cluster.name}</h3>
                    <p className="text-sm text-muted-foreground">Product: {cluster.target_product_name}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{cluster.current_members} / {cluster.max_members} Members</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-secondary" />
                      <span>{cluster.quantity} units</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-accent" />
                      <span>{cluster.preferred_shipping_method || "Standard"}</span>
                    </div>
                  </div>

                  {cluster.shipping_status === "in transit" && cluster.shipping_started_at && (
                    <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-primary">
                            {cluster.stop_counting ? "Countdown Paused" : getCountdown(cluster.shipping_started_at, cluster.preferred_shipping_method)}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleCounting(cluster.id, !cluster.stop_counting)}
                        >
                          {cluster.stop_counting ? <Play className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full md:w-64 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status Control</p>
                  <Select 
                    value={cluster.shipping_status || "shipping not started yet"} 
                    onValueChange={(val) => handleStatusChange(cluster.id, val, cluster.preferred_shipping_method)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shipping not started yet">Shipping Not Started</SelectItem>
                      <SelectItem value="in transit" disabled={cluster.current_members < cluster.max_members}>
                        In Transit {cluster.current_members < cluster.max_members && "(Wait for full members)"}
                      </SelectItem>
                      <SelectItem value="in warehouse">In Warehouse</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="pt-2">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      * Status can be changed to "In Transit" only after all members have joined.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </main>

      <FooterNav dashboardType="admin" />
    </div>
  );
};

export default AdminClusters;
