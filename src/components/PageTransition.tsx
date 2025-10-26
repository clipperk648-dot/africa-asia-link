import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}

/**
 * PageTransition Component
 * 
 * Provides smooth fade-in animation for page content
 * Automatically triggers on mount and when key changes
 * 
 * Usage:
 * ```tsx
 * <PageTransition>
 *   <Dashboard />
 * </PageTransition>
 * ```
 */
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  duration = 600,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-opacity duration-600",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * ScaleTransition Component
 * Page transition with scale effect
 */
export const ScaleTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  duration = 600,
  delay = 0,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={cn(
        "transition-all duration-600",
        isVisible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-95",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * SlideTransition Component
 * Page transition with slide effect
 */
export const SlideTransition: React.FC<
  PageTransitionProps & { direction?: "up" | "down" | "left" | "right" }
> = ({
  children,
  className,
  duration = 600,
  delay = 0,
  direction = "up",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const directionMap = {
    up: isVisible
      ? "translate-y-0"
      : "translate-y-8",
    down: isVisible
      ? "translate-y-0"
      : "-translate-y-8",
    left: isVisible
      ? "translate-x-0"
      : "translate-x-8",
    right: isVisible
      ? "translate-x-0"
      : "-translate-x-8",
  };

  return (
    <div
      className={cn(
        "transition-all duration-600",
        isVisible ? "opacity-100" : "opacity-0",
        directionMap[direction],
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

/**
 * StaggerTransition Component
 * Multiple children fade in with stagger effect
 */
export const StaggerTransition: React.FC<{
  children: React.ReactNode[];
  className?: string;
  delay?: number;
  itemDelay?: number;
}> = ({
  children,
  className,
  delay = 0,
  itemDelay = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={cn("space-y-4", className)}>
      {React.Children.map(children, (child, index) => (
        <div
          className={cn(
            "transition-all duration-600",
            isVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          )}
          style={{
            transitionDelay: isVisible
              ? `${index * itemDelay}ms`
              : "0ms",
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default PageTransition;
