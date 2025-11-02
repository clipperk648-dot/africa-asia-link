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
    }, 3000);

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
        "fixed inset-0 z-[999] flex items-center justify-center overflow-hidden will-change-opacity",
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
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
      >
        <source src={videoUrl} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <style>{`
        @keyframes rollingIcon {
          0% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.05);
          }
          100% {
            transform: rotate(360deg) scale(1);
          }
        }

        @keyframes pulse-ring {
          0% {
            r: 60px;
            opacity: 1;
          }
          100% {
            r: 100px;
            opacity: 0;
          }
        }

        @keyframes float-up {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .rolling-icon {
          animation: rollingIcon 2s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
        }

        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
        }

        .float-text {
          animation: float-up 1s ease-out;
        }
      `}</style>

      <div className="relative z-10 text-center space-y-8">
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg float-text">
            {text}
          </h1>

          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg
                className="absolute inset-0 rolling-icon"
                viewBox="0 0 120 120"
                width="128"
                height="128"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="50%" stopColor="#a78bfa" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>

                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="url(#gradientStroke)"
                  strokeWidth="3"
                  opacity="0.3"
                />

                <circle
                  cx="60"
                  cy="60"
                  r="40"
                  fill="none"
                  stroke="url(#gradientStroke)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="60 150"
                  opacity="0.8"
                />

                <g transform="translate(60, 60)">
                  <path
                    d="M 0 -28 Q 20 -20, 28 0 Q 20 20, 0 28 Q -20 20, -28 0 Q -20 -20, 0 -28"
                    fill="url(#gradientStroke)"
                    opacity="0.9"
                  />
                  <circle cx="0" cy="0" r="6" fill="white" />
                </g>
              </svg>

              <svg
                className="absolute inset-0 pulse-ring"
                viewBox="0 0 120 120"
                width="128"
                height="128"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="60"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full bg-white"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-white"
            style={{ animation: "pulse 2s ease-in-out infinite 0.3s" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-white"
            style={{ animation: "pulse 2s ease-in-out infinite 0.6s" }}
          />
        </div>

        <p className="text-white/80 text-sm drop-shadow-lg font-medium float-text">
          Preparing your showcase...
        </p>
      </div>
    </div>
  );
};

export default LoadingSplashScreen;
