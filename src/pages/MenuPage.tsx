import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Settings,
  Bookmark,
  Clock,
  Heart,
  Users,
  ShoppingBag,
  LogOut,
  Moon,
  Sun,
  Bell,
  HelpCircle,
  Share2
} from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { useTheme } from "next-themes";
import GlassCard from "@/components/GlassCard";

const MenuPage = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { resolvedTheme, setTheme } = useTheme();
  const darkMode = resolvedTheme === "dark";

  const menuItems = [
    { icon: Settings, label: "Settings", onClick: () => navigate(user?.role === "buyer" ? "/buyer/settings" : "/industry/settings") },
    { icon: Bookmark, label: "Saved", onClick: () => {} },
    { icon: Clock, label: "Activity", onClick: () => {} },
    { icon: Heart, label: "Favorites", onClick: () => {} },
    { icon: Users, label: "Network", onClick: () => navigate(user?.role === "buyer" ? "/buyer/network" : "/industry/network") },
    { icon: ShoppingBag, label: "Orders", onClick: () => navigate("/cart") },
    { icon: Bell, label: "Notifications", onClick: () => {} },
    { icon: HelpCircle, label: "Help & Support", onClick: () => {} },
  ];


  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="min-h-screen pb-20 relative">
      <ThreeBackground />

      {/* Header */}
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(user?.role === "buyer" ? "/buyer" : "/industry")}
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Menu</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Section - Premium Glass Morphism */}
        <div className="mb-8">
          <GlassCard className="p-8 relative overflow-hidden group">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex items-center gap-5">
              <div className="relative">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`}
                  alt="Profile"
                  className="w-20 h-20 rounded-full border-2 border-white/40 shadow-lg"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg leading-tight">{user?.email?.split('@')[0] || 'User'}</h2>
                <p className="text-sm text-muted-foreground capitalize mt-1">{user?.role || 'Member'}</p>
                <p className="text-xs text-muted-foreground mt-2 opacity-70">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Dark Mode Toggle - Premium Glass */}
        <div className="mb-8">
          <GlassCard className="p-6 flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-white/10 border border-white/20 group-hover:bg-white/20 transition-colors">
                {darkMode ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <span className="font-semibold block">Dark Mode</span>
                <span className="text-xs text-muted-foreground">Adjust your theme preference</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(darkMode ? "light" : "dark")}
              className="text-primary font-semibold hover:bg-primary/20"
            >
              {darkMode ? "On" : "Off"}
            </Button>
          </GlassCard>
        </div>

        {/* Menu Items Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-4">Main Menu</h3>
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <GlassCard
                  key={index}
                  className="p-0 overflow-hidden group hover-lift transition-all duration-300"
                  hover={true}
                >
                  <button
                    onClick={item.onClick}
                    className="w-full flex items-center gap-4 p-5 transition-all duration-300"
                  >
                    <div className="p-3 rounded-xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/25 group-hover:border-white/40 group-hover:bg-gradient-to-br group-hover:from-white/25 group-hover:via-white/20 group-hover:to-white/10 transition-all duration-300 shadow-lg shadow-white/5">
                      <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="font-semibold text-base group-hover:translate-x-1 transition-transform duration-300">{item.label}</span>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowLeft className="w-4 h-4 text-primary/60 transform rotate-180" />
                    </div>
                  </button>
                </GlassCard>
              );
            })}
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-4">Connect With Us</h3>
          <GlassCard className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 border border-white/25 hover:border-white/40 hover:from-white/25 hover:via-white/20 hover:to-white/10 transition-all duration-300 group shadow-lg shadow-white/5 active:scale-95"
                  title={link.label}
                >
                  <span className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300 drop-shadow-lg">{link.icon}</span>
                  <span className="text-xs font-semibold text-muted-foreground text-center group-hover:text-foreground transition-colors">{link.label}</span>
                </a>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Logout Button - Premium Glass with destructive theme */}
        <GlassCard className="p-0 overflow-hidden group bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/30 hover:border-red-500/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-5 transition-all duration-300"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-destructive/30 to-destructive/10 border border-destructive/40 group-hover:from-destructive/40 group-hover:to-destructive/20 transition-all duration-300">
              <LogOut className="w-5 h-5 text-destructive group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-semibold text-base text-destructive group-hover:translate-x-1 transition-transform duration-300">Log Out</span>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowLeft className="w-4 h-4 text-destructive/60 transform rotate-180" />
            </div>
          </button>
        </GlassCard>
      </main>
    </div>
  );
};

export default MenuPage;
