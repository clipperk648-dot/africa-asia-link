import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Video as VideoIcon, Type as TypeIcon, Loader2 } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { createPost } from "@/utils/social";

interface Props {
  onPosted?: (id: string) => void;
}

const SocialComposer = ({ onPosted }: Props) => {
  const [mode, setMode] = useState<"text" | "image" | "video">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const submit = async () => {
    try {
      setSubmitting(true);
      let mediaUrl: string | undefined;
      if ((mode === "image" || mode === "video") && file) {
        mediaUrl = await toDataUrl(file);
      }
      const p = await createPost({ type: mode, content: text, mediaUrl });
      setText(""); setFile(null); setMode("text");
      onPosted?.(p.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard className="p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Button size="sm" variant={mode === "text" ? "default" : "outline"} onClick={() => setMode("text")}> <TypeIcon className="w-4 h-4 mr-1" /> Text</Button>
        <Button size="sm" variant={mode === "image" ? "default" : "outline"} onClick={() => setMode("image")}> <ImageIcon className="w-4 h-4 mr-1" /> Image</Button>
        <Button size="sm" variant={mode === "video" ? "default" : "outline"} onClick={() => setMode("video")}> <VideoIcon className="w-4 h-4 mr-1" /> Video</Button>
      </div>
      <div className="space-y-3">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Share an update…" className="min-h-24" />
        {(mode === "image" || mode === "video") && (
          <input type="file" accept={mode === "image" ? "image/*" : "video/*"} onChange={onFile} />
        )}
        <div className="flex justify-end">
          <Button onClick={submit} disabled={submitting || (!text && !file)}>
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Posting…</> : "Post"}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};

export default SocialComposer;
