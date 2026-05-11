import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import ThreeBackground from "@/components/ThreeBackground";
import { registerUser, saveSession } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Eye, EyeOff, Loader2, Briefcase, Building2 } from "lucide-react";
import { z } from "zod";
import "../styles/auth.css";

const signupSchema = z.object({
  name: z.string().trim().min(2, { message: "Business name must be at least 2 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }),
  phone: z.string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password confirmation required" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const SellerSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = signupSchema.safeParse(formData);

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
      const registerResult = await registerUser(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.phone.trim(),
        "industry"
      );

      if (registerResult.success && registerResult.user) {
        saveSession(registerResult.user);

        toast({
          title: "Business Account Created",
          description: `Welcome to the Echina platform, ${registerResult.user.name}!`,
        });

        navigate("/industry");
      } else {
        setErrors({
          form: registerResult.error || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      setErrors({
        form: "An error occurred during registration. Please try again.",
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
            Echina Merchant
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Empower your industrial business globally
          </p>
        </div>
        
        <GlassCard className="p-4 sm:p-6 slide-up">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1 text-center">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-full bg-primary/20 text-primary">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Merchant Registration</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Join our network of industrial merchants and agents</p>
            </div>

            {errors.form && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{errors.form}</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Business / Company Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter business name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-10 bg-background/50 text-sm"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Business Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-10 bg-background/50 text-sm"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs">Contact Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+234..."
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="h-10 bg-background/50 text-sm"
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-10 bg-background/50 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="h-10 bg-background/50 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Merchant Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="text-center space-y-1 mt-4">
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/seller/login")}
                  className="text-primary hover:underline font-semibold"
                >
                  Sign In
                </button>
              </p>
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Are you a buyer? Sign up here
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default SellerSignUp;
