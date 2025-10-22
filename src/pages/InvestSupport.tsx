import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import GlassCard from "@/components/GlassCard";
import { ArrowLeft, MessageCircle, Mail, Phone, Clock, HelpCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const InvestSupport = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmitTicket = () => {
    if (!name || !email || !subject || !message) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Support ticket submitted! We'll respond within 24 hours.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  const faqTopics = [
    {
      id: "getting-started",
      title: "Getting Started",
      questions: [
        { q: "How do I create an investment account?", a: "Navigate to the login page and select your role (seller/buyer). All credentials are accepted for the demo." },
        { q: "How do I deposit funds?", a: "Go to the Investment page and click 'Deposit'. Enter the amount and confirm to add funds to your wallet." },
        { q: "What are investment projects?", a: "Investment projects are fundraising campaigns created by users where investors can contribute funds in exchange for expected returns." },
      ],
    },
    {
      id: "investing",
      title: "Investing",
      questions: [
        { q: "How do I invest in a project?", a: "Browse available opportunities on the Investment page, select a project, and click 'Invest' to specify your investment amount." },
        { q: "What does risk level mean?", a: "Risk levels (Low/Medium/High) indicate the expected volatility and potential challenges of an investment project." },
        { q: "How are returns calculated?", a: "Expected returns are calculated as: Investment Amount × Return Percentage ÷ 100." },
      ],
    },
    {
      id: "campaigns",
      title: "Creating Campaigns",
      questions: [
        { q: "How do I create a fundraising campaign?", a: "Go to the 'Create Campaign' tab on the Investment page, fill in project details, and submit for approval." },
        { q: "What should I include in my pitch?", a: "Include your project title, clear description, target amount, expected return percentage, duration, and risk level." },
        { q: "How long until my campaign is approved?", a: "Campaigns are manually reviewed and typically approved within 1-2 business days." },
      ],
    },
    {
      id: "transactions",
      title: "Transactions & Withdrawals",
      questions: [
        { q: "How do I withdraw funds?", a: "Click 'Withdraw' on the Investment page, enter the amount, and confirm. Funds are typically processed within 2-3 business days." },
        { q: "Are there withdrawal fees?", a: "No withdrawal fees are charged on this platform." },
        { q: "Can I see my transaction history?", a: "Yes, check the 'History' section in the investment footer menu to see all your transactions." },
      ],
    },
  ];

  return (
    <div className="min-h-screen pb-32 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/invest")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Support & Help</h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Contact Options */}
        <div className="grid md:grid-cols-3 gap-4">
          <GlassCard className="p-6 text-center">
            <Mail className="w-8 h-8 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-2">Email</h3>
            <p className="text-sm text-muted-foreground">support@echina.investment</p>
            <p className="text-xs text-muted-foreground mt-2">24-48 hour response</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <MessageCircle className="w-8 h-8 mx-auto mb-3 text-accent" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Available 9 AM - 6 PM (NGT)</p>
            <p className="text-xs text-muted-foreground mt-2">Instant support</p>
          </GlassCard>

          <GlassCard className="p-6 text-center">
            <Phone className="w-8 h-8 mx-auto mb-3 text-secondary" />
            <h3 className="font-semibold mb-2">Phone</h3>
            <p className="text-sm text-muted-foreground">+234 (0) 800 123 4567</p>
            <p className="text-xs text-muted-foreground mt-2">Monday - Friday</p>
          </GlassCard>
        </div>

        {/* FAQ Section */}
        <GlassCard className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqTopics.map((topic) => (
              <GlassCard key={topic.id} className="p-4">
                <button
                  onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                  className="w-full text-left font-semibold flex items-center justify-between hover:text-primary transition-colors"
                >
                  {topic.title}
                  <span className={`transform transition-transform ${selectedTopic === topic.id ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {selectedTopic === topic.id && (
                  <div className="mt-4 space-y-4 border-t pt-4">
                    {topic.questions.map((qa, idx) => (
                      <div key={idx} className="text-sm">
                        <p className="font-medium text-primary mb-1">{qa.q}</p>
                        <p className="text-muted-foreground">{qa.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </GlassCard>

        {/* Contact Form */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmitTicket(); }}>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Your Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              placeholder="Describe your issue or question..."
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button variant="gradient" onClick={handleSubmitTicket} className="w-full">
              Submit Support Ticket
            </Button>
          </form>
        </GlassCard>

        {/* Service Hours */}
        <GlassCard className="p-6 flex items-start gap-4">
          <Clock className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold mb-2">Business Hours</h3>
            <p className="text-sm text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM (NGT)</p>
            <p className="text-sm text-muted-foreground">Saturday - Sunday: Closed</p>
            <p className="text-sm text-muted-foreground mt-2">Holidays: Available for urgent issues only</p>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default InvestSupport;
