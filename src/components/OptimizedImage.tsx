import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  quality?: 80 | 85 | 90 | 95;
  loading?: "lazy" | "eager";
  objectFit?: "cover" | "contain" | "fill" | "scale-down";
  objectPosition?: string;
  fallback?: string;
  webp?: string;
  avif?: string;
  srcSet?: string;
  sizes?: string;
}

/**
 * OptimizedImage Component
 * 
 * Provides automatic image optimization with:
 * - Lazy loading for images below the fold
 * - Responsive image support with srcSet
 * - Multiple format support (AVIF, WebP, PNG/JPG)
 * - Aspect ratio preservation
 * - Loading state handling
 * - Error fallback
 * 
 * Usage:
 * ```tsx
 * <OptimizedImage
 *   src="/images/product.jpg"
 *   webp="/images/product.webp"
 *   avif="/images/product.avif"
 *   alt="Product image"
 *   width={400}
 *   height={300}
 *   quality={80}
 * />
 * ```
 */
const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      className,
      quality = 80,
      loading = "lazy",
      objectFit = "cover",
      objectPosition = "center",
      fallback,
      webp,
      avif,
      srcSet,
      sizes,
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [useWebP, setUseWebP] = useState(false);
    const [useAVIF, setUseAVIF] = useState(false);
    const internalRef = useRef<HTMLImageElement>(null);
    const imageRef = ref || internalRef;

    // Check for format support on mount
    useEffect(() => {
      const img = new Image();
      
      // Check AVIF support
      if (avif) {
        img.onload = () => setUseAVIF(true);
        img.onerror = () => {
          // Check WebP support if AVIF fails
          if (webp) {
            img.onload = () => setUseWebP(true);
            img.src = webp;
          }
        };
        img.src = avif;
      } else if (webp) {
        // Check WebP if no AVIF
        img.onload = () => setUseWebP(true);
        img.src = webp;
      }
    }, [avif, webp]);

    const handleLoad = () => {
      setIsLoaded(true);
      setError(false);
    };

    const handleError = () => {
      setError(true);
      setIsLoaded(true);
    };

    // Determine which source to use
    let imageSrc = src;
    if (useAVIF && avif) {
      imageSrc = avif;
    } else if (useWebP && webp) {
      imageSrc = webp;
    }

    // Calculate aspect ratio for layout shift prevention
    const aspectRatio = width && height ? (height / width) * 100 : undefined;
    const wrapperStyle = aspectRatio ? { paddingBottom: `${aspectRatio}%` } : undefined;

    // Handle error state
    if (error && fallback) {
      imageSrc = fallback;
    }

    return (
      <div
        className={cn(
          "relative overflow-hidden bg-muted",
          width && height && "w-full",
          className
        )}
        style={wrapperStyle ? { position: "relative" } : undefined}
      >
        {/* Skeleton loader while image is loading */}
        {!isLoaded && !error && (
          <div
            className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted animate-shimmer"
            aria-hidden="true"
          />
        )}

        {/* Main image element */}
        <picture>
          {/* AVIF format for modern browsers */}
          {avif && <source srcSet={avif} type="image/avif" />}
          
          {/* WebP format for browsers without AVIF */}
          {webp && <source srcSet={webp} type="image/webp" />}
          
          {/* Fallback to original format */}
          {srcSet ? (
            <source srcSet={srcSet} sizes={sizes} />
          ) : null}

          <img
            ref={imageRef}
            src={imageSrc}
            alt={alt}
            width={width}
            height={height}
            loading={loading}
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              wrapperStyle && "absolute inset-0",
            )}
            style={{
              objectFit,
              objectPosition,
              width: width ? `${width}px` : "100%",
              height: height ? `${height}px` : "100%",
            }}
          />
        </picture>

        {/* Error fallback */}
        {error && !fallback && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm"
            role="status"
            aria-label={`Failed to load image: ${alt}`}
          >
            Image unavailable
          </div>
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
