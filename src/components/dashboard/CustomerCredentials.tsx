
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Eye, Copy, EyeOff, Clock } from 'lucide-react';
import { toast } from 'sonner';

const CustomerCredentials = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [selectedCredential, setSelectedCredential] = useState<any>(null);

  const fetchCredentials = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch all completed orders with credentials
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .not('credentials', 'is', null)
        .order('created_at', { ascending: false });
        
      if (ordersError) {
        throw ordersError;
      }
      
      // Fetch all pending orders (no credentials yet)
      const { data: pendingData, error: pendingError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .eq('credential_status', 'pending')
        .order('created_at', { ascending: false });
        
      if (pendingError) {
        throw pendingError;
      }
      
      // Fetch all subscriptions with credentials
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .not('credentials', 'is', null)
        .order('created_at', { ascending: false });
        
      if (subscriptionsError) {
        throw subscriptionsError;
      }
      
      // Combine orders and subscriptions
      const allCredentials = [
        ...(ordersData || []),
        ...(subscriptionsData || [])
      ];
      
      setCredentials(allCredentials);
      setPendingOrders(pendingData || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast.error('Failed to load credentials');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCredentials();
    }
  }, [user]);

  const handleCopyCredential = (credential: any) => {
    if (!credential.credentials) return;
    
    const { email, password, username, notes } = credential.credentials;
    
    const text = `
Service: ${credential.service_name || credential.serviceName || 'Subscription'}
${email ? `Email: ${email}` : ''}
${username ? `Username: ${username}` : ''}
${password ? `Password: ${password}` : ''}
${notes ? `Notes: ${notes}` : ''}
    `.trim();
    
    navigator.clipboard.writeText(text);
    toast.success('Credentials copied to clipboard');
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const viewCredentialDetails = (credential: any) => {
    setSelectedCredential(credential);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Credentials</CardTitle>
          <CardDescription>
            Access credentials for your subscriptions and services
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : credentials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {credentials.map((credential) => (
                <Card key={credential.id} className="overflow-hidden border-l-4 border-l-primary">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">
                      {credential.service_name || credential.serviceName || 'Subscription'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(credential.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0">
                    {credential.credentials && (
                      <div className="space-y-1 text-sm">
                        {credential.credentials.email && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Email:</span>
                            <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                              {credential.credentials.email}
                            </span>
                          </div>
                        )}
                        
                        {credential.credentials.username && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Username:</span>
                            <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                              {credential.credentials.username}
                            </span>
                          </div>
                        )}
                        
                        {credential.credentials.password && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Password:</span>
                            <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">
                              {showPassword[credential.id] 
                                ? credential.credentials.password 
                                : '••••••••'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter className="p-2 bg-muted/40 flex justify-end gap-2">
                    {credential.credentials && credential.credentials.password && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => togglePasswordVisibility(credential.id)}
                      >
                        {showPassword[credential.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopyCredential(credential)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewCredentialDetails(credential)}
                    >
                      View
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              You don't have any credentials yet.
            </div>
          )}
          
          {pendingOrders.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Pending Credentials</h3>
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden border-l-4 border-l-yellow-500">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{order.service_name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Ordered on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm font-medium text-yellow-600">Pending</span>
                        </div>
                      </div>
                      <p className="text-xs mt-2 text-muted-foreground">
                        Your credentials are being prepared and will be available soon.
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <Button variant="outline" onClick={fetchCredentials} className="w-full">
            Refresh Credentials
          </Button>
        </CardFooter>
      </Card>
      
      {/* Credential Detail Dialog */}
      {selectedCredential && (
        <Dialog open={!!selectedCredential} onOpenChange={(open) => !open && setSelectedCredential(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedCredential.service_name || selectedCredential.serviceName || 'Subscription'} Credentials
              </DialogTitle>
              <DialogDescription>
                Details for your subscription credentials
              </DialogDescription>
            </DialogHeader>
            
            {selectedCredential.credentials && (
              <div className="space-y-4 py-4">
                {selectedCredential.credentials.email && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Email</h4>
                    <div className="font-mono bg-muted p-2 rounded text-sm">
                      {selectedCredential.credentials.email}
                    </div>
                  </div>
                )}
                
                {selectedCredential.credentials.username && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Username</h4>
                    <div className="font-mono bg-muted p-2 rounded text-sm">
                      {selectedCredential.credentials.username}
                    </div>
                  </div>
                )}
                
                {selectedCredential.credentials.password && (
                  <div>
                    <h4 className="text-sm font-medium mb-1 flex justify-between">
                      <span>Password</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => togglePasswordVisibility(selectedCredential.id)}
                        className="h-6 px-2"
                      >
                        {showPassword[selectedCredential.id] ? (
                          <EyeOff className="h-3 w-3 mr-1" />
                        ) : (
                          <Eye className="h-3 w-3 mr-1" />
                        )}
                        {showPassword[selectedCredential.id] ? 'Hide' : 'Show'}
                      </Button>
                    </h4>
                    <div className="font-mono bg-muted p-2 rounded text-sm">
                      {showPassword[selectedCredential.id] 
                        ? selectedCredential.credentials.password 
                        : '••••••••••••••••'}
                    </div>
                  </div>
                )}
                
                {selectedCredential.credentials.pinCode && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">PIN Code</h4>
                    <div className="font-mono bg-muted p-2 rounded text-sm">
                      {selectedCredential.credentials.pinCode}
                    </div>
                  </div>
                )}
                
                {selectedCredential.credentials.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Additional Notes</h4>
                    <div className="bg-muted p-2 rounded text-sm">
                      {selectedCredential.credentials.notes}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <DialogFooter>
              <Button 
                variant="secondary"
                onClick={() => handleCopyCredential(selectedCredential)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All Details
              </Button>
              <Button onClick={() => setSelectedCredential(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CustomerCredentials;
