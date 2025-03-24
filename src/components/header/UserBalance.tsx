
import React, { useState, useEffect } from 'react';
import { User, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";

const UserBalance = () => {
  const { user, isAuthenticated } = useAuth();
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserBalance = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Fetching balance for user:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user balance:', error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          console.log('User balance data:', data);
          setUserBalance(data.balance || 0);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchUserBalance:', error);
        setIsLoading(false);
      }
    };
    
    fetchUserBalance();
    
    // Set up real-time updates for user balance changes
    if (isAuthenticated && user) {
      const profilesChannel = supabase
        .channel('profiles_changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, (payload) => {
          console.log('Profile updated:', payload);
          if (payload.new && typeof payload.new.balance === 'number') {
            setUserBalance(payload.new.balance);
          }
        })
        .subscribe();
        
      // Set up interval to refresh balance every minute as a fallback
      const intervalId = setInterval(() => {
        if (isAuthenticated) {
          fetchUserBalance();
        }
      }, 60000); // 60 seconds
      
      return () => {
        clearInterval(intervalId);
        supabase.removeChannel(profilesChannel);
      };
    }
  }, [user, isAuthenticated]);

  const handleClick = () => {
    navigate('/payment');
  };

  if (!isAuthenticated || isLoading) {
    return null;
  }

  return (
    <div className="flex items-center mr-2">
      <Button 
        variant="ghost" 
        size="sm" 
        className="text-sm flex items-center gap-1 relative"
        onClick={handleClick}
      >
        <CreditCard className="h-4 w-4" />
        <span>${userBalance.toFixed(2)}</span>
      </Button>
    </div>
  );
};

export default UserBalance;
