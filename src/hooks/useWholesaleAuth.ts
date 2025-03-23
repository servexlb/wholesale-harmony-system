
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
    setIsAuthenticated(false);
    localStorage.removeItem('wholesaleAuthenticated');
    localStorage.removeItem('wholesalerId');
  }, []);

  return {
    isAuthenticated,
    currentWholesaler,
    handleLoginSuccess,
    handleLogout
  };
}
