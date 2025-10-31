import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import { ArrowLeft, Download, Filter } from "lucide-react";
import { getCurrentUser } from "@/utils/mockAuth";

const format = (n: number) => `$${n.toLocaleString()}`;

const InvestHistory = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [filterType, setFilterType] = useState<"all" | "deposit" | "withdraw" | "invest">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const txs = useMemo(() => {
    try {
      const raw = localStorage.getItem("echina_txs_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const filteredTxs = useMemo(() => {
    return txs
      .filter((tx: any) => filterType === "all" || tx.type === filterType)
      .filter((tx: any) => {
        if (!searchTerm) return true;
        return tx.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
               tx.type.toLowerCase().includes(searchTerm.toLowerCase());
      })
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [txs, filterType, searchTerm]);

  const stats = useMemo(() => {
    const deposits = txs.filter((t: any) => t.type === "deposit").reduce((a: number, b: any) => a + b.amount, 0);
    const withdraws = txs.filter((t: any) => t.type === "withdraw").reduce((a: number, b: any) => a + b.amount, 0);
    const invests = txs.filter((t: any) => t.type === "invest").reduce((a: number, b: any) => a + b.amount, 0);
    return { deposits, withdraws, invests, total: txs.length };
  }, [txs]);

  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Amount", "Note"];
    const rows = filteredTxs.map((tx: any) => [
      new Date(tx.date).toLocaleString(),
      tx.type,
      format(tx.amount),
      tx.note || "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `investment-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
        return "text-green-600";
      case "withdraw":
        return "text-red-600";
      case "invest":
        return "text-blue-600";
      default:
        return "text-muted-foreground";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return "↓";
      case "withdraw":
        return "↑";
      case "invest":
        return "→";
      default:
        return "•";
    }
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
          <h1 className="text-2xl font-bold">Transaction History</h1>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Total Deposits</p>
            <p className="text-2xl font-bold mt-1 text-green-600">{format(stats.deposits)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Total Withdrawn</p>
            <p className="text-2xl font-bold mt-1 text-red-600">{format(stats.withdraws)}</p>
          </GlassCard>
          <GlassCard className="p-4">
            <p className="text-xs text-muted-foreground">Total Invested</p>
            <p className="text-2xl font-bold mt-1 text-blue-600">{format(stats.invests)}</p>
          </GlassCard>
        </div>

        {/* Filters */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5" />
            <h2 className="font-semibold">Filters</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-2 block">Transaction Type</label>
              <div className="flex gap-2 flex-wrap">
                {["all", "deposit", "withdraw", "invest"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filterType === type
                        ? "bg-primary text-white"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Search</label>
              <input
                type="text"
                placeholder="Search by note or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-background"
              />
            </div>

            <Button variant="outline" onClick={handleExportCSV} className="w-full gap-2">
              <Download className="w-4 h-4" />
              Export as CSV
            </Button>
          </div>
        </GlassCard>

        {/* Transaction List */}
        <GlassCard className="p-6">
          <h2 className="font-semibold mb-4">Transaction Details</h2>

          {filteredTxs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions found</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-auto">
              {filteredTxs.map((tx: any) => (
                <div key={tx.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`text-xl font-bold ${getTransactionColor(tx.type)}`}>
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">{tx.note}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(tx.date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-right ${getTransactionColor(tx.type)}`}>
                      <p className="font-bold">{format(tx.amount)}</p>
                      <p className="text-xs text-muted-foreground">#{tx.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Monthly Summary */}
        <GlassCard className="p-6">
          <h2 className="font-semibold mb-4">Monthly Summary</h2>

          {filteredTxs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions to summarize</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(
                filteredTxs.reduce((acc: any, tx: any) => {
                  const month = new Date(tx.date).toLocaleString("default", { month: "long", year: "numeric" });
                  if (!acc[month]) acc[month] = { deposits: 0, withdraws: 0, invests: 0 };
                  if (tx.type === "deposit") acc[month].deposits += tx.amount;
                  if (tx.type === "withdraw") acc[month].withdraws += tx.amount;
                  if (tx.type === "invest") acc[month].invests += tx.amount;
                  return acc;
                }, {})
              ).map(([month, data]: any) => (
                <div key={month} className="p-4 border rounded-lg">
                  <p className="font-semibold mb-3">{month}</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <p className="text-green-600 font-semibold">{format(data.deposits)}</p>
                      <p className="text-xs text-muted-foreground">Deposits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-red-600 font-semibold">{format(data.withdraws)}</p>
                      <p className="text-xs text-muted-foreground">Withdraws</p>
                    </div>
                    <div className="text-center">
                      <p className="text-blue-600 font-semibold">{format(data.invests)}</p>
                      <p className="text-xs text-muted-foreground">Invests</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
};

export default InvestHistory;
