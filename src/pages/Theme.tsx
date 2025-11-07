import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { getThemeBgVideoUrl, setThemeBgVideoUrl, clearThemeBgVideoUrl } from "@/utils/theme";
import { toast } from "@/hooks/use-toast";

const PRESETS = [
  "https://cdn.builder.io/o/assets%2Fac04b410f62447a685d022b740662952%2F50fac8e3b60e4594a88c28d100834c2e?alt=media&token=6cd2d9a6-2c30-4170-bc75-4c3c5e211104&apiKey=ac04b410f62447a685d022b740662952",
  "https://cdn.builder.io/o/assets%2Fac04b410f62447a685d022b740662952%2Fae4e6b52283e442885ccefe25dd39758?alt=media&token=11534498-1a45-4c55-a253-99b27e1dae90&apiKey=ac04b410f62447a685d022b740662952",
  "https://cdn.builder.io/o/assets%2Fac04b410f62447a685d022b740662952%2F01598f5028244eb69218540f7a6fc822?alt=media&token=93a01ff5-eb48-4243-9029-5b8d301fda05&apiKey=ac04b410f62447a685d022b740662952",
  "https://cdn.builder.io/o/assets%2Fb6198669f4754d65b52a472eb983bf6a%2Fb3554c473a06476f92baba2aa711e8ca?alt=media&token=9bf2b170-a106-4dcb-82a2-3f3414d1a5bc&apiKey=b6198669f4754d65b52a472eb983bf6a",
  "https://cdn.builder.io/o/assets%2Fb6198669f4754d65b52a472eb983bf6a%2Fd5933165840b492795c54995b96024e2?alt=media&token=f05f925a-d40a-4789-aa7e-811cc8eac507&apiKey=b6198669f4754d65b52a472eb983bf6a",
  "https://cdn.builder.io/o/assets%2Fb6198669f4754d65b52a472eb983bf6a%2Fdcbb672a61e846be8afc792cc7b7bf5f?alt=media&token=ebfecd29-eccc-43b6-8b72-38d64465bca9&apiKey=b6198669f4754d65b52a472eb983bf6a",
  "https://cdn.builder.io/o/assets%2Fb6198669f4754d65b52a472eb983bf6a%2F5c15f36b43cf45169d8c9350f0029ff6?alt=media&token=a6793666-ee7b-48be-a393-3251844ebc7e&apiKey=b6198669f4754d65b52a472eb983bf6a",
  "https://cdn.builder.io/o/assets%2Fb6198669f4754d65b52a472eb983bf6a%2F15928048a3ae4a5ca45cdfbfb2cf59c4?alt=media&token=af07488b-afc6-49f7-90ff-b68f635ff448&apiKey=b6198669f4754d65b52a472eb983bf6a",
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
      <header className="backdrop-blur-xl bg-card/5 border-b border-border/20 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-3 py-1 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Theme</h1>
          <div className="ml-auto">
            <Button variant="outline" size="sm" onClick={() => { clearThemeBgVideoUrl(); setCurrent(null); toast({ title: 'Theme reset', description: 'Background restored to default.' }); }}>Default</Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PRESETS.map((url) => (
          <div key={url} className="relative rounded-xl overflow-hidden border border-border/50">
            <video className="w-full h-48 object-cover bg-muted" muted loop playsInline preload="metadata" crossOrigin="anonymous">
              <source src={url} type="video/mp4" />
            </video>
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
