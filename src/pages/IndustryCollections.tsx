import { useEffect } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import ThreeModelFrame from "@/components/ThreeModelFrame";

const IndustryCollections = () => {
  const navigate = useNavigate();

  const frames = [
    {
      id: "bike",
      modelUrl:
        "https://cdn.builder.io/o/assets%2F938a9cb6c5f8418ebb61c467931bd555%2F1fb49eb151e24a13a84591a0fccc7fa1?alt=media&token=4a8cf418-fe40-411c-afd1-243dd69e4d60&apiKey=938a9cb6c5f8418ebb61c467931bd555",
    },
    {
      id: "shoe",
      modelUrl:
        "https://cdn.builder.io/o/assets%2F938a9cb6c5f8418ebb61c467931bd555%2F12bb3c28b42c43608bb7d6ca23fc6f3c?alt=media&token=0f9347c7-2859-4bb9-a8ac-1d503bb77b74&apiKey=938a9cb6c5f8418ebb61c467931bd555",
    },
    {
      id: "empty",
      modelUrl: "",
    },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  const goNext = () => {
    const el = scrollRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const curr = Math.round(el.scrollTop / h);
    const next = Math.min(frames.length - 1, curr + 1);
    el.scrollTo({ top: next * h, behavior: "smooth" });
  };

  const goPrev = () => {
    const el = scrollRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const curr = Math.round(el.scrollTop / h);
    const prev = Math.max(0, curr - 1);
    el.scrollTo({ top: prev * h, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThreeBackground />

      <header className="absolute top-0 left-0 right-0 z-40 bg-card/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">3D Collections</h1>
        </div>
      </header>

      <div ref={scrollRef} className="snap-y snap-mandatory h-screen overflow-y-scroll scrollbar-hide">
        {frames.map((f, idx) => (
          <div key={f.id} className="snap-start h-screen relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-[92vh] max-h-[92vh] aspect-[9/16] rounded-2xl overflow-hidden shadow-xl z-20 border border-black/10 bg-white">
                <ThreeModelFrame
                  modelUrl={f.modelUrl}
                  className="w-full h-full"
                  heightClassName="h-full"
                />
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs">
                  Frame {idx + 1} / {frames.length}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        <Button variant="gradient" onClick={goNext}>Next</Button>
      </div>

      {/* Up/Down arrows for frame navigation */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        <Button size="icon" variant="secondary" onClick={goPrev} aria-label="Previous frame">
          <ChevronUp className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="secondary" onClick={goNext} aria-label="Next frame">
          <ChevronDown className="w-5 h-5" />
        </Button>
      </div>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryCollections;
