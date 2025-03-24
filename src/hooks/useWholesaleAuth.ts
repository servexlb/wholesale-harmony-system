
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export function useWholesaleAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [currentWholesaler, setCurrentWholesaler] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  const handleLogout = useCallback(async () => {
    try {
      const wholesalerId = localStorage.getItem('wholesalerId');
      
      setIsAuthenticated(false);
      localStorage.removeItem('wholesaleAuthenticated');
      localStorage.removeItem('wholesalerId');
      setCurrentWholesaler('');
      setIsLoggedOut(true);
      
      await supabase.auth.signOut();
      
      if (wholesalerId) {
        localStorage.removeItem(`userBalance_${wholesalerId}`);
        localStorage.removeItem(`userProfile_${wholesalerId}`);
        localStorage.removeItem(`transactionHistory_${wholesalerId}`);
      }
      
      console.log('Wholesale logout complete');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Error logging out');
    }
  }, []);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const wholesaleAuth = localStorage.getItem('wholesaleAuthenticated');
        const wholesalerId = localStorage.getItem('wholesalerId');
        
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          setIsAuthenticated(true);
          setCurrentWholesaler(data.session.user.id);
          
          localStorage.setItem('wholesaleAuthenticated', 'true');
          localStorage.setItem('wholesalerId', data.session.user.id);
          
          setIsLoggedOut(false);
        } else if (wholesaleAuth === 'true' && wholesalerId) {
          setIsAuthenticated(true);
          setCurrentWholesaler(wholesalerId);
          setIsLoggedOut(false);
        } else {
          setIsAuthenticated(false);
          setCurrentWholesaler('');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        
        const wholesaleAuth = localStorage.getItem('wholesaleAuthenticated');
        const wholesalerId = localStorage.getItem('wholesalerId');
        
        if (wholesaleAuth === 'true' && wholesalerId) {
          setIsAuthenticated(true);
          setCurrentWholesaler(wholesalerId);
          setIsLoggedOut(false);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session) {
          setIsAuthenticated(true);
          setCurrentWholesaler(session.user.id);
          localStorage.setItem('wholesaleAuthenticated', 'true');
          localStorage.setItem('wholesalerId', session.user.id);
          setIsLoggedOut(false);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setCurrentWholesaler('');
          localStorage.removeItem('wholesaleAuthenticated');
          localStorage.removeItem('wholesalerId');
          setIsLoggedOut(true);
        }
      }
    );
    
    const handleGlobalLogout = () => {
      console.log('Global logout event received in wholesale auth');
      handleLogout();
    };
    
    window.addEventListener('globalLogout', handleGlobalLogout);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('globalLogout', handleGlobalLogout);
    };
  }, [handleLogout]);

  const handleLoginSuccess = useCallback(async (username: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: `${username}@wholesaler.com`,
      });
      
      if (error) {
        console.log('Supabase auth failed, using legacy auth:', error.message);
        
        const savedUsers = localStorage.getItem('wholesaleUsers');
        if (savedUsers) {
          const users = JSON.parse(savedUsers);
          const user = users.find((u: any) => u.username === username);
          
          if (user) {
            setIsAuthenticated(true);
            localStorage.setItem('wholesaleAuthenticated', 'true');
            localStorage.setItem('wholesalerId', username);
            setCurrentWholesaler(username);
            setIsLoggedOut(false);
            return true;
          }
        }
        
        toast.error('Invalid username');
        return false;
      }
      
      setIsAuthenticated(true);
      localStorage.setItem('wholesaleAuthenticated', 'true');
      
      // Properly handle the null case with optional chaining and nullish coalescing
      const userId = data?.session?.user?.id ?? username;
      localStorage.setItem('wholesalerId', userId);
      
      setCurrentWholesaler(userId);
      setIsLoggedOut(false);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Error during login');
      return false;
    }
  }, []);

  return {
    isAuthenticated,
    currentWholesaler,
    isLoggedOut,
    isLoading,
    handleLoginSuccess,
    handleLogout
  };
}
