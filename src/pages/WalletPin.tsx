import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/utils/mockAuth";
import { getWalletPin, setWalletPin, verifyPin, unlockWallet, clearWalletPin } from "@/utils/walletPin";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPSlot } from "@/components/ui/input-otp";
import ThreeBackground from "@/components/ThreeBackground";
import { Lock, ArrowLeft } from "lucide-react";

const WalletPin = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { if (!user) navigate("/login"); }, [user, navigate]);

  const existingPin = useMemo(() => getWalletPin(user?.id), [user?.id]);
  const mode: "create" | "enter" = existingPin ? "enter" : "create";

  const submitCreate = () => {
    if (pin.length < 4 || pin.length > 6) { setError("PIN must be 4-6 digits"); return; }
    if (pin !== confirm) { setError("PINs do not match"); return; }
    if (!user) return;
    setWalletPin(user.id, pin);
    unlockWallet(user.id);
    const dest = location.state?.from || "/wallet";
    navigate(dest, { replace: true });
  };

  const submitEnter = () => {
    if (!user) return;
    if (!verifyPin(user.id, pin)) { setError("Incorrect PIN"); return; }
    unlockWallet(user.id);
    const dest = location.state?.from || "/wallet";
    navigate(dest, { replace: true });
  };

  const resetPin = () => {
    if (!user) return;
    clearWalletPin(user.id);
    setPin(""); setConfirm(""); setError("");
  };

  return (
    <div className="min-h-screen relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/wallet")}> <ArrowLeft className="w-5 h-5" /> </Button>
          <Lock className="w-5 h-5 text-primary" />
          <h1 className="text-base sm:text-lg font-bold">Wallet PIN</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <GlassCard className="p-6 text-center space-y-6">
          <div>
            <h2 className="text-lg font-semibold">{mode === "create" ? "Set up your PIN" : "Enter your PIN"}</h2>
            <p className="text-sm text-muted-foreground mt-1">{mode === "create" ? "Create a 4-6 digit PIN to protect your wallet" : "Unlock your wallet to continue"}</p>
          </div>

          <div className="space-y-5">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={pin} onChange={setPin} containerClassName="gap-2">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTP>
            </div>
            {mode === "create" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Confirm PIN</p>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={confirm} onChange={setConfirm} containerClassName="gap-2">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTP>
                </div>
              </div>
            )}

            {error && <p className="text-destructive text-sm">{error}</p>}

            {mode === "create" ? (
              <Button onClick={submitCreate} className="w-full">Save PIN</Button>
            ) : (
              <Button onClick={submitEnter} className="w-full">Unlock Wallet</Button>
            )}

            {mode === "enter" && (
              <button onClick={resetPin} className="text-xs text-muted-foreground underline">Reset PIN</button>
            )}
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default WalletPin;
