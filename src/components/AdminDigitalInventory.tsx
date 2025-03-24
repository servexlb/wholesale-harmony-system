
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, RefreshCw, FileText, Layers, Archive } from "lucide-react";
import { toast } from "sonner";
import { getAvailableCredentials } from '@/lib/credentialService';
import { loadServices } from '@/lib/productManager';
import { Service, DigitalItem } from '@/lib/types';
import CredentialManager from '@/components/admin/CredentialManager';
import StockIssueManager from '@/components/admin/StockIssueManager';

const AdminDigitalInventory = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [inventory, setInventory] = useState<DigitalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [newCredential, setNewCredential] = useState({
    email: '',
    password: '',
    username: '',
    notes: ''
  });

  // Load services and inventory data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load services
      const services = loadServices();
      setServices(services);
      
      // Initialize inventory data structure
      const inventoryItems: DigitalItem[] = [];
      
      // For each service, get available credentials
      for (const service of services) {
        try {
          const credentials = await getAvailableCredentials(service.id);
          
          // Map credentials to the expected format
          const items = credentials.map(cred => ({
            ...cred,
            serviceName: service.name
          }));
          
          inventoryItems.push(...items);
        } catch (error) {
          console.error(`Error fetching credentials for ${service.name}:`, error);
        }
      }
      
      setInventory(inventoryItems);
      setIsLoading(false);
    };
    
    loadData();
    
    // Listen for updates to credential stock
    const handleStockUpdated = () => {
      loadData();
    };
    
    window.addEventListener('credential-stock-updated', handleStockUpdated);
    window.addEventListener('stock-issue-resolved', handleStockUpdated);
    
    return () => {
      window.removeEventListener('credential-stock-updated', handleStockUpdated);
      window.removeEventListener('stock-issue-resolved', handleStockUpdated);
    };
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    
    try {
      // Re-initialize inventory data structure
      const inventoryItems: DigitalItem[] = [];
      
      // For each service, get available credentials
      for (const service of services) {
        try {
          const credentials = await getAvailableCredentials(service.id);
          
          // Map credentials to the expected format
          const items = credentials.map(cred => ({
            ...cred,
            serviceName: service.name
          }));
          
          inventoryItems.push(...items);
        } catch (error) {
          console.error(`Error fetching credentials for ${service.name}:`, error);
        }
      }
      
      setInventory(inventoryItems);
      toast.success('Inventory refreshed');
    } catch (error) {
      console.error('Error refreshing inventory:', error);
      toast.error('Failed to refresh inventory');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding new credentials
  const handleAddCredential = async () => {
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }
    
    if (!newCredential.email || !newCredential.password) {
      toast.error('Email and password are required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Import the function dynamically
      const { addCredentialToStock } = await import('@/lib/credentialService');
      
      const success = await addCredentialToStock(selectedService.id, {
        email: newCredential.email,
        password: newCredential.password,
        username: newCredential.username || '',
        notes: newCredential.notes || ''
      });
      
      if (success) {
        toast.success(`Credential added to ${selectedService.name} stock`);
        setDialogOpen(false);
        setNewCredential({
          email: '',
          password: '',
          username: '',
          notes: ''
        });
        handleRefresh();
      } else {
        toast.error('Failed to add credential');
      }
    } catch (error) {
      console.error('Error adding credential:', error);
      toast.error('Failed to add credential');
    } finally {
      setIsLoading(false);
    }
  };

  // Group inventory items by service name
  const groupedInventory = inventory.reduce((groups, item) => {
    const serviceName = item.serviceName;
    if (!groups[serviceName]) {
      groups[serviceName] = [];
    }
    groups[serviceName].push(item);
    return groups;
  }, {} as Record<string, DigitalItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Digital Inventory</h2>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock">
            <Layers className="h-4 w-4 mr-2" />
            Credential Stock
          </TabsTrigger>
          <TabsTrigger value="issues">
            <FileText className="h-4 w-4 mr-2" />
            Stock Issues
          </TabsTrigger>
          <TabsTrigger value="archive">
            <Archive className="h-4 w-4 mr-2" />
            Assigned Items
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stock" className="space-y-4">
          <CredentialManager services={services} />
        </TabsContent>
        
        <TabsContent value="issues">
          <StockIssueManager />
        </TabsContent>
        
        <TabsContent value="archive">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Credentials</CardTitle>
              <CardDescription>
                View credentials that have been assigned to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This feature is coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add credential dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="fixed bottom-4 right-4 shadow-lg">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Credential
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Credential</DialogTitle>
            <DialogDescription>
              Add a new credential to your digital inventory
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="service">Service</Label>
              <select
                id="service"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedService?.id || ''}
                onChange={(e) => {
                  const service = services.find(s => s.id === e.target.value);
                  setSelectedService(service || null);
                }}
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={newCredential.email}
                onChange={(e) => setNewCredential(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                value={newCredential.password}
                onChange={(e) => setNewCredential(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="username">Username (Optional)</Label>
              <Input
                id="username"
                value={newCredential.username}
                onChange={(e) => setNewCredential(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={newCredential.notes}
                onChange={(e) => setNewCredential(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCredential}
              disabled={isLoading || !selectedService || !newCredential.email || !newCredential.password}
            >
              {isLoading ? 'Adding...' : 'Add to Inventory'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDigitalInventory;
