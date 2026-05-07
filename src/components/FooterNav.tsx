import { Home, Package, Users, ShoppingCart, Music2, Wallet, TrendingUp, CheckSquare2, Settings, BarChart3, Users2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FooterNavProps {
  dashboardType: "admin" | "buyer";
}

const FooterNav = ({ dashboardType }: FooterNavProps) => {
  const location = useLocation();
  const basePath = dashboardType === "admin" ? "/admin" : "/buyer";
  const isAdmin = dashboardType === "admin";

  const primaryAction = isAdmin
    ? { path: `${basePath}/products/add`, Icon: Package, label: "Add product" }
    : { path: "/cluster", Icon: Users2, label: "Clusters" };
  const PrimaryActionIcon = primaryAction.Icon;

  const navItems = isAdmin ? [
    { icon: Home, label: "Home", path: basePath },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Settings, label: "Settings", path: `${basePath}/settings` },
  ] : [
    { icon: Home, label: "Home", path: basePath },
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    { icon: Users2, label: "Cluster", path: "/cluster" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/20 backdrop-blur-md border-t border-border/20">
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className={cn("flex items-center justify-around h-12 relative", isAdmin ? "sm:px-8" : "")}>
          {isAdmin ? (
            <>
              {/* Left Items */}
              {navItems.slice(0, 2).map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex flex-col items-center gap-0.5 transition-all duration-300 px-3 sm:px-4",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[9px] font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {/* Center Primary Action Button */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-2">
                <Link to={primaryAction.path} aria-label={primaryAction.label}>
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-purple-500 to-pink-500 hover:from-primary/90 hover:via-purple-600 hover:to-pink-600 shadow-lg shadow-primary/50 border-2 border-background relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <PrimaryActionIcon className="w-5 h-5 relative z-10" strokeWidth={2.5} />
                    <span className="sr-only">{primaryAction.label}</span>
                  </Button>
                </Link>
              </div>

              {/* Right Items */}
              {navItems.slice(2, 4).map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex flex-col items-center gap-0.5 transition-all duration-300 px-3 sm:px-4",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[9px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </>
          ) : (
            // Buyer navigation with 4 items
            <>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex flex-col items-center gap-1 transition-all duration-300 flex-1",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 sm:w-6 sm:h-6", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[8px] sm:text-[10px] font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default FooterNav;