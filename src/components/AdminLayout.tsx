import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LogOut, Users, Settings, Bell, BarChart3, Bot, Menu, Box,
  LayoutDashboard, ShoppingCart, User as UserIcon, Plus, Truck, Package,
  MessageSquare, Store
} from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showBotTooltip, setShowBotTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState("Hi there!");

  const ctaTexts = useMemo(() => [
    "Manage clusters here 👋",
    "New orders pending 📦",
    "User activity updated 👥",
    "Need help with settings? ⚙️",
  ], []);

  const tooltipIndexRef = useRef(0);

  const cycleBotTooltip = useCallback(() => {
    setShowBotTooltip(true);
    setTooltipText(ctaTexts[tooltipIndexRef.current]);
    tooltipIndexRef.current = (tooltipIndexRef.current + 1) % ctaTexts.length;
    setTimeout(() => setShowBotTooltip(false), 3000);
  }, [ctaTexts]);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const interval = setInterval(cycleBotTooltip, 8000);
    return () => clearInterval(interval);
  }, [cycleBotTooltip]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Users", icon: Users, path: "/admin/users" },
    { label: "Products", icon: Package, path: "/admin/products" },
    { label: "Supplier Products", icon: Store, path: "/admin/supplier-products" },
    { label: "Clusters", icon: Truck, path: "/admin/clusters" },
    { label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
    { label: "Categories", icon: Box, path: "/admin/categories" },
    { label: "Reports", icon: BarChart3, path: "/admin/reports" },
    { label: "Content", icon: Box, path: "/admin/content" },
    { label: "Notifications", icon: Bell, path: "/admin/notifications" },
    { label: "Support Chat", icon: MessageSquare, path: "/support-chat" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row overflow-hidden font-sans">
      <ThreeBackground />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 bg-card/30 backdrop-blur-xl z-50">
        <div className="p-6 flex items-center gap-2">
          <div className="h-8 w-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">E</div>
          <span className="text-xl font-bold tracking-tight text-white">china Admin</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive(item.path) 
                  ? "bg-primary/20 text-white border border-primary/20 shadow-lg shadow-primary/5" 
                  : "text-muted-foreground hover:text-white hover:bg-white/10"
              }`}>
                <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive(item.path) ? "text-primary" : ""}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/10 mb-4">
            <Avatar className="h-9 w-9 border border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary">
                <UserIcon className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto relative z-10 custom-scrollbar">
        {/* Header - Mobile */}
        <header className="md:hidden flex items-center justify-between p-4 bg-card/30 backdrop-blur-xl border-b border-border/50 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">E</div>
            <span className="text-lg font-bold text-white">china</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-background/90 backdrop-blur-2xl p-0 border-r border-border/50">
              <SheetHeader className="text-left p-6 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">E</div>
                  <SheetTitle className="text-xl">china Admin</SheetTitle>
                </div>
              </SheetHeader>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive(item.path)
                        ? "bg-primary/20 text-white border border-primary/20"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}>
                      <item.icon className={`w-5 h-5 ${isActive(item.path) ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-semibold text-sm">{item.label}</span>
                    </div>
                  </Link>
                ))}
                <div className="pt-4 mt-4 border-t border-border/50">
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        {/* Top bar desktop */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-border/50 bg-card/10 sticky top-0 z-40 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest opacity-70">
            {navItems.find(item => isActive(item.path))?.label || "Admin Panel"}
          </h2>
          <div className="flex items-center gap-4">
            <Link to="/admin/notifications" className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background"></span>
            </Link>
            <div className="h-8 w-px bg-border/50"></div>
            <Link to="/admin/settings" className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {children}

        <footer className="mt-auto p-8 text-center text-[10px] text-muted-foreground opacity-50 uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} TradeLink Global Operations. All rights reserved.</p>
        </footer>
      </div>

      {/* Bot Chat Access */}
      <Link to="/support-chat" className="fixed right-6 bottom-6 z-[100]">
        <div className="relative group">
          {showBotTooltip && (
            <div className="absolute right-16 bottom-2 bg-primary text-white text-[10px] px-3 py-1.5 rounded-xl shadow-xl animate-in fade-in slide-in-from-right-2 whitespace-nowrap font-bold uppercase tracking-wider">
              {tooltipText}
            </div>
          )}
          <Button
            size="icon"
            className="rounded-full shadow-2xl h-14 w-14 hover:scale-110 transition-transform bg-primary hover:shadow-primary/20"
            onClick={(e) => {
              e.preventDefault();
              cycleBotTooltip();
              setTimeout(() => navigate("/support-chat"), 300);
            }}
          >
            <Bot className="w-6 h-6" />
          </Button>
        </div>
      </Link>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
