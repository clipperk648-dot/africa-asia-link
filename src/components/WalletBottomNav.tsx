import { Link } from "react-router-dom";
import { Wallet as WalletIcon, Send, Grid2X2 } from "lucide-react";

interface WalletBottomNavProps {
  active: "wallet" | "pay" | "apps";
}

const WalletBottomNav = ({ active }: WalletBottomNavProps) => {
  const items = [
    { key: "wallet" as const, to: "/wallet", label: "Wallet", Icon: WalletIcon },
    { key: "pay" as const, to: "/wallet/pay", label: "Pay", Icon: Send },
    { key: "apps" as const, to: "/wallet/apps", label: "Apps", Icon: Grid2X2 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50">
      <div className="max-w-3xl mx-auto px-8">
        <div className="grid grid-cols-3 h-16">
          {items.map(({ key, to, label, Icon }) => (
            <Link
              key={key}
              to={to}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                active === key ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-6 h-6 ${active === key ? "scale-110" : ""}`} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default WalletBottomNav;
