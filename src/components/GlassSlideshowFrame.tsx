import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type GlassSlide = {
  image?: string;
  video?: string;
  title?: string;
  subtitle?: string;
};

interface GlassSlideshowFrameProps {
  slides?: GlassSlide[];
  videoUrl?: string;
  intervalMs?: number;
  className?: string;
  heightClassName?: string;
}

const GlassSlideshowFrame: React.FC<GlassSlideshowFrameProps> = ({
  slides,
  videoUrl,
  intervalMs = 3500,
  className,
  heightClassName = "h-48 sm:h-64",
}) => {
  const validSlides = useMemo(() => (slides || []).filter((s) => !!s.image || !!s.video), [slides]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (validSlides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % validSlides.length), intervalMs);
    return () => clearInterval(id);
  }, [validSlides.length, intervalMs]);

  const hasVideo = videoUrl || (validSlides.length > 0 && validSlides[0]?.video);

  if (hasVideo) {
    const video = videoUrl || validSlides[0]?.video;

    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl",
          "ring-1 ring-white/10",
          heightClassName,
          className,
        )}
      >
        {/* Animated gradient frame */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit]">
          <div className="absolute -inset-[1px] rounded-[inherit] opacity-50" style={{
            background:
              "conic-gradient(from 0deg, rgba(255,255,255,0.2), rgba(147,51,234,0.25), rgba(59,130,246,0.25), rgba(16,185,129,0.25), rgba(255,255,255,0.2))",
            filter: "blur(8px)",
          }} />
        </div>

        {/* Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={video} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/20 to-transparent" />
      </div>
    );
  }

  if (validSlides.length === 0) return null;
  const current = validSlides[index % validSlides.length];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl",
        "ring-1 ring-white/10",
        heightClassName,
        className,
      )}
    >
      {/* Animated gradient frame */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit]">
        <div className="absolute -inset-[1px] rounded-[inherit] opacity-50" style={{
          background:
            "conic-gradient(from 0deg, rgba(255,255,255,0.2), rgba(147,51,234,0.25), rgba(59,130,246,0.25), rgba(16,185,129,0.25), rgba(255,255,255,0.2))",
          filter: "blur(8px)",
        }} />
      </div>

      {/* Slides */}
      <div className="absolute inset-0">
        {validSlides.map((s, i) => (
          <img
            key={i}
            src={s.image}
            alt={s.title || s.subtitle || `slide-${i}`}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-700",
              i === index ? "opacity-100 scale-100" : "opacity-0 scale-105",
            )}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/20 to-transparent" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 h-full p-5 flex flex-col justify-end">
        {current?.title && (
          <h3 className="text-lg sm:text-2xl font-extrabold drop-shadow-lg">{current.title}</h3>
        )}
        {current?.subtitle && (
          <p className="text-xs sm:text-sm text-foreground/90 max-w-[90%] mt-1">{current.subtitle}</p>
        )}
      </div>

      {/* Dots */}
      {validSlides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {validSlides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "w-2 h-2 rounded-full bg-white/60",
                i === index && "bg-white shadow-[0_0_0_3px_rgba(255,255,255,0.25)]",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GlassSlideshowFrame;
