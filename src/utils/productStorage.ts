import type { Product } from "@/utils/mockData";

const KEY = "product_overrides_v1";

export type ProductOverride = Partial<Pick<Product, "name" | "category" | "price" | "company" | "location" | "image">> & { id: string };

export function loadOverrides(): Record<string, ProductOverride> {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, ProductOverride>) : {};
  } catch {
    return {};
  }
}

export function saveOverride(override: ProductOverride) {
  const all = loadOverrides();
  all[override.id] = { ...all[override.id], ...override };
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getProductsWithOverrides(base: Product[]): Product[] {
  const overrides = loadOverrides();
  return base.map((p) => {
    const o = overrides[p.id];
    if (!o) return p;
    return {
      ...p,
      name: o.name ?? p.name,
      category: o.category ?? p.category,
      price: o.price ?? p.price,
      company: o.company ?? p.company,
      location: o.location ?? p.location,
      image: o.image ?? p.image,
    };
  });
}
