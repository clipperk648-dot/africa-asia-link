import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "@/utils/mockAuth";
import { useProducts } from "@/hooks/useData";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Box, RotateCw } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import GlassCard from "@/components/GlassCard";
import ThreeModelFrame from "@/components/ThreeModelFrame";

const IndustryCollections = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { data: products = [], isLoading, error } = useProducts(20, 0);

  // Auth disabled: collections page is publicly accessible

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (error) {
    return (
      <div className="min-h-screen pb-24 relative flex items-center justify-center">
        <ThreeBackground />
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Error Loading Collections</h1>
          <p className="text-muted-foreground">Unable to load products. Please ensure database is connected.</p>
        </div>
      </div>
    );
  }

  const selectedProducts = products.slice(0, 3);

  const frames = [
    {
      id: "bike",
      modelUrl:
        "https://cdn.builder.io/o/assets%2F938a9cb6c5f8418ebb61c467931bd555%2F98d65a10979c45dca46f425797185d74?alt=media&token=203528a0-4539-46e5-acd0-d8ad8100f270&apiKey=938a9cb6c5f8418ebb61c467931bd555",
    },
    {
      id: "watch",
      modelUrl: "", // need .obj/.glb/.fbx
      mtlUrl:
        "https://cdn.builder.io/o/assets%2F938a9cb6c5f8418ebb61c467931bd555%2Fda4e8a9dfde74f2a90414bf01ed210a6?alt=media&token=342aad27-c9b4-47f1-b446-5a022ada8a47&apiKey=938a9cb6c5f8418ebb61c467931bd555",
    },
    {
      id: "shoes",
      modelUrl: "", // need .obj/.glb/.fbx
      mtlUrl:
        "https://cdn.builder.io/o/assets%2F938a9cb6c5f8418ebb61c467931bd555%2F444d744573484ea49a0fd186b56e0ece?alt=media&token=277a4fc1-0163-4bfa-8c55-b7b5bcae9c34&apiKey=938a9cb6c5f8418ebb61c467931bd555",
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <ThreeBackground />

      <header className="absolute top-0 left-0 right-0 z-40 bg-black/60 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-white">3D Collections</h1>
        </div>
      </header>

      <div className="snap-y snap-mandatory h-screen overflow-y-scroll scrollbar-hide">
        {frames.map((f, idx) => (
          <div key={f.id} className="snap-start h-screen relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-[92vh] max-h-[92vh] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl z-20 border border-white/20">
                <ThreeModelFrame
                  modelUrl={f.modelUrl}
                  mtlUrl={(f as any).mtlUrl}
                  className="w-full h-full"
                  heightClassName="h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs">
                  Frame {idx + 1} / {frames.length}
                </div>
              </div>
            </div>
            <div className="absolute top-0 left-0 right-0 h-24 bg-black pointer-events-none z-10" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-black pointer-events-none z-10" />
          </div>
        ))}
      </div>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryCollections;
