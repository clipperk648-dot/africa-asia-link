import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockSocialPosts } from "@/utils/mockData";
import { getCurrentUser } from "@/utils/mockAuth";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreVertical,
  Plus,
  ArrowLeft,
  Search,
  Home,
} from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

const SocialFeed = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [posts, setPosts] = useState(mockSocialPosts);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: likedPosts.has(postId) ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const goBack = () => {
    if (user?.role === "industry") {
      navigate("/industry");
    } else if (user?.role === "buyer") {
      navigate("/buyer");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen pb-4 relative">
      <ThreeBackground />

      {/* Header */}
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                TradeSocial
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="gradient" size="sm">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stories Section */}
      <section className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex flex-col items-center gap-1 sm:gap-2 min-w-fit">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-primary p-1 cursor-pointer flex-shrink-0">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <span className="text-xs font-medium">Your Story</span>
          </div>
          {mockSocialPosts.slice(0, 5).map((post) => (
            <div key={post.id} className="flex flex-col items-center gap-1 sm:gap-2 min-w-fit">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-accent p-1 cursor-pointer animate-glow flex-shrink-0">
                <img
                  src={post.avatar}
                  alt={post.username}
                  className="w-full h-full rounded-full object-cover border-2 border-background"
                />
              </div>
              <span className="text-xs font-medium truncate w-16 sm:w-20 text-center">
                {post.username}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Feed */}
      <main className="max-w-3xl mx-auto px-4 space-y-4 sm:space-y-6 pb-20 sm:pb-8">
        {posts.map((post) => (
          <GlassCard key={post.id} className="p-0 overflow-hidden">
            {/* Post Header */}
            <div className="flex items-center justify-between p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <img
                  src={post.avatar}
                  alt={post.username}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm sm:text-base truncate">{post.username}</p>
                  <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Post Image */}
            <div className="relative">
              <img
                src={post.image}
                alt="Post"
                className="w-full aspect-square object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLike(post.id)}
                    className={likedPosts.has(post.id) ? "text-red-500" : ""}
                  >
                    <Heart
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill={likedPosts.has(post.id) ? "currentColor" : "none"}
                    />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon">
                  <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </div>

              {/* Likes Count */}
              <p className="font-semibold text-sm sm:text-base">{post.likes.toLocaleString()} likes</p>

              {/* Caption */}
              <div className="break-words">
                <span className="font-semibold mr-2 text-sm sm:text-base">{post.username}</span>
                <span className="text-xs sm:text-sm">{post.caption}</span>
              </div>

              {/* Comments */}
              <button className="text-xs sm:text-sm text-muted-foreground">
                View all {post.comments} comments
              </button>

              {/* Add Comment */}
              <div className="flex items-center gap-2 pt-1 sm:pt-2">
                <Input
                  placeholder="Add a comment..."
                  className="h-9 sm:h-10 bg-background/50 border-none text-sm"
                />
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  Post
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-card/80 border-t border-border/50">
        <div className="max-w-3xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-around h-14 sm:h-16">
            <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12">
              <Home className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <Button variant="gradient" size="icon" className="rounded-xl h-10 w-10 sm:h-12 sm:w-12">
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goBack} className="h-10 w-10 sm:h-12 sm:w-12">
              <img
                src={user?.role === "industry" 
                  ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Chen"
                  : "https://api.dicebear.com/7.x/avataaars/svg?seed=Lagos"}
                alt="Profile"
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full"
              />
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default SocialFeed;
