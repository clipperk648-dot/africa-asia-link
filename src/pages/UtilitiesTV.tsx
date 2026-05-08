import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tv } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const tvProviders = [
  { id: "dstv", name: "DStv", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/DStv_logo_2013.svg/1200px-DStv_logo_2013.svg.png" },
  { id: "gotv", name: "GOtv", logo: "https://upload.wikimedia.org/wikipedia/en/5/5d/GOtv_logo.png" },
  { id: "startimes", name: "STARTIMES", logo: "https://upload.wikimedia.org/wikipedia/en/f/f3/Startimes_logo.png" },
  { id: "showmax", name: "SHOWMAX", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/ShowMax_logo.svg/1200px-ShowMax_logo.svg.png" },
];

const tvPlans = [
  { provider: "dstv", name: "DStv Padi", duration: "30 Days", price: 2500, naira: "₦2,500" },
  { provider: "dstv", name: "DStv Yanga", duration: "30 Days", price: 5000, naira: "₦5,000" },
  { provider: "dstv", name: "DStv Compact", duration: "30 Days", price: 10000, naira: "₦10,000" },
  { provider: "gotv", name: "GOtv Plus", duration: "30 Days", price: 2900, naira: "₦2,900" },
  { provider: "gotv", name: "GOtv Max", duration: "30 Days", price: 5900, naira: "₦5,900" },
  { provider: "startimes", name: "STARTIMES Classic", duration: "30 Days", price: 1500, naira: "₦1,500" },
  { provider: "startimes", name: "STARTIMES Smart", duration: "30 Days", price: 3500, naira: "₦3,500" },
  { provider: "showmax", name: "SHOWMAX Standard", duration: "30 Days", price: 3600, naira: "₦3,600" },
];

const UtilitiesTV = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const filteredPlans = selectedProvider
    ? tvPlans.filter((plan) => plan.provider === selectedProvider)
    : [];

  const handleProceed = () => {
    if (!selectedProvider || selectedPlan === null) {
      toast.error("Please select a provider and plan");
      return;
    }
    const plan = filteredPlans[selectedPlan];
    toast.success(`${plan.name} subscription activated for 30 days`);
    setTimeout(() => navigate("/wallet"), 1500);
  };

  return (
    <div className="min-h-screen pb-24 relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="backdrop-blur-xl bg-card/30 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-3 py-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/wallet")} aria-label="Go back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Tv className="w-5 h-5 text-primary" />
            <h1 className="text-base sm:text-lg font-bold">TV Subscription</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="w-fit bg-muted text-foreground/80 text-xs px-3 py-1 rounded-full shadow-sm">
          Subscribe to Your Favorite TV Service
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-bold">Select Provider</h2>
          <div className="grid grid-cols-2 gap-3">
            {tvProviders.map((provider) => (
              <button
                key={provider.id}
                onClick={() => {
                  setSelectedProvider(provider.id);
                  setSelectedPlan(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedProvider === provider.id
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-white/5 hover:border-border/80"
                }`}
              >
                <img src={provider.logo} alt={provider.name} className="w-12 h-12 object-contain mb-2 mx-auto" />
                <p className="font-semibold text-sm">{provider.name}</p>
              </button>
            ))}
          </div>
        </section>

        {selectedProvider && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold">Select Plan</h2>
            <div className="space-y-2">
              {filteredPlans.map((plan, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPlan(idx)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedPlan === idx
                      ? "border-primary bg-primary/10"
                      : "border-border/50 bg-white/5 hover:border-border/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{plan.name}</p>
                      <p className="text-xs text-cyan-300">{plan.duration}</p>
                    </div>
                    <p className="font-bold text-primary">{plan.naira}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <Button
          onClick={handleProceed}
          disabled={!selectedProvider || selectedPlan === null}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg"
        >
          Subscribe
        </Button>
      </main>
    </div>
  );
};

export default UtilitiesTV;
