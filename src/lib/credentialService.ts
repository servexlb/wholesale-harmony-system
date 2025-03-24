
import { supabase } from '@/integrations/supabase/client';
import { CredentialStock, StockRequest, Credential } from '@/lib/types';
import { toast } from 'sonner';

// Function to add a credential to stock
export const addCredentialToStock = async (serviceId: string, credentials: Credential): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('credential_stock')
      .insert({
        service_id: serviceId,
        credentials: credentials,
        status: 'available',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding credential to stock:', error);
      return false;
    }
    
    // Dispatch an event to notify UI components
    const stockUpdatedEvent = new CustomEvent('credential-stock-updated');
    window.dispatchEvent(stockUpdatedEvent);
    
    return true;
  } catch (error) {
    console.error('Error in addCredentialToStock:', error);
    return false;
  }
};

// Function to check if stock is available for a service
export const checkStockAvailability = async (serviceId: string): Promise<boolean> => {
  try {
    // Check for available credentials in the stock
    const { data, error, count } = await supabase
      .from('credential_stock')
      .select('id', { count: 'exact' })
      .eq('service_id', serviceId)
      .eq('status', 'available')
      .limit(1);
      
    if (error) {
      console.error('Error checking stock availability:', error);
      return false;
    }
    
    return count !== null && count > 0;
  } catch (error) {
    console.error('Error in checkStockAvailability:', error);
    return false;
  }
};

// Function to create a pending stock request
export const createStockRequest = async (
  userId: string,
  serviceId: string,
  serviceName: string,
  orderId: string,
  customerName?: string,
  notes?: string
): Promise<boolean> => {
  try {
    // Create a stock request record
    const { data, error } = await supabase
      .from('stock_issue_logs')
      .insert({
        user_id: userId,
        service_id: serviceId,
        order_id: orderId,
        notes: notes || `Pending request for ${serviceName}`,
        status: 'pending'
      });
      
    if (error) {
      console.error('Error creating stock request:', error);
      toast.error('Failed to create pending request');
      return false;
    }
    
    // Create admin notification for the new pending request
    await createStockNotification(userId, serviceId, serviceName, customerName);
    
    toast.success('Stock request created. You will be notified when it\'s fulfilled.');
    return true;
  } catch (error) {
    console.error('Error in createStockRequest:', error);
    return false;
  }
};

// Function to get all pending stock requests
export const getStockIssues = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('stock_issue_logs')
      .select(`
        *,
        profiles:user_id (
          name,
          email
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching stock issues:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getStockIssues:', error);
    return [];
  }
};

// Function to get available credentials for a service
export const getAvailableCredentials = async (serviceId: string): Promise<any[]> => {
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

// Function to resolve a stock issue by assigning a credential
export const resolveStockIssue = async (issueId: string, credentialId: string): Promise<boolean> => {
  try {
    // Get the issue details first
    const { data: issueData, error: issueError } = await supabase
      .from('stock_issue_logs')
      .select('*')
      .eq('id', issueId)
      .single();
      
    if (issueError || !issueData) {
      console.error('Error fetching issue details:', issueError);
      return false;
    }
    
    // Update the credential stock status
    const { error: updateError } = await supabase
      .from('credential_stock')
      .update({
        status: 'assigned',
        user_id: issueData.user_id,
        order_id: issueData.order_id
      })
      .eq('id', credentialId);
      
    if (updateError) {
      console.error('Error updating credential:', updateError);
      return false;
    }
    
    // Update the issue to mark it as resolved
    const { error: resolveError } = await supabase
      .from('stock_issue_logs')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', issueId);
      
    if (resolveError) {
      console.error('Error resolving stock issue:', resolveError);
      return false;
    }
    
    // Create a customer notification
    await createCustomerNotification(issueData.user_id, issueData.service_id);
    
    // Dispatch an event to notify UI components
    const stockIssueResolvedEvent = new CustomEvent('stock-issue-resolved');
    window.dispatchEvent(stockIssueResolvedEvent);
    
    return true;
  } catch (error) {
    console.error('Error in resolveStockIssue:', error);
    return false;
  }
};

// Create admin notification for a stock issue
const createStockNotification = async (
  userId: string, 
  serviceId: string, 
  serviceName: string,
  customerName?: string
) => {
  try {
    const { error } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'stock',
        user_id: userId,
        service_id: serviceId,
        service_name: serviceName,
        customer_name: customerName || 'Customer',
        title: 'Stock Request',
        message: `${customerName || 'A customer'} has requested ${serviceName} but stock is depleted.`,
        link_to: '/admin/stock-issues',
        is_read: false,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error creating admin notification:', error);
    }
  } catch (error) {
    console.error('Error in createStockNotification:', error);
  }
};

// Create customer notification for a resolved stock issue
const createCustomerNotification = async (userId: string, serviceId: string) => {
  try {
    // This would use your customer notification system
    // For now, we'll just console log it
    console.log(`Notification to user ${userId} for service ${serviceId} - Your request has been fulfilled`);
    
    // In a real system, you'd create a customer notification in the database
    // and have a UI component to display it
  } catch (error) {
    console.error('Error in createCustomerNotification:', error);
  }
};
