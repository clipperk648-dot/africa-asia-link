import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAllUsers } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Shield, User as UserIcon, Mail, Phone, Calendar } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: users = [], isLoading } = useAllUsers();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h1 className="text-xl font-bold">User Management</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Loading users...</p>
        ) : (
          <div className="grid gap-4">
            {users.map((u: unknown) => {
              const userItem = u as { id: string, name: string, email: string, role: string, phone?: string, created_at: string };
              return (
                <GlassCard key={userItem.id} className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userItem.email}`} />
                        <AvatarFallback>{userItem.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{userItem.name}</h3>
                          {userItem.role === 'admin' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-500 text-[10px] font-bold rounded-full uppercase">
                              <Shield className="w-3 h-3" />
                              Admin
                            </span>
                          )}
                          {userItem.role === 'industry' && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 text-[10px] font-bold rounded-full uppercase">
                              Industry
                            </span>
                          )}
                          {userItem.role === 'buyer' && (
                            <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-[10px] font-bold rounded-full uppercase">
                              Buyer
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {userItem.email}
                          </div>
                          {userItem.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {userItem.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Joined {new Date(userItem.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                        Edit Role
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 md:flex-none text-red-500 hover:text-red-500 hover:bg-red-500/10 border-red-500/50">
                        Suspend
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </main>

      <FooterNav dashboardType="admin" />
    </div>
  );
};

export default AdminUsers;
