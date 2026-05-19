import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProduct, useCreateProductMutation, useUpdateProductMutation } from "@/hooks/useData";
import type { Product } from "@/types/models";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, UploadCloud, X, Image as ImageIcon, Video as VideoIcon, Upload, Save, Eye } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";

type ProductForm = {
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
  currency: string;
  moq: string;
  supplyAbilityPerMonth: string;
  quantityAvailable: string;
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
  oem: boolean;
  odm: boolean;
  customPackaging: boolean;
  sampleAvailable: boolean;
  certifications: {
    ce: boolean;
    rohs: boolean;
    iso9001: boolean;
    fcc: boolean;
    ccc: boolean;
  };
};

const AdminProductEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isAddMode = !id || id === 'add';

  const { data: product } = useProduct(id && id !== 'add' ? id : undefined);
  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();

  const [form, setForm] = useState<ProductForm>({
    nameEN: "",
    nameZH: "",
    category: "machinery",
    hsCode: "",
    brand: "",
    model: "",
    originCountry: "China",
    province: "",
    city: "",
    unit: "piece",
    unitPrice: "",
    currency: "NGN",
    moq: "",
    supplyAbilityPerMonth: "",
    quantityAvailable: "",
    leadTimeDays: "",
    incoterm: "FOB",
    portOfShipment: "",
    description: "",
    specifications: "",
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    wechat: "",
    whatsapp: "",
    warrantyMonths: "",
    oem: false,
    odm: false,
    customPackaging: false,
    sampleAvailable: false,
    certifications: {
      ce: false,
      rohs: false,
      iso9001: false,
      fcc: false,
      ccc: false,
    },
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      const p = product as Product;
      setForm({
        nameEN: p.name || "",
        nameZH: p.nameZH || "",
        category: p.category?.toLowerCase() || "machinery",
        hsCode: p.hsCode || "",
        brand: p.brand || "",
        model: p.model || "",
        originCountry: p.originCountry || "China",
        province: p.province || "",
        city: p.city || "",
        unit: p.unit || "piece",
        unitPrice: String(p.unitPrice ?? p.price ?? ""),
        currency: (p.currency as string) || "NGN",
        moq: String(p.moq ?? ""),
        supplyAbilityPerMonth: String(p.supplyAbilityPerMonth ?? ""),
        quantityAvailable: String(p.quantityAvailable ?? ""),
        leadTimeDays: String(p.leadTimeDays ?? ""),
        incoterm: p.incoterm || "FOB",
        portOfShipment: p.portOfShipment || "",
        description: p.description || "",
        specifications: (p.specifications || []).join("\n"),
        companyName: p.company || "",
        contactName: p.contactName || "",
        contactEmail: p.contactEmail || "",
        contactPhone: p.contactPhone || "",
        wechat: p.wechat || "",
        whatsapp: p.whatsapp || "",
        warrantyMonths: String(p.warrantyMonths ?? ""),
        oem: !!p.oemAvailable,
        odm: !!p.odmAvailable,
        customPackaging: !!p.customPackaging,
        sampleAvailable: !!p.sampleAvailable,
        certifications: {
          ce: p.certifications?.includes("CE") || false,
          rohs: p.certifications?.includes("RoHS") || false,
          iso9001: p.certifications?.includes("ISO9001") || false,
          fcc: p.certifications?.includes("FCC") || false,
          ccc: p.certifications?.includes("CCC") || false,
        },
      });
      setImagePreviews((p.images || (p.image ? [p.image] : [])) as string[]);
    }
  }, [product]);

  const handleInput = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm(p => ({ ...p, [key]: value }));
  };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imagePreviews.length > 6) {
      toast.error("Maximum 6 images allowed");
      return;
    }
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews(prev => [...prev, e.target?.result as string]);
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const productData: Partial<Product> = {
        name: form.nameEN,
        nameZH: form.nameZH,
        category: form.category,
        hsCode: form.hsCode,
        brand: form.brand,
        model: form.model,
        originCountry: form.originCountry,
        province: form.province,
        city: form.city,
        unit: form.unit,
        price: parseFloat(form.unitPrice),
        unitPrice: parseFloat(form.unitPrice),
        currency: form.currency as "NGN" | "CNY",
        moq: parseInt(form.moq),
        supplyAbilityPerMonth: parseInt(form.supplyAbilityPerMonth),
        quantityAvailable: parseInt(form.quantityAvailable),
        leadTimeDays: parseInt(form.leadTimeDays),
        incoterm: form.incoterm,
        portOfShipment: form.portOfShipment,
        description: form.description,
        specifications: form.specifications.split("\n").filter(Boolean),
        company: form.companyName,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        wechat: form.wechat,
        whatsapp: form.whatsapp,
        warrantyMonths: parseInt(form.warrantyMonths),
        oemAvailable: form.oem,
        odmAvailable: form.odm,
        customPackaging: form.customPackaging,
        sampleAvailable: form.sampleAvailable,
        image: imagePreviews[0] || "",
        images: imagePreviews,
        location: `${form.city}, ${form.originCountry || 'China'}`
      };

      if (isAddMode) {
        await createProductMutation.mutateAsync(productData);
        toast.success("Product created successfully");
      } else {
        await updateProductMutation.mutateAsync({ id: id!, data: productData });
        toast.success("Product updated successfully");
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error("Failed to save product");
    }
  };

  return (
    <AdminLayout>
      <main className="max-w-5xl mx-auto px-4 py-8 w-full space-y-8 pb-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="rounded-full border-white/10" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {isAddMode ? 'Add New Product' : 'Edit Product'}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {isAddMode ? 'Create a new item in your global catalog.' : `Updating ${(product as Product)?.name || 'product'}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             {!isAddMode && (
               <Button variant="outline" className="flex-1 sm:flex-none border-white/10 gap-2" onClick={() => navigate(`/buyer/products/${id}`)}>
                 <Eye className="w-4 h-4" /> Preview
               </Button>
             )}
             <Button className="flex-1 sm:flex-none gap-2 shadow-lg shadow-primary/20" onClick={handleSave}>
               <Save className="w-4 h-4" /> Save Product
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6 border-white/5 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4">Basic Information</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Name (EN)</Label>
                  <Input value={form.nameEN} onChange={(e) => handleInput("nameEN", e.target.value)} className="bg-background/50 border-white/10 h-11" placeholder="e.g., Industrial Sorter" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">产品名称 (ZH)</Label>
                  <Input value={form.nameZH} onChange={(e) => handleInput("nameZH", e.target.value)} className="bg-background/50 border-white/10 h-11" placeholder="例如：工业分选机" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</Label>
                  <Select value={form.category} onValueChange={(v) => handleInput("category", v)}>
                    <SelectTrigger className="bg-background/50 border-white/10 h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="machinery">Machinery</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="home">Home Appliances</SelectItem>
                      <SelectItem value="textiles">Textiles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Brand</Label>
                  <Input value={form.brand} onChange={(e) => handleInput("brand", e.target.value)} className="bg-background/50 border-white/10 h-11" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
                  <Textarea value={form.description} onChange={(e) => handleInput("description", e.target.value)} className="bg-background/50 border-white/10 min-h-[120px]" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-white/5 space-y-6">
              <h3 className="text-lg font-bold text-white border-b border-white/5 pb-4">Trade & Logistics</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price & Currency</Label>
                  <div className="flex gap-2">
                    <Select value={form.currency} onValueChange={(v) => handleInput("currency", v)}>
                      <SelectTrigger className="w-24 bg-background/50 border-white/10 h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NGN">NGN</SelectItem>
                        <SelectItem value="CNY">CNY</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" value={form.unitPrice} onChange={(e) => handleInput("unitPrice", e.target.value)} className="flex-1 bg-background/50 border-white/10 h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">MOQ</Label>
                  <Input type="number" value={form.moq} onChange={(e) => handleInput("moq", e.target.value)} className="bg-background/50 border-white/10 h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Lead Time (Days)</Label>
                  <Input type="number" value={form.leadTimeDays} onChange={(e) => handleInput("leadTimeDays", e.target.value)} className="bg-background/50 border-white/10 h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Incoterm</Label>
                  <Select value={form.incoterm} onValueChange={(v) => handleInput("incoterm", v)}>
                    <SelectTrigger className="bg-background/50 border-white/10 h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOB">FOB</SelectItem>
                      <SelectItem value="CIF">CIF</SelectItem>
                      <SelectItem value="DDP">DDP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6 border-white/5 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" /> Media
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 group">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 6 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">Upload</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageFilesChange} />
                  </label>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-6 border-white/5 space-y-4">
              <h3 className="text-lg font-bold text-white">Capabilities</h3>
              {[
                { id: "oem", label: "OEM Available" },
                { id: "odm", label: "ODM Available" },
                { id: "sampleAvailable", label: "Samples" },
                { id: "customPackaging", label: "Custom Packaging" },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-xs font-bold text-white">{item.label}</span>
                  <Switch checked={form[item.id as keyof ProductForm] as boolean} onCheckedChange={(v) => handleInput(item.id as keyof ProductForm, v)} />
                </div>
              ))}
            </GlassCard>

            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-bold text-white">Video & Docs</h4>
              </div>
              <Button variant="outline" className="w-full border-white/10 h-10 gap-2 text-xs">
                <VideoIcon className="w-4 h-4" /> Add Product Video
              </Button>
              <Button variant="outline" className="w-full border-white/10 h-10 gap-2 text-xs">
                <UploadCloud className="w-4 h-4" /> Upload PDF Brochure
              </Button>
            </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminProductEdit;
