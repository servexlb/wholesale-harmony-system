
import { Credential, CredentialStock } from "@/lib/types";
import { addCredentialToStock as addToSupabase } from "./credentialService";

// Legacy function for backwards compatibility
export function getAllCredentialStock(): CredentialStock[] {
  try {
    const storedStock = localStorage.getItem('credentialStock');
    return storedStock ? JSON.parse(storedStock) : [];
  } catch (error) {
    console.error('Error getting credential stock:', error);
    return [];
  }
}

// Legacy function for backwards compatibility
export function addCredentialToStock(serviceId: string, credentials: Credential): CredentialStock {
  // Legacy implementation - will also add to Supabase if available
  const id = `cred-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  const newCredential: CredentialStock = {
    id,
    serviceId,
    credentials,
    status: "available",
    createdAt: new Date().toISOString(),
  };
  
  try {
    // Add to localStorage for backward compatibility
    const currentStock = getAllCredentialStock();
    const updatedStock = [...currentStock, newCredential];
    localStorage.setItem('credentialStock', JSON.stringify(updatedStock));
    
    // Also add to Supabase if available
    try {
      // This is async but we don't wait for it
      addToSupabase(serviceId, credentials);
    } catch (e) {
      console.error('Error adding to Supabase:', e);
    }
    
    window.dispatchEvent(new CustomEvent('credential-stock-updated'));
    return newCredential;
  } catch (error) {
    console.error('Error adding credential to stock:', error);
    throw error;
  }
}

// Legacy function for backwards compatibility
export function deleteCredentialFromStock(id: string): boolean {
  try {
    const currentStock = getAllCredentialStock();
    const updatedStock = currentStock.filter(cred => cred.id !== id);
    localStorage.setItem('credentialStock', JSON.stringify(updatedStock));
    window.dispatchEvent(new CustomEvent('credential-stock-updated'));
    return true;
  } catch (error) {
    console.error('Error deleting credential from stock:', error);
    return false;
  }
}

// Legacy function for backwards compatibility
export function updateCredentialInStock(id: string, updates: Partial<CredentialStock>): boolean {
  try {
    const currentStock = getAllCredentialStock();
    const updatedStock = currentStock.map(cred => {
      if (cred.id === id) {
        return { ...cred, ...updates };
      }
      return cred;
    });
    localStorage.setItem('credentialStock', JSON.stringify(updatedStock));
    window.dispatchEvent(new CustomEvent('credential-stock-updated'));
    return true;
  } catch (error) {
    console.error('Error updating credential in stock:', error);
    return false;
  }
}

// Legacy function for backwards compatibility
export function saveCredentialStock(stock: CredentialStock[]) {
  try {
    localStorage.setItem('credentialStock', JSON.stringify(stock));
    window.dispatchEvent(new CustomEvent('credential-stock-updated'));
  } catch (error) {
    console.error('Error saving credential stock:', error);
  }
}

// Utility function for generating random passwords
export function generateRandomPassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// New utility function to map Supabase data to our CredentialStock type
export function mapSupabaseCredentialToLocal(supabaseCred: any): CredentialStock {
  return {
    id: supabaseCred.id,
    serviceId: supabaseCred.service_id,
    credentials: supabaseCred.credentials as Credential,
    status: supabaseCred.status as 'available' | 'assigned',
    createdAt: supabaseCred.created_at,
    orderId: supabaseCred.order_id,
    userId: supabaseCred.user_id
  };
}

// New utility function to map multiple Supabase credentials to our CredentialStock type
export function mapSupabaseCredentialsToLocal(supabaseCredentials: any[]): CredentialStock[] {
  return supabaseCredentials.map(mapSupabaseCredentialToLocal);
}

// New function to convert subscription credential to stock format
export function convertSubscriptionToStock(subscription: any): Credential {
  // Safely extract credentials from subscription with type checking
  const credentials = subscription.credentials || {};
  
  return {
    email: typeof credentials === 'object' && credentials.email ? String(credentials.email) : '',
    password: typeof credentials === 'object' && credentials.password ? String(credentials.password) : '',
    username: typeof credentials === 'object' && credentials.username ? String(credentials.username) : '',
    pinCode: typeof credentials === 'object' && credentials.pinCode ? String(credentials.pinCode) : ''
  };
}
