/**
 * Image Optimization Utilities
 * 
 * Provides helpers for:
 * - Generating responsive image URLs
 * - Preloading critical images
 * - Converting images to optimized formats
 * - Calculating responsive image dimensions
 */

/**
 * Generate Netlify Image CDN URL for automatic optimization
 * 
 * @param url - Original image URL
 * @param width - Desired width in pixels
 * @param quality - Image quality (1-100), default 80
 * @returns Optimized Netlify Image CDN URL
 */
export function generateNetlifyImageUrl(
  url: string,
  width?: number,
  quality: number = 80
): string {
  const params = new URLSearchParams();
  
  if (width) {
    params.append("w", width.toString());
  }
  
  params.append("q", quality.toString());
  
  const queryString = params.toString();
  return `/.netlify/images?url=${encodeURIComponent(url)}&${queryString}`;
}

/**
 * Generate responsive image srcset
 * 
 * @param baseUrl - Base image URL
 * @param sizes - Array of widths to generate (e.g., [300, 600, 1200])
 * @returns srcSet string for use in img element
 */
export function generateSrcSet(baseUrl: string, sizes: number[] = [300, 600, 1200]): string {
  return sizes
    .map((size) => `${generateNetlifyImageUrl(baseUrl, size)} ${size}w`)
    .join(", ");
}

/**
 * Generate sizes attribute for responsive images
 * 
 * @returns sizes attribute string
 */
export function generateSizes(): string {
  return "(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw";
}

/**
 * Preload critical images for better performance
 * 
 * @param urls - Array of image URLs to preload
 * @param format - Optional image format (webp, avif)
 */
export function preloadImages(urls: string[], format?: "webp" | "avif"): void {
  if (typeof document === "undefined") return;

  urls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;

    if (format) {
      link.type = `image/${format}`;
    }

    document.head.appendChild(link);
  });
}

/**
 * Detect browser image format support
 * 
 * @returns Object with format support flags
 */
export async function detectImageFormats(): Promise<{
  webp: boolean;
  avif: boolean;
}> {
  if (typeof document === "undefined") {
    return { webp: false, avif: false };
  }

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  return {
    webp: canvas.toDataURL("image/webp").includes("image/webp"),
    avif: await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src =
        "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAG1hdmYA";
    }),
  };
}

/**
 * Calculate image dimensions maintaining aspect ratio
 * 
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param maxWidth - Maximum width constraint
 * @param maxHeight - Maximum height constraint
 * @returns Object with calculated width and height
 */
export function calculateImageDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } {
  const aspectRatio = originalHeight / originalWidth;
  let width = maxWidth;
  let height = width * aspectRatio;

  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = height / aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

/**
 * Get image quality based on viewport width
 * 
 * @param viewportWidth - Current viewport width
 * @returns Recommended image quality (1-100)
 */
export function getImageQuality(viewportWidth: number): number {
  if (viewportWidth < 640) return 70; // Mobile
  if (viewportWidth < 1024) return 80; // Tablet
  return 90; // Desktop
}

/**
 * Build complete image props for OptimizedImage component
 * 
 * @param baseUrl - Base image URL
 * @param options - Configuration options
 * @returns Complete image props object
 */
export interface ImagePropsOptions {
  baseUrl: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  sizes?: string;
  className?: string;
  loading?: "lazy" | "eager";
  webp?: string;
  avif?: string;
}

export function buildImageProps(options: ImagePropsOptions) {
  const {
    baseUrl,
    alt,
    width,
    height,
    quality = 80,
    sizes = generateSizes(),
    className,
    loading = "lazy",
    webp,
    avif,
  } = options;

  return {
    src: baseUrl,
    alt,
    width,
    height,
    quality,
    sizes,
    className,
    loading,
    webp,
    avif,
    srcSet: width ? generateSrcSet(baseUrl, [width, width * 2]) : undefined,
  };
}

/**
 * Check if image URL is external
 * 
 * @param url - Image URL to check
 * @returns true if URL is external (http/https), false if relative
 */
export function isExternalImage(url: string): boolean {
  return /^https?:\/\//.test(url);
}

/**
 * Get image source with optional CDN transformation
 * 
 * @param url - Original image URL
 * @param useCDN - Whether to use Netlify Image CDN
 * @param width - Optional width for CDN
 * @param quality - Optional quality for CDN
 * @returns Processed image URL
 */
export function getImageSource(
  url: string,
  useCDN: boolean = true,
  width?: number,
  quality?: number
): string {
  if (!useCDN || isExternalImage(url)) {
    return url;
  }

  return generateNetlifyImageUrl(url, width, quality);
}

/**
 * Generate picture element HTML with multiple formats
 * 
 * @param baseUrl - Base image URL
 * @param options - Configuration options
 * @returns HTML string for picture element
 */
export function generatePictureHTML(
  baseUrl: string,
  options?: {
    webp?: string;
    avif?: string;
    alt: string;
    width?: number;
    height?: number;
    className?: string;
  }
): string {
  const { alt, webp, avif, className = "" } = options || {};

  let html = '<picture>';

  if (avif) {
    html += `<source srcSet="${avif}" type="image/avif" />`;
  }

  if (webp) {
    html += `<source srcSet="${webp}" type="image/webp" />`;
  }

  const width = options?.width ? ` width="${options.width}"` : "";
  const height = options?.height ? ` height="${options.height}"` : "";

  html += `<img src="${baseUrl}" alt="${alt}"${width}${height} class="${className}" />`;
  html += '</picture>';

  return html;
}
