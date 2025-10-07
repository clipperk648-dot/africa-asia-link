import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, UserPlus, MessageCircle, Check } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

interface Connection {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  connected: boolean;
}

const BuyerNetwork = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [connections, setConnections] = useState<Connection[]>([
    {
      id: "1",
      name: "Shanghai Heavy Industries",
      role: "Manufacturer",
      location: "Shanghai, China",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shanghai",
      connected: true,
    },
    {
      id: "2",
      name: "Shenzhen Tech Ltd",
      role: "Electronics Supplier",
      location: "Shenzhen, China",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shenzhen",
      connected: true,
    },
    {
      id: "3",
      name: "Guangzhou Fabrics",
      role: "Textile Manufacturer",
      location: "Guangzhou, China",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guangzhou",
      connected: false,
    },
    {
      id: "4",
      name: "Beijing Build Co",
      role: "Construction Equipment",
      location: "Beijing, China",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beijing",
      connected: false,
    },
  ]);

  useEffect(() => {
    if (!user || user.role !== "buyer") {
      navigate("/login");
    }
  }, [user, navigate]);

  const toggleConnection = (id: string) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === id ? { ...conn, connected: !conn.connected } : conn
      )
    );
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/buyer")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Network</h1>
          </div>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              className="pl-10 h-11 bg-background/50"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <section>
          <h2 className="text-xl font-bold mb-4">My Suppliers</h2>
          <div className="space-y-3">
            {connections.filter((c) => c.connected).map((connection) => (
              <GlassCard key={connection.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={connection.avatar}
                      alt={connection.name}
                      className="w-14 h-14 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{connection.name}</h3>
                      <p className="text-sm text-muted-foreground">{connection.role}</p>
                      <p className="text-xs text-muted-foreground">{connection.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="gradient" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleConnection(connection.id)}
                    >
                      <Check className="w-4 h-4" />
                      Connected
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Discover Suppliers</h2>
          <div className="space-y-3">
            {connections.filter((c) => !c.connected).map((connection) => (
              <GlassCard key={connection.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={connection.avatar}
                      alt={connection.name}
                      className="w-14 h-14 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{connection.name}</h3>
                      <p className="text-sm text-muted-foreground">{connection.role}</p>
                      <p className="text-xs text-muted-foreground">{connection.location}</p>
                    </div>
                  </div>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => toggleConnection(connection.id)}
                  >
                    <UserPlus className="w-4 h-4" />
                    Connect
                  </Button>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default BuyerNetwork;
