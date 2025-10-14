import FooterNav from "@/components/FooterNav";
import GlassCard from "@/components/GlassCard";
import ThreeBackground from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BuyerTwoFactor = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            <h1 className="text-xl font-bold">Two-Factor Authentication</h1>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <GlassCard className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable 2FA</p>
                <p className="text-sm text-muted-foreground">Protect your account with a second step</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Authenticator App</Label>
              <p className="text-sm text-muted-foreground">Use an authenticator app to generate codes.</p>
            </div>
            <Button variant="gradient" className="w-full">Continue</Button>
          </div>
        </GlassCard>
      </main>
      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default BuyerTwoFactor;
