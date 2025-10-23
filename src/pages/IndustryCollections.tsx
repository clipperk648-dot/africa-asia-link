import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { mockProducts } from "@/utils/mockData";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Search,
  Filter,
  Star,
  Grid3x3,
  Grid2x2,
  SortAsc,
  Cube,
} from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import GlassCard from "@/components/GlassCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type GridView = "2col" | "3col";
type SortOption = "price-low" | "price-high" | "rating" | "newest";

const IndustryCollections = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [gridView, setGridView] = useState<GridView>("3col");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

  useEffect(() => {
    if (!user || user.role !== "industry") {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    let filtered = mockProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "newest":
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  }, [searchTerm, sortBy]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const gridColsClass =
    gridView === "2col"
      ? "grid-cols-1 sm:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/industry")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Cube className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Collections</h1>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 bg-background/50"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="glass" size="icon" className="h-11 w-11" title="Sort">
                  <SortAsc className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setSortBy("newest")}
                  className={sortBy === "newest" ? "bg-accent" : ""}
                >
                  Newest
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("price-low")}
                  className={sortBy === "price-low" ? "bg-accent" : ""}
                >
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("price-high")}
                  className={sortBy === "price-high" ? "bg-accent" : ""}
                >
                  Price: High to Low
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setSortBy("rating")}
                  className={sortBy === "rating" ? "bg-accent" : ""}
                >
                  Top Rated
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant={gridView === "2col" ? "gradient" : "glass"}
              size="icon"
              className="h-11 w-11"
              onClick={() => setGridView("2col")}
              title="2 Column View"
            >
              <Grid2x2 className="w-5 h-5" />
            </Button>
            <Button
              variant={gridView === "3col" ? "gradient" : "glass"}
              size="icon"
              className="h-11 w-11"
              onClick={() => setGridView("3col")}
              title="3 Column View"
            >
              <Grid3x3 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className={`grid ${gridColsClass} gap-4`}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <GlassCard
                key={product.id}
                className="group overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 cursor-pointer"
                onClick={() => navigate(`/buyer/products/${product.id}`)}
              >
                <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 to-purple-500/10 h-56 sm:h-64">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="text-sm font-semibold text-white">
                      {product.rating}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 transform translate-y-12 group-hover:translate-y-0 transition-transform duration-300">
                    <Button
                      className="w-full"
                      variant="default"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/buyer/products/${product.id}`);
                      }}
                    >
                      View 3D Model
                    </Button>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="mb-2">
                    <span className="inline-block text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                    {product.name}
                  </h3>

                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                    {product.location}
                  </p>

                  <div className="mt-auto">
                    <p className="text-2xl font-bold text-primary mb-3">
                      ${product.price.toLocaleString()}
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/buyer/products/${product.id}`);
                        }}
                      >
                        Details
                      </Button>
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <Cube className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-semibold text-muted-foreground">
                No products found
              </p>
              <p className="text-sm text-muted-foreground/60">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryCollections;
