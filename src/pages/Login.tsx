import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import ThreeBackground from "@/components/ThreeBackground";
import { loginUser, googleOAuthLogin, saveSession } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Building2, ShoppingBag, Eye, EyeOff, Loader2, Mail } from "lucide-react";
import { z } from "zod";
import "../styles/auth.css";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
});

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<"industry" | "buyer" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const result = loginSchema.safeParse({ email, password, name });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select whether you're a seller or buyer",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // For existing users with mock auth, try login
      const result = await loginUser(email.trim(), password);

      if (result.success && result.user) {
        // Verify role matches
        if (result.user.role !== selectedRole) {
          setErrors({
            form: `This account is registered as a ${result.user.role}. Please select the correct role or use a different account.`,
          });
          setIsLoading(false);
          return;
        }

        saveSession(result.user);

        toast({
          title: "Login Successful",
          description: `Welcome back, ${result.user.name}!`,
        });

        if (selectedRole === "industry") {
          navigate("/industry");
        } else {
          navigate("/buyer");
        }
      } else {
        // If login fails with real auth, fall back to registration
        const user = {
          id: Math.random().toString(36).substr(2, 9),
          email: email.trim(),
          role: selectedRole,
          name: name.trim(),
        };

        saveSession(user);

        toast({
          title: "Welcome!",
          description: `Logged in as ${user.name}. (Demo Mode)`,
        });

        if (selectedRole === "industry") {
          navigate("/industry");
        } else {
          navigate("/buyer");
        }
      }
    } catch (error) {
      setErrors({
        form: "Login failed. Please try again.",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (!selectedRole) {
      toast({
        title: "Role Required",
        description: "Please select whether you're a seller or buyer",
        variant: "destructive",
      });
      return;
    }

    // Generate a mock Google user
    const googleUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: `user_${Math.random().toString(36).substr(2, 9)}@gmail.com`,
      role: selectedRole,
      name: "Google User",
    };

    saveSession(googleUser);

    toast({
      title: "Welcome!",
      description: `Signed in with Google. (Demo Mode)`,
    });

    if (selectedRole === "industry") {
      navigate("/industry");
    } else {
      navigate("/buyer");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <ThreeBackground />
      
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6 sm:gap-8 animate-fade-in">
        <div className="flex flex-col justify-center space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Echina
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Connecting China Industries with Nigerian Buyers
            </p>
          </div>
          
          <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Select Your Role</h2>
            
            <GlassCard
              className={`cursor-pointer transition-all p-4 sm:p-6 hover:scale-105 transform duration-300 ${
                selectedRole === "industry" ? "ring-2 ring-primary scale-105" : ""
              }`}
              onClick={() => setSelectedRole("industry")}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${
                  selectedRole === "industry" ? "bg-primary" : "bg-primary/20"
                }`}>
                  <Building2 className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    selectedRole === "industry" ? "text-white" : "text-primary"
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base">I'm a Seller</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Chinese Industry / Manufacturer</p>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard
              className={`cursor-pointer transition-all p-4 sm:p-6 hover:scale-105 transform duration-300 ${
                selectedRole === "buyer" ? "ring-2 ring-secondary scale-105" : ""
              }`}
              onClick={() => setSelectedRole("buyer")}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`p-2 sm:p-3 rounded-xl flex-shrink-0 ${
                  selectedRole === "buyer" ? "bg-secondary" : "bg-secondary/20"
                }`}>
                  <ShoppingBag className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    selectedRole === "buyer" ? "text-white" : "text-secondary"
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base">I'm a Buyer</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Nigerian Business / Trader</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
        
        <GlassCard className="p-4 sm:p-6 slide-up">
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div className="space-y-1 sm:space-y-2 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold">Welcome Back</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Sign in to your account</p>
            </div>

            {errors.form && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{errors.form}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name / Company Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 bg-background/50"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

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
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
            </div>
            
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full h-11 sm:h-12 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-11 sm:h-12"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>

            <div className="text-center space-y-2">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-primary hover:underline font-semibold"
                >
                  Sign Up
                </button>
              </p>
              <p className="text-xs text-muted-foreground opacity-75">
                All credentials accepted for demo
              </p>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default Login;
