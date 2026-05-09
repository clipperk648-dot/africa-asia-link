import { useState } from "react";
import { useAllUsers } from "@/hooks/useData";
import { createNotification } from "@/lib/db";
import type { User } from "@/types/models";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, Send, Users, Search, 
  CheckCircle2, AlertCircle, Info, Megaphone
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminNotifications = () => {
  const { data: users = [] } = useAllUsers();
  const [targetType, setTargetType] = useState<"all" | "role" | "specific">("all");
  const [targetRole, setTargetRole] = useState<string>("buyer");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "success" | "warning" | "error">("info");
  const [sending, setSending] = useState(false);

  const userList = users as User[];

  const filteredUsers = userList.filter((u) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }

    setSending(true);
    try {
      let targets: string[] = [];
      
      if (targetType === "all") {
        targets = userList.map((u) => u.id);
      } else if (targetType === "role") {
        targets = userList.filter((u) => u.role === targetRole).map((u) => u.id);
      } else if (targetType === "specific") {
        if (!selectedUserId) {
          toast.error("Please select a user");
          setSending(false);
          return;
        }
        targets = [selectedUserId];
      }

      if (targets.length === 0) {
        toast.error("No users found for selected criteria");
        setSending(false);
        return;
      }

      const promises = targets.map(userId => 
        createNotification(userId, title, message, type)
      );

      await Promise.all(promises);
      toast.success(`Notification sent to ${targets.length} user(s)`);
      setTitle("");
      setMessage("");
    } catch (error) {
      toast.error("Failed to send notifications");
    } finally {
      setSending(false);
    }
  };

  return (
    <AdminLayout>
      <main className="max-w-4xl mx-auto px-4 py-8 w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            System Notifications
          </h1>
          <p className="text-muted-foreground mt-2">Send announcements and alerts to your users.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6 border-white/5 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    Title
                  </label>
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Scheduled Maintenance"
                    className="bg-background/50 border-white/10 h-12 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white uppercase tracking-wider">
                    Message
                  </label>
                  <Textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the update in detail..."
                    className="bg-background/50 border-white/10 min-h-[150px] focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white uppercase tracking-wider">
                      Priority Level
                    </label>
                    <Select value={type} onValueChange={(val: "info" | "success" | "warning" | "error") => setType(val)}>
                      <SelectTrigger className="bg-background/50 border-white/10 h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background/95 border-white/10">
                        <SelectItem value="info">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-400" />
                            <span>Information</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="success">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Announcement</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="warning">
                          <div className="flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-amber-400" />
                            <span>Warning</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="error">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span>Urgent Alert</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <Button 
                  onClick={handleSend} 
                  disabled={sending}
                  className="w-full h-12 gap-2 text-lg font-bold shadow-lg shadow-primary/20"
                >
                  <Send className={`w-5 h-5 ${sending ? 'animate-pulse' : ''}`} />
                  {sending ? "Sending..." : "Dispatch Notification"}
                </Button>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6 border-white/5">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Target Audience
              </h3>

              <Tabs value={targetType} onValueChange={(val: string) => setTargetType(val as "all" | "role" | "specific")} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1 rounded-xl">
                  <TabsTrigger value="all" className="rounded-lg text-[10px] font-bold uppercase tracking-tighter">All</TabsTrigger>
                  <TabsTrigger value="role" className="rounded-lg text-[10px] font-bold uppercase tracking-tighter">Role</TabsTrigger>
                  <TabsTrigger value="specific" className="rounded-lg text-[10px] font-bold uppercase tracking-tighter">User</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                    <p className="text-sm text-primary font-medium">Broadcast to all users</p>
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">Estimated: {userList.length} recipients</p>
                  </div>
                </TabsContent>

                <TabsContent value="role" className="mt-6 space-y-4">
                  <Select value={targetRole} onValueChange={setTargetRole}>
                    <SelectTrigger className="bg-background/50 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyers Only</SelectItem>
                      <SelectItem value="industry">Sellers/Industry Only</SelectItem>
                      <SelectItem value="admin">Administrators Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                    Targets {userList.filter((u) => u.role === targetRole).length} users
                  </p>
                </TabsContent>

                <TabsContent value="specific" className="mt-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input 
                      placeholder="Find user..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 bg-background/50 border-white/10 text-xs"
                    />
                  </div>
                  <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {filteredUsers.slice(0, 20).map((u) => (
                      <div 
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${
                          selectedUserId === u.id 
                            ? 'bg-primary/20 border-primary shadow-sm shadow-primary/20' 
                            : 'bg-white/5 border-transparent hover:bg-white/10'
                        }`}
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] font-bold bg-white/10">{u.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{u.name}</p>
                          <p className="text-[9px] text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </GlassCard>

            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
                  Pushing notifications is instantaneous. Users will receive an alert in their notification panel immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminNotifications;
