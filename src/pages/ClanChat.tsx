import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Send, Phone, Info, Plus } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { getSafeAvatarUrl } from "@/utils/imageOptimization";

interface ChatMessage {
  id: number;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  avatar: string;
}

const ClanChat = () => {
  const navigate = useNavigate();
  const { clanId } = useParams<{ clanId: string }>();
  const user = getCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const clanData = {
    id: clanId || "clan-1",
    name: "Premium Electronics Collective",
    members: 4,
    membersList: [
      { id: "user1", username: "Sarah Johnson" },
      { id: "user2", username: "Michael Chen" },
      { id: "user3", username: "Emily Davis" },
      { id: "user4", username: "John Smith" },
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      userId: "user1",
      username: "Sarah Johnson",
      message: "Hey everyone! Let's start gathering funds for this!",
      timestamp: "10:30 AM",
      avatar: getSafeAvatarUrl("Sarah Johnson"),
    },
    {
      id: 2,
      userId: "user2",
      username: "Michael Chen",
      message: "I'm in! Already contributed $500. This is going to be great! 🎉",
      timestamp: "10:32 AM",
      avatar: getSafeAvatarUrl("Michael Chen"),
    },
    {
      id: 3,
      userId: "user3",
      username: "Emily Davis",
      message: "Count me in too. How much time do we have?",
      timestamp: "10:35 AM",
      avatar: getSafeAvatarUrl("Emily Davis"),
    },
    {
      id: 4,
      userId: "user1",
      username: "Sarah Johnson",
      message: "We have about 30 days. Let's aim for $15,000 by then.",
      timestamp: "10:36 AM",
      avatar: getSafeAvatarUrl("Sarah Johnson"),
    },
    {
      id: 5,
      userId: user?.id || "current-user",
      username: user?.name || "You",
      message: "I can contribute $2000 right now! Let's do this! 💪",
      timestamp: "10:38 AM",
      avatar: getSafeAvatarUrl(user?.name || "You"),
    },
  ]);

  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    setIsLoading(true);
    const newMessage: ChatMessage = {
      id: messages.length + 1,
      userId: user?.id || "current-user",
      username: user?.name || "You",
      message: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      avatar: getSafeAvatarUrl(user?.name || "You"),
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
    inputRef.current?.focus();

    // Simulate reply
    setTimeout(() => {
      const reply: ChatMessage = {
        id: messages.length + 2,
        userId: "user1",
        username: "Sarah Johnson",
        message: "Great contribution! We're making progress! 🚀",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        avatar: getSafeAvatarUrl("Sarah Johnson"),
      };
      setMessages((prev) => [...prev, reply]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <ThreeBackground />

      {/* Header */}
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40 flex-shrink-0">
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/clan/${clanId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold truncate">{clanData.name}</h1>
              <p className="text-xs text-muted-foreground">{clanData.members} members</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="icon">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Info className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-w-0">
        {messages.map((msg, idx) => {
          const isCurrentUser = msg.userId === user?.id;
          const isFirstFromUser = idx === 0 || messages[idx - 1]?.userId !== msg.userId;
          const isLastFromUser = idx === messages.length - 1 || messages[idx + 1]?.userId !== msg.userId;

          return (
            <div
              key={msg.id}
              className={`flex gap-2 ${isCurrentUser ? "justify-end" : "justify-start"} ${isFirstFromUser ? "mt-3" : "mt-1"}`}
            >
              {!isCurrentUser && isFirstFromUser && (
                <img
                  src={msg.avatar}
                  alt={msg.username}
                  className="w-8 h-8 rounded-full flex-shrink-0 mt-1"
                  onError={(e) => {
                    const img = e.currentTarget;
                    img.src = "/placeholder.svg";
                  }}
                />
              )}
              {!isCurrentUser && !isFirstFromUser && <div className="w-8 flex-shrink-0" />}

              <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"} max-w-xs`}>
                {isFirstFromUser && !isCurrentUser && (
                  <p className="text-xs font-semibold text-muted-foreground px-3 mb-1">{msg.username}</p>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl break-words ${
                    isCurrentUser
                      ? "bg-accent text-black rounded-br-none"
                      : "bg-muted/50 text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
                {isLastFromUser && (
                  <p className="text-xs text-muted-foreground mt-1 px-3">{msg.timestamp}</p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div className="backdrop-blur-xl bg-card/80 border-t border-border/50 sticky bottom-0 z-30 flex-shrink-0 px-4 py-3">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0 h-10 w-10">
            <Plus className="w-5 h-5" />
          </Button>
          <Input
            ref={inputRef}
            placeholder="Message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 h-10 bg-muted/50 border-none rounded-full px-4"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !messageInput.trim()}
            size="icon"
            className="bg-accent hover:bg-accent/90 text-black h-10 w-10 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClanChat;
