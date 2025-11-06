import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Bell, Lock, Globe, LogOut, Image as ImageIcon } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { getProfileImage, setProfileImage, getUserPrefs, setUserPrefs } from "@/utils/profile";

const BuyerSettings = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => getProfileImage(user?.id));
  const [prefs, setPrefs] = useState(() => getUserPrefs(user?.id));

  useEffect(() => {
    if (!user || user.role !== "buyer") {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      
      <header className="backdrop-blur-xl bg-card/30 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 py-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/buyer")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4 sm:space-y-6">
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Profile Information</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`} />
                <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <input id="avatar" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f && user?.id) {
                    const url = await setProfileImage(user.id, f);
                    setAvatarUrl(url);
                  }
                }} />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('avatar')?.click()} className="gap-2">
                  <ImageIcon className="w-4 h-4" /> Change photo
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                defaultValue={user?.name}
                className="h-11 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email}
                className="h-11 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                defaultValue="Lagos, Nigeria"
                className="h-11 bg-background/50"
              />
            </div>
            <Button variant="gradient">Save Changes</Button>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">Order Updates</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Get notified about order status</p>
              </div>
              <Switch defaultChecked className="flex-shrink-0" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">New Products</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Alert for new product listings</p>
              </div>
              <Switch defaultChecked className="flex-shrink-0" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">Price Alerts</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Notify on price changes</p>
              </div>
              <Switch defaultChecked className="flex-shrink-0" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Security</h2>
          </div>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/buyer/settings/password')}>
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/buyer/settings/2fa')}>
              Two-Factor Authentication
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={prefs.language} onValueChange={(v) => { const next = { ...prefs, language: v }; setPrefs(next); setUserPrefs(user?.id, next); }}>
                <SelectTrigger className="h-11 bg-background/50"><SelectValue placeholder="Select language" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="中文">中文</SelectItem>
                  <SelectItem value="Français">Français</SelectItem>
                  <SelectItem value="العربية">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={prefs.currency} onValueChange={(v) => { const next = { ...prefs, currency: v }; setPrefs(next); setUserPrefs(user?.id, next); }}>
                <SelectTrigger className="h-11 bg-background/50"><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="NGN">NGN (₦)</SelectItem>
                  <SelectItem value="CNY">CNY (¥)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default BuyerSettings;
