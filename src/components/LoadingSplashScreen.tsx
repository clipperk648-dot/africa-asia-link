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

    const handleError = () => {
      console.warn("Video failed to load, proceeding anyway");
      onVideoEnd?.();
    };

    const timeoutId = setTimeout(() => {
      console.warn("Loading timeout, proceeding to content");
      onVideoEnd?.();
    }, 10000);

    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      clearTimeout(timeoutId);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [isVisible, onVideoEnd]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[999] flex items-center justify-center overflow-hidden",
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        className
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
    </div>
  );
};

export default LoadingSplashScreen;
