
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getCredentialsByOrderId } from '@/lib/credentialUtils';
import { toast } from '@/lib/toast';
import Loader from '../ui/Loader';
import NoDataMessage from '../ui/NoDataMessage';

const CustomerCredentials = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    fetchCredentials();
  }, [user]);

  const fetchCredentials = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['completed', 'pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
        return;
      }

      // Process orders to get credentials
      const ordersWithCredentials = await Promise.all(
        data.map(async (order) => {
          if (order.credentials) {
            return order;
          } else {
            // Try to fetch credentials
            const credentials = await getCredentialsByOrderId(order.id);
            if (credentials) {
              return {
                ...order,
                credentials
              };
            }
            return order;
          }
        })
      );

      setOrders(ordersWithCredentials);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string, field: string) => {
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(''), 2000);
        toast.success('Copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy');
      });
  };

  if (loading) {
    return <Loader text="Loading credentials..." />;
  }

  // Filter orders with credentials
  const credentialOrders = orders.filter(order => order?.credentials && (
    order.credentials.email || 
    order.credentials.password || 
    order.credentials.username || 
    order.credentials.notes
  ));

  if (credentialOrders.length === 0) {
    return (
      <NoDataMessage
        title="No Credentials Found"
        description="You don't have any credentials available yet."
        actionText="Browse Services"
        actionLink="/services"
      />
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Credentials</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {credentialOrders.map((order) => {
          if (!order || !order.credentials) return null;
          
          return (
            <Card key={order.id} className="overflow-hidden h-full">
              <CardHeader className="bg-slate-50 dark:bg-slate-800 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{order.service_name}</CardTitle>
                  <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                    {order.status === 'completed' ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {order.credentials.email && (
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded">
                      <span className="font-medium mr-2">Email:</span>
                      <div className="flex items-center ml-auto">
                        <span className="text-sm font-mono truncate max-w-[150px]">
                          {order.credentials.email}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="ml-1 p-0 h-8 w-8" 
                          onClick={() => handleCopyToClipboard(order.credentials.email, `email-${order.id}`)}
                        >
                          {copiedField === `email-${order.id}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {order.credentials.username && (
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded">
                      <span className="font-medium mr-2">Username:</span>
                      <div className="flex items-center ml-auto">
                        <span className="text-sm font-mono truncate max-w-[150px]">
                          {order.credentials.username}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="ml-1 p-0 h-8 w-8" 
                          onClick={() => handleCopyToClipboard(order.credentials.username, `username-${order.id}`)}
                        >
                          {copiedField === `username-${order.id}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {order.credentials.password && (
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded">
                      <span className="font-medium mr-2">Password:</span>
                      <div className="flex items-center ml-auto">
                        <span className="text-sm font-mono truncate max-w-[150px]">
                          {order.credentials.password}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="ml-1 p-0 h-8 w-8" 
                          onClick={() => handleCopyToClipboard(order.credentials.password, `password-${order.id}`)}
                        >
                          {copiedField === `password-${order.id}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {order.credentials.pinCode && (
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded">
                      <span className="font-medium mr-2">PIN:</span>
                      <div className="flex items-center ml-auto">
                        <span className="text-sm font-mono truncate max-w-[150px]">
                          {order.credentials.pinCode}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="ml-1 p-0 h-8 w-8" 
                          onClick={() => handleCopyToClipboard(order.credentials.pinCode, `pin-${order.id}`)}
                        >
                          {copiedField === `pin-${order.id}` ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {order.credentials.notes && (
                    <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      <div className="flex gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div className="text-sm">{order.credentials.notes}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerCredentials;
