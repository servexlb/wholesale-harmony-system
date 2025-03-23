import { CredentialStock, Order, Service, WholesaleOrder } from "./types";

// Load credential stock from localStorage or use default if not available
const loadCredentialStock = (): CredentialStock[] => {
  const storedStock = localStorage.getItem('credentialStock');
  if (storedStock) {
    return JSON.parse(storedStock);
  }
  
  // Default initial stock if nothing is in localStorage
  return [
    {
      id: "cred-1",
      serviceId: "service-netflix",
      credentials: {
        email: "netflix_premium1@example.com",
        password: "securepass123",
        notes: "Premium account with 4K streaming"
      },
      status: "available" as const,
      createdAt: new Date().toISOString()
    },
    {
      id: "cred-2",
      serviceId: "service-netflix",
      credentials: {
        email: "netflix_premium2@example.com",
        password: "securepass456",
        notes: "Premium account with 4K streaming"
      },
      status: "available" as const,
      createdAt: new Date().toISOString()
    },
    {
      id: "cred-3",
      serviceId: "service-disney",
      credentials: {
        email: "disney_plus1@example.com",
        password: "disneypass123",
        notes: "Disney+ subscription"
      },
      status: "available" as const,
      createdAt: new Date().toISOString()
    },
    {
      id: "cred-4",
      serviceId: "service-spotify",
      credentials: {
        email: "spotify_premium@example.com",
        password: "spotifypass123",
        notes: "Spotify Premium subscription"
      },
      status: "available" as const,
      createdAt: new Date().toISOString()
    }
  ];
};

// Get credential stock
let credentialStock = loadCredentialStock();

// Save credential stock to localStorage
const saveCredentialStock = (): void => {
  localStorage.setItem('credentialStock', JSON.stringify(credentialStock));
};

// Check if credentials are available for a service
export const checkCredentialAvailability = (serviceId: string): boolean => {
  return credentialStock.some(cred => cred.serviceId === serviceId && cred.status === "available");
};

// Get available stock count for a service
export const getAvailableStockCount = (serviceId: string): number => {
  return credentialStock.filter(cred => cred.serviceId === serviceId && cred.status === "available").length;
};

// Assign credentials to an order if available
export const assignCredentialsToOrder = (order: Order | WholesaleOrder): Order | WholesaleOrder => {
  // If order already has credentials, return it unchanged
  if (order.credentials && Object.keys(order.credentials).length > 0) {
    return {
      ...order,
      credentialStatus: "assigned" as const
    };
  }
  
  // Find available credentials for the service
  const availableCredential = credentialStock.find(
    cred => cred.serviceId === order.serviceId && cred.status === "available"
  );
  
  if (availableCredential) {
    // Mark credential as assigned
    const updatedCredentialStock = credentialStock.map(cred => {
      if (cred.id === availableCredential.id) {
        return {
          ...cred,
          status: "assigned" as const,
          assignedToOrderId: order.id
        };
      }
      return cred;
    });

    credentialStock = updatedCredentialStock;
    saveCredentialStock();
    
    // Update the order with credentials
    return {
      ...order,
      credentials: availableCredential.credentials,
      credentialStatus: "assigned" as const
    };
  }
  
  // No credentials available
  return {
    ...order,
    credentialStatus: "pending" as const
  };
};

// Update service objects with stock availability info
export const updateServicesWithStockInfo = (services: Service[]): Service[] => {
  return services.map(service => {
    const stockCount = getAvailableStockCount(service.id);
    return {
      ...service,
      stockAvailable: stockCount
    };
  });
};

// Add new credentials to stock
export const addCredentialToStock = (
  serviceId: string, 
  credentials: { 
    email?: string; 
    password?: string; 
    username?: string;
    notes?: string;
    [key: string]: any;
  }
): CredentialStock => {
  const newCredential: CredentialStock = {
    id: `cred-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    serviceId,
    credentials,
    status: "available" as const,
    createdAt: new Date().toISOString()
  };
  
  credentialStock.push(newCredential);
  saveCredentialStock();
  return newCredential;
};

// Process order with automatic credential assignment
export const processOrderWithCredentials = (order: Order | WholesaleOrder): Order | WholesaleOrder => {
  // Only process subscription or credential-based services
  const requiresCredentials = !order.serviceId?.includes("giftcard") && 
                             !order.serviceId?.includes("topup");
  
  if (!requiresCredentials) {
    return order;
  }
  
  return assignCredentialsToOrder(order);
};

// Get all credential stock (for admin panels)
export const getAllCredentialStock = (): CredentialStock[] => {
  return [...credentialStock];
};

// Delete a credential from stock
export const deleteCredentialFromStock = (credentialId: string): boolean => {
  const initialLength = credentialStock.length;
  credentialStock = credentialStock.filter(cred => cred.id !== credentialId);
  
  if (credentialStock.length !== initialLength) {
    saveCredentialStock();
    return true;
  }
  return false;
};
