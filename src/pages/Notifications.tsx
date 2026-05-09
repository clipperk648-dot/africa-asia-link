import { useState, useEffect } from "react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { Bell, ArrowLeft, MessageSquare, Info, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const dashboardType = user?.role === "admin" ? "admin" : (user?.role === "industry" ? "industry" : "buyer");

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) setNotifications(data);
      setLoading(false);
    };

    fetchNotifications();

    const channel = supabase
      .channel('user_notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'support': return MessageSquare;
      case 'info': return Info;
      case 'warn': return AlertCircle;
      default: return Bell;
    }
  };

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
        {loading ? (
          <p className="text-center py-10">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-lg font-semibold mb-1">No Notifications</p>
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            </div>
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = getIcon(n.type);
            return (
              <GlassCard key={n.id} className={`p-4 ${n.read ? 'opacity-60' : 'border-primary/30 bg-primary/5'}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${n.type === "warn" ? "bg-accent/20" : "bg-primary/20"}`}>
                    <Icon className={`w-4 h-4 ${n.type === "warn" ? "text-accent" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{n.title}</h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">{n.message}</p>
                    {!n.read && (
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => markAsRead(n.id)}>Mark as read</Button>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })
        )}
      </main>

      <FooterNav dashboardType={dashboardType as any} />
    </div>
  );
};

export default Notifications;
