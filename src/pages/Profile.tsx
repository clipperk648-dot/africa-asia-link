import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { useSocialPosts } from "@/hooks/useData";
import { Button } from "@/components/ui/button";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, MoreVertical, Grid, Film, Bookmark, Repeat2 } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const username = user?.email?.split("@")[0] || "user";
  const { data: posts = [], isLoading, error } = useSocialPosts(20);

  const videos = useMemo(() => posts.filter((_, i) => i % 3 === 0), [posts]);
  const saved = useMemo(() => posts.filter((_, i) => i % 2 === 0), [posts]);
  const reposts = useMemo(() => posts.filter((_, i) => i % 3 === 1), [posts]);

  type Tab = "posts" | "videos" | "saved" | "reposts";
  const [active, setActive] = useState<Tab>("posts");

  const activeItems = active === "posts" ? posts : active === "videos" ? videos : active === "saved" ? saved : reposts;

  return (
    <div className="min-h-screen pb-4 relative">
      <ThreeBackground />

      {/* Header */}
      <header className="backdrop-blur-xl bg-card/30 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-3 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold">{username}</h1>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-6">
        {/* Profile Info */}
        <section className="flex items-center gap-6">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`}
            alt="Profile"
            className="w-24 h-24 rounded-full border border-border/50"
          />
          <div className="flex-1 grid grid-cols-3 text-center">
            <div>
              <p className="text-lg font-bold">{posts.length}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="text-lg font-bold">1.2k</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="text-lg font-bold">180</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </div>
        </section>

        {/* Bio */}
        <section className="space-y-1">
          <p className="font-semibold">{username}</p>
          <p className="text-sm text-muted-foreground">Trade enthusiast. Building bridges between markets.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">Edit profile</Button>
            <Button variant="outline" size="sm" className="flex-1">Share profile</Button>
          </div>
        </section>

        {/* Tabs */}
        <section>
          <div className="flex items-center justify-around border-t border-b border-border/50">
            <button onClick={() => setActive("posts")} className={`flex items-center gap-2 py-3 px-4 text-xs font-medium ${active === 'posts' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
              <Grid className="w-4 h-4" /> Posts
            </button>
            <button onClick={() => setActive("videos")} className={`flex items-center gap-2 py-3 px-4 text-xs font-medium ${active === 'videos' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
              <Film className="w-4 h-4" /> Videos
            </button>
            <button onClick={() => setActive("saved")} className={`flex items-center gap-2 py-3 px-4 text-xs font-medium ${active === 'saved' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
              <Bookmark className="w-4 h-4" /> Saved
            </button>
            <button onClick={() => setActive("reposts")} className={`flex items-center gap-2 py-3 px-4 text-xs font-medium ${active === 'reposts' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
              <Repeat2 className="w-4 h-4" /> Reposts
            </button>
          </div>
        </section>

        {/* Content Grid */}
        <section>
          <div className="grid grid-cols-3 gap-0.5">
            {activeItems.map((item) => (
              <button key={item.id} className="relative group">
                <img src={item.image} alt="Post" className="aspect-square w-full object-cover" />
                {active === 'videos' && (
                  <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1 rounded">VIDEO</div>
                )}
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;
