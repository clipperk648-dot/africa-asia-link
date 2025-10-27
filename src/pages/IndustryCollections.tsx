import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { useProducts } from "@/hooks/useData";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Box, RotateCw } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import GlassCard from "@/components/GlassCard";
import ThreeModelFrame from "@/components/ThreeModelFrame";

const IndustryCollections = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { data: products = [], isLoading, error } = useProducts(20, 0);

  useEffect(() => {
    if (!user || user.role !== "industry") {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (error) {
    return (
      <div className="min-h-screen pb-24 relative flex items-center justify-center">
        <ThreeBackground />
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Error Loading Collections</h1>
          <p className="text-muted-foreground">Unable to load products. Please ensure database is connected.</p>
        </div>
      </div>
    );
  }

  const selectedProducts = products.slice(0, 3);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/industry")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Box className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">3D Collections</h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Explore our premium 3D model showcase gallery
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {selectedProducts.map((product, index) => (
            <div key={product.id} className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{product.name}</h2>
                  <p className="text-muted-foreground">{product.category}</p>
                </div>
                <span className="text-sm font-semibold text-primary/60">
                  Model {index + 1} of {selectedProducts.length}
                </span>
              </div>

              <GlassCard className="overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-8">
                  <div className="flex items-center justify-center bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent rounded-2xl overflow-hidden min-h-96 group">
                    <div className="relative w-full h-full flex items-center justify-center">
                      {index === 0 ? (
                        <ThreeModelFrame
                          modelUrl="https://cdn.builder.io/o/assets%2F938a9cb6c5f8418ebb61c467931bd555%2F98d65a10979c45dca46f425797185d74?alt=media&token=203528a0-4539-46e5-acd0-d8ad8100f270&apiKey=938a9cb6c5f8418ebb61c467931bd555"
                          className="w-full"
                          heightClassName="h-[28rem]"
                        />
                      ) : (
                        <div className="relative w-80 h-80 rounded-2xl border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-2xl shadow-primary/10 group-hover:shadow-primary/20 transition-all duration-300">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-2"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      )}

                      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                        <div className="flex items-center gap-2 text-white">
                          <RotateCw className="w-4 h-4 animate-spin-slow" />
                          <span className="text-sm font-medium">Interactive 3D</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                          PRODUCT DETAILS
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-muted-foreground">Price</span>
                            <span className="text-2xl font-bold text-primary">
                              ${product.price.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-muted-foreground">Location</span>
                            <span className="text-sm font-medium text-right">
                              {product.location}
                            </span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm text-muted-foreground">Rating</span>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-4 h-4 rounded-sm ${
                                      i < Math.floor(product.rating)
                                        ? "bg-accent"
                                        : "bg-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-semibold">
                                {product.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-gradient-to-r from-primary/20 via-purple-500/20 to-transparent" />

                      <div>
                        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                          SPECIFICATIONS
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dimension</span>
                            <span className="font-medium">High Resolution</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Format</span>
                            <span className="font-medium">3D Model</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Quality</span>
                            <span className="font-medium">Premium</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category</span>
                            <span className="font-medium">{product.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/buyer/products/${product.id}`)}
                      >
                        View Full Details
                      </Button>
                      <Button variant="gradient" className="flex-1">
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border/50 text-center space-y-4">
          <h3 className="text-lg font-semibold">Premium 3D Showcase</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Experience our curated collection of premium 3D models with interactive
            viewing and detailed specifications for each item.
          </p>
        </div>
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryCollections;
