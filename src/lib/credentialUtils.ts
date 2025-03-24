
// Update the addCredentialToStock function to ensure it handles required fields:

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
