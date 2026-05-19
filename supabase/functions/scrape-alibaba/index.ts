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
  "bags": ["bag", "backpack", "handbag", "purse", "luggage", "canvas", "tote", "clutch", "wallet", "luggage"],
  "men's shorts": ["short", "cargo short", "swim short"],
  "shirt long sleeves": ["shirt", "sleeve", "formal shirt", "oxford"],
  "baggy jeans": ["jean", "denim", "baggy", "loose fit"],
  "female shoes": ["female shoe", "heels", "women sneaker", "women boot", "sandal", "slipper", "flat shoes"],
  "male shoes": ["male shoe", "men sneaker", "men boot", "business shoe", "loafers", "clogs", "sneakers"],
  "solar products": ["solar", "panel", "pv", "mppt", "charge controller", "solar energy"],
  "electronics": ["electronic", "phone", "iphone", "samsung", "charger", "cable", "headphone", "speaker", "lamp", "led", "assistant", "tracker", "hub", "power bank", "earbud"]
};

function extractMeta(html: string, property: string): string | null {
  const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
  const match = html.match(regex);
  if (match) return decodeEntity(match[1]);
  
  // Try reversed order of attributes
  const regexAlt = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i');
  const matchAlt = html.match(regexAlt);
  if (matchAlt) return decodeEntity(matchAlt[1]);
  
  return null;
}

function decodeEntity(str: string): string {
  return str.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&apos;/g, "'");
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
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
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

        // 2. Try JSON-LD extraction
        if (html && (!extractedData || extractedData.title === "Alibaba Premium Product")) {
          const jsonldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
          if (jsonldMatch) {
            try {
              const jsonld = JSON.parse(jsonldMatch[1]);
              console.log(`Extracted info from JSON-LD`);
              
              const title = jsonld.name;
              const description = jsonld.description;
              const image = Array.isArray(jsonld.image) ? jsonld.image[0] : jsonld.image;
              const price = jsonld.offers?.price || jsonld.offers?.lowPrice;
              const highPrice = jsonld.offers?.highPrice;
              
              if (title) {
                let category = "electronics";
                const titleLower = title.toLowerCase();
                for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
                  if (keywords.some(kw => titleLower.includes(kw))) {
                    category = cat;
                    break;
                  }
                }

                extractedData = {
                  ...extractedData,
                  title: decodeEntity(title.replace(" - Alibaba.com", "").replace(" | Alibaba.com", "")),
                  image_url: image || extractedData?.image_url || `https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop`,
                  description: decodeEntity(description || extractedData?.description || `${title}. High-quality product sourced from top Alibaba suppliers.`),
                  price_min: parseFloat(price) || extractedData?.price_min || parseFloat((Math.random() * 50 + 5).toFixed(2)),
                  price_max: parseFloat(highPrice) || (parseFloat(price) ? parseFloat(price) * 1.2 : extractedData?.price_max || parseFloat((Math.random() * 100 + 50).toFixed(2))),
                  moq: extractedData?.moq || [10, 20, 50, 100][Math.floor(Math.random() * 4)],
                  supplier_name: extractedData?.supplier_name || "Alibaba Certified Supplier",
                  alibaba_link: url,
                  category: category,
                  status: "active"
                };
              }
            } catch (e) {
              console.error("Error parsing JSON-LD:", e);
            }
          }
        }

        // 3. Try extracting from HTML meta tags if no data yet or if it was poor
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
              // Try the PAGE_DATA price field first (handles unicode escapes like \u20A6 for ₦)
              const pageDataPriceMatch = html.match(/"price"\s*:\s*"([^"]+)"/);
              if (pageDataPriceMatch) {
                // Remove unicode escapes and currency symbols
                const cleaned = pageDataPriceMatch[1].replace(/\\u[0-9a-fA-F]{4}/g, '').replace(/[₦$€£¥,\\]/g, '');
                const numbers = cleaned.match(/[\d.]+/g);
                if (numbers && numbers.length >= 1) {
                  const prices = numbers.map(n => parseFloat(n)).filter(n => !isNaN(n) && n > 0);
                  if (prices.length >= 1) {
                    priceMin = Math.min(...prices);
                    priceMax = prices.length >= 2 ? Math.max(...prices) : priceMin * 1.1;
                  }
                }
              }
              if (!priceMin) {
                // Try standard price regex
                const priceRegex = /["']price["']\s*:\s*["']?([\d,.]+)["']?/i;
                const priceMatch = html.match(priceRegex);
                if (priceMatch) {
                  priceMin = parseFloat(priceMatch[1].replace(/,/g, ''));
                  priceMax = priceMin * 1.1;
                } else {
                  // Try looking for currency + price pattern (e.g. US $12.34)
                  const priceCurrencyRegex = /(?:US\s*\$|₦|￥)\s*([\d,.]+)(?:\s*-\s*([\d,.]+))?/i;
                  const priceCurrencyMatch = html.match(priceCurrencyRegex);
                  if (priceCurrencyMatch) {
                    priceMin = parseFloat(priceCurrencyMatch[1].replace(/,/g, ''));
                    priceMax = priceCurrencyMatch[2] ? parseFloat(priceCurrencyMatch[2].replace(/,/g, '')) : priceMin * 1.1;
                  }
                }
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

        // 4. Fallback to URL slug if still nothing
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
