
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { Key, Copy, CheckCircle, User, Mail, KeyRound, AlertCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getCredentialsByOrderId } from '@/lib/credentialUtils';
import { useAuth } from '@/hooks/useAuth';
import NoDataMessage from '../ui/NoDataMessage';
import Loader from '../ui/Loader';

const DashboardCredentials: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('services');
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      if (!user) {
        console.log('No user, loading from localStorage');
        const savedOrders = localStorage.getItem('orders');
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['completed', 'pending'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load credentials');
        setLoading(false);
        return;
      }

      // Process orders and fetch credentials if necessary
      const processedOrders = await Promise.all(
        data.map(async (order) => {
          // Check if credentials are already in the order
          if (!order.credentials) {
            // Try to fetch credentials by order ID
            const credentials = await getCredentialsByOrderId(order.id);
            
            if (credentials) {
              return {
                ...order,
                credentials
              };
            }
          }
          
          return order;
        })
      );

      setOrders(processedOrders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load credentials');
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
    return <Loader text="Loading your credentials..." />;
  }

  // Filter orders with credentials
  const ordersWithCredentials = orders.filter(order => {
    if (!order) return false;
    return order.credentials && 
      (order.credentials.email || order.credentials.username || order.credentials.password);
  });

  if (ordersWithCredentials.length === 0) {
    return (
      <NoDataMessage
        title="No Credentials Found"
        description="You don't have any credentials available yet. Complete a purchase to get service credentials."
        actionText="Browse Services"
        actionLink="/services"
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Credentials</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="services">By Service</TabsTrigger>
            <TabsTrigger value="all">All Credentials</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services">
            <div className="space-y-4">
              {ordersWithCredentials.map((order) => {
                if (!order?.credentials) return null;
                
                const credentials = order.credentials;
                
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-2 bg-slate-50 dark:bg-slate-900">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">{order.service_name}</CardTitle>
                        <Badge>{order.status}</Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4">
                      <div className="grid gap-3">
                        {credentials.username && (
                          <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-500" />
                              <span className="text-sm font-medium">Username:</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono">{credentials.username}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleCopyToClipboard(credentials.username, `username-${order.id}`)}
                                className="h-6 w-6"
                              >
                                {copiedField === `username-${order.id}` ? 
                                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                  <Copy className="h-4 w-4" />
                                }
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {credentials.email && (
                          <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-slate-500" />
                              <span className="text-sm font-medium">Email:</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono">{credentials.email}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleCopyToClipboard(credentials.email, `email-${order.id}`)}
                                className="h-6 w-6"
                              >
                                {copiedField === `email-${order.id}` ? 
                                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                  <Copy className="h-4 w-4" />
                                }
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {credentials.password && (
                          <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded">
                            <div className="flex items-center gap-2">
                              <KeyRound className="h-4 w-4 text-slate-500" />
                              <span className="text-sm font-medium">Password:</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono">{credentials.password}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleCopyToClipboard(credentials.password, `password-${order.id}`)}
                                className="h-6 w-6"
                              >
                                {copiedField === `password-${order.id}` ? 
                                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                  <Copy className="h-4 w-4" />
                                }
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {credentials.pinCode && (
                          <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded">
                            <div className="flex items-center gap-2">
                              <Key className="h-4 w-4 text-slate-500" />
                              <span className="text-sm font-medium">PIN Code:</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono">{credentials.pinCode}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleCopyToClipboard(credentials.pinCode, `pin-${order.id}`)}
                                className="h-6 w-6"
                              >
                                {copiedField === `pin-${order.id}` ? 
                                  <CheckCircle className="h-4 w-4 text-green-500" /> : 
                                  <Copy className="h-4 w-4" />
                                }
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {credentials.notes && (
                          <div className="p-2 mt-2 bg-blue-50 dark:bg-blue-950 rounded text-sm">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                              <span>{credentials.notes}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="all">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="px-4 py-2 text-left">Service</th>
                    <th className="px-4 py-2 text-left">Username</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Password</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersWithCredentials.map((order) => {
                    if (!order?.credentials) return null;
                    
                    const credentials = order.credentials;
                    
                    return (
                      <tr key={order.id} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="px-4 py-3">{order.service_name}</td>
                        <td className="px-4 py-3">
                          {credentials.username ? (
                            <div className="flex items-center">
                              <span className="font-mono">{credentials.username}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleCopyToClipboard(credentials.username, `username-table-${order.id}`)}
                                className="ml-2 h-7 w-7"
                              >
                                {copiedField === `username-table-${order.id}` ? 
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : 
                                  <Copy className="h-3.5 w-3.5" />
                                }
                              </Button>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {credentials.email ? (
                            <div className="flex items-center">
                              <span className="font-mono">{credentials.email}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleCopyToClipboard(credentials.email, `email-table-${order.id}`)}
                                className="ml-2 h-7 w-7"
                              >
                                {copiedField === `email-table-${order.id}` ? 
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : 
                                  <Copy className="h-3.5 w-3.5" />
                                }
                              </Button>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {credentials.password ? (
                            <div className="flex items-center">
                              <span className="font-mono">{credentials.password}</span>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleCopyToClipboard(credentials.password, `password-table-${order.id}`)}
                                className="ml-2 h-7 w-7"
                              >
                                {copiedField === `password-table-${order.id}` ? 
                                  <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : 
                                  <Copy className="h-3.5 w-3.5" />
                                }
                              </Button>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => navigate(`/order/${order.id}`)}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DashboardCredentials;
