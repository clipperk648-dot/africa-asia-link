import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { createSocialPost } from "@/lib/db";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Image as ImageIcon, Video as VideoIcon, Loader2, X } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { toast } from "@/components/ui/sonner";

const SocialAddPost = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [mode, setMode] = useState<"text" | "image" | "video">("text");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (mode === "image" && !f.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (mode === "video" && !f.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    setFile(f);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(f);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && !file) {
      toast.error("Please add some content or a file");
      return;
    }

    setSubmitting(true);
    try {
      let mediaUrl: string | undefined;
      if (file && (mode === "image" || mode === "video")) {
        const reader = new FileReader();
        mediaUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      await createSocialPost(user.id, content.trim(), mediaUrl);

      toast.success("Post published successfully!");
      setContent("");
      setFile(null);
      setPreview(null);
      setMode("text");

      setTimeout(() => {
        navigate("/social");
      }, 1000);
    } catch (error) {
      toast.error("Failed to publish post");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-3 py-1 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/social")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create a Post</h1>
            <p className="text-sm text-muted-foreground">Share an update with your network</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <GlassCard className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Post Type</Label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMode("text");
                    clearFile();
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mode === "text"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-2">📝</div>
                  <p className="font-medium text-sm">Text</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("image");
                    clearFile();
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mode === "image"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <ImageIcon className="w-6 h-6 mb-2" />
                  <p className="font-medium text-sm">Image</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("video");
                    clearFile();
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mode === "video"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <VideoIcon className="w-6 h-6 mb-2" />
                  <p className="font-medium text-sm">Video</p>
                </button>
              </div>
            </div>

            {/* Content textarea */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-base font-semibold">
                {mode === "text" ? "Your thoughts" : "Add a caption"}
              </Label>
              <Textarea
                id="content"
                placeholder={
                  mode === "text"
                    ? "Share your thoughts with your network..."
                    : "Add a caption for your post..."
                }
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-none"
              />
              <p className="text-xs text-muted-foreground">{content.length} characters</p>
            </div>

            {/* File upload */}
            {(mode === "image" || mode === "video") && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">
                  {mode === "image" ? "Upload Image" : "Upload Video"}
                </Label>

                {/* Preview */}
                {preview && (
                  <div className="relative w-full rounded-lg overflow-hidden bg-muted/50 aspect-video flex items-center justify-center">
                    {mode === "image" ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <video src={preview} controls className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* File input */}
                <div className="relative">
                  <Input
                    type="file"
                    accept={mode === "image" ? "image/*" : "video/*"}
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="flex items-center justify-center w-full p-8 border-2 border-dashed border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors bg-muted/20"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="font-medium text-sm">
                        {file ? "Change file" : "Click to upload"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mode === "image" ? "PNG, JPG, GIF up to 10MB" : "MP4, WebM up to 100MB"}
                      </p>
                      {file && (
                        <p className="text-xs font-semibold text-primary mt-2">{file.name}</p>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/social")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={submitting || (!content.trim() && !file)}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Publish Post"
                )}
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Tips section */}
        <GlassCard className="mt-6 p-6 bg-secondary/10">
          <h3 className="font-semibold mb-3">Tips for better engagement</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✓ Write clear, engaging captions</li>
            <li>✓ Use high-quality images or videos</li>
            <li>✓ Share valuable content that helps your network</li>
            <li>✓ Respond to comments to build community</li>
          </ul>
        </GlassCard>
      </main>
    </div>
  );
};

export default SocialAddPost;
