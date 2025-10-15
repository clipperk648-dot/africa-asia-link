import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { mockProducts } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import RateButton from "@/components/RateButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const product = mockProducts.find((p) => String(p.id) === id);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Product Details</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {!product ? (
          <GlassCard className="p-4">Product not found.</GlassCard>
        ) : (
          <GlassCard className="p-4 sm:p-6">
            <img src={product.image} alt={product.name} loading="lazy" className="w-full h-56 sm:h-72 object-cover rounded-lg" />
            <div className="mt-4 space-y-3">
              <h2 className="text-lg sm:text-xl font-bold">{product.name}</h2>
              <div className="flex items-center gap-3">
                {/** Derive seller display name and avatar seed from available product fields */}
                {(() => {
                  const seller = (product as any).username || product.company || product.name || "Seller";
                  const seed = encodeURIComponent(String((product as any).username || product.company || product.name || "seller"));
                  return (
                    <>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={seller} />
                        <AvatarFallback>{String(seller).slice(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{product.company || seller}</p>
                        <p className="text-xs text-muted-foreground">{(product as any).username ? `@${(product as any).username} • ${product.location}` : product.location}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <p className="text-sm text-muted-foreground">Category: {product.category}</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">${product.price.toLocaleString()}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <RateButton productId={product.id} productName={product.name} size="sm" />
                <Button variant="outline" onClick={() => navigate(`/messages?product=${product.id}`)}>Contact Seller</Button>
                <Button variant="gradient" onClick={() => navigate(`/messages?product=${product.id}`)}>
                  <ShoppingCart className="w-4 h-4" />
                  Inquire
                </Button>
              </div>
            </div>
          </GlassCard>
        )}
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default ProductDetails;
