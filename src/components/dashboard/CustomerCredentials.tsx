
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import Loader from '../ui/Loader';
import NoDataMessage from '../ui/NoDataMessage';

interface CustomerCredentialsProps {
  orderId?: string;
}

const CustomerCredentials: React.FC<CustomerCredentialsProps> = ({ orderId }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        let query = supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed');
          
        if (orderId) {
          query = query.eq('id', orderId);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Try to get credential information for each order
        const ordersWithCredentials = await Promise.all((data || []).map(async (order) => {
          // Check if there's credential in credential_stock for this order
          const { data: stockData, error: stockError } = await supabase
            .from('credential_stock')
            .select('*')
            .eq('order_id', order.id)
            .eq('status', 'assigned')
            .single();
            
          if (!stockError && stockData) {
            // Return order with credentials from stock
            return {
              ...order,
              credentials: stockData.credentials
            };
          }
          
          return order;
        }));
        
        setOrders(ordersWithCredentials);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load credential information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user, orderId]);

  const handleCopyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return <Loader text="Loading credentials..." />;
  }

  if (orders.length === 0) {
    return (
      <NoDataMessage
        title="No Credentials Found"
        description="You don't have any active subscriptions with credentials."
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        // Get credentials from the credential_stock relation
        const credentials = order.credentials;
        
        return (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.service_name}</CardTitle>
                  <CardDescription>Order ID: {order.id}</CardDescription>
                </div>
                <Badge variant="outline">{order.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {credentials ? (
                <div className="space-y-3">
                  {typeof credentials === 'string' ? (
                    <div className="text-sm text-muted-foreground">
                      Credentials available but in legacy format. Please contact support.
                    </div>
                  ) : (
                    <>
                      {credentials.email && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Email:</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyToClipboard(credentials.email, 'Email')}
                            >
                              {copiedField === 'Email' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                          <div className="text-sm font-mono bg-muted p-2 rounded">{credentials.email}</div>
                        </div>
                      )}
                      
                      {credentials.password && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Password:</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyToClipboard(credentials.password, 'Password')}
                            >
                              {copiedField === 'Password' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                          <div className="text-sm font-mono bg-muted p-2 rounded">{credentials.password}</div>
                        </div>
                      )}
                      
                      {credentials.username && (
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Username:</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyToClipboard(credentials.username, 'Username')}
                            >
                              {copiedField === 'Username' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            </Button>
                          </div>
                          <div className="text-sm font-mono bg-muted p-2 rounded">{credentials.username}</div>
                        </div>
                      )}
                      
                      {credentials.notes && (
                        <div className="space-y-1">
                          <span className="text-sm font-medium">Notes:</span>
                          <div className="text-sm bg-muted p-2 rounded">{credentials.notes}</div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No credentials available for this order.
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CustomerCredentials;
