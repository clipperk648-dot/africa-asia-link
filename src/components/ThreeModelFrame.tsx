import React from "react";
import { cn } from "@/lib/utils";

interface ThreeModelFrameProps {
  modelUrl?: string;
  mtlUrl?: string;
  className?: string;
  heightClassName?: string; // e.g., h-full
}

const ThreeModelFrame: React.FC<ThreeModelFrameProps> = ({ className, heightClassName = "h-[26rem]" }) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-white border border-black/10 shadow-xl",
        heightClassName,
        className,
      )}
    >
      {/* Static picture-frame background (white). No 3D content rendered. */}
      <div className="absolute inset-0" />
    </div>
  );
};

export default ThreeModelFrame;
