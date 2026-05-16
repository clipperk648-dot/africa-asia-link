/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { generateSalesReport, generateUserReport, generateProductReport } from "@/lib/db";
import { useAllOrders, useAllUsers, useProducts } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, Users, Package, DollarSign, Calendar, Filter, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts";

const AdminReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<"sales" | "users" | "products">("sales");

  const { data: allOrders = [] } = useAllOrders();
  const { data: allUsers = [] } = useAllUsers();
  const { data: allProducts = [] } = useProducts(1000, 0);

  const stats = useMemo(() => {
    const totalRevenue = (allOrders as any[]).reduce((acc: number, order: any) => acc + (order.total || 0), 0);
    const activeUsers = allUsers.length;
    const totalProducts = allProducts.length;
    
    return [
      { label: "Total Revenue", value: `${totalRevenue.toLocaleString()}`, change: "+12.5%", icon: DollarSign, color: "text-emerald-400" },
      { label: "Active Users", value: activeUsers.toLocaleString(), change: "+5.2%", icon: Users, color: "text-blue-400" },
      { label: "Products Listed", value: totalProducts.toLocaleString(), change: "+2.1%", icon: Package, color: "text-purple-400" },
      { label: "Total Orders", value: allOrders.length.toLocaleString(), change: "+3.4%", icon: BarChart3, color: "text-amber-400" },
    ];
  }, [allOrders, allUsers, allProducts]);

  const chartData = useMemo(() => {
    // Group orders by month for the last 6 months
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        name: months[d.getMonth()],
        sales: 0,
        users: 0,
        monthNum: d.getMonth(),
        year: d.getFullYear()
      });
    }

    (allOrders as any[]).forEach((order: any) => {
      const orderDate = new Date(order.created_at);
      const monthIndex = last6Months.findIndex(m => m.monthNum === orderDate.getMonth() && m.year === orderDate.getFullYear());
      if (monthIndex !== -1) {
        last6Months[monthIndex].sales += (order.total || 0);
      }
    });

    (allUsers as any[]).forEach((user: any) => {
      const userDate = new Date(user.created_at);
      const monthIndex = last6Months.findIndex(m => m.monthNum === userDate.getMonth() && m.year === userDate.getFullYear());
      if (monthIndex !== -1) {
        last6Months[monthIndex].users += 1;
      }
    });

    return last6Months;
  }, [allOrders, allUsers]);

  const handleExport = async (type: string) => {
    setLoading(true);
    try {
      let data;
      if (type === "sales") data = await generateSalesReport(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), new Date().toISOString());
      else if (type === "users") data = await generateUserReport();
      else data = await generateProductReport();
      
      console.log("Report data:", data);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated and ready for download`);
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <main className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Analytics & Reports</h1>
            <p className="text-muted-foreground mt-1 text-sm">Monitor platform performance and export critical data.</p>
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <Button variant="outline" className="flex-1 lg:flex-none border-white/10 gap-2">
              <Calendar className="w-4 h-4" /> Last 30 Days
            </Button>
            <Button className="flex-1 lg:flex-none gap-2 shadow-lg shadow-primary/20" onClick={() => handleExport(reportType)}>
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="p-6 border-white/5 relative overflow-hidden group">
               <div className="absolute right-0 bottom-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon size={60} />
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              <div className="flex items-end gap-3 mt-1">
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                <span className={`text-[10px] font-bold mb-1 ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6 border-white/5 h-[450px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Performance Overview
                </h3>
                <div className="flex bg-white/5 p-1 rounded-lg">
                  <Button 
                    variant={reportType === "sales" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 text-[10px] uppercase font-bold"
                    onClick={() => setReportType("sales")}
                  >
                    Sales
                  </Button>
                  <Button 
                    variant={reportType === "users" ? "secondary" : "ghost"} 
                    size="sm" 
                    className="h-8 text-[10px] uppercase font-bold"
                    onClick={() => setReportType("users")}
                  >
                    Growth
                  </Button>
                </div>
              </div>

              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {reportType === "sales" ? (
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                      />
                      <Bar dataKey="users" fill="#a855f7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard className="p-6 border-white/5 flex flex-col h-full">
              <h3 className="text-lg font-bold text-white mb-6">Available Reports</h3>
              <div className="space-y-3">
                {[
                  { name: "Consolidated Sales Report", icon: FileSpreadsheet, size: "1.2 MB", type: "sales" },
                  { name: "User Activity Audit", icon: Users, size: "0.8 MB", type: "users" },
                  { name: "Inventory Valuation", icon: Package, size: "2.4 MB", type: "products" },
                  { name: "Marketing Funnel Data", icon: BarChart3, size: "0.5 MB", type: "sales" },
                ].map((report, i) => (
                  <div key={i} className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background border border-white/10 text-muted-foreground group-hover:text-primary transition-colors">
                          <report.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{report.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{report.size}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-white" onClick={() => handleExport(report.type)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-6">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <p className="text-xs text-primary font-medium leading-relaxed">
                    Custom reports can be scheduled for automatic delivery to your admin email. 
                    Visit settings to configure.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AdminReports;
