import { useEffect, useState, useMemo, useCallback } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronUp, ChevronDown, SkipBack, SkipForward } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import LoadingSplashScreen from "@/components/LoadingSplashScreen";

const BuyerCollections = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const frames = useMemo(() => [
    { id: "collection_1", title: "Collection 1" },
    { id: "collection_2", title: "Collection 2" },
    { id: "collection_3", title: "Collection 3" },
    { id: "collection_4", title: "Collection 4" },
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

  const skipVideoBackward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 1.7);
    }
  }, []);

  const skipVideoForward = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + 1.7
      );
    }
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
          const isFirstFrame = idx === 0;
          return (
            <div key={f.id} className="snap-start h-screen relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pt-20">
                <div className="relative h-[70vh] max-h-[70vh] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl z-20 border border-black/10 bg-white">
                  {isFirstFrame ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        src="https://cdn.builder.io/o/assets%2F7afe82ec80e94b858c506425dab51b31%2F0c96833d8ac746ba8f8470e123ec57ad?alt=media&token=8a70877c-77a0-4213-8746-6ef633920336&apiKey=7afe82ec80e94b858c506425dab51b31"
                        controls={false}
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

                {isFirstFrame && (
                  <div className="flex gap-4 items-center justify-center mt-4">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={skipVideoBackward}
                      aria-label="Skip back 1.7 seconds"
                      className="rounded-full"
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={skipVideoForward}
                      aria-label="Skip forward 1.7 seconds"
                      className="rounded-full"
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
