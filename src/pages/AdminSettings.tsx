import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { logoutUser } from "@/lib/auth";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, User, Bell, Lock, Shield, LogOut, Image as ImageIcon, Mail, Phone } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [prefs, setPrefs] = useState({
    language: "English",
    currency: "USD",
    emailNotifications: true,
    orderNotifications: true,
    systemNotifications: true,
  });

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
      return;
    }
    const saved = localStorage.getItem(`admin_prefs_${currentUser.id}`);
    if (saved) {
      try {
        setPrefs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load preferences", e);
      }
    }
    const savedAvatar = localStorage.getItem(`admin_avatar_${currentUser.id}`);
    if (savedAvatar) {
      setAvatarUrl(savedAvatar);
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };

  const handleSavePrefs = () => {
    localStorage.setItem(`admin_prefs_${currentUser?.id}`, JSON.stringify(prefs));
    toast.success("Preferences saved");
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/30 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Admin Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4 sm:space-y-6">
        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Profile Information</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'admin'}`} />
                <AvatarFallback>{currentUser?.name?.[0] || 'A'}</AvatarFallback>
              </Avatar>
              <div>
                <input
                  id="avatar-admin"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result as string;
                        setAvatarUrl(result);
                        localStorage.setItem(`admin_avatar_${currentUser?.id}`, result);
                        toast.success("Avatar updated");
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('avatar-admin')?.click()}
                  className="gap-2"
                >
                  <ImageIcon className="w-4 h-4" /> Change Photo
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Admin Name</Label>
                <Input
                  id="admin-name"
                  defaultValue={currentUser?.name || ""}
                  disabled
                  className="h-10 bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  defaultValue={currentUser?.email || ""}
                  disabled
                  className="h-10 bg-background/50"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-secondary/20 rounded-lg">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">Order Updates</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Get notified about new orders</p>
              </div>
              <Switch
                checked={prefs.orderNotifications}
                onCheckedChange={(checked) =>
                  setPrefs({ ...prefs, orderNotifications: checked })
                }
                className="flex-shrink-0"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">System Alerts</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Critical system notifications</p>
              </div>
              <Switch
                checked={prefs.systemNotifications}
                onCheckedChange={(checked) =>
                  setPrefs({ ...prefs, systemNotifications: checked })
                }
                className="flex-shrink-0"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base">Email Notifications</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                checked={prefs.emailNotifications}
                onCheckedChange={(checked) =>
                  setPrefs({ ...prefs, emailNotifications: checked })
                }
                className="flex-shrink-0"
              />
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
            <p className="text-sm text-muted-foreground">Security features are managed through your account profile.</p>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate("/admin")}
            >
              Back to Dashboard
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={prefs.language} onValueChange={(v) => setPrefs({ ...prefs, language: v })}>
                <SelectTrigger className="h-10 bg-background/50">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
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
              <Select value={prefs.currency} onValueChange={(v) => setPrefs({ ...prefs, currency: v })}>
                <SelectTrigger className="h-10 bg-background/50">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="NGN">NGN (₦)</SelectItem>
                  <SelectItem value="CNY">CNY (¥)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSavePrefs} className="w-full">
              Save Preferences
            </Button>
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

      <FooterNav dashboardType="admin" />
    </div>
  );
};

export default AdminSettings;
