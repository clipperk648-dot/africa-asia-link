import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, MessageCircle, Share2, MoreVertical, Volume2, VolumeX } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

const VideoFeed = () => {
  const navigate = useNavigate();
  const [muted, setMuted] = useState(true);
  const [likedVideos, setLikedVideos] = useState<Set<number>>(new Set());

  const videos = [
    {
      id: 1,
      username: "tech_innovator",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tech",
      thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=700&fit=crop",
      caption: "Amazing new technology showcase! 🚀",
      likes: 12500,
      comments: 234,
    },
    {
      id: 2,
      username: "creative_designer",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=creative",
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=700&fit=crop",
      caption: "Design inspiration for your next project ✨",
      likes: 8900,
      comments: 156,
    },
  ];

  const handleLike = (videoId: number) => {
    setLikedVideos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ThreeBackground />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">Videos</h1>
            <Button variant="ghost" size="icon" onClick={() => setMuted(!muted)} className="text-white">
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Video Feed */}
      <div className="snap-y snap-mandatory h-screen overflow-y-scroll scrollbar-hide">
        {videos.map((video) => (
          <div key={video.id} className="snap-start h-screen relative">
            {/* Video Thumbnail/Player */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-[85vh] max-h-[85vh] aspect-[9/16] rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                <img
                  src={video.thumbnail}
                  alt="Video"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-30">
              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-background/60 backdrop-blur-md text-white hover:bg-background/70"
                  onClick={() => handleLike(video.id)}
                >
                  <Heart
                    className="w-7 h-7"
                    fill={likedVideos.has(video.id) ? "currentColor" : "none"}
                  />
                </Button>
                <span className="text-xs font-semibold text-white">{video.likes.toLocaleString()}</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-background/60 backdrop-blur-md text-white hover:bg-background/70"
                >
                  <MessageCircle className="w-7 h-7" />
                </Button>
                <span className="text-xs font-semibold text-white">{video.comments}</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-background/60 backdrop-blur-md text-white hover:bg-background/70"
                >
                  <Share2 className="w-7 h-7" />
                </Button>
                <span className="text-xs font-semibold text-white">Share</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-background/60 backdrop-blur-md text-white hover:bg-background/70"
                >
                  <MoreVertical className="w-7 h-7" />
                </Button>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-24 left-4 right-20 z-30 text-white">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={video.avatar}
                  alt={video.username}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
                <span className="font-semibold">{video.username}</span>
                <Button
                  variant="gradient"
                  size="sm"
                  className="ml-auto shadow-lg"
                >
                  Subscribe
                </Button>
              </div>
              <p className="text-sm">{video.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoFeed;
