import { supabase } from '@/integrations/supabase/client';
import { Credential } from '@/lib/types';
import { toast } from '@/lib/toast';

// Function to convert subscription data format to credential stock format
export const convertSubscriptionToStock = (subscriptionData: any): Credential => {
  if (!subscriptionData.credentials) {
    return {
      email: '',
      password: '',
      username: '',
      pinCode: ''
    };
  }

  const { email, password, username, pinCode, notes } = subscriptionData.credentials;
  
  return {
    email: email || '',
    password: password || '',
    username: username || '',
    pinCode: pinCode || '',
    notes: notes || ''
  };
};

// Function to assign credentials to customer and send notification
export const assignCredentialsToCustomer = async (
  userId: string, 
  serviceId: string, 
  orderId: string
): Promise<{success: boolean, credentials?: Credential}> => {
  try {
    // Find an available credential in stock
    const { data: availableCredentials, error: stockError } = await supabase
      .from('credential_stock')
      .select('*')
      .eq('service_id', serviceId)
      .eq('status', 'available')
      .limit(1)
      .single();
    
    if (stockError || !availableCredentials) {
      console.error('No available credentials found:', stockError);
      return { success: false };
    }
    
    // Update the credential status to assigned
    const { error: updateError } = await supabase
      .from('credential_stock')
      .update({
        status: 'assigned',
        user_id: userId,
        order_id: orderId
      })
      .eq('id', availableCredentials.id);
      
    if (updateError) {
      console.error('Error updating credential status:', updateError);
      return { success: false };
    }
    
    // Update the order with the credential information
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        credentials: availableCredentials.credentials,
        credential_status: 'assigned',
        status: 'completed'
      })
      .eq('id', orderId);
      
    if (orderError) {
      console.error('Error updating order with credentials:', orderError);
      return { success: false };
    }
    
    // Send a notification to the customer
    await sendCredentialNotification(userId, serviceId, availableCredentials.credentials as Credential);
    
    return {
      success: true,
      credentials: availableCredentials.credentials as Credential
    };
  } catch (error) {
    console.error('Error in assignCredentialsToCustomer:', error);
    return { success: false };
  }
};

// Send a notification to the customer about their new credentials
const sendCredentialNotification = async (
  userId: string,
  serviceId: string,
  credentials: Credential
) => {
  try {
    // Get service details from local storage as a fallback since the table might not exist
    let serviceName = '';
    try {
      const storedServices = localStorage.getItem('services');
      if (storedServices) {
        const services = JSON.parse(storedServices);
        const service = services.find((s: any) => s.id === serviceId);
        if (service) {
          serviceName = service.name;
        }
      }
    } catch (storageError) {
      console.error('Error getting service from localStorage:', storageError);
    }
    
    if (!serviceName) {
      serviceName = 'your service';
    }
    
    // Create a notification for the user - check if the table exists first
    try {
      const { error: notificationError } = await supabase
        .from('admin_notifications')
        .insert({
          user_id: userId,
          type: 'credential',
          message: `Your credentials for ${serviceName} are now available in your dashboard.`,
          service_id: serviceId,
          is_read: false,
          created_at: new Date().toISOString()
        });
        
      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    } catch (notificationError) {
      console.error('Error in creating notification:', notificationError);
    }
  } catch (error) {
    console.error('Error in sendCredentialNotification:', error);
  }
};

// Function to get user's credentials by order ID
export const getCredentialsByOrderId = async (orderId: string): Promise<Credential | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (error || !data) {
      console.error('Error fetching credentials:', error);
      return null;
    }
    
    // Safely handle the credentials property which might not exist
    if (!data.credentials) {
      return null;
    }
    
    // Parse credentials if they're a string, or use directly if object
    let credentials: Credential;
    if (typeof data.credentials === 'string') {
      try {
        credentials = JSON.parse(data.credentials);
      } catch (e) {
        console.error('Error parsing credentials string:', e);
        return null;
      }
    } else {
      credentials = data.credentials as Credential;
    }
    
    return credentials;
  } catch (error) {
    console.error('Error in getCredentialsByOrderId:', error);
    return null;
  }
};
