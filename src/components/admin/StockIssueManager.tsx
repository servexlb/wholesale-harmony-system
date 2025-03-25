
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Package, User, Clock, CreditCard, FileText, Filter } from 'lucide-react';
import { toast } from "@/lib/toast";
import { supabase } from '@/integrations/supabase/client';
import { StockRequest, Credential } from '@/lib/types';
import { useServiceManager } from '@/hooks/useServiceManager';
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const StockIssueManagerComponent = () => {
  const [issues, setIssues] = useState<StockRequest[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<StockRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<StockRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const { services } = useServiceManager();
  
  const [newCredential, setNewCredential] = useState<Credential>({
    email: '',
    password: '',
    username: '',
    notes: '',
    pinCode: ''
  });
  
  useEffect(() => {
    loadIssues();
    
    const handleStockIssueResolved = () => {
      loadIssues();
    };
    
    window.addEventListener('stock-issue-resolved', handleStockIssueResolved);
    
    return () => {
      window.removeEventListener('stock-issue-resolved', handleStockIssueResolved);
    };
  }, []);

  useEffect(() => {
    filterIssues();
  }, [issues, statusFilter, searchTerm]);
  
  const filterIssues = () => {
    let result = [...issues];
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(issue => issue.status === statusFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(issue => 
        issue.productName?.toLowerCase().includes(search) ||
        issue.customerName?.toLowerCase().includes(search) ||
        issue.orderId.toLowerCase().includes(search)
      );
    }
    
    setFilteredIssues(result);
  };
  
  const loadIssues = async () => {
    setIsLoading(true);
    
    try {
      const { data: issuesData, error: issuesError } = await supabase
        .from('stock_issue_logs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (issuesError) {
        throw issuesError;
      }
      
      const orderIds = issuesData.map(issue => issue.order_id).filter(Boolean);
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .in('id', orderIds);
        
      if (ordersError) {
        console.error('Error fetching associated orders:', ordersError);
      }
      
      const enhancedIssues = issuesData.map(issue => {
        const service = services.find(s => s.id === issue.service_id);
        const associatedOrder = ordersData?.find(order => order.id === issue.order_id) || null;
        
        const productName = associatedOrder?.service_name || service?.name || "Unknown Service";
        
        let customerEmail = '';
        if (associatedOrder?.credentials && typeof associatedOrder.credentials === 'object') {
          const credentials = associatedOrder.credentials as any;
          customerEmail = credentials.email || '';
        }
        
        return {
          id: issue.id,
          userId: issue.user_id,
          serviceId: issue.service_id,
          productName,
          serviceName: productName,
          orderId: issue.order_id,
          status: issue.status as 'pending' | 'fulfilled' | 'cancelled',
          createdAt: issue.created_at,
          fulfilledAt: issue.fulfilled_at,
          customerName: issue.customer_name || "Unknown Customer",
          priority: (issue.priority as 'high' | 'medium' | 'low') || 'medium',
          notes: issue.notes || '',
          orderDetails: associatedOrder ? {
            quantity: associatedOrder.quantity,
            totalPrice: associatedOrder.total_price,
            durationMonths: associatedOrder.duration_months,
            notes: associatedOrder.notes,
            accountId: associatedOrder.account_id,
            customerEmail: customerEmail
          } : undefined
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
      
      window.dispatchEvent(new CustomEvent('stock-issue-resolved'));
    } catch (error) {
      console.error('Error cancelling issue:', error);
      toast.error('Failed to cancel issue');
    }
  };
  
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
      console.log('Resolving issue with credentials:', newCredential);
      console.log('Selected issue:', selectedIssue);
      
      // Add credential to stock as assigned
      const { data: stockData, error: stockError } = await supabase
        .from('credential_stock')
        .insert({
          service_id: selectedIssue.serviceId,
          credentials: newCredential,
          status: 'assigned',
          user_id: selectedIssue.userId,
          order_id: selectedIssue.orderId
        })
        .select();
        
      if (stockError) {
        throw stockError;
      }
      
      console.log('Added credential to stock:', stockData);
      
      // Update the order with the credentials
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          credentials: newCredential,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', selectedIssue.orderId);
        
      if (orderError) {
        console.error('Error updating order:', orderError);
        toast.error('Error updating order');
        return;
      }
      
      console.log('Updated order with credentials');
      
      // Update the stock issue status
      const { error: issueError } = await supabase
        .from('stock_issue_logs')
        .update({
          status: 'fulfilled',
          fulfilled_at: new Date().toISOString()
        })
        .eq('id', selectedIssue.id);
        
      if (issueError) {
        console.error('Error updating stock issue:', issueError);
        toast.error('Error updating stock issue');
        return;
      }
      
      console.log('Updated stock issue status');
      
      toast.success('Issue resolved successfully');
      setShowResolveDialog(false);
      loadIssues();
      
      // Dispatch events to notify other components
      window.dispatchEvent(new CustomEvent('credential-added'));
      window.dispatchEvent(new CustomEvent('stock-issue-resolved'));
    } catch (error) {
      console.error('Error resolving issue:', error);
      toast.error('Failed to resolve issue');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'fulfilled': return 'default';  // Changed from 'success' to 'default'
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stock Issues</CardTitle>
            <CardDescription>
              Handle stock requests from customers
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadIssues}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4 gap-4">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
            <Select 
              value={statusFilter} 
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All Issues</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <Input
            placeholder="Search service or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>
        
        {isLoading ? (
          <div className="text-center py-6">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">Loading stock issues...</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No stock issues found</p>
            {statusFilter !== 'all' && (
              <p className="text-sm text-muted-foreground mt-2">
                Try changing your filter to see more results
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map(issue => (
              <div key={issue.id} className={`border rounded-lg p-4 ${issue.status === 'fulfilled' ? 'bg-green-50/20 border-green-200' : issue.status === 'cancelled' ? 'bg-red-50/20 border-red-200' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-medium mb-1 flex items-center">
                      <Package className="h-5 w-5 text-primary mr-2" />
                      {issue.productName}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="bg-primary/10 text-primary font-medium">
                        Service ID: {issue.serviceId}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(issue.status)}>
                        {issue.status}
                      </Badge>
                      <Badge variant={issue.priority === 'high' ? 'destructive' : 'outline'}>
                        {issue.priority} priority
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {issue.status === 'pending' && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-1 mb-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Customer: <span className="font-medium">{issue.customerName}</span></span>
                  {issue.orderDetails?.customerEmail && (
                    <span className="text-sm text-muted-foreground">({issue.orderDetails.customerEmail})</span>
                  )}
                </div>
                
                {issue.status !== 'pending' && (
                  <div className="text-sm text-muted-foreground mb-2">
                    {issue.status === 'fulfilled' ? (
                      <span>Resolved on: {formatDate(issue.fulfilledAt || '')}</span>
                    ) : (
                      <span>Cancelled on: {formatDate(issue.fulfilledAt || '')}</span>
                    )}
                  </div>
                )}
                
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
                  <h3 className="font-medium text-primary text-lg">
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
                  value={newCredential.email || ''}
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
                  value={newCredential.password || ''}
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
