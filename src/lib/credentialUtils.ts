
import { CredentialStock, Credential, Order } from './types';

// Functions to manage credential stock
// Helper function to get all credentials from localStorage
export const getAllCredentialStock = (): CredentialStock[] => {
  try {
    const stockJson = localStorage.getItem('credentialStock');
    return stockJson ? JSON.parse(stockJson) : [];
  } catch (error) {
    console.error('Error getting credential stock:', error);
    return [];
  }
};

// Helper function to save credentials to localStorage
export const saveCredentialStock = (stock: CredentialStock[]): void => {
  try {
    localStorage.setItem('credentialStock', JSON.stringify(stock));
    // Dispatch an event to notify that credential stock has been updated
    window.dispatchEvent(new CustomEvent('credential-stock-updated'));
  } catch (error) {
    console.error('Error saving credential stock:', error);
  }
};

// Add a new credential to stock
export const addCredentialToStock = (
  serviceId: string, 
  credentials: { 
    email: string; 
    password: string; 
    username?: string; 
    pinCode?: string; 
  }
): CredentialStock => {
  try {
    // Ensure email and password are provided
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required for adding credentials to stock');
    }
    
    const stock = getAllCredentialStock();
    
    const newCredential: CredentialStock = {
      id: `cred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serviceId,
      credentials: {
        email: credentials.email,
        password: credentials.password,
        username: credentials.username,
        pinCode: credentials.pinCode
      },
      status: 'available',
      createdAt: new Date().toISOString()
    };
    
    stock.push(newCredential);
    saveCredentialStock(stock);
    
    return newCredential;
  } catch (error) {
    console.error('Error adding credential to stock:', error);
    throw error;
  }
};

// Update a credential in stock
export const updateCredentialInStock = (
  credentialId: string,
  updates: Partial<Omit<CredentialStock, 'id'>>
): boolean => {
  try {
    const stock = getAllCredentialStock();
    const index = stock.findIndex(item => item.id === credentialId);
    
    if (index === -1) {
      console.error(`Credential with ID ${credentialId} not found`);
      return false;
    }
    
    stock[index] = { ...stock[index], ...updates };
    saveCredentialStock(stock);
    return true;
  } catch (error) {
    console.error('Error updating credential:', error);
    return false;
  }
};

// Delete a credential from stock
export const deleteCredentialFromStock = (credentialId: string): boolean => {
  try {
    const stock = getAllCredentialStock();
    const updatedStock = stock.filter(item => item.id !== credentialId);
    
    if (updatedStock.length === stock.length) {
      console.warn(`Credential with ID ${credentialId} not found`);
      return false;
    }
    
    saveCredentialStock(updatedStock);
    return true;
  } catch (error) {
    console.error('Error deleting credential:', error);
    return false;
  }
};

// Get next available credential for a service
export const getNextAvailableCredential = (serviceId: string): CredentialStock | null => {
  try {
    const stock = getAllCredentialStock();
    const credential = stock.find(item => item.serviceId === serviceId && item.status === 'available');
    return credential || null;
  } catch (error) {
    console.error('Error getting next available credential:', error);
    return null;
  }
};

// Check if credentials are available for a service
export const checkCredentialAvailability = (serviceId: string): boolean => {
  const credential = getNextAvailableCredential(serviceId);
  return credential !== null;
};

// Fulfill an order with credentials
export const fulfillOrderWithCredentials = (order: Order): Order => {
  try {
    // Check if we need to assign credentials
    if (order.serviceId && !order.credentials) {
      const credential = getNextAvailableCredential(order.serviceId);
      
      if (credential) {
        // Assign credential to order
        order.credentials = credential.credentials;
        order.credentialStatus = 'assigned';
        
        // Update the credential in stock
        updateCredentialInStock(credential.id, {
          status: 'assigned',
          orderId: order.id,
          userId: order.userId
        });
      } else {
        // No credentials available
        order.credentialStatus = 'pending';
      }
    } else if (order.credentials) {
      // User provided their own credentials
      order.credentialStatus = 'available';
    }
    
    return order;
  } catch (error) {
    console.error('Error fulfilling order with credentials:', error);
    return order;
  }
};

