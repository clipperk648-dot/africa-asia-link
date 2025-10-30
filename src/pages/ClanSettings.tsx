import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Save, AlertTriangle, Users, Lock, Settings as SettingsIcon } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const ClanSettings = () => {
  const navigate = useNavigate();
  const { clanId } = useParams<{ clanId: string }>();

  const [settings, setSettings] = useState({
    name: "Premium Electronics Collective",
    description: "A group pooling resources to get wholesale electronics at better rates",
    isPublic: true,
    joinApprovalRequired: false,
    maxMembers: 50,
  });

  const [members, setMembers] = useState([
    { id: "user1", username: "Sarah Johnson", role: "creator", joinDate: "2024-01-15" },
    { id: "user2", username: "Michael Chen", role: "member", joinDate: "2024-01-16" },
    { id: "user3", username: "Emily Davis", role: "moderator", joinDate: "2024-01-17" },
    { id: "user4", username: "John Smith", role: "member", joinDate: "2024-01-18" },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Clan settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveMember = (userId: string) => {
    setMembers(members.filter((m) => m.id !== userId));
    toast.success("Member removed from clan");
  };

  const handlePromoteModerator = (userId: string) => {
    setMembers(
      members.map((m) =>
        m.id === userId ? { ...m, role: m.role === "moderator" ? "member" : "moderator" } : m
      )
    );
    toast.success("Member role updated");
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/clan/${clanId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Clan Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your clan</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Basic Settings */}
        <GlassCard className="p-6 bg-card/50 border-border/50">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            Basic Settings
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clan-name">Clan Name</Label>
              <Input
                id="clan-name"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="h-10 bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clan-description">Description</Label>
              <Textarea
                id="clan-description"
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="bg-background/50 min-h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-members">Maximum Members</Label>
              <Input
                id="max-members"
                type="number"
                value={settings.maxMembers}
                onChange={(e) => setSettings({ ...settings, maxMembers: parseInt(e.target.value) })}
                className="h-10 bg-background/50"
              />
            </div>
          </div>
        </GlassCard>

        {/* Privacy Settings */}
        <GlassCard className="p-6 bg-card/50 border-border/50">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Privacy Settings
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <p className="font-semibold">Public Clan</p>
                <p className="text-sm text-muted-foreground">Anyone can discover and join this clan</p>
              </div>
              <input
                type="checkbox"
                checked={settings.isPublic}
                onChange={(e) => setSettings({ ...settings, isPublic: e.target.checked })}
                className="w-5 h-5 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <p className="font-semibold">Approval Required</p>
                <p className="text-sm text-muted-foreground">New members require approval to join</p>
              </div>
              <input
                type="checkbox"
                checked={settings.joinApprovalRequired}
                onChange={(e) => setSettings({ ...settings, joinApprovalRequired: e.target.checked })}
                className="w-5 h-5 rounded"
              />
            </div>
          </div>
        </GlassCard>

        {/* Members Management */}
        <GlassCard className="p-6 bg-card/50 border-border/50">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Members ({members.length})
          </h2>

          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex-1">
                  <p className="font-semibold">{member.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                    <p className="text-xs text-muted-foreground">Joined {member.joinDate}</p>
                  </div>
                </div>

                {member.role !== "creator" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePromoteModerator(member.id)}
                      className="text-xs"
                    >
                      {member.role === "moderator" ? "Demote" : "Promote"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard className="p-6 bg-destructive/5 border-destructive/20">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>

          <p className="text-sm text-muted-foreground mb-4">
            These actions cannot be undone. Please be careful.
          </p>

          <div className="space-y-2">
            <Button variant="destructive" className="w-full">
              Disband Clan
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              This will permanently delete the clan and refund all members their contributions.
            </p>
          </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/clan/${clanId}`)}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex-1 h-12 bg-accent hover:bg-accent/90 text-black font-semibold"
          >
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default ClanSettings;
