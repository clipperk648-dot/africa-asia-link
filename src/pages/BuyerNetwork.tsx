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
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
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
          <h2 className="text-lg sm:text-xl font-bold mb-4">My Suppliers</h2>
          <div className="space-y-3">
            {connections.filter((c) => c.connected).map((connection) => (
              <GlassCard key={connection.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <img
                      src={connection.avatar}
                      alt={connection.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{connection.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{connection.role}</p>
                      <p className="text-xs text-muted-foreground truncate">{connection.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="gradient" size="sm" className="flex-1 sm:flex-none" onClick={() => navigate(`/messages`)}>
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleConnection(connection.id)}
                      className="flex-1 sm:flex-none text-xs sm:text-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Connected</span>
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-bold mb-4">Discover Suppliers</h2>
          <div className="space-y-3">
            {connections.filter((c) => !c.connected).map((connection) => (
              <GlassCard key={connection.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <img
                      src={connection.avatar}
                      alt={connection.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{connection.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{connection.role}</p>
                      <p className="text-xs text-muted-foreground truncate">{connection.location}</p>
                    </div>
                  </div>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => toggleConnection(connection.id)}
                    className="w-full sm:w-auto"
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
