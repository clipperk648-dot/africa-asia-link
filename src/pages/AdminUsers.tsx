import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAllUsers } from "@/hooks/useData";
import { updateUserRole, suspendUser, deleteUser } from "@/lib/db";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Shield, User as UserIcon, Mail, Phone, Calendar, Trash2, Check, X, Search } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  created_at: string;
  suspended?: boolean;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading, refetch } = useAllUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRole, setEditingRole] = useState<{ userId: string; newRole: string } | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [suspendingUserId, setSuspendingUserId] = useState<string | null>(null);

  useEffect(() => {
    console.log("AdminUsers - currentUser:", currentUser);
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const filteredUsers = Array.isArray(users)
    ? (users as User[]).filter((u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success("User role updated successfully");
      setEditingRole(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update user role");
      console.error(error);
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
      toast.error("Failed to update user status");
      console.error(error);
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
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <h1 className="text-xl font-bold">User Management</h1>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background/50"
            />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No users found</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((u: User) => (
              <GlassCard key={u.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12 border-2 border-primary/20 flex-shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} />
                      <AvatarFallback>{u.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-lg">{u.name}</h3>
                        {u.role === 'admin' && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-500 text-[10px] font-bold rounded-full uppercase">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                        {u.role === 'industry' && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 text-[10px] font-bold rounded-full uppercase">
                            Industry
                          </span>
                        )}
                        {u.role === 'buyer' && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[10px] font-bold rounded-full uppercase">
                            Buyer
                          </span>
                        )}
                        {u.suspended && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 text-[10px] font-bold rounded-full uppercase">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {u.email}
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {u.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap md:flex-nowrap">
                    {editingRole?.userId === u.id ? (
                      <div className="flex gap-2 w-full md:w-auto">
                        <Select
                          value={editingRole.newRole}
                          onValueChange={(value) =>
                            setEditingRole({ userId: u.id, newRole: value })
                          }
                        >
                          <SelectTrigger className="h-9 w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="industry">Industry</SelectItem>
                            <SelectItem value="buyer">Buyer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="px-2"
                          onClick={() =>
                            handleRoleChange(u.id, editingRole.newRole)
                          }
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="px-2"
                          onClick={() => setEditingRole(null)}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingRole({ userId: u.id, newRole: u.role })
                        }
                        className="flex-1 md:flex-none"
                      >
                        Edit Role
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSuspendingUserId(u.id)}
                      className={`flex-1 md:flex-none ${
                        u.suspended
                          ? "text-green-500 border-green-500/50 hover:bg-green-500/10"
                          : "text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10"
                      }`}
                    >
                      {u.suspended ? "Unsuspend" : "Suspend"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingUserId(u.id)}
                      className="flex-1 md:flex-none text-red-500 hover:text-red-500 hover:bg-red-500/10 border-red-500/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>

      <AlertDialog open={suspendingUserId !== null} onOpenChange={() => setSuspendingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {(users as User[]).find((u) => u.id === suspendingUserId)?.suspended
                ? "Unsuspend User?"
                : "Suspend User?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {(users as User[]).find((u) => u.id === suspendingUserId)?.suspended
                ? "This user will be able to log in again."
                : "This user will not be able to log in until unsuspended."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => suspendingUserId && handleSuspendUser(suspendingUserId)}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deletingUserId !== null} onOpenChange={() => setDeletingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The user account and all associated data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deletingUserId && handleDeleteUser(deletingUserId)}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete User
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>

      <FooterNav dashboardType="admin" />
    </div>
  );
};

export default AdminUsers;
