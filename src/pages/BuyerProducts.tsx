import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProducts, useClusters, useCreateClusterMutation } from "@/hooks/useData";
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

import { Cluster } from "@/types/models";

const CATEGORIES = [
  "All",
  "Watches",
  "Inverters",
  "Bags",
  "Men's Shorts",
  "Shirt Long Sleeves",
  "Baggy Jeans",
  "Female Shoes",
  "Male Shoes",
  "Solar Products",
  "Electronics",
  "Iphone",
  "Samsung Ultra",
  "Clothes",
  "Electric Bike",
  "Cars",
  "Home Appliances",
  "Fashion",
  "Furniture",
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
  const { user } = useAuth();

  const [active, setActive] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceTier, setPriceTier] = useState<"none" | "cheap" | "expensive">("none");
  const [qtyTier, setQtyTier] = useState<"none" | "large" | "small">("none");
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [shippingMethod, setShippingMethod] = useState<string>("Any");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const { data: products = [] } = useProducts();
  const { data: clusters = [] } = useClusters();
  const createClusterMutation = useCreateClusterMutation();

  const median = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const a = [...arr].sort((x, y) => x - y);
    const mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
  };
  const priceMedian = useMemo(() => median(products.map((p) => p.price || p.unitPrice || 0)), [products]);
  const qtyMedian = useMemo(() => median(products.map((p) => p.quantityAvailable || 0)), [products]);

  const filtered = useMemo(() => {
    let list = products;

    // category
    if (active !== "All") list = list.filter((p) => p.category?.toLowerCase() === active.toLowerCase());

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
    if (!user || (user.role !== "buyer" && user.role !== "admin")) {
      navigate("/login");
    }
  }, [user, navigate]);

  const scrollBy = (delta: number) => scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  const handleJoinCluster = async (productId: string, productName: string, productData?: Product) => {
    // Check if cluster exists
    const existingCluster = (clusters as Cluster[]).find((c) => 
      (c.targetProductId === productId || c.target_product_id === productId) && 
      (c.status === 'active' || (c.status as string) === 'open')
    );
    
    if (existingCluster) {
      toast.success(`Joining cluster for ${productName}`);
      navigate(`/cluster/${existingCluster.id}`);
    } else {
      // Auto-create cluster
      toast.info(`No cluster found for ${productName}. Creating one...`);
      try {
        const targetPrice = productData ? 
          (productData.moq_price || productData.unitPrice || productData.price || 0) * (productData.cluster_target_qty || 100) : 0;
        
        const newCluster = await createClusterMutation.mutateAsync({
          name: `${productName} Cluster`,
          description: `Automatically created cluster for ${productName}`,
          targetProductId: productId,
          targetProductName: productName,
          targetPrice: targetPrice, 
          minOrderAmount: productData?.moq || 0,
          quantity: 1,
          target_qty: productData?.cluster_target_qty || 100,
          maxMembers: 10,
          preferredShippingMethod: "Sea",
          creatorId: user?.id,
          creatorName: user?.name || "Buyer",
          status: 'active',
          shipping_status: 'shipping not started yet',
          shipping_mode: 'sea',
          destination: 'lagos'
        } as Partial<Cluster>);
        
        if (newCluster && typeof newCluster === 'object' && 'id' in newCluster) {
          navigate(`/cluster/${(newCluster as { id: string }).id}`);
        }
      } catch (error) {
        console.error("Failed to auto-create cluster:", error);
        toast.error("Failed to auto-create cluster");
      }
    }
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
          <GlassCard className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-4">No cluster yet for this search.</p>
            <Button variant="gradient" onClick={() => navigate("/cluster")}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create One
            </Button>
          </GlassCard>
        )}
        {filtered.map((product) => {
          const hasCluster = (clusters as Cluster[]).some((c) => (c.targetProductId === product.id || c.target_product_id === product.id) && (c.status === 'active' || (c.status as string) === 'open'));
          
          return (
            <GlassCard key={product.id}>
              <div className="flex flex-col sm:flex-row gap-4 p-2 sm:p-0">
                <div className="w-full sm:w-40 h-48 sm:h-40 shrink-0">
                  <img
                    src={getSafeImageUrl(product.image)}
                    alt={product.name}
                    loading="lazy"
                    onError={createImageErrorHandler()}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg sm:text-xl truncate">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{product.company}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{product.category}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 bg-accent/10 px-2 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                      <span className="font-medium text-sm">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 truncate">{product.location}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {product.moq && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 border border-border/50">MOQ: {product.moq} {product.unit || "pc"}</span>
                    )}
                    {typeof product.quantityAvailable === 'number' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 border border-border/50">Available: {product.quantityAvailable}</span>
                    )}
                  </div>
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mt-4 gap-3">
                      <div className="space-y-1">
                        <p className="text-xl sm:text-2xl font-bold text-primary">
                          {product.currency || "USD"} {product.price.toLocaleString()}
                        </p>
                        <div className="flex gap-1.5">
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20 font-bold uppercase tracking-tight">Sea (Rec.)</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold uppercase tracking-tight">Air</span>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full xs:w-auto">
                      <Button
                        variant="outline"
                        size="xs"
                        className="flex-1 xs:flex-none h-9 text-xs"
                        onClick={() => navigate(`/buyer/products/${product.id}`)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="gradient"
                        size="xs"
                        className="flex-1 xs:flex-none h-9 text-xs"
                        onClick={() => handleJoinCluster(product.id, product.name, product)}
                      >
                        <Users2 className="w-3.5 h-3.5 mr-1.5" />
                        {hasCluster ? "Join Cluster" : "Create Cluster"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
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
              <RadioGroup value={priceTier} onValueChange={(v) => setPriceTier(v as "none" | "cheap" | "expensive")}>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="none" /> <span>Any</span></label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="cheap" /> <span>Cheap (≤ median)</span></label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="expensive" /> <span>Expensive (≥ median)</span></label>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">Median price: {priceMedian.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Quantity</p>
              <RadioGroup value={qtyTier} onValueChange={(v) => setQtyTier(v as "none" | "large" | "small")}>
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

            <div className="space-y-2">
              <p className="text-sm font-medium">Shipping Mode</p>
              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Any" /> <span>Any</span></label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Sea" /> <span>Sea Shipping</span></label>
                <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="Air" /> <span>Air Shipping</span></label>
              </RadioGroup>
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => setFilterOpen(false)}>Apply</Button>
              <Button variant="outline" className="flex-1" onClick={() => { setPriceTier("none"); setQtyTier("none"); setMinRating(0); setInStockOnly(false); setShippingMethod("Any"); }}>Clear</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default BuyerProducts;
