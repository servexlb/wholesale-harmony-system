
// This is a fixed version of useWholesaleAuth.ts where the type error is fixed
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export const useWholesaleAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWholesaler, setCurrentWholesaler] = useState('');
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // On mount, check if the user is already authenticated
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Auth state changed: INITIAL_SESSION');
        const { data: sessionData, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          setIsLoading(false);
          return;
        }
        
        if (sessionData?.session) {
          console.log('Session found:', sessionData.session.user.id);
          setIsAuthenticated(true);
          setCurrentWholesaler(sessionData.session.user.id);
        } else {
          console.log('No authenticated session, loading from localStorage');
          // Try to load from localStorage
          const savedWholesalerId = localStorage.getItem('wholesalerId');
          if (savedWholesalerId) {
            setIsAuthenticated(true);
            setCurrentWholesaler(savedWholesalerId);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Session check error:', error);
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
        setCurrentWholesaler(session.user.id);
        localStorage.setItem('wholesalerId', session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setCurrentWholesaler('');
        localStorage.removeItem('wholesalerId');
        setIsLoggedOut(true);
      }
    });
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (wholesalerId: string) => {
    setIsAuthenticated(true);
    setCurrentWholesaler(wholesalerId);
    localStorage.setItem('wholesalerId', wholesalerId);
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Check if we have a session
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      // Clear local state
      setIsAuthenticated(false);
      setCurrentWholesaler('');
      localStorage.removeItem('wholesalerId');
      setIsLoggedOut(true);
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a function to update metrics for a wholesaler
  const updateMetrics = async (metricsData: any) => {
    if (!currentWholesaler) return;
    
    try {
      // Check if metrics record exists
      const { data: existingMetrics } = await supabase
        .from('wholesale_metrics')
        .select('id')
        .eq('wholesaler_id', currentWholesaler)
        .single();
      
      if (existingMetrics) {
        // Update existing record
        await supabase
          .from('wholesale_metrics')
          .update(metricsData)
          .eq('wholesaler_id', currentWholesaler);
      } else {
        // Insert new record
        await supabase
          .from('wholesale_metrics')
          .insert({
            ...metricsData,
            wholesaler_id: currentWholesaler
          });
      }
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  };

  return {
    isAuthenticated,
    isLoading,
    currentWholesaler, 
    handleLoginSuccess,
    handleLogout,
    isLoggedOut,
    updateMetrics
  };
};
