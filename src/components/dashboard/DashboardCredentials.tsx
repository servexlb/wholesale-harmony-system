
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Subscription, Order, Credential } from '@/lib/types';
import CredentialDisplay from '../CredentialDisplay';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const DashboardCredentials: React.FC = () => {
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Get current user ID
  useEffect(() => {
    const getUserId = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session) {
        setUserId(session.session.user.id);
      }
    };
    
    getUserId();
  }, []);
  
  // Load subscriptions and orders from Supabase
  useEffect(() => {
    if (!userId) return;
    
    const fetchData = async () => {
      try {
        // Fetch subscriptions
        const { data: subscriptionsData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active');
          
        if (subError) {
          console.error('Error fetching subscriptions:', subError);
        } else if (subscriptionsData) {
          // Map database fields to our application types
          const formattedSubscriptions: Subscription[] = subscriptionsData.map(sub => {
            // Process credentials from JSON to proper object
            let parsedCredentials: Credential | undefined = undefined;
            if (sub.credentials) {
              try {
                // Handle both string and object formats
                const credsData = typeof sub.credentials === 'string' 
                  ? JSON.parse(sub.credentials) 
                  : sub.credentials;
                
                parsedCredentials = {
                  email: credsData.email || '',
                  password: credsData.password || '',
                  username: credsData.username,
                  pinCode: credsData.pinCode,
                  ...(credsData || {})
                };
              } catch (e) {
                console.error('Error parsing credentials:', e);
              }
            }
            
            return {
              id: sub.id,
              userId: sub.user_id,
              serviceId: sub.service_id,
              startDate: sub.start_date,
              endDate: sub.end_date,
              status: sub.status as "active" | "expired" | "cancelled",
              credentials: parsedCredentials
            };
          });
          
          setActiveSubscriptions(formattedSubscriptions);
        }
        
        // Fetch recent orders
        const { data: ordersData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (orderError) {
          console.error('Error fetching orders:', orderError);
        } else if (ordersData) {
          // Map database fields to our application types
          const formattedOrders: Order[] = ordersData.map(order => {
            // Process credentials from any source format
            let orderCredentials = undefined;
            
            // Try to parse credentials if they exist
            if (order.credentials) {
              try {
                // Handle both string and object formats
                const credsData = typeof order.credentials === 'string' 
                  ? JSON.parse(order.credentials) 
                  : order.credentials;
                
                orderCredentials = {
                  email: credsData.email || '',
                  password: credsData.password || '',
                  username: credsData.username,
                  pinCode: credsData.pinCode,
                  ...(credsData || {})
                };
              } catch (e) {
                console.error('Error parsing order credentials:', e);
              }
            }
            
            return {
              id: order.id,
              userId: order.user_id,
              products: [
                {
                  productId: order.service_id,
                  quantity: order.quantity,
                  price: order.total_price / order.quantity,
                  name: order.service_name
                }
              ],
              total: order.total_price,
              status: (order.status as "pending" | "processing" | "completed" | "cancelled"),
              createdAt: order.created_at,
              paymentMethod: 'default',
              serviceName: order.service_name,
              notes: order.notes,
              credentials: orderCredentials
            };
          });
          
          setRecentOrders(formattedOrders);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
    
    // Set up real-time subscription for subscriptions and orders
    const subscriptionsChannel = supabase
      .channel('public:subscriptions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'subscriptions',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        // Refresh subscriptions when data changes
        fetchData();
      })
      .subscribe();
      
    const ordersChannel = supabase
      .channel('public:orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        // Refresh orders when data changes
        fetchData();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscriptionsChannel);
      supabase.removeChannel(ordersChannel);
    };
  }, [userId]);
  
  // If the Supabase fetch fails, try to load from localStorage as fallback
  useEffect(() => {
    if (!userId || activeSubscriptions.length > 0 || recentOrders.length > 0) return;
    
    // Load from localStorage as fallback
    const loadFromLocalStorage = () => {
      // Load subscriptions
      const subscriptionsKey = `userSubscriptions_${userId}`;
      const subscriptionsData = JSON.parse(localStorage.getItem(subscriptionsKey) || '[]');
      const activeSubsLocal = subscriptionsData.filter(
        (sub: Subscription) => sub.status === 'active' && sub.credentials
      );
      if (activeSubsLocal.length > 0) {
        setActiveSubscriptions(activeSubsLocal);
      }
      
      // Load orders
      const ordersKey = `customerOrders_${userId}`;
      const ordersData = JSON.parse(localStorage.getItem(ordersKey) || '[]');
      // Sort by date, newest first
      const sortedOrders = ordersData
        .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5); // Get last 5 orders
      
      if (sortedOrders.length > 0) {
        setRecentOrders(sortedOrders);
      }
    };
    
    loadFromLocalStorage();
    setIsLoading(false);
  }, [userId, activeSubscriptions.length, recentOrders.length]);
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Access Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-32 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (activeSubscriptions.length === 0 && recentOrders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Access Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="bg-amber-50 p-4 rounded-lg w-full text-amber-800 flex items-start">
              <AlertCircle className="h-5 w-5 mr-3 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">No credentials available</p>
                <p className="text-sm">
                  You don't have any active subscriptions with credentials yet. 
                  After purchasing a service, your access details will appear here.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Access Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="subscriptions">
            <TabsList className="mb-4">
              <TabsTrigger value="subscriptions">
                Active Subscriptions
              </TabsTrigger>
              <TabsTrigger value="recent-orders">
                Recent Orders
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscriptions" className="space-y-4">
              {activeSubscriptions.length > 0 ? (
                activeSubscriptions.map(subscription => (
                  <CredentialDisplay
                    key={subscription.id}
                    orderId={subscription.id}
                    serviceId={subscription.serviceId}
                    serviceName={subscription.serviceId}
                    credentials={subscription.credentials}
                    purchaseDate={subscription.startDate}
                  />
                ))
              ) : (
                <div className="bg-muted p-4 rounded-md text-center">
                  <p>You don't have any active subscriptions with credentials.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recent-orders" className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <CredentialDisplay
                    key={order.id}
                    orderId={order.id}
                    serviceId={order.products[0]?.productId || ''}
                    serviceName={order.serviceName || 'Order'}
                    credentials={order.credentials}
                    isPending={order.status === 'pending'}
                    purchaseDate={order.createdAt}
                  />
                ))
              ) : (
                <div className="bg-muted p-4 rounded-md text-center">
                  <p>You don't have any recent orders with credentials.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardCredentials;
