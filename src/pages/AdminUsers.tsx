import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAllUsers } from "@/hooks/useData";
import { updateUserRole, suspendUser, deleteUser } from "@/lib/db";
import type { User } from "@/types/models";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, User as UserIcon, Mail, 
  Phone, Calendar, Trash2, Search, Filter,
  MoreVertical, ShieldCheck, ShieldAlert, UserPlus
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/AdminLayout";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading, refetch } = useAllUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [suspendingUserId, setSuspendingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const filteredUsers = (users as User[]).filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success(`Role updated to ${newRole}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const user = (users as User[]).find((u) => u.id === userId);
      const newStatus = !user?.suspended;
      await suspendUser(userId, newStatus);
      toast.success(newStatus ? "User suspended" : "User unsuspended");
      setSuspendingUserId(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      setDeletingUserId(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <AdminLayout>
      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background/50 border-white/10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter || "all"} onValueChange={(val) => setRoleFilter(val === "all" ? null : val)}>
                <SelectTrigger className="w-32 h-10 bg-background/50 border-white/10">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="industry">Industry</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 hover:bg-white/5">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button size="sm" className="w-full sm:w-auto gap-2 rounded-full shadow-lg shadow-primary/10">
            <UserPlus className="w-4 h-4" /> Add User
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <GlassCard className="p-12 text-center border-white/5">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-bold text-white">No users found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((u) => (
              <GlassCard key={u.id} className="p-5 hover:bg-white/5 transition-colors border-white/5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary uppercase text-sm font-bold">
                        {u.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className="font-bold text-white truncate">{u.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          u.role === 'industry' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {u.role}
                        </span>
                        {u.suspended && (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Suspended</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3" /> {u.email}
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3" /> {u.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" /> Joined {new Date(u.created_at || '').toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <Select value={u.role} onValueChange={(val) => handleRoleChange(u.id, val)}>
                      <SelectTrigger className="h-9 w-28 bg-white/5 border-white/10 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="industry">Industry</SelectItem>
                        <SelectItem value="sourcing-agent">Sourcing Agent</SelectItem>
                        <SelectItem value="buyer">Buyer</SelectItem>
                      </SelectContent>
                    </Select>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 border-white/5">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur-xl border-white/10">
                        <DropdownMenuItem onClick={() => setSuspendingUserId(u.id)}>
                          {u.suspended ? <ShieldCheck className="w-4 h-4 mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                          {u.suspended ? 'Unsuspend' : 'Suspend'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          onClick={() => setDeletingUserId(u.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <AlertDialog open={!!suspendingUserId} onOpenChange={() => setSuspendingUserId(null)}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will change the user's access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel className="border-white/10 bg-transparent text-white hover:bg-white/5">Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-primary text-white hover:bg-primary/90" onClick={() => suspendingUserId && handleSuspendUser(suspendingUserId)}>Confirm</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action is permanent and cannot be undone. All user data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel className="border-white/10 bg-transparent text-white hover:bg-white/5">Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={() => deletingUserId && handleDeleteUser(deletingUserId)}>Delete Account</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminUsers;
