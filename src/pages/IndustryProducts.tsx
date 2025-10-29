import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { useProducts } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, Star } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { getSafeImageUrl, createImageErrorHandler } from "@/utils/imageOptimization";

const IndustryProducts = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { data: products = [] } = useProducts();

  useEffect(() => {
    if (!user || user.role !== "industry") {
      navigate("/login");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/industry")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">My Products</h1>
          </div>
          
          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10 h-11 bg-background/50"
              />
            </div>
            <Button variant="glass" size="icon" className="h-11 w-11">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {products.map((product) => (
          <GlassCard key={product.id} className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <img
                src={getSafeImageUrl(product.image)}
                alt={product.name}
                loading="lazy"
                onError={createImageErrorHandler()}
                className="w-full sm:w-32 h-40 sm:h-32 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg sm:text-xl truncate">{product.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.category}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 truncate">{product.location}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-4 gap-3">
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    ${product.price.toLocaleString()}
                  </p>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => navigate(`/industry/products/${product.id}/edit`)}>Edit</Button>
                    <Button variant="gradient" size="sm" className="flex-1 sm:flex-none" onClick={() => navigate(`/industry/products/${product.id}/stats`)}>View Stats</Button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryProducts;
