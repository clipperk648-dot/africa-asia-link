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
        "backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-3 shadow-lg",
        hover && "transition-all duration-300 hover:bg-white/15 hover:shadow-xl hover:scale-[1.02]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

export default React.memo(GlassCard);
