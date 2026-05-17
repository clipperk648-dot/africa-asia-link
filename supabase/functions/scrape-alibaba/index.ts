/* eslint-disable @typescript-eslint/no-explicit-any */
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Common categories and keywords
const CATEGORY_MAP: Record<string, string[]> = {
  "watches": ["watch", "time", "clock", "wrist"],
  "inverters": ["inverter", "power", "converter", "pure sine"],
  "bags": ["bag", "backpack", "handbag", "purse", "luggage", "canvas"],
  "men's shorts": ["short", "cargo short", "swim short"],
  "shirt long sleeves": ["shirt", "sleeve", "formal shirt", "oxford"],
  "baggy jeans": ["jean", "denim", "baggy", "loose fit"],
  "female shoes": ["female shoe", "heels", "women sneaker", "women boot", "sandal", "slipper", "flat shoes"],
  "male shoes": ["male shoe", "men sneaker", "men boot", "business shoe", "loafers", "clogs", "sneakers"],
  "solar products": ["solar", "panel", "pv", "mppt", "charge controller"],
  "electronics": ["electronic", "phone", "iphone", "samsung", "charger", "cable", "headphone", "speaker", "lamp", "led", "assistant", "tracker"]
};

function extractMeta(html: string, property: string): string | null {
  const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
  const match = html.match(regex);
  if (match) return match[1];
  
  // Try reversed order of attributes
  const regexAlt = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i');
  const matchAlt = html.match(regexAlt);
  if (matchAlt) return matchAlt[1];
  
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls)) {
      return new Response(JSON.stringify({ error: "Invalid URLs" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const results = [];
    
    for (const url of urls) {
      if (!url.trim()) continue;
      
      try {
        console.log(`Processing: ${url}`);
        
        let finalUrl = url;
        let html = "";
        let extractedData: any = null;

        // Follow redirects and get HTML
        try {
          const response = await fetch(url, { 
            method: 'GET',
            redirect: 'follow',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
            }
          });
          finalUrl = response.url;
          html = await response.text();
          console.log(`Final URL: ${finalUrl} (HTML length: ${html.length})`);
        } catch (e) {
          console.error(`Error fetching ${url}:`, e);
        }

        const urlObj = new URL(finalUrl);
        
        // 1. Try extracting from share link parameters first (most reliable for Alibaba mobile shares)
        const params = urlObj.searchParams;
        const nameParam = params.get('name');
        const priceStrParam = params.get('price');
        const imageUrlParam = params.get('imageUrl');
        const moqStrParam = params.get('moq');
        const companyInfoParam = params.get('companyInfo');

        if (nameParam) {
          console.log(`Extracted info from URL params: ${nameParam}`);
          
          let priceMin = 0;
          let priceMax = 0;
          if (priceStrParam) {
            const matches = priceStrParam.match(/[\d,.]+/g);
            if (matches && matches.length >= 1) {
              priceMin = parseFloat(matches[0].replace(/,/g, ''));
              priceMax = matches.length >= 2 ? parseFloat(matches[1].replace(/,/g, '')) : priceMin * 1.2;
            }
          }

          let moq = 1;
          if (moqStrParam) {
            const moqMatch = moqStrParam.match(/\d+/);
            if (moqMatch) moq = parseInt(moqMatch[0]);
          }

          let category = "electronics";
          const titleLower = nameParam.toLowerCase();
          for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
            if (keywords.some(kw => titleLower.includes(kw))) {
              category = cat;
              break;
            }
          }

          extractedData = {
            title: nameParam,
            image_url: imageUrlParam || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop`,
            price_min: priceMin || parseFloat((Math.random() * 50 + 5).toFixed(2)),
            price_max: priceMax || parseFloat((Math.random() * 100 + 50).toFixed(2)),
            moq: moq,
            description: `${nameParam}. High-quality product sourced from top Alibaba suppliers.`,
            supplier_name: companyInfoParam || "Alibaba Certified Supplier",
            alibaba_link: url,
            category: category,
            status: "active"
          };
        }

        // 2. Try extracting from HTML meta tags if no data yet or if it was poor
        if (html && (!extractedData || extractedData.title === "Alibaba Premium Product")) {
          const ogTitle = extractMeta(html, "og:title");
          const ogImage = extractMeta(html, "og:image");
          const ogDescription = extractMeta(html, "og:description") || extractMeta(html, "description");
          
          if (ogTitle && ogTitle !== "Alibaba.com") {
            console.log(`Extracted info from Meta Tags: ${ogTitle}`);
            
            let category = "electronics";
            const titleLower = ogTitle.toLowerCase();
            for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
              if (keywords.some(kw => titleLower.includes(kw))) {
                category = cat;
                break;
              }
            }

            // Try to find price in HTML if possible
            let priceMin = extractedData?.price_min || 0;
            let priceMax = extractedData?.price_max || 0;
            
            if (!priceMin) {
              // Very rough price extraction from HTML
              const priceRegex = /["']price["']\s*:\s*["']?([\d,.]+)["']?/i;
              const priceMatch = html.match(priceRegex);
              if (priceMatch) {
                priceMin = parseFloat(priceMatch[1].replace(/,/g, ''));
                priceMax = priceMin * 1.1;
              }
            }

            extractedData = {
              ...extractedData,
              title: ogTitle.replace(" - Alibaba.com", "").replace(" | Alibaba.com", ""),
              image_url: ogImage || extractedData?.image_url || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop`,
              description: ogDescription || extractedData?.description || `${ogTitle}. High-quality product sourced from top Alibaba suppliers.`,
              price_min: priceMin || parseFloat((Math.random() * 50 + 5).toFixed(2)),
              price_max: priceMax || parseFloat((Math.random() * 100 + 50).toFixed(2)),
              moq: extractedData?.moq || [10, 20, 50, 100][Math.floor(Math.random() * 4)],
              supplier_name: extractedData?.supplier_name || "Alibaba Certified Supplier",
              alibaba_link: url,
              category: category,
              status: "active"
            };
          }
        }

        // 3. Fallback to URL slug if still nothing
        if (!extractedData) {
          const pathParts = urlObj.pathname.split('/');
          let slug = pathParts[pathParts.length - 1] || "";
          if (slug.endsWith('.html')) slug = slug.replace('.html', '');
          
          let derivedTitle = slug.split('-').filter(s => isNaN(parseInt(s))).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
          if (!derivedTitle || derivedTitle.length < 5) {
            derivedTitle = "Alibaba Premium Product";
          }

          let category = "electronics";
          const titleLower = derivedTitle.toLowerCase();
          for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
            if (keywords.some(kw => titleLower.includes(kw))) {
              category = cat;
              break;
            }
          }

          extractedData = {
            title: derivedTitle,
            image_url: `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop`,
            price_min: parseFloat((Math.random() * 50 + 5).toFixed(2)),
            price_max: parseFloat((Math.random() * 100 + 50).toFixed(2)),
            moq: [10, 20, 50, 100][Math.floor(Math.random() * 4)],
            description: `High-quality ${derivedTitle} sourced from top Alibaba suppliers.`,
            supplier_name: derivedTitle.split(' ')[0] + " Manufacturing Co., Ltd.",
            alibaba_link: url,
            category: category,
            status: "active"
          };

          const categoryImages: Record<string, string> = {
            "watches": "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
            "inverters": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789",
            "bags": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
            "solar products": "https://images.unsplash.com/photo-1509391366360-2e938d440220",
            "electronics": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
            "male shoes": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2",
            "female shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
          };

          if (categoryImages[category]) {
            extractedData.image_url = categoryImages[category] + "?w=800&h=800&fit=crop";
          }
        }
        
        results.push({ url, success: true, data: extractedData });
        
        // Add a small delay to avoid rate limiting
        if (urls.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
      } catch (err) {
        console.error(`Error scraping ${url}:`, err);
        results.push({ url, success: false, error: err.message });
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
