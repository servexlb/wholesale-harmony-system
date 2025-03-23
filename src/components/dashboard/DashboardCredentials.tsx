
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Subscription, Order } from '@/lib/types';
import CredentialDisplay from '../CredentialDisplay';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardCredentials: React.FC = () => {
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get current user ID
  const userId = localStorage.getItem('currentUserId') || '';
  
  // Load subscriptions and orders with credentials from localStorage
  useEffect(() => {
    if (!userId) return;
    
    // Load subscriptions
    const subscriptionsKey = `userSubscriptions_${userId}`;
    const subscriptionsData = JSON.parse(localStorage.getItem(subscriptionsKey) || '[]');
    const activeSubscriptions = subscriptionsData.filter(
      (sub: Subscription) => sub.status === 'active' && sub.credentials
    );
    setActiveSubscriptions(activeSubscriptions);
    
    // Load orders
    const ordersKey = `customerOrders_${userId}`;
    const ordersData = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    // Sort by date, newest first
    const sortedOrders = ordersData
      .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5); // Get last 5 orders
    
    setRecentOrders(sortedOrders);
    setIsLoading(false);
  }, [userId]);
  
  // Extract service name from service ID (in a real app, this would fetch from a database)
  const getServiceName = (serviceId: string) => {
    // Simple mapping for demo purposes
    const serviceNames: {[key: string]: string} = {
      'service-netflix': 'Netflix Premium',
      'service-spotify': 'Spotify Premium',
      'service-disney': 'Disney+',
      'service-hbo': 'HBO Max',
      'service-amazon': 'Amazon Prime',
      'service-youtube': 'YouTube Premium',
    };
    
    // If service ID starts with 'service-', extract the part after it
    const serviceName = serviceId.startsWith('service-') ? 
      serviceId.substring('service-'.length) : serviceId;
    
    // Return mapped name or capitalize first letter
    return serviceNames[serviceId] || 
      serviceName.charAt(0).toUpperCase() + serviceName.slice(1).replace(/-/g, ' ');
  };
  
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
                    serviceName={getServiceName(subscription.serviceId)}
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
                    serviceId={order.serviceId || ''}
                    serviceName={order.serviceId ? getServiceName(order.serviceId) : 'Order'}
                    credentials={order.credentials}
                    isPending={!order.credentials}
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
