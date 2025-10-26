import React, { useState, useRef, useEffect } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Ripple {
  id: string;
  x: number;
  y: number;
}

/**
 * RippleButton Component
 * 
 * Enhanced button with material design ripple effect on click
 * Inherits all Button props and variants
 * 
 * Usage:
 * ```tsx
 * <RippleButton variant="default" size="lg">
 *   Click me
 * </RippleButton>
 * ```
 */
const RippleButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, ...props }, ref) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const addRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const id = Math.random().toString(36).substr(2, 9);

      setRipples((prev) => [...prev, { id, x, y }]);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    };

    // Combine refs
    useEffect(() => {
      if (typeof ref === "function") {
        ref(buttonRef.current);
      } else if (ref) {
        ref.current = buttonRef.current;
      }
    }, [ref]);

    return (
      <Button
        ref={buttonRef}
        className={cn("relative overflow-hidden", className)}
        onClick={(e) => {
          addRipple(e);
          props.onClick?.(e);
        }}
        {...props}
      >
        {/* Ripple elements */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: "20px",
              height: "20px",
              transform: "translate(-50%, -50%)",
              animation: "ripple 0.6s ease-out",
            }}
          />
        ))}

        {/* Button content */}
        {children}
      </Button>
    );
  }
);

RippleButton.displayName = "RippleButton";

export default RippleButton;
