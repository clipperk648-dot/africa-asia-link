import FooterNav from "@/components/FooterNav";
import GlassCard from "@/components/GlassCard";
import ThreeBackground from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BuyerChangePassword = () => {
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
            <Lock className="w-5 h-5" />
            <h1 className="text-xl font-bold">Change Password</h1>
          </div>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <GlassCard className="p-4 sm:p-6">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="current">Current Password</Label>
              <Input id="current" type="password" className="h-11 bg-background/50" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new">New Password</Label>
              <Input id="new" type="password" className="h-11 bg-background/50" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input id="confirm" type="password" className="h-11 bg-background/50" />
            </div>
            <Button variant="gradient" className="w-full">Update Password</Button>
          </div>
        </GlassCard>
      </main>
      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default BuyerChangePassword;
