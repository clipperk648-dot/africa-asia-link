import { useMemo } from "react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { Bell, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";

const Notifications = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const dashboardType = user?.role === "industry" ? "industry" : "buyer";

  const notifications = useMemo(() => [], []);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            <h1 className="text-xl font-bold">Notifications</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {notifications.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-lg font-semibold mb-1">No Notifications</p>
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            </div>
          </div>
        ) : (
          notifications.map((n) => (
            <GlassCard key={n.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${n.type === "warn" ? "bg-accent/20" : "bg-primary/20"}`}>
                  <n.icon className={`w-4 h-4 ${n.type === "warn" ? "text-accent" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{n.title}</h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{n.desc}</p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm">Mark as read</Button>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </main>

      <FooterNav dashboardType={dashboardType} />
    </div>
  );
};

export default Notifications;
