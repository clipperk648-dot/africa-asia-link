import { Home, Package, Users, ShoppingCart, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FooterNavProps {
  dashboardType: "industry" | "buyer";
}

const FooterNav = ({ dashboardType }: FooterNavProps) => {
  const location = useLocation();
  const basePath = dashboardType === "industry" ? "/industry" : "/buyer";

  const navItems = [
    { icon: Home, label: "Home", path: basePath },
    { icon: Package, label: "Products", path: `${basePath}/products` },
    { icon: Users, label: "Network", path: `${basePath}/network` },
    { icon: Settings, label: "Settings", path: `${basePath}/settings` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-around h-20 relative">
          {/* Left Items */}
          {navItems.slice(0, 2).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Center Cart Button */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-5">
            <Link to="/cart">
              <Button 
                size="icon"
                className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 hover:from-primary/90 hover:via-purple-600 hover:to-pink-600 shadow-2xl shadow-primary/50 border-4 border-background relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <ShoppingCart className="w-7 h-7 relative z-10" strokeWidth={2.5} />
              </Button>
            </Link>
          </div>

          {/* Right Items */}
          {navItems.slice(2, 4).map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-6 h-6", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default FooterNav;
