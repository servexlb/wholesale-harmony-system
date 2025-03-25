
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, FileText, Layers, Archive } from "lucide-react";
import { toast } from "sonner";
import { loadServices } from '@/lib/productManager';
import { Service, DigitalItem } from '@/lib/types';
import CredentialManager from '@/components/admin/CredentialManager';
import StockIssueManager from '@/components/admin/StockIssueManager';

// Create a StockIssueManager component since it's missing
const StockIssueManager = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Issues</CardTitle>
        <CardDescription>
          Manage pending stock requests and issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This feature is coming soon.
        </p>
      </CardContent>
    </Card>
  );
};

const AdminDigitalInventory = () => {
  const [activeTab, setActiveTab] = useState('stock');
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);

  // Load services
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load services
      const services = loadServices();
      setServices(services);
      setIsLoading(false);
    };
    
    loadData();
    
    // Listen for updates
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Digital Inventory</h2>
        <Button variant="outline" onClick={() => window.location.reload()} disabled={isLoading}>
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
    </div>
  );
};

export default AdminDigitalInventory;
