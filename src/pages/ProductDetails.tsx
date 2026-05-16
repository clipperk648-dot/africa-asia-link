import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { useProduct } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Users2,
  MessageCircle,
  Phone,
  Mail,
  Download,
  Check,
  X,
  Award,
  Share2,
  Maximize2,
  Play,
} from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/lib/supabase";

const ProductDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = getCurrentUser();
  const { data: product } = useProduct(id);

  const images = product?.images || [product?.image].filter(Boolean) as string[];
  const media = useMemo(() => {
    const base = images ?? [];
    return product?.videoUrl ? [...base, "__VIDEO__"] : base;
  }, [images, product?.videoUrl]);

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setActiveIndex(api.selectedScrollSnap());
    api.on("select", onSelect);
    onSelect();
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

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

  const isVideo = (idx: number) => media[idx] === "__VIDEO__";
  const mainImage = !isVideo(activeIndex) ? (media[activeIndex] as string) : images[0];
  const inquiries = product.inquiries || 0;

  const goTo = (idx: number) => {
    api?.scrollTo(idx);
  };

  const handleJoinCluster = async () => {
    try {
      // Check if a cluster already exists for this product
      const { data: existingClusters } = await supabase
        .from('clusters')
        .select('*')
        .eq('target_product_id', product.id)
        .eq('status', 'active')
        .limit(1);

      let clusterId;

      if (existingClusters && existingClusters.length > 0) {
        clusterId = existingClusters[0].id;
      } else {
        // Create a new cluster automatically
        const { data: newCluster, error: createError } = await supabase
          .from('clusters')
          .insert([{
            name: `${product.name} Cluster`,
            description: `Automatic cluster for ${product.name}`,
            target_product_id: product.id,
            target_product_name: product.name,
            target_price: (product.moq_price || product.unitPrice || product.price || 100) * (product.cluster_target_qty || 100),
            quantity: qty,
            target_qty: product.cluster_target_qty || 100,
            max_members: 5,
            creator_id: user.id,
            creator_name: user.name || "System",
            status: 'active',
            shipping_status: 'shipping not started yet',
            shipping_mode: 'sea', // Default to recommended
            destination: 'lagos', // Default
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (createError) throw createError;
        clusterId = newCluster.id;
        toast.success("New cluster created for this product!");
      }

      navigate(`/cluster/${clusterId}`);
    } catch (error) {
      console.error("Error joining/creating cluster:", error);
      toast.error("Failed to process cluster request");
    }
  };

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
        {/* Media Gallery + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Media Gallery */}
          <div className="lg:col-span-2 space-y-4">
            <GlassCard className="p-4 overflow-hidden">
              <div className="relative">
                <Carousel setApi={setApi} className="w-full" opts={{ loop: false }}>
                  <CarouselContent>
                    {media.map((m, idx) => (
                      <CarouselItem key={idx}>
                        <div className="relative">
                          <AspectRatio ratio={16 / 9}>
                            {!isVideo(idx) ? (
                              <img
                                src={m as string}
                                alt={`${product.name} ${idx + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                                onClick={() => setLightboxOpen(true)}
                              />
                            ) : (
                              <div className="w-full h-full rounded-lg overflow-hidden relative bg-black">
                                <iframe
                                  src={product.videoUrl}
                                  title="Product Video"
                                  width="100%"
                                  height="100%"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            )}
                          </AspectRatio>
                          {!isVideo(idx) && (
                            <Button
                              size="icon"
                              variant="glass"
                              className="absolute bottom-3 right-3"
                              onClick={() => setLightboxOpen(true)}
                              aria-label="Open fullscreen"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>

              {/* Thumbnails */}
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg border-2 overflow-hidden transition-colors ${
                      activeIndex === idx ? "border-primary" : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                {product.videoUrl && (
                  <button
                    onClick={() => goTo(media.length - 1)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg border-2 overflow-hidden transition-colors flex items-center justify-center bg-muted ${
                      isVideo(activeIndex) ? "border-primary" : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1 text-xs font-semibold"><Play className="w-3 h-3" /> Video</span>
                  </button>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price & Rating */}
            <GlassCard className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Unit Price</p>
                  <p className="text-3xl font-bold text-primary">
                    {product.currency} {(product.unitPrice || product.price).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500 text-lg">★</span>
                    <span className="font-semibold">{product.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">({product.reviews || 0} reviews)</span>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">INQUIRIES</p>
                  <p className="text-2xl font-bold">{inquiries}</p>
                </div>
              </div>
            </GlassCard>

            {/* Actions */}
            <GlassCard className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value || "1", 10))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">{product.unit || "pc"}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Button className="w-full gap-2" onClick={handleJoinCluster}>
                  <Users2 className="w-4 h-4" /> Join Cluster
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full gap-2" onClick={() => window.open(`tel:${product.contactPhone}`)}>
                  <Phone className="w-4 h-4" /> Call
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={() => window.open(`mailto:${product.contactEmail}`)}>
                  <Mail className="w-4 h-4" /> Email
                </Button>
              </div>
              <Button variant="ghost" className="w-full" onClick={() => toast({ title: "Share link copied" })}>
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </GlassCard>

            {/* Seller card */}
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(product.company)}`} />
                  <AvatarFallback>{product.company.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{product.company}</p>
                  <p className="text-xs text-muted-foreground truncate">{product.location}</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Product Overview */}
        <GlassCard className="p-6 lg:p-8">
          <h2 className="text-2xl font-bold mb-1">{product.name}</h2>
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
              {product.originCountry && (
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
                  <div
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => window.open(`mailto:${product.contactEmail}`)}
                  >
                    <Mail className="w-4 h-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-semibold truncate">{product.contactEmail}</p>
                    </div>
                  </div>
                )}
                {product.contactPhone && (
                  <div
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => window.open(`tel:${product.contactPhone}`)}
                  >
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
            <Button variant="outline" className="gap-2" onClick={() => window.open(product.brochureUrl!, "_blank") }>
              <Download className="w-4 h-4" />
              Download Product Brochure (PDF)
            </Button>
          </GlassCard>
        )}
      </main>

      <FooterNav dashboardType="buyer" />

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl bg-black/90 p-2">
          <div className="relative">
            <AspectRatio ratio={16 / 9}>
              {!isVideo(activeIndex) ? (
                <img src={mainImage} alt={product.name} className="w-full h-full object-contain rounded" />
              ) : (
                <iframe
                  src={product.videoUrl}
                  title="Product Video"
                  width="100%"
                  height="100%"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </AspectRatio>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetails;