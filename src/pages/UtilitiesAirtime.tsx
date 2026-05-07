import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Smartphone } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const operators = [
  { id: "airtel", name: "Airtel", color: "bg-red-500" },
  { id: "mtn", name: "MTN", color: "bg-yellow-500" },
  { id: "glo", name: "Glo", color: "bg-green-500" },
  { id: "9mobile", name: "9mobile", color: "bg-purple-500" },
];

const airtimePlans = [
  { amount: 100, naira: "₦100" },
  { amount: 200, naira: "₦200" },
  { amount: 500, naira: "₦500" },
  { amount: 1000, naira: "₦1,000" },
  { amount: 2000, naira: "₦2,000" },
  { amount: 5000, naira: "₦5,000" },
];

const UtilitiesAirtime = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const handleProceed = () => {
    if (!selectedOperator || !selectedAmount || !phoneNumber) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`₦${selectedAmount} airtime purchase initiated for ${phoneNumber}`);
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
            <Smartphone className="w-5 h-5 text-primary" />
            <h1 className="text-base sm:text-lg font-bold">Recharge Airtime</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <div className="w-fit bg-muted text-foreground/80 text-xs px-3 py-1 rounded-full shadow-sm">
          Select Operator & Amount
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-bold">Select Operator</h2>
          <div className="grid grid-cols-2 gap-3">
            {operators.map((op) => (
              <button
                key={op.id}
                onClick={() => setSelectedOperator(op.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedOperator === op.id
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-white/5 hover:border-border/80"
                }`}
              >
                <div className={`w-12 h-12 ${op.color} rounded-lg mb-2 flex items-center justify-center text-white font-bold text-sm`}>
                  {op.name[0]}
                </div>
                <p className="font-semibold text-sm">{op.name}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold">Phone Number</h2>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-border/50 text-white placeholder-white/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold">Select Amount</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {airtimePlans.map((plan) => (
              <button
                key={plan.amount}
                onClick={() => setSelectedAmount(plan.amount)}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  selectedAmount === plan.amount
                    ? "border-primary bg-primary/10"
                    : "border-border/50 bg-white/5 hover:border-border/80"
                }`}
              >
                <p className="font-bold text-sm">{plan.naira}</p>
              </button>
            ))}
          </div>
        </section>

        <Button
          onClick={handleProceed}
          disabled={!selectedOperator || !selectedAmount || !phoneNumber}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg"
        >
          Proceed
        </Button>
      </main>
    </div>
  );
};

export default UtilitiesAirtime;
