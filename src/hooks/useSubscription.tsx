
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Subscription, Service } from '@/lib/types';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => void;
  hasActiveSubscription: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false);

  const fetchSubscription = () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      const storedSubscriptions = localStorage.getItem('subscriptions');
      let userSubscriptions: Subscription[] = [];
      
      if (storedSubscriptions) {
        const allSubscriptions = JSON.parse(storedSubscriptions);
        userSubscriptions = allSubscriptions.filter(
          (sub: Subscription) => sub.userId === user.id && sub.status === 'active'
        );
      }
      
      // Get the most recent active subscription
      const latestSubscription = userSubscriptions.length > 0 
        ? userSubscriptions.sort((a, b) => 
            new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
          )[0] 
        : null;
      
      setSubscription(latestSubscription);
      setHasActiveSubscription(!!latestSubscription);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setError('Failed to load subscription data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const refreshSubscription = () => {
    fetchSubscription();
  };

  return (
    <SubscriptionContext.Provider 
      value={{ 
        subscription, 
        isLoading, 
        error, 
        refreshSubscription,
        hasActiveSubscription
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
