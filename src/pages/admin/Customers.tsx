
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClusters, useUsers } from "@/hooks/useData";
import GlassCard from "@/components/GlassCard";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Mail, 
  Phone, 
  User,
  Trash2,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Info,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

const AdminCustomers = () => {
  const navigate = useNavigate();
  const { data: clusters = [] } = useClusters();
  const { data: users = [] } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [merchantFilter, setMerchantFilter] = useState("all");

  const merchants = users.filter(u => u.role === 'industry' || u.role === 'sourcing-agent');

  const customers = clusters.flatMap(cluster => {
    return (cluster.cluster_members || []).map(member => ({
      ...member,
      clusterName: cluster.name,
      clusterId: cluster.id,
      clusterStatus: cluster.status || cluster.shipping_status || 'open',
      productName: cluster.targetProductName,
      merchantId: cluster.creatorId,
      merchantName: cluster.creatorName || "Unknown Merchant",
      // In a real app, these would come from profiles table
      email: `${member.username?.toLowerCase().replace(/\s/g, '.')}@example.com`,
      phone: "+234 " + Math.floor(Math.random() * 9000000000 + 1000000000),
    }));
  });

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clusterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.merchantName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMerchant = merchantFilter === 'all' || c.merchantId === merchantFilter;
    
    return matchesSearch && matchesMerchant;
  });

  const handleDelete = (customerId: string, clusterStatus: string) => {
    if (clusterStatus !== 'delivered') {
      toast.error("Can only delete customers after cluster is delivered");
      return;
    }
    toast.success("Customer record deleted");
  };

  return (
    <AdminLayout title="Customer Management">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by customer, merchant, or cluster..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={merchantFilter} onValueChange={setMerchantFilter}>
              <SelectTrigger className="w-[200px] bg-background/50">
                <SelectValue placeholder="Filter by Merchant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Merchants</SelectItem>
                {merchants.map(m => (
                  <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <GlassCard className="overflow-hidden border-white/10">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Cluster / Status</TableHead>
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
                      <span className="text-sm">{customer.merchantName}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium truncate max-w-[150px]">{customer.clusterName}</p>
                        <Badge 
                          variant="secondary" 
                          className={`capitalize text-[10px] h-5 ${
                            customer.clusterStatus === 'delivered' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          }`}
                        >
                          {customer.clusterStatus.replace(/_/g, ' ')}
                        </Badge>
                      </div>
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
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
