import { useState } from "react";
import { useAllOrders, useClusters, useUpdateOrderTrackingMutation, useUpdateClusterTrackingMutation } from "@/hooks/useData";
import type { Order, Cluster } from "@/types/models";
import GlassCard from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Truck, Package, Clock, MapPin, CheckCircle2, Edit2 } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { calculateExpectedDeliveryDate, formatCountdown } from "@/utils/shipping";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TrackingItem {
  id: string;
  type: 'Order' | 'Cluster';
  name: string;
  status: string;
  date: string;
  location: string;
  tracking_id: string;
  started_at?: string;
  method?: string;
}

// Extended types to include potential database fields not in model interfaces
interface ExtendedOrder extends Order {
  product_name?: string;
  current_location?: string;
  tracking_id?: string;
}

interface ExtendedCluster extends Cluster {
  destination?: string;
  current_location?: string;
  tracking_id?: string;
}

const AdminTracking = () => {
  const { data: orders = [], isLoading: ordersLoading } = useAllOrders();
  const { data: clusters = [], isLoading: clustersLoading } = useClusters();
  const updateOrderTracking = useUpdateOrderTrackingMutation();
  const updateClusterTracking = useUpdateClusterTrackingMutation();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<TrackingItem | null>(null);
  const [editTrackingId, setEditTrackingId] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const ordersList = orders as ExtendedOrder[];
  const clustersList = clusters as ExtendedCluster[];

  const activeTracking: TrackingItem[] = [
    ...ordersList.filter(o => o.status === 'shipped' || o.status === 'processing' || o.status === 'confirmed').map(o => ({
      id: o.id,
      type: 'Order' as const,
      name: o.product_name || o.productName || `Order #${o.id.slice(0,8)}`,
      status: o.status,
      date: o.created_at || "",
      location: o.current_location || 'In Transit',
      tracking_id: o.tracking_id || o.id.slice(0, 12).toUpperCase()
    })),
    ...clustersList.filter(c => (c.shipping_status || c.shippingStatus) && (c.shipping_status || c.shippingStatus) !== 'shipping not started yet').map(c => ({
      id: c.id,
      type: 'Cluster' as const,
      name: c.name,
      status: (c.shipping_status || c.shippingStatus)!,
      date: c.shipping_started_at || c.shippingStartedAt || c.created_at || c.createdDate || "",
      location: c.current_location || c.destination || 'Global',
      tracking_id: c.tracking_id || c.id.slice(0, 12).toUpperCase(),
      started_at: c.shipping_started_at || c.shippingStartedAt,
      method: c.preferred_shipping_method || c.preferredShippingMethod
    }))
  ];

  const handleEditClick = (item: TrackingItem) => {
    setEditingItem(item);
    setEditTrackingId(item.tracking_id);
    setEditLocation(item.location);
    setIsDialogOpen(true);
  };

  const handleSaveTracking = async () => {
    if (!editingItem) return;

    try {
      if (editingItem.type === 'Order') {
        await updateOrderTracking.mutateAsync({
          orderId: editingItem.id,
          trackingId: editTrackingId,
          location: editLocation
        });
      } else {
        await updateClusterTracking.mutateAsync({
          clusterId: editingItem.id,
          trackingId: editTrackingId,
          location: editLocation
        });
      }
      toast.success("Tracking information updated successfully");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update tracking information");
    }
  };

  const filteredTracking = activeTracking.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tracking_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "in transit":
      case "shipped":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "in warehouse":
      case "processing":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default:
        return "text-muted-foreground bg-white/5 border-white/10";
    }
  };

  return (
    <AdminLayout>
      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Logistics Tracking</h1>
            <p className="text-sm text-muted-foreground">Monitor all active shipments and clusters.</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-background/50 border-white/10"
            />
          </div>
        </div>

        {(ordersLoading || clustersLoading) ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredTracking.length === 0 ? (
          <GlassCard className="p-12 text-center border-white/5">
            <Truck className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-lg font-bold text-white">No active tracking found</h3>
            <p className="text-sm text-muted-foreground">Shipments will appear here once they are processed.</p>
          </GlassCard>
        ) : (
          <div className="grid gap-4">
            {filteredTracking.map((item) => (
              <GlassCard key={item.id} className="p-0 overflow-hidden border-white/5 group hover:border-primary/20 transition-all">
                <div className="p-5 flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 flex gap-4">
                    <div className="p-3 rounded-2xl bg-white/5 border border-white/10 h-fit">
                      {item.type === 'Cluster' ? <Package className="w-6 h-6 text-primary" /> : <Truck className="w-6 h-6 text-blue-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {item.type}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">#{item.tracking_id}</span>
                      </div>
                      <h3 className="font-bold text-white text-lg truncate">{item.name}</h3>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> {item.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Started {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col justify-between items-end gap-4 lg:w-48 lg:border-l lg:border-white/10 lg:pl-6">
                    <div className="flex gap-2 items-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-white"
                        onClick={() => handleEditClick(item)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                        {item.status}
                      </div>
                    </div>
                    
                    {item.type === 'Cluster' && item.started_at && (
                      <div className="text-right">
                        <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-tighter">Est. Delivery</p>
                        <p className="text-sm font-mono font-bold text-primary">
                          {formatCountdown(calculateExpectedDeliveryDate(item.started_at, item.method || 'Standard'))}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="h-1.5 w-full bg-white/5 flex">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      item.status.toLowerCase() === 'delivered' ? 'w-full bg-emerald-500' :
                      (item.status.toLowerCase() === 'in transit' || item.status.toLowerCase() === 'shipped') ? 'w-2/3 bg-blue-500 animate-pulse' :
                      'w-1/3 bg-amber-500'
                    }`} 
                  />
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4 text-center border-white/5">
            <p className="text-2xl font-bold text-white">{filteredTracking.length}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Total Active</p>
          </GlassCard>
          <GlassCard className="p-4 text-center border-white/5">
            <p className="text-2xl font-bold text-blue-400">{filteredTracking.filter(t => t.status.toLowerCase() === 'in transit' || t.status.toLowerCase() === 'shipped').length}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">In Transit</p>
          </GlassCard>
          <GlassCard className="p-4 text-center border-white/5">
            <p className="text-2xl font-bold text-amber-400">{filteredTracking.filter(t => t.status.toLowerCase() === 'processing' || t.status.toLowerCase() === 'in warehouse').length}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Processing</p>
          </GlassCard>
          <GlassCard className="p-4 text-center border-white/5">
            <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Logistics Ready</p>
          </GlassCard>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Update Tracking Info</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="trackingId">Tracking ID</Label>
              <Input 
                id="trackingId"
                value={editTrackingId}
                onChange={(e) => setEditTrackingId(e.target.value)}
                placeholder="Enter tracking number"
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Current Location</Label>
              <Input 
                id="location"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="e.g. In Warehouse, On Ship, etc."
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTracking}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminTracking;
