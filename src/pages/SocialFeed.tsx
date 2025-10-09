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
      <section className="max-w-3xl mx-auto px-4 py-3 sm:py-4 bg-background/50">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex flex-col items-center gap-1.5 min-w-fit">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center cursor-pointer flex-shrink-0 border-2 border-border">
              <Plus className="w-7 h-7 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium">Your Story</span>
          </div>
          {mockSocialPosts.slice(0, 5).map((post) => (
            <div key={post.id} className="flex flex-col items-center gap-1.5 min-w-fit">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-orange-500 p-0.5 cursor-pointer flex-shrink-0">
                <div className="w-full h-full rounded-full bg-background p-0.5">
                  <img
                    src={post.avatar}
                    alt={post.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs font-medium truncate w-20 text-center">
                {post.username.split('_')[0]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Feed */}
      <main className="max-w-3xl mx-auto space-y-0 pb-20">
        {posts.map((post) => (
          <div key={post.id} className="bg-background border-b border-border">
            {/* Post Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={post.avatar}
                  alt={post.username}
                  className="w-9 h-9 rounded-full flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{post.username}</p>
                  <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0 h-8 w-8">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Post Image */}
            <div className="relative w-full">
              <img
                src={post.image}
                alt="Post"
                className="w-full aspect-square object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleLike(post.id)}
                    className={`h-9 w-9 ${likedPosts.has(post.id) ? "text-red-500" : ""}`}
                  >
                    <Heart
                      className="w-7 h-7"
                      fill={likedPosts.has(post.id) ? "currentColor" : "none"}
                      strokeWidth={1.5}
                    />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MessageCircle className="w-7 h-7" strokeWidth={1.5} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Send className="w-7 h-7" strokeWidth={1.5} />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Bookmark className="w-7 h-7" strokeWidth={1.5} />
                </Button>
              </div>

              {/* Likes Count */}
              <p className="font-semibold text-sm mb-2">{post.likes.toLocaleString()} likes</p>

              {/* Caption */}
              <div className="break-words mb-1">
                <span className="font-semibold mr-2 text-sm">{post.username}</span>
                <span className="text-sm">{post.caption}</span>
              </div>

              {/* Comments */}
              <button className="text-sm text-muted-foreground mb-2">
                View all {post.comments} comments
              </button>

              {/* Add Comment */}
              <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                <Input
                  placeholder="Add a comment..."
                  className="h-9 bg-transparent border-none text-sm px-0 focus-visible:ring-0"
                />
                <Button variant="ghost" size="sm" className="text-sm text-primary hover:text-primary/80">
                  Post
                </Button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-around h-16 relative">
            <Button variant="ghost" size="icon" className="h-11 w-11 text-primary">
              <Home className="w-7 h-7" fill="currentColor" />
            </Button>
            <Button variant="ghost" size="icon" className="h-11 w-11">
              <Search className="w-7 h-7" strokeWidth={1.5} />
            </Button>
            <div className="absolute left-1/2 -translate-x-1/2 -top-3">
              <Button 
                size="icon" 
                className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg"
              >
                <Plus className="w-7 h-7" />
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="h-11 w-11">
              <MessageCircle className="w-7 h-7" strokeWidth={1.5} />
            </Button>
            <Button variant="ghost" size="icon" onClick={goBack} className="h-11 w-11">
              <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md" />
              </div>
            </Button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default SocialFeed;
