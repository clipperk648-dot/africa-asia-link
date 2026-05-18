import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowRight, Globe, TrendingUp, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.isAdmin) {
        navigate("/admin");
      } else if (user.role === "industry" || user.role === "sourcing-agent") {
        navigate("/industry");
      } else {
        navigate("/buyer");
      }
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Globe,
      title: "Global Network",
      description: "Connect with verified suppliers and buyers across continents",
    },
    {
      icon: Shield,
      title: "Secure Trading",
      description: "End-to-end encryption and verified business partners",
    },
    {
      icon: TrendingUp,
      title: "Smart Analytics",
      description: "Real-time market insights and trade analytics",
    },
    {
      icon: Zap,
      title: "Fast Processing",
      description: "Streamlined workflows and instant communication",
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Banner Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://cdn.builder.io/o/assets%2Fb6198669f4754d65b52a472eb983bf6a%2Fa1f93e869b6f419eac1c318985a39a15?alt=media&token=d5e5b0b8-9d79-47e0-bc70-caa9377302de&apiKey=b6198669f4754d65b52a472eb983bf6a"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-fade-in" style={{ animationDuration: '0.8s' }}>
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Echina
              </span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-white drop-shadow-lg">
              Bridging China Merchants & Nigerian Markets
            </p>
            <p className="text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto px-4 drop-shadow-lg">
              The premier platform connecting Chinese merchants and agents with Nigerian buyers.
              Streamline your international trade with powerful tools and verified partners.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 w-full px-4">
            <Button
              variant="gradient"
              size="lg"
              onClick={() => navigate("/login")}
              className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="glass"
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
            >
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-12 px-4">
            <GlassCard className="text-center p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <p className="text-2xl sm:text-3xl font-bold text-primary">500+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Active Suppliers</p>
            </GlassCard>
            <GlassCard className="text-center p-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <p className="text-2xl sm:text-3xl font-bold text-secondary">1200+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Verified Buyers</p>
            </GlassCard>
            <GlassCard className="text-center p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <p className="text-2xl sm:text-3xl font-bold text-accent">₦45B+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Trade Volume</p>
            </GlassCard>
            <GlassCard className="text-center p-4 animate-slide-up" style={{ animationDelay: '0.25s' }}>
              <p className="text-2xl sm:text-3xl font-bold text-primary">98%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Success Rate</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 px-4">
              Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">Echina</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              Everything you need for successful international trade
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <GlassCard
                key={i}
                className="group animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-primary rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="text-center p-6 sm:p-8 md:p-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
              Join thousands of businesses already connecting through Echina
            </p>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => navigate("/login")}
              className="text-base sm:text-lg px-8 sm:px-12 w-full sm:w-auto"
            >
              Sign In Now
              <ArrowRight className="w-5 h-5" />
            </Button>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default Index;
