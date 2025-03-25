
import { supabase } from '@/integrations/supabase/client';
import { Credential, StockRequest } from '@/lib/types';
import { toast } from '@/lib/toast';

// Check if stock is available for a given service
export const checkStockAvailability = async (serviceId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('credential_stock')
      .select('id')
      .eq('service_id', serviceId)
      .eq('status', 'available')
      .limit(1);
    
    if (error) {
      console.error('Error checking stock availability:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkStockAvailability:', error);
    return false;
  }
};

// Add credentials to stock
export const addCredentialToStock = async (
  serviceId: string, 
  credentials: Credential,
  status: 'available' | 'assigned' = 'available'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('credential_stock')
      .insert({
        service_id: serviceId,
        credentials: credentials,
        status: status
      });
    
    if (error) {
      console.error('Error adding credential to stock:', error);
      toast.error('Failed to add credential to stock');
      return false;
    }
    
    toast.success('Credential added to stock successfully');
    return true;
  } catch (error) {
    console.error('Error in addCredentialToStock:', error);
    toast.error('Failed to add credential to stock');
    return false;
  }
};

// Create a stock request when no credentials are available
export const createStockRequest = async (
  userId: string,
  serviceId: string,
  serviceName: string,
  orderId: string,
  customerName?: string,
  notes?: string
): Promise<boolean> => {
  try {
    // Fetch user name for display in the stock issue
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();
    
    const customerDisplayName = customerName || (userData ? userData.name : 'Unknown Customer');
    
    // Create a stock request
    const { error: requestError } = await supabase
      .from('stock_issue_logs')
      .insert({
        user_id: userId,
        service_id: serviceId,
        order_id: orderId,
        status: 'pending',
        notes: notes || 'Automatic request due to empty stock'
      });
    
    if (requestError) {
      console.error('Error creating stock request:', requestError);
      return false;
    }
    
    // Create admin notification
    const { error: notificationError } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'stock',
        title: 'Stock Replenishment Needed',
        message: `A customer has requested ${serviceName} but stock is empty.`,
        customer_id: userId,
        customer_name: customerDisplayName,
        service_id: serviceId,
        service_name: serviceName,
        is_read: false
      });
    
    if (notificationError) {
      console.error('Error creating admin notification:', notificationError);
    }
    
    return true;
  } catch (error) {
    console.error('Error in createStockRequest:', error);
    return false;
  }
};

// Get all available credentials
export const getAvailableCredentials = async (serviceId: string) => {
  try {
    const { data, error } = await supabase
      .from('credential_stock')
      .select('*')
      .eq('service_id', serviceId)
      .eq('status', 'available');
      
    if (error) {
      console.error('Error fetching available credentials:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAvailableCredentials:', error);
    return [];
  }
};

// Get pending stock requests
export const getPendingStockRequests = async (): Promise<StockRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('stock_issue_logs')
      .select('*, profiles:user_id(*)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pending stock requests:', error);
      return [];
    }
    
    return data.map(item => {
      const profile = item.profiles as any;
      return {
        id: item.id,
        userId: item.user_id,
        serviceId: item.service_id,
        orderId: item.order_id,
        status: item.status as "pending" | "fulfilled" | "cancelled",
        createdAt: item.created_at,
        customerName: profile ? profile.name || 'Unknown' : 'Unknown',
        notes: item.notes || ''
      };
    });
  } catch (error) {
    console.error('Error in getPendingStockRequests:', error);
    return [];
  }
};

// Get all stock issues
export const getStockIssues = async () => {
  try {
    const { data, error } = await supabase
      .from('stock_issue_logs')
      .select('*, profiles:user_id(*)')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching stock issues:', error);
      return [];
    }
    
    return data.map(item => {
      const profile = item.profiles as any;
      return {
        id: item.id,
        userId: item.user_id,
        serviceId: item.service_id,
        orderId: item.order_id,
        status: item.status as "pending" | "fulfilled" | "cancelled",
        createdAt: item.created_at,
        resolvedAt: item.resolved_at,
        customerName: profile ? profile.name || 'Unknown' : 'Unknown',
        notes: item.notes || ''
      };
    });
  } catch (error) {
    console.error('Error in getStockIssues:', error);
    return [];
  }
};

// Resolve a stock issue
export const resolveStockIssue = async (issueId: string, status: 'fulfilled' | 'cancelled') => {
  try {
    const { error } = await supabase
      .from('stock_issue_logs')
      .update({
        status: status,
        resolved_at: new Date().toISOString()
      })
      .eq('id', issueId);
      
    if (error) {
      console.error('Error resolving stock issue:', error);
      return false;
    }
    
    // Dispatch an event to refresh the UI
    window.dispatchEvent(new CustomEvent('stock-issue-resolved'));
    
    return true;
  } catch (error) {
    console.error('Error in resolveStockIssue:', error);
    return false;
  }
};

// Fulfill a stock request
export const fulfillStockRequest = async (
  requestId: string,
  orderId: string,
  userId: string,
  serviceId: string,
  credentials: Credential
): Promise<boolean> => {
  try {
    // Add credential to stock
    const { error: stockError } = await supabase
      .from('credential_stock')
      .insert({
        service_id: serviceId,
        credentials: credentials,
        status: 'assigned',
        user_id: userId,
        order_id: orderId
      });
    
    if (stockError) {
      console.error('Error adding credential to stock:', stockError);
      return false;
    }
    
    // Update the order with the credential information
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        credentials: credentials,
        credential_status: 'assigned',
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', orderId);
      
    if (orderError) {
      console.error('Error updating order with credentials:', orderError);
      return false;
    }
    
    // Mark the stock request as fulfilled
    const { error: requestError } = await supabase
      .from('stock_issue_logs')
      .update({
        status: 'fulfilled',
        resolved_at: new Date().toISOString()
      })
      .eq('id', requestId);
      
    if (requestError) {
      console.error('Error updating stock request status:', requestError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in fulfillStockRequest:', error);
    return false;
  }
};
