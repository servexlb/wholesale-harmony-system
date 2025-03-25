
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Package } from 'lucide-react';
import { toast } from "@/lib/toast";
import { supabase } from '@/integrations/supabase/client';
import { StockRequest, Credential } from '@/lib/types';
import { useServiceManager } from '@/hooks/useServiceManager';
import { Badge } from "@/components/ui/badge";

const StockIssueManagerComponent = () => {
  const [issues, setIssues] = useState<StockRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<StockRequest | null>(null);
  const { services } = useServiceManager();
  
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
      const { data, error } = await supabase
        .from('stock_issue_logs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Get service names for better display
      const enhancedIssues = data.map(issue => {
        const service = services.find(s => s.id === issue.service_id);
        
        return {
          id: issue.id,
          userId: issue.user_id,
          serviceId: issue.service_id,
          serviceName: issue.service_name || (service ? service.name : "Unknown Service"),
          orderId: issue.order_id,
          status: issue.status as 'pending' | 'fulfilled' | 'cancelled',
          createdAt: issue.created_at,
          fulfilledAt: issue.fulfilled_at,
          customerName: issue.customer_name || "Unknown Customer",
          priority: (issue.priority as 'high' | 'medium' | 'low') || 'medium',
          notes: issue.notes || ''
        };
      });
      
      setIssues(enhancedIssues);
    } catch (error) {
      console.error('Error loading stock issues:', error);
      toast.error('Failed to load stock issues');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle resolving an issue as cancelled
  const handleCancelIssue = async (issue: StockRequest) => {
    try {
      const { error } = await supabase
        .from('stock_issue_logs')
        .update({
          status: 'cancelled',
          resolved_at: new Date().toISOString()
        })
        .eq('id', issue.id);
        
      if (error) {
        throw error;
      }
      
      toast.success('Issue marked as cancelled');
      loadIssues();
      
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('stock-issue-resolved'));
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
      // First, add the credential to the stock with assigned status
      const stockId = `stock-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      
      const { error: stockError } = await supabase
        .from('credential_stock')
        .insert({
          id: stockId,
          service_id: selectedIssue.serviceId,
          credentials: newCredential,
          status: 'assigned',
          user_id: selectedIssue.userId,
          order_id: selectedIssue.orderId,
          created_at: new Date().toISOString()
        });
        
      if (stockError) {
        throw stockError;
      }
      
      // Update the order with the credentials
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          credentials: newCredential,
          credential_status: 'assigned',
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', selectedIssue.orderId);
        
      if (orderError) {
        console.error('Error updating order:', orderError);
      }
      
      // Update the stock issue status
      const { error: issueError } = await supabase
        .from('stock_issue_logs')
        .update({
          status: 'fulfilled',
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', selectedIssue.id);
        
      if (issueError) {
        throw issueError;
      }
      
      toast.success('Issue resolved successfully');
      setShowResolveDialog(false);
      loadIssues();
      
      // Dispatch events for UI updates
      window.dispatchEvent(new CustomEvent('credential-added'));
      window.dispatchEvent(new CustomEvent('stock-issue-resolved'));
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stock Issues</CardTitle>
            <CardDescription>
              Handle pending stock requests from customers
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadIssues}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
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
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-primary" />
                      <Badge variant="outline" className="bg-primary/10 text-primary font-medium">
                        {issue.serviceName || issue.serviceId}
                      </Badge>
                    </div>
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
              <div className="bg-primary/10 p-3 rounded-md border border-primary/20">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="h-5 w-5 text-primary" />
                  <h3 className="font-medium text-primary">
                    {selectedIssue?.serviceName}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Customer: {selectedIssue?.customerName}
                </p>
                {selectedIssue?.notes && (
                  <p className="text-sm mt-2 italic">
                    Note: "{selectedIssue.notes}"
                  </p>
                )}
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
                  value={newCredential.username || ''}
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

export default StockIssueManagerComponent;
