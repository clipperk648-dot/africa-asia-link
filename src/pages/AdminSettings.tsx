import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Settings, Shield, Bell, Globe, Database, 
  Mail, Lock, Save, Trash2, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Settings saved successfully");
    }, 1000);
  };

  return (
    <AdminLayout>
      <main className="max-w-4xl mx-auto px-4 py-8 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Global platform configuration and security.</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 p-1 rounded-xl h-12">
            <TabsTrigger value="general" className="rounded-lg text-xs font-bold uppercase tracking-wider">General</TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg text-xs font-bold uppercase tracking-wider">Security</TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg text-xs font-bold uppercase tracking-wider">Alerts</TabsTrigger>
            <TabsTrigger value="advanced" className="rounded-lg text-xs font-bold uppercase tracking-wider">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-8 space-y-6">
            <GlassCard className="p-6 border-white/5 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-white">Platform Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Platform Name</label>
                  <Input defaultValue="TradeLink Global" className="bg-background/50 border-white/10 h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Support Email</label>
                  <Input defaultValue="support@tradelink.com" className="bg-background/50 border-white/10 h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Currency Code</label>
                  <Input defaultValue="USD" className="bg-background/50 border-white/10 h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Timezone</label>
                  <Input defaultValue="UTC" className="bg-background/50 border-white/10 h-11" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Maintenance Mode</h4>
                  <p className="text-[10px] text-muted-foreground">Take the platform offline for updates.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div>
                  <h4 className="text-sm font-bold text-white">User Registrations</h4>
                  <p className="text-[10px] text-muted-foreground">Allow new users to join the platform.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="security" className="mt-8 space-y-6">
            <GlassCard className="p-6 border-white/5 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold text-white">Access Control</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white">Two-Factor Authentication</p>
                    <p className="text-[10px] text-muted-foreground">Enforce 2FA for all administrator accounts.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white">IP Whitelisting</p>
                    <p className="text-[10px] text-muted-foreground">Restrict admin panel access to specific IP addresses.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="advanced" className="mt-8 space-y-6">
             <GlassCard className="p-6 border-white/5 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Database & System</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white">Flush Cache</p>
                    <p className="text-[10px] text-muted-foreground">Clear all server-side and CDN cached data.</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-white/10 h-9 gap-2">
                    <RefreshCw className="w-3.5 h-3.5" /> Execute
                  </Button>
                </div>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-red-400">Purge Data</p>
                    <p className="text-[10px] text-muted-foreground">Delete logs older than 90 days.</p>
                  </div>
                  <Button variant="destructive" size="sm" className="h-9 gap-2">
                    <Trash2 className="w-3.5 h-3.5" /> Purge
                  </Button>
                </div>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button onClick={handleSave} disabled={loading} className="w-full md:w-auto h-12 px-12 gap-2 text-lg font-bold shadow-lg shadow-primary/20">
            <Save className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminSettings;
