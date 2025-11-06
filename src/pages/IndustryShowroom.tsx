import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import FooterNav from "@/components/FooterNav";
import { getShowroomItems, removeShowroomItem, clearShowroom } from "@/utils/showroom";
import { getThemeBgVideoUrl } from "@/utils/theme";

const IndustryShowroom = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(getShowroomItems());

  const bgVideo = useMemo(() => getThemeBgVideoUrl() || "https://cdn.builder.io/o/assets%2Fc706eebe18b442a3aa75b1244fbbcf66%2F1aaeb9f83cf44d02b2bcd9d5ecf85454?alt=media&token=603a98f3-0dff-4e9a-a40d-2b060c925d1d&apiKey=c706eebe18b442a3aa75b1244fbbcf66", []);

  const handleRemove = (id: string) => {
    removeShowroomItem(id);
    setItems(getShowroomItems());
  };

  const handleClear = () => {
    clearShowroom();
    setItems(getShowroomItems());
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <video className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline>
        <source src={bgVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40 z-10" />
      <ThreeBackground />

      <header className="absolute top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-3 py-1 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Showroom</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/industry/collections')}>Collections</Button>
            <Button variant="destructive" size="sm" onClick={handleClear}>Clear All</Button>
          </div>
        </div>
      </header>

      <main className="relative z-20 max-w-3xl mx-auto px-3 pt-14 pb-24">
        {items.length === 0 ? (
          <div className="text-center text-white/90 py-12">No saved collections yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="relative rounded-xl overflow-hidden border border-white/20 bg-black/40">
                <video className="w-full h-56 object-cover" src={item.videoUrl} autoPlay muted loop playsInline />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <Button variant="destructive" size="icon" onClick={() => handleRemove(item.id)} aria-label="Remove">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryShowroom;
