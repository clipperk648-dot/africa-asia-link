import { ChangeEvent, FormEvent, useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ClipboardCheck, UploadCloud, X, Image as ImageIcon, Video as VideoIcon, Upload, Package, Ruler, Scale } from "lucide-react";
import { calculateUnitCBM } from "@/utils/cbm";

type ProductFormState = {
  nameEN: string;
  nameZH: string;
  category: string;
  hsCode: string;
  brand: string;
  model: string;
  originCountry: string;
  province: string;
  city: string;
  unit: string;
  unitPrice: string;
  currency: "CNY" | "NGN" | "NGN";
  moq: string;
  supplyAbilityPerMonth: string;
  leadTimeDays: string;
  incoterm: string;
  portOfShipment: string;
  description: string;
  specifications: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  wechat: string;
  whatsapp: string;
  warrantyMonths: string;
  quantityAvailable: string;
  weight_kg: string;
  length_cm: string;
  width_cm: string;
  height_cm: string;
  has_battery: boolean;
  requires_nafdac: boolean;
  moq_price: string;
  cluster_target_qty: string;
};

const initialFormState = (userName = "", userEmail = "", company = ""): ProductFormState => ({
  nameEN: "",
  nameZH: "",
  category: "machinery",
  hsCode: "",
  brand: "",
  model: "",
  originCountry: "China",
  province: "Guangdong",
  city: "Shenzhen",
  unit: "piece",
  unitPrice: "",
  currency: "CNY",
  moq: "100",
  supplyAbilityPerMonth: "10000",
  leadTimeDays: "15",
  incoterm: "FOB",
  portOfShipment: "Shenzhen",
  description: "",
  specifications: "",
  companyName: company || "",
  contactName: userName || "",
  contactEmail: userEmail || "",
  contactPhone: "",
  wechat: "",
  whatsapp: "",
  warrantyMonths: "12",
  quantityAvailable: "",
  weight_kg: "",
  length_cm: "",
  width_cm: "",
  height_cm: "",
  has_battery: false,
  requires_nafdac: false,
  moq_price: "",
  cluster_target_qty: "100",
});

const IndustryAddProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();

  const [formData, setFormData] = useState<ProductFormState>(
    initialFormState(user?.name, user?.email, user?.company)
  );
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [options, setOptions] = useState({ oem: true, odm: true, customPackaging: true, sampleAvailable: true, certifications: { ce: true, rohs: true, iso9001: true, fcc: false, ccc: false } });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const unitCBM = useMemo(() => {
    const l = parseFloat(formData.length_cm) || 0;
    const w = parseFloat(formData.width_cm) || 0;
    const h = parseFloat(formData.height_cm) || 0;
    return calculateUnitCBM(l, w, h);
  }, [formData.length_cm, formData.width_cm, formData.height_cm]);

  useEffect(() => {
    if (!user || (user.role !== "industry" && user.role !== "sourcing-agent")) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleChange = <T extends HTMLInputElement | HTMLTextAreaElement>(field: keyof ProductFormState) =>
    (event: ChangeEvent<T>) => setFormData((prev) => ({ ...prev, [field]: event.target.value }));

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 6) {
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 650));
      toast({ title: "Product submitted", description: "Your product has been saved successfully with all media files." });
      navigate("/industry");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/industry")}> 
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Add New Product</h1>
              <p className="text-sm text-muted-foreground">Provide detailed information and upload media for buyers worldwide.</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData(initialFormState(user?.name, user?.email, user?.company));
              setImageFiles([]);
              setImagePreviews([]);
              setVideoFile(null);
              setVideoPreview(null);
              setBrochureFile(null);
              setOptions({ oem: true, odm: true, customPackaging: true, sampleAvailable: true, certifications: { ce: true, rohs: true, iso9001: true, fcc: false, ccc: false } });
            }}
            disabled={isSubmitting}
          >
            Reset form
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product details */}
          <GlassCard className="p-4 sm:p-6 space-y-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">Product details</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClipboardCheck className="w-4 h-4" /> Complete required fields
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nameEN">Product name (English)</Label>
                  <Input id="nameEN" value={formData.nameEN} onChange={handleChange("nameEN")} required className="h-11 bg-background/60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nameZH">产品名称 (Chinese)</Label>
                  <Input id="nameZH" value={formData.nameZH} onChange={handleChange("nameZH")} className="h-11 bg-background/60" />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v }))}>
                    <SelectTrigger className="h-11 bg-background/60"><SelectValue placeholder="Select category" /></SelectTrigger>
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
                  <Input id="hsCode" value={formData.hsCode} onChange={handleChange("hsCode")} placeholder="e.g. 847130" className="h-11 bg-background/60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" value={formData.brand} onChange={handleChange("brand")} className="h-11 bg-background/60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model / SKU</Label>
                  <Input id="model" value={formData.model} onChange={handleChange("model")} className="h-11 bg-background/60" />
                </div>
                <div className="space-y-2">
                  <Label>Origin</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input value={formData.originCountry} onChange={handleChange("originCountry")} className="h-11 bg-background/60" />
                    <Input value={formData.province} onChange={handleChange("province")} className="h-11 bg-background/60" placeholder="Province" />
                    <Input value={formData.city} onChange={handleChange("city")} className="h-11 bg-background/60" placeholder="City" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Short description</Label>
                <Textarea id="description" value={formData.description} onChange={handleChange("description")} required className="min-h-[100px] bg-background/60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specifications">Key specifications (one per line)</Label>
                <Textarea id="specifications" value={formData.specifications} onChange={handleChange("specifications")} className="min-h-[120px] bg-background/60" />
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
                    <Input id="weight_kg" value={formData.weight_kg} onChange={handleChange("weight_kg")} required className="h-11 bg-background/60 pl-10" type="number" step="0.001" min="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length_cm">Length (cm)</Label>
                  <Input id="length_cm" value={formData.length_cm} onChange={handleChange("length_cm")} required className="h-11 bg-background/60" type="number" step="0.1" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width_cm">Width (cm)</Label>
                  <Input id="width_cm" value={formData.width_cm} onChange={handleChange("width_cm")} required className="h-11 bg-background/60" type="number" step="0.1" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height_cm">Height (cm)</Label>
                  <Input id="height_cm" value={formData.height_cm} onChange={handleChange("height_cm")} required className="h-11 bg-background/60" type="number" step="0.1" min="0" />
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
                    checked={formData.has_battery} 
                    onCheckedChange={(v) => setFormData(p => ({ ...p, has_battery: v }))} 
                  />
                  <Label htmlFor="has_battery" className="cursor-pointer">Contains Battery</Label>
                </div>

                <div className="flex items-center space-x-2 pb-2">
                  <Switch 
                    id="requires_nafdac" 
                    checked={formData.requires_nafdac} 
                    onCheckedChange={(v) => setFormData(p => ({ ...p, requires_nafdac: v }))} 
                  />
                  <Label htmlFor="requires_nafdac" className="cursor-pointer">Requires NAFDAC</Label>
                </div>
              </div>
            </section>
          </GlassCard>

          {/* Trade info */}
          <GlassCard className="p-4 sm:p-6 space-y-6">
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold">Trade information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Retail Unit price (Below MOQ)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select value={formData.currency} onValueChange={(v: ProductFormState["currency"]) => setFormData((p) => ({ ...p, currency: v }))}>
                      <SelectTrigger className="h-11 bg-background/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CNY">CNY (¥)</SelectItem>
                        <SelectItem value="NGN">NGN (₦)</SelectItem>
                        <SelectItem value="NGN">NGN (₦)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input value={formData.unitPrice} onChange={handleChange("unitPrice")} required className="col-span-2 h-11 bg-background/60" type="number" min="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Unit Type</Label>
                  <Select value={formData.unit} onValueChange={(v) => setFormData((p) => ({ ...p, unit: v }))}>
                    <SelectTrigger className="h-11 bg-background/60"><SelectValue /></SelectTrigger>
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
                  <Input id="moq" value={formData.moq} onChange={handleChange("moq")} required className="h-11 bg-background/60" type="number" min="1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moq_price">MOQ Price (Per unit when ≥ MOQ)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-muted-foreground font-medium">
                      {formData.currency === 'NGN' ? '$' : formData.currency === 'CNY' ? '¥' : '₦'}
                    </span>
                    <Input id="moq_price" value={formData.moq_price} onChange={handleChange("moq_price")} required className="h-11 bg-background/60 pl-8" type="number" min="0" />
                  </div>
                  <p className="text-xs text-muted-foreground italic">MOQ price activates when the cluster's combined order reaches your MOQ.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cluster_target_qty">Cluster Target Quantity</Label>
                  <Input id="cluster_target_qty" value={formData.cluster_target_qty} onChange={handleChange("cluster_target_qty")} required className="h-11 bg-background/60" type="number" min="1" />
                  <p className="text-xs text-muted-foreground italic">Suggested target quantity for clusters to reach.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplyAbilityPerMonth">Supply ability (per month)</Label>
                  <Input id="supplyAbilityPerMonth" value={formData.supplyAbilityPerMonth} onChange={handleChange("supplyAbilityPerMonth")} className="h-11 bg-background/60" type="number" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantityAvailable">Quantity available</Label>
                  <Input id="quantityAvailable" value={formData.quantityAvailable} onChange={handleChange("quantityAvailable")} className="h-11 bg-background/60" type="number" min="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leadTimeDays">Lead time (days)</Label>
                  <Input id="leadTimeDays" value={formData.leadTimeDays} onChange={handleChange("leadTimeDays")} className="h-11 bg-background/60" type="number" min="0" />
                </div>
                <div className="space-y-2">
                  <Label>Incoterm</Label>
                  <Select value={formData.incoterm} onValueChange={(v) => setFormData((p) => ({ ...p, incoterm: v }))}>
                    <SelectTrigger className="h-11 bg-background/60"><SelectValue /></SelectTrigger>
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
                  <Select value={formData.portOfShipment} onValueChange={(v) => setFormData((p) => ({ ...p, portOfShipment: v }))}>
                    <SelectTrigger className="h-11 bg-background/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shenzhen">Shenzhen</SelectItem>
                      <SelectItem value="Guangzhou">Guangzhou</SelectItem>
                      <SelectItem value="Shanghai">Shanghai</SelectItem>
                      <SelectItem value="Ningbo">Ningbo</SelectItem>
                      <SelectItem value="Qingdao">Qingdao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>
          </GlassCard>

          {/* Certifications and services */}
          <GlassCard className="p-4 sm:p-6 space-y-6">
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold">Certifications & services</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">OEM / ODM available</p>
                    <p className="text-xs text-muted-foreground">Support customization for your markets.</p>
                  </div>
                  <Switch checked={options.oem} onCheckedChange={(v) => setOptions((p) => ({ ...p, oem: v }))} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">Custom packaging</p>
                    <p className="text-xs text-muted-foreground">Logo, labels, manuals in EN/中文.</p>
                  </div>
                  <Switch checked={options.customPackaging} onCheckedChange={(v) => setOptions((p) => ({ ...p, customPackaging: v }))} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">Sample available</p>
                    <p className="text-xs text-muted-foreground">Refundable upon bulk order.</p>
                  </div>
                  <Switch checked={options.sampleAvailable} onCheckedChange={(v) => setOptions((p) => ({ ...p, sampleAvailable: v }))} />
                </div>
                <div className="space-y-2 rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                  <p className="font-medium text-sm mb-2">Certifications</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <label className="flex items-center gap-2"><input type="checkbox" checked={options.certifications.ce} onChange={(e) => setOptions((p) => ({ ...p, certifications: { ...p.certifications, ce: e.target.checked } }))} /> CE</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={options.certifications.rohs} onChange={(e) => setOptions((p) => ({ ...p, certifications: { ...p.certifications, rohs: e.target.checked } }))} /> RoHS</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={options.certifications.iso9001} onChange={(e) => setOptions((p) => ({ ...p, certifications: { ...p.certifications, iso9001: e.target.checked } }))} /> ISO9001</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={options.certifications.fcc} onChange={(e) => setOptions((p) => ({ ...p, certifications: { ...p.certifications, fcc: e.target.checked } }))} /> FCC</label>
                    <label className="flex items-center gap-2"><input type="checkbox" checked={options.certifications.ccc} onChange={(e) => setOptions((p) => ({ ...p, certifications: { ...p.certifications, ccc: e.target.checked } }))} /> CCC</label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warrantyMonths">Warranty (months)</Label>
                  <Input id="warrantyMonths" value={formData.warrantyMonths} onChange={handleChange("warrantyMonths")} className="h-11 bg-background/60" type="number" min="0" />
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
                  <UploadCloud className="w-4 h-4" /> Upload images, videos, and brochures
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

          {/* Contacts */}
          <GlassCard className="p-4 sm:p-6 space-y-6">
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold">Contact</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="companyName">Company name</Label>
                  <Input id="companyName" value={formData.companyName} onChange={handleChange("companyName")} className="h-11 bg-background/60" />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="contactName">Contact person</Label>
                  <Input id="contactName" value={formData.contactName} onChange={handleChange("contactName")} className="h-11 bg-background/60" />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input id="contactEmail" value={formData.contactEmail} onChange={handleChange("contactEmail")} className="h-11 bg-background/60" type="email" />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="contactPhone">Phone</Label>
                  <Input id="contactPhone" value={formData.contactPhone} onChange={handleChange("contactPhone")} className="h-11 bg-background/60" />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="wechat">WeChat</Label>
                  <Input id="wechat" value={formData.wechat} onChange={handleChange("wechat")} className="h-11 bg-background/60" />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" value={formData.whatsapp} onChange={handleChange("whatsapp")} className="h-11 bg-background/60" />
                </div>
              </div>
            </section>
          </GlassCard>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/industry")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish product"}
            </Button>
          </div>
        </form>
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryAddProperty;
