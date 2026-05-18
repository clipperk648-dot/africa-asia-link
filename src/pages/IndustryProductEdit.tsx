import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { useProduct } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, PencilLine, BarChart3, UploadCloud, X, Image as ImageIcon, Video as VideoIcon, Upload, Ruler, Scale } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { calculateUnitCBM } from "@/utils/cbm";


const IndustryProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || (user.role !== "industry" && user.role !== "sourcing-agent")) navigate("/login");
  }, [user, navigate]);

  const { data: product } = useProduct(id!);

  const [form, setForm] = useState(() => ({
    nameEN: product?.name || "",
    nameZH: product?.nameZH || "",
    category: product?.category?.toLowerCase() || "machinery",
    hsCode: product?.hsCode || "",
    brand: product?.brand || "",
    model: product?.model || "",
    originCountry: product?.originCountry || "China",
    province: product?.province || "",
    city: product?.city || "",
    unit: product?.unit || "piece",
    unitPrice: String(product?.unitPrice ?? product?.price ?? ""),
    currency: (product?.currency as any) || "NGN",
    moq: String(product?.moq ?? ""),
    supplyAbilityPerMonth: String(product?.supplyAbilityPerMonth ?? ""),
    quantityAvailable: String(product?.quantityAvailable ?? ""),
    leadTimeDays: String(product?.leadTimeDays ?? ""),
    incoterm: product?.incoterm || "FOB",
    portOfShipment: product?.portOfShipment || "",
    description: product?.description || "",
    specifications: (product?.specifications || []).join("\n"),
    companyName: product?.company || "",
    contactName: product?.contactName || "",
    contactEmail: product?.contactEmail || "",
    contactPhone: product?.contactPhone || "",
    wechat: product?.wechat || "",
    whatsapp: product?.whatsapp || "",
    warrantyMonths: String(product?.warrantyMonths ?? ""),
    oem: !!product?.oemAvailable,
    odm: !!product?.odmAvailable,
    customPackaging: !!product?.customPackaging,
    sampleAvailable: !!product?.sampleAvailable,
    certifications: {
      ce: product?.certifications?.includes("CE") || false,
      rohs: product?.certifications?.includes("RoHS") || false,
      iso9001: product?.certifications?.includes("ISO9001") || false,
      fcc: product?.certifications?.includes("FCC") || false,
      ccc: product?.certifications?.includes("CCC") || false,
    },
    weight_kg: String(product?.weight_kg ?? ""),
    length_cm: String(product?.length_cm ?? ""),
    width_cm: String(product?.width_cm ?? ""),
    height_cm: String(product?.height_cm ?? ""),
    has_battery: !!product?.has_battery,
    requires_nafdac: !!product?.requires_nafdac,
    moq_price: String(product?.moq_price ?? ""),
    cluster_target_qty: String(product?.cluster_target_qty ?? "100"),
  }));

  useEffect(() => {
    if (product) {
      setForm({
        nameEN: product.name || "",
        nameZH: product.nameZH || "",
        category: product.category?.toLowerCase() || "machinery",
        hsCode: product.hsCode || "",
        brand: product.brand || "",
        model: product.model || "",
        originCountry: product.originCountry || "China",
        province: product.province || "",
        city: product.city || "",
        unit: product.unit || "piece",
        unitPrice: String(product.unitPrice ?? product.price ?? ""),
        currency: (product.currency as any) || "NGN",
        moq: String(product.moq ?? ""),
        supplyAbilityPerMonth: String(product.supplyAbilityPerMonth ?? ""),
        quantityAvailable: String(product.quantityAvailable ?? ""),
        leadTimeDays: String(product.leadTimeDays ?? ""),
        incoterm: product.incoterm || "FOB",
        portOfShipment: product.portOfShipment || "",
        description: product.description || "",
        specifications: (product.specifications || []).join("\n"),
        companyName: product.company || "",
        contactName: product.contactName || "",
        contactEmail: product.contactEmail || "",
        contactPhone: product.contactPhone || "",
        wechat: product.wechat || "",
        whatsapp: product.whatsapp || "",
        warrantyMonths: String(product.warrantyMonths ?? ""),
        oem: !!product.oemAvailable,
        odm: !!product.odmAvailable,
        customPackaging: !!product.customPackaging,
        sampleAvailable: !!product.sampleAvailable,
        certifications: {
          ce: product.certifications?.includes("CE") || false,
          rohs: product.certifications?.includes("RoHS") || false,
          iso9001: product.certifications?.includes("ISO9001") || false,
          fcc: product.certifications?.includes("FCC") || false,
          ccc: product.certifications?.includes("CCC") || false,
        },
        weight_kg: String(product.weight_kg ?? ""),
        length_cm: String(product.length_cm ?? ""),
        width_cm: String(product.width_cm ?? ""),
        height_cm: String(product.height_cm ?? ""),
        has_battery: !!product.has_battery,
        requires_nafdac: !!product.requires_nafdac,
        moq_price: String(product.moq_price ?? ""),
        cluster_target_qty: String(product.cluster_target_qty ?? "100"),
      });
    }
  }, [product]);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(() => (product?.images || (product?.image ? [product.image] : [])) as string[]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);

  const unitCBM = useMemo(() => {
    const l = parseFloat(form.length_cm) || 0;
    const w = parseFloat(form.width_cm) || 0;
    const h = parseFloat(form.height_cm) || 0;
    return calculateUnitCBM(l, w, h);
  }, [form.length_cm, form.width_cm, form.height_cm]);

  const handle = (key: keyof typeof form) => (e: any) => setForm((p) => ({ ...p, [key]: e.target ? e.target.value : e }));

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imagePreviews.length > 6) {
      toast.error("Maximum 6 images allowed");
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setVideoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed for brochures");
      return;
    }
    setBrochureFile(file || null);
  };

  const removeBrochure = () => {
    setBrochureFile(null);
  };

  if (!product) {
    return (
      <div className="min-h-screen pb-24 relative">
        <ThreeBackground />
        <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/industry/products")}> <ArrowLeft className="w-5 h-5" /> </Button>
            <h1 className="text-xl font-bold">Edit Product</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">
          <GlassCard className="p-4">Product not found.</GlassCard>
        </main>
        <FooterNav dashboardType="industry" />
      </div>
    );
  }

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

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <GlassCard className="p-4 sm:p-6 space-y-6">
          {/* Product details */}
          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nameEN">Product name (English)</Label>
                <Input id="nameEN" value={form.nameEN} onChange={handle("nameEN")} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nameZH">产品名称 (Chinese)</Label>
                <Input id="nameZH" value={form.nameZH} onChange={handle("nameZH")} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                  <SelectTrigger className="h-11 bg-background/50"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="machinery">Machinery</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="home">Home Appliances</SelectItem>
                    <SelectItem value="textiles">Textiles</SelectItem>
                    <SelectItem value="tools">Tools & Hardware</SelectItem>
                    <SelectItem value="auto">Auto Parts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hsCode">HS Code</Label>
                <Input id="hsCode" value={form.hsCode} onChange={handle("hsCode")} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" value={form.brand} onChange={handle("brand")} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model / SKU</Label>
                <Input id="model" value={form.model} onChange={handle("model")} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Origin</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={form.originCountry} onChange={handle("originCountry")} className="h-11 bg-background/50" />
                  <Input value={form.province} onChange={handle("province")} className="h-11 bg-background/50" placeholder="Province" />
                  <Input value={form.city} onChange={handle("city")} className="h-11 bg-background/50" placeholder="City" />
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Short description</Label>
                <Textarea id="description" value={form.description} onChange={handle("description")} className="min-h-[100px] bg-background/50" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="specifications">Key specifications (one per line)</Label>
                <Textarea id="specifications" value={form.specifications} onChange={handle("specifications")} className="min-h-[120px] bg-background/50" />
              </div>
            </div>
          </section>
        </GlassCard>

        {/* Physical dimensions */}
        <GlassCard className="p-4 sm:p-6 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">Physical dimensions</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Ruler className="w-4 h-4" /> Size and weight per unit
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="weight_kg">Weight (kg)</Label>
                <div className="relative">
                  <Scale className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="weight_kg" value={form.weight_kg} onChange={handle("weight_kg")} required className="h-11 bg-background/60 pl-10" type="number" step="0.001" min="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="length_cm">Length (cm)</Label>
                <Input id="length_cm" value={form.length_cm} onChange={handle("length_cm")} required className="h-11 bg-background/60" type="number" step="0.1" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width_cm">Width (cm)</Label>
                <Input id="width_cm" value={form.width_cm} onChange={handle("width_cm")} required className="h-11 bg-background/60" type="number" step="0.1" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height_cm">Height (cm)</Label>
                <Input id="height_cm" value={form.height_cm} onChange={handle("height_cm")} required className="h-11 bg-background/60" type="number" step="0.1" min="0" />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 items-end">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex flex-col justify-center min-w-[200px]">
                <span className="text-xs font-medium text-primary uppercase tracking-wider">CBM per unit</span>
                <span className="text-2xl font-bold text-primary">{unitCBM.toFixed(4)} m³</span>
              </div>

              <div className="flex items-center space-x-2 pb-2">
                <Switch 
                  id="has_battery" 
                  checked={form.has_battery} 
                  onCheckedChange={(v) => setForm(p => ({ ...p, has_battery: v }))} 
                />
                <Label htmlFor="has_battery" className="cursor-pointer">Contains Battery</Label>
              </div>

              <div className="flex items-center space-x-2 pb-2">
                <Switch 
                  id="requires_nafdac" 
                  checked={form.requires_nafdac} 
                  onCheckedChange={(v) => setForm(p => ({ ...p, requires_nafdac: v }))} 
                />
                <Label htmlFor="requires_nafdac" className="cursor-pointer">Requires NAFDAC</Label>
              </div>
            </div>
          </section>
        </GlassCard>

        {/* Trade information */}
        <GlassCard className="p-4 sm:p-6 space-y-6">
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Trade information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Retail Unit price (Below MOQ)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={form.currency as any} onValueChange={(v) => setForm((p) => ({ ...p, currency: v as any }))}>
                    <SelectTrigger className="h-11 bg-background/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNY">CNY (¥)</SelectItem>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input value={form.unitPrice} onChange={handle("unitPrice")} className="col-span-2 h-11 bg-background/50" type="number" min="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Unit Type</Label>
                <Select value={form.unit} onValueChange={(v) => setForm((p) => ({ ...p, unit: v }))}>
                  <SelectTrigger className="h-11 bg-background/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="set">Set</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="ton">Ton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="moq">MOQ (Minimum Order Quantity)</Label>
                <Input id="moq" value={form.moq} onChange={handle("moq")} className="h-11 bg-background/50" type="number" min="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moq_price">MOQ Price (Per unit when ≥ MOQ)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground font-medium">
                    {form.currency === 'NGN' ? '$' : form.currency === 'CNY' ? '¥' : '₦'}
                  </span>
                  <Input id="moq_price" value={form.moq_price} onChange={handle("moq_price")} required className="h-11 bg-background/60 pl-8" type="number" min="0" />
                </div>
                <p className="text-xs text-muted-foreground italic">MOQ price activates when the cluster's combined order reaches your MOQ.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cluster_target_qty">Cluster Target Quantity</Label>
                <Input id="cluster_target_qty" value={form.cluster_target_qty} onChange={handle("cluster_target_qty")} required className="h-11 bg-background/60" type="number" min="1" />
                <p className="text-xs text-muted-foreground italic">Suggested target quantity for clusters to reach.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplyAbilityPerMonth">Supply ability (per month)</Label>
                <Input id="supplyAbilityPerMonth" value={form.supplyAbilityPerMonth} onChange={handle("supplyAbilityPerMonth")} className="h-11 bg-background/50" type="number" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantityAvailable">Quantity available</Label>
                <Input id="quantityAvailable" value={form.quantityAvailable} onChange={handle("quantityAvailable")} className="h-11 bg-background/50" type="number" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leadTimeDays">Lead time (days)</Label>
                <Input id="leadTimeDays" value={form.leadTimeDays} onChange={handle("leadTimeDays")} className="h-11 bg-background/50" type="number" min="0" />
              </div>
              <div className="space-y-2">
                <Label>Incoterm</Label>
                <Select value={form.incoterm} onValueChange={(v) => setForm((p) => ({ ...p, incoterm: v }))}>
                  <SelectTrigger className="h-11 bg-background/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXW">EXW</SelectItem>
                    <SelectItem value="FOB">FOB</SelectItem>
                    <SelectItem value="CIF">CIF</SelectItem>
                    <SelectItem value="DDP">DDP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Port of shipment</Label>
                <Input value={form.portOfShipment} onChange={handle("portOfShipment")} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyMonths">Warranty (months)</Label>
                <Input id="warrantyMonths" value={form.warrantyMonths} onChange={handle("warrantyMonths")} className="h-11 bg-background/50" type="number" min="0" />
              </div>
            </div>
          </section>
        </GlassCard>

        {/* Services & certifications */}
        <GlassCard className="p-4 sm:p-6 space-y-6">
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Services & certifications</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                <div>
                  <p className="font-medium text-sm">OEM / ODM available</p>
                  <p className="text-xs text-muted-foreground">Support customization for your markets.</p>
                </div>
                <Switch checked={form.oem} onCheckedChange={(v) => setForm((p) => ({ ...p, oem: v }))} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                <div>
                  <p className="font-medium text-sm">Custom packaging</p>
                  <p className="text-xs text-muted-foreground">Logo, labels, manuals in EN/中文.</p>
                </div>
                <Switch checked={form.customPackaging} onCheckedChange={(v) => setForm((p) => ({ ...p, customPackaging: v }))} />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                <div>
                  <p className="font-medium text-sm">Sample available</p>
                  <p className="text-xs text-muted-foreground">Refundable upon bulk order.</p>
                </div>
                <Switch checked={form.sampleAvailable} onCheckedChange={(v) => setForm((p) => ({ ...p, sampleAvailable: v }))} />
              </div>
              <div className="space-y-2 rounded-lg border border-border/60 bg-background/40 px-4 py-3 sm:col-span-2">
                <p className="font-medium text-sm mb-2">Certifications</p>
                <div className="grid grid-cols-5 gap-2 text-sm">
                  {(["CE","RoHS","ISO9001","FCC","CCC"] as const).map((c) => (
                    <label key={c} className="flex items-center gap-2">
                      <input type="checkbox" checked={(form.certifications as any)[c.toLowerCase()]} onChange={(e) => setForm((p: any) => ({ ...p, certifications: { ...p.certifications, [c.toLowerCase()]: e.target.checked } }))} /> {c}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </GlassCard>

        {/* Media */}
        <GlassCard className="p-4 sm:p-6 space-y-6">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">Media</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UploadCloud className="w-4 h-4" /> Upload or update media
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                <Label className="text-base font-semibold">Product Images</Label>
                <span className="text-xs text-muted-foreground">({imagePreviews.length}/6)</span>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img src={preview} alt={`Preview ${idx}`} className="w-full aspect-square object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFilesChange}
                  multiple
                  disabled={imagePreviews.length >= 6}
                  className="hidden"
                  id="image-input"
                />
                <label
                  htmlFor="image-input"
                  className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    imagePreviews.length >= 6
                      ? "border-muted bg-muted/20 cursor-not-allowed opacity-50"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium text-sm">Click to upload images</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB each</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Video */}
            <div className="space-y-4 border-t border-border/50 pt-6">
              <div className="flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-primary" />
                <Label className="text-base font-semibold">Product Video</Label>
              </div>

              {videoPreview && (
                <div className="relative w-full rounded-lg overflow-hidden bg-muted/50 aspect-video">
                  <video src={videoPreview} controls className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              <div className="relative">
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  disabled={!!videoFile}
                  className="hidden"
                  id="video-input"
                />
                <label
                  htmlFor="video-input"
                  className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    videoFile
                      ? "border-muted bg-muted/20 cursor-not-allowed opacity-50"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium text-sm">Click to upload video</p>
                    <p className="text-xs text-muted-foreground">MP4, WebM up to 50MB</p>
                    {videoFile && <p className="text-xs font-semibold text-primary mt-2">{videoFile.name}</p>}
                  </div>
                </label>
              </div>
            </div>

            {/* Brochure */}
            <div className="space-y-4 border-t border-border/50 pt-6">
              <Label className="text-base font-semibold">PDF Brochure (Optional)</Label>

              {brochureFile && (
                <div className="p-3 rounded-lg bg-secondary/20 border border-secondary/50 flex items-center justify-between">
                  <p className="text-sm font-medium text-secondary">{brochureFile.name}</p>
                  <button
                    type="button"
                    onClick={removeBrochure}
                    className="p-1 hover:bg-secondary/20 rounded text-secondary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="relative">
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleBrochureChange}
                  disabled={!!brochureFile}
                  className="hidden"
                  id="brochure-input"
                />
                <label
                  htmlFor="brochure-input"
                  className={`flex items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    brochureFile
                      ? "border-muted bg-muted/20 cursor-not-allowed opacity-50"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-center">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="font-medium text-sm">Click to upload PDF</p>
                    <p className="text-xs text-muted-foreground">PDF up to 10MB</p>
                  </div>
                </label>
              </div>
            </div>
          </section>
        </GlassCard>

        {/* Contact */}
        <GlassCard className="p-4 sm:p-6 space-y-6">
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-semibold">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="companyName">Company name</Label>
                <Input id="companyName" value={form.companyName} onChange={handle("companyName")} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="contactName">Contact person</Label>
                <Input id="contactName" value={form.contactName} onChange={handle("contactName")} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="contactEmail">Email</Label>
                <Input id="contactEmail" value={form.contactEmail} onChange={handle("contactEmail")} className="h-11 bg-background/50" type="email" />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input id="contactPhone" value={form.contactPhone} onChange={handle("contactPhone")} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="wechat">WeChat</Label>
                <Input id="wechat" value={form.wechat} onChange={handle("wechat")} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2 sm:col-span-1">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input id="whatsapp" value={form.whatsapp} onChange={handle("whatsapp")} className="h-11 bg-background/50" />
              </div>
            </div>
          </section>
        </GlassCard>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/industry/products'); }}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="gradient"
            onClick={() => {
              toast({ title: "Product updated", description: "Your changes have been saved." });
              if (window.history.length > 1) navigate(-1); else navigate('/industry/products');
            }}
          >
            Save changes
          </Button>
          <Button variant="outline" onClick={() => navigate(`/industry/products/${product.id}/stats`)}>
            <BarChart3 className="w-4 h-4" />
            View Stats
          </Button>
        </div>
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryProductEdit;
