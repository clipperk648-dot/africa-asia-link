import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/GlassCard";
import { ArrowLeft, Lock, Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const InvestSecurity = () => {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showTwoFAForm, setShowTwoFAForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    toast.success("Password changed successfully");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(false);
  };

  const handleEnable2FA = () => {
    toast.success("Two-factor authentication enabled");
    setShowTwoFAForm(false);
  };

  const loginActivity = [
    { timestamp: "2024-03-15 10:30 AM", device: "Chrome on Windows", location: "Lagos, Nigeria", status: "Current" },
    { timestamp: "2024-03-14 3:45 PM", device: "Safari on iPhone", location: "Lagos, Nigeria", status: "Signed out" },
    { timestamp: "2024-03-13 2:15 PM", device: "Chrome on Windows", location: "Lagos, Nigeria", status: "Signed out" },
    { timestamp: "2024-03-12 9:00 AM", device: "Firefox on Linux", location: "Lagos, Nigeria", status: "Signed out" },
  ];

  const trustDevices = [
    { name: "My Laptop", browser: "Chrome", os: "Windows 11", addedDate: "March 1, 2024" },
    { name: "My Phone", browser: "Safari", os: "iOS 17", addedDate: "February 28, 2024" },
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
          <h1 className="text-2xl font-bold">Account Security</h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Security Status */}
        <GlassCard className="p-6 sm:p-8 border-2 border-green-500/20">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold mb-2">Your Account is Secure</h2>
              <p className="text-muted-foreground">Your account has strong security settings. Keep your password private and enable two-factor authentication for additional protection.</p>
            </div>
          </div>
        </GlassCard>

        {/* Password Management */}
        <GlassCard className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Password Management</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Password Strength</p>
                <span className="text-sm text-green-600 font-semibold">Strong</span>
              </div>
              <div className="w-full bg-muted h-2 rounded overflow-hidden">
                <div className="w-full h-2 bg-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last changed 45 days ago</p>
            </div>

            {!showPasswordForm ? (
              <Button variant="outline" onClick={() => setShowPasswordForm(true)} className="w-full">
                Change Password
              </Button>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <Input
                  type="password"
                  placeholder="Current Password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="gradient" onClick={handleChangePassword} className="flex-1">
                    Update Password
                  </Button>
                  <Button variant="outline" onClick={() => setShowPasswordForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Two-Factor Authentication */}
        <GlassCard className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold">Two-Factor Authentication</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold">Status</p>
                <span className="text-sm text-red-600 font-semibold">Disabled</span>
              </div>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account by requiring a code when you log in.</p>
            </div>

            {!showTwoFAForm ? (
              <Button variant="outline" onClick={() => setShowTwoFAForm(true)} className="w-full">
                Enable Two-Factor Authentication
              </Button>
            ) : (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <p className="text-sm font-semibold">Step 1: Scan QR Code</p>
                <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center">
                  <div className="w-32 h-32 bg-muted border-4 border-dashed border-muted-foreground flex items-center justify-center text-muted-foreground text-xs">
                    QR Code
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Use Google Authenticator, Microsoft Authenticator, or Authy</p>

                <p className="text-sm font-semibold mt-4">Step 2: Verify Code</p>
                <Input placeholder="000000" maxLength={6} />

                <div className="flex gap-2">
                  <Button variant="gradient" onClick={handleEnable2FA} className="flex-1">
                    Verify & Enable
                  </Button>
                  <Button variant="outline" onClick={() => setShowTwoFAForm(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Login Activity */}
        <GlassCard className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6">Login Activity</h2>

          <div className="space-y-3">
            {loginActivity.map((activity, idx) => (
              <div key={idx} className="p-4 border rounded-lg flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{activity.device}</p>
                    <p className="text-xs text-muted-foreground">{activity.location}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold ${activity.status === "Current" ? "text-green-600" : "text-muted-foreground"}`}>
                    {activity.status}
                  </p>
                  {activity.status === "Signed out" && (
                    <Button variant="ghost" size="sm" className="text-xs mt-1">
                      Sign Out
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4">
            Sign Out All Other Sessions
          </Button>
        </GlassCard>

        {/* Trusted Devices */}
        <GlassCard className="p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6">Trusted Devices</h2>

          <div className="space-y-3">
            {trustDevices.map((device, idx) => (
              <div key={idx} className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-semibold">{device.name}</p>
                  <p className="text-sm text-muted-foreground">{device.browser} on {device.os}</p>
                  <p className="text-xs text-muted-foreground mt-1">Added {device.addedDate}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Security Tips */}
        <GlassCard className="p-6 sm:p-8 border-2 border-yellow-500/20">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold mb-3">Security Best Practices</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Use a strong, unique password with uppercase, lowercase, numbers, and symbols</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Enable two-factor authentication for maximum security</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Never share your password or two-factor authentication codes</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Regularly review your login activity and trusted devices</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Change your password every 90 days for optimal security</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Be cautious of phishing emails pretending to be from Echina</span>
                </li>
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* Report Security Issue */}
        <GlassCard className="p-6 sm:p-8">
          <h3 className="font-bold mb-3">Found a Security Issue?</h3>
          <p className="text-sm text-muted-foreground mb-4">Please report security vulnerabilities responsibly to our security team at security@echina.investment</p>
          <Button variant="outline" className="w-full">
            Report Security Issue
          </Button>
        </GlassCard>
      </main>
    </div>
  );
};

export default InvestSecurity;
