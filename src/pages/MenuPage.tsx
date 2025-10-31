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
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold">Menu</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Section */}
        <div className="flex items-center gap-4 p-4 bg-card/50 backdrop-blur-sm rounded-lg mb-6 border border-border/50">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`}
            alt="Profile"
            className="w-16 h-16 rounded-full"
          />
          <div>
            <h2 className="font-semibold text-lg">{user?.email?.split('@')[0] || 'User'}</h2>
            <p className="text-sm text-muted-foreground capitalize">{user?.role || 'Member'}</p>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm rounded-lg mb-2 border border-border/50">
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

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-lg hover:bg-card/70 transition-colors border border-border/50"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full mt-6 gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </Button>
      </main>
    </div>
  );
};

export default MenuPage;
