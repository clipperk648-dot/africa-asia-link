import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import ThreeBackground from "@/components/ThreeBackground";
import { loginUser, googleOAuthLogin, saveSession } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Eye, EyeOff, Loader2, Briefcase } from "lucide-react";
import { z } from "zod";
import "../styles/auth.css";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const SellerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ email, password });

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

    setIsLoading(true);
    setErrors({});

    try {
      const loginResult = await loginUser(email.trim(), password);

      if (loginResult.success && loginResult.user) {
        if (loginResult.user.role !== "industry" && !loginResult.user.isAdmin) {
          setErrors({
            form: "This account is not a seller account. Please use the buyer login.",
          });
          setIsLoading(false);
          return;
        }

        saveSession(loginResult.user);

        toast({
          title: "Seller Login Successful",
          description: `Welcome back to your business dashboard, ${loginResult.user.name}!`,
        });

        if (loginResult.user.isAdmin) {
          navigate("/admin");
        } else {
          navigate("/industry");
        }
      } else {
        setErrors({
          form: loginResult.error || "Login failed. Please check your credentials.",
        });
      }
    } catch (error) {
      setErrors({
        form: "An error occurred during login. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <ThreeBackground />
      
      <div className="w-full max-w-md animate-fade-in">
        <div className="space-y-1 mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Echina Seller
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your industrial products and reach global buyers
          </p>
        </div>
        
        <GlassCard className="p-4 sm:p-6 slide-up">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1 text-center">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-full bg-primary/20 text-primary">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Business Portal</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Sign in to your merchant account</p>
            </div>

            {errors.form && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{errors.form}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 bg-background/50 text-sm"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 bg-background/50 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>
            </div>
            
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              className="w-full h-10 group text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Merchant Login</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="text-center space-y-1 mt-4">
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                New merchant?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/seller/signup")}
                  className="text-primary hover:underline font-semibold"
                >
                  Register your business
                </button>
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Are you a buyer? Sign in here
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default SellerLogin;
