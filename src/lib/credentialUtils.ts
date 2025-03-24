
// Add uuid module
import { v4 as uuidv4 } from 'uuid';
import { CredentialStock, Credential } from './types';

export const generateRandomPassword = (): string => {
  const uuid = uuidv4();
  const password = uuid.substring(0, 12);
  return password;
};

// Get all credential stock from localStorage
export const getAllCredentialStock = (): CredentialStock[] => {
  const stockData = localStorage.getItem('credentialStock');
  return stockData ? JSON.parse(stockData) : [];
};

// Save credential stock to localStorage
export const saveCredentialStock = (stock: CredentialStock[]): void => {
  localStorage.setItem('credentialStock', JSON.stringify(stock));
  // Dispatch event for components to react to changes
  window.dispatchEvent(new CustomEvent('credential-stock-updated'));
};

// Add a new credential to stock
export const addCredentialToStock = (serviceId: string, credentials: Credential): CredentialStock => {
  const stock = getAllCredentialStock();
  const newItem: CredentialStock = {
    id: uuidv4(),
    serviceId,
    credentials,
    status: 'available',
    createdAt: new Date().toISOString()
  };
  stock.push(newItem);
  saveCredentialStock(stock);
  return newItem;
};

// Update a credential in stock
export const updateCredentialInStock = (id: string, updates: Partial<CredentialStock>): boolean => {
  const stock = getAllCredentialStock();
  const index = stock.findIndex(item => item.id === id);
  if (index === -1) return false;
  
  stock[index] = {
    ...stock[index],
    ...updates
  };
  
  saveCredentialStock(stock);
  return true;
};

// Delete a credential from stock
export const deleteCredentialFromStock = (id: string): boolean => {
  const stock = getAllCredentialStock();
  const newStock = stock.filter(item => item.id !== id);
  
  if (newStock.length === stock.length) return false;
  
  saveCredentialStock(newStock);
  return true;
};

// Check credential availability for a service
export const checkCredentialAvailability = (serviceId: string): boolean => {
  const stock = getAllCredentialStock();
  return stock.some(item => item.serviceId === serviceId && item.status === 'available');
};

// Get an available credential for a service
export const getAvailableCredential = (serviceId: string): CredentialStock | null => {
  const stock = getAllCredentialStock();
  return stock.find(item => item.serviceId === serviceId && item.status === 'available') || null;
};

// Fulfill an order with credentials
export const fulfillOrderWithCredentials = (orderId: string, userId: string, serviceId: string): CredentialStock | null => {
  const credential = getAvailableCredential(serviceId);
  if (!credential) return null;
  
  // Update credential status to assigned
  updateCredentialInStock(credential.id, {
    status: 'assigned',
    orderId,
    userId
  });
  
  return credential;
};
