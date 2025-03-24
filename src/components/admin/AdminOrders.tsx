import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Filter, Search, EyeIcon, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Order } from "@/lib/types";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    const loadOrders = () => {
      try {
        const savedOrders = localStorage.getItem('orders');
        const savedWholesaleOrders = localStorage.getItem('wholesaleOrders');
        
        let allOrders: Order[] = [];
        
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          allOrders = [...allOrders, ...parsedOrders];
        }
        
        if (savedWholesaleOrders) {
          const parsedWholesaleOrders = JSON.parse(savedWholesaleOrders);
          allOrders = [...allOrders, ...parsedWholesaleOrders];
        }
        
        allOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setOrders(allOrders);
        setFilteredOrders(allOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
        setOrders([]);
        setFilteredOrders([]);
      }
    };
    
    loadOrders();
    
    window.addEventListener('order-placed', loadOrders);
    
    return () => {
      window.removeEventListener('order-placed', loadOrders);
    };
  }, []);

  useEffect(() => {
    let result = orders;
    
    if (activeTab !== "all") {
      result = result.filter(order => order.status.toLowerCase() === activeTab);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(term) ||
        (order.userId && order.userId.toLowerCase().includes(term)) ||
        (order.serviceId && order.serviceId.toLowerCase().includes(term))
      );
    }
    
    setFilteredOrders(result);
  }, [searchTerm, activeTab, orders]);

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const exportToCSV = () => {
    const headers = ["Order ID", "User ID", "Service", "Date", "Status", "Total"];
    
    const rows = filteredOrders.map(order => [
      order.id,
      order.userId || "N/A",
      order.serviceId || "Multiple",
      new Date(order.createdAt).toLocaleString(),
      order.status,
      `$${(order.totalPrice || order.total || 0).toFixed(2)}`
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `orders_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return "outline";
      case 'processing':
        return "secondary";
      case 'cancelled':
        return "destructive";
      case 'pending':
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status.toLowerCase() === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status.toLowerCase() === 'processing').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status.toLowerCase() === 'cancelled').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                    <TableCell>{order.userId || "N/A"}</TableCell>
                    <TableCell>{order.serviceId || "Multiple"}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ${(order.totalPrice || order.total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewOrderDetails(order)}>
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Detailed information about order #{selectedOrder?.id.substring(0, 8)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Order ID</p>
                  <p className="text-sm">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Date</p>
                  <p className="text-sm">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Customer</p>
                  <p className="text-sm">{selectedOrder.userId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Service</p>
                  <p className="text-sm">{selectedOrder.serviceId || "Multiple"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Total</p>
                  <p className="text-sm font-bold">
                    ${(selectedOrder.totalPrice || selectedOrder.total || 0).toFixed(2)}
                  </p>
                </div>
              </div>
              
              {selectedOrder.credentials && (
                <div>
                  <p className="text-sm font-medium mb-2">Credentials</p>
                  <Card>
                    <CardContent className="p-4">
                      {Object.entries(selectedOrder.credentials).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1 border-b last:border-b-0">
                          <span className="text-sm font-medium capitalize">{key}</span>
                          <span className="text-sm">{value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {selectedOrder.products && selectedOrder.products.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Products</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.products.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell>{typeof product === 'object' && 'productId' in product ? product.productId : product.toString()}</TableCell>
                          <TableCell>{product.quantity || 1}</TableCell>
                          <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
