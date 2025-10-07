import { Home, Package, Users, MessageCircle, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FooterNavProps {
  dashboardType: "industry" | "buyer";
}

const FooterNav = ({ dashboardType }: FooterNavProps) => {
  const location = useLocation();
  const basePath = dashboardType === "industry" ? "/industry" : "/buyer";

  const navItems = [
    { icon: Home, label: "Home", path: basePath },
    { icon: Package, label: "Products", path: `${basePath}/products` },
    { icon: MessageCircle, label: "Social", path: "/social" },
    { icon: Users, label: "Network", path: `${basePath}/network` },
    { icon: Settings, label: "Settings", path: `${basePath}/settings` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-card/80 border-t border-border/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-20">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 group relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-primary rounded-full" />
                )}
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all duration-300",
                    isActive
                      ? "bg-primary/10 scale-110"
                      : "group-hover:bg-muted group-hover:scale-105"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default FooterNav;
