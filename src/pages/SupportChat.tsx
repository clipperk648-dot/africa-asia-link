import { useEffect, useRef, useState } from "react";
import { getCurrentUser } from "@/utils/mockAuth";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Bot, Send, ArrowLeft } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

interface ChatMessage {
  id: string;
  author: "user" | "bot";
  text: string;
  time: string;
}

const SupportChat = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: "welcome",
    author: "bot",
    text: "Hi! I’m your support assistant. Ask anything about orders, products, or your wallet.",
    time: new Date().toLocaleTimeString(),
  }]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), author: "user", text, time: new Date().toLocaleTimeString() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        author: "bot",
        text: "Thanks! A human agent will review this shortly. Meanwhile, check Wallet for payments or Orders for status.",
        time: new Date().toLocaleTimeString(),
      };
      setMessages((m) => [...m, reply]);
    }, 600);
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <h1 className="text-base font-semibold">Support Assistant</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        <GlassCard className="p-4 sm:p-6">
          <div className="h-[60vh] overflow-y-auto space-y-3 pr-1">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.author === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`${m.author === "user" ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-2xl px-3 py-2 max-w-[80%] text-sm`}>
                  <p>{m.text}</p>
                  <p className="text-[10px] opacity-70 mt-1">{m.time}</p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="mt-4 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type your message..."
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={send} className="gap-1">
              <Send className="w-4 h-4" />
              Send
            </Button>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default SupportChat;
