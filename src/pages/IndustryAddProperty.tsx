import { useEffect, useState, ChangeEvent, FormEvent } from "react";
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
import { ArrowLeft, ClipboardCheck, UploadCloud } from "lucide-react";

type PropertyFormState = {
  propertyName: string;
  propertyType: string;
  location: string;
  city: string;
  price: string;
  currency: string;
  size: string;
  availableFrom: string;
  description: string;
  highlights: string;
  imageUrl: string;
  videoUrl: string;
  documentsUrl: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

const initialFormState = (name = "", email = ""): PropertyFormState => ({
  propertyName: "",
  propertyType: "warehouse",
  location: "",
  city: "",
  price: "",
  currency: "USD",
  size: "",
  availableFrom: "",
  description: "",
  highlights: "",
  imageUrl: "",
  videoUrl: "",
  documentsUrl: "",
  contactName: name,
  contactEmail: email,
  contactPhone: "",
});

const IndustryAddProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getCurrentUser();

  const [formData, setFormData] = useState<PropertyFormState>(initialFormState(user?.name, user?.email));
  const [options, setOptions] = useState({ featured: true, inspections: true });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "industry") {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleChange = <T extends HTMLInputElement | HTMLTextAreaElement>(field: keyof PropertyFormState) =>
    (event: ChangeEvent<T>) => {
      const { value } = event.target;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 650));
      toast({
        title: "Property submitted",
        description: "Your property listing has been saved successfully.",
      });
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
              <h1 className="text-2xl font-bold">Add New Property</h1>
              <p className="text-sm text-muted-foreground">Share detailed information about your industrial space.</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData(initialFormState(user?.name, user?.email));
              setOptions({ featured: true, inspections: true });
            }}
            disabled={isSubmitting}
          >
            Reset form
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <GlassCard className="p-4 sm:p-6 space-y-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">Property details</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClipboardCheck className="w-4 h-4" />
                  Complete all required fields
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="propertyName">Property name</Label>
                  <Input
                    id="propertyName"
                    value={formData.propertyName}
                    onChange={handleChange("propertyName")}
                    required
                    className="h-11 bg-background/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Property type</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger className="h-11 bg-background/60">
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="factory">Factory</SelectItem>
                      <SelectItem value="showroom">Showroom</SelectItem>
                      <SelectItem value="logistics">Logistics hub</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Street address</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={handleChange("location")}
                    required
                    className="h-11 bg-background/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={handleChange("city")}
                    required
                    className="h-11 bg-background/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Listing price</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger className="h-11 bg-background/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="CNY">CNY</SelectItem>
                        <SelectItem value="NGN">NGN</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="price"
                      value={formData.price}
                      onChange={handleChange("price")}
                      required
                      className="col-span-2 h-11 bg-background/60"
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Total floor area (sqm)</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={handleChange("size")}
                    required
                    className="h-11 bg-background/60"
                    type="number"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availableFrom">Available from</Label>
                  <Input
                    id="availableFrom"
                    value={formData.availableFrom}
                    onChange={handleChange("availableFrom")}
                    required
                    className="h-11 bg-background/60"
                    type="date"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Full description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange("description")}
                  required
                  className="min-h-[140px] bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highlights">Key highlights (comma separated)</Label>
                <Input
                  id="highlights"
                  value={formData.highlights}
                  onChange={handleChange("highlights")}
                  className="h-11 bg-background/60"
                />
              </div>
            </section>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6 space-y-6">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">Media and documentation</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UploadCloud className="w-4 h-4" />
                  Share hosted links for easy review
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image gallery URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange("imageUrl")}
                    className="h-11 bg-background/60"
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video tour URL</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleChange("videoUrl")}
                    className="h-11 bg-background/60"
                    type="url"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="documentsUrl">Supporting documents (floor plans, compliance)</Label>
                  <Input
                    id="documentsUrl"
                    value={formData.documentsUrl}
                    onChange={handleChange("documentsUrl")}
                    className="h-11 bg-background/60"
                    type="url"
                  />
                </div>
              </div>
            </section>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6 space-y-6">
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold">Marketing preferences</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">Mark as featured listing</p>
                    <p className="text-xs text-muted-foreground">Appear at the top of search results for 30 days.</p>
                  </div>
                  <Switch
                    checked={options.featured}
                    onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, featured: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-background/40 px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">Allow in-person inspections</p>
                    <p className="text-xs text-muted-foreground">Schedule guided tours for verified buyers.</p>
                  </div>
                  <Switch
                    checked={options.inspections}
                    onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, inspections: checked }))}
                  />
                </div>
              </div>
            </section>
          </GlassCard>

          <GlassCard className="p-4 sm:p-6 space-y-6">
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold">Primary contact</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="contactName">Contact name</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={handleChange("contactName")}
                    required
                    className="h-11 bg-background/60"
                  />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange("contactEmail")}
                    required
                    className="h-11 bg-background/60"
                    type="email"
                  />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="contactPhone">Phone number</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange("contactPhone")}
                    required
                    className="h-11 bg-background/60"
                  />
                </div>
              </div>
            </section>
          </GlassCard>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/industry") } disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish property"}
            </Button>
          </div>
        </form>
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryAddProperty;
