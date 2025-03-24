import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MainLayout from '@/components/MainLayout';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Wallet, User, History, Package } from 'lucide-react';
import DashboardCredentials from '@/components/dashboard/DashboardCredentials';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Fetch user balance from Supabase
    const fetchUserBalance = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('balance')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user balance:', error);
          // Fallback to user object
          setUserBalance(user.balance || 0);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          setUserBalance(data.balance || 0);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchUserBalance:', error);
        setUserBalance(user.balance || 0);
        setIsLoading(false);
      }
    };
    
    fetchUserBalance();
  }, [user, isAuthenticated, navigate]);
  
  const handleAddFunds = () => {
    navigate('/payment');
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-1 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <h2 className="text-lg font-medium">Your Current Balance</h2>
                    <div className="text-3xl font-bold mt-2">${userBalance.toFixed(2)}</div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button 
                      className="w-full md:w-auto"
                      onClick={handleAddFunds}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Add Funds
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <DashboardCredentials />
            
            <Tabs defaultValue="subscriptions">
              <TabsList className="mb-4">
                <TabsTrigger value="subscriptions">
                  <Package className="h-4 w-4 mr-2" />
                  My Subscriptions
                </TabsTrigger>
                <TabsTrigger value="orders">
                  <History className="h-4 w-4 mr-2" />
                  Order History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="subscriptions">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Subscriptions</CardTitle>
                    <CardDescription>
                      Manage your active and upcoming subscriptions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate('/dashboard/subscriptions')}>
                      View All Subscriptions
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Orders</CardTitle>
                    <CardDescription>
                      View and track your recent orders
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate('/dashboard/orders')}>
                      View Order History
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/services')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Browse Services
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/payment')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Balance
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/dashboard/profile')}
                >
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Our support team is here to help you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => navigate('/support')}
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
