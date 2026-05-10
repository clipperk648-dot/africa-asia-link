import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Tv } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const tvProviders = [
  { id: "dstv", name: "DStv", kind: "dstv" },
  { id: "gotv", name: "GOtv", kind: "gotv" },
  { id: "startimes", name: "STARTIMES", kind: "startimes" },
  { id: "showmax", name: "SHOWMAX", kind: "showmax" },
];

const renderProviderLogo = (provider: (typeof tvProviders)[number]) => {
  if (provider.kind === "dstv") {
    return (
      <div className="w-16 h-12 mb-2 mx-auto rounded-2xl bg-white flex items-center justify-center shadow-md px-2">
        <span className="text-[#1496db] font-black italic text-xl tracking-tight">DStv</span>
      </div>
    );
  }

  if (provider.kind === "gotv") {
    return (
      <div className="w-16 h-12 mb-2 mx-auto rounded-2xl bg-white flex items-center justify-center shadow-md px-2 gap-0.5">
        <span className="text-[#1590d8] font-black italic text-lg tracking-tight">GO</span>
        <span className="text-[#8cc63f] font-black italic text-lg tracking-tight">tv</span>
      </div>
    );
  }

  if (provider.kind === "startimes") {
    return (
      <div className="w-16 h-12 mb-2 mx-auto rounded-2xl bg-white flex items-center justify-center shadow-md px-2 gap-1">
        <div className="relative w-6 h-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ff8a00] to-[#ffb800]" />
          <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-full bg-gradient-to-br from-[#1f89ff] to-[#46b3ff] opacity-90" />
        </div>
        <span className="text-[#ff8a00] font-black text-[10px] tracking-tight">TV</span>
      </div>
    );
  }

  return (
    <div className="w-16 h-12 mb-2 mx-auto rounded-2xl bg-white flex items-center justify-center shadow-md px-2 gap-1">
      <div className="flex gap-1">
        <span className="w-2.5 h-8 rounded-full bg-[#ef476f] block -skew-x-12" />
        <span className="w-2.5 h-8 rounded-full bg-[#7b61ff] block -skew-x-12" />
      </div>
    </div>
  );
};




const tvPlans: { provider: string; name: string; duration: string; price: number; naira: string }[] = [];

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
                {renderProviderLogo(provider)}
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
