import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { mockProducts, mockOrders } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, MessageCircle, Phone, Mail, Download, Check, X, Award } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import RateButton from "@/components/RateButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = getCurrentUser();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const product = mockProducts.find((p) => String(p.id) === id);
  const inquiries = product?.inquiries || 0;
  const images = product?.images || [product?.image];
  const mainImage = images?.[selectedImage] || product?.image;

  if (!product) {
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
        <main className="max-w-5xl mx-auto px-4 py-6">
          <GlassCard className="p-6 text-center">
            <p className="text-muted-foreground">Product not found.</p>
          </GlassCard>
        </main>
        <FooterNav dashboardType="buyer" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold truncate">{product.name}</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Image Gallery and Video Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Image and Gallery */}
          <div className="lg:col-span-2 space-y-4">
            <GlassCard className="p-4 overflow-hidden">
              {/* Main Image */}
              <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                {product.videoUrl && !showVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                  >
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-8 border-l-white border-t-5 border-t-transparent border-b-5 border-b-transparent ml-1" />
                    </div>
                  </button>
                )}
              </div>

              {/* Video Section */}
              {product.videoUrl && showVideo && (
                <div className="w-full aspect-video mb-4 rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={product.videoUrl}
                    title="Product Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Thumbnail Gallery */}
              <div className="flex gap-2 overflow-x-auto">
                {images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage(idx);
                      setShowVideo(false);
                    }}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg border-2 overflow-hidden transition-colors ${
                      selectedImage === idx ? "border-primary" : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                {product.videoUrl && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg border-2 overflow-hidden transition-colors flex items-center justify-center bg-muted ${
                      showVideo ? "border-primary" : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <span className="text-xs font-semibold">Video</span>
                  </button>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Quick Info Sidebar */}
          <div className="space-y-4">
            {/* Price and Rating */}
            <GlassCard className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Unit Price</p>
                  <p className="text-3xl font-bold text-primary">
                    {product.currency} {(product.unitPrice || product.price).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500 text-lg">★</span>
                      <span className="font-semibold">{product.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({product.reviews || 0} reviews)</span>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">INQUIRIES</p>
                  <p className="text-2xl font-bold">{inquiries}</p>
                </div>
              </div>
            </GlassCard>

            {/* Action Buttons */}
            <GlassCard className="p-4 space-y-2">
              <Button variant="gradient" className="w-full gap-2" onClick={() => navigate(`/messages?product=${product.id}`)}>
                <ShoppingCart className="w-4 h-4" />
                Send Inquiry
              </Button>
              <RateButton productId={product.id} productName={product.name} size="sm" />
              <Button variant="outline" className="w-full gap-2" onClick={() => window.open(`tel:${product.contactPhone}`)}>
                <Phone className="w-4 h-4" />
                Call Seller
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={() => window.open(`mailto:${product.contactEmail}`)}>
                <Mail className="w-4 h-4" />
                Email
              </Button>
            </GlassCard>
          </div>
        </div>

        {/* Product Overview */}
        <GlassCard className="p-6 lg:p-8">
          <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
          {product.nameZH && <p className="text-muted-foreground mb-4 text-lg">{product.nameZH}</p>}

          <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

          {/* Key Trading Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.moq && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">MOQ</p>
                <p className="font-semibold">{product.moq} {product.unit || "pc"}</p>
              </div>
            )}
            {product.supplyAbilityPerMonth && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Supply/Month</p>
                <p className="font-semibold">{product.supplyAbilityPerMonth.toLocaleString()}</p>
              </div>
            )}
            {product.quantityAvailable && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Available</p>
                <p className="font-semibold">{product.quantityAvailable}</p>
              </div>
            )}
            {product.leadTimeDays && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Lead Time</p>
                <p className="font-semibold">{product.leadTimeDays} days</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <GlassCard className="p-6 lg:p-8">
            <h3 className="text-xl font-bold mb-4">Key Specifications</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {product.specifications.map((spec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{spec}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Trading Details */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trade Information */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4">Trade Information</h3>
            <div className="space-y-3">
              {product.hsCode && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">HS Code</span>
                  <span className="font-semibold">{product.hsCode}</span>
                </div>
              )}
              {product.incoterm && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Incoterm</span>
                  <span className="font-semibold">{product.incoterm}</span>
                </div>
              )}
              {product.portOfShipment && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Port of Shipment</span>
                  <span className="font-semibold">{product.portOfShipment}</span>
                </div>
              )}
              {product.origin && (
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Origin</span>
                  <span className="font-semibold">
                    {product.city}, {product.province}, {product.originCountry}
                  </span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Product Details */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4">Product Details</h3>
            <div className="space-y-3">
              {product.brand && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Brand</span>
                  <span className="font-semibold">{product.brand}</span>
                </div>
              )}
              {product.model && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-semibold">{product.model}</span>
                </div>
              )}
              {product.unit && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Unit</span>
                  <span className="font-semibold">{product.unit}</span>
                </div>
              )}
              {product.warrantyMonths && (
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Warranty</span>
                  <span className="font-semibold">{product.warrantyMonths} months</span>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Services & Certifications */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Services */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4">Services & Options</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                {product.oemAvailable ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />}
                <span className="text-sm">OEM/ODM Available</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                {product.odmAvailable ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />}
                <span className="text-sm">ODM Services</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                {product.customPackaging ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />}
                <span className="text-sm">Custom Packaging</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                {product.sampleAvailable ? <Check className="w-5 h-5 text-green-600" /> : <X className="w-5 h-5 text-red-600" />}
                <span className="text-sm">Sample Available</span>
              </div>
            </div>
          </GlassCard>

          {/* Certifications */}
          {product.certifications && product.certifications.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications
              </h3>
              <div className="space-y-2">
                {product.certifications.map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Contact Information */}
        <GlassCard className="p-6 lg:p-8">
          <h3 className="text-xl font-bold mb-6">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Seller Details</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-semibold">{product.company}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-semibold">{product.contactName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-semibold">{product.location}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact Methods</h4>
              <div className="space-y-3">
                {product.contactEmail && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => window.open(`mailto:${product.contactEmail}`)}>
                    <Mail className="w-4 h-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-semibold truncate">{product.contactEmail}</p>
                    </div>
                  </div>
                )}
                {product.contactPhone && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => window.open(`tel:${product.contactPhone}`)}>
                    <Phone className="w-4 h-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-semibold">{product.contactPhone}</p>
                    </div>
                  </div>
                )}
                {product.wechat && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">WeChat</p>
                      <p className="text-sm font-semibold">{product.wechat}</p>
                    </div>
                  </div>
                )}
                {product.whatsapp && (
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">WhatsApp</p>
                      <p className="text-sm font-semibold">{product.whatsapp}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Download Resources */}
        {product.brochureUrl && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5" />
              Resources
            </h3>
            <Button variant="outline" className="gap-2" onClick={() => window.open(product.brochureUrl, "_blank")}>
              <Download className="w-4 h-4" />
              Download Product Brochure (PDF)
            </Button>
          </GlassCard>
        )}
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default ProductDetails;
