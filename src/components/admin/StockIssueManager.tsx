
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Package, User, Clock, CreditCard, FileText } from 'lucide-react';
import { toast } from "@/lib/toast";
import { supabase } from '@/integrations/supabase/client';
import { StockRequest, Credential } from '@/lib/types';
import { useServiceManager } from '@/hooks/useServiceManager';
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    notes: '',
    pinCode: ''
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
      // Load both the stock issues and related order details
      const { data: issuesData, error: issuesError } = await supabase
        .from('stock_issue_logs')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
        
      if (issuesError) {
        throw issuesError;
      }
      
      // Fetch the associated orders to get additional customer details and options
      const orderIds = issuesData.map(issue => issue.order_id).filter(Boolean);
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('id', orderIds);
        
      if (ordersError) {
        console.error('Error fetching associated orders:', ordersError);
      }
      
      // Match orders with their issues and combine the data
      const enhancedIssues = issuesData.map(issue => {
        const service = services.find(s => s.id === issue.service_id);
        const associatedOrder = ordersData?.find(order => order.id === issue.order_id) || null;
        
        return {
          id: issue.id,
          userId: issue.user_id,
          serviceId: issue.service_id,
          serviceName: issue.service_name || (service ? service.name : "Unknown Service"),
          orderId: issue.order_id,
          status: issue.status as 'pending' | 'fulfilled' | 'cancelled',
          createdAt: issue.created_at,
          fulfilledAt: issue.fulfilled_at,
          customerName: issue.customer_name || (associatedOrder ? associatedOrder.customer_name : "Unknown Customer"),
          priority: (issue.priority as 'high' | 'medium' | 'low') || 'medium',
          notes: issue.notes || '',
          // Additional order details
          orderDetails: associatedOrder ? {
            quantity: associatedOrder.quantity,
            totalPrice: associatedOrder.total_price,
            durationMonths: associatedOrder.duration_months,
            notes: associatedOrder.notes,
            accountId: associatedOrder.account_id,
            customerEmail: associatedOrder.credentials?.email
          } : null
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
      notes: '',
      pinCode: ''
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
  
  // Format date for better display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <Badge variant="outline" className="bg-primary/10 text-primary font-medium">
                      {issue.serviceName || issue.serviceId}
                    </Badge>
                    <Badge variant={issue.priority === 'high' ? 'destructive' : 'outline'}>
                      {issue.priority} priority
                    </Badge>
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
                
                <Accordion type="single" collapsible className="w-full border-t pt-2">
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-sm py-2">
                      View Request Details
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-2">
                            <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <h4 className="text-sm font-medium">Customer</h4>
                              <p className="text-sm">{issue.customerName}</p>
                              {issue.orderDetails?.customerEmail && (
                                <p className="text-xs text-muted-foreground">{issue.orderDetails.customerEmail}</p>
                              )}
                            </div>
                          </div>
                        
                          <div className="flex items-start space-x-2">
                            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div>
                              <h4 className="text-sm font-medium">Requested On</h4>
                              <p className="text-sm">{formatDate(issue.createdAt)}</p>
                            </div>
                          </div>
                          
                          {issue.orderId && (
                            <div className="flex items-start space-x-2">
                              <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <h4 className="text-sm font-medium">Order ID</h4>
                                <p className="text-sm font-mono">{issue.orderId}</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          {issue.orderDetails?.quantity && (
                            <div className="flex items-start space-x-2">
                              <Package className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <h4 className="text-sm font-medium">Quantity</h4>
                                <p className="text-sm">{issue.orderDetails.quantity}</p>
                              </div>
                            </div>
                          )}
                          
                          {issue.orderDetails?.totalPrice && (
                            <div className="flex items-start space-x-2">
                              <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <h4 className="text-sm font-medium">Order Total</h4>
                                <p className="text-sm">${issue.orderDetails.totalPrice}</p>
                              </div>
                            </div>
                          )}
                          
                          {issue.orderDetails?.durationMonths && (
                            <div className="flex items-start space-x-2">
                              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <h4 className="text-sm font-medium">Duration</h4>
                                <p className="text-sm">{issue.orderDetails.durationMonths} month{issue.orderDetails.durationMonths > 1 ? 's' : ''}</p>
                              </div>
                            </div>
                          )}
                          
                          {issue.orderDetails?.accountId && (
                            <div className="flex items-start space-x-2">
                              <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                              <div>
                                <h4 className="text-sm font-medium">Account ID</h4>
                                <p className="text-sm">{issue.orderDetails.accountId}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {(issue.notes || issue.orderDetails?.notes) && (
                        <div className="mt-4 border-t pt-3">
                          <h4 className="text-sm font-medium mb-1">Notes</h4>
                          {issue.notes && (
                            <p className="text-sm bg-muted p-2 rounded mb-2">{issue.notes}</p>
                          )}
                          {issue.orderDetails?.notes && issue.orderDetails.notes !== issue.notes && (
                            <p className="text-sm bg-muted/50 p-2 rounded">Order note: {issue.orderDetails.notes}</p>
                          )}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
                {selectedIssue?.orderDetails?.accountId && (
                  <p className="text-sm mt-1">
                    <span className="font-medium">Account ID:</span> {selectedIssue.orderDetails.accountId}
                  </p>
                )}
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
                <Label htmlFor="pinCode">PIN Code (Optional)</Label>
                <Input
                  id="pinCode"
                  value={newCredential.pinCode || ''}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, pinCode: e.target.value }))}
                  placeholder="1234"
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
