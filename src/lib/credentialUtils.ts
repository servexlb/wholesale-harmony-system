
import { supabase } from '@/integrations/supabase/client';
import { Credential } from '@/lib/types';
import { addCredentialToStock } from '@/lib/credentialService';

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
    await sendCredentialNotification(userId, serviceId, availableCredentials.credentials);
    
    return {
      success: true,
      credentials: availableCredentials.credentials
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
    // Get service details
    const { data: serviceData } = await supabase
      .from('services')
      .select('name')
      .eq('id', serviceId)
      .single();
      
    const serviceName = serviceData?.name || 'your service';
    
    // Create a notification for the user
    const { error: notificationError } = await supabase
      .from('customer_notifications')
      .insert({
        user_id: userId,
        type: 'credential',
        message: `Your credentials for ${serviceName} are now available in your dashboard.`,
        service_id: serviceId,
        read: false,
        created_at: new Date().toISOString()
      });
      
    if (notificationError) {
      console.error('Error creating notification:', notificationError);
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
      .select('credentials')
      .eq('id', orderId)
      .single();
      
    if (error || !data || !data.credentials) {
      return null;
    }
    
    return data.credentials as Credential;
  } catch (error) {
    console.error('Error in getCredentialsByOrderId:', error);
    return null;
  }
};
