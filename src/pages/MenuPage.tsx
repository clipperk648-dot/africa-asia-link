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

  const socialLinks = [
    { icon: "𝕏", label: "Twitter", url: "https://twitter.com" },
    { icon: "📘", label: "Facebook", url: "https://facebook.com" },
    { icon: "📷", label: "Instagram", url: "https://instagram.com" },
    { icon: "💼", label: "LinkedIn", url: "https://linkedin.com" },
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
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Menu</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Section - Glass Morphism */}
        <GlassCard className="mb-6 p-6">
          <div className="flex items-center gap-4">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`}
              alt="Profile"
              className="w-16 h-16 rounded-full border-2 border-white/30"
            />
            <div>
              <h2 className="font-semibold text-lg">{user?.email?.split('@')[0] || 'User'}</h2>
              <p className="text-sm text-muted-foreground capitalize">{user?.role || 'Member'}</p>
            </div>
          </div>
        </GlassCard>

        {/* Dark Mode Toggle - Glass Morphism */}
        <GlassCard className="mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="font-medium">Dark Mode</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(darkMode ? "light" : "dark")}
              className="text-primary"
            >
              {darkMode ? "On" : "Off"}
            </Button>
          </div>
        </GlassCard>

        {/* Menu Items - Glass Morphism with Frames */}
        <div className="space-y-2 mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-3">Options</h3>
          {menuItems.map((item, index) => (
            <GlassCard key={index} className="p-0 overflow-hidden hover-lift">
              <button
                onClick={item.onClick}
                className="w-full flex items-center gap-3 p-4 transition-colors duration-300"
              >
                <div className="p-2 rounded-lg bg-white/10 border border-white/20">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">{item.label}</span>
              </button>
            </GlassCard>
          ))}
        </div>

        {/* Social Media Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground px-2 mb-3">Connect</h3>
          <GlassCard className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex flex-col items-center justify-center p-3 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 group"
                  title={link.label}
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{link.icon}</span>
                  <span className="text-[10px] text-muted-foreground text-center">{link.label.split(' ')[0]}</span>
                </a>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Logout Button - Glass Morphism */}
        <GlassCard className="p-0 overflow-hidden">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 p-4 rounded-none text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={handleLogout}
          >
            <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-medium">Log Out</span>
          </Button>
        </GlassCard>
      </main>
    </div>
  );
};

export default MenuPage;
