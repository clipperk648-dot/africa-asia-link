import { useEffect, useState, useMemo, useCallback } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import ThreeModelFrame from "@/components/ThreeModelFrame";
import LoadingSplashScreen from "@/components/LoadingSplashScreen";

const IndustryCollections = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);

  const frames = useMemo(() => [
    {
      id: "bike",
      modelUrl:
        "https://cdn.builder.io/o/assets%2F938a9cb6c5f8418ebb61c467931bd555%2F1fb49eb151e24a13a84591a0fccc7fa1?alt=media&token=4a8cf418-fe40-411c-afd1-243dd69e4d60&apiKey=938a9cb6c5f8418ebb61c467931bd555",
      backgroundUrl: "https://cdn.builder.io/o/assets%2F36085b75559e427ea036d08c9cbf2ef1%2Fbd044b311b1f486a93ff95f835fe3600?alt=media&token=7f46729a-1923-4f74-958e-f373883858b7&apiKey=36085b75559e427ea036d08c9cbf2ef1",
      materialMaps: {
        color: "https://images.pexels.com/photos/3652970/pexels-photo-3652970.jpeg",
      },
    },
    {
      id: "watch",
      modelUrl: "https://cdn.builder.io/o/assets%2F36085b75559e427ea036d08c9cbf2ef1%2Fc02d54c5ea9c4b24a52a00f957502e13?alt=media&token=02f272fb-bf7c-4263-8371-1e190a291009&apiKey=36085b75559e427ea036d08c9cbf2ef1",
      materialMaps: {
        color: "https://images.pexels.com/photos/3652970/pexels-photo-3652970.jpeg",
        metalness: "https://images.pexels.com/photos/3652970/pexels-photo-3652970.jpeg",
      },
    },
    {
      id: "iphone",
      modelUrl: "https://cdn.builder.io/o/assets%2F36085b75559e427ea036d08c9cbf2ef1%2Fea03636e507d4f14a3831ad016b1ea66?alt=media&token=529f7e8f-961a-4cc3-839e-0659c80b1ea0&apiKey=36085b75559e427ea036d08c9cbf2ef1",
      materialMaps: {
        color: "https://images.pexels.com/photos/3652970/pexels-photo-3652970.jpeg",
      },
    },
    {
      id: "coke_can",
      modelUrl: "https://cdn.builder.io/o/assets%2F36085b75559e427ea036d08c9cbf2ef1%2F299ff86899294456851ac51c54d5ceed?alt=media&token=efc3a76d-837c-4ccf-8054-460e423b02b7&apiKey=36085b75559e427ea036d08c9cbf2ef1",
      backgroundUrl: "https://images.pexels.com/photos/3105242/pexels-photo-3105242.jpeg",
      materialMaps: {
        color: "https://images.pexels.com/photos/3652970/pexels-photo-3652970.jpeg",
        metalness: "https://images.pexels.com/photos/3652970/pexels-photo-3652970.jpeg",
      },
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
            <h1 className="text-xl font-bold">3D Collections</h1>
          </div>
        </header>
      )}

      <div ref={scrollRef} className="snap-y snap-mandatory h-screen overflow-y-scroll scrollbar-hide">
        {frames.map((f, idx) => {
          const isVisible = Math.abs(idx - currentFrame) <= 1;
          return (
            <div key={f.id} className="snap-start h-screen relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative h-[92vh] max-h-[92vh] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl z-20 border border-black/10 bg-white">
                  {isVisible && f.modelUrl ? (
                    <ThreeModelFrame
                      modelUrl={f.modelUrl}
                      backgroundUrl={(f as any).backgroundUrl}
                      materialMaps={(f as any).materialMaps}
                      repeat={(f as any).repeat}
                      className="w-full h-full"
                      heightClassName="h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                      <p className="text-gray-400 text-sm">No model available</p>
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs">
                    Frame {idx + 1} / {frames.length}
                  </div>
                </div>
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

      {!isLoading && <FooterNav dashboardType="industry" />}
    </div>
  );
};

export default IndustryCollections;
