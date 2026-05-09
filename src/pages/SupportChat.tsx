import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Bot, Send, ArrowLeft, User } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";

interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id?: string;
  text: string;
  created_at: string;
  sender_role?: string;
}

const SupportChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [usersWithChats, setUsersWithChats] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isAdmin) {
      // Fetch users who have sent support messages
      const fetchChatUsers = async () => {
        const { data, error } = await supabase
          .from('support_messages')
          .select('sender_id, profiles:sender_id(name, email)')
          .order('created_at', { ascending: false });
        
        if (data) {
          const uniqueUsers = Array.from(new Set(data.map(d => d.sender_id)))
            .map(id => data.find(d => d.sender_id === id))
            .filter(d => d?.sender_id !== user.id); // Don't show admin in the list
          setUsersWithChats(uniqueUsers);
        }
      };
      fetchChatUsers();
    }
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    if (!user) return;

    const targetId = isAdmin ? activeChatUserId : user.id;
    if (!targetId && isAdmin) return;

    const query = supabase
      .from('support_messages')
      .select('*')
      .or(`sender_id.eq.${targetId},recipient_id.eq.${targetId}`)
      .order('created_at', { ascending: true });

    query.then(({ data }) => {
      if (data) setMessages(data);
    });

    const channel = supabase
      .channel('support_chats')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_messages' 
      }, (payload) => {
        const newMessage = payload.new as ChatMessage;
        if (isAdmin) {
          if (newMessage.sender_id === activeChatUserId || newMessage.recipient_id === activeChatUserId) {
            setMessages(prev => [...prev, newMessage]);
          }
        } else {
          if (newMessage.sender_id === user.id || newMessage.recipient_id === user.id) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeChatUserId, isAdmin]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || !user) return;

    const recipientId = isAdmin ? activeChatUserId : null; // If user sends, it goes to admin (null)

    const { error } = await supabase
      .from('support_messages')
      .insert([{
        sender_id: user.id,
        recipient_id: recipientId,
        text,
        sender_role: user.role,
        created_at: new Date().toISOString()
      }]);
    
    if (error) {
      toast.error("Failed to send message");
    } else {
      setInput("");
      
      if (isAdmin && activeChatUserId) {
        // Also create a notification for the user
        await supabase.from('notifications').insert([{
          user_id: activeChatUserId,
          title: "Support Reply",
          message: text,
          type: "support",
          created_at: new Date().toISOString()
        }]);
      }
    }
  };

  return (
    <div className="min-h-screen pb-24 relative flex flex-col md:flex-row">
      <ThreeBackground />
      
      {isAdmin && !activeChatUserId ? (
        <div className="w-full max-w-md mx-auto p-4 z-10">
          <h2 className="text-2xl font-bold mb-4">Support Chats</h2>
          <div className="space-y-2">
            {usersWithChats.length === 0 ? (
              <p>No active support chats.</p>
            ) : (
              usersWithChats.map(chatUser => (
                <GlassCard 
                  key={chatUser.sender_id} 
                  className="p-4 cursor-pointer hover:bg-primary/10"
                  onClick={() => setActiveChatUserId(chatUser.sender_id)}
                >
                  <p className="font-bold">{chatUser.profiles?.name || "Unknown User"}</p>
                  <p className="text-xs text-muted-foreground">{chatUser.profiles?.email}</p>
                </GlassCard>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full relative z-10">
          <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
            <div className="px-4 py-2 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => isAdmin ? setActiveChatUserId(null) : navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                {isAdmin ? <User className="w-5 h-5 text-primary" /> : <Bot className="w-5 h-5 text-primary" />}
                <h1 className="text-base font-semibold">
                  {isAdmin ? "Chat with User" : "Support Assistant"}
                </h1>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !isAdmin && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-3 py-2 max-w-[80%] text-sm">
                  <p>Hi! I’m your support assistant. Ask anything about orders, products, or your wallet.</p>
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                <div className={`${m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"} rounded-2xl px-3 py-2 max-w-[80%] text-sm shadow-sm`}>
                  <p>{m.text}</p>
                  <p className="text-[10px] opacity-70 mt-1">
                    {new Date(m.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </main>

          <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border/50">
            <div className="flex items-center gap-2 max-w-3xl mx-auto">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type your message..."
                className="flex-1 rounded-full border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={send} className="rounded-full h-11 w-11 p-0">
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
      <FooterNav dashboardType={isAdmin ? "admin" : "buyer"} />
    </div>
  );
};

export default SupportChat;
