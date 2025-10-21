import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { mockProducts, mockOrders } from "@/utils/mockData";
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
  const interested = product ? mockOrders.filter((o) => o.productName === product.name).length : 0;

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/buyer/products'); }}>
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
            <div className="space-y-4">
              <div className="w-full">
                <img src={product.image} alt={product.name} loading="lazy" className="w-full h-64 sm:h-96 object-cover rounded-lg" />
                <div className="mt-3 flex gap-2">
                  {new Array(5).fill(product.image).map((img, idx) => (
                    <img key={idx} src={img} alt={`${product.name} ${idx}`} className="w-16 h-12 object-cover rounded-md border" />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg sm:text-2xl font-bold">{product.name}</h2>
                <p className="text-sm text-muted-foreground">{product.company} • {product.location}</p>
                <p className="text-2xl font-extrabold text-primary">${product.price.toLocaleString()}</p>

                <div className="flex items-center gap-3">
                  <RateButton productId={product.id} productName={product.name} size="sm" />
                  <Button variant="outline" size="sm" onClick={() => navigate(`/buyer/products/${product.id}`)}>
                    View
                  </Button>
                  <Button variant="gradient" size="sm" onClick={() => navigate(`/messages?product=${product.id}`)}>
                    <ShoppingCart className="w-4 h-4" />
                    Inquire
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-4">Experience premium quality from {product.company}. This {product.category} item is sourced from {product.location} and has a track record of strong customer satisfaction. Contact the seller for specifics on MOQ, lead times, and shipping options.</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-semibold">Amenities & Features</p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                      <li>• High quality materials</li>
                      <li>• Factory inspected</li>
                      <li>• Customizable options</li>
                      <li>• Competitive pricing</li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Location & Shipping</p>
                    <div className="mt-2 rounded border overflow-hidden">
                      <iframe
                        title="location"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(product.location)}&output=embed`}
                        className="w-full h-40"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Port of shipment and shipping options vary; contact the seller for details.</p>
                  </div>
                </div>
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
