import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import ThreeBackground from "@/components/ThreeBackground";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bot, Send } from "lucide-react";

const Support = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [messages, setMessages] = useState<{ id: string; from: "bot" | "me"; text: string }[]>([
    { id: "m1", from: "bot", text: `Hi ${user?.name || "there"}! I'm your customer service assistant. How can I help?` },
  ]);
  const [draft, setDraft] = useState("");

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: Math.random().toString(36).slice(2), from: "me", text }]);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => [...m, { id: Math.random().toString(36).slice(2), from: "bot", text: "Thanks! We received your message and will follow up shortly." }]);
    }, 500);
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold flex items-center gap-2"><Bot className="w-5 h-5" /> Customer Service</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        <GlassCard className="p-0">
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`rounded-2xl px-3 py-2 text-sm ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-3 flex items-center gap-2">
            <Input placeholder="Type your message..." value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
            <Button variant="gradient" onClick={send}><Send className="w-4 h-4" /></Button>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default Support;
