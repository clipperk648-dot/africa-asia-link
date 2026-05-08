import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { useWalletBalance } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Smartphone, Wifi, Tv } from "lucide-react";

const UtilitiesServices = [
  {
    id: "airtime",
    title: "Recharge Airtime",
    description: "Buy airtime for all networks",
    icon: Smartphone,
    href: "/utilities/airtime",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "data",
    title: "Buy Mobile Data",
    description: "Get affordable data plans",
    icon: Wifi,
    href: "/utilities/data",
    color: "from-cyan-500 to-blue-500",
  },
  {
    id: "tv",
    title: "TV Subscription",
    description: "Subscribe to DStv, GOtv, and more",
    icon: Tv,
    href: "/utilities/tv",
    color: "from-purple-500 to-pink-500",
  },
];

const Utilities = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const { data: walletData = { balance: 0, currency: "USD" } } = useWalletBalance(user?.id);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const goBack = () => {
    const dest = user?.role === "industry" ? "/industry" : "/buyer";
    navigate(dest);
  };

  return (
    <div className="min-h-screen pb-24 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="backdrop-blur-xl bg-card/30 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-3 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={goBack} aria-label="Go back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-5 h-5 text-primary">⚙️</div>
            <h1 className="text-base sm:text-lg font-bold">Utilities</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="w-fit bg-muted text-foreground/80 text-xs px-3 py-1 rounded-full shadow-sm">
          Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
        </div>

        {/* Wallet Balance Card */}
        <div className="relative">
          <div className="rounded-3xl p-5 sm:p-6 text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/80 text-xs">Wallet Balance</p>
                <p className="mt-1 text-4xl font-extrabold tracking-tight">${walletData.balance.toFixed(2)}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
            <p className="text-white/70 text-xs mt-3">Use your wallet balance to purchase airtime, data, and subscriptions</p>
          </div>
        </div>

        {/* Services Grid */}
        <section className="space-y-3">
          <h2 className="text-base font-bold">Quick Services</h2>
          <div className="grid gap-4">
            {UtilitiesServices.map((service) => {
              const Icon = service.icon;
              return (
                <Link key={service.id} to={service.href}>
                  <GlassCard className="p-4 hover:bg-white/10 transition-all cursor-pointer border border-border/50 hover:border-primary/50">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${service.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm">{service.title}</h3>
                        <p className="text-xs text-cyan-300 mt-0.5">{service.description}</p>
                      </div>
                      <div className="text-muted-foreground">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Help Section */}
        <section className="space-y-3 pt-4 border-t border-border/50">
          <h2 className="text-base font-bold">Need Help?</h2>
          <GlassCard className="p-4 text-center bg-white/5">
            <p className="text-xs text-cyan-300 mb-3">
              For any issues with your purchases, please contact our support team.
            </p>
            <Link to="/support-chat">
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </Link>
          </GlassCard>
        </section>
      </main>
    </div>
  );
};

export default Utilities;
