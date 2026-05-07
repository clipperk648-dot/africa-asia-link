import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { useProducts, useCreateProductMutation, useDeleteProductMutation } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Pencil, Trash2, LineChart, Search } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { getSafeImageUrl, createImageErrorHandler } from "@/utils/imageOptimization";
import { toast } from "@/components/ui/sonner";

const AdminProducts = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { data: products = [] } = useProducts();
  const deleteProductMutation = useDeleteProductMutation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProductMutation.mutateAsync(id);
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  if (!user || user.role !== "admin") {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Products</h1>
            <Link to="/admin/products/add">
              <Button size="sm" className="ml-auto gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </Link>
          </div>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {filteredProducts.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-muted-foreground">No products found.</p>
            <Link to="/admin/products/add">
              <Button className="mt-4">Add Your First Product</Button>
            </Link>
          </GlassCard>
        ) : (
          filteredProducts.map((product) => (
            <GlassCard key={product.id} className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <img
                  src={getSafeImageUrl(product.image)}
                  alt={product.name}
                  className="w-full md:w-32 h-32 object-cover rounded-lg"
                  onError={createImageErrorHandler()}
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.company}</p>
                  <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-lg font-bold text-primary">${product.price.toLocaleString()}</span>
                    <span className="text-sm">★ {product.rating}</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link to={`/admin/products/${product.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Button>
                    </Link>
                    <Link to={`/admin/products/${product.id}/stats`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <LineChart className="w-4 h-4" />
                        Stats
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-2 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </main>

      <FooterNav dashboardType="admin" />
    </div>
  );
};

export default AdminProducts;