import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { mockProducts } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, PencilLine, BarChart3 } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

const IndustryProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== "industry") navigate("/login");
  }, [user, navigate]);

  const product = useMemo(() => mockProducts.find((p) => String(p.id) === id), [id]);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/industry/products'); }}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <PencilLine className="w-5 h-5" />
            <h1 className="text-xl font-bold">Edit Product</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {!product ? (
          <GlassCard className="p-4">Product not found.</GlassCard>
        ) : (
          <GlassCard className="p-4 sm:p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={product.name} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" defaultValue={product.price} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" defaultValue={product.category} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue={product.location} className="h-11 bg-background/50" />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="gradient" onClick={() => navigate(-1)}>Save</Button>
              <Button variant="outline" onClick={() => navigate(`/industry/products/${product.id}/stats`)}>
                <BarChart3 className="w-4 h-4" />
                View Stats
              </Button>
            </div>
          </GlassCard>
        )}
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryProductEdit;
