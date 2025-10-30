import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Send, Users, TrendingUp, Target, Clock, Copy, Check, BarChart3, Settings } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { getSafeAvatarUrl } from "@/utils/imageOptimization";

const ClanDetails = () => {
  const navigate = useNavigate();
  const { clanId } = useParams<{ clanId: string }>();
  const user = getCurrentUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [copied, setCopied] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, userId: "user1", username: "Sarah Johnson", message: "Let's start gathering funds for this!", timestamp: "2m ago" },
    { id: 2, userId: "user2", username: "Michael Chen", message: "I'm in! Already contributed $500", timestamp: "1m ago" },
    { id: 3, userId: user?.id, username: user?.name || "You", message: "Great! Let's aim for $10,000 by next month", timestamp: "now" },
  ]);

  // Mock clan data - in real app, would fetch from API
  const clanData = {
    id: clanId || "clan-1",
    name: "Premium Electronics Collective",
    description: "A group pooling resources to get wholesale electronics at better rates",
    targetProductName: "Smart TV 55-inch 4K UHD",
    targetPrice: 15000,
    currentFunded: 8500,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    creatorId: "user1",
    creatorName: "Sarah Johnson",
    members: [
      { id: "user1", username: "Sarah Johnson", amount: 2500, joinedDate: "2024-01-15" },
      { id: "user2", username: "Michael Chen", amount: 3000, joinedDate: "2024-01-16" },
      { id: "user3", username: "Emily Davis", amount: 2000, joinedDate: "2024-01-17" },
      { id: "user4", username: "John Smith", amount: 1000, joinedDate: "2024-01-18" },
    ],
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      userId: user?.id || "current-user",
      username: user?.name || "You",
      message: messageInput,
      timestamp: "now",
    };

    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  const handleCopyInvite = () => {
    const inviteText = `Join my clan: "${clanData.name}" - Let's pool funds together! Code: ${clanData.id}`;
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getProgressPercentage = () => {
    return Math.min(100, Math.round((clanData.currentFunded / clanData.targetPrice) * 100));
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const deadlineDate = new Date(clanData.deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const progress = getProgressPercentage();
  const daysLeft = getDaysRemaining();

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/clan")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{clanData.name}</h1>
              <p className="text-sm text-muted-foreground">{clanData.members.length} members</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Clan Info Card */}
        <GlassCard className="p-6 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 border-accent/20">
          <div className="space-y-4">
            {/* Target Product */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-accent" />
                <p className="text-sm font-semibold text-muted-foreground">Target Product</p>
              </div>
              <p className="text-lg font-bold">{clanData.targetProductName}</p>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-sm font-semibold">
                  ${clanData.currentFunded.toLocaleString()} / ${clanData.targetPrice.toLocaleString()}
                </p>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{progress}% funded</p>
            </div>

            {/* Time Remaining */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Time Remaining</p>
                <p className="font-semibold">{daysLeft} days left</p>
              </div>
            </div>

            {/* Copy Invite */}
            <Button
              onClick={handleCopyInvite}
              variant="outline"
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Invite Link
                </>
              )}
            </Button>
          </div>
        </GlassCard>

        {/* Members Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Members ({clanData.members.length})</h2>
          </div>
          <div className="space-y-3">
            {clanData.members.map((member) => (
              <GlassCard key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getSafeAvatarUrl(member.username)}
                    alt={member.username}
                    className="w-10 h-10 rounded-full"
                    onError={(e) => {
                      const img = e.currentTarget;
                      img.src = "/placeholder.svg";
                    }}
                  />
                  <div>
                    <p className="font-semibold">{member.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent">${member.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    {((member.amount / clanData.targetPrice) * 100).toFixed(1)}%
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Chat Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Clan Chat</h2>
          <GlassCard className="p-4 space-y-4 h-96 flex flex-col bg-card/50 border-border/50">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.userId === user?.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.userId === user?.id
                        ? "bg-accent text-black rounded-br-none"
                        : "bg-muted/50 rounded-bl-none"
                    }`}
                  >
                    {msg.userId !== user?.id && (
                      <p className="text-xs font-semibold mb-1 opacity-75">{msg.username}</p>
                    )}
                    <p className="text-sm break-words">{msg.message}</p>
                    <p className="text-xs opacity-60 mt-1">{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="bg-background/50 border-none h-10"
              />
              <Button
                onClick={handleSendMessage}
                size="icon"
                className="bg-accent hover:bg-accent/90 text-black h-10 w-10 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Contribution History */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Recent Contributions</h2>
          </div>
          <div className="space-y-2">
            {clanData.members.map((member, idx) => (
              <GlassCard key={idx} className="p-3 flex items-center justify-between bg-card/50 border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-sm font-bold text-white">
                    {idx + 1}
                  </div>
                  <p className="text-sm font-semibold">{member.username}</p>
                </div>
                <p className="text-sm font-bold text-accent">+${member.amount.toLocaleString()}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-12 flex items-center justify-center gap-2"
            onClick={() => navigate(`/clan/${clanData.id}/analytics`)}
          >
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Button>
          <Button
            variant="outline"
            className="h-12 flex items-center justify-center gap-2"
            onClick={() => navigate(`/clan/${clanData.id}/settings`)}
          >
            <Settings className="w-4 h-4" />
            Clan Settings
          </Button>
        </div>
      </main>

      <FooterNav dashboardType="buyer" />
    </div>
  );
};

export default ClanDetails;
