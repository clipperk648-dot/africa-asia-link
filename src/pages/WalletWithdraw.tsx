import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { getBalance, setBalance, addTransaction } from "@/utils/wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/GlassCard";
import WalletBottomNav from "@/components/WalletBottomNav";
import ThreeBackground from "@/components/ThreeBackground";
import { ArrowLeft, Building2, Smartphone, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const currencies = ["USD", "NGN"] as const;
type Currency = typeof currencies[number];

const WalletWithdraw = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currency, setCurrency] = useState<Currency>("USD");
  const [amount, setAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"bank" | "mobile" | null>(null);
  const [step, setStep] = useState<"amount" | "method" | "confirm">("amount");
  const [bankDetails, setBankDetails] = useState({ accountName: "", accountNumber: "" });
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const balance = useMemo(() => getBalance(user?.id, currency), [user?.id, currency]);

  const quickAmounts = [100, 500, 1000, 5000];
  const withdrawalFee = amount ? (Number(amount) * 0.015).toFixed(2) : "0";
  const netAmount = amount ? (Number(amount) - Number(withdrawalFee)).toFixed(2) : "0";

  const withdrawalMethods = [
    {
      id: "bank" as const,
      name: "Bank Transfer",
      description: "Transfer to your bank account",
      fee: "1.5%",
      time: "1-3 business days",
      minAmount: 100,
    },
    {
      id: "mobile" as const,
      name: "Mobile Money",
      description: "Airtel Money, MTN Mobile Money",
      fee: "2%",
      time: "5-15 minutes",
      minAmount: 50,
    },
  ];

  const handleWithdraw = () => {
    const withdrawAmount = Number(amount);
    if (!user || !withdrawAmount || !withdrawMethod || withdrawAmount > balance) {
      toast({
        title: "Cannot complete withdrawal",
        description: "Please check your amount and available balance",
        variant: "destructive",
      });
      return;
    }

    setBalance(user.id, balance - withdrawAmount, currency);
    addTransaction(user.id, {
      id: crypto.randomUUID(),
      type: "withdrawal",
      amount: withdrawAmount,
      currency,
      note: `Withdrawal via ${withdrawMethod}`,
      date: new Date().toISOString(),
    });

    toast({
      title: "Withdrawal successful",
      description: `${currency} ${withdrawAmount.toLocaleString()} has been processed`,
    });

    navigate("/wallet");
  };

  const selectedMethodInfo = withdrawalMethods.find((m) => m.id === withdrawMethod);
  const insufficientBalance = amount && Number(amount) > balance;

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/wallet")}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-base sm:text-lg font-bold">Withdraw Funds</h1>
          </div>
          <div className="text-xs text-muted-foreground">
            Balance: {currency} {balance.toLocaleString()}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Step Indicator */}
        <div className="flex gap-2 justify-center">
          {["amount", "method", "confirm"].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  (["amount", "method", "confirm"].indexOf(step) >= i)
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && <div className="w-8 h-px bg-border mx-2" />}
            </div>
          ))}
        </div>

        {/* STEP 1: Amount Selection */}
        {step === "amount" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount ({currency})</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`h-12 ${insufficientBalance ? "border-destructive" : ""}`}
                max={balance}
              />

              {insufficientBalance && (
                <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">Insufficient balance for this withdrawal</p>
                </div>
              )}

              {amount && !insufficientBalance && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">{currency} {Number(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Withdrawal Fee (1.5% avg):</span>
                    <span className="font-semibold">{currency} {withdrawalFee}</span>
                  </div>
                  <div className="border-t pt-1 flex justify-between text-foreground">
                    <span>You will receive:</span>
                    <span className="font-bold text-primary">{currency} {netAmount}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Quick amounts</p>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((qa) => (
                  <Button
                    key={qa}
                    variant={amount === String(qa) ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(String(qa))}
                    disabled={qa > balance}
                    className="text-sm"
                  >
                    {currency === "NGN" ? "₦" : "$"}{qa}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/wallet")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => setStep("method")}
                disabled={!amount || Number(amount) <= 0 || insufficientBalance}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Withdrawal Method Selection */}
        {step === "method" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a withdrawal method</p>

            <div className="space-y-3">
              {withdrawalMethods.map((method) => (
                <GlassCard
                  key={method.id}
                  className={`p-4 cursor-pointer transition-all ${
                    withdrawMethod === method.id
                      ? "ring-2 ring-primary border-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setWithdrawMethod(method.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        withdrawMethod === method.id ? "bg-primary text-white" : "bg-muted"
                      }`}
                    >
                      {method.id === "bank" ? (
                        <Building2 className="w-6 h-6" />
                      ) : (
                        <Smartphone className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{method.name}</h3>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Fee: {method.fee}</span>
                        <span>Time: {method.time}</span>
                      </div>
                    </div>
                    {withdrawMethod === method.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("amount")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={() => setStep("confirm")}
                disabled={!withdrawMethod}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmation & Details */}
        {step === "confirm" && (
          <div className="space-y-4">
            {/* Order Summary */}
            <GlassCard className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">Withdrawal Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Withdrawal Amount</span>
                  <span className="font-semibold">{currency} {Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Withdrawal Fee ({selectedMethodInfo?.fee})
                  </span>
                  <span className="font-semibold">{currency} {withdrawalFee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base">
                  <span className="font-semibold">Amount to Receive</span>
                  <span className="font-bold text-primary">{currency} {netAmount}</span>
                </div>
              </div>
            </GlassCard>

            {/* Withdrawal Details */}
            {withdrawMethod === "bank" && (
              <GlassCard className="p-6 space-y-4">
                <h3 className="font-semibold">Bank Account Details</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      placeholder="Your Account Name"
                      value={bankDetails.accountName}
                      onChange={(e) =>
                        setBankDetails({ ...bankDetails, accountName: e.target.value })
                      }
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      placeholder="Your Account Number"
                      value={bankDetails.accountNumber}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          accountNumber: e.target.value,
                        })
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="flex gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-primary">
                      Bank withdrawals typically take 1-3 business days
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {withdrawMethod === "mobile" && (
              <GlassCard className="p-6 space-y-4">
                <h3 className="font-semibold">Mobile Money Details</h3>
                <div>
                  <Label htmlFor="mobileNumber">Phone Number</Label>
                  <Input
                    id="mobileNumber"
                    placeholder="+234 800 000 0000"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="h-10"
                  />
                </div>
              </GlassCard>
            )}

            {/* Info Notice */}
            <div className="flex gap-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-accent">Verify Your Details</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Ensure all account details are correct to avoid withdrawal issues.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("method")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={
                  withdrawMethod === "bank" &&
                  (!bankDetails.accountName || !bankDetails.accountNumber)
                }
                className="flex-1"
              >
                Complete Withdrawal
              </Button>
            </div>
          </div>
        )}
      </main>

      <WalletBottomNav active="wallet" />
    </div>
  );
};

export default WalletWithdraw;
