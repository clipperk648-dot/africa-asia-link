import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard = ({ children, className, hover = true, onClick }: GlassCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "backdrop-blur-md bg-white/5 border border-white/15 rounded-2xl p-3 shadow-lg glass-effect-hover transition-smooth",
        hover && "hover-lift",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

export default React.memo(GlassCard);
