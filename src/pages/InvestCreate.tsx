import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { getCurrentUser } from "@/utils/mockAuth";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Plus, Trash2, CheckCircle } from "lucide-react";

type Project = {
  id: string;
  ownerId: string | null;
  title: string;
  description: string;
  target: number;
  funded: number;
  category?: string;
  returnPercent?: number;
  durationMonths?: number;
  status?: "pending" | "approved" | "funded";
  pitchUrl?: string;
  documents?: string[];
  createdAt?: string;
  image?: string;
};

const PROJECTS_KEY = "echina_projects_v1";

const loadProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveProjects = (items: Project[]) => localStorage.setItem(PROJECTS_KEY, JSON.stringify(items));

const format = (n: number) => `₦${n.toLocaleString()}`;

const categories = ["Technology", "Healthcare", "E-commerce", "Agriculture", "Education", "Energy", "Real Estate", "Finance", "Other"];

const InvestCreate = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [category, setCategory] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [returnPercent, setReturnPercent] = useState("10");
  const [durationMonths, setDurationMonths] = useState("12");
  const [pitchUrl, setPitchUrl] = useState("");
  const [documents, setDocuments] = useState<string[]>([]);
  const [newDoc, setNewDoc] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "industry") {
      navigate("/invest");
      return;
    }
  }, [user, navigate]);

  const handleAddDocument = () => {
    if (!newDoc.trim()) {
      toast.error("Please enter a document title");
      return;
    }
    setDocuments([...documents, newDoc]);
    setNewDoc("");
    toast.success("Document added");
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!title || !shortDesc || !category) {
        toast.error("Please fill in all basic information");
        return false;
      }
      if (title.length < 5) {
        toast.error("Title must be at least 5 characters");
        return false;
      }
    } else if (step === 2) {
      if (!description || !targetAmount) {
        toast.error("Please fill in all details");
        return false;
      }
      if (Number(targetAmount) <= 0) {
        toast.error("Target amount must be greater than 0");
        return false;
      }
      if (Number(returnPercent) < 0 || Number(returnPercent) > 100) {
        toast.error("Return percentage must be between 0 and 100");
        return false;
      }
      if (Number(durationMonths) < 1) {
        toast.error("Duration must be at least 1 month");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      const projects = loadProjects();
      const newProject: Project = {
        id: Date.now().toString(36),
        ownerId: user!.id,
        title,
        description,
        target: Number(targetAmount),
        funded: 0,
        category: category || "Other",
        returnPercent: Number(returnPercent) || 10,
        durationMonths: Number(durationMonths) || 12,
        status: "pending",
        pitchUrl: pitchUrl || undefined,
        documents,
        createdAt: new Date().toISOString(),
        image: image || undefined,
      };

      projects.push(newProject);
      saveProjects(projects);

      toast.success("Campaign submitted for approval! ✨");
      setTimeout(() => {
        navigate("/invest");
      }, 1500);
    } catch (error) {
      toast.error("Failed to submit campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/invest")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-base sm:text-lg font-bold">Create Campaign</h1>
          </div>
          <div className="text-sm text-muted-foreground">Step {step} of 3</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Progress Indicator */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-2 flex-1 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <GlassCard className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Basic Information</h2>
              <p className="text-muted-foreground">Tell us about your business and campaign</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Campaign Title *</label>
                <Input
                  placeholder="e.g., AI-Powered E-commerce Platform"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Short Description *</label>
                <Input
                  placeholder="One-line description of your business"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="bg-background/50"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">{shortDesc.length}/100</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category *</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-background/50 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Select a category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Campaign Image URL</label>
                  <Input placeholder="https://example.com/image.jpg" value={image} onChange={(e) => setImage(e.target.value)} className="bg-background/50" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/invest")}>
                Cancel
              </Button>
              <Button variant="gradient" className="flex-1" onClick={() => validateStep() && setStep(2)}>
                Next
              </Button>
            </div>
          </GlassCard>
        )}

        {/* Step 2: Campaign Details */}
        {step === 2 && (
          <GlassCard className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Campaign Details</h2>
              <p className="text-muted-foreground">Define your funding goal and investment terms</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Description *</label>
                <Textarea
                  placeholder="Describe your business, problem you're solving, and how you plan to use the funds..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background/50 min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Funding Target (₦) *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Expected Return (%) *</label>
                  <Input type="number" placeholder="e.g., 15" value={returnPercent} onChange={(e) => setReturnPercent(e.target.value)} className="bg-background/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Investment Duration (Months) *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 12"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Pitch Video URL</label>
                  <Input placeholder="YouTube or Vimeo URL" value={pitchUrl} onChange={(e) => setPitchUrl(e.target.value)} className="bg-background/50" />
                </div>
              </div>

              {targetAmount && (
                <GlassCard className="p-4 bg-primary/10 border-primary/30">
                  <p className="text-sm">
                    <span className="font-semibold">Funding Target:</span> {format(Number(targetAmount))}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-semibold">Expected Return:</span> {format(Math.round((Number(targetAmount) * Number(returnPercent)) / 100))}
                  </p>
                </GlassCard>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="gradient" className="flex-1" onClick={() => validateStep() && setStep(3)}>
                Next
              </Button>
            </div>
          </GlassCard>
        )}

        {/* Step 3: Documents & Review */}
        {step === 3 && (
          <GlassCard className="p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Documents & Review</h2>
              <p className="text-muted-foreground">Add supporting documents and review your campaign</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Supporting Documents</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Business License, Financial Projections"
                      value={newDoc}
                      onChange={(e) => setNewDoc(e.target.value)}
                      className="bg-background/50"
                      onKeyPress={(e) => e.key === "Enter" && handleAddDocument()}
                    />
                    <Button variant="outline" onClick={handleAddDocument}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Added Documents ({documents.length})</label>
                    <div className="space-y-2">
                      {documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                          <span className="text-sm">{doc}</span>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveDocument(idx)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium mb-2 block">Campaign Summary</label>
                <GlassCard className="p-4 bg-background/50 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="font-semibold">{title}</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="font-semibold">{category}</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground">Funding Target</p>
                    <p className="font-semibold">{format(Number(targetAmount))}</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground">Returns & Duration</p>
                    <p className="font-semibold">
                      {returnPercent}% over {durationMonths} months
                    </p>
                  </div>
                </GlassCard>
              </div>
            </div>

            <GlassCard className="p-4 bg-blue-500/10 border-blue-500/30 space-y-2">
              <div className="flex gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-600">Ready to submit?</p>
                  <p className="text-sm text-blue-600/80">Your campaign will be reviewed by our team within 24-48 hours. Approved campaigns will be visible to investors immediately.</p>
                </div>
              </div>
            </GlassCard>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="gradient" className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Campaign"}
              </Button>
            </div>
          </GlassCard>
        )}
      </main>
    </div>
  );
};

export default InvestCreate;
