import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Credential } from "@/lib/types";
import { mapSupabaseCredentialToLocal } from "./credentialUtils";

/**
 * Adds a new credential to stock
 */
export const addCredentialToStock = async (serviceId: string, credentials: Credential) => {
  try {
    const { data, error } = await supabase
      .from('credential_stock')
      .insert({
        service_id: serviceId,
        credentials: credentials,
        status: 'available'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Dispatch event to notify listeners
    window.dispatchEvent(new CustomEvent('credential-stock-updated'));
    window.dispatchEvent(new CustomEvent('subscription-added', { 
      detail: { serviceId }
    }));
    
    // Return the mapped data
    return data ? mapSupabaseCredentialToLocal(data) : null;
  } catch (error: any) {
    console.error('Error adding credential to stock:', error);
    toast.error('Failed to add credential to stock');
    return null;
  }
};

/**
 * Gets available credentials for a service
 */
export const getAvailableCredentials = async (serviceId: string) => {
  try {
    const { data, error } = await supabase
      .from('credential_stock')
      .select('*')
      .eq('service_id', serviceId)
      .eq('status', 'available');
    
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching available credentials:', error);
    return [];
  }
};

/**
 * Assigns a credential to a user
 */
export const assignCredentialToUser = async (serviceId: string, userId: string, orderId?: string) => {
  try {
    // Call our database function to find and assign a credential
    const { data, error } = await supabase
      .rpc('assign_credential', {
        p_service_id: serviceId,
        p_user_id: userId,
        p_order_id: orderId || null
      });
    
    if (error) throw error;
    
    if (!data) {
      // Log stock issue if no credential was assigned
      await logStockIssue(serviceId, userId, orderId);
      return null;
    }
    
    // Get the full credential details
    const { data: credentialData, error: credentialError } = await supabase
      .from('credential_stock')
      .select('*')
      .eq('id', data)
      .single();
    
    if (credentialError) throw credentialError;
    
    // Dispatch event to notify listeners
    window.dispatchEvent(new CustomEvent('credential-stock-updated'));
    
    return credentialData;
  } catch (error: any) {
    console.error('Error assigning credential:', error);
    toast.error('Failed to assign credential');
    return null;
  }
};

/**
 * Logs a stock issue when a credential couldn't be assigned
 */
export const logStockIssue = async (serviceId: string, userId: string, orderId?: string) => {
  try {
    const { data, error } = await supabase
      .from('stock_issue_logs')
      .insert({
        user_id: userId,
        service_id: serviceId,
        order_id: orderId || null,
        status: 'pending'
      });
    
    if (error) throw error;
    
    // Notify admin about stock issue
    await notifyAdminAboutStockIssue(serviceId, userId);
    
    return data;
  } catch (error: any) {
    console.error('Error logging stock issue:', error);
    return null;
  }
};

/**
 * Notifies admin about stock issue
 */
export const notifyAdminAboutStockIssue = async (serviceId: string, userId: string) => {
  try {
    // Get service name
    const serviceName = await getServiceName(serviceId);
    
    // Add notification for admin
    const { error } = await supabase
      .from('admin_notifications')
      .insert({
        type: 'stock',
        message: `Out of stock for ${serviceName}`,
        user_id: userId,
        service_id: serviceId,
        title: 'Stock Issue',
        link_to: '/admin/inventory'
      });
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Error notifying admin about stock issue:', error);
  }
};

/**
 * Helper function to get service name
 */
export const getServiceName = async (serviceId: string): Promise<string> => {
  // In a real app, this would fetch from the services table
  // For now, we'll use a mock implementation
  
  // Try to get from localStorage first
  const storedServices = localStorage.getItem('services');
  if (storedServices) {
    try {
      const services = JSON.parse(storedServices);
      const service = services.find((s: any) => s.id === serviceId);
      if (service && service.name) {
        return service.name;
      }
    } catch (e) {
      console.error('Error parsing stored services:', e);
    }
  }
  
  // Fallback to generic name
  return `Service ${serviceId}`;
};

/**
 * Updates a subscription with credential stock
 */
export const linkCredentialToSubscription = async (subscriptionId: string, credentialStockId: string) => {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ credential_stock_id: credentialStockId })
      .eq('id', subscriptionId);
    
    if (error) throw error;
    
    // Dispatch event to notify listeners about this change
    window.dispatchEvent(new CustomEvent('subscription-updated'));
    
    return true;
  } catch (error: any) {
    console.error('Error linking credential to subscription:', error);
    return false;
  }
};

/**
 * Gets stock issues for admin panel
 */
export const getStockIssues = async () => {
  try {
    const { data, error } = await supabase
      .from('stock_issue_logs')
      .select(`
        *,
        profiles:user_id(name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error('Error fetching stock issues:', error);
    return [];
  }
};

/**
 * Resolves a stock issue by assigning a credential
 */
export const resolveStockIssue = async (issueId: string, credentialId: string) => {
  try {
    // Get the issue details
    const { data: issue, error: issueError } = await supabase
      .from('stock_issue_logs')
      .select('*')
      .eq('id', issueId)
      .single();
    
    if (issueError) throw issueError;
    
    // Assign the credential
    const { error: updateError } = await supabase
      .from('credential_stock')
      .update({
        status: 'assigned',
        user_id: issue.user_id,
        order_id: issue.order_id
      })
      .eq('id', credentialId);
    
    if (updateError) throw updateError;
    
    // Update the issue status
    const { error: resolveError } = await supabase
      .from('stock_issue_logs')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', issueId);
    
    if (resolveError) throw resolveError;
    
    // If there's an order_id, update the subscription
    if (issue.order_id) {
      // Find subscription related to this order
      const { data: subscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', issue.user_id)
        .eq('service_id', issue.service_id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (!subError && subscriptions && subscriptions.length > 0) {
        await linkCredentialToSubscription(subscriptions[0].id, credentialId);
      }
    }
    
    // Dispatch event to notify listeners
    window.dispatchEvent(new CustomEvent('credential-stock-updated'));
    window.dispatchEvent(new CustomEvent('stock-issue-resolved'));
    
    return true;
  } catch (error: any) {
    console.error('Error resolving stock issue:', error);
    toast.error('Failed to resolve stock issue');
    return false;
  }
};

/**
 * Syncs subscriptions with credential stock
 * This function can be called periodically to ensure all subscriptions have credential stock entries
 */
export const syncSubscriptionsWithStock = async () => {
  try {
    // Get all subscriptions that have credentials but no credential_stock_id
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('*')
      .is('credential_stock_id', null)
      .not('credentials', 'is', null);
    
    if (error) throw error;
    
    if (!subscriptions || subscriptions.length === 0) {
      return { added: 0 };
    }
    
    let addedCount = 0;
    
    // Add each subscription's credentials to stock
    for (const subscription of subscriptions) {
      if (subscription.credentials && subscription.service_id) {
        // Fix: Type check and safe access to credential properties
        const credentials: Credential = {
          email: typeof subscription.credentials === 'object' && subscription.credentials?.email ? 
            String(subscription.credentials.email) : '',
          password: typeof subscription.credentials === 'object' && subscription.credentials?.password ? 
            String(subscription.credentials.password) : '',
          username: typeof subscription.credentials === 'object' && subscription.credentials?.username ? 
            String(subscription.credentials.username) : '',
          pinCode: typeof subscription.credentials === 'object' && subscription.credentials?.pinCode ? 
            String(subscription.credentials.pinCode) : ''
        };
        
        // Add to credential stock
        const newCredential = await addCredentialToStock(subscription.service_id, credentials);
        
        if (newCredential) {
          // Link the credential back to the subscription
          await linkCredentialToSubscription(subscription.id, newCredential.id);
          addedCount++;
        }
      }
    }
    
    if (addedCount > 0) {
      toast.success(`Synced ${addedCount} subscriptions with inventory`);
    }
    
    return { added: addedCount };
  } catch (error: any) {
    console.error('Error syncing subscriptions with stock:', error);
    return { added: 0, error };
  }
};
