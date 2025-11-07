import { useState, useMemo, memo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocialPosts } from "@/hooks/useData";
import { getCurrentUser } from "@/utils/mockAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
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
  Video,
  Menu,
  Repeat2,
  User,
  Camera,
} from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

const SocialFeed = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const { data: fetchedPosts = [], refetch } = useSocialPosts(50);
  const [posts, setPosts] = useState<any[]>([]);
  const [statusDraft, setStatusDraft] = useState("");

  useEffect(() => {
    const mapped = (fetchedPosts as any[]).map((p: any) => ({
      id: String(p.id),
      userId: String(p.user_id || p.userId || ""),
      username: `user-${String(p.user_id || p.userId || "").slice(-4)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(p.user_id || p.userId || ""))}`,
      type: (p.image_url || p.imageUrl) ? "image" : "text",
      content: p.content,
      mediaUrl: p.image_url || p.imageUrl,
      likes: (p.likes as number) || 0,
      comments: (p.comments as number) || 0,
      timestamp: p.created_at || new Date().toISOString(),
    }));
    setPosts(mapped);

    const commentSeed: Record<string, { id: string; author: string; text: string; time: string }[]> = {};
    mapped.forEach((p) => {
      commentSeed[p.id] = [];
    });
    setCommentsByPost(commentSeed);
  }, [fetchedPosts]);
  
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentsByPost, setCommentsByPost] = useState<Record<string, { id: string; author: string; text: string; time: string }[]>>({});

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

  const openComments = (postId: string) => setActivePostId(postId);
  const closeComments = () => {
    setActivePostId(null);
    setCommentDraft("");
  };

  const submitComment = () => {
    if (!activePostId || !commentDraft.trim()) return;
    setCommentsByPost((prev) => {
      const list = prev[activePostId] || [];
      return { ...prev, [activePostId]: [...list, { id: crypto.randomUUID(), author: user?.name || "you", text: commentDraft.trim(), time: "now" }] };
    });
    setPosts((prev) => prev.map((p) => (p.id === activePostId ? { ...p, comments: p.comments + 1 } : p)));
    setCommentDraft("");
  };

  const publishStatus = () => {
    if (!statusDraft.trim()) return;
    toast.success("Status published!");
    setStatusDraft("");
  };

  return (
    <div className="min-h-screen pb-4 relative">
      <ThreeBackground />

      {/* Header */}
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-2 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={goBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                TradeSocial
              </h1>
            </div>
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/video")}>
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/messages")}>
                <MessageCircle className="w-5 h-5" />
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
          {posts.slice(0, 5).map((post) => (
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

      {/* Status/Composer Section */}
      <section className="max-w-3xl mx-auto px-4 py-4 sm:py-6 bg-background/50">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "user"}`}
              alt={user?.name || "Your avatar"}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <p className="font-semibold text-sm">{user?.name || "Create a post"}</p>
              <p className="text-xs text-muted-foreground">Share what's on your mind</p>
            </div>
          </div>
          
          <Textarea
            value={statusDraft}
            onChange={(e) => setStatusDraft(e.target.value)}
            placeholder="What's happening in your business today?"
            className="min-h-20 resize-none mb-4 bg-background/50 border-border/50"
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={publishStatus} disabled={!statusDraft.trim()} variant="gradient" size="sm">
              <Send className="w-4 h-4 mr-2" />
              Post
            </Button>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-4 py-2">
        <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </div>

      {/* Posts Feed Section */}
      <main className="max-w-3xl mx-auto space-y-3 pb-20">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="rounded-full bg-muted/50 p-4 mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Be the first to share something with your network. Your posts will appear here once you start posting.
            </p>
            <Button onClick={() => navigate("/social/add")} className="mt-4" variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Create First Post
            </Button>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-background border-b border-border mb-1">
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

              {/* Media / Text */}
              {(post as any).mediaUrl ? (
                <div className="relative w-full">
                  {String((post as any).mediaUrl).startsWith("data:video") ? (
                    <video src={(post as any).mediaUrl} controls className="w-full aspect-square object-cover" />
                  ) : (
                    <img src={(post as any).mediaUrl} alt="Post" className="w-full aspect-square object-cover" loading="lazy" />
                  )}
                </div>
              ) : null}

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
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openComments(post.id)}>
                      <MessageCircle className="w-7 h-7" strokeWidth={1.5} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => toast("Reposted")}>
                      <Repeat2 className="w-7 h-7" strokeWidth={1.5} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => toast("Shared")}>
                      <Send className="w-7 h-7" strokeWidth={1.5} />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => toast("Saved")}>
                    <Bookmark className="w-7 h-7" strokeWidth={1.5} />
                  </Button>
                </div>

                {/* Likes Count */}
                <p className="font-semibold text-sm mb-2">{post.likes.toLocaleString()} likes</p>

                {/* Caption / Text */}
                <div className="break-words mb-1">
                  <span className="font-semibold mr-2 text-sm">{post.username}</span>
                  <span className="text-sm">{(post as any).content || (post as any).caption || ""}</span>
                </div>

                {/* Comments */}
                <button className="text-sm text-muted-foreground mb-2" onClick={() => openComments(post.id)}>
                  View all {post.comments} comments
                </button>

                {/* Add Comment */}
                <div className="flex items-center gap-2 pt-1 pb-4 border-t border-border/50">
                  <Button variant="ghost" size="sm" className="text-sm text-primary hover:text-primary/80 px-0" onClick={() => openComments(post.id)}>
                    Add a comment…
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="max-w-3xl mx-auto px-2">
          <div className="flex items-stretch justify-between h-14 sm:h-16 gap-1">
            <Button variant="ghost" className="flex-1 min-w-0 flex flex-col items-center gap-0.5 h-auto py-2 hover:bg-transparent text-primary">
              <Home className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" strokeWidth={0} />
              <span className="text-[10px] sm:text-xs font-medium">Home</span>
            </Button>
            <Button variant="ghost" onClick={() => navigate("/search")} className="flex-1 min-w-0 flex flex-col items-center gap-0.5 h-auto py-2 hover:bg-transparent text-muted-foreground">
              <Search className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.5} />
              <span className="text-[10px] sm:text-xs font-medium">Search</span>
            </Button>
            <Button variant="ghost" onClick={() => navigate("/social/add")} className="flex-1 min-w-0 flex flex-col items-center gap-0.5 h-auto py-2 hover:bg-transparent text-muted-foreground">
              <Plus className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2} />
              <span className="text-[10px] sm:text-xs font-medium">Add</span>
            </Button>
            <Button variant="ghost" onClick={() => navigate("/profile")} className="flex-1 min-w-0 flex flex-col items-center gap-0.5 h-auto py-2 hover:bg-transparent text-muted-foreground">
              <User className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.5} />
              <span className="text-[10px] sm:text-xs font-medium">Profile</span>
            </Button>
            <Button variant="ghost" onClick={() => navigate("/menu")} className="flex-1 min-w-0 flex flex-col items-center gap-0.5 h-auto py-2 hover:bg-transparent text-muted-foreground">
              <Menu className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.5} />
              <span className="text-[10px] sm:text-xs font-medium">Menu</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Comments Sheet */}
      <Sheet open={!!activePostId} onOpenChange={(o) => (o ? null : closeComments())}>
        <SheetContent side="bottom" className="h-[70vh] p-0">
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle>Comments</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-24 overflow-y-auto space-y-4">
            {(activePostId && commentsByPost[activePostId])?.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(c.author)}`} alt={c.author} className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm"><span className="font-semibold mr-2">{c.author}</span>{c.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.time} ago</p>
                </div>
              </div>
            ))}
            {activePostId && (!commentsByPost[activePostId] || commentsByPost[activePostId].length === 0) && (
              <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment.</p>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-3 flex items-center gap-2">
            <Textarea
              placeholder="Add a comment…"
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              className="min-h-10 h-10 resize-none"
            />
            <Button variant="gradient" size="sm" onClick={submitComment}>Post</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SocialFeed;
