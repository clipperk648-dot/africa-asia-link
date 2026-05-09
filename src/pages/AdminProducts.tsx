import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useProducts, useDeleteProductMutation } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, LineChart, Search, Filter, Package } from "lucide-react";
import { getSafeImageUrl, createImageErrorHandler } from "@/utils/imageOptimization";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";

const AdminProducts = () => {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useProducts();
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

  return (
    <AdminLayout>
      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-background/50 border-white/10"
              />
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 hover:bg-white/5">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <Link to="/admin/products/add" className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto gap-2 rounded-full shadow-lg shadow-primary/10">
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <GlassCard className="p-12 text-center border-white/5">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-bold text-white">No products found</h3>
            <Link to="/admin/products/add">
              <Button variant="link" className="text-primary mt-2">Create your first product</Button>
            </Link>
          </GlassCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <GlassCard key={product.id} className="p-0 overflow-hidden border-white/5 group hover:border-primary/30 transition-all duration-300">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={getSafeImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={createImageErrorHandler()}
                  />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="glass" 
                      size="icon" 
                      className="h-8 w-8 rounded-full"
                      onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="glass" 
                      size="icon" 
                      className="h-8 w-8 rounded-full text-red-400 hover:text-red-300"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white font-bold text-sm truncate">{product.name}</p>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{product.category}</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">{product.company}</span>
                    <span className="font-bold text-white">${product.price.toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-8 text-[10px] uppercase font-bold tracking-widest border-white/10 hover:bg-white/5"
                      onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                    >
                      <Pencil className="w-3 h-3 mr-1.5" /> Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-8 text-[10px] uppercase font-bold tracking-widest border-white/10 hover:bg-white/5"
                      onClick={() => navigate(`/admin/products/${product.id}/stats`)}
                    >
                      <LineChart className="w-3 h-3 mr-1.5" /> Stats
                    </Button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default AdminProducts;
