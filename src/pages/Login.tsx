import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import ThreeBackground from "@/components/ThreeBackground";
import { mockLogin, setCurrentUser } from "@/utils/mockAuth";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Building2, ShoppingBag } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = mockLogin(email, password);
    
    if (user) {
      setCurrentUser(user);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      
      if (user.role === "industry") {
        navigate("/industry");
      } else {
        navigate("/buyer");
      }
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Try the demo accounts.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <ThreeBackground />
      
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 animate-fade-in">
        <div className="flex flex-col justify-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              TradeLink
            </h1>
            <p className="text-xl text-muted-foreground">
              Connecting China Industries with Nigerian Buyers
            </p>
          </div>
          
          <div className="space-y-4 pt-4">
            <h2 className="text-2xl font-semibold text-foreground">Demo Accounts</h2>
            
            <GlassCard className="cursor-pointer" hover>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Industry Account</p>
                  <p className="text-sm text-muted-foreground">industry@china.com / password</p>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="cursor-pointer" hover>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/20 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold">Buyer Account</p>
                  <p className="text-sm text-muted-foreground">buyer@nigeria.com / password</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
        
        <GlassCard>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to continue to your dashboard</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 bg-background/50"
                />
              </div>
            </div>
            
            <Button type="submit" variant="gradient" size="lg" className="w-full">
              Sign In
              <ArrowRight className="w-5 h-5" />
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="#" className="text-primary hover:underline">
                Contact us
              </a>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
