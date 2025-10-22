import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { ArrowLeft, FileText, BookOpen, Video, Download, ExternalLink } from "lucide-react";

const InvestResources = () => {
  const navigate = useNavigate();

  const resources = [
    {
      category: "Guides",
      icon: BookOpen,
      items: [
        { title: "Getting Started with Investment", type: "PDF", size: "2.3 MB" },
        { title: "Risk Assessment Guide", type: "PDF", size: "1.8 MB" },
        { title: "Portfolio Diversification Strategies", type: "PDF", size: "3.1 MB" },
        { title: "How to Evaluate Projects", type: "PDF", size: "2.0 MB" },
      ],
    },
    {
      category: "Videos",
      icon: Video,
      items: [
        { title: "Investment Platform Tutorial", type: "MP4", size: "45 MB" },
        { title: "Understanding Risk Levels", type: "MP4", size: "32 MB" },
        { title: "Creating Your First Campaign", type: "MP4", size: "38 MB" },
        { title: "Withdrawal & Fund Management", type: "MP4", size: "28 MB" },
      ],
    },
    {
      category: "Documents",
      icon: FileText,
      items: [
        { title: "Terms & Conditions", type: "PDF", size: "1.2 MB" },
        { title: "Privacy Policy", type: "PDF", size: "0.8 MB" },
        { title: "Investment Agreement Template", type: "DOCX", size: "1.5 MB" },
        { title: "Tax Compliance Guide", type: "PDF", size: "2.2 MB" },
      ],
    },
  ];

  const webinars = [
    { title: "Investment Strategies for 2024", date: "March 15, 2024", time: "3:00 PM - 4:30 PM", speaker: "Mr. Oluwaseun Adebayo" },
    { title: "Risk Management 101", date: "March 22, 2024", time: "2:00 PM - 3:30 PM", speaker: "Ms. Chinaza Okonkwo" },
    { title: "Growing Your Portfolio", date: "March 29, 2024", time: "3:30 PM - 5:00 PM", speaker: "Dr. Amara Nkechi" },
    { title: "International Trade Investment", date: "April 5, 2024", time: "2:00 PM - 3:30 PM", speaker: "Prof. Hassan Ibrahim" },
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
          <h1 className="text-2xl font-bold">Learning Resources</h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Resource Categories */}
        {resources.map((category) => {
          const IconComponent = category.icon;
          return (
            <GlassCard key={category.category} className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <IconComponent className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">{category.category}</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {category.items.map((item, idx) => (
                  <div key={idx} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm leading-tight">{item.title}</h3>
                      <Download className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                    <p className="text-xs text-muted-foreground">{item.type} • {item.size}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          );
        })}

        {/* Upcoming Webinars */}
        <GlassCard className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6">Upcoming Webinars</h2>
          <div className="space-y-4">
            {webinars.map((webinar, idx) => (
              <div key={idx} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{webinar.title}</h3>
                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>📅 {webinar.date} at {webinar.time}</p>
                  <p>👤 Speaker: {webinar.speaker}</p>
                </div>
                <Button variant="outline" size="sm" className="mt-3">Register Now</Button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Learning Paths */}
        <GlassCard className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6">Recommended Learning Paths</h2>

          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Beginner Investor Path</h3>
              <ol className="space-y-2 text-sm ml-4">
                <li className="list-decimal">Getting Started with Investment (5 min read)</li>
                <li className="list-decimal">Investment Platform Tutorial (12 min video)</li>
                <li className="list-decimal">How to Evaluate Projects (8 min read)</li>
                <li className="list-decimal">Make your first investment</li>
              </ol>
              <Button variant="outline" size="sm" className="mt-4">Start Path</Button>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Risk Management Path</h3>
              <ol className="space-y-2 text-sm ml-4">
                <li className="list-decimal">Understanding Risk Levels (6 min video)</li>
                <li className="list-decimal">Risk Assessment Guide (10 min read)</li>
                <li className="list-decimal">Risk Management 101 (Webinar)</li>
                <li className="list-decimal">Create a diversified portfolio</li>
              </ol>
              <Button variant="outline" size="sm" className="mt-4">Start Path</Button>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Advanced Investor Path</h3>
              <ol className="space-y-2 text-sm ml-4">
                <li className="list-decimal">Portfolio Diversification Strategies (12 min read)</li>
                <li className="list-decimal">Growing Your Portfolio (Webinar)</li>
                <li className="list-decimal">Investment Strategies for 2024 (Webinar)</li>
                <li className="list-decimal">Monitor and optimize your portfolio</li>
              </ol>
              <Button variant="outline" size="sm" className="mt-4">Start Path</Button>
            </div>
          </div>
        </GlassCard>

        {/* Knowledge Base */}
        <GlassCard className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-4">Quick Tips</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">💡 Diversification</h3>
              <p className="text-sm text-muted-foreground">Spread your investments across different risk levels and categories to reduce overall risk.</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">📊 Start Small</h3>
              <p className="text-sm text-muted-foreground">Begin with smaller investments to understand the platform before committing larger amounts.</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">⏰ Long-term</h3>
              <p className="text-sm text-muted-foreground">The best returns come from holding investments for their full duration and reinvesting gains.</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">📋 Track Progress</h3>
              <p className="text-sm text-muted-foreground">Regularly review your analytics and activity to monitor performance and make informed decisions.</p>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default InvestResources;
