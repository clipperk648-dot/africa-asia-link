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
import { ArrowLeft, CreditCard, Building2, Smartphone, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useEffect } from "react";

const currencies = ["USD", "NGN"] as const;
type Currency = typeof currencies[number];

const WalletDeposit = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<Currency>("USD");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "bank" | "mobile" | null>(null);
  const [step, setStep] = useState<"amount" | "method" | "confirm">("amount");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvc: "" });
  const [bankDetails, setBankDetails] = useState({ accountName: "", accountNumber: "" });
  const [mobileNumber, setMobileNumber] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const balance = useMemo(() => getBalance(user?.id, currency), [user?.id, currency]);

  const quickAmounts = [100, 500, 1000, 5000];
  const processingFee = amount ? (Number(amount) * 0.02).toFixed(2) : "0";
  const totalAmount = amount ? (Number(amount) + Number(processingFee)).toFixed(2) : "0";

  const paymentMethods = [
    {
      id: "card" as const,
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, American Express",
      fee: "2%",
      time: "Instant",
    },
    {
      id: "bank" as const,
      name: "Bank Transfer",
      icon: Building2,
      description: "Direct bank deposit",
      fee: "1.5%",
      time: "1-3 business days",
    },
    {
      id: "mobile" as const,
      name: "Mobile Money",
      icon: Smartphone,
      description: "Airtel Money, MTN Mobile Money",
      fee: "0.5%",
      time: "5-10 minutes",
    },
  ];

  const handleDeposit = () => {
    if (!user || !amount || !paymentMethod) return;

    const depositAmount = Number(amount);
    setBalance(user.id, balance + depositAmount, currency);
    addTransaction(user.id, {
      id: crypto.randomUUID(),
      type: "deposit",
      amount: depositAmount,
      currency,
      note: `Deposit via ${paymentMethod}`,
      date: new Date().toISOString(),
    });

    navigate("/wallet");
  };

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
            <h1 className="text-base sm:text-lg font-bold">Add Funds</h1>
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
              <Label htmlFor="amount">Amount ({currency})</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12"
              />
              {amount && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-semibold">{currency} {Number(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Processing Fee (2%):</span>
                    <span className="font-semibold">{currency} {processingFee}</span>
                  </div>
                  <div className="border-t pt-1 flex justify-between text-foreground">
                    <span>Total:</span>
                    <span className="font-bold">{currency} {totalAmount}</span>
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
                disabled={!amount || Number(amount) <= 0}
                className="flex-1"
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Payment Method Selection */}
        {step === "method" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Select a payment method</p>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <GlassCard
                  key={method.id}
                  className={`p-4 cursor-pointer transition-all ${
                    paymentMethod === method.id
                      ? "ring-2 ring-primary border-primary"
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setPaymentMethod(method.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        paymentMethod === method.id
                          ? "bg-primary text-white"
                          : "bg-muted"
                      }`}
                    >
                      <method.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{method.name}</h3>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Fee: {method.fee}</span>
                        <span>Time: {method.time}</span>
                      </div>
                    </div>
                    {paymentMethod === method.id && <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />}
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
                disabled={!paymentMethod}
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
              <h3 className="font-semibold text-lg">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">{currency} {Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-semibold">{currency} {processingFee}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-primary">{currency} {totalAmount}</span>
                </div>
              </div>
            </GlassCard>

            {/* Payment Method Details Form */}
            {paymentMethod === "card" && (
              <GlassCard className="p-6 space-y-4">
                <h3 className="font-semibold">Card Details</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      value={cardDetails.number}
                      onChange={(e) =>
                        setCardDetails({ ...cardDetails, number: e.target.value })
                      }
                      className="h-10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiry">Expiry (MM/YY)</Label>
                      <Input
                        id="expiry"
                        placeholder="12/25"
                        maxLength={5}
                        value={cardDetails.expiry}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, expiry: e.target.value })
                        }
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        maxLength={4}
                        type="password"
                        value={cardDetails.cvc}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, cvc: e.target.value })
                        }
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            )}

            {paymentMethod === "bank" && (
              <GlassCard className="p-6 space-y-4">
                <h3 className="font-semibold">Bank Account Details</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="accountName">Account Name</Label>
                    <Input
                      id="accountName"
                      placeholder="John Doe"
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
                      placeholder="1234567890"
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
                </div>
              </GlassCard>
            )}

            {paymentMethod === "mobile" && (
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

            {/* Security Notice */}
            <div className="flex gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-primary">Secure Transaction</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Your payment information is encrypted and secure.
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
              <Button onClick={handleDeposit} className="flex-1">
                Complete Deposit
              </Button>
            </div>
          </div>
        )}
      </main>

      <WalletBottomNav active="wallet" />
    </div>
  );
};

export default WalletDeposit;
