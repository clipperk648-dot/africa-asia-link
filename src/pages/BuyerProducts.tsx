import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { useProducts } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Filter, Star, PlusCircle, ChevronLeft, ChevronRight, Users2 } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { toast } from "@/components/ui/sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { getSafeImageUrl, createImageErrorHandler } from "@/utils/imageOptimization";

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
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceTier, setPriceTier] = useState<"none" | "cheap" | "expensive">("none");
  const [qtyTier, setQtyTier] = useState<"none" | "large" | "small">("none");
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { data: products = [] } = useProducts();

  const median = (arr: number[]) => {
    const a = [...arr].sort((x, y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  };
  const priceMedian = useMemo(() => median(products.map((p) => p.price || p.unitPrice || 0)), [products]);
  const qtyMedian = useMemo(() => median(products.map((p) => p.quantityAvailable || 0)), [products]);

  const filtered = useMemo(() => {
    let list = products;

    // category
    if (active !== "All") list = list.filter((p) => p.category.toLowerCase() === active.toLowerCase());

    // search
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.name, p.company, p.category, p.location].some((v) => (v || "").toLowerCase().includes(q)),
      );
    }

    // price tier
    if (priceTier === "cheap") list = list.filter((p) => (p.price || p.unitPrice || 0) <= priceMedian);
    if (priceTier === "expensive") list = list.filter((p) => (p.price || p.unitPrice || 0) >= priceMedian);

    // quantity tier
    if (qtyTier === "large") list = list.filter((p) => (p.quantityAvailable || 0) >= qtyMedian);
    if (qtyTier === "small") list = list.filter((p) => (p.quantityAvailable || 0) > 0 && (p.quantityAvailable || 0) < qtyMedian);

    // rating
    if (minRating > 0) list = list.filter((p) => (p.rating || 0) >= minRating);

    // stock
    if (inStockOnly) list = list.filter((p) => (p.quantityAvailable || 0) > 0);

    return list;
  }, [products, active, query, priceTier, qtyTier, minRating, inStockOnly, priceMedian, qtyMedian]);

  useEffect(() => {
    if (!user || user.role !== "buyer") {
      navigate("/login");
    }
  }, [user, navigate]);

  const scrollBy = (delta: number) => scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  const handleJoinCluster = (productId: string, productName: string) => {
    toast.success(`Joining cluster for ${productName}`);
    navigate("/cluster");
  };

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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button variant="glass" size="icon" className="h-11 w-11" onClick={() => setFilterOpen(true)}>
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
          <GlassCard className="p-6 text-center text-sm text-muted-foreground">No products found in "{active}".</GlassCard>
        )}
        {filtered.map((product) => (
          <GlassCard key={product.id}>
            <div className="flex flex-col md:flex-row gap-4">
              <img
                src={getSafeImageUrl(product.image)}
                alt={product.name}
                loading="lazy"
                onError={createImageErrorHandler()}
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
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.moq && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted/60">MOQ: {product.moq} {product.unit || "pc"}</span>
                  )}
                  {typeof product.quantityAvailable === 'number' && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted/60">Available: {product.quantityAvailable}</span>
                  )}
                  {product.incoterm && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted/60">Incoterm: {product.incoterm}</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 gap-3">
                  <p className="text-2xl font-bold text-primary">
                    {product.currency || "USD"} {product.price.toLocaleString()}
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
                    <Button
                      variant="gradient"
                      size="xs"
                      className="flex-1 sm:flex-none"
                      onClick={() => handleJoinCluster(product.id, product.name)}
                    >
                      <Users2 className="w-4 h-4 mr-1" />
                      Join Cluster
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </main>

      <FooterNav dashboardType="buyer" />

      {/* Filters Sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Filters</h3>
              <p className="text-sm text-muted-foreground">Refine your results</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Price</p>
              <RadioGroup value={priceTier} onValueChange={(v) => setPriceTier(v as any)}>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="none" /> <span>Any</span></label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="cheap" /> <span>Cheap (≤ median)</span></label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="expensive" /> <span>Expensive (≥ median)</span></label>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">Median price: {priceMedian.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Quantity</p>
              <RadioGroup value={qtyTier} onValueChange={(v) => setQtyTier(v as any)}>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="none" /> <span>Any</span></label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="large" /> <span>Large (≥ median)</span></label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="small" /> <span>Small (&lt; median)</span></label>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">Median available: {qtyMedian.toLocaleString()}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="rating">Minimum Rating</Label>
                <span className="text-sm font-medium">{minRating.toFixed(1)}</span>
              </div>
              <Slider id="rating" min={0} max={5} step={0.5} value={[minRating]} onValueChange={(v) => setMinRating(v[0] ?? 0)} />
            </div>

            <div className="flex items-center gap-2">
              <input id="stock" type="checkbox" className="h-4 w-4 accent-primary" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
              <Label htmlFor="stock" className="text-sm">In stock only</Label>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => setFilterOpen(false)}>Apply</Button>
              <Button variant="outline" className="flex-1" onClick={() => { setPriceTier("none"); setQtyTier("none"); setMinRating(0); setInStockOnly(false); }}>Clear</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BuyerProducts;