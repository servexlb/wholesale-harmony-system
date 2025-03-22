
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Mail, Key, PlusCircle, Trash2, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface DigitalItem {
  id: string;
  serviceId: string;
  serviceName: string;
  credentials: {
    email: string;
    password: string;
  };
  status: "available" | "delivered";
  addedAt: string;
  deliveredAt?: string;
}

// Mock data for initial demonstration
const mockServices = [
  { id: "s1", name: "Premium Email Service" },
  { id: "s2", name: "VPN Subscription" },
  { id: "s3", name: "Streaming Service" },
];

const mockInventory: DigitalItem[] = [
  {
    id: "di1",
    serviceId: "s1",
    serviceName: "Premium Email Service",
    credentials: {
      email: "user1@example.com",
      password: "securepass123"
    },
    status: "available",
    addedAt: new Date().toISOString(),
  },
  {
    id: "di2",
    serviceId: "s2",
    serviceName: "VPN Subscription",
    credentials: {
      email: "vpnuser@example.com",
      password: "vpnpass456"
    },
    status: "delivered",
    addedAt: new Date(Date.now() - 86400000).toISOString(),
    deliveredAt: new Date().toISOString(),
  },
];

const AdminDigitalInventory: React.FC = () => {
  const [inventory, setInventory] = useState<DigitalItem[]>(mockInventory);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bulkImport, setBulkImport] = useState(false);
  const [selectedService, setSelectedService] = useState(mockServices[0]?.id || "");
  const [newCredentials, setNewCredentials] = useState({ email: "", password: "" });
  const [bulkCredentials, setBulkCredentials] = useState("");
  
  const { toast } = useToast();

  const handleAddItem = () => {
    if (!selectedService || !newCredentials.email || !newCredentials.password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const serviceName = mockServices.find(s => s.id === selectedService)?.name || "";
    
    const newItem: DigitalItem = {
      id: `di${Date.now()}`,
      serviceId: selectedService,
      serviceName,
      credentials: {
        email: newCredentials.email,
        password: newCredentials.password
      },
      status: "available",
      addedAt: new Date().toISOString(),
    };

    setInventory([...inventory, newItem]);
    setNewCredentials({ email: "", password: "" });
    toast({
      title: "Item Added",
      description: "Digital inventory item has been added successfully",
    });
  };

  const handleBulkImport = () => {
    if (!selectedService || !bulkCredentials) {
      toast({
        title: "Missing Information",
        description: "Please select a service and enter credentials",
        variant: "destructive",
      });
      return;
    }

    const lines = bulkCredentials.split('\n').filter(line => line.trim());
    const serviceName = mockServices.find(s => s.id === selectedService)?.name || "";
    
    const newItems: DigitalItem[] = [];
    
    lines.forEach(line => {
      // Assuming format: email:password
      const [email, password] = line.split(':').map(part => part.trim());
      
      if (email && password) {
        newItems.push({
          id: `di${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          serviceId: selectedService,
          serviceName,
          credentials: { email, password },
          status: "available",
          addedAt: new Date().toISOString(),
        });
      }
    });

    if (newItems.length > 0) {
      setInventory([...inventory, ...newItems]);
      setBulkCredentials("");
      toast({
        title: "Bulk Import Successful",
        description: `Added ${newItems.length} items to inventory`,
      });
    } else {
      toast({
        title: "Import Failed",
        description: "No valid credentials found. Use format: email:password",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: "Digital inventory item has been removed",
    });
  };

  const availableCount = inventory.filter(item => item.status === "available").length;
  const deliveredCount = inventory.filter(item => item.status === "delivered").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Digital Inventory</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Stock
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCount}</div>
            <p className="text-xs text-gray-500">Ready to be delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredCount}</div>
            <p className="text-xs text-gray-500">Successfully delivered to customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-gray-500">Total items in inventory</p>
          </CardContent>
        </Card>
      </div>
      
      {showAddForm && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Add Digital Stock</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant={bulkImport ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBulkImport(true)}
                >
                  Bulk Import
                </Button>
                <Button 
                  variant={!bulkImport ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBulkImport(false)}
                >
                  Single Item
                </Button>
              </div>
            </div>
            <CardDescription>
              Add digital credentials that will be automatically delivered to customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <select 
                  id="service"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  {mockServices.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {!bulkImport ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      value={newCredentials.email}
                      onChange={(e) => setNewCredentials({...newCredentials, email: e.target.value})}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      type="text"
                      value={newCredentials.password}
                      onChange={(e) => setNewCredentials({...newCredentials, password: e.target.value})}
                      placeholder="password123"
                    />
                  </div>
                  <Button onClick={handleAddItem} className="w-full">
                    <Key className="h-4 w-4 mr-2" />
                    Add to Inventory
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bulkCredentials">
                      Bulk Credentials (one per line, format: email:password)
                    </Label>
                    <Textarea 
                      id="bulkCredentials"
                      value={bulkCredentials}
                      onChange={(e) => setBulkCredentials(e.target.value)}
                      placeholder="user1@example.com:password123&#10;user2@example.com:password456"
                      className="min-h-[150px]"
                    />
                  </div>
                  <Button onClick={handleBulkImport} className="w-full">
                    <Server className="h-4 w-4 mr-2" />
                    Import Bulk Credentials
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            Manage your digital credentials inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                    No inventory items found. Add stock to get started.
                  </TableCell>
                </TableRow>
              ) : (
                inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.serviceName}</TableCell>
                    <TableCell>{item.credentials.email}</TableCell>
                    <TableCell>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                        {item.credentials.password}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "available" ? "outline" : "secondary"}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(item.addedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === "available" && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDigitalInventory;
