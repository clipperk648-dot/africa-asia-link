import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Image as ImageIcon, Video as VideoIcon, Send } from "lucide-react";

interface Msg { id: string; from: "me" | "them"; text?: string; mediaUrl?: string; time: string }
interface Conversation { id: string; name: string; avatar: string; online: boolean; }

const storageKey = (id: string) => `chat:conv:${id}`;
const loadMessages = (id: string): Msg[] => {
  try { const raw = localStorage.getItem(storageKey(id)); return raw ? JSON.parse(raw) as Msg[] : []; } catch { return []; }
};
const saveMessages = (id: string, msgs: Msg[]) => localStorage.setItem(storageKey(id), JSON.stringify(msgs));

const Chat = () => {
  const { id = "1" } = useParams();
  const navigate = useNavigate();
  const convo: Conversation = useMemo(() => ({
    id,
    name: "Conversation Partner",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
    online: true,
  }), [id]);
  const [draft, setDraft] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>(() => loadMessages(convo.id));
  const [file, setFile] = useState<File | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMsgs(loadMessages(convo.id)); }, [convo.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file);
  });

  const send = async () => {
    if (!draft.trim() && !file) return;
    let mediaUrl: string | undefined;
    if (file) mediaUrl = await toDataUrl(file);
    const next: Msg = { id: crypto.randomUUID(), from: "me", text: draft.trim() || undefined, mediaUrl, time: new Date().toLocaleTimeString() };
    const updated = [...msgs, next];
    setMsgs(updated); saveMessages(convo.id, updated);
    setDraft(""); setFile(null);
    // Simulate reply
    setTimeout(() => {
      const reply: Msg = { id: crypto.randomUUID(), from: "them", text: "Got it!", time: new Date().toLocaleTimeString() };
      const upd = [...updated, reply]; setMsgs(upd); saveMessages(convo.id, upd);
    }, 800);
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/social")}> <ArrowLeft className="w-5 h-5" /> </Button>
          <div className="relative">
            <img src={convo.avatar} className="w-9 h-9 rounded-full" />
            {convo.online && <span className="absolute right-0 bottom-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />}
          </div>
          <div className="flex-1">
            <div className="font-semibold leading-tight">{convo.name}</div>
            <div className="text-xs text-muted-foreground">Online now</div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-2xl px-3 py-2 max-w-[75%] ${m.from === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {m.mediaUrl && (String(m.mediaUrl).startsWith('data:video') ? (
                <video src={m.mediaUrl} controls className="rounded-lg max-h-64 w-full mb-2" />
              ) : (
                <img src={m.mediaUrl} className="rounded-lg max-h-64 w-full mb-2" />
              ))}
              {m.text && <div className="whitespace-pre-wrap text-sm">{m.text}</div>}
              <div className={`text-[10px] mt-1 ${m.from === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{m.time}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border/50" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="max-w-3xl mx-auto p-3 flex items-end gap-2">
          <label className="inline-flex items-center gap-1 text-muted-foreground cursor-pointer p-2 hover:text-foreground">
            <ImageIcon className="w-5 h-5" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <label className="inline-flex items-center gap-1 text-muted-foreground cursor-pointer p-2 hover:text-foreground">
            <VideoIcon className="w-5 h-5" />
            <input type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a message…" className="flex-1 resize-none min-h-10" />
          <Button onClick={send} className="self-stretch">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
