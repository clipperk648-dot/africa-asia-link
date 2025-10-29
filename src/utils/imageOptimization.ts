/**
 * Image optimization and fallback utility
 * Provides consistent image handling across the application
 */

export const PLACEHOLDER_IMAGE = "/placeholder.svg";

/**
 * Get a safe image URL with fallback
 * @param imageUrl - The primary image URL
 * @param fallback - Optional fallback URL (defaults to placeholder.svg)
 * @returns Safe image URL or fallback
 */
export const getSafeImageUrl = (
  imageUrl: string | undefined | null,
  fallback: string = PLACEHOLDER_IMAGE
): string => {
  if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
    return fallback;
  }
  return imageUrl;
};

/**
 * Get a safe avatar URL using dicebear or fallback
 * @param seed - The seed for avatar generation (e.g., email, username)
 * @param fallback - Optional fallback URL
 * @returns Safe avatar URL
 */
export const getSafeAvatarUrl = (
  seed: string | undefined | null,
  fallback: string = PLACEHOLDER_IMAGE
): string => {
  if (!seed || typeof seed !== "string" || seed.trim() === "") {
    return fallback;
  }
  try {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  } catch {
    return fallback;
  }
};

/**
 * Convert image URL to Unsplash optimized URL if applicable
 * @param imageUrl - The image URL
 * @param width - Optional width for optimization
 * @param quality - Optional quality (80-95)
 * @returns Optimized URL
 */
export const getOptimizedUnsplashUrl = (
  imageUrl: string | undefined | null,
  width?: number,
  quality: 80 | 85 | 90 | 95 = 80
): string => {
  if (
    !imageUrl ||
    typeof imageUrl !== "string" ||
    !imageUrl.includes("unsplash.com")
  ) {
    return imageUrl || PLACEHOLDER_IMAGE;
  }

  const params = new URLSearchParams();
  if (width) params.append("w", String(width));
  params.append("q", String(quality));
  params.append("auto", "format");
  params.append("fit", "crop");

  const separator = imageUrl.includes("?") ? "&" : "?";
  return `${imageUrl}${separator}${params.toString()}`;
};

/**
 * Create image error handler for img elements
 * @param fallback - Fallback image URL
 * @returns Error handler function
 */
export const createImageErrorHandler = (fallback: string = PLACEHOLDER_IMAGE) => {
  return (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (img.src !== fallback) {
      img.src = fallback;
    }
  };
};
