import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Bot, Send, ArrowLeft, Search, MessageSquare, Plus } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface ChatMessage {
  id: string;
  sender_id: string;
  recipient_id?: string;
  text: string;
  created_at: string;
  sender_role?: string;
}

interface ChatUser {
  sender_id: string;
  text: string;
  created_at: string;
  profiles: {
    name: string;
    email: string;
  };
}

const SupportChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [usersWithChats, setUsersWithChats] = useState<ChatUser[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.role === 'admin';

  const fetchChatUsers = useCallback(async () => {
    const { data } = await supabase
      .from('support_messages')
      .select('sender_id, text, created_at, profiles:sender_id(name, email)')
      .order('created_at', { ascending: false });
    
    if (data) {
      const uniqueUsers: ChatUser[] = [];
      const seenIds = new Set();
      
      data.forEach((item: any) => {
        if (!seenIds.has(item.sender_id) && item.sender_id !== user?.id) {
          seenIds.add(item.sender_id);
          uniqueUsers.push(item as ChatUser);
        }
      });
      
      setUsersWithChats(uniqueUsers);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (isAdmin) {
      fetchChatUsers();
    }
  }, [user, isAdmin, navigate, fetchChatUsers]);

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
      .channel(`support_${targetId}`)
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

    const recipientId = isAdmin ? activeChatUserId : null;

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

  const filteredChatUsers = usersWithChats.filter(u => 
    u.profiles?.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    u.profiles?.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const activeProfile = usersWithChats.find(u => u.sender_id === activeChatUserId)?.profiles;

  const ChatWindow = (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-130px)]">
      <header className="px-4 py-3 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setActiveChatUserId(null)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <Avatar className="h-8 w-8 border border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary text-xs uppercase font-bold">
              {isAdmin ? (activeProfile?.name?.substring(0, 2) || "??") : "AI"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-bold text-white">
              {isAdmin ? (activeProfile?.name || "Chat User") : "TradeLink Support"}
            </h3>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Online</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && !isAdmin && (
          <div className="flex justify-start">
            <GlassCard className="bg-white/5 border-white/5 rounded-2xl px-4 py-3 max-w-[85%]">
              <p className="text-sm text-white/90 leading-relaxed">
                👋 Hello! I'm your TradeLink assistant. How can I help you with your trades, clusters, or wallet today?
              </p>
            </GlassCard>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] group`}>
               <div className={`
                px-4 py-3 rounded-2xl text-sm shadow-lg
                ${m.sender_id === user?.id 
                  ? "bg-primary text-white rounded-tr-none" 
                  : "bg-white/10 text-white backdrop-blur-md border border-white/5 rounded-tl-none"}
              `}>
                <p className="leading-relaxed">{m.text}</p>
              </div>
              <p className={`text-[9px] text-muted-foreground mt-1 px-1 ${m.sender_id === user?.id ? "text-right" : "text-left"}`}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </main>

      <footer className="p-4 bg-white/5 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your message..."
            className="flex-1 bg-background/50 border-white/10 rounded-full h-11 px-6 focus:ring-primary"
          />
          <Button 
            onClick={send} 
            size="icon"
            className="rounded-full h-11 w-11 shadow-lg shadow-primary/20 bg-primary shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </footer>
    </div>
  );

  if (isAdmin) {
    return (
      <AdminLayout>
        <div className="flex h-full overflow-hidden bg-background/20 backdrop-blur-sm">
          {/* Sidebar for Users */}
          <aside className={`
            ${activeChatUserId ? 'hidden md:flex' : 'flex'} 
            flex-col w-full md:w-80 border-r border-white/5 bg-black/20
          `}>
            <div className="p-4 border-b border-white/5 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Support Inbox
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search chats..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10 h-10 bg-background/30 border-white/10 text-xs"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredChatUsers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className="text-sm">No conversations found.</p>
                </div>
              ) : (
                filteredChatUsers.map(chatUser => (
                  <div 
                    key={chatUser.sender_id} 
                    className={`
                      p-4 cursor-pointer transition-all border-b border-white/5
                      ${activeChatUserId === chatUser.sender_id 
                        ? 'bg-primary/10 border-r-2 border-r-primary' 
                        : 'hover:bg-white/5'}
                    `}
                    onClick={() => setActiveChatUserId(chatUser.sender_id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarFallback className="bg-white/5 text-xs">
                          {chatUser.profiles?.name?.substring(0, 2) || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-white truncate">{chatUser.profiles?.name || "Unknown"}</p>
                          <span className="text-[9px] text-muted-foreground uppercase">{new Date(chatUser.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{chatUser.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Main Chat Area */}
          <div className="flex-1 relative">
            {activeChatUserId ? (
              ChatWindow
            ) : (
              <div className="hidden md:flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Support Dashboard</h2>
                  <p className="text-muted-foreground max-w-sm mt-2">
                    Select a conversation from the left to start assisting users.
                  </p>
                </div>
                <Button variant="outline" className="rounded-full border-white/10" onClick={() => setUserSearchTerm("")}>
                   Refresh Inbox
                </Button>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col font-sans">
      <ThreeBackground />
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full relative z-10 p-4 pt-8 md:pt-12">
        <GlassCard className="flex-1 flex flex-col overflow-hidden border-white/10 shadow-2xl">
          {ChatWindow}
        </GlassCard>
        <div className="mt-4 flex justify-center">
           <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-white">
             <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
           </Button>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default SupportChat;
