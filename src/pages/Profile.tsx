import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { Button } from "@/components/ui/button";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Settings, Package, Wallet, User as UserIcon } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { getSafeAvatarUrl } from "@/utils/imageOptimization";

const Profile = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const username = user?.name || user?.email?.split("@")[0] || "user";

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      {/* Header */}
      <header className="backdrop-blur-xl bg-card/30 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-3 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">Profile</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navigate(user?.role === 'buyer' ? '/buyer/settings' : '/industry/settings')}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Info */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <img
              src={getSafeAvatarUrl(user?.name || user?.email || 'default')}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-primary/20 shadow-2xl"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{username}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            <div className="mt-2 inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              {user?.role}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassCard className="p-6 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => navigate(user?.role === 'buyer' ? '/buyer/orders' : '/industry/recent-activity')}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">My Orders</h3>
                <p className="text-sm text-muted-foreground">View your order history</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 hover:bg-primary/5 transition-colors cursor-pointer" onClick={() => navigate('/wallet')}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">My Wallet</h3>
                <p className="text-sm text-muted-foreground">Manage your funds</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="pt-4 flex gap-4">
          <Button variant="outline" className="flex-1" onClick={() => navigate(user?.role === 'buyer' ? '/buyer/settings' : '/industry/settings')}>
            Edit Profile
          </Button>
          <Button variant="destructive" className="flex-1" onClick={() => {
            localStorage.removeItem("currentUser");
            navigate("/login");
          }}>
            Log Out
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
