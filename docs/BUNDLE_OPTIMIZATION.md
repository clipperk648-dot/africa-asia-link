# Bundle Optimization Guide

This document outlines the bundle size optimization strategies implemented for the Echina application.

## Current Optimizations

### 1. Code Splitting Strategy

The Vite configuration implements aggressive code splitting with the following chunks:

#### Main Chunks:
- **react-vendor**: Core React dependencies (react, react-dom, react-router-dom)
- **radix-ui**: UI component library with heavy imports
- **charts**: Recharts for data visualization
- **query**: TanStack React Query for data management
- **forms**: Form handling libraries
- **ui-utils**: Utility libraries and styling tools
- **icons**: Icon libraries and date utilities
- **theme**: Theme and animation libraries
- **carousel**: Carousel components

### 2. Asset Organization

Files are organized by type for efficient caching:
- `js/` - JavaScript chunks with content hashing
- `css/` - CSS files with content hashing
- `images/` - Image assets with content hashing
- `fonts/` - Font files with content hashing

### 3. Production Optimizations

The build process includes:
- **Terser minification** with console/debugger removal in production
- **CSS code splitting** - Each component's CSS is split into separate files
- **Tree-shaking** - Unused code is removed during build
- **Source maps disabled** in production for smaller bundle sizes

## Performance Tips

### Route-Based Lazy Loading
All pages are lazy-loaded using React.lazy() and Suspense:
```tsx
const Dashboard = lazy(() => import("./pages/Dashboard"));
```

This ensures each route chunk is only loaded when needed.

### Component Optimization

1. **Memoization**: Use React.memo() for components that receive the same props
2. **useCallback**: Wrap callbacks to prevent unnecessary re-renders
3. **useMemo**: Cache expensive computations
4. **Code splitting**: Split components at route boundaries

### Asset Optimization

1. **Image Optimization**:
   - Use WebP format for modern browsers
   - Provide fallbacks for older browsers
   - Use responsive images with srcset
   - Compress images before uploading

2. **SVG Optimization**:
   - Remove unnecessary attributes
   - Use SVGO for automated optimization
   - Inline critical SVGs

3. **Font Optimization**:
   - Use system fonts as fallbacks
   - Limit font weight variations
   - Use font-display: swap for better perceived performance

## Build Analysis

To analyze bundle size:

```bash
# Vite provides a detailed build report
npm run build

# Check the dist folder for detailed metrics
ls -lh dist/
```

Expected bundle sizes (gzipped):
- Main application: ~100-150 KB
- Vendor chunks: ~300-400 KB total
- Individual page chunks: ~20-50 KB each

## Caching Strategy

### Long-term Caching (1 year)
- JavaScript bundles with content hash
- CSS files with content hash
- Images with content hash
- Fonts with content hash

### Short-term Caching (No cache)
- index.html - Must validate on every request

### Cache Headers

Set in netlify.toml:
```
Cache-Control: public, max-age=31536000, immutable
```

For HTML:
```
Cache-Control: no-cache, no-store, must-revalidate
```

## Performance Monitoring

### Metrics to Track
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)
- Total Blocking Time (TBT)

### Tools
- Lighthouse (Chrome DevTools)
- WebPageTest
- Netlify Analytics

## Deployment Optimization

### Netlify Configuration
1. **Build command**: Optimized for production
2. **Functions bundler**: esbuild for fast bundling
3. **Edge functions**: Use for cached responses
4. **Image optimization**: Enable Netlify Image CDN

### Monitoring
```bash
# Check function performance
netlify logs functions

# Monitor build performance
netlify build --debug
```

## Future Optimizations

1. **HTTP/2 Server Push**: Push critical assets
2. **Dynamic imports**: Load code based on user interactions
3. **Web Workers**: Offload heavy computation
4. **Service Workers**: Cache strategies for offline support
5. **Compression**: Enable Brotli compression on Netlify

## Best Practices

### Code Organization
- Keep components small and focused
- Separate concerns (UI, logic, styling)
- Use composition over inheritance
- Extract shared utilities

### Dependency Management
- Regularly audit dependencies with `npm audit`
- Remove unused packages
- Use lighter alternatives when available
- Monitor package size with `npm ls`

### Testing Before Deployment
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Check for TypeScript errors
npx tsc --noEmit

# Lint code
npm run lint
```

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [Webpack Bundle Analyzer](https://github.com/webpack-bundle-analyzer/webpack-bundle-analyzer)
- [Web.dev Performance Guide](https://web.dev/performance/)
- [Netlify Documentation](https://docs.netlify.com/)
