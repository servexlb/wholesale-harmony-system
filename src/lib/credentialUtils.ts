
import { CredentialStock, Order } from './types';

// Get all credentials in stock
export const getAllCredentialStock = (): CredentialStock[] => {
  try {
    const stockJson = localStorage.getItem('credentialStock');
    if (!stockJson) return [];
    return JSON.parse(stockJson);
  } catch (error) {
    console.error('Error getting credential stock:', error);
    return [];
  }
};

// Save all credentials stock
export const saveCredentialStock = (stock: CredentialStock[]) => {
  try {
    localStorage.setItem('credentialStock', JSON.stringify(stock));
    
    // Dispatch event to notify components about the update
    window.dispatchEvent(new CustomEvent('credential-stock-updated', { 
      detail: { stock }
    }));
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
    const stock = getAllCredentialStock();
    
    const newCredential: CredentialStock = {
      id: `cred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      serviceId,
      credentials,
      status: 'available' as const,
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

// Update credential details
export const updateCredentialInStock = (
  credentialId: string,
  updatedFields: Partial<CredentialStock>
): CredentialStock | null => {
  try {
    const stock = getAllCredentialStock();
    const index = stock.findIndex(item => item.id === credentialId);
    
    if (index === -1) {
      console.error(`Credential with id ${credentialId} not found`);
      return null;
    }
    
    // Update the credential with new fields
    const updatedCredential = {
      ...stock[index],
      ...updatedFields,
      // Don't allow changing these fields directly
      id: stock[index].id,
      createdAt: stock[index].createdAt
    };
    
    stock[index] = updatedCredential;
    saveCredentialStock(stock);
    
    return updatedCredential;
  } catch (error) {
    console.error('Error updating credential in stock:', error);
    return null;
  }
};

// Delete credential from stock
export const deleteCredentialFromStock = (credentialId: string): boolean => {
  try {
    const stock = getAllCredentialStock();
    const filteredStock = stock.filter(item => item.id !== credentialId);
    
    if (filteredStock.length === stock.length) {
      // No item was removed
      return false;
    }
    
    saveCredentialStock(filteredStock);
    return true;
  } catch (error) {
    console.error('Error deleting credential from stock:', error);
    return false;
  }
};

// Assign credential to an order
export const assignCredentialToOrder = (
  serviceId: string, 
  orderId: string
): CredentialStock | null => {
  try {
    const stock = getAllCredentialStock();
    
    // Find an available credential for this service
    const index = stock.findIndex(item => 
      item.serviceId === serviceId && 
      item.status === 'available'
    );
    
    if (index === -1) {
      console.error(`No available credential found for service ${serviceId}`);
      return null;
    }
    
    // Update the credential status
    stock[index] = {
      ...stock[index],
      status: 'assigned' as const,
      assignedToOrderId: orderId
    };
    
    saveCredentialStock(stock);
    
    // Save this assignment to order history
    saveCredentialAssignment(orderId, stock[index]);
    
    return stock[index];
  } catch (error) {
    console.error('Error assigning credential to order:', error);
    return null;
  }
};

// Get available credentials for a service
export const getAvailableCredentialsForService = (serviceId: string): CredentialStock[] => {
  try {
    const stock = getAllCredentialStock();
    return stock.filter(item => 
      item.serviceId === serviceId && 
      item.status === 'available'
    );
  } catch (error) {
    console.error('Error getting available credentials:', error);
    return [];
  }
};

// Save credential assignment to order history
export const saveCredentialAssignment = (orderId: string, credential: CredentialStock): void => {
  try {
    const historyJson = localStorage.getItem('credentialAssignmentHistory');
    const history = historyJson ? JSON.parse(historyJson) : [];
    
    history.push({
      orderId,
      credentialId: credential.id,
      serviceId: credential.serviceId,
      credentials: credential.credentials,
      assignedAt: new Date().toISOString()
    });
    
    localStorage.setItem('credentialAssignmentHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Error saving credential assignment history:', error);
  }
};

// Get credentials assigned to a specific order
export const getCredentialsForOrder = (orderId: string): CredentialStock[] => {
  try {
    const stock = getAllCredentialStock();
    return stock.filter(item => item.assignedToOrderId === orderId);
  } catch (error) {
    console.error('Error getting credentials for order:', error);
    return [];
  }
};

// Bulk import credentials
export const bulkImportCredentials = (
  serviceId: string,
  credentialsList: Array<{ 
    email: string; 
    password: string; 
    username?: string; 
    pinCode?: string; 
  }>,
  quantity: number = 1
): CredentialStock[] => {
  try {
    const stock = getAllCredentialStock();
    const newCredentials: CredentialStock[] = [];
    
    // Create multiple copies of each credential based on quantity
    credentialsList.forEach(credentials => {
      for (let i = 0; i < quantity; i++) {
        const newCredential: CredentialStock = {
          id: `cred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          serviceId,
          credentials: {...credentials},
          status: 'available' as const,
          createdAt: new Date().toISOString()
        };
        
        newCredentials.push(newCredential);
        stock.push(newCredential);
      }
    });
    
    saveCredentialStock(stock);
    return newCredentials;
  } catch (error) {
    console.error('Error bulk importing credentials:', error);
    return [];
  }
};

// Process order fulfillment with digital credentials
export const fulfillOrderWithCredentials = (order: Order): Order => {
  try {
    // Check if we already have credentials assigned to this order
    const assignedCredentials = getCredentialsForOrder(order.id);
    
    if (assignedCredentials.length > 0) {
      // Order already has credentials assigned
      return {
        ...order,
        credentials: assignedCredentials[0].credentials,
        credentialStatus: 'assigned'
      };
    }
    
    // Assign a credential to this order
    const credential = assignCredentialToOrder(order.serviceId, order.id);
    
    if (credential) {
      return {
        ...order,
        credentials: credential.credentials,
        credentialStatus: 'assigned'
      };
    }
    
    // No credentials available
    return {
      ...order,
      credentialStatus: 'unavailable'
    };
  } catch (error) {
    console.error('Error fulfilling order with credentials:', error);
    return order;
  }
};
