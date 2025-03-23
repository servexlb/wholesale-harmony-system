
import { useState, useEffect, useCallback } from 'react';

export function useWholesaleAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentWholesaler, setCurrentWholesaler] = useState<string>('');
  
  useEffect(() => {
    const wholesaleAuth = localStorage.getItem('wholesaleAuthenticated');
    const wholesalerId = localStorage.getItem('wholesalerId');
    
    if (wholesaleAuth === 'true' && wholesalerId) {
      setIsAuthenticated(true);
      setCurrentWholesaler(wholesalerId);
    }
  }, []);

  const handleLoginSuccess = useCallback((username: string) => {
    setIsAuthenticated(true);
    localStorage.setItem('wholesaleAuthenticated', 'true');
    localStorage.setItem('wholesalerId', username);
    setCurrentWholesaler(username);
  }, []);

  const handleLogout = useCallback(() => {
    // Get current wholesaler ID before clearing
    const wholesalerId = localStorage.getItem('wholesalerId');
    
    // Clear authentication status
    setIsAuthenticated(false);
    localStorage.removeItem('wholesaleAuthenticated');
    localStorage.removeItem('wholesalerId');
    setCurrentWholesaler('');
    
    // Clear any wholesaler-specific data
    if (wholesalerId) {
      localStorage.removeItem(`userBalance_${wholesalerId}`);
      localStorage.removeItem(`userProfile_${wholesalerId}`);
      localStorage.removeItem(`transactionHistory_${wholesalerId}`);
    }
  }, []);

  return {
    isAuthenticated,
    currentWholesaler,
    handleLoginSuccess,
    handleLogout
  };
}
