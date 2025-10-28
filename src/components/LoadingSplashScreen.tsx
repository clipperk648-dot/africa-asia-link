import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LoadingSplashScreenProps {
  videoUrl: string;
  text?: string;
  isVisible: boolean;
  onVideoEnd?: () => void;
  className?: string;
}

const LoadingSplashScreen: React.FC<LoadingSplashScreenProps> = ({
  videoUrl,
  text = "Loading collection",
  isVisible,
  onVideoEnd,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isVisible || !videoRef.current) return;

    const video = videoRef.current;

    const handleEnded = () => {
      onVideoEnd?.();
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [isVisible, onVideoEnd]);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-[999] flex items-center justify-center overflow-hidden",
      "transition-opacity duration-500",
      isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      className
    )}>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg animate-fade-in">
            {text}
          </h1>
          
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" style={{ animationDelay: "0s" }} />
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" style={{ animationDelay: "0.2s" }} />
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-white/20" />
            <div
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-white border-r-white animate-spin"
              style={{ animationDuration: "2s" }}
            />
            <div
              className="absolute inset-2 rounded-full border-4 border-transparent border-b-white border-l-white animate-spin"
              style={{ animationDuration: "3s", animationDirection: "reverse" }}
            />
          </div>
        </div>

        <p className="text-white/80 text-sm drop-shadow-lg">
          Preparing your showcase...
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoadingSplashScreen;
