# Image and Asset Optimization Guide

This document provides comprehensive strategies for optimizing images and assets in the Echina application.

## Image Optimization Strategy

### 1. Supported Formats

**Recommended formats by use case:**

| Format | Use Case | Compression | Browser Support |
|--------|----------|-------------|-----------------|
| WebP | Modern browsers, photos | Excellent (25-35% smaller) | Modern browsers |
| JPEG | Fallback for photos | Good | All browsers |
| PNG | Transparency needed, icons | Fair | All browsers |
| SVG | Vector graphics, icons | Excellent for small | All browsers |
| AVIF | Next-gen format | Best (20% smaller than WebP) | Chrome, Edge, Opera |

### 2. Image Sizing Recommendations

#### Product Images
- Thumbnail: 150x150px (20-40 KB)
- Card view: 300x300px (40-80 KB)
- Detail view: 800x800px (200-400 KB)
- Use responsive images with srcset

#### Hero Images
- Mobile: 600x400px (150-300 KB)
- Tablet: 1000x600px (300-500 KB)
- Desktop: 1600x800px (400-800 KB)

#### Icons
- Small (16-24px): 1-2 KB
- Medium (32-48px): 2-5 KB
- Large (64-128px): 5-10 KB

### 3. Optimization Tools

#### Online Tools
- **TinyPNG/TinyJPG** - Lossy compression for JPEG/PNG
- **Squoosh** - Google's image compression tool
- **SVGO** - SVG optimization
- **ImageOptim** - Batch image optimization (macOS)
- **FileOptimizer** - Batch optimization (Windows)

#### Command-line Tools

```bash
# Install optimization tools
npm install -D imagemin imagemin-webp imagemin-mozjpeg imagemin-pngquant

# Optimize images in bulk
npx imagemin src/images/* --out-dir=dist/images --plugin=mozjpeg --plugin=pngquant --plugin=webp
```

### 4. Responsive Image Implementation

Use the Picture element for multiple formats:

```tsx
<picture>
  <source srcSet="/image.avif" type="image/avif" />
  <source srcSet="/image.webp" type="image/webp" />
  <img 
    src="/image.jpg" 
    alt="Description"
    width={800}
    height={600}
    loading="lazy"
  />
</picture>
```

Or use srcset for responsive sizing:

```tsx
<img
  src="/image-small.jpg"
  srcSet="/image-small.jpg 600w, /image-medium.jpg 1200w, /image-large.jpg 1800w"
  sizes="(max-width: 600px) 600px, (max-width: 1200px) 1200px, 1800px"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
/>
```

## SVG Optimization

### Inline Critical SVGs

For small SVGs (< 5KB), inline them in the HTML:

```tsx
<svg viewBox="0 0 100 100" className="w-6 h-6">
  <circle cx="50" cy="50" r="40" />
</svg>
```

### SVG as Image

For larger SVGs, reference them as images:

```tsx
<img src="/icon.svg" alt="Icon" width={24} height={24} />
```

### SVG Optimization Example

Before (500 bytes):
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
</svg>
```

After SVGO (200 bytes):
```xml
<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
```

## Font Optimization

### 1. Font Subsetting

Only include characters used in your app:

```css
/* Load only Latin characters */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;
  unicode-range: U+0020-00FF, U+0131, U+0152-0153;
}
```

### 2. Font Strategy

```css
/* System font fallback chain */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;

/* Use font-display: swap for better performance */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-bold.woff2') format('woff2');
  font-display: swap;
  font-weight: 700;
  font-style: normal;
}
```

### 3. Load Only Required Weights

Limit fonts to only what's needed:
- Regular (400)
- Semibold (600)
- Bold (700)

Avoid loading all weight variations.

## CSS Optimization

### 1. Purge Unused CSS

Tailwind CSS automatically purges unused styles in production. Configure in tailwind.config.ts:

```ts
content: [
  "./src/**/*.{ts,tsx}",
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
]
```

### 2. Critical CSS

Inline critical CSS for above-the-fold content:

```tsx
<style>{`
  .hero { 
    background: linear-gradient(135deg, #3d5afe, #6366f1);
  }
`}</style>
```

### 3. CSS Code Splitting

Vite automatically splits CSS by component/chunk. Each chunk gets its own CSS file.

## JavaScript Optimization

### 1. Lazy Loading Components

Use React.lazy() for route-based splitting:

```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));

// In routes
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### 2. Dynamic Imports

Load heavy libraries on demand:

```tsx
const loadCharts = () => import('recharts');

// Use only when needed
if (showCharts) {
  loadCharts().then(({ BarChart }) => {
    // Use BarChart
  });
}
```

### 3. Tree-shaking

Only import what you need:

```tsx
// ✅ Good - only imports needed functions
import { Button } from '@/components/ui/button';

// ❌ Bad - imports entire module
import * as UI from '@/components/ui';
```

## Asset Caching Strategy

### Versioned Assets

Vite automatically adds content hashes to filenames:
- `app-a1b2c3d4.js` (if content changes, hash changes)
- Enables long-term caching

### Cache Headers

Configured in netlify.toml:

```toml
[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

### Cache Busting

When you update content:
1. Build the app (Vite generates new hashes)
2. Vite automatically updates HTML with new asset paths
3. Browsers download new assets when hashes change
4. Old cached assets are never used

## Netlify Image CDN

Enable Netlify Image CDN for automatic optimization:

```tsx
// Before - direct image
<img src="/products/chair.jpg" alt="Chair" />

// After - Netlify Image CDN
<img 
  src="/.netlify/images?url=/products/chair.jpg&w=400&q=80" 
  alt="Chair" 
/>
```

## Performance Targets

### Bundle Sizes (Gzipped)
- HTML: < 50 KB
- Main JS: < 150 KB
- CSS: < 50 KB
- Images: Variable (optimize individually)
- Fonts: < 100 KB total

### Image Sizes
- Thumbnails: < 50 KB
- Preview images: < 200 KB
- Full-size images: < 500 KB

### Page Load Times
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3s

## Best Practices Checklist

- [ ] All images are compressed
- [ ] WebP format provided with JPEG fallback
- [ ] Responsive images use srcset
- [ ] SVGs are optimized
- [ ] Only needed fonts are loaded
- [ ] Lazy loading is used for images
- [ ] CSS is purged of unused styles
- [ ] JavaScript is code-split by route
- [ ] Cache headers are set correctly
- [ ] Bundle is analyzed for large dependencies

## Tools and Resources

- [Squoosh](https://squoosh.app/) - Interactive image compression
- [SVGO](https://svgo.dev/) - SVG optimization
- [ImageOptim](https://imageoptim.com/) - Mac image compression
- [TinyPNG](https://tinypng.com/) - PNG/JPEG compression
- [Web.dev Image Guidance](https://web.dev/images/) - Complete image guide
- [Netlify Image CDN](https://docs.netlify.com/image-cdn/overview/) - Automatic image optimization
