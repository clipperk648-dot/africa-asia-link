import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { getCurrentUser } from "@/utils/mockAuth";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";

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
  riskLevel?: "low" | "medium" | "high";
  verified?: boolean;
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
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("medium");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "industry") {
      navigate("/invest");
      return;
    }
  }, [user?.id]);

  const handleAddDocument = useCallback(() => {
    if (!newDoc.trim()) {
      toast.error("Enter a document title");
      return;
    }
    setDocuments([...documents, newDoc]);
    setNewDoc("");
    toast.success("Document added");
  }, [newDoc, documents]);

  const handleRemoveDocument = useCallback((index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  }, [documents]);

  const validateStep = (): boolean => {
    if (step === 1) {
      if (!title || !shortDesc || !category) {
        toast.error("Fill all fields");
        return false;
      }
      if (title.length < 5) {
        toast.error("Title must be 5+ characters");
        return false;
      }
    } else if (step === 2) {
      if (!description || !targetAmount) {
        toast.error("Fill all fields");
        return false;
      }
      if (Number(targetAmount) <= 0) {
        toast.error("Target must be > 0");
        return false;
      }
      if (Number(returnPercent) < 0 || Number(returnPercent) > 100) {
        toast.error("Return % between 0-100");
        return false;
      }
      if (Number(durationMonths) < 1) {
        toast.error("Duration ≥ 1 month");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = useCallback(async () => {
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
        riskLevel,
        verified: false,
      };

      projects.push(newProject);
      saveProjects(projects);

      toast.success("Campaign submitted! ✨");
      setTimeout(() => {
        navigate("/invest");
      }, 1200);
    } catch {
      toast.error("Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, targetAmount, returnPercent, durationMonths, category, image, pitchUrl, documents, riskLevel, user?.id, navigate]);

  const handleGoBack = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/invest");
    }
  }, [step, navigate]);

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={handleGoBack} className="flex-shrink-0" aria-label="Go back">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <h1 className="text-sm sm:text-lg font-bold truncate">Create Campaign</h1>
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap flex-shrink-0">
            Step {step}/3
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6">
        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 sm:h-2 flex-1 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {/* Step 1: Basic */}
        {step === 1 && (
          <GlassCard className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold">Basic Information</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">About your business</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 block">Campaign Title *</label>
                <Input
                  placeholder="e.g., AI E-commerce Platform"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 block">Description *</label>
                <Input
                  placeholder="One-line description"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="bg-background/50 text-xs sm:text-sm"
                  maxLength={100}
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{shortDesc.length}/100</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1.5 block">Category *</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-background/50 text-xs sm:text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1.5 block">Risk Level</label>
                  <select className="w-full px-3 py-2 border border-border rounded-lg bg-background/50 text-xs sm:text-sm" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value as any)}>
                    <option value="low">Low Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="high">High Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 block">Image URL</label>
                <Input placeholder="https://..." value={image} onChange={(e) => setImage(e.target.value)} className="bg-background/50 text-xs sm:text-sm" />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 text-xs sm:text-sm" onClick={() => navigate("/invest")}>
                Cancel
              </Button>
              <Button variant="gradient" className="flex-1 text-xs sm:text-sm" onClick={() => validateStep() && setStep(2)}>
                Next
              </Button>
            </div>
          </GlassCard>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <GlassCard className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold">Campaign Details</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Funding & terms</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-xs sm:text-sm font-medium mb-1.5 block">Full Description *</label>
                <Textarea
                  placeholder="Your business, problem, solution, use of funds..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-background/50 min-h-[100px] sm:min-h-[120px] text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1.5 block">Target Amount (₦) *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="bg-background/50 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1.5 block">Expected Return (%) *</label>
                  <Input type="number" placeholder="e.g., 15" value={returnPercent} onChange={(e) => setReturnPercent(e.target.value)} className="bg-background/50 text-xs sm:text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1.5 block">Duration (Months) *</label>
                  <Input
                    type="number"
                    placeholder="e.g., 12"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    className="bg-background/50 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1.5 block">Pitch Video URL</label>
                  <Input placeholder="YouTube/Vimeo URL" value={pitchUrl} onChange={(e) => setPitchUrl(e.target.value)} className="bg-background/50 text-xs sm:text-sm" />
                </div>
              </div>

              {targetAmount && (
                <GlassCard className="p-3 sm:p-4 bg-primary/10 border-primary/30">
                  <p className="text-[11px] sm:text-sm">
                    <span className="font-semibold">Target:</span> {format(Number(targetAmount))}
                  </p>
                  <p className="text-[11px] sm:text-sm mt-1">
                    <span className="font-semibold">Return:</span> {format(Math.round((Number(targetAmount) * Number(returnPercent)) / 100))}
                  </p>
                </GlassCard>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 text-xs sm:text-sm" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="gradient" className="flex-1 text-xs sm:text-sm" onClick={() => validateStep() && setStep(3)}>
                Next
              </Button>
            </div>
          </GlassCard>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <GlassCard className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold">Documents & Review</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Supporting docs</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1.5 block">Documents</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Business License"
                      value={newDoc}
                      onChange={(e) => setNewDoc(e.target.value)}
                      className="bg-background/50 text-xs sm:text-sm"
                      onKeyPress={(e) => e.key === "Enter" && handleAddDocument()}
                    />
                    <Button variant="outline" onClick={handleAddDocument} size="sm" className="flex-shrink-0">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>

                {documents.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium">Added ({documents.length})</p>
                    <div className="space-y-1">
                      {documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-background/50 rounded text-xs">
                          <span className="truncate">{doc}</span>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveDocument(idx)} className="flex-shrink-0 h-6 w-6">
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-medium">Summary</p>
                <GlassCard className="p-3 bg-background/50 space-y-2">
                  <div className="text-[11px] sm:text-xs">
                    <p className="text-muted-foreground">Title</p>
                    <p className="font-semibold truncate">{title}</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="text-[11px] sm:text-xs">
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-semibold">{category}</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="text-[11px] sm:text-xs">
                    <p className="text-muted-foreground">Target</p>
                    <p className="font-semibold">{format(Number(targetAmount) || 0)}</p>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="text-[11px] sm:text-xs">
                    <p className="text-muted-foreground">Returns</p>
                    <p className="font-semibold">
                      {returnPercent}% / {durationMonths}m
                    </p>
                  </div>
                </GlassCard>
              </div>
            </div>

            <GlassCard className="p-3 sm:p-4 bg-blue-500/10 border-blue-500/30 flex gap-2 sm:gap-3">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] sm:text-xs text-blue-600 leading-tight">
                <strong>Ready to submit?</strong> Reviewed within 24-48h. Approved campaigns go live immediately.
              </p>
            </GlassCard>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1 text-xs sm:text-sm" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button variant="gradient" className="flex-1 text-xs sm:text-sm" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </GlassCard>
        )}
      </main>
    </div>
  );
};

export default InvestCreate;
