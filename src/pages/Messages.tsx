import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Edit, MoreVertical } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";

const Messages = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);

  return (
    <div className="min-h-screen pb-20 relative">
      <ThreeBackground />

      {/* Header */}
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-3 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => { if (window.history.length > 1) navigate(-1); else navigate('/buyer'); }}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
              <h1 className="text-2xl font-bold">Messages</h1>
            </div>
            <Button variant="ghost" size="icon">
              <Edit className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-3xl mx-auto px-4 py-3 bg-background/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-none"
          />
        </div>
      </div>

      {/* Conversations List */}
      <main className="max-w-3xl mx-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">No Chat</p>
              <p className="text-sm text-muted-foreground">No conversations yet. Start a new chat!</p>
            </div>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b border-border/50 transition-colors"
              onClick={() => navigate(`/messages/${conversation.id}`)}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-14 h-14 rounded-full"
                />
                {conversation.online && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold truncate">{conversation.name}</p>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {conversation.timestamp}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                  {conversation.unread > 0 && (
                    <span className="flex-shrink-0 ml-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Messages;
