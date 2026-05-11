import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import ThreeBackground from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Shield, Upload, CheckCircle2, AlertCircle, FileText, Camera } from "lucide-react";
import FooterNav from "@/components/FooterNav";

const IndustryKYC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    id: null,
    business_license: null,
    address_proof: null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    toast({
      title: "KYC Documents Submitted",
      description: "Our team will review your documents within 24-48 hours.",
    });
    setStep(3);
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Business Verification (KYC)</h1>
            <p className="text-sm text-muted-foreground">Complete verification to unlock all merchant features</p>
          </div>
        </div>

        {step === 1 && (
          <GlassCard className="p-6 space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Step 1: Business Information</h2>
              <p className="text-sm text-muted-foreground">Please provide your official business details.</p>
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reg_number">Business Registration Number</Label>
                <Input id="reg_number" placeholder="RC-12345678" className="bg-background/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tax_id">Tax Identification Number (TIN)</Label>
                <Input id="tax_id" placeholder="TIN-98765432" className="bg-background/50" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Business Office Address</Label>
                <Input id="address" placeholder="123 Industrial Way, Lagos" className="bg-background/50" />
              </div>
            </div>

            <Button onClick={() => setStep(2)} className="w-full">Next Step</Button>
          </GlassCard>
        )}

        {step === 2 && (
          <GlassCard className="p-6 space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Step 2: Document Upload</h2>
              <p className="text-sm text-muted-foreground">Upload clear copies of the following documents.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-xl space-y-3 bg-background/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Certificate of Incorporation</p>
                      <p className="text-[10px] text-muted-foreground">PDF, JPG or PNG (max 5MB)</p>
                    </div>
                  </div>
                  <Input 
                    type="file" 
                    id="license-upload" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, "business_license")}
                  />
                  <Label htmlFor="license-upload" className="cursor-pointer">
                    <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                      {files.business_license ? "Changed" : "Upload"}
                    </div>
                  </Label>
                </div>
                {files.business_license && (
                  <p className="text-xs text-secondary flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {files.business_license.name}
                  </p>
                )}
              </div>

              <div className="p-4 border-2 border-dashed border-muted-foreground/20 rounded-xl space-y-3 bg-background/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Camera className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Government Issued ID (Director)</p>
                      <p className="text-[10px] text-muted-foreground">Passport or Driver's License</p>
                    </div>
                  </div>
                  <Input 
                    type="file" 
                    id="id-upload" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, "id")}
                  />
                  <Label htmlFor="id-upload" className="cursor-pointer">
                    <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/20 transition-colors">
                      {files.id ? "Changed" : "Upload"}
                    </div>
                  </Label>
                </div>
                {files.id && (
                  <p className="text-xs text-secondary flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {files.id.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1"
                disabled={!files.business_license || !files.id || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Verification"}
              </Button>
            </div>
          </GlassCard>
        )}

        {step === 3 && (
          <GlassCard className="p-8 text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-secondary" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Verification In Progress</h2>
              <p className="text-muted-foreground">
                We've received your documents. Your account is currently under review.
                You can still add products, but they will be marked as "Unverified" until approval.
              </p>
            </div>
            <div className="pt-4">
              <Button onClick={() => navigate("/industry")} variant="secondary">
                Return to Dashboard
              </Button>
            </div>
          </GlassCard>
        )}

        <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p className="font-semibold text-primary mb-1">Why verify?</p>
            Verified sellers get a "Verified" badge, higher placement in search results, 
            and can participate in higher-value cluster deals. Verification also increases 
            trust with potential buyers.
          </div>
        </div>
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default IndustryKYC;
