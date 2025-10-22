import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { mockProducts } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, Star, ShoppingCart, PlusCircle, ChevronLeft, ChevronRight } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import RateButton from "@/components/RateButton";
import { addToCart } from "@/utils/cart";
import { toast } from "@/components/ui/sonner";

const CATEGORIES = [
  "All",
  "Electronics",
  "Furniture",
  "Shoes",
  "Clothes",
  "Textiles",
  "Appliances",
  "Automotive",
  "Beauty",
  "Construction",
  "Manufacturing",
  "Home & Garden",
  "Sports",
  "Toys",
  "Tools",
];

const BuyerProducts = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [active, setActive] = useState<string>("All");
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const products = mockProducts;

  const filtered = useMemo(() => {
    if (active === "All") return products;
    return products.filter((p) => p.category.toLowerCase() === active.toLowerCase());
  }, [products, active]);

  useEffect(() => {
    if (!user || user.role !== "buyer") {
      navigate("/login");
    }
  }, [user, navigate]);

  const scrollBy = (delta: number) => scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/buyer")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Browse Products</h1>
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

          {/* Category side-scroll navigation */}
          <div className="relative mt-3">
            <div ref={scrollerRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide scroll-smooth py-1 pr-10">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={active === cat ? "gradient" : "outline"}
                  size="xs"
                  className="rounded-full whitespace-nowrap"
                  onClick={() => setActive(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent" />
            <div className="absolute inset-y-0 left-0 flex items-center">
              <Button variant="glass" size="icon" className="h-7 w-7" onClick={() => scrollBy(-200)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button variant="glass" size="icon" className="h-7 w-7" onClick={() => scrollBy(200)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {filtered.length === 0 && (
          <GlassCard className="p-6 text-center text-sm text-muted-foreground">No products found in “{active}”.</GlassCard>
        )}
        {filtered.map((product) => (
          <GlassCard key={product.id}>
            <div className="flex flex-col md:flex-row gap-4">
              <img
                src={product.image}
                alt={product.name}
                loading="lazy"
                className="w-full md:w-40 h-40 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-xl">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.company}</p>
                    <p className="text-sm text-muted-foreground mt-1">{product.category}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="font-medium">{product.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{product.location}</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3">
                  <p className="text-2xl font-bold text-primary">
                    ${product.price.toLocaleString()}
                  </p>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="xs"
                      className="flex-1 sm:flex-none"
                      onClick={() => navigate(`/buyer/products/${product.id}`)}
                    >
                      Details
                    </Button>
                    <RateButton productId={product.id} productName={product.name} size="xs" />
                    <Button
                      variant="accent"
                      size="xs"
                      className="flex-1 sm:flex-none"
                      onClick={() => {
                        addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, company: product.company });
                        toast.success("Added to cart");
                      }}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add to cart
                    </Button>
                    <Button
                      variant="gradient"
                      size="xs"
                      className="flex-1 sm:flex-none"
                      onClick={() => navigate(`/messages?product=${product.id}`)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Inquire
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default BuyerProducts;
