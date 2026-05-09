import { useNavigate, useParams } from "react-router-dom";
import { useCluster } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, TrendingUp, Users } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ClusterAnalytics = () => {
  const navigate = useNavigate();
  const { clusterId } = useParams();
  const { data: cluster, isLoading } = useCluster(clusterId);

  if (isLoading) return <div>Loading...</div>;
  if (!cluster) return <div>Cluster not found</div>;

  const memberData = (cluster.cluster_members || []).map((m: any) => ({
    name: m.profiles?.name || "User",
    value: m.joined_amount || 0,
    quantity: m.joined_quantity || 0
  }));

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Cluster Analytics</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <GlassCard className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">${(cluster.current_funded || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground uppercase">Total Funded</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold">{(cluster.cluster_members || []).length}</p>
            <p className="text-xs text-muted-foreground uppercase">Members</p>
          </GlassCard>
        </div>

        <GlassCard className="p-4">
          <h2 className="font-semibold mb-4">Funding Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={memberData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {memberData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <h2 className="font-semibold mb-4">Quantity per Member</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </main>
      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default ClusterAnalytics;
