import React, { useState, useEffect } from 'react';
import { PlusCircle, UploadCloud, RefreshCw, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Credential, Service } from '@/lib/types';
import { addCredentialToStock, getAvailableCredentials } from '@/lib/credentialService';

interface CredentialManagerProps {
  services: Service[];
}

const CredentialManager: React.FC<CredentialManagerProps> = ({ services }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");
  const [newCredential, setNewCredential] = useState<Credential>({
    email: '',
    password: '',
    username: '',
    notes: ''
  });
  
  useEffect(() => {
    loadInventoryData();
    
    window.addEventListener('credential-stock-updated', loadInventoryData);
    return () => {
      window.removeEventListener('credential-stock-updated', loadInventoryData);
    };
  }, []);
  
  const loadInventoryData = async () => {
    setIsLoading(true);
    
    try {
      const inventoryItems: any[] = [];
      
      for (const service of services) {
        try {
          const credentials = await getAvailableCredentials(service.id);
          
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
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddCredential = async () => {
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }
    
    if (!newCredential.email && !newCredential.username) {
      toast.error('Email or username is required');
      return;
    }
    
    if (!newCredential.password) {
      toast.error('Password is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await addCredentialToStock(selectedService, newCredential);
      
      if (success) {
        setNewCredential({
          email: '',
          password: '',
          username: '',
          notes: ''
        });
        setSelectedService("");
        setShowAddDialog(false);
        await loadInventoryData();
        
        window.dispatchEvent(new CustomEvent('credential-stock-updated'));
        
        toast.success('Credential added successfully');
      }
    } catch (error) {
      console.error('Error adding credential:', error);
      toast.error('Failed to add credential');
    } finally {
      setIsLoading(false);
    }
  };
  
  const groupedInventory = inventory.reduce((groups, item) => {
    const serviceName = item.serviceName || "Unknown Service";
    if (!groups[serviceName]) {
      groups[serviceName] = [];
    }
    groups[serviceName].push(item);
    return groups;
  }, {} as Record<string, any[]>);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Credential Inventory</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadInventoryData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Credential
          </Button>
        </div>
      </div>
      
      {Object.keys(groupedInventory).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No credentials in inventory</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Credential
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedInventory).map(([serviceName, items]) => (
            <Card key={serviceName}>
              <CardHeader className="py-4">
                <CardTitle className="text-lg">{serviceName}</CardTitle>
                <CardDescription>
                  {items.length} available credential{items.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email/Username</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const credentials = typeof item.credentials === 'object' ? item.credentials : {};
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {credentials.email || credentials.username || 'N/A'}
                          </TableCell>
                          <TableCell>
                            ••••••••
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Credential</DialogTitle>
            <DialogDescription>
              Add a credential to your inventory
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="service">Service</Label>
              <Select
                value={selectedService}
                onValueChange={setSelectedService}
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={newCredential.email}
                onChange={(e) => setNewCredential(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="username">Username (Optional)</Label>
              <Input
                id="username"
                value={newCredential.username}
                onChange={(e) => setNewCredential(prev => ({ ...prev, username: e.target.value }))}
                placeholder="username"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newCredential.password}
                onChange={(e) => setNewCredential(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={newCredential.notes || ''}
                onChange={(e) => setNewCredential(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional information"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCredential} disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Credential'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CredentialManager;
