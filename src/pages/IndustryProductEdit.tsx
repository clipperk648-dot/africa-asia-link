import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { mockProducts } from "@/utils/mockData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, PencilLine, BarChart3, UploadCloud } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

const IndustryProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = getCurrentUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || user.role !== "industry") navigate("/login");
  }, [user, navigate]);

  const product = useMemo(() => mockProducts.find((p) => String(p.id) === id), [id]);

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
    currency: (product?.currency as any) || "USD",
    moq: String(product?.moq ?? ""),
    supplyAbilityPerMonth: String(product?.supplyAbilityPerMonth ?? ""),
    quantityAvailable: String(product?.quantityAvailable ?? ""),
    leadTimeDays: String(product?.leadTimeDays ?? ""),
    incoterm: product?.incoterm || "FOB",
    portOfShipment: product?.portOfShipment || "",
    description: product?.description || "",
    specifications: (product?.specifications || []).join("\n"),
    imageUrls: (product?.images || (product?.image ? [product.image] : [])).join(", "),
    videoUrl: product?.videoUrl || "",
    brochureUrl: product?.brochureUrl || "",
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
  }));

  const handle = (key: keyof typeof form) => (e: any) => setForm((p) => ({ ...p, [key]: e.target ? e.target.value : e }));

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

        {/* Trade information */}
        <GlassCard className="p-4 sm:p-6 space-y-6">
          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Unit price</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={form.currency as any} onValueChange={(v) => setForm((p) => ({ ...p, currency: v as any }))}>
                    <SelectTrigger className="h-11 bg-background/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CNY">CNY (¥)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input value={form.unitPrice} onChange={handle("unitPrice")} className="col-span-2 h-11 bg-background/50" type="number" min="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
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
                <Label htmlFor="moq">MOQ</Label>
                <Input id="moq" value={form.moq} onChange={handle("moq")} className="h-11 bg-background/50" type="number" min="1" />
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
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">Media</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UploadCloud className="w-4 h-4" /> Links to images/videos/brochures
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="imageUrls">Image URLs (comma separated)</Label>
                <Input id="imageUrls" value={form.imageUrls} onChange={handle("imageUrls")} className="h-11 bg-background/50" />
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {form.imageUrls.split(",").map((u) => u.trim()).filter(Boolean).slice(0,6).map((u, i) => (
                    <img key={i} src={u} alt="Preview" className="aspect-square w-full object-cover rounded" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input id="videoUrl" value={form.videoUrl} onChange={handle("videoUrl")} className="h-11 bg-background/50" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="brochureUrl">PDF Brochure URL</Label>
                <Input id="brochureUrl" value={form.brochureUrl} onChange={handle("brochureUrl")} className="h-11 bg-background/50" />
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
