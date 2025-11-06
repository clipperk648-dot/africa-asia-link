import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import ThreeBackground from "@/components/ThreeBackground";
import { registerUser, saveSession } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Building2, ShoppingBag, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import "../styles/auth.css";

const signupSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }),
  phone: z.string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^[+]?[\d\s\-()]+$/, { message: "Invalid phone number format" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password confirmation required" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedRole, setSelectedRole] = useState<"industry" | "buyer" | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
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
      const registerResult = await registerUser(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.phone.trim(),
        selectedRole
      );

      if (registerResult.success && registerResult.user) {
        saveSession(registerResult.user);

        toast({
          title: "Account Created Successfully",
          description: `Welcome to Echina, ${registerResult.user.name}!`,
        });

        if (selectedRole === "industry") {
          navigate("/industry");
        } else {
          navigate("/buyer");
        }
      } else {
        setErrors({
          form: registerResult.error || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      setErrors({
        form: "An error occurred during registration. Please try again.",
      });
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <ThreeBackground />
      
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-3 sm:gap-4 animate-fade-in">
        <div className="flex flex-col justify-center space-y-2 sm:space-y-3">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Echina
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Join the thriving trade network
            </p>
          </div>
          
          <div className="space-y-2 sm:space-y-2 pt-1 sm:pt-2">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">Create Your Account As</h2>

            <GlassCard
              className={`cursor-pointer transition-all p-2 sm:p-3 hover:scale-105 transform duration-300 ${
                selectedRole === "industry" ? "ring-2 ring-primary scale-105" : ""
              }`}
              onClick={() => setSelectedRole("industry")}
            >
              <div className="flex items-center gap-2 sm:gap-2">
                <div className={`p-1.5 sm:p-2 rounded-xl flex-shrink-0 ${
                  selectedRole === "industry" ? "bg-primary" : "bg-primary/20"
                }`}>
                  <Building2 className={`w-4 h-4 sm:w-4 sm:h-4 ${
                    selectedRole === "industry" ? "text-white" : "text-primary"
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs sm:text-sm">Seller</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Chinese Industry / Manufacturer</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard
              className={`cursor-pointer transition-all p-2 sm:p-3 hover:scale-105 transform duration-300 ${
                selectedRole === "buyer" ? "ring-2 ring-secondary scale-105" : ""
              }`}
              onClick={() => setSelectedRole("buyer")}
            >
              <div className="flex items-center gap-2 sm:gap-2">
                <div className={`p-1.5 sm:p-2 rounded-xl flex-shrink-0 ${
                  selectedRole === "buyer" ? "bg-secondary" : "bg-secondary/20"
                }`}>
                  <ShoppingBag className={`w-4 h-4 sm:w-4 sm:h-4 ${
                    selectedRole === "buyer" ? "text-white" : "text-secondary"
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs sm:text-sm">Buyer</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Nigerian Business / Trader</p>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:underline font-semibold"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
        
        <GlassCard className="p-3 sm:p-4 slide-up">
          <form onSubmit={handleSignUp} className="space-y-2 sm:space-y-2">
            <div className="space-y-1 sm:space-y-1 text-center">
              <h2 className="text-lg sm:text-xl font-bold">Create Account</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Fill in your details to get started</p>
            </div>

            {errors.form && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{errors.form}</p>
              </div>
            )}

            <div className="space-y-2 sm:space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs">Full Name / Company Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`h-9 bg-background/50 transition-all text-sm ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name && (
                  <p className="text-xs text-destructive animate-pulse">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`h-9 bg-background/50 transition-all text-sm ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && (
                  <p className="text-xs text-destructive animate-pulse">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+234 (0) 000 000 0000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`h-9 bg-background/50 transition-all text-sm ${errors.phone ? 'border-destructive' : ''}`}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive animate-pulse">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`h-9 bg-background/50 pr-10 transition-all text-sm ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive animate-pulse">{errors.password}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="confirmPassword" className="text-xs">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`h-9 bg-background/50 pr-10 transition-all text-sm ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive animate-pulse">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              className="w-full h-8 group text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="text-center text-[10px] sm:text-xs text-muted-foreground">
              By signing up, you agree to our terms of service
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default SignUp;
