import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Send, Users } from "lucide-react";
import { getSafeAvatarUrl } from "@/utils/imageOptimization";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

const ClusterChat = () => {
  const navigate = useNavigate();
  const { clusterId } = useParams<{ clusterId: string }>();
  const user = getCurrentUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", senderId: "user1", senderName: "Alice", content: "Hey everyone! Excited about this cluster!", timestamp: new Date().toISOString() },
    { id: "2", senderId: "user2", senderName: "Bob", content: "Same here! Great product selection.", timestamp: new Date().toISOString() },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: user?.id || "unknown",
      senderName: user?.name || "You",
      content: message,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/cluster/${clusterId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold">Cluster Chat</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" />
                12 members active
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <GlassCard key={msg.id} className={`p-4 ${msg.senderId === user?.id ? "bg-primary/10 border-primary/20 ml-8" : "bg-card/50 border-border/50 mr-8"}`}>
              <div className="flex items-start gap-3">
                <img
                  src={getSafeAvatarUrl(msg.senderName)}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full"
                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{msg.senderName}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-muted/50 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button size="icon" className="rounded-full" onClick={handleSend}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default ClusterChat;