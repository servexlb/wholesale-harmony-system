
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, RefreshCw, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast';
import NoDataMessage from '../ui/NoDataMessage';
import Loader from '../ui/Loader';

const DashboardCredentials = () => {
  const { user } = useAuth();
  const [completedOrders, setCompletedOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });
          
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
        
        setCompletedOrders(ordersWithCredentials);
      } catch (error) {
        console.error('Error fetching completed orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompletedOrders();
  }, [user]);

  const handleCopyToClipboard = (text: string, id: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedField(null);
    }, 2000);
  };

  if (loading) {
    return <Loader text="Loading credentials..." />;
  }

  if (completedOrders.length === 0) {
    return (
      <NoDataMessage
        title="No Credentials Found"
        description="You don't have any completed orders with credentials yet."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Credentials</CardTitle>
            <CardDescription>
              Access credentials for your purchased services
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Credentials</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedOrders.map((order) => {
              const hasCredentials = !!order.credentials;
              
              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="font-medium">{order.service_name}</div>
                    <div className="text-xs text-muted-foreground">Order #{order.id}</div>
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {hasCredentials ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                        Not Available
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {hasCredentials && order.credentials && (
                      <div className="flex justify-end gap-2">
                        {typeof order.credentials === 'object' && order.credentials.email && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopyToClipboard(order.credentials.email, order.id, 'Email')}
                            title="Copy email"
                          >
                            {copiedId === order.id && copiedField === 'Email' ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DashboardCredentials;
