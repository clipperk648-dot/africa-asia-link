import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "text" | "card" | "image" | "button" | "circle";
  count?: number;
  width?: string | number;
  height?: string | number;
}

/**
 * LoadingSkeleton Component
 * 
 * Provides animated skeleton loaders for various content types:
 * - Text lines
 * - Cards
 * - Images
 * - Buttons
 * - Circles
 * 
 * Usage:
 * ```tsx
 * <LoadingSkeleton variant="card" count={3} />
 * <LoadingSkeleton variant="image" width={400} height={300} />
 * <LoadingSkeleton variant="text" count={5} />
 * ```
 */
const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  variant = "text",
  count = 1,
  width = "100%",
  height = "1rem",
}) => {
  const baseClass = "skeleton rounded-md";
  const widthClass = typeof width === "number" ? `w-[${width}px]` : `w-${width}`;
  const heightClass = typeof height === "number" ? `h-[${height}px]` : `h-${height}`;

  const variants = {
    text: cn(baseClass, heightClass, widthClass, className),
    card: cn("p-4 rounded-xl space-y-4", className),
    image: cn(
      baseClass,
      "aspect-video",
      typeof width === "number" ? `w-[${width}px]` : "w-full",
      className
    ),
    button: cn(baseClass, "h-10 rounded-lg", className),
    circle: cn(baseClass, "rounded-full w-10 h-10", className),
  };

  const getSkeletonElement = () => {
    switch (variant) {
      case "card":
        return (
          <div className={variants.card}>
            <div className="skeleton h-6 rounded-md w-3/4" />
            <div className="space-y-2">
              <div className="skeleton h-4 rounded-md w-full" />
              <div className="skeleton h-4 rounded-md w-5/6" />
              <div className="skeleton h-4 rounded-md w-4/6" />
            </div>
          </div>
        );

      case "image":
        return <div className={variants.image} />;

      case "button":
        return <div className={variants.button} />;

      case "circle":
        return <div className={variants.circle} />;

      case "text":
      default:
        return Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              variants.text,
              i < count - 1 && "mb-2",
              i === count - 1 && "w-5/6"
            )}
          />
        ));
    }
  };

  return <div className="space-y-2">{getSkeletonElement()}</div>;
};

/**
 * Skeleton Card Component
 * Displays a grid of skeleton cards
 */
export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <LoadingSkeleton key={i} variant="card" />
    ))}
  </div>
);

/**
 * Skeleton Table Component
 * Displays a skeleton table structure
 */
export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <LoadingSkeleton
            key={colIndex}
            variant="text"
            width="100%"
            height="2rem"
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Skeleton List Component
 * Displays a skeleton list structure
 */
export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <LoadingSkeleton variant="circle" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" width="3/4" height="1rem" />
          <LoadingSkeleton variant="text" width="5/6" height="0.875rem" />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
