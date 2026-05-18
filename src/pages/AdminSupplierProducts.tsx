import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAllSupplierProducts, useDeleteSupplierProductMutation, useUpdateSupplierProductMutation, useCreateSupplierProductsMutation } from "@/hooks/useData";
import { supabase } from "@/lib/supabase";
import GlassCard from "@/components/GlassCard";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload, Download, Search, Filter, Pencil, Eye, EyeOff, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  "watches",
  "inverters",
  "bags",
  "men's shorts",
  "shirt long sleeves",
  "baggy jeans",
  "female shoes",
  "male shoes",
  "solar products",
  "electronics",
];

interface SupplierProduct {
  id: string;
  title: string;
  image_url: string;
  price_min: number;
  price_max: number;
  moq: number;
  description: string;
  supplier_name: string;
  alibaba_link: string;
  category: string;
  status: 'active' | 'hidden';
  created_at?: string;
}

const AdminSupplierProducts = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { data: productsData = [], isLoading } = useAllSupplierProducts();

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
    }
  }, [currentUser, navigate]);
  const products = productsData as SupplierProduct[];
  const deleteProductMutation = useDeleteSupplierProductMutation();
  const updateProductMutation = useUpdateSupplierProductMutation();
  const createProductsMutation = useCreateSupplierProductsMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [importUrls, setImportUrls] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<SupplierProduct | null>(null);

  const filteredProducts = (products as SupplierProduct[]).filter(p => {
    const matchesSearch = (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (p.supplier_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesCategory = !categoryFilter || p.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleImportProducts = async () => {
    if (!importUrls.trim()) {
      toast.error("Please paste at least one Alibaba URL");
      return;
    }

    const urls = importUrls.split("\n").filter(url => url.trim().startsWith("http"));
    if (urls.length === 0) {
      toast.error("Please provide valid URLs starting with http");
      return;
    }

    setIsImporting(true);
    const loadingToast = toast.loading(`Scraping ${urls.length} products in batches...`);
    
    try {
      const batchSize = 5;
      let totalSuccessful = 0;
      
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        toast.loading(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(urls.length / batchSize)}...`, { id: loadingToast });
        
        const { data: scrapeResult, error: scrapeError } = await supabase.functions.invoke('scrape-alibaba', {
          body: { urls: batch }
        });
  
        if (scrapeError) {
          console.error(`Error in batch ${i}:`, scrapeError);
          continue;
        }
  
        const successfulProducts = (scrapeResult.results as { success: boolean, data: SupplierProduct }[])
          .filter(r => r.success)
          .map(r => r.data);
  
        if (successfulProducts.length > 0) {
          await createProductsMutation.mutateAsync(successfulProducts);
          totalSuccessful += successfulProducts.length;
        }
      }

      if (totalSuccessful > 0) {
        toast.success(`Successfully imported ${totalSuccessful} products from Alibaba`, { id: loadingToast });
      } else {
        toast.error("Failed to extract data from provided URLs", { id: loadingToast });
      }
      
      setImportUrls("");
    } catch (error) {
      toast.error("Failed to import products. Check backend logs.", { id: loadingToast });
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteProductMutation.mutateAsync(id);
        toast.success("Product deleted successfully");
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleToggleStatus = async (product: SupplierProduct) => {
    try {
      await updateProductMutation.mutateAsync({
        id: product.id,
        data: { status: product.status === "active" ? "hidden" : "active" }
      });
      toast.success(`Product ${product.status === "active" ? "hidden" : "activated"}`);
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  const handleEditSave = async () => {
    if (!editingId || !editData) return;

    try {
      await updateProductMutation.mutateAsync({
        id: editingId,
        data: editData
      });
      toast.success("Product updated successfully");
      setEditingId(null);
      setEditData(null);
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  return (
    <AdminLayout>
      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Supplier Products</h1>
            <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
              {products.length} Products
            </span>
          </div>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" className="gap-2 rounded-full shadow-lg shadow-primary/10">
                  <Upload className="w-4 h-4" /> Import from Alibaba
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Import Products from Alibaba</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Alibaba URLs (one per line)</label>
                    <textarea
                      placeholder="https://www.alibaba.com/x/1lAevq6?ck=pdp&#10;https://www.alibaba.com/x/1lAevdS?ck=pdp&#10;..."
                      value={importUrls}
                      onChange={(e) => setImportUrls(e.target.value)}
                      className="w-full p-3 rounded-lg bg-background/50 border border-border/50 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 min-h-[200px]"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p>• Paste one Alibaba URL per line</p>
                    <p>• We'll extract: title, image, price, MOQ, description, supplier name</p>
                    <p>• Processing rate: 2 seconds between URLs</p>
                  </div>
                  <Button
                    onClick={handleImportProducts}
                    disabled={isImporting || !importUrls.trim()}
                    className="w-full"
                  >
                    {isImporting ? "Importing..." : "Import Products"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or supplier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-background/50 border-white/10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 h-10 bg-background/50 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40 h-10 bg-background/50 border-white/10">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No supplier products found</p>
            <p className="text-sm text-muted-foreground mb-6">Import products from Alibaba to get started</p>
            <Button size="sm" onClick={() => {}}>Import Products</Button>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <GlassCard key={product.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/100";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{product.title}</h3>
                        <p className="text-xs sm:text-sm text-cyan-300">{product.supplier_name}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        product.status === "active" 
                          ? "bg-green-500/20 text-green-400" 
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3 text-xs">
                      <span className="bg-muted/50 px-2 py-1 rounded">
                        ₦{product.price_min.toFixed(2)} - ₦{product.price_max.toFixed(2)}
                      </span>
                      <span className="bg-muted/50 px-2 py-1 rounded">MOQ: {product.moq}</span>
                      <span className="bg-muted/50 px-2 py-1 rounded">{product.category}</span>
                    </div>
                    {product.alibaba_link && (
                      <div className="mb-3">
                        <a
                          href={product.alibaba_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Alibaba Link
                        </a>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="xs"
                            className="gap-1"
                            onClick={() => setEditData(product)}
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle>Edit Product</SheetTitle>
                          </SheetHeader>
                          <div className="space-y-4 mt-6">
                            {editData && (
                              <>
                                <div>
                                  <label className="text-sm font-medium mb-2 block">Title</label>
                                  <Input
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    className="bg-background/50 border-white/10"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Min Price</label>
                                    <Input
                                      type="number"
                                      value={editData.price_min}
                                      onChange={(e) => setEditData({ ...editData, price_min: parseFloat(e.target.value) })}
                                      className="bg-background/50 border-white/10"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Max Price</label>
                                    <Input
                                      type="number"
                                      value={editData.price_max}
                                      onChange={(e) => setEditData({ ...editData, price_max: parseFloat(e.target.value) })}
                                      className="bg-background/50 border-white/10"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-2 block">MOQ</label>
                                  <Input
                                    type="number"
                                    value={editData.moq}
                                    onChange={(e) => setEditData({ ...editData, moq: parseInt(e.target.value) })}
                                    className="bg-background/50 border-white/10"
                                  />
                                </div>
                                <Button
                                  onClick={() => {
                                    setEditingId(product.id);
                                    handleEditSave();
                                  }}
                                  className="w-full"
                                >
                                  Save Changes
                                </Button>
                              </>
                            )}
                          </div>
                        </SheetContent>
                      </Sheet>
                      <Button
                        variant="outline"
                        size="xs"
                        className="gap-1"
                        onClick={() => handleToggleStatus(product)}
                      >
                        {product.status === "active" ? (
                          <><Eye className="w-3 h-3" /> Hide</>
                        ) : (
                          <><EyeOff className="w-3 h-3" /> Show</>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="xs"
                        className="gap-1"
                        onClick={() => handleDelete(product.id, product.title)}
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {products.length > 0 && (
          <GlassCard className="p-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{products.length}</p>
              <p className="text-xs text-muted-foreground">Total Products</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{products.filter(p => p.status === "active").length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{new Set(products.map(p => p.category)).size}</p>
              <p className="text-xs text-muted-foreground">Categories</p>
            </div>
          </GlassCard>
        )}
      </main>
    </AdminLayout>
  );
};

export default AdminSupplierProducts;
