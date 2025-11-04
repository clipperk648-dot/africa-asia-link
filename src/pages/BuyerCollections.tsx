import { useEffect, useState, useMemo, useCallback } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronUp, ChevronDown, SkipBack, SkipForward, Maximize2, X } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import LoadingSplashScreen from "@/components/LoadingSplashScreen";

const BuyerCollections = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [fullscreenFrame, setFullscreenFrame] = useState<number | null>(null);
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);
  const videoRef3 = useRef<HTMLVideoElement>(null);
  const videoRef4 = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);

  const frames = useMemo(() => [
    {
      id: "collection_1",
      title: "Collection 1",
      videoUrl: "https://cdn.builder.io/o/assets%2F7afe82ec80e94b858c506425dab51b31%2F0c96833d8ac746ba8f8470e123ec57ad?alt=media&token=8a70877c-77a0-4213-8746-6ef633920336&apiKey=7afe82ec80e94b858c506425dab51b31",
      hasVideo: true,
    },
    {
      id: "collection_2",
      title: "Collection 2",
      videoUrl: "https://cdn.builder.io/o/assets%2F7afe82ec80e94b858c506425dab51b31%2Fccdd0f1ff47e4a4b8ae298baaa00d7b7?alt=media&token=9e96055e-e92d-46c9-867e-6c60173a0368&apiKey=7afe82ec80e94b858c506425dab51b31",
      hasVideo: true,
    },
    {
      id: "collection_3",
      title: "Collection 3",
      videoUrl: "https://cdn.builder.io/o/assets%2F7afe82ec80e94b858c506425dab51b31%2F5dd74dacbecf494da443c829c72a582a?alt=media&token=001f7917-e224-4ee3-a9ab-45a5f7e4206b&apiKey=7afe82ec80e94b858c506425dab51b31",
      hasVideo: true,
    },
    {
      id: "collection_4",
      title: "Collection 4",
      videoUrl: "https://cdn.builder.io/o/assets%2F7afe82ec80e94b858c506425dab51b31%2F5a9580b4a2f84dfda83978faceed0619?alt=media&token=6cb3868d-5c56-4159-96bd-78602c3edd9d&apiKey=7afe82ec80e94b858c506425dab51b31",
      hasVideo: true,
    },
  ], []);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSplashScreenEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const goNext = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const curr = Math.round(el.scrollTop / h);
    const next = Math.min(frames.length - 1, curr + 1);
    setCurrentFrame(next);
    el.scrollTo({ top: next * h, behavior: "smooth" });
  }, [frames.length]);

  const goPrev = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const curr = Math.round(el.scrollTop / h);
    const prev = Math.max(0, curr - 1);
    setCurrentFrame(prev);
    el.scrollTo({ top: prev * h, behavior: "smooth" });
  }, []);

  const getVideoRef = useCallback((frameIdx: number) => {
    if (frameIdx === 0) return videoRef1.current;
    if (frameIdx === 1) return videoRef2.current;
    if (frameIdx === 2) return videoRef3.current;
    if (frameIdx === 3) return videoRef4.current;
    return null;
  }, []);

  const skipVideoBackward = useCallback((frameIdx: number) => {
    const videoRef = getVideoRef(frameIdx);
    if (videoRef) {
      const newTime = videoRef.currentTime - 1.7;
      if (newTime < 0) {
        videoRef.currentTime = videoRef.duration + newTime;
      } else {
        videoRef.currentTime = newTime;
      }
    }
  }, [getVideoRef]);

  const skipVideoForward = useCallback((frameIdx: number) => {
    const videoRef = getVideoRef(frameIdx);
    if (videoRef) {
      videoRef.currentTime = Math.min(
        videoRef.duration,
        videoRef.currentTime + 1.7
      );
    }
  }, [getVideoRef]);

  const playFullscreenVideo = useCallback((frameIdx: number) => {
    setFullscreenFrame(frameIdx);
    setTimeout(() => {
      if (fullscreenVideoRef.current) {
        fullscreenVideoRef.current.currentTime = 0;
        fullscreenVideoRef.current.play();
      }
    }, 0);
  }, []);

  const closeFullscreen = useCallback(() => {
    if (fullscreenVideoRef.current) {
      fullscreenVideoRef.current.pause();
    }
    setFullscreenFrame(null);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <LoadingSplashScreen
        videoUrl="https://cdn.builder.io/o/assets%2Fb6198669f4754d65b52a472eb983bf6a%2F6ab81d8bc2104d80a11be4eec42e7669?alt=media&token=25351e25-3755-4cc3-938c-769f0c5526f3&apiKey=b6198669f4754d65b52a472eb983bf6a"
        text="Loading collection"
        isVisible={isLoading}
        onVideoEnd={handleSplashScreenEnd}
      />

      {!isLoading && <ThreeBackground />}

      {!isLoading && (
        <header className="absolute top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-md">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Collections</h1>
          </div>
        </header>
      )}

      <div ref={scrollRef} className="snap-y snap-mandatory h-screen overflow-y-scroll scrollbar-hide">
        {frames.map((f, idx) => {
          const hasVideo = f.hasVideo;
          const isFrame1 = idx === 0;
          const isFrame2 = idx === 1;
          const isFrame3 = idx === 2;
          return (
            <div key={f.id} className="snap-start h-screen relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pt-20">
                <div className="relative h-[70vh] max-h-[70vh] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl z-20 border border-black/10 bg-white">
                  {hasVideo ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative">
                      <video
                        ref={isFrame1 ? videoRef1 : isFrame2 ? videoRef2 : isFrame3 ? videoRef3 : null}
                        className="w-full h-full object-cover"
                        src={f.videoUrl}
                        controls={false}
                        loop
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                      <p className="text-gray-400 text-center px-6">{f.title}</p>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs">
                    Frame {idx + 1} / {frames.length}
                  </div>
                </div>

                {hasVideo && (
                  <div className="flex flex-col gap-4 items-center justify-center mt-4">
                    <div className="flex gap-4">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => skipVideoBackward(idx)}
                        aria-label="Skip back 1.7 seconds"
                        className="rounded-full"
                      >
                        <SkipBack className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => skipVideoForward(idx)}
                        aria-label="Skip forward 1.7 seconds"
                        className="rounded-full"
                      >
                        <SkipForward className="w-5 h-5" />
                      </Button>
                    </div>
                    <Button
                      variant="gradient"
                      onClick={() => playFullscreenVideo(idx)}
                      className="gap-2"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Full Display
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Video Overlay */}
      {fullscreenFrame !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <video
            ref={fullscreenVideoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={frames[fullscreenFrame]?.videoUrl}
            controls={false}
            autoPlay
            loop
            muted
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={closeFullscreen}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
            aria-label="Close fullscreen"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Floating navigation */}
      {!isLoading && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
          <Button variant="gradient" onClick={goNext} disabled={currentFrame >= frames.length - 1}>Next</Button>
        </div>
      )}

      {/* Up/Down arrows for frame navigation */}
      {!isLoading && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
          <Button size="icon" variant="secondary" onClick={goPrev} aria-label="Previous frame">
            <ChevronUp className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="secondary" onClick={goNext} aria-label="Next frame">
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>
      )}

      {!isLoading && <FooterNav dashboardType="buyer" />}
    </div>
  );
};

export default BuyerCollections;
