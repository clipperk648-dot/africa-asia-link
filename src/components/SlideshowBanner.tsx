import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type Slide = {
  image: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
};

interface SlideshowBannerProps {
  slides: Slide[];
  intervalMs?: number;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
  heightClassName?: string; // e.g., "h-40 sm:h-48"
}

const SlideshowBanner: React.FC<SlideshowBannerProps> = ({
  slides,
  intervalMs = 2000,
  className,
  imageClassName,
  contentClassName,
  heightClassName = "h-40 sm:h-48",
}) => {
  const validSlides = useMemo(() => slides.filter(s => !!s.image), [slides]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (validSlides.length <= 1) return;
    const id = setInterval(() => {
      setIndex(prev => (prev + 1) % validSlides.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [validSlides.length, intervalMs]);

  const current = validSlides[index] ?? validSlides[0];

  if (!current) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl shadow bg-card", className, heightClassName)}>
      <img
        src={current.image}
        alt={current.title || current.subtitle || "banner"}
        className={cn("absolute inset-0 w-full h-full object-cover", imageClassName)}
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent" />
      <div className={cn("relative z-10 p-4 sm:p-5 text-white flex flex-col gap-2 h-full justify-end", contentClassName)}>
        {current.title && <h3 className="text-lg sm:text-xl font-extrabold drop-shadow">{current.title}</h3>}
        {current.subtitle && <p className="text-xs sm:text-sm text-white/85 max-w-[90%]">{current.subtitle}</p>}
        {(current.ctaLabel && (current.ctaHref || current.onCtaClick)) && (
          current.ctaHref ? (
            <a href={current.ctaHref}>
              <Button size="sm" variant="glass" className="mt-1 bg-white text-foreground hover:opacity-90">{current.ctaLabel}</Button>
            </a>
          ) : (
            <Button size="sm" variant="glass" onClick={current.onCtaClick} className="mt-1 bg-white text-foreground hover:opacity-90">{current.ctaLabel}</Button>
          )
        )}
      </div>
      {validSlides.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {validSlides.map((_, i) => (
            <span key={i} className={cn("w-1.5 h-1.5 rounded-full", i === index ? "bg-white" : "bg-white/50")} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SlideshowBanner;
