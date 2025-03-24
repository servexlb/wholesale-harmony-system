
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { getPendingStockRequests, getStockIssues, resolveStockIssue, fulfillStockRequest } from '@/lib/credentialService';
import { loadServices } from '@/lib/productManager';
import { StockRequest, Credential } from '@/lib/types';

const StockIssueManager = () => {
  const [issues, setIssues] = useState<StockRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<StockRequest | null>(null);
  const [services, setServices] = useState<any[]>([]);
  
  // New credential state
  const [newCredential, setNewCredential] = useState<Credential>({
    email: '',
    password: '',
    username: '',
    notes: ''
  });
  
  // Load stock issues
  useEffect(() => {
    loadIssues();
    
    // Load services for service names
    const availableServices = loadServices();
    setServices(availableServices);
    
    // Handle stock issue resolution
    const handleStockIssueResolved = () => {
      loadIssues();
    };
    
    window.addEventListener('stock-issue-resolved', handleStockIssueResolved);
    
    return () => {
      window.removeEventListener('stock-issue-resolved', handleStockIssueResolved);
    };
  }, []);
  
  const loadIssues = async () => {
    setIsLoading(true);
    
    try {
      const issues = await getPendingStockRequests();
      setIssues(issues);
    } catch (error) {
      console.error('Error loading stock issues:', error);
      toast.error('Failed to load stock issues');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get service name by ID
  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service ? service.name : 'Unknown Service';
  };
  
  // Handle resolving an issue as cancelled
  const handleCancelIssue = async (issue: StockRequest) => {
    try {
      await resolveStockIssue(issue.id, 'cancelled');
      toast.success('Issue marked as cancelled');
      loadIssues();
    } catch (error) {
      console.error('Error cancelling issue:', error);
      toast.error('Failed to cancel issue');
    }
  };
  
  // Handle opening the resolve dialog
  const handleOpenResolveDialog = (issue: StockRequest) => {
    setSelectedIssue(issue);
    setNewCredential({
      email: '',
      password: '',
      username: '',
      notes: ''
    });
    setShowResolveDialog(true);
  };
  
  // Handle resolving an issue by providing credentials
  const handleResolveWithCredentials = async () => {
    if (!selectedIssue) return;
    
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
      const success = await fulfillStockRequest(
        selectedIssue.id,
        selectedIssue.orderId,
        selectedIssue.userId,
        selectedIssue.serviceId,
        newCredential
      );
      
      if (success) {
        toast.success('Issue resolved successfully');
        setShowResolveDialog(false);
        loadIssues();
      } else {
        toast.error('Failed to resolve issue');
      }
    } catch (error) {
      console.error('Error resolving issue:', error);
      toast.error('Failed to resolve issue');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Issues</CardTitle>
        <CardDescription>
          Handle pending stock requests from customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">Loading stock issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No pending stock issues</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map(issue => (
              <div key={issue.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{getServiceName(issue.serviceId)}</h3>
                    <p className="text-sm text-muted-foreground">
                      Requested by {issue.customerName} on {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                    {issue.notes && (
                      <p className="text-sm mt-2 bg-muted p-2 rounded">"{issue.notes}"</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleCancelIssue(issue)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleOpenResolveDialog(issue)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Resolve Issue Dialog */}
        <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Stock Issue</DialogTitle>
              <DialogDescription>
                Provide credentials to fulfill this customer request
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="bg-muted p-3 rounded-md">
                <h3 className="font-medium mb-1">
                  {selectedIssue && getServiceName(selectedIssue.serviceId)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customer: {selectedIssue?.customerName}
                </p>
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
              <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleResolveWithCredentials} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Provide Credentials'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StockIssueManager;
