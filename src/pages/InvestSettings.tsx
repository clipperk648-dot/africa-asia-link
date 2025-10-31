import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/GlassCard";
import { ArrowLeft, Bell, Lock, Eye, FileText } from "lucide-react";
import { toast } from "@/components/ui/sonner";

const InvestSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    monthlyReport: true,
    twoFactorEnabled: false,
    theme: "system",
    language: "en",
    minimumInvestmentAlert: 1000,
    maxPortfolioRiskPercentage: 30,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "boolean" ? !prev[key] : prev[key],
    }));
    toast.success("Setting updated");
  };

  const handleInputChange = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = () => {
    localStorage.setItem("invest_settings", JSON.stringify(settings));
    toast.success("All settings saved successfully");
  };

  const handleResetSettings = () => {
    const defaults = {
      emailNotifications: true,
      pushNotifications: false,
      monthlyReport: true,
      twoFactorEnabled: false,
      theme: "system",
      language: "en",
      minimumInvestmentAlert: 1000,
      maxPortfolioRiskPercentage: 30,
    };
    setSettings(defaults);
    localStorage.removeItem("invest_settings");
    toast.success("Settings reset to defaults");
  };

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
          <h1 className="text-2xl font-bold">Investment Settings</h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Notifications */}
        <GlassCard className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">Receive investment updates via email</p>
              </div>
              <div
                onClick={() => handleToggle("emailNotifications")}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  settings.emailNotifications ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Push Notifications</h3>
                <p className="text-sm text-muted-foreground">Instant browser notifications</p>
              </div>
              <div
                onClick={() => handleToggle("pushNotifications")}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  settings.pushNotifications ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.pushNotifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Monthly Report</h3>
                <p className="text-sm text-muted-foreground">Receive monthly investment summary</p>
              </div>
              <div
                onClick={() => handleToggle("monthlyReport")}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  settings.monthlyReport ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.monthlyReport ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Security */}
        <GlassCard className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold">Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">Add extra security to your account</p>
              </div>
              <div
                onClick={() => handleToggle("twoFactorEnabled")}
                className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                  settings.twoFactorEnabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.twoFactorEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Change Password
            </Button>

            <Button variant="outline" className="w-full">
              View Login Activity
            </Button>

            <Button variant="outline" className="w-full">
              Manage Sessions
            </Button>
          </div>
        </GlassCard>

        {/* Preferences */}
        <GlassCard className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl font-bold">Preferences</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleInputChange("theme", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleInputChange("language", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              >
                <option value="en">English</option>
                <option value="yo">Yoruba</option>
                <option value="ig">Igbo</option>
                <option value="zh">中文</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Minimum Investment Alert ($)</label>
              <Input
                type="number"
                value={settings.minimumInvestmentAlert}
                onChange={(e) => handleInputChange("minimumInvestmentAlert", Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Max Portfolio Risk (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.maxPortfolioRiskPercentage}
                onChange={(e) => handleInputChange("maxPortfolioRiskPercentage", Number(e.target.value))}
              />
            </div>
          </div>
        </GlassCard>

        {/* Danger Zone */}
        <GlassCard className="p-6 sm:p-8 border-2 border-red-500/20">
          <h2 className="text-2xl font-bold mb-6 text-red-600">Danger Zone</h2>

          <div className="space-y-3">
            <Button variant="outline" className="w-full text-red-600 border-red-500/20 hover:bg-red-50 dark:hover:bg-red-900/20">
              Export My Data
            </Button>

            <Button variant="outline" className="w-full text-red-600 border-red-500/20 hover:bg-red-50 dark:hover:bg-red-900/20">
              Deactivate Account
            </Button>

            <Button variant="outline" className="w-full text-red-600 border-red-500/20 hover:bg-red-50 dark:hover:bg-red-900/20">
              Delete Account Permanently
            </Button>
          </div>
        </GlassCard>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button variant="gradient" onClick={handleSaveSettings} className="flex-1">
            Save Settings
          </Button>
          <Button variant="outline" onClick={handleResetSettings} className="flex-1">
            Reset to Defaults
          </Button>
        </div>
      </main>
    </div>
  );
};

export default InvestSettings;
