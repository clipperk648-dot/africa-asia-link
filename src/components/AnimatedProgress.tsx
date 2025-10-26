import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  value: number; // 0-100
  className?: string;
  variant?: "default" | "gradient" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  label?: string;
  showValue?: boolean;
}

/**
 * AnimatedProgress Component
 * 
 * Smooth animated progress bar with various styles
 * 
 * Usage:
 * ```tsx
 * <AnimatedProgress value={65} variant="gradient" showValue />
 * ```
 */
const AnimatedProgress: React.FC<AnimatedProgressProps> = ({
  value,
  className,
  variant = "default",
  size = "md",
  animated = true,
  label,
  showValue = false,
}) => {
  const sizeClass = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  }[size];

  const variantClass = {
    default: "bg-primary",
    gradient: "bg-gradient-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  }[variant];

  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showValue && (
            <span className="text-sm font-semibold text-primary">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden transition-all duration-300",
          sizeClass
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            variantClass,
            animated && "shadow-lg",
            animated && "animate-pulse-glow"
          )}
          style={{
            width: `${clampedValue}%`,
          }}
        />
      </div>
    </div>
  );
};

/**
 * CircularProgress Component
 * 
 * Circular animated progress indicator
 */
export interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  variant?: "default" | "gradient" | "success" | "warning" | "error";
  showLabel?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 100,
  strokeWidth = 4,
  className,
  variant = "default",
  showLabel = true,
}) => {
  const clampedValue = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  const colorMap = {
    default: "hsl(240 80% 35%)",
    gradient: "hsl(270 100% 60%)",
    success: "hsl(142 70% 45%)",
    warning: "hsl(45 100% 55%)",
    error: "hsl(0 84% 60%)",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: "rotate(-90deg)" }}
          className="animate-rotate"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />

          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorMap[variant]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${colorMap[variant]})`,
            }}
          />
        </svg>

        {/* Label */}
        {showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold">{Math.round(clampedValue)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * SkeletonLoader Component
 * 
 * Animated skeleton loading bar
 */
export const SkeletonLoader: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div
    className={cn(
      "h-2 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted animate-shimmer rounded-full",
      className
    )}
  />
);

/**
 * DotLoader Component
 * 
 * Animated dots loading indicator
 */
export interface DotLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const DotLoader: React.FC<DotLoaderProps> = ({
  className,
  size = "md",
}) => {
  const sizeClass = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }[size];

  return (
    <div className={cn("flex gap-2 items-center justify-center", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full bg-primary animate-bounce",
            sizeClass
          )}
          style={{
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * LineLoader Component
 * 
 * Animated line loading indicator
 */
export const LineLoader: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("w-full overflow-hidden", className)}>
    <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-shimmer" />
  </div>
);

export default AnimatedProgress;
