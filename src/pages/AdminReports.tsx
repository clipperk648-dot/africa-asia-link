import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { generateSalesReport, generateUserReport, generateProductReport } from "@/lib/db";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, BarChart3, Users, Package, TrendingUp } from "lucide-react";
import ThreeBackground from "@/components/ThreeBackground";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminReports = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [reportType, setReportType] = useState("sales");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "admin") {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const generateReport = async () => {
    try {
      setLoading(true);
      let data;

      switch (reportType) {
        case "sales":
          if (!startDate || !endDate) {
            toast.error("Please select date range for sales report");
            setLoading(false);
            return;
          }
          data = await generateSalesReport(startDate, endDate);
          break;
        case "users":
          data = await generateUserReport();
          break;
        case "products":
          data = await generateProductReport();
          break;
        default:
          toast.error("Invalid report type");
          setLoading(false);
          return;
      }

      if (!data) {
        setReportData([]);
        toast.success("Report generated successfully (no data available)");
        return;
      }

      setReportData(data);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Failed to generate report:", error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const data = Array.isArray(reportData) ? reportData : [reportData];
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0] as object);
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = (row as Record<string, unknown>)[header];
            if (typeof value === "string" && value.includes(",")) {
              return `"${value}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  const exportToJSON = () => {
    if (!reportData) return;

    const json = JSON.stringify(reportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  const reportStats = () => {
    if (!Array.isArray(reportData)) return null;

    switch (reportType) {
      case "sales":
        const totalRevenue = (reportData as unknown[]).reduce(
          (sum, order: unknown) => sum + ((order as Record<string, unknown>)?.total as number || 0),
          0
        );
        const totalOrders = reportData.length;
        return [
          { label: "Total Orders", value: totalOrders, icon: TrendingUp },
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: BarChart3 },
          {
            label: "Average Order",
            value: `$${(totalRevenue / totalOrders || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
            icon: Package,
          },
        ];
      case "users":
        const userRoles = {} as Record<string, number>;
        (reportData as unknown[]).forEach((user: unknown) => {
          const role = (user as Record<string, unknown>)?.role as string || "unknown";
          userRoles[role] = (userRoles[role] || 0) + 1;
        });
        return [
          { label: "Total Users", value: reportData.length, icon: Users },
          {
            label: "Admins",
            value: userRoles.admin || 0,
            icon: Users,
          },
          {
            label: "Buyers",
            value: userRoles.buyer || 0,
            icon: Users,
          },
        ];
      case "products":
        return [
          { label: "Total Products", value: reportData.length, icon: Package },
          {
            label: "Average Price",
            value: `$${(
              (reportData as unknown[]).reduce((sum, p: unknown) => sum + ((p as Record<string, unknown>)?.price as number || 0), 0) /
              reportData.length ||
              0
            ).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
            icon: BarChart3,
          },
        ];
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />

      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Reports & Analytics</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <GlassCard className="p-6">
          <h2 className="text-lg font-bold mb-4">Generate Report</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="users">User Report</SelectItem>
                  <SelectItem value="products">Product Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "sales" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={generateReport}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </GlassCard>

        {reportData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportStats()?.map((stat, i) => (
                <GlassCard key={i} className="p-4 text-center">
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </GlassCard>
              ))}
            </div>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Report Data</h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToJSON}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    JSON
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/50">
                    <tr>
                      {Array.isArray(reportData) &&
                        reportData.length > 0 &&
                        Object.keys(reportData[0] as object).map((header) => (
                          <th key={header} className="text-left py-2 px-3 font-medium text-muted-foreground">
                            {header.replace(/_/g, " ").toUpperCase()}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(reportData) &&
                      reportData.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-b border-border/30 hover:bg-white/5">
                          {Object.values(row as object).map((value, j) => (
                            <td key={j} className="py-2 px-3">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value).substring(0, 50)}
                            </td>
                          ))}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {Array.isArray(reportData) && reportData.length > 10 && (
                <p className="text-xs text-muted-foreground mt-4">
                  Showing 10 of {reportData.length} records. Export to see all data.
                </p>
              )}
            </GlassCard>
          </>
        )}
      </main>

      <FooterNav dashboardType="admin" />
    </div>
  );
};

export default AdminReports;
