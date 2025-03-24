
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Service, Credential } from '@/lib/types';
import { addCredentialToStock } from '@/lib/credentialService';
import { Loader2, Send, PlusCircle, RefreshCw } from 'lucide-react';

interface CredentialManagerProps {
  services?: Service[];
}

export const CredentialManager: React.FC<CredentialManagerProps> = ({ 
  services = []
}) => {
  const [selectedService, setSelectedService] = useState<string>('');
  const [credentialStock, setCredentialStock] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newCredential, setNewCredential] = useState<Credential>({
    email: '',
    password: '',
    username: '',
    pinCode: '',
    notes: ''
  });

  const fetchCredentialStock = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('credential_stock')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCredentialStock(data || []);
    } catch (error) {
      console.error('Error fetching credential stock:', error);
      toast.error('Failed to load credential stock');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentialStock();

    // Listen for credential stock updates
    const handleStockUpdated = () => {
      fetchCredentialStock();
    };

    window.addEventListener('credential-stock-updated', handleStockUpdated);

    return () => {
      window.removeEventListener('credential-stock-updated', handleStockUpdated);
    };
  }, []);

  const filteredStock = selectedService
    ? credentialStock.filter(item => item.service_id === selectedService)
    : credentialStock;

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
      const success = await addCredentialToStock(selectedService, newCredential);
      
      if (success) {
        toast.success('Credential added to stock');
        setOpenAddDialog(false);
        setNewCredential({
          email: '',
          password: '',
          username: '',
          pinCode: '',
          notes: ''
        });
        fetchCredentialStock();
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Credential Stock</CardTitle>
          <CardDescription>
            Manage credentials for all services
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Credential
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Credential</DialogTitle>
                <DialogDescription>
                  Add a new credential to stock for a service
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="service">Service</Label>
                  <Select
                    value={selectedService}
                    onValueChange={setSelectedService}
                  >
                    <SelectTrigger>
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
                    type="email"
                    value={newCredential.email}
                    onChange={(e) => setNewCredential({...newCredential, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="text"
                    value={newCredential.password}
                    onChange={(e) => setNewCredential({...newCredential, password: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="username">Username (Optional)</Label>
                  <Input
                    id="username"
                    type="text"
                    value={newCredential.username}
                    onChange={(e) => setNewCredential({...newCredential, username: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="pinCode">PIN Code (Optional)</Label>
                  <Input
                    id="pinCode"
                    type="text"
                    value={newCredential.pinCode}
                    onChange={(e) => setNewCredential({...newCredential, pinCode: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={newCredential.notes}
                    onChange={(e) => setNewCredential({...newCredential, notes: e.target.value})}
                    placeholder="Any additional information"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddCredential}
                  disabled={isLoading || !selectedService || !newCredential.email || !newCredential.password}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Add to Stock
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={fetchCredentialStock} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <Label htmlFor="filter-service">Filter by Service</Label>
          <Select
            value={selectedService}
            onValueChange={setSelectedService}
          >
            <SelectTrigger id="filter-service">
              <SelectValue placeholder="All services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All services</SelectItem>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStock.length > 0 ? (
              filteredStock.map((item) => {
                const serviceName = services.find(s => s.id === item.service_id)?.name || item.service_id;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{serviceName}</TableCell>
                    <TableCell>{item.credentials.email}</TableCell>
                    <TableCell>{item.credentials.password}</TableCell>
                    <TableCell>{item.credentials.username || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  {isLoading ? 'Loading...' : 'No credentials found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Total: {filteredStock.length} credentials
        </div>
      </CardFooter>
    </Card>
  );
};

export default CredentialManager;
