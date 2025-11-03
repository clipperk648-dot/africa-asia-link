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
    }, 30000);

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
        "fixed top-0 left-0 right-0 bottom-0 z-[999] flex items-center justify-center overflow-hidden",
        isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        className
      )}
      style={{ width: "100vw", height: "100vh" }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        preload="auto"
        style={{ width: "100vw", height: "100vh" }}
        className="absolute top-0 left-0 object-cover"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .loader-spinner {
          animation: spin 2s linear infinite;
        }
      `}</style>

      {/* Loading Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="text-center space-y-6">
          {/* Round Rolling Loader */}
          <div className="flex justify-center">
            <div className="relative w-16 h-16">
              <svg
                className="loader-spinner"
                viewBox="0 0 100 100"
                width="64"
                height="64"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="spinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="50%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#spinGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="40 100"
                />
              </svg>
            </div>
          </div>

          {/* Loading Text */}
          <div className="text-white">
            <p className="text-lg font-semibold">{text}</p>
            <p className="text-sm text-white/70 mt-2">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSplashScreen;
