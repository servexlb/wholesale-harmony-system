
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Key, User, Clock, AlertTriangle } from 'lucide-react';
import { Subscription } from '@/lib/types';
import { differenceInDays, parseISO } from 'date-fns';
import { products } from '@/lib/data';
import {
  InputWithIcon
} from '@/components/ui/input-with-icon';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserSubscriptionsViewProps {
  userId: string;
  userName?: string;
}

const UserSubscriptionsView: React.FC<UserSubscriptionsViewProps> = ({
  userId,
  userName
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      setIsLoading(true);
      try {
        // First try to fetch from Supabase
        const { data: supabaseSubscriptions, error } = await supabase
          .from('wholesale_subscriptions')
          .select('*')
          .eq('customer_id', userId);
          
        if (error) {
          console.error('Error fetching subscriptions:', error);
          // Fallback to local storage
          loadFromLocalStorage();
          return;
        }
        
        if (supabaseSubscriptions && supabaseSubscriptions.length > 0) {
          const formattedSubs = supabaseSubscriptions.map(sub => {
            let credentialsObj = undefined;
            
            if (sub.credentials) {
              const creds = sub.credentials as any;
              credentialsObj = {
                username: typeof creds === 'object' ? creds.username || '' : '',
                password: typeof creds === 'object' ? creds.password || '' : '',
                email: typeof creds === 'object' ? creds.email || '' : '',
                notes: typeof creds === 'object' ? creds.notes || '' : ''
              };
            }
            
            return {
              id: sub.id,
              userId: sub.customer_id,
              serviceId: sub.service_id,
              startDate: sub.start_date,
              endDate: sub.end_date,
              status: sub.status as 'active' | 'expired' | 'cancelled' | 'pending',
              durationMonths: sub.duration_months,
              credentials: credentialsObj,
              isPending: sub.status === 'pending' || !sub.credentials
            };
          });
          setSubscriptions(formattedSubs);
        } else {
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error in fetchUserSubscriptions:', error);
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadFromLocalStorage = () => {
      // Fallback to localStorage data
      const savedSubscriptions = localStorage.getItem('wholesaleSubscriptions');
      if (savedSubscriptions) {
        try {
          const allSubs = JSON.parse(savedSubscriptions);
          const userSubs = allSubs
            .filter((sub: Subscription) => sub.userId === userId)
            .map((sub: Subscription) => ({
              ...sub,
              isPending: sub.status === 'pending' || !sub.credentials
            }));
          setSubscriptions(userSubs);
        } catch (error) {
          console.error('Error parsing subscriptions from localStorage:', error);
          setSubscriptions([]);
        }
      } else {
        setSubscriptions([]);
      }
    };
    
    if (userId) {
      fetchUserSubscriptions();
    }
  }, [userId]);

  const getSubscriptionStatus = (subscription: Subscription) => {
    // First check if it's pending due to lack of credentials
    if (subscription.isPending || subscription.status === 'pending' || !subscription.credentials) {
      return { status: "pending", color: "orange" };
    }

    // Then check expiration status
    const today = new Date();
    const end = parseISO(subscription.endDate);
    const daysLeft = differenceInDays(end, today);
    
    if (daysLeft < 0) return { status: "expired", color: "destructive" };
    if (daysLeft <= 3) return { status: `expires in ${daysLeft} days`, color: "orange" };
    return { status: "active", color: "green" };
  };

  const getProductName = (serviceId: string): string => {
    const product = products.find(p => p.id === serviceId);
    return product ? product.name : "Unknown Service";
  };

  // Filter subscriptions based on search term
  const filteredSubscriptions = subscriptions.filter(sub => {
    const productName = getProductName(sub.serviceId).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return (
      productName.includes(searchLower) ||
      (sub.credentials?.email && sub.credentials.email.toLowerCase().includes(searchLower)) ||
      (sub.credentials?.username && sub.credentials.username.toLowerCase().includes(searchLower))
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {userName ? `${userName}'s Subscriptions` : 'User Subscriptions'}
        </CardTitle>
        <div className="mt-2">
          <InputWithIcon
            placeholder="Search by service or credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
            type="search"
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="p-4 text-center">Loading subscriptions...</div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No subscriptions found for this user.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubscriptions.map((subscription) => {
              const productName = getProductName(subscription.serviceId);
              const statusInfo = getSubscriptionStatus(subscription);
              
              return (
                <Card key={subscription.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{productName}</h3>
                      <Badge 
                        variant={
                          statusInfo.color === "green" ? "default" : 
                          statusInfo.color === "orange" ? "outline" : 
                          "destructive"
                        }
                        className={
                          statusInfo.color === "orange" 
                            ? "border-orange-300 bg-orange-100 text-orange-800 hover:bg-orange-100" 
                            : ""
                        }
                      >
                        {statusInfo.status}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>Expires: {new Date(subscription.endDate).toLocaleDateString()}</span>
                      </div>
                      
                      {subscription.durationMonths && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{subscription.durationMonths} month{subscription.durationMonths > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    
                    {subscription.isPending || !subscription.credentials ? (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Pending Credentials</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your subscription is active but credentials are being processed.
                        </p>
                      </div>
                    ) : subscription.credentials && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-1 mb-2">
                          <Key className="h-4 w-4 text-primary" />
                          <span className="font-medium">Credentials</span>
                        </div>
                        
                        <div className="bg-muted/30 p-2 rounded text-sm">
                          {subscription.credentials.email && (
                            <div className="mb-1">
                              <span className="font-medium">Email:</span> {subscription.credentials.email}
                            </div>
                          )}
                          
                          {subscription.credentials.password && (
                            <div className="mb-1">
                              <span className="font-medium">Password:</span> {subscription.credentials.password}
                            </div>
                          )}
                          
                          {subscription.credentials.username && (
                            <div className="mb-1">
                              <span className="font-medium">Username:</span> {subscription.credentials.username}
                            </div>
                          )}
                          
                          {subscription.credentials.notes && (
                            <div className="mt-1 pt-1 border-t border-gray-200">
                              <span className="font-medium">Notes:</span> {subscription.credentials.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserSubscriptionsView;
