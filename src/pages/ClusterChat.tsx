import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Send, Users, PlusCircle, BarChart2 } from "lucide-react";
import { getSafeAvatarUrl } from "@/utils/imageOptimization";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  sender_id: string;
  sender_name?: string;
  content: string;
  created_at: string;
  type?: "text" | "poll";
  poll_data?: {
    question: string;
    options: { text: string; votes: number }[];
  };
}

const ClusterChat = () => {
  const navigate = useNavigate();
  const { clusterId } = useParams<{ clusterId: string }>();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showPollDialog, setShowPollDialog] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clusterId) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('cluster_messages')
        .select('*, profiles:user_id(name)')
        .eq('cluster_id', clusterId)
        .order('created_at', { ascending: true });
      
      if (data) {
        setMessages(data.map(m => ({
          ...m,
          sender_name: m.profiles?.name
        })));
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`cluster_chat_${clusterId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'cluster_messages',
        filter: `cluster_id=eq.${clusterId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clusterId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !user || !clusterId) return;
    
    const { error } = await supabase
      .from('cluster_messages')
      .insert([{
        cluster_id: clusterId,
        user_id: user.id,
        content: message,
        type: 'text',
        created_at: new Date().toISOString()
      }]);
    
    if (error) {
      toast.error("Failed to send message");
    } else {
      setMessage("");
    }
  };

  const handleCreatePoll = async () => {
    if (!pollQuestion.trim() || pollOptions.some(o => !o.trim()) || !user || !clusterId) {
      toast.error("Please fill in all poll fields");
      return;
    }

    const { error } = await supabase
      .from('cluster_messages')
      .insert([{
        cluster_id: clusterId,
        user_id: user.id,
        content: pollQuestion,
        type: 'poll',
        poll_data: {
          question: pollQuestion,
          options: pollOptions.map(o => ({ text: o, votes: 0 }))
        },
        created_at: new Date().toISOString()
      }]);
    
    if (error) {
      toast.error("Failed to create poll");
    } else {
      setShowPollDialog(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
    }
  };

  const handleVote = async (messageId: string, optionIndex: number) => {
    // In a real app, this would be a more complex update or a separate table
    toast.success("Vote recorded!");
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen pb-24 relative flex flex-col">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/cluster/${clusterId}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold">Cluster Chat</h1>
            </div>
          </div>
          {isAdmin && (
            <Dialog open={showPollDialog} onOpenChange={setShowPollDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Create Poll
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a New Poll</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="What do you want to ask?" />
                  </div>
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {pollOptions.map((opt, idx) => (
                      <Input 
                        key={idx} 
                        value={opt} 
                        onChange={e => {
                          const newOpts = [...pollOptions];
                          newOpts[idx] = e.target.value;
                          setPollOptions(newOpts);
                        }} 
                        placeholder={`Option ${idx + 1}`} 
                      />
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => setPollOptions([...pollOptions, ""])}>
                      + Add Option
                    </Button>
                  </div>
                  <Button onClick={handleCreatePoll} className="w-full">Create Poll</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 py-4 space-y-4"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${msg.sender_id === user?.id ? "order-1" : "order-2"}`}>
              <GlassCard className={`p-3 ${msg.sender_id === user?.id ? "bg-primary/10 border-primary/20" : "bg-card/50 border-border/50"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-xs">{msg.sender_name || (msg.sender_id === user?.id ? "You" : "User")}</p>
                  <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString()}</span>
                </div>
                
                {msg.type === 'poll' ? (
                  <div className="space-y-2 mt-2">
                    <p className="font-semibold text-sm">{msg.content}</p>
                    {msg.poll_data?.options.map((opt: { text: string; votes: number }, idx: number) => (
                      <Button key={idx} variant="outline" size="sm" className="w-full justify-start text-xs h-8" onClick={() => handleVote(msg.id, idx)}>
                        {opt.text}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </GlassCard>
            </div>
          </div>
        ))}
      </main>

      <div className="bg-background/80 backdrop-blur-xl border-t border-border/50 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-muted/50 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <Button size="icon" className="rounded-full h-11 w-11" onClick={handleSend}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <FooterNav dashboardType={user?.role as "buyer" | "admin" | "industry" | "sourcing-agent" || "buyer"} />
    </div>
  );
};

export default ClusterChat;
