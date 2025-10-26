import React from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: "lift" | "scale" | "glow" | "scale-glow";
  animate?: "fade" | "slide-up" | "scale-in" | "bounce";
  delay?: number;
  variant?: "default" | "gradient" | "glass" | "neon";
  onClick?: () => void;
}

/**
 * AnimatedCard Component
 * 
 * Provides various animation and hover effects:
 * - Lift effect (translateY on hover)
 * - Scale effect (scale on hover)
 * - Glow effect (box-shadow on hover)
 * - Scale + Glow combined
 * 
 * And entrance animations:
 * - Fade in
 * - Slide up
 * - Scale in
 * - Bounce
 * 
 * Usage:
 * ```tsx
 * <AnimatedCard 
 *   hover="lift" 
 *   animate="slide-up"
 *   variant="gradient"
 *   delay={0.1}
 * >
 *   Card content
 * </AnimatedCard>
 * ```
 */
const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  hover = "lift",
  animate = "fade",
  delay = 0,
  variant = "default",
  onClick,
}) => {
  const hoverClass = {
    lift: "hover-lift",
    scale: "hover-scale",
    glow: "hover-glow",
    "scale-glow": "hover-lift hover-glow",
  }[hover];

  const animateClass = {
    fade: "animate-fade-in",
    "slide-up": "animate-slide-up",
    "scale-in": "animate-scale-in",
    bounce: "animate-bounce-subtle",
  }[animate];

  const variantClass = {
    default: "bg-card border border-border rounded-lg",
    gradient: "bg-gradient-primary rounded-lg text-white",
    glass: "glass-effect rounded-lg",
    neon: "border-2 border-primary rounded-lg bg-background backdrop-blur-sm",
  }[variant];

  return (
    <div
      className={cn(
        "p-6 transition-smooth cursor-pointer",
        hoverClass,
        animateClass,
        variantClass,
        className
      )}
      style={{ animationDelay: `${delay}s` }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};

/**
 * AnimatedCardGrid Component
 * 
 * Grid of animated cards with staggered entrance
 */
export interface AnimatedCardGridProps {
  items: React.ReactNode[];
  columns?: number;
  gap?: number;
  hover?: "lift" | "scale" | "glow" | "scale-glow";
  animate?: "fade" | "slide-up" | "scale-in" | "bounce";
  itemDelay?: number;
  className?: string;
}

export const AnimatedCardGrid: React.FC<AnimatedCardGridProps> = ({
  items,
  columns = 3,
  gap = 4,
  hover = "lift",
  animate = "slide-up",
  itemDelay = 0.1,
  className,
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns as keyof typeof gridCols] || "grid-cols-3";

  const gapClass = `gap-${gap}`;

  return (
    <div className={cn(`grid ${gridCols} ${gapClass}`, className)}>
      {items.map((item, index) => (
        <AnimatedCard
          key={index}
          hover={hover}
          animate={animate}
          delay={index * itemDelay}
        >
          {item}
        </AnimatedCard>
      ))}
    </div>
  );
};

export default AnimatedCard;
