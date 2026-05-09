import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCluster, useUpdateClusterMutation } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Settings, Save } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { toast } from "@/components/ui/sonner";

const ClusterSettings = () => {
  const navigate = useNavigate();
  const { clusterId } = useParams();
  const { user } = useAuth();
  const { data: cluster, isLoading } = useCluster(clusterId);
  const updateClusterMutation = useUpdateClusterMutation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    maxMembers: "5",
  });

  useEffect(() => {
    if (cluster) {
      setFormData({
        name: cluster.name || "",
        description: cluster.description || "",
        maxMembers: String(cluster.maxMembers || 5),
      });
    }
  }, [cluster]);

  if (isLoading) return <div>Loading...</div>;
  if (!cluster) return <div>Cluster not found</div>;

  const isCreator = user?.id === cluster.creatorId;
  const isAdmin = user?.role === 'admin';

  if (!isCreator && !isAdmin) {
    return <div className="p-10 text-center">You don't have permission to edit this cluster.</div>;
  }

  const handleSave = async () => {
    try {
      await updateClusterMutation.mutateAsync({
        id: cluster.id,
        data: {
          name: formData.name,
          description: formData.description,
          maxMembers: parseInt(formData.maxMembers),
        }
      });
      toast.success("Cluster settings updated!");
      navigate(`/cluster/${cluster.id}`);
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Cluster Settings</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <GlassCard className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Cluster Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              className="bg-background/50 min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxMembers">Max Members</Label>
            <Input 
              id="maxMembers" 
              type="number" 
              value={formData.maxMembers} 
              onChange={e => setFormData({...formData, maxMembers: e.target.value})} 
              className="bg-background/50"
            />
          </div>
          <Button onClick={handleSave} className="w-full gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </GlassCard>
      </main>
      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default ClusterSettings;
