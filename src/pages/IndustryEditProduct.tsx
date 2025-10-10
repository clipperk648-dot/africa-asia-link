import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { mockProducts } from "@/utils/mockData";
import { saveOverride } from "@/utils/productStorage";
import GlassCard from "@/components/GlassCard";
import ThreeBackground from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const IndustryEditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = getCurrentUser();
  const base = mockProducts.find((p) => p.id === id);

  const [form, setForm] = useState({
    name: base?.name || "",
    category: base?.category || "",
    price: base?.price?.toString() || "",
    company: base?.company || "",
    location: base?.location || "",
    image: base?.image || "",
  });

  useEffect(() => {
    if (!user || user.role !== "industry") navigate("/login");
    if (!base) navigate("/industry/products");
  }, [user, base, navigate]);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const priceNum = Number(form.price);
    saveOverride({ id, name: form.name, category: form.category, price: isNaN(priceNum) ? undefined : priceNum, company: form.company, location: form.location, image: form.image });
    navigate("/industry/products");
  };

  return (
    <div className="min-h-screen pb-12 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold">Edit Product</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <GlassCard className="p-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={handleChange("name")} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={form.category} onChange={handleChange("category")} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price (CNY)</Label>
              <Input id="price" type="number" value={form.price} onChange={handleChange("price")} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={form.company} onChange={handleChange("company")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={handleChange("location")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" value={form.image} onChange={handleChange("image")} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate("/industry/products")}>Cancel</Button>
              <Button type="submit" variant="gradient">Save</Button>
            </div>
          </form>
        </GlassCard>
      </main>
    </div>
  );
};

export default IndustryEditProduct;
