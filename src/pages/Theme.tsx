import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { getThemeBgVideoUrl, setThemeBgVideoUrl } from "@/utils/theme";
import { toast } from "@/hooks/use-toast";

const PRESETS = [
  "https://cdn.builder.io/o/assets%2Fc706eebe18b442a3aa75b1244fbbcf66%2F1aaeb9f83cf44d02b2bcd9d5ecf85454?alt=media&token=603a98f3-0dff-4e9a-a40d-2b060c925d1d&apiKey=c706eebe18b442a3aa75b1244fbbcf66",
  "https://cdn.builder.io/o/assets%2F7afe82ec80e94b858c506425dab51b31%2F0c96833d8ac746ba8f8470e123ec57ad?alt=media&token=8a70877c-77a0-4213-8746-6ef633920336&apiKey=7afe82ec80e94b858c506425dab51b31",
  "https://cdn.builder.io/o/assets%2F7afe82ec80e94b858c506425dab51b31%2Fe53db1a3d8ae4af2885ba42e3e4684e8?alt=media&token=95bb3b68-0d18-4724-b854-aac66e38f79e&apiKey=7afe82ec80e94b858c506425dab51b31",
  "https://cdn.builder.io/o/assets%2Fb6198669f4754d65b52a472eb983bf6a%2F6ab81d8bc2104d80a11be4eec42e7669?alt=media&token=25351e25-3755-4cc3-938c-769f0c5526f3&apiKey=b6198669f4754d65b52a472eb983bf6a",
];

const Theme = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    setCurrent(getThemeBgVideoUrl());
  }, []);

  const apply = (url: string) => {
    setThemeBgVideoUrl(url);
    setCurrent(url);
    toast({ title: "Theme updated", description: "Background video has been changed." });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-3 py-1 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Theme</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRESETS.map((url) => (
          <div key={url} className="relative rounded-xl overflow-hidden border border-border/50">
            <video className="w-full h-48 object-cover" src={url} autoPlay muted loop playsInline />
            <div className="p-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground truncate">{url.slice(0, 60)}...</span>
              <Button variant={current === url ? 'secondary' : 'gradient'} size="sm" onClick={() => apply(url)}>
                {current === url ? <Check className="w-4 h-4 mr-1" /> : null}
                {current === url ? 'Selected' : 'Use'}
              </Button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Theme;
