
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { useClusters, useProducts } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import FooterNav from "@/components/FooterNav";
import ThreeBackground from "@/components/ThreeBackground";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Mail, 
  Phone, 
  User,
  Trash2,
  Info
} from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';

const MerchantCustomers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: clusters = [] } = useClusters();
  const { data: products = [] } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter clusters where this merchant is the creator or the product belongs to them
  // In our mock data, we'll assume products created by the current user
  const myProducts = products.filter(p => p.company === user?.company || p.contactEmail === user?.email);
  const myProductIds = myProducts.map(p => p.id);
  
  const myClusters = clusters.filter(c => 
    c.creatorId === user?.id || myProductIds.includes(c.targetProductId)
  );

  const customers = myClusters.flatMap(cluster => {
    return (cluster.cluster_members || []).map(member => ({
      ...member,
      clusterName: cluster.name,
      clusterId: cluster.id,
      clusterStatus: cluster.status || cluster.shipping_status || 'open',
      productName: cluster.targetProductName,
      // In a real app, these would come from profiles table joined with cluster_members
      email: `${member.username?.toLowerCase().replace(/\s/g, '.')}@example.com`,
      phone: "+234 " + Math.floor(Math.random() * 9000000000 + 1000000000),
    }));
  });

  const filteredCustomers = customers.filter(c => 
    c.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.clusterName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (customerId: string, clusterStatus: string) => {
    if (clusterStatus !== 'delivered') {
      toast.error("Can only delete customers after cluster is delivered");
      return;
    }
    toast.success("Customer record deleted");
  };

  return (
    <div className="min-h-screen pb-24 relative">
      <ThreeBackground />
      <header className="backdrop-blur-xl bg-card/80 border-b border-border/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/industry")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Customers</h1>
              <p className="text-sm text-muted-foreground">Manage buyers across your active clusters.</p>
            </div>
          </div>
          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <GlassCard className="overflow-hidden border-white/10">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Cluster / Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer, idx) => (
                  <TableRow key={`${customer.id}-${idx}`} className="hover:bg-white/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{customer.username || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="font-medium truncate">{customer.clusterName}</p>
                        <p className="text-xs text-muted-foreground truncate">{customer.productName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`capitalize ${
                          customer.clusterStatus === 'delivered' 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}
                      >
                        {customer.clusterStatus.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-block">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                disabled={customer.clusterStatus !== 'delivered'}
                                onClick={() => handleDelete(customer.id, customer.clusterStatus)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {customer.clusterStatus !== 'delivered' && (
                            <TooltipContent>
                              <p className="flex items-center gap-2 text-xs">
                                <Info className="h-3 w-3" />
                                Only deletable after delivery
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </GlassCard>
      </main>

      <FooterNav dashboardType="industry" />
    </div>
  );
};

export default MerchantCustomers;
